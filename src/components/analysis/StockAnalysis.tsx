'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  DollarSign, 
  BarChart3, 
  Shield, 
  Target,
  AlertTriangle,
  ThumbsUp,
  ThumbsDown,
  Minus
} from 'lucide-react'
import CountUp from 'react-countup'
import { useStock } from '@/contexts/StockContext'
import { useStockData } from '@/hooks/useStockData'
import { formatCurrency, formatPercent, formatLargeNumber, getChangeColor } from '@/utils/formatters'
import InteractiveChart from './InteractiveChart'
import TechnicalIndicators from './TechnicalIndicators'
import FundamentalMetrics from './FundamentalMetrics'
import RiskAssessment from './RiskAssessment'
import SocialSentiment from './SocialSentiment'

interface StockAnalysisProps {
  symbol: string
  className?: string
}

export default function StockAnalysis({ symbol, className = '' }: StockAnalysisProps) {
  const { state } = useStock()
  const { stockData, chartData, loading, error } = useStockData(symbol)
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'fundamental' | 'risk'>('overview')

  if (loading) {
    return (
      <div className={`glass-card ${className}`}>
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-700/50 rounded w-1/3"></div>
          <div className="h-64 bg-gray-700/50 rounded"></div>
          <div className="grid grid-cols-3 gap-4">
            {Array.from({ length: 6 }).map((_, i) => (
              <div key={i} className="h-20 bg-gray-700/50 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  if (error || !stockData) {
    return (
      <div className={`glass-card text-center ${className}`}>
        <AlertTriangle className="h-12 w-12 text-red-400 mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-white mb-2">Unable to load stock data</h3>
        <p className="text-gray-400">{error || 'Please try again later'}</p>
      </div>
    )
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: BarChart3 },
    { id: 'technical', label: 'Technical', icon: Activity },
    { id: 'fundamental', label: 'Fundamental', icon: DollarSign },
    { id: 'risk', label: 'Risk', icon: Shield },
  ]

  const getRecommendationIcon = (rating?: string) => {
    switch (rating) {
      case 'Strong Buy':
      case 'Buy':
        return <ThumbsUp className="h-5 w-5 text-green-400" />
      case 'Strong Sell':
      case 'Sell':
        return <ThumbsDown className="h-5 w-5 text-red-400" />
      default:
        return <Minus className="h-5 w-5 text-yellow-400" />
    }
  }

  const getRecommendationColor = (rating?: string) => {
    switch (rating) {
      case 'Strong Buy':
      case 'Buy':
        return 'text-green-400 bg-green-500/20'
      case 'Strong Sell':
      case 'Sell':
        return 'text-red-400 bg-red-500/20'
      default:
        return 'text-yellow-400 bg-yellow-500/20'
    }
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Stock Header */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between space-y-4 lg:space-y-0">
          {/* Stock Info */}
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-xl flex items-center justify-center">
              <span className="text-white font-bold text-xl">{symbol.charAt(0)}</span>
            </div>
            
            <div>
              <h1 className="text-2xl font-bold text-white">{symbol}</h1>
              <p className="text-gray-400">{stockData.name}</p>
              <div className="flex items-center space-x-4 mt-2">
                <span className="text-sm text-gray-500">NASDAQ</span>
                <span className="text-sm text-gray-500">•</span>
                <span className="text-sm text-gray-500">USD</span>
              </div>
            </div>
          </div>

          {/* Price Info */}
          <div className="text-right">
            <div className="text-3xl font-bold text-white">
              <CountUp
                end={stockData.price}
                duration={1}
                decimals={2}
                prefix="$"
                preserveValue
              />
            </div>
            <div className={`flex items-center justify-end space-x-2 ${getChangeColor(stockData.change)}`}>
              {stockData.change >= 0 ? (
                <TrendingUp className="h-4 w-4" />
              ) : (
                <TrendingDown className="h-4 w-4" />
              )}
              <span className="font-medium">
                {formatCurrency(Math.abs(stockData.change))} ({formatPercent(stockData.changePercent)})
              </span>
            </div>
            <p className="text-sm text-gray-400 mt-1">
              Last updated: {new Date(stockData.timestamp).toLocaleTimeString()}
            </p>
          </div>
        </div>

        {/* Quick Stats */}
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-4 mt-6 pt-6 border-t border-white/10">
          <div className="text-center">
            <p className="text-sm text-gray-400">Volume</p>
            <p className="text-lg font-semibold text-white">
              {formatLargeNumber(stockData.volume)}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Market Cap</p>
            <p className="text-lg font-semibold text-white">
              {stockData.marketCap ? formatLargeNumber(stockData.marketCap) : 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">P/E Ratio</p>
            <p className="text-lg font-semibold text-white">
              {stockData.pe ? stockData.pe.toFixed(2) : 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">52W High</p>
            <p className="text-lg font-semibold text-white">
              {stockData.high52Week ? formatCurrency(stockData.high52Week) : 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">52W Low</p>
            <p className="text-lg font-semibold text-white">
              {stockData.low52Week ? formatCurrency(stockData.low52Week) : 'N/A'}
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-400">Dividend</p>
            <p className="text-lg font-semibold text-white">
              {stockData.dividendYield ? `${stockData.dividendYield.toFixed(2)}%` : 'N/A'}
            </p>
          </div>
        </div>

        {/* Analyst Recommendation */}
        {stockData.analystRating && (
          <div className="mt-6 pt-6 border-t border-white/10">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {getRecommendationIcon(stockData.analystRating)}
                <div>
                  <p className="text-sm text-gray-400">Analyst Recommendation</p>
                  <p className={`font-semibold px-3 py-1 rounded-full text-sm ${getRecommendationColor(stockData.analystRating)}`}>
                    {stockData.analystRating}
                  </p>
                </div>
              </div>
              
              {stockData.analystTargetPrice && (
                <div className="text-right">
                  <p className="text-sm text-gray-400">Price Target</p>
                  <p className="text-lg font-semibold text-blue-400">
                    {formatCurrency(stockData.analystTargetPrice)}
                  </p>
                  <p className="text-sm text-gray-400">
                    {formatPercent(((stockData.analystTargetPrice - stockData.price) / stockData.price) * 100)} upside
                  </p>
                </div>
              )}
            </div>
          </div>
        )}
      </motion.div>

      {/* Navigation Tabs */}
      <div className="flex space-x-1 glass rounded-lg p-1">
        {tabs.map((tab) => {
          const Icon = tab.icon
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex-1 flex items-center justify-center space-x-2 py-3 px-4 rounded-md text-sm font-medium transition-all ${
                activeTab === tab.id
                  ? 'bg-blue-500 text-white'
                  : 'text-gray-400 hover:text-white hover:bg-white/10'
              }`}
            >
              <Icon className="h-4 w-4" />
              <span className="hidden sm:block">{tab.label}</span>
            </button>
          )
        })}
      </div>

      {/* Tab Content */}
      <motion.div
        key={activeTab}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
      >
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <InteractiveChart symbol={symbol} data={chartData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <SocialSentiment symbol={symbol} sentiment={stockData.socialSentiment} />
              <RiskAssessment symbol={symbol} riskLevel={stockData.riskLevel} />
            </div>
          </div>
        )}

        {activeTab === 'technical' && (
          <TechnicalIndicators symbol={symbol} data={chartData} />
        )}

        {activeTab === 'fundamental' && (
          <FundamentalMetrics stockData={stockData} />
        )}

        {activeTab === 'risk' && (
          <RiskAssessment symbol={symbol} riskLevel={stockData.riskLevel} detailed />
        )}
      </motion.div>
    </div>
  )
}
