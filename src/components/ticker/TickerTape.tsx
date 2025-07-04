'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { useMarket } from '@/contexts/MarketContext'

export default function TickerTape() {
  const { currentMarket, marketConfig } = useMarket()

  const worldTickerData = [
    { symbol: 'AAPL', price: 150.25, change: 2.45, changePercent: 1.66 },
    { symbol: 'GOOGL', price: 2800.50, change: -15.30, changePercent: -0.54 },
    { symbol: 'MSFT', price: 330.75, change: 5.20, changePercent: 1.60 },
    { symbol: 'TSLA', price: 800.00, change: -12.50, changePercent: -1.54 },
    { symbol: 'AMZN', price: 3245.89, change: 25.67, changePercent: 0.80 },
    { symbol: 'NVDA', price: 450.23, change: 18.45, changePercent: 4.27 },
    { symbol: 'META', price: 325.67, change: -8.90, changePercent: -2.66 },
    { symbol: 'NFLX', price: 425.30, change: 12.80, changePercent: 3.10 },
    { symbol: 'AMD', price: 95.67, change: -3.21, changePercent: -3.25 },
    { symbol: 'CRM', price: 210.45, change: 7.65, changePercent: 3.77 },
    { symbol: 'ORCL', price: 105.23, change: 2.34, changePercent: 2.28 },
    { symbol: 'INTC', price: 45.67, change: -1.23, changePercent: -2.62 },
  ]

  const indianTickerData = [
    { symbol: 'RELIANCE', price: 2456.75, change: 45.30, changePercent: 1.88 },
    { symbol: 'TCS', price: 3567.20, change: -23.45, changePercent: -0.65 },
    { symbol: 'HDFCBANK', price: 1634.50, change: 28.75, changePercent: 1.79 },
    { symbol: 'INFY', price: 1456.80, change: 15.60, changePercent: 1.08 },
    { symbol: 'HINDUNILVR', price: 2789.45, change: -12.30, changePercent: -0.44 },
    { symbol: 'ICICIBANK', price: 945.60, change: 18.90, changePercent: 2.04 },
    { symbol: 'KOTAKBANK', price: 1876.25, change: -8.75, changePercent: -0.46 },
    { symbol: 'BHARTIARTL', price: 867.30, change: 12.45, changePercent: 1.46 },
    { symbol: 'ITC', price: 456.80, change: 5.60, changePercent: 1.24 },
    { symbol: 'SBIN', price: 567.45, change: -3.25, changePercent: -0.57 },
    { symbol: 'ASIANPAINT', price: 3234.60, change: 67.80, changePercent: 2.14 },
    { symbol: 'MARUTI', price: 9876.50, change: -45.30, changePercent: -0.46 },
  ]

  const tickerData = currentMarket === 'indian' ? indianTickerData : worldTickerData

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat(currentMarket === 'indian' ? 'en-IN' : 'en-US', {
      style: 'currency',
      currency: marketConfig.currency,
      minimumFractionDigits: 2,
    }).format(value)
  }

  const formatPercent = (value: number) => {
    return `${value >= 0 ? '+' : ''}${value.toFixed(2)}%`
  }

  // Duplicate the data to create seamless scrolling
  const duplicatedData = [...tickerData, ...tickerData]

  return (
    <div className="glass border-t border-white/10 overflow-hidden">
      <div className="relative">
        {/* Gradient overlays for smooth fade effect */}
        <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
        <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />
        
        {/* Scrolling ticker */}
        <div className="ticker-scroll flex items-center space-x-8 py-3">
          {duplicatedData.map((item, index) => {
            const isPositive = item.change >= 0
            return (
              <div
                key={`${item.symbol}-${index}`}
                className="flex items-center space-x-3 whitespace-nowrap min-w-max"
              >
                <div className="flex items-center space-x-2">
                  <span className="font-bold text-white text-sm">{item.symbol}</span>
                  <span className="text-gray-300 text-sm">{formatCurrency(item.price)}</span>
                </div>
                
                <div className={`flex items-center space-x-1 text-sm ${
                  isPositive ? 'text-green-400' : 'text-red-400'
                }`}>
                  {isPositive ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  <span>{formatCurrency(Math.abs(item.change))}</span>
                  <span>({formatPercent(item.changePercent)})</span>
                </div>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}
