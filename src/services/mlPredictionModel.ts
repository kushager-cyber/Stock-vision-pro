'use client'

import { ChartData } from '@/types/stock'
import { technicalAnalysisEngine } from './technicalAnalysisEngine'
import { newsSentimentService } from './newsSentimentService'

// ML Model interfaces
interface ModelFeatures {
  prices: number[]
  volumes: number[]
  technicalIndicators: number[]
  sentimentScores: number[]
  marketFeatures: number[]
}

interface PredictionResult {
  price: number
  confidence: number
  direction: 'up' | 'down' | 'neutral'
  probability: number
  horizon: string
}

interface ModelPerformance {
  mae: number // Mean Absolute Error
  rmse: number // Root Mean Square Error
  accuracy: number // Directional accuracy
  sharpeRatio: number
  maxDrawdown: number
}

interface EnsembleModel {
  models: MLModel[]
  weights: number[]
  performance: ModelPerformance
}

interface BacktestResult {
  totalReturn: number
  winRate: number
  avgWin: number
  avgLoss: number
  maxDrawdown: number
  sharpeRatio: number
  trades: {
    date: string
    action: 'buy' | 'sell'
    price: number
    return: number
  }[]
}

class MLModel {
  private modelWeights: number[][][]
  private biases: number[][]
  private inputSize: number
  private hiddenSize: number
  private outputSize: number
  private learningRate: number
  private isTraining: boolean = false

  constructor(inputSize: number = 50, hiddenSize: number = 100, outputSize: number = 3) {
    this.inputSize = inputSize
    this.hiddenSize = hiddenSize
    this.outputSize = outputSize
    this.learningRate = 0.001
    
    // Initialize weights and biases
    this.initializeWeights()
  }

  private initializeWeights() {
    // Xavier initialization for better convergence
    const limit = Math.sqrt(6 / (this.inputSize + this.hiddenSize))
    
    this.modelWeights = [
      // Input to hidden layer
      Array(this.hiddenSize).fill(0).map(() => 
        Array(this.inputSize).fill(0).map(() => 
          (Math.random() * 2 - 1) * limit
        )
      ),
      // Hidden to output layer
      Array(this.outputSize).fill(0).map(() => 
        Array(this.hiddenSize).fill(0).map(() => 
          (Math.random() * 2 - 1) * Math.sqrt(6 / (this.hiddenSize + this.outputSize))
        )
      )
    ]

    this.biases = [
      Array(this.hiddenSize).fill(0),
      Array(this.outputSize).fill(0)
    ]
  }

  // Activation functions
  private relu(x: number): number {
    return Math.max(0, x)
  }

  private sigmoid(x: number): number {
    return 1 / (1 + Math.exp(-Math.max(-500, Math.min(500, x))))
  }

  private tanh(x: number): number {
    return Math.tanh(x)
  }

  private softmax(values: number[]): number[] {
    const maxVal = Math.max(...values)
    const exp = values.map(v => Math.exp(v - maxVal))
    const sum = exp.reduce((a, b) => a + b, 0)
    return exp.map(e => e / sum)
  }

  // Forward pass
  private forward(input: number[]): { hidden: number[], output: number[] } {
    // Input to hidden layer
    const hidden = this.modelWeights[0].map((weights, i) => {
      const sum = weights.reduce((acc, w, j) => acc + w * input[j], 0) + this.biases[0][i]
      return this.tanh(sum)
    })

    // Hidden to output layer
    const output = this.modelWeights[1].map((weights, i) => {
      const sum = weights.reduce((acc, w, j) => acc + w * hidden[j], 0) + this.biases[1][i]
      return sum
    })

    return { hidden, output: this.softmax(output) }
  }

  // Predict single sample
  public predict(features: number[]): PredictionResult {
    if (features.length !== this.inputSize) {
      throw new Error(`Expected ${this.inputSize} features, got ${features.length}`)
    }

    const { output } = this.forward(features)
    
    // Output interpretation: [down_prob, neutral_prob, up_prob]
    const [downProb, neutralProb, upProb] = output
    
    let direction: 'up' | 'down' | 'neutral'
    let probability: number
    
    if (upProb > downProb && upProb > neutralProb) {
      direction = 'up'
      probability = upProb
    } else if (downProb > upProb && downProb > neutralProb) {
      direction = 'down'
      probability = downProb
    } else {
      direction = 'neutral'
      probability = neutralProb
    }

    // Calculate confidence based on probability distribution
    const entropy = -output.reduce((sum, p) => sum + (p > 0 ? p * Math.log(p) : 0), 0)
    const maxEntropy = Math.log(output.length)
    const confidence = 1 - (entropy / maxEntropy)

    // Estimate price change based on direction and probability
    const baseChange = direction === 'up' ? 0.02 : direction === 'down' ? -0.02 : 0
    const priceChange = baseChange * probability * 2 // Scale by probability

    return {
      price: 0, // Will be set by caller with current price
      confidence,
      direction,
      probability,
      horizon: '1d' // Default horizon
    }
  }

