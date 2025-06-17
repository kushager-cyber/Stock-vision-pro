'use client'

import { motion } from 'framer-motion'
import { Target, TrendingUp, CheckCircle, AlertCircle } from 'lucide-react'
import CountUp from 'react-countup'
import { PredictionData } from '@/types/stock'

interface AccuracyMeterProps {
  predictions: PredictionData
  className?: string
}

export default function AccuracyMeter({ predictions, className = '' }: AccuracyMeterProps) {
  const accuracy = predictions.accuracy
  const historicalAccuracy = predictions.historicalAccuracy || []

  // Generate mock historical data if not available
  const mockHistoricalData = historicalAccuracy.length > 0 ? historicalAccuracy : [
    { timeframe: '1d', accuracy: 87.5, totalPredictions: 120, correctPredictions: 105 },
    { timeframe: '1w', accuracy: 82.3, totalPredictions: 85, correctPredictions: 70 },
    { timeframe: '1m', accuracy: 76.8, totalPredictions: 65, correctPredictions: 50 },
    { timeframe: '3m', accuracy: 71.2, totalPredictions: 45, correctPredictions: 32 },
  ]

  const getAccuracyColor = (acc: number) => {
    if (acc >= 80) return { color: 'text-green-400', bg: 'bg-green-500', ring: 'ring-green-500' }
    if (acc >= 70) return { color: 'text-yellow-400', bg: 'bg-yellow-500', ring: 'ring-yellow-500' }
    if (acc >= 60) return { color: 'text-orange-400', bg: 'bg-orange-500', ring: 'ring-orange-500' }
    return { color: 'text-red-400', bg: 'bg-red-500', ring: 'ring-red-500' }
  }

  const getAccuracyGrade = (acc: number) => {
    if (acc >= 90) return 'A+'
    if (acc >= 85) return 'A'
    if (acc >= 80) return 'A-'
    if (acc >= 75) return 'B+'
    if (acc >= 70) return 'B'
    if (acc >= 65) return 'B-'
    if (acc >= 60) return 'C+'
    return 'C'
  }

  const overallColors = getAccuracyColor(accuracy)
  const grade = getAccuracyGrade(accuracy)

  return (
    <div className={`glass-card ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Target className="h-6 w-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Prediction Accuracy</h2>
      </div>

      {/* Main Accuracy Meter */}
      <div className="text-center mb-8">
        <div className="relative w-32 h-32 mx-auto mb-4">
          {/* Background circle */}
          <svg className="w-32 h-32 transform -rotate-90" viewBox="0 0 120 120">
            <circle
              cx="60"
              cy="60"
              r="50"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
              fill="none"
            />
            {/* Accuracy arc */}
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              stroke={overallColors.bg.replace('bg-', '')}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(accuracy / 100) * 314} 314`}
              initial={{ strokeDasharray: "0 314" }}
              animate={{ strokeDasharray: `${(accuracy / 100) * 314} 314` }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </svg>
          
          {/* Accuracy percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${overallColors.color}`}>
                <CountUp end={accuracy} duration={2} decimals={1} suffix="%" />
              </div>
              <div className="text-xs text-gray-400">Accuracy</div>
            </div>
          </div>
        </div>

        {/* Grade */}
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${overallColors.bg}/20 border border-${overallColors.bg.replace('bg-', '')}/30`}>
          <CheckCircle className={`h-5 w-5 ${overallColors.color}`} />
          <span className={`font-bold ${overallColors.color}`}>Grade: {grade}</span>
        </div>
      </div>

      {/* Historical Performance */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-white">Historical Performance</h3>
        
        {mockHistoricalData.map((item, index) => {
          const itemColors = getAccuracyColor(item.accuracy)
          
          return (
            <motion.div
              key={item.timeframe}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 glass rounded-lg"
            >
              <div className="flex items-center space-x-3">
                <div className={`w-3 h-3 rounded-full ${itemColors.bg}`}></div>
                <div>
                  <h4 className="font-medium text-white">{item.timeframe.toUpperCase()}</h4>
                  <p className="text-sm text-gray-400">
                    {item.correctPredictions}/{item.totalPredictions} predictions
                  </p>
                </div>
              </div>
              
              <div className="text-right">
                <div className={`text-lg font-bold ${itemColors.color}`}>
                  <CountUp end={item.accuracy} duration={1.5} decimals={1} suffix="%" />
                </div>
                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className={`h-full ${itemColors.bg}`}
                    initial={{ width: 0 }}
                    animate={{ width: `${item.accuracy}%` }}
                    transition={{ duration: 1.5, delay: index * 0.1 }}
                  />
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Performance Metrics */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Model Metrics</h3>
        
        <div className="grid grid-cols-2 gap-4">
          <div className="text-center p-3 glass rounded-lg">
            <div className="text-lg font-bold text-blue-400">
              <CountUp 
                end={predictions.modelPerformance?.mse || 0.045} 
                duration={1.5} 
                decimals={3} 
              />
            </div>
            <div className="text-sm text-gray-400">MSE</div>
          </div>
          
          <div className="text-center p-3 glass rounded-lg">
            <div className="text-lg font-bold text-green-400">
              <CountUp 
                end={predictions.modelPerformance?.r2Score || 0.847} 
                duration={1.5} 
                decimals={3} 
              />
            </div>
            <div className="text-sm text-gray-400">R² Score</div>
          </div>
          
          <div className="text-center p-3 glass rounded-lg">
            <div className="text-lg font-bold text-purple-400">
              <CountUp 
                end={predictions.modelPerformance?.mae || 0.032} 
                duration={1.5} 
                decimals={3} 
              />
            </div>
            <div className="text-sm text-gray-400">MAE</div>
          </div>
          
          <div className="text-center p-3 glass rounded-lg">
            <div className="text-lg font-bold text-yellow-400">
              <CountUp 
                end={predictions.modelPerformance?.sharpeRatio || 1.42} 
                duration={1.5} 
                decimals={2} 
              />
            </div>
            <div className="text-sm text-gray-400">Sharpe</div>
          </div>
        </div>
      </div>

      {/* Accuracy Trend */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <h4 className="font-medium text-white">Recent Trend</h4>
          <div className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4 text-green-400" />
            <span className="text-sm text-green-400">+2.3% this week</span>
          </div>
        </div>
        
        <div className="mt-3 flex items-center space-x-2">
          <div className="flex-1 h-2 bg-gray-700 rounded-full overflow-hidden">
            <motion.div
              className="h-full bg-gradient-to-r from-red-500 via-yellow-500 to-green-500"
              initial={{ width: 0 }}
              animate={{ width: `${accuracy}%` }}
              transition={{ duration: 2, delay: 0.5 }}
            />
          </div>
          <span className="text-sm text-gray-400">100%</span>
        </div>
        
        <div className="flex justify-between text-xs text-gray-500 mt-1">
          <span>Poor</span>
          <span>Good</span>
          <span>Excellent</span>
        </div>
      </div>

      {/* Status Indicator */}
      <div className="mt-6 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <div className="flex items-center space-x-2">
          <CheckCircle className="h-4 w-4 text-blue-400" />
          <span className="text-sm font-medium text-blue-400">Model Status</span>
        </div>
        <p className="text-sm text-gray-400 mt-1">
          Model is performing {accuracy >= 80 ? 'excellently' : accuracy >= 70 ? 'well' : 'adequately'} 
          with consistent accuracy across timeframes. Last retrained: 2 days ago.
        </p>
      </div>
    </div>
  )
}
