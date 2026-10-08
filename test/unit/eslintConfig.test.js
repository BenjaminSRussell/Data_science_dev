/**
 * The lint toolchain is wired: flat config, matching ESLint, a lint script (#2345, #1883)
 */
import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';
import config from '../../eslint.config.js';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));

describe('eslint setup', () => {
    it('has a lint script and a flat-config-capable ESLint', () => {
        expect(pkg.scripts.lint).toMatch(/^eslint /);
        const major = Number(String(pkg.devDependencies.eslint).replace(/[^\d.]/g, '').split('.')[0]);
        expect(major).toBeGreaterThanOrEqual(9);
        expect(pkg.devDependencies['@eslint/js']).toBeTruthy();
        expect(pkg.devDependencies.globals).toBeTruthy();
    });

    it('extends the recommended rules with browser globals for game code', () => {
        expect(Array.isArray(config)).toBe(true);
        expect(config.some(entry => entry.rules && 'no-undef' in entry.rules && entry.files?.includes('src/**/*.js'))).toBe(true);
        const src = config.find(entry => entry.files?.includes('src/**/*.js'));
        expect(src.languageOptions.globals.window).toBeDefined();
        expect(config.some(entry => entry.rules?.['no-unused-vars'] && !entry.files)).toBe(true);
    });
});
