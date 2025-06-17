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
    TFJS_DEBUG: 'false',
  },
  // Webpack configuration for TensorFlow.js
  webpack: (config, { isServer }) => {
    if (isServer) {
      // Configure TensorFlow.js for server-side rendering
      config.externals = config.externals || []
      config.externals.push({
        '@tensorflow/tfjs': '@tensorflow/tfjs',
        '@tensorflow/tfjs-node': '@tensorflow/tfjs-node',
      })
    }
    return config
  },
}

module.exports = nextConfig
