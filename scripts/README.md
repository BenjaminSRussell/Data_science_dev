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
- Reports files that need attention; exits 1 if any file is over the limit
- `npm run check-sizes -- --limit-mb 25` changes the limit

**Usage**: `npm run check-sizes`

## Other Scripts

### static-bug-check.js
Static code analysis to find common bugs.
- Syntax checking
- Pattern matching for bugs
- Warnings for code quality

**Usage**: `npm run check:static` (or `node scripts/static-bug-check.js`)

