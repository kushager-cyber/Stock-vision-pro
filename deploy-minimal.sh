#!/bin/bash

# Minimal deployment script for StockVision Pro
echo "🚀 Creating minimal deployment version..."

# Backup current package.json
cp package.json package-full.json

# Create minimal package.json
cat > package.json << 'EOF'
{
  "name": "stockvision-pro",
  "version": "1.0.0",
  "private": true,
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "next start"
  },
  "dependencies": {
    "next": "14.0.0",
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "tailwindcss": "^3.3.5",
    "autoprefixer": "^10.4.16",
    "postcss": "^8.4.31",
    "lucide-react": "^0.400.0",
    "recharts": "^2.8.0",
    "framer-motion": "^10.16.0",
    "lodash": "^4.17.21"
  },
  "devDependencies": {
    "@types/node": "^20.8.0",
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "typescript": "^5.2.2"
  }
}
EOF

echo "✅ Created minimal package.json"

# Commit and push
git add package.json
git commit -m "Deploy minimal version for Netlify compatibility"
git push origin main

echo "🎉 Minimal version deployed!"
echo "🔄 Netlify should now build successfully"

# Restore full package.json for local development
mv package-full.json package.json
echo "📦 Restored full package.json for local development"
