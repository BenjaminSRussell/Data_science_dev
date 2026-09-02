#!/usr/bin/env node

/**
 * Generate File Inventory
 * Generates an inventory of files and folders in the project, with optional details.
 * Excludes specified directories and files to keep the inventory relevant.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);

const EXCLUDE_DIRS = ['node_modules', 'dist', '.git', 'test-reports'];
const EXCLUDE_FILES = ['*.DS_Store', '*.log'];

let files = [];
let folders = [];

async function scanDirectory(dir, relativePath = '') {
    try {
        const entries = await fs.promises.readdir(dir, { withFileTypes: true });

        for (const entry of entries) {
            const fullPath = path.join(dir, entry.name);
            const relativeEntryPath = path.join(relativePath, entry.name);

            if (entry.isDirectory()) {
                // Skip excluded directories
                if (EXCLUDE_DIRS.includes(entry.name) || entry.name.startsWith('.')) {
                    continue;
                }
                folders.push(relativeEntryPath);
                await scanDirectory(fullPath, relativeEntryPath);
            } else {
                // Skip excluded files and dotfiles (except .gitignore)
                if (EXCLUDE_FILES.includes(entry.name) || (entry.name.startsWith('.') && entry.name !== '.gitignore')) {
                    continue;
                }
                files.push(relativeEntryPath);
            }
        }
    } catch (error) {
        console.error(`Error reading directory ${dir}:`, error);
    }
}

async function generateInventory(options = {}) {
    files = [];
    folders = [];

    console.log('Generating file inventory...\n');
    await scanDirectory(rootDir);

    console.log(`Inventory generated for directory: ${rootDir}\n`);

    if (options.details) {
        console.log('Files:');
        files.forEach(file => console.log(`  - ${file}`));
        console.log('\nFolders:');
        folders.forEach(folder => console.log(`  - ${folder}`));
    }

    if (options.size) {
        console.log('\nFile sizes:');
        files.forEach(file => {
            const stats = fs.statSync(path.join(rootDir, file));
            console.log(`  ${file}: ${(stats.size / 1024).toFixed(2)}KB`);
        });
    }

    if (options.date) {
        console.log('\nModification dates:');
        files.forEach(file => {
            const stats = fs.statSync(path.join(rootDir, file));
            console.log(`  ${file}: ${stats.mtime}`);
        });
    }

    if (options.lines) {
        console.log('\nLine counts:');
        files.forEach(file => {
            const ext = path.extname(file).toLowerCase();
            if (['.js', '.json', '.md', '.txt'].includes(ext)) {
                const content = fs.readFileSync(path.join(rootDir, file), 'utf-8');
                const lineCount = content.split('\n').filter(line => line.trim() !== '').length;
                console.log(`  ${file}: ${lineCount} lines`);
            }
        });
    }

    if (options.ext) {
        console.log('\nFile extensions:');
        files.forEach(file => {
            const ext = path.extname(file);
            console.log(`  ${file}: ${ext}`);
        });
    }
}

// Command-line interface
if (process.argv.includes('--help')) {
    console.log('Usage: node scripts/generate-file-inventory.js [options]');
    console.log('Options:');
    console.log('  --details  Include detailed listing of files and folders');
    console.log('  --size     Include file sizes');
    console.log('  --date     Include modification dates');
    console.log('  --lines    Include line counts (slower)');
    console.log('  --ext      Include file extensions in details');
    process.exit(0);
}

const options = {
    details: process.argv.includes('--details'),
    size: process.argv.includes('--size'),
    date: process.argv.includes('--date'),
    lines: process.argv.includes('--lines'),
    ext: process.argv.includes('--ext')
};

generateInventory(options).catch(error => {
    console.error('Error generating inventory:', error);
    process.exit(1);
});

// Export scanDirectory for testing
export { scanDirectory };