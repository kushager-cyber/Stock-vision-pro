'use client'

import { 
  StockData, 
  ChartData, 
  SearchResult, 
  NewsItem, 
  ApiResponse, 
  MarketHours, 
  ExchangeInfo, 
  CurrencyRate,
  RealTimeQuote 
} from '@/types/stock'

// Data source configuration
interface DataSource {
  name: string
  priority: number
  rateLimit: number
  apiKey?: string
  baseUrl: string
  endpoints: {
    quote: string
    historical: string
    search: string
    news: string
    batch: string
  }
}

// Cache configuration
interface CacheConfig {
  ttl: number // Time to live in milliseconds
  maxSize: number
}

// WebSocket configuration
interface WebSocketConfig {
  url: string
  reconnectInterval: number
  maxReconnectAttempts: number
  heartbeatInterval: number
}

class RealTimeDataService {
  private dataSources: DataSource[] = []
  private cache = new Map<string, { data: any; timestamp: number; ttl: number }>()
  private websockets = new Map<string, WebSocket>()
  private subscribers = new Map<string, Set<(data: any) => void>>()
  private updateIntervals = new Map<string, NodeJS.Timeout>()
  private currencyRates = new Map<string, CurrencyRate>()
  private exchangeInfo = new Map<string, ExchangeInfo>()
  
  // Configuration
  private readonly cacheConfig: CacheConfig = {
    ttl: 5000, // 5 seconds default TTL
    maxSize: 1000
  }
  
  private readonly wsConfig: WebSocketConfig = {
    url: process.env.NEXT_PUBLIC_WEBSOCKET_URL || 'wss://ws.finnhub.io',
    reconnectInterval: 5000,
    maxReconnectAttempts: 10,
    heartbeatInterval: 30000
  }

  constructor() {
    this.initializeDataSources()
    this.initializeExchangeInfo()
    this.startCacheCleanup()
  }

  private initializeDataSources() {
    // Alpha Vantage (Primary)
    this.dataSources.push({
      name: 'alphavantage',
      priority: 1,
      rateLimit: 5, // 5 calls per minute for free tier
      apiKey: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY,
      baseUrl: 'https://www.alphavantage.co',
      endpoints: {
        quote: '/query?function=GLOBAL_QUOTE&symbol={symbol}&apikey={apikey}',
        historical: '/query?function=TIME_SERIES_DAILY&symbol={symbol}&apikey={apikey}',
        search: '/query?function=SYMBOL_SEARCH&keywords={query}&apikey={apikey}',
        news: '/query?function=NEWS_SENTIMENT&tickers={symbol}&apikey={apikey}',
        batch: '/query?function=BATCH_STOCK_QUOTES&symbols={symbols}&apikey={apikey}'
      }
    })

    // Yahoo Finance (Fallback)
    this.dataSources.push({
      name: 'yahoo',
      priority: 2,
      rateLimit: 100, // Higher rate limit
      baseUrl: 'https://query1.finance.yahoo.com',
      endpoints: {
        quote: '/v8/finance/chart/{symbol}',
        historical: '/v8/finance/chart/{symbol}?range=1y&interval=1d',
        search: '/v1/finance/search?q={query}',
        news: '/v2/finance/news?symbols={symbol}',
        batch: '/v6/finance/quote?symbols={symbols}'
      }
    })

    // Finnhub (WebSocket)
    this.dataSources.push({
      name: 'finnhub',
      priority: 3,
      rateLimit: 60,
      apiKey: process.env.NEXT_PUBLIC_FINNHUB_API_KEY,
      baseUrl: 'https://finnhub.io/api/v1',
      endpoints: {
        quote: '/quote?symbol={symbol}&token={apikey}',
        historical: '/stock/candle?symbol={symbol}&resolution=D&from={from}&to={to}&token={apikey}',
        search: '/search?q={query}&token={apikey}',
        news: '/company-news?symbol={symbol}&from={from}&to={to}&token={apikey}',
        batch: '/quote?symbol={symbols}&token={apikey}'
      }
    })

    // Indian Market Data (Mock for now - would integrate with NSE/BSE APIs)
    this.dataSources.push({
      name: 'indian_markets',
      priority: 4,
      rateLimit: 100,
      baseUrl: 'https://api.indian-markets.com', // Mock URL
      endpoints: {
        quote: '/quote?symbol={symbol}',
        historical: '/historical?symbol={symbol}&period={period}',
        search: '/search?q={query}',
        news: '/news?symbol={symbol}',
        batch: '/batch?symbols={symbols}'
      }
    })
  }