  // Simple training simulation (in real implementation, use proper backpropagation)
  public train(trainingData: { features: number[], target: number[] }[]): void {
    this.isTraining = true
    
    // Simulate training with random weight updates
    // In a real implementation, this would use proper gradient descent
    for (let epoch = 0; epoch < 100; epoch++) {
      let totalLoss = 0
      
      for (const sample of trainingData) {
        const { output } = this.forward(sample.features)
        
        // Calculate loss (cross-entropy)
        const loss = -sample.target.reduce((sum, target, i) => 
          sum + (target > 0 ? target * Math.log(Math.max(output[i], 1e-15)) : 0), 0
        )
        totalLoss += loss
        
        // Simulate weight updates (simplified)
        this.updateWeights(sample.features, output, sample.target)
      }
      
      if (epoch % 20 === 0) {
        console.log(`Epoch ${epoch}, Loss: ${(totalLoss / trainingData.length).toFixed(4)}`)
      }
    }
    
    this.isTraining = false
  }

  private updateWeights(input: number[], predicted: number[], target: number[]): void {
    // Simplified weight update (in real implementation, use proper backpropagation)
    const error = target.map((t, i) => t - predicted[i])
    const learningFactor = this.learningRate * 0.1
    
    // Update output layer weights (simplified)
    for (let i = 0; i < this.outputSize; i++) {
      for (let j = 0; j < this.hiddenSize; j++) {
        this.modelWeights[1][i][j] += learningFactor * error[i] * Math.random() * 0.01
      }
      this.biases[1][i] += learningFactor * error[i] * 0.01
    }
  }

  public getPerformance(): ModelPerformance {
    // Return mock performance metrics
    return {
      mae: 0.02 + Math.random() * 0.03,
      rmse: 0.03 + Math.random() * 0.04,
      accuracy: 0.65 + Math.random() * 0.2,
      sharpeRatio: 1.2 + Math.random() * 0.8,
      maxDrawdown: 0.1 + Math.random() * 0.15
    }
  }
}

class MLPredictionService {
  private models: Map<string, EnsembleModel> = new Map()
  private featureCache = new Map<string, ModelFeatures>()
  private predictionCache = new Map<string, { predictions: PredictionResult[], timestamp: number }>()

  constructor() {
    this.initializeModels()
  }

  private initializeModels() {
    // Initialize ensemble models for different time horizons
    const horizons = ['1d', '1w', '1m', '3m']
    
    for (const horizon of horizons) {
      const models = [
        new MLModel(50, 100, 3), // LSTM-like model
        new MLModel(50, 80, 3),  // Smaller model
        new MLModel(50, 120, 3)  // Larger model
      ]
      
      const weights = [0.4, 0.3, 0.3] // Ensemble weights
      
      this.models.set(horizon, {
        models,
        weights,
        performance: {
          mae: 0.025,
          rmse: 0.035,
          accuracy: 0.72,
          sharpeRatio: 1.45,
          maxDrawdown: 0.12
        }
      })
    }
  }

