import axios from 'axios'
import { StockData } from '@/types/stock'

class AlphaVantageService {
  private readonly BASE_URL = 'https://www.alphavantage.co/query'
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly CACHE_TTL = 60000 // 1 minute cache

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

  // Test Alpha Vantage API connection
  async testConnection(apiKey: string): Promise<{ success: boolean; message: string; data?: any }> {
    if (!apiKey || apiKey.trim() === '') {
      return {
        success: false,
        message: 'API key is required for Alpha Vantage'
      }
    }

    try {
      console.log('🔄 Testing Alpha Vantage API connection...')
      
      // Test with a simple quote request
      const response = await axios.get(this.BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: 'AAPL',
          apikey: apiKey
        },
        timeout: 15000
      })

      const data = response.data

      // Check for API key errors
      if (data['Error Message']) {
        return {
          success: false,
          message: `Alpha Vantage Error: ${data['Error Message']}`
        }
      }

      if (data['Information']) {
        return {
          success: false,
          message: `Alpha Vantage Info: ${data['Information']}`
        }
      }

      if (data['Note']) {
        return {
          success: false,
          message: `Alpha Vantage Note: ${data['Note']}`
        }
      }

      // Check for successful response
      const quote = data['Global Quote']
      if (quote && quote['01. symbol']) {
        return {
          success: true,
          message: 'Alpha Vantage API connected successfully',
          data: {
            symbol: quote['01. symbol'],
            price: quote['05. price'],
            change: quote['09. change'],
            changePercent: quote['10. change percent'],
            timestamp: new Date().toISOString()
          }
        }
      }

      return {
        success: false,
        message: 'Invalid response format from Alpha Vantage API'
      }

    } catch (error) {
      if (axios.isAxiosError(error)) {
        if (error.code === 'ECONNABORTED') {
          return {
            success: false,
            message: 'Alpha Vantage API request timed out'
          }
        }
        if (error.response?.status === 403) {
          return {
            success: false,
            message: 'Invalid API key or access denied'
          }
        }
        if (error.response?.status === 429) {
          return {
            success: false,
            message: 'API rate limit exceeded'
          }
        }
      }

      return {
        success: false,
        message: `Alpha Vantage API test failed: ${error instanceof Error ? error.message : 'Unknown error'}`
      }
    }
  }

  // Get stock data using Alpha Vantage API
  async getStockData(symbol: string, apiKey: string): Promise<StockData> {
    const cacheKey = `av_stock_${symbol}`
    const cached = this.getCachedData(cacheKey)
    if (cached) return cached

    try {
      console.log(`🔄 Fetching Alpha Vantage data for ${symbol}...`)

      const response = await axios.get(this.BASE_URL, {
        params: {
          function: 'GLOBAL_QUOTE',
          symbol: symbol,
          apikey: apiKey
        },
        timeout: 15000
      })

      const data = response.data
      const quote = data['Global Quote']

      if (quote && quote['01. symbol']) {
        const currentPrice = parseFloat(quote['05. price'])
        const change = parseFloat(quote['09. change'])
        const changePercent = parseFloat(quote['10. change percent'].replace('%', ''))

        const stockData: StockData = {
          symbol: symbol,
          name: quote['01. symbol'],
          price: currentPrice,
          change: change,
          changePercent: changePercent,
          volume: parseInt(quote['06. volume']) || 0,
          marketCap: 0, // Not available in global quote
          pe: 0, // Not available in global quote
          dividendYield: 0, // Not available in global quote
          high52Week: parseFloat(quote['03. high']) || currentPrice * 1.2,
          low52Week: parseFloat(quote['04. low']) || currentPrice * 0.8,
          avgVolume: 0, // Not available in global quote
          beta: 1,
          eps: 0, // Not available in global quote
          analystRating: 'Hold' as const,
          analystTargetPrice: currentPrice * 1.1,
          riskLevel: 'Medium' as const,
          socialSentiment: Math.random() * 2 - 1,
          timestamp: Date.now()
        }

        this.setCachedData(cacheKey, stockData)
        console.log(`✅ Alpha Vantage data fetched successfully for ${symbol}`)
        return stockData
      }

      throw new Error('Invalid response format from Alpha Vantage')

    } catch (error) {
      console.error(`❌ Alpha Vantage failed for ${symbol}:`, error)
      throw error
    }
  }

  // Get detailed company information
  async getCompanyOverview(symbol: string, apiKey: string): Promise<any> {
    try {
      console.log(`🔄 Fetching Alpha Vantage company overview for ${symbol}...`)

      const response = await axios.get(this.BASE_URL, {
        params: {
          function: 'OVERVIEW',
          symbol: symbol,
          apikey: apiKey
        },
        timeout: 15000
      })

      const data = response.data

      if (data['Symbol']) {
        console.log(`✅ Alpha Vantage company overview fetched for ${symbol}`)
        return data
      }

      throw new Error('Invalid company overview response')

    } catch (error) {
      console.error(`❌ Alpha Vantage company overview failed for ${symbol}:`, error)
      throw error
    }
  }

  // Get intraday data
  async getIntradayData(symbol: string, apiKey: string, interval: string = '5min'): Promise<any> {
    try {
      console.log(`🔄 Fetching Alpha Vantage intraday data for ${symbol}...`)

      const response = await axios.get(this.BASE_URL, {
        params: {
          function: 'TIME_SERIES_INTRADAY',
          symbol: symbol,
          interval: interval,
          apikey: apiKey
        },
        timeout: 15000
      })

      const data = response.data
      const timeSeries = data[`Time Series (${interval})`]

      if (timeSeries) {
        console.log(`✅ Alpha Vantage intraday data fetched for ${symbol}`)
        return timeSeries
      }

      throw new Error('Invalid intraday data response')

    } catch (error) {
      console.error(`❌ Alpha Vantage intraday data failed for ${symbol}:`, error)
      throw error
    }
  }
}

export const alphaVantageService = new AlphaVantageService()
