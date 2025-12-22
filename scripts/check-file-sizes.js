#!/usr/bin/env node
/**
 * Check File Sizes
 * Scans all files and reports any that exceed 50MB
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);

const MAX_FILE_SIZE = 50 * 1024 * 1024; // 50MB

function findLargeFiles(dir, fileList = []) {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    entries.forEach(entry => {
        const fullPath = path.join(dir, entry.name);
        
        // Skip node_modules, .git, dist
        if (entry.name === 'node_modules' || entry.name === '.git' || entry.name === 'dist' || entry.name === 'downloaded_assets') {
            return;
        }
        
        if (entry.isDirectory()) {
            findLargeFiles(fullPath, fileList);
        } else if (entry.isFile()) {
            const stats = fs.statSync(fullPath);
            if (stats.size > MAX_FILE_SIZE) {
                fileList.push({
                    path: path.relative(rootDir, fullPath),
                    size: stats.size,
                    sizeMB: (stats.size / 1024 / 1024).toFixed(2) + 'MB'
                });
            }
        }
    });
    
    return fileList;
}

console.log('🔍 Scanning for files exceeding 50MB...\n');

const largeFiles = findLargeFiles(rootDir);

if (largeFiles.length === 0) {
    console.log('✅ No files exceed 50MB!');
    process.exit(0);
} else {
    console.log(`⚠️  Found ${largeFiles.length} file(s) exceeding 50MB:\n`);
    largeFiles.forEach(file => {
        console.log(`  ${file.path}: ${file.sizeMB}`);
    });
    console.log('\n💡 Recommendation:');
    console.log('  - Compress these files: npm run compress-assets');
    console.log('  - Or add them to .gitignore if not needed in git');
    process.exit(1);
}

