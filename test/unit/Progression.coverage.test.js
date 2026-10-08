import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VisualProgressionSystem } from '../../src/js/game/visual/VisualProgressionSystem.js';
import { CharacterArcSystem } from '../../src/js/game/CharacterArcSystem.js';

afterEach(() => { vi.restoreAllMocks(); delete window.game; document.body.innerHTML = ''; document.body.className = ''; });

function quiet(v) {
    vi.spyOn(v, 'playVisualUpgradeEffect').mockImplementation(() => {});
    return v;
}

describe('VisualProgressionSystem milestones (#382)', () => {
    it('getCurrentStats defaults every source to 0', () => {
        expect(new VisualProgressionSystem({}).getCurrentStats()).toEqual({ money: 0, relationships: 0, days: 0, jobLevel: 0, totalSkills: 0 });
    });

    it('getCurrentStats aggregates from the optional sub-systems', () => {
        const v = new VisualProgressionSystem({
            money: 1234,
            npcManager: { getMetNPCs: () => [1, 2, 3] },
            timeManager: { totalDays: 40 },
            jobSystem: { updateCurrentJob: () => ({ level: 4 }) },
            characterStats: { getAllStats: () => [{ value: 15 }, { value: 8 }, { value: 30 }] }
        });
        expect(v.getCurrentStats()).toEqual({ money: 1234, relationships: 3, days: 40, jobLevel: 4, totalSkills: 25 });
    });

    it('checkMilestones unlocks once and reports whether anything new unlocked', () => {
        const gs = { money: 10000 };
        const v = quiet(new VisualProgressionSystem(gs));
        const apply = vi.spyOn(v, 'applyVisualUpgrade');
        expect(v.checkMilestones()).toBe(true);
        expect(v.milestones.money_10k.unlocked).toBe(true);
        expect(apply).toHaveBeenCalledTimes(1);
        expect(v.checkMilestones()).toBe(false);
        expect(apply).toHaveBeenCalledTimes(1);
        expect(v.milestones.money_10k.unlocked).toBe(true);
    });

    it('unlockTier is idempotent', () => {
        const v = new VisualProgressionSystem({});
        const apply = vi.spyOn(v, 'applyVisualUpgrade').mockImplementation(() => {});
        v.unlockTier('mid');
        v.unlockTier('mid');
        expect(v.unlockedTiers).toEqual(['basic', 'mid']);
        expect(apply).toHaveBeenCalledTimes(1);
        v.unlockTier('bogus');
        expect(v.unlockedTiers).toEqual(['basic', 'mid']);
    });

    it('updateCurrentTier picks the highest tier, and a late lower unlock never downgrades visuals', () => {
        const v = new VisualProgressionSystem({});
        v.unlockTier('premium');
        v.unlockTier('mid');
        expect(v.currentTier).toBe('premium');
        expect(document.body.classList.contains('visual-premium')).toBe(true);
        expect(document.body.classList.contains('visual-mid')).toBe(false);
        expect(v.visualUpgrades.has('mid')).toBe(true);
    });
});

