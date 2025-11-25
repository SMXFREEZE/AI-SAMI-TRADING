import React, { useState } from 'react';
import { Search, ArrowRight } from 'lucide-react';
import { TICKER_MAPPING } from '../constants';

interface SearchPanelProps {
  onSearch: (ticker: string) => void;
  isLoading: boolean;
}

export const SearchPanel: React.FC<SearchPanelProps> = ({ onSearch, isLoading }) => {
  const [query, setQuery] = useState('');
  const [resolvedTicker, setResolvedTicker] = useState<string | null>(null);

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setQuery(val);
    
    const cleanVal = val.trim();
    const lower = cleanVal.toLowerCase();

    if (TICKER_MAPPING[lower]) {
      setResolvedTicker(TICKER_MAPPING[lower]);
    } else if (cleanVal.length >= 2 && cleanVal.length <= 5) {
      // Allow 2-5 character strings to count as tickers (auto-uppercase them)
      setResolvedTicker(cleanVal.toUpperCase());
    } else {
      setResolvedTicker(null);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (resolvedTicker) {
      onSearch(resolvedTicker);
    }
  };

  return (
    <div className="mb-6">
      <form onSubmit={handleSubmit} className="relative group">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-terminal-green group-focus-within:text-white transition-colors" />
        </div>
        <input
          type="text"
          value={query}
          onChange={handleInput}
          disabled={isLoading}
          className="block w-full pl-12 pr-4 py-4 bg-terminal-dim border-2 border-transparent focus:border-terminal-green focus:bg-terminal-black text-white font-mono placeholder-gray-600 outline-none transition-all rounded-sm uppercase tracking-widest"
          placeholder="ENTER ASSET NAME OR TICKER..."
        />
        <div className="absolute inset-y-0 right-0 pr-4 flex items-center space-x-4">
          {resolvedTicker && (
            <span className="hidden sm:inline-block text-xs text-terminal-green font-bold bg-green-900/30 px-2 py-1 rounded">
              DETECTED: {resolvedTicker}
            </span>
          )}
          <button 
            type="submit" 
            disabled={!resolvedTicker || isLoading}
            className="p-2 bg-terminal-green text-black hover:bg-white disabled:opacity-50 disabled:cursor-not-allowed transition-colors rounded-sm"
          >
            <ArrowRight className="h-5 w-5" />
          </button>
        </div>
      </form>
    </div>
  );
};