import { GoogleGenAI, Chat } from "@google/genai";

// Initialize the client
// API Key must be provided in the environment variable API_KEY
const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

export interface GeminiAnalysisResult {
  sentiment: {
    label: string;
    score: number;
    raw: string;
  };
  news: {
    headlines: string[];
    raw: string;
  };
  strategy: {
    action: string;
    rationale: string;
  };
  sources: { title: string; url: string }[];
}

export const createChatSession = (): Chat => {
  return ai.chats.create({
    model: 'gemini-3-pro-preview',
    config: {
      systemInstruction: 'You are Sami, an advanced AI trading assistant integrated into a Bloomberg-style terminal. You are helpful, concise, and financially literate. Your responses should be short and professional.',
    },
  });
};

export const analyzeStockWithGemini = async (ticker: string): Promise<GeminiAnalysisResult> => {
  const modelId = 'gemini-2.5-flash';
  
  const prompt = `
  Analyze the stock ${ticker} using the latest market data.
  Provide a report in the following STRICT format:

  [SENTIMENT]
  Label: <Bullish/Bearish/Neutral>
  Score: <0-100>
  
  [NEWS]
  - <Headline 1>
  - <Headline 2>
  - <Headline 3>

  [STRATEGY]
  Action: <Buy/Sell/Hold>
  Rationale: <A concise 2-sentence strategy based on the news>
  `;

  try {
    const response = await ai.models.generateContent({
      model: modelId,
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
      },
    });

    const text = response.text || '';
    
    // Extract Grounding Metadata (Sources)
    const sources: { title: string; url: string }[] = [];
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks || [];
    
    chunks.forEach((chunk: any) => {
      if (chunk.web) {
        sources.push({ title: chunk.web.title, url: chunk.web.uri });
      }
    });

    // Simple parsing logic
    const sentimentMatch = text.match(/\[SENTIMENT\]([\s\S]*?)\[NEWS\]/);
    const newsMatch = text.match(/\[NEWS\]([\s\S]*?)\[STRATEGY\]/);
    const strategyMatch = text.match(/\[STRATEGY\]([\s\S]*?$)/);

    const sentimentSection = sentimentMatch ? sentimentMatch[1] : '';
    const label = sentimentSection.match(/Label:\s*(.*)/i)?.[1]?.trim() || 'NEUTRAL';
    const score = parseInt(sentimentSection.match(/Score:\s*(\d+)/i)?.[1] || '50');

    const newsSection = newsMatch ? newsMatch[1] : '';
    const headlines = newsSection
      .split('\n')
      .map(l => l.trim())
      .filter(l => l.startsWith('-'))
      .map(l => l.substring(1).trim());

    const strategySection = strategyMatch ? strategyMatch[1] : '';
    const action = strategySection.match(/Action:\s*(.*)/i)?.[1]?.trim() || 'HOLD';
    const rationale = strategySection.match(/Rationale:\s*([\s\S]*)/i)?.[1]?.trim() || strategySection;

    return {
      sentiment: { label, score, raw: sentimentSection },
      news: { headlines, raw: newsSection },
      strategy: { action, rationale },
      sources
    };

  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};
