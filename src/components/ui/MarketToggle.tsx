'use client'

import { useState } from 'react'
import { motion } from 'framer-motion'
import { Globe, MapPin } from 'lucide-react'

export type MarketType = 'world' | 'indian'

interface MarketToggleProps {
  currentMarket: MarketType
  onMarketChange: (market: MarketType) => void
}

export default function MarketToggle({ currentMarket, onMarketChange }: MarketToggleProps) {
  const [isHovered, setIsHovered] = useState(false)

  const markets = [
    {
      id: 'world' as MarketType,
      name: 'World Markets',
      icon: Globe,
      description: 'NYSE, NASDAQ, LSE, etc.',
      flag: '🌍'
    },
    {
      id: 'indian' as MarketType,
      name: 'Indian Markets',
      icon: MapPin,
      description: 'NSE, BSE',
      flag: '🇮🇳'
    }
  ]

  return (
    <div 
      className="relative"
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      <div className="flex items-center bg-white/5 rounded-lg p-1 border border-white/10">
        {markets.map((market) => {
          const Icon = market.icon
          const isActive = currentMarket === market.id
          
          return (
            <motion.button
              key={market.id}
              onClick={() => onMarketChange(market.id)}
              className={`flex items-center space-x-2 px-3 py-2 rounded-md transition-all duration-200 ${
                isActive
                  ? 'bg-blue-500 text-white shadow-lg'
                  : 'text-gray-300 hover:text-white hover:bg-white/10'
              }`}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <span className="text-lg">{market.flag}</span>
              <Icon className="h-4 w-4" />
              <span className="text-sm font-medium hidden sm:block">
                {market.name.split(' ')[0]}
              </span>
            </motion.button>
          )
        })}
      </div>

      {/* Tooltip */}
      {isHovered && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          className="absolute top-full left-1/2 transform -translate-x-1/2 mt-2 z-50"
        >
          <div className="glass rounded-lg p-3 border border-white/10 shadow-xl min-w-max">
            <div className="space-y-2">
              {markets.map((market) => {
                const Icon = market.icon
                const isActive = currentMarket === market.id
                
                return (
                  <div 
                    key={market.id}
                    className={`flex items-center space-x-3 p-2 rounded ${
                      isActive ? 'bg-blue-500/20 border border-blue-500/30' : ''
                    }`}
                  >
                    <span className="text-lg">{market.flag}</span>
                    <Icon className="h-4 w-4 text-gray-300" />
                    <div>
                      <div className={`text-sm font-medium ${
                        isActive ? 'text-blue-300' : 'text-white'
                      }`}>
                        {market.name}
                      </div>
                      <div className="text-xs text-gray-400">
                        {market.description}
                      </div>
                    </div>
                    {isActive && (
                      <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse" />
                    )}
                  </div>
                )
              })}
            </div>
            
            <div className="mt-3 pt-2 border-t border-white/10">
              <p className="text-xs text-gray-400 text-center">
                Switch between global and Indian stock markets
              </p>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  )
}
