'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Search, TrendingUp, TrendingDown, X, Star, RefreshCw } from 'lucide-react'
import { useGlobalStock } from '@/contexts/GlobalStockContext'
import { stockApi } from '@/services/stockApi'
import { SearchResult } from '@/types/stock'

interface StockSelectorProps {
  className?: string
  showRefresh?: boolean
}

export default function StockSelector({ className = '', showRefresh = true }: StockSelectorProps) {
  const { state, selectStock, refreshCurrentStock } = useGlobalStock()
  const [isOpen, setIsOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<SearchResult[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [isRefreshing, setIsRefreshing] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  // Popular stocks for quick selection
  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.' },
    { symbol: 'MSFT', name: 'Microsoft Corp.' },
    { symbol: 'TSLA', name: 'Tesla Inc.' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.' },
    { symbol: 'NVDA', name: 'NVIDIA Corp.' },
    { symbol: 'META', name: 'Meta Platforms' },
    { symbol: 'RELIANCE.NS', name: 'Reliance Industries' },
    { symbol: 'TCS.NS', name: 'Tata Consultancy Services' },
    { symbol: 'HDFCBANK.NS', name: 'HDFC Bank' }
  ]

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsOpen(false)
      }
    }

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside)
      return () => document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [isOpen])

  // Search for stocks
  useEffect(() => {
    if (searchQuery.length < 2) {
      setSearchResults([])
      return
    }

    const searchStocks = async () => {
      setIsSearching(true)
      try {
        const results = await stockApi.searchStocks(searchQuery)
        setSearchResults(results.slice(0, 10)) // Limit to 10 results
      } catch (error) {
        console.error('Search failed:', error)
        setSearchResults([])
      } finally {
        setIsSearching(false)
      }
    }

    const debounceTimer = setTimeout(searchStocks, 300)
    return () => clearTimeout(debounceTimer)
  }, [searchQuery])

  const handleStockSelect = async (symbol: string) => {
    setIsOpen(false)
    setSearchQuery('')
    setSearchResults([])
    await selectStock(symbol)
  }

  const handleRefresh = async () => {
    setIsRefreshing(true)
    await refreshCurrentStock()
    setIsRefreshing(false)
  }

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(price)
  }

  const formatChange = (change: number, changePercent: number) => {
    const isPositive = change >= 0
    return (
      <span className={`flex items-center space-x-1 ${isPositive ? 'text-green-400' : 'text-red-400'}`}>
        {isPositive ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
        <span>{isPositive ? '+' : ''}{change.toFixed(2)}</span>
        <span>({isPositive ? '+' : ''}{changePercent.toFixed(2)}%)</span>
      </span>
    )
  }

  return (
    <div className={`relative ${className}`} ref={searchRef}>
      {/* Current Stock Display */}
      <div 
        onClick={() => setIsOpen(!isOpen)}
        className="flex items-center justify-between p-4 glass rounded-lg cursor-pointer hover:bg-white/10 transition-colors"
      >
        <div className="flex-1">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-bold text-white">{state.selectedStock}</h3>
              {state.selectedStockData && (
                <p className="text-sm text-gray-400">{state.selectedStockData.name}</p>
              )}
            </div>
            
            {state.selectedStockData && (
              <div className="text-right">
                <div className="text-xl font-bold text-white">
                  {formatPrice(state.selectedStockData.price)}
                </div>
                <div className="text-sm">
                  {formatChange(state.selectedStockData.change, state.selectedStockData.changePercent)}
                </div>
              </div>
            )}
          </div>
          
          {state.isLoading && (
            <div className="mt-2 text-sm text-blue-400">Loading...</div>
          )}
          
          {state.error && (
            <div className="mt-2 text-sm text-red-400">{state.error}</div>
          )}
        </div>

        <div className="flex items-center space-x-2 ml-4">
          {showRefresh && (
            <button
              onClick={(e) => {
                e.stopPropagation()
                handleRefresh()
              }}
              disabled={isRefreshing || state.isLoading}
              className="p-2 rounded-lg glass hover:bg-white/10 transition-colors disabled:opacity-50"
              title="Refresh Data"
            >
              <RefreshCw className={`h-4 w-4 text-gray-400 ${isRefreshing ? 'animate-spin' : ''}`} />
            </button>
          )}
          
          <Search className="h-5 w-5 text-gray-400" />
        </div>
      </div>

      {/* Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass rounded-lg border border-white/10 z-50 max-h-96 overflow-hidden"
          >
            {/* Search Input */}
            <div className="p-4 border-b border-white/10">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search stocks..."
                  className="w-full pl-10 pr-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
                  >
                    <X className="h-4 w-4" />
                  </button>
                )}
              </div>
            </div>

            {/* Results */}
            <div className="max-h-64 overflow-y-auto">
              {isSearching ? (
                <div className="p-4 text-center text-gray-400">Searching...</div>
              ) : searchQuery.length >= 2 ? (
                searchResults.length > 0 ? (
                  searchResults.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleStockSelect(stock.symbol)}
                      className="w-full p-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{stock.symbol}</div>
                          <div className="text-sm text-gray-400">{stock.name}</div>
                        </div>
                        <div className="text-xs text-gray-500">{stock.exchange}</div>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-gray-400">No results found</div>
                )
              ) : (
                <>
                  <div className="p-3 text-sm font-medium text-gray-400 border-b border-white/10">
                    Popular Stocks
                  </div>
                  {popularStocks.map((stock) => (
                    <button
                      key={stock.symbol}
                      onClick={() => handleStockSelect(stock.symbol)}
                      className="w-full p-3 text-left hover:bg-white/5 transition-colors border-b border-white/5 last:border-b-0"
                    >
                      <div className="flex items-center justify-between">
                        <div>
                          <div className="font-medium text-white">{stock.symbol}</div>
                          <div className="text-sm text-gray-400">{stock.name}</div>
                        </div>
                        {stock.symbol === state.selectedStock && (
                          <Star className="h-4 w-4 text-yellow-400 fill-current" />
                        )}
                      </div>
                    </button>
                  ))}
                </>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
