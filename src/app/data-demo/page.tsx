'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Database, Wifi, Globe, Zap } from 'lucide-react'
import { StockProvider } from '@/contexts/StockContext'
import RealTimeDataDemo from '@/components/demo/RealTimeDataDemo'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

function DataDemoPageContent() {
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
                  <Database className="h-8 w-8 text-blue-400" />
                  <div>
                    <h1 className="text-xl font-bold text-white">Real-Time Data Integration</h1>
                    <p className="text-sm text-gray-400">Live market data with multiple APIs</p>
                  </div>
                </div>
              </div>

              {/* API Status Indicators */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400">Alpha Vantage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400">Yahoo Finance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-purple-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-gray-400">Finnhub WS</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="px-4 sm:px-6 lg:px-8 py-6">
          {/* Introduction */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-card mb-8"
          >
            <div className="text-center">
              <h2 className="text-2xl font-bold text-white mb-4">
                Advanced Real-Time Data Integration
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Experience our comprehensive real-time stock data system featuring multiple API integrations, 
                WebSocket connections, intelligent caching, and automatic fallback mechanisms. This demo 
                showcases live market data updates, batch processing, and robust error handling.
              </p>
            </div>

            {/* Feature Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mt-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-center p-4 glass rounded-lg"
              >
                <Database className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Multiple APIs</h3>
                <p className="text-sm text-gray-400">
                  Alpha Vantage, Yahoo Finance, and Finnhub integration with automatic fallback
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center p-4 glass rounded-lg"
              >
                <Wifi className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">WebSocket Streaming</h3>
                <p className="text-sm text-gray-400">
                  Real-time data streaming with automatic reconnection and heartbeat
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center p-4 glass rounded-lg"
              >
                <Globe className="h-8 w-8 text-purple-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Global Markets</h3>
                <p className="text-sm text-gray-400">
                  Support for NYSE, NASDAQ, LSE, TSE with market hours detection
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center p-4 glass rounded-lg"
              >
                <Zap className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Smart Caching</h3>
                <p className="text-sm text-gray-400">
                  Intelligent caching system to minimize API calls and improve performance
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Real-Time Data Demo */}
          <RealTimeDataDemo />

          {/* Technical Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card mt-8"
          >
            <h3 className="text-xl font-bold text-white mb-6">Technical Implementation</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* API Integration */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">API Integration Features</h4>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <span>Real-time price updates every 5 seconds during market hours</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <span>WebSocket connections for live data streaming</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-purple-400 rounded-full mt-2"></div>
                    <span>Intelligent caching to reduce API calls</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-yellow-400 rounded-full mt-2"></div>
                    <span>Robust error handling and rate limit management</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-red-400 rounded-full mt-2"></div>
                    <span>Market hours detection and after-hours trading</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-indigo-400 rounded-full mt-2"></div>
                    <span>Multiple exchange support (NYSE, NASDAQ, international)</span>
                  </li>
                </ul>
              </div>

              {/* Data Processing */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Data Processing</h4>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full mt-2"></div>
                    <span>Currency conversion for international stocks</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-pink-400 rounded-full mt-2"></div>
                    <span>Batch API calls for multiple stocks</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-orange-400 rounded-full mt-2"></div>
                    <span>Data validation and sanitization</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-teal-400 rounded-full mt-2"></div>
                    <span>Automatic fallback between data sources</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-lime-400 rounded-full mt-2"></div>
                    <span>Real-time subscription management</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-rose-400 rounded-full mt-2"></div>
                    <span>Memory-efficient caching with TTL</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* Code Example */}
            <div className="mt-8 p-4 bg-black/30 rounded-lg border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4">Sample Integration Code</h4>
              <pre className="text-sm text-gray-300 overflow-x-auto">
{`// Real-time data subscription
const unsubscribe = realTimeDataService.subscribeToRealTimeUpdates(
  ['AAPL', 'GOOGL', 'MSFT'], 
  (quote) => {
    console.log('Live update:', quote.symbol, quote.price)
    updateUI(quote)
  }
)

// Batch quote retrieval
const quotes = await realTimeDataService.getBatchQuotes([
  'AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN'
])

// Market hours detection
const marketHours = realTimeDataService.getMarketHours('NASDAQ')
if (marketHours.isOpen) {
  startRealTimeUpdates()
}`}
              </pre>
            </div>
          </motion.div>

          {/* Documentation Link */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="text-center mt-8"
          >
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-4">
                Complete API Documentation
              </h3>
              <p className="text-gray-400 mb-6">
                For detailed implementation guides, configuration options, and advanced features, 
                check out our comprehensive API documentation.
              </p>
              <a
                href="/docs/API_INTEGRATION.md"
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center space-x-2 px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                <Database className="h-5 w-5" />
                <span>View API Documentation</span>
              </a>
            </div>
          </motion.div>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default function DataDemoPage() {
  return (
    <StockProvider>
      <DataDemoPageContent />
    </StockProvider>
  )
}
