'use client'

import { useState, useEffect, useMemo } from 'react'
import { motion } from 'framer-motion'
import { Line } from 'react-chartjs-2'
import { Activity, TrendingUp, TrendingDown, BarChart3, Target } from 'lucide-react'
import CountUp from 'react-countup'
import { ChartData } from '@/types/stock'
import { mlService } from '@/services/mlService'

interface TechnicalIndicatorsProps {
  symbol: string
  data: ChartData[]
  className?: string
}

interface TechnicalData {
  rsi: number
  macd: {
    macd: number
    signal: number
    histogram: number
  }
  sma20: number
  sma50: number
  sma200: number
  bollinger: {
    upper: number
    middle: number
    lower: number
  }
  support: number[]
  resistance: number[]
}

export default function TechnicalIndicators({ symbol, data, className = '' }: TechnicalIndicatorsProps) {
  const [technicalData, setTechnicalData] = useState<TechnicalData | null>(null)
  const [selectedIndicator, setSelectedIndicator] = useState<'rsi' | 'macd' | 'bollinger' | 'sma'>('rsi')

  useEffect(() => {
    const calculateIndicators = async () => {
      if (data && data.length > 0) {
        try {
          const indicators = await mlService.calculateTechnicalIndicators(data)
          setTechnicalData(indicators)
        } catch (error) {
          console.error('Error calculating technical indicators:', error)
        }
      }
    }

    calculateIndicators()
  }, [data])

  // RSI interpretation
  const getRSISignal = (rsi: number) => {
    if (rsi > 70) return { signal: 'Overbought', color: 'text-red-400', icon: TrendingDown }
    if (rsi < 30) return { signal: 'Oversold', color: 'text-green-400', icon: TrendingUp }
    return { signal: 'Neutral', color: 'text-yellow-400', icon: Activity }
  }

  // MACD interpretation
  const getMACDSignal = (macd: number, signal: number) => {
    if (macd > signal) return { signal: 'Bullish', color: 'text-green-400', icon: TrendingUp }
    return { signal: 'Bearish', color: 'text-red-400', icon: TrendingDown }
  }

  // Moving Average interpretation
  const getSMASignal = (price: number, sma20: number, sma50: number) => {
    if (price > sma20 && sma20 > sma50) return { signal: 'Strong Bullish', color: 'text-green-400' }
    if (price > sma20) return { signal: 'Bullish', color: 'text-green-300' }
    if (price < sma20 && sma20 < sma50) return { signal: 'Strong Bearish', color: 'text-red-400' }
    return { signal: 'Bearish', color: 'text-red-300' }
  }

  // Chart data for selected indicator
  const chartData = useMemo(() => {
    if (!data || !technicalData) return null

    const labels = data.map(item => new Date(item.timestamp * 1000))
    
    switch (selectedIndicator) {
      case 'rsi':
        return {
          labels,
          datasets: [
            {
              label: 'RSI',
              data: data.map(() => technicalData.rsi), // Simplified - in real app, calculate for each point
              borderColor: 'rgba(147, 51, 234, 1)',
              backgroundColor: 'rgba(147, 51, 234, 0.1)',
              borderWidth: 2,
              fill: false,
            },
            {
              label: 'Overbought (70)',
              data: data.map(() => 70),
              borderColor: 'rgba(239, 68, 68, 0.5)',
              borderDash: [5, 5],
              borderWidth: 1,
              pointRadius: 0,
            },
            {
              label: 'Oversold (30)',
              data: data.map(() => 30),
              borderColor: 'rgba(34, 197, 94, 0.5)',
              borderDash: [5, 5],
              borderWidth: 1,
              pointRadius: 0,
            },
          ],
        }
      
      case 'macd':
        return {
          labels,
          datasets: [
            {
              label: 'MACD',
              data: data.map(() => technicalData.macd.macd),
              borderColor: 'rgba(59, 130, 246, 1)',
              backgroundColor: 'rgba(59, 130, 246, 0.1)',
              borderWidth: 2,
              fill: false,
            },
            {
              label: 'Signal',
              data: data.map(() => technicalData.macd.signal),
              borderColor: 'rgba(239, 68, 68, 1)',
              backgroundColor: 'rgba(239, 68, 68, 0.1)',
              borderWidth: 2,
              fill: false,
            },
          ],
        }
      
      case 'bollinger':
        return {
          labels,
          datasets: [
            {
              label: 'Price',
              data: data.map(item => item.close),
              borderColor: 'rgba(255, 255, 255, 1)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 2,
              fill: false,
            },
            {
              label: 'Upper Band',
              data: data.map(() => technicalData.bollinger.upper),
              borderColor: 'rgba(239, 68, 68, 0.7)',
              borderWidth: 1,
              fill: false,
            },
            {
              label: 'Middle Band (SMA)',
              data: data.map(() => technicalData.bollinger.middle),
              borderColor: 'rgba(59, 130, 246, 0.7)',
              borderWidth: 1,
              fill: false,
            },
            {
              label: 'Lower Band',
              data: data.map(() => technicalData.bollinger.lower),
              borderColor: 'rgba(34, 197, 94, 0.7)',
              borderWidth: 1,
              fill: false,
            },
          ],
        }
      
      case 'sma':
        return {
          labels,
          datasets: [
            {
              label: 'Price',
              data: data.map(item => item.close),
              borderColor: 'rgba(255, 255, 255, 1)',
              backgroundColor: 'rgba(255, 255, 255, 0.1)',
              borderWidth: 2,
              fill: false,
            },
            {
              label: 'SMA 20',
              data: data.map(() => technicalData.sma20),
              borderColor: 'rgba(34, 197, 94, 1)',
              borderWidth: 2,
              fill: false,
            },
            {
              label: 'SMA 50',
              data: data.map(() => technicalData.sma50),
              borderColor: 'rgba(59, 130, 246, 1)',
              borderWidth: 2,
              fill: false,
            },
            {
              label: 'SMA 200',
              data: data.map(() => technicalData.sma200),
              borderColor: 'rgba(239, 68, 68, 1)',
              borderWidth: 2,
              fill: false,
            },
          ],
        }
      
      default:
        return null
    }
  }, [data, technicalData, selectedIndicator])

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        display: true,
        labels: {
          color: '#9ca3af',
          usePointStyle: true,
        },
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
      },
    },
    scales: {
      x: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#9ca3af' },
      },
      y: {
        grid: { color: 'rgba(255, 255, 255, 0.1)' },
        ticks: { color: '#9ca3af' },
      },
    },
  }

  if (!technicalData) {
    return (
      <div className={`glass-card ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-6 bg-gray-700/50 rounded w-1/3"></div>
          <div className="h-64 bg-gray-700/50 rounded"></div>
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-700/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  const currentPrice = data[data.length - 1]?.close || 0
  const rsiSignal = getRSISignal(technicalData.rsi)
  const macdSignal = getMACDSignal(technicalData.macd.macd, technicalData.macd.signal)
  const smaSignal = getSMASignal(currentPrice, technicalData.sma20, technicalData.sma50)

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Technical Indicators Overview */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h2 className="text-xl font-bold text-white mb-6">Technical Indicators</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* RSI */}
          <div className="text-center p-4 glass rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <rsiSignal.icon className={`h-5 w-5 ${rsiSignal.color}`} />
              <span className="text-sm text-gray-400">RSI (14)</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              <CountUp end={technicalData.rsi} duration={1} decimals={1} />
            </div>
            <span className={`text-sm font-medium ${rsiSignal.color}`}>
              {rsiSignal.signal}
            </span>
          </div>

          {/* MACD */}
          <div className="text-center p-4 glass rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <macdSignal.icon className={`h-5 w-5 ${macdSignal.color}`} />
              <span className="text-sm text-gray-400">MACD</span>
            </div>
            <div className="text-2xl font-bold text-white mb-1">
              <CountUp end={technicalData.macd.macd} duration={1} decimals={2} />
            </div>
            <span className={`text-sm font-medium ${macdSignal.color}`}>
              {macdSignal.signal}
            </span>
          </div>

          {/* Moving Averages */}
          <div className="text-center p-4 glass rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className={`h-5 w-5 ${smaSignal.color}`} />
              <span className="text-sm text-gray-400">SMA Trend</span>
            </div>
            <div className="text-lg font-bold text-white mb-1">
              20: <CountUp end={technicalData.sma20} duration={1} decimals={2} prefix="$" />
            </div>
            <span className={`text-sm font-medium ${smaSignal.color}`}>
              {smaSignal.signal}
            </span>
          </div>

          {/* Bollinger Bands */}
          <div className="text-center p-4 glass rounded-lg">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <Target className="h-5 w-5 text-purple-400" />
              <span className="text-sm text-gray-400">Bollinger</span>
            </div>
            <div className="text-sm text-white space-y-1">
              <div>Upper: <CountUp end={technicalData.bollinger.upper} duration={1} decimals={2} prefix="$" /></div>
              <div>Lower: <CountUp end={technicalData.bollinger.lower} duration={1} decimals={2} prefix="$" /></div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Interactive Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        {/* Chart Controls */}
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Indicator Chart</h3>
          
          <div className="flex space-x-1 bg-white/5 rounded-lg p-1">
            {[
              { id: 'rsi', label: 'RSI' },
              { id: 'macd', label: 'MACD' },
              { id: 'bollinger', label: 'Bollinger' },
              { id: 'sma', label: 'SMA' },
            ].map((indicator) => (
              <button
                key={indicator.id}
                onClick={() => setSelectedIndicator(indicator.id as any)}
                className={`px-3 py-1 rounded-md text-sm font-medium transition-colors ${
                  selectedIndicator === indicator.id
                    ? 'bg-blue-500 text-white'
                    : 'text-gray-400 hover:text-white hover:bg-white/10'
                }`}
              >
                {indicator.label}
              </button>
            ))}
          </div>
        </div>

        {/* Chart */}
        <div className="h-64">
          {chartData && <Line data={chartData} options={chartOptions} />}
        </div>
      </motion.div>
    </div>
  )
}
