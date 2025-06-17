'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Brain, 
  TrendingUp, 
  TrendingDown, 
  Target, 
  BarChart3, 
  Download,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  Zap
} from 'lucide-react'
import { useStock } from '@/contexts/StockContext'
import { useStockData } from '@/hooks/useStockData'
import { PredictionData } from '@/types/stock'
import PredictionTimeline from './PredictionTimeline'
import AccuracyMeter from './AccuracyMeter'
import FactorAnalysis from './FactorAnalysis'
import ConfidenceLevels from './ConfidenceLevels'
import AnalystComparison from './AnalystComparison'
import RiskRewardCalculator from './RiskRewardCalculator'
import ScenarioAnalysis from './ScenarioAnalysis'
import PredictionAdjustment from './PredictionAdjustment'
import ModelPerformance from './ModelPerformance'
import PredictionExport from './PredictionExport'
import { formatCurrency, formatPercent } from '@/utils/formatters'

interface PredictionInterfaceProps {
  symbol: string
  className?: string
}

export default function PredictionInterface({ symbol, className = '' }: PredictionInterfaceProps) {
  const { state } = useStock()
  const { predictions, loading, error } = useStockData(symbol)
  const [selectedTimeframe, setSelectedTimeframe] = useState<'1d' | '1w' | '1m' | '3m'>('1w')
  const [isRefreshing, setIsRefreshing] = useState(false)
  const [showAdjustment, setShowAdjustment] = useState(false)
  const [adjustedPredictions, setAdjustedPredictions] = useState<PredictionData | null>(null)

  // Use adjusted predictions if available, otherwise use original
  const displayPredictions = adjustedPredictions || predictions

  const handleRefresh = async () => {
    setIsRefreshing(true)
    // Simulate refresh delay
    await new Promise(resolve => setTimeout(resolve, 2000))
    setIsRefreshing(false)
  }

  const handleAdjustmentChange = (adjustedData: PredictionData) => {
    setAdjustedPredictions(adjustedData)
  }

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="glass-card">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-gray-700/50 rounded w-1/3"></div>
            <div className="h-64 bg-gray-700/50 rounded"></div>
            <div className="grid grid-cols-3 gap-4">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-20 bg-gray-700/50 rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (error || !displayPredictions) {
    return (
      <div className={`glass-card text-center ${className}`}>
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Prediction Error</h3>
        <p className="text-gray-400 mb-4">{error || 'Unable to load prediction data'}</p>
        <button
          onClick={handleRefresh}
          className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
        >
          Try Again
        </button>
      </div>
    )
  }

  const selectedPrediction = displayPredictions.predictions.find(p => p.timeframe === selectedTimeframe)
  const currentPrice = displayPredictions.currentPrice

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Title and Status */}
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-blue-600 rounded-xl flex items-center justify-center">
              <Brain className="h-6 w-6 text-white" />
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-white">AI Prediction Engine</h1>
              <div className="flex items-center space-x-4 mt-1">
                <span className="text-sm text-gray-400">{symbol}</span>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Model Active</span>
                </div>
                <span className="text-sm text-gray-400">
                  Updated: {new Date(displayPredictions.lastUpdated).toLocaleTimeString()}
                </span>
              </div>
            </div>
          </div>

          {/* Controls */}
          <div className="flex items-center space-x-3">
            <button
              onClick={() => setShowAdjustment(!showAdjustment)}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg transition-colors ${
                showAdjustment 
                  ? 'bg-purple-500 text-white' 
                  : 'glass text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:block">Adjust</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="flex items-center space-x-2 px-4 py-2 glass rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              <span className="hidden sm:block">Refresh</span>
            </button>

            <PredictionExport 
              symbol={symbol} 
              predictions={displayPredictions}
              className="flex items-center space-x-2 px-4 py-2 glass rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
            />
          </div>
        </div>

        {/* Quick Stats */}
        {selectedPrediction && (
          <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6 pt-6 border-t border-white/10">
            <div className="text-center">
              <p className="text-sm text-gray-400">Current Price</p>
              <p className="text-lg font-bold text-white">{formatCurrency(currentPrice)}</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Predicted ({selectedTimeframe})</p>
              <p className={`text-lg font-bold ${
                selectedPrediction.direction === 'up' ? 'text-green-400' : 
                selectedPrediction.direction === 'down' ? 'text-red-400' : 'text-yellow-400'
              }`}>
                {formatCurrency(selectedPrediction.predictedPrice)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Expected Change</p>
              <p className={`text-lg font-bold ${
                selectedPrediction.change >= 0 ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatPercent(selectedPrediction.changePercent)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Confidence</p>
              <p className="text-lg font-bold text-blue-400">{selectedPrediction.confidence.toFixed(1)}%</p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Model Accuracy</p>
              <p className="text-lg font-bold text-purple-400">{displayPredictions.accuracy.toFixed(1)}%</p>
            </div>
          </div>
        )}
      </motion.div>

      {/* Timeframe Selector */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="flex space-x-1 glass rounded-lg p-1"
      >
        {displayPredictions.predictions.map((prediction) => (
          <button
            key={prediction.timeframe}
            onClick={() => setSelectedTimeframe(prediction.timeframe as any)}
            className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${
              selectedTimeframe === prediction.timeframe
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            <Clock className="h-4 w-4" />
            <span>{prediction.timeframe.toUpperCase()}</span>
            <div className={`flex items-center space-x-1 ${
              prediction.direction === 'up' ? 'text-green-400' : 
              prediction.direction === 'down' ? 'text-red-400' : 'text-yellow-400'
            }`}>
              {prediction.direction === 'up' ? (
                <TrendingUp className="h-3 w-3" />
              ) : prediction.direction === 'down' ? (
                <TrendingDown className="h-3 w-3" />
              ) : (
                <Target className="h-3 w-3" />
              )}
              <span className="text-xs">{prediction.confidence.toFixed(0)}%</span>
            </div>
          </button>
        ))}
      </motion.div>

      {/* Prediction Adjustment Panel */}
      <AnimatePresence>
        {showAdjustment && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden"
          >
            <PredictionAdjustment
              symbol={symbol}
              originalPredictions={predictions!}
              onAdjustmentChange={handleAdjustmentChange}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Timeline and Performance */}
        <div className="xl:col-span-2 space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <PredictionTimeline 
              predictions={displayPredictions}
              selectedTimeframe={selectedTimeframe}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <ModelPerformance 
              predictions={displayPredictions}
              symbol={symbol}
            />
          </motion.div>
        </div>

        {/* Right Column - Analysis Components */}
        <div className="space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
          >
            <AccuracyMeter predictions={displayPredictions} />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
          >
            <ConfidenceLevels 
              predictions={displayPredictions}
              selectedTimeframe={selectedTimeframe}
            />
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
          >
            <FactorAnalysis predictions={displayPredictions} />
          </motion.div>
        </div>
      </div>

      {/* Bottom Row - Additional Analysis */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
        >
          <AnalystComparison predictions={displayPredictions} />
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.8 }}
        >
          <RiskRewardCalculator 
            predictions={displayPredictions}
            selectedTimeframe={selectedTimeframe}
          />
        </motion.div>
      </div>

      {/* Scenario Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.9 }}
      >
        <ScenarioAnalysis predictions={displayPredictions} />
      </motion.div>
    </div>
  )
}
