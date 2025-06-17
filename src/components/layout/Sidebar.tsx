'use client'

import { X, Star, Briefcase, TrendingUp, TrendingDown, Activity } from 'lucide-react'
import { useStock } from '@/contexts/StockContext'
import { motion, AnimatePresence } from 'framer-motion'

interface SidebarProps {
  isOpen: boolean
  onClose: () => void
}

export default function Sidebar({ isOpen, onClose }: SidebarProps) {
  const { state, dispatch } = useStock()

  const handleStockSelect = (symbol: string) => {
    dispatch({ type: 'SET_SELECTED_STOCK', payload: symbol })
    onClose()
  }

  const removeFromWatchlist = (symbol: string) => {
    dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: symbol })
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  return (
    <>
      {/* Overlay */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
            onClick={onClose}
          />
        )}
      </AnimatePresence>

      {/* Sidebar */}
      <AnimatePresence>
        {isOpen && (
          <motion.aside
            initial={{ x: -320 }}
            animate={{ x: 0 }}
            exit={{ x: -320 }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed left-0 top-0 h-full w-80 glass border-r border-white/10 z-50 lg:relative lg:translate-x-0"
          >
            <div className="flex flex-col h-full">
              {/* Header */}
              <div className="flex items-center justify-between p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white">Portfolio & Watchlist</h2>
                <button
                  onClick={onClose}
                  className="lg:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto">
                {/* Portfolio Section */}
                <div className="p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Briefcase className="h-5 w-5 text-blue-400" />
                    <h3 className="font-semibold text-white">Portfolio</h3>
                  </div>
                  
                  <div className="space-y-3">
                    {state.portfolio.map((item) => (
                      <motion.div
                        key={item.symbol}
                        whileHover={{ scale: 1.02 }}
                        className="glass-card p-3 cursor-pointer hover:bg-white/5 transition-colors"
                        onClick={() => handleStockSelect(item.symbol)}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <div>
                            <h4 className="font-medium text-white">{item.symbol}</h4>
                            <p className="text-xs text-gray-400">{item.shares} shares</p>
                          </div>
                          <div className="text-right">
                            <p className="text-sm font-medium text-white">
                              {formatCurrency(item.totalValue)}
                            </p>
                            <p className={`text-xs ${
                              item.gainLoss >= 0 ? 'text-green-400' : 'text-red-400'
                            }`}>
                              {formatCurrency(item.gainLoss)} ({formatPercent(item.gainLossPercent)})
                            </p>
                          </div>
                        </div>
                        
                        <div className="flex items-center justify-between text-xs text-gray-400">
                          <span>Avg: {formatCurrency(item.avgPrice)}</span>
                          <span>Current: {formatCurrency(item.currentPrice)}</span>
                        </div>
                      </motion.div>
                    ))}
                  </div>

                  {/* Portfolio Summary */}
                  <div className="mt-4 p-3 bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg border border-blue-500/20">
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-300">Total Value</span>
                      <span className="font-semibold text-white">
                        {formatCurrency(state.portfolio.reduce((sum, item) => sum + item.totalValue, 0))}
                      </span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span className="text-sm text-gray-300">Total Gain/Loss</span>
                      <span className={`font-semibold ${
                        state.portfolio.reduce((sum, item) => sum + item.gainLoss, 0) >= 0 
                          ? 'text-green-400' 
                          : 'text-red-400'
                      }`}>
                        {formatCurrency(state.portfolio.reduce((sum, item) => sum + item.gainLoss, 0))}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Watchlist Section */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center space-x-2 mb-4">
                    <Star className="h-5 w-5 text-yellow-400" />
                    <h3 className="font-semibold text-white">Watchlist</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {state.watchlist.map((item) => (
                      <motion.div
                        key={item.symbol}
                        whileHover={{ scale: 1.02 }}
                        className="flex items-center justify-between p-3 glass rounded-lg cursor-pointer hover:bg-white/5 transition-colors group"
                        onClick={() => handleStockSelect(item.symbol)}
                      >
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <h4 className="font-medium text-white">{item.symbol}</h4>
                            <button
                              onClick={(e) => {
                                e.stopPropagation()
                                removeFromWatchlist(item.symbol)
                              }}
                              className="opacity-0 group-hover:opacity-100 p-1 rounded text-gray-400 hover:text-red-400 transition-all"
                            >
                              <X className="h-4 w-4" />
                            </button>
                          </div>
                          <p className="text-xs text-gray-400 truncate">{item.name}</p>
                        </div>
                        
                        <div className="text-right ml-3">
                          <p className="text-sm font-medium text-white">
                            {formatCurrency(item.price)}
                          </p>
                          <div className={`flex items-center text-xs ${
                            item.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {item.change >= 0 ? (
                              <TrendingUp className="h-3 w-3 mr-1" />
                            ) : (
                              <TrendingDown className="h-3 w-3 mr-1" />
                            )}
                            {formatPercent(item.changePercent)}
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>

                {/* Market Movers */}
                <div className="p-4 border-t border-white/10">
                  <div className="flex items-center space-x-2 mb-4">
                    <Activity className="h-5 w-5 text-green-400" />
                    <h3 className="font-semibold text-white">Top Movers</h3>
                  </div>
                  
                  <div className="space-y-2">
                    {[
                      { symbol: 'NVDA', change: 8.45, price: 450.23 },
                      { symbol: 'AMD', change: -3.21, price: 95.67 },
                      { symbol: 'AMZN', change: 2.15, price: 3245.89 },
                    ].map((item) => (
                      <div
                        key={item.symbol}
                        className="flex items-center justify-between p-2 rounded-lg hover:bg-white/5 transition-colors cursor-pointer"
                        onClick={() => handleStockSelect(item.symbol)}
                      >
                        <span className="font-medium text-white">{item.symbol}</span>
                        <div className="text-right">
                          <p className="text-sm text-white">{formatCurrency(item.price)}</p>
                          <p className={`text-xs ${
                            item.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {formatPercent(item.change)}
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
    </>
  )
}
