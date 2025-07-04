'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { StockData } from '@/types/stock'
import { stockApi } from '@/services/stockApi'

interface GlobalStockState {
  selectedStock: string
  selectedStockData: StockData | null
  isLoading: boolean
  error: string | null
  lastUpdated: number
}

type GlobalStockAction =
  | { type: 'SET_SELECTED_STOCK'; payload: string }
  | { type: 'SET_STOCK_DATA'; payload: StockData }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_LAST_UPDATED'; payload: number }

const initialState: GlobalStockState = {
  selectedStock: 'AAPL', // Default stock
  selectedStockData: null,
  isLoading: false,
  error: null,
  lastUpdated: 0
}

function globalStockReducer(state: GlobalStockState, action: GlobalStockAction): GlobalStockState {
  switch (action.type) {
    case 'SET_SELECTED_STOCK':
      return { 
        ...state, 
        selectedStock: action.payload,
        selectedStockData: null, // Clear previous data
        error: null
      }
    case 'SET_STOCK_DATA':
      return { 
        ...state, 
        selectedStockData: action.payload,
        isLoading: false,
        error: null
      }
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    case 'SET_ERROR':
      return { 
        ...state, 
        error: action.payload,
        isLoading: false
      }
    case 'SET_LAST_UPDATED':
      return { ...state, lastUpdated: action.payload }
    default:
      return state
  }
}

const GlobalStockContext = createContext<{
  state: GlobalStockState
  dispatch: React.Dispatch<GlobalStockAction>
  selectStock: (symbol: string) => Promise<void>
  refreshCurrentStock: () => Promise<void>
} | null>(null)

export function GlobalStockProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(globalStockReducer, initialState)

  const selectStock = async (symbol: string) => {
    if (symbol === state.selectedStock && state.selectedStockData) {
      return // Already selected and loaded
    }

    dispatch({ type: 'SET_SELECTED_STOCK', payload: symbol })
    dispatch({ type: 'SET_LOADING', payload: true })

    try {
      console.log(`🔄 Fetching data for selected stock: ${symbol}`)
      const stockData = await stockApi.getStockData(symbol)
      dispatch({ type: 'SET_STOCK_DATA', payload: stockData })
      dispatch({ type: 'SET_LAST_UPDATED', payload: Date.now() })
      console.log(`✅ Successfully loaded data for ${symbol}`)
    } catch (error) {
      console.error(`❌ Failed to load data for ${symbol}:`, error)
      dispatch({ type: 'SET_ERROR', payload: `Failed to load data for ${symbol}` })
    }
  }

  const refreshCurrentStock = async () => {
    if (!state.selectedStock) return
    
    dispatch({ type: 'SET_LOADING', payload: true })
    
    try {
      console.log(`🔄 Refreshing data for ${state.selectedStock}`)
      const stockData = await stockApi.getStockData(state.selectedStock)
      dispatch({ type: 'SET_STOCK_DATA', payload: stockData })
      dispatch({ type: 'SET_LAST_UPDATED', payload: Date.now() })
      console.log(`✅ Successfully refreshed data for ${state.selectedStock}`)
    } catch (error) {
      console.error(`❌ Failed to refresh data for ${state.selectedStock}:`, error)
      dispatch({ type: 'SET_ERROR', payload: `Failed to refresh data for ${state.selectedStock}` })
    }
  }

  // Load initial stock data
  useEffect(() => {
    selectStock(state.selectedStock)
  }, []) // Only run once on mount

  // Auto-refresh every 30 seconds if we have a selected stock
  useEffect(() => {
    if (!state.selectedStock) return

    const interval = setInterval(() => {
      if (!state.isLoading) {
        refreshCurrentStock()
      }
    }, 30000) // 30 seconds

    return () => clearInterval(interval)
  }, [state.selectedStock, state.isLoading])

  return (
    <GlobalStockContext.Provider value={{ state, dispatch, selectStock, refreshCurrentStock }}>
      {children}
    </GlobalStockContext.Provider>
  )
}

export function useGlobalStock() {
  const context = useContext(GlobalStockContext)
  if (!context) {
    throw new Error('useGlobalStock must be used within a GlobalStockProvider')
  }
  return context
}
