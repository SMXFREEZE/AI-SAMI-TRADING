export interface StockData {
  time: string;
  open: number;
  high: number;
  low: number;
  close: number;
  ma20: number;
  ma200: number;
}

export interface Source {
  title: string;
  url: string;
}

export interface AnalystResult {
  id: string;
  name: string;
  role: string;
  status: 'idle' | 'loading' | 'success' | 'error';
  data?: any;
  message?: string;
  modelUrl: string;
  sources?: Source[];
}

export interface AnalysisState {
  sentiment: AnalystResult;
  news: AnalystResult;
  strategy: AnalystResult;
}

export type TickerMap = Record<string, string>;