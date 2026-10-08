// @vitest-environment node
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { execFileSync } from 'child_process';
import { isEmptyCatch } from '../../scripts/static-bug-check.js';
import { formatSavings } from '../../scripts/compress-assets-for-git.js';
import { buildAnchorMap, slugifyPath } from '../../scripts/inventory-anchors.js';

const root = path.resolve(__dirname, '../..');

describe('static-bug-check empty catch detection (#88)', () => {
    it('flags real empty catch blocks', () => {
        expect(isEmptyCatch('    } catch (e) {', '    }')).toBe(true);
        expect(isEmptyCatch('} catch {', '}')).toBe(true);
        expect(isEmptyCatch('try { x(); } catch (err) {}', '')).toBe(true);
    });

    it('ignores comments, strings and non-empty blocks', () => {
        expect(isEmptyCatch('    // we catch this upstream', '    }')).toBe(false);
        expect(isEmptyCatch(' * catch-all handler', '}')).toBe(false);
        expect(isEmptyCatch("    log('catch me');", '}')).toBe(false);
        expect(isEmptyCatch('} catch (e) {', '    console.warn(e);')).toBe(false);
    });
});

describe('compress-assets summary (#549)', () => {
    it('never prints NaN%', () => {
        expect(formatSavings(0, 0)).toBe('0.0%');
        expect(formatSavings(undefined, 5)).toBe('0.0%');
        expect(formatSavings(1000, 250)).toBe('75.0%');
    });
});

describe('file inventory anchors (#2321, #551)', () => {
    it('gives colliding paths distinct anchors', () => {
        const map = buildAnchorMap(['a-b.js', 'a_b.js', 'a.b.js', 'a-b-js-1']);
        const ids = [...map.values()];
        expect(new Set(ids).size).toBe(ids.length);
        expect(map.get('a-b.js')).toBe(slugifyPath('a-b.js'));
    });

    it('generated markdown uses <a id> anchors (no {#id}) and every link resolves', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'inv-'));
        fs.writeFileSync(path.join(dir, 'a-b.js'), '1');
        fs.writeFileSync(path.join(dir, 'a_b.js'), '2');
        const out = path.join(dir, 'INV.md');
        execFileSync('node', [path.join(root, 'scripts/generate-file-inventory.js'), dir, out], { stdio: 'pipe' });
        const md = fs.readFileSync(out, 'utf8');
        expect(md).not.toMatch(/\{#[^}]+\}/);
        const ids = new Set([...md.matchAll(/<a id="([^"]+)"><\/a>/g)].map(m => m[1]));
        const links = [...md.matchAll(/\]\(#([^)]+)\)/g)].map(m => m[1])
            .filter(l => !['files-by-extension', 'all-files', 'folders'].includes(l));
        expect(links.length).toBe(2);
        expect(links.every(l => ids.has(l))).toBe(true);
        expect(new Set(links).size).toBe(2);
        fs.rmSync(dir, { recursive: true, force: true });
    });
});

describe('unzip_characters (#1902, #86)', () => {
    it('only the working CommonJS script remains, with the source-dir check', () => {
        expect(fs.existsSync(path.join(root, 'scripts/unzip_characters.js'))).toBe(false);
        const cjs = fs.readFileSync(path.join(root, 'scripts/unzip_characters.cjs'), 'utf8');
        expect(cjs).toMatch(/existsSync\(srcDir\)/);
    });
});
