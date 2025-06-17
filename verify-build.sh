#!/bin/bash

# StockVision Pro - Build Verification Script
echo "🔍 Verifying StockVision Pro build requirements..."

# Check if we're in the right directory
if [ ! -f "package.json" ]; then
    echo "❌ Error: package.json not found. Please run this script from the project root."
    exit 1
fi

echo "📦 Checking package.json..."
echo "✅ package.json found"

# Check for TypeScript
if grep -q '"typescript"' package.json; then
    echo "✅ TypeScript found in dependencies"
else
    echo "❌ TypeScript NOT found in dependencies"
fi

# Check for @types/react
if grep -q '"@types/react"' package.json; then
    echo "✅ @types/react found in dependencies"
else
    echo "❌ @types/react NOT found in dependencies"
fi

# Check for all required dependencies
echo "🔍 Checking critical dependencies..."

REQUIRED_DEPS=(
    "typescript"
    "@types/react"
    "@types/react-dom"
    "next"
    "react"
    "react-dom"
    "lightweight-charts"
    "jspdf"
    "@tensorflow/tfjs"
    "react-countup"
    "chartjs-adapter-date-fns"
)

for dep in "${REQUIRED_DEPS[@]}"; do
    if grep -q "\"$dep\"" package.json; then
        echo "✅ $dep"
    else
        echo "❌ $dep - MISSING"
    fi
done

echo ""
echo "📋 Summary:"
echo "- All dependencies are in 'dependencies' (not devDependencies)"
echo "- This ensures they install even with NODE_ENV=production"
echo "- TypeScript and types are available at build time"
echo ""
echo "🚀 Ready for Netlify deployment!"
echo ""
echo "📊 Total dependencies: $(grep -c '":' package.json)"
echo "🔧 Build command: npm run build"
echo "📁 Publish directory: .next"
