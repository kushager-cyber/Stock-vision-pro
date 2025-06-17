'use client'

import { useState, useEffect, useCallback, useRef } from 'react'
import { realTimeDataService } from '@/services/realTimeDataService'
import { StockData, ChartData, RealTimeQuote, MarketHours } from '@/types/stock'

interface UseRealTimeDataOptions {
  symbol: string
  enableRealTime?: boolean
  updateInterval?: number
  autoRefresh?: boolean
}

interface UseRealTimeDataReturn {
  data: StockData | null
  quote: RealTimeQuote | null
  historicalData: ChartData[]
  marketHours: MarketHours | null
  loading: boolean
  error: string | null
  lastUpdated: number
  refresh: () => Promise<void>
  subscribe: () => void
  unsubscribe: () => void
}

export function useRealTimeData({
  symbol,
  enableRealTime = true,
  updateInterval = 5000,
  autoRefresh = true
}: UseRealTimeDataOptions): UseRealTimeDataReturn {
  const [data, setData] = useState<StockData | null>(null)
  const [quote, setQuote] = useState<RealTimeQuote | null>(null)
  const [historicalData, setHistoricalData] = useState<ChartData[]>([])
  const [marketHours, setMarketHours] = useState<MarketHours | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState(0)

  const unsubscribeRef = useRef<(() => void) | null>(null)
  const intervalRef = useRef<NodeJS.Timeout | null>(null)

  // Fetch initial data
  const fetchData = useCallback(async () => {
    if (!symbol) return

    try {
      setLoading(true)
      setError(null)

      // Fetch company info and current price
      const [companyInfo, currentPrice, historical, hours] = await Promise.allSettled([
        realTimeDataService.getCompanyInfo(symbol),
        realTimeDataService.getCurrentPrice(symbol),
        realTimeDataService.getHistoricalData(symbol, '1y', '1d'),
        Promise.resolve(realTimeDataService.getMarketHours())
      ])

      // Process company info
      if (companyInfo.status === 'fulfilled') {
        const stockData: StockData = {
          symbol,
          name: `${symbol} Inc.`, // Fallback name
          price: 0,
          change: 0,
          changePercent: 0,
          volume: 0,
          marketCap: 0,
          pe: 0,
          high52Week: 0,
          low52Week: 0,
          dividendYield: 0,
          beta: 0,
          eps: 0,
          timestamp: Date.now(),
          avgVolume: 0,
          revenue: 0,
          grossProfit: 0,
          operatingIncome: 0,
          netIncome: 0,
          totalAssets: 0,
          totalDebt: 0,
          freeCashFlow: 0,
          returnOnEquity: 0,
          returnOnAssets: 0,
          debtToEquity: 0,
          currentRatio: 0,
          quickRatio: 0,
          grossMargin: 0,
          operatingMargin: 0,
          netMargin: 0,
          ...companyInfo.value
        }
        setData(stockData)
      }

      // Process current price
      if (currentPrice.status === 'fulfilled') {
        setQuote({
          symbol,
          price: currentPrice.value,
          change: 0,
          changePercent: 0,
          volume: 0,
          timestamp: Date.now()
        })
      }

      // Process historical data
      if (historical.status === 'fulfilled') {
        setHistoricalData(historical.value)
      }

      // Process market hours
      if (hours.status === 'fulfilled') {
        setMarketHours(hours.value)
      }

      setLastUpdated(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch data')
    } finally {
      setLoading(false)
    }
  }, [symbol])

  // Subscribe to real-time updates
  const subscribe = useCallback(() => {
    if (!symbol || !enableRealTime) return

    // Unsubscribe from previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }

    // Subscribe to real-time updates
    unsubscribeRef.current = realTimeDataService.subscribeToRealTimeUpdates(
      [symbol],
      (newQuote: RealTimeQuote) => {
        if (newQuote.symbol === symbol) {
          setQuote(prevQuote => ({
            ...prevQuote,
            ...newQuote
          }))

          // Update stock data with new price
          setData(prevData => {
            if (!prevData) return prevData
            
            return {
              ...prevData,
              price: newQuote.price,
              change: newQuote.change,
              changePercent: newQuote.changePercent,
              volume: newQuote.volume,
              timestamp: newQuote.timestamp
            }
          })

          setLastUpdated(Date.now())
        }
      }
    )
  }, [symbol, enableRealTime])

  // Unsubscribe from real-time updates
  const unsubscribe = useCallback(() => {
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
      unsubscribeRef.current = null
    }
  }, [])

  // Refresh data manually
  const refresh = useCallback(async () => {
    await fetchData()
  }, [fetchData])

  // Auto-refresh during market hours
  useEffect(() => {
    if (!autoRefresh || !marketHours?.isOpen) return

    intervalRef.current = setInterval(() => {
      fetchData()
    }, updateInterval)

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [autoRefresh, marketHours?.isOpen, updateInterval, fetchData])

  // Initial data fetch
  useEffect(() => {
    fetchData()
  }, [fetchData])

  // Subscribe to real-time updates
  useEffect(() => {
    if (enableRealTime) {
      subscribe()
    }

    return () => {
      unsubscribe()
    }
  }, [enableRealTime, subscribe, unsubscribe])

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      unsubscribe()
      if (intervalRef.current) {
        clearInterval(intervalRef.current)
      }
    }
  }, [unsubscribe])

  return {
    data,
    quote,
    historicalData,
    marketHours,
    loading,
    error,
    lastUpdated,
    refresh,
    subscribe,
    unsubscribe
  }
}

