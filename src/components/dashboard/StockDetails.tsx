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

  const getStockInfo = () => {
    if (currentMarket === 'indian') {
      // Indian stock data
      const indianStocks: Record<string, any> = {
        'RELIANCE': {
          symbol: 'RELIANCE',
          name: 'Reliance Industries Limited',
          price: 2456.75,
          change: 45.30,
          changePercent: 1.88,
          marketCap: 16600000000000, // 16.6 Lakh Crores
          pe: 12.8,
          eps: 192.5,
          dividendYield: 0.35,
          beta: 1.15,
          high52Week: 2856.50,
          low52Week: 2220.30,
          volume: 8234567,
          avgVolume: 9345678,
          sharesOutstanding: 6765000000,
        },
        'TCS': {
          symbol: 'TCS',
          name: 'Tata Consultancy Services Limited',
          price: 3567.20,
          change: -23.45,
          changePercent: -0.65,
          marketCap: 13000000000000, // 13 Lakh Crores
          pe: 28.5,
          eps: 125.3,
          dividendYield: 1.2,
          beta: 0.85,
          high52Week: 4150.00,
          low52Week: 3200.00,
          volume: 1234567,
          avgVolume: 1845678,
          sharesOutstanding: 3650000000,
        },
        'HDFCBANK': {
          symbol: 'HDFCBANK',
          name: 'HDFC Bank Limited',
          price: 1634.50,
          change: 28.75,
          changePercent: 1.79,
          marketCap: 12400000000000, // 12.4 Lakh Crores
          pe: 18.2,
          eps: 89.8,
          dividendYield: 1.1,
          beta: 1.05,
          high52Week: 1795.00,
          low52Week: 1363.55,
          volume: 5234567,
          avgVolume: 6345678,
          sharesOutstanding: 7580000000,
        }
      }
      return indianStocks[state.selectedStock] || indianStocks['RELIANCE']
    } else {
      // World stock data
      const worldStocks: Record<string, any> = {
        'AAPL': {
          symbol: 'AAPL',
          name: 'Apple Inc.',
          price: 150.25,
          change: 2.45,
          changePercent: 1.66,
          marketCap: 2450000000000,
          pe: 28.5,
          eps: 5.27,
          dividendYield: 0.52,
          beta: 1.24,
          high52Week: 182.94,
          low52Week: 124.17,
          volume: 45234567,
          avgVolume: 52345678,
          sharesOutstanding: 16300000000,
        },
        'GOOGL': {
          symbol: 'GOOGL',
          name: 'Alphabet Inc.',
          price: 2800.50,
          change: -15.30,
          changePercent: -0.54,
          marketCap: 1750000000000,
          pe: 25.8,
          eps: 108.5,
          dividendYield: 0.0,
          beta: 1.12,
          high52Week: 3030.93,
          low52Week: 2193.62,
          volume: 25234567,
          avgVolume: 28345678,
          sharesOutstanding: 12800000000,
        }
      }
      return worldStocks[state.selectedStock] || worldStocks['AAPL']
    }
  }

  const stockInfo = getStockInfo()

  const financials = {
    revenue: 394328000000,
    grossProfit: 170782000000,
    operatingIncome: 114301000000,
    netIncome: 99803000000,
    totalAssets: 352755000000,
    totalDebt: 123456000000,
    freeCashFlow: 92953000000,
  }

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
              <p className="text-lg font-bold text-white">{formatCurrency(stockInfo.marketCap)}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">P/E Ratio</p>
              <p className="text-lg font-bold text-white">{stockInfo.pe}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">EPS</p>
              <p className="text-lg font-bold text-white">{formatCurrency(stockInfo.eps)}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Dividend Yield</p>
              <p className="text-lg font-bold text-white">{stockInfo.dividendYield}%</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Beta</p>
              <p className="text-lg font-bold text-white">{stockInfo.beta}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">52W High</p>
              <p className="text-lg font-bold text-white">{formatCurrency(stockInfo.high52Week)}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">52W Low</p>
              <p className="text-lg font-bold text-white">{formatCurrency(stockInfo.low52Week)}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Volume</p>
              <p className="text-lg font-bold text-white">{formatNumber(stockInfo.volume)}</p>
            </div>
          </div>
        )}

        {activeTab === 'financials' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Revenue (TTM)</p>
              <p className="text-lg font-bold text-white">{formatCurrency(financials.revenue)}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Gross Profit</p>
              <p className="text-lg font-bold text-white">{formatCurrency(financials.grossProfit)}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Operating Income</p>
              <p className="text-lg font-bold text-white">{formatCurrency(financials.operatingIncome)}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Net Income</p>
              <p className="text-lg font-bold text-white">{formatCurrency(financials.netIncome)}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Total Assets</p>
              <p className="text-lg font-bold text-white">{formatCurrency(financials.totalAssets)}</p>
            </div>
            <div className="glass rounded-lg p-4">
              <p className="text-sm text-gray-400 mb-1">Total Debt</p>
              <p className="text-lg font-bold text-white">{formatCurrency(financials.totalDebt)}</p>
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
