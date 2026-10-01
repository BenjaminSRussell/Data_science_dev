import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('gsap dependency removal - package.json validation', () => {
  it('should not have gsap in package.json dependencies', () => {
    const packageJsonPath = path.resolve(process.cwd(), 'package.json');
    const packageJsonContent = fs.readFileSync(packageJsonPath, 'utf-8');
    const packageJson = JSON.parse(packageJsonContent);

    // This test fails on main (where gsap is still listed) and passes with the fix
    expect(packageJson.dependencies).not.toHaveProperty('gsap');
  });
});
