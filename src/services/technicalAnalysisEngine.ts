'use client'

import { ChartData } from '@/types/stock'

// Technical indicator interfaces
interface TechnicalIndicator {
  name: string
  value: number
  signal: 'buy' | 'sell' | 'neutral'
  strength: number // 0-100
  description: string
}

interface MovingAverage {
  period: number
  values: number[]
  current: number
  signal: 'buy' | 'sell' | 'neutral'
}

interface BollingerBands {
  upper: number[]
  middle: number[] // SMA
  lower: number[]
  bandwidth: number[]
  squeeze: boolean
  signal: 'buy' | 'sell' | 'neutral'
}

interface SupportResistance {
  levels: number[]
  type: 'support' | 'resistance'
  strength: number
  touches: number
}

interface ChartPattern {
  name: string
  type: 'bullish' | 'bearish' | 'neutral'
  confidence: number
  startIndex: number
  endIndex: number
  targetPrice?: number
  description: string
}

interface VolumeAnalysis {
  vpt: number[] // Volume Price Trend
  obv: number[] // On Balance Volume
  volumeMA: number[]
  volumeSignal: 'buy' | 'sell' | 'neutral'
  volumeStrength: number
}

interface FibonacciLevels {
  high: number
  low: number
  levels: {
    level: number
    price: number
    type: 'support' | 'resistance'
  }[]
}

interface TechnicalScore {
  overall: number // 0-100
  trend: number
  momentum: number
  volatility: number
  volume: number
  components: {
    [key: string]: number
  }
}

class TechnicalAnalysisEngine {
  private cache = new Map<string, { data: any; timestamp: number }>()
  private readonly cacheTTL = 300000 // 5 minutes

  // RSI Calculation (Relative Strength Index)
  public calculateRSI(data: ChartData[], period: number = 14): TechnicalIndicator {
    if (data.length < period + 1) {
      return this.createNeutralIndicator('RSI', 50)
    }

    const gains: number[] = []
    const losses: number[] = []

    // Calculate price changes
    for (let i = 1; i < data.length; i++) {
      const change = data[i].close - data[i - 1].close
      gains.push(change > 0 ? change : 0)
      losses.push(change < 0 ? Math.abs(change) : 0)
    }

    // Calculate average gains and losses
    let avgGain = gains.slice(0, period).reduce((sum, gain) => sum + gain, 0) / period
    let avgLoss = losses.slice(0, period).reduce((sum, loss) => sum + loss, 0) / period

    // Calculate RSI for remaining periods using smoothed averages
    const rsiValues: number[] = []
    
    for (let i = period; i < gains.length; i++) {
      avgGain = (avgGain * (period - 1) + gains[i]) / period
      avgLoss = (avgLoss * (period - 1) + losses[i]) / period
      
      const rs = avgGain / (avgLoss || 0.0001) // Avoid division by zero
      const rsi = 100 - (100 / (1 + rs))
      rsiValues.push(rsi)
    }

    const currentRSI = rsiValues[rsiValues.length - 1] || 50

    return {
      name: 'RSI',
      value: currentRSI,
      signal: currentRSI > 70 ? 'sell' : currentRSI < 30 ? 'buy' : 'neutral',
      strength: currentRSI > 70 ? (currentRSI - 70) * 3.33 : currentRSI < 30 ? (30 - currentRSI) * 3.33 : 0,
      description: `RSI(${period}): ${currentRSI.toFixed(2)} - ${currentRSI > 70 ? 'Overbought' : currentRSI < 30 ? 'Oversold' : 'Neutral'}`
    }
  }

