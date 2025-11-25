import React from 'react';
import { AnalystResult } from '../types';
import { AlertCircle, CheckCircle, Loader2, ExternalLink } from 'lucide-react';

interface AnalystCardProps {
  result: AnalystResult;
  title: string;
  subtitle: string;
  icon: React.ReactNode;
}

export const AnalystCard: React.FC<AnalystCardProps> = ({ result, title, subtitle, icon }) => {
  const getStatusColor = () => {
    switch (result.status) {
      case 'success': return 'border-terminal-green text-terminal-green';
      case 'error': return 'border-terminal-red text-terminal-red';
      case 'loading': return 'border-yellow-500 text-yellow-500';
      default: return 'border-terminal-dim text-gray-500';
    }
  };

  const renderSources = () => {
    if (!result.sources || result.sources.length === 0) return null;
    return (
      <div className="mt-4 pt-2 border-t border-terminal-dim/50">
        <p className="text-[10px] text-gray-500 mb-1 uppercase tracking-wider">Verified Sources:</p>
        <div className="flex flex-wrap gap-2">
          {result.sources.slice(0, 3).map((source, idx) => (
            <a 
              key={idx} 
              href={source.url} 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-[10px] bg-terminal-dim/40 hover:bg-terminal-dim px-2 py-1 rounded text-gray-400 hover:text-terminal-green transition-colors truncate max-w-[150px]"
            >
              <ExternalLink className="w-3 h-3 mr-1 flex-shrink-0" />
              <span className="truncate">{source.title}</span>
            </a>
          ))}
        </div>
      </div>
    );
  };

  const renderContent = () => {
    if (result.status === 'loading') {
      return (
        <div className="flex flex-col items-center justify-center h-24 space-y-2">
          <Loader2 className="w-6 h-6 animate-spin text-yellow-500" />
          <span className="text-xs text-yellow-500 animate-pulse">ANALYZING MARKET DATA...</span>
        </div>
      );
    }

    if (result.status === 'error') {
      return (
        <div className="flex items-start space-x-2 text-terminal-red text-xs mt-2 p-2 bg-red-900/20 rounded">
          <AlertCircle className="w-4 h-4 flex-shrink-0" />
          <p>{result.message || 'Analysis Failed'}</p>
        </div>
      );
    }

    if (result.status === 'success' && result.data) {
        // Handle Gemini Formatted Data
        
        // 1. Sentiment Type (Bohmian)
        if (result.data.type === 'sentiment') {
           const { label, score } = result.data;
           let colorClass = "text-terminal-green";
           let barClass = "bg-terminal-green";
           
           if (label.toLowerCase().includes('bearish') || label.toLowerCase().includes('negative')) {
                colorClass = "text-terminal-red";
                barClass = "bg-terminal-red";
           } else if (label.toLowerCase().includes('neutral')) {
                colorClass = "text-yellow-500";
                barClass = "bg-yellow-500";
           }

           return (
            <div className="mt-3">
                <div className="flex justify-between items-end mb-1">
                    <span className={`text-sm font-bold uppercase ${colorClass}`}>{label}</span>
                    <span className="text-xs opacity-70">{score}% CONFIDENCE</span>
                </div>
                <div className="w-full bg-terminal-dim h-1.5 rounded-full overflow-hidden">
                    <div 
                        className={`h-full ${barClass}`} 
                        style={{ width: `${score}%` }}
                    />
                </div>
                {renderSources()}
            </div>
           );
        }

        // 2. News Type (Dami)
        if (result.data.type === 'news') {
            const headlines = result.data.headlines || [];
            return (
                <div className="mt-2">
                    <ul className="space-y-2">
                        {headlines.map((line: string, i: number) => (
                            <li key={i} className="text-xs text-gray-300 flex items-start">
                                <span className="mr-2 text-terminal-green">•</span>
                                {line}
                            </li>
                        ))}
                    </ul>
                    {renderSources()}
                </div>
            );
        }

        // 3. Strategy Type (Sami)
        if (result.data.type === 'strategy') {
            const { action, rationale } = result.data;
            let actionColor = "text-gray-400";
            if (action.toUpperCase().includes('BUY')) actionColor = "text-terminal-green";
            if (action.toUpperCase().includes('SELL')) actionColor = "text-terminal-red";

            return (
                <div className="mt-2">
                     <div className={`text-lg font-bold ${actionColor} mb-2 tracking-widest`}>
                        RECOMMENDATION: {action.toUpperCase()}
                     </div>
                     <div className="p-2 bg-terminal-dim/30 rounded border border-terminal-dim text-xs leading-relaxed text-gray-300 font-sans">
                         {rationale}
                     </div>
                     {renderSources()}
                </div>
            );
        }

        // Fallback for legacy generic data
        return (
             <div className="mt-2 p-2 bg-terminal-dim/30 rounded border border-terminal-dim text-xs leading-relaxed text-gray-300 font-sans">
                 {JSON.stringify(result.data)}
             </div>
        );
    }

    return <div className="text-xs text-gray-600 mt-4 text-center italic">WAITING FOR DATA...</div>;
  };

  return (
    <div className={`border bg-terminal-black p-4 rounded-sm flex flex-col h-full transition-colors duration-300 ${getStatusColor()}`}>
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center space-x-2">
            {icon}
            <div>
                <h3 className="text-sm font-bold tracking-wider">{title}</h3>
                <p className="text-[10px] opacity-70 uppercase tracking-widest">{subtitle}</p>
            </div>
        </div>
        {result.status === 'success' && <CheckCircle className="w-4 h-4 opacity-50" />}
      </div>
      
      <div className="flex-grow">
        {renderContent()}
      </div>
    </div>
  );
};