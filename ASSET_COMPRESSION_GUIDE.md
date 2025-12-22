# Asset Compression Guide

## Quick Start

### Check File Sizes
```bash
npm run check-sizes
```

### Compress Assets
```bash
npm run compress-assets
```

## What Gets Compressed

The compression script processes:
- **PNG files** in `assets/` and `public/assets/`
- Files larger than 100KB
- Compresses in-place (overwrites originals)

**Note**: `downloaded_assets/` is excluded from git (see `.gitignore`) so it's not compressed.

## Compression Settings

- **PNG Quality**: 75% (good balance of size vs quality)
- **JPEG Quality**: 80%
- **Max File Size**: 50MB (GitHub limit)

## Before Compression

⚠️ **Important**: The compression script overwrites original files!

**Backup your assets first:**
```bash
# Create backup
cp -r assets assets-backup
cp -r public/assets public/assets-backup

# Or commit to git first
git add assets/ public/assets/
git commit -m "Backup before compression"
```

## After Compression

A `compression-report.json` file is created with:
- Files compressed
- Size savings
- Files that still exceed limits

## Restoring Original Files

If you need to restore original quality:

### Option 1: From Git (if committed before compression)
```bash
git checkout HEAD -- assets/ public/assets/
```

### Option 2: From Backup
```bash
cp -r assets-backup/* assets/
cp -r public/assets-backup/* public/assets/
```

### Option 3: Use Decompress Script (informational)
```bash
node scripts/decompress-assets.js
```

## File Size Limits

- **GitHub limit**: 50MB per file
- **Recommended**: Keep under 10MB per file for better performance
- **Current status**: Check with `npm run check-sizes`

## Compression Report

After compression, check `compression-report.json`:
```json
{
  "timestamp": "2024-...",
  "stats": {
    "total": 150,
    "compressed": 45,
    "skipped": 100,
    "errors": 5,
    "totalOriginalSize": 15000000,
    "totalCompressedSize": 8000000
  }
}
```

## Troubleshooting

### "File exceeds 50MB after compression"
- The file is too large even after compression
- Options:
  1. Split the image into smaller files
  2. Use lower quality settings (edit script)
  3. Exclude from git (add to .gitignore)
  4. Use Git LFS for that file

### "Sharp module not found"
```bash
npm install --save-dev sharp
```

### Compression didn't reduce size
- Some images are already optimized
- Very simple images compress poorly
- This is normal for some file types

## Best Practices

1. **Always backup** before compressing
2. **Test in browser** after compression to ensure quality is acceptable
3. **Commit before compression** so you can revert if needed
4. **Check file sizes** regularly with `npm run check-sizes`
5. **Compress before first commit** if assets are large

## Automated Compression

Add to your workflow:

```bash
# Before git commit
npm run check-sizes && npm run compress-assets
```

## Quality vs Size Trade-offs

- **Quality 75-80%**: Good balance (recommended)
- **Quality 60-70%**: Smaller files, noticeable quality loss
- **Quality 85-95%**: Larger files, minimal quality loss

Adjust in `scripts/compress-assets-for-git.js`:
```javascript
const COMPRESSION_QUALITY = 75; // Change this value
```

