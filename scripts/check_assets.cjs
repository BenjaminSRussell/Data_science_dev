const fs = require('fs');
const path = require('path');

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

    const jsFiles = getAllFiles(srcDir, ['.js', '.json', '.css']);
    const assets = new Set();

    // Regex to find paths roughly looking like assets
    // Matches: /assets/..., assets/..., /downloaded_assets/...
    const regex = /['"](\/?(?:assets|downloaded_assets)\/[^'"]+)['"]/g;

    console.log(`Scanning ${jsFiles.length} files for asset references...`);

    jsFiles.forEach(file => {
        const content = fs.readFileSync(file, 'utf8');
        let match;
        while ((match = regex.exec(content)) !== null) {
            let assetPath = match[1];
            // Clean path
            if (assetPath.startsWith('/')) assetPath = assetPath.substring(1);
            assets.add(assetPath);
        }
    });

    console.log(`Found ${assets.size} unique asset references.`);

    let missingCount = 0;
    assets.forEach(asset => {
        const fullPath = path.join(rootDir, 'src', asset); // Assuming assets are in src/ or mapped there
        // Actually, checked structure: src/assets and downloaded_assets are likely at root or src
        // Let's check both src/ and root/

        let exists = false;
        let tryPath1 = path.join(rootDir, 'src', asset);
        let tryPath2 = path.join(rootDir, asset);

        if (fs.existsSync(tryPath1)) exists = true;
        else if (fs.existsSync(tryPath2)) exists = true;

        // Also handle URL encoded spaces just in case
        if (!exists) {
            tryPath1 = path.join(rootDir, 'src', decodeURIComponent(asset));
            tryPath2 = path.join(rootDir, decodeURIComponent(asset));
            if (fs.existsSync(tryPath1)) exists = true;
            else if (fs.existsSync(tryPath2)) exists = true;
        }

        if (!exists) {
            console.log(`[MISSING] ${asset}`);
            missingCount++;
        }
    });

    console.log(`Total missing assets: ${missingCount}`);
}