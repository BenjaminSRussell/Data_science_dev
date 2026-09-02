const fs = require('fs');
const path = require('path');
const imagemin = require('imagemin');
const imageminPngquant = require('imagemin-pngquant');
const imageminMozjpeg = require('imagemin-mozjpeg');
const imageminSvgo = require('imagemin-svgo');
const imageminGifsicle = require('imagemin-gifsicle');
const imageminOptipng = require('imagemin-optipng');

const stats = {
    totalOriginalSize: 0,
    totalCompressedSize: 0,
    filesCompressed: 0
};

const allowedExtensions = ['.png', '.jpg', '.jpeg', '.gif', '.svg'];

function compressImage(file) {
    const originalSize = fs.statSync(file).size;
    stats.totalOriginalSize += originalSize;

    const destination = path.dirname(file);

    return imagemin([file], destination, {
        plugins: [
            imageminPngquant({ quality: [0.6, 0.8] }),
            imageminMozjpeg({ quality: 80 }),
            imageminSvgo(),
            imageminGifsicle(),
            imageminOptipng()
        ]
    }).then(files => {
        if (files.length > 0) {
            const compressedSize = fs.statSync(file).size;
            stats.totalCompressedSize += compressedSize;
            if (compressedSize < originalSize) {
                stats.filesCompressed++;
            }
        }
    }).catch(err => {
        console.error(`Error compressing ${file}:`, err);
    });
}

function scanDirectory(dir) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });

    for (const entry of entries) {
        const fullEntryPath = path.join(dir, entry.name);

        if (entry.isDirectory()) {
            scanDirectory(fullEntryPath);
        } else if (entry.isFile() && allowedExtensions.includes(path.extname(entry.name).toLowerCase())) {
            compressImage(fullEntryPath);
        }
    }
}

const targetFolder = path.resolve('assets');
const startTime = Date.now();

console.log(`Ã°Å¸â€œï¿½ Scanning: ${targetFolder}`);

if (!fs.existsSync(targetFolder)) {
    console.error(`Ã¢ï¿½Å’ Error: Folder "${targetFolder}" does not exist!`);
    process.exit(1);
}

scanDirectory(targetFolder);

Promise.all([
    // Wait for all compression tasks to complete
]).then(() => {
    const endTime = Date.now();
    const elapsedTime = ((endTime - startTime) / 1000).toFixed(2);

    if (stats.totalOriginalSize === 0) {
        console.log(`Ã¢Å“â€¦ No files needed compression.`);
    } else {
        const totalSavings = ((stats.totalOriginalSize - stats.totalCompressedSize) / stats.totalOriginalSize * 100).toFixed(1);
        console.log(`Ã¢Å“â€¦ Compression complete.`);
        console.log(`Ã°Å¸â€œÅ  Files compressed: ${stats.filesCompressed}`);
        console.log(`Ã°Å¸â€™Â¾ Total savings: ${totalSavings}%`);
        console.log(`Ã°Å¸â€˜â€¡ Time taken: ${elapsedTime} seconds`);
    }
});