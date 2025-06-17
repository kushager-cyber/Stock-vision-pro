'use client'

import { ChartData, StockData } from '@/types/stock'

// Risk assessment interfaces
interface RiskMetrics {
  var95: number // Value at Risk (95% confidence)
  var99: number // Value at Risk (99% confidence)
  cvar95: number // Conditional Value at Risk (95%)
  sharpeRatio: number
  beta: number
  volatility: number
  maxDrawdown: number
  liquidityRisk: number
  creditRisk: number
}

interface PortfolioRisk {
  totalRisk: number
  diversificationBenefit: number
  correlationMatrix: number[][]
  riskContribution: { [symbol: string]: number }
  optimalWeights: { [symbol: string]: number }
}

interface MarketRisk {
  marketCorrelation: number
  sectorRisk: number
  economicRisk: number
  geopoliticalRisk: number
  currencyRisk: number
  interestRateRisk: number
}

interface RiskScenario {
  name: string
  probability: number
  impact: number
  description: string
  priceImpact: number
}

interface RiskAlert {
  level: 'low' | 'medium' | 'high' | 'critical'
  type: string
  message: string
  timestamp: number
  threshold: number
  currentValue: number
}

interface MonteCarloResult {
  scenarios: number[][]
  percentiles: { [key: string]: number }
  expectedReturn: number
  riskMetrics: RiskMetrics
}

class RiskAssessmentService {
  private riskCache = new Map<string, { data: any; timestamp: number }>()
  private correlationCache = new Map<string, number[][]>()
  private readonly cacheTTL = 300000 // 5 minutes

  // Market indices for beta calculation
  private marketIndices = {
    'SPY': 'S&P 500',
    'QQQ': 'NASDAQ',
    'IWM': 'Russell 2000',
    'VTI': 'Total Stock Market'
  }

  // Economic indicators
  private economicIndicators = {
    interestRates: 0.05, // 5%
    inflation: 0.03, // 3%
    gdpGrowth: 0.025, // 2.5%
    unemploymentRate: 0.04, // 4%
    vixLevel: 20 // VIX volatility index
  }

  // Calculate Value at Risk (VaR)
  public calculateVaR(
    returns: number[], 
    confidence: number = 0.95, 
    timeHorizon: number = 1
  ): number {
    if (returns.length === 0) return 0

    const sortedReturns = [...returns].sort((a, b) => a - b)
    const index = Math.floor((1 - confidence) * sortedReturns.length)
    const var95 = -sortedReturns[index] * Math.sqrt(timeHorizon)
    
    return var95
  }

  // Calculate Conditional Value at Risk (CVaR)
  public calculateCVaR(
    returns: number[], 
    confidence: number = 0.95
  ): number {
    if (returns.length === 0) return 0

    const sortedReturns = [...returns].sort((a, b) => a - b)
    const cutoffIndex = Math.floor((1 - confidence) * sortedReturns.length)
    const tailReturns = sortedReturns.slice(0, cutoffIndex)
    
    if (tailReturns.length === 0) return 0
    
    const cvar = -tailReturns.reduce((sum, ret) => sum + ret, 0) / tailReturns.length
    return cvar
  }

  // Calculate Sharpe Ratio
  public calculateSharpeRatio(
    returns: number[], 
    riskFreeRate: number = 0.02
  ): number {
    if (returns.length === 0) return 0

    const avgReturn = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const excessReturn = avgReturn - riskFreeRate / 252 // Daily risk-free rate
    
    const variance = returns.reduce((sum, ret) => 
      sum + Math.pow(ret - avgReturn, 2), 0
    ) / returns.length
    const volatility = Math.sqrt(variance)
    
    return volatility === 0 ? 0 : excessReturn / volatility
  }

  // Calculate Beta (correlation with market)
  public calculateBeta(
    stockReturns: number[], 
    marketReturns: number[]
  ): number {
    if (stockReturns.length !== marketReturns.length || stockReturns.length === 0) {
      return 1.0 // Default beta
    }

    const stockMean = stockReturns.reduce((sum, ret) => sum + ret, 0) / stockReturns.length
    const marketMean = marketReturns.reduce((sum, ret) => sum + ret, 0) / marketReturns.length

    let covariance = 0
    let marketVariance = 0

    for (let i = 0; i < stockReturns.length; i++) {
      const stockDev = stockReturns[i] - stockMean
      const marketDev = marketReturns[i] - marketMean
      
      covariance += stockDev * marketDev
      marketVariance += marketDev * marketDev
    }

    covariance /= stockReturns.length
    marketVariance /= marketReturns.length

    return marketVariance === 0 ? 1.0 : covariance / marketVariance
  }