describe('VisualProgressionSystem DOM upgrades (#383)', () => {
    it('upgradeSpriteSheets registers 64px for mid and 128px for premium', () => {
        const registerSpriteSheet = vi.fn();
        const v = new VisualProgressionSystem({ spriteSheetManager: { registerSpriteSheet } });
        v.upgradeSpriteSheets('mid');
        expect(registerSpriteSheet).toHaveBeenCalledWith('character_mid', expect.objectContaining({ frameWidth: 64, frameHeight: 64 }));
        v.upgradeSpriteSheets('premium');
        expect(registerSpriteSheet).toHaveBeenCalledWith('character_premium', expect.objectContaining({ frameWidth: 128, frameHeight: 128 }));
        expect(() => new VisualProgressionSystem({}).upgradeSpriteSheets('mid')).not.toThrow();
    });

    it('upgradeBackgrounds swaps the tier class on body and location views', () => {
        document.body.innerHTML = '<div class="location-view-container visual-basic"></div><div class="location-view-container"></div>';
        document.body.classList.add('visual-mid');
        new VisualProgressionSystem({}).upgradeBackgrounds('premium');
        expect(document.body.classList.contains('visual-premium')).toBe(true);
        expect(document.body.classList.contains('visual-mid')).toBe(false);
        document.querySelectorAll('.location-view-container').forEach(el => {
            expect(el.className).toBe('location-view-container visual-premium');
        });
    });

    it('upgradeWorldAppearance updates map, buildings and roads, and tolerates no map', () => {
        const v = new VisualProgressionSystem({});
        expect(() => v.upgradeWorldAppearance('mid')).not.toThrow();
        document.body.innerHTML = '<div class="map-container visual-basic"><i class="map-building"></i><i class="map-npc-house visual-premium"></i><i class="map-road"></i></div>';
        v.upgradeWorldAppearance('mid');
        for (const sel of ['.map-container', '.map-building', '.map-npc-house', '.map-road']) {
            const el = document.querySelector(sel);
            expect(el.classList.contains('visual-mid')).toBe(true);
            expect(el.classList.contains('visual-basic') || el.classList.contains('visual-premium')).toBe(false);
        }
    });

    it('upgradeUI tags panels, cards, modals and buttons', () => {
        document.body.innerHTML = '<div class="panel"></div><div class="card"></div><div class="modal-content"></div><button></button><a class="btn"></a><span class="button"></span>';
        new VisualProgressionSystem({}).upgradeUI('basic');
        expect(document.querySelectorAll('.visual-basic')).toHaveLength(6);
    });
});

describe('VisualProgressionSystem URLs and save/load (#384)', () => {
    it('URL lookups follow the current tier and fall back to basic', () => {
        const v = new VisualProgressionSystem({});
        for (const tier of ['basic', 'mid', 'premium']) {
            v.currentTier = tier;
            expect(v.getSpriteSheetUrl('main')).toBe(`/assets/characters/sprites/main_${tier}.png`);
            expect(v.getBackgroundUrl('downtown')).toBe(`/assets/backgrounds/locations/downtown_${tier}.png`);
        }
        v.currentTier = 'ultra';
        expect(v.getSpriteSheetUrl()).toBe('/assets/characters/sprites/main_basic.png');
    });

    it('isTierUnlocked reflects membership', () => {
        const v = new VisualProgressionSystem({});
        expect(v.isTierUnlocked('premium')).toBe(false);
        vi.spyOn(v, 'applyVisualUpgrade').mockImplementation(() => {});
        v.unlockTier('premium');
        expect(v.isTierUnlocked('premium')).toBe(true);
    });

    it('round-trips through a fresh instance', () => {
        const a = quiet(new VisualProgressionSystem({ money: 60000 }));
        a.checkMilestones();
        const b = new VisualProgressionSystem({});
        const apply = vi.spyOn(b, 'applyVisualUpgrade');
        b.fromJSON(JSON.parse(JSON.stringify(a.toJSON())));
        expect(b.currentTier).toBe('mid');
        expect(b.unlockedTiers).toEqual(['basic', 'mid']);
        expect(b.milestones.money_50k.unlocked).toBe(true);
        expect(b.milestones.money_100k.unlocked).toBe(false);
        expect(b.visualUpgrades).toBeInstanceOf(Map);
        expect(b.visualUpgrades.has('mid')).toBe(true);
        // Only the showing tier is re-applied, so the DOM matches currentTier
        expect(apply).toHaveBeenCalledTimes(1);
        expect(apply).toHaveBeenCalledWith('mid');
    });

    it('fromJSON keeps current thresholds and ignores unknown milestones', () => {
        const v = new VisualProgressionSystem({});
        v.fromJSON({ milestones: { job_level_10: { tier: 'premium', threshold: 10, type: 'jobLevel', unlocked: false }, ghost: { unlocked: true } } });
        expect(v.milestones.job_level_10.threshold).toBe(6);
        expect(v.milestones.ghost).toBeUndefined();
        expect(v.milestones.money_10k.unlocked).toBe(false);
    });

    it('fromJSON derives currentTier from unlocked tiers and tolerates junk', () => {
        const v = new VisualProgressionSystem({});
        vi.spyOn(v, 'applyVisualUpgrade').mockImplementation(() => {});
        v.fromJSON({ currentTier: 'premium', unlockedTiers: ['mid', 'nope'] });
        expect(v.unlockedTiers).toEqual(['basic', 'mid']);
        expect(v.currentTier).toBe('mid');
        expect(() => v.fromJSON(null)).not.toThrow();
    });
});

