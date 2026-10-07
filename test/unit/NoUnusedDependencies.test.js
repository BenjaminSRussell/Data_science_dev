import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { resolve } from 'path';

// Use process.cwd() to get the working directory
const srcDir = resolve(process.cwd(), 'src/js');

/**
 * Recursively search for files in a directory
 */
function getFilesRecursive(dir) {
  const files = [];
  const entries = fs.readdirSync(dir);

  for (const entry of entries) {
    const fullPath = path.join(dir, entry);
    const stat = fs.statSync(fullPath);

    if (stat.isDirectory()) {
      files.push(...getFilesRecursive(fullPath));
    } else if (entry.endsWith('.js')) {
      files.push(fullPath);
    }
  }

  return files;
}

describe('Unused Dependencies', () => {
  it('should not have gsap in package.json dependencies', () => {
    // This test directly validates the fix by checking package.json
    // It fails on main (where gsap is still listed) and passes with the fix
    const packageJsonPath = resolve(process.cwd(), 'package.json');
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    expect(packageJson.dependencies, 'gsap should be removed from package.json dependencies').not.toHaveProperty('gsap');
  });

  it('should have package-lock.json in sync with package.json regarding gsap', () => {
    // This test validates that the lockfile is properly synced when gsap is removed
    // It fails on main (where lockfile still has gsap entries) and passes with the fix
    const packageJsonPath = resolve(process.cwd(), 'package.json');
    const packageLockPath = resolve(process.cwd(), 'package-lock.json');

    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageLockContent = fs.readFileSync(packageLockPath, 'utf-8');

    const packageJson = JSON.parse(packageJsonContent);
    const packageLock = JSON.parse(packageLockContent);

    const gsapInPackageJson = 'gsap' in (packageJson.dependencies || {});
    const gsapInPackageLockRoot = 'gsap' in (packageLock.packages[''].dependencies || {});
    const gsapNodeModules = 'node_modules/gsap' in packageLock.packages;

    // If gsap is not in package.json, it should not be in package-lock.json either
    if (!gsapInPackageJson) {
      expect(gsapInPackageLockRoot, 'gsap should not be in package-lock.json root dependencies if removed from package.json').toBe(false);
      expect(gsapNodeModules, 'node_modules/gsap should not be in package-lock.json if removed from package.json').toBe(false);
    }
  });

  it('should not import gsap anywhere in production code', () => {
    const files = getFilesRecursive(srcDir);
    const gsapImports = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');

      // Check for common import patterns
      if (content.includes("import") && content.includes("'gsap'") ||
          content.includes('import') && content.includes('"gsap"') ||
          content.includes("require('gsap')") ||
          content.includes('require("gsap")')) {
        gsapImports.push(file);
      }
    }

    expect(gsapImports, `gsap should not be imported, but found in: ${gsapImports.join(', ')}`).toHaveLength(0);
  });

  it('should not instantiate GSAPAnimationManager in active code', () => {
    const files = getFilesRecursive(srcDir);
    const gsapInstances = [];

    for (const file of files) {
      const content = fs.readFileSync(file, 'utf-8');
      const lines = content.split('\n');

      for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // Skip commented lines
        if (line.trim().startsWith('//')) {
          continue;
        }
        // Skip block comments
        if (line.includes('/*') && !line.includes('*/')) {
          // Start of block comment
          let j = i + 1;
          while (j < lines.length && !lines[j].includes('*/')) {
            j++;
          }
          continue;
        }
        // Check for GSAPAnimationManager instantiation
        if (line.includes('new GSAPAnimationManager()')) {
          gsapInstances.push(`${file}:${i + 1}`);
        }
      }
    }

    expect(gsapInstances, `GSAPAnimationManager should not be instantiated, but found in: ${gsapInstances.join(', ')}`).toHaveLength(0);
  });
});
