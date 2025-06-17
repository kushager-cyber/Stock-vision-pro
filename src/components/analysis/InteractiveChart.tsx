'use client'

import { useState, useEffect, useMemo } from 'react'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler,
} from 'chart.js'
import { Line, Bar } from 'react-chartjs-2'
import 'chartjs-adapter-date-fns'
import { motion } from 'framer-motion'
import { BarChart3, TrendingUp, Calendar, Maximize2 } from 'lucide-react'
import { ChartData } from '@/types/stock'
import { formatCurrency } from '@/utils/formatters'

// Register Chart.js components
ChartJS.register(
  CategoryScale,
  LinearScale,
  PointElement,
  LineElement,
  BarElement,
  Title,
  Tooltip,
  Legend,
  TimeScale,
  Filler
)

interface InteractiveChartProps {
  symbol: string
  data: ChartData[]
  className?: string
}

export default function InteractiveChart({ symbol, data, className = '' }: InteractiveChartProps) {
  const [timeframe, setTimeframe] = useState('1M')
  const [chartType, setChartType] = useState<'line' | 'candlestick' | 'volume'>('line')
  const [isFullscreen, setIsFullscreen] = useState(false)

  const timeframes = [
    { label: '1D', value: '1D' },
    { label: '1W', value: '1W' },
    { label: '1M', value: '1M' },
    { label: '6M', value: '6M' },
    { label: '1Y', value: '1Y' },
  ]

  // Process data based on timeframe
  const processedData = useMemo(() => {
    if (!data || data.length === 0) return []
    
    // For demo, return all data - in production, filter by timeframe
    return data.map(item => ({
      ...item,
      date: new Date(item.timestamp * 1000),
    }))
  }, [data, timeframe])

  // Chart data configuration
  const chartData = useMemo(() => {
    if (chartType === 'volume') {
      return {
        labels: processedData.map(item => item.date),
        datasets: [
          {
            label: 'Volume',
            data: processedData.map(item => item.volume),
            backgroundColor: 'rgba(59, 130, 246, 0.3)',
            borderColor: 'rgba(59, 130, 246, 1)',
            borderWidth: 1,
          },
        ],
      }
    }

    // Price chart (line or candlestick)
    return {
      labels: processedData.map(item => item.date),
      datasets: [
        {
          label: `${symbol} Price`,
          data: processedData.map(item => item.close),
          borderColor: 'rgba(34, 197, 94, 1)',
          backgroundColor: 'rgba(34, 197, 94, 0.1)',
          borderWidth: 2,
          fill: chartType === 'line',
          tension: 0.1,
          pointRadius: 0,
          pointHoverRadius: 6,
          pointHoverBackgroundColor: 'rgba(34, 197, 94, 1)',
          pointHoverBorderColor: '#ffffff',
          pointHoverBorderWidth: 2,
        },
      ],
    }
  }, [processedData, symbol, chartType])

  // Chart options
  const chartOptions = useMemo(() => ({
    responsive: true,
    maintainAspectRatio: false,
    interaction: {
      intersect: false,
      mode: 'index' as const,
    },
    plugins: {
      legend: {
        display: false,
      },
      tooltip: {
        backgroundColor: 'rgba(15, 23, 42, 0.9)',
        titleColor: '#ffffff',
        bodyColor: '#ffffff',
        borderColor: 'rgba(255, 255, 255, 0.1)',
        borderWidth: 1,
        cornerRadius: 8,
        displayColors: false,
        callbacks: {
          title: (context: any) => {
            return new Date(context[0].parsed.x).toLocaleDateString()
          },
          label: (context: any) => {
            if (chartType === 'volume') {
              return `Volume: ${context.parsed.y.toLocaleString()}`
            }
            return `Price: ${formatCurrency(context.parsed.y)}`
          },
        },
      },
    },
    scales: {
      x: {
        type: 'time' as const,
        time: {
          displayFormats: {
            day: 'MMM dd',
            week: 'MMM dd',
            month: 'MMM yyyy',
          },
        },
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
          maxTicksLimit: 8,
        },
      },
      y: {
        grid: {
          color: 'rgba(255, 255, 255, 0.1)',
        },
        ticks: {
          color: '#9ca3af',
          callback: function(value: any) {
            if (chartType === 'volume') {
              return value.toLocaleString()
            }
            return formatCurrency(value)
          },
        },
      },
    },
    elements: {
      point: {
        hoverRadius: 8,
      },
    },
  }), [chartType])

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`glass-card ${className} ${isFullscreen ? 'fixed inset-4 z-50' : ''}`}
    >
      {/* Chart Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-white">{symbol} Price Chart</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Live Data</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Chart Type Toggle */}
          <div className="flex items-center space-x-1 bg-white/5 rounded-lg p-1">
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-md transition-colors ${
                chartType === 'line'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Line Chart"
            >
              <TrendingUp className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('volume')}
              className={`p-2 rounded-md transition-colors ${
                chartType === 'volume'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
              title="Volume Chart"
            >
              <BarChart3 className="h-4 w-4" />
            </button>
          </div>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors"
            title="Toggle Fullscreen"
          >
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto">
        {timeframes.map((tf) => (
          <button
            key={tf.value}
            onClick={() => setTimeframe(tf.value)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              timeframe === tf.value
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tf.label}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className={`relative ${isFullscreen ? 'h-full' : 'h-96'}`}>
        {processedData.length > 0 ? (
          chartType === 'volume' ? (
            <Bar data={chartData} options={chartOptions} />
          ) : (
            <Line data={chartData} options={chartOptions} />
          )
        ) : (
          <div className="flex items-center justify-center h-full">
            <div className="text-center">
              <Calendar className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-white mb-2">No Data Available</h3>
              <p className="text-gray-400">Chart data is loading or unavailable for this timeframe.</p>
            </div>
          </div>
        )}
      </div>

      {/* Chart Stats */}
      {processedData.length > 0 && (
        <div className="mt-6 pt-6 border-t border-white/10">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="text-center">
              <p className="text-sm text-gray-400">Open</p>
              <p className="text-lg font-bold text-white">
                {formatCurrency(processedData[0]?.open || 0)}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">High</p>
              <p className="text-lg font-bold text-green-400">
                {formatCurrency(Math.max(...processedData.map(d => d.high)))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Low</p>
              <p className="text-lg font-bold text-red-400">
                {formatCurrency(Math.min(...processedData.map(d => d.low)))}
              </p>
            </div>
            <div className="text-center">
              <p className="text-sm text-gray-400">Close</p>
              <p className="text-lg font-bold text-white">
                {formatCurrency(processedData[processedData.length - 1]?.close || 0)}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Fullscreen Overlay */}
      {isFullscreen && (
        <div
          className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
          onClick={() => setIsFullscreen(false)}
        />
      )}
    </motion.div>
  )
}
