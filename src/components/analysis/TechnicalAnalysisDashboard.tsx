'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  RadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  BarChart,
  Bar
} from 'recharts'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Target, 
  Zap,
  BarChart3,
  Layers,
  Eye,
  RefreshCw
} from 'lucide-react'
import { ChartData } from '@/types/stock'
import { technicalAnalysisEngine } from '@/services/technicalAnalysisEngine'
import { formatPercent } from '@/utils/formatters'
import CountUp from 'react-countup'

interface TechnicalAnalysisDashboardProps {
  symbol: string
  data: ChartData[]
  className?: string
}

export default function TechnicalAnalysisDashboard({ 
  symbol, 
  data, 
  className = '' 
}: TechnicalAnalysisDashboardProps) {
  const [indicators, setIndicators] = useState<any>({})
  const [technicalScore, setTechnicalScore] = useState<any>({})
  const [patterns, setPatterns] = useState<any[]>([])
  const [supportResistance, setSupportResistance] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedIndicator, setSelectedIndicator] = useState<string>('overview')

  useEffect(() => {
    if (data.length > 0) {
      calculateTechnicalAnalysis()
    }
  }, [data, symbol])

  const calculateTechnicalAnalysis = async () => {
    setLoading(true)
    try {
      // Calculate all technical indicators
      const rsi = technicalAnalysisEngine.calculateRSI(data)
      const macd = technicalAnalysisEngine.calculateMACD(data)
      const stochastic = technicalAnalysisEngine.calculateStochastic(data)
      const williamsR = technicalAnalysisEngine.calculateWilliamsR(data)
      const adx = technicalAnalysisEngine.calculateADX(data)
      const bollingerBands = technicalAnalysisEngine.calculateBollingerBands(data)
      const volumeAnalysis = technicalAnalysisEngine.calculateVolumeAnalysis(data)
      const fibonacciLevels = technicalAnalysisEngine.calculateFibonacciLevels(data)

      setIndicators({
        rsi,
        macd,
        stochastic,
        williamsR,
        adx,
        bollingerBands,
        volumeAnalysis,
        fibonacciLevels
      })

      // Calculate technical score
      const score = technicalAnalysisEngine.calculateTechnicalScore(data)
      setTechnicalScore(score)

      // Recognize patterns
      const chartPatterns = technicalAnalysisEngine.recognizePatterns(data)
      const candlestickPatterns = technicalAnalysisEngine.recognizeCandlestickPatterns(data)
      setPatterns([...chartPatterns, ...candlestickPatterns])

      // Find support and resistance levels
      const levels = technicalAnalysisEngine.findSupportResistanceLevels(data)
      setSupportResistance(levels)

    } catch (error) {
      console.error('Error calculating technical analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const getSignalColor = (signal: string) => {
    switch (signal) {
      case 'buy': return 'text-green-400'
      case 'sell': return 'text-red-400'
      default: return 'text-yellow-400'
    }
  }

  const getSignalIcon = (signal: string) => {
    switch (signal) {
      case 'buy': return TrendingUp
      case 'sell': return TrendingDown
      default: return Activity
    }
  }

  const getScoreColor = (score: number) => {
    if (score >= 70) return 'text-green-400'
    if (score >= 50) return 'text-yellow-400'
    return 'text-red-400'
  }

  // Prepare radar chart data
  const radarData = [
    { indicator: 'Trend', value: technicalScore.trend || 50, fullMark: 100 },
    { indicator: 'Momentum', value: technicalScore.momentum || 50, fullMark: 100 },
    { indicator: 'Volatility', value: technicalScore.volatility || 50, fullMark: 100 },
    { indicator: 'Volume', value: technicalScore.volume || 50, fullMark: 100 },
    { indicator: 'Support', value: supportResistance.length * 20, fullMark: 100 },
  ]

  // Prepare indicator comparison data
  const indicatorData = Object.entries(indicators).map(([name, indicator]: [string, any]) => ({
    name: name.toUpperCase(),
    strength: indicator.strength || 0,
    signal: indicator.signal,
    value: indicator.value
  })).filter(item => item.strength !== undefined)

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-white/20">
          <p className="text-white font-medium">{label}</p>
          <p className="text-blue-400">
            Value: {payload[0].value.toFixed(2)}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center space-x-3">
            <BarChart3 className="h-6 w-6 text-purple-400" />
            <h2 className="text-xl font-bold text-white">Technical Analysis Dashboard</h2>
          </div>
          
          <button
            onClick={calculateTechnicalAnalysis}
            disabled={loading}
            className="flex items-center space-x-2 px-4 py-2 glass rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
          >
            <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            <span>Refresh</span>
          </button>
        </div>

        {/* Overall Technical Score */}
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
              {/* Score arc */}
              <motion.circle
                cx="60"
                cy="60"
                r="50"
                stroke={technicalScore.overall >= 70 ? '#10b981' : technicalScore.overall >= 50 ? '#f59e0b' : '#ef4444'}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(technicalScore.overall || 0) / 100 * 314} 314`}
                initial={{ strokeDasharray: "0 314" }}
                animate={{ strokeDasharray: `${(technicalScore.overall || 0) / 100 * 314} 314` }}
                transition={{ duration: 2, ease: "easeOut" }}
              />
            </svg>
            
            {/* Score value */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center">
                <div className={`text-2xl font-bold ${getScoreColor(technicalScore.overall || 0)}`}>
                  <CountUp end={technicalScore.overall || 0} duration={2} />
                </div>
                <div className="text-xs text-gray-400">Technical Score</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center p-3 glass rounded-lg">
              <div className={`text-lg font-bold ${getScoreColor(technicalScore.trend || 0)}`}>
                <CountUp end={technicalScore.trend || 0} duration={1.5} />
              </div>
              <div className="text-sm text-gray-400">Trend</div>
            </div>
            
            <div className="text-center p-3 glass rounded-lg">
              <div className={`text-lg font-bold ${getScoreColor(technicalScore.momentum || 0)}`}>
                <CountUp end={technicalScore.momentum || 0} duration={1.5} />
              </div>
              <div className="text-sm text-gray-400">Momentum</div>
            </div>
            
            <div className="text-center p-3 glass rounded-lg">
              <div className={`text-lg font-bold ${getScoreColor(technicalScore.volatility || 0)}`}>
                <CountUp end={technicalScore.volatility || 0} duration={1.5} />
              </div>
              <div className="text-sm text-gray-400">Volatility</div>
            </div>
            
            <div className="text-center p-3 glass rounded-lg">
              <div className={`text-lg font-bold ${getScoreColor(technicalScore.volume || 0)}`}>
                <CountUp end={technicalScore.volume || 0} duration={1.5} />
              </div>
              <div className="text-sm text-gray-400">Volume</div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Technical Indicators Grid */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Radar Chart */}
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-white mb-4">Technical Strength Radar</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <RadarChart data={radarData}>
                <PolarGrid stroke="rgba(255,255,255,0.1)" />
                <PolarAngleAxis dataKey="indicator" tick={{ fill: '#9ca3af', fontSize: 12 }} />
                <PolarRadiusAxis 
                  angle={90} 
                  domain={[0, 100]} 
                  tick={{ fill: '#9ca3af', fontSize: 10 }}
                />
                <Radar
                  name="Strength"
                  dataKey="value"
                  stroke="#8b5cf6"
                  fill="rgba(139, 92, 246, 0.2)"
                  strokeWidth={2}
                />
              </RadarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Indicator Signals */}
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-white mb-4">Indicator Signals</h3>
          <div className="space-y-3">
            {Object.entries(indicators).slice(0, 6).map(([name, indicator]: [string, any]) => {
              const SignalIcon = getSignalIcon(indicator.signal)
              return (
                <div key={name} className="flex items-center justify-between p-3 glass rounded-lg">
                  <div className="flex items-center space-x-3">
                    <SignalIcon className={`h-5 w-5 ${getSignalColor(indicator.signal)}`} />
                    <span className="font-medium text-white">{name.toUpperCase()}</span>
                  </div>
                  
                  <div className="flex items-center space-x-4">
                    <span className="text-gray-400 text-sm">
                      {typeof indicator.value === 'number' ? indicator.value.toFixed(2) : 'N/A'}
                    </span>
                    <span className={`px-2 py-1 rounded text-xs font-medium ${
                      indicator.signal === 'buy' ? 'bg-green-500/20 text-green-400' :
                      indicator.signal === 'sell' ? 'bg-red-500/20 text-red-400' :
                      'bg-yellow-500/20 text-yellow-400'
                    }`}>
                      {indicator.signal.toUpperCase()}
                    </span>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </motion.div>

      {/* Patterns and Levels */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
      >
        {/* Chart Patterns */}
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-white mb-4">Detected Patterns</h3>
          <div className="space-y-3">
            {patterns.length > 0 ? patterns.map((pattern, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-3 glass rounded-lg"
              >
                <div className="flex items-center justify-between mb-2">
                  <span className="font-medium text-white">{pattern.name}</span>
                  <span className={`px-2 py-1 rounded text-xs font-medium ${
                    pattern.type === 'bullish' ? 'bg-green-500/20 text-green-400' :
                    pattern.type === 'bearish' ? 'bg-red-500/20 text-red-400' :
                    'bg-yellow-500/20 text-yellow-400'
                  }`}>
                    {pattern.type}
                  </span>
                </div>
                <p className="text-sm text-gray-400">{pattern.description}</p>
                <div className="flex items-center justify-between mt-2">
                  <span className="text-xs text-gray-500">
                    Confidence: {(pattern.confidence * 100).toFixed(0)}%
                  </span>
                  {pattern.targetPrice && (
                    <span className="text-xs text-blue-400">
                      Target: ${pattern.targetPrice.toFixed(2)}
                    </span>
                  )}
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-8 text-gray-400">
                <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No patterns detected</p>
              </div>
            )}
          </div>
        </div>

        {/* Support & Resistance */}
        <div className="glass-card">
          <h3 className="text-lg font-semibold text-white mb-4">Support & Resistance</h3>
          <div className="space-y-3">
            {supportResistance.length > 0 ? supportResistance.slice(0, 6).map((level, index) => (
              <motion.div
                key={index}
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="flex items-center justify-between p-3 glass rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <div className={`w-3 h-3 rounded-full ${
                    level.type === 'support' ? 'bg-green-400' : 'bg-red-400'
                  }`}></div>
                  <span className="font-medium text-white">
                    {level.type === 'support' ? 'Support' : 'Resistance'}
                  </span>
                </div>
                
                <div className="text-right">
                  <div className="text-white font-medium">
                    ${level.levels[0]?.toFixed(2)}
                  </div>
                  <div className="text-xs text-gray-400">
                    Strength: {level.strength}/100
                  </div>
                </div>
              </motion.div>
            )) : (
              <div className="text-center py-8 text-gray-400">
                <Layers className="h-8 w-8 mx-auto mb-2 opacity-50" />
                <p>No levels detected</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Indicator Strength Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Indicator Strength Comparison</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={indicatorData}>
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
                dataKey="strength" 
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* Technical Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Technical Summary</h3>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-4 glass rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="font-medium text-white">Bullish Signals</span>
            </div>
            <p className="text-sm text-gray-400">
              {Object.values(indicators).filter((ind: any) => ind.signal === 'buy').length} indicators showing buy signals
            </p>
          </div>
          
          <div className="p-4 glass rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              <span className="font-medium text-white">Bearish Signals</span>
            </div>
            <p className="text-sm text-gray-400">
              {Object.values(indicators).filter((ind: any) => ind.signal === 'sell').length} indicators showing sell signals
            </p>
          </div>
          
          <div className="p-4 glass rounded-lg">
            <div className="flex items-center space-x-2 mb-2">
              <Activity className="h-5 w-5 text-yellow-400" />
              <span className="font-medium text-white">Neutral Signals</span>
            </div>
            <p className="text-sm text-gray-400">
              {Object.values(indicators).filter((ind: any) => ind.signal === 'neutral').length} indicators showing neutral signals
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