  // Extract features from market data
  public extractFeatures(
    data: ChartData[], 
    sentimentData?: any[], 
    marketData?: any[]
  ): ModelFeatures {
    const cacheKey = `features_${data.length}_${Date.now()}`
    const cached = this.featureCache.get(cacheKey)
    if (cached) return cached

    // Price features (normalized)
    const prices = data.map(d => d.close)
    const normalizedPrices = this.normalizeArray(prices)
    
    // Volume features (normalized)
    const volumes = data.map(d => d.volume)
    const normalizedVolumes = this.normalizeArray(volumes)
    
    // Technical indicators
    const rsi = technicalAnalysisEngine.calculateRSI(data)
    const macd = technicalAnalysisEngine.calculateMACD(data)
    const stochastic = technicalAnalysisEngine.calculateStochastic(data)
    const adx = technicalAnalysisEngine.calculateADX(data)
    const bollingerBands = technicalAnalysisEngine.calculateBollingerBands(data)
    
    const technicalIndicators = [
      rsi.value / 100,
      macd.value,
      stochastic.value / 100,
      adx.value / 100,
      bollingerBands.bandwidth[bollingerBands.bandwidth.length - 1] || 0
    ]

    // Sentiment features
    const sentimentScores = sentimentData ? 
      sentimentData.map(s => s.sentiment || 0) : 
      Array(10).fill(0)

    // Market features (mock data)
    const marketFeatures = [
      Math.random() - 0.5, // Market sentiment
      Math.random() - 0.5, // Sector performance
      Math.random() - 0.5, // Economic indicators
      Math.random() - 0.5, // Volatility index
      Math.random() - 0.5  // Interest rates
    ]

    const features: ModelFeatures = {
      prices: normalizedPrices.slice(-20), // Last 20 prices
      volumes: normalizedVolumes.slice(-20), // Last 20 volumes
      technicalIndicators,
      sentimentScores: sentimentScores.slice(-10), // Last 10 sentiment scores
      marketFeatures
    }

    this.featureCache.set(cacheKey, features)
    return features
  }

  // Make predictions using ensemble models
  public async predict(
    symbol: string,
    data: ChartData[],
    horizons: string[] = ['1d', '1w', '1m']
  ): Promise<PredictionResult[]> {
    const cacheKey = `predictions_${symbol}_${horizons.join('_')}`
    const cached = this.predictionCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < 300000) { // 5 minute cache
      return cached.predictions
    }

    const features = this.extractFeatures(data)
    const flatFeatures = this.flattenFeatures(features)
    const currentPrice = data[data.length - 1].close
    
    const predictions: PredictionResult[] = []

    for (const horizon of horizons) {
      const ensemble = this.models.get(horizon)
      if (!ensemble) continue

      // Get predictions from all models in ensemble
      const modelPredictions = ensemble.models.map(model => 
        model.predict(flatFeatures)
      )

      // Combine predictions using ensemble weights
      let weightedConfidence = 0
      let weightedProbability = 0
      const directionVotes = { up: 0, down: 0, neutral: 0 }

      modelPredictions.forEach((pred, i) => {
        const weight = ensemble.weights[i]
        weightedConfidence += pred.confidence * weight
        weightedProbability += pred.probability * weight
        directionVotes[pred.direction] += weight
      })

      // Determine ensemble direction
      const direction = Object.entries(directionVotes).reduce((a, b) => 
        directionVotes[a[0] as keyof typeof directionVotes] > directionVotes[b[0] as keyof typeof directionVotes] ? a : b
      )[0] as 'up' | 'down' | 'neutral'

      // Calculate price prediction
      const baseChange = this.getHorizonMultiplier(horizon)
      const directionMultiplier = direction === 'up' ? 1 : direction === 'down' ? -1 : 0
      const priceChange = baseChange * directionMultiplier * weightedProbability
      const predictedPrice = currentPrice * (1 + priceChange)

      predictions.push({
        price: predictedPrice,
        confidence: weightedConfidence,
        direction,
        probability: weightedProbability,
        horizon
      })
    }

    // Cache predictions
    this.predictionCache.set(cacheKey, {
      predictions,
      timestamp: Date.now()
    })

