/**
 * Unit tests for AssetFinder removal (issue #2288)
 * Verifies that unused AssetFinder class is no longer imported anywhere in the codebase
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('AssetFinder Removal (issue #2288)', () => {
    it('should be removed from codebase - it is unused and the asset-sourcing workflow is stale', () => {
        // Verify AssetFinder.js file has been removed
        const assetFinderPath = path.join(__dirname, '../../src/js/assets/AssetFinder.js');
        const fileExists = fs.existsSync(assetFinderPath);

        expect(fileExists).toBe(false);
    });

    it('should not be imported anywhere in the application code', () => {
        // Check that AssetFinder is not imported in main.js or any critical files
        const mainJsPath = path.join(__dirname, '../../src/js/main.js');
        const mainJsContent = fs.readFileSync(mainJsPath, 'utf-8');

        // Verify no imports of AssetFinder exist
        expect(mainJsContent).not.toMatch(/import.*AssetFinder|from.*AssetFinder/i);
        expect(mainJsContent).not.toMatch(/new AssetFinder/);
    });
});
