/**
 * LocationBackgroundSystem resolution chain (#407 #971 #2007 #2470 #2008 #1065)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LocationBackgroundSystem } from '../../src/js/game/LocationBackgroundSystem.js';
import { ScreenThemeManager } from '../../src/js/game/ScreenThemeManager.js';
import { updateEnvironmentForLocation } from '../../src/js/helpers/MapHelpers.js';
import { WorldMap, LOCATIONS } from '../../src/js/game/WorldMap.js';

function makeState(extra = {}) {
    const gs = { money: 0, reputation: 0, characterStats: { stats: {}, getStat: () => 0 }, timeManager: { timeSlot: 2 }, ...extra };
    gs.worldMap = new WorldMap(gs);
    return gs;
}

describe('LocationBackgroundSystem coverage', () => {
    let gs, lbs;
    beforeEach(() => { gs = makeState(); lbs = new LocationBackgroundSystem(gs); });
    afterEach(() => { delete window.game; vi.restoreAllMocks(); });

    it('getTimeOfDay maps 3-hour slots and defaults to afternoon', () => {
        const at = (slot) => { gs.timeManager = { timeSlot: slot }; return lbs.getTimeOfDay(); };
        expect(at(0)).toBe('morning');
        expect(at(1)).toBe('morning');
        expect(at(2)).toBe('afternoon');
        expect(at(3)).toBe('afternoon');
        expect(at(4)).toBe('evening');
        expect(at(5)).toBe('night');
        gs.timeManager = undefined;
        expect(lbs.getTimeOfDay()).toBe('afternoon');
    });

    it('home follows housing level regardless of time', () => {
        for (const level of ['mansion', 'house', 'condo']) {
            gs.housingLevel = level;
            expect(lbs.getBackground('home')).toBe(lbs.backgrounds.home[level]);
        }
        gs.housingLevel = 'shack';
        expect(lbs.getBackground('home')).toBe(lbs.backgrounds.home.apartment);
    });

    it('coffee shop follows time of day; unknown locations get the default', () => {
        gs.timeManager = { timeSlot: 4 };
        expect(lbs.getBackground('coffee_shop')).toBe(lbs.backgrounds.coffee_shop.evening);
        expect(lbs.getBackground('atlantis')).toBe(lbs.getDefaultBackground());
    });

    it("downtown uses the game's real weather, not a random roll", () => {
        const random = vi.spyOn(Math, 'random');
        gs.mainGame = { environmentManager: { currentWeather: { id: 'rainy' } } };
        expect(lbs.getBackground('downtown')).toBe(lbs.backgrounds.downtown.rain);
        gs.mainGame.environmentManager.currentWeather = { id: 'clear' };
        expect(lbs.getBackground('downtown')).toBe(lbs.backgrounds.downtown.day);
        gs.timeManager = { timeSlot: 5 };
        expect(lbs.getBackground('downtown')).toBe(lbs.backgrounds.downtown.night);
        expect(random).not.toHaveBeenCalled();
    });

    it('every WorldMap location type has its own background', () => {
        for (const loc of LOCATIONS) {
            expect(lbs.getBackground(loc.id), loc.id).not.toBe(lbs.getDefaultBackground());
        }
    });

    it('layers the WorldMap image over the gradient unless the image is known missing', () => {
        const bg = lbs.getLayeredBackground('home');
        expect(bg).toContain('url("/assets/backgrounds/locations/home.png")');
        expect(bg).toContain(lbs.getBackground('home'));
        expect(lbs.getLayeredBackground('atlantis')).toBe(lbs.getDefaultBackground());
    });

    it('applyBackground paints the element and tolerates null', () => {
        const el = document.createElement('div');
        const bg = lbs.applyBackground('gym', el);
        expect(el.style.backgroundImage).toContain('linear-gradient');
        expect(bg).toContain('linear-gradient');
        expect(() => lbs.applyBackground('gym', null)).not.toThrow();
    });

    it('travel paints the location screen and showing it keeps that background', () => {
        document.body.innerHTML = '<section id="screen-office"></section><section id="screen-map"></section>';
        gs.worldMap.currentLocation = 'library';
        window.game = { locationBackgroundSystem: lbs, worldMap: gs.worldMap };
        updateEnvironmentForLocation(window.game, 'library');
        const painted = document.getElementById('screen-office').style.backgroundImage;
        expect(painted).toContain(lbs.backgrounds.library.default.slice(0, 20));
        new ScreenThemeManager().applyTheme('screen-office');
        expect(document.getElementById('screen-office').style.backgroundImage).toBe(painted);
        expect(document.getElementById('screen-map').style.background).toBe('');
    });
});
