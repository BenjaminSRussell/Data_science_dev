const fs = require('fs');
const path = require('path');
const sharp = require('sharp');
const zlib = require('zlib');

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const MAX_COMPRESSION_SIZE = 100 * 1024; // 100KB

async function compressImage(inputPath, outputPath) {
    const stats = fs.statSync(inputPath);
    const fileSize = stats.size;

    if (fileSize < MAX_COMPRESSION_SIZE) {
        console.log(`Skipping compression for ${path.basename(inputPath)} as it's under 100KB.`);
        return { success: true, skipped: true, originalSize: fileSize, compressedSize: fileSize };
    }

    let image;
    try {
        image = sharp(inputPath);
    } catch (error) {
        console.error(`Error reading ${inputPath}: ${error.message}`);
        return { success: false, error: true, originalSize: fileSize, compressedSize: fileSize, errorMessage: error.message };
    }

    let compressedBuffer;
    let compressedSize;

    if (path.extname(inputPath).toLowerCase() === '.png') {
        compressedBuffer = await image.png().toBuffer();
    } else if (path.extname(inputPath).toLowerCase() === '.jpg' || path.extname(inputPath).toLowerCase() === '.jpeg') {
        compressedBuffer = await image.jpeg().toBuffer();
    } else {
        console.log(`Skipping compression for unsupported file type: ${path.basename(inputPath)}`);
        return { success: true, skipped: true, originalSize: fileSize, compressedSize: fileSize };
    }

    compressedSize = compressedBuffer.length;

    if (compressedSize > MAX_FILE_SIZE) {
        console.error(`Error compressing ${inputPath}: compressed file size exceeds 50MB.`);
        return { success: false, error: true, originalSize: fileSize, compressedSize: compressedSize };
    }

    fs.writeFileSync(outputPath, compressedBuffer);

    if (compressedSize < fileSize) {
        const savings = ((fileSize - compressedSize) / fileSize * 100).toFixed(1);
        const originalSizeMB = (fileSize / 1024 / 1024).toFixed(2);
        const compressedSizeMB = (compressedSize / 1024 / 1024).toFixed(2);
        console.log(`Compressed ${path.basename(inputPath)} from ${originalSizeMB}MB to ${compressedSizeMB}MB (${savings}% savings).`);
        return { success: true, compressed: true, originalSize: fileSize, compressedSize: compressedSize, savings: savings, originalSizeMB: originalSizeMB, compressedSizeMB: compressedSizeMB };
    } else {
        console.log(`No size reduction for ${path.basename(inputPath)} after compression.`);
        return { success: true, skipped: true, originalSize: fileSize, compressedSize: compressedSize };
    }
}

module.exports = { compressImage };