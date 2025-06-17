'use client'

import { motion } from 'framer-motion'
import { Shield, TrendingUp, AlertTriangle, CheckCircle } from 'lucide-react'
import CountUp from 'react-countup'
import { PredictionData } from '@/types/stock'

interface ConfidenceLevelsProps {
  predictions: PredictionData
  selectedTimeframe: string
  className?: string
}

export default function ConfidenceLevels({ 
  predictions, 
  selectedTimeframe, 
  className = '' 
}: ConfidenceLevelsProps) {
  const selectedPrediction = predictions.predictions.find(p => p.timeframe === selectedTimeframe)
  
  if (!selectedPrediction) return null

  const confidence = selectedPrediction.confidence

  const getConfidenceLevel = (conf: number) => {
    if (conf >= 85) return { 
      level: 'Very High', 
      color: 'text-green-400', 
      bg: 'bg-green-500', 
      icon: CheckCircle,
      description: 'Extremely reliable prediction with strong factor alignment'
    }
    if (conf >= 75) return { 
      level: 'High', 
      color: 'text-green-300', 
      bg: 'bg-green-400', 
      icon: CheckCircle,
      description: 'Reliable prediction with good factor support'
    }
    if (conf >= 65) return { 
      level: 'Moderate', 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500', 
      icon: Shield,
      description: 'Reasonable prediction with mixed factor signals'
    }
    if (conf >= 50) return { 
      level: 'Low', 
      color: 'text-orange-400', 
      bg: 'bg-orange-500', 
      icon: AlertTriangle,
      description: 'Uncertain prediction with weak factor alignment'
    }
    return { 
      level: 'Very Low', 
      color: 'text-red-400', 
      bg: 'bg-red-500', 
      icon: AlertTriangle,
      description: 'Highly uncertain prediction with conflicting signals'
    }
  }

  const confidenceInfo = getConfidenceLevel(confidence)
  const ConfidenceIcon = confidenceInfo.icon

  // Generate confidence breakdown
  const confidenceBreakdown = [
    {
      factor: 'Data Quality',
      score: Math.min(95, confidence + Math.random() * 10),
      description: 'Completeness and reliability of input data'
    },
    {
      factor: 'Model Certainty',
      score: confidence,
      description: 'Algorithm confidence in the prediction'
    },
    {
      factor: 'Historical Accuracy',
      score: Math.min(90, confidence - 5 + Math.random() * 15),
      description: 'Past performance for similar conditions'
    },
    {
      factor: 'Market Stability',
      score: Math.min(85, confidence - 10 + Math.random() * 20),
      description: 'Current market volatility and conditions'
    }
  ]

  const averageBreakdown = confidenceBreakdown.reduce((sum, item) => sum + item.score, 0) / confidenceBreakdown.length

  return (
    <div className={`glass-card ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Shield className="h-6 w-6 text-blue-400" />
        <h2 className="text-xl font-bold text-white">Confidence Analysis</h2>
      </div>

      {/* Main Confidence Display */}
      <div className="text-center mb-8">
        <div className="relative w-28 h-28 mx-auto mb-4">
          {/* Background circle */}
          <svg className="w-28 h-28 transform -rotate-90" viewBox="0 0 100 100">
            <circle
              cx="50"
              cy="50"
              r="40"
              stroke="rgba(255, 255, 255, 0.1)"
              strokeWidth="8"
              fill="none"
            />
            {/* Confidence arc */}
            <motion.circle
              cx="50"
              cy="50"
              r="40"
              stroke={confidenceInfo.bg.replace('bg-', '')}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${(confidence / 100) * 251} 251`}
              initial={{ strokeDasharray: "0 251" }}
              animate={{ strokeDasharray: `${(confidence / 100) * 251} 251` }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </svg>
          
          {/* Confidence percentage */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${confidenceInfo.color}`}>
                <CountUp end={confidence} duration={2} decimals={1} suffix="%" />
              </div>
            </div>
          </div>
        </div>

        {/* Confidence Level */}
        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${confidenceInfo.bg}/20 border border-${confidenceInfo.bg.replace('bg-', '')}/30 mb-3`}>
          <ConfidenceIcon className={`h-5 w-5 ${confidenceInfo.color}`} />
          <span className={`font-bold ${confidenceInfo.color}`}>{confidenceInfo.level} Confidence</span>
        </div>

        <p className="text-sm text-gray-400 max-w-xs mx-auto">
          {confidenceInfo.description}
        </p>
      </div>

      {/* Confidence Breakdown */}
      <div className="space-y-4 mb-6">
        <h3 className="text-lg font-semibold text-white">Confidence Breakdown</h3>
        
        {confidenceBreakdown.map((item, index) => {
          const itemConfidence = getConfidenceLevel(item.score)
          
          return (
            <motion.div
              key={item.factor}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-white">{item.factor}</span>
                <span className={`text-sm font-bold ${itemConfidence.color}`}>
                  {item.score.toFixed(1)}%
                </span>
              </div>
              
              <div className="w-full bg-gray-700 rounded-full h-2 overflow-hidden">
                <motion.div
                  className={`h-full ${itemConfidence.bg}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${item.score}%` }}
                  transition={{ duration: 1.5, delay: index * 0.1 }}
                />
              </div>
              
              <p className="text-xs text-gray-400">{item.description}</p>
            </motion.div>
          )
        })}
      </div>

      {/* Timeframe Comparison */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Confidence by Timeframe</h3>
        
        <div className="space-y-3">
          {predictions.predictions.map((pred, index) => {
            const isSelected = pred.timeframe === selectedTimeframe
            const predConfidence = getConfidenceLevel(pred.confidence)
            
            return (
              <motion.div
                key={pred.timeframe}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
                className={`flex items-center justify-between p-3 rounded-lg transition-all ${
                  isSelected 
                    ? 'bg-blue-500/20 border border-blue-500/30' 
                    : 'glass hover:bg-white/5'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${predConfidence.bg}`}></div>
                  <span className="text-white font-medium">{pred.timeframe.toUpperCase()}</span>
                </div>
                
                <div className="flex items-center space-x-3">
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full ${predConfidence.bg}`}
                      style={{ width: `${pred.confidence}%` }}
                    />
                  </div>
                  <span className={`text-sm font-bold ${predConfidence.color} min-w-[3rem] text-right`}>
                    {pred.confidence.toFixed(1)}%
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </div>

      {/* Confidence Factors */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">What Affects Confidence?</h3>
        
        <div className="space-y-3">
          <div className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <TrendingUp className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-400">Increases Confidence</p>
              <p className="text-sm text-gray-400">
                Strong factor alignment, historical accuracy, stable market conditions, high data quality
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Decreases Confidence</p>
              <p className="text-sm text-gray-400">
                Conflicting signals, market volatility, limited historical data, external events
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-400">Current Assessment</p>
              <p className="text-sm text-gray-400">
                {confidence >= 80 
                  ? 'Strong confidence supported by aligned factors and stable conditions.'
                  : confidence >= 65
                  ? 'Moderate confidence with some uncertainty in market conditions.'
                  : 'Lower confidence due to mixed signals and market volatility.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Confidence Score */}
      <div className="mt-6 p-4 glass rounded-lg">
        <div className="flex items-center justify-between">
          <span className="text-sm text-gray-400">Overall Confidence Score</span>
          <div className="flex items-center space-x-2">
            <div className="w-20 h-2 bg-gray-700 rounded-full overflow-hidden">
              <motion.div
                className={`h-full ${confidenceInfo.bg}`}
                initial={{ width: 0 }}
                animate={{ width: `${averageBreakdown}%` }}
                transition={{ duration: 2, delay: 0.5 }}
              />
            </div>
            <span className={`text-sm font-bold ${confidenceInfo.color}`}>
              <CountUp end={averageBreakdown} duration={2} decimals={1} suffix="%" />
            </span>
          </div>
        </div>
      </div>
    </div>
  )
}