  private initializeExchangeInfo() {
    // Major exchanges configuration
    const exchanges: ExchangeInfo[] = [
      {
        code: 'NASDAQ',
        name: 'NASDAQ Stock Market',
        country: 'US',
        timezone: 'America/New_York',
        currency: 'USD',
        marketHours: { open: '09:30', close: '16:00' },
        tradingDays: [1, 2, 3, 4, 5] // Monday to Friday
      },
      {
        code: 'NYSE',
        name: 'New York Stock Exchange',
        country: 'US',
        timezone: 'America/New_York',
        currency: 'USD',
        marketHours: { open: '09:30', close: '16:00' },
        tradingDays: [1, 2, 3, 4, 5]
      },
      {
        code: 'LSE',
        name: 'London Stock Exchange',
        country: 'GB',
        timezone: 'Europe/London',
        currency: 'GBP',
        marketHours: { open: '08:00', close: '16:30' },
        tradingDays: [1, 2, 3, 4, 5]
      },
      {
        code: 'TSE',
        name: 'Tokyo Stock Exchange',
        country: 'JP',
        timezone: 'Asia/Tokyo',
        currency: 'JPY',
        marketHours: { open: '09:00', close: '15:00' },
        tradingDays: [1, 2, 3, 4, 5]
      },
      {
        code: 'NSE',
        name: 'National Stock Exchange of India',
        country: 'IN',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        marketHours: { open: '09:15', close: '15:30' },
        tradingDays: [1, 2, 3, 4, 5]
      },
      {
        code: 'BSE',
        name: 'Bombay Stock Exchange',
        country: 'IN',
        timezone: 'Asia/Kolkata',
        currency: 'INR',
        marketHours: { open: '09:15', close: '15:30' },
        tradingDays: [1, 2, 3, 4, 5]
      }
    ]

    exchanges.forEach(exchange => {
      this.exchangeInfo.set(exchange.code, exchange)
    })
  }

  // Cache management
  private setCache(key: string, data: any, ttl: number = this.cacheConfig.ttl) {
    // Clean cache if it's getting too large
    if (this.cache.size >= this.cacheConfig.maxSize) {
      this.cleanExpiredCache()
    }

    this.cache.set(key, {
      data,
      timestamp: Date.now(),
      ttl
    })
  }

  private getCache(key: string): any | null {
    const cached = this.cache.get(key)
    if (!cached) return null

    const now = Date.now()
    if (now - cached.timestamp > cached.ttl) {
      this.cache.delete(key)
      return null
    }

    return cached.data
  }

  private cleanExpiredCache() {
    const now = Date.now()
    for (const [key, value] of this.cache.entries()) {
      if (now - value.timestamp > value.ttl) {
        this.cache.delete(key)
      }
    }
  }

  private startCacheCleanup() {
    setInterval(() => {
      this.cleanExpiredCache()
    }, 60000) // Clean every minute
  }

