#!/bin/bash
# Compress sprite sheets for GitHub
# Requires: pngquant or sharp-cli

echo "🔍 Finding sprite sheets to compress..."

# Find all sprite sheets
find assets downloaded_assets -name "*sprite*.png" -o -name "*sheet*.png" | while read file; do
    if [ -f "$file" ]; then
        size=$(stat -f%z "$file" 2>/dev/null || stat -c%s "$file" 2>/dev/null)
        size_mb=$(echo "scale=2; $size/1024/1024" | bc)
        
        if (( $(echo "$size_mb > 0.1" | bc -l) )); then
            echo "📦 Compressing: $file (${size_mb}MB)"
            
            # Using pngquant (if available)
            if command -v pngquant &> /dev/null; then
                pngquant --quality=65-80 --force --skip-if-larger "$file" --output "$file.compressed"
                if [ -f "$file.compressed" ]; then
                    mv "$file.compressed" "$file"
                    echo "✅ Compressed: $file"
                fi
            else
                echo "⚠️  pngquant not found. Install: brew install pngquant (Mac) or apt-get install pngquant (Linux)"
                echo "   Or use Node.js script: node scripts/compress-assets.js"
            fi
        fi
    fi
done

echo "✨ Compression complete!"
