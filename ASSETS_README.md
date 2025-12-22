# Assets Management

## Large Assets Excluded from Git

This repository excludes large binary assets (sprite sheets, images) from Git to keep the repository size manageable for GitHub.

### Excluded Assets

- **Sprite Sheets**: All `*sprite*.png`, `*sheet*.png` files
- **Downloaded Assets**: The entire `downloaded_assets/` directory (4.9MB+)
- **Large Background Images**: Background location images in `assets/backgrounds/locations/`
- **Character Sprites**: Large sprite collections in `assets/characters/sprites/`

### Included Assets

- JSON manifest files (to maintain asset structure)
- SVG files (vector graphics are small)
- Code and configuration files

## Options for Handling Assets

### Option 1: Git LFS (Recommended for GitHub)

If you want to version control these assets, use Git LFS:

```bash
# Install Git LFS
git lfs install

# Track large files
git lfs track "*.png"
git lfs track "*.jpg"
git lfs track "downloaded_assets/**"

# Add .gitattributes (auto-created)
git add .gitattributes
```

### Option 2: External Hosting

Host assets on:
- **CDN** (Cloudflare, AWS CloudFront)
- **Object Storage** (AWS S3, Google Cloud Storage)
- **Asset Hosting** (imgur, Cloudinary)

Update asset paths in code to use hosted URLs.

### Option 3: Compression Script

Create compressed versions for Git:

```bash
# Compress sprite sheets (example script)
find assets -name "*.png" -exec pngquant --quality=65-80 {} \; -exec mv {}.quantized.png {} \;
```

### Option 4: Asset Packages

Create separate asset packages:
- `assets-essential.zip` (small, required assets)
- `assets-full.zip` (all assets, hosted separately)

## Current Asset Sizes

- `downloaded_assets/characters/sprites/`: ~4.9MB
- `assets/characters/sprites/`: ~224KB
- Individual background images: ~100-600KB each

## Recommendations

1. **For Development**: Keep assets locally, excluded from Git
2. **For Production**: Host on CDN or use Git LFS
3. **For Distribution**: Package assets separately or use asset bundles

## Adding Assets Back to Git

If you decide to include specific assets:

1. Remove them from `.gitignore`
2. Compress if needed: `pngquant` or `sharp` (Node.js)
3. Consider Git LFS for files >100MB
4. Commit the changes

## Compressing Assets

Quick compression script example:

```javascript
// scripts/compress-assets.js
import sharp from 'sharp';
import fs from 'fs';
import path from 'path';

async function compressImage(inputPath, outputPath, quality = 80) {
    await sharp(inputPath)
        .png({ quality, compressionLevel: 9 })
        .toFile(outputPath);
}

// Usage: node scripts/compress-assets.js
```

