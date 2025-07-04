'use client'

import { useState, useEffect } from 'react'
import Header from '@/components/layout/Header'
import Sidebar from '@/components/layout/Sidebar'
import MainDashboard from '@/components/dashboard/MainDashboard'
import TickerTape from '@/components/ticker/TickerTape'
import DataModeIndicator from '@/components/ui/DataModeIndicator'
import { StockProvider } from '@/contexts/StockContext'

export default function Home() {
  const [sidebarOpen, setSidebarOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="glass-card">
          <div className="flex items-center space-x-4">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="text-white text-lg">Loading StockVision Pro...</span>
          </div>
        </div>
      </div>
    )
  }

  return (
    <StockProvider>
      <div className="min-h-screen flex flex-col">
        {/* Header */}
        <Header onMenuClick={() => setSidebarOpen(!sidebarOpen)} />

        {/* Main Content */}
        <div className="flex flex-1 relative">
          {/* Sidebar */}
          <Sidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

          {/* Dashboard */}
          <main className={`flex-1 transition-all duration-300 ${
            sidebarOpen ? 'lg:ml-64' : ''
          }`}>
            <MainDashboard />
          </main>
        </div>

        {/* Ticker Tape */}
        <TickerTape />

        {/* Data Mode Indicator */}
        <DataModeIndicator />
      </div>
    </StockProvider>
  )
}
