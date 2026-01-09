#!/usr/bin/env node
/**
 * Generate File Inventory
 * Creates a comprehensive document listing every file in a folder
 * Useful for tracking what needs to be reviewed/changed
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.dirname(__dirname);

// Get target folder from command line or default to src/js
const targetFolder = process.argv[2] || 'src/js';
const outputFile = process.argv[3] || 'FILE_INVENTORY.md';

const fullPath = path.join(rootDir, targetFolder);
const outputPath = path.join(rootDir, outputFile);

// Options
const includeSize = process.argv.includes('--size');
const includeDate = process.argv.includes('--date');
const includeLines = process.argv.includes('--lines');
const includeExt = process.argv.includes('--ext');

const files = [];
const folders = [];

function countLines(filePath) {
    try {
        const content = fs.readFileSync(filePath, 'utf8');
        return content.split('\n').length;
    } catch (e) {
        return 0;
    }
}

function scanDirectory(dir, relativePath = '') {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    
    for (const entry of entries) {
        const fullEntryPath = path.join(dir, entry.name);
        const relativeEntryPath = path.join(relativePath, entry.name);
        
        // Skip node_modules, dist, and other build artifacts
        if (entry.name === 'node_modules' || 
            entry.name === 'dist' || 
            entry.name === '.git' ||
            entry.name === 'test-reports' ||
            entry.name.startsWith('.') && entry.name !== '.gitignore') {
            continue;
        }
        
        if (entry.isDirectory()) {
            folders.push({
                path: relativeEntryPath,
                fullPath: fullEntryPath
            });
            scanDirectory(fullEntryPath, relativeEntryPath);
        } else if (entry.isFile()) {
            const stats = fs.statSync(fullEntryPath);
            const ext = path.extname(entry.name);
            
            const fileInfo = {
                path: relativeEntryPath,
                fullPath: fullEntryPath,
                name: entry.name,
                extension: ext,
                size: stats.size,
                modified: stats.mtime,
                lines: includeLines ? countLines(fullEntryPath) : null
            };
            
            files.push(fileInfo);
        }
    }
}

console.log(`📁 Scanning: ${targetFolder}`);
console.log(`📄 Output: ${outputFile}`);

if (!fs.existsSync(fullPath)) {
    console.error(`❌ Error: Folder "${targetFolder}" does not exist!`);
    process.exit(1);
}

scanDirectory(fullPath);

// Sort files by path
files.sort((a, b) => a.path.localeCompare(b.path));
folders.sort((a, b) => a.path.localeCompare(b.path));

// Generate markdown document
let markdown = `# File Inventory: ${targetFolder}\n\n`;
markdown += `Generated: ${new Date().toISOString()}\n\n`;
markdown += `Total Files: ${files.length}\n`;
markdown += `Total Folders: ${folders.length}\n\n`;
markdown += `---\n\n`;

// Add table of contents
markdown += `## Table of Contents\n\n`;
markdown += `- [Files by Extension](#files-by-extension)\n`;
markdown += `- [All Files](#all-files)\n`;
markdown += `- [Folders](#folders)\n\n`;
markdown += `---\n\n`;

// Group files by extension
const filesByExt = {};
files.forEach(file => {
    const ext = file.extension || '(no extension)';
    if (!filesByExt[ext]) {
        filesByExt[ext] = [];
    }
    filesByExt[ext].push(file);
});

// Files by extension
markdown += `## Files by Extension\n\n`;
Object.keys(filesByExt).sort().forEach(ext => {
    const count = filesByExt[ext].length;
    const totalSize = filesByExt[ext].reduce((sum, f) => sum + f.size, 0);
    markdown += `### ${ext} (${count} files, ${(totalSize / 1024).toFixed(2)} KB)\n\n`;
    
    filesByExt[ext].forEach(file => {
        markdown += `- [\`${file.path}\`](#${file.path.replace(/[^a-z0-9]/gi, '-').toLowerCase()})\n`;
    });
    markdown += `\n`;
});

markdown += `---\n\n`;

// All files with details
markdown += `## All Files\n\n`;

files.forEach((file, index) => {
    const anchor = file.path.replace(/[^a-z0-9]/gi, '-').toLowerCase();
    markdown += `### ${index + 1}. \`${file.path}\` {#${anchor}}\n\n`;
    
    markdown += `**Full Path:** \`${file.fullPath}\`\n\n`;
    
    if (includeExt) {
        markdown += `**Extension:** ${file.extension || '(none)'}\n\n`;
    }
    
    if (includeSize) {
        const sizeKB = (file.size / 1024).toFixed(2);
        const sizeMB = (file.size / 1024 / 1024).toFixed(2);
        markdown += `**Size:** ${file.size} bytes (${sizeKB} KB${sizeMB > 0.1 ? `, ${sizeMB} MB` : ''})\n\n`;
    }
    
    if (includeDate) {
        markdown += `**Modified:** ${file.modified.toISOString()}\n\n`;
    }
    
    if (includeLines && file.lines !== null) {
        markdown += `**Lines:** ${file.lines}\n\n`;
    }
    
    markdown += `---\n\n`;
});

// Folders
markdown += `## Folders\n\n`;
folders.forEach((folder, index) => {
    markdown += `${index + 1}. \`${folder.path}\`\n`;
});
markdown += `\n`;

// Summary statistics
markdown += `---\n\n`;
markdown += `## Statistics\n\n`;
markdown += `- **Total Files:** ${files.length}\n`;
markdown += `- **Total Folders:** ${folders.length}\n`;

const totalSize = files.reduce((sum, f) => sum + f.size, 0);
markdown += `- **Total Size:** ${(totalSize / 1024).toFixed(2)} KB (${(totalSize / 1024 / 1024).toFixed(2)} MB)\n`;

if (includeLines) {
    const totalLines = files.reduce((sum, f) => sum + (f.lines || 0), 0);
    markdown += `- **Total Lines:** ${totalLines.toLocaleString()}\n`;
}

// File extensions summary
markdown += `\n**Files by Extension:**\n\n`;
Object.keys(filesByExt).sort().forEach(ext => {
    const count = filesByExt[ext].length;
    markdown += `- ${ext || '(no extension)'}: ${count} files\n`;
});

// Write to file
fs.writeFileSync(outputPath, markdown, 'utf8');

console.log(`\n✅ Inventory generated successfully!`);
console.log(`📄 Output: ${outputPath}`);
console.log(`📊 Files: ${files.length}`);
console.log(`📁 Folders: ${folders.length}`);

if (includeSize) {
    const totalSizeMB = (totalSize / 1024 / 1024).toFixed(2);
    console.log(`💾 Total Size: ${totalSizeMB} MB`);
}

if (includeLines) {
    const totalLines = files.reduce((sum, f) => sum + (f.lines || 0), 0);
    console.log(`📝 Total Lines: ${totalLines.toLocaleString()}`);
}

console.log(`\nUsage options:`);
console.log(`  --size   Include file sizes`);
console.log(`  --date   Include modification dates`);
console.log(`  --lines  Include line counts (slower)`);
console.log(`  --ext    Include file extensions in details`);

