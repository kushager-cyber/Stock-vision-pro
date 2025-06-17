'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Calculator, TrendingUp, TrendingDown, Shield, AlertTriangle, Target } from 'lucide-react'
import CountUp from 'react-countup'
import { PredictionData } from '@/types/stock'
import { formatCurrency, formatPercent } from '@/utils/formatters'

interface RiskRewardCalculatorProps {
  predictions: PredictionData
  selectedTimeframe: string
  className?: string
}

export default function RiskRewardCalculator({ 
  predictions, 
  selectedTimeframe, 
  className = '' 
}: RiskRewardCalculatorProps) {
  const [investmentAmount, setInvestmentAmount] = useState(10000)
  const [stopLoss, setStopLoss] = useState(5) // 5% stop loss
  const [takeProfit, setTakeProfit] = useState(15) // 15% take profit

  const selectedPrediction = predictions.predictions.find(p => p.timeframe === selectedTimeframe)
  const currentPrice = predictions.currentPrice
  
  if (!selectedPrediction) return null

  const predictedPrice = selectedPrediction.predictedPrice
  const expectedReturn = ((predictedPrice - currentPrice) / currentPrice) * 100

  // Calculate risk/reward metrics
  const riskReward = selectedPrediction.riskReward || {
    risk: Math.abs(Math.min(expectedReturn, -stopLoss)),
    reward: Math.max(expectedReturn, takeProfit),
    ratio: Math.max(expectedReturn, takeProfit) / Math.abs(Math.min(expectedReturn, -stopLoss))
  }

  // Calculate position sizing based on risk
  const maxRiskAmount = investmentAmount * (stopLoss / 100)
  const sharesCanBuy = Math.floor(investmentAmount / currentPrice)
  const actualInvestment = sharesCanBuy * currentPrice

  // Calculate potential outcomes
  const potentialProfit = actualInvestment * (expectedReturn / 100)
  const potentialLoss = actualInvestment * (stopLoss / 100)
  const takeProfitAmount = actualInvestment * (takeProfit / 100)

  // Risk assessment
  const getRiskLevel = (ratio: number) => {
    if (ratio >= 3) return { 
      level: 'Excellent', 
      color: 'text-green-400', 
      bg: 'bg-green-500',
      description: 'Very favorable risk/reward ratio'
    }
    if (ratio >= 2) return { 
      level: 'Good', 
      color: 'text-green-300', 
      bg: 'bg-green-400',
      description: 'Favorable risk/reward ratio'
    }
    if (ratio >= 1.5) return { 
      level: 'Fair', 
      color: 'text-yellow-400', 
      bg: 'bg-yellow-500',
      description: 'Acceptable risk/reward ratio'
    }
    if (ratio >= 1) return { 
      level: 'Poor', 
      color: 'text-orange-400', 
      bg: 'bg-orange-500',
      description: 'Unfavorable risk/reward ratio'
    }
    return { 
      level: 'Very Poor', 
      color: 'text-red-400', 
      bg: 'bg-red-500',
      description: 'Very unfavorable risk/reward ratio'
    }
  }

  const riskAssessment = getRiskLevel(riskReward.ratio)

  return (
    <div className={`glass-card ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Calculator className="h-6 w-6 text-green-400" />
        <h2 className="text-xl font-bold text-white">Risk/Reward Calculator</h2>
      </div>

      {/* Input Controls */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Investment Amount
          </label>
          <div className="relative">
            <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400">$</span>
            <input
              type="number"
              value={investmentAmount}
              onChange={(e) => setInvestmentAmount(Number(e.target.value))}
              className="w-full pl-8 pr-4 py-2 glass rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
              min="100"
              step="100"
            />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Stop Loss (%)
          </label>
          <input
            type="number"
            value={stopLoss}
            onChange={(e) => setStopLoss(Number(e.target.value))}
            className="w-full px-4 py-2 glass rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-red-500"
            min="1"
            max="50"
            step="0.5"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-400 mb-2">
            Take Profit (%)
          </label>
          <input
            type="number"
            value={takeProfit}
            onChange={(e) => setTakeProfit(Number(e.target.value))}
            className="w-full px-4 py-2 glass rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-green-500"
            min="1"
            max="100"
            step="0.5"
          />
        </div>
      </div>

      {/* Risk/Reward Ratio */}
      <div className="text-center mb-6">
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
            {/* Ratio arc */}
            <motion.circle
              cx="60"
              cy="60"
              r="50"
              stroke={riskAssessment.bg.replace('bg-', '')}
              strokeWidth="8"
              fill="none"
              strokeLinecap="round"
              strokeDasharray={`${Math.min(riskReward.ratio / 4, 1) * 314} 314`}
              initial={{ strokeDasharray: "0 314" }}
              animate={{ strokeDasharray: `${Math.min(riskReward.ratio / 4, 1) * 314} 314` }}
              transition={{ duration: 2, ease: "easeOut" }}
            />
          </svg>
          
          {/* Ratio value */}
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <div className={`text-2xl font-bold ${riskAssessment.color}`}>
                <CountUp end={riskReward.ratio} duration={2} decimals={1} suffix=":1" />
              </div>
              <div className="text-xs text-gray-400">R/R Ratio</div>
            </div>
          </div>
        </div>

        <div className={`inline-flex items-center space-x-2 px-4 py-2 rounded-full ${riskAssessment.bg}/20 border border-${riskAssessment.bg.replace('bg-', '')}/30`}>
          <Target className={`h-5 w-5 ${riskAssessment.color}`} />
          <span className={`font-bold ${riskAssessment.color}`}>{riskAssessment.level}</span>
        </div>
        
        <p className="text-sm text-gray-400 mt-2 max-w-xs mx-auto">
          {riskAssessment.description}
        </p>
      </div>

      {/* Position Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Position Details</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <span className="text-gray-400">Shares to Buy</span>
              <span className="text-white font-bold">{sharesCanBuy.toLocaleString()}</span>
            </div>
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <span className="text-gray-400">Actual Investment</span>
              <span className="text-white font-bold">{formatCurrency(actualInvestment)}</span>
            </div>
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <span className="text-gray-400">Entry Price</span>
              <span className="text-white font-bold">{formatCurrency(currentPrice)}</span>
            </div>
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <span className="text-gray-400">Target Price</span>
              <span className="text-green-400 font-bold">{formatCurrency(predictedPrice)}</span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Risk Management</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <span className="text-gray-400">Stop Loss Price</span>
              <span className="text-red-400 font-bold">
                {formatCurrency(currentPrice * (1 - stopLoss / 100))}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <span className="text-gray-400">Take Profit Price</span>
              <span className="text-green-400 font-bold">
                {formatCurrency(currentPrice * (1 + takeProfit / 100))}
              </span>
            </div>
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <span className="text-gray-400">Max Risk</span>
              <span className="text-red-400 font-bold">{formatCurrency(potentialLoss)}</span>
            </div>
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <span className="text-gray-400">Max Reward</span>
              <span className="text-green-400 font-bold">{formatCurrency(takeProfitAmount)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Analysis */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Potential Outcomes</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Bull Case */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="p-4 bg-green-500/10 rounded-lg border border-green-500/20"
          >
            <div className="flex items-center space-x-2 mb-3">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="font-medium text-green-400">Bull Case</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Target Hit</span>
                <span className="text-sm text-green-400 font-medium">
                  {formatCurrency(takeProfitAmount)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Return</span>
                <span className="text-sm text-green-400 font-medium">
                  {formatPercent(takeProfit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Probability</span>
                <span className="text-sm text-green-400 font-medium">
                  {selectedPrediction.confidence.toFixed(0)}%
                </span>
              </div>
            </div>
          </motion.div>

          {/* Base Case */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="p-4 bg-blue-500/10 rounded-lg border border-blue-500/20"
          >
            <div className="flex items-center space-x-2 mb-3">
              <Target className="h-5 w-5 text-blue-400" />
              <span className="font-medium text-blue-400">AI Prediction</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Predicted</span>
                <span className="text-sm text-blue-400 font-medium">
                  {formatCurrency(potentialProfit)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Return</span>
                <span className="text-sm text-blue-400 font-medium">
                  {formatPercent(expectedReturn)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Confidence</span>
                <span className="text-sm text-blue-400 font-medium">
                  {selectedPrediction.confidence.toFixed(0)}%
                </span>
              </div>
            </div>
          </motion.div>

          {/* Bear Case */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="p-4 bg-red-500/10 rounded-lg border border-red-500/20"
          >
            <div className="flex items-center space-x-2 mb-3">
              <TrendingDown className="h-5 w-5 text-red-400" />
              <span className="font-medium text-red-400">Bear Case</span>
            </div>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Stop Loss</span>
                <span className="text-sm text-red-400 font-medium">
                  -{formatCurrency(potentialLoss)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Loss</span>
                <span className="text-sm text-red-400 font-medium">
                  -{formatPercent(stopLoss)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-sm text-gray-400">Risk</span>
                <span className="text-sm text-red-400 font-medium">
                  {(100 - selectedPrediction.confidence).toFixed(0)}%
                </span>
              </div>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Risk Metrics */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Metrics</h3>
        
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="text-center p-3 glass rounded-lg">
            <div className="text-lg font-bold text-blue-400">
              <CountUp end={riskReward.ratio} duration={1.5} decimals={2} />
            </div>
            <div className="text-sm text-gray-400">Risk/Reward</div>
          </div>
          
          <div className="text-center p-3 glass rounded-lg">
            <div className="text-lg font-bold text-green-400">
              <CountUp end={riskReward.reward} duration={1.5} decimals={1} suffix="%" />
            </div>
            <div className="text-sm text-gray-400">Max Reward</div>
          </div>
          
          <div className="text-center p-3 glass rounded-lg">
            <div className="text-lg font-bold text-red-400">
              <CountUp end={riskReward.risk} duration={1.5} decimals={1} suffix="%" />
            </div>
            <div className="text-sm text-gray-400">Max Risk</div>
          </div>
          
          <div className="text-center p-3 glass rounded-lg">
            <div className="text-lg font-bold text-purple-400">
              <CountUp end={selectedPrediction.confidence} duration={1.5} decimals={1} suffix="%" />
            </div>
            <div className="text-sm text-gray-400">Win Rate</div>
          </div>
        </div>
      </div>

      {/* Recommendation */}
      <div className="mt-6 p-4 glass rounded-lg">
        <div className="flex items-start space-x-3">
          <Shield className={`h-5 w-5 ${riskAssessment.color} mt-0.5`} />
          <div>
            <p className={`text-sm font-medium ${riskAssessment.color}`}>
              Risk Assessment: {riskAssessment.level}
            </p>
            <p className="text-sm text-gray-400 mt-1">
              {riskReward.ratio >= 2 
                ? 'This trade offers favorable risk/reward characteristics. Consider position sizing based on your risk tolerance.'
                : riskReward.ratio >= 1.5
                ? 'Acceptable risk/reward ratio. Ensure proper risk management with stop losses.'
                : 'Unfavorable risk/reward ratio. Consider waiting for better entry points or adjusting targets.'
              }
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
