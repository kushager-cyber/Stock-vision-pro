'use client'

import { motion } from 'framer-motion'
import { ArrowLeft, Globe, TrendingUp, Building2, Banknote } from 'lucide-react'
import { StockProvider } from '@/contexts/StockContext'
import IndianMarketDemo from '@/components/demo/IndianMarketDemo'
import { ErrorBoundary } from '@/components/ui/ErrorBoundary'

function IndianMarketPageContent() {
  return (
    <ErrorBoundary>
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-orange-900 to-slate-900">
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
                  <Globe className="h-8 w-8 text-orange-400" />
                  <div>
                    <h1 className="text-xl font-bold text-white">Indian Stock Market</h1>
                    <p className="text-sm text-gray-400">NSE & BSE Market Data</p>
                  </div>
                </div>
              </div>

              {/* Market Status */}
              <div className="flex items-center space-x-4">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-sm text-green-400">Live Demo</span>
                </div>
                <div className="flex items-center space-x-2">
                  <Banknote className="h-4 w-4 text-orange-400" />
                  <span className="text-sm text-gray-400">INR Currency</span>
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
                Indian Stock Market Integration
              </h2>
              <p className="text-gray-400 max-w-3xl mx-auto">
                Experience comprehensive Indian stock market data with support for NSE and BSE exchanges. 
                This demo showcases real Indian companies with simulated live market data, 
                sector-wise filtering, and market indices tracking.
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
                <Building2 className="h-8 w-8 text-orange-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">NSE & BSE</h3>
                <p className="text-sm text-gray-400">
                  Support for both National Stock Exchange and Bombay Stock Exchange
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
                className="text-center p-4 glass rounded-lg"
              >
                <TrendingUp className="h-8 w-8 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Live Indices</h3>
                <p className="text-sm text-gray-400">
                  Real-time tracking of NIFTY 50, SENSEX, NIFTY BANK, and sector indices
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                className="text-center p-4 glass rounded-lg"
              >
                <Globe className="h-8 w-8 text-blue-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">Indian Companies</h3>
                <p className="text-sm text-gray-400">
                  Top Indian stocks including Reliance, TCS, HDFC Bank, Infosys, and more
                </p>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                className="text-center p-4 glass rounded-lg"
              >
                <Banknote className="h-8 w-8 text-yellow-400 mx-auto mb-3" />
                <h3 className="font-semibold text-white mb-2">INR Pricing</h3>
                <p className="text-sm text-gray-400">
                  Native Indian Rupee pricing with market cap in Crores format
                </p>
              </motion.div>
            </div>
          </motion.div>

          {/* Indian Market Demo */}
          <IndianMarketDemo />

          {/* Integration Details */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.5 }}
            className="glass-card mt-8"
          >
            <h3 className="text-xl font-bold text-white mb-6">Real Indian Market Integration</h3>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Current Implementation */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Current Demo Features</h4>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <span>Simulated live data for top 10 Indian stocks</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <span>Real company names and realistic market caps</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <span>Sector-wise filtering (Banking, IT, FMCG, etc.)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <span>Market indices tracking (NIFTY, SENSEX)</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <span>Indian market hours and timezone support</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-green-400 rounded-full mt-2"></div>
                    <span>INR currency formatting and Crores notation</span>
                  </li>
                </ul>
              </div>

              {/* Real Integration Path */}
              <div>
                <h4 className="text-lg font-semibold text-white mb-4">Real Data Integration</h4>
                <ul className="space-y-3 text-gray-400">
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <span>NSE Official API integration for real-time data</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <span>BSE API for Bombay Stock Exchange data</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <span>Economic Times or MoneyControl API integration</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <span>Zerodha Kite API for retail trading data</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <span>SEBI compliance and regulatory requirements</span>
                  </li>
                  <li className="flex items-start space-x-2">
                    <div className="w-2 h-2 bg-blue-400 rounded-full mt-2"></div>
                    <span>Real-time WebSocket feeds for live updates</span>
                  </li>
                </ul>
              </div>
            </div>

            {/* API Integration Code Example */}
            <div className="mt-8 p-4 bg-black/30 rounded-lg border border-white/10">
              <h4 className="text-lg font-semibold text-white mb-4">Sample Indian Market API Integration</h4>
              <pre className="text-sm text-gray-300 overflow-x-auto">
{`// Indian Market Data Service Integration
const indianMarketService = {
  // NSE API Integration
  async getNSEQuote(symbol) {
    const response = await fetch(\`https://www.nseindia.com/api/quote-equity?symbol=\${symbol}\`)
    return response.json()
  },

  // BSE API Integration  
  async getBSEQuote(symbol) {
    const response = await fetch(\`https://api.bseindia.com/BseIndiaAPI/api/StockReachGraph/w?scripcode=\${symbol}\`)
    return response.json()
  },

  // Market Indices
  async getIndices() {
    const nifty = await fetch('https://www.nseindia.com/api/allIndices')
    return nifty.json()
  },

  // Currency conversion INR
  async convertToINR(amount, fromCurrency) {
    const rate = await this.getExchangeRate(fromCurrency, 'INR')
    return amount * rate
  }
}`}
              </pre>
            </div>
          </motion.div>

          {/* Market Statistics */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4"
          >
            <div className="glass-card text-center">
              <div className="text-2xl font-bold text-orange-400 mb-2">5,000+</div>
              <div className="text-sm text-gray-400">Listed Companies</div>
            </div>

            <div className="glass-card text-center">
              <div className="text-2xl font-bold text-green-400 mb-2">₹280L Cr</div>
              <div className="text-sm text-gray-400">Market Cap</div>
            </div>

            <div className="glass-card text-center">
              <div className="text-2xl font-bold text-blue-400 mb-2">9:15-15:30</div>
              <div className="text-sm text-gray-400">Trading Hours (IST)</div>
            </div>

            <div className="glass-card text-center">
              <div className="text-2xl font-bold text-purple-400 mb-2">T+1</div>
              <div className="text-sm text-gray-400">Settlement Cycle</div>
            </div>
          </motion.div>

          {/* Next Steps */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="text-center mt-8"
          >
            <div className="glass-card">
              <h3 className="text-lg font-semibold text-white mb-4">
                Ready for Real Indian Market Data?
              </h3>
              <p className="text-gray-400 mb-6">
                This demo shows the framework for Indian market integration. 
                Real implementation requires API subscriptions and regulatory compliance.
              </p>
              <div className="flex flex-wrap justify-center gap-4">
                <a
                  href="https://www.nseindia.com/market-data/live-equity-market"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-lg transition-colors"
                >
                  <Building2 className="h-5 w-5" />
                  <span>NSE Market Data</span>
                </a>
                <a
                  href="https://www.bseindia.com/markets/equity/EQReports/MarketWatch.aspx"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center space-x-2 px-6 py-3 glass hover:bg-white/10 text-white rounded-lg transition-colors"
                >
                  <TrendingUp className="h-5 w-5" />
                  <span>BSE Market Watch</span>
                </a>
              </div>
            </div>
          </motion.div>
        </main>
      </div>
    </ErrorBoundary>
  )
}

export default function IndianMarketPage() {
  return (
    <StockProvider>
      <IndianMarketPageContent />
    </StockProvider>
  )
}
