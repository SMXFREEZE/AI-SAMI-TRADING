import { HF_API_TOKEN, MODEL_SENTIMENT_URL, MODEL_NEWS_URL, MODEL_STRATEGY_URL } from '../constants';

const headers = {
  'Authorization': `Bearer ${HF_API_TOKEN}`,
  'Content-Type': 'application/json',
};

// Generic HF fetcher
async function query(url: string, payload: any) {
  try {
    const response = await fetch(url, {
      method: 'POST',
      headers: HF_API_TOKEN ? headers : { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    
    if (!response.ok) {
        // Handle common HF loading error (503)
        if (response.status === 503) {
            throw new Error("Model is loading... please try again in 10 seconds.");
        }
        const err = await response.text();
        throw new Error(`API Error: ${response.status} - ${err}`);
    }
    return await response.json();
  } catch (error) {
    console.error("HF Query Error:", error);
    throw error;
  }
}

export const fetchSentiment = async (ticker: string) => {
  // FinBERT input
  // Using a slightly more complex sentence to trigger meaningful sentiment analysis
  const text = `Market sentiment for ${ticker} is mixed as traders evaluate recent earnings reports against broader sector volatility.`; 
  return query(MODEL_SENTIMENT_URL, { inputs: text });
};

export const fetchNewsAnalysis = async (ticker: string) => {
  // Financial News Sentiment input
  const text = `Breaking reports for ${ticker} indicate significant price movement following the latest quarterly guidance update.`;
  return query(MODEL_NEWS_URL, { inputs: text });
};

export const fetchStrategy = async (ticker: string, sentiment: string) => {
  // Zephyr-7b-beta (Text Generation)
  // We need to format the prompt carefully for a chat model
  const prompt = `<|system|>
You are a ruthless Hedge Fund Manager at a top Wall Street firm. 
You are analyzing the stock ${ticker}. 
The current market sentiment is ${sentiment}.
Provide a concise, 3-sentence trading strategy.
<|user|>
What is the play for ${ticker}?
<|assistant|>`;

  return query(MODEL_STRATEGY_URL, { 
    inputs: prompt,
    parameters: {
        max_new_tokens: 150,
        temperature: 0.7,
        top_k: 50,
        return_full_text: false
    }
  });
};