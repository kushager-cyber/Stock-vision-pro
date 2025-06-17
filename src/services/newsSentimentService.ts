'use client'

import { NewsItem } from '@/types/stock'

// Sentiment analysis interfaces
interface SentimentScore {
  score: number // -1 to +1 scale
  magnitude: number // 0 to 1 scale (intensity)
  confidence: number // 0 to 1 scale
  label: 'positive' | 'negative' | 'neutral'
}

interface NewsImpact {
  level: 'high' | 'medium' | 'low'
  score: number // 0 to 100 scale
  factors: string[]
  priceImpact: number // Expected price impact percentage
}

interface SentimentTrend {
  timestamp: number
  sentiment: number
  volume: number // Number of articles
  impact: number
}

interface NewsSource {
  name: string
  credibility: number // 0 to 1 scale
  bias: number // -1 to +1 scale (negative = bearish bias, positive = bullish bias)
  weight: number // Influence weight
}

interface SocialSentiment {
  platform: 'twitter' | 'reddit' | 'stocktwits' | 'discord'
  sentiment: number
  volume: number
  engagement: number
  timestamp: number
}

class NewsSentimentService {
  private sentimentCache = new Map<string, { sentiment: SentimentScore; timestamp: number }>()
  private trendCache = new Map<string, SentimentTrend[]>()
  private impactCache = new Map<string, NewsImpact>()
  
  // News source credibility and bias mapping
  private newsSources: Map<string, NewsSource> = new Map([
    ['Reuters', { name: 'Reuters', credibility: 0.95, bias: 0.0, weight: 1.0 }],
    ['Bloomberg', { name: 'Bloomberg', credibility: 0.92, bias: 0.1, weight: 0.95 }],
    ['Wall Street Journal', { name: 'WSJ', credibility: 0.90, bias: 0.05, weight: 0.9 }],
    ['Financial Times', { name: 'FT', credibility: 0.88, bias: 0.0, weight: 0.85 }],
    ['CNBC', { name: 'CNBC', credibility: 0.75, bias: 0.15, weight: 0.7 }],
    ['MarketWatch', { name: 'MarketWatch', credibility: 0.70, bias: 0.1, weight: 0.65 }],
    ['Yahoo Finance', { name: 'Yahoo', credibility: 0.65, bias: 0.0, weight: 0.6 }],
    ['Seeking Alpha', { name: 'SeekingAlpha', credibility: 0.60, bias: 0.2, weight: 0.5 }],
  ])

  // Financial keywords and their sentiment weights
  private financialKeywords = {
    positive: {
      'earnings beat': 2.0,
      'revenue growth': 1.8,
      'profit surge': 2.0,
      'strong performance': 1.5,
      'bullish': 1.8,
      'upgrade': 1.6,
      'outperform': 1.4,
      'buy rating': 1.7,
      'dividend increase': 1.3,
      'market share gain': 1.4,
      'innovation': 1.2,
      'expansion': 1.1,
      'partnership': 1.0,
      'acquisition': 1.2,
      'breakthrough': 1.6,
      'record high': 1.8,
      'exceeds expectations': 1.9,
      'strong demand': 1.4,
      'cost reduction': 1.2,
      'efficiency gains': 1.3
    },
    negative: {
      'earnings miss': -2.0,
      'revenue decline': -1.8,
      'loss': -1.6,
      'bearish': -1.8,
      'downgrade': -1.6,
      'underperform': -1.4,
      'sell rating': -1.7,
      'dividend cut': -1.5,
      'market share loss': -1.4,
      'lawsuit': -1.3,
      'investigation': -1.4,
      'scandal': -1.8,
      'bankruptcy': -2.0,
      'layoffs': -1.2,
      'restructuring': -1.1,
      'debt concerns': -1.3,
      'regulatory issues': -1.4,
      'competition': -0.8,
      'supply chain': -1.0,
      'inflation impact': -1.1
    }
  }

  // Market impact keywords
  private impactKeywords = {
    high: ['earnings', 'merger', 'acquisition', 'bankruptcy', 'fda approval', 'lawsuit', 'investigation'],
    medium: ['revenue', 'guidance', 'partnership', 'expansion', 'layoffs', 'restructuring'],
    low: ['analyst', 'rating', 'price target', 'conference', 'interview', 'commentary']
  }

  constructor() {
    this.initializeSentimentEngine()
  }

