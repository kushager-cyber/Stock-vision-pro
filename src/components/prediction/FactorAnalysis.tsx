'use client'

import { motion } from 'framer-motion'
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar
} from 'recharts'
import { 
  Activity, 
  DollarSign, 
  MessageCircle, 
  TrendingUp, 
  Newspaper,
  Volume2,
  BarChart3
} from 'lucide-react'
import CountUp from 'react-countup'
import { PredictionData } from '@/types/stock'

interface FactorAnalysisProps {
  predictions: PredictionData
  className?: string
}

export default function FactorAnalysis({ predictions, className = '' }: FactorAnalysisProps) {
  const factors = predictions.factors

  const factorData = [
    {
      name: 'Technical',
      value: factors.technical,
      icon: Activity,
      color: '#3b82f6',
      description: 'Chart patterns, indicators, momentum',
    },
    {
      name: 'Fundamental',
      value: factors.fundamental,
      icon: DollarSign,
      color: '#10b981',
      description: 'Financial metrics, earnings, ratios',
    },
    {
      name: 'Sentiment',
      value: factors.sentiment,
      icon: MessageCircle,
      color: '#8b5cf6',
      description: 'Social media, investor sentiment',
    },
    {
      name: 'Market',
      value: factors.market,
      icon: TrendingUp,
      color: '#f59e0b',
      description: 'Market trends, sector performance',
    },
    {
      name: 'News',
      value: factors.news || 75,
      icon: Newspaper,
      color: '#ef4444',
      description: 'News sentiment, events, announcements',
    },
    {
      name: 'Volume',
      value: factors.volume || 68,
      icon: Volume2,
      color: '#06b6d4',
      description: 'Trading volume, liquidity patterns',
    },
  ]

  // Prepare data for charts
  const barChartData = factorData.map(factor => ({
    name: factor.name,
    value: factor.value,
    color: factor.color,
  }))

  const radarChartData = [
    {
      factor: 'Technical',
      value: factors.technical,
      fullMark: 100,
    },
    {
      factor: 'Fundamental',
      value: factors.fundamental,
      fullMark: 100,
    },
    {
      factor: 'Sentiment',
      value: factors.sentiment,
      fullMark: 100,
    },
    {
      factor: 'Market',
      value: factors.market,
      fullMark: 100,
    },
    {
      factor: 'News',
      value: factors.news || 75,
      fullMark: 100,
    },
    {
      factor: 'Volume',
      value: factors.volume || 68,
      fullMark: 100,
    },
  ]

  const getFactorStrength = (value: number) => {
    if (value >= 80) return { label: 'Very Strong', color: 'text-green-400' }
    if (value >= 70) return { label: 'Strong', color: 'text-green-300' }
    if (value >= 60) return { label: 'Moderate', color: 'text-yellow-400' }
    if (value >= 50) return { label: 'Weak', color: 'text-orange-400' }
    return { label: 'Very Weak', color: 'text-red-400' }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0]
      return (
        <div className="glass-card p-3 border border-white/20">
          <p className="text-white font-medium">{label}</p>
          <p className="text-blue-400">
            Influence: {data.value.toFixed(1)}%
          </p>
        </div>
      )
    }
    return null
  }

  // Calculate overall factor score
  const overallScore = Object.values(factors).reduce((sum, value) => sum + value, 0) / Object.keys(factors).length

  return (
    <div className={`glass-card ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <BarChart3 className="h-6 w-6 text-purple-400" />
        <h2 className="text-xl font-bold text-white">Prediction Factors</h2>
      </div>

      {/* Overall Score */}
      <div className="text-center mb-6 p-4 glass rounded-lg">
        <div className="text-3xl font-bold text-purple-400 mb-2">
          <CountUp end={overallScore} duration={2} decimals={1} />
        </div>
        <div className="text-sm text-gray-400">Overall Factor Strength</div>
        <div className={`text-sm font-medium mt-1 ${getFactorStrength(overallScore).color}`}>
          {getFactorStrength(overallScore).label}
        </div>
      </div>

      {/* Factor Cards */}
      <div className="grid grid-cols-1 gap-3 mb-6">
        {factorData.map((factor, index) => {
          const Icon = factor.icon
          const strength = getFactorStrength(factor.value)
          
          return (
            <motion.div
              key={factor.name}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: index * 0.1 }}
              className="flex items-center justify-between p-3 glass rounded-lg hover-lift"
            >
              <div className="flex items-center space-x-3">
                <div 
                  className="w-10 h-10 rounded-lg flex items-center justify-center"
                  style={{ backgroundColor: `${factor.color}20` }}
                >
                  <Icon className="h-5 w-5" style={{ color: factor.color }} />
                </div>
                <div>
                  <h4 className="font-medium text-white">{factor.name}</h4>
                  <p className="text-xs text-gray-400">{factor.description}</p>
                </div>
              </div>
              
              <div className="text-right">
                <div className="text-lg font-bold text-white">
                  <CountUp end={factor.value} duration={1.5} decimals={1} suffix="%" />
                </div>
                <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                  <motion.div
                    className="h-full"
                    style={{ backgroundColor: factor.color }}
                    initial={{ width: 0 }}
                    animate={{ width: `${factor.value}%` }}
                    transition={{ duration: 1.5, delay: index * 0.1 }}
                  />
                </div>
                <div className={`text-xs mt-1 ${strength.color}`}>
                  {strength.label}
                </div>
              </div>
            </motion.div>
          )
        })}
      </div>

      {/* Charts */}
      <div className="space-y-6">
        {/* Bar Chart */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Factor Influence</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barChartData}>
                <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
                <XAxis 
                  dataKey="name" 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <YAxis 
                  stroke="#9ca3af"
                  fontSize={12}
                />
                <Tooltip content={<CustomTooltip />} />
                <Bar 
                  dataKey="value" 
                  fill="#3b82f6"
                  radius={[4, 4, 0, 0]}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Radar Chart */}
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Factor Balance</h3>
          <div className="h-48">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarChartData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis 
                  dataKey="factor" 
                  tick={{ fill: '#9ca3af', fontSize: 12 }}
                />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]}
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                />
                <Radar
                  name="Factors"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="#8b5cf6"
                  fillOpacity={0.3}
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* Factor Insights */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Key Insights</h3>
        
        <div className="space-y-3">
          {/* Strongest Factor */}
          {(() => {
            const strongest = factorData.reduce((prev, current) => 
              prev.value > current.value ? prev : current
            )
            return (
              <div className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                <strongest.icon className="h-5 w-5 text-green-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-green-400">Strongest Factor</p>
                  <p className="text-sm text-gray-400">
                    {strongest.name} ({strongest.value.toFixed(1)}%) is driving the prediction with {strongest.description.toLowerCase()}.
                  </p>
                </div>
              </div>
            )
          })()}

          {/* Weakest Factor */}
          {(() => {
            const weakest = factorData.reduce((prev, current) => 
              prev.value < current.value ? prev : current
            )
            return (
              <div className="flex items-start space-x-3 p-3 bg-red-500/10 rounded-lg border border-red-500/20">
                <weakest.icon className="h-5 w-5 text-red-400 mt-0.5" />
                <div>
                  <p className="text-sm font-medium text-red-400">Weakest Factor</p>
                  <p className="text-sm text-gray-400">
                    {weakest.name} ({weakest.value.toFixed(1)}%) shows limited influence. Consider monitoring {weakest.description.toLowerCase()}.
                  </p>
                </div>
              </div>
            )
          })()}

          {/* Balance Assessment */}
          <div className="flex items-start space-x-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <BarChart3 className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-400">Factor Balance</p>
              <p className="text-sm text-gray-400">
                {overallScore >= 75 
                  ? 'Strong alignment across all factors supports high prediction confidence.'
                  : overallScore >= 60
                  ? 'Moderate factor alignment suggests reasonable prediction reliability.'
                  : 'Mixed factor signals indicate higher prediction uncertainty.'
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
