'use client'

import { motion } from 'framer-motion'
import { Shield, AlertTriangle, TrendingUp, TrendingDown, Activity, Target } from 'lucide-react'
import CountUp from 'react-countup'

interface RiskAssessmentProps {
  symbol: string
  riskLevel?: 'Low' | 'Medium' | 'High' | 'Very High'
  detailed?: boolean
  className?: string
}

export default function RiskAssessment({ 
  symbol, 
  riskLevel = 'Medium', 
  detailed = false,
  className = '' 
}: RiskAssessmentProps) {
  
  // Mock risk data - in production, this would come from real analysis
  const riskData = {
    overall: riskLevel,
    volatility: 24.5, // Beta-adjusted volatility
    beta: 1.24,
    maxDrawdown: -18.3,
    sharpeRatio: 1.42,
    var95: -8.2, // Value at Risk (95% confidence)
    correlation: 0.78, // Correlation with market
    liquidityRisk: 'Low',
    creditRisk: 'Low',
    marketRisk: 'Medium',
    concentrationRisk: 'Medium',
  }

  const getRiskColor = (risk: string) => {
    switch (risk) {
      case 'Low':
        return { color: 'text-green-400', bg: 'bg-green-500/20', border: 'border-green-500/30' }
      case 'Medium':
        return { color: 'text-yellow-400', bg: 'bg-yellow-500/20', border: 'border-yellow-500/30' }
      case 'High':
        return { color: 'text-orange-400', bg: 'bg-orange-500/20', border: 'border-orange-500/30' }
      case 'Very High':
        return { color: 'text-red-400', bg: 'bg-red-500/20', border: 'border-red-500/30' }
      default:
        return { color: 'text-gray-400', bg: 'bg-gray-500/20', border: 'border-gray-500/30' }
    }
  }

  const getRiskIcon = (risk: string) => {
    switch (risk) {
      case 'Low':
        return Shield
      case 'Medium':
        return Activity
      case 'High':
      case 'Very High':
        return AlertTriangle
      default:
        return Shield
    }
  }

  const getRiskScore = (risk: string) => {
    switch (risk) {
      case 'Low': return 25
      case 'Medium': return 50
      case 'High': return 75
      case 'Very High': return 90
      default: return 50
    }
  }

  const overallRiskColors = getRiskColor(riskData.overall)
  const RiskIcon = getRiskIcon(riskData.overall)
  const riskScore = getRiskScore(riskData.overall)

  const riskFactors = [
    {
      name: 'Market Risk',
      level: riskData.marketRisk,
      description: 'Sensitivity to market movements',
      value: riskData.beta,
      format: 'number',
    },
    {
      name: 'Volatility Risk',
      level: riskData.volatility > 30 ? 'High' : riskData.volatility > 20 ? 'Medium' : 'Low',
      description: 'Price volatility measure',
      value: riskData.volatility,
      format: 'percent',
    },
    {
      name: 'Liquidity Risk',
      level: riskData.liquidityRisk,
      description: 'Ease of buying/selling',
      value: 95, // Liquidity score
      format: 'percent',
    },
    {
      name: 'Credit Risk',
      level: riskData.creditRisk,
      description: 'Financial stability risk',
      value: 85, // Credit score
      format: 'percent',
    },
  ]

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Risk Assessment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Risk Assessment</h2>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${overallRiskColors.bg} ${overallRiskColors.border} border`}>
            <RiskIcon className={`h-4 w-4 ${overallRiskColors.color}`} />
            <span className={`text-sm font-medium ${overallRiskColors.color}`}>
              {riskData.overall} Risk
            </span>
          </div>
        </div>

        {/* Risk Meter */}
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
              {/* Risk level arc */}
              <circle
                cx="60"
                cy="60"
                r="50"
                stroke={overallRiskColors.color.replace('text-', '')}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(riskScore / 100) * 314} 314`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Risk score */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold ${overallRiskColors.color}`}>
                  <CountUp end={riskScore} duration={2} />
                </div>
                <div className="text-xs text-gray-400">Risk Score</div>
              </div>
            </div>
          </div>
          
          <p className="text-gray-400 text-sm max-w-md mx-auto">
            Risk assessment based on volatility, market correlation, financial health, and liquidity analysis.
          </p>
        </div>

        {/* Risk Factors Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {riskFactors.map((factor, index) => {
            const factorColors = getRiskColor(factor.level)
            return (
              <motion.div
                key={factor.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`p-4 rounded-lg border ${factorColors.bg} ${factorColors.border}`}
              >
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-medium text-white">{factor.name}</h4>
                  <span className={`text-sm font-medium ${factorColors.color}`}>
                    {factor.level}
                  </span>
                </div>
                <p className="text-sm text-gray-400 mb-3">{factor.description}</p>
                <div className="flex items-center justify-between">
                  <span className="text-lg font-bold text-white">
                    {factor.format === 'percent' ? (
                      <CountUp end={factor.value} duration={1.5} decimals={1} suffix="%" />
                    ) : (
                      <CountUp end={factor.value} duration={1.5} decimals={2} />
                    )}
                  </span>
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ease-out ${
                        factor.level === 'Low' ? 'bg-green-400' :
                        factor.level === 'Medium' ? 'bg-yellow-400' :
                        'bg-red-400'
                      }`}
                      style={{ 
                        width: `${
                          factor.level === 'Low' ? 25 :
                          factor.level === 'Medium' ? 50 :
                          factor.level === 'High' ? 75 : 90
                        }%` 
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Detailed Risk Metrics (if detailed prop is true) */}
      {detailed && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card"
        >
          <h3 className="text-lg font-semibold text-white mb-6">Advanced Risk Metrics</h3>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Value at Risk */}
            <div className="text-center p-4 glass rounded-lg">
              <TrendingDown className="h-6 w-6 text-red-400 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-1">Value at Risk (95%)</h4>
              <div className="text-2xl font-bold text-red-400 mb-1">
                <CountUp end={Math.abs(riskData.var95)} duration={1.5} decimals={1} suffix="%" />
              </div>
              <p className="text-sm text-gray-400">Potential 1-day loss</p>
            </div>

            {/* Sharpe Ratio */}
            <div className="text-center p-4 glass rounded-lg">
              <Target className="h-6 w-6 text-blue-400 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-1">Sharpe Ratio</h4>
              <div className="text-2xl font-bold text-blue-400 mb-1">
                <CountUp end={riskData.sharpeRatio} duration={1.5} decimals={2} />
              </div>
              <p className="text-sm text-gray-400">Risk-adjusted return</p>
            </div>

            {/* Max Drawdown */}
            <div className="text-center p-4 glass rounded-lg">
              <TrendingDown className="h-6 w-6 text-orange-400 mx-auto mb-2" />
              <h4 className="font-medium text-white mb-1">Max Drawdown</h4>
              <div className="text-2xl font-bold text-orange-400 mb-1">
                <CountUp end={Math.abs(riskData.maxDrawdown)} duration={1.5} decimals={1} suffix="%" />
              </div>
              <p className="text-sm text-gray-400">Largest peak-to-trough decline</p>
            </div>
          </div>

          {/* Risk Recommendations */}
          <div className="mt-6 pt-6 border-t border-white/10">
            <h4 className="font-semibold text-white mb-4">Risk Management Recommendations</h4>
            <div className="space-y-3">
              <div className="flex items-start space-x-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                <Shield className="h-5 w-5 text-blue-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-blue-400">Position Sizing</p>
                  <p className="text-sm text-gray-400">
                    Consider limiting position to 2-5% of portfolio due to {riskData.overall.toLowerCase()} risk level.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                <AlertTriangle className="h-5 w-5 text-yellow-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-yellow-400">Diversification</p>
                  <p className="text-sm text-gray-400">
                    High correlation ({(riskData.correlation * 100).toFixed(0)}%) with market suggests need for sector diversification.
                  </p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <TrendingUp className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-400">Stop Loss</p>
                  <p className="text-sm text-gray-400">
                    Consider setting stop loss at {Math.abs(riskData.var95 * 1.5).toFixed(1)}% below entry price.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
