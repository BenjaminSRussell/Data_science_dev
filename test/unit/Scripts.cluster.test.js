import { describe, it, expect } from 'vitest';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { findOversized, parseLimitMb, DEFAULT_LIMIT_MB } from '../../scripts/check-file-sizes.js';
import { generateTasks } from '../../scripts/generate-datascience-tasks.js';

const root = path.resolve(__dirname, '../..');
const pkg = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'));

describe('npm scripts (#2322, #1882, #2323)', () => {
    it('every "node scripts/..." npm script points at a file that exists', () => {
        for (const [name, cmd] of Object.entries(pkg.scripts)) {
            const m = cmd.match(/node (scripts\/\S+\.c?js)/);
            if (m) expect(fs.existsSync(path.join(root, m[1])), `${name} -> ${m[1]}`).toBe(true);
        }
    });

    it('static-bug-check has an npm script', () => {
        expect(pkg.scripts['check:static']).toBe('node scripts/static-bug-check.js');
    });

    it('check-file-sizes reports only files at or over the limit, largest first', () => {
        const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'sizes-'));
        fs.writeFileSync(path.join(dir, 'small.bin'), Buffer.alloc(10));
        fs.writeFileSync(path.join(dir, 'big.bin'), Buffer.alloc(300));
        fs.writeFileSync(path.join(dir, 'bigger.bin'), Buffer.alloc(500));
        const out = findOversized(['small.bin', 'big.bin', 'bigger.bin', 'gone.bin'], dir, 300);
        expect(out.map(f => f.file)).toEqual(['bigger.bin', 'big.bin']);
        expect(parseLimitMb([])).toBe(DEFAULT_LIMIT_MB);
        expect(parseLimitMb(['--limit-mb', '25'])).toBe(25);
        expect(parseLimitMb(['--limit-mb', 'x'])).toBe(DEFAULT_LIMIT_MB);
    });

    it('the task generator runs as an ES module and builds complete templates', () => {
        const tasks = generateTasks();
        expect(tasks.length).toBeGreaterThan(0);
        for (const t of tasks) {
            expect(t.title && t.description && t.domain && t.difficulty).toBeTruthy();
        }
        const src = fs.readFileSync(path.join(root, 'scripts/generate-datascience-tasks.js'), 'utf8');
        expect(src).not.toMatch(/require\(/);
        expect(src).not.toContain("'comprehensive_datascience_tasks.js'");
    });
});
