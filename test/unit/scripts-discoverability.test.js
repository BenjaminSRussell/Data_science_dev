import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const projectRoot = process.cwd();

describe('Scripts Discoverability Issue #1915', () => {
  it('should have scripts/archive directory for dead scripts', () => {
    const archivePath = path.join(projectRoot, 'scripts', 'archive');
    expect(fs.existsSync(archivePath)).toBe(true);
  });

  it('should have generators archived in scripts/archive/generators', () => {
    const generatorsPath = path.join(projectRoot, 'scripts', 'archive', 'generators');
    expect(fs.existsSync(generatorsPath)).toBe(true);

    // Verify there are generator scripts inside
    const files = fs.readdirSync(generatorsPath);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some(f => f.endsWith('.py'))).toBe(true);
  });

  it('should have scrapers archived in scripts/archive/scrapers', () => {
    const scrapersPath = path.join(projectRoot, 'scripts', 'archive', 'scrapers');
    expect(fs.existsSync(scrapersPath)).toBe(true);

    // Verify there are scraper scripts inside
    const files = fs.readdirSync(scrapersPath);
    expect(files.length).toBeGreaterThan(0);
    expect(files.some(f => f.endsWith('.py'))).toBe(true);
  });

  it('should document the archive in scripts/archive/README.md', () => {
    const archiveReadmePath = path.join(projectRoot, 'scripts', 'archive', 'README.md');
    expect(fs.existsSync(archiveReadmePath)).toBe(true);

    const content = fs.readFileSync(archiveReadmePath, 'utf-8');
    expect(content).toContain('Archived Scripts');
    expect(content).toContain('bootstrap');
    expect(content).toContain('Dead Code');
  });

  it('should mention archive in main scripts/README.md', () => {
    const scriptsReadmePath = path.join(projectRoot, 'scripts', 'README.md');
    expect(fs.existsSync(scriptsReadmePath)).toBe(true);

    const content = fs.readFileSync(scriptsReadmePath, 'utf-8');
    expect(content).toContain('archive');
    expect(content).toContain('Archived Scripts');
  });

  it('should NOT have generators/ at top-level of scripts directory', () => {
    const generatorsPath = path.join(projectRoot, 'scripts', 'generators');
    expect(fs.existsSync(generatorsPath)).toBe(false);
  });

  it('should NOT have scrapers/ at top-level of scripts directory', () => {
    const scrapersPath = path.join(projectRoot, 'scripts', 'scrapers');
    expect(fs.existsSync(scrapersPath)).toBe(false);
  });

  it('should reference issue #1915 in archive documentation', () => {
    const archiveReadmePath = path.join(projectRoot, 'scripts', 'archive', 'README.md');
    const content = fs.readFileSync(archiveReadmePath, 'utf-8');
    expect(content).toContain('#1915');
  });
});
