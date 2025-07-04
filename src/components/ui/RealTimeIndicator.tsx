'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { Wifi, WifiOff, Activity } from 'lucide-react'

interface RealTimeIndicatorProps {
  isConnected: boolean
  lastUpdate?: number
  dataSource?: string
}

export default function RealTimeIndicator({ 
  isConnected, 
  lastUpdate, 
  dataSource = 'API' 
}: RealTimeIndicatorProps) {
  const [timeAgo, setTimeAgo] = useState('')

  useEffect(() => {
    if (!lastUpdate) return

    const updateTimeAgo = () => {
      const now = Date.now()
      const diff = now - lastUpdate
      const seconds = Math.floor(diff / 1000)
      const minutes = Math.floor(seconds / 60)
      const hours = Math.floor(minutes / 60)

      if (seconds < 60) {
        setTimeAgo(`${seconds}s ago`)
      } else if (minutes < 60) {
        setTimeAgo(`${minutes}m ago`)
      } else {
        setTimeAgo(`${hours}h ago`)
      }
    }

    updateTimeAgo()
    const interval = setInterval(updateTimeAgo, 1000)
    return () => clearInterval(interval)
  }, [lastUpdate])

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      className="flex items-center space-x-2 px-3 py-2 glass-dropdown rounded-lg"
    >
      <div className="flex items-center space-x-2">
        {isConnected ? (
          <>
            <motion.div
              animate={{ 
                scale: [1, 1.2, 1],
                opacity: [0.7, 1, 0.7]
              }}
              transition={{ 
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut"
              }}
            >
              <Activity className="h-4 w-4 text-green-400" />
            </motion.div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-green-400">
                Live Data
              </span>
              <span className="text-xs text-gray-400">
                {dataSource} • {timeAgo || 'Just now'}
              </span>
            </div>
          </>
        ) : (
          <>
            <WifiOff className="h-4 w-4 text-red-400" />
            <div className="flex flex-col">
              <span className="text-xs font-medium text-red-400">
                Offline
              </span>
              <span className="text-xs text-gray-400">
                Using cached data
              </span>
            </div>
          </>
        )}
      </div>
    </motion.div>
  )
}
