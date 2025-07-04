import axios from 'axios'
import { StockData, NewsItem, ChartData, SearchResult } from '@/types/stock'
import { realTimeDataService } from './realTimeDataService'
import { freeApiService } from './freeApiService'
import { indianStockApi } from './indianStockApi'
import { alphaVantageService } from './alphaVantageService'

// Enhanced API service with real-time data integration
class StockApiService {
  private baseUrl = 'https://api.example.com' // Replace with real API
  private apiKey = process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || 'demo'
  private useRealTimeService = true // Toggle for real-time service usage

  // Removed mock data generation - only real API data allowed

  // Removed mock data helper methods - only real API data allowed

  // Removed mock chart data generation - only real API data allowed

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
        // Try Alpha Vantage first if API key is available
        try {
          const alphaVantageKey = this.getAlphaVantageKey()
          if (alphaVantageKey) {
            console.log(`Trying Alpha Vantage for ${symbol}...`)
            return await alphaVantageService.getStockData(symbol, alphaVantageKey)
          }
        } catch (alphaVantageError) {
          console.warn('Alpha Vantage failed, trying free API service:', alphaVantageError)
        }

        // Try free API service (Yahoo Finance, etc.)
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

              // Use only real data - no fallbacks or mock data
              return {
                symbol,
                name: companyInfo.name || symbol,
                price: currentPrice,
                change: companyInfo.change || 0,
                changePercent: companyInfo.changePercent || 0,
                volume: companyInfo.volume || 0,
                marketCap: companyInfo.marketCap || 0,
                pe: companyInfo.pe || 0,
                dividendYield: companyInfo.dividendYield || 0,
                high52Week: companyInfo.high52Week || 0,
                low52Week: companyInfo.low52Week || 0,
                avgVolume: companyInfo.avgVolume || 0,
                beta: companyInfo.beta || 0,
                eps: companyInfo.eps || 0,
                analystRating: companyInfo.analystRating || 'N/A' as any,
                analystTargetPrice: companyInfo.analystTargetPrice || 0,
                riskLevel: companyInfo.riskLevel || 'N/A' as any,
                socialSentiment: companyInfo.socialSentiment || 0,
                timestamp: Date.now()
              }
            } catch (realTimeError) {
              console.warn('Real-time service also failed:', realTimeError)
            }
          }
        }
      }

      // If all APIs fail, throw error instead of using mock data
      throw new Error(`Failed to fetch real data for ${symbol}. All API sources unavailable.`)
    } catch (error) {
      console.error('Error fetching stock data:', error)
      throw error
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

  private getAlphaVantageKey(): string | null {
    if (typeof window !== 'undefined') {
      try {
        const config = localStorage.getItem('stockvision_api_config')
        if (config) {
          const parsed = JSON.parse(config)
          return parsed.alphaVantageKey || null
        }
      } catch (e) {
        console.warn('Failed to parse API config from localStorage')
      }
    }
    return null
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

      // If all APIs fail, throw error instead of using mock data
      throw new Error(`Failed to fetch real chart data for ${symbol}. All API sources unavailable.`)
    } catch (error) {
      console.error('Error fetching chart data:', error)
      throw error
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

      // If all search APIs fail, return empty array instead of mock data
      console.log(`No search results found for "${query}" - all APIs failed`)
      return []
    } catch (error) {
      console.error('Error searching stocks:', error)
      return []
    }
  }

  async getNews(symbol?: string): Promise<NewsItem[]> {
    try {
      // TODO: Implement real news API integration
      console.log('News API not yet implemented - returning empty array')
      return []
    } catch (error) {
      console.error('Error fetching news:', error)
      return []
    }
  }

  async getMarketData() {
    try {
      // TODO: Implement real market data API integration
      console.log('Market data API not yet implemented')
      throw new Error('Market data API not implemented - only real-time individual stock data available')
    } catch (error) {
      console.error('Error fetching market data:', error)
      throw error
    }
  }
}

export const stockApi = new StockApiService()