// Hook for multiple symbols
interface UseMultipleStocksOptions {
  symbols: string[]
  enableRealTime?: boolean
  updateInterval?: number
}

interface UseMultipleStocksReturn {
  quotes: Map<string, RealTimeQuote>
  loading: boolean
  error: string | null
  lastUpdated: number
  refresh: () => Promise<void>
}

export function useMultipleStocks({
  symbols,
  enableRealTime = true,
  updateInterval = 5000
}: UseMultipleStocksOptions): UseMultipleStocksReturn {
  const [quotes, setQuotes] = useState<Map<string, RealTimeQuote>>(new Map())
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState(0)

  const unsubscribeRef = useRef<(() => void) | null>(null)

  const fetchQuotes = useCallback(async () => {
    if (symbols.length === 0) return

    try {
      setLoading(true)
      setError(null)

      const batchQuotes = await realTimeDataService.getBatchQuotes(symbols)
      setQuotes(batchQuotes)
      setLastUpdated(Date.now())
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch quotes')
    } finally {
      setLoading(false)
    }
  }, [symbols])

  const refresh = useCallback(async () => {
    await fetchQuotes()
  }, [fetchQuotes])

  // Subscribe to real-time updates
  useEffect(() => {
    if (!enableRealTime || symbols.length === 0) return

    // Unsubscribe from previous subscription
    if (unsubscribeRef.current) {
      unsubscribeRef.current()
    }

    // Subscribe to real-time updates
    unsubscribeRef.current = realTimeDataService.subscribeToRealTimeUpdates(
      symbols,
      (newQuote: RealTimeQuote) => {
        setQuotes(prevQuotes => {
          const newQuotes = new Map(prevQuotes)
          newQuotes.set(newQuote.symbol, newQuote)
          return newQuotes
        })
        setLastUpdated(Date.now())
      }
    )

    return () => {
      if (unsubscribeRef.current) {
        unsubscribeRef.current()
      }
    }
  }, [symbols, enableRealTime])

  // Initial fetch
  useEffect(() => {
    fetchQuotes()
  }, [fetchQuotes])

  return {
    quotes,
    loading,
    error,
    lastUpdated,
    refresh
  }
}

// Hook for market hours
export function useMarketHours(exchange: string = 'NASDAQ') {
  const [marketHours, setMarketHours] = useState<MarketHours | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    try {
      const hours = realTimeDataService.getMarketHours(exchange)
      setMarketHours(hours)
    } catch (error) {
      console.error('Failed to get market hours:', error)
    } finally {
      setLoading(false)
    }

    // Update market hours every minute
    const interval = setInterval(() => {
      try {
        const hours = realTimeDataService.getMarketHours(exchange)
        setMarketHours(hours)
      } catch (error) {
        console.error('Failed to update market hours:', error)
      }
    }, 60000)

    return () => clearInterval(interval)
  }, [exchange])

  return { marketHours, loading }
}