  // MACD Calculation (Moving Average Convergence Divergence)
  public calculateMACD(data: ChartData[], fastPeriod: number = 12, slowPeriod: number = 26, signalPeriod: number = 9): TechnicalIndicator {
    if (data.length < slowPeriod) {
      return this.createNeutralIndicator('MACD', 0)
    }

    const fastEMA = this.calculateEMA(data.map(d => d.close), fastPeriod)
    const slowEMA = this.calculateEMA(data.map(d => d.close), slowPeriod)
    
    // Calculate MACD line
    const macdLine: number[] = []
    for (let i = 0; i < Math.min(fastEMA.length, slowEMA.length); i++) {
      macdLine.push(fastEMA[i] - slowEMA[i])
    }

    // Calculate signal line (EMA of MACD)
    const signalLine = this.calculateEMA(macdLine, signalPeriod)
    
    // Calculate histogram
    const histogram: number[] = []
    for (let i = 0; i < Math.min(macdLine.length, signalLine.length); i++) {
      histogram.push(macdLine[i] - signalLine[i])
    }

    const currentMACD = macdLine[macdLine.length - 1] || 0
    const currentSignal = signalLine[signalLine.length - 1] || 0
    const currentHistogram = histogram[histogram.length - 1] || 0
    const previousHistogram = histogram[histogram.length - 2] || 0

    // Determine signal
    let signal: 'buy' | 'sell' | 'neutral' = 'neutral'
    let strength = 0

    if (currentMACD > currentSignal && previousHistogram < 0 && currentHistogram > 0) {
      signal = 'buy'
      strength = Math.min(100, Math.abs(currentHistogram) * 100)
    } else if (currentMACD < currentSignal && previousHistogram > 0 && currentHistogram < 0) {
      signal = 'sell'
      strength = Math.min(100, Math.abs(currentHistogram) * 100)
    }

    return {
      name: 'MACD',
      value: currentMACD,
      signal,
      strength,
      description: `MACD: ${currentMACD.toFixed(4)}, Signal: ${currentSignal.toFixed(4)}, Histogram: ${currentHistogram.toFixed(4)}`
    }
  }

  // Stochastic Oscillator
  public calculateStochastic(data: ChartData[], kPeriod: number = 14, dPeriod: number = 3): TechnicalIndicator {
    if (data.length < kPeriod) {
      return this.createNeutralIndicator('Stochastic', 50)
    }

    const kValues: number[] = []
    
    for (let i = kPeriod - 1; i < data.length; i++) {
      const period = data.slice(i - kPeriod + 1, i + 1)
      const highest = Math.max(...period.map(d => d.high))
      const lowest = Math.min(...period.map(d => d.low))
      const current = data[i].close
      
      const k = ((current - lowest) / (highest - lowest)) * 100
      kValues.push(k)
    }

    // Calculate %D (SMA of %K)
    const dValues = this.calculateSMA(kValues, dPeriod)
    
    const currentK = kValues[kValues.length - 1] || 50
    const currentD = dValues[dValues.length - 1] || 50

    return {
      name: 'Stochastic',
      value: currentK,
      signal: currentK > 80 ? 'sell' : currentK < 20 ? 'buy' : 'neutral',
      strength: currentK > 80 ? (currentK - 80) * 5 : currentK < 20 ? (20 - currentK) * 5 : 0,
      description: `Stochastic %K: ${currentK.toFixed(2)}, %D: ${currentD.toFixed(2)}`
    }
  }

  // Williams %R
  public calculateWilliamsR(data: ChartData[], period: number = 14): TechnicalIndicator {
    if (data.length < period) {
      return this.createNeutralIndicator('Williams %R', -50)
    }

    const wrValues: number[] = []
    
    for (let i = period - 1; i < data.length; i++) {
      const periodData = data.slice(i - period + 1, i + 1)
      const highest = Math.max(...periodData.map(d => d.high))
      const lowest = Math.min(...periodData.map(d => d.low))
      const current = data[i].close
      
      const wr = ((highest - current) / (highest - lowest)) * -100
      wrValues.push(wr)
    }

    const currentWR = wrValues[wrValues.length - 1] || -50

    return {
      name: 'Williams %R',
      value: currentWR,
      signal: currentWR > -20 ? 'sell' : currentWR < -80 ? 'buy' : 'neutral',
      strength: currentWR > -20 ? (currentWR + 20) * 5 : currentWR < -80 ? (-80 - currentWR) * 5 : 0,
      description: `Williams %R: ${currentWR.toFixed(2)}%`
    }
  }

