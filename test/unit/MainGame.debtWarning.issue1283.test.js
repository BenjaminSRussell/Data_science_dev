/**
 * The weekly toast said "Eviction imminent" for a balance below -$1,000, but
 * the game never applies an eviction or any other debt consequence (#1283).
 * The copy now states the debt and promises nothing that is not implemented.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const srcDir = path.resolve(__dirname, '../../src/js');
const main = fs.readFileSync(path.join(srcDir, 'main.js'), 'utf8');

function listJsFiles(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap(entry => {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) return listJsFiles(full);
        return entry.name.endsWith('.js') ? [full] : [];
    });
}

describe('weekly debt warning copy (#1283)', () => {
    it('warns about the debt instead of promising an eviction', () => {
        expect(main).toContain("this.showToast('Debt warning: your balance is below -$1,000. Earn money fast!', 'error');");
        expect(main).not.toMatch(/Eviction imminent/i);
    });

    it('no source file mentions an eviction the game never applies', () => {
        const hits = listJsFiles(srcDir).filter(file => /evict/i.test(fs.readFileSync(file, 'utf8')));
        expect(hits).toEqual([]);
    });
});