  private initializeSentimentEngine() {
    // Initialize sentiment analysis engine
    // In a real implementation, you might load pre-trained models here
  }

  // Main sentiment analysis function
  public async analyzeSentiment(text: string): Promise<SentimentScore> {
    const cacheKey = this.hashText(text)
    const cached = this.sentimentCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < 3600000) { // 1 hour cache
      return cached.sentiment
    }

    try {
      // Use multiple sentiment analysis approaches
      const [basicSentiment, financialSentiment, contextualSentiment] = await Promise.all([
        this.basicSentimentAnalysis(text),
        this.financialSentimentAnalysis(text),
        this.contextualSentimentAnalysis(text)
      ])

      // Combine sentiments with weights
      const combinedScore = (
        basicSentiment.score * 0.3 +
        financialSentiment.score * 0.5 +
        contextualSentiment.score * 0.2
      )

      const combinedMagnitude = Math.max(
        basicSentiment.magnitude,
        financialSentiment.magnitude,
        contextualSentiment.magnitude
      )

      const combinedConfidence = (
        basicSentiment.confidence * 0.3 +
        financialSentiment.confidence * 0.5 +
        contextualSentiment.confidence * 0.2
      )

      const sentiment: SentimentScore = {
        score: Math.max(-1, Math.min(1, combinedScore)),
        magnitude: combinedMagnitude,
        confidence: combinedConfidence,
        label: combinedScore > 0.1 ? 'positive' : combinedScore < -0.1 ? 'negative' : 'neutral'
      }

      // Cache the result
      this.sentimentCache.set(cacheKey, {
        sentiment,
        timestamp: Date.now()
      })

      return sentiment
    } catch (error) {
      console.error('Sentiment analysis failed:', error)
      return {
        score: 0,
        magnitude: 0,
        confidence: 0,
        label: 'neutral'
      }
    }
  }

  // Basic sentiment analysis using simple keyword matching
  private async basicSentimentAnalysis(text: string): Promise<SentimentScore> {
    const words = text.toLowerCase().split(/\s+/)
    let score = 0
    let magnitude = 0
    let matches = 0

    // Simple positive/negative word counting
    const positiveWords = ['good', 'great', 'excellent', 'positive', 'strong', 'growth', 'increase', 'up', 'high', 'best']
    const negativeWords = ['bad', 'poor', 'negative', 'weak', 'decline', 'decrease', 'down', 'low', 'worst', 'loss']

    for (const word of words) {
      if (positiveWords.includes(word)) {
        score += 0.1
        magnitude += 0.1
        matches++
      } else if (negativeWords.includes(word)) {
        score -= 0.1
        magnitude += 0.1
        matches++
      }
    }

    return {
      score: Math.max(-1, Math.min(1, score)),
      magnitude: Math.min(1, magnitude),
      confidence: Math.min(1, matches / words.length * 10),
      label: score > 0 ? 'positive' : score < 0 ? 'negative' : 'neutral'
    }
  }

  // Financial-specific sentiment analysis
  private async financialSentimentAnalysis(text: string): Promise<SentimentScore> {
    const lowerText = text.toLowerCase()
    let score = 0
    let magnitude = 0
    let matches = 0

    // Check positive financial keywords
    for (const [keyword, weight] of Object.entries(this.financialKeywords.positive)) {
      if (lowerText.includes(keyword)) {
        score += weight * 0.1
        magnitude += Math.abs(weight) * 0.1
        matches++
      }
    }

    // Check negative financial keywords
    for (const [keyword, weight] of Object.entries(this.financialKeywords.negative)) {
      if (lowerText.includes(keyword)) {
        score += weight * 0.1 // weight is already negative
        magnitude += Math.abs(weight) * 0.1
        matches++
      }
    }

    // Normalize by text length
    const textLength = text.split(/\s+/).length
    const normalizedScore = score / Math.max(1, textLength / 50)

    return {
      score: Math.max(-1, Math.min(1, normalizedScore)),
      magnitude: Math.min(1, magnitude),
      confidence: Math.min(1, matches / Math.max(1, textLength / 20)),
      label: normalizedScore > 0.1 ? 'positive' : normalizedScore < -0.1 ? 'negative' : 'neutral'
    }
  }

  // Contextual sentiment analysis considering market context
  private async contextualSentimentAnalysis(text: string): Promise<SentimentScore> {
    const lowerText = text.toLowerCase()
    let score = 0
    let contextMultiplier = 1.0

    // Market context modifiers
    if (lowerText.includes('market') || lowerText.includes('economy')) {
      contextMultiplier *= 1.2
    }

    if (lowerText.includes('fed') || lowerText.includes('federal reserve')) {
      contextMultiplier *= 1.3
    }

    if (lowerText.includes('earnings') || lowerText.includes('quarterly')) {
      contextMultiplier *= 1.4
    }

    // Sentiment modifiers
    if (lowerText.includes('however') || lowerText.includes('but') || lowerText.includes('although')) {
      score *= 0.7 // Reduce sentiment for contrasting statements
    }

    if (lowerText.includes('expect') || lowerText.includes('forecast') || lowerText.includes('predict')) {
      score *= 0.8 // Reduce sentiment for predictions vs facts
    }

    // Time sensitivity
    if (lowerText.includes('today') || lowerText.includes('now') || lowerText.includes('current')) {
      contextMultiplier *= 1.1
    }

    const basicSentiment = await this.basicSentimentAnalysis(text)
    const adjustedScore = basicSentiment.score * contextMultiplier

    return {
      score: Math.max(-1, Math.min(1, adjustedScore)),
      magnitude: basicSentiment.magnitude * contextMultiplier,
      confidence: basicSentiment.confidence,
      label: adjustedScore > 0.1 ? 'positive' : adjustedScore < -0.1 ? 'negative' : 'neutral'
    }
  }

  // Calculate news impact level
  public calculateNewsImpact(newsItem: NewsItem): NewsImpact {
    const cacheKey = newsItem.id
    const cached = this.impactCache.get(cacheKey)
    
    if (cached) {
      return cached
    }

    const text = `${newsItem.title} ${newsItem.summary}`.toLowerCase()
    let impactScore = 0
    let level: 'high' | 'medium' | 'low' = 'low'
    const factors: string[] = []

    // Check for high impact keywords
    for (const keyword of this.impactKeywords.high) {
      if (text.includes(keyword)) {
        impactScore += 30
        factors.push(`High impact: ${keyword}`)
      }
    }

    // Check for medium impact keywords
    for (const keyword of this.impactKeywords.medium) {
      if (text.includes(keyword)) {
        impactScore += 15
        factors.push(`Medium impact: ${keyword}`)
      }
    }

    // Check for low impact keywords
    for (const keyword of this.impactKeywords.low) {
      if (text.includes(keyword)) {
        impactScore += 5
        factors.push(`Low impact: ${keyword}`)
      }
    }

    // Source credibility modifier
    const source = this.newsSources.get(newsItem.source)
    if (source) {
      impactScore *= source.credibility
      factors.push(`Source credibility: ${(source.credibility * 100).toFixed(0)}%`)
    }

    // Recency modifier
    const hoursOld = (Date.now() - newsItem.publishedAt) / (1000 * 60 * 60)
    const recencyMultiplier = Math.max(0.3, 1 - hoursOld / 24) // Decay over 24 hours
    impactScore *= recencyMultiplier

    // Determine impact level
    if (impactScore >= 50) {
      level = 'high'
    } else if (impactScore >= 20) {
      level = 'medium'
    } else {
      level = 'low'
    }

    // Calculate expected price impact
    const sentimentMultiplier = newsItem.sentiment === 'positive' ? 1 : newsItem.sentiment === 'negative' ? -1 : 0
    const priceImpact = (impactScore / 100) * sentimentMultiplier * 5 // Max 5% price impact

    const impact: NewsImpact = {
      level,
      score: Math.min(100, impactScore),
      factors,
      priceImpact
    }

    this.impactCache.set(cacheKey, impact)
    return impact
  }

  // Aggregate sentiment trends over time
  public calculateSentimentTrend(newsItems: NewsItem[], symbol: string): SentimentTrend[] {
    const cacheKey = `trend_${symbol}`
    const cached = this.trendCache.get(cacheKey)
    
    if (cached && Date.now() - cached[cached.length - 1]?.timestamp < 300000) { // 5 minute cache
      return cached
    }

    // Group news by time periods (hourly)
    const timeGroups = new Map<number, NewsItem[]>()
    
    for (const item of newsItems) {
      const hourTimestamp = Math.floor(item.publishedAt / (1000 * 60 * 60)) * (1000 * 60 * 60)
      if (!timeGroups.has(hourTimestamp)) {
        timeGroups.set(hourTimestamp, [])
      }
      timeGroups.get(hourTimestamp)!.push(item)
    }

    // Calculate sentiment for each time period
    const trends: SentimentTrend[] = []
    
    for (const [timestamp, items] of timeGroups) {
      let totalSentiment = 0
      let totalImpact = 0
      let weightedSentiment = 0
      let totalWeight = 0

      for (const item of items) {
        const sentiment = this.mapSentimentToNumber(item.sentiment)
        const impact = this.calculateNewsImpact(item)
        const source = this.newsSources.get(item.source)
        const weight = source ? source.weight : 0.5

        totalSentiment += sentiment
        totalImpact += impact.score
        weightedSentiment += sentiment * weight
        totalWeight += weight
      }

      const avgSentiment = totalWeight > 0 ? weightedSentiment / totalWeight : totalSentiment / items.length
      const avgImpact = totalImpact / items.length

      trends.push({
        timestamp,
        sentiment: avgSentiment,
        volume: items.length,
        impact: avgImpact
      })
    }

    // Sort by timestamp
    trends.sort((a, b) => a.timestamp - b.timestamp)

    this.trendCache.set(cacheKey, trends)
    return trends
  }

  // Filter news by relevance and credibility
  public filterNewsByRelevance(
    newsItems: NewsItem[], 
    symbol: string, 
    minCredibility: number = 0.6,
    minImpact: number = 10
  ): NewsItem[] {
    return newsItems.filter(item => {
      // Check if news is relevant to the symbol
      const isRelevant = item.relevantSymbols.includes(symbol) || 
                        item.title.toLowerCase().includes(symbol.toLowerCase()) ||
                        item.summary.toLowerCase().includes(symbol.toLowerCase())

      if (!isRelevant) return false

      // Check source credibility
      const source = this.newsSources.get(item.source)
      const credibility = source ? source.credibility : 0.5
      
      if (credibility < minCredibility) return false

      // Check impact level
      const impact = this.calculateNewsImpact(item)
      if (impact.score < minImpact) return false

      return true
    })
  }

  // Calculate correlation between news sentiment and price movements
  public calculateSentimentPriceCorrelation(
    sentimentTrends: SentimentTrend[],
    priceData: { timestamp: number; price: number; change: number }[]
  ): number {
    if (sentimentTrends.length < 2 || priceData.length < 2) return 0

    // Align sentiment and price data by timestamp
    const alignedData: { sentiment: number; priceChange: number }[] = []

    for (const sentiment of sentimentTrends) {
      const pricePoint = priceData.find(p => 
        Math.abs(p.timestamp - sentiment.timestamp) < 3600000 // Within 1 hour
      )
      
      if (pricePoint) {
        alignedData.push({
          sentiment: sentiment.sentiment,
          priceChange: pricePoint.change
        })
      }
    }

    if (alignedData.length < 2) return 0

    // Calculate Pearson correlation coefficient
    const n = alignedData.length
    const sumX = alignedData.reduce((sum, d) => sum + d.sentiment, 0)
    const sumY = alignedData.reduce((sum, d) => sum + d.priceChange, 0)
    const sumXY = alignedData.reduce((sum, d) => sum + d.sentiment * d.priceChange, 0)
    const sumX2 = alignedData.reduce((sum, d) => sum + d.sentiment * d.sentiment, 0)
    const sumY2 = alignedData.reduce((sum, d) => sum + d.priceChange * d.priceChange, 0)

    const numerator = n * sumXY - sumX * sumY
    const denominator = Math.sqrt((n * sumX2 - sumX * sumX) * (n * sumY2 - sumY * sumY))

    return denominator === 0 ? 0 : numerator / denominator
  }

  // Utility functions
  private mapSentimentToNumber(sentiment: string): number {
    switch (sentiment) {
      case 'positive': return 1
      case 'negative': return -1
      default: return 0
    }
  }

  private hashText(text: string): string {
    let hash = 0
    for (let i = 0; i < text.length; i++) {
      const char = text.charCodeAt(i)
      hash = ((hash << 5) - hash) + char
      hash = hash & hash // Convert to 32-bit integer
    }
    return hash.toString()
  }

  // Clear caches
  public clearCache(): void {
    this.sentimentCache.clear()
    this.trendCache.clear()
    this.impactCache.clear()
  }
}

// Export singleton instance
export const newsSentimentService = new NewsSentimentService()
