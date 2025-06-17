#!/bin/bash

# StockVision Pro - Netlify Deployment Script
echo "🚀 Deploying StockVision Pro to Netlify..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

# Install dependencies
echo "📦 Installing dependencies..."
npm install

# Build the application
echo "🔨 Building the application..."
npm run build

if [ $? -ne 0 ]; then
    echo "❌ Build failed. Please fix the errors and try again."
    exit 1
fi

echo "✅ Build successful!"

# Check if Netlify CLI is installed
if ! command -v netlify &> /dev/null; then
    echo "📥 Installing Netlify CLI..."
    npm install -g netlify-cli
fi

# Deploy to Netlify
echo "🌐 Deploying to Netlify..."
echo "📁 Publishing directory: .next"

# Login to Netlify (if not already logged in)
netlify status || netlify login

# Deploy the site
netlify deploy --prod --dir=.next

echo "🎉 Deployment complete!"
echo "🔗 Your StockVision Pro app is now live!"
echo ""
echo "📋 Next steps:"
echo "1. Visit your live app URL (shown above)"
echo "2. Go to /api-config to set up real data APIs (optional)"
echo "3. Share your app with others!"
echo ""
echo "💡 The app works perfectly in demo mode without any API keys!"
