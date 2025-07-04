'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, TrendingUp, Star, Clock } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStock } from '@/contexts/StockContext'
import { useMarket } from '@/contexts/MarketContext'

interface SearchModalProps {
  isOpen: boolean
  onClose: () => void
}

export default function SearchModal({ isOpen, onClose }: SearchModalProps) {
  const { dispatch } = useStock()
  const { currentMarket, marketConfig } = useMarket()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<any[]>([])
  const [recentSearches, setRecentSearches] = useState(
    currentMarket === 'indian'
      ? ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK']
      : ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']
  )
  const inputRef = useRef<HTMLInputElement>(null)

  const worldPopularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', price: 150.25, change: 1.66 },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', price: 2800.50, change: -0.54 },
    { symbol: 'MSFT', name: 'Microsoft Corp.', price: 330.75, change: 1.60 },
    { symbol: 'TSLA', name: 'Tesla Inc.', price: 800.00, change: -1.54 },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', price: 3245.89, change: 0.80 },
    { symbol: 'NVDA', name: 'NVIDIA Corp.', price: 450.23, change: 4.27 },
    { symbol: 'META', name: 'Meta Platforms Inc.', price: 325.67, change: -2.66 },
    { symbol: 'NFLX', name: 'Netflix Inc.', price: 425.30, change: 3.10 },
  ]

  const indianPopularStocks = [
    { symbol: 'RELIANCE', name: 'Reliance Industries Ltd.', price: 2456.75, change: 1.88 },
    { symbol: 'TCS', name: 'Tata Consultancy Services', price: 3567.20, change: -0.65 },
    { symbol: 'HDFCBANK', name: 'HDFC Bank Limited', price: 1634.50, change: 1.79 },
    { symbol: 'INFY', name: 'Infosys Limited', price: 1456.80, change: 1.08 },
    { symbol: 'HINDUNILVR', name: 'Hindustan Unilever Ltd.', price: 2789.45, change: -0.44 },
    { symbol: 'ICICIBANK', name: 'ICICI Bank Limited', price: 945.60, change: 2.04 },
    { symbol: 'KOTAKBANK', name: 'Kotak Mahindra Bank', price: 1876.25, change: -0.46 },
    { symbol: 'BHARTIARTL', name: 'Bharti Airtel Limited', price: 867.30, change: 1.46 },
  ]

  const popularStocks = currentMarket === 'indian' ? indianPopularStocks : worldPopularStocks

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  useEffect(() => {
    if (query.length > 0) {
      // Simulate search results
      const filtered = popularStocks.filter(
        stock =>
          stock.symbol.toLowerCase().includes(query.toLowerCase()) ||
          stock.name.toLowerCase().includes(query.toLowerCase())
      )
      setResults(filtered)
    } else {
      setResults([])
    }
  }, [query])

  const handleStockSelect = (symbol: string) => {
    dispatch({ type: 'SET_SELECTED_STOCK', payload: symbol })
    
    // Add to recent searches
    const updatedRecent = [symbol, ...recentSearches.filter(s => s !== symbol)].slice(0, 5)
    setRecentSearches(updatedRecent)
    
    onClose()
    setQuery('')
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      onClose()
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50"
            onClick={onClose}
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="fixed top-20 left-1/2 transform -translate-x-1/2 w-full max-w-2xl mx-4 z-50"
          >
            <div className="glass-card">
              {/* Search Input */}
              <div className="flex items-center space-x-4 mb-6">
                <div className="flex-1 relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    onKeyDown={handleKeyDown}
                    placeholder="Search stocks, ETFs, crypto..."
                    className="w-full pl-10 pr-4 py-3 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                  />
                </div>
                <button
                  onClick={onClose}
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              {/* Search Results */}
              {query && results.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-lg font-semibold text-white mb-4">Search Results</h3>
                  <div className="space-y-2 max-h-60 overflow-y-auto">
                    {results.map((stock) => (
                      <motion.button
                        key={stock.symbol}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        onClick={() => handleStockSelect(stock.symbol)}
                        className="w-full flex items-center justify-between p-3 glass rounded-lg hover:bg-white/10 transition-colors text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-blue-400 font-bold text-sm">{stock.symbol.charAt(0)}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-white">{stock.symbol}</h4>
                            <p className="text-sm text-gray-400">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium">{formatCurrency(stock.price)}</p>
                          <p className={`text-sm ${
                            stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                          </p>
                        </div>
                      </motion.button>
                    ))}
                  </div>
                </div>
              )}

              {/* Recent Searches */}
              {!query && recentSearches.length > 0 && (
                <div className="mb-6">
                  <div className="flex items-center space-x-2 mb-4">
                    <Clock className="h-5 w-5 text-gray-400" />
                    <h3 className="text-lg font-semibold text-white">Recent Searches</h3>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {recentSearches.map((symbol) => (
                      <button
                        key={symbol}
                        onClick={() => handleStockSelect(symbol)}
                        className="px-3 py-2 glass rounded-lg text-sm font-medium text-white hover:bg-white/10 transition-colors"
                      >
                        {symbol}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* Popular Stocks */}
              {!query && (
                <div>
                  <div className="flex items-center space-x-2 mb-4">
                    <TrendingUp className="h-5 w-5 text-green-400" />
                    <h3 className="text-lg font-semibold text-white">Popular Stocks</h3>
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                    {popularStocks.map((stock) => (
                      <button
                        key={stock.symbol}
                        onClick={() => handleStockSelect(stock.symbol)}
                        className="flex items-center justify-between p-3 glass rounded-lg hover:bg-white/10 transition-colors text-left"
                      >
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <span className="text-purple-400 font-bold text-xs">{stock.symbol.charAt(0)}</span>
                          </div>
                          <div>
                            <h4 className="font-medium text-white text-sm">{stock.symbol}</h4>
                            <p className="text-xs text-gray-400 truncate">{stock.name}</p>
                          </div>
                        </div>
                        <div className="text-right">
                          <p className="text-white font-medium text-sm">{formatCurrency(stock.price)}</p>
                          <p className={`text-xs ${
                            stock.change >= 0 ? 'text-green-400' : 'text-red-400'
                          }`}>
                            {stock.change >= 0 ? '+' : ''}{stock.change.toFixed(2)}%
                          </p>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {/* No Results */}
              {query && results.length === 0 && (
                <div className="text-center py-8">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-white mb-2">No results found</h3>
                  <p className="text-gray-400">Try searching for a different stock symbol or company name.</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  )
}
