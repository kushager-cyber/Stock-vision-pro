'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'

export default function TickerTape() {
  const tickerData = [
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

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
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
