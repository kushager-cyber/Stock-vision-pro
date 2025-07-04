import axios from 'axios'
import { StockData, NewsItem, ChartData, SearchResult } from '@/types/stock'
import { nseApiService } from './nseApiService'

// Indian Stock API Service for NSE/BSE data
class IndianStockApiService {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private cacheTimeout = 30000 // 30 seconds cache

  // NSE API endpoints (these are example endpoints - replace with actual working APIs)
  private NSE_BASE_URL = 'https://www.nseindia.com/api'
  private BSE_BASE_URL = 'https://api.bseindia.com'
  
  // Alternative free APIs for Indian stocks
  private YAHOO_FINANCE_BASE = 'https://query1.finance.yahoo.com/v8/finance/chart'
  private ALPHA_VANTAGE_BASE = 'https://www.alphavantage.co/query'

  private getCachedData(key: string) {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.cacheTimeout) {
      return cached.data
    }
    return null
  }

  private setCachedData(key: string, data: any) {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  // Convert Indian stock symbol to Yahoo Finance format
  private formatSymbolForYahoo(symbol: string): string {
    // NSE stocks: Add .NS suffix
    // BSE stocks: Add .BO suffix
    if (symbol.includes('.')) return symbol
    
    // Common NSE stocks
    const nseStocks = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'HINDUNILVR', 'ICICIBANK', 'KOTAKBANK', 'BHARTIARTL', 'ITC', 'SBIN', 'ASIANPAINT', 'MARUTI', 'AXISBANK', 'LT', 'TITAN']
    
    if (nseStocks.includes(symbol.toUpperCase())) {
      return `${symbol}.NS`
    }
    
    // Default to NSE
    return `${symbol}.NS`
  }

  async getStockData(symbol: string): Promise<StockData> {
    const cacheKey = `indian_stock_${symbol}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      // Try NSE API service first for Indian stocks
      console.log(`🔄 Trying NSE API for ${symbol}...`)
      const nseData = await nseApiService.getStockData(symbol)
      if (nseData) {
        this.setCachedData(cacheKey, nseData)
        console.log(`✅ NSE API data fetched successfully for ${symbol}`)
        return nseData
      }
    } catch (error) {
      console.warn(`❌ NSE API failed for ${symbol}, trying Yahoo Finance...`, error)
    }

    try {
      // Fallback to Yahoo Finance for Indian stocks
      const yahooSymbol = this.formatSymbolForYahoo(symbol)
      const response = await axios.get(`${this.YAHOO_FINANCE_BASE}/${yahooSymbol}`, {
        timeout: 8000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      const result = response.data.chart?.result?.[0]
      if (result) {
        const meta = result.meta
        const quote = result.indicators?.quote?.[0]
        const currentPrice = meta.regularMarketPrice || meta.previousClose
        const previousClose = meta.previousClose
        const change = currentPrice - previousClose
        const changePercent = (change / previousClose) * 100

        const stockData: StockData = {
          symbol: symbol,
          name: meta.longName || symbol,
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          volume: meta.regularMarketVolume || 0,
          marketCap: meta.marketCap || 0,
          pe: meta.trailingPE || 0,
          dividendYield: meta.dividendYield || 0,
          high52Week: meta.fiftyTwoWeekHigh || currentPrice * 1.2,
          low52Week: meta.fiftyTwoWeekLow || currentPrice * 0.8,
          avgVolume: meta.averageDailyVolume10Day || 0,
          beta: meta.beta || 1,
          eps: meta.trailingEps || 0,
          analystRating: 'Hold' as const,
          analystTargetPrice: currentPrice * 1.1,
          riskLevel: 'Medium' as const,
          socialSentiment: Math.random() * 2 - 1, // Random sentiment between -1 and 1
          timestamp: Date.now()
        }

        this.setCachedData(cacheKey, stockData)
        return stockData
      }
    } catch (error) {
      console.warn('Yahoo Finance failed for Indian stock:', error)
    }

    // Fallback to mock data with Indian characteristics
    console.log(`Using mock data for Indian stock ${symbol}`)
    const mockData = this.generateMockIndianStockData(symbol)
    this.setCachedData(cacheKey, mockData)
    return mockData
  }

  async getChartData(symbol: string, timeframe: string): Promise<ChartData[]> {
    const cacheKey = `indian_chart_${symbol}_${timeframe}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const yahooSymbol = this.formatSymbolForYahoo(symbol)
      const period = this.convertTimeframeToPeriod(timeframe)
      
      const response = await axios.get(`${this.YAHOO_FINANCE_BASE}/${yahooSymbol}`, {
        params: {
          period1: Math.floor(Date.now() / 1000) - period,
          period2: Math.floor(Date.now() / 1000),
          interval: '1d'
        },
        timeout: 8000
      })

      const result = response.data.chart?.result?.[0]
      if (result && result.timestamp && result.indicators?.quote?.[0]) {
        const timestamps = result.timestamp
        const quote = result.indicators.quote[0]
        
        const chartData: ChartData[] = timestamps.map((timestamp: number, index: number) => ({
          timestamp: timestamp * 1000,
          open: quote.open?.[index] || 0,
          high: quote.high?.[index] || 0,
          low: quote.low?.[index] || 0,
          close: quote.close?.[index] || 0,
          volume: quote.volume?.[index] || 0
        })).filter((data: ChartData) => data.close > 0)

        this.setCachedData(cacheKey, chartData)
        return chartData
      }
    } catch (error) {
      console.warn('Failed to fetch Indian chart data:', error)
    }

    // Fallback to mock chart data
    const mockChartData = this.generateMockChartData(symbol, timeframe)
    this.setCachedData(cacheKey, mockChartData)
    return mockChartData
  }

  async searchStocks(query: string): Promise<SearchResult[]> {
    // Indian stock search results
    const indianStocks = [
      { symbol: 'RELIANCE', name: 'Reliance Industries Limited', exchange: 'NSE' },
      { symbol: 'TCS', name: 'Tata Consultancy Services Limited', exchange: 'NSE' },
      { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', exchange: 'NSE' },
      { symbol: 'INFY', name: 'Infosys Limited', exchange: 'NSE' },
      { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Limited', exchange: 'NSE' },
      { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', exchange: 'NSE' },
      { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank Limited', exchange: 'NSE' },
      { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', exchange: 'NSE' },
      { symbol: 'ITC', name: 'ITC Limited', exchange: 'NSE' },
      { symbol: 'SBIN', name: 'State Bank of India', exchange: 'NSE' },
      { symbol: 'ASIANPAINT', name: 'Asian Paints Limited', exchange: 'NSE' },
      { symbol: 'MARUTI', name: 'Maruti Suzuki India Limited', exchange: 'NSE' },
      { symbol: 'AXISBANK', name: 'Axis Bank Limited', exchange: 'NSE' },
      { symbol: 'LT', name: 'Larsen & Toubro Limited', exchange: 'NSE' },
      { symbol: 'TITAN', name: 'Titan Company Limited', exchange: 'NSE' }
    ]

    return indianStocks
      .filter(stock =>
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      )
      .slice(0, 10)
      .map(stock => ({
        symbol: stock.symbol,
        name: stock.name,
        exchange: stock.exchange,
        type: 'stock' as const,
        currency: 'INR'
      }))
  }

  async getNews(symbol?: string): Promise<NewsItem[]> {
    // Mock Indian market news
    const indianNews: NewsItem[] = [
      {
        id: '1',
        title: 'Sensex hits new high as IT stocks surge',
        summary: 'Indian benchmark indices reached record levels driven by strong performance in technology sector.',
        url: '#',
        source: 'Economic Times',
        publishedAt: Date.now() - 1000 * 60 * 30,
        sentiment: 'positive',
        relevantSymbols: ['SENSEX', 'NIFTY', 'TCS', 'INFY'],
        sentimentScore: 0.8
      },
      {
        id: '2',
        title: 'RBI maintains repo rate at 6.5%',
        summary: 'Reserve Bank of India keeps key interest rates unchanged in latest monetary policy review.',
        url: '#',
        source: 'Business Standard',
        publishedAt: Date.now() - 1000 * 60 * 60 * 2,
        sentiment: 'neutral',
        relevantSymbols: ['BANKNIFTY', 'HDFCBANK', 'ICICIBANK'],
        sentimentScore: 0.2
      },
      {
        id: '3',
        title: 'Foreign investors increase stake in Indian equities',
        summary: 'FII inflows continue as global investors show confidence in Indian market fundamentals.',
        url: '#',
        source: 'Mint',
        publishedAt: Date.now() - 1000 * 60 * 60 * 4,
        sentiment: 'positive',
        relevantSymbols: ['NIFTY', 'SENSEX'],
        sentimentScore: 0.6
      }
    ]

    return indianNews
  }

  private convertTimeframeToPeriod(timeframe: string): number {
    const periods: Record<string, number> = {
      '1D': 86400,
      '1W': 604800,
      '1M': 2592000,
      '3M': 7776000,
      '6M': 15552000,
      '1Y': 31536000,
      '5Y': 157680000
    }
    return periods[timeframe] || periods['1M']
  }

  private generateMockIndianStockData(symbol: string): StockData {
    const basePrice = Math.random() * 2000 + 100 // INR 100-2100
    const change = (Math.random() - 0.5) * basePrice * 0.1
    const changePercent = (change / basePrice) * 100

    return {
      symbol,
      name: `${symbol} Limited`,
      price: basePrice,
      change,
      changePercent,
      volume: Math.floor(Math.random() * 10000000),
      marketCap: Math.floor(Math.random() * 1000000000000),
      pe: Math.random() * 30 + 5,
      dividendYield: Math.random() * 5,
      high52Week: basePrice * (1 + Math.random() * 0.5),
      low52Week: basePrice * (1 - Math.random() * 0.3),
      avgVolume: Math.floor(Math.random() * 5000000),
      beta: Math.random() * 2 + 0.5,
      eps: Math.random() * 50,
      analystRating: 'Buy' as const,
      analystTargetPrice: basePrice * 1.15,
      riskLevel: 'Medium' as const,
      socialSentiment: Math.random() * 2 - 1,
      timestamp: Date.now()
    }
  }

  private generateMockChartData(symbol: string, timeframe: string): ChartData[] {
    const days = this.getDaysFromTimeframe(timeframe)
    const data: ChartData[] = []
    let currentPrice = Math.random() * 2000 + 100

    for (let i = days; i >= 0; i--) {
      const timestamp = Date.now() - (i * 24 * 60 * 60 * 1000)
      const volatility = 0.02
      const change = (Math.random() - 0.5) * volatility
      
      const open = currentPrice
      const close = currentPrice * (1 + change)
      const high = Math.max(open, close) * (1 + Math.random() * 0.02)
      const low = Math.min(open, close) * (1 - Math.random() * 0.02)
      const volume = Math.floor(Math.random() * 1000000)

      data.push({
        timestamp,
        open,
        high,
        low,
        close,
        volume
      })

      currentPrice = close
    }

    return data
  }

  private getDaysFromTimeframe(timeframe: string): number {
    const days: Record<string, number> = {
      '1D': 1,
      '1W': 7,
      '1M': 30,
      '3M': 90,
      '6M': 180,
      '1Y': 365,
      '5Y': 1825
    }
    return days[timeframe] || 30
  }
}

export const indianStockApi = new IndianStockApiService()
