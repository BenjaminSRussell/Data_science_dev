/**
 * SpriteDownloader was an unused download-instruction catalog (#2293).
 * Guard against the module coming back with no caller, same idea as AssetFinder (#2288).
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('SpriteDownloader removal (issue #2293)', () => {
    it('should be removed from codebase - it had no caller', () => {
        const filePath = path.join(__dirname, '../../src/js/assets/SpriteDownloader.js');
        expect(fs.existsSync(filePath)).toBe(false);
    });

    it('should not be imported anywhere in main.js', () => {
        const mainJsContent = fs.readFileSync(path.join(__dirname, '../../src/js/main.js'), 'utf8');
        expect(mainJsContent).not.toMatch(/import.*SpriteDownloader|from.*SpriteDownloader/i);
        expect(mainJsContent).not.toMatch(/new SpriteDownloader/);
    });
});