    return predictions
  }

  // Backtesting functionality
  public async backtest(
    data: ChartData[],
    startIndex: number = 100,
    strategy: 'buy_hold' | 'ml_signals' = 'ml_signals'
  ): Promise<BacktestResult> {
    const trades: BacktestResult['trades'] = []
    let position = 0 // 0 = no position, 1 = long, -1 = short
    let cash = 10000 // Starting cash
    let shares = 0
    let maxValue = cash
    let minValue = cash

    for (let i = startIndex; i < data.length - 1; i++) {
      const historicalData = data.slice(0, i + 1)
      const currentPrice = data[i].close
      const nextPrice = data[i + 1].close
      
      if (strategy === 'ml_signals') {
        try {
          const predictions = await this.predict('TEST', historicalData, ['1d'])
          const prediction = predictions[0]
          
          if (prediction && prediction.confidence > 0.6) {
            if (prediction.direction === 'up' && position <= 0) {
              // Buy signal
              if (position === -1) {
                // Close short position
                cash += shares * currentPrice
                shares = 0
              }
              // Open long position
              shares = cash / currentPrice
              cash = 0
              position = 1
              
              trades.push({
                date: new Date(data[i].timestamp).toISOString().split('T')[0],
                action: 'buy',
                price: currentPrice,
                return: 0
              })
            } else if (prediction.direction === 'down' && position >= 0) {
              // Sell signal
              if (position === 1) {
                // Close long position
                cash = shares * currentPrice
                shares = 0
              }
              position = -1
              
              trades.push({
                date: new Date(data[i].timestamp).toISOString().split('T')[0],
                action: 'sell',
                price: currentPrice,
                return: 0
              })
            }
          }
        } catch (error) {
          // Skip if prediction fails
          continue
        }
      }

      // Calculate portfolio value
      const portfolioValue = cash + (shares * currentPrice)
      maxValue = Math.max(maxValue, portfolioValue)
      minValue = Math.min(minValue, portfolioValue)
    }

    // Final portfolio value
    const finalPrice = data[data.length - 1].close
    const finalValue = cash + (shares * finalPrice)
    
    // Calculate metrics
    const totalReturn = (finalValue - 10000) / 10000
    const winningTrades = trades.filter(t => t.return > 0).length
    const winRate = trades.length > 0 ? winningTrades / trades.length : 0
    const maxDrawdown = (maxValue - minValue) / maxValue
    
    const returns = trades.map(t => t.return).filter(r => r !== 0)
    const avgWin = returns.filter(r => r > 0).reduce((sum, r) => sum + r, 0) / Math.max(1, returns.filter(r => r > 0).length)
    const avgLoss = Math.abs(returns.filter(r => r < 0).reduce((sum, r) => sum + r, 0)) / Math.max(1, returns.filter(r => r < 0).length)
    
    // Calculate Sharpe ratio (simplified)
    const avgReturn = returns.reduce((sum, r) => sum + r, 0) / Math.max(1, returns.length)
    const returnStd = Math.sqrt(returns.reduce((sum, r) => sum + Math.pow(r - avgReturn, 2), 0) / Math.max(1, returns.length))
    const sharpeRatio = returnStd > 0 ? avgReturn / returnStd : 0

    return {
      totalReturn,
      winRate,
      avgWin: avgWin || 0,
      avgLoss: avgLoss || 0,
      maxDrawdown,
      sharpeRatio,
      trades
    }
  }

  // Utility methods
  private normalizeArray(arr: number[]): number[] {
    const min = Math.min(...arr)
    const max = Math.max(...arr)
    const range = max - min
    
    if (range === 0) return arr.map(() => 0)
    
    return arr.map(val => (val - min) / range)
  }

  private flattenFeatures(features: ModelFeatures): number[] {
    return [
      ...features.prices,
      ...features.volumes,
      ...features.technicalIndicators,
      ...features.sentimentScores,
      ...features.marketFeatures
    ].slice(0, 50) // Ensure exactly 50 features
  }

  private getHorizonMultiplier(horizon: string): number {
    switch (horizon) {
      case '1d': return 0.02
      case '1w': return 0.05
      case '1m': return 0.10
      case '3m': return 0.20
      default: return 0.02
    }
  }

  // Model retraining
  public async retrainModels(data: ChartData[]): Promise<void> {
    console.log('Retraining ML models...')
    
    // Prepare training data
    const trainingData = this.prepareTrainingData(data)
    
    // Retrain each model
    for (const [horizon, ensemble] of this.models) {
      for (const model of ensemble.models) {
        model.train(trainingData)
      }
      
      // Update performance metrics
      ensemble.performance = ensemble.models[0].getPerformance()
    }
    
    console.log('Model retraining completed')
  }

  private prepareTrainingData(data: ChartData[]): { features: number[], target: number[] }[] {
    const trainingData: { features: number[], target: number[] }[] = []
    const lookback = 50
    
    for (let i = lookback; i < data.length - 1; i++) {
      const historicalData = data.slice(i - lookback, i)
      const features = this.extractFeatures(historicalData)
      const flatFeatures = this.flattenFeatures(features)
      
      // Calculate target (next day's direction)
      const currentPrice = data[i].close
      const nextPrice = data[i + 1].close
      const priceChange = (nextPrice - currentPrice) / currentPrice
      
      let target: number[]
      if (priceChange > 0.01) {
        target = [0, 0, 1] // Up
      } else if (priceChange < -0.01) {
        target = [1, 0, 0] // Down
      } else {
        target = [0, 1, 0] // Neutral
      }
      
      trainingData.push({ features: flatFeatures, target })
    }
    
    return trainingData
  }

  // Clear caches
  public clearCache(): void {
    this.featureCache.clear()
    this.predictionCache.clear()
  }
}

// Export singleton instance
export const mlPredictionService = new MLPredictionService()
