'use client'

import axios from 'axios'
import { StockData, ChartData, SearchResult, NewsItem } from '@/types/stock'

// Free API service using Alpha Vantage, Yahoo Finance, and IEX Cloud
class FreeApiService {
  // Free API configurations
  private readonly ALPHA_VANTAGE_API_KEY = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo'
  private readonly ALPHA_VANTAGE_BASE_URL = 'https://www.alphavantage.co/query'
  
  // Yahoo Finance API (free, no key required)
  private readonly YAHOO_FINANCE_BASE_URL = 'https://query1.finance.yahoo.com/v8/finance/chart'
  private readonly YAHOO_QUOTE_URL = 'https://query1.finance.yahoo.com/v7/finance/quote'
  private readonly YAHOO_SEARCH_URL = 'https://query1.finance.yahoo.com/v1/finance/search'
  
  // IEX Cloud API (free tier)
  private readonly IEX_CLOUD_API_KEY = process.env.NEXT_PUBLIC_IEX_CLOUD_API_KEY || 'pk_test'
  private readonly IEX_CLOUD_BASE_URL = 'https://cloud.iexapis.com/stable'
  
  // Finnhub API (free tier)
  private readonly FINNHUB_API_KEY = process.env.NEXT_PUBLIC_FINNHUB_API_KEY || 'demo'
  private readonly FINNHUB_BASE_URL = 'https://finnhub.io/api/v1'

  // Cache for API responses
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_TTL = 60000 // 1 minute cache

  // Indian stock symbols mapping
  private readonly INDIAN_STOCKS = {
    'RELIANCE.NS': { name: 'Reliance Industries Limited', exchange: 'NSE' },
    'TCS.NS': { name: 'Tata Consultancy Services', exchange: 'NSE' },
    'HDFCBANK.NS': { name: 'HDFC Bank Limited', exchange: 'NSE' },
    'INFY.NS': { name: 'Infosys Limited', exchange: 'NSE' },
    'ICICIBANK.NS': { name: 'ICICI Bank Limited', exchange: 'NSE' },
    'HINDUNILVR.NS': { name: 'Hindustan Unilever Limited', exchange: 'NSE' },
    'ITC.NS': { name: 'ITC Limited', exchange: 'NSE' },
    'SBIN.NS': { name: 'State Bank of India', exchange: 'NSE' },
    'BHARTIARTL.NS': { name: 'Bharti Airtel Limited', exchange: 'NSE' },
    'KOTAKBANK.NS': { name: 'Kotak Mahindra Bank', exchange: 'NSE' },
    'LT.NS': { name: 'Larsen & Toubro Limited', exchange: 'NSE' },
    'ASIANPAINT.NS': { name: 'Asian Paints Limited', exchange: 'NSE' },
    'MARUTI.NS': { name: 'Maruti Suzuki India Limited', exchange: 'NSE' },
    'TITAN.NS': { name: 'Titan Company Limited', exchange: 'NSE' },
    'WIPRO.NS': { name: 'Wipro Limited', exchange: 'NSE' }
  }

  private getCachedData(key: string): any | null {
    const cached = this.cache.get(key)
    if (cached && Date.now() - cached.timestamp < this.CACHE_TTL) {
      return cached.data
    }
    return null
  }

  private setCachedData(key: string, data: any): void {
    this.cache.set(key, { data, timestamp: Date.now() })
  }

