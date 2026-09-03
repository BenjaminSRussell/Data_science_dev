const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const srcDir = 'animated characters 3d';
const destDir = 'src/assets/characters/3d';

if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true });
}

// Ensure animated characters 3d exists
if (!fs.existsSync(srcDir)) {
    console.error(`Directory '${srcDir}' does not exist.`);
    process.exit(0);
}

const files = fs.readdirSync(srcDir);
files.forEach(file => {
    if (file.endsWith('.zip')) {
        const name = path.basename(file, '.zip').replace(/ /g, '_').toLowerCase();
        const target = path.join(destDir, name);
        if (!fs.existsSync(target)) {
            fs.mkdirSync(target, { recursive: true });
            console.log(`Unzipping ${file} to ${target}...`);
            try {
                execSync(`unzip -o "${path.join(srcDir, file)}" -d "${target}"`);
            } catch (e) {
                console.error(`Failed to unzip ${file}:`, e.message);
            }
        }
    }
});
console.log('Done!');
