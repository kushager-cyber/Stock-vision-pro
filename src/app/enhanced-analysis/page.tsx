'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  ArrowLeft, 
  Search, 
  TrendingUp, 
  Newspaper, 
  BarChart3, 
  Brain,
  Activity,
  Target
} from 'lucide-react'
import { useStock, StockProvider } from '@/contexts/StockContext'
import AdvancedStockSearch from '@/components/search/AdvancedStockSearch'
import StockAnalysis from '@/components/analysis/StockAnalysis'
import NewsSentimentAnalysis from '@/components/analysis/NewsSentimentAnalysis'
import TechnicalAnalysisDashboard from '@/components/analysis/TechnicalAnalysisDashboard'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'
import { stockApi } from '@/services/stockApi'
import { ChartData } from '@/types/stock'

function EnhancedAnalysisPageContent() {
  const { state } = useStock()
  const [selectedStock, setSelectedStock] = useState(state.selectedStock || 'AAPL')
  const [showSearch, setShowSearch] = useState(false)
  const [activeTab, setActiveTab] = useState<'overview' | 'technical' | 'sentiment' | 'ml'>('overview')
  const [chartData, setChartData] = useState<ChartData[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchChartData()
  }, [selectedStock])

  const fetchChartData = async () => {
    setLoading(true)
    try {
      const data = await stockApi.getChartData(selectedStock, '1y')
      setChartData(data)
    } catch (error) {
      console.error('Error fetching chart data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleStockSelect = (symbol: string) => {
    setSelectedStock(symbol)
    setShowSearch(false)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: TrendingUp },
    { id: 'technical', label: 'Technical', icon: BarChart3 },
    { id: 'sentiment', label: 'News & Sentiment', icon: Newspaper },
    { id: 'ml', label: 'ML Analysis', icon: Brain },
  ]

  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-purple-900 to-slate-900">
        {/* Header */}
        <header className="glass border-b border-white/10 sticky top-0 z-40">
          <div className="px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between h-16">
              {/* Left side */}
              <div className="flex items-center space-x-4">
                <button
                  onClick={() => window.history.back()}
                  className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                >
                  <ArrowLeft className="h-6 w-6" />
                </button>
                
                <div className="flex items-center space-x-3">
                  <Activity className="h-8 w-8 text-purple-400" />
                  <div>
                    <h1 className="text-xl font-bold text-white">Enhanced Analysis</h1>
                    <p className="text-sm text-gray-400">Advanced stock analysis with AI</p>
                  </div>
                </div>
              </div>

              {/* Search Toggle */}
              <button
                onClick={() => setShowSearch(!showSearch)}
                className="flex items-center space-x-2 px-4 py-2 glass rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Search className="h-5 w-5" />
                <span className="hidden sm:block">Search Stocks</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Search Section */}
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ 
              height: showSearch ? 'auto' : 0, 
              opacity: showSearch ? 1 : 0 
            }}
            transition={{ duration: 0.3 }}
            className="overflow-hidden mb-6"
          >
            {showSearch && (
              <motion.div
                initial={{ y: -20 }}
                animate={{ y: 0 }}
                className="glass-card"
              >
                <h2 className="text-lg font-semibold text-white mb-4">Search & Select Stock</h2>
                <AdvancedStockSearch
                  onStockSelect={handleStockSelect}
                  className="max-w-2xl"
                />
              </motion.div>
            )}
          </motion.div>

          {/* Stock Info Header */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mb-6"
          >
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-2xl font-bold text-white">{selectedStock}</h2>
                <p className="text-gray-400">Comprehensive Analysis Dashboard</p>
              </div>
              
              <div className="flex items-center space-x-2">
                <Target className="h-5 w-5 text-green-400" />
                <span className="text-green-400 font-medium">Live Analysis</span>
              </div>
            </div>
          </motion.div>

          {/* Tab Navigation */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-card mb-6"
          >
            <div className="flex flex-wrap gap-2">
              {tabs.map((tab) => {
                const Icon = tab.icon
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center space-x-2 px-4 py-3 rounded-lg transition-all ${
                      activeTab === tab.id
                        ? 'bg-purple-500 text-white shadow-lg'
                        : 'glass text-gray-300 hover:text-white hover:bg-white/10'
                    }`}
                  >
                    <Icon className="h-5 w-5" />
                    <span className="font-medium">{tab.label}</span>
                  </button>
                )
              })}
            </div>
          </motion.div>

          {/* Tab Content */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            {activeTab === 'overview' && (
              <StockAnalysis symbol={selectedStock} />
            )}

            {activeTab === 'technical' && (
              <TechnicalAnalysisDashboard 
                symbol={selectedStock} 
                data={chartData}
              />
            )}

            {activeTab === 'sentiment' && (
              <NewsSentimentAnalysis symbol={selectedStock} />
            )}

            {activeTab === 'ml' && (
              <div className="glass-card">
                <div className="text-center py-12">
                  <Brain className="h-16 w-16 text-purple-400 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-white mb-2">ML Analysis Coming Soon</h3>
                  <p className="text-gray-400 max-w-md mx-auto">
                    Advanced machine learning models for price prediction, risk assessment, 
                    and portfolio optimization are currently in development.
                  </p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4 max-w-2xl mx-auto">
                    <div className="p-4 glass rounded-lg">
                      <h4 className="font-semibold text-white mb-2">LSTM Prediction</h4>
                      <p className="text-sm text-gray-400">Neural network-based price forecasting</p>
                    </div>
                    <div className="p-4 glass rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Risk Assessment</h4>
                      <p className="text-sm text-gray-400">VaR, CVaR, and portfolio risk metrics</p>
                    </div>
                    <div className="p-4 glass rounded-lg">
                      <h4 className="font-semibold text-white mb-2">Ensemble Models</h4>
                      <p className="text-sm text-gray-400">Multiple model combination for accuracy</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </motion.div>

          {/* Feature Highlights */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-8 glass-card"
          >
            <h3 className="text-lg font-semibold text-white mb-4">Enhanced Analysis Features</h3>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 glass rounded-lg">
                <BarChart3 className="h-8 w-8 text-blue-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Technical Analysis</h4>
                <p className="text-sm text-gray-400">
                  RSI, MACD, Bollinger Bands, support/resistance levels, and pattern recognition
                </p>
              </div>

              <div className="p-4 glass rounded-lg">
                <Newspaper className="h-8 w-8 text-green-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Sentiment Analysis</h4>
                <p className="text-sm text-gray-400">
                  Real-time news sentiment, impact scoring, and trend analysis
                </p>
              </div>

              <div className="p-4 glass rounded-lg">
                <Brain className="h-8 w-8 text-purple-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">AI Predictions</h4>
                <p className="text-sm text-gray-400">
                  Machine learning models for price forecasting and risk assessment
                </p>
              </div>

              <div className="p-4 glass rounded-lg">
                <Target className="h-8 w-8 text-yellow-400 mb-3" />
                <h4 className="font-semibold text-white mb-2">Risk Management</h4>
                <p className="text-sm text-gray-400">
                  VaR calculations, portfolio optimization, and Monte Carlo simulations
                </p>
              </div>
            </div>
          </motion.div>

          {/* Performance Metrics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4"
          >
            <div className="glass-card text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">15+</div>
              <div className="text-sm text-gray-400">Technical Indicators</div>
            </div>

            <div className="glass-card text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">Real-time</div>
              <div className="text-sm text-gray-400">News Sentiment</div>
            </div>

            <div className="glass-card text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">AI-Powered</div>
              <div className="text-sm text-gray-400">Predictions</div>
            </div>
          </motion.div>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default function EnhancedAnalysisPage() {
  return (
    <StockProvider>
      <EnhancedAnalysisPageContent />
    </StockProvider>
  )
}
