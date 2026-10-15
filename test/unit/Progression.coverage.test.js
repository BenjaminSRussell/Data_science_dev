import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { VisualProgressionSystem } from '../../src/js/game/visual/VisualProgressionSystem.js';
import { LPC_SHEET_URLS } from '../../src/js/assets/AssetManager.js';

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
    it('upgradeSpriteSheets registers real 64px LPC sheets for mid and premium', () => {
        const registerSpriteSheet = vi.fn();
        const loadSpriteSheet = vi.fn(() => Promise.resolve(true));
        const v = new VisualProgressionSystem({ spriteSheetManager: { registerSpriteSheet, loadSpriteSheet } });
        v.upgradeSpriteSheets('mid');
        expect(registerSpriteSheet).toHaveBeenCalledWith('character_mid', expect.objectContaining({
            url: LPC_SHEET_URLS.mid, frameWidth: 64, frameHeight: 64, columns: 13, rows: 21
        }));
        expect(loadSpriteSheet).toHaveBeenCalledWith('character_mid');
        v.currentTier = 'premium';
        v.upgradeSpriteSheets('premium');
        expect(registerSpriteSheet).toHaveBeenCalledWith('character_premium', expect.objectContaining({
            url: LPC_SHEET_URLS.premium, frameWidth: 64, frameHeight: 64, columns: 13, rows: 21
        }));
        expect(loadSpriteSheet).toHaveBeenCalledWith('character_premium');
        // The sheet the character renderer looks up is loaded too
        expect(registerSpriteSheet).toHaveBeenCalledWith('main_character', expect.objectContaining({
            url: LPC_SHEET_URLS.premium
        }));
        expect(loadSpriteSheet).toHaveBeenCalledWith('main_character');
        expect(() => new VisualProgressionSystem({}).upgradeSpriteSheets('mid')).not.toThrow();
        expect(() => new VisualProgressionSystem({ spriteSheetManager: {} }).upgradeSpriteSheets('mid')).not.toThrow();
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
        expect(document.body.querySelectorAll('.visual-basic')).toHaveLength(6);
    });
});

describe('VisualProgressionSystem URLs and save/load (#384)', () => {
    it('URL lookups follow the current tier and fall back to basic', () => {
        const v = new VisualProgressionSystem({});
        const backdrops = { basic: '00', mid: '04', premium: '09' };
        for (const tier of ['basic', 'mid', 'premium']) {
            v.currentTier = tier;
            expect(v.getSpriteSheetUrl('main')).toBe(LPC_SHEET_URLS[tier]);
            expect(v.getBackgroundUrl('downtown')).toBe(
                `/assets/backgrounds/locations/downtown/downtown_backdrop_${backdrops[tier]}.png`
            );
        }
        v.currentTier = 'ultra';
        expect(v.getSpriteSheetUrl()).toBe(LPC_SHEET_URLS.basic);
        expect(v.getBackgroundUrl('downtown')).toBe('/assets/backgrounds/locations/downtown/downtown_backdrop_00.png');
        // Non-player types still resolve to a shipped LPC sheet
        expect(v.getSpriteSheetUrl('emma')).toMatch(/^\/assets\/characters\/sprites\/lpc_sprite_\d+\.png$/);
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