  // ADX (Average Directional Index)
  public calculateADX(data: ChartData[], period: number = 14): TechnicalIndicator {
    if (data.length < period + 1) {
      return this.createNeutralIndicator('ADX', 25)
    }

    const trueRanges: number[] = []
    const plusDMs: number[] = []
    const minusDMs: number[] = []

    // Calculate True Range, +DM, and -DM
    for (let i = 1; i < data.length; i++) {
      const high = data[i].high
      const low = data[i].low
      const prevClose = data[i - 1].close
      const prevHigh = data[i - 1].high
      const prevLow = data[i - 1].low

      // True Range
      const tr = Math.max(
        high - low,
        Math.abs(high - prevClose),
        Math.abs(low - prevClose)
      )
      trueRanges.push(tr)

      // Directional Movement
      const plusDM = high - prevHigh > prevLow - low ? Math.max(high - prevHigh, 0) : 0
      const minusDM = prevLow - low > high - prevHigh ? Math.max(prevLow - low, 0) : 0
      
      plusDMs.push(plusDM)
      minusDMs.push(minusDM)
    }

    // Calculate smoothed averages
    const smoothedTR = this.calculateEMA(trueRanges, period)
    const smoothedPlusDM = this.calculateEMA(plusDMs, period)
    const smoothedMinusDM = this.calculateEMA(minusDMs, period)

    // Calculate DI+ and DI-
    const plusDI: number[] = []
    const minusDI: number[] = []
    
    for (let i = 0; i < smoothedTR.length; i++) {
      plusDI.push((smoothedPlusDM[i] / smoothedTR[i]) * 100)
      minusDI.push((smoothedMinusDM[i] / smoothedTR[i]) * 100)
    }

    // Calculate DX and ADX
    const dx: number[] = []
    for (let i = 0; i < plusDI.length; i++) {
      const sum = plusDI[i] + minusDI[i]
      const diff = Math.abs(plusDI[i] - minusDI[i])
      dx.push(sum === 0 ? 0 : (diff / sum) * 100)
    }

    const adxValues = this.calculateEMA(dx, period)
    const currentADX = adxValues[adxValues.length - 1] || 25

    return {
      name: 'ADX',
      value: currentADX,
      signal: currentADX > 25 ? 'buy' : 'neutral', // ADX indicates trend strength, not direction
      strength: Math.min(100, currentADX),
      description: `ADX: ${currentADX.toFixed(2)} - ${currentADX > 25 ? 'Strong Trend' : 'Weak Trend'}`
    }
  }

  // Simple Moving Average
  public calculateSMA(values: number[], period: number): number[] {
    const sma: number[] = []
    
    for (let i = period - 1; i < values.length; i++) {
      const sum = values.slice(i - period + 1, i + 1).reduce((a, b) => a + b, 0)
      sma.push(sum / period)
    }
    
    return sma
  }

  // Exponential Moving Average
  public calculateEMA(values: number[], period: number): number[] {
    if (values.length === 0) return []
    
    const ema: number[] = []
    const multiplier = 2 / (period + 1)
    
    // First EMA value is SMA
    let sum = 0
    for (let i = 0; i < Math.min(period, values.length); i++) {
      sum += values[i]
    }
    ema.push(sum / Math.min(period, values.length))
    
    // Calculate remaining EMA values
    for (let i = Math.min(period, values.length); i < values.length; i++) {
      const currentEMA = (values[i] * multiplier) + (ema[ema.length - 1] * (1 - multiplier))
      ema.push(currentEMA)
    }
    
    return ema
  }

  // Weighted Moving Average
  public calculateWMA(values: number[], period: number): number[] {
    const wma: number[] = []
    
    for (let i = period - 1; i < values.length; i++) {
      let weightedSum = 0
      let weightSum = 0
      
      for (let j = 0; j < period; j++) {
        const weight = j + 1
        weightedSum += values[i - period + 1 + j] * weight
        weightSum += weight
      }
      
      wma.push(weightedSum / weightSum)
    }
    
    return wma
  }

  // Bollinger Bands
  public calculateBollingerBands(data: ChartData[], period: number = 20, stdDev: number = 2): BollingerBands {
    const closes = data.map(d => d.close)
    const sma = this.calculateSMA(closes, period)
    
    const upper: number[] = []
    const lower: number[] = []
    const bandwidth: number[] = []
    
    for (let i = 0; i < sma.length; i++) {
      const dataIndex = i + period - 1
      const periodData = closes.slice(dataIndex - period + 1, dataIndex + 1)
      
      // Calculate standard deviation
      const mean = sma[i]
      const variance = periodData.reduce((sum, value) => sum + Math.pow(value - mean, 2), 0) / period
      const standardDeviation = Math.sqrt(variance)
      
      const upperBand = mean + (standardDeviation * stdDev)
      const lowerBand = mean - (standardDeviation * stdDev)
      
      upper.push(upperBand)
      lower.push(lowerBand)
      bandwidth.push((upperBand - lowerBand) / mean * 100)
    }

    // Detect squeeze (low volatility)
    const avgBandwidth = bandwidth.slice(-10).reduce((sum, bw) => sum + bw, 0) / Math.min(10, bandwidth.length)
    const squeeze = avgBandwidth < 10 // Threshold for squeeze detection

    // Determine signal
    const currentPrice = closes[closes.length - 1]
    const currentUpper = upper[upper.length - 1]
    const currentLower = lower[lower.length - 1]
    const currentMiddle = sma[sma.length - 1]

    let signal: 'buy' | 'sell' | 'neutral' = 'neutral'
    if (currentPrice <= currentLower) {
      signal = 'buy'
    } else if (currentPrice >= currentUpper) {
      signal = 'sell'
    }

    return {
      upper,
      middle: sma,
      lower,
      bandwidth,
      squeeze,
      signal
    }
  }

