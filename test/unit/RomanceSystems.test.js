/**
 * Romance Systems Unit Tests
 * Verifies that only RomanceSystem is used (RomanceProgressionSystem is dead code)
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

describe('Romance Systems', () => {
    it('should not import RomanceProgressionSystem in main.js', () => {
        const mainPath = path.join(__dirname, '../../src/js/main.js');
        const mainContent = fs.readFileSync(mainPath, 'utf8');

        // Check that RomanceProgressionSystem is not imported
        const hasRomanceProgressionImport = mainContent.includes('import') &&
            mainContent.includes('RomanceProgressionSystem');

        expect(hasRomanceProgressionImport,
            'RomanceProgressionSystem should not be imported in main.js - it is dead code'
        ).toBe(false);
    });

    it('should not instantiate RomanceProgressionSystem in main.js', () => {
        const mainPath = path.join(__dirname, '../../src/js/main.js');
        const mainContent = fs.readFileSync(mainPath, 'utf8');

        // Check that RomanceProgressionSystem is not instantiated
        const hasRomanceProgressionInstantiation = mainContent.includes('new RomanceProgressionSystem');

        expect(hasRomanceProgressionInstantiation,
            'RomanceProgressionSystem should not be instantiated - it is dead code'
        ).toBe(false);
    });

    it('should only use RomanceSystem for romance management', () => {
        const srcDir = path.join(__dirname, '../../src/js');
        const files = [];

        // Recursively find all .js files
        function walkDir(dir) {
            const entries = fs.readdirSync(dir, { withFileTypes: true });
            for (const entry of entries) {
                const fullPath = path.join(dir, entry.name);
                if (entry.isDirectory()) {
                    walkDir(fullPath);
                } else if (entry.isFile() && entry.name.endsWith('.js')) {
                    files.push(fullPath);
                }
            }
        }

        walkDir(srcDir);

        // Check all files for references to romanceProgression being called
        let foundDeadCodeUsage = false;
        for (const file of files) {
            const content = fs.readFileSync(file, 'utf8');
            // Look for method calls on romanceProgression (the dead code)
            if (content.match(/this\.romanceProgression\?\.(startDating|workTogether|propose|getMarried|increaseRelationship|getAdviceForChoice)/)) {
                foundDeadCodeUsage = true;
                break;
            }
            if (content.match(/this\.gameState\.romanceProgression\?\.(startDating|workTogether|propose|getMarried|increaseRelationship|getAdviceForChoice)/)) {
                foundDeadCodeUsage = true;
                break;
            }
        }

        expect(foundDeadCodeUsage,
            'None of RomanceProgressionSystem methods should be called'
        ).toBe(false);
    });

    it('should have RomanceSystem file', () => {
        const romanceSystemPath = path.join(__dirname, '../../src/js/game/RomanceSystem.js');
        expect(fs.existsSync(romanceSystemPath),
            'RomanceSystem.js should exist'
        ).toBe(true);
    });
});