describe('CharacterArcSystem (#393)', () => {
    it('captureStartingState only captures once', () => {
        const gs = { money: 500, reputation: 5 };
        const c = new CharacterArcSystem(gs);
        c.captureStartingState();
        gs.money = 99999;
        c.captureStartingState();
        expect(c.startingState.money).toBe(500);
    });

    it('a real $0 starting balance is kept', () => {
        const c = new CharacterArcSystem({ money: 0 });
        c.captureStartingState();
        expect(c.startingState.money).toBe(0);
    });

    it('direction checks run in source order', () => {
        const c = new CharacterArcSystem({});
        const base = { ethics: 0, reputation: 0, rank: 0, money: 0, relationships: 0 };
        expect(c.determineArcDirection({ ...base, ethics: -25, money: 60000 })).toBe('corruption');
        expect(c.determineArcDirection({ ...base, ethics: 25, reputation: 600 })).toBe('redemption');
        expect(c.determineArcDirection({ ...base, rank: 3, reputation: 400 })).toBe('success');
        expect(c.determineArcDirection({ ...base, ethics: -15 })).toBe('decline');
        expect(c.determineArcDirection({ ...base, ethics: 15 })).toBe('growth');
        expect(c.determineArcDirection(base)).toBe('balanced');
    });

    it('isSignificantChange thresholds', () => {
        const c = new CharacterArcSystem({});
        const z = { ethics: 0, reputation: 0, rank: 0, money: 0, relationships: 0 };
        expect(c.isSignificantChange(z)).toBe(false);
        expect(c.isSignificantChange({ ...z, ethics: 9 })).toBe(false);
        expect(c.isSignificantChange({ ...z, ethics: -10 })).toBe(true);
        expect(c.isSignificantChange({ ...z, reputation: 99 })).toBe(false);
        expect(c.isSignificantChange({ ...z, reputation: 100 })).toBe(true);
        expect(c.isSignificantChange({ ...z, rank: 1 })).toBe(true);
        expect(c.isSignificantChange({ ...z, money: 9999 })).toBe(false);
        expect(c.isSignificantChange({ ...z, money: -10000 })).toBe(true);
        expect(c.isSignificantChange({ ...z, relationships: 1 })).toBe(true);
    });

    it('trackArcProgression only logs significant changes, measured from the last entry', () => {
        const gs = { money: 100, reputation: 0, characterStats: { ethics: 0 } };
        const c = new CharacterArcSystem(gs);
        c.initialize();
        expect(c.arcHistory).toHaveLength(0);
        gs.characterStats.ethics = -15;
        c.updateCurrentState();
        expect(c.arcHistory).toHaveLength(1);
        expect(c.arcHistory[0].direction).toBe('decline');
        c.updateCurrentState();
        expect(c.arcHistory).toHaveLength(1);
    });

    it('getArcSummary defaults before initialize; relationship count is 0 without npcManager', () => {
        const c = new CharacterArcSystem({});
        expect(c.getArcSummary()).toEqual({
            start: 'Your journey is just beginning.',
            current: 'You are at the start of your path.',
            transformation: 'No significant changes yet.'
        });
        expect(c.getRelationshipCount()).toBe(0);
    });

    it('career tone uses the real reputation scale', () => {
        const c = new CharacterArcSystem({});
        expect(c.getCareerDescription(0, 70)).toContain('mostly unknown');
        expect(c.getCareerDescription(1, 150)).toContain('still proving yourself');
        expect(c.getCareerDescription(3, 800)).toContain('building a solid name');
        expect(c.getCareerDescription(6, 3000)).toContain('widely respected');
    });
});
