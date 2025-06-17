'use client'

import React, { createContext, useContext, useReducer, useEffect } from 'react'
import { StockData, WatchlistItem, PortfolioItem, PredictionData } from '@/types/stock'

interface StockState {
  selectedStock: string
  stockData: Record<string, StockData>
  watchlist: WatchlistItem[]
  portfolio: PortfolioItem[]
  predictions: Record<string, PredictionData>
  isLoading: boolean
  error: string | null
  marketStatus: 'open' | 'closed' | 'pre-market' | 'after-hours'
}

type StockAction =
  | { type: 'SET_SELECTED_STOCK'; payload: string }
  | { type: 'SET_STOCK_DATA'; payload: { symbol: string; data: StockData } }
  | { type: 'ADD_TO_WATCHLIST'; payload: WatchlistItem }
  | { type: 'REMOVE_FROM_WATCHLIST'; payload: string }
  | { type: 'ADD_TO_PORTFOLIO'; payload: PortfolioItem }
  | { type: 'UPDATE_PORTFOLIO'; payload: { symbol: string; data: Partial<PortfolioItem> } }
  | { type: 'SET_PREDICTION'; payload: { symbol: string; data: PredictionData } }
  | { type: 'SET_LOADING'; payload: boolean }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_MARKET_STATUS'; payload: StockState['marketStatus'] }

const initialState: StockState = {
  selectedStock: 'AAPL',
  stockData: {},
  watchlist: [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 150.00, change: 2.50, changePercent: 1.69 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2800.00, change: -15.30, changePercent: -0.54 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 330.00, change: 5.20, changePercent: 1.60 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 800.00, change: -12.50, changePercent: -1.54 },
  ],
  portfolio: [
    { symbol: 'AAPL', name: 'Apple Inc.', shares: 10, avgPrice: 145.00, currentPrice: 150.00, totalValue: 1500.00, gainLoss: 50.00, gainLossPercent: 3.45 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', shares: 2, avgPrice: 2750.00, currentPrice: 2800.00, totalValue: 5600.00, gainLoss: 100.00, gainLossPercent: 1.82 },
  ],
  predictions: {},
  isLoading: false,
  error: null,
  marketStatus: 'closed',
}

function stockReducer(state: StockState, action: StockAction): StockState {
  switch (action.type) {
    case 'SET_SELECTED_STOCK':
      return { ...state, selectedStock: action.payload }
    
    case 'SET_STOCK_DATA':
      return {
        ...state,
        stockData: {
          ...state.stockData,
          [action.payload.symbol]: action.payload.data,
        },
      }
    
    case 'ADD_TO_WATCHLIST':
      if (state.watchlist.find(item => item.symbol === action.payload.symbol)) {
        return state
      }
      return {
        ...state,
        watchlist: [...state.watchlist, action.payload],
      }
    
    case 'REMOVE_FROM_WATCHLIST':
      return {
        ...state,
        watchlist: state.watchlist.filter(item => item.symbol !== action.payload),
      }
    
    case 'ADD_TO_PORTFOLIO':
      return {
        ...state,
        portfolio: [...state.portfolio, action.payload],
      }
    
    case 'UPDATE_PORTFOLIO':
      return {
        ...state,
        portfolio: state.portfolio.map(item =>
          item.symbol === action.payload.symbol
            ? { ...item, ...action.payload.data }
            : item
        ),
      }
    
    case 'SET_PREDICTION':
      return {
        ...state,
        predictions: {
          ...state.predictions,
          [action.payload.symbol]: action.payload.data,
        },
      }
    
    case 'SET_LOADING':
      return { ...state, isLoading: action.payload }
    
    case 'SET_ERROR':
      return { ...state, error: action.payload }
    
    case 'SET_MARKET_STATUS':
      return { ...state, marketStatus: action.payload }
    
    default:
      return state
  }
}

const StockContext = createContext<{
  state: StockState
  dispatch: React.Dispatch<StockAction>
} | null>(null)

export function StockProvider({ children }: { children: React.ReactNode }) {
  const [state, dispatch] = useReducer(stockReducer, initialState)

  // Check market status on mount
  useEffect(() => {
    const checkMarketStatus = () => {
      const now = new Date()
      const hour = now.getHours()
      const day = now.getDay()
      
      // Weekend
      if (day === 0 || day === 6) {
        dispatch({ type: 'SET_MARKET_STATUS', payload: 'closed' })
        return
      }
      
      // Market hours (9:30 AM - 4:00 PM EST)
      if (hour >= 9.5 && hour < 16) {
        dispatch({ type: 'SET_MARKET_STATUS', payload: 'open' })
      } else if (hour >= 4 && hour < 20) {
        dispatch({ type: 'SET_MARKET_STATUS', payload: 'after-hours' })
      } else if (hour >= 4 && hour < 9.5) {
        dispatch({ type: 'SET_MARKET_STATUS', payload: 'pre-market' })
      } else {
        dispatch({ type: 'SET_MARKET_STATUS', payload: 'closed' })
      }
    }

    checkMarketStatus()
    const interval = setInterval(checkMarketStatus, 60000) // Check every minute

    return () => clearInterval(interval)
  }, [])

  return (
    <StockContext.Provider value={{ state, dispatch }}>
      {children}
    </StockContext.Provider>
  )
}

export function useStock() {
  const context = useContext(StockContext)
  if (!context) {
    throw new Error('useStock must be used within a StockProvider')
  }
  return context
}
