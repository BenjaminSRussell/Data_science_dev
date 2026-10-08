// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../..');
const readme = fs.readFileSync(path.join(root, 'README.md'), 'utf8');

describe('build config (#2343, #1875)', () => {
    it('production build emits no source maps unless SOURCEMAP=true', async () => {
        const prev = process.env.SOURCEMAP;
        delete process.env.SOURCEMAP;
        const { default: config } = await import('../../vite.config.js?nomaps');
        expect(config.build.sourcemap).toBe(false);
        process.env.SOURCEMAP = 'true';
        const { default: withMaps } = await import('../../vite.config.js?maps');
        expect(withMaps.build.sourcemap).toBe(true);
        if (prev === undefined) delete process.env.SOURCEMAP; else process.env.SOURCEMAP = prev;
    });
});

describe('README matches the repo (#2342, #1874, #1962)', () => {
    it('Quick Start port is the dev server port', async () => {
        const { default: config } = await import('../../vite.config.js');
        const ports = [...readme.matchAll(/localhost:(\d+)|127\.0\.0\.1:(\d+)/g)].map(m => Number(m[1] || m[2]));
        expect(ports.length).toBeGreaterThan(0);
        expect(new Set(ports)).toEqual(new Set([config.server.port]));
    });

    it('every local .md file the README points to exists', () => {
        const refs = [...readme.matchAll(/`([\w./-]+\.md)`|\]\(((?!https?:)[^)#]+\.md)\)/g)].map(m => m[1] || m[2]);
        const missing = refs.filter(r => !fs.existsSync(path.join(root, r)));
        expect(missing).toEqual([]);
    });
});
