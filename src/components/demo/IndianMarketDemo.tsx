'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Globe, 
  Clock,
  RefreshCw,
  Star,
  Building2,
  Banknote
} from 'lucide-react'
import { formatCurrency, formatPercent } from '@/utils/formatters'
import CountUp from 'react-countup'

interface IndianStock {
  symbol: string
  name: string
  price: number
  change: number
  changePercent: number
  volume: number
  marketCap: number
  sector: string
  exchange: 'NSE' | 'BSE'
}

interface MarketIndex {
  name: string
  value: number
  change: number
  changePercent: number
}

export default function IndianMarketDemo({ className = '' }: { className?: string }) {
  const [indianStocks, setIndianStocks] = useState<IndianStock[]>([])
  const [marketIndices, setMarketIndices] = useState<MarketIndex[]>([])
  const [loading, setLoading] = useState(true)
  const [selectedSector, setSelectedSector] = useState<string>('all')
  const [marketStatus, setMarketStatus] = useState<'open' | 'closed' | 'pre-market'>('open')

  useEffect(() => {
    generateIndianMarketData()
    const interval = setInterval(updatePrices, 5000) // Update every 5 seconds
    return () => clearInterval(interval)
  }, [])

  const generateIndianMarketData = () => {
    setLoading(true)
    
    // Popular Indian stocks with realistic data
    const stocks: IndianStock[] = [
      {
        symbol: 'RELIANCE',
        name: 'Reliance Industries Limited',
        price: 2456.75,
        change: 23.45,
        changePercent: 0.96,
        volume: 2847563,
        marketCap: 16600000000000, // 16.6 Lakh Crores
        sector: 'Oil & Gas',
        exchange: 'NSE'
      },
      {
        symbol: 'TCS',
        name: 'Tata Consultancy Services',
        price: 3542.80,
        change: -15.20,
        changePercent: -0.43,
        volume: 1234567,
        marketCap: 12900000000000, // 12.9 Lakh Crores
        sector: 'IT Services',
        exchange: 'NSE'
      },
      {
        symbol: 'HDFCBANK',
        name: 'HDFC Bank Limited',
        price: 1687.90,
        change: 8.75,
        changePercent: 0.52,
        volume: 3456789,
        marketCap: 9200000000000, // 9.2 Lakh Crores
        sector: 'Banking',
        exchange: 'NSE'
      },
      {
        symbol: 'INFY',
        name: 'Infosys Limited',
        price: 1456.30,
        change: 12.60,
        changePercent: 0.87,
        volume: 2345678,
        marketCap: 6100000000000, // 6.1 Lakh Crores
        sector: 'IT Services',
        exchange: 'NSE'
      },
      {
        symbol: 'ICICIBANK',
        name: 'ICICI Bank Limited',
        price: 987.45,
        change: -5.30,
        changePercent: -0.53,
        volume: 4567890,
        marketCap: 6900000000000, // 6.9 Lakh Crores
        sector: 'Banking',
        exchange: 'NSE'
      },
      {
        symbol: 'HINDUNILVR',
        name: 'Hindustan Unilever Limited',
        price: 2678.20,
        change: 18.90,
        changePercent: 0.71,
        volume: 876543,
        marketCap: 6300000000000, // 6.3 Lakh Crores
        sector: 'FMCG',
        exchange: 'NSE'
      },
      {
        symbol: 'ITC',
        name: 'ITC Limited',
        price: 456.75,
        change: 3.25,
        changePercent: 0.72,
        volume: 5678901,
        marketCap: 5700000000000, // 5.7 Lakh Crores
        sector: 'FMCG',
        exchange: 'NSE'
      },
      {
        symbol: 'SBIN',
        name: 'State Bank of India',
        price: 623.80,
        change: -8.45,
        changePercent: -1.34,
        volume: 6789012,
        marketCap: 5600000000000, // 5.6 Lakh Crores
        sector: 'Banking',
        exchange: 'NSE'
      },
      {
        symbol: 'BHARTIARTL',
        name: 'Bharti Airtel Limited',
        price: 1234.50,
        change: 15.75,
        changePercent: 1.29,
        volume: 3456789,
        marketCap: 6800000000000, // 6.8 Lakh Crores
        sector: 'Telecom',
        exchange: 'NSE'
      },
      {
        symbol: 'KOTAKBANK',
        name: 'Kotak Mahindra Bank',
        price: 1876.40,
        change: 22.10,
        changePercent: 1.19,
        volume: 1987654,
        marketCap: 3700000000000, // 3.7 Lakh Crores
        sector: 'Banking',
        exchange: 'NSE'
      }
    ]

    // Add some random variation to simulate real-time updates
    const updatedStocks = stocks.map(stock => ({
      ...stock,
      price: stock.price + (Math.random() - 0.5) * 20,
      change: (Math.random() - 0.5) * 40,
      changePercent: (Math.random() - 0.5) * 3,
      volume: stock.volume + Math.floor((Math.random() - 0.5) * 100000)
    }))

    setIndianStocks(updatedStocks)

    // Market indices
    const indices: MarketIndex[] = [
      {
        name: 'NIFTY 50',
        value: 19674.25,
        change: 123.45,
        changePercent: 0.63
      },
      {
        name: 'SENSEX',
        value: 65953.48,
        change: 287.90,
        changePercent: 0.44
      },
      {
        name: 'NIFTY BANK',
        value: 45234.75,
        change: -156.30,
        changePercent: -0.34
      },
      {
        name: 'NIFTY IT',
        value: 31245.60,
        change: 234.80,
        changePercent: 0.76
      }
    ]

    setMarketIndices(indices)
    setLoading(false)
  }

  const updatePrices = () => {
    setIndianStocks(prevStocks => 
      prevStocks.map(stock => ({
        ...stock,
        price: stock.price + (Math.random() - 0.5) * 5,
        change: stock.change + (Math.random() - 0.5) * 2,
        changePercent: stock.changePercent + (Math.random() - 0.5) * 0.2,
        volume: stock.volume + Math.floor((Math.random() - 0.5) * 10000)
      }))
    )
  }

  const sectors = ['all', 'Banking', 'IT Services', 'FMCG', 'Oil & Gas', 'Telecom']
  
  const filteredStocks = selectedSector === 'all' 
    ? indianStocks 
    : indianStocks.filter(stock => stock.sector === selectedSector)

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-400' : 'text-red-400'
  }

  const getChangeIcon = (change: number) => {
    return change >= 0 ? TrendingUp : TrendingDown
  }

  const formatMarketCap = (marketCap: number) => {
    const crores = marketCap / 10000000 // Convert to crores
    if (crores >= 100000) {
      return `₹${(crores / 100000).toFixed(1)}L Cr` // Lakh Crores
    }
    return `₹${crores.toFixed(0)} Cr`
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
            <Globe className="h-6 w-6 text-orange-400" />
            <div>
              <h2 className="text-xl font-bold text-white">Indian Stock Market</h2>
              <p className="text-sm text-gray-400">NSE & BSE Live Market Data</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Market Status */}
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
              <span className="text-sm text-green-400">Market Open</span>
            </div>

            {/* IST Time */}
            <div className="flex items-center space-x-2">
              <Clock className="h-4 w-4 text-gray-400" />
              <span className="text-sm text-gray-400">IST: {new Date().toLocaleTimeString('en-IN')}</span>
            </div>

            {/* Refresh Button */}
            <button
              onClick={generateIndianMarketData}
              disabled={loading}
              className="p-2 glass rounded-lg text-gray-300 hover:text-white hover:bg-white/10 transition-colors disabled:opacity-50"
            >
              <RefreshCw className={`h-4 w-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>
        </div>

        {/* Market Indices */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {marketIndices.map((index, i) => {
            const ChangeIcon = getChangeIcon(index.change)
            return (
              <motion.div
                key={index.name}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                className="text-center p-4 glass rounded-lg"
              >
                <div className="text-lg font-bold text-white">
                  <CountUp 
                    end={index.value} 
                    duration={1.5} 
                    decimals={2}
                    separator=","
                    preserveValue
                  />
                </div>
                <div className="text-sm text-gray-400 mb-2">{index.name}</div>
                <div className={`flex items-center justify-center space-x-1 ${getChangeColor(index.change)}`}>
                  <ChangeIcon className="h-4 w-4" />
                  <span className="text-sm font-medium">
                    {index.change >= 0 ? '+' : ''}{index.change.toFixed(2)} ({formatPercent(index.changePercent)})
                  </span>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Sector Filter */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.1 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Filter by Sector</h3>
        <div className="flex flex-wrap gap-2">
          {sectors.map(sector => (
            <button
              key={sector}
              onClick={() => setSelectedSector(sector)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                selectedSector === sector
                  ? 'bg-orange-500 text-white'
                  : 'glass text-gray-300 hover:text-white hover:bg-white/10'
              }`}
            >
              {sector === 'all' ? 'All Sectors' : sector}
            </button>
          ))}
        </div>
      </motion.div>

      {/* Stock List */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="glass-card"
      >
        <div className="flex items-center justify-between mb-6">
          <h3 className="text-lg font-semibold text-white">Top Indian Stocks</h3>
          <div className="flex items-center space-x-2">
            <Star className="h-4 w-4 text-yellow-400" />
            <span className="text-sm text-gray-400">Live Prices</span>
          </div>
        </div>

        <div className="space-y-3">
          {filteredStocks.map((stock, index) => {
            const ChangeIcon = getChangeIcon(stock.change)
            return (
              <motion.div
                key={stock.symbol}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex items-center justify-between p-4 glass rounded-lg hover-lift"
              >
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-red-500 rounded-lg flex items-center justify-center">
                    <Building2 className="h-6 w-6 text-white" />
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-2">
                      <h4 className="font-bold text-white">{stock.symbol}</h4>
                      <span className="px-2 py-1 bg-orange-500/20 text-orange-400 text-xs rounded">
                        {stock.exchange}
                      </span>
                    </div>
                    <p className="text-sm text-gray-400">{stock.name}</p>
                    <p className="text-xs text-gray-500">{stock.sector}</p>
                  </div>
                </div>
                
                <div className="text-right">
                  <div className="text-xl font-bold text-white">
                    ₹<CountUp 
                      end={stock.price} 
                      duration={1} 
                      decimals={2}
                      preserveValue
                    />
                  </div>
                  <div className={`flex items-center justify-end space-x-1 ${getChangeColor(stock.change)}`}>
                    <ChangeIcon className="h-4 w-4" />
                    <span className="text-sm font-medium">
                      {stock.change >= 0 ? '+' : ''}₹{stock.change.toFixed(2)}
                    </span>
                    <span className="text-sm">
                      ({formatPercent(stock.changePercent)})
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-1">
                    Vol: {(stock.volume / 100000).toFixed(1)}L
                  </div>
                  <div className="text-xs text-gray-400">
                    MCap: {formatMarketCap(stock.marketCap)}
                  </div>
                </div>
              </motion.div>
            )
          })}
        </div>
      </motion.div>

      {/* Market Info */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3 }}
        className="glass-card"
      >
        <h3 className="text-lg font-semibold text-white mb-4">Indian Market Information</h3>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <h4 className="font-semibold text-white mb-3">Market Hours (IST)</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Pre-Market:</span>
                <span className="text-white">9:00 AM - 9:15 AM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Regular Trading:</span>
                <span className="text-white">9:15 AM - 3:30 PM</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Post-Market:</span>
                <span className="text-white">3:40 PM - 4:00 PM</span>
              </div>
            </div>
          </div>
          
          <div>
            <h4 className="font-semibold text-white mb-3">Currency & Features</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-400">Currency:</span>
                <span className="text-white">Indian Rupee (₹)</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Settlement:</span>
                <span className="text-white">T+1</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-400">Circuit Limits:</span>
                <span className="text-white">±10% / ±20%</span>
              </div>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Disclaimer */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.4 }}
        className="glass-card"
      >
        <div className="flex items-center space-x-3">
          <Banknote className="h-5 w-5 text-yellow-400" />
          <div>
            <h4 className="font-semibold text-white">Demo Data Notice</h4>
            <p className="text-sm text-gray-400 mt-1">
              This is simulated Indian market data for demonstration purposes. 
              Real NSE/BSE integration requires API subscriptions and regulatory compliance.
              Prices update every 5 seconds to simulate live market conditions.
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  )
}
