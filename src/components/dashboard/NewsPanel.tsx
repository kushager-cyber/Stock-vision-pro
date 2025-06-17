'use client'

import { useState } from 'react'
import { Newspaper, ExternalLink, TrendingUp, TrendingDown, Clock, Filter } from 'lucide-react'
import { motion } from 'framer-motion'

export default function NewsPanel() {
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'neutral'>('all')

  const newsItems = [
    {
      id: '1',
      title: 'Apple Reports Strong Q4 Earnings, Beats Expectations',
      summary: 'Apple Inc. reported quarterly earnings that exceeded analyst expectations, driven by strong iPhone sales and services revenue growth.',
      source: 'Reuters',
      publishedAt: Date.now() - 1800000, // 30 minutes ago
      sentiment: 'positive' as const,
      relevantSymbols: ['AAPL'],
      url: '#',
    },
    {
      id: '2',
      title: 'Federal Reserve Signals Potential Rate Cuts',
      summary: 'The Federal Reserve indicated it may consider interest rate cuts in the coming months, citing economic uncertainty.',
      source: 'Bloomberg',
      publishedAt: Date.now() - 3600000, // 1 hour ago
      sentiment: 'neutral' as const,
      relevantSymbols: ['SPY', 'QQQ'],
      url: '#',
    },
    {
      id: '3',
      title: 'Tech Stocks Face Pressure Amid Regulatory Concerns',
      summary: 'Major technology companies are facing increased scrutiny from regulators, leading to volatility in tech stock prices.',
      source: 'CNBC',
      publishedAt: Date.now() - 7200000, // 2 hours ago
      sentiment: 'negative' as const,
      relevantSymbols: ['GOOGL', 'META', 'AMZN'],
      url: '#',
    },
    {
      id: '4',
      title: 'Electric Vehicle Sales Surge in Q4',
      summary: 'Electric vehicle manufacturers report record sales numbers for the fourth quarter, with Tesla leading the charge.',
      source: 'MarketWatch',
      publishedAt: Date.now() - 10800000, // 3 hours ago
      sentiment: 'positive' as const,
      relevantSymbols: ['TSLA', 'RIVN', 'LCID'],
      url: '#',
    },
    {
      id: '5',
      title: 'Oil Prices Decline on Supply Concerns',
      summary: 'Crude oil prices dropped significantly following reports of increased production from major oil-producing nations.',
      source: 'Financial Times',
      publishedAt: Date.now() - 14400000, // 4 hours ago
      sentiment: 'negative' as const,
      relevantSymbols: ['XOM', 'CVX'],
      url: '#',
    },
  ]

  const filteredNews = newsItems.filter(item => 
    filter === 'all' || item.sentiment === filter
  )

  const formatTimeAgo = (timestamp: number) => {
    const now = Date.now()
    const diff = now - timestamp
    const minutes = Math.floor(diff / 60000)
    const hours = Math.floor(diff / 3600000)
    
    if (hours > 0) {
      return `${hours}h ago`
    } else {
      return `${minutes}m ago`
    }
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return <TrendingUp className="h-4 w-4 text-green-400" />
      case 'negative':
        return <TrendingDown className="h-4 w-4 text-red-400" />
      default:
        return <div className="h-4 w-4 rounded-full bg-gray-400" />
    }
  }

  const getSentimentColor = (sentiment: string) => {
    switch (sentiment) {
      case 'positive':
        return 'border-green-500/30 bg-green-500/10'
      case 'negative':
        return 'border-red-500/30 bg-red-500/10'
      default:
        return 'border-gray-500/30 bg-gray-500/10'
    }
  }

  return (
    <div className="glass-card">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <Newspaper className="h-6 w-6 text-blue-400" />
          <h2 className="text-xl font-bold text-white">Market News</h2>
        </div>
        <div className="flex items-center space-x-2">
          <Filter className="h-4 w-4 text-gray-400" />
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value as any)}
            className="bg-transparent text-sm text-gray-400 border border-white/20 rounded px-2 py-1 focus:outline-none focus:border-blue-500"
          >
            <option value="all">All</option>
            <option value="positive">Positive</option>
            <option value="negative">Negative</option>
            <option value="neutral">Neutral</option>
          </select>
        </div>
      </div>

      {/* News Items */}
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {filteredNews.map((item, index) => (
          <motion.article
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: index * 0.1 }}
            className={`p-4 rounded-lg border transition-all hover:bg-white/5 cursor-pointer ${getSentimentColor(item.sentiment)}`}
          >
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center space-x-2">
                {getSentimentIcon(item.sentiment)}
                <span className="text-xs text-gray-400">{item.source}</span>
              </div>
              <div className="flex items-center space-x-2 text-xs text-gray-400">
                <Clock className="h-3 w-3" />
                <span>{formatTimeAgo(item.publishedAt)}</span>
              </div>
            </div>

            <h3 className="text-white font-medium mb-2 line-clamp-2 hover:text-blue-400 transition-colors">
              {item.title}
            </h3>

            <p className="text-sm text-gray-400 mb-3 line-clamp-2">
              {item.summary}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                {item.relevantSymbols.map((symbol) => (
                  <span
                    key={symbol}
                    className="px-2 py-1 bg-blue-500/20 text-blue-400 text-xs rounded font-medium"
                  >
                    {symbol}
                  </span>
                ))}
              </div>
              
              <button className="flex items-center space-x-1 text-xs text-gray-400 hover:text-blue-400 transition-colors">
                <span>Read more</span>
                <ExternalLink className="h-3 w-3" />
              </button>
            </div>
          </motion.article>
        ))}
      </div>

      {/* Sentiment Summary */}
      <div className="mt-6 pt-6 border-t border-white/10">
        <h3 className="text-lg font-semibold text-white mb-4">Market Sentiment</h3>
        <div className="grid grid-cols-3 gap-4">
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingUp className="h-5 w-5 text-green-400" />
              <span className="text-sm text-gray-400">Positive</span>
            </div>
            <p className="text-2xl font-bold text-green-400">
              {newsItems.filter(item => item.sentiment === 'positive').length}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <div className="h-5 w-5 rounded-full bg-gray-400" />
              <span className="text-sm text-gray-400">Neutral</span>
            </div>
            <p className="text-2xl font-bold text-gray-400">
              {newsItems.filter(item => item.sentiment === 'neutral').length}
            </p>
          </div>
          
          <div className="text-center">
            <div className="flex items-center justify-center space-x-2 mb-2">
              <TrendingDown className="h-5 w-5 text-red-400" />
              <span className="text-sm text-gray-400">Negative</span>
            </div>
            <p className="text-2xl font-bold text-red-400">
              {newsItems.filter(item => item.sentiment === 'negative').length}
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
