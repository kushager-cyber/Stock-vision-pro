'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Area,
  AreaChart,
  ReferenceLine,
  Brush
} from 'recharts'
import { Calendar, TrendingUp, Target, BarChart3 } from 'lucide-react'
import { PredictionData } from '@/types/stock'
import { formatCurrency, formatPercent } from '@/utils/formatters'

interface PredictionTimelineProps {
  predictions: PredictionData
  selectedTimeframe: string
  className?: string
}

export default function PredictionTimeline({ 
  predictions, 
  selectedTimeframe, 
  className = '' 
}: PredictionTimelineProps) {
  const [viewMode, setViewMode] = useState<'timeline' | 'distribution' | 'confidence'>('timeline')

  // Generate timeline data
  const generateTimelineData = () => {
    const data = []
    const now = new Date()
    const currentPrice = predictions.currentPrice

    // Add current point
    data.push({
      date: now.toISOString(),
      timestamp: now.getTime(),
      actual: currentPrice,
      predicted: currentPrice,
      confidence: 100,
      upper: currentPrice,
      lower: currentPrice,
    })

    // Add prediction points
    predictions.predictions.forEach((pred, index) => {
      const futureDate = new Date(now)
      
      // Calculate future date based on timeframe
      switch (pred.timeframe) {
        case '1d':
          futureDate.setDate(now.getDate() + 1)
          break
        case '1w':
          futureDate.setDate(now.getDate() + 7)
          break
        case '1m':
          futureDate.setMonth(now.getMonth() + 1)
          break
        case '3m':
          futureDate.setMonth(now.getMonth() + 3)
          break
        case '6m':
          futureDate.setMonth(now.getMonth() + 6)
          break
        case '1y':
          futureDate.setFullYear(now.getFullYear() + 1)
          break
      }

      const confidenceRange = pred.predictedPrice * (1 - pred.confidence / 100) * 0.1
      
      data.push({
        date: futureDate.toISOString(),
        timestamp: futureDate.getTime(),
        actual: null,
        predicted: pred.predictedPrice,
        confidence: pred.confidence,
        upper: pred.predictedPrice + confidenceRange,
        lower: pred.predictedPrice - confidenceRange,
        timeframe: pred.timeframe,
        direction: pred.direction,
      })
    })

    return data.sort((a, b) => a.timestamp - b.timestamp)
  }

  // Generate probability distribution data
  const generateDistributionData = () => {
    const selectedPred = predictions.predictions.find(p => p.timeframe === selectedTimeframe)
    if (!selectedPred || !selectedPred.probabilityDistribution) {
      // Generate mock distribution
      const data = []
      const mean = selectedPred?.predictedPrice || predictions.currentPrice
      const std = mean * 0.1 // 10% standard deviation
      
      for (let i = -3; i <= 3; i += 0.1) {
        const price = mean + (i * std)
        const probability = Math.exp(-0.5 * i * i) / Math.sqrt(2 * Math.PI)
        data.push({
          price: price,
          probability: probability * 100,
          priceLabel: formatCurrency(price),
        })
      }
      return data
    }
    
    return selectedPred.probabilityDistribution.map(point => ({
      price: point.price,
      probability: point.probability * 100,
      priceLabel: formatCurrency(point.price),
    }))
  }

  const timelineData = generateTimelineData()
  const distributionData = generateDistributionData()

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      return (
        <div className="glass-card p-3 border border-white/20">
          <p className="text-white font-medium">
            {new Date(label).toLocaleDateString()}
          </p>
          {data.predicted && (
            <p className="text-blue-400">
              Predicted: {formatCurrency(data.predicted)}
            </p>
          )}
          {data.actual && (
            <p className="text-white">
              Actual: {formatCurrency(data.actual)}
            </p>
          )}
          {data.confidence && (
            <p className="text-green-400">
              Confidence: {data.confidence.toFixed(1)}%
            </p>
          )}
        </div>
      )
    }
    return null
  }

  const DistributionTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-white/20">
          <p className="text-white font-medium">{formatCurrency(label)}</p>
          <p className="text-blue-400">
            Probability: {payload[0].value.toFixed(2)}%
          </p>
        </div>
      )
    }
    return null
  }

  return (
    <div className={`glass-card ${className}`}>
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-3">
          <Calendar className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Prediction Timeline</h2>
        </div>

        {/* View Mode Toggle */}
        <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
          {[
            { id: 'timeline', label: 'Timeline', icon: TrendingUp },
            { id: 'distribution', label: 'Distribution', icon: BarChart3 },
            { id: 'confidence', label: 'Confidence', icon: Target },
          ].map((mode) => {
            const Icon = mode.icon
            return (
              <button
                key={mode.id}
                onClick={() => setViewMode(mode.id as any)}
                className={`flex items-center space-x-2 px-3 py-2 rounded-md text-sm font-medium transition-colors ${
                  viewMode === mode.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                <Icon className="h-4 w-4" />
                <span className="hidden sm:block">{mode.label}</span>
              </button>
            )
          })}
        </div>
      </div>

      {/* Chart Container */}
      <div className="h-96">
        {viewMode === 'timeline' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                stroke="#9ca3af"
              />
              <YAxis 
                stroke="#9ca3af"
                tickFormatter={(value) => formatCurrency(value)}
              />
              <Tooltip content={<CustomTooltip />} />
              
              {/* Confidence bands */}
              <Area
                type="monotone"
                dataKey="upper"
                stroke="none"
                fill="rgba(59, 130, 246, 0.1)"
                fillOpacity={0.3}
              />
              <Area
                type="monotone"
                dataKey="lower"
                stroke="none"
                fill="rgba(59, 130, 246, 0.1)"
                fillOpacity={0.3}
              />
              
              {/* Current price reference line */}
              <ReferenceLine
                y={predictions.currentPrice}
                stroke="#6b7280"
                strokeDasharray="5 5"
                label={{ value: "Current", position: "top" }}
              />
              
              {/* Actual price line */}
              <Line
                type="monotone"
                dataKey="actual"
                stroke="#ffffff"
                strokeWidth={3}
                dot={{ fill: '#ffffff', strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
              
              {/* Predicted price line */}
              <Line
                type="monotone"
                dataKey="predicted"
                stroke="#3b82f6"
                strokeWidth={2}
                strokeDasharray="5 5"
                dot={{ fill: '#3b82f6', strokeWidth: 2, r: 4 }}
                connectNulls={false}
              />
            </LineChart>
          </ResponsiveContainer>
        )}

        {viewMode === 'distribution' && (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={distributionData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="price"
                stroke="#9ca3af"
                tickFormatter={(value) => formatCurrency(value)}
              />
              <YAxis 
                stroke="#9ca3af"
                label={{ value: 'Probability (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<DistributionTooltip />} />
              
              <Area
                type="monotone"
                dataKey="probability"
                stroke="#8b5cf6"
                fill="rgba(139, 92, 246, 0.3)"
                strokeWidth={2}
              />
              
              {/* Current price reference */}
              <ReferenceLine 
                x={predictions.currentPrice} 
                stroke="#ffffff" 
                strokeDasharray="5 5"
                label={{ value: "Current", position: "top" }}
              />
              
              {/* Predicted price reference */}
              {predictions.predictions.find(p => p.timeframe === selectedTimeframe) && (
                <ReferenceLine 
                  x={predictions.predictions.find(p => p.timeframe === selectedTimeframe)!.predictedPrice} 
                  stroke="#3b82f6" 
                  strokeDasharray="5 5"
                  label={{ value: "Predicted", position: "top" }}
                />
              )}
            </AreaChart>
          </ResponsiveContainer>
        )}

        {viewMode === 'confidence' && (
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={timelineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="timestamp"
                type="number"
                scale="time"
                domain={['dataMin', 'dataMax']}
                tickFormatter={(value) => new Date(value).toLocaleDateString()}
                stroke="#9ca3af"
              />
              <YAxis 
                stroke="#9ca3af"
                domain={[0, 100]}
                label={{ value: 'Confidence (%)', angle: -90, position: 'insideLeft' }}
              />
              <Tooltip content={<CustomTooltip />} />
              
              <Line
                type="monotone"
                dataKey="confidence"
                stroke="#10b981"
                strokeWidth={3}
                dot={{ fill: '#10b981', strokeWidth: 2, r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Legend */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-white"></div>
            <span className="text-gray-400">Actual Price</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-blue-400 border-dashed border-t-2"></div>
            <span className="text-gray-400">Predicted Price</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-2 bg-blue-400 opacity-30"></div>
            <span className="text-gray-400">Confidence Band</span>
          </div>
          <div className="flex items-center space-x-2">
            <div className="w-4 h-0.5 bg-gray-400 border-dashed border-t-2"></div>
            <span className="text-gray-400">Current Price</span>
          </div>
        </div>
      </div>
    </div>
  )
}
