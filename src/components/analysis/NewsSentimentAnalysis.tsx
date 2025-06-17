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
  AreaChart,
  Area,
  BarChart,
  Bar
} from 'recharts'
import { 
  Newspaper, 
  TrendingUp, 
  TrendingDown, 
  AlertTriangle, 
  ThumbsUp, 
  ThumbsDown,
  Clock,
  Filter,
  RefreshCw
} from 'lucide-react'
import { NewsItem } from '@/types/stock'
import { newsSentimentService } from '@/services/newsSentimentService'
import { formatPercent } from '@/utils/formatters'
import CountUp from 'react-countup'

interface NewsSentimentAnalysisProps {
  symbol: string
  className?: string
}

export default function NewsSentimentAnalysis({ symbol, className = '' }: NewsSentimentAnalysisProps) {
  const [newsItems, setNewsItems] = useState<NewsItem[]>([])
  const [sentimentTrend, setSentimentTrend] = useState<any[]>([])
  const [impactAnalysis, setImpactAnalysis] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState<'all' | 'positive' | 'negative' | 'high-impact'>('all')
  const [timeRange, setTimeRange] = useState<'1d' | '1w' | '1m'>('1w')

  useEffect(() => {
    fetchNewsAndAnalysis()
  }, [symbol, timeRange])

  const fetchNewsAndAnalysis = async () => {
    setLoading(true)
    try {
      // Mock news data for demonstration
      const mockNews: NewsItem[] = [
        {
          id: '1',
          title: `${symbol} Reports Strong Q3 Earnings, Beats Expectations`,
          summary: 'Company delivers exceptional quarterly results with revenue growth of 15% year-over-year.',
          url: '#',
          source: 'Reuters',
          publishedAt: Date.now() - 3600000,
          sentiment: 'positive',
          relevantSymbols: [symbol]
        },
        {
          id: '2',
          title: `Analyst Upgrades ${symbol} to Buy Rating`,
          summary: 'Major investment firm raises price target citing strong fundamentals and market position.',
          url: '#',
          source: 'Bloomberg',
          publishedAt: Date.now() - 7200000,
          sentiment: 'positive',
          relevantSymbols: [symbol]
        },
        {
          id: '3',
          title: `${symbol} Faces Regulatory Scrutiny Over Data Privacy`,
          summary: 'Government agencies launch investigation into company data handling practices.',
          url: '#',
          source: 'Wall Street Journal',
          publishedAt: Date.now() - 10800000,
          sentiment: 'negative',
          relevantSymbols: [symbol]
        },
        {
          id: '4',
          title: `${symbol} Announces Strategic Partnership`,
          summary: 'Company forms alliance with industry leader to expand market reach.',
          url: '#',
          source: 'CNBC',
          publishedAt: Date.now() - 14400000,
          sentiment: 'positive',
          relevantSymbols: [symbol]
        },
        {
          id: '5',
          title: `Market Volatility Affects ${symbol} Trading`,
          summary: 'Broader market uncertainty impacts stock performance despite solid fundamentals.',
          url: '#',
          source: 'MarketWatch',
          publishedAt: Date.now() - 18000000,
          sentiment: 'neutral',
          relevantSymbols: [symbol]
        }
      ]

      // Analyze sentiment for each news item
      const analyzedNews = await Promise.all(
        mockNews.map(async (item) => {
          const sentiment = await newsSentimentService.analyzeSentiment(`${item.title} ${item.summary}`)
          const impact = newsSentimentService.calculateNewsImpact(item)
          
          return {
            ...item,
            sentimentScore: sentiment.score,
            sentimentConfidence: sentiment.confidence,
            impactLevel: impact.level,
            impactScore: impact.score,
            priceImpact: impact.priceImpact
          }
        })
      )

      setNewsItems(analyzedNews)

      // Calculate sentiment trend
      const trend = newsSentimentService.calculateSentimentTrend(mockNews, symbol)
      const trendData = trend.map(t => ({
        timestamp: t.timestamp,
        date: new Date(t.timestamp).toLocaleDateString(),
        sentiment: t.sentiment,
        volume: t.volume,
        impact: t.impact
      }))
      setSentimentTrend(trendData)

      // Calculate impact analysis
      const impactData = analyzedNews.map(item => ({
        title: item.title.substring(0, 30) + '...',
        impact: item.impactScore,
        sentiment: item.sentimentScore,
        time: new Date(item.publishedAt).toLocaleTimeString()
      }))
      setImpactAnalysis(impactData)

    } catch (error) {
      console.error('Error fetching news analysis:', error)
    } finally {
      setLoading(false)
    }
  }

  const filteredNews = newsItems.filter(item => {
    switch (filter) {
      case 'positive':
        return item.sentiment === 'positive'
      case 'negative':
        return item.sentiment === 'negative'
      case 'high-impact':
        return item.impactLevel === 'high'
      default:
        return true
    }
  })

  const overallSentiment = newsItems.length > 0 
    ? newsItems.reduce((sum, item) => sum + (item.sentimentScore || 0), 0) / newsItems.length
    : 0

  const sentimentCounts = {
    positive: newsItems.filter(item => item.sentiment === 'positive').length,
    negative: newsItems.filter(item => item.sentiment === 'negative').length,
    neutral: newsItems.filter(item => item.sentiment === 'neutral').length
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.1) return 'text-green-400'
    if (sentiment < -0.1) return 'text-red-400'
    return 'text-yellow-400'
  }

  const getSentimentIcon = (sentiment: string) => {
    switch (sentiment) {
      case 'positive': return ThumbsUp
      case 'negative': return ThumbsDown
      default: return AlertTriangle
    }
  }

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="glass-card p-3 border border-white/20">
          <p className="text-white font-medium">{label}</p>
          <p className="text-blue-400">
            Sentiment: {payload[0].value.toFixed(2)}
          </p>
          <p className="text-green-400">
            Volume: {payload[0].payload.volume} articles
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
            <Newspaper className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">News Sentiment Analysis</h2>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Time Range Filter */}
            <select
              value={timeRange}
              onChange={(e) => setTimeRange(e.target.value as '1d' | '1w' | '1m')}
              className="px-3 py-2 glass rounded-lg text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="1d">1 Day</option>
              <option value="1w">1 Week</option>
              <option value="1m">1 Month</option>
            </select>

            {/* Refresh Button */}
            <button
              onClick={fetchNewsAndAnalysis}
              disabled={loading}
              className="p-2 glass rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Overall Sentiment Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="text-center p-4 glass rounded-lg">
            <div className={`text-2xl font-bold ${getSentimentColor(overallSentiment)}`}>
              <CountUp 
                end={overallSentiment} 
                duration={1.5} 
                decimals={2} 
                prefix={overallSentiment >= 0 ? '+' : ''}
              />
            </div>
            <div className="text-sm text-gray-400">Overall Sentiment</div>
          </div>

          <div className="text-center p-4 glass rounded-lg">
            <div className="text-2xl font-bold text-green-400">
              <CountUp end={sentimentCounts.positive} duration={1.5} />
            </div>
            <div className="text-sm text-gray-400">Positive News</div>
          </div>

          <div className="text-center p-4 glass rounded-lg">
            <div className="text-2xl font-bold text-red-400">
              <CountUp end={sentimentCounts.negative} duration={1.5} />
            </div>
            <div className="text-sm text-gray-400">Negative News</div>
          </div>

          <div className="text-center p-4 glass rounded-lg">
            <div className="text-2xl font-bold text-yellow-400">
              <CountUp end={sentimentCounts.neutral} duration={1.5} />
            </div>
            <div className="text-sm text-gray-400">Neutral News</div>
          </div>
        </div>
      </motion.div>

      {/* Sentiment Trend Chart */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Sentiment Trend Over Time</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={sentimentTrend}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="date" 
                stroke="#9ca3af"
                fontSize={12}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
                domain={[-1, 1]}
              />
              <Tooltip content={<CustomTooltip />} />
              <Area
                type="monotone"
                dataKey="sentiment"
                stroke="#3b82f6"
                fill="rgba(59, 130, 246, 0.2)"
                strokeWidth={2}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* News Impact Analysis */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">News Impact Analysis</h3>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={impactAnalysis}>
              <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
              <XAxis 
                dataKey="title" 
                stroke="#9ca3af"
                fontSize={10}
                angle={-45}
                textAnchor="end"
                height={80}
              />
              <YAxis 
                stroke="#9ca3af"
                fontSize={12}
              />
              <Tooltip />
              <Bar 
                dataKey="impact" 
                fill="#8b5cf6"
                radius={[4, 4, 0, 0]}
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      {/* News List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Recent News</h3>
          
          {/* Filter Buttons */}
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-400" />
            {['all', 'positive', 'negative', 'high-impact'].map((filterType) => (
              <button
                key={filterType}
                onClick={() => setFilter(filterType as any)}
                className={`px-3 py-1 rounded-lg text-sm transition-colors ${
                  filter === filterType
                    ? 'bg-blue-500 text-white'
                    : 'glass text-gray-300 hover:text-white hover:bg-white/10'
                }`}
              >
                {filterType.charAt(0).toUpperCase() + filterType.slice(1).replace('-', ' ')}
              </button>
            ))}
          </div>
        </div>

        <div className="space-y-4">
          {filteredNews.map((item, index) => {
            const SentimentIcon = getSentimentIcon(item.sentiment)
            return (
              <motion.div
                key={item.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-4 glass rounded-lg hover-lift"
              >
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <SentimentIcon className={`h-5 w-5 ${getSentimentColor(item.sentimentScore || 0)}`} />
                      <h4 className="font-semibold text-white">{item.title}</h4>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${
                        item.impactLevel === 'high' ? 'bg-red-500/20 text-red-400' :
                        item.impactLevel === 'medium' ? 'bg-yellow-500/20 text-yellow-400' :
                        'bg-green-500/20 text-green-400'
                      }`}>
                        {item.impactLevel} impact
                      </span>
                    </div>
                    
                    <p className="text-gray-400 text-sm mb-3">{item.summary}</p>
                    
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-4 text-sm text-gray-500">
                        <span>{item.source}</span>
                        <div className="flex items-center space-x-1">
                          <Clock className="h-3 w-3" />
                          <span>{new Date(item.publishedAt).toLocaleTimeString()}</span>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm">
                        <span className="text-gray-400">
                          Sentiment: <span className={getSentimentColor(item.sentimentScore || 0)}>
                            {((item.sentimentScore || 0) * 100).toFixed(0)}%
                          </span>
                        </span>
                        <span className="text-gray-400">
                          Impact: <span className="text-purple-400">
                            {(item.impactScore || 0).toFixed(0)}
                          </span>
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>
    </div>
  )
}
