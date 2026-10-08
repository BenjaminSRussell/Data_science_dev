import { describe, it, expect } from 'vitest';
import { readFileSync } from 'node:fs';

const pkg = JSON.parse(readFileSync('package.json', 'utf8'));
const vite = readFileSync('vite.config.js', 'utf8');

describe('unused dependencies and optimizeDeps (#1872, #2341, #1884)', () => {
    it('drops howler, react and react-dom', () => {
        const all = { ...pkg.dependencies, ...pkg.devDependencies };
        for (const dep of ['howler', 'react', 'react-dom']) expect(all).not.toHaveProperty(dep);
    });
    it('optimizeDeps no longer force-bundles react or excludes a fake wasm package', () => {
        expect(vite).not.toMatch(/'react'|'react-dom'/);
        expect(vite).not.toMatch(/exclude:\s*\['wasm'\]/);
    });
    it('the store uses the React-free vanilla entry', () => {
        expect(readFileSync('src/js/store/gameStore.js', 'utf8')).toMatch(/from 'zustand\/vanilla'/);
    });
});
