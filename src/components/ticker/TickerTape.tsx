'use client'

import { TrendingUp, TrendingDown } from 'lucide-react'
import { useMarket } from '@/contexts/MarketContext'

export default function TickerTape() {
  const { currentMarket, marketConfig } = useMarket()

  // TODO: Replace with real-time ticker data from APIs
  // For now, show message that ticker will be populated with real data
  const tickerData: any[] = [] // Empty until real API integration

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

  return (
    <div className="glass border-t border-white/10 overflow-hidden">
      <div className="relative">
        {tickerData.length > 0 ? (
          <>
            {/* Gradient overlays for smooth fade effect */}
            <div className="absolute left-0 top-0 bottom-0 w-20 bg-gradient-to-r from-slate-900 to-transparent z-10 pointer-events-none" />
            <div className="absolute right-0 top-0 bottom-0 w-20 bg-gradient-to-l from-slate-900 to-transparent z-10 pointer-events-none" />

            {/* Scrolling ticker */}
            <div className="ticker-scroll flex items-center space-x-8 py-3">
              {[...tickerData, ...tickerData].map((item, index) => {
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
          </>
        ) : (
          <div className="flex items-center justify-center py-3 text-gray-400 text-sm">
            <span>Real-time ticker data will be available once API integration is complete</span>
          </div>
        )}
      </div>
    </div>
  )
}
