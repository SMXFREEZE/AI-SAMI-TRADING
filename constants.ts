import { TickerMap } from './types';

// Hugging Face Model Endpoints
export const MODEL_SENTIMENT_URL = "https://api-inference.huggingface.co/models/ProsusAI/finbert";
export const MODEL_NEWS_URL = "https://api-inference.huggingface.co/models/mrm8488/distilroberta-finetuned-financial-news-sentiment-analysis";
export const MODEL_STRATEGY_URL = "https://api-inference.huggingface.co/models/HuggingFaceH4/zephyr-7b-beta";

// Access Token - In a real app, this should be in process.env
// For this demo, we assume the user has a token or we use a public inference tier (which might be rate limited)
// We will look for a token in the environment variable.
export const HF_API_TOKEN = process.env.REACT_APP_HF_TOKEN || '';

export const TICKER_MAPPING: TickerMap = {
  'apple': 'AAPL',
  'microsoft': 'MSFT',
  'tesla': 'TSLA',
  'google': 'GOOGL',
  'alphabet': 'GOOGL',
  'amazon': 'AMZN',
  'nvidia': 'NVDA',
  'meta': 'META',
  'facebook': 'META',
  'netflix': 'NFLX',
  'amd': 'AMD',
  'intel': 'INTC',
  'samsung': 'SSNLF',
  'tsmc': 'TSM',
  'oracle': 'ORCL',
  'adobe': 'ADBE',
  'salesforce': 'CRM',
  'ibm': 'IBM',
  'qualcomm': 'QCOM',
  'cisco': 'CSCO',
  'texas instruments': 'TXN',
  'sap': 'SAP',
  'intuit': 'INTU',
  'servicenow': 'NOW',
  'uber': 'UBER',
  'airbnb': 'ABNB',
  'sony': 'SONY',
  'boeing': 'BA',
  'airbus': 'EADSY',
  'lockheed martin': 'LMT',
  'general electric': 'GE',
  'ford': 'F',
  'general motors': 'GM',
  'toyota': 'TM',
  'honda': 'HMC',
  'volkswagen': 'VWAGY',
  'bmw': 'BMWYY',
  'mercedes': 'MBGYY',
  'ferrari': 'RACE',
  'cocacola': 'KO',
  'pepsi': 'PEP',
  'mcdonalds': 'MCD',
  'starbucks': 'SBUX',
  'nike': 'NKE',
  'adidas': 'ADDYY',
  'walmart': 'WMT',
  'target': 'TGT',
  'costco': 'COST',
  'home depot': 'HD',
  'disney': 'DIS',
};