  // Support and Resistance Level Identification
  public findSupportResistanceLevels(data: ChartData[], lookback: number = 50): SupportResistance[] {
    if (data.length < lookback) return []

    const levels: SupportResistance[] = []
    const recentData = data.slice(-lookback)
    
    // Find local highs and lows
    const highs: { price: number; index: number }[] = []
    const lows: { price: number; index: number }[] = []

    for (let i = 2; i < recentData.length - 2; i++) {
      const current = recentData[i]
      const prev2 = recentData[i - 2]
      const prev1 = recentData[i - 1]
      const next1 = recentData[i + 1]
      const next2 = recentData[i + 2]

      // Local high
      if (current.high > prev2.high && current.high > prev1.high && 
          current.high > next1.high && current.high > next2.high) {
        highs.push({ price: current.high, index: i })
      }

      // Local low
      if (current.low < prev2.low && current.low < prev1.low && 
          current.low < next1.low && current.low < next2.low) {
        lows.push({ price: current.low, index: i })
      }
    }

    // Group similar levels
    const tolerance = 0.02 // 2% tolerance

    // Process resistance levels
    const resistanceGroups = this.groupLevels(highs, tolerance)
    for (const group of resistanceGroups) {
      if (group.length >= 2) { // At least 2 touches
        const avgPrice = group.reduce((sum, level) => sum + level.price, 0) / group.length
        levels.push({
          levels: [avgPrice],
          type: 'resistance',
          strength: Math.min(100, group.length * 25),
          touches: group.length
        })
      }
    }

    // Process support levels
    const supportGroups = this.groupLevels(lows, tolerance)
    for (const group of supportGroups) {
      if (group.length >= 2) { // At least 2 touches
        const avgPrice = group.reduce((sum, level) => sum + level.price, 0) / group.length
        levels.push({
          levels: [avgPrice],
          type: 'support',
          strength: Math.min(100, group.length * 25),
          touches: group.length
        })
      }
    }

    return levels.sort((a, b) => b.strength - a.strength)
  }

  // Volume Price Trend Analysis
  public calculateVolumeAnalysis(data: ChartData[]): VolumeAnalysis {
    if (data.length < 2) {
      return {
        vpt: [],
        obv: [],
        volumeMA: [],
        volumeSignal: 'neutral',
        volumeStrength: 0
      }
    }

    const vpt: number[] = [0] // Volume Price Trend
    const obv: number[] = [data[0].volume] // On Balance Volume

    // Calculate VPT and OBV
    for (let i = 1; i < data.length; i++) {
      const priceChange = (data[i].close - data[i - 1].close) / data[i - 1].close
      const currentVPT = vpt[i - 1] + (data[i].volume * priceChange)
      vpt.push(currentVPT)

      const currentOBV = data[i].close > data[i - 1].close 
        ? obv[i - 1] + data[i].volume
        : data[i].close < data[i - 1].close
        ? obv[i - 1] - data[i].volume
        : obv[i - 1]
      obv.push(currentOBV)
    }

    // Calculate volume moving average
    const volumes = data.map(d => d.volume)
    const volumeMA = this.calculateSMA(volumes, 20)

    // Determine volume signal
    const recentVolume = volumes.slice(-5).reduce((sum, vol) => sum + vol, 0) / 5
    const avgVolume = volumeMA[volumeMA.length - 1] || recentVolume
    const volumeRatio = recentVolume / avgVolume

    let volumeSignal: 'buy' | 'sell' | 'neutral' = 'neutral'
    let volumeStrength = 0

    if (volumeRatio > 1.5) {
      volumeSignal = 'buy'
      volumeStrength = Math.min(100, (volumeRatio - 1) * 50)
    } else if (volumeRatio < 0.7) {
      volumeSignal = 'sell'
      volumeStrength = Math.min(100, (1 - volumeRatio) * 50)
    }

    return {
      vpt,
      obv,
      volumeMA,
      volumeSignal,
      volumeStrength
    }
  }

