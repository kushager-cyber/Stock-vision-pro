'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { MessageCircle, TrendingUp, TrendingDown, Users, Heart, Share2, Eye } from 'lucide-react'
import CountUp from 'react-countup'

interface SocialSentimentProps {
  symbol: string
  sentiment?: number // -1 to 1 scale
  className?: string
}

export default function SocialSentiment({ 
  symbol, 
  sentiment = 0.15, 
  className = '' 
}: SocialSentimentProps) {
  
  // Mock social media data - in production, this would come from real social media APIs
  const socialData = {
    overallSentiment: sentiment,
    mentions: 12847,
    positiveRatio: 0.62,
    negativeRatio: 0.23,
    neutralRatio: 0.15,
    trendingScore: 78,
    influencerSentiment: 0.25,
    volumeChange: 23.5, // % change in mentions
    platforms: [
      { name: 'Twitter', mentions: 5420, sentiment: 0.18, icon: MessageCircle },
      { name: 'Reddit', mentions: 3210, sentiment: 0.32, icon: Users },
      { name: 'News', mentions: 2847, sentiment: 0.08, icon: Eye },
      { name: 'Forums', mentions: 1370, sentiment: -0.05, icon: Share2 },
    ],
    recentTrends: [
      { topic: 'Earnings Beat', sentiment: 0.45, mentions: 2340 },
      { topic: 'Product Launch', sentiment: 0.38, mentions: 1890 },
      { topic: 'Market Volatility', sentiment: -0.12, mentions: 1560 },
      { topic: 'Analyst Upgrade', sentiment: 0.52, mentions: 980 },
    ]
  }

  const getSentimentColor = (sentiment: number) => {
    if (sentiment > 0.2) return { color: 'text-green-400', bg: 'bg-green-500/20' }
    if (sentiment > 0) return { color: 'text-green-300', bg: 'bg-green-500/10' }
    if (sentiment > -0.2) return { color: 'text-yellow-400', bg: 'bg-yellow-500/20' }
    return { color: 'text-red-400', bg: 'bg-red-500/20' }
  }

  const getSentimentLabel = (sentiment: number) => {
    if (sentiment > 0.3) return 'Very Bullish'
    if (sentiment > 0.1) return 'Bullish'
    if (sentiment > -0.1) return 'Neutral'
    if (sentiment > -0.3) return 'Bearish'
    return 'Very Bearish'
  }

  const getSentimentIcon = (sentiment: number) => {
    if (sentiment > 0) return TrendingUp
    if (sentiment < 0) return TrendingDown
    return MessageCircle
  }

  const overallColors = getSentimentColor(socialData.overallSentiment)
  const SentimentIcon = getSentimentIcon(socialData.overallSentiment)
  const sentimentLabel = getSentimentLabel(socialData.overallSentiment)

  // Convert sentiment (-1 to 1) to percentage (0 to 100)
  const sentimentPercentage = ((socialData.overallSentiment + 1) / 2) * 100

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Overall Sentiment */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-white">Social Sentiment</h2>
          <div className={`flex items-center space-x-2 px-3 py-1 rounded-full ${overallColors.bg}`}>
            <SentimentIcon className={`h-4 w-4 ${overallColors.color}`} />
            <span className={`text-sm font-medium ${overallColors.color}`}>
              {sentimentLabel}
            </span>
          </div>
        </div>

        {/* Sentiment Gauge */}
        <div className="text-center mb-8">
          <div className="relative w-40 h-20 mx-auto mb-4">
            {/* Background arc */}
            <svg className="w-40 h-20" viewBox="0 0 160 80">
              <path
                d="M 20 60 A 60 60 0 0 1 140 60"
                stroke="rgba(255, 255, 255, 0.1)"
                strokeWidth="8"
                fill="none"
              />
              {/* Sentiment arc */}
              <path
                d="M 20 60 A 60 60 0 0 1 140 60"
                stroke={overallColors.color.replace('text-', '')}
                strokeWidth="8"
                fill="none"
                strokeLinecap="round"
                strokeDasharray={`${(sentimentPercentage / 100) * 188} 188`}
                className="transition-all duration-1000 ease-out"
              />
            </svg>
            
            {/* Sentiment score */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="text-center mt-4">
                <div className={`text-2xl font-bold ${overallColors.color}`}>
                  <CountUp 
                    end={socialData.overallSentiment} 
                    duration={2} 
                    decimals={2}
                    prefix={socialData.overallSentiment >= 0 ? '+' : ''}
                  />
                </div>
                <div className="text-xs text-gray-400">Sentiment Score</div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-center">
            <div>
              <div className="text-lg font-bold text-green-400">
                <CountUp end={socialData.positiveRatio * 100} duration={1.5} decimals={0} suffix="%" />
              </div>
              <div className="text-sm text-gray-400">Positive</div>
            </div>
            <div>
              <div className="text-lg font-bold text-yellow-400">
                <CountUp end={socialData.neutralRatio * 100} duration={1.5} decimals={0} suffix="%" />
              </div>
              <div className="text-sm text-gray-400">Neutral</div>
            </div>
            <div>
              <div className="text-lg font-bold text-red-400">
                <CountUp end={socialData.negativeRatio * 100} duration={1.5} decimals={0} suffix="%" />
              </div>
              <div className="text-sm text-gray-400">Negative</div>
            </div>
          </div>
        </div>

        {/* Key Metrics */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="text-center p-3 glass rounded-lg">
            <MessageCircle className="h-5 w-5 text-blue-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">
              <CountUp end={socialData.mentions} duration={1.5} separator="," />
            </div>
            <div className="text-sm text-gray-400">Total Mentions</div>
          </div>

          <div className="text-center p-3 glass rounded-lg">
            <TrendingUp className="h-5 w-5 text-green-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-green-400">
              <CountUp end={socialData.volumeChange} duration={1.5} decimals={1} suffix="%" prefix="+" />
            </div>
            <div className="text-sm text-gray-400">Volume Change</div>
          </div>

          <div className="text-center p-3 glass rounded-lg">
            <Heart className="h-5 w-5 text-purple-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-white">
              <CountUp end={socialData.trendingScore} duration={1.5} />
            </div>
            <div className="text-sm text-gray-400">Trending Score</div>
          </div>

          <div className="text-center p-3 glass rounded-lg">
            <Users className="h-5 w-5 text-yellow-400 mx-auto mb-2" />
            <div className="text-lg font-bold text-yellow-400">
              <CountUp 
                end={socialData.influencerSentiment} 
                duration={1.5} 
                decimals={2}
                prefix={socialData.influencerSentiment >= 0 ? '+' : ''}
              />
            </div>
            <div className="text-sm text-gray-400">Influencer Sentiment</div>
          </div>
        </div>
      </motion.div>

      {/* Platform Breakdown */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Platform Breakdown</h3>
        
        <div className="space-y-4">
          {socialData.platforms.map((platform, index) => {
            const platformColors = getSentimentColor(platform.sentiment)
            const Icon = platform.icon
            
            return (
              <motion.div
                key={platform.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 + index * 0.1 }}
                className="flex items-center justify-between p-4 glass rounded-lg"
              >
                <div className="flex items-center space-x-3">
                  <Icon className="h-5 w-5 text-gray-400" />
                  <div>
                    <h4 className="font-medium text-white">{platform.name}</h4>
                    <p className="text-sm text-gray-400">
                      {platform.mentions.toLocaleString()} mentions
                    </p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className={`text-lg font-bold ${platformColors.color}`}>
                    {platform.sentiment >= 0 ? '+' : ''}{platform.sentiment.toFixed(2)}
                  </div>
                  <div className="w-16 h-2 bg-gray-700 rounded-full overflow-hidden">
                    <div
                      className={`h-full transition-all duration-1000 ease-out ${
                        platform.sentiment > 0 ? 'bg-green-400' : 
                        platform.sentiment < 0 ? 'bg-red-400' : 'bg-yellow-400'
                      }`}
                      style={{ 
                        width: `${Math.abs(platform.sentiment) * 100}%`,
                        marginLeft: platform.sentiment < 0 ? `${100 - Math.abs(platform.sentiment) * 100}%` : '0'
                      }}
                    />
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Trending Topics */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-6">Trending Topics</h3>
        
        <div className="space-y-3">
          {socialData.recentTrends.map((trend, index) => {
            const trendColors = getSentimentColor(trend.sentiment)
            
            return (
              <motion.div
                key={trend.topic}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.4 + index * 0.1 }}
                className={`p-3 rounded-lg border ${trendColors.bg} border-white/10`}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="font-medium text-white">{trend.topic}</h4>
                    <p className="text-sm text-gray-400">
                      {trend.mentions.toLocaleString()} mentions
                    </p>
                  </div>
                  <div className={`text-lg font-bold ${trendColors.color}`}>
                    {trend.sentiment >= 0 ? '+' : ''}{trend.sentiment.toFixed(2)}
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
