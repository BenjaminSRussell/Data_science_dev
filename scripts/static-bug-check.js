#!/usr/bin/env node
/**
 * Static Bug Checker
 * Runs basic static analysis on JS files to find common bugs
 */

import fs from 'node:fs';
import path from 'node:path';
import { execSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const bugs = [];
const warnings = [];

function findJSFiles(dir, fileList = []) {
    const files = fs.readdirSync(dir);
    
    files.forEach(file => {
        const filePath = path.join(dir, file);
        const stat = fs.statSync(filePath);
        
        if (stat.isDirectory() && !filePath.includes('node_modules')) {
            findJSFiles(filePath, fileList);
        } else if (file.endsWith('.js')) {
            fileList.push(filePath);
        }
    });
    
    return fileList;
}

/**
 * A setInterval line is suspicious only when the file never calls
 * clearInterval. Cleanup can live in stop()/close()/resolve()/etc., so no
 * particular method name ("destroy") is required (#2320).
 */
/**
 * Is this line the start of an empty catch block? Only real `catch` syntax
 * counts (`} catch (e) {` / `catch {`), never a comment or string that just
 * mentions the word (#88). Handles `catch (e) {}` on one line too.
 */
export function isEmptyCatch(line, nextLine) {
    const trimmed = String(line || '').trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('*') || trimmed.startsWith('/*')) return false;
    const code = trimmed.replace(/\/\/.*$/, '');
    if (/\bcatch\s*(\([^)]*\))?\s*\{\s*\}/.test(code)) return true;
    if (!/\bcatch\s*(\([^)]*\))?\s*\{\s*$/.test(code)) return false;
    return String(nextLine ?? '').trim() === '}';
}

export function intervalLacksCleanup(line, content) {
    if (!line.includes('setInterval') || line.includes('clearInterval')) return false;
    if (line.trim().startsWith('//')) return false;
    return !content.includes('clearInterval');
}

/**
 * True when `line` calls `.name(` but the file defines no `name` in any form
 * this codebase uses: `function name(`, a class method `name(...) {`, or a
 * property `name =` / `name:`. The old check looked only for the literal
 * "function name", and its other clause was always true (#1901).
 */
export function definesMethod(content, name) {
    const n = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    return new RegExp(`(?:function\\s+${n}\\s*\\(|^\\s*(?:async\\s+|static\\s+)*${n}\\s*\\([^)]*\\)\\s*\\{|\\b${n}\\s*[:=](?!=))`, 'm').test(content);
}

export function callLacksDefinition(line, content, name) {
    if (!line.includes(`.${name}(`)) return false;
    if (line.trim().startsWith('//')) return false;
    return !definesMethod(content, name);
}

function checkFile(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    const lines = content.split('\n');
    const fileName = path.relative(process.cwd(), filePath);
    
    // Check for common bug patterns
    lines.forEach((line, index) => {
        const lineNum = index + 1;
        
        // Check for undefined method calls
        if (callLacksDefinition(line, content, 'registerAnimation')) {
            bugs.push(`${fileName}:${lineNum} - Possible undefined method call: registerAnimation`);
        }
        
        // Check for missing null checks before method calls
        if (line.match(/this\.\w+\.\w+\(/) && !line.includes('?.') && !line.includes('if') && !line.includes('//')) {
            if (line.includes('this.spriteSheetManager.') || line.includes('this.assetManager.')) {
                warnings.push(`${fileName}:${lineNum} - Missing optional chaining?: ${line.trim()}`);
            }
        }
        
        // Check for setInterval without cleanup
        if (intervalLacksCleanup(line, content)) {
            warnings.push(`${fileName}:${lineNum} - setInterval may not be cleaned up`);
        }
        
        // Check for Assets.init() calls
        if (line.includes('Assets.init(')) {
            if (!content.includes('Assets.cache') && !content.includes('already initialized')) {
                warnings.push(`${fileName}:${lineNum} - Assets.init() may be called multiple times`);
            }
        }
        
        // Check for empty catch blocks
        if (isEmptyCatch(line, lines[index + 1])) {
            bugs.push(`${fileName}:${lineNum} - Empty catch block (swallows errors)`);
        }
    });
}

// Main execution (skipped when imported, e.g. by tests)
if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
    main();
}

function main() {
    console.log('🔍 Running Static Bug Check...\n');

    const srcDir = path.join(path.dirname(__dirname), 'src', 'js');
    const jsFiles = findJSFiles(srcDir);

    console.log(`Found ${jsFiles.length} JavaScript files\n`);

    jsFiles.forEach(file => {
        try {
            checkFile(file);
        } catch (error) {
            console.error(`Error checking ${file}:`, error.message);
        }
    });

    // Run syntax check
    console.log('Running syntax checks...\n');
    jsFiles.forEach(file => {
        try {
            execSync(`node --check "${file}"`, { stdio: 'pipe' });
        } catch (error) {
            bugs.push(`${path.relative(process.cwd(), file)} - Syntax error: ${error.message.split('\n')[0]}`);
        }
    });

    // Report results
    console.log('='.repeat(60));
    console.log('📊 Static Bug Check Results');
    console.log('='.repeat(60));
    console.log(`\n🐛 Bugs Found: ${bugs.length}`);
    console.log(`⚠️  Warnings: ${warnings.length}\n`);

    if (bugs.length > 0) {
        console.log('🐛 BUGS:');
        bugs.forEach((bug, i) => console.log(`${i + 1}. ${bug}`));
        console.log('');
    }

    if (warnings.length > 0) {
        console.log('⚠️  WARNINGS:');
        warnings.slice(0, 20).forEach((warn, i) => console.log(`${i + 1}. ${warn}`));
        if (warnings.length > 20) {
            console.log(`... and ${warnings.length - 20} more warnings`);
        }
        console.log('');
    }

    if (bugs.length === 0 && warnings.length === 0) {
        console.log('✨ No issues found!\n');
    } else {
        process.exit(1);
    }
}
