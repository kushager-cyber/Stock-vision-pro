'use client'

import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Minus, 
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Activity
} from 'lucide-react'
import CountUp from 'react-countup'
import { PredictionData } from '@/types/stock'
import { formatCurrency, formatPercent } from '@/utils/formatters'

interface ScenarioAnalysisProps {
  predictions: PredictionData
  className?: string
}

export default function ScenarioAnalysis({ predictions, className = '' }: ScenarioAnalysisProps) {
  const scenarios = predictions.scenarioAnalysis || {
    bull: {
      probability: 35,
      predictedPrice: predictions.currentPrice * 1.18,
      factors: [
        'Strong earnings growth',
        'Positive market sentiment',
        'Sector outperformance',
        'Technical breakout'
      ]
    },
    bear: {
      probability: 25,
      predictedPrice: predictions.currentPrice * 0.87,
      factors: [
        'Economic uncertainty',
        'Rising interest rates',
        'Sector headwinds',
        'Technical breakdown'
      ]
    },
    neutral: {
      probability: 40,
      predictedPrice: predictions.currentPrice * 1.03,
      factors: [
        'Mixed market signals',
        'Sideways consolidation',
        'Balanced fundamentals',
        'Range-bound trading'
      ]
    }
  }

  const currentPrice = predictions.currentPrice

  const getScenarioIcon = (scenario: string) => {
    switch (scenario) {
      case 'bull': return TrendingUp
      case 'bear': return TrendingDown
      case 'neutral': return Minus
      default: return Activity
    }
  }

  const getScenarioColor = (scenario: string) => {
    switch (scenario) {
      case 'bull': return {
        color: 'text-green-400',
        bg: 'bg-green-500',
        border: 'border-green-500',
        bgLight: 'bg-green-500/10'
      }
      case 'bear': return {
        color: 'text-red-400',
        bg: 'bg-red-500',
        border: 'border-red-500',
        bgLight: 'bg-red-500/10'
      }
      case 'neutral': return {
        color: 'text-yellow-400',
        bg: 'bg-yellow-500',
        border: 'border-yellow-500',
        bgLight: 'bg-yellow-500/10'
      }
      default: return {
        color: 'text-gray-400',
        bg: 'bg-gray-500',
        border: 'border-gray-500',
        bgLight: 'bg-gray-500/10'
      }
    }
  }

  const getMostLikelyScenario = () => {
    const scenarioEntries = Object.entries(scenarios)
    return scenarioEntries.reduce((prev, current) => 
      prev[1].probability > current[1].probability ? prev : current
    )
  }

  const [mostLikelyKey, mostLikelyScenario] = getMostLikelyScenario()

  return (
    <div className={`glass-card ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="h-6 w-6 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Scenario Analysis</h2>
      </div>

      {/* Most Likely Scenario */}
      <div className="mb-8">
        <h3 className="text-lg font-semibold text-white mb-4">Most Likely Outcome</h3>
        
        <div className={`p-6 rounded-lg border ${getScenarioColor(mostLikelyKey).bgLight} ${getScenarioColor(mostLikelyKey).border}/20`}>
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center space-x-3">
              {(() => {
                const Icon = getScenarioIcon(mostLikelyKey)
                const colors = getScenarioColor(mostLikelyKey)
                return (
                  <>
                    <Icon className={`h-6 w-6 ${colors.color}`} />
                    <span className={`text-xl font-bold ${colors.color} capitalize`}>
                      {mostLikelyKey} Market
                    </span>
                  </>
                )
              })()}
            </div>
            <div className="text-right">
              <div className={`text-2xl font-bold ${getScenarioColor(mostLikelyKey).color}`}>
                <CountUp end={mostLikelyScenario.probability} duration={2} suffix="%" />
              </div>
              <div className="text-sm text-gray-400">Probability</div>
            </div>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h4 className="font-medium text-white mb-2">Price Target</h4>
              <div className="text-2xl font-bold text-white mb-1">
                {formatCurrency(mostLikelyScenario.predictedPrice)}
              </div>
              <div className={`text-sm ${
                mostLikelyScenario.predictedPrice > currentPrice ? 'text-green-400' : 'text-red-400'
              }`}>
                {formatPercent(((mostLikelyScenario.predictedPrice - currentPrice) / currentPrice) * 100)} from current
              </div>
            </div>
            
            <div>
              <h4 className="font-medium text-white mb-2">Key Factors</h4>
              <ul className="space-y-1">
                {mostLikelyScenario.factors.slice(0, 3).map((factor, index) => (
                  <li key={index} className="text-sm text-gray-400 flex items-center space-x-2">
                    <div className={`w-1.5 h-1.5 rounded-full ${getScenarioColor(mostLikelyKey).bg}`}></div>
                    <span>{factor}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      </div>

      {/* All Scenarios */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {Object.entries(scenarios).map(([key, scenario], index) => {
          const Icon = getScenarioIcon(key)
          const colors = getScenarioColor(key)
          const priceChange = ((scenario.predictedPrice - currentPrice) / currentPrice) * 100
          
          return (
            <motion.div
              key={key}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className={`p-4 rounded-lg border ${colors.bgLight} ${colors.border}/20 hover-lift`}
            >
              {/* Header */}
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-2">
                  <Icon className={`h-5 w-5 ${colors.color}`} />
                  <span className={`font-bold ${colors.color} capitalize`}>{key}</span>
                </div>
                <div className={`text-lg font-bold ${colors.color}`}>
                  <CountUp end={scenario.probability} duration={1.5} suffix="%" />
                </div>
              </div>

              {/* Probability Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4 overflow-hidden">
                <motion.div
                  className={`h-full ${colors.bg}`}
                  initial={{ width: 0 }}
                  animate={{ width: `${scenario.probability}%` }}
                  transition={{ duration: 1.5, delay: index * 0.1 }}
                />
              </div>

              {/* Price Target */}
              <div className="mb-4">
                <div className="text-lg font-bold text-white">
                  {formatCurrency(scenario.predictedPrice)}
                </div>
                <div className={`text-sm ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                  {formatPercent(priceChange)}
                </div>
              </div>

              {/* Factors */}
              <div>
                <h4 className="text-sm font-medium text-gray-400 mb-2">Key Factors</h4>
                <ul className="space-y-1">
                  {scenario.factors.map((factor, factorIndex) => (
                    <li key={factorIndex} className="text-xs text-gray-400 flex items-center space-x-2">
                      <div className={`w-1 h-1 rounded-full ${colors.bg}`}></div>
                      <span>{factor}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Scenario Comparison */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Scenario Comparison</h3>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-white/10">
                <th className="text-left py-3 px-4 text-gray-400 font-medium">Scenario</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Probability</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Price Target</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Return</th>
                <th className="text-center py-3 px-4 text-gray-400 font-medium">Risk Level</th>
              </tr>
            </thead>
            <tbody>
              {Object.entries(scenarios).map(([key, scenario]) => {
                const colors = getScenarioColor(key)
                const priceChange = ((scenario.predictedPrice - currentPrice) / currentPrice) * 100
                const Icon = getScenarioIcon(key)
                
                return (
                  <tr key={key} className="border-b border-white/5">
                    <td className="py-3 px-4">
                      <div className="flex items-center space-x-2">
                        <Icon className={`h-4 w-4 ${colors.color}`} />
                        <span className={`font-medium ${colors.color} capitalize`}>{key}</span>
                      </div>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-white font-medium">{scenario.probability}%</span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className="text-white font-medium">
                        {formatCurrency(scenario.predictedPrice)}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`font-medium ${priceChange >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {formatPercent(priceChange)}
                      </span>
                    </td>
                    <td className="text-center py-3 px-4">
                      <span className={`text-sm px-2 py-1 rounded ${colors.bgLight} ${colors.color}`}>
                        {key === 'bull' ? 'Low' : key === 'bear' ? 'High' : 'Medium'}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* Risk Assessment */}
      <div className="pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Risk Assessment</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="flex items-start space-x-3 p-4 bg-green-500/10 rounded-lg border border-green-500/20">
            <CheckCircle className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-400">Upside Potential</p>
              <p className="text-sm text-gray-400 mt-1">
                {scenarios.bull.probability}% chance of {formatPercent(((scenarios.bull.predictedPrice - currentPrice) / currentPrice) * 100)} gains
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-red-500/10 rounded-lg border border-red-500/20">
            <AlertTriangle className="h-5 w-5 text-red-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-red-400">Downside Risk</p>
              <p className="text-sm text-gray-400 mt-1">
                {scenarios.bear.probability}% chance of {formatPercent(((scenarios.bear.predictedPrice - currentPrice) / currentPrice) * 100)} losses
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-4 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Activity className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-400">Expected Value</p>
              <p className="text-sm text-gray-400 mt-1">
                Weighted average: {formatCurrency(
                  (scenarios.bull.predictedPrice * scenarios.bull.probability +
                   scenarios.bear.predictedPrice * scenarios.bear.probability +
                   scenarios.neutral.predictedPrice * scenarios.neutral.probability) / 100
                )}
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Scenario Insights */}
      <div className="mt-6 p-4 glass rounded-lg">
        <h4 className="font-medium text-white mb-2">Key Insights</h4>
        <p className="text-sm text-gray-400">
          {mostLikelyScenario.probability > 40 
            ? `Strong conviction in ${mostLikelyKey} scenario (${mostLikelyScenario.probability}% probability) suggests clear directional bias.`
            : `Balanced probabilities across scenarios indicate high uncertainty. Consider range-bound strategies.`
          } The {formatPercent(Math.abs(((scenarios.bull.predictedPrice - scenarios.bear.predictedPrice) / currentPrice) * 100))} spread between bull and bear cases reflects current market volatility.
        </p>
      </div>
    </div>
  )
}
