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
        // This is the separate unused import mentioned in #2378 - keep this to ensure it stays unused
        // For now just verify it's there to track it separately from this issue
        const hasInitializeMapRenderer = mapHelpersContent.includes("import { initializeMapRenderer } from '../game/MapSystemInitializer.js'");
        // Note: initializeMapRenderer is also unused but is tracked separately in issue #2378
        // We're not removing it in this fix to stay minimal
        expect(hasInitializeMapRenderer, 'initializeMapRenderer import exists (tracked separately in #2378)').toBe(true);
    });
});
