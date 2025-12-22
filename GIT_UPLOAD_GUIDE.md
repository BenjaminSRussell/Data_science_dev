# Git Upload Guide - Asset Compression

## ✅ Setup Complete

Compression scripts are ready! Here's how to use them:

## 🚀 Quick Commands

```bash
# 1. Check current file sizes (ensures nothing exceeds 50MB)
npm run check-sizes

# 2. Compress all assets
npm run compress-assets

# 3. Verify no files exceed 50MB after compression
npm run check-sizes
```

## 📋 Pre-Upload Checklist

Before uploading to GitHub:

- [ ] **Backup assets** (optional but recommended)
- [ ] Run `npm run check-sizes` to check current sizes
- [ ] Run `npm run compress-assets` to compress
- [ ] Run `npm run check-sizes` again to verify
- [ ] Test game in browser to ensure quality is acceptable
- [ ] Commit compressed assets

## 🔧 Current Status

- ✅ Compression script created (`scripts/compress-assets-for-git.js`)
- ✅ Size checker created (`scripts/check-file-sizes.js`)
- ✅ Decompress helper created (`scripts/decompress-assets.js`)
- ✅ Sharp (compression library) installed
- ✅ NPM scripts added to package.json

## 📊 What Gets Compressed

- **PNG files** in `assets/` directory (634 files found)
- **PNG/JPEG files** in `public/assets/` directory
- Files larger than 100KB
- **Excluded**: `downloaded_assets/` (already in .gitignore)

## ⚠️ Important Notes

1. **Compression is in-place** - Original files are overwritten
2. **Backup first** if you want to preserve originals
3. **Test after compression** to ensure quality is acceptable
4. **50MB limit** - GitHub won't accept files larger than 50MB

## 🎯 Compression Settings

- PNG Quality: 75% (good balance)
- JPEG Quality: 80%
- Max file size: 50MB (GitHub limit)
- Skips files < 100KB (already small enough)

## 📝 Example Workflow

```bash
# Step 1: Check sizes
npm run check-sizes

# Step 2: (Optional) Backup
git add assets/ public/assets/
git commit -m "Backup before compression"

# Step 3: Compress
npm run compress-assets

# Step 4: Verify
npm run check-sizes

# Step 5: Test in browser
npm run dev
# Open http://localhost:5176 and verify game looks good

# Step 6: Commit compressed assets
git add assets/ public/assets/
git commit -m "Compress assets for GitHub"
git push
```

## 🔄 Restoring Original Files

If you need to restore original quality:

```bash
# From git (if committed before compression)
git checkout HEAD -- assets/ public/assets/

# Or use the decompress script for info
node scripts/decompress-assets.js
```

## 📈 Expected Results

After compression:
- Most PNGs will be 20-40% smaller
- Quality should remain visually acceptable
- All files will be under 50MB
- Compression report saved to `compression-report.json`

## 🐛 Troubleshooting

**"Sharp module not found"**
```bash
npm install --save-dev sharp
```

**"File still exceeds 50MB"**
- Very large files may need to be split
- Or excluded from git (add to .gitignore)
- Or use Git LFS for that specific file

**"Compression didn't help"**
- Some files are already optimized
- Simple images compress poorly
- This is normal

## 📚 More Information

See `ASSET_COMPRESSION_GUIDE.md` for detailed documentation.