  // Market hours detection
  public getMarketHours(exchange: string = 'NASDAQ'): MarketHours {
    const exchangeInfo = this.exchangeInfo.get(exchange)
    if (!exchangeInfo) {
      throw new Error(`Unknown exchange: ${exchange}`)
    }

    const now = new Date()
    const timezone = exchangeInfo.timezone
    
    // Convert to exchange timezone
    const exchangeTime = new Date(now.toLocaleString('en-US', { timeZone: timezone }))
    const day = exchangeTime.getDay()
    const hour = exchangeTime.getHours()
    const minute = exchangeTime.getMinutes()
    const currentTime = hour + minute / 60

    // Check if it's a trading day
    const isTradingDay = exchangeInfo.tradingDays.includes(day)
    
    if (!isTradingDay) {
      return {
        isOpen: false,
        nextOpen: this.getNextTradingDay(exchangeTime, exchangeInfo),
        nextClose: '',
        timezone,
        session: 'closed'
      }
    }

    const [openHour, openMinute] = exchangeInfo.marketHours.open.split(':').map(Number)
    const [closeHour, closeMinute] = exchangeInfo.marketHours.close.split(':').map(Number)
    const openTime = openHour + openMinute / 60
    const closeTime = closeHour + closeMinute / 60

    let session: MarketHours['session']
    let isOpen = false

    if (currentTime < openTime - 4) {
      session = 'closed'
    } else if (currentTime < openTime) {
      session = 'pre-market'
    } else if (currentTime < closeTime) {
      session = 'regular'
      isOpen = true
    } else if (currentTime < closeTime + 4) {
      session = 'after-hours'
    } else {
      session = 'closed'
    }

    return {
      isOpen,
      nextOpen: isOpen ? '' : this.getNextOpenTime(exchangeTime, exchangeInfo),
      nextClose: isOpen ? this.getNextCloseTime(exchangeTime, exchangeInfo) : '',
      timezone,
      session
    }
  }

  private getNextTradingDay(date: Date, exchange: ExchangeInfo): string {
    const nextDay = new Date(date)
    nextDay.setDate(nextDay.getDate() + 1)
    
    while (!exchange.tradingDays.includes(nextDay.getDay())) {
      nextDay.setDate(nextDay.getDate() + 1)
    }
    
    const [hour, minute] = exchange.marketHours.open.split(':').map(Number)
    nextDay.setHours(hour, minute, 0, 0)
    
    return nextDay.toISOString()
  }

  private getNextOpenTime(date: Date, exchange: ExchangeInfo): string {
    const [hour, minute] = exchange.marketHours.open.split(':').map(Number)
    const nextOpen = new Date(date)
    nextOpen.setHours(hour, minute, 0, 0)
    
    if (nextOpen <= date) {
      nextOpen.setDate(nextOpen.getDate() + 1)
    }
    
    return nextOpen.toISOString()
  }

  private getNextCloseTime(date: Date, exchange: ExchangeInfo): string {
    const [hour, minute] = exchange.marketHours.close.split(':').map(Number)
    const nextClose = new Date(date)
    nextClose.setHours(hour, minute, 0, 0)
    
    return nextClose.toISOString()
  }