  // Calculate Maximum Drawdown
  public calculateMaxDrawdown(prices: number[]): number {
    if (prices.length === 0) return 0

    let maxDrawdown = 0
    let peak = prices[0]

    for (const price of prices) {
      if (price > peak) {
        peak = price
      }
      
      const drawdown = (peak - price) / peak
      maxDrawdown = Math.max(maxDrawdown, drawdown)
    }

    return maxDrawdown
  }

  // Calculate volatility (annualized)
  public calculateVolatility(returns: number[]): number {
    if (returns.length === 0) return 0

    const mean = returns.reduce((sum, ret) => sum + ret, 0) / returns.length
    const variance = returns.reduce((sum, ret) => 
      sum + Math.pow(ret - mean, 2), 0
    ) / returns.length
    
    return Math.sqrt(variance * 252) // Annualized volatility
  }

  // Comprehensive risk assessment for individual stock
  public assessStockRisk(
    stockData: StockData,
    priceHistory: ChartData[],
    marketData?: ChartData[]
  ): RiskMetrics {
    const cacheKey = `stock_risk_${stockData.symbol}`
    const cached = this.riskCache.get(cacheKey)
    
    if (cached && Date.now() - cached.timestamp < this.cacheTTL) {
      return cached.data
    }

    // Calculate returns
    const returns = this.calculateReturns(priceHistory)
    const marketReturns = marketData ? this.calculateReturns(marketData) : this.generateMockMarketReturns(returns.length)

    // Calculate risk metrics
    const var95 = this.calculateVaR(returns, 0.95)
    const var99 = this.calculateVaR(returns, 0.99)
    const cvar95 = this.calculateCVaR(returns, 0.95)
    const sharpeRatio = this.calculateSharpeRatio(returns)
    const beta = this.calculateBeta(returns, marketReturns)
    const volatility = this.calculateVolatility(returns)
    const maxDrawdown = this.calculateMaxDrawdown(priceHistory.map(p => p.close))
    const liquidityRisk = this.assessLiquidityRisk(stockData, priceHistory)
    const creditRisk = this.assessCreditRisk(stockData)

    const riskMetrics: RiskMetrics = {
      var95,
      var99,
      cvar95,
      sharpeRatio,
      beta,
      volatility,
      maxDrawdown,
      liquidityRisk,
      creditRisk
    }

    this.riskCache.set(cacheKey, {
      data: riskMetrics,
      timestamp: Date.now()
    })

    return riskMetrics
  }

  // Portfolio risk assessment
  public assessPortfolioRisk(
    holdings: { symbol: string; weight: number; data: StockData; history: ChartData[] }[]
  ): PortfolioRisk {
    if (holdings.length === 0) {
      return {
        totalRisk: 0,
        diversificationBenefit: 0,
        correlationMatrix: [],
        riskContribution: {},
        optimalWeights: {}
      }
    }

    // Calculate correlation matrix
    const correlationMatrix = this.calculateCorrelationMatrix(holdings)
    
    // Calculate portfolio volatility
    const weights = holdings.map(h => h.weight)
    const volatilities = holdings.map(h => {
      const returns = this.calculateReturns(h.history)
      return this.calculateVolatility(returns)
    })

    let portfolioVariance = 0
    for (let i = 0; i < holdings.length; i++) {
      for (let j = 0; j < holdings.length; j++) {
        portfolioVariance += weights[i] * weights[j] * volatilities[i] * volatilities[j] * correlationMatrix[i][j]
      }
    }

    const portfolioVolatility = Math.sqrt(portfolioVariance)
    
    // Calculate weighted average volatility (no diversification)
    const weightedAvgVolatility = weights.reduce((sum, weight, i) => 
      sum + weight * volatilities[i], 0
    )

    const diversificationBenefit = (weightedAvgVolatility - portfolioVolatility) / weightedAvgVolatility

    // Calculate risk contribution
    const riskContribution: { [symbol: string]: number } = {}
    for (let i = 0; i < holdings.length; i++) {
      let contribution = 0
      for (let j = 0; j < holdings.length; j++) {
        contribution += weights[j] * volatilities[i] * volatilities[j] * correlationMatrix[i][j]
      }
      riskContribution[holdings[i].symbol] = (weights[i] * contribution) / portfolioVariance
    }

    // Calculate optimal weights (simplified mean-variance optimization)
    const optimalWeights = this.calculateOptimalWeights(holdings, correlationMatrix)

    return {
      totalRisk: portfolioVolatility,
      diversificationBenefit,
      correlationMatrix,
      riskContribution,
      optimalWeights
    }
  }

