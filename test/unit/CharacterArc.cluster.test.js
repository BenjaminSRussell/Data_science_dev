/**
 * CharacterArcSystem was a third evolution tracker beside
 * CharacterStats.visualStage (#1960). Its milestone history was never read
 * (#1103). Evolution stays on checkForCharacterEvolution.
 */
import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';

const root = path.resolve(__dirname, '../..');

describe('CharacterArcSystem removed (#1960, #1103)', () => {
    it('the module file is gone', () => {
        expect(fs.existsSync(path.join(root, 'src/js/game/CharacterArcSystem.js'))).toBe(false);
    });

    it('main does not import or construct it', () => {
        const main = fs.readFileSync(path.join(root, 'src/js/main.js'), 'utf8');
        expect(main).not.toContain('CharacterArcSystem');
        expect(main).not.toMatch(/new CharacterArcSystem\s*\(/);
    });

    it('visual evolution remains the live path', () => {
        const helpers = fs.readFileSync(path.join(root, 'src/js/helpers/ProjectHelpers.js'), 'utf8');
        const start = helpers.indexOf('export function checkForCharacterEvolution');
        const fn = helpers.slice(start, helpers.indexOf('export function updatePlayerAvatar'));
        expect(fn).toContain('characterStats.checkEvolution');
        const main = fs.readFileSync(path.join(root, 'src/js/main.js'), 'utf8');
        expect(main).toContain('this.checkForCharacterEvolution?.()');
    });
});
