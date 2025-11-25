import { StockData } from '../types';

export const generateStockData = (ticker: string, days: number = 100): StockData[] => {
  const data: StockData[] = [];
  let price = 150; // Base price
  
  // Seed random based on ticker string length to have "consistent" random data per ticker
  const seed = ticker.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0);
  let volatility = 2;

  if (['TSLA', 'NVDA', 'AMD', 'NFLX'].includes(ticker)) volatility = 5;
  if (['KO', 'WMT', 'JNJ'].includes(ticker)) volatility = 1;

  for (let i = 0; i < days; i++) {
    const change = (Math.sin(i * 0.1 + seed) * volatility) + (Math.random() - 0.5) * volatility * 2;
    const open = price;
    const close = price + change;
    const high = Math.max(open, close) + Math.random() * volatility;
    const low = Math.min(open, close) - Math.random() * volatility;
    
    // Simple mock MA calculations
    const ma20 = price + (Math.sin(i * 0.05) * 10);
    const ma200 = price + (i * 0.1) - 5;

    data.push({
      time: new Date(Date.now() - (days - i) * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      open,
      high,
      low,
      close,
      ma20,
      ma200
    });

    price = close;
  }

  return data;
};
