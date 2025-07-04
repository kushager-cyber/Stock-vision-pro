'use client'

import { TrendingUp, TrendingDown, Activity, DollarSign } from 'lucide-react'
import { motion } from 'framer-motion'
import { useMarket } from '@/contexts/MarketContext'
import RealTimeIndicator from '@/components/ui/RealTimeIndicator'
import { useState, useEffect } from 'react'
import { stockApi } from '@/services/stockApi'

export default function MarketOverview() {
  const { currentMarket, marketConfig } = useMarket()
  const [isLoadingRealData, setIsLoadingRealData] = useState(false)
  const [lastUpdate, setLastUpdate] = useState<number>(Date.now())
  const [realTimeData, setRealTimeData] = useState<any[]>([])
  const [isConnected, setIsConnected] = useState(true)

  // Only use real-time data - no static fallbacks
  const marketData = realTimeData

  // Fetch real-time market data
  useEffect(() => {
    const fetchRealTimeMarketData = async () => {
      setIsLoadingRealData(true)

      try {
        const symbols = currentMarket === 'indian'
          ? ['NIFTY', 'SENSEX', 'BANKNIFTY', 'INDIAVIX']
          : ['SPY', 'QQQ', 'DIA', 'VIX'] // ETFs that track major indices

        console.log(`🔄 Fetching real-time market data for ${currentMarket} market...`)

        const realTimeMarketData = await Promise.all(
          symbols.map(async (symbol) => {
            try {
              const stockData = await stockApi.getStockData(symbol, currentMarket)

              // Map symbol to display name
              const nameMap: Record<string, string> = {
                'SPY': 'S&P 500',
                'QQQ': 'NASDAQ',
                'DIA': 'Dow Jones',
                'VIX': 'VIX',
                'NIFTY': 'NIFTY 50',
                'SENSEX': 'SENSEX',
                'BANKNIFTY': 'BANK NIFTY',
                'INDIAVIX': 'INDIA VIX'
              }

              return {
                name: nameMap[symbol] || stockData.name,
                symbol: symbol,
                value: stockData.price,
                change: stockData.change,
                changePercent: stockData.changePercent,
                icon: stockData.changePercent >= 0 ? TrendingUp : TrendingDown,
              }
            } catch (error) {
              console.warn(`❌ Failed to fetch real-time data for ${symbol}`)
              return null
            }
          })
        )

        // Filter out failed fetches
        const validData = realTimeMarketData.filter(item => item !== null)
        setRealTimeData(validData)
        setLastUpdate(Date.now())
        setIsConnected(validData.length > 0)
        console.log(`✅ Real-time market data updated for ${currentMarket} market (${validData.length}/${symbols.length} successful)`)

      } catch (error) {
        console.error('❌ Failed to fetch real-time market data:', error)
        setIsConnected(false)
      }

      setIsLoadingRealData(false)
    }

    fetchRealTimeMarketData()

    // Update every 30 seconds
    const interval = setInterval(fetchRealTimeMarketData, 30000)
    return () => clearInterval(interval)
  }, [currentMarket])

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currentMarket === 'indian' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: marketConfig.currency,
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  return (
    <div className="glass-card">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h2 className="text-xl font-bold text-white">Market Overview</h2>
          <p className="text-sm text-gray-400 mt-1">
            {currentMarket === 'indian' ? 'Indian Markets' : 'Global Markets'} • {marketConfig.currency}
          </p>
        </div>
        <RealTimeIndicator
          isConnected={isConnected}
          lastUpdate={lastUpdate}
          dataSource={currentMarket === 'indian' ? 'NSE/BSE' : 'Yahoo Finance'}
        />
      </div>

      {isLoadingRealData ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="glass rounded-lg p-4 animate-pulse">
              <div className="flex items-center justify-between mb-3">
                <div className="h-4 bg-gray-600 rounded w-20"></div>
                <div className="h-5 w-5 bg-gray-600 rounded"></div>
              </div>
              <div className="space-y-2">
                <div className="h-6 bg-gray-600 rounded w-24"></div>
                <div className="h-4 bg-gray-600 rounded w-16"></div>
              </div>
            </div>
          ))}
        </div>
      ) : marketData.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketData.map((item, index) => {
          const Icon = item.icon
          const isPositive = item.change >= 0
          
          return (
            <motion.div
              key={item.symbol}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="glass rounded-lg p-4 hover:bg-white/5 transition-all duration-300 hover-lift"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${isPositive ? 'text-green-400' : 'text-red-400'}`} />
                  <span className="font-medium text-white">{item.symbol}</span>
                </div>
                <div className={`px-2 py-1 rounded text-xs font-medium ${
                  isPositive 
                    ? 'bg-green-500/20 text-green-400' 
                    : 'bg-red-500/20 text-red-400'
                }`}>
                  {formatPercent(item.changePercent)}
                </div>
              </div>
              
              <div>
                <h3 className="text-lg font-bold text-white mb-1">
                  {item.symbol === 'VIX' ? item.value.toFixed(2) : formatCurrency(item.value)}
                </h3>
                <p className="text-xs text-gray-400 mb-2">{item.name}</p>
                <div className={`flex items-center text-sm ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="h-4 w-4 mr-1" />
                  ) : (
                    <TrendingDown className="h-4 w-4 mr-1" />
                  )}
                  <span>
                    {isPositive ? '+' : ''}{item.change.toFixed(2)}
                  </span>
                </div>
              </div>
            </motion.div>
          )
          })}
        </div>
      ) : (
        <div className="glass rounded-lg p-8 text-center">
          <div className="text-gray-400 mb-4">
            <Activity className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <h3 className="text-lg font-medium">No Market Data Available</h3>
            <p className="text-sm mt-2">
              Unable to fetch real-time market data. Please check your API configuration.
            </p>
          </div>
        </div>
      )}

      {/* Market Summary - Removed static data, will be implemented with real API data later */}
    </div>
  )
}
