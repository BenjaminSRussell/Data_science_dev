/**
 * Gameplay settings are read by the systems they name (#2276).
 * Defaults stay on, so a missing settings object keeps the old behavior.
 */
import { describe, it, expect, vi } from 'vitest';
import { GameplaySettings, readGameplayFlag, readGameplayNumber } from '../../src/js/game/settings/GameplaySettings.js';
import { RomanceSystem } from '../../src/js/game/RomanceSystem.js';
import { CompanyManagementSystem } from '../../src/js/game/company/CompanyManagementSystem.js';
import { DemandingBossSystem } from '../../src/js/game/work/DemandingBossSystem.js';
import { NewsManager, RANDOM_EVENTS } from '../../src/js/game/NewsManager.js';
import { RoommateSystem } from '../../src/js/game/social/RoommateSystem.js';
import { MapRenderer } from '../../src/js/game/MapRenderer.js';

function withSettings(mutate) {
    const gameplaySettings = new GameplaySettings();
    mutate(gameplaySettings);
    return { gameplaySettings };
}

describe('GameplaySettings reads (#2276)', () => {
    it('treats a missing settings object as the defaults', () => {
        expect(readGameplayFlag({}, 'relationships', 'romance')).toBe(true);
        expect(readGameplayNumber({}, 'difficulty', 'competition', 50)).toBe(50);
        expect(readGameplayNumber(withSettings(s => s.setSetting('difficulty', 'competition', 0)), 'difficulty', 'competition', 50)).toBe(0);
    });

    it('romance actions refuse when romance or relationships are off, and spend nothing', () => {
        const npc = { id: 'ana', name: 'Ana', romanceOptions: {} };
        const gs = {
            money: 1000,
            npcManager: { getNPC: () => npc, getRelationship: () => 80 },
            ...withSettings(s => s.setSetting('relationships', 'romance', false))
        };
        const romance = new RomanceSystem(gs);
        expect(romance.askOnDate('ana').success).toBe(false);
        expect(gs.money).toBe(1000);
        gs.gameplaySettings.setSetting('relationships', 'romance', true);
        gs.gameplaySettings.setSetting('relationships', 'enabled', false);
        expect(romance.goOnDate('coffee').message).toMatch(/Relationships are turned off/);
        expect(gs.money).toBe(1000);
    });

    it('company hiring, clients and management follow their toggles', () => {
        const gs = { money: 10000, ...withSettings(s => s.setSetting('company', 'hiring', false)) };
        const cms = new CompanyManagementSystem(gs);
        expect(cms.hireEmployee({ name: 'Ann' }).success).toBe(false);
        expect(gs.money).toBe(10000);
        gs.gameplaySettings.setSetting('company', 'hiring', true);
        gs.gameplaySettings.setSetting('company', 'clients', false);
        cms.startCompany('Mine');
        expect(cms.findClients()).toEqual([]);
        expect(cms.acquireClient('TechCorp').success).toBe(false);
        gs.gameplaySettings.setSetting('company', 'management', false);
        expect(cms.assignTask('nope', { id: 't', name: 'T' }).success).toBe(false);
        expect(new CompanyManagementSystem(gs).startCompany('Other')).toBeNull();
    });

    it('boss deadlines tighten with competition and task frequency, and stay put at the defaults', () => {
        const plain = new DemandingBossSystem({});
        plain.demandLevel = 50;
        const neutral = plain.calculateDeadline();
        const gs = withSettings((s) => {
            s.setSetting('difficulty', 'competition', 100);
            s.setSetting('difficulty', 'taskFrequency', 10);
        });
        const boss = new DemandingBossSystem(gs);
        boss.demandLevel = 50;
        expect(boss.calculateDeadline()).toBeLessThan(neutral);
        gs.gameplaySettings.setSetting('difficulty', 'competition', 50);
        gs.gameplaySettings.setSetting('difficulty', 'taskFrequency', 3);
        expect(boss.calculateDeadline()).toBe(neutral);
        expect(boss.calculateReward(42)).toBe(420);
    });

    it('competition scales only the rival-poach event', () => {
        const event = RANDOM_EVENTS.find(e => e.id === 'competitor_steal');
        const other = RANDOM_EVENTS.find(e => e.id === 'car_trouble');
        const calm = new NewsManager(withSettings(s => s.setSetting('difficulty', 'competition', 0)));
        const fierce = new NewsManager(withSettings(s => s.setSetting('difficulty', 'competition', 100)));
        const base = new NewsManager({});
        expect(base.rollProbability(event)).toBeCloseTo(event.probability);
        expect(calm.rollProbability(event)).toBe(0);
        expect(fierce.rollProbability(event)).toBeCloseTo(event.probability * 2);
        expect(fierce.rollProbability(other)).toBe(other.probability);
    });

    it('social life off blocks roommate hangouts without moving the relationship', () => {
        const gs = withSettings(s => s.setSetting('relationships', 'social', false));
        const roommate = new RoommateSystem(gs);
        const before = roommate.relationship;
        expect(roommate.hangout().message).toMatch(/Social interactions are turned off/);
        expect(roommate.relationship).toBe(before);
    });

    it('the map renderer drops decorations when extra detail is off and keeps them otherwise', () => {
        const container = document.createElement('div');
        const renderer = Object.create(MapRenderer.prototype);
        renderer.container = container;
        renderer.mapManager = {
            environmentSystem: {
                getAllElements: () => [
                    { id: 't1', type: 'tree', subtype: 'park-tree', x: 1, y: 1 },
                    { id: 'd1', type: 'decoration', x: 3, y: 3 }
                ]
            },
            getGridSystem: () => ({ totalWidth: 300, totalHeight: 300, gridToPixel: (x, y) => ({ x: x * 10, y: y * 10 }) })
        };
        renderer.game = { gameState: withSettings(s => s.setSetting('visuals', 'details', false)) };
        renderer.renderEnvironment();
        expect(container.querySelectorAll('.map-tree')).toHaveLength(1);
        expect(container.querySelectorAll('.map-decoration')).toHaveLength(0);

        const on = document.createElement('div');
        renderer.container = on;
        renderer.game = { gameState: {} };
        renderer.renderEnvironment();
        expect(on.querySelectorAll('.map-decoration')).toHaveLength(1);
    });

    it('visual toggles tag the document only when they leave the default', () => {
        document.documentElement.classList.remove('gp-no-animations', 'gp-no-details', 'gp-smooth');
        const s = new GameplaySettings();
        s.applyVisuals();
        expect(document.documentElement.classList.contains('gp-no-animations')).toBe(false);
        s.setSetting('visuals', 'animations', false);
        s.setSetting('visuals', 'lowPoly', false);
        expect(document.documentElement.classList.contains('gp-no-animations')).toBe(true);
        expect(document.documentElement.classList.contains('gp-smooth')).toBe(true);
        s.setSetting('visuals', 'animations', true);
        s.setSetting('visuals', 'lowPoly', true);
        expect(document.documentElement.classList.contains('gp-no-animations')).toBe(false);
        expect(document.documentElement.classList.contains('gp-smooth')).toBe(false);
    });

    it('the settings modal writes gameplay settings and the boss follows', async () => {
        vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });
        const { MainGame } = await import('../../src/js/main.js');
        document.body.innerHTML = '<div id="modal-root"></div>';
        const gs = { ...withSettings(() => {}) };
        const boss = new DemandingBossSystem(gs);
        boss.initializeBoss({ name: 'A' });
        gs.demandingBoss = boss;
        const fake = {
            gameState: gs,
            gameplaySettings: gs.gameplaySettings,
            audioManager: { soundEnabled: true, musicEnabled: true, musicVolume: 0.5, soundVolume: 0.5 },
            showModal(html) { document.getElementById('modal-root').innerHTML = html; },
            describeQualitySetting: MainGame.prototype.describeQualitySetting,
            updateQualitySetting: MainGame.prototype.updateQualitySetting
        };
        MainGame.prototype.showSettings.call(fake);
        expect(document.querySelectorAll('.settings-row')).toHaveLength(5);
        const demand = document.getElementById('gp-difficulty-bossDemand');
        expect(demand.value).toBe('70');
        expect(document.querySelector('label[for="gp-relationships-romance"]')).toBeTruthy();
        demand.value = '20';
        demand.dispatchEvent(new Event('input'));
        expect(gs.gameplaySettings.getSetting('difficulty', 'bossDemand')).toBe(20);
        expect(boss.demandLevel).toBe(20);
        const romance = document.getElementById('gp-relationships-romance');
        romance.checked = false;
        romance.dispatchEvent(new Event('change'));
        expect(gs.gameplaySettings.getSetting('relationships', 'romance')).toBe(false);
    });
});
