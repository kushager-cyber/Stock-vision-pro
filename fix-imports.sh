#!/bin/bash

# Emergency script to fix imports for Netlify deployment
echo "🔧 Converting @ imports to relative imports for Netlify compatibility..."

# Function to convert @ imports to relative imports
convert_imports() {
    local file="$1"
    local depth="$2"
    
    # Create relative path prefix based on depth
    local prefix=""
    for ((i=0; i<depth; i++)); do
        prefix="../$prefix"
    done
    
    # Convert @ imports to relative imports
    sed -i "s|from '@/|from '${prefix}src/|g" "$file"
    sed -i "s|import '@/|import '${prefix}src/|g" "$file"
    
    echo "✅ Fixed imports in $file"
}

# Fix imports in app directory (depth 2)
find src/app -name "*.tsx" -o -name "*.ts" | while read file; do
    convert_imports "$file" 2
done

# Fix imports in components directory (depth 1)
find src/components -name "*.tsx" -o -name "*.ts" | while read file; do
    convert_imports "$file" 1
done

# Fix imports in other src subdirectories (depth 1)
find src/contexts src/hooks src/services src/utils -name "*.tsx" -o -name "*.ts" 2>/dev/null | while read file; do
    convert_imports "$file" 1
done

echo "🎉 All imports converted to relative paths!"
echo "📦 Committing changes..."

git add .
git commit -m "Emergency fix: Convert @ imports to relative imports for Netlify"
git push origin main

echo "🚀 Deployed with relative imports - should work on Netlify now!"
