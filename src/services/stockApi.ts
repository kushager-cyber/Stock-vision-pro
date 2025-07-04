import axios from 'axios'
import { StockData, NewsItem, ChartData, SearchResult } from '@/types/stock'
import { realTimeDataService } from './realTimeDataService'
import { freeApiService } from './freeApiService'
import { indianStockApi } from './indianStockApi'

// Enhanced API service with real-time data integration
class StockApiService {
  private baseUrl = 'https://api.example.com' // Replace with real API
  private apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo'
  private useRealTimeService = true // Toggle for real-time service usage

  // Generate mock data for demo purposes
  private generateMockStockData(symbol: string): StockData {
    const basePrice = Math.random() * 1000 + 50
    const change = (Math.random() - 0.5) * 20
    const changePercent = (change / basePrice) * 100
    const marketCap = basePrice * Math.floor(Math.random() * 10000000000)

    return {
      symbol,
      name: this.getCompanyName(symbol),
      price: basePrice,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 100000000),
      marketCap,
      pe: Math.random() * 50 + 5,
      high52Week: basePrice * (1 + Math.random() * 0.5),
      low52Week: basePrice * (1 - Math.random() * 0.3),
      dividendYield: Math.random() * 5,
      beta: Math.random() * 2 + 0.5,
      eps: Math.random() * 10,
      timestamp: Date.now(),
      // Additional fundamental data
      avgVolume: Math.floor(Math.random() * 80000000) + 20000000,
      revenue: marketCap * (0.8 + Math.random() * 0.4), // Revenue relative to market cap
      grossProfit: marketCap * (0.3 + Math.random() * 0.2),
      operatingIncome: marketCap * (0.15 + Math.random() * 0.15),
      netIncome: marketCap * (0.08 + Math.random() * 0.12),
      totalAssets: marketCap * (1.2 + Math.random() * 0.8),
      totalDebt: marketCap * (0.2 + Math.random() * 0.3),
      debtToEquity: Math.random() * 2 + 0.5,
      roe: Math.random() * 30 + 5,
      roa: Math.random() * 20 + 2,
      currentRatio: Math.random() * 2 + 0.5,
      quickRatio: Math.random() * 1.5 + 0.3,
      priceToBook: Math.random() * 10 + 1,
      priceToSales: Math.random() * 8 + 1,
      forwardPE: Math.random() * 40 + 10,
      pegRatio: Math.random() * 3 + 0.5,
      analystRating: this.getRandomRating(),
      analystTargetPrice: basePrice * (0.9 + Math.random() * 0.3),
      riskLevel: this.getRandomRiskLevel(),
      socialSentiment: (Math.random() - 0.5) * 0.8, // -0.4 to 0.4
    }
  }

  private getCompanyName(symbol: string): string {
    const companies: Record<string, string> = {
      AAPL: 'Apple Inc.',
      GOOGL: 'Alphabet Inc.',
      MSFT: 'Microsoft Corporation',
      TSLA: 'Tesla, Inc.',
      AMZN: 'Amazon.com Inc.',
      NVDA: 'NVIDIA Corporation',
      META: 'Meta Platforms Inc.',
      NFLX: 'Netflix Inc.',
      AMD: 'Advanced Micro Devices Inc.',
      CRM: 'Salesforce Inc.',
    }
    return companies[symbol] || `${symbol} Corporation`
  }

  private getRandomRating(): 'Strong Buy' | 'Buy' | 'Hold' | 'Sell' | 'Strong Sell' {
    const ratings = ['Strong Buy', 'Buy', 'Hold', 'Sell', 'Strong Sell'] as const
    const weights = [0.2, 0.3, 0.3, 0.15, 0.05] // Bias towards positive ratings
    const random = Math.random()
    let cumulative = 0

    for (let i = 0; i < ratings.length; i++) {
      cumulative += weights[i]
      if (random <= cumulative) {
        return ratings[i]
      }
    }
    return 'Hold'
  }

  private getRandomRiskLevel(): 'Low' | 'Medium' | 'High' | 'Very High' {
    const levels = ['Low', 'Medium', 'High', 'Very High'] as const
    const weights = [0.25, 0.45, 0.25, 0.05]
    const random = Math.random()
    let cumulative = 0

    for (let i = 0; i < levels.length; i++) {
      cumulative += weights[i]
      if (random <= cumulative) {
        return levels[i]
      }
    }
    return 'Medium'
  }

  private generateMockChartData(symbol: string, timeframe: string): ChartData[] {
    const periods = this.getPeriods(timeframe)
    const interval = this.getInterval(timeframe)
    const data: ChartData[] = []
    
    let currentPrice = Math.random() * 1000 + 50
    const now = Date.now()

    for (let i = periods; i >= 0; i--) {
      const timestamp = now - (i * interval)
      const volatility = Math.random() * 0.04 - 0.02
      
      const open = currentPrice
      const high = open * (1 + Math.random() * 0.03)
      const low = open * (1 - Math.random() * 0.03)
      const close = low + Math.random() * (high - low)
      const volume = Math.floor(Math.random() * 10000000)

      data.push({
        timestamp: Math.floor(timestamp / 1000),
        open,
        high,
        low,
        close,
        volume,
      })

      currentPrice = close
    }

    return data
  }

  private getPeriods(timeframe: string): number {
    switch (timeframe) {
      case '1D': return 390 // 1 minute intervals
      case '5D': return 390 * 5
      case '1M': return 30
      case '3M': return 90
      case '6M': return 180
      case '1Y': return 365
      case '5Y': return 365 * 5
      default: return 30
    }
  }

  private getInterval(timeframe: string): number {
    switch (timeframe) {
      case '1D': return 60000 // 1 minute
      case '5D': return 60000 * 5
      case '1M': return 86400000 // 1 day
      case '3M': return 86400000
      case '6M': return 86400000
      case '1Y': return 86400000
      case '5Y': return 86400000
      default: return 86400000
    }
  }

  async getStockData(symbol: string, market?: 'world' | 'indian'): Promise<StockData> {
    try {
      // Check if user wants real data
      // Check if this is an Indian stock request
      const isIndianStock = market === 'indian' || this.isIndianSymbol(symbol)

      if (isIndianStock) {
        console.log(`Fetching Indian stock data for ${symbol}...`)
        return await indianStockApi.getStockData(symbol)
      }

      const useRealData = this.shouldUseRealData()

      if (useRealData) {
        // Try free API service first (Yahoo Finance, Alpha Vantage, etc.)
        try {
          console.log(`Fetching real data for ${symbol}...`)
          return await freeApiService.getStockData(symbol)
        } catch (freeApiError) {
          console.warn('Free API service failed, trying real-time service:', freeApiError)

          // Fallback to real-time data service
          if (this.useRealTimeService) {
            try {
              const [companyInfo, currentPrice] = await Promise.all([
                realTimeDataService.getCompanyInfo(symbol),
                realTimeDataService.getCurrentPrice(symbol)
              ])

              // Merge real data with mock data for missing fields
              const mockData = this.generateMockStockData(symbol)
              return {
                ...mockData,
                ...companyInfo,
                price: currentPrice,
                timestamp: Date.now()
              }
            } catch (realTimeError) {
              console.warn('Real-time service also failed:', realTimeError)
            }
          }
        }
      }

      // Fallback to mock data
      console.log(`Using mock data for ${symbol}`)
      return this.generateMockStockData(symbol)
    } catch (error) {
      console.error('Error fetching stock data:', error)
      return this.generateMockStockData(symbol)
    }
  }

  private isIndianSymbol(symbol: string): boolean {
    // Check if symbol has Indian exchange suffix
    if (symbol.includes('.NS') || symbol.includes('.BO')) {
      return true
    }

    // Check against common Indian stock symbols
    const indianSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'KOTAKBANK', 'BHARTIARTL', 'ITC', 'SBIN']
    return indianSymbols.includes(symbol.toUpperCase())
  }

  private shouldUseRealData(): boolean {
    // Always try to use real data first
    return true

    // Fallback logic (commented out to prioritize real data)
    // Check localStorage for user preference
    // if (typeof window !== 'undefined') {
    //   const config = localStorage.getItem('stockvision_api_config')
    //   if (config) {
    //     try {
    //       const parsed = JSON.parse(config)
    //       return parsed.useRealData === true
    //     } catch (e) {
    //       return true // Default to real data
    //     }
    //   }
    // }
    // return true // Default to real data
  }

  async getChartData(symbol: string, timeframe: string, market?: 'world' | 'indian'): Promise<ChartData[]> {
    try {
      // Check if this is an Indian stock request
      const isIndianStock = market === 'indian' || this.isIndianSymbol(symbol)

      if (isIndianStock) {
        console.log(`Fetching Indian chart data for ${symbol} (${timeframe})...`)
        return await indianStockApi.getChartData(symbol, timeframe)
      }

      const useRealData = this.shouldUseRealData()

      if (useRealData) {
        // Try free API service first
        try {
          console.log(`Fetching real chart data for ${symbol} (${timeframe})...`)
          return await freeApiService.getChartData(symbol, timeframe)
        } catch (freeApiError) {
          console.warn('Free API chart data failed, trying real-time service:', freeApiError)

          // Fallback to real-time service
          if (this.useRealTimeService) {
            try {
              return await realTimeDataService.getHistoricalData(symbol, timeframe)
            } catch (realTimeError) {
              console.warn('Real-time chart data also failed:', realTimeError)
            }
          }
        }
      }

      // Fallback to mock data
      console.log(`Using mock chart data for ${symbol}`)
      return this.generateMockChartData(symbol, timeframe)
    } catch (error) {
      console.error('Error fetching chart data:', error)
      return this.generateMockChartData(symbol, timeframe)
    }
  }

  async searchStocks(query: string, market?: 'world' | 'indian'): Promise<SearchResult[]> {
    try {
      // If searching for Indian stocks
      if (market === 'indian') {
        console.log(`Searching Indian stocks for "${query}"...`)
        return await indianStockApi.searchStocks(query)
      }

      const useRealData = this.shouldUseRealData()

      if (useRealData) {
        // Try free API service first
        try {
          console.log(`Searching stocks for "${query}" using real APIs...`)
          const results = await freeApiService.searchStocks(query)
          if (results.length > 0) {
            return results
          }
        } catch (freeApiError) {
          console.warn('Free API search failed, trying real-time service:', freeApiError)

          // Fallback to real-time service
          if (this.useRealTimeService) {
            try {
              const results = await realTimeDataService.searchStocks(query)
              if (results.length > 0) {
                return results
              }
            } catch (realTimeError) {
              console.warn('Real-time search also failed:', realTimeError)
            }
          }
        }
      }

      // Enhanced fallback search results including Indian stocks
      const mockResults: SearchResult[] = [
        { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', exchange: 'NASDAQ', currency: 'USD' },
        { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock', exchange: 'NASDAQ', currency: 'USD' },
        { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock', exchange: 'NASDAQ', currency: 'USD' },
        { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'stock', exchange: 'NASDAQ', currency: 'USD' },
        { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock', exchange: 'NASDAQ', currency: 'USD' },
        { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock', exchange: 'NASDAQ', currency: 'USD' },
        { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock', exchange: 'NASDAQ', currency: 'USD' },
        // Indian stocks
        { symbol: 'RELIANCE.NS', name: 'Reliance Industries Limited', type: 'stock', exchange: 'NSE', currency: 'INR' },
        { symbol: 'TCS.NS', name: 'Tata Consultancy Services', type: 'stock', exchange: 'NSE', currency: 'INR' },
        { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', type: 'stock', exchange: 'NSE', currency: 'INR' },
        { symbol: 'INFY.NS', name: 'Infosys Limited', type: 'stock', exchange: 'NSE', currency: 'INR' },
        { symbol: 'ICICIBANK.NS', name: 'ICICI Bank Limited', type: 'stock', exchange: 'NSE', currency: 'INR' },
      ]

      console.log(`Using mock search results for "${query}"`)
      return mockResults.filter(
        result =>
          result.symbol.toLowerCase().includes(query.toLowerCase()) ||
          result.name.toLowerCase().includes(query.toLowerCase())
      )
    } catch (error) {
      console.error('Error searching stocks:', error)
      return []
    }
  }

  async getNews(symbol?: string): Promise<NewsItem[]> {
    try {
      // In production, replace with real news API
      // const response = await axios.get(`${this.baseUrl}/news?symbol=${symbol}&apikey=${this.apiKey}`)
      
      // For demo, return mock news
      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: 'Apple Reports Strong Q4 Earnings',
          summary: 'Apple Inc. exceeded analyst expectations with strong iPhone sales.',
          url: '#',
          source: 'Reuters',
          publishedAt: Date.now() - 1800000,
          sentiment: 'positive',
          relevantSymbols: ['AAPL'],
        },
        {
          id: '2',
          title: 'Tech Stocks Rally on AI Optimism',
          summary: 'Major technology companies see gains amid artificial intelligence developments.',
          url: '#',
          source: 'Bloomberg',
          publishedAt: Date.now() - 3600000,
          sentiment: 'positive',
          relevantSymbols: ['GOOGL', 'MSFT', 'NVDA'],
        },
        {
          id: '3',
          title: 'Federal Reserve Signals Rate Stability',
          summary: 'The Federal Reserve indicates interest rates may remain stable.',
          url: '#',
          source: 'CNBC',
          publishedAt: Date.now() - 7200000,
          sentiment: 'neutral',
          relevantSymbols: ['SPY', 'QQQ'],
        },
      ]

      return symbol
        ? mockNews.filter(news => news.relevantSymbols.includes(symbol))
        : mockNews
    } catch (error) {
      console.error('Error fetching news:', error)
      return []
    }
  }

  async getMarketData() {
    try {
      // In production, replace with real market data API
      return {
        indices: [
          { symbol: 'SPX', name: 'S&P 500', value: 4567.89, change: 23.45, changePercent: 0.52 },
          { symbol: 'IXIC', name: 'NASDAQ', value: 14234.56, change: -45.67, changePercent: -0.32 },
          { symbol: 'DJI', name: 'Dow Jones', value: 34567.12, change: 156.78, changePercent: 0.45 },
        ],
        sectors: [
          { name: 'Technology', change: 1.25, changePercent: 1.25 },
          { name: 'Healthcare', change: 0.85, changePercent: 0.85 },
          { name: 'Finance', change: -0.45, changePercent: -0.45 },
        ],
        movers: {
          gainers: [this.generateMockStockData('NVDA'), this.generateMockStockData('AMD')],
          losers: [this.generateMockStockData('META'), this.generateMockStockData('NFLX')],
          mostActive: [this.generateMockStockData('AAPL'), this.generateMockStockData('TSLA')],
        },
      }
    } catch (error) {
      console.error('Error fetching market data:', error)
      throw error
    }
  }
}

export const stockApi = new StockApiService()
