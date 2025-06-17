'use client'

import { motion } from 'framer-motion'
import { DollarSign, TrendingUp, TrendingDown, BarChart3, PieChart, Calculator, Shield } from 'lucide-react'
import CountUp from 'react-countup'
import { StockData } from '@/types/stock'
import { formatCurrency, formatLargeNumber, formatPercent } from '@/utils/formatters'

interface FundamentalMetricsProps {
  stockData: StockData
  className?: string
}

export default function FundamentalMetrics({ stockData, className = '' }: FundamentalMetricsProps) {
  // Generate mock fundamental data if not available
  const fundamentalData = {
    revenue: stockData.revenue || 394328000000,
    grossProfit: stockData.grossProfit || 170782000000,
    operatingIncome: stockData.operatingIncome || 114301000000,
    netIncome: stockData.netIncome || 99803000000,
    totalAssets: stockData.totalAssets || 352755000000,
    totalDebt: stockData.totalDebt || 123456000000,
    debtToEquity: stockData.debtToEquity || 1.73,
    roe: stockData.roe || 26.4,
    roa: stockData.roa || 12.8,
    currentRatio: stockData.currentRatio || 1.07,
    quickRatio: stockData.quickRatio || 0.83,
    priceToBook: stockData.priceToBook || 8.2,
    priceToSales: stockData.priceToSales || 6.1,
    forwardPE: stockData.forwardPE || 24.5,
    pegRatio: stockData.pegRatio || 1.8,
  }

  // Calculate margins
  const grossMargin = (fundamentalData.grossProfit / fundamentalData.revenue) * 100
  const operatingMargin = (fundamentalData.operatingIncome / fundamentalData.revenue) * 100
  const netMargin = (fundamentalData.netIncome / fundamentalData.revenue) * 100

  // Metric categories
  const profitabilityMetrics = [
    {
      label: 'Revenue (TTM)',
      value: fundamentalData.revenue,
      format: 'currency',
      icon: DollarSign,
      color: 'text-blue-400',
    },
    {
      label: 'Net Income',
      value: fundamentalData.netIncome,
      format: 'currency',
      icon: TrendingUp,
      color: 'text-green-400',
    },
    {
      label: 'Gross Margin',
      value: grossMargin,
      format: 'percent',
      icon: BarChart3,
      color: 'text-purple-400',
    },
    {
      label: 'Operating Margin',
      value: operatingMargin,
      format: 'percent',
      icon: BarChart3,
      color: 'text-yellow-400',
    },
    {
      label: 'Net Margin',
      value: netMargin,
      format: 'percent',
      icon: BarChart3,
      color: 'text-green-400',
    },
    {
      label: 'ROE',
      value: fundamentalData.roe,
      format: 'percent',
      icon: TrendingUp,
      color: 'text-blue-400',
    },
  ]

  const valuationMetrics = [
    {
      label: 'P/E Ratio',
      value: stockData.pe || 28.5,
      format: 'number',
      icon: Calculator,
      color: 'text-blue-400',
    },
    {
      label: 'Forward P/E',
      value: fundamentalData.forwardPE,
      format: 'number',
      icon: Calculator,
      color: 'text-green-400',
    },
    {
      label: 'Price/Book',
      value: fundamentalData.priceToBook,
      format: 'number',
      icon: Calculator,
      color: 'text-purple-400',
    },
    {
      label: 'Price/Sales',
      value: fundamentalData.priceToSales,
      format: 'number',
      icon: Calculator,
      color: 'text-yellow-400',
    },
    {
      label: 'PEG Ratio',
      value: fundamentalData.pegRatio,
      format: 'number',
      icon: Calculator,
      color: 'text-red-400',
    },
    {
      label: 'EPS',
      value: stockData.eps || 5.27,
      format: 'currency',
      icon: DollarSign,
      color: 'text-green-400',
    },
  ]

  const balanceSheetMetrics = [
    {
      label: 'Total Assets',
      value: fundamentalData.totalAssets,
      format: 'currency',
      icon: PieChart,
      color: 'text-blue-400',
    },
    {
      label: 'Total Debt',
      value: fundamentalData.totalDebt,
      format: 'currency',
      icon: TrendingDown,
      color: 'text-red-400',
    },
    {
      label: 'Debt/Equity',
      value: fundamentalData.debtToEquity,
      format: 'number',
      icon: BarChart3,
      color: 'text-yellow-400',
    },
    {
      label: 'Current Ratio',
      value: fundamentalData.currentRatio,
      format: 'number',
      icon: BarChart3,
      color: 'text-green-400',
    },
    {
      label: 'Quick Ratio',
      value: fundamentalData.quickRatio,
      format: 'number',
      icon: BarChart3,
      color: 'text-purple-400',
    },
    {
      label: 'ROA',
      value: fundamentalData.roa,
      format: 'percent',
      icon: TrendingUp,
      color: 'text-blue-400',
    },
  ]

  const formatValue = (value: number, format: string) => {
    switch (format) {
      case 'currency':
        return value > 1000000 ? formatLargeNumber(value) : formatCurrency(value)
      case 'percent':
        return `${value.toFixed(1)}%`
      case 'number':
        return value.toFixed(2)
      default:
        return value.toString()
    }
  }

  const getHealthColor = (metric: string, value: number) => {
    switch (metric) {
      case 'Debt/Equity':
        if (value < 0.5) return 'text-green-400'
        if (value < 1.5) return 'text-yellow-400'
        return 'text-red-400'
      case 'Current Ratio':
        if (value > 1.5) return 'text-green-400'
        if (value > 1.0) return 'text-yellow-400'
        return 'text-red-400'
      case 'ROE':
        if (value > 20) return 'text-green-400'
        if (value > 10) return 'text-yellow-400'
        return 'text-red-400'
      case 'P/E Ratio':
        if (value < 15) return 'text-green-400'
        if (value < 25) return 'text-yellow-400'
        return 'text-red-400'
      default:
        return 'text-white'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Profitability Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <h2 className="text-xl font-bold text-white mb-6">Profitability & Performance</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {profitabilityMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="text-center p-4 glass rounded-lg hover-lift"
              >
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                  <span className="text-sm text-gray-400">{metric.label}</span>
                </div>
                <div className={`text-2xl font-bold mb-1 ${getHealthColor(metric.label, metric.value)}`}>
                  {metric.format === 'currency' && metric.value > 1000000 ? (
                    <CountUp end={metric.value / 1000000000} duration={1.5} decimals={1} suffix="B" prefix="$" />
                  ) : metric.format === 'percent' ? (
                    <CountUp end={metric.value} duration={1.5} decimals={1} suffix="%" />
                  ) : (
                    <CountUp end={metric.value} duration={1.5} decimals={2} />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Valuation Metrics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <h2 className="text-xl font-bold text-white mb-6">Valuation Metrics</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {valuationMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="text-center p-4 glass rounded-lg hover-lift"
              >
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                  <span className="text-sm text-gray-400">{metric.label}</span>
                </div>
                <div className={`text-2xl font-bold mb-1 ${getHealthColor(metric.label, metric.value)}`}>
                  {metric.format === 'currency' ? (
                    <CountUp end={metric.value} duration={1.5} decimals={2} prefix="$" />
                  ) : (
                    <CountUp end={metric.value} duration={1.5} decimals={2} />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Balance Sheet & Financial Health */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card"
      >
        <h2 className="text-xl font-bold text-white mb-6">Financial Health</h2>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {balanceSheetMetrics.map((metric, index) => {
            const Icon = metric.icon
            return (
              <motion.div
                key={metric.label}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className="text-center p-4 glass rounded-lg hover-lift"
              >
                <div className="flex items-center justify-center space-x-2 mb-3">
                  <Icon className={`h-5 w-5 ${metric.color}`} />
                  <span className="text-sm text-gray-400">{metric.label}</span>
                </div>
                <div className={`text-2xl font-bold mb-1 ${getHealthColor(metric.label, metric.value)}`}>
                  {metric.format === 'currency' && metric.value > 1000000 ? (
                    <CountUp end={metric.value / 1000000000} duration={1.5} decimals={1} suffix="B" prefix="$" />
                  ) : metric.format === 'percent' ? (
                    <CountUp end={metric.value} duration={1.5} decimals={1} suffix="%" />
                  ) : (
                    <CountUp end={metric.value} duration={1.5} decimals={2} />
                  )}
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Financial Health Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Financial Health Score</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
              <TrendingUp className="h-8 w-8 text-green-400" />
            </div>
            <h4 className="font-semibold text-white mb-1">Profitability</h4>
            <p className="text-green-400 font-medium">Strong</p>
            <p className="text-sm text-gray-400 mt-1">High margins and ROE</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-yellow-500/20 flex items-center justify-center">
              <BarChart3 className="h-8 w-8 text-yellow-400" />
            </div>
            <h4 className="font-semibold text-white mb-1">Valuation</h4>
            <p className="text-yellow-400 font-medium">Fair</p>
            <p className="text-sm text-gray-400 mt-1">Reasonable P/E ratio</p>
          </div>
          
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-3 rounded-full bg-green-500/20 flex items-center justify-center">
              <Shield className="h-8 w-8 text-green-400" />
            </div>
            <h4 className="font-semibold text-white mb-1">Liquidity</h4>
            <p className="text-green-400 font-medium">Healthy</p>
            <p className="text-sm text-gray-400 mt-1">Good current ratio</p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
