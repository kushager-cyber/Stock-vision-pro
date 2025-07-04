'use client'

import { useEffect, useState } from 'react'
import { motion } from 'framer-motion'
import { useMarket } from '@/contexts/MarketContext'
import { useStock } from '@/contexts/StockContext'
import { stockApi } from '@/services/stockApi'
import MarketOverview from './MarketOverview'
import StockChart from './StockChart'
import PredictionPanel from './PredictionPanel'
import NewsPanel from './NewsPanel'
import StockDetails from './StockDetails'

export default function MarketAwareDashboard() {
  const { currentMarket } = useMarket()
  const { state, dispatch } = useStock()
  const [isLoadingRealData, setIsLoadingRealData] = useState(false)

  // Default stocks for each market
  const defaultStocks = {
    world: 'AAPL',
    indian: 'RELIANCE'
  }

  // Update selected stock when market changes
  useEffect(() => {
    const defaultStock = defaultStocks[currentMarket]
    if (state.selectedStock !== defaultStock) {
      dispatch({ type: 'SET_SELECTED_STOCK', payload: defaultStock })
    }
  }, [currentMarket, dispatch, state.selectedStock])

  // Update watchlist based on market with real-time data
  useEffect(() => {
    const updateWatchlistWithRealData = async () => {
      setIsLoadingRealData(true)

      const worldSymbols = ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'AMZN']
      const indianSymbols = ['RELIANCE', 'TCS', 'HDFCBANK', 'INFY', 'ICICIBANK']

      const targetSymbols = currentMarket === 'indian' ? indianSymbols : worldSymbols

      // Only update if the watchlist symbols are different
      const currentSymbols = state.watchlist.map(item => item.symbol).sort()

      if (JSON.stringify(currentSymbols) !== JSON.stringify(targetSymbols.sort())) {
        try {
          // Clear existing watchlist
          state.watchlist.forEach(item => {
            dispatch({ type: 'REMOVE_FROM_WATCHLIST', payload: item.symbol })
          })

          // Fetch real-time data for each symbol
          const realTimeWatchlist = await Promise.all(
            targetSymbols.map(async (symbol) => {
              try {
                console.log(`🔄 Fetching real-time data for ${symbol}...`)
                const stockData = await stockApi.getStockData(symbol, currentMarket)
                return {
                  symbol: stockData.symbol,
                  name: stockData.name,
                  price: stockData.price,
                  change: stockData.change,
                  changePercent: stockData.changePercent
                }
              } catch (error) {
                console.warn(`❌ Failed to fetch real-time data for ${symbol}, using fallback`)
                // Fallback data
                const fallbackPrices = {
                  'AAPL': { name: 'Apple Inc.', price: 150.00, change: 2.50, changePercent: 1.69 },
                  'GOOGL': { name: 'Alphabet Inc.', price: 2800.00, change: -15.30, changePercent: -0.54 },
                  'MSFT': { name: 'Microsoft Corp.', price: 330.00, change: 5.20, changePercent: 1.60 },
                  'TSLA': { name: 'Tesla Inc.', price: 800.00, change: -12.50, changePercent: -1.54 },
                  'AMZN': { name: 'Amazon.com Inc.', price: 3245.89, change: 25.67, changePercent: 0.80 },
                  'RELIANCE': { name: 'Reliance Industries Ltd.', price: 2456.75, change: 45.30, changePercent: 1.88 },
                  'TCS': { name: 'Tata Consultancy Services', price: 3567.20, change: -23.45, changePercent: -0.65 },
                  'HDFCBANK': { name: 'HDFC Bank Limited', price: 1634.50, change: 28.75, changePercent: 1.79 },
                  'INFY': { name: 'Infosys Limited', price: 1456.80, change: 15.60, changePercent: 1.08 },
                  'ICICIBANK': { name: 'ICICI Bank Limited', price: 945.60, change: 18.90, changePercent: 2.04 }
                }
                const fallback = fallbackPrices[symbol as keyof typeof fallbackPrices]
                return {
                  symbol,
                  name: fallback?.name || symbol,
                  price: fallback?.price || 100,
                  change: fallback?.change || 0,
                  changePercent: fallback?.changePercent || 0
                }
              }
            })
          )

          // Add real-time watchlist items
          realTimeWatchlist.forEach(item => {
            dispatch({ type: 'ADD_TO_WATCHLIST', payload: item })
          })

          console.log(`✅ Updated watchlist with real-time data for ${currentMarket} market`)
        } catch (error) {
          console.error('❌ Failed to update watchlist with real-time data:', error)
        }
      }

      setIsLoadingRealData(false)
    }

    updateWatchlistWithRealData()
  }, [currentMarket, dispatch])

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1,
      },
    },
  }

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: 'spring' as const,
        damping: 25,
        stiffness: 200,
      },
    },
  }

  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="p-4 lg:p-6 space-y-6"
    >
      {/* Market Overview */}
      <motion.div variants={itemVariants}>
        <MarketOverview />
      </motion.div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
        {/* Left Column - Chart and Details */}
        <div className="xl:col-span-2 space-y-6">
          <motion.div variants={itemVariants}>
            <StockChart />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <StockDetails />
          </motion.div>
        </div>

        {/* Right Column - Predictions and News */}
        <div className="space-y-6">
          <motion.div variants={itemVariants}>
            <PredictionPanel />
          </motion.div>
          
          <motion.div variants={itemVariants}>
            <NewsPanel />
          </motion.div>
        </div>
      </div>
    </motion.div>
  )
}
