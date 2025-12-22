#!/usr/bin/env node
/**
 * Compress sprite sheets and large PNG assets
 * Requires: npm install sharp (or use pngquant)
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);

let sharp;
try {
    const sharpModule = await import('sharp');
    sharp = sharpModule.default;
} catch (e) {
    console.log('⚠️  Sharp not installed. Install with: npm install sharp');
    console.log('   Or use pngquant: brew install pngquant');
    process.exit(1);
}

async function compressImage(inputPath, quality = 80) {
    try {
        const stats = fs.statSync(inputPath);
        const sizeMB = (stats.size / 1024 / 1024).toFixed(2);
        
        // Only compress files > 100KB
        if (stats.size < 100 * 1024) {
            return { skipped: true, reason: 'too small' };
        }
        
        const buffer = await sharp(inputPath)
            .png({ 
                quality: quality,
                compressionLevel: 9,
                adaptiveFiltering: true
            })
            .toBuffer();
        
        const newSizeMB = (buffer.length / 1024 / 1024).toFixed(2);
        const savings = (((stats.size - buffer.length) / stats.size) * 100).toFixed(1);
        
        if (buffer.length < stats.size) {
            fs.writeFileSync(inputPath, buffer);
            return { 
                compressed: true, 
                original: sizeMB + 'MB', 
                compressed: newSizeMB + 'MB',
                savings: savings + '%'
            };
        }
        
        return { skipped: true, reason: 'no improvement' };
    } catch (error) {
        return { error: error.message };
    }
}

async function findAndCompressSprites() {
    const spritePatterns = [
        '**/*sprite*.png',
        '**/*sheet*.png',
        '**/character_sheet*.png',
        '**/emotion_sheet*.png'
    ];
    
    const directories = [
        path.join(rootDir, 'assets'),
        path.join(rootDir, 'downloaded_assets')
    ];
    
    let totalOriginal = 0;
    let totalCompressed = 0;
    let count = 0;
    
    for (const dir of directories) {
        if (!fs.existsSync(dir)) continue;
        
        console.log(`\n🔍 Scanning: ${path.relative(rootDir, dir)}`);
        
        const files = [];
        function scanDir(currentDir) {
            const entries = fs.readdirSync(currentDir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(currentDir, entry.name);
                if (entry.isDirectory()) {
                    scanDir(fullPath);
                } else if (entry.isFile() && entry.name.match(/.*(sprite|sheet).*\.png$/i)) {
                    files.push(fullPath);
                }
            }
        }
        scanDir(dir);
        
        for (const file of files) {
            const relPath = path.relative(rootDir, file);
            console.log(`\n📦 ${relPath}`);
            
            const result = await compressImage(file);
            if (result.compressed) {
                console.log(`   ✅ ${result.original} → ${result.compressed} (saved ${result.savings})`);
                count++;
            } else if (result.skipped) {
                console.log(`   ⏭️  Skipped: ${result.reason}`);
            } else if (result.error) {
                console.log(`   ❌ Error: ${result.error}`);
            }
        }
    }
    
    console.log(`\n✨ Compressed ${count} files`);
}

findAndCompressSprites().catch(console.error);