  // Helper functions
  private createNeutralIndicator(name: string, value: number): TechnicalIndicator {
    return {
      name,
      value,
      signal: 'neutral',
      strength: 0,
      description: `${name}: Insufficient data`
    }
  }

  private groupLevels(levels: { price: number; index: number }[], tolerance: number): { price: number; index: number }[][] {
    const groups: { price: number; index: number }[][] = []
    const used = new Set<number>()

    for (let i = 0; i < levels.length; i++) {
      if (used.has(i)) continue

      const group = [levels[i]]
      used.add(i)

      for (let j = i + 1; j < levels.length; j++) {
        if (used.has(j)) continue

        const priceDiff = Math.abs(levels[i].price - levels[j].price) / levels[i].price
        if (priceDiff <= tolerance) {
          group.push(levels[j])
          used.add(j)
        }
      }

      groups.push(group)
    }

    return groups
  }

  // Fibonacci Retracement Levels
  public calculateFibonacciLevels(data: ChartData[], lookback: number = 50): FibonacciLevels {
    if (data.length < lookback) {
      return { high: 0, low: 0, levels: [] }
    }

    const recentData = data.slice(-lookback)
    const high = Math.max(...recentData.map(d => d.high))
    const low = Math.min(...recentData.map(d => d.low))
    const range = high - low

    const fibRatios = [0, 0.236, 0.382, 0.5, 0.618, 0.786, 1.0]
    const levels = fibRatios.map(ratio => ({
      level: ratio,
      price: high - (range * ratio),
      type: ratio < 0.5 ? 'resistance' as const : 'support' as const
    }))

    return { high, low, levels }
  }

  // Chart Pattern Recognition
  public recognizePatterns(data: ChartData[]): ChartPattern[] {
    const patterns: ChartPattern[] = []

    if (data.length < 20) return patterns

    // Head and Shoulders pattern
    const headShoulders = this.detectHeadAndShoulders(data)
    if (headShoulders) patterns.push(headShoulders)

    // Triangle patterns
    const triangle = this.detectTriangle(data)
    if (triangle) patterns.push(triangle)

    // Flag pattern
    const flag = this.detectFlag(data)
    if (flag) patterns.push(flag)

    // Double top/bottom
    const doublePattern = this.detectDoubleTopBottom(data)
    if (doublePattern) patterns.push(doublePattern)

    return patterns
  }

  private detectHeadAndShoulders(data: ChartData[]): ChartPattern | null {
    const lookback = Math.min(50, data.length)
    const recentData = data.slice(-lookback)

    // Find three prominent peaks
    const peaks = this.findPeaks(recentData, 5)
    if (peaks.length < 3) return null

    // Check for head and shoulders pattern
    const [leftShoulder, head, rightShoulder] = peaks.slice(-3)

    // Head should be higher than shoulders
    if (head.price > leftShoulder.price && head.price > rightShoulder.price) {
      // Shoulders should be roughly equal
      const shoulderDiff = Math.abs(leftShoulder.price - rightShoulder.price) / leftShoulder.price

      if (shoulderDiff < 0.05) { // 5% tolerance
        const neckline = (leftShoulder.price + rightShoulder.price) / 2
        const targetPrice = neckline - (head.price - neckline)

        return {
          name: 'Head and Shoulders',
          type: 'bearish',
          confidence: 0.7,
          startIndex: leftShoulder.index,
          endIndex: rightShoulder.index,
          targetPrice,
          description: 'Bearish reversal pattern with head higher than shoulders'
        }
      }
    }

    return null
  }