  // Error handling and retry logic
  private async makeApiCall<T>(
    url: string, 
    source: DataSource, 
    retries: number = 3
  ): Promise<ApiResponse<T>> {
    for (let attempt = 1; attempt <= retries; attempt++) {
      try {
        const response = await fetch(url, {
          headers: {
            'User-Agent': 'StockVision-Pro/1.0',
            'Accept': 'application/json',
          },
          signal: AbortSignal.timeout(10000) // 10 second timeout
        })

        if (!response.ok) {
          if (response.status === 429) {
            // Rate limit hit, wait and retry
            const retryAfter = response.headers.get('Retry-After')
            const waitTime = retryAfter ? parseInt(retryAfter) * 1000 : 60000
            
            if (attempt < retries) {
              await new Promise(resolve => setTimeout(resolve, waitTime))
              continue
            }
          }
          
          throw new Error(`HTTP ${response.status}: ${response.statusText}`)
        }

        const data = await response.json()
        
        return {
          data,
          success: true,
          timestamp: Date.now(),
          source: source.name,
          rateLimit: {
            remaining: parseInt(response.headers.get('X-RateLimit-Remaining') || '0'),
            reset: parseInt(response.headers.get('X-RateLimit-Reset') || '0')
          }
        }
      } catch (error) {
        console.error(`API call failed (attempt ${attempt}/${retries}):`, error)
        
        if (attempt === retries) {
          return {
            data: null as T,
            success: false,
            error: error instanceof Error ? error.message : 'Unknown error',
            timestamp: Date.now(),
            source: source.name
          }
        }
        
        // Exponential backoff
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000))
      }
    }

    throw new Error('All retry attempts failed')
  }

  // Core API functions
  public async getCurrentPrice(symbol: string): Promise<number> {
    const cacheKey = `price_${symbol}`
    const cached = this.getCache(cacheKey)
    if (cached) return cached

    for (const source of this.dataSources.sort((a, b) => a.priority - b.priority)) {
      try {
        const url = this.buildUrl(source, 'quote', { symbol })
        const response = await this.makeApiCall<any>(url, source)

        if (response.success) {
          const price = this.extractPrice(response.data, source.name)
          this.setCache(cacheKey, price, 5000) // Cache for 5 seconds
          return price
        }
      } catch (error) {
        console.warn(`Failed to get price from ${source.name}:`, error)
        continue
      }
    }

    throw new Error(`Failed to get current price for ${symbol}`)
  }

  public async getHistoricalData(
    symbol: string,
    period: string = '1y',
    interval: string = '1d'
  ): Promise<ChartData[]> {
    const cacheKey = `historical_${symbol}_${period}_${interval}`
    const cached = this.getCache(cacheKey)
    if (cached) return cached

    for (const source of this.dataSources.sort((a, b) => a.priority - b.priority)) {
      try {
        const url = this.buildUrl(source, 'historical', {
          symbol,
          period,
          interval,
          from: this.getPeriodStart(period),
          to: Math.floor(Date.now() / 1000).toString()
        })

        const response = await this.makeApiCall<any>(url, source)

        if (response.success) {
          const data = this.extractHistoricalData(response.data, source.name)
          this.setCache(cacheKey, data, 300000) // Cache for 5 minutes
          return data
        }
      } catch (error) {
        console.warn(`Failed to get historical data from ${source.name}:`, error)
        continue
      }
    }

    throw new Error(`Failed to get historical data for ${symbol}`)
  }

  public async getCompanyInfo(symbol: string): Promise<Partial<StockData>> {
    const cacheKey = `company_${symbol}`
    const cached = this.getCache(cacheKey)
    if (cached) return cached

    for (const source of this.dataSources.sort((a, b) => a.priority - b.priority)) {
      try {
        const url = this.buildUrl(source, 'quote', { symbol })
        const response = await this.makeApiCall<any>(url, source)

        if (response.success) {
          const info = this.extractCompanyInfo(response.data, source.name)
          this.setCache(cacheKey, info, 3600000) // Cache for 1 hour
          return info
        }
      } catch (error) {
        console.warn(`Failed to get company info from ${source.name}:`, error)
        continue
      }
    }

    throw new Error(`Failed to get company info for ${symbol}`)
  }

  // Batch operations
  public async getBatchQuotes(symbols: string[]): Promise<Map<string, RealTimeQuote>> {
    const results = new Map<string, RealTimeQuote>()
    const uncachedSymbols: string[] = []

    // Check cache first
    for (const symbol of symbols) {
      const cached = this.getCache(`quote_${symbol}`)
      if (cached) {
        results.set(symbol, cached)
      } else {
        uncachedSymbols.push(symbol)
      }
    }

    if (uncachedSymbols.length === 0) {
      return results
    }

    // Batch API call for uncached symbols
    for (const source of this.dataSources.sort((a, b) => a.priority - b.priority)) {
      if (uncachedSymbols.length === 0) break

      try {
        const url = this.buildUrl(source, 'batch', {
          symbols: uncachedSymbols.join(',')
        })

        const response = await this.makeApiCall<any>(url, source)

        if (response.success) {
          const quotes = this.extractBatchQuotes(response.data, source.name)

          for (const [symbol, quote] of quotes) {
            results.set(symbol, quote)
            this.setCache(`quote_${symbol}`, quote, 5000)

            // Remove from uncached list
            const index = uncachedSymbols.indexOf(symbol)
            if (index > -1) {
              uncachedSymbols.splice(index, 1)
            }
          }
        }
      } catch (error) {
        console.warn(`Failed to get batch quotes from ${source.name}:`, error)
        continue
      }
    }

    return results
  }

  // Currency conversion
  public async convertCurrency(
    amount: number,
    from: string,
    to: string
  ): Promise<number> {
    if (from === to) return amount

    const cacheKey = `currency_${from}_${to}`
    let rate = this.getCache(cacheKey)

    if (!rate) {
      try {
        // Use a free currency API
        const response = await fetch(
          `https://api.exchangerate-api.com/v4/latest/${from}`
        )
        const data = await response.json()
        rate = data.rates[to]

        if (rate) {
          this.setCache(cacheKey, rate, 3600000) // Cache for 1 hour
          this.currencyRates.set(`${from}_${to}`, {
            from,
            to,
            rate,
            timestamp: Date.now()
          })
        }
      } catch (error) {
        console.error('Currency conversion failed:', error)
        return amount // Return original amount if conversion fails
      }
    }

    return amount * (rate || 1)
  }

  // Helper methods for URL building and data extraction
  private buildUrl(source: DataSource, endpoint: keyof DataSource['endpoints'], params: Record<string, string>): string {
    let url = source.baseUrl + source.endpoints[endpoint]

    // Replace placeholders
    for (const [key, value] of Object.entries(params)) {
      url = url.replace(`{${key}}`, encodeURIComponent(value))
    }

    // Add API key if required
    if (source.apiKey) {
      url = url.replace('{apikey}', source.apiKey)
    }

    return url
  }

  private extractPrice(data: any, source: string): number {
    switch (source) {
      case 'alphavantage':
        return parseFloat(data['Global Quote']?.['05. price'] || '0')
      case 'yahoo':
        return data.chart?.result?.[0]?.meta?.regularMarketPrice || 0
      case 'finnhub':
        return data.c || 0
      default:
        return 0
    }
  }

  private extractHistoricalData(data: any, source: string): ChartData[] {
    const result: ChartData[] = []

    switch (source) {
      case 'alphavantage':
        const timeSeries = data['Time Series (Daily)'] || {}
        for (const [date, values] of Object.entries(timeSeries)) {
          result.push({
            timestamp: new Date(date).getTime(),
            open: parseFloat((values as any)['1. open']),
            high: parseFloat((values as any)['2. high']),
            low: parseFloat((values as any)['3. low']),
            close: parseFloat((values as any)['4. close']),
            volume: parseInt((values as any)['5. volume'])
          })
        }
        break

      case 'yahoo':
        const chart = data.chart?.result?.[0]
        if (chart) {
          const timestamps = chart.timestamp || []
          const quotes = chart.indicators?.quote?.[0] || {}

          for (let i = 0; i < timestamps.length; i++) {
            result.push({
              timestamp: timestamps[i] * 1000,
              open: quotes.open?.[i] || 0,
              high: quotes.high?.[i] || 0,
              low: quotes.low?.[i] || 0,
              close: quotes.close?.[i] || 0,
              volume: quotes.volume?.[i] || 0
            })
          }
        }
        break

      case 'finnhub':
        if (data.s === 'ok') {
          for (let i = 0; i < data.t.length; i++) {
            result.push({
              timestamp: data.t[i] * 1000,
              open: data.o[i],
              high: data.h[i],
              low: data.l[i],
              close: data.c[i],
              volume: data.v[i]
            })
          }
        }
        break
    }

    return result.sort((a, b) => a.timestamp - b.timestamp)
  }

  private extractCompanyInfo(data: any, source: string): Partial<StockData> {
    switch (source) {
      case 'alphavantage':
        const quote = data['Global Quote'] || {}
        return {
          symbol: quote['01. symbol'],
          price: parseFloat(quote['05. price'] || '0'),
          change: parseFloat(quote['09. change'] || '0'),
          changePercent: parseFloat(quote['10. change percent']?.replace('%', '') || '0'),
          volume: parseInt(quote['06. volume'] || '0'),
          timestamp: Date.now()
        }

      case 'yahoo':
        const meta = data.chart?.result?.[0]?.meta || {}
        return {
          symbol: meta.symbol,
          price: meta.regularMarketPrice || 0,
          change: (meta.regularMarketPrice || 0) - (meta.previousClose || 0),
          changePercent: ((meta.regularMarketPrice || 0) - (meta.previousClose || 0)) / (meta.previousClose || 1) * 100,
          volume: meta.regularMarketVolume || 0,
          timestamp: Date.now()
        }

      case 'finnhub':
        return {
          price: data.c || 0,
          change: data.d || 0,
          changePercent: data.dp || 0,
          timestamp: Date.now()
        }

      default:
        return {}
    }
  }

  private extractBatchQuotes(data: any, source: string): Map<string, RealTimeQuote> {
    const quotes = new Map<string, RealTimeQuote>()

    switch (source) {
      case 'yahoo':
        const results = data.quoteResponse?.result || []
        for (const quote of results) {
          quotes.set(quote.symbol, {
            symbol: quote.symbol,
            price: quote.regularMarketPrice || 0,
            change: quote.regularMarketChange || 0,
            changePercent: quote.regularMarketChangePercent || 0,
            volume: quote.regularMarketVolume || 0,
            timestamp: Date.now(),
            bid: quote.bid,
            ask: quote.ask,
            bidSize: quote.bidSize,
            askSize: quote.askSize
          })
        }
        break
    }

    return quotes
  }

  private getPeriodStart(period: string): string {
    const now = new Date()
    const start = new Date(now)

    switch (period) {
      case '1d':
        start.setDate(now.getDate() - 1)
        break
      case '1w':
        start.setDate(now.getDate() - 7)
        break
      case '1m':
        start.setMonth(now.getMonth() - 1)
        break
      case '3m':
        start.setMonth(now.getMonth() - 3)
        break
      case '6m':
        start.setMonth(now.getMonth() - 6)
        break
      case '1y':
        start.setFullYear(now.getFullYear() - 1)
        break
      case '5y':
        start.setFullYear(now.getFullYear() - 5)
        break
      default:
        start.setFullYear(now.getFullYear() - 1)
    }

    return Math.floor(start.getTime() / 1000).toString()
  }

  // WebSocket functionality for real-time updates
  public subscribeToRealTimeUpdates(
    symbols: string[],
    callback: (data: RealTimeQuote) => void
  ): () => void {
    const subscriptionKey = symbols.join(',')

    // Add callback to subscribers
    if (!this.subscribers.has(subscriptionKey)) {
      this.subscribers.set(subscriptionKey, new Set())
    }
    this.subscribers.get(subscriptionKey)!.add(callback)

    // Start WebSocket connection if not exists
    if (!this.websockets.has(subscriptionKey)) {
      this.createWebSocketConnection(symbols, subscriptionKey)
    }

    // Start polling fallback during market hours
    this.startPollingUpdates(symbols, subscriptionKey)

    // Return unsubscribe function
    return () => {
      const subs = this.subscribers.get(subscriptionKey)
      if (subs) {
        subs.delete(callback)
        if (subs.size === 0) {
          this.cleanupSubscription(subscriptionKey)
        }
      }
    }
  }

  private createWebSocketConnection(symbols: string[], subscriptionKey: string) {
    try {
      const ws = new WebSocket(this.wsConfig.url)

      ws.onopen = () => {
        console.log('WebSocket connected')

        // Subscribe to symbols
        symbols.forEach(symbol => {
          ws.send(JSON.stringify({
            type: 'subscribe',
            symbol: symbol
          }))
        })

        // Start heartbeat
        this.startHeartbeat(ws)
      }

      ws.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data)
          this.handleWebSocketMessage(data, subscriptionKey)
        } catch (error) {
          console.error('Failed to parse WebSocket message:', error)
        }
      }

      ws.onclose = () => {
        console.log('WebSocket disconnected')
        this.handleWebSocketReconnect(symbols, subscriptionKey)
      }

      ws.onerror = (error) => {
        console.error('WebSocket error:', error)
      }

      this.websockets.set(subscriptionKey, ws)
    } catch (error) {
      console.error('Failed to create WebSocket connection:', error)
      // Fall back to polling only
    }
  }

  private handleWebSocketMessage(data: any, subscriptionKey: string) {
    // Handle different WebSocket message formats
    let quote: RealTimeQuote | null = null

    if (data.type === 'trade') {
      quote = {
        symbol: data.s,
        price: data.p,
        change: 0, // Calculate from previous price
        changePercent: 0,
        volume: data.v,
        timestamp: data.t || Date.now()
      }
    }

    if (quote) {
      this.notifySubscribers(subscriptionKey, quote)
    }
  }

  private startHeartbeat(ws: WebSocket) {
    const interval = setInterval(() => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify({ type: 'ping' }))
      } else {
        clearInterval(interval)
      }
    }, this.wsConfig.heartbeatInterval)
  }

  private handleWebSocketReconnect(symbols: string[], subscriptionKey: string) {
    const ws = this.websockets.get(subscriptionKey)
    if (ws) {
      this.websockets.delete(subscriptionKey)
    }

    // Attempt to reconnect after delay
    setTimeout(() => {
      if (this.subscribers.has(subscriptionKey) && this.subscribers.get(subscriptionKey)!.size > 0) {
        this.createWebSocketConnection(symbols, subscriptionKey)
      }
    }, this.wsConfig.reconnectInterval)
  }

  // Polling fallback for real-time updates
  private startPollingUpdates(symbols: string[], subscriptionKey: string) {
    // Only poll during market hours
    const marketHours = this.getMarketHours()
    if (!marketHours.isOpen && marketHours.session === 'closed') {
      return
    }

    const interval = setInterval(async () => {
      try {
        const quotes = await this.getBatchQuotes(symbols)

        for (const [symbol, quote] of quotes) {
          this.notifySubscribers(subscriptionKey, quote)
        }
      } catch (error) {
        console.error('Polling update failed:', error)
      }
    }, 5000) // Poll every 5 seconds

    this.updateIntervals.set(subscriptionKey, interval)
  }

  private notifySubscribers(subscriptionKey: string, data: RealTimeQuote) {
    const subscribers = this.subscribers.get(subscriptionKey)
    if (subscribers) {
      subscribers.forEach(callback => {
        try {
          callback(data)
        } catch (error) {
          console.error('Subscriber callback error:', error)
        }
      })
    }
  }

  private cleanupSubscription(subscriptionKey: string) {
    // Close WebSocket
    const ws = this.websockets.get(subscriptionKey)
    if (ws) {
      ws.close()
      this.websockets.delete(subscriptionKey)
    }

    // Clear polling interval
    const interval = this.updateIntervals.get(subscriptionKey)
    if (interval) {
      clearInterval(interval)
      this.updateIntervals.delete(subscriptionKey)
    }

    // Remove subscribers
    this.subscribers.delete(subscriptionKey)
  }

  // Search functionality
  public async searchStocks(query: string): Promise<SearchResult[]> {
    const cacheKey = `search_${query}`
    const cached = this.getCache(cacheKey)
    if (cached) return cached

    for (const source of this.dataSources.sort((a, b) => a.priority - b.priority)) {
      try {
        const url = this.buildUrl(source, 'search', { query })
        const response = await this.makeApiCall<any>(url, source)

        if (response.success) {
          const results = this.extractSearchResults(response.data, source.name)
          this.setCache(cacheKey, results, 300000) // Cache for 5 minutes
          return results
        }
      } catch (error) {
        console.warn(`Failed to search from ${source.name}:`, error)
        continue
      }
    }

    return []
  }

  private extractSearchResults(data: any, source: string): SearchResult[] {
    const results: SearchResult[] = []

    switch (source) {
      case 'alphavantage':
        const matches = data.bestMatches || []
        for (const match of matches) {
          results.push({
            symbol: match['1. symbol'],
            name: match['2. name'],
            type: match['3. type'] === 'Equity' ? 'stock' : 'etf',
            exchange: match['4. region'],
            currency: match['8. currency'],
            region: match['4. region'],
            timezone: match['7. timezone']
          })
        }
        break

      case 'yahoo':
        const quotes = data.quotes || []
        for (const quote of quotes) {
          results.push({
            symbol: quote.symbol,
            name: quote.longname || quote.shortname,
            type: quote.typeDisp === 'Equity' ? 'stock' : 'etf',
            exchange: quote.exchange,
            currency: quote.currency || 'USD'
          })
        }
        break
    }

    return results
  }

  // News functionality
  public async getNews(symbol?: string, limit: number = 10): Promise<NewsItem[]> {
    const cacheKey = `news_${symbol || 'general'}_${limit}`
    const cached = this.getCache(cacheKey)
    if (cached) return cached

    for (const source of this.dataSources.sort((a, b) => a.priority - b.priority)) {
      try {
        const params: Record<string, string> = {
          symbol: symbol || '',
          from: this.getPeriodStart('1w'),
          to: Math.floor(Date.now() / 1000).toString()
        }

        const url = this.buildUrl(source, 'news', params)
        const response = await this.makeApiCall<any>(url, source)

        if (response.success) {
          const news = this.extractNews(response.data, source.name, limit)
          this.setCache(cacheKey, news, 300000) // Cache for 5 minutes
          return news
        }
      } catch (error) {
        console.warn(`Failed to get news from ${source.name}:`, error)
        continue
      }
    }

    return []
  }

  private extractNews(data: any, source: string, limit: number): NewsItem[] {
    const news: NewsItem[] = []

    switch (source) {
      case 'alphavantage':
        const feed = data.feed || []
        for (const item of feed.slice(0, limit)) {
          news.push({
            id: item.url,
            title: item.title,
            summary: item.summary,
            url: item.url,
            source: item.source,
            publishedAt: new Date(item.time_published).getTime(),
            sentiment: this.mapSentiment(item.overall_sentiment_label),
            relevantSymbols: item.ticker_sentiment?.map((t: any) => t.ticker) || []
          })
        }
        break

      case 'finnhub':
        for (const item of data.slice(0, limit)) {
          news.push({
            id: item.id.toString(),
            title: item.headline,
            summary: item.summary,
            url: item.url,
            source: item.source,
            publishedAt: item.datetime * 1000,
            sentiment: 'neutral',
            relevantSymbols: []
          })
        }
        break
    }

    return news
  }

  private mapSentiment(sentiment: string): 'positive' | 'negative' | 'neutral' {
    switch (sentiment?.toLowerCase()) {
      case 'bullish':
      case 'positive':
        return 'positive'
      case 'bearish':
      case 'negative':
        return 'negative'
      default:
        return 'neutral'
    }
  }

  // Cleanup method
  public cleanup() {
    // Close all WebSocket connections
    for (const ws of this.websockets.values()) {
      ws.close()
    }
    this.websockets.clear()

    // Clear all intervals
    for (const interval of this.updateIntervals.values()) {
      clearInterval(interval)
    }
    this.updateIntervals.clear()

    // Clear subscribers
    this.subscribers.clear()

    // Clear cache
    this.cache.clear()
  }
}

// Export singleton instance
export const realTimeDataService = new RealTimeDataService()

// Cleanup on page unload
if (typeof window !== 'undefined') {
  window.addEventListener('beforeunload', () => {
    realTimeDataService.cleanup()
  })
}