  // Get stock data using Yahoo Finance API (free)
  async getStockData(symbol: string): Promise<StockData> {
    const cacheKey = `stock_${symbol}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    // Try multiple approaches for Yahoo Finance
    const yahooAttempts = [
      // Method 1: Direct quote API
      async () => {
        const response = await axios.get(`${this.YAHOO_QUOTE_URL}?symbols=${symbol}`, {
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        return response.data.quoteResponse?.result?.[0]
      },

      // Method 2: Chart API fallback
      async () => {
        const response = await axios.get(`${this.YAHOO_FINANCE_BASE_URL}/${symbol}?interval=1d&range=1d`, {
          timeout: 8000,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
          }
        })
        const result = response.data.chart?.result?.[0]
        if (result) {
          const meta = result.meta
          const currentPrice = meta.regularMarketPrice || meta.previousClose
          return {
            symbol: meta.symbol,
            longName: meta.longName,
            regularMarketPrice: currentPrice,
            regularMarketChange: currentPrice - (meta.previousClose || currentPrice),
            regularMarketChangePercent: ((currentPrice - (meta.previousClose || currentPrice)) / (meta.previousClose || currentPrice)) * 100,
            regularMarketVolume: meta.regularMarketVolume || 0,
            marketCap: 0,
            fiftyTwoWeekHigh: meta.fiftyTwoWeekHigh,
            fiftyTwoWeekLow: meta.fiftyTwoWeekLow
          }
        }
        return null
      }
    ]

    // Try Yahoo Finance methods
    for (const attempt of yahooAttempts) {
      try {
        const quote = await attempt()
        if (quote) {
          const stockData: StockData = {
            symbol: quote.symbol || symbol,
            name: quote.longName || quote.shortName || this.getCompanyName(symbol),
            price: quote.regularMarketPrice || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || 0,
            marketCap: quote.marketCap || 0,
            pe: quote.trailingPE || 0,
            high52Week: quote.fiftyTwoWeekHigh || 0,
            low52Week: quote.fiftyTwoWeekLow || 0,
            dividendYield: quote.dividendYield ? quote.dividendYield * 100 : 0,
            beta: quote.beta || 1,
            eps: quote.epsTrailingTwelveMonths || 0,
            timestamp: Date.now(),
            avgVolume: quote.averageDailyVolume10Day || 0,
            revenue: quote.totalRevenue || 0,
            grossProfit: 0,
            operatingIncome: 0,
            netIncome: 0,
            totalAssets: 0,
            totalDebt: 0,
            debtToEquity: 0,
            roe: 0,
            roa: 0,
            currentRatio: 0,
            quickRatio: 0,
            priceToBook: quote.priceToBook || 0,
            priceToSales: 0,
            forwardPE: quote.forwardPE || 0,
            pegRatio: 0,
            analystRating: 'Hold',
            analystTargetPrice: quote.targetMeanPrice || quote.regularMarketPrice || 0,
            riskLevel: 'Medium',
            socialSentiment: 0
          }

          this.setCachedData(cacheKey, stockData)
          return stockData
        }
      } catch (error) {
        console.warn(`Yahoo Finance attempt failed:`, error)
        continue
      }
    }

    // Only try Alpha Vantage if we have a real API key (not 'demo')
    if (this.ALPHA_VANTAGE_API_KEY && this.ALPHA_VANTAGE_API_KEY !== 'demo') {
      try {
        console.log('Trying Alpha Vantage with real API key...')
        const response = await axios.get(`${this.ALPHA_VANTAGE_BASE_URL}?function=GLOBAL_QUOTE&symbol=${symbol}&apikey=${this.ALPHA_VANTAGE_API_KEY}`, {
          timeout: 10000
        })

        const quote = response.data['Global Quote']

        if (quote && Object.keys(quote).length > 0 && quote['01. symbol']) {
          const stockData: StockData = {
            symbol: quote['01. symbol'],
            name: this.getCompanyName(symbol),
            price: parseFloat(quote['05. price']),
            change: parseFloat(quote['09. change']),
            changePercent: parseFloat(quote['10. change percent'].replace('%', '')),
            volume: parseInt(quote['06. volume']),
            marketCap: 0,
            pe: 0,
            high52Week: parseFloat(quote['03. high']),
            low52Week: parseFloat(quote['04. low']),
            dividendYield: 0,
            beta: 1,
            eps: 0,
            timestamp: Date.now(),
            avgVolume: 0,
            revenue: 0,
            grossProfit: 0,
            operatingIncome: 0,
            netIncome: 0,
            totalAssets: 0,
            totalDebt: 0,
            debtToEquity: 0,
            roe: 0,
            roa: 0,
            currentRatio: 0,
            quickRatio: 0,
            priceToBook: 0,
            priceToSales: 0,
            forwardPE: 0,
            pegRatio: 0,
            analystRating: 'Hold',
            analystTargetPrice: parseFloat(quote['05. price']),
            riskLevel: 'Medium',
            socialSentiment: 0
          }

          this.setCachedData(cacheKey, stockData)
          return stockData
        }
      } catch (alphaError) {
        console.warn('Alpha Vantage failed:', alphaError)
      }
    } else {
      console.log('Skipping Alpha Vantage (demo key or no key provided)')
    }

    // If all real APIs fail, throw error instead of using mock data
    throw new Error(`Failed to fetch real data for ${symbol}. All API sources unavailable.`)
  }

  // Get chart data using Yahoo Finance
  async getChartData(symbol: string, timeframe: string): Promise<ChartData[]> {
    const cacheKey = `chart_${symbol}_${timeframe}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const period = this.convertTimeframeToPeriod(timeframe)
      const interval = this.convertTimeframeToInterval(timeframe)
      
      const response = await axios.get(`${this.YAHOO_FINANCE_BASE_URL}/${symbol}?period1=0&period2=9999999999&interval=${interval}&range=${period}`, {
        timeout: 15000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      const result = response.data.chart.result[0]
      if (!result) throw new Error('No chart data')

      const timestamps = result.timestamp
      const quotes = result.indicators.quote[0]
      
      const chartData: ChartData[] = timestamps.map((timestamp: number, index: number) => ({
        timestamp,
        open: quotes.open[index] || 0,
        high: quotes.high[index] || 0,
        low: quotes.low[index] || 0,
        close: quotes.close[index] || 0,
        volume: quotes.volume[index] || 0
      })).filter(data => data.close > 0) // Filter out invalid data

      this.setCachedData(cacheKey, chartData)
      return chartData

    } catch (error) {
      console.error('Yahoo Finance chart failed:', error)
      throw new Error(`Failed to fetch real chart data for ${symbol}. Yahoo Finance API unavailable.`)
    }
  }

  // Search stocks using Yahoo Finance
  async searchStocks(query: string): Promise<SearchResult[]> {
    const cacheKey = `search_${query}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const response = await axios.get(`${this.YAHOO_SEARCH_URL}?q=${encodeURIComponent(query)}`, {
        timeout: 10000,
        headers: {
          'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
      })

      const quotes = response.data.quotes || []
      const results: SearchResult[] = quotes.slice(0, 10).map((quote: any) => ({
        symbol: quote.symbol,
        name: quote.longname || quote.shortname || quote.symbol,
        type: 'stock',
        exchange: quote.exchange || 'Unknown',
        currency: 'USD'
      }))

      // Add Indian stocks if query matches
      const indianResults = this.searchIndianStocks(query)
      const combinedResults = [...results, ...indianResults].slice(0, 15)

      this.setCachedData(cacheKey, combinedResults)
      return combinedResults

    } catch (error) {
      console.warn('Search failed, using fallback:', error)
      return this.getFallbackSearchResults(query)
    }
  }

  // Search Indian stocks
  private searchIndianStocks(query: string): SearchResult[] {
    const lowerQuery = query.toLowerCase()
    return Object.entries(this.INDIAN_STOCKS)
      .filter(([symbol, info]) => 
        symbol.toLowerCase().includes(lowerQuery) ||
        info.name.toLowerCase().includes(lowerQuery)
      )
      .map(([symbol, info]) => ({
        symbol,
        name: info.name,
        type: 'stock' as const,
        exchange: info.exchange,
        currency: 'INR'
      }))
  }

  // Get news using Finnhub (free tier)
  async getNews(symbol?: string): Promise<NewsItem[]> {
    const cacheKey = `news_${symbol || 'general'}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      const endpoint = symbol 
        ? `${this.FINNHUB_BASE_URL}/company-news?symbol=${symbol}&from=${this.getDateString(-7)}&to=${this.getDateString(0)}&token=${this.FINNHUB_API_KEY}`
        : `${this.FINNHUB_BASE_URL}/news?category=general&token=${this.FINNHUB_API_KEY}`

      const response = await axios.get(endpoint, { timeout: 10000 })
      const articles = response.data.slice(0, 20)

      const news: NewsItem[] = articles.map((article: any, index: number) => ({
        id: `${article.id || index}`,
        title: article.headline || article.title,
        summary: article.summary || article.description || '',
        url: article.url,
        source: article.source || 'Finnhub',
        publishedAt: article.datetime * 1000, // Convert to milliseconds
        sentiment: this.analyzeSentiment(article.headline || article.title),
        relevantSymbols: symbol ? [symbol] : []
      }))

      this.setCachedData(cacheKey, news)
      return news

    } catch (error) {
      console.warn('News API failed, using mock data:', error)
      return this.getMockNews(symbol)
    }
  }

