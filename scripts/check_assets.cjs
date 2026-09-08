const fs = require('fs');
const path = require('path');

// Check if srcDir exists before proceeding
if (!fs.existsSync(srcDir)) {
    console.error(`Directory ${srcDir} does not exist.`);
    process.exit(1);
}

function getAllFiles(dir, exts) {
    let results = [];
    const list = fs.readdirSync(dir);
    list.forEach(file => {
        file = path.join(dir, file);
        const stat = fs.statSync(file);
        if (stat && stat.isDirectory()) {
            results = results.concat(getAllFiles(file, exts));
        } else {
            if (exts.some(ext => file.endsWith(ext))) {
                results.push(file);
            }
        }
    });
    return results;
}

module.exports = {
    getAllFiles
};

if (require.main === module) {
    const rootDir = process.cwd();
    const srcDir = path.join(rootDir, 'src');

function extractAssetReferences(content) {
    const assetPaths = new Set();
    let match;
    while ((match = regex.exec(content)) !== null) {
        let assetPath = match[1];
        if (assetPath.startsWith('/')) assetPath = assetPath.substring(1);
        assetPaths.add(assetPath);
    }
    return Array.from(assetPaths);
}

module.exports = {
    extractAssetReferences
};

jsFiles.forEach(file => {
    const content = fs.readFileSync(file, 'utf8');
    const assetPaths = extractAssetReferences(content);
    assetPaths.forEach(assetPath => {
        assets.add(assetPath);
    });
});

console.log(`Scanning ${jsFiles.length} files for asset references...`);

console.log(`Found ${assets.size} unique asset references.`);

let missingCount = 0;
assets.forEach(asset => {
    const fullPath = path.join(rootDir, 'src', asset); // Assuming assets are in src/ or mapped there
    // Actually, checked structure: src/assets and downloaded_assets are likely at root or src
    // Let's check both src/, root/, and public/

    let exists = false;
    let tryPath1 = path.join(rootDir, 'src', asset);
    let tryPath2 = path.join(rootDir, asset);
    let tryPath3 = path.join(rootDir, 'public', asset);

    if (fs.existsSync(tryPath1)) exists = true;
    else if (fs.existsSync(tryPath2)) exists = true;
    else if (fs.existsSync(tryPath3)) exists = true;

    // Also handle URL encoded spaces just in case
    if (!exists) {
        try {
            tryPath1 = path.join(rootDir, 'src', decodeURIComponent(asset));
            tryPath2 = path.join(rootDir, decodeURIComponent(asset));
            tryPath3 = path.join(rootDir, 'public', decodeURIComponent(asset));
            if (fs.existsSync(tryPath1)) exists = true;
            else if (fs.existsSync(tryPath2)) exists = true;
            else if (fs.existsSync(tryPath3)) exists = true;
        } catch (e) {
            // If decodeURIComponent fails, just ignore it and continue
        }
    }

        // Also handle URL encoded spaces just in case
        if (!exists) {
            tryPath1 = path.join(rootDir, 'src', decodeURIComponent(asset));
            tryPath2 = path.join(rootDir, decodeURIComponent(asset));
            if (fs.existsSync(tryPath1)) exists = true;
            else if (fs.existsSync(tryPath2)) exists = true;
        }

console.log(`Total missing assets: ${missingCount}`);