import { describe, it, expect, vi, afterEach } from 'vitest';
import { GameplaySettings } from '../../src/js/game/settings/GameplaySettings.js';

describe('GameplaySettings toggles and get/set (#376)', () => {
    it('toggleRelationships / toggleRomance / toggleJealousy set and return the value', () => {
        const g = new GameplaySettings();
        expect(g.toggleRelationships(false)).toBe(false);
        expect(g.settings.relationships.enabled).toBe(false);
        expect(g.toggleRomance(false)).toBe(false);
        expect(g.settings.relationships.romance).toBe(false);
        expect(g.toggleJealousy(false)).toBe(false);
        expect(g.settings.relationships.jealousy).toBe(false);
    });

    it('toggles flip the value when called without an argument', () => {
        const g = new GameplaySettings();
        expect(g.toggleRomance()).toBe(false);
        expect(g.toggleRomance()).toBe(true);
    });

    it('getSetting returns defaults and null for unknown paths', () => {
        const g = new GameplaySettings();
        expect(g.getSetting('difficulty', 'bossDemand')).toBe(50);
        expect(g.getSetting('nope', 'x')).toBeNull();
        expect(g.getSetting('visuals', 'nope')).toBeNull();
    });

    it('setSetting mutates known categories and ignores unknown ones', () => {
        const g = new GameplaySettings();
        g.setSetting('visuals', 'lowPoly', false);
        expect(g.settings.visuals.lowPoly).toBe(false);
        g.setSetting('missingCategory', 'x', 1);
        expect(g.settings.missingCategory).toBeUndefined();
    });
});

describe('GameplaySettings serialization (#377)', () => {
    afterEach(() => vi.restoreAllMocks());

    it('toJSON round-trips all four categories', () => {
        const g = new GameplaySettings();
        const parsed = JSON.parse(g.toJSON());
        expect(parsed).toEqual(g.settings);
        expect(Object.keys(parsed)).toEqual(['relationships', 'company', 'difficulty', 'visuals']);
    });

    it('toJSON reflects mutations', () => {
        const g = new GameplaySettings();
        g.setSetting('difficulty', 'competition', 80);
        expect(JSON.parse(g.toJSON()).difficulty.competition).toBe(80);
    });

    it('fromJSON merges a partial save over the defaults', () => {
        const g = new GameplaySettings();
        g.fromJSON('{"relationships":{"enabled":false}}');
        expect(g.settings.relationships.enabled).toBe(false);
        expect(g.settings.relationships.romance).toBe(true);
        expect(g.settings.company).toEqual(new GameplaySettings().settings.company);
        expect(g.getSetting('difficulty', 'bossDemand')).toBe(50);
    });

    it('fromJSON restores a full round trip across instances', () => {
        const a = new GameplaySettings();
        a.toggleJealousy(false);
        a.setSetting('visuals', 'details', false);
        const b = new GameplaySettings();
        b.fromJSON(a.toJSON());
        expect(b.settings).toEqual(a.settings);
    });

    it('fromJSON logs and keeps the current settings on bad input', () => {
        const err = vi.spyOn(console, 'error').mockImplementation(() => {});
        const g = new GameplaySettings();
        const before = JSON.parse(g.toJSON());
        g.fromJSON('{not valid json');
        expect(err).toHaveBeenCalledWith('Failed to load settings:', expect.anything());
        g.fromJSON('null');
        g.fromJSON('[1,2]');
        expect(g.settings).toEqual(before);
    });
});
