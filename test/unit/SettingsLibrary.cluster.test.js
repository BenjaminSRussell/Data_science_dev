import { describe, it, expect } from 'vitest';
import { GameplaySettings } from '../../src/js/game/settings/GameplaySettings.js';
import { LIBRARY_CONTENT } from '../../src/js/game/LibraryDatabase.js';

describe('GameplaySettings.setSetting validation (#1073)', () => {
    it('clamps numeric settings to their range', () => {
        const s = new GameplaySettings();
        expect(s.setSetting('difficulty', 'bossDemand', -50)).toBe(true);
        expect(s.getSetting('difficulty', 'bossDemand')).toBe(0);
        s.setSetting('difficulty', 'competition', 900);
        expect(s.getSetting('difficulty', 'competition')).toBe(100);
        s.setSetting('difficulty', 'taskFrequency', '4');
        expect(s.getSetting('difficulty', 'taskFrequency')).toBe(4);
    });

    it('rejects non-numeric numbers, non-boolean toggles and unknown keys', () => {
        const s = new GameplaySettings();
        expect(s.setSetting('difficulty', 'bossDemand', 'abc')).toBe(false);
        expect(s.getSetting('difficulty', 'bossDemand')).toBe(70);
        expect(s.setSetting('relationships', 'romance', 'yes')).toBe(false);
        expect(s.getSetting('relationships', 'romance')).toBe(true);
        expect(s.setSetting('difficulty', 'madeUp', 5)).toBe(false);
        expect(s.settings.difficulty).not.toHaveProperty('madeUp');
        expect(s.setSetting('nope', 'x', 1)).toBe(false);
        expect(s.setSetting('visuals', 'animations', false)).toBe(true);
        expect(s.getSetting('visuals', 'animations')).toBe(false);
    });

    it('fromJSON applies the same checks to saved values', () => {
        const s = new GameplaySettings();
        s.fromJSON({ difficulty: { bossDemand: 'abc', competition: -5 }, relationships: { romance: 0 } });
        expect(s.getSetting('difficulty', 'bossDemand')).toBe(70);
        expect(s.getSetting('difficulty', 'competition')).toBe(0);
        expect(s.getSetting('relationships', 'romance')).toBe(true);
    });
});

describe('Library copy (#1643)', () => {
    it('every realWorldUse is a complete sentence', () => {
        const entries = Object.values(LIBRARY_CONTENT).flat().filter(e => e && e.realWorldUse);
        expect(entries.length).toBeGreaterThan(0);
        for (const e of entries) {
            expect(e.realWorldUse).toMatch(/^[A-Z]/);
            expect(e.realWorldUse.trim()).toBe(e.realWorldUse);
        }
    });
});
