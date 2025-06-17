'use client'

import { useState, useEffect, useRef } from 'react'
import { createChart, ColorType, IChartApi } from 'lightweight-charts'
import { useStock } from '@/contexts/StockContext'
import { Calendar, TrendingUp, BarChart3, Maximize2 } from 'lucide-react'

export default function StockChart() {
  const { state } = useStock()
  const chartContainerRef = useRef<HTMLDivElement>(null)
  const chartRef = useRef<IChartApi | null>(null)
  const [timeframe, setTimeframe] = useState('1D')
  const [chartType, setChartType] = useState<'candlestick' | 'line'>('candlestick')

  const timeframes = ['1D', '5D', '1M', '3M', '6M', '1Y', '5Y']

  // Generate sample data
  const generateSampleData = () => {
    const data = []
    const basePrice = 150
    let currentPrice = basePrice
    const now = Date.now()
    const interval = timeframe === '1D' ? 60000 : 86400000 // 1 minute or 1 day

    for (let i = 100; i >= 0; i--) {
      const timestamp = now - (i * interval)
      const volatility = Math.random() * 4 - 2
      currentPrice += volatility
      
      const open = currentPrice
      const high = currentPrice + Math.random() * 3
      const low = currentPrice - Math.random() * 3
      const close = low + Math.random() * (high - low)
      
      data.push({
        time: Math.floor(timestamp / 1000),
        open,
        high,
        low,
        close,
        value: close, // for line chart
      })
      
      currentPrice = close
    }
    
    return data
  }

  useEffect(() => {
    if (!chartContainerRef.current) return

    const chart = createChart(chartContainerRef.current, {
      layout: {
        background: { type: ColorType.Solid, color: 'transparent' },
        textColor: '#d1d5db',
      },
      grid: {
        vertLines: { color: 'rgba(255, 255, 255, 0.1)' },
        horzLines: { color: 'rgba(255, 255, 255, 0.1)' },
      },
      crosshair: {
        mode: 1,
      },
      rightPriceScale: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
      },
      timeScale: {
        borderColor: 'rgba(255, 255, 255, 0.2)',
        timeVisible: true,
        secondsVisible: false,
      },
      handleScroll: {
        mouseWheel: true,
        pressedMouseMove: true,
      },
      handleScale: {
        axisPressedMouseMove: true,
        mouseWheel: true,
        pinch: true,
      },
    })

    chartRef.current = chart

    const data = generateSampleData()

    if (chartType === 'candlestick') {
      const candlestickSeries = chart.addCandlestickSeries({
        upColor: '#22c55e',
        downColor: '#ef4444',
        borderDownColor: '#ef4444',
        borderUpColor: '#22c55e',
        wickDownColor: '#ef4444',
        wickUpColor: '#22c55e',
      })
      candlestickSeries.setData(data.map(d => ({
        time: d.time as any,
        open: d.open,
        high: d.high,
        low: d.low,
        close: d.close,
      })))
    } else {
      const lineSeries = chart.addLineSeries({
        color: '#3b82f6',
        lineWidth: 2,
      })
      lineSeries.setData(data.map(d => ({
        time: d.time as any,
        value: d.close
      })))
    }

    const handleResize = () => {
      if (chartContainerRef.current) {
        chart.applyOptions({
          width: chartContainerRef.current.clientWidth,
          height: chartContainerRef.current.clientHeight,
        })
      }
    }

    window.addEventListener('resize', handleResize)

    return () => {
      window.removeEventListener('resize', handleResize)
      chart.remove()
    }
  }, [timeframe, chartType])

  return (
    <div className="glass-card">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0">
        <div className="flex items-center space-x-4">
          <h2 className="text-xl font-bold text-white">{state.selectedStock} Chart</h2>
          <div className="flex items-center space-x-2">
            <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
            <span className="text-sm text-gray-400">Real-time</span>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          {/* Chart Type Toggle */}
          <div className="flex items-center space-x-2">
            <button
              onClick={() => setChartType('candlestick')}
              className={`p-2 rounded-md transition-colors ${
                chartType === 'candlestick'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <BarChart3 className="h-4 w-4" />
            </button>
            <button
              onClick={() => setChartType('line')}
              className={`p-2 rounded-md transition-colors ${
                chartType === 'line'
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <TrendingUp className="h-4 w-4" />
            </button>
          </div>

          {/* Fullscreen */}
          <button className="p-2 rounded-md text-gray-400 hover:text-white hover:bg-white/10 transition-colors">
            <Maximize2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Timeframe Selector */}
      <div className="flex items-center space-x-2 mb-6 overflow-x-auto">
        {timeframes.map((tf) => (
          <button
            key={tf}
            onClick={() => setTimeframe(tf)}
            className={`px-3 py-1 rounded-md text-sm font-medium transition-colors whitespace-nowrap ${
              timeframe === tf
                ? 'bg-blue-500 text-white'
                : 'text-gray-400 hover:text-white hover:bg-white/10'
            }`}
          >
            {tf}
          </button>
        ))}
      </div>

      {/* Chart Container */}
      <div className="relative">
        <div
          ref={chartContainerRef}
          className="w-full h-96 rounded-lg bg-black/20"
        />
        
        {/* Chart Overlay Info */}
        <div className="absolute top-4 left-4 glass rounded-lg p-3">
          <div className="flex items-center space-x-4 text-sm">
            <div>
              <span className="text-gray-400">Price: </span>
              <span className="text-white font-medium">$150.25</span>
            </div>
            <div>
              <span className="text-gray-400">Change: </span>
              <span className="text-green-400 font-medium">+2.45 (+1.66%)</span>
            </div>
            <div>
              <span className="text-gray-400">Volume: </span>
              <span className="text-white font-medium">45.2M</span>
            </div>
          </div>
        </div>
      </div>

      {/* Technical Indicators */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Technical Indicators</h3>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="text-center">
            <p className="text-sm text-gray-400">RSI (14)</p>
            <p className="text-lg font-bold text-yellow-400">65.4</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">MACD</p>
            <p className="text-lg font-bold text-green-400">+1.23</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">SMA (20)</p>
            <p className="text-lg font-bold text-blue-400">$148.50</p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Volume</p>
            <p className="text-lg font-bold text-purple-400">45.2M</p>
          </div>
        </div>
      </div>
    </div>
  )
}
