#!/bin/bash

# Emergency deployment script - removes netlify.toml to let Netlify auto-detect
echo "🚨 Emergency deployment - removing netlify.toml for auto-detection"

# Backup current netlify.toml
if [ -f "netlify.toml" ]; then
    cp netlify.toml netlify.toml.backup
    echo "✅ Backed up netlify.toml"
fi

# Remove netlify.toml to let Netlify auto-detect Next.js
rm -f netlify.toml
echo "✅ Removed netlify.toml"

# Commit and push
git add .
git commit -m "EMERGENCY: Remove netlify.toml to fix Git reference issues - let Netlify auto-detect Next.js"
git push origin main

echo "🚀 Emergency deployment complete!"
echo "📋 Netlify will now:"
echo "   - Auto-detect Next.js framework"
echo "   - Use default build settings"
echo "   - Build command: npm run build"
echo "   - Publish directory: .next"
echo ""
echo "🔄 Check Netlify dashboard for build status"
