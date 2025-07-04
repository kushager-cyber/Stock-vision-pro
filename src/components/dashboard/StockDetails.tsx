'use client'

import { useState } from 'react'
import { Info, DollarSign, TrendingUp, BarChart3, Calendar, Star } from 'lucide-react'
import { useStock } from '@/contexts/StockContext'
import { useMarket } from '@/contexts/MarketContext'
import { motion } from 'framer-motion'

export default function StockDetails() {
  const { state, dispatch } = useStock()
  const { currentMarket, marketConfig } = useMarket()
  const [activeTab, setActiveTab] = useState<'overview' | 'financials' | 'analysis'>('overview')

  // Use real stock data from context instead of static data
  const stockInfo = state.stockData[state.selectedStock] || null

  // Return early if no stock data is available
  if (!stockInfo) {
    return (
      <div className="glass-card">
        <div className="text-center py-8">
          <div className="text-gray-400 mb-4">
            <Info className="h-12 w-12 mx-auto mb-2 opacity-50" />
            <h3 className="text-lg font-medium">No Stock Data Available</h3>
            <p className="text-sm mt-2">
              Please select a stock from the watchlist or search for a stock to view details.
            </p>
          </div>
        </div>
      </div>
    )
  }

  // TODO: Remove static financials data - should come from API
  const financials = null // Removed static financial data

  const isInWatchlist = state.watchlist.some(item => item.symbol === state.selectedStock)

  const formatCurrency = (value: number) => {
    const currencySymbol = marketConfig.currencySymbol
    if (value >= 1e12) {
      return `${currencySymbol}${(value / 1e12).toFixed(2)}T`
    } else if (value >= 1e9) {
      return `${currencySymbol}${(value / 1e9).toFixed(2)}B`
    } else if (value >= 1e6) {
      return `${currencySymbol}${(value / 1e6).toFixed(2)}M`
    } else {
      return new Intl.NumberFormat(currentMarket === 'indian' ? 'en-IN' : 'en-US', {
        style: 'currency',
        currency: marketConfig.currency,
        minimumFractionDigits: 2,
      }).format(value)
    }
  }

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat(currentMarket === 'indian' ? 'en-IN' : 'en-US').format(value)
  }

  // Helper function to display data with fallback to "-" when not available
  const displayValue = (value: any, formatter?: (val: any) => string) => {
    if (value === null || value === undefined || value === 0 || value === '' || value === 'N/A') {
      return '-'
    }
    return formatter ? formatter(value) : value.toString()
  }

  const displayCurrency = (value: number) => displayValue(value, formatCurrency)
  const displayNumber = (value: number) => displayValue(value, formatNumber)
  const displayPercent = (value: number) => displayValue(value, (val) => `${val.toFixed(2)}%`)

  const toggleWatchlist = () => {
    if (isInWatchlist) {
      dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: state.selectedStock })
    } else {
      dispatch({
        type: 'ADD_TO_WATCHLIST',
        payload: {
          symbol: stockInfo.symbol,
          name: stockInfo.name,
          price: stockInfo.price,
          change: stockInfo.change,
          changePercent: stockInfo.changePercent,
        },
      })
    }
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Info },
    { id: 'financials', label: 'Financials', icon: DollarSign },
    { id: 'analysis', label: 'Analysis', icon: BarChart3 },
  ]

  return (
    <div className="glass-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-4">
          <div>
            <h2 className="text-2xl font-bold text-white">{stockInfo.symbol}</h2>
            <p className="text-gray-400">{stockInfo.name}</p>
          </div>
          <div className="text-right">
            <p className="text-2xl font-bold text-white">{formatCurrency(stockInfo.price)}</p>
            <p className={`text-sm ${stockInfo.change >= 0 ? 'text-green-400' : 'text-red-400'}`}>
              {stockInfo.change >= 0 ? '+' : ''}{formatCurrency(stockInfo.change)} 
              ({stockInfo.changePercent >= 0 ? '+' : ''}{stockInfo.changePercent.toFixed(2)}%)
            </p>
          </div>
        </div>

        <button
          onClick={toggleWatchlist}
          className={`p-3 rounded-lg transition-all ${
            isInWatchlist
              ? 'bg-yellow-500 text-white hover:bg-yellow-600'
              : 'glass text-gray-400 hover:text-yellow-400 hover:bg-white/10'
          }`}
        >
          <Star className={`h-5 w-5 ${isInWatchlist ? 'fill-current' : ''}`} />
        </button>
      </div>

      {/* Tabs */}
      <div className="flex space-x-1 mb-6 bg-white/5 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-2 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span>{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Market Cap</p>
              <p className="text-lg font-bold text-white">{displayCurrency(stockInfo.marketCap)}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">P/E Ratio</p>
              <p className="text-lg font-bold text-white">{displayValue(stockInfo.pe, (val) => val.toFixed(2))}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">EPS</p>
              <p className="text-lg font-bold text-white">{displayValue(stockInfo.eps, (val) => `${marketConfig.currencySymbol}${val.toFixed(2)}`)}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Dividend Yield</p>
              <p className="text-lg font-bold text-white">{displayPercent(stockInfo.dividendYield)}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Beta</p>
              <p className="text-lg font-bold text-white">{displayValue(stockInfo.beta, (val) => val.toFixed(2))}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">52W High</p>
              <p className="text-lg font-bold text-white">{displayCurrency(stockInfo.high52Week)}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">52W Low</p>
              <p className="text-lg font-bold text-white">{displayCurrency(stockInfo.low52Week)}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Volume</p>
              <p className="text-lg font-bold text-white">{displayNumber(stockInfo.volume)}</p>
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="text-center py-8">
            <div className="text-gray-400">
              <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
              <h3 className="text-lg font-medium">Financial Data Coming Soon</h3>
              <p className="text-sm mt-2">
                Detailed financial information will be available once comprehensive API integration is complete.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="text-center p-4 glass rounded-lg">
                <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400 mb-1">Analyst Rating</p>
                <p className="text-lg font-bold text-green-400">BUY</p>
              </div>
              <div className="text-center p-4 glass rounded-lg">
                <DollarSign className="h-8 w-8 text-blue-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400 mb-1">Price Target</p>
                <p className="text-lg font-bold text-blue-400">{formatCurrency(165.00)}</p>
              </div>
              <div className="text-center p-4 glass rounded-lg">
                <BarChart3 className="h-8 w-8 text-purple-400 mx-auto mb-2" />
                <p className="text-sm text-gray-400 mb-1">Upside Potential</p>
                <p className="text-lg font-bold text-purple-400">+9.8%</p>
              </div>
            </div>

            <div className="glass rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Analyst Recommendations</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Strong Buy</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="w-16 bg-green-500 h-2 rounded-full"></div>
                    </div>
                    <span className="text-white font-medium">8</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Buy</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="w-20 bg-green-400 h-2 rounded-full"></div>
                    </div>
                    <span className="text-white font-medium">5</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Hold</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="w-8 bg-yellow-500 h-2 rounded-full"></div>
                    </div>
                    <span className="text-white font-medium">2</span>
                  </div>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Sell</span>
                  <div className="flex items-center space-x-2">
                    <div className="w-32 bg-gray-700 rounded-full h-2">
                      <div className="w-2 bg-red-500 h-2 rounded-full"></div>
                    </div>
                    <span className="text-white font-medium">0</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </div>
  )
}
