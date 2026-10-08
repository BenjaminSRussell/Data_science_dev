import { describe, it, expect } from 'vitest';
import { MapProgressionSystem } from '../../src/js/game/MapProgressionSystem.js';

describe('MapProgressionSystem saves progress, not the catalog (#2013)', () => {
    it('toJSON omits mapData', () => {
        const mps = new MapProgressionSystem({});
        mps.unlockedMaps.push('mid_game');
        const data = JSON.parse(JSON.stringify(mps.toJSON()));
        expect(data).toEqual({ currentMap: 'early_game', unlockedMaps: ['early_game', 'mid_game'] });
    });

    it('fromJSON ignores a frozen catalog from an old save and uses current thresholds', () => {
        const mps = new MapProgressionSystem({});
        const live = mps.initializeMaps().mid_game.unlockRequirement;
        mps.fromJSON({
            currentMap: 'mid_game',
            unlockedMaps: ['early_game', 'mid_game'],
            mapData: { mid_game: { id: 'mid_game', unlockRequirement: { days: 1, reputation: 0 } } }
        });
        expect(mps.mapData.mid_game.unlockRequirement).toEqual(live);
        expect(mps.mapData.end_game).toBeDefined();
        expect(mps.currentMap).toBe('mid_game');
    });

    it('drops unknown map ids and falls back to early_game', () => {
        const mps = new MapProgressionSystem({});
        mps.fromJSON({ currentMap: 'atlantis', unlockedMaps: ['atlantis', 'mid_game', 'mid_game'] });
        expect(mps.unlockedMaps).toEqual(['early_game', 'mid_game']);
        expect(mps.currentMap).toBe('early_game');
        // being on a map implies it is unlocked
        mps.fromJSON({ currentMap: 'end_game', unlockedMaps: ['early_game'] });
        expect(mps.currentMap).toBe('end_game');
        expect(mps.unlockedMaps).toEqual(['early_game', 'end_game']);
    });
});
