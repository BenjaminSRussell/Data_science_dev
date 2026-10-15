/**
 * MapHelpers Unit Tests
 * Verifies that MapHelpers.js has no unused imports
 */

import { describe, it, expect, beforeAll } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('MapHelpers', () => {
    let mapHelpersContent = '';

    beforeAll(() => {
        const mapHelpersPath = path.join(__dirname, '../../src/js/helpers/MapHelpers.js');
        mapHelpersContent = fs.readFileSync(mapHelpersPath, 'utf8');
    });

    it('should not have unused NPCs import', () => {
        // The NPCs import should not exist as it's never used in the file
        const hasUnusedNPCsImport = mapHelpersContent.includes("import { NPCs } from '../game/NPCManager.js'");
        expect(hasUnusedNPCsImport, 'NPCs import should not exist as it is never used').toBe(false);
    });

    it('should not have unused initializeMapRenderer import', () => {
        // #2378: nothing called this import, and it pulled the legacy DOM
        // MapRenderer into the module graph. UnifiedMapSystem is the live map.
        const hasInitializeMapRenderer = mapHelpersContent.includes("import { initializeMapRenderer } from '../game/MapSystemInitializer.js'");
        expect(hasInitializeMapRenderer, 'initializeMapRenderer import should not exist').toBe(false);
    });

    it('should not keep unreachable legacy DOM painters (#2378)', () => {
        expect(mapHelpersContent).not.toMatch(/function renderMapEnvironment\b/);
        expect(mapHelpersContent).not.toMatch(/function renderNPCHouses\b/);
    });
});
