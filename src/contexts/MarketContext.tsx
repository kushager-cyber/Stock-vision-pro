'use client'

import React, { createContext, useContext, useState, useEffect } from 'react'

export type MarketType = 'world' | 'indian'

interface MarketContextType {
  currentMarket: MarketType
  setMarket: (market: MarketType) => void
  marketConfig: {
    currency: string
    currencySymbol: string
    timezone: string
    marketHours: {
      open: string
      close: string
    }
    exchanges: string[]
    indices: string[]
  }
}

const marketConfigs = {
  world: {
    currency: 'USD',
    currencySymbol: '$',
    timezone: 'America/New_York',
    marketHours: {
      open: '09:30',
      close: '16:00'
    },
    exchanges: ['NYSE', 'NASDAQ', 'LSE', 'TSE'],
    indices: ['SPX', 'IXIC', 'DJI', 'RUT']
  },
  indian: {
    currency: 'INR',
    currencySymbol: '₹',
    timezone: 'Asia/Kolkata',
    marketHours: {
      open: '09:15',
      close: '15:30'
    },
    exchanges: ['NSE', 'BSE'],
    indices: ['NIFTY', 'SENSEX', 'BANKNIFTY', 'NIFTYNEXT50']
  }
}

const MarketContext = createContext<MarketContextType | null>(null)

interface MarketProviderProps {
  children: React.ReactNode
}

export function MarketProvider({ children }: MarketProviderProps) {
  const [currentMarket, setCurrentMarket] = useState<MarketType>('world')

  // Load market preference from localStorage on mount
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const savedMarket = localStorage.getItem('stockvision_market')
      if (savedMarket && (savedMarket === 'world' || savedMarket === 'indian')) {
        setCurrentMarket(savedMarket as MarketType)
      }
    }
  }, [])

  const setMarket = (market: MarketType) => {
    setCurrentMarket(market)
    if (typeof window !== 'undefined') {
      localStorage.setItem('stockvision_market', market)
    }
  }

  const value: MarketContextType = {
    currentMarket,
    setMarket,
    marketConfig: marketConfigs[currentMarket]
  }

  return (
    <MarketContext.Provider value={value}>
      {children}
    </MarketContext.Provider>
  )
}

export function useMarket() {
  const context = useContext(MarketContext)
  if (!context) {
    throw new Error('useMarket must be used within a MarketProvider')
  }
  return context
}
