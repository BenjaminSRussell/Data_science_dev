// @vitest-environment node
import { describe, it, expect, vi } from 'vitest';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { WorldMap, LOCATIONS, VEHICLES } from '../../src/js/game/WorldMap.js';
import { LocationTester } from '../../src/js/dev/LocationTester.js';
import { MISSING_ASSETS } from '../../src/js/assets/MissingAssetBlocklist.js';
import { resolveTopLevelAsset } from '../../vite.config.js';

const onDisk = (urlPath) => existsSync(join(process.cwd(), urlPath.replace(/^\//, '')));
const bgPath = (bg) => bg.match(/url\("([^"]+)"\)/)[1];

function makeMap(extra = {}) {
    return new WorldMap({ money: 1e9, reputation: 1e6, characterStats: { stats: {}, getStat: () => 999 }, ...extra });
}

describe('WorldMap asset paths (#2536, #1433)', () => {
    it('every location icon and background points at a real file under assets/', () => {
        for (const loc of LOCATIONS) {
            expect(onDisk(loc.icon), loc.icon).toBe(true);
            expect(onDisk(bgPath(loc.background)), loc.background).toBe(true);
        }
    });

    it('every vehicle has its own existing icon; sports_car is not used_car', () => {
        const icons = VEHICLES.map(v => v.icon);
        expect(new Set(icons).size).toBe(icons.length);
        for (const v of VEHICLES) expect(onDisk(v.icon), v.icon).toBe(true);
        expect(VEHICLES.find(v => v.id === 'sports_car').icon).toBe('/assets/icons/vehicles/sports_car.png');
    });

    it('the missing-asset blocklist only lists files that really are missing', () => {
        for (const p of MISSING_ASSETS) {
            expect(existsSync(p) || existsSync(join('public', p)), p).toBe(false);
        }
    });
});

describe('vite serves top-level assets/ (#2285, #1039)', () => {
    it('resolves files inside assets/ and refuses escapes or misses', () => {
        expect(resolveTopLevelAsset('/icons/locations/home.png')).toMatch(/assets[\\/]icons[\\/]locations[\\/]home\.png$/);
        expect(resolveTopLevelAsset('/icons/locations/home.png?v=2')).not.toBeNull();
        expect(resolveTopLevelAsset('/../package.json')).toBeNull();
        expect(resolveTopLevelAsset('/%2e%2e/package.json')).toBeNull();
        expect(resolveTopLevelAsset('/icons/nope.png')).toBeNull();
        expect(resolveTopLevelAsset('/icons')).toBeNull(); // directories are not served
    });

    it('the config no longer copies into public/', () => {
        const cfg = readFileSync('vite.config.js', 'utf8');
        expect(cfg).not.toMatch(/copyAudioAssets|copyLocationBackgrounds/);
        expect(cfg).toContain('serveTopLevelAssets()');
    });
});

describe('WorldMap overrides, access cache, visits (#1339, #1435, #2355, #1436)', () => {
    it('updateLocation re-skins the cached accessible list immediately', () => {
        const wm = makeMap();
        expect(wm.getAccessibleLocations().find(l => l.id === 'library').name).toBe('Public Library');
        wm.updateLocation('library', { name: 'Innovation Hub' });
        expect(wm.getAccessibleLocations().find(l => l.id === 'library').name).toBe('Innovation Hub');
        expect(wm.getLocation('library').name).toBe('Innovation Hub');
        wm.resetLocation('library');
        expect(wm.getAccessibleLocations().find(l => l.id === 'library').name).toBe('Public Library');
    });

    it('canTravelTo uses a Set lookup, not a linear scan of the cached list', () => {
        const wm = makeMap();
        wm.getAccessibleLocations();
        const some = vi.spyOn(Array.prototype, 'some');
        expect(wm.canTravelTo('gym').can).toBe(true);
        expect(some).not.toHaveBeenCalled();
        some.mockRestore();
        expect(wm.canTravelTo('atlantis').can).toBe(false);
    });

    it('hasVisited tracks travel', () => {
        const wm = makeMap();
        expect(wm.hasVisited('home')).toBe(true);
        expect(wm.hasVisited('gym')).toBe(false);
        wm.travelTo('gym');
        expect(wm.hasVisited('gym')).toBe(true);
    });

    it('an empty ownedVehicles array in a save still leaves walking owned', () => {
        const wm = makeMap();
        wm.fromJSON({ ownedVehicles: [], currentVehicle: 'sedan' });
        expect(wm.ownedVehicles.has('walking')).toBe(true);
        expect(wm.currentVehicle).toBe('walking');
        expect(wm.switchVehicle('walking').success).toBe(true);
    });
});

describe('LocationTester roster (#2473)', () => {
    it('falls back to the real WorldMap locations, with no fake ids', () => {
        const ids = new LocationTester({}).getAllLocations().map(l => l.id);
        expect(ids.sort()).toEqual(LOCATIONS.map(l => l.id).sort());
        for (const fake of ['park', 'apartment', 'club', 'forest']) expect(ids).not.toContain(fake);
    });
});

describe('README location roster (#1963)', () => {
    it('names every real location and none of the fictional ones', () => {
        const line = readFileSync('README.md', 'utf8').split('\n').find(l => l.includes('19 locations'));
        for (const loc of LOCATIONS) expect(line, loc.name).toContain(loc.name);
        for (const fake of ['Park', 'Club', 'Forest']) expect(line).not.toMatch(new RegExp(`\\b${fake}\\b`));
    });
});
