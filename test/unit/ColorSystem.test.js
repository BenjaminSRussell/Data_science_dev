/**
 * Color System Unit Tests
 * Verifies that no blue/aqua/purple colors exist in the stylesheet
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Color System', () => {
    let allCssContent = '';

    beforeAll(() => {
        // Read all CSS files from the styles directory
        const stylesDir = path.join(__dirname, '../../src/styles');
        const cssFiles = fs.readdirSync(stylesDir)
            .filter(f => f.endsWith('.css'));

        allCssContent = cssFiles.map(file => {
            const filePath = path.join(stylesDir, file);
            return fs.readFileSync(filePath, 'utf8');
        }).join('\n');
    });

    it('should not contain purple color values (#8b5cf6, #a78bfa, #7c3aed)', () => {
        const purpleColors = ['#8b5cf6', '#a78bfa', '#7c3aed', '#a855f7', '#6b21a8', '#4c1d95'];

        purpleColors.forEach(color => {
            const found = allCssContent.toLowerCase().includes(color.toLowerCase());
            expect(found, `Found forbidden purple color: ${color}`).toBe(false);
        });
    });

    it('should not contain blue/aqua color values (#06b6d4, #0ea5e9, cyan, aqua)', () => {
        const blueColors = ['#06b6d4', '#0ea5e9', '#0284c7', '#0369a1'];

        blueColors.forEach(color => {
            const found = allCssContent.toLowerCase().includes(color.toLowerCase());
            expect(found, `Found forbidden blue color: ${color}`).toBe(false);
        });

        // Check for named colors (excluding CSS comments)
        const contentWithoutComments = allCssContent.replace(/\/\*[\s\S]*?\*\//g, '');
        expect(contentWithoutComments).not.toMatch(/:\s*cyan\s*[;,}]/i);
        expect(contentWithoutComments).not.toMatch(/:\s*aqua\s*[;,}]/i);
    });

    it('should not contain pink color values (#f472b6, #ec4899)', () => {
        const pinkColors = ['#f472b6', '#ec4899', '#db2777'];

        pinkColors.forEach(color => {
            const found = allCssContent.toLowerCase().includes(color.toLowerCase());
            expect(found, `Found forbidden pink color: ${color}`).toBe(false);
        });
    });

    it('should use grey-scale color palette', () => {
        // Verify at least some grey colors are present (sanity check)
        const greyColors = ['#1a1a1a', '#2d2d2d', '#404040', '#555555', '#666666'];

        const hasGreyColors = greyColors.some(color =>
            allCssContent.toLowerCase().includes(color.toLowerCase())
        );

        expect(hasGreyColors, 'Expected grey color palette to be present').toBe(true);
    });
});
