'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  RefreshCw, 
  Clock, 
  TrendingUp, 
  TrendingDown,
  Globe,
  Database,
  Zap
} from 'lucide-react'
import { useRealTimeData, useMultipleStocks, useMarketHours } from '@/hooks/useRealTimeData'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import CountUp from 'react-countup'

interface RealTimeDataDemoProps {
  className?: string
}

export default function RealTimeDataDemo({ className = '' }: RealTimeDataDemoProps) {
  const [selectedSymbol, setSelectedSymbol] = useState('AAPL')
  const [watchlistSymbols] = useState(['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'])

  // Single stock real-time data
  const {
    data: stockData,
    quote,
    marketHours,
    loading: stockLoading,
    error: stockError,
    lastUpdated: stockLastUpdated,
    refresh: refreshStock
  } = useRealTimeData({
    symbol: selectedSymbol,
    enableRealTime: true,
    updateInterval: 5000,
    autoRefresh: true
  })

  // Multiple stocks data
  const {
    quotes: watchlistQuotes,
    loading: watchlistLoading,
    error: watchlistError,
    lastUpdated: watchlistLastUpdated,
    refresh: refreshWatchlist
  } = useMultipleStocks({
    symbols: watchlistSymbols,
    enableRealTime: true,
    updateInterval: 5000
  })

  // Market hours
  const { marketHours: globalMarketHours } = useMarketHours('NASDAQ')

  const getStatusColor = (isConnected: boolean) => {
    return isConnected ? 'text-green-400' : 'text-red-400'
  }

  const getStatusIcon = (isConnected: boolean) => {
    return isConnected ? Wifi : WifiOff
  }

  const formatTimestamp = (timestamp: number) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <Activity className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">Real-Time Data Integration Demo</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Connection Status */}
            <div className="flex items-center space-x-2">
              {(() => {
                const isConnected = !stockError && !watchlistError
                const StatusIcon = getStatusIcon(isConnected)
                return (
                  <>
                    <StatusIcon className={`h-4 w-4 ${getStatusColor(isConnected)}`} />
                    <span className={`text-sm ${getStatusColor(isConnected)}`}>
                      {isConnected ? 'Connected' : 'Disconnected'}
                    </span>
                  </>
                )
              })()}
            </div>

            {/* Market Status */}
            {globalMarketHours && (
              <div className="flex items-center space-x-2">
                <Clock className="h-4 w-4 text-gray-400" />
                <span className={`text-sm ${
                  globalMarketHours.isOpen ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {globalMarketHours.session.replace('-', ' ').toUpperCase()}
                </span>
              </div>
            )}
          </div>
        </div>

        {/* Symbol Selector */}
        <div className="flex flex-wrap gap-2">
          {watchlistSymbols.map(symbol => (
            <button
              key={symbol}
              onClick={() => setSelectedSymbol(symbol)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSymbol === symbol
                  ? 'bg-blue-500 text-white'
                  : 'glass text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {symbol}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Single Stock Real-Time Data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            Real-Time Stock Data - {selectedSymbol}
          </h3>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400">
              Last updated: {stockLastUpdated ? formatTimestamp(stockLastUpdated) : 'Never'}
            </span>
            <button
              onClick={refreshStock}
              disabled={stockLoading}
              className="p-2 glass rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${stockLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {stockError ? (
          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-red-400">Error: {stockError}</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* Current Price */}
            <div className="text-center p-4 glass rounded-lg">
              <div className="text-2xl font-bold text-white">
                {quote ? (
                  <CountUp 
                    end={quote.price} 
                    duration={1} 
                    decimals={2} 
                    prefix="$"
                    preserveValue
                  />
                ) : (
                  <span className="text-gray-400">Loading...</span>
                )}
              </div>
              <div className="text-sm text-gray-400">Current Price</div>
            </div>

            {/* Change */}
            <div className="text-center p-4 glass rounded-lg">
              <div className={`text-2xl font-bold ${
                quote && quote.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {quote ? (
                  <div className="flex items-center justify-center space-x-1">
                    {quote.change >= 0 ? (
                      <TrendingUp className="h-5 w-5" />
                    ) : (
                      <TrendingDown className="h-5 w-5" />
                    )}
                    <CountUp 
                      end={Math.abs(quote.change)} 
                      duration={1} 
                      decimals={2} 
                      prefix={quote.change >= 0 ? '+$' : '-$'}
                      preserveValue
                    />
                  </div>
                ) : (
                  <span className="text-gray-400">--</span>
                )}
              </div>
              <div className="text-sm text-gray-400">Change</div>
            </div>

            {/* Change Percent */}
            <div className="text-center p-4 glass rounded-lg">
              <div className={`text-2xl font-bold ${
                quote && quote.changePercent >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {quote ? (
                  <CountUp 
                    end={quote.changePercent} 
                    duration={1} 
                    decimals={2} 
                    suffix="%"
                    prefix={quote.changePercent >= 0 ? '+' : ''}
                    preserveValue
                  />
                ) : (
                  <span className="text-gray-400">--</span>
                )}
              </div>
              <div className="text-sm text-gray-400">Change %</div>
            </div>

            {/* Volume */}
            <div className="text-center p-4 glass rounded-lg">
              <div className="text-2xl font-bold text-blue-400">
                {quote ? (
                  <CountUp 
                    end={quote.volume} 
                    duration={1} 
                    separator=","
                    preserveValue
                  />
                ) : (
                  <span className="text-gray-400">--</span>
                )}
              </div>
              <div className="text-sm text-gray-400">Volume</div>
            </div>
          </div>
        )}
      </motion.div>

      {/* Watchlist Real-Time Data */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">
            Real-Time Watchlist
          </h3>
          
          <div className="flex items-center space-x-3">
            <span className="text-sm text-gray-400">
              Last updated: {watchlistLastUpdated ? formatTimestamp(watchlistLastUpdated) : 'Never'}
            </span>
            <button
              onClick={refreshWatchlist}
              disabled={watchlistLoading}
              className="p-2 glass rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${watchlistLoading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {watchlistError ? (
          <div className="p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <p className="text-red-400">Error: {watchlistError}</p>
          </div>
        ) : (
          <div className="space-y-3">
            {watchlistSymbols.map(symbol => {
              const quote = watchlistQuotes.get(symbol)
              return (
                <motion.div
                  key={symbol}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center justify-between p-4 glass rounded-lg hover-lift"
                >
                  <div className="flex items-center space-x-3">
                    <span className="font-bold text-white">{symbol}</span>
                    <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  </div>
                  
                  <div className="flex items-center space-x-6">
                    <div className="text-right">
                      <div className="font-bold text-white">
                        {quote ? formatCurrency(quote.price) : '--'}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className={`font-bold ${
                        quote && quote.change >= 0 ? 'text-green-400' : 'text-red-400'
                      }`}>
                        {quote ? formatPercent(quote.changePercent) : '--'}
                      </div>
                    </div>
                    
                    <div className="text-right">
                      <div className="text-gray-400 text-sm">
                        {quote ? quote.volume.toLocaleString() : '--'}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )
            })}
          </div>
        )}
      </motion.div>

      {/* API Integration Status */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">
          Data Integration Status
        </h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-center space-x-3 p-3 glass rounded-lg">
            <Database className="h-5 w-5 text-blue-400" />
            <div>
              <p className="text-sm font-medium text-white">Primary API</p>
              <p className="text-xs text-gray-400">Alpha Vantage</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 glass rounded-lg">
            <Globe className="h-5 w-5 text-green-400" />
            <div>
              <p className="text-sm font-medium text-white">Fallback API</p>
              <p className="text-xs text-gray-400">Yahoo Finance</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-3 p-3 glass rounded-lg">
            <Zap className="h-5 w-5 text-purple-400" />
            <div>
              <p className="text-sm font-medium text-white">WebSocket</p>
              <p className="text-xs text-gray-400">Finnhub</p>
            </div>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