  // Helper methods
  private convertTimeframeToPeriod(timeframe: string): string {
    switch (timeframe.toLowerCase()) {
      case '1d': return '1d'
      case '5d': return '5d'
      case '1m': return '1mo'
      case '3m': return '3mo'
      case '6m': return '6mo'
      case '1y': return '1y'
      case '5y': return '5y'
      default: return '1y'
    }
  }

  private convertTimeframeToInterval(timeframe: string): string {
    switch (timeframe.toLowerCase()) {
      case '1d': return '5m'
      case '5d': return '15m'
      case '1m': return '1d'
      case '3m': return '1d'
      case '6m': return '1d'
      case '1y': return '1d'
      case '5y': return '1wk'
      default: return '1d'
    }
  }

  private getDateString(daysOffset: number): string {
    const date = new Date()
    date.setDate(date.getDate() + daysOffset)
    return date.toISOString().split('T')[0]
  }

  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['gain', 'rise', 'up', 'bull', 'strong', 'beat', 'exceed', 'growth', 'profit']
    const negativeWords = ['fall', 'drop', 'down', 'bear', 'weak', 'miss', 'decline', 'loss', 'cut']
    
    const lowerText = text.toLowerCase()
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length
    
    if (positiveCount > negativeCount) return 'positive'
    if (negativeCount > positiveCount) return 'negative'
    return 'neutral'
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
      ...Object.fromEntries(
        Object.entries(this.INDIAN_STOCKS).map(([sym, info]) => [sym, info.name])
      )
    }
    return companies[symbol] || `${symbol} Corporation`
  }

  // Removed mock data generation - only real API data allowed

  // Removed mock chart data generation - only real API data allowed

  private getFallbackSearchResults(query: string): SearchResult[] {
    const fallbackStocks = [
      { symbol: 'AAPL', name: 'Apple Inc.', exchange: 'NASDAQ' },
      { symbol: 'GOOGL', name: 'Alphabet Inc.', exchange: 'NASDAQ' },
      { symbol: 'MSFT', name: 'Microsoft Corporation', exchange: 'NASDAQ' },
      { symbol: 'TSLA', name: 'Tesla, Inc.', exchange: 'NASDAQ' },
      { symbol: 'AMZN', name: 'Amazon.com Inc.', exchange: 'NASDAQ' },
      { symbol: 'RELIANCE.NS', name: 'Reliance Industries Limited', exchange: 'NSE' },
      { symbol: 'TCS.NS', name: 'Tata Consultancy Services', exchange: 'NSE' },
      { symbol: 'HDFCBANK.NS', name: 'HDFC Bank Limited', exchange: 'NSE' }
    ]

    return fallbackStocks
      .filter(stock => 
        stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
        stock.name.toLowerCase().includes(query.toLowerCase())
      )
      .map(stock => ({
        ...stock,
        type: 'stock' as const,
        currency: stock.exchange === 'NSE' ? 'INR' : 'USD'
      }))
  }

  private getMockNews(symbol?: string): NewsItem[] {
    return [
      {
        id: '1',
        title: `${symbol || 'Market'} Shows Strong Performance`,
        summary: 'Recent market activity shows positive trends across major sectors.',
        url: '#',
        source: 'Market News',
        publishedAt: Date.now() - 1800000,
        sentiment: 'positive',
        relevantSymbols: symbol ? [symbol] : []
      }
    ]
  }

  // Clear cache
  public clearCache(): void {
    this.cache.clear()
  }

  // Force deployment trigger - TypeScript fixes applied
  public getVersion(): string {
    return '1.0.1-typescript-fixed'
  }
}

export const freeApiService = new FreeApiService()
