'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { ArrowLeft, Brain, Search } from 'lucide-react'
import { useStock, StockProvider } from '@/contexts/StockContext'
import { useGlobalStock } from '@/contexts/GlobalStockContext'
import StockSelector from '@/components/stock/StockSelector'
import AdvancedStockSearch from '@/components/search/AdvancedStockSearch'
import PredictionInterface from '@/components/prediction/PredictionInterface'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

function PredictionsPageContent() {
  const { state } = useStock()
  const { state: globalState } = useGlobalStock()
  const [showSearch, setShowSearch] = useState(false)

  // Use the globally selected stock
  const selectedStock = globalState.selectedStock
  const selectedStockData = globalState.selectedStockData

  const handleStockSelect = (symbol: string) => {
    setShowSearch(false)
    // The global context will handle the stock selection
  }

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <header className="glass border-b border-white/10 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.history.back()}
                  className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                
                <div className="flex items-center space-x-3">
                  <Brain className="h-8 w-8 text-purple-400" />
                  <div>
                    <h1 className="text-xl font-bold text-white">AI Predictions</h1>
                    <p className="text-sm text-gray-400">Advanced stock price forecasting</p>
                  </div>
                </div>
              </div>

              {/* Search Toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center space-x-2 px-4 py-2 glass rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Search className="h-5 w-5" />
                <span className="hidden sm:block">Search Stocks</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Stock Selector */}
          <div className="mb-6">
            <div className="glass-card">
              <div className="p-4 border-b border-white/10">
                <h2 className="text-lg font-semibold text-white mb-2">Select Stock for Prediction</h2>
                <p className="text-sm text-gray-400">Choose a stock to generate AI-powered price predictions</p>
              </div>
              <div className="p-4">
                <StockSelector showRefresh={true} />
              </div>
            </div>
          </div>

          {/* Search Section */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: showSearch ? 'auto' : 0, 
              opacity: showSearch ? 1 : 0 
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            {showSearch && (
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="glass-card"
              >
                <h2 className="text-lg font-semibold text-white mb-4">Search & Select Stock</h2>
                <AdvancedStockSearch
                  onStockSelect={handleStockSelect}
                  className="max-w-2xl"
                />
              </motion.div>
            )}
          </motion.div>

          {/* Prediction Interface */}
          <motion.div
            key={selectedStock}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <PredictionInterface symbol={selectedStock} />
          </motion.div>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default function PredictionsPage() {
  return (
    <StockProvider>
      <PredictionsPageContent />
    </StockProvider>
  )
}
