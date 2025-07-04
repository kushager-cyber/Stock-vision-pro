'use client'

import { useState, useEffect, useCallback } from 'react'
import { stockApi } from '@/services/stockApi'
import { mlService } from '@/services/mlService'
import { StockData, ChartData, PredictionData, NewsItem } from '@/types/stock'
import { MarketType } from '@/contexts/MarketContext'

export function useStockData(symbol: string, market?: MarketType) {
  const [stockData, setStockData] = useState<StockData | null>(null)
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [predictions, setPredictions] = useState<PredictionData | null>(null)
  const [news, setNews] = useState<NewsItem[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchStockData = useCallback(async () => {
    if (!symbol) return

    setLoading(true)
    setError(null)

    try {
      const [stock, chart, stockNews] = await Promise.all([
        stockApi.getStockData(symbol, market),
        stockApi.getChartData(symbol, '1M', market),
        stockApi.getNews(symbol),
      ])

      setStockData(stock)
      setChartData(chart)
      setNews(stockNews)

      // Generate predictions
      const predictionData = await mlService.predict(chart, symbol)
      setPredictions(predictionData)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch stock data')
    } finally {
      setLoading(false)
    }
  }, [symbol, market])

  useEffect(() => {
    fetchStockData()
  }, [fetchStockData])

  const refreshData = useCallback(() => {
    fetchStockData()
  }, [fetchStockData])

  return {
    stockData,
    chartData,
    predictions,
    news,
    loading,
    error,
    refreshData,
  }
}

export function useRealTimePrice(symbol: string, market?: MarketType, interval: number = 5000) {
  const [price, setPrice] = useState<number | null>(null)
  const [change, setChange] = useState<number>(0)
  const [changePercent, setChangePercent] = useState<number>(0)

  useEffect(() => {
    if (!symbol) return

    const updatePrice = async () => {
      try {
        const stockData = await stockApi.getStockData(symbol, market)
        setPrice(stockData.price)
        setChange(stockData.change)
        setChangePercent(stockData.changePercent)
      } catch (error) {
        console.error('Error updating real-time price:', error)
      }
    }

    // Initial fetch
    updatePrice()

    // Set up interval for real-time updates
    const intervalId = setInterval(updatePrice, interval)

    return () => clearInterval(intervalId)
  }, [symbol, market, interval])

  return { price, change, changePercent }
}

export function useMarketData() {
  const [marketData, setMarketData] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const fetchMarketData = useCallback(async () => {
    setLoading(true)
    setError(null)

    try {
      const data = await stockApi.getMarketData()
      setMarketData(data)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch market data')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchMarketData()
    
    // Refresh market data every 30 seconds
    const interval = setInterval(fetchMarketData, 30000)
    return () => clearInterval(interval)
  }, [fetchMarketData])

  return { marketData, loading, error, refreshData: fetchMarketData }
}

export function useSearch() {
  const [results, setResults] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const search = useCallback(async (query: string) => {
    if (!query.trim()) {
      setResults([])
      return
    }

    setLoading(true)
    setError(null)

    try {
      const searchResults = await stockApi.searchStocks(query)
      setResults(searchResults)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Search failed')
      setResults([])
    } finally {
      setLoading(false)
    }
  }, [])

  const clearResults = useCallback(() => {
    setResults([])
    setError(null)
  }, [])

  return { results, loading, error, search, clearResults }
}

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(() => {
    if (typeof window === 'undefined') {
      return initialValue
    }

    try {
      const item = window.localStorage.getItem(key)
      return item ? JSON.parse(item) : initialValue
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error)
      return initialValue
    }
  })

  const setValue = useCallback((value: T | ((val: T) => T)) => {
    try {
      const valueToStore = value instanceof Function ? value(storedValue) : value
      setStoredValue(valueToStore)
      
      if (typeof window !== 'undefined') {
        window.localStorage.setItem(key, JSON.stringify(valueToStore))
      }
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error)
    }
  }, [key, storedValue])

  const removeValue = useCallback(() => {
    try {
      setStoredValue(initialValue)
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key)
      }
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error)
    }
  }, [key, initialValue])

  return [storedValue, setValue, removeValue] as const
}

export function useDebounce<T>(value: T, delay: number): T {
  const [debouncedValue, setDebouncedValue] = useState<T>(value)

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value)
    }, delay)

    return () => {
      clearTimeout(handler)
    }
  }, [value, delay])

  return debouncedValue
}

export function useInterval(callback: () => void, delay: number | null) {
  useEffect(() => {
    if (delay === null) return

    const id = setInterval(callback, delay)
    return () => clearInterval(id)
  }, [callback, delay])
}

export function useWebSocket(url: string) {
  const [socket, setSocket] = useState<WebSocket | null>(null)
  const [lastMessage, setLastMessage] = useState<any>(null)
  const [readyState, setReadyState] = useState<number>(WebSocket.CONNECTING)

  useEffect(() => {
    if (!url) return

    const ws = new WebSocket(url)
    setSocket(ws)

    ws.onopen = () => setReadyState(WebSocket.OPEN)
    ws.onclose = () => setReadyState(WebSocket.CLOSED)
    ws.onerror = () => setReadyState(WebSocket.CLOSED)
    ws.onmessage = (event) => {
      try {
        const data = JSON.parse(event.data)
        setLastMessage(data)
      } catch (error) {
        setLastMessage(event.data)
      }
    }

    return () => {
      ws.close()
    }
  }, [url])

  const sendMessage = useCallback((message: any) => {
    if (socket && readyState === WebSocket.OPEN) {
      socket.send(typeof message === 'string' ? message : JSON.stringify(message))
    }
  }, [socket, readyState])

  return {
    socket,
    lastMessage,
    readyState,
    sendMessage,
  }
}
