export interface StockData {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap?: number
  pe?: number
  high52Week?: number
  low52Week?: number
  dividendYield?: number
  beta?: number
  eps?: number
  timestamp: number
  // Additional analysis data
  avgVolume?: number
  revenue?: number
  grossProfit?: number
  operatingIncome?: number
  netIncome?: number
  totalAssets?: number
  totalDebt?: number
  freeCashFlow?: number
  debtToEquity?: number
  roe?: number
  roa?: number
  returnOnEquity?: number
  returnOnAssets?: number
  currentRatio?: number
  quickRatio?: number
  grossMargin?: number
  operatingMargin?: number
  netMargin?: number
  priceToBook?: number
  priceToSales?: number
  forwardPE?: number
  pegRatio?: number
  analystRating?: 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell'
  analystTargetPrice?: number
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Very High'
  socialSentiment?: number // -1 to 1 scale
}

export interface WatchlistItem {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  addedAt?: number
}

export interface PortfolioItem {
  symbol: string
  name: string
  shares: number
  avgPrice: number
  currentPrice: number
  totalValue: number
  gainLoss: number
  gainLossPercent: number
  purchaseDate?: number
}

export interface PredictionData {
  symbol: string
  currentPrice: number
  predictions: {
    timeframe: '1d' | '1w' | '1m' | '3m' | '6m' | '1y'
    predictedPrice: number
    confidence: number
    direction: 'up' | 'down' | 'neutral'
    change: number
    changePercent: number
    probabilityDistribution: {
      price: number
      probability: number
    }[]
    riskReward: {
      risk: number
      reward: number
      ratio: number
    }
  }[]
  accuracy: number
  historicalAccuracy: {
    timeframe: string
    accuracy: number
    totalPredictions: number
    correctPredictions: number
  }[]
  lastUpdated: number
  factors: {
    technical: number
    fundamental: number
    sentiment: number
    market: number
    news: number
    volume: number
  }
  modelPerformance: {
    mse: number
    mae: number
    r2Score: number
    sharpeRatio: number
  }
  scenarioAnalysis: {
    bull: {
      probability: number
      predictedPrice: number
      factors: string[]
    }
    bear: {
      probability: number
      predictedPrice: number
      factors: string[]
    }
    neutral: {
      probability: number
      predictedPrice: number
      factors: string[]
    }
  }
  analystComparison: {
    analystAverage: number
    analystHigh: number
    analystLow: number
    analystCount: number
    aiVsAnalyst: number
  }
}

export interface NewsItem {
  id: string
  title: string
  summary: string
  url: string
  source: string
  publishedAt: number
  sentiment: 'positive' | 'negative' | 'neutral'
  relevantSymbols: string[]
  imageUrl?: string
  // Extended properties for sentiment analysis
  sentimentScore?: number
  sentimentConfidence?: number
  impactLevel?: 'high' | 'medium' | 'low'
  impactScore?: number
  priceImpact?: number
}

export interface MarketData {
  indices: {
    symbol: string
    name: string
    value: number
    change: number
    changePercent: number
  }[]
  sectors: {
    name: string
    change: number
    changePercent: number
  }[]
  movers: {
    gainers: StockData[]
    losers: StockData[]
    mostActive: StockData[]
  }
}

export interface ChartData {
  timestamp: number
  open: number
  high: number
  low: number
  close: number
  volume: number
}

export interface TechnicalIndicators {
  rsi: number
  macd: {
    macd: number
    signal: number
    histogram: number
  }
  sma20: number
  sma50: number
  sma200: number
  bollinger: {
    upper: number
    middle: number
    lower: number
  }
  support: number[]
  resistance: number[]
}

export interface APIResponse<T> {
  success: boolean
  data?: T
  error?: string
  timestamp: number
}

export interface SearchResult {
  symbol: string
  name: string
  type: 'stock' | 'etf' | 'crypto'
  exchange: string
  currency: string
  region?: string
  timezone?: string
}

// Enhanced API response types
export interface ApiResponse<T> {
  data: T
  success: boolean
  error?: string
  timestamp: number
  source: string
  rateLimit?: {
    remaining: number
    reset: number
  }
}

export interface MarketHours {
  isOpen: boolean
  nextOpen: string
  nextClose: string
  timezone: string
  session: 'regular' | 'pre-market' | 'after-hours' | 'closed'
}

export interface ExchangeInfo {
  code: string
  name: string
  country: string
  timezone: string
  currency: string
  marketHours: {
    open: string
    close: string
  }
  tradingDays: number[]
}

export interface CurrencyRate {
  from: string
  to: string
  rate: number
  timestamp: number
}

export interface RealTimeQuote {
  symbol: string
  price: number
  change: number
  changePercent: number
  volume: number
  timestamp: number
  bid?: number
  ask?: number
  bidSize?: number
  askSize?: number
  lastTradeTime?: number
}

export interface AlertConfig {
  id: string
  symbol: string
  type: 'price' | 'change' | 'volume'
  condition: 'above' | 'below' | 'equals'
  value: number
  isActive: boolean
  createdAt: number
}

export interface UserPreferences {
  theme: 'dark' | 'light'
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY'
  notifications: boolean
  autoRefresh: boolean
  refreshInterval: number
  defaultTimeframe: '1d' | '1w' | '1m' | '3m' | '6m' | '1y'
}
