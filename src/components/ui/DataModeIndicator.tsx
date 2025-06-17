'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { 
  Database, 
  Wifi, 
  Settings, 
  AlertTriangle, 
  CheckCircle,
  X
} from 'lucide-react'
import Link from 'next/link'

interface DataModeIndicatorProps {
  className?: string
}

export default function DataModeIndicator({ className = '' }: DataModeIndicatorProps) {
  const [isRealData, setIsRealData] = useState(false)
  const [isVisible, setIsVisible] = useState(true)
  const [hasShownNotification, setHasShownNotification] = useState(false)

  useEffect(() => {
    // Check data mode on mount and periodically
    const checkDataMode = () => {
      if (typeof window !== 'undefined') {
        const config = localStorage.getItem('stockvision_api_config')
        if (config) {
          try {
            const parsed = JSON.parse(config)
            const realDataMode = parsed.useRealData === true
            setIsRealData(realDataMode)
            
            // Show notification if mode changed and user hasn't seen it
            if (!hasShownNotification) {
              setIsVisible(true)
              setHasShownNotification(true)
              
              // Auto-hide after 10 seconds
              setTimeout(() => {
                setIsVisible(false)
              }, 10000)
            }
          } catch (e) {
            setIsRealData(false)
          }
        } else {
          setIsRealData(false)
        }
      }
    }

    checkDataMode()
    
    // Check every 5 seconds for changes
    const interval = setInterval(checkDataMode, 5000)
    
    return () => clearInterval(interval)
  }, [hasShownNotification])

  const handleDismiss = () => {
    setIsVisible(false)
  }

  if (!isVisible) {
    return (
      // Minimized indicator
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        className={`fixed bottom-4 right-4 z-50 ${className}`}
      >
        <button
          onClick={() => setIsVisible(true)}
          className={`p-3 rounded-full shadow-lg transition-all hover:scale-110 ${
            isRealData 
              ? 'bg-green-500 hover:bg-green-600 text-white' 
              : 'bg-yellow-500 hover:bg-yellow-600 text-white'
          }`}
          title={isRealData ? 'Real Data Mode' : 'Demo Data Mode'}
        >
          {isRealData ? <Wifi className="h-5 w-5" /> : <Database className="h-5 w-5" />}
        </button>
      </motion.div>
    )
  }

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0, y: 100, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        exit={{ opacity: 0, y: 100, scale: 0.9 }}
        className={`fixed bottom-4 right-4 z-50 max-w-sm ${className}`}
      >
        <div className={`glass-card border-l-4 ${
          isRealData ? 'border-green-400' : 'border-yellow-400'
        }`}>
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <div className={`p-2 rounded-lg ${
                isRealData ? 'bg-green-500/20' : 'bg-yellow-500/20'
              }`}>
                {isRealData ? (
                  <CheckCircle className="h-5 w-5 text-green-400" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-400" />
                )}
              </div>
              
              <div className="flex-1">
                <h4 className={`font-semibold ${
                  isRealData ? 'text-green-400' : 'text-yellow-400'
                }`}>
                  {isRealData ? 'Real Data Mode' : 'Demo Data Mode'}
                </h4>
                
                <p className="text-sm text-gray-300 mt-1">
                  {isRealData ? (
                    'Using live market data from free APIs'
                  ) : (
                    'Using simulated data for demonstration'
                  )}
                </p>

                {!isRealData && (
                  <div className="mt-3">
                    <Link
                      href="/api-config"
                      className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-500 hover:bg-blue-600 text-white text-sm rounded-lg transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Enable Real Data</span>
                    </Link>
                  </div>
                )}

                {isRealData && (
                  <div className="mt-2 flex items-center space-x-2">
                    <div className="flex items-center space-x-1">
                      <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                      <span className="text-xs text-green-400">Live APIs Active</span>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <button
              onClick={handleDismiss}
              className="p-1 text-gray-400 hover:text-white transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* API Status Indicators */}
          {isRealData && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-green-400 rounded-full"></div>
                  <span className="text-gray-300">Yahoo Finance</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-400">Alpha Vantage</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-400">IEX Cloud</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                  <span className="text-gray-400">Finnhub</span>
                </div>
              </div>
            </div>
          )}

          {/* Demo Mode Features */}
          {!isRealData && (
            <div className="mt-4 pt-3 border-t border-white/10">
              <div className="text-xs text-gray-400">
                <p className="mb-2">Demo features available:</p>
                <ul className="space-y-1">
                  <li>• Simulated real-time updates</li>
                  <li>• All analysis tools functional</li>
                  <li>• Indian market demo data</li>
                  <li>• No API keys required</li>
                </ul>
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </AnimatePresence>
  )
}