  // Market risk assessment
  public assessMarketRisk(
    stockData: StockData,
    priceHistory: ChartData[]
  ): MarketRisk {
    const returns = this.calculateReturns(priceHistory)
    const marketReturns = this.generateMockMarketReturns(returns.length)
    
    // Market correlation
    const marketCorrelation = this.calculateCorrelation(returns, marketReturns)
    
    // Sector risk (mock calculation)
    const sectorRisk = this.calculateSectorRisk(stockData)
    
    // Economic risk factors
    const economicRisk = this.calculateEconomicRisk()
    
    // Geopolitical risk (mock)
    const geopoliticalRisk = Math.random() * 0.3 + 0.1 // 10-40%
    
    // Currency risk (for international stocks)
    const currencyRisk = this.calculateCurrencyRisk(stockData)
    
    // Interest rate risk
    const interestRateRisk = this.calculateInterestRateRisk(stockData)

    return {
      marketCorrelation,
      sectorRisk,
      economicRisk,
      geopoliticalRisk,
      currencyRisk,
      interestRateRisk
    }
  }

  // Monte Carlo simulation for risk scenarios
  public runMonteCarloSimulation(
    initialPrice: number,
    expectedReturn: number,
    volatility: number,
    timeHorizon: number = 252, // 1 year
    numSimulations: number = 10000
  ): MonteCarloResult {
    const scenarios: number[][] = []
    const finalPrices: number[] = []

    for (let sim = 0; sim < numSimulations; sim++) {
      const scenario: number[] = [initialPrice]
      let currentPrice = initialPrice

      for (let day = 1; day <= timeHorizon; day++) {
        const randomShock = this.generateRandomNormal() * volatility / Math.sqrt(252)
        const dailyReturn = expectedReturn / 252 + randomShock
        currentPrice *= (1 + dailyReturn)
        scenario.push(currentPrice)
      }

      scenarios.push(scenario)
      finalPrices.push(currentPrice)
    }

    // Calculate percentiles
    const sortedFinalPrices = [...finalPrices].sort((a, b) => a - b)
    const percentiles = {
      '5%': sortedFinalPrices[Math.floor(0.05 * numSimulations)],
      '25%': sortedFinalPrices[Math.floor(0.25 * numSimulations)],
      '50%': sortedFinalPrices[Math.floor(0.50 * numSimulations)],
      '75%': sortedFinalPrices[Math.floor(0.75 * numSimulations)],
      '95%': sortedFinalPrices[Math.floor(0.95 * numSimulations)]
    }

    // Calculate risk metrics from simulation
    const returns = finalPrices.map(price => (price - initialPrice) / initialPrice)
    const riskMetrics: RiskMetrics = {
      var95: this.calculateVaR(returns, 0.95),
      var99: this.calculateVaR(returns, 0.99),
      cvar95: this.calculateCVaR(returns, 0.95),
      sharpeRatio: this.calculateSharpeRatio(returns),
      beta: 1.0, // Default
      volatility,
      maxDrawdown: 0, // Would need to calculate from scenarios
      liquidityRisk: 0,
      creditRisk: 0
    }

    return {
      scenarios: scenarios.slice(0, 100), // Return first 100 scenarios for visualization
      percentiles,
      expectedReturn,
      riskMetrics
    }
  }

