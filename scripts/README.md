# Scripts Directory

## Asset Compression

### compress-assets-for-git.js
Compresses PNG/JPEG assets to reduce size for GitHub upload.
- Ensures no file exceeds 50MB
- Compresses in-place (overwrites originals)
- Creates compression report

**Usage**: `npm run compress-assets`

### check-file-sizes.js
Scans repository for files exceeding 50MB.
- Checks all files (respects .gitignore)
- Reports files that need attention

**Usage**: `npm run check-sizes`

### decompress-assets.js
Helper script providing information on restoring original files.
- Shows compression report if available
- Provides restore instructions

**Usage**: `node scripts/decompress-assets.js`

## Other Scripts

### static-bug-check.js
Static code analysis to find common bugs.
- Syntax checking
- Pattern matching for bugs
- Warnings for code quality

**Usage**: `node scripts/static-bug-check.js`

