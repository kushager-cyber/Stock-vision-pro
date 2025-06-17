'use client'

import { useState } from 'react'
import { Menu, Search, Bell, Settings, TrendingUp, User, BarChart3, Brain, Database, Activity, Globe } from 'lucide-react'
import { useStock } from '@/contexts/StockContext'
import SearchModal from '@/components/search/SearchModal'
import Link from 'next/link'

interface HeaderProps {
  onMenuClick: () => void
}

export default function Header({ onMenuClick }: HeaderProps) {
  const { state } = useStock()
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const getMarketStatusColor = () => {
    switch (state.marketStatus) {
      case 'open':
        return 'text-green-400'
      case 'pre-market':
      case 'after-hours':
        return 'text-yellow-400'
      default:
        return 'text-red-400'
    }
  }

  const getMarketStatusText = () => {
    switch (state.marketStatus) {
      case 'open':
        return 'Market Open'
      case 'pre-market':
        return 'Pre-Market'
      case 'after-hours':
        return 'After Hours'
      default:
        return 'Market Closed'
    }
  }

  return (
    <>
      <header className="glass border-b border-white/10 sticky top-0 z-50">
        <div className="px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            {/* Left side */}
            <div className="flex items-center space-x-4">
              <button
                onClick={onMenuClick}
                className="lg:hidden p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
              >
                <Menu className="h-6 w-6" />
              </button>
              
              <div className="flex items-center space-x-3">
                <div className="flex items-center space-x-2">
                  <TrendingUp className="h-8 w-8 text-blue-400" />
                  <h1 className="text-xl font-bold neon-text">StockVision Pro</h1>
                </div>
                
                <div className="hidden sm:flex items-center space-x-2 ml-6">
                  <div className={`w-2 h-2 rounded-full ${
                    state.marketStatus === 'open' ? 'bg-green-400 animate-pulse' : 
                    state.marketStatus === 'pre-market' || state.marketStatus === 'after-hours' ? 'bg-yellow-400' : 
                    'bg-red-400'
                  }`} />
                  <span className={`text-sm font-medium ${getMarketStatusColor()}`}>
                    {getMarketStatusText()}
                  </span>
                </div>
              </div>
            </div>

            {/* Center - Search */}
            <div className="flex-1 max-w-lg mx-4">
              <div className="relative">
                <button
                  onClick={() => setSearchOpen(true)}
                  className="w-full glass rounded-lg px-4 py-2 text-left text-gray-400 hover:text-white transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <div className="flex items-center space-x-3">
                    <Search className="h-5 w-5" />
                    <span className="hidden sm:block">Search stocks, ETFs, crypto...</span>
                    <span className="sm:hidden">Search...</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Right side */}
            <div className="flex items-center space-x-4">
              {/* Notifications */}
              <div className="relative">
                <button
                  onClick={() => setNotificationsOpen(!notificationsOpen)}
                  className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors relative"
                >
                  <Bell className="h-6 w-6" />
                  <span className="absolute -top-1 -right-1 h-4 w-4 bg-red-500 rounded-full text-xs text-white flex items-center justify-center">
                    3
                  </span>
                </button>
                
                {notificationsOpen && (
                  <div className="absolute right-0 mt-2 w-80 glass rounded-lg shadow-xl border border-white/10 z-50">
                    <div className="p-4">
                      <h3 className="text-lg font-semibold text-white mb-3">Notifications</h3>
                      <div className="space-y-3">
                        <div className="p-3 bg-blue-500/10 rounded-lg border border-blue-500/20">
                          <p className="text-sm text-blue-300">AAPL reached your target price of $150</p>
                          <p className="text-xs text-gray-400 mt-1">2 minutes ago</p>
                        </div>
                        <div className="p-3 bg-green-500/10 rounded-lg border border-green-500/20">
                          <p className="text-sm text-green-300">TSLA prediction accuracy improved to 87%</p>
                          <p className="text-xs text-gray-400 mt-1">15 minutes ago</p>
                        </div>
                        <div className="p-3 bg-yellow-500/10 rounded-lg border border-yellow-500/20">
                          <p className="text-sm text-yellow-300">Market volatility alert: High activity detected</p>
                          <p className="text-xs text-gray-400 mt-1">1 hour ago</p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>

              {/* Analysis Link */}
              <Link
                href="/analysis"
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Advanced Analysis"
              >
                <BarChart3 className="h-6 w-6" />
              </Link>

              {/* Predictions Link */}
              <Link
                href="/predictions"
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="AI Predictions"
              >
                <Brain className="h-6 w-6" />
              </Link>

              {/* Data Demo Link */}
              <Link
                href="/data-demo"
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Real-Time Data Demo"
              >
                <Database className="h-6 w-6" />
              </Link>

              {/* Enhanced Analysis Link */}
              <Link
                href="/enhanced-analysis"
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Enhanced Analysis"
              >
                <Activity className="h-6 w-6" />
              </Link>

              {/* Indian Market Link */}
              <Link
                href="/indian-market"
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="Indian Stock Market"
              >
                <Globe className="h-6 w-6" />
              </Link>

              {/* API Configuration Link */}
              <Link
                href="/api-config"
                className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors"
                title="API Configuration"
              >
                <Settings className="h-6 w-6" />
              </Link>

              {/* Settings */}
              <button className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                <Settings className="h-6 w-6" />
              </button>

              {/* Profile */}
              <button className="p-2 rounded-md text-gray-300 hover:text-white hover:bg-white/10 transition-colors">
                <User className="h-6 w-6" />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Search Modal */}
      <SearchModal isOpen={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
