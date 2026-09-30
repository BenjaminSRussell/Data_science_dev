import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Production Headers Configuration', () => {
    it('should have _headers file in public directory for production deployment', () => {
        const headersPath = path.resolve(process.cwd(), 'public', '_headers');
        expect(fs.existsSync(headersPath)).toBe(true);
    });

    it('should contain Cross-Origin-Opener-Policy header', () => {
        const headersPath = path.resolve(process.cwd(), 'public', '_headers');
        const content = fs.readFileSync(headersPath, 'utf-8');
        expect(content).toContain('Cross-Origin-Opener-Policy: same-origin');
    });

    it('should contain Cross-Origin-Embedder-Policy header', () => {
        const headersPath = path.resolve(process.cwd(), 'public', '_headers');
        const content = fs.readFileSync(headersPath, 'utf-8');
        expect(content).toContain('Cross-Origin-Embedder-Policy: require-corp');
    });

    it('should ensure public directory is copied to dist during build', () => {
        // This test verifies that the vite.config.js has publicDir: 'public'
        // so the _headers file will be included in the dist build
        const vitePath = path.resolve(process.cwd(), 'vite.config.js');
        const content = fs.readFileSync(vitePath, 'utf-8');
        expect(content).toContain("publicDir: 'public'");
    });

    it('should enable cross-origin isolation for SharedArrayBuffer/threaded WASM', () => {
        // Verify that the vite dev server also has the headers for local testing
        const vitePath = path.resolve(process.cwd(), 'vite.config.js');
        const content = fs.readFileSync(vitePath, 'utf-8');
        expect(content).toContain('Cross-Origin-Opener-Policy');
        expect(content).toContain('Cross-Origin-Embedder-Policy');
        expect(content).toContain('same-origin');
        expect(content).toContain('require-corp');
    });
});
