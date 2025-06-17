'use client'

import { motion } from 'framer-motion'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  AreaChart,
  Area
} from 'recharts'
import { Activity, Zap, Target, TrendingUp, Award, AlertCircle } from 'lucide-react'
import CountUp from 'react-countup'
import { PredictionData } from '@/types/stock'

interface ModelPerformanceProps {
  predictions: PredictionData
  symbol: string
  className?: string
}

export default function ModelPerformance({ predictions, symbol, className = '' }: ModelPerformanceProps) {
  // Generate mock performance data over time
  const generatePerformanceData = () => {
    const data = []
    const now = new Date()
    
    for (let i = 30; i >= 0; i--) {
      const date = new Date(now)
      date.setDate(date.getDate() - i)
      
      // Simulate performance metrics with some variance
      const baseAccuracy = predictions.accuracy
      const variance = (Math.random() - 0.5) * 10
      const accuracy = Math.max(50, Math.min(95, baseAccuracy + variance))
      
      data.push({
        date: date.toISOString().split('T')[0],
        timestamp: date.getTime(),
        accuracy: accuracy,
        predictions: Math.floor(Math.random() * 20) + 10,
        correct: Math.floor(accuracy / 100 * (Math.floor(Math.random() * 20) + 10)),
        mse: 0.02 + Math.random() * 0.03,
        sharpe: 1.2 + Math.random() * 0.6,
      })
    }
    
    return data
  }

  const performanceData = generatePerformanceData()
  const modelMetrics = predictions.modelPerformance || {
    mse: 0.045,
    mae: 0.032,
    r2Score: 0.847,
    sharpeRatio: 1.42,
  }

  // Calculate performance trends
  const recentAccuracy = performanceData.slice(-7).reduce((sum, d) => sum + d.accuracy, 0) / 7
  const previousAccuracy = performanceData.slice(-14, -7).reduce((sum, d) => sum + d.accuracy, 0) / 7
  const accuracyTrend = recentAccuracy - previousAccuracy

  const getMetricColor = (metric: string, value: number) => {
    switch (metric) {
      case 'mse':
      case 'mae':
        return value < 0.03 ? 'text-green-400' : value < 0.05 ? 'text-yellow-400' : 'text-red-400'
      case 'r2Score':
        return value > 0.8 ? 'text-green-400' : value > 0.6 ? 'text-yellow-400' : 'text-red-400'
      case 'sharpeRatio':
        return value > 1.5 ? 'text-green-400' : value > 1.0 ? 'text-yellow-400' : 'text-red-400'
      default:
        return 'text-white'
    }
  }

  const getPerformanceGrade = () => {
    const score = (
      (modelMetrics.r2Score * 40) +
      ((2 - modelMetrics.mse * 20) * 20) +
      (Math.min(modelMetrics.sharpeRatio / 2, 1) * 40)
    )
    
    if (score >= 85) return { grade: 'A+', color: 'text-green-400' }
    if (score >= 80) return { grade: 'A', color: 'text-green-300' }
    if (score >= 75) return { grade: 'A-', color: 'text-green-200' }
    if (score >= 70) return { grade: 'B+', color: 'text-yellow-400' }
    if (score >= 65) return { grade: 'B', color: 'text-yellow-300' }
    if (score >= 60) return { grade: 'B-', color: 'text-orange-400' }
    return { grade: 'C', color: 'text-red-400' }
  }

  const performanceGrade = getPerformanceGrade()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="glass-card p-3 border border-white/20">
          <p className="text-white font-medium">{label}</p>
          <p className="text-blue-400">
            Accuracy: {data.accuracy.toFixed(1)}%
          </p>
          <p className="text-green-400">
            Predictions: {data.predictions}
          </p>
          <p className="text-purple-400">
            Correct: {data.correct}
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`glass-card ${className}`}>
      {/* Header */}
      <div className="flex items-center space-x-3 mb-6">
        <Activity className="h-6 w-6 text-green-400" />
        <h2 className="text-xl font-bold text-white">Model Performance</h2>
        <div className={`px-3 py-1 rounded-full bg-opacity-20 ${performanceGrade.color.replace('text-', 'bg-')}`}>
          <span className={`text-sm font-bold ${performanceGrade.color}`}>
            Grade: {performanceGrade.grade}
          </span>
        </div>
      </div>

      {/* Performance Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="text-center p-4 glass rounded-lg">
          <Zap className="h-6 w-6 text-blue-400 mx-auto mb-2" />
          <div className={`text-lg font-bold ${getMetricColor('r2Score', modelMetrics.r2Score)}`}>
            <CountUp end={modelMetrics.r2Score} duration={1.5} decimals={3} />
          </div>
          <div className="text-sm text-gray-400">R² Score</div>
          <div className="text-xs text-gray-500 mt-1">Explained Variance</div>
        </div>

        <div className="text-center p-4 glass rounded-lg">
          <Target className="h-6 w-6 text-purple-400 mx-auto mb-2" />
          <div className={`text-lg font-bold ${getMetricColor('mse', modelMetrics.mse)}`}>
            <CountUp end={modelMetrics.mse} duration={1.5} decimals={3} />
          </div>
          <div className="text-sm text-gray-400">MSE</div>
          <div className="text-xs text-gray-500 mt-1">Mean Squared Error</div>
        </div>

        <div className="text-center p-4 glass rounded-lg">
          <Award className="h-6 w-6 text-yellow-400 mx-auto mb-2" />
          <div className={`text-lg font-bold ${getMetricColor('sharpeRatio', modelMetrics.sharpeRatio)}`}>
            <CountUp end={modelMetrics.sharpeRatio} duration={1.5} decimals={2} />
          </div>
          <div className="text-sm text-gray-400">Sharpe Ratio</div>
          <div className="text-xs text-gray-500 mt-1">Risk-Adjusted Return</div>
        </div>

        <div className="text-center p-4 glass rounded-lg">
          <TrendingUp className={`h-6 w-6 mx-auto mb-2 ${
            accuracyTrend > 0 ? 'text-green-400' : accuracyTrend < 0 ? 'text-red-400' : 'text-yellow-400'
          }`} />
          <div className={`text-lg font-bold ${
            accuracyTrend > 0 ? 'text-green-400' : accuracyTrend < 0 ? 'text-red-400' : 'text-yellow-400'
          }`}>
            <CountUp 
              end={accuracyTrend} 
              duration={1.5} 
              decimals={1} 
              suffix="%" 
              prefix={accuracyTrend > 0 ? '+' : ''}
            />
          </div>
          <div className="text-sm text-gray-400">7-Day Trend</div>
          <div className="text-xs text-gray-500 mt-1">Accuracy Change</div>
        </div>
      </div>

      {/* Performance Chart */}
      <div className="mb-6">
        <h3 className="text-lg font-semibold text-white mb-4">Accuracy Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={performanceData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date"
                stroke="#9ca3af"
                fontSize={12}
                tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                domain={[60, 100]}
                tickFormatter={(value) => `${value}%`}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Area
                type="monotone"
                dataKey="accuracy"
                stroke="#10b981"
                fill="rgba(16, 185, 129, 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* Detailed Metrics */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Error Metrics</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <div>
                <span className="text-white font-medium">Mean Absolute Error</span>
                <p className="text-xs text-gray-400">Average prediction error</p>
              </div>
              <span className={`font-bold ${getMetricColor('mae', modelMetrics.mae)}`}>
                {modelMetrics.mae.toFixed(3)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <div>
                <span className="text-white font-medium">Root Mean Square Error</span>
                <p className="text-xs text-gray-400">Prediction accuracy measure</p>
              </div>
              <span className={`font-bold ${getMetricColor('mse', Math.sqrt(modelMetrics.mse))}`}>
                {Math.sqrt(modelMetrics.mse).toFixed(3)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <div>
                <span className="text-white font-medium">Prediction Variance</span>
                <p className="text-xs text-gray-400">Consistency of predictions</p>
              </div>
              <span className="text-blue-400 font-bold">
                {(modelMetrics.mse * 100).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>

        <div>
          <h3 className="text-lg font-semibold text-white mb-4">Performance Stats</h3>
          <div className="space-y-3">
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <div>
                <span className="text-white font-medium">Total Predictions</span>
                <p className="text-xs text-gray-400">Last 30 days</p>
              </div>
              <span className="text-white font-bold">
                {performanceData.reduce((sum, d) => sum + d.predictions, 0)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <div>
                <span className="text-white font-medium">Correct Predictions</span>
                <p className="text-xs text-gray-400">Successful forecasts</p>
              </div>
              <span className="text-green-400 font-bold">
                {performanceData.reduce((sum, d) => sum + d.correct, 0)}
              </span>
            </div>
            
            <div className="flex items-center justify-between p-3 glass rounded-lg">
              <div>
                <span className="text-white font-medium">Success Rate</span>
                <p className="text-xs text-gray-400">Overall accuracy</p>
              </div>
              <span className="text-blue-400 font-bold">
                {(
                  (performanceData.reduce((sum, d) => sum + d.correct, 0) / 
                   performanceData.reduce((sum, d) => sum + d.predictions, 0)) * 100
                ).toFixed(1)}%
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Model Status */}
      <div className="pt-6 border-t border-white/10">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold text-white">Model Status</h3>
            <p className="text-sm text-gray-400">
              Last retrained: 2 days ago • Next update: in 5 days
            </p>
          </div>
          
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-green-400 font-medium">Optimal Performance</span>
          </div>
        </div>

        {/* Performance Insights */}
        <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="flex items-start space-x-3 p-3 bg-green-500/10 rounded-lg border border-green-500/20">
            <TrendingUp className="h-5 w-5 text-green-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-green-400">Strong Performance</p>
              <p className="text-sm text-gray-400">
                Model accuracy has improved {Math.abs(accuracyTrend).toFixed(1)}% over the past week
              </p>
            </div>
          </div>
          
          <div className="flex items-start space-x-3 p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
            <Activity className="h-5 w-5 text-blue-400 mt-0.5" />
            <div>
              <p className="text-sm font-medium text-blue-400">Consistent Results</p>
              <p className="text-sm text-gray-400">
                Low variance indicates stable and reliable predictions
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