  private detectTriangle(data: ChartData[]): ChartPattern | null {
    const lookback = Math.min(30, data.length)
    const recentData = data.slice(-lookback)

    const highs = this.findPeaks(recentData, 3)
    const lows = this.findTroughs(recentData, 3)

    if (highs.length < 2 || lows.length < 2) return null

    // Check for ascending triangle (horizontal resistance, rising support)
    const highPrices = highs.map(h => h.price)
    const lowPrices = lows.map(l => l.price)

    const highsFlat = this.isFlat(highPrices, 0.02)
    const lowsRising = this.isRising(lowPrices)

    if (highsFlat && lowsRising) {
      return {
        name: 'Ascending Triangle',
        type: 'bullish',
        confidence: 0.6,
        startIndex: Math.min(highs[0].index, lows[0].index),
        endIndex: Math.max(highs[highs.length - 1].index, lows[lows.length - 1].index),
        description: 'Bullish continuation pattern with horizontal resistance'
      }
    }

    // Check for descending triangle (falling resistance, horizontal support)
    const highsFalling = this.isFalling(highPrices)
    const lowsFlat = this.isFlat(lowPrices, 0.02)

    if (highsFalling && lowsFlat) {
      return {
        name: 'Descending Triangle',
        type: 'bearish',
        confidence: 0.6,
        startIndex: Math.min(highs[0].index, lows[0].index),
        endIndex: Math.max(highs[highs.length - 1].index, lows[lows.length - 1].index),
        description: 'Bearish continuation pattern with horizontal support'
      }
    }

    return null
  }

  private detectFlag(data: ChartData[]): ChartPattern | null {
    if (data.length < 15) return null

    const recentData = data.slice(-15)
    const prices = recentData.map(d => d.close)

    // Check for strong trend followed by consolidation
    const firstHalf = prices.slice(0, 7)
    const secondHalf = prices.slice(8)

    const firstTrend = this.calculateTrend(firstHalf)
    const secondTrend = this.calculateTrend(secondHalf)

    // Strong initial trend with weak counter-trend
    if (Math.abs(firstTrend) > 0.05 && Math.abs(secondTrend) < 0.02) {
      return {
        name: 'Flag',
        type: firstTrend > 0 ? 'bullish' : 'bearish',
        confidence: 0.5,
        startIndex: 0,
        endIndex: recentData.length - 1,
        description: `${firstTrend > 0 ? 'Bullish' : 'Bearish'} flag pattern - continuation expected`
      }
    }

    return null
  }

  private detectDoubleTopBottom(data: ChartData[]): ChartPattern | null {
    const lookback = Math.min(40, data.length)
    const recentData = data.slice(-lookback)

    const peaks = this.findPeaks(recentData, 5)
    const troughs = this.findTroughs(recentData, 5)

    // Double top
    if (peaks.length >= 2) {
      const [peak1, peak2] = peaks.slice(-2)
      const priceDiff = Math.abs(peak1.price - peak2.price) / peak1.price

      if (priceDiff < 0.03) { // 3% tolerance
        return {
          name: 'Double Top',
          type: 'bearish',
          confidence: 0.65,
          startIndex: peak1.index,
          endIndex: peak2.index,
          description: 'Bearish reversal pattern with two similar peaks'
        }
      }
    }

    // Double bottom
    if (troughs.length >= 2) {
      const [trough1, trough2] = troughs.slice(-2)
      const priceDiff = Math.abs(trough1.price - trough2.price) / trough1.price

      if (priceDiff < 0.03) { // 3% tolerance
        return {
          name: 'Double Bottom',
          type: 'bullish',
          confidence: 0.65,
          startIndex: trough1.index,
          endIndex: trough2.index,
          description: 'Bullish reversal pattern with two similar troughs'
        }
      }
    }

    return null
  }

