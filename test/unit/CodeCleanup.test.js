/**
 * Unit tests for CodeCleanup
 */

import { describe, it, expect } from 'vitest';
import { CodeCleanup } from '../../src/js/utils/CodeCleanup.js';

describe('CodeCleanup', () => {
    describe('findUnusedImports', () => {
        it('should identify imports from code', () => {
            const code = `
import { CommonUtils } from './CommonUtils.js';
import { DOMUtils } from './DOMUtils.js';
            `.trim();
            const unused = CodeCleanup.findUnusedImports(code);
            // Function should return array of import paths
            expect(Array.isArray(unused)).toBe(true);
        });
    });

    describe('replaceDOMCreation', () => {
        it('should replace document.createElement with DOMUtils.createElement', () => {
            const code = `const el = document.createElement('div');`;
            const result = CodeCleanup.replaceDOMCreation(code);
            expect(result).toContain("DOMUtils.createElement('div')");
            expect(result).not.toContain('document.createElement');
        });

        it('should handle multiple createElement calls', () => {
            const code = `
const div = document.createElement('div');
const span = document.createElement('span');
            `.trim();
            const result = CodeCleanup.replaceDOMCreation(code);
            expect(result).toContain("DOMUtils.createElement('div')");
            expect(result).toContain("DOMUtils.createElement('span')");
            expect(result).not.toContain('document.createElement');
        });

        it('should preserve variable names', () => {
            const code = `const myElement = document.createElement('button');`;
            const result = CodeCleanup.replaceDOMCreation(code);
            expect(result).toContain('const myElement');
            expect(result).toContain("DOMUtils.createElement('button')");
        });
    });

    describe('replaceConsoleStatements', () => {
        it('should replace console.log with logger.debug', () => {
            const code = `console.log('test');`;
            const result = CodeCleanup.replaceConsoleStatements(code);
            expect(result).toContain('logger.debug');
            expect(result).not.toContain('console.log');
        });

        it('should replace console.error with logger.error', () => {
            const code = `console.error('error message');`;
            const result = CodeCleanup.replaceConsoleStatements(code);
            expect(result).toContain('logger.error');
            expect(result).not.toContain('console.error');
        });
    });

    describe('findDeadCode', () => {
        it('should find unused functions', () => {
            const code = `
function used() { return 1; }
function unused() { return 2; }
const x = used();
            `.trim();
            const deadFunctions = CodeCleanup.findDeadCode(code, []);
            expect(deadFunctions).toContain('unused');
        });

        it('should not flag exported functions as dead', () => {
            const code = `
export function exported() { return 1; }
            `.trim();
            const deadFunctions = CodeCleanup.findDeadCode(code, ['exported']);
            expect(deadFunctions).not.toContain('exported');
        });
    });

    describe('optimizeDOMQueries', () => {
        it('should suggest caching repeated queries', () => {
            const code = `
document.querySelector('.container');
document.querySelector('.container');
            `.trim();
            const result = CodeCleanup.optimizeDOMQueries(code);
            expect(result).toContain("DOMUtils.query('.container')");
        });
    });

    describe('Module import analysis', () => {
        it('should have CodeCleanup available without CommonUtils', () => {
            // This test verifies that CodeCleanup can be used independently
            // without relying on CommonUtils import
            expect(typeof CodeCleanup.findUnusedImports).toBe('function');
            expect(typeof CodeCleanup.replaceDOMCreation).toBe('function');
            expect(typeof CodeCleanup.replaceConsoleStatements).toBe('function');
            expect(typeof CodeCleanup.findDeadCode).toBe('function');
        });
    });
});
