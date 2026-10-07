#!/usr/bin/env node
/**
 * Compress Assets for Git
 * Compresses all PNG/JPEG images to reduce size for GitHub
 * Ensures no file exceeds 50MB after compression
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB
const COMPRESSION_QUALITY = 75; // PNG compression quality
const JPEG_QUALITY = 80; // JPEG quality

const stats = {
    total: 0,
    compressed: 0,
    skipped: 0,
    errors: 0,
    totalOriginalSize: 0,
    totalCompressedSize: 0,
    files: []
};

async function compressImage(inputPath, outputPath = null) {
    if (!outputPath) {
        outputPath = inputPath; // Overwrite original
    }

    try {
        const originalStats = fs.statSync(inputPath);
        const originalSize = originalStats.size;

        // Skip if already small (< 100KB)
        if (originalSize < 100 * 1024) {
            stats.skipped++;
            return { skipped: true, reason: 'already small' };
        }

        // Get file extension
        const ext = path.extname(inputPath).toLowerCase();
        
        let buffer;
        if (ext === '.png') {
            // Compress PNG with sharp
            buffer = await sharp(inputPath)
                .png({ 
                    quality: COMPRESSION_QUALITY,
                    compressionLevel: 9,
                    adaptiveFiltering: true,
                    palette: true // Use palette for better compression
                })
                .toBuffer();
        } else if (['.jpg', '.jpeg'].includes(ext)) {
            // Compress JPEG
            buffer = await sharp(inputPath)
                .jpeg({ 
                    quality: JPEG_QUALITY,
                    mozjpeg: true
                })
                .toBuffer();
        } else {
            stats.skipped++;
            return { skipped: true, reason: 'unsupported format' };
        }

        const compressedSize = buffer.length;

        // Check if compressed file exceeds 50MB
        if (compressedSize > MAX_FILE_SIZE) {
            stats.errors++;
            return { 
                error: true, 
                message: `Compressed file would be ${(compressedSize / 1024 / 1024).toFixed(2)}MB (exceeds 50MB limit)` 
            };
        }

        // Only overwrite if compression actually reduced size
        if (compressedSize < originalSize) {
            fs.writeFileSync(outputPath, buffer);
            const savings = ((originalSize - compressedSize) / originalSize * 100).toFixed(1);
            
            stats.compressed++;
            stats.totalOriginalSize += originalSize;
            stats.totalCompressedSize += compressedSize;

            return {
                success: true,
                original: (originalSize / 1024 / 1024).toFixed(2) + 'MB',
                compressed: (compressedSize / 1024 / 1024).toFixed(2) + 'MB',
                savings: savings + '%'
            };
        } else {
            stats.skipped++;
            return { skipped: true, reason: 'compression did not reduce size' };
        }
    } catch (error) {
        stats.errors++;
        return { error: true, message: error.message };
    }
}

/**
 * Recursively collect files with the given extensions under a root directory.
 *
 * @param {string} rootDir - Directory to scan. If it does not exist, no files
 *   are collected (missing directories are skipped gracefully).
 * @param {string[]} extensions - Lowercase extensions to match, e.g. ['.png'].
 *   Matching is case-insensitive (a file named `photo.PNG` matches '.png').
 * @param {string[]} [out] - Optional array to push matched file paths into.
 *   A new array is created when omitted.
 * @returns {string[]} The array of matched file paths.
 */
export function collectImageFiles(rootDir, extensions, out = []) {
    if (!fs.existsSync(rootDir)) {
        return out;
    }

    const scanDir = (currentDir) => {
        const entries = fs.readdirSync(currentDir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(currentDir, entry.name);

            if (entry.isDirectory()) {
                scanDir(fullPath);
            } else if (entry.isFile()) {
                const ext = path.extname(entry.name).toLowerCase();
                if (extensions.includes(ext)) {
                    out.push(fullPath);
                }
            }
        }
    };

    scanDir(rootDir);
    return out;
}

async function findAndCompressAssets() {
    console.log('🔍 Finding assets to compress...\n');

    const directories = [
        path.join(rootDir, 'assets'),
        path.join(rootDir, 'public', 'assets')
        // Note: downloaded_assets is excluded from git, so we skip it
    ];

    const imageExtensions = ['.png', '.jpg', '.jpeg'];
    const files = [];

    // Find all image files
    for (const dir of directories) {
        collectImageFiles(dir, imageExtensions, files);
    }

    stats.total = files.length;
    console.log(`Found ${files.length} image files to process\n`);

    // Process files
    for (const file of files) {
        const relPath = path.relative(rootDir, file);
        const fileSize = fs.statSync(file).size / 1024 / 1024;

        process.stdout.write(`Processing: ${relPath} (${fileSize.toFixed(2)}MB)... `);

        const result = await compressImage(file);

        if (result.success) {
            console.log(`✅ ${result.original} → ${result.compressed} (saved ${result.savings})`);
            stats.files.push({
                file: relPath,
                original: result.original,
                compressed: result.compressed,
                savings: result.savings
            });
        } else if (result.skipped) {
            console.log(`⏭️  Skipped: ${result.reason}`);
        } else if (result.error) {
            console.log(`❌ Error: ${result.message}`);
        }
    }

    // Print summary
    console.log('\n' + '='.repeat(60));
    console.log('📊 Compression Summary');
    console.log('='.repeat(60));
    console.log(`Total files: ${stats.total}`);
    console.log(`Compressed: ${stats.compressed}`);
    console.log(`Skipped: ${stats.skipped}`);
    console.log(`Errors: ${stats.errors}`);
    console.log(`\nOriginal total size: ${(stats.totalOriginalSize / 1024 / 1024).toFixed(2)}MB`);
    console.log(`Compressed total size: ${(stats.totalCompressedSize / 1024 / 1024).toFixed(2)}MB`);
    const totalSavings = ((stats.totalOriginalSize - stats.totalCompressedSize) / stats.totalOriginalSize * 100).toFixed(1);
    console.log(`Total savings: ${totalSavings}%`);
    console.log('='.repeat(60));

    // Check for files that might still exceed 50MB
    const largeFiles = [];
    for (const file of files) {
        const fileSize = fs.statSync(file).size;
        if (fileSize > MAX_FILE_SIZE) {
            largeFiles.push({
                file: path.relative(rootDir, file),
                size: (fileSize / 1024 / 1024).toFixed(2) + 'MB'
            });
        }
    }

    if (largeFiles.length > 0) {
        console.log('\n⚠️  WARNING: Files still exceeding 50MB:');
        largeFiles.forEach(f => console.log(`  - ${f.file}: ${f.size}`));
        console.log('\nThese files should be excluded from git or further compressed.');
    } else {
        console.log('\n✅ All files are under 50MB!');
    }

    // Save compression report
    const reportPath = path.join(rootDir, 'compression-report.json');
    fs.writeFileSync(reportPath, JSON.stringify({
        timestamp: new Date().toISOString(),
        stats,
        largeFiles
    }, null, 2));
    console.log(`\n📄 Report saved to: ${path.relative(rootDir, reportPath)}`);
}

// Run compression only when executed directly (not when imported by tests)
const isMain = process.argv[1] && path.resolve(process.argv[1]) === __filename;
if (isMain) {
    findAndCompressAssets().catch(error => {
        console.error('❌ Compression failed:', error);
        process.exit(1);
    });
}

