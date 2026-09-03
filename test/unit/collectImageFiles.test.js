/**
 * Unit tests for collectImageFiles (scripts/compress-assets-for-git.js)
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { collectImageFiles } from '../../scripts/compress-assets-for-git.js';

const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg'];

describe('collectImageFiles', () => {
    let tmpRoot;

    beforeAll(() => {
        tmpRoot = fs.mkdtempSync(path.join(os.tmpdir(), 'collect-image-files-'));
    });

    afterAll(() => {
        fs.rmSync(tmpRoot, { recursive: true, force: true });
    });

    it('finds image files in nested directories', () => {
        const root = path.join(tmpRoot, 'nested');
        fs.mkdirSync(path.join(root, 'a', 'b'), { recursive: true });
        fs.writeFileSync(path.join(root, 'top.png'), 'x');
        fs.writeFileSync(path.join(root, 'a', 'mid.jpg'), 'x');
        fs.writeFileSync(path.join(root, 'a', 'b', 'deep.jpeg'), 'x');

        const files = collectImageFiles(root, IMAGE_EXTENSIONS);

        expect(files.sort()).toEqual([
            path.join(root, 'a', 'b', 'deep.jpeg'),
            path.join(root, 'a', 'mid.jpg'),
            path.join(root, 'top.png')
        ]);
    });

    it('matches extensions case-insensitively (e.g. .PNG)', () => {
        const root = path.join(tmpRoot, 'case');
        fs.mkdirSync(root, { recursive: true });
        fs.writeFileSync(path.join(root, 'photo.PNG'), 'x');
        fs.writeFileSync(path.join(root, 'photo2.JpEg'), 'x');

        const files = collectImageFiles(root, IMAGE_EXTENSIONS);

        expect(files.sort()).toEqual([
            path.join(root, 'photo.PNG'),
            path.join(root, 'photo2.JpEg')
        ]);
    });

    it('excludes non-image files', () => {
        const root = path.join(tmpRoot, 'non-image');
        fs.mkdirSync(root, { recursive: true });
        fs.writeFileSync(path.join(root, 'notes.txt'), 'x');
        fs.writeFileSync(path.join(root, 'data.json'), 'x');
        fs.writeFileSync(path.join(root, 'image.gif'), 'x');
        fs.writeFileSync(path.join(root, 'real.png'), 'x');

        const files = collectImageFiles(root, IMAGE_EXTENSIONS);

        expect(files).toEqual([path.join(root, 'real.png')]);
    });

    it('handles a non-existent root directory gracefully', () => {
        const missing = path.join(tmpRoot, 'does-not-exist');

        expect(() => collectImageFiles(missing, IMAGE_EXTENSIONS)).not.toThrow();
        expect(collectImageFiles(missing, IMAGE_EXTENSIONS)).toEqual([]);
    });

    it('returns the provided output array and appends to it', () => {
        const root = path.join(tmpRoot, 'out-array');
        fs.mkdirSync(root, { recursive: true });
        fs.writeFileSync(path.join(root, 'one.png'), 'x');

        const out = ['pre-existing'];
        const result = collectImageFiles(root, IMAGE_EXTENSIONS, out);

        expect(result).toBe(out);
        expect(result).toEqual(['pre-existing', path.join(root, 'one.png')]);
    });
});
