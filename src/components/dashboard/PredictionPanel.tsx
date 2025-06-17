'use client'

import { useState } from 'react'
import { Brain, TrendingUp, TrendingDown, Target, Zap, Clock } from 'lucide-react'
import { useStock } from '@/contexts/StockContext'
import { motion } from 'framer-motion'

export default function PredictionPanel() {
  const { state } = useStock()
  const [selectedTimeframe, setSelectedTimeframe] = useState('1w')

  const predictions = [
    {
      timeframe: '1d',
      label: '1 Day',
      predictedPrice: 152.45,
      confidence: 87,
      direction: 'up' as const,
      change: 2.20,
      changePercent: 1.47,
    },
    {
      timeframe: '1w',
      label: '1 Week',
      predictedPrice: 158.30,
      confidence: 82,
      direction: 'up' as const,
      change: 8.05,
      changePercent: 5.37,
    },
    {
      timeframe: '1m',
      label: '1 Month',
      predictedPrice: 165.80,
      confidence: 75,
      direction: 'up' as const,
      change: 15.55,
      changePercent: 10.35,
    },
    {
      timeframe: '3m',
      label: '3 Months',
      predictedPrice: 142.10,
      confidence: 68,
      direction: 'down' as const,
      change: -8.15,
      changePercent: -5.43,
    },
  ]

  const factors = {
    technical: 78,
    fundamental: 85,
    sentiment: 72,
    market: 80,
  }

  const selectedPrediction = predictions.find(p => p.timeframe === selectedTimeframe) || predictions[1]

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
    }).format(value)
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return 'text-green-400'
    if (confidence >= 60) return 'text-yellow-400'
    return 'text-red-400'
  }

  const getConfidenceBg = (confidence: number) => {
    if (confidence >= 80) return 'bg-green-500'
    if (confidence >= 60) return 'bg-yellow-500'
    return 'bg-red-500'
  }

  return (
    <div className="glass-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Brain className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">AI Predictions</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Zap className="h-4 w-4 text-yellow-400" />
          <span className="text-sm text-gray-400">LSTM Model</span>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="grid grid-cols-2 gap-2 mb-6">
        {predictions.map((prediction) => (
          <button
            key={prediction.timeframe}
            onClick={() => setSelectedTimeframe(prediction.timeframe)}
            className={`p-3 rounded-lg text-sm font-medium transition-all ${
              selectedTimeframe === prediction.timeframe
                ? 'bg-purple-500 text-white'
                : 'glass text-gray-300 hover:text-white hover:bg-white/10'
            }`}
          >
            {prediction.label}
          </button>
        ))}
      </div>

      {/* Main Prediction */}
      <motion.div
        key={selectedTimeframe}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-6"
      >
        <div className="flex items-center justify-center space-x-3 mb-4">
          {selectedPrediction.direction === 'up' ? (
            <TrendingUp className="h-8 w-8 text-green-400" />
          ) : (
            <TrendingDown className="h-8 w-8 text-red-400" />
          )}
          <div>
            <p className="text-3xl font-bold text-white">
              {formatCurrency(selectedPrediction.predictedPrice)}
            </p>
            <p className={`text-sm ${
              selectedPrediction.direction === 'up' ? 'text-green-400' : 'text-red-400'
            }`}>
              {selectedPrediction.change >= 0 ? '+' : ''}{formatCurrency(selectedPrediction.change)} 
              ({selectedPrediction.changePercent >= 0 ? '+' : ''}{selectedPrediction.changePercent.toFixed(2)}%)
            </p>
          </div>
        </div>

        {/* Confidence */}
        <div className="mb-4">
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm text-gray-400">Confidence</span>
            <span className={`text-sm font-medium ${getConfidenceColor(selectedPrediction.confidence)}`}>
              {selectedPrediction.confidence}%
            </span>
          </div>
          <div className="w-full bg-gray-700 rounded-full h-2">
            <div
              className={`h-2 rounded-full ${getConfidenceBg(selectedPrediction.confidence)}`}
              style={{ width: `${selectedPrediction.confidence}%` }}
            />
          </div>
        </div>
      </motion.div>

      {/* All Predictions */}
      <div className="space-y-3 mb-6">
        <h3 className="text-lg font-semibold text-white">All Predictions</h3>
        {predictions.map((prediction) => (
          <div
            key={prediction.timeframe}
            className={`flex items-center justify-between p-3 rounded-lg transition-colors cursor-pointer ${
              selectedTimeframe === prediction.timeframe
                ? 'bg-purple-500/20 border border-purple-500/30'
                : 'glass hover:bg-white/5'
            }`}
            onClick={() => setSelectedTimeframe(prediction.timeframe)}
          >
            <div className="flex items-center space-x-3">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-white font-medium">{prediction.label}</span>
            </div>
            <div className="text-right">
              <p className="text-white font-medium">{formatCurrency(prediction.predictedPrice)}</p>
              <p className={`text-sm ${
                prediction.direction === 'up' ? 'text-green-400' : 'text-red-400'
              }`}>
                {prediction.changePercent >= 0 ? '+' : ''}{prediction.changePercent.toFixed(2)}%
              </p>
            </div>
          </div>
        ))}
      </div>

      {/* Prediction Factors */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Prediction Factors</h3>
        <div className="space-y-3">
          {Object.entries(factors).map(([factor, score]) => (
            <div key={factor} className="flex items-center justify-between">
              <span className="text-sm text-gray-400 capitalize">{factor}</span>
              <div className="flex items-center space-x-2">
                <div className="w-20 bg-gray-700 rounded-full h-2">
                  <div
                    className={`h-2 rounded-full ${
                      score >= 80 ? 'bg-green-500' :
                      score >= 60 ? 'bg-yellow-500' : 'bg-red-500'
                    }`}
                    style={{ width: `${score}%` }}
                  />
                </div>
                <span className={`text-sm font-medium ${
                  score >= 80 ? 'text-green-400' :
                  score >= 60 ? 'text-yellow-400' : 'text-red-400'
                }`}>
                  {score}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Model Info */}
      <div className="mt-6 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-center space-x-2 mb-2">
          <Target className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Model Accuracy</span>
        </div>
        <p className="text-xs text-gray-400">
          Based on LSTM neural network trained on 5 years of historical data. 
          Current model accuracy: <span className="text-white font-medium">84.2%</span>
        </p>
      </div>
    </div>
  )
}
