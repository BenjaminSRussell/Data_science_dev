import { expect } from 'chai';
import { readFileSync } from 'fs';

describe('UnifiedMapSystem', () => {
    it('should not have unused cache property in constructor', () => {
        // Read the source file relative to the test directory
        // From test/unit/ -> ../../src/js/game/
        const source = readFileSync('./src/js/game/UnifiedMapSystem.js', 'utf-8');

        // The cache property should have been removed
        // This regex checks for the pattern: this.cache = { ... }
        const cachePropertyPattern = /this\.cache\s*=\s*\{[\s\S]*?\};/;

        expect(source).to.not.match(cachePropertyPattern,
            'UnifiedMapSystem constructor should not contain unused this.cache property');
    });

    it('should not reference this.cache anywhere in the file', () => {
        const source = readFileSync('./src/js/game/UnifiedMapSystem.js', 'utf-8');

        // Split by lines and check each line
        const lines = source.split('\n');
        const cacheReferences = lines.filter((line, index) => {
            // Skip commented lines and the unlikely event of 'this.cache' in a string
            if (line.trim().startsWith('//') || line.trim().startsWith('*')) {
                return false;
            }
            return line.includes('this.cache');
        });

        expect(cacheReferences).to.be.empty;
    });
});
