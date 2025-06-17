#!/bin/bash

# StockVision Pro Deployment Script

echo "🚀 Starting StockVision Pro deployment..."

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js 18+ first."
    exit 1
fi

# Check Node.js version
NODE_VERSION=$(node -v | cut -d'v' -f2 | cut -d'.' -f1)
if [ "$NODE_VERSION" -lt 18 ]; then
    echo "❌ Node.js version 18+ is required. Current version: $(node -v)"
    exit 1
fi

echo "✅ Node.js version: $(node -v)"

# Install dependencies
echo "📦 Installing dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "❌ Failed to install dependencies"
    exit 1
fi

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo "⚠️  .env.local not found. Creating from template..."
    cp .env.example .env.local
    echo "📝 Please edit .env.local with your API keys before running the application."
fi

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed"
    exit 1
fi

echo "✅ Build completed successfully!"

# Check if we should start the production server
read -p "🚀 Start the production server? (y/n): " -n 1 -r
echo
if [[ $REPLY =~ ^[Yy]$ ]]; then
    echo "🌟 Starting StockVision Pro..."
    npm start
else
    echo "📋 To start the application manually, run: npm start"
    echo "🌐 The application will be available at: http://localhost:3000"
fi

echo "🎉 Deployment completed!"
echo ""
echo "📚 Documentation: README.md"
echo "🐛 Issues: https://github.com/yourusername/stockvision-pro/issues"
echo "💡 Features:"
echo "   - Real-time stock data and charts"
echo "   - AI-powered price predictions"
echo "   - Portfolio and watchlist management"
echo "   - Market news with sentiment analysis"
echo "   - Technical analysis indicators"
echo "   - Responsive design for all devices"
