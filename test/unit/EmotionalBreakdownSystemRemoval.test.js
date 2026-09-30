/**
 * Test to verify that EmotionalBreakdownSystem dead code has been removed
 * Issue #1830: Diagnostic dump — emotional-breakdown.css is 301 lines of orphaned CSS
 *
 * This test verifies that:
 * 1. The emotionalBreakdownSystem is not instantiated in main game initialization
 * 2. The unreachable CSS file is not linked in index.html
 */

import { describe, it, expect } from 'vitest';
import { readFileSync } from 'fs';
import { resolve } from 'path';

describe('EmotionalBreakdownSystem Removal - Issue #1830', () => {
    describe('Dead Code Cleanup', () => {
        it('should not link emotional-breakdown.css in index.html', () => {
            // Read index.html and verify emotional-breakdown.css is not linked
            const indexHtmlPath = resolve(process.cwd(), 'index.html');
            const content = readFileSync(indexHtmlPath, 'utf-8');

            // The CSS link should have been removed
            expect(content).not.toMatch(/emotional-breakdown\.css/);
        });

        it('should not import EmotionalBreakdownSystem in main.js', () => {
            // Read main.js and verify the import is removed
            const mainJsPath = resolve(process.cwd(), 'src/js/main.js');
            const content = readFileSync(mainJsPath, 'utf-8');

            // The import should have been removed
            expect(content).not.toMatch(/import.*EmotionalBreakdownSystem/);
        });

        it('should not instantiate emotionalBreakdownSystem in main.js', () => {
            // Read main.js and verify instantiation is removed
            const mainJsPath = resolve(process.cwd(), 'src/js/main.js');
            const content = readFileSync(mainJsPath, 'utf-8');

            // The instantiation should have been removed
            expect(content).not.toMatch(/new EmotionalBreakdownSystem/);
        });

        it('should not serialize emotionalBreakdownSystem in GameState', () => {
            // Read GameState.js and verify serialization code is removed
            const gameStatePath = resolve(process.cwd(), 'src/js/game/GameState.js');
            const content = readFileSync(gameStatePath, 'utf-8');

            // The serialization should have been removed
            expect(content).not.toMatch(/emotionalBreakdownSystem:.*activeBreakdowns/);
        });

        it('should not deserialize emotionalBreakdownSystem in GameState', () => {
            // Read GameState.js and verify deserialization code is removed
            const gameStatePath = resolve(process.cwd(), 'src/js/game/GameState.js');
            const content = readFileSync(gameStatePath, 'utf-8');

            // The deserialization should have been removed
            expect(content).not.toMatch(/this\.emotionalBreakdownSystem && data\.emotionalBreakdownSystem/);
        });
    });
});
