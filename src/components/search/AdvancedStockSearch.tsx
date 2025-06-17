'use client'

import { useState, useEffect, useRef } from 'react'
import { Search, X, TrendingUp, TrendingDown, Star, Plus, Loader2 } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'
import { useStock } from '@/contexts/StockContext'
import { useDebounce } from '@/hooks/useStockData'
import { stockApi } from '@/services/stockApi'
import { SearchResult } from '@/types/stock'
import { formatCurrency, formatPercent, formatLargeNumber } from '@/utils/formatters'

interface AdvancedStockSearchProps {
  onStockSelect?: (symbol: string) => void
  showAnalysis?: boolean
  className?: string
}

export default function AdvancedStockSearch({ 
  onStockSelect, 
  showAnalysis = true,
  className = '' 
}: AdvancedStockSearchProps) {
  const { state, dispatch } = useStock()
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<SearchResult[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [selectedIndex, setSelectedIndex] = useState(-1)
  const [recentSearches, setRecentSearches] = useState<string[]>([])
  
  const inputRef = useRef<HTMLInputElement>(null)
  const resultsRef = useRef<HTMLDivElement>(null)
  const debouncedQuery = useDebounce(query, 300)

  // Popular stocks for suggestions
  const popularStocks = [
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock' as const, exchange: 'NASDAQ', currency: 'USD' },
    { symbol: 'GOOGL', name: 'Alphabet Inc.', type: 'stock' as const, exchange: 'NASDAQ', currency: 'USD' },
    { symbol: 'MSFT', name: 'Microsoft Corporation', type: 'stock' as const, exchange: 'NASDAQ', currency: 'USD' },
    { symbol: 'TSLA', name: 'Tesla, Inc.', type: 'stock' as const, exchange: 'NASDAQ', currency: 'USD' },
    { symbol: 'AMZN', name: 'Amazon.com Inc.', type: 'stock' as const, exchange: 'NASDAQ', currency: 'USD' },
    { symbol: 'NVDA', name: 'NVIDIA Corporation', type: 'stock' as const, exchange: 'NASDAQ', currency: 'USD' },
    { symbol: 'META', name: 'Meta Platforms Inc.', type: 'stock' as const, exchange: 'NASDAQ', currency: 'USD' },
    { symbol: 'NFLX', name: 'Netflix Inc.', type: 'stock' as const, exchange: 'NASDAQ', currency: 'USD' },
  ]

  // Search for stocks
  useEffect(() => {
    const searchStocks = async () => {
      if (!debouncedQuery.trim()) {
        setResults([])
        return
      }

      setIsLoading(true)
      try {
        const searchResults = await stockApi.searchStocks(debouncedQuery)
        setResults(searchResults)
      } catch (error) {
        console.error('Search error:', error)
        setResults([])
      } finally {
        setIsLoading(false)
      }
    }

    searchStocks()
  }, [debouncedQuery])

  // Handle stock selection
  const handleStockSelect = (symbol: string) => {
    dispatch({ type: 'SET_SELECTED_STOCK', payload: symbol })
    
    // Add to recent searches
    const updatedRecent = [symbol, ...recentSearches.filter(s => s !== symbol)].slice(0, 5)
    setRecentSearches(updatedRecent)
    
    // Call callback if provided
    if (onStockSelect) {
      onStockSelect(symbol)
    }
    
    // Clear search and close
    setQuery('')
    setIsOpen(false)
    setSelectedIndex(-1)
  }

  // Handle keyboard navigation
  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (!isOpen) return

    const currentResults = query ? results : popularStocks
    
    switch (e.key) {
      case 'ArrowDown':
        e.preventDefault()
        setSelectedIndex(prev => 
          prev < currentResults.length - 1 ? prev + 1 : prev
        )
        break
      case 'ArrowUp':
        e.preventDefault()
        setSelectedIndex(prev => prev > 0 ? prev - 1 : -1)
        break
      case 'Enter':
        e.preventDefault()
        if (selectedIndex >= 0 && currentResults[selectedIndex]) {
          handleStockSelect(currentResults[selectedIndex].symbol)
        }
        break
      case 'Escape':
        setIsOpen(false)
        setSelectedIndex(-1)
        break
    }
  }

  // Add to watchlist
  const addToWatchlist = (stock: SearchResult, e: React.MouseEvent) => {
    e.stopPropagation()
    
    // Check if already in watchlist
    const isInWatchlist = state.watchlist.some(item => item.symbol === stock.symbol)
    if (isInWatchlist) return

    dispatch({
      type: 'ADD_TO_WATCHLIST',
      payload: {
        symbol: stock.symbol,
        name: stock.name,
        price: 0, // Will be updated with real data
        change: 0,
        changePercent: 0,
        addedAt: Date.now(),
      },
    })
  }

  const displayResults = query ? results : popularStocks

  return (
    <div className={`relative ${className}`}>
      {/* Search Input */}
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <Search className="h-5 w-5 text-gray-400" />
        </div>
        
        <input
          ref={inputRef}
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => setIsOpen(true)}
          onKeyDown={handleKeyDown}
          placeholder="Search stocks, ETFs, crypto..."
          className="w-full pl-10 pr-10 py-3 glass rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
        />
        
        {/* Loading indicator */}
        {isLoading && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <Loader2 className="h-5 w-5 text-gray-400 animate-spin" />
          </div>
        )}
        
        {/* Clear button */}
        {query && !isLoading && (
          <button
            onClick={() => {
              setQuery('')
              setResults([])
              inputRef.current?.focus()
            }}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <X className="h-5 w-5" />
          </button>
        )}
      </div>

      {/* Search Results Dropdown */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            ref={resultsRef}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="absolute top-full left-0 right-0 mt-2 glass rounded-lg border border-white/10 shadow-2xl z-50 max-h-96 overflow-y-auto"
          >
            {/* Header */}
            <div className="p-4 border-b border-white/10">
              <h3 className="text-sm font-medium text-gray-400">
                {query ? `Search Results for "${query}"` : 'Popular Stocks'}
              </h3>
            </div>

            {/* Results */}
            <div className="py-2">
              {displayResults.length > 0 ? (
                displayResults.map((stock, index) => {
                  const isSelected = index === selectedIndex
                  const isInWatchlist = state.watchlist.some(item => item.symbol === stock.symbol)
                  
                  return (
                    <motion.div
                      key={stock.symbol}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className={`flex items-center justify-between px-4 py-3 cursor-pointer transition-colors ${
                        isSelected ? 'bg-blue-500/20' : 'hover:bg-white/5'
                      }`}
                      onClick={() => handleStockSelect(stock.symbol)}
                    >
                      <div className="flex items-center space-x-3 flex-1">
                        {/* Stock Icon */}
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-lg flex items-center justify-center">
                          <span className="text-white font-bold text-sm">
                            {stock.symbol.charAt(0)}
                          </span>
                        </div>
                        
                        {/* Stock Info */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center space-x-2">
                            <h4 className="font-medium text-white">{stock.symbol}</h4>
                            <span className="text-xs px-2 py-1 bg-gray-700 rounded text-gray-300">
                              {stock.type.toUpperCase()}
                            </span>
                          </div>
                          <p className="text-sm text-gray-400 truncate">{stock.name}</p>
                          <p className="text-xs text-gray-500">{stock.exchange}</p>
                        </div>
                      </div>
                      
                      {/* Actions */}
                      <div className="flex items-center space-x-2">
                        <button
                          onClick={(e) => addToWatchlist(stock, e)}
                          className={`p-2 rounded-lg transition-colors ${
                            isInWatchlist
                              ? 'text-yellow-400 bg-yellow-400/20'
                              : 'text-gray-400 hover:text-yellow-400 hover:bg-yellow-400/10'
                          }`}
                          title={isInWatchlist ? 'In Watchlist' : 'Add to Watchlist'}
                        >
                          {isInWatchlist ? <Star className="h-4 w-4 fill-current" /> : <Plus className="h-4 w-4" />}
                        </button>
                      </div>
                    </motion.div>
                  )
                })
              ) : (
                <div className="px-4 py-8 text-center">
                  <Search className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                  <h3 className="text-lg font-medium text-white mb-2">No results found</h3>
                  <p className="text-gray-400">
                    Try searching for a different stock symbol or company name.
                  </p>
                </div>
              )}
            </div>

            {/* Recent Searches */}
            {!query && recentSearches.length > 0 && (
              <div className="border-t border-white/10 p-4">
                <h4 className="text-sm font-medium text-gray-400 mb-3">Recent Searches</h4>
                <div className="flex flex-wrap gap-2">
                  {recentSearches.map((symbol) => (
                    <button
                      key={symbol}
                      onClick={() => handleStockSelect(symbol)}
                      className="px-3 py-1 bg-gray-700/50 rounded-full text-sm text-gray-300 hover:bg-gray-600/50 transition-colors"
                    >
                      {symbol}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Click outside to close */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsOpen(false)}
        />
      )}
    </div>
  )
}
