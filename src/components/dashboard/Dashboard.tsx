'use client'

import { motion } from 'framer-motion'
import MarketOverview from './MarketOverview'
import StockChart from './StockChart'
import PredictionPanel from './PredictionPanel'
import NewsPanel from './NewsPanel'
import StockDetails from './StockDetails'

export default function Dashboard() {
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
