/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    unoptimized: true,
  },
  // Environment variables with defaults
  env: {
    NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY: process.env.NEXT_PUBLIC_ALPHA_VANTAGE_API_KEY || '',
    NEXT_PUBLIC_IEX_CLOUD_API_KEY: process.env.NEXT_PUBLIC_IEX_CLOUD_API_KEY || '',
    NEXT_PUBLIC_FINNHUB_API_KEY: process.env.NEXT_PUBLIC_FINNHUB_API_KEY || '',
  },
}

module.exports = nextConfig
