#!/usr/bin/env node
/**
 * Check file sizes (#2322, #1882)
 * Lists tracked and untracked-but-not-ignored files (git ls-files, so
 * .gitignore is respected) and reports any at or above the size limit.
 *
 * Usage: npm run check-sizes [-- --limit-mb 50]
 * Exits 1 when a file is over the limit.
 */
import fs from 'node:fs';
import path from 'node:path';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';

export const DEFAULT_LIMIT_MB = 50;

export function parseLimitMb(argv) {
    const i = argv.indexOf('--limit-mb');
    const value = i >= 0 ? Number(argv[i + 1]) : DEFAULT_LIMIT_MB;
    return Number.isFinite(value) && value > 0 ? value : DEFAULT_LIMIT_MB;
}

export function listFiles(cwd) {
    const out = execFileSync('git', ['ls-files', '--cached', '--others', '--exclude-standard', '-z'], { cwd, encoding: 'utf8' });
    return out.split('\0').filter(Boolean);
}

/** Files at or above limitBytes, largest first */
export function findOversized(files, cwd, limitBytes) {
    const big = [];
    for (const rel of files) {
        let size;
        try {
            size = fs.statSync(path.join(cwd, rel)).size;
        } catch {
            continue; // deleted in the working tree
        }
        if (size >= limitBytes) big.push({ file: rel, size });
    }
    return big.sort((a, b) => b.size - a.size);
}

export function main(argv = process.argv.slice(2), cwd = process.cwd()) {
    const limitMb = parseLimitMb(argv);
    const files = listFiles(cwd);
    const big = findOversized(files, cwd, limitMb * 1024 * 1024);
    console.log(`Checked ${files.length} files against a ${limitMb}MB limit.`);
    if (big.length === 0) {
        console.log('No files over the limit.');
        return 0;
    }
    console.log(`${big.length} file(s) need attention:`);
    for (const { file, size } of big) {
        console.log(`  ${(size / 1024 / 1024).toFixed(1)}MB  ${file}`);
    }
    return 1;
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
    process.exitCode = main();
}
