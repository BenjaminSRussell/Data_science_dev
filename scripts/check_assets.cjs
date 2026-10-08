/**
 * check_assets.cjs: find asset paths referenced in src/ that don't exist on disk.
 *
 * Usage: node scripts/check_assets.cjs   (from the repo root)
 * Exits 1 when any referenced asset is missing so it can gate CI or a hook (#1900).
 *
 * A reference like '/assets/icons/x.png' is looked up where the game can
 * actually load it from: public/ (Vite's publicDir, served at the site root),
 * the top-level assets/ tree (served at /assets by vite.config.js), and src/.
 * Strings ending in '/' (e.g. NPC_IMAGE_BASE = '/assets/npcs/') are base-path
 * prefixes used for concatenation, not file references, so they're skipped.
 */
const fs = require('fs');
const path = require('path');

const SCAN_EXTENSIONS = ['.js', '.json', '.css'];
const ASSET_REFERENCE_RE = /['"](\/?(?:assets|downloaded_assets)\/[^'"]+)['"]/g;

/** Recursively collect files under dir whose names end with one of exts. */
function getAllFiles(dir, exts) {
    let results = [];
    for (const name of fs.readdirSync(dir)) {
        const file = path.join(dir, name);
        const stat = fs.statSync(file);
        if (stat.isDirectory()) {
            results = results.concat(getAllFiles(file, exts));
        } else if (exts.some(ext => file.endsWith(ext))) {
            results.push(file);
        }
    }
    return results;
}

/** True for strings that are only a directory prefix, e.g. 'assets/npcs/'. */
function isPathPrefix(assetPath) {
    return assetPath.endsWith('/');
}

/**
 * Quoted assets/... or downloaded_assets/... paths in a file's text, with
 * the leading '/' removed, deduplicated in first-seen order. Prefix-only
 * strings are left out.
 */
function extractAssetReferences(content) {
    const found = new Set();
    const re = new RegExp(ASSET_REFERENCE_RE.source, 'g');
    let match;
    while ((match = re.exec(content)) !== null) {
        let assetPath = match[1];
        if (assetPath.startsWith('/')) assetPath = assetPath.substring(1);
        if (!isPathPrefix(assetPath)) found.add(assetPath);
    }
    return [...found];
}

/** Places an asset path can resolve to, in lookup order. */
function candidatePaths(rootDir, assetPath) {
    const variants = [assetPath];
    try {
        const decoded = decodeURIComponent(assetPath);
        if (decoded !== assetPath) variants.push(decoded);
    } catch (e) {
        // malformed %-escape: only the raw path can match
    }
    const bases = [path.join(rootDir, 'public'), rootDir, path.join(rootDir, 'src')];
    return variants.flatMap(v => bases.map(base => path.join(base, v)));
}

function assetExists(rootDir, assetPath) {
    return candidatePaths(rootDir, assetPath).some(p => fs.existsSync(p));
}

/** Scan rootDir/src and return { scanned, references, missing } (sorted). */
function checkAssets(rootDir) {
    const srcDir = path.join(rootDir, 'src');
    const files = getAllFiles(srcDir, SCAN_EXTENSIONS);
    const references = new Set();
    for (const file of files) {
        for (const ref of extractAssetReferences(fs.readFileSync(file, 'utf8'))) {
            references.add(ref);
        }
    }
    const missing = [...references].filter(ref => !assetExists(rootDir, ref)).sort();
    return { scanned: files.length, references: [...references].sort(), missing };
}

function main(rootDir = process.cwd()) {
    const srcDir = path.join(rootDir, 'src');
    if (!fs.existsSync(srcDir)) {
        console.error(`Directory ${srcDir} does not exist.`);
        return 1;
    }
    const { scanned, references, missing } = checkAssets(rootDir);
    console.log(`Scanned ${scanned} files; found ${references.length} unique asset references.`);
    missing.forEach(asset => console.log(`[MISSING] ${asset}`));
    console.log(`Total missing assets: ${missing.length}`);
    return missing.length > 0 ? 1 : 0;
}

module.exports = {
    getAllFiles,
    isPathPrefix,
    extractAssetReferences,
    candidatePaths,
    assetExists,
    checkAssets,
    main,
};

if (require.main === module) {
    process.exitCode = main();
}