  // Risk alert system
  public generateRiskAlerts(
    stockData: StockData,
    riskMetrics: RiskMetrics,
    thresholds: { [key: string]: number } = {}
  ): RiskAlert[] {
    const alerts: RiskAlert[] = []
    const defaultThresholds = {
      volatility: 0.3, // 30%
      var95: 0.05, // 5%
      maxDrawdown: 0.2, // 20%
      beta: 2.0,
      sharpeRatio: 0.5
    }

    const activeThresholds = { ...defaultThresholds, ...thresholds }

    // Volatility alert
    if (riskMetrics.volatility > activeThresholds.volatility) {
      alerts.push({
        level: riskMetrics.volatility > 0.5 ? 'critical' : 'high',
        type: 'Volatility',
        message: `High volatility detected: ${(riskMetrics.volatility * 100).toFixed(1)}%`,
        timestamp: Date.now(),
        threshold: activeThresholds.volatility,
        currentValue: riskMetrics.volatility
      })
    }

    // VaR alert
    if (riskMetrics.var95 > activeThresholds.var95) {
      alerts.push({
        level: riskMetrics.var95 > 0.1 ? 'critical' : 'high',
        type: 'Value at Risk',
        message: `High VaR detected: ${(riskMetrics.var95 * 100).toFixed(1)}%`,
        timestamp: Date.now(),
        threshold: activeThresholds.var95,
        currentValue: riskMetrics.var95
      })
    }

    // Drawdown alert
    if (riskMetrics.maxDrawdown > activeThresholds.maxDrawdown) {
      alerts.push({
        level: riskMetrics.maxDrawdown > 0.3 ? 'critical' : 'high',
        type: 'Maximum Drawdown',
        message: `High drawdown detected: ${(riskMetrics.maxDrawdown * 100).toFixed(1)}%`,
        timestamp: Date.now(),
        threshold: activeThresholds.maxDrawdown,
        currentValue: riskMetrics.maxDrawdown
      })
    }

    // Beta alert
    if (Math.abs(riskMetrics.beta) > activeThresholds.beta) {
      alerts.push({
        level: Math.abs(riskMetrics.beta) > 3 ? 'high' : 'medium',
        type: 'Market Beta',
        message: `Extreme beta detected: ${riskMetrics.beta.toFixed(2)}`,
        timestamp: Date.now(),
        threshold: activeThresholds.beta,
        currentValue: Math.abs(riskMetrics.beta)
      })
    }

    // Sharpe ratio alert
    if (riskMetrics.sharpeRatio < activeThresholds.sharpeRatio) {
      alerts.push({
        level: riskMetrics.sharpeRatio < 0 ? 'high' : 'medium',
        type: 'Sharpe Ratio',
        message: `Poor risk-adjusted returns: ${riskMetrics.sharpeRatio.toFixed(2)}`,
        timestamp: Date.now(),
        threshold: activeThresholds.sharpeRatio,
        currentValue: riskMetrics.sharpeRatio
      })
    }

    return alerts
  }

  // Helper methods
  private calculateReturns(priceHistory: ChartData[]): number[] {
    const returns: number[] = []
    
    for (let i = 1; i < priceHistory.length; i++) {
      const currentPrice = priceHistory[i].close
      const previousPrice = priceHistory[i - 1].close
      const dailyReturn = (currentPrice - previousPrice) / previousPrice
      returns.push(dailyReturn)
    }
    
    return returns
  }

  private calculateCorrelation(returns1: number[], returns2: number[]): number {
    if (returns1.length !== returns2.length || returns1.length === 0) return 0

    const mean1 = returns1.reduce((sum, ret) => sum + ret, 0) / returns1.length
    const mean2 = returns2.reduce((sum, ret) => sum + ret, 0) / returns2.length

    let numerator = 0
    let sum1Sq = 0
    let sum2Sq = 0

    for (let i = 0; i < returns1.length; i++) {
      const dev1 = returns1[i] - mean1
      const dev2 = returns2[i] - mean2
      
      numerator += dev1 * dev2
      sum1Sq += dev1 * dev1
      sum2Sq += dev2 * dev2
    }

    const denominator = Math.sqrt(sum1Sq * sum2Sq)
    return denominator === 0 ? 0 : numerator / denominator
  }

  private calculateCorrelationMatrix(
    holdings: { symbol: string; weight: number; data: StockData; history: ChartData[] }[]
  ): number[][] {
    const n = holdings.length
    const matrix: number[][] = Array(n).fill(0).map(() => Array(n).fill(0))
    
    const returnsArrays = holdings.map(h => this.calculateReturns(h.history))

    for (let i = 0; i < n; i++) {
      for (let j = 0; j < n; j++) {
        if (i === j) {
          matrix[i][j] = 1.0
        } else {
          matrix[i][j] = this.calculateCorrelation(returnsArrays[i], returnsArrays[j])
        }
      }
    }

    return matrix
  }

  private assessLiquidityRisk(stockData: StockData, priceHistory: ChartData[]): number {
    // Calculate average volume and volume volatility
    const volumes = priceHistory.map(p => p.volume)
    const avgVolume = volumes.reduce((sum, vol) => sum + vol, 0) / volumes.length
    const volumeVolatility = this.calculateVolatility(volumes.map((vol, i) => 
      i === 0 ? 0 : (vol - volumes[i - 1]) / volumes[i - 1]
    ))

    // Market cap consideration
    const marketCapFactor = stockData.marketCap > 10000000000 ? 0.1 : // Large cap
                           stockData.marketCap > 2000000000 ? 0.3 :   // Mid cap
                           0.6 // Small cap

    // Combine factors
    const liquidityRisk = (volumeVolatility * 0.6 + marketCapFactor * 0.4)
    return Math.min(1.0, liquidityRisk)
  }

