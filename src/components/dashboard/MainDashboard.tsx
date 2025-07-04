'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { TrendingUp, TrendingDown, BarChart3, Activity, RefreshCw, AlertCircle } from 'lucide-react'
import StockSelector from '@/components/stock/StockSelector'
import StockChart from '@/components/dashboard/StockChart'
import MarketOverview from '@/components/dashboard/MarketOverview'
import { useGlobalStock } from '@/contexts/GlobalStockContext'
import { useMarket } from '@/contexts/MarketContext'

export default function MainDashboard() {
  const { state } = useGlobalStock()
  const { currentMarket } = useMarket()
  const [activeTab, setActiveTab] = useState<'overview' | 'chart' | 'details'>('overview')

  const formatCurrency = (value: number) => {
    if (value === 0) return '-'
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatNumber = (value: number) => {
    if (value === 0) return '-'
    return new Intl.NumberFormat('en-US').format(value)
  }

  const displayValue = (value: any, formatter?: (val: any) => string) => {
    if (value === null || value === undefined || value === 0 || value === '' || value === 'N/A') {
      return '-'
    }
    return formatter ? formatter(value) : value.toString()
  }

  const tabs = [
    { id: 'overview', label: 'Market Overview', icon: Activity },
    { id: 'chart', label: 'Stock Chart', icon: BarChart3 },
    { id: 'details', label: 'Stock Details', icon: TrendingUp }
  ]

  return (
    <div className="p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2">Stock Dashboard</h1>
          <p className="text-gray-400">
            Real-time stock data and market analysis • {currentMarket === 'indian' ? 'Indian Markets' : 'Global Markets'}
          </p>
        </div>
      </div>

      {/* Stock Selector */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <StockSelector className="w-full" />
        </div>
        
        {/* Quick Stats */}
        {state.selectedStockData && (
          <div className="glass rounded-lg p-4">
            <h3 className="text-sm font-medium text-gray-400 mb-3">Quick Stats</h3>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-gray-400">Market Cap</span>
                <span className="text-white">{displayValue(state.selectedStockData.marketCap, formatCurrency)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Volume</span>
                <span className="text-white">{displayValue(state.selectedStockData.volume, formatNumber)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">P/E Ratio</span>
                <span className="text-white">{displayValue(state.selectedStockData.pe, (val) => val.toFixed(2))}</span>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Error State */}
      {state.error && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass rounded-lg p-4 border-l-4 border-red-500"
        >
          <div className="flex items-center space-x-3">
            <AlertCircle className="h-5 w-5 text-red-400" />
            <div>
              <h3 className="text-red-400 font-medium">Error Loading Stock Data</h3>
              <p className="text-gray-400 text-sm mt-1">{state.error}</p>
            </div>
          </div>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${
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
        className="min-h-[400px]"
      >
        {activeTab === 'overview' && <MarketOverview />}
        
        {activeTab === 'chart' && (
          <div className="glass rounded-lg p-6">
            {state.selectedStockData ? (
              <StockChart />
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-400">
                  <BarChart3 className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a stock to view chart</p>
                </div>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'details' && (
          <div className="glass rounded-lg p-6">
            {state.selectedStockData ? (
              <div className="space-y-6">
                {/* Stock Header */}
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-2xl font-bold text-white">{state.selectedStock}</h2>
                    <p className="text-gray-400">{state.selectedStockData.name}</p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold text-white">
                      {formatCurrency(state.selectedStockData.price)}
                    </div>
                    <div className={`flex items-center space-x-2 ${
                      state.selectedStockData.change >= 0 ? 'text-green-400' : 'text-red-400'
                    }`}>
                      {state.selectedStockData.change >= 0 ? (
                        <TrendingUp className="h-4 w-4" />
                      ) : (
                        <TrendingDown className="h-4 w-4" />
                      )}
                      <span>
                        {state.selectedStockData.change >= 0 ? '+' : ''}{state.selectedStockData.change.toFixed(2)}
                      </span>
                      <span>
                        ({state.selectedStockData.change >= 0 ? '+' : ''}{state.selectedStockData.changePercent.toFixed(2)}%)
                      </span>
                    </div>
                  </div>
                </div>

                {/* Detailed Metrics */}
                <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Market Cap</p>
                    <p className="text-lg font-bold text-white">{displayValue(state.selectedStockData.marketCap, formatCurrency)}</p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">P/E Ratio</p>
                    <p className="text-lg font-bold text-white">{displayValue(state.selectedStockData.pe, (val) => val.toFixed(2))}</p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">EPS</p>
                    <p className="text-lg font-bold text-white">{displayValue(state.selectedStockData.eps, (val) => `$${val.toFixed(2)}`)}</p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Dividend Yield</p>
                    <p className="text-lg font-bold text-white">{displayValue(state.selectedStockData.dividendYield, (val) => `${val.toFixed(2)}%`)}</p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Beta</p>
                    <p className="text-lg font-bold text-white">{displayValue(state.selectedStockData.beta, (val) => val.toFixed(2))}</p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">52W High</p>
                    <p className="text-lg font-bold text-white">{displayValue(state.selectedStockData.high52Week, formatCurrency)}</p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">52W Low</p>
                    <p className="text-lg font-bold text-white">{displayValue(state.selectedStockData.low52Week, formatCurrency)}</p>
                  </div>
                  <div className="glass rounded-lg p-4">
                    <p className="text-sm text-gray-400 mb-1">Volume</p>
                    <p className="text-lg font-bold text-white">{displayValue(state.selectedStockData.volume, formatNumber)}</p>
                  </div>
                </div>

                {/* Last Updated */}
                {state.lastUpdated > 0 && (
                  <div className="text-center text-sm text-gray-400">
                    Last updated: {new Date(state.lastUpdated).toLocaleTimeString()}
                  </div>
                )}
              </div>
            ) : (
              <div className="flex items-center justify-center h-64">
                <div className="text-center text-gray-400">
                  <TrendingUp className="h-12 w-12 mx-auto mb-2 opacity-50" />
                  <p>Select a stock to view details</p>
                </div>
              </div>
            )}
          </div>
        )}
      </motion.div>
    </div>
  )
}
