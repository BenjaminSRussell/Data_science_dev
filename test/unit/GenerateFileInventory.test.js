/**
 * Unit tests for GenerateFileInventory - scanDirectory function
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { scanDirectory } from '../../scripts/generate-file-inventory.js';
import fs from 'fs';
import path from 'path';
import os from 'os';

describe('scanDirectory', () => {
    let fixtureDir;

    beforeEach(() => {
        // Create a temporary directory for testing
        fixtureDir = fs.mkdtempSync(path.join(os.tmpdir(), 'scan-test-'));
    });

    afterEach(() => {
        // Clean up the temporary directory
        if (fs.existsSync(fixtureDir)) {
            fs.rmSync(fixtureDir, { recursive: true, force: true });
        }
    });

    it('should scan a simple directory structure with files and folders', () => {
        // Create a simple structure: root/file1.txt, root/subfolder/file2.txt
        fs.writeFileSync(path.join(fixtureDir, 'file1.txt'), 'content1');
        fs.mkdirSync(path.join(fixtureDir, 'subfolder'));
        fs.writeFileSync(path.join(fixtureDir, 'subfolder', 'file2.txt'), 'content2');

        const result = scanDirectory(fixtureDir);

        expect(result.files).toHaveLength(2);
        expect(result.folders).toHaveLength(1);

        // Check files have correct paths
        const filePaths = result.files.map(f => f.path).sort();
        expect(filePaths).toContain('file1.txt');
        expect(filePaths).toContain(path.join('subfolder', 'file2.txt'));

        // Check folders
        expect(result.folders[0].path).toBe('subfolder');
    });

    it('should skip node_modules directory', () => {
        fs.writeFileSync(path.join(fixtureDir, 'file1.txt'), 'content1');
        fs.mkdirSync(path.join(fixtureDir, 'node_modules'));
        fs.writeFileSync(path.join(fixtureDir, 'node_modules', 'package.txt'), 'content');

        const result = scanDirectory(fixtureDir);

        expect(result.files).toHaveLength(1);
        expect(result.files[0].path).toBe('file1.txt');
        expect(result.folders).toHaveLength(0);
    });

    it('should skip dist directory', () => {
        fs.writeFileSync(path.join(fixtureDir, 'file1.txt'), 'content1');
        fs.mkdirSync(path.join(fixtureDir, 'dist'));
        fs.writeFileSync(path.join(fixtureDir, 'dist', 'bundle.js'), 'content');

        const result = scanDirectory(fixtureDir);

        expect(result.files).toHaveLength(1);
        expect(result.files[0].path).toBe('file1.txt');
        expect(result.folders).toHaveLength(0);
    });

    it('should skip .git directory', () => {
        fs.writeFileSync(path.join(fixtureDir, 'file1.txt'), 'content1');
        fs.mkdirSync(path.join(fixtureDir, '.git'));
        fs.writeFileSync(path.join(fixtureDir, '.git', 'config'), 'content');

        const result = scanDirectory(fixtureDir);

        expect(result.files).toHaveLength(1);
        expect(result.files[0].path).toBe('file1.txt');
        expect(result.folders).toHaveLength(0);
    });

    it('should skip test-reports directory', () => {
        fs.writeFileSync(path.join(fixtureDir, 'file1.txt'), 'content1');
        fs.mkdirSync(path.join(fixtureDir, 'test-reports'));
        fs.writeFileSync(path.join(fixtureDir, 'test-reports', 'report.html'), 'content');

        const result = scanDirectory(fixtureDir);

        expect(result.files).toHaveLength(1);
        expect(result.files[0].path).toBe('file1.txt');
        expect(result.folders).toHaveLength(0);
    });

    it('should skip dotfiles except .gitignore', () => {
        fs.writeFileSync(path.join(fixtureDir, 'file1.txt'), 'content1');
        fs.writeFileSync(path.join(fixtureDir, '.env'), 'SECRET=value');
        fs.writeFileSync(path.join(fixtureDir, '.DS_Store'), 'mac metadata');
        fs.writeFileSync(path.join(fixtureDir, '.eslintrc'), '{}');
        fs.writeFileSync(path.join(fixtureDir, '.gitignore'), '*.log');

        const result = scanDirectory(fixtureDir);

        // Should only have file1.txt and .gitignore
        expect(result.files).toHaveLength(2);
        const filePaths = result.files.map(f => f.path).sort();
        expect(filePaths).toContain('file1.txt');
        expect(filePaths).toContain('.gitignore');
    });

    it('should handle recursive subdirectories correctly', () => {
        // Create nested structure: root/a/b/c/file.txt
        fs.mkdirSync(path.join(fixtureDir, 'a'));
        fs.mkdirSync(path.join(fixtureDir, 'a', 'b'));
        fs.mkdirSync(path.join(fixtureDir, 'a', 'b', 'c'));
        fs.writeFileSync(path.join(fixtureDir, 'a', 'b', 'c', 'file.txt'), 'content');
        fs.writeFileSync(path.join(fixtureDir, 'a', 'file1.txt'), 'content1');

        const result = scanDirectory(fixtureDir);

        expect(result.files).toHaveLength(2);
        expect(result.folders).toHaveLength(3); // a, a/b, a/b/c

        const filePaths = result.files.map(f => f.path).sort();
        expect(filePaths).toContain(path.join('a', 'file1.txt'));
        expect(filePaths).toContain(path.join('a', 'b', 'c', 'file.txt'));

        const folderPaths = result.folders.map(f => f.path).sort();
        expect(folderPaths).toContain('a');
        expect(folderPaths).toContain(path.join('a', 'b'));
        expect(folderPaths).toContain(path.join('a', 'b', 'c'));
    });

    it('should correctly separate files and folders arrays', () => {
        // Create a mix of files and folders
        fs.writeFileSync(path.join(fixtureDir, 'root.txt'), 'root');
        fs.mkdirSync(path.join(fixtureDir, 'folder1'));
        fs.writeFileSync(path.join(fixtureDir, 'folder1', 'nested.txt'), 'nested');
        fs.mkdirSync(path.join(fixtureDir, 'folder2'));

        const result = scanDirectory(fixtureDir);

        // Verify separation
        expect(Array.isArray(result.files)).toBe(true);
        expect(Array.isArray(result.folders)).toBe(true);

        // Files should have file-specific properties
        result.files.forEach(file => {
            expect(file).toHaveProperty('path');
            expect(file).toHaveProperty('name');
            expect(file).toHaveProperty('extension');
            expect(file).toHaveProperty('fullPath');
            expect(file).toHaveProperty('size');
            expect(file).toHaveProperty('modified');
        });

        // Folders should have folder-specific properties
        result.folders.forEach(folder => {
            expect(folder).toHaveProperty('path');
            expect(folder).toHaveProperty('fullPath');
            expect(folder.path.length > 0).toBe(true);
        });
    });

    it('should include accurate relative paths', () => {
        fs.mkdirSync(path.join(fixtureDir, 'src'));
        fs.mkdirSync(path.join(fixtureDir, 'src', 'components'));
        fs.writeFileSync(path.join(fixtureDir, 'src', 'index.js'), 'export default {}');
        fs.writeFileSync(path.join(fixtureDir, 'src', 'components', 'Button.js'), 'export Button');

        const result = scanDirectory(fixtureDir);

        // Check relative paths are normalized
        const filePaths = result.files.map(f => f.path);
        expect(filePaths).toContain(path.join('src', 'index.js'));
        expect(filePaths).toContain(path.join('src', 'components', 'Button.js'));

        // All files should have proper relative paths
        result.files.forEach(file => {
            expect(file.path).not.toMatch(/^\//); // No absolute paths
            expect(file.path.length > 0).toBe(true); // Non-empty
        });
    });

    it('should handle mixed exclusion rules with real-world structure', () => {
        // Create a realistic project structure
        fs.writeFileSync(path.join(fixtureDir, 'README.md'), '# Project');
        fs.writeFileSync(path.join(fixtureDir, '.gitignore'), '');
        fs.writeFileSync(path.join(fixtureDir, '.env.local'), 'SECRET=val');

        fs.mkdirSync(path.join(fixtureDir, 'src'));
        fs.writeFileSync(path.join(fixtureDir, 'src', 'main.js'), 'entry');

        fs.mkdirSync(path.join(fixtureDir, 'node_modules'));
        fs.writeFileSync(path.join(fixtureDir, 'node_modules', 'package.json'), 'name');

        fs.mkdirSync(path.join(fixtureDir, 'dist'));
        fs.writeFileSync(path.join(fixtureDir, 'dist', 'bundle.js'), 'bundled');

        fs.mkdirSync(path.join(fixtureDir, '.git'));
        fs.writeFileSync(path.join(fixtureDir, '.git', 'HEAD'), 'ref');

        fs.mkdirSync(path.join(fixtureDir, 'test-reports'));
        fs.writeFileSync(path.join(fixtureDir, 'test-reports', 'report.xml'), 'xml');

        const result = scanDirectory(fixtureDir);

        // Should only have README.md, .gitignore, and src/main.js
        expect(result.files).toHaveLength(3);

        const filePaths = result.files.map(f => f.path).sort();
        expect(filePaths).toContain('.gitignore');
        expect(filePaths).toContain('README.md');
        expect(filePaths).toContain(path.join('src', 'main.js'));

        // Should only have src folder
        expect(result.folders).toHaveLength(1);
        expect(result.folders[0].path).toBe('src');
    });

    it('should provide correct file information', () => {
        const content = 'test file content';
        fs.writeFileSync(path.join(fixtureDir, 'test.txt'), content);

        const result = scanDirectory(fixtureDir);

        expect(result.files).toHaveLength(1);
        const file = result.files[0];

        expect(file.path).toBe('test.txt');
        expect(file.name).toBe('test.txt');
        expect(file.extension).toBe('.txt');
        expect(file.size).toBe(content.length);
        expect(file.modified instanceof Date).toBe(true);
        expect(file.lines).toBe(null); // includeLines is false by default
    });

    it('should handle empty directories', () => {
        fs.mkdirSync(path.join(fixtureDir, 'empty-folder'));
        fs.writeFileSync(path.join(fixtureDir, 'file.txt'), 'content');

        const result = scanDirectory(fixtureDir);

        expect(result.files).toHaveLength(1);
        expect(result.folders).toHaveLength(1);
        expect(result.folders[0].path).toBe('empty-folder');
    });

    it('should skip excluded directories recursively', () => {
        // Create node_modules with nested structure
        fs.mkdirSync(path.join(fixtureDir, 'node_modules'));
        fs.mkdirSync(path.join(fixtureDir, 'node_modules', 'package1'));
        fs.mkdirSync(path.join(fixtureDir, 'node_modules', 'package1', 'lib'));
        fs.writeFileSync(path.join(fixtureDir, 'node_modules', 'package1', 'lib', 'index.js'), 'code');

        // Add a regular file
        fs.writeFileSync(path.join(fixtureDir, 'app.js'), 'main code');

        const result = scanDirectory(fixtureDir);

        // Should only find app.js
        expect(result.files).toHaveLength(1);
        expect(result.files[0].path).toBe('app.js');
        expect(result.folders).toHaveLength(0);
    });
});
