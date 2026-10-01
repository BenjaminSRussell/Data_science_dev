/**
 * The CLI scripts must run when executed directly even from a path that
 * contains spaces (this repo lives under "Local Model hosting").
 * import.meta.url percent-encodes spaces, so comparing it with the raw
 * process.argv[1] silently skipped the CLI block.
 */
import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { execFileSync } from 'child_process';
import fs from 'fs';
import os from 'os';
import path from 'path';

const repoScripts = path.resolve(__dirname, '../../scripts');

describe('script entry-point guards with spaces in the path', () => {
    let root;

    beforeEach(() => {
        root = fs.mkdtempSync(path.join(os.tmpdir(), 'entry point test '));
        fs.mkdirSync(path.join(root, 'scripts'));
    });

    afterEach(() => {
        fs.rmSync(root, { recursive: true, force: true });
    });

    it('generate-file-inventory.js runs its CLI when invoked directly', () => {
        const script = path.join(root, 'scripts', 'generate-file-inventory.js');
        fs.copyFileSync(path.join(repoScripts, 'generate-file-inventory.js'), script);
        fs.mkdirSync(path.join(root, 'src'));
        fs.writeFileSync(path.join(root, 'src', 'a.js'), 'export {};\n');

        execFileSync(process.execPath, [script, 'src', 'INVENTORY.md'], { stdio: 'pipe' });

        const out = fs.readFileSync(path.join(root, 'INVENTORY.md'), 'utf8');
        expect(out).toContain('# File Inventory: src');
        expect(out).toContain('a.js');
    });

    it('compress-assets-for-git.js runs its CLI when invoked directly', () => {
        const script = path.join(root, 'scripts', 'compress-assets-for-git.js');
        fs.copyFileSync(path.join(repoScripts, 'compress-assets-for-git.js'), script);
        // Minimal local stand-in for the sharp dependency so the copied
        // script can load; there are no assets to compress in this root.
        const sharpDir = path.join(root, 'node_modules', 'sharp');
        fs.mkdirSync(sharpDir, { recursive: true });
        fs.writeFileSync(path.join(sharpDir, 'package.json'), '{"name":"sharp","main":"index.js"}');
        fs.writeFileSync(path.join(sharpDir, 'index.js'), 'module.exports = () => { throw new Error("unused"); };');

        const stdout = execFileSync(process.execPath, [script], { encoding: 'utf8', stdio: 'pipe' });

        expect(stdout).toContain('Finding assets to compress');
    });
});
