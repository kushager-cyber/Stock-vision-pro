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

  const worldMarketData = [
    {
      name: 'S&P 500',
      symbol: 'SPX',
      value: 4567.89,
      change: 23.45,
      changePercent: 0.52,
      icon: TrendingUp,
    },
    {
      name: 'NASDAQ',
      symbol: 'IXIC',
      value: 14234.56,
      change: -45.67,
      changePercent: -0.32,
      icon: TrendingDown,
    },
    {
      name: 'Dow Jones',
      symbol: 'DJI',
      value: 34567.12,
      change: 156.78,
      changePercent: 0.45,
      icon: TrendingUp,
    },
    {
      name: 'VIX',
      symbol: 'VIX',
      value: 18.45,
      change: -1.23,
      changePercent: -6.25,
      icon: Activity,
    },
  ]

  const indianMarketData = [
    {
      name: 'NIFTY 50',
      symbol: 'NIFTY',
      value: 19845.65,
      change: 125.30,
      changePercent: 0.63,
      icon: TrendingUp,
    },
    {
      name: 'SENSEX',
      symbol: 'SENSEX',
      value: 66589.93,
      change: -89.45,
      changePercent: -0.13,
      icon: TrendingDown,
    },
    {
      name: 'BANK NIFTY',
      symbol: 'BANKNIFTY',
      value: 45234.78,
      change: 234.56,
      changePercent: 0.52,
      icon: TrendingUp,
    },
    {
      name: 'INDIA VIX',
      symbol: 'INDIAVIX',
      value: 13.45,
      change: -0.85,
      changePercent: -5.95,
      icon: Activity,
    },
  ]

  // Use real-time data if available, otherwise fallback to static data
  const marketData = realTimeData.length > 0 ? realTimeData : (currentMarket === 'indian' ? indianMarketData : worldMarketData)

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
          symbols.map(async (symbol, index) => {
            try {
              const stockData = await stockApi.getStockData(symbol, currentMarket)
              const fallbackData = currentMarket === 'indian' ? indianMarketData[index] : worldMarketData[index]

              return {
                name: fallbackData.name,
                symbol: symbol,
                value: stockData.price,
                change: stockData.change,
                changePercent: stockData.changePercent,
                icon: stockData.changePercent >= 0 ? TrendingUp : TrendingDown,
              }
            } catch (error) {
              console.warn(`❌ Failed to fetch real-time data for ${symbol}, using fallback`)
              return currentMarket === 'indian' ? indianMarketData[index] : worldMarketData[index]
            }
          })
        )

        setRealTimeData(realTimeMarketData)
        setLastUpdate(Date.now())
        setIsConnected(true)
        console.log(`✅ Real-time market data updated for ${currentMarket} market`)

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

      {/* Market Summary */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-400">Gainers</span>
            </div>
            <p className="text-2xl font-bold text-green-400">1,247</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              <span className="text-sm text-gray-400">Losers</span>
            </div>
            <p className="text-2xl font-bold text-red-400">892</p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <DollarSign className="h-5 w-5 text-blue-400" />
              <span className="text-sm text-gray-400">Volume</span>
            </div>
            <p className="text-2xl font-bold text-blue-400">2.4B</p>
          </div>
        </div>
      </div>
    </div>
  )
}
