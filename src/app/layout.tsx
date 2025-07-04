import type { Metadata, Viewport } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { MarketProvider } from '@/contexts/MarketContext'
import { GlobalStockProvider } from '@/contexts/GlobalStockContext'

const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'StockVision Pro - Advanced Stock Market Predictor',
  description: 'AI-powered stock market predictions with real-time data and advanced analytics',
  keywords: ['stock market', 'predictions', 'trading', 'AI', 'finance', 'analytics'],
  authors: [{ name: 'StockVision Pro Team' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#0f172a',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.className} antialiased`}>
        <ThemeProvider>
          <MarketProvider>
            <GlobalStockProvider>
              <div className="min-h-screen">
                {children}
              </div>
            </GlobalStockProvider>
          </MarketProvider>
        </ThemeProvider>
      </body>
    </html>
  )
}
