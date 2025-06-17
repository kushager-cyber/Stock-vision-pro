'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Settings, RotateCcw, Save, Sliders } from 'lucide-react'
import { PredictionData } from '@/types/stock'
import { formatPercent } from '@/utils/formatters'

interface PredictionAdjustmentProps {
  symbol: string
  originalPredictions: PredictionData
  onAdjustmentChange: (adjustedPredictions: PredictionData) => void
  className?: string
}

export default function PredictionAdjustment({ 
  symbol, 
  originalPredictions, 
  onAdjustmentChange,
  className = '' 
}: PredictionAdjustmentProps) {
  // Factor weights (0-100)
  const [factorWeights, setFactorWeights] = useState({
    technical: originalPredictions.factors.technical,
    fundamental: originalPredictions.factors.fundamental,
    sentiment: originalPredictions.factors.sentiment,
    market: originalPredictions.factors.market,
    news: originalPredictions.factors.news || 75,
    volume: originalPredictions.factors.volume || 68,
  })

  // Model parameters
  const [modelParams, setModelParams] = useState({
    volatilityAdjustment: 0, // -50 to +50
    trendStrength: 0, // -50 to +50
    riskTolerance: 0, // -50 to +50
    timeHorizonBias: 0, // -50 to +50 (short vs long term bias)
  })

  // Calculate adjusted predictions
  const calculateAdjustedPredictions = (): PredictionData => {
    const totalWeight = Object.values(factorWeights).reduce((sum, weight) => sum + weight, 0)
    const normalizedWeights = Object.fromEntries(
      Object.entries(factorWeights).map(([key, weight]) => [key, (weight / totalWeight) * 100])
    )

    // Calculate overall factor strength
    const overallStrength = Object.values(normalizedWeights).reduce((sum, weight) => sum + weight, 0) / Object.keys(normalizedWeights).length

    // Apply adjustments to predictions
    const adjustedPredictions = originalPredictions.predictions.map(pred => {
      // Base adjustment from factor weights
      const factorAdjustment = (overallStrength - 70) / 100 // Normalize around 70% baseline

      // Apply model parameter adjustments
      const volatilityAdj = modelParams.volatilityAdjustment / 100
      const trendAdj = modelParams.trendStrength / 100
      const riskAdj = modelParams.riskTolerance / 100
      const timeAdj = modelParams.timeHorizonBias / 100

      // Calculate timeframe multiplier
      const timeframeMultiplier = {
        '1d': 1 + (timeAdj * -0.5), // Short-term bias reduces long-term confidence
        '1w': 1 + (timeAdj * -0.3),
        '1m': 1 + (timeAdj * 0.1),
        '3m': 1 + (timeAdj * 0.3),
        '6m': 1 + (timeAdj * 0.5),
        '1y': 1 + (timeAdj * 0.7),
      }[pred.timeframe] || 1

      // Adjust predicted price
      const baseChange = (pred.predictedPrice - originalPredictions.currentPrice) / originalPredictions.currentPrice
      const adjustedChange = baseChange * (1 + factorAdjustment + trendAdj) * timeframeMultiplier
      const adjustedPrice = originalPredictions.currentPrice * (1 + adjustedChange)

      // Adjust confidence
      const baseConfidence = pred.confidence
      const confidenceAdjustment = (factorAdjustment * 20) + (riskAdj * -10) + (Math.abs(volatilityAdj) * -5)
      const adjustedConfidence = Math.max(10, Math.min(95, baseConfidence + confidenceAdjustment))

      // Recalculate change values
      const newChange = adjustedPrice - originalPredictions.currentPrice
      const newChangePercent = (newChange / originalPredictions.currentPrice) * 100

      return {
        ...pred,
        predictedPrice: adjustedPrice,
        confidence: adjustedConfidence,
        change: newChange,
        changePercent: newChangePercent,
        direction: newChange > 0 ? 'up' as const : newChange < 0 ? 'down' as const : 'neutral' as const,
      }
    })

    return {
      ...originalPredictions,
      predictions: adjustedPredictions,
      factors: {
        technical: normalizedWeights.technical || 0,
        fundamental: normalizedWeights.fundamental || 0,
        sentiment: normalizedWeights.sentiment || 0,
        market: normalizedWeights.market || 0,
        news: normalizedWeights.news || 0,
        volume: normalizedWeights.volume || 0,
      },
      accuracy: Math.max(50, Math.min(95, originalPredictions.accuracy + (overallStrength - 70) / 5)),
      lastUpdated: Date.now(),
    }
  }

  // Update predictions when adjustments change
  useEffect(() => {
    const adjustedPredictions = calculateAdjustedPredictions()
    onAdjustmentChange(adjustedPredictions)
  }, [factorWeights, modelParams])

  const handleFactorChange = (factor: string, value: number) => {
    setFactorWeights(prev => ({
      ...prev,
      [factor]: value
    }))
  }

  const handleModelParamChange = (param: string, value: number) => {
    setModelParams(prev => ({
      ...prev,
      [param]: value
    }))
  }

  const resetToDefaults = () => {
    setFactorWeights({
      technical: originalPredictions.factors.technical,
      fundamental: originalPredictions.factors.fundamental,
      sentiment: originalPredictions.factors.sentiment,
      market: originalPredictions.factors.market,
      news: originalPredictions.factors.news || 75,
      volume: originalPredictions.factors.volume || 68,
    })
    setModelParams({
      volatilityAdjustment: 0,
      trendStrength: 0,
      riskTolerance: 0,
      timeHorizonBias: 0,
    })
  }

  const factorLabels = {
    technical: 'Technical Analysis',
    fundamental: 'Fundamental Analysis',
    sentiment: 'Market Sentiment',
    market: 'Market Trends',
    news: 'News Impact',
    volume: 'Volume Analysis',
  }

  const modelParamLabels = {
    volatilityAdjustment: 'Volatility Adjustment',
    trendStrength: 'Trend Strength',
    riskTolerance: 'Risk Tolerance',
    timeHorizonBias: 'Time Horizon Bias',
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card ${className}`}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Sliders className="h-6 w-6 text-purple-400" />
          <h2 className="text-xl font-bold text-white">Prediction Adjustment</h2>
        </div>
        
        <button
          onClick={resetToDefaults}
          className="flex items-center space-x-2 px-3 py-2 glass rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
        >
          <RotateCcw className="h-4 w-4" />
          <span className="text-sm">Reset</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
        {/* Factor Weights */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Factor Weights</h3>
          <p className="text-sm text-gray-400 mb-6">
            Adjust the influence of each factor on the prediction model.
          </p>
          
          <div className="space-y-6">
            {Object.entries(factorWeights).map(([factor, weight]) => (
              <div key={factor}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">
                    {factorLabels[factor as keyof typeof factorLabels]}
                  </label>
                  <span className="text-sm text-gray-400">{weight.toFixed(0)}%</span>
                </div>
                
                <div className="relative">
                  <input
                    type="range"
                    min="0"
                    max="100"
                    value={weight}
                    onChange={(e) => handleFactorChange(factor, Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div 
                    className="absolute top-0 left-0 h-2 bg-blue-500 rounded-lg pointer-events-none"
                    style={{ width: `${weight}%` }}
                  />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>No Impact</span>
                  <span>High Impact</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Model Parameters */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Model Parameters</h3>
          <p className="text-sm text-gray-400 mb-6">
            Fine-tune the model's behavior and risk characteristics.
          </p>
          
          <div className="space-y-6">
            {Object.entries(modelParams).map(([param, value]) => (
              <div key={param}>
                <div className="flex items-center justify-between mb-2">
                  <label className="text-sm font-medium text-white">
                    {modelParamLabels[param as keyof typeof modelParamLabels]}
                  </label>
                  <span className={`text-sm ${
                    value > 0 ? 'text-green-400' : value < 0 ? 'text-red-400' : 'text-gray-400'
                  }`}>
                    {value > 0 ? '+' : ''}{value}
                  </span>
                </div>
                
                <div className="relative">
                  <input
                    type="range"
                    min="-50"
                    max="50"
                    value={value}
                    onChange={(e) => handleModelParamChange(param, Number(e.target.value))}
                    className="w-full h-2 bg-gray-700 rounded-lg appearance-none cursor-pointer slider"
                  />
                  <div 
                    className={`absolute top-0 h-2 rounded-lg pointer-events-none ${
                      value >= 0 ? 'bg-green-500' : 'bg-red-500'
                    }`}
                    style={{ 
                      left: value >= 0 ? '50%' : `${50 + (value / 50) * 50}%`,
                      width: `${Math.abs(value)}%`
                    }}
                  />
                  <div className="absolute top-0 left-1/2 w-0.5 h-2 bg-white/50 pointer-events-none" />
                </div>
                
                <div className="flex justify-between text-xs text-gray-500 mt-1">
                  <span>
                    {param === 'volatilityAdjustment' ? 'Lower Vol' :
                     param === 'trendStrength' ? 'Weaker' :
                     param === 'riskTolerance' ? 'Conservative' :
                     'Short-term'}
                  </span>
                  <span>
                    {param === 'volatilityAdjustment' ? 'Higher Vol' :
                     param === 'trendStrength' ? 'Stronger' :
                     param === 'riskTolerance' ? 'Aggressive' :
                     'Long-term'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Adjustment Summary */}
      <div className="mt-8 pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Adjustment Impact</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="text-center p-4 glass rounded-lg">
            <div className="text-lg font-bold text-blue-400">
              {Object.values(factorWeights).reduce((sum, weight) => sum + weight, 0).toFixed(0)}%
            </div>
            <div className="text-sm text-gray-400">Total Factor Weight</div>
          </div>
          
          <div className="text-center p-4 glass rounded-lg">
            <div className={`text-lg font-bold ${
              Object.values(modelParams).some(v => v !== 0) ? 'text-yellow-400' : 'text-gray-400'
            }`}>
              {Object.values(modelParams).filter(v => v !== 0).length}
            </div>
            <div className="text-sm text-gray-400">Active Adjustments</div>
          </div>
          
          <div className="text-center p-4 glass rounded-lg">
            <div className="text-lg font-bold text-purple-400">
              {Math.abs(Object.values(modelParams).reduce((sum, val) => sum + Math.abs(val), 0)).toFixed(0)}
            </div>
            <div className="text-sm text-gray-400">Adjustment Magnitude</div>
          </div>
        </div>
      </div>

      {/* Help Text */}
      <div className="mt-6 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
        <h4 className="text-sm font-medium text-blue-400 mb-2">Adjustment Guide</h4>
        <ul className="text-sm text-gray-400 space-y-1">
          <li>• <strong>Factor Weights:</strong> Increase weights for factors you trust more</li>
          <li>• <strong>Volatility:</strong> Adjust for expected market volatility changes</li>
          <li>• <strong>Trend Strength:</strong> Modify based on your trend analysis</li>
          <li>• <strong>Risk Tolerance:</strong> Conservative reduces confidence, aggressive increases it</li>
          <li>• <strong>Time Horizon:</strong> Bias toward short-term or long-term predictions</li>
        </ul>
      </div>

      <style jsx>{`
        .slider::-webkit-slider-thumb {
          appearance: none;
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
        
        .slider::-moz-range-thumb {
          height: 16px;
          width: 16px;
          border-radius: 50%;
          background: #3b82f6;
          cursor: pointer;
          border: 2px solid #ffffff;
          box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        }
      `}</style>
    </motion.div>
  )
}