  // Candlestick Pattern Recognition
  public recognizeCandlestickPatterns(data: ChartData[]): ChartPattern[] {
    const patterns: ChartPattern[] = []

    if (data.length < 3) return patterns

    const recent = data.slice(-10) // Look at last 10 candles

    for (let i = 2; i < recent.length; i++) {
      const current = recent[i]
      const prev = recent[i - 1]
      const prev2 = recent[i - 2]

      // Doji
      const doji = this.isDoji(current)
      if (doji) {
        patterns.push({
          name: 'Doji',
          type: 'neutral',
          confidence: 0.6,
          startIndex: i,
          endIndex: i,
          description: 'Indecision candle - potential reversal'
        })
      }

      // Hammer
      const hammer = this.isHammer(current)
      if (hammer) {
        patterns.push({
          name: 'Hammer',
          type: 'bullish',
          confidence: 0.7,
          startIndex: i,
          endIndex: i,
          description: 'Bullish reversal candle with long lower shadow'
        })
      }

      // Shooting Star
      const shootingStar = this.isShootingStar(current)
      if (shootingStar) {
        patterns.push({
          name: 'Shooting Star',
          type: 'bearish',
          confidence: 0.7,
          startIndex: i,
          endIndex: i,
          description: 'Bearish reversal candle with long upper shadow'
        })
      }

      // Engulfing patterns
      const bullishEngulfing = this.isBullishEngulfing(prev, current)
      if (bullishEngulfing) {
        patterns.push({
          name: 'Bullish Engulfing',
          type: 'bullish',
          confidence: 0.8,
          startIndex: i - 1,
          endIndex: i,
          description: 'Bullish reversal pattern - large green candle engulfs red candle'
        })
      }

      const bearishEngulfing = this.isBearishEngulfing(prev, current)
      if (bearishEngulfing) {
        patterns.push({
          name: 'Bearish Engulfing',
          type: 'bearish',
          confidence: 0.8,
          startIndex: i - 1,
          endIndex: i,
          description: 'Bearish reversal pattern - large red candle engulfs green candle'
        })
      }
    }

    return patterns
  }

  // Technical Scoring System
  public calculateTechnicalScore(data: ChartData[]): TechnicalScore {
    if (data.length < 20) {
      return {
        overall: 50,
        trend: 50,
        momentum: 50,
        volatility: 50,
        volume: 50,
        components: {}
      }
    }

    const indicators = {
      rsi: this.calculateRSI(data),
      macd: this.calculateMACD(data),
      stochastic: this.calculateStochastic(data),
      williamsR: this.calculateWilliamsR(data),
      adx: this.calculateADX(data)
    }

    const volumeAnalysis = this.calculateVolumeAnalysis(data)
    const bollingerBands = this.calculateBollingerBands(data)

    // Calculate component scores
    const trendScore = this.calculateTrendScore(data, indicators)
    const momentumScore = this.calculateMomentumScore(indicators)
    const volatilityScore = this.calculateVolatilityScore(data, bollingerBands)
    const volumeScore = this.calculateVolumeScore(volumeAnalysis)

    // Overall score (weighted average)
    const overall = (
      trendScore * 0.3 +
      momentumScore * 0.3 +
      volatilityScore * 0.2 +
      volumeScore * 0.2
    )

    return {
      overall: Math.round(overall),
      trend: Math.round(trendScore),
      momentum: Math.round(momentumScore),
      volatility: Math.round(volatilityScore),
      volume: Math.round(volumeScore),
      components: {
        RSI: indicators.rsi.strength,
        MACD: indicators.macd.strength,
        Stochastic: indicators.stochastic.strength,
        'Williams %R': indicators.williamsR.strength,
        ADX: indicators.adx.strength
      }
    }
  }

  // Helper methods for pattern recognition
  private findPeaks(data: ChartData[], minDistance: number): { price: number; index: number }[] {
    const peaks: { price: number; index: number }[] = []

    for (let i = minDistance; i < data.length - minDistance; i++) {
      let isPeak = true

      for (let j = 1; j <= minDistance; j++) {
        if (data[i].high <= data[i - j].high || data[i].high <= data[i + j].high) {
          isPeak = false
          break
        }
      }

      if (isPeak) {
        peaks.push({ price: data[i].high, index: i })
      }
    }

    return peaks
  }

  private findTroughs(data: ChartData[], minDistance: number): { price: number; index: number }[] {
    const troughs: { price: number; index: number }[] = []

    for (let i = minDistance; i < data.length - minDistance; i++) {
      let isTrough = true

      for (let j = 1; j <= minDistance; j++) {
        if (data[i].low >= data[i - j].low || data[i].low >= data[i + j].low) {
          isTrough = false
          break
        }
      }

      if (isTrough) {
        troughs.push({ price: data[i].low, index: i })
      }
    }

    return troughs
  }

  private isFlat(prices: number[], tolerance: number): boolean {
    if (prices.length < 2) return false

    const avg = prices.reduce((sum, price) => sum + price, 0) / prices.length
    return prices.every(price => Math.abs(price - avg) / avg <= tolerance)
  }

  private isRising(prices: number[]): boolean {
    if (prices.length < 2) return false

    for (let i = 1; i < prices.length; i++) {
      if (prices[i] <= prices[i - 1]) return false
    }
    return true
  }

  private isFalling(prices: number[]): boolean {
    if (prices.length < 2) return false

    for (let i = 1; i < prices.length; i++) {
      if (prices[i] >= prices[i - 1]) return false
    }
    return true
  }

