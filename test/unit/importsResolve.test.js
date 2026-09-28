// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src', 'js');

function listSourceFiles(dir) {
    const files = [];
    for (const entry of readdirSync(dir)) {
        const full = join(dir, entry);
        if (statSync(full).isDirectory()) {
            files.push(...listSourceFiles(full));
        } else if (entry.endsWith('.js')) {
            files.push(full);
        }
    }
    return files;
}

function stripComments(source) {
    return source
        .replace(/\/\*[\s\S]*?\*\//g, (block) => block.replace(/[^\n]/g, ' '))
        .replace(/^[ \t]*\/\/.*$/gm, '');
}

function resolves(fromFile, specifier) {
    const target = resolve(dirname(fromFile), specifier);
    return [target, `${target}.js`, join(target, 'index.js')]
        .some((candidate) => existsSync(candidate) && statSync(candidate).isFile());
}

function findUnresolvedImports() {
    const pattern = /(?:\bfrom\s*|\bimport\s*\(\s*|\bimport\s+)['"](\.{1,2}\/[^'"]+)['"]/g;
    const unresolved = [];
    for (const file of listSourceFiles(SRC)) {
        const lines = stripComments(readFileSync(file, 'utf8')).split('\n');
        lines.forEach((line, index) => {
            for (const match of line.matchAll(pattern)) {
                if (!resolves(file, match[1])) {
                    unresolved.push(`${relative(ROOT, file)}:${index + 1} -> ${match[1]}`);
                }
            }
        });
    }
    return unresolved;
}

describe('source imports', () => {
    it('every relative import in src/js points at a file that exists', () => {
        expect(findUnresolvedImports()).toEqual([]);
    });
});
