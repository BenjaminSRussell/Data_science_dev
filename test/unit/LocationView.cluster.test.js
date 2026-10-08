/**
 * LocationView cluster: feature rewards applied (#2391, #2063, #45),
 * backdrop fallback (#2286), characters not duplicated (#2204), emotion
 * bands (#2203), shadow-DOM characters container (#2202), Lit container
 * exists (#2130, #1633), keyboard-accessible features (#878).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { LocationView } from '../../src/js/ui/LocationView.js';
import { AssetManager } from '../../src/js/assets/AssetManager.js';

function makeGame(extra = {}) {
    const timeManager = { energy: 10, maxEnergy: 100, restoreEnergy: vi.fn(function (n) { this.energy += n; }), useEnergy: vi.fn() };
    const characterStats = { addExperience: vi.fn() };
    return {
        gameState: { money: 100, npcManager: null },
        timeManager, characterStats,
        showToast: vi.fn(),
        uiUpdater: { updateAllUI: vi.fn() },
        locationDetailSystem: {
            getLocationDetails: () => ({ name: 'Home', description: 'd', features: [] }),
            getLocationFeatures: () => [{ id: 'bed', name: 'Bed', action: 'rest', icon: '' }],
            interactWithFeature: (loc, id) => ({ feature: { id }, result: { energy: 50, skill: 2, money: -5, message: 'done' } })
        },
        ...extra
    };
}

beforeEach(() => { document.body.innerHTML = ''; });

describe('LocationView cluster', () => {
    it('applies energy, skill and money from a feature (#2391, #2063, #45)', () => {
        const game = makeGame();
        const view = new LocationView(game, null, null, null);
        view.currentLocation = 'home';
        const applied = view.interactWithFeature({ id: 'bed' });
        expect(applied).toEqual({ energy: 50, skill: 2, money: -5 });
        expect(game.timeManager.energy).toBe(60);
        expect(game.characterStats.addExperience).toHaveBeenCalledWith('intelligence', 20);
        expect(game.gameState.money).toBe(95);
        expect(game.showToast).toHaveBeenCalledWith('done', 'info');
    });

    it('refuses a paid feature you cannot afford', () => {
        const game = makeGame();
        game.gameState.money = 2;
        const view = new LocationView(game, null, null, null);
        const res = view.applyFeatureResult({ money: -5, energy: 10 });
        expect(res.blocked).toBeTruthy();
        expect(game.gameState.money).toBe(2);
        expect(game.timeManager.restoreEnergy).not.toHaveBeenCalled();
    });

    it('getLocationBackground falls back to the manifest backdrop (#2286)', () => {
        const am = new AssetManager();
        const bg = am.getLocationBackground('coffee_shop');
        expect(bg).toEqual({ src: '/assets/backgrounds/locations/coffee_shop/coffee_shop_backdrop_00.png', fallback: true });
        expect(am.getLocationBackground('nowhere_at_all')).toBeNull();
    });

    it('renderCharacters clears before re-rendering (#2204) and sets every emotion band (#2203)', () => {
        document.body.innerHTML = '<div id="location-characters"></div>';
        let rel = 60;
        const anim = {
            characters: new Map(),
            registerCharacter: vi.fn(function (id) { this.characters.set(id, {}); }),
            createCharacterElement: vi.fn((id, el) => { const d = document.createElement('div'); d.className = 'char'; el.appendChild(d); }),
            setEmotion: vi.fn()
        };
        const npc = { id: 'emma', name: 'Emma' };
        const game = makeGame();
        game.gameState.npcManager = { getNPCsAtLocation: () => [npc], getAllNPCs: () => [npc], getRelationship: () => rel };
        const view = new LocationView(game, null, anim, null);
        view.renderCharacters('home');
        view.renderCharacters('home');
        expect(document.querySelectorAll('#location-characters .char')).toHaveLength(1);
        expect(anim.setEmotion).toHaveBeenLastCalledWith('emma', 'happy');
        rel = 30;
        view.renderCharacters('home');
        expect(anim.setEmotion).toHaveBeenLastCalledWith('emma', 'neutral');
        expect(LocationView.emotionForRelationship(-10)).toBe('sad');
    });

    it('finds the characters container inside the Lit shadow root (#2202)', () => {
        const host = document.createElement('div');
        const shadow = host.attachShadow({ mode: 'open' });
        shadow.innerHTML = '<div id="location-characters"></div>';
        document.body.appendChild(host);
        const game = makeGame({ uiUpdater: { litUIManager: { components: new Map([['locationView', host]]) } } });
        const view = new LocationView(game, null, null, null);
        expect(view.getCharactersContainer()).toBe(shadow.getElementById('location-characters'));
    });

    it('creates #location-view before asking LitUIManager to mount (#2130, #1633)', () => {
        const updateLocationView = vi.fn(() => {
            expect(document.getElementById('location-view')).not.toBeNull();
        });
        const game = makeGame({ uiUpdater: { litUIManager: { components: new Map(), updateLocationView } } });
        const view = new LocationView(game, null, null, null);
        view.showLocation('home');
        expect(updateLocationView).toHaveBeenCalled();
    });

    it('features are keyboard accessible (#878)', () => {
        document.body.innerHTML = '<div id="location-features"></div>';
        const game = makeGame();
        const view = new LocationView(game, null, null, null);
        view.interactWithFeature = vi.fn();
        view.renderFeatures([{ id: 'bed', name: 'Bed', icon: '' }]);
        const el = document.querySelector('.location-feature');
        expect(el.getAttribute('role')).toBe('button');
        expect(el.getAttribute('tabindex')).toBe('0');
        el.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(view.interactWithFeature).toHaveBeenCalled();
        const lit = readFileSync(resolve(__dirname, '../../src/js/ui/components/LocationViewComponent.js'), 'utf8');
        expect(lit).toMatch(/role="button" tabindex="0"/);
        expect(lit).toMatch(/@keydown=/);
    });
});
