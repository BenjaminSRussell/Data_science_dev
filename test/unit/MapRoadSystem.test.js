import { describe, it, expect } from 'vitest';
import MapRoadSystem from '../../src/MapRoadSystem';

// Mock gridSystem
const gridSystem = {
  gridWidth: 20,
  gridHeight: 20,
  getGridKey: (x, y) => `${x}-${y}`
};

describe('MapRoadSystem', () => {
  let mapRoadSystem;

  beforeEach(() => {
    mapRoadSystem = new MapRoadSystem(gridSystem);
  });

  describe('initializeRoadNetwork', () => {
    it('should create main roads at rows/cols multiple of 6', () => {
      mapRoadSystem.initializeRoadNetwork();
      for (let i = 0; i < gridSystem.gridHeight; i++) {
        for (let j = 0; j < gridSystem.gridWidth; j++) {
          const key = gridSystem.getGridKey(j, i);
          if (i % 6 === 0 || j % 6 === 0) {
            expect(mapRoadSystem.roadNetwork.has(key)).toBe(true);
            const road = mapRoadSystem.roadNetwork.get(key);
            expect(road.type).toBe('MAIN');
            expect(road.width).toBe(4);
          } else {
            expect(mapRoadSystem.roadNetwork.has(key)).toBe(false);
          }
        }
      }
    });

    it('should create secondary roads at rows/cols multiple of 3, 9, 15', () => {
      mapRoadSystem.initializeRoadNetwork();
      for (let i = 0; i < gridSystem.gridHeight; i++) {
        for (let j = 0; j < gridSystem.gridWidth; j++) {
          const key = gridSystem.getGridKey(j, i);
          if ((i % 3 === 0 && i % 6 !== 0) || (j % 3 === 0 && j % 6 !== 0)) {
            expect(mapRoadSystem.roadNetwork.has(key)).toBe(true);
            const road = mapRoadSystem.roadNetwork.get(key);
            expect(road.type).toBe('SECONDARY');
            expect(road.width).toBe(2);
          } else {
            expect(mapRoadSystem.roadNetwork.has(key)).toBe(false);
          }
        }
      }
    });
  });

  describe('addRoad', () => {
    it('should add a secondary road with width 2', () => {
      mapRoadSystem.addRoad('HORIZONTAL', 5, 'SECONDARY', 3, 15);
      for (let j = 3; j <= 15; j++) {
        const key = gridSystem.getGridKey(j, 5);
        expect(mapRoadSystem.roadNetwork.has(key)).toBe(true);
        const road = mapRoadSystem.roadNetwork.get(key);
        expect(road.type).toBe('SECONDARY');
        expect(road.width).toBe(2);
      }
    });

    it('should add a main road with width 4', () => {
      mapRoadSystem.addRoad('VERTICAL', 10, 'MAIN', 3, 15);
      for (let i = 3; i <= 15; i++) {
        const key = gridSystem.getGridKey(10, i);
        expect(mapRoadSystem.roadNetwork.has(key)).toBe(true);
        const road = mapRoadSystem.roadNetwork.get(key);
        expect(road.type).toBe('MAIN');
        expect(road.width).toBe(4);
      }
    });
  });

  describe('findIntersections', () => {
    it('should find intersections correctly', () => {
      mapRoadSystem.addRoad('HORIZONTAL', 5, 'MAIN', 3, 15);
      mapRoadSystem.addRoad('VERTICAL', 10, 'MAIN', 3, 15);
      mapRoadSystem.findIntersections();

      const intersectionKey = gridSystem.getGridKey(10, 5);
      expect(mapRoadSystem.roadNetwork.has(intersectionKey)).toBe(true);
      const intersection = mapRoadSystem.roadNetwork.get(intersectionKey);
      expect(intersection.type).toBe('4-way');
      expect(intersection.roads.length).toBe(2);
    });
  });

  describe('getRoadsAt', () => {
    it('should return roads at specific x,y', () => {
      mapRoadSystem.addRoad('HORIZONTAL', 5, 'MAIN', 3, 15);
      mapRoadSystem.addRoad('VERTICAL', 10, 'MAIN', 3, 15);

      const roadsAt5_10 = mapRoadSystem.getRoadsAt(10, 5);
      expect(roadsAt5_10.length).toBe(2);
      expect(roadsAt5_10.some(road => road.type === 'MAIN' && road.direction === 'HORIZONTAL')).toBe(true);
      expect(roadsAt5_10.some(road => road.type === 'MAIN' && road.direction === 'VERTICAL')).toBe(true);
    });
  });

  describe('isRoad', () => {
    it('should return true for cells on a road', () => {
      mapRoadSystem.addRoad('HORIZONTAL', 5, 'MAIN', 3, 15);
      expect(mapRoadSystem.isRoad(10, 5)).toBe(true);
    });

    it('should return false for cells not on a road', () => {
      expect(mapRoadSystem.isRoad(10, 5)).toBe(false);
    });
  });

  describe('isOnRoad', () => {
    it('should return true for cells within a road\'s range', () => {
      mapRoadSystem.addRoad('HORIZONTAL', 5, 'MAIN', 3, 15);
      expect(mapRoadSystem.isOnRoad(10, 5)).toBe(true);
      expect(mapRoadSystem.isOnRoad(4, 5)).toBe(false);
      expect(mapRoadSystem.isOnRoad(16, 5)).toBe(false);
    });

    it('should return false for cells not within a road\'s range', () => {
      expect(mapRoadSystem.isOnRoad(10, 5)).toBe(false);
    });
  });
});