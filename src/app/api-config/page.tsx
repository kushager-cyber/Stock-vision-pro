'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import {
  ArrowLeft,
  Settings,
  Database,
  Key,
  Globe,
  CheckCircle,
  XCircle,
  AlertTriangle,
  ExternalLink,
  Copy,
  Eye,
  EyeOff,
  WifiOff,
  TrendingUp
} from 'lucide-react'
import { freeApiService } from '@/services/freeApiService'
import { nseApiService } from '@/services/nseApiService'
import { alphaVantageService } from '@/services/alphaVantageService'

interface ApiConfig {
  name: string
  key: string
  status: 'connected' | 'disconnected' | 'testing'
  description: string
  freeLimit: string
  website: string
  marketType: 'world' | 'indian'
  exchanges: string[]
  features: string[]
}

export default function ApiConfigPage() {
  const [useRealData, setUseRealData] = useState(false)
  const [apiConfigs, setApiConfigs] = useState<ApiConfig[]>([
    // 🌍 WORLD STOCK MARKET APIs
    {
      name: 'Alpha Vantage',
      key: '',
      status: 'disconnected',
      description: '🌍 Premium global stock market data with real-time quotes and historical data',
      freeLimit: '25 requests/day (Free tier)',
      website: 'https://www.alphavantage.co/support/#api-key',
      marketType: 'world',
      exchanges: ['NYSE', 'NASDAQ', 'LSE', 'TSX', 'ASX', 'XETRA'],
      features: ['Real-time quotes', 'Historical data', 'Technical indicators', 'Fundamental data']
    },
    {
      name: 'Yahoo Finance',
      key: 'No API key required',
      status: 'connected',
      description: '🌍 Free global stock market data with excellent worldwide coverage',
      freeLimit: 'Unlimited (rate limited)',
      website: 'https://finance.yahoo.com',
      marketType: 'world',
      exchanges: ['NYSE', 'NASDAQ', 'LSE', 'TSX', 'EURONEXT', 'HKEX', 'TSE'],
      features: ['Real-time quotes', 'Historical data', 'Market news', 'Global coverage']
    },
    // 🇮🇳 INDIAN STOCK MARKET APIs
    {
      name: 'NSE India',
      key: 'No API key required',
      status: 'connected',
      description: '🇮🇳 National Stock Exchange of India - Official real-time Indian stock market data',
      freeLimit: 'Unlimited (rate limited)',
      website: 'https://www.nseindia.com',
      marketType: 'indian',
      exchanges: ['NSE'],
      features: ['NSE real-time data', 'Indian stocks', 'NIFTY indices', 'Sector data']
    },
    {
      name: 'BSE India',
      key: 'No API key required',
      status: 'connected',
      description: '🇮🇳 Bombay Stock Exchange - Official Indian stock market data and SENSEX',
      freeLimit: 'Unlimited (rate limited)',
      website: 'https://www.bseindia.com',
      marketType: 'indian',
      exchanges: ['BSE'],
      features: ['BSE real-time data', 'Indian stocks', 'SENSEX index', 'Historical data']
    },
    {
      name: 'IEX Cloud',
      key: '',
      status: 'disconnected',
      description: '🌍 US stock market data with comprehensive coverage',
      freeLimit: '50,000 credits/month',
      website: 'https://iexcloud.io/pricing',
      marketType: 'world',
      exchanges: ['NYSE', 'NASDAQ'],
      features: ['Real-time quotes', 'Historical data', 'Company fundamentals', 'Market news']
    },
    {
      name: 'Finnhub',
      key: '',
      status: 'disconnected',
      description: '🌍 Global financial data including stocks, forex, and crypto',
      freeLimit: '60 calls/minute',
      website: 'https://finnhub.io/pricing',
      marketType: 'world',
      exchanges: ['NYSE', 'NASDAQ', 'LSE', 'EURONEXT'],
      features: ['Real-time quotes', 'Financial news', 'Earnings data', 'Technical indicators']
    }
  ])
  const [showKeys, setShowKeys] = useState<{ [key: string]: boolean }>({})
  const [testResults, setTestResults] = useState<{ [key: string]: string }>({})

  useEffect(() => {
    // Load saved configuration
    const savedConfig = localStorage.getItem('stockvision_api_config')
    if (savedConfig) {
      const config = JSON.parse(savedConfig)
      setUseRealData(config.useRealData || false)
      setApiConfigs(prev => prev.map(api => ({
        ...api,
        key: config.apiKeys?.[api.name] || api.key
      })))
    }
  }, [])

  const saveConfiguration = () => {
    const config = {
      useRealData,
      apiKeys: Object.fromEntries(
        apiConfigs.map(api => [api.name, api.key])
      )
    }
    localStorage.setItem('stockvision_api_config', JSON.stringify(config))
    
    // Update environment variables (for demo purposes)
    if (typeof window !== 'undefined') {
      (window as any).STOCKVISION_CONFIG = config
    }
  }

  const testApiConnection = async (apiName: string) => {
    setApiConfigs(prev => prev.map(api => 
      api.name === apiName ? { ...api, status: 'testing' } : api
    ))

    try {
      let testResult = ''
      
      switch (apiName) {
        case 'Yahoo Finance':
          await freeApiService.getStockData('AAPL')
          testResult = 'Successfully connected to Yahoo Finance'
          setApiConfigs(prev => prev.map(api => 
            api.name === apiName ? { ...api, status: 'connected' } : api
          ))
          break
          
        case 'Alpha Vantage':
          // Test Alpha Vantage connection with provided API key
          const alphaVantageConfig = apiConfigs.find(api => api.name === 'Alpha Vantage')
          const alphaVantageKey = alphaVantageConfig?.key || ''

          console.log('🔄 Testing Alpha Vantage API connection...')
          const alphaVantageResult = await alphaVantageService.testConnection(alphaVantageKey)

          testResult = alphaVantageResult.success
            ? `✅ Alpha Vantage API Connected Successfully!\n${alphaVantageResult.message}\nData: ${JSON.stringify(alphaVantageResult.data, null, 2)}`
            : `❌ Alpha Vantage API Connection Failed\n${alphaVantageResult.message}`

          setApiConfigs(prev => prev.map(api =>
            api.name === apiName ? { ...api, status: alphaVantageResult.success ? 'connected' : 'disconnected' } : api
          ))
          break

        case 'NSE India':
          console.log('🔄 Testing NSE India API connection...')
          const nseResult = await nseApiService.testConnection()
          testResult = nseResult.success
            ? `✅ NSE API Connected Successfully!\n${nseResult.message}\nData: ${JSON.stringify(nseResult.data, null, 2)}`
            : `❌ NSE API Connection Failed\n${nseResult.message}`
          setApiConfigs(prev => prev.map(api =>
            api.name === apiName ? { ...api, status: nseResult.success ? 'connected' : 'disconnected' } : api
          ))
          break

        case 'BSE India':
          // BSE uses similar endpoints to NSE, so we can test NSE connectivity
          console.log('🔄 Testing BSE India API connection...')
          const bseResult = await nseApiService.testConnection()
          testResult = bseResult.success
            ? `✅ BSE API Connected Successfully!\n${bseResult.message}\n(Using NSE-compatible endpoints)`
            : `❌ BSE API Connection Failed\n${bseResult.message}`
          setApiConfigs(prev => prev.map(api =>
            api.name === apiName ? { ...api, status: bseResult.success ? 'connected' : 'disconnected' } : api
          ))
          break

        default:
          testResult = 'API test not implemented yet'
          setApiConfigs(prev => prev.map(api =>
            api.name === apiName ? { ...api, status: 'disconnected' } : api
          ))
      }
      
      setTestResults(prev => ({ ...prev, [apiName]: testResult }))
      
    } catch (error) {
      setTestResults(prev => ({ 
        ...prev, 
        [apiName]: `Connection failed: ${error instanceof Error ? error.message : 'Unknown error'}` 
      }))
      setApiConfigs(prev => prev.map(api => 
        api.name === apiName ? { ...api, status: 'disconnected' } : api
      ))
    }
  }

  const updateApiKey = (apiName: string, key: string) => {
    setApiConfigs(prev => prev.map(api =>
      api.name === apiName ? { ...api, key } : api
    ))

    // Save Alpha Vantage key to localStorage for use by stockApi
    if (apiName === 'Alpha Vantage' && typeof window !== 'undefined') {
      try {
        const existingConfig = localStorage.getItem('stockvision_api_config')
        const config = existingConfig ? JSON.parse(existingConfig) : {}
        config.alphaVantageKey = key
        localStorage.setItem('stockvision_api_config', JSON.stringify(config))
        console.log('✅ Alpha Vantage API key saved to localStorage')
      } catch (error) {
        console.error('❌ Failed to save Alpha Vantage key:', error)
      }
    }
  }

  const disconnectApi = (apiName: string) => {
    setApiConfigs(prev => prev.map(api =>
      api.name === apiName ? { ...api, status: 'disconnected', key: '' } : api
    ))

    // Clear from localStorage
    if (apiName === 'Alpha Vantage' && typeof window !== 'undefined') {
      try {
        const existingConfig = localStorage.getItem('stockvision_api_config')
        const config = existingConfig ? JSON.parse(existingConfig) : {}
        delete config.alphaVantageKey
        localStorage.setItem('stockvision_api_config', JSON.stringify(config))
        console.log('✅ Alpha Vantage API disconnected and removed from localStorage')
      } catch (error) {
        console.error('❌ Failed to remove Alpha Vantage key:', error)
      }
    }

    setTestResults(prev => ({ ...prev, [apiName]: `${apiName} API disconnected successfully` }))
  }

  const toggleKeyVisibility = (apiName: string) => {
    setShowKeys(prev => ({ ...prev, [apiName]: !prev[apiName] }))
  }

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text)
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'connected': return <CheckCircle className="h-5 w-5 text-green-400" />
      case 'disconnected': return <XCircle className="h-5 w-5 text-red-400" />
      case 'testing': return <AlertTriangle className="h-5 w-5 text-yellow-400 animate-pulse" />
      default: return <XCircle className="h-5 w-5 text-gray-400" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'connected': return 'text-green-400'
      case 'disconnected': return 'text-red-400'
      case 'testing': return 'text-yellow-400'
      default: return 'text-gray-400'
    }
  }

  const renderApiConfigForm = (api: ApiConfig, index: number) => (
    <>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            API Key
          </label>
          <div className="relative">
            <input
              type={showKeys[api.name] ? 'text' : 'password'}
              value={api.key}
              onChange={(e) => updateApiKey(api.name, e.target.value)}
              placeholder={api.key === 'No API key required' ? 'No API key required' : 'Enter your API key'}
              disabled={api.key === 'No API key required'}
              className="w-full px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            />
            {api.key !== 'No API key required' && (
              <button
                type="button"
                onClick={() => toggleKeyVisibility(api.name)}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-white"
              >
                {showKeys[api.name] ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
              </button>
            )}
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Free Limit
          </label>
          <div className="px-4 py-2 bg-white/5 border border-white/10 rounded-lg text-gray-400">
            {api.freeLimit}
          </div>
        </div>
      </div>

      {/* Features */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-300 mb-2">
          Features
        </label>
        <div className="flex flex-wrap gap-2">
          {api.features.map(feature => (
            <span key={feature} className="px-3 py-1 bg-green-500/20 text-green-300 text-sm rounded-full">
              {feature}
            </span>
          ))}
        </div>
      </div>

      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <button
            onClick={() => testApiConnection(api.name)}
            disabled={api.status === 'testing'}
            className="px-4 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-500 text-white rounded-lg transition-colors"
          >
            {api.status === 'testing' ? 'Testing...' : 'Test Connection'}
          </button>

          {api.status === 'connected' && (
            <button
              onClick={() => disconnectApi(api.name)}
              className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg transition-colors flex items-center space-x-2"
            >
              <WifiOff className="h-4 w-4" />
              <span>Disconnect</span>
            </button>
          )}
        </div>

        <a
          href={api.website}
          target="_blank"
          rel="noopener noreferrer"
          className="flex items-center space-x-2 text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>Get API Key</span>
          <ExternalLink className="h-4 w-4" />
        </a>
      </div>
    </>
  )

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Header */}
      <header className="glass border-b border-white/10 sticky top-0 z-40">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => window.history.back()}
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <ArrowLeft className="h-6 w-6" />
              </button>
              
              <div className="flex items-center space-x-3">
                <Settings className="h-8 w-8 text-blue-400" />
                <div>
                  <h1 className="text-xl font-bold text-white">API Configuration</h1>
                  <p className="text-sm text-gray-400">Configure real data sources</p>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              <button
                onClick={saveConfiguration}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
              >
                Save Configuration
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="px-4 sm:px-6 lg:px-8 py-6">
        {/* Data Source Toggle */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-card mb-8"
        >
          <h2 className="text-xl font-bold text-white mb-6">Data Source Configuration</h2>
          
          <div className="flex items-center justify-between p-6 glass rounded-lg">
            <div>
              <h3 className="text-lg font-semibold text-white">Use Real Market Data</h3>
              <p className="text-gray-400 mt-1">
                Switch between mock demo data and real API data sources
              </p>
            </div>
            
            <label className="relative inline-flex items-center cursor-pointer">
              <input
                type="checkbox"
                checked={useRealData}
                onChange={(e) => setUseRealData(e.target.checked)}
                className="sr-only peer"
              />
              <div className="w-11 h-6 bg-gray-600 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-500"></div>
            </label>
          </div>

          {!useRealData && (
            <div className="mt-4 p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-lg">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-yellow-400" />
                <span className="text-yellow-400 font-medium">Demo Mode Active</span>
              </div>
              <p className="text-yellow-300 text-sm mt-1">
                Currently using simulated data for demonstration. Enable real data to use live market APIs.
              </p>
            </div>
          )}
        </motion.div>

        {/* World Stock Market APIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="glass-card"
        >
          <div className="flex items-center space-x-3 mb-6">
            <Globe className="h-6 w-6 text-blue-400" />
            <h2 className="text-xl font-bold text-white">🌍 World Stock Market APIs</h2>
          </div>
          <p className="text-gray-400 mb-6">APIs for global stock markets including NYSE, NASDAQ, LSE, TSX, and more</p>

          <div className="space-y-6">
            {apiConfigs.filter(api => api.marketType === 'world').map((api, index) => (
              <motion.div
                key={api.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 glass rounded-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Database className="h-6 w-6 text-blue-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{api.name}</h3>
                      <p className="text-sm text-gray-400">{api.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {api.exchanges.map(exchange => (
                          <span key={exchange} className="px-2 py-1 bg-blue-500/20 text-blue-300 text-xs rounded">
                            {exchange}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusIcon(api.status)}
                    <span className={`text-sm font-medium ${getStatusColor(api.status)}`}>
                      {api.status.charAt(0).toUpperCase() + api.status.slice(1)}
                    </span>
                  </div>
                </div>

                {renderApiConfigForm(api, index)}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Indian Stock Market APIs */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card"
        >
          <div className="flex items-center space-x-3 mb-6">
            <TrendingUp className="h-6 w-6 text-orange-400" />
            <h2 className="text-xl font-bold text-white">🇮🇳 Indian Stock Market APIs</h2>
          </div>
          <p className="text-gray-400 mb-6">APIs specifically for Indian stock markets including NSE, BSE, NIFTY, and SENSEX</p>

          <div className="space-y-6">
            {apiConfigs.filter(api => api.marketType === 'indian').map((api, index) => (
              <motion.div
                key={api.name}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.1 }}
                className="p-6 glass rounded-lg"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center space-x-3">
                    <Database className="h-6 w-6 text-orange-400" />
                    <div>
                      <h3 className="text-lg font-semibold text-white">{api.name}</h3>
                      <p className="text-sm text-gray-400">{api.description}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {api.exchanges.map(exchange => (
                          <span key={exchange} className="px-2 py-1 bg-orange-500/20 text-orange-300 text-xs rounded">
                            {exchange}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    {getStatusIcon(api.status)}
                    <span className={`text-sm font-medium ${getStatusColor(api.status)}`}>
                      {api.status.charAt(0).toUpperCase() + api.status.slice(1)}
                    </span>
                  </div>
                </div>

                {renderApiConfigForm(api, index)}
              </motion.div>
            ))}
          </div>
        </motion.div>

        {/* Indian Market Support */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="glass-card mt-8"
        >
          <h2 className="text-xl font-bold text-white mb-6">Indian Market Support</h2>
          
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Supported Indian Stocks</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">RELIANCE.NS</span>
                  <span className="text-white">Reliance Industries</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">TCS.NS</span>
                  <span className="text-white">Tata Consultancy Services</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">HDFCBANK.NS</span>
                  <span className="text-white">HDFC Bank</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">INFY.NS</span>
                  <span className="text-white">Infosys Limited</span>
                </div>
                <div className="text-center text-gray-500 mt-2">+ 11 more stocks</div>
              </div>
            </div>

            <div>
              <h3 className="text-lg font-semibold text-white mb-4">Market Information</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Exchanges:</span>
                  <span className="text-white">NSE, BSE</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Currency:</span>
                  <span className="text-white">Indian Rupee (₹)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Trading Hours:</span>
                  <span className="text-white">9:15 AM - 3:30 PM IST</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Settlement:</span>
                  <span className="text-white">T+1</span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-6 p-4 bg-orange-500/10 border border-orange-500/20 rounded-lg">
            <div className="flex items-center space-x-2">
              <Globe className="h-5 w-5 text-orange-400" />
              <span className="text-orange-400 font-medium">Indian Market Integration</span>
            </div>
            <p className="text-orange-300 text-sm mt-1">
              Indian stocks are supported through Yahoo Finance API using .NS suffix for NSE listings. 
              Real-time NSE/BSE data requires additional API subscriptions and regulatory compliance.
            </p>
          </div>
        </motion.div>

        {/* Environment Variables Guide */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="glass-card mt-8"
        >
          <h2 className="text-xl font-bold text-white mb-6">Environment Variables Setup</h2>
          
          <div className="p-4 bg-black/30 rounded-lg border border-white/10">
            <h3 className="text-lg font-semibold text-white mb-4">Add to your .env.local file:</h3>
            <pre className="text-sm text-gray-300 overflow-x-auto">
{`# Free API Keys
NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY=your_alpha_vantage_key
NEXT_PUBLIC_IEX_CLOUD_API_KEY=your_iex_cloud_key  
NEXT_PUBLIC_FINNHUB_API_KEY=your_finnhub_key

# Yahoo Finance requires no API key (free unlimited)
# Indian market data supported via Yahoo Finance (.NS suffix)`}
            </pre>
          </div>

          <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
            <a
              href="https://www.alphavantage.co/support/#api-key"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 p-3 glass hover:bg-white/10 rounded-lg transition-colors"
            >
              <Key className="h-5 w-5 text-blue-400" />
              <span className="text-white">Get Alpha Vantage Key</span>
            </a>
            
            <a
              href="https://iexcloud.io/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 p-3 glass hover:bg-white/10 rounded-lg transition-colors"
            >
              <Key className="h-5 w-5 text-green-400" />
              <span className="text-white">Get IEX Cloud Key</span>
            </a>
            
            <a
              href="https://finnhub.io/pricing"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-center space-x-2 p-3 glass hover:bg-white/10 rounded-lg transition-colors"
            >
              <Key className="h-5 w-5 text-purple-400" />
              <span className="text-white">Get Finnhub Key</span>
            </a>
          </div>
        </motion.div>
      </main>
    </div>
  )
}