  private calculateTrend(prices: number[]): number {
    if (prices.length < 2) return 0

    return (prices[prices.length - 1] - prices[0]) / prices[0]
  }

  // Candlestick pattern helpers
  private isDoji(candle: ChartData): boolean {
    const bodySize = Math.abs(candle.close - candle.open)
    const totalRange = candle.high - candle.low
    return bodySize / totalRange < 0.1
  }

  private isHammer(candle: ChartData): boolean {
    const bodySize = Math.abs(candle.close - candle.open)
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low
    const upperShadow = candle.high - Math.max(candle.open, candle.close)

    return lowerShadow > bodySize * 2 && upperShadow < bodySize * 0.5
  }

  private isShootingStar(candle: ChartData): boolean {
    const bodySize = Math.abs(candle.close - candle.open)
    const lowerShadow = Math.min(candle.open, candle.close) - candle.low
    const upperShadow = candle.high - Math.max(candle.open, candle.close)

    return upperShadow > bodySize * 2 && lowerShadow < bodySize * 0.5
  }

  private isBullishEngulfing(prev: ChartData, current: ChartData): boolean {
    return prev.close < prev.open && // Previous candle is bearish
           current.close > current.open && // Current candle is bullish
           current.open < prev.close && // Current opens below previous close
           current.close > prev.open // Current closes above previous open
  }

  private isBearishEngulfing(prev: ChartData, current: ChartData): boolean {
    return prev.close > prev.open && // Previous candle is bullish
           current.close < current.open && // Current candle is bearish
           current.open > prev.close && // Current opens above previous close
           current.close < prev.open // Current closes below previous open
  }

  // Scoring helpers
  private calculateTrendScore(data: ChartData[], indicators: any): number {
    const sma20 = this.calculateSMA(data.map(d => d.close), 20)
    const sma50 = this.calculateSMA(data.map(d => d.close), 50)

    let score = 50

    // Price vs moving averages
    const currentPrice = data[data.length - 1].close
    const currentSMA20 = sma20[sma20.length - 1]
    const currentSMA50 = sma50[sma50.length - 1]

    if (currentPrice > currentSMA20) score += 10
    if (currentPrice > currentSMA50) score += 10
    if (currentSMA20 > currentSMA50) score += 10

    // ADX trend strength
    if (indicators.adx.value > 25) score += 15

    return Math.min(100, Math.max(0, score))
  }

  private calculateMomentumScore(indicators: any): number {
    let score = 50

    // RSI
    if (indicators.rsi.signal === 'buy') score += 15
    else if (indicators.rsi.signal === 'sell') score -= 15

    // MACD
    if (indicators.macd.signal === 'buy') score += 20
    else if (indicators.macd.signal === 'sell') score -= 20

    // Stochastic
    if (indicators.stochastic.signal === 'buy') score += 10
    else if (indicators.stochastic.signal === 'sell') score -= 10

    return Math.min(100, Math.max(0, score))
  }

  private calculateVolatilityScore(data: ChartData[], bollingerBands: BollingerBands): number {
    let score = 50

    // Bollinger Band position
    const currentPrice = data[data.length - 1].close
    const currentUpper = bollingerBands.upper[bollingerBands.upper.length - 1]
    const currentLower = bollingerBands.lower[bollingerBands.lower.length - 1]
    const currentMiddle = bollingerBands.middle[bollingerBands.middle.length - 1]

    const position = (currentPrice - currentLower) / (currentUpper - currentLower)

    if (position > 0.8) score -= 20 // Near upper band (high volatility)
    else if (position < 0.2) score -= 20 // Near lower band (high volatility)
    else score += 10 // In middle range (stable)

    // Squeeze detection
    if (bollingerBands.squeeze) score += 20 // Low volatility is good for stability

    return Math.min(100, Math.max(0, score))
  }

  private calculateVolumeScore(volumeAnalysis: VolumeAnalysis): number {
    let score = 50

    if (volumeAnalysis.volumeSignal === 'buy') score += 25
    else if (volumeAnalysis.volumeSignal === 'sell') score -= 25

    score += volumeAnalysis.volumeStrength * 0.25

    return Math.min(100, Math.max(0, score))
  }
}

// Export singleton instance
export const technicalAnalysisEngine = new TechnicalAnalysisEngine()
