import React, { useState } from 'react';
import { LayoutDashboard, TrendingUp, Newspaper, BrainCircuit, Activity } from 'lucide-react';
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
                sources: result.sources, // Grounding sources shared across cards or specific if parsed? Shared is fine.
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
            <h1 className="text-4xl font-bold text-white tracking-tighter flex items-center gap-3">
                <LayoutDashboard className="text-terminal-green w-8 h-8" />
                SAMI<span className="text-terminal-green">TRADING</span>
            </h1>
            <p className="text-sm text-gray-500 mt-1 uppercase tracking-widest">AI-Powered Institutional Analysis</p>
        </div>
        <div className="text-right hidden sm:block">
            <div className="flex items-center space-x-2 text-xs text-terminal-green">
                <span className="w-2 h-2 rounded-full bg-terminal-green animate-pulse"></span>
                <span>SYSTEM ONLINE</span>
            </div>
            <p className="text-[10px] text-gray-600">v3.1.0 // GEMINI POWERED</p>
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