// @vitest-environment node
/**
 * scripts/ asset tooling:
 * check_assets.cjs file walker (#552), reference extraction (#553), lookup
 * against public/ + exit code + prefix skipping (#1900);
 * compress-assets-for-git.js compressImage branches (#554) and tracked
 * directories (#1899); generate-file-inventory.js scanDirectory (#555)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { createRequire } from 'module';

const sharpState = vi.hoisted(() => ({ calls: [], size: 0, error: null }));
vi.mock('sharp', () => ({
    default: vi.fn((input) => {
        const chain = {
            png: vi.fn((opts) => { sharpState.calls.push(['png', input, opts]); return chain; }),
            jpeg: vi.fn((opts) => { sharpState.calls.push(['jpeg', input, opts]); return chain; }),
            toBuffer: vi.fn(async () => {
                if (sharpState.error) throw sharpState.error;
                return typeof sharpState.size === 'number' ? Buffer.alloc(sharpState.size, 7) : sharpState.size;
            })
        };
        sharpState.calls.push(['sharp', input]);
        return chain;
    })
}));

import { compressImage, assetDirectories, MAX_FILE_SIZE, MIN_COMPRESS_SIZE } from '../../scripts/compress-assets-for-git.js';
import { scanDirectory, isExcludedEntry } from '../../scripts/generate-file-inventory.js';

const require = createRequire(import.meta.url);
const checkAssets = require('../../scripts/check_assets.cjs');

let tmp;
beforeEach(() => {
    tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'asset-scripts-'));
    sharpState.calls = [];
    sharpState.size = 0;
    sharpState.error = null;
});
afterEach(() => fs.rmSync(tmp, { recursive: true, force: true }));

function write(rel, content = 'x') {
    const file = path.join(tmp, rel);
    fs.mkdirSync(path.dirname(file), { recursive: true });
    fs.writeFileSync(file, content);
    return file;
}

describe('check_assets getAllFiles (#552)', () => {
    it('collects nested files with matching extensions only', () => {
        write('a.js'); write('sub/b.css'); write('sub/deeper/c.json'); write('sub/d.png'); write('e.txt');
        const rel = checkAssets.getAllFiles(tmp, ['.js', '.json', '.css']).map(f => path.relative(tmp, f)).sort();
        expect(rel).toEqual(['a.js', path.join('sub', 'b.css'), path.join('sub', 'deeper', 'c.json')]);
    });

    it('returns [] for an empty directory', () => {
        expect(checkAssets.getAllFiles(tmp, ['.js'])).toEqual([]);
    });

    it('matches each extension in the list', () => {
        write('x.png'); write('y.jpg'); write('z.gif');
        expect(checkAssets.getAllFiles(tmp, ['.png', '.jpg']).map(f => path.basename(f)).sort()).toEqual(['x.png', 'y.jpg']);
    });
});

describe('check_assets extractAssetReferences (#553, #1900)', () => {
    const extract = checkAssets.extractAssetReferences;

    it('matches double- and single-quoted paths, strips the leading slash and dedupes', () => {
        const src = `const a = "assets/foo.png"; const b = '/assets/foo.png'; const c = '/assets/bar.mp3';`;
        expect(extract(src)).toEqual(['assets/foo.png', 'assets/bar.mp3']);
    });

    it('matches downloaded_assets references', () => {
        expect(extract(`img.src = '/downloaded_assets/icons/items/key.png'`)).toEqual(['downloaded_assets/icons/items/key.png']);
    });

    it('ignores unquoted mentions and other quoted strings', () => {
        expect(extract('// see assets/foo.png and myassets/bar.png\nconst x = "notassets/a.png";')).toEqual([]);
    });

    it('returns [] for content with no references', () => {
        expect(extract('')).toEqual([]);
        expect(extract('export const x = 1;')).toEqual([]);
    });

    it('skips base-path prefixes like NPC_IMAGE_BASE', () => {
        expect(extract(`const NPC_IMAGE_BASE = '/assets/npcs/'; const f = '/assets/npcs/a.png';`)).toEqual(['assets/npcs/a.png']);
        expect(checkAssets.isPathPrefix('assets/npcs/')).toBe(true);
        expect(checkAssets.isPathPrefix('assets/npcs/a.png')).toBe(false);
    });

    it('is stateless across calls (no shared lastIndex)', () => {
        const src = `'assets/a.png'`;
        expect(extract(src)).toEqual(['assets/a.png']);
        expect(extract(src)).toEqual(['assets/a.png']);
    });
});

describe('check_assets lookup + exit code (#1900)', () => {
    it('finds assets in public/, the repo root and src/, including %-encoded names', () => {
        write('public/assets/npcs/a.png');
        write('assets/icons/b.png');
        write('src/assets/c.png');
        write('public/assets/with space.png');
        expect(checkAssets.assetExists(tmp, 'assets/npcs/a.png')).toBe(true);
        expect(checkAssets.assetExists(tmp, 'assets/icons/b.png')).toBe(true);
        expect(checkAssets.assetExists(tmp, 'assets/c.png')).toBe(true);
        expect(checkAssets.assetExists(tmp, 'assets/with%20space.png')).toBe(true);
        expect(checkAssets.assetExists(tmp, 'assets/nope.png')).toBe(false);
        expect(checkAssets.assetExists(tmp, 'assets/bad%E0%A4%A.png')).toBe(false); // malformed escape doesn't throw
    });

    it('checks public/ first', () => {
        expect(checkAssets.candidatePaths(tmp, 'assets/x.png')[0]).toBe(path.join(tmp, 'public', 'assets', 'x.png'));
    });

    it('reports missing references and exits 1, exits 0 when all resolve', () => {
        write('public/assets/ok.png');
        write('src/js/a.js', `const ok = '/assets/ok.png'; const base = '/assets/npcs/';`);
        const log = vi.spyOn(console, 'log').mockImplementation(() => {});
        expect(checkAssets.checkAssets(tmp)).toEqual({ scanned: 1, references: ['assets/ok.png'], missing: [] });
        expect(checkAssets.main(tmp)).toBe(0);

        write('src/js/b.js', `const gone = "/assets/missing.png";`);
        expect(checkAssets.checkAssets(tmp).missing).toEqual(['assets/missing.png']);
        expect(checkAssets.main(tmp)).toBe(1);
        expect(log.mock.calls.flat()).toContain('[MISSING] assets/missing.png');
        log.mockRestore();
    });

    it('exits 1 when there is no src/ directory', () => {
        const err = vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(checkAssets.main(tmp)).toBe(1);
        err.mockRestore();
    });
});

describe('compressImage branches (#554)', () => {
    const big = (rel, size = MIN_COMPRESS_SIZE + 1000) => write(rel, Buffer.alloc(size, 1));

    it('skips files under the minimum size without calling sharp', async () => {
        const file = big('small.png', MIN_COMPRESS_SIZE - 1);
        expect(await compressImage(file)).toEqual({ skipped: true, reason: 'already small' });
        expect(sharpState.calls).toEqual([]);
    });

    it('compresses PNGs via sharp().png() and overwrites when smaller', async () => {
        const file = big('a.png', 200 * 1024);
        sharpState.size = 50 * 1024;
        const result = await compressImage(file);
        expect(result).toEqual({ success: true, original: '0.20MB', compressed: '0.05MB', savings: '75.0%' });
        expect(sharpState.calls.map(c => c[0])).toEqual(['sharp', 'png']);
        expect(fs.statSync(file).size).toBe(50 * 1024);
    });

    it.each(['.jpg', '.jpeg', '.JPG'])('compresses %s via sharp().jpeg()', async (ext) => {
        const file = big(`a${ext}`);
        sharpState.size = 1000;
        const result = await compressImage(file);
        expect(result.success).toBe(true);
        expect(sharpState.calls.map(c => c[0])).toEqual(['sharp', 'jpeg']);
        expect(sharpState.calls[1][2]).toMatchObject({ mozjpeg: true });
    });

    it('skips unsupported formats', async () => {
        const file = big('a.gif');
        expect(await compressImage(file)).toEqual({ skipped: true, reason: 'unsupported format' });
        expect(sharpState.calls).toEqual([]);
    });

    it('reports an error and leaves the file alone when output would exceed the limit', async () => {
        const file = big('huge.png');
        const before = fs.readFileSync(file);
        sharpState.size = { length: MAX_FILE_SIZE + 1 };
        const result = await compressImage(file);
        expect(result.error).toBe(true);
        expect(result.message).toMatch(/exceeds 50MB limit/);
        expect(fs.readFileSync(file).equals(before)).toBe(true);
    });

    it('does not write when compression did not shrink the file', async () => {
        const size = MIN_COMPRESS_SIZE + 1000;
        const file = big('same.png', size);
        sharpState.size = size;
        expect(await compressImage(file)).toEqual({ skipped: true, reason: 'compression did not reduce size' });
        expect(fs.readFileSync(file).every(b => b === 1)).toBe(true);
    });

    it('writes to a separate outputPath when given', async () => {
        const file = big('in.png', 300 * 1024);
        const out = path.join(tmp, 'out.png');
        sharpState.size = 10;
        await compressImage(file, out);
        expect(fs.statSync(out).size).toBe(10);
        expect(fs.statSync(file).size).toBe(300 * 1024);
    });

    it('catches sharp errors (corrupt image) and returns them', async () => {
        const file = big('corrupt.png');
        sharpState.error = new Error('Input buffer contains unsupported image format');
        expect(await compressImage(file)).toEqual({ error: true, message: 'Input buffer contains unsupported image format' });
    });

    it('returns an error for a missing file instead of throwing', async () => {
        const result = await compressImage(path.join(tmp, 'missing.png'));
        expect(result.error).toBe(true);
    });
});

describe('compress-assets directories (#1899)', () => {
    it('includes the tracked downloaded_assets tree', () => {
        expect(assetDirectories('/repo')).toEqual([
            path.join('/repo', 'assets'),
            path.join('/repo', 'public', 'assets'),
            path.join('/repo', 'downloaded_assets')
        ]);
    });
});

describe('generate-file-inventory scanDirectory (#555)', () => {
    it('recurses, separates files and folders, and uses paths relative to the start', () => {
        write('a.js', 'one\ntwo\n');
        write('lib/b.js');
        write('lib/deep/c.css');
        write('.gitignore');
        const { files, folders } = scanDirectory(tmp, '', undefined, { includeLines: true });
        expect(files.map(f => f.path).sort()).toEqual(['.gitignore', 'a.js', path.join('lib', 'b.js'), path.join('lib', 'deep', 'c.css')]);
        expect(folders.map(f => f.path).sort()).toEqual(['lib', path.join('lib', 'deep')]);
        const a = files.find(f => f.path === 'a.js');
        expect(a).toMatchObject({ name: 'a.js', extension: '.js', size: 8, fullPath: path.join(tmp, 'a.js') });
        expect(a.lines).toBeGreaterThan(0);
    });

    it('skips node_modules, dist, .git, test-reports and dotfiles except .gitignore', () => {
        for (const dir of ['node_modules', 'dist', '.git', 'test-reports', '.cache']) write(`${dir}/x.js`);
        write('.env'); write('.gitignore'); write('src/keep.js'); write('src/node_modules/y.js');
        const { files, folders } = scanDirectory(tmp);
        expect(files.map(f => f.path).sort()).toEqual(['.gitignore', path.join('src', 'keep.js')]);
        expect(folders.map(f => f.path)).toEqual(['src']);
    });

    it('isExcludedEntry rules', () => {
        expect(['node_modules', 'dist', '.git', 'test-reports', '.DS_Store'].every(isExcludedEntry)).toBe(true);
        expect(['.gitignore', 'src', 'distance.js'].some(isExcludedEntry)).toBe(false);
    });

    it('line counts are skipped unless requested, and results accumulate into a passed object', () => {
        write('a.js', 'x\ny\n');
        const acc = { files: [], folders: [] };
        expect(scanDirectory(tmp, 'base', acc)).toBe(acc);
        expect(acc.files[0]).toMatchObject({ path: path.join('base', 'a.js'), lines: null });
    });
});
