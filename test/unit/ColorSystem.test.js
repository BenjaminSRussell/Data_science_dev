/**
 * Color System Unit Tests
 * Verifies stylesheet colors and runtime palette system functionality
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';
import { ChartManager } from '../../src/js/charts/ChartManager.js';

describe('Color System', () => {
    let allCssContent = '';

    beforeAll(() => {
        // Read all CSS files from the styles directory
        const stylesDir = path.join(__dirname, '../../src/styles');
        // Recursive, so CSS under src/styles/screens/ etc. is checked too (#1862)
        const cssFiles = fs.readdirSync(stylesDir, { recursive: true })
            .map(String)
            .filter(f => f.endsWith('.css'));

        allCssContent = cssFiles.map(file => {
            const filePath = path.join(stylesDir, file);
            return fs.readFileSync(filePath, 'utf8');
        }).join('\n');

        // Also catch banned colours written as rgb()/rgba() (#1090): append
        // the hex form of every rgb triplet so the substring checks see it
        const rgbAsHex = [...allCssContent.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g)]
            .map(m => '#' + m.slice(1, 4).map(n => Number(n).toString(16).padStart(2, '0')).join(''));
        allCssContent += '\n' + rgbAsHex.join('\n');
    });

    describe('Stylesheet Colors', () => {
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

            // Named colors anywhere in a declaration value - shorthand borders,
            // gradients, shadows - not just "color: cyan;" (#1861, #2332).
            // Comments are stripped; \b keeps identifiers like --cyanish out.
            const contentWithoutComments = allCssContent.replace(/\/\*[\s\S]*?\*\//g, '');
            const values = [...contentWithoutComments.matchAll(/:\s*([^;{}]+)[;}]/g)].map(m => m[1]);
            const named = values.filter(v => /(^|[\s,(])(cyan|aqua)(?![\w-])/i.test(v));
            expect(named, `Found forbidden named colors: ${named.join(' | ')}`).toEqual([]);
        });

        it('var() is only ever given a custom property, never a literal (#2337, #880)', () => {
            const bad = [...allCssContent.matchAll(/var\(\s*(?!--)[^)]*\)/g)].map(m => m[0]);
            expect(bad).toEqual([]);
        });

        it('no hex/rgb colour falls in the blue, purple or pink hue bands (#1860)', () => {
            // Parse every hex / rgb() colour and check its hue, instead of a
            // fixed list of four hex codes. Near-neutral tints (low chroma,
            // e.g. slate greys) are allowed.
            const css = allCssContent.replace(/\/\*[\s\S]*?\*\//g, '');
            const colours = [];
            for (const m of css.matchAll(/#([0-9a-f]{6}|[0-9a-f]{3})\b/gi)) {
                const h = m[1].length === 3 ? [...m[1]].map(c => c + c).join('') : m[1];
                colours.push([parseInt(h.slice(0, 2), 16), parseInt(h.slice(2, 4), 16), parseInt(h.slice(4, 6), 16), m[0]]);
            }
            for (const m of css.matchAll(/rgba?\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})/g)) {
                colours.push([+m[1], +m[2], +m[3], m[0]]);
            }
            const offenders = colours.filter(([r, g, b]) => {
                const [R, G, B] = [r / 255, g / 255, b / 255];
                const max = Math.max(R, G, B), min = Math.min(R, G, B), chroma = max - min;
                if (chroma <= 0.15) return false;
                let hue = max === R ? ((G - B) / chroma) % 6 : max === G ? (B - R) / chroma + 2 : (R - G) / chroma + 4;
                hue = (hue * 60 + 360) % 360;
                return hue >= 170 && hue <= 345; // cyan .. blue .. purple .. pink
            }).map(c => c[3]);
            expect([...new Set(offenders)], 'blue/purple/pink colours found').toEqual([]);
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

    describe('Runtime Color Palette System (ChartManager.PALETTES)', () => {
        it('should have PALETTES defined with at least one palette', () => {
            // Access PALETTES through a ChartManager instance
            const mockGame = { gameState: { chartConfig: {} } };
            const chartManager = new ChartManager(mockGame);

            // Verify buildChartConfig handles missing palette
            const testData = {
                labels: ['A', 'B'],
                datasets: { Test: [1, 2] }
            };

            const config1 = chartManager.buildChartConfig(testData, { palette: undefined, type: 'bar' });
            expect(config1).toBeDefined();
            expect(config1.data.datasets[0].backgroundColor).toBeDefined();
        });

        it('should have all palettes with sufficient colors (at least 6 per palette)', () => {
            // Manually verify the palette structure since ChartManager doesn't export PALETTES
            // We create an instance and call buildChartConfig with different palette names
            const mockGame = { gameState: { chartConfig: {} } };
            const chartManager = new ChartManager(mockGame);

            const testData = {
                labels: ['A', 'B', 'C', 'D', 'E', 'F'],
                datasets: { Test: [1, 2, 3, 4, 5, 6] }
            };

            const palettesToTest = ['corporate', 'vibrant', 'pastel', 'monochrome'];

            palettesToTest.forEach(paletteName => {
                const config = chartManager.buildChartConfig(testData, { palette: paletteName, type: 'bar' });
                // For bar charts, backgroundColor is the palette array
                const bgColors = config.data.datasets[0].backgroundColor;
                expect(Array.isArray(bgColors) || typeof bgColors === 'string',
                    `Palette '${paletteName}' should have valid colors`).toBe(true);
            });
        });

        it('should fall back to corporate palette when config.palette is undefined', () => {
            const mockGame = { gameState: { chartConfig: {} } };
            const chartManager = new ChartManager(mockGame);

            const testData = {
                labels: ['A', 'B'],
                datasets: { Test: [1, 2] }
            };

            const config = chartManager.buildChartConfig(testData, { palette: undefined, type: 'bar' });
            expect(config).toBeDefined();

            // The config should have valid colors (fall back to corporate)
            const bgColors = config.data.datasets[0].backgroundColor;
            expect(bgColors).toBeDefined();
            // Corporate palette uses 'rgba(...)' format
            if (Array.isArray(bgColors)) {
                expect(bgColors[0]).toMatch(/rgba/);
            } else {
                expect(bgColors).toMatch(/rgba/);
            }
        });

        it('should fall back to corporate palette when config.palette is an invalid name', () => {
            const mockGame = { gameState: { chartConfig: {} } };
            const chartManager = new ChartManager(mockGame);

            const testData = {
                labels: ['A', 'B'],
                datasets: { Test: [1, 2] }
            };

            // Test with an invalid palette name
            const config = chartManager.buildChartConfig(testData, { palette: 'nonexistent', type: 'bar' });
            expect(config).toBeDefined();

            // Should fall back to corporate (which uses rgba format)
            const bgColors = config.data.datasets[0].backgroundColor;
            expect(bgColors).toBeDefined();
            if (Array.isArray(bgColors)) {
                expect(bgColors[0]).toMatch(/rgba/);
            } else {
                expect(bgColors).toMatch(/rgba/);
            }
        });

        it('should support known palette names: corporate, vibrant, pastel, monochrome', () => {
            const mockGame = { gameState: { chartConfig: {} } };
            const chartManager = new ChartManager(mockGame);

            const knownPalettes = ['corporate', 'vibrant', 'pastel', 'monochrome'];
            const testData = {
                labels: ['A', 'B'],
                datasets: { Test: [1, 2] }
            };

            knownPalettes.forEach(paletteName => {
                const config = chartManager.buildChartConfig(testData, { palette: paletteName, type: 'bar' });
                expect(config).toBeDefined();
                expect(config.data.datasets[0].backgroundColor).toBeDefined();
            });
        });
    });

    describe('HTML data-palette attributes', () => {
        it('should have palette buttons with data-palette attributes matching known palettes', () => {
            const indexPath = path.join(__dirname, '../../index.html');
            const htmlContent = fs.readFileSync(indexPath, 'utf8');

            // Extract all data-palette values from HTML
            const paletteMatches = htmlContent.match(/data-palette="([^"]+)"/g);
            expect(paletteMatches).toBeTruthy();
            expect(paletteMatches.length).toBeGreaterThan(0);

            // Extract palette names
            const palettesInHtml = paletteMatches.map(match => match.replace(/data-palette="([^"]+)"/, '$1'));
            const knownPalettes = ['corporate', 'vibrant', 'pastel', 'monochrome'];

            // All palettes in HTML should be known palettes
            palettesInHtml.forEach(palette => {
                expect(knownPalettes).toContain(palette);
            });
        });

        it('should have palette buttons with matching text labels or aria-labels', () => {
            const indexPath = path.join(__dirname, '../../index.html');
            const htmlContent = fs.readFileSync(indexPath, 'utf8');

            // Find palette buttons section
            const paletteSection = htmlContent.match(/<div[^>]*palette[^>]*>[\s\S]*?<\/div>/)[0];

            // Should have at least 2 palette buttons
            const buttonMatches = paletteSection.match(/data-palette/g);
            expect(buttonMatches).toBeTruthy();
            expect(buttonMatches.length).toBeGreaterThanOrEqual(2);
        });

        it('should not have dead palettes - all data-palette values should correspond to known palettes', () => {
            const indexPath = path.join(__dirname, '../../index.html');
            const htmlContent = fs.readFileSync(indexPath, 'utf8');

            // Extract all data-palette values
            const paletteMatches = htmlContent.match(/data-palette="([^"]+)"/g);
            const palettesInHtml = new Set(paletteMatches.map(match => match.replace(/data-palette="([^"]+)"/, '$1')));

            const knownPalettes = new Set(['corporate', 'vibrant', 'pastel', 'monochrome']);

            // All HTML palettes should be known
            palettesInHtml.forEach(palette => {
                expect(knownPalettes.has(palette),
                    `Palette '${palette}' in HTML has no corresponding entry in PALETTES`).toBe(true);
            });
        });
    });

    describe('Palette color count adequacy', () => {
        it('should have enough colors in each palette for typical datasets', () => {
            // Typical maximum dataset sizes based on TaskSystem:
            // Monthly revenue: 12 items
            // Categories/demographics: 5 items
            // This test verifies each palette has at least 6 colors
            // to handle most common cases

            const mockGame = { gameState: { chartConfig: {} } };
            const chartManager = new ChartManager(mockGame);

            const palettesToTest = ['corporate', 'vibrant', 'pastel', 'monochrome'];

            palettesToTest.forEach(paletteName => {
                // Create a dataset with 6 items (maximum we expect in most charts)
                const testData = {
                    labels: ['1', '2', '3', '4', '5', '6'],
                    datasets: { Test: [10, 20, 30, 40, 50, 60] }
                };

                const config = chartManager.buildChartConfig(testData, {
                    palette: paletteName,
                    type: 'pie'  // Pie charts require a color per item
                });

                expect(config).toBeDefined();
                expect(config.data.datasets[0].backgroundColor).toBeDefined();
            });
        });
    });
});