  private assessCreditRisk(stockData: StockData): number {
    // Simplified credit risk based on financial ratios
    const debtToEquity = stockData.debtToEquity || 0.5
    const currentRatio = stockData.currentRatio || 1.5
    const quickRatio = stockData.quickRatio || 1.0

    // Higher debt-to-equity increases risk
    const debtRisk = Math.min(1.0, debtToEquity / 2.0)
    
    // Lower liquidity ratios increase risk
    const liquidityRisk = Math.max(0, (2.0 - currentRatio) / 2.0)
    
    // Combine factors
    const creditRisk = (debtRisk * 0.6 + liquidityRisk * 0.4)
    return Math.min(1.0, creditRisk)
  }

  private calculateSectorRisk(stockData: StockData): number {
    // Mock sector risk calculation
    // In reality, this would use sector-specific data
    const sectorRiskMap: { [key: string]: number } = {
      'Technology': 0.25,
      'Healthcare': 0.20,
      'Financial': 0.30,
      'Energy': 0.35,
      'Utilities': 0.15,
      'Consumer': 0.22,
      'Industrial': 0.25
    }

    // Default to medium risk if sector unknown
    return sectorRiskMap['Technology'] || 0.25
  }

  private calculateEconomicRisk(): number {
    // Calculate risk based on economic indicators
    const indicators = this.economicIndicators
    
    // Higher interest rates and inflation increase risk
    const interestRateRisk = indicators.interestRates * 2 // Scale to 0-1
    const inflationRisk = indicators.inflation * 3 // Scale to 0-1
    const gdpRisk = Math.max(0, (0.03 - indicators.gdpGrowth) * 10) // Risk if GDP growth < 3%
    const unemploymentRisk = indicators.unemploymentRate * 5 // Scale to 0-1
    const vixRisk = Math.min(1.0, indicators.vixLevel / 50) // VIX risk

    const economicRisk = (
      interestRateRisk * 0.2 +
      inflationRisk * 0.2 +
      gdpRisk * 0.2 +
      unemploymentRisk * 0.2 +
      vixRisk * 0.2
    )

    return Math.min(1.0, economicRisk)
  }

  private calculateCurrencyRisk(stockData: StockData): number {
    // For US stocks, currency risk is minimal
    // For international stocks, would calculate based on currency volatility
    return 0.1 // Default low currency risk
  }

  private calculateInterestRateRisk(stockData: StockData): number {
    // Interest rate sensitivity varies by sector and company characteristics
    // High debt companies are more sensitive to interest rate changes
    const debtToEquity = stockData.debtToEquity || 0.5
    const interestRateRisk = Math.min(1.0, debtToEquity / 3.0)
    
    return interestRateRisk
  }

  private calculateOptimalWeights(
    holdings: { symbol: string; weight: number; data: StockData; history: ChartData[] }[],
    correlationMatrix: number[][]
  ): { [symbol: string]: number } {
    // Simplified mean-variance optimization
    // In practice, would use more sophisticated optimization algorithms
    
    const n = holdings.length
    const equalWeight = 1 / n
    const optimalWeights: { [symbol: string]: number } = {}

    // For simplicity, use equal weights adjusted for risk
    const risks = holdings.map(h => {
      const returns = this.calculateReturns(h.history)
      return this.calculateVolatility(returns)
    })

    const totalInverseRisk = risks.reduce((sum, risk) => sum + (1 / risk), 0)

    holdings.forEach((holding, i) => {
      const inverseRisk = 1 / risks[i]
      optimalWeights[holding.symbol] = inverseRisk / totalInverseRisk
    })

    return optimalWeights
  }

  private generateMockMarketReturns(length: number): number[] {
    // Generate mock market returns for beta calculation
    const returns: number[] = []
    for (let i = 0; i < length; i++) {
      returns.push(this.generateRandomNormal() * 0.01) // 1% daily volatility
    }
    return returns
  }

  private generateRandomNormal(): number {
    // Box-Muller transformation for normal distribution
    let u = 0, v = 0
    while (u === 0) u = Math.random() // Converting [0,1) to (0,1)
    while (v === 0) v = Math.random()
    return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v)
  }

  // Clear cache
  public clearCache(): void {
    this.riskCache.clear()
    this.correlationCache.clear()
  }
}

// Export singleton instance
export const riskAssessmentService = new RiskAssessmentService()
