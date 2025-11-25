import React, { useState } from 'react';
import { TrendingUp, Newspaper, BrainCircuit, Activity } from 'lucide-react';
import { AnalysisState, StockData } from './types';
import { generateStockData } from './utils/dataGenerator';
import { analyzeStockWithGemini } from './services/geminiService';
import { SearchPanel } from './components/SearchPanel';
import { StockChart } from './components/StockChart';
import { AnalystCard } from './components/AnalystCard';
import { ChatWidget } from './components/ChatWidget';
import { MODEL_SENTIMENT_URL, MODEL_NEWS_URL, MODEL_STRATEGY_URL } from './constants';

function App() {
  const [activeTicker, setActiveTicker] = useState<string>('AAPL');
  const [stockData, setStockData] = useState<StockData[]>(generateStockData('AAPL'));
  const [isProcessing, setIsProcessing] = useState(false);
  
  const [analysis, setAnalysis] = useState<AnalysisState>({
    sentiment: { id: '1', name: 'Bohmian', role: 'Sentiment Analyst', status: 'idle', modelUrl: MODEL_SENTIMENT_URL },
    news: { id: '2', name: 'Dami', role: 'News Analyst', status: 'idle', modelUrl: MODEL_NEWS_URL },
    strategy: { id: '3', name: 'Sami', role: 'Hedge Fund Manager', status: 'idle', modelUrl: MODEL_STRATEGY_URL },
  });

  const runAnalysis = async (ticker: string) => {
    setActiveTicker(ticker);
    setIsProcessing(true);
    setStockData(generateStockData(ticker));

    // Reset States
    setAnalysis(prev => ({
        sentiment: { ...prev.sentiment, status: 'loading', data: null, message: undefined, sources: [] },
        news: { ...prev.news, status: 'loading', data: null, message: undefined, sources: [] },
        strategy: { ...prev.strategy, status: 'loading', data: null, message: undefined, sources: [] },
    }));

    try {
        // Use Gemini 2.5 Flash with Grounding for consolidated analysis
        const result = await analyzeStockWithGemini(ticker);

        // Distribute the results to the specialized cards
        setAnalysis({
            sentiment: {
                ...analysis.sentiment,
                status: 'success',
                data: { type: 'sentiment', ...result.sentiment },
                sources: result.sources,
            },
            news: {
                ...analysis.news,
                status: 'success',
                data: { type: 'news', ...result.news },
                sources: result.sources,
            },
            strategy: {
                ...analysis.strategy,
                status: 'success',
                data: { type: 'strategy', ...result.strategy },
                sources: result.sources,
            }
        });

    } catch (error: any) {
        console.error("Global Error", error);
        const errMsg = error.message || "Analysis Failed";
        setAnalysis(prev => ({
            sentiment: { ...prev.sentiment, status: 'error', message: errMsg },
            news: { ...prev.news, status: 'error', message: errMsg },
            strategy: { ...prev.strategy, status: 'error', message: errMsg },
        }));
    } finally {
        setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-black text-gray-200 font-mono p-4 md:p-8 selection:bg-terminal-green selection:text-black">
      <header className="mb-8 border-b border-terminal-dim pb-4 flex justify-between items-end">
        <div>
            <div className="flex items-center gap-6">
                {/* Custom Old Money ST Crest Logo */}
                <svg className="w-24 h-24 text-terminal-green shrink-0" viewBox="0 0 200 200" fill="none" stroke="currentColor" strokeWidth="1">
                    {/* The Crown */}
                    <path d="M70 60 L70 50 L100 40 L130 50 L130 60 Q100 70 70 60 Z" fill="none" strokeWidth="2" />
                    <circle cx="70" cy="50" r="3" fill="currentColor" stroke="none" />
                    <circle cx="100" cy="40" r="4" fill="currentColor" stroke="none" />
                    <circle cx="130" cy="50" r="3" fill="currentColor" stroke="none" />

                    {/* The Laurel Wreath (Abstracted for modernity + heritage) */}
                    <path d="M100 170 Q40 170 40 100 Q40 50 80 40" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
                    <path d="M100 170 Q160 170 160 100 Q160 50 120 40" strokeWidth="1.5" strokeLinecap="round" opacity="0.8"/>
                    
                    {/* Decorative Leaf Accents */}
                    <path d="M40 100 L30 95 M40 120 L30 115 M160 100 L170 95 M160 120 L170 115" strokeWidth="1" opacity="0.5"/>

                    {/* The Monogram */}
                    <text x="100" y="130" textAnchor="middle" fontFamily="'Cinzel', serif" fontSize="80" fontWeight="700" fill="currentColor" stroke="none" letterSpacing="-4">ST</text>
                    
                    {/* Underline & Est */}
                    <line x1="75" y1="140" x2="125" y2="140" strokeWidth="1" opacity="0.5" />
                    <text x="100" y="155" textAnchor="middle" fontFamily="'Cinzel', serif" fontSize="10" letterSpacing="4" fill="currentColor" stroke="none">MMXXIV</text>
                </svg>
                
                <div className="flex flex-col justify-center h-20">
                    <h1 className="text-5xl font-bold text-white tracking-tighter font-serif">
                        SAMI<span className="text-terminal-green font-mono">TRADING</span>
                    </h1>
                    <p className="text-xs text-gray-500 mt-1 uppercase tracking-[0.3em] font-serif border-l-2 border-terminal-dim pl-2 ml-1">
                        Royal Investment Standard
                    </p>
                </div>
            </div>
        </div>
        <div className="text-right hidden sm:block">
            <div className="flex items-center space-x-2 text-xs text-terminal-green justify-end">
                <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse"></span>
                <span>SYSTEM ONLINE</span>
            </div>
            <p className="text-[10px] text-gray-600 mt-1">v3.1.0 // GEMINI POWERED</p>
        </div>
      </header>

      <div className="max-w-7xl mx-auto">
        <SearchPanel onSearch={runAnalysis} isLoading={isProcessing} />

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Main Chart Area */}
          <div className="lg:col-span-2 space-y-6">
            <StockChart data={stockData} ticker={activeTicker} />
            
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: 'OPEN', value: stockData[stockData.length-1].open.toFixed(2) },
                    { label: 'HIGH', value: stockData[stockData.length-1].high.toFixed(2) },
                    { label: 'LOW', value: stockData[stockData.length-1].low.toFixed(2) },
                    { label: 'VOL', value: '24.5M' },
                ].map((stat, idx) => (
                    <div key={idx} className="bg-terminal-dim/20 p-3 border-l-2 border-terminal-green">
                        <span className="text-[10px] text-gray-500 block mb-1">{stat.label}</span>
                        <span className="text-xl text-white font-bold">${stat.value}</span>
                    </div>
                ))}
            </div>
          </div>

          {/* AI Council Panel */}
          <div className="space-y-4">
            <div className="flex items-center space-x-2 mb-2">
                <Activity className="w-5 h-5 text-terminal-green" />
                <h2 className="text-xl font-bold text-white">AI COUNCIL (LIVE)</h2>
            </div>
            
            <div className="grid grid-cols-1 gap-4 h-full">
                <AnalystCard 
                    result={analysis.sentiment} 
                    title="SENTIMENT" 
                    subtitle="Gemini 2.5 Flash"
                    icon={<TrendingUp className="w-5 h-5" />}
                />
                <AnalystCard 
                    result={analysis.news} 
                    title="NEWS ANALYST" 
                    subtitle="Google Search Grounding"
                    icon={<Newspaper className="w-5 h-5" />}
                />
                <AnalystCard 
                    result={analysis.strategy} 
                    title="HEDGE FUND" 
                    subtitle="Alpha Generation"
                    icon={<BrainCircuit className="w-5 h-5" />}
                />
            </div>
          </div>

        </div>
      </div>
      <ChatWidget />
    </div>
  );
}

export default App;