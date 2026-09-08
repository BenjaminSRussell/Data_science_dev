/**
 * Unit tests for DetailedMapSystem
 * Verifies the procedurally generated road grid built by initializeRoads()
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { DetailedMapSystem } from '../../src/js/game/map/DetailedMapSystem.js';

describe('DetailedMapSystem', () => {
    let mapSystem;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            npcManager: {
                getMetNPCs: () => []
            }
        };
        mapSystem = new DetailedMapSystem(mockGameState);
    });

    describe('initializeRoads (via constructor)', () => {
        it('should create 40 total roads (10 horizontal main + 10 vertical main + 20 side)', () => {
            expect(mapSystem.roads).toHaveLength(40);
        });

        it('should create 10 horizontal main streets (street_h_0..street_h_9)', () => {
            const horizontalMains = mapSystem.roads.filter(
                r => r.type === 'main' && r.direction === 'horizontal'
            );

            expect(horizontalMains).toHaveLength(10);

            horizontalMains.forEach((road, index) => {
                expect(road.id).toBe(`street_h_${index}`);
                expect(road.y).toBe(index * 10);
                expect(road.width).toBe(3);
            });
        });

        it('should create 10 vertical main streets (street_v_0..street_v_9)', () => {
            const verticalMains = mapSystem.roads.filter(
                r => r.type === 'main' && r.direction === 'vertical'
            );

            expect(verticalMains).toHaveLength(10);

            verticalMains.forEach((road, index) => {
                expect(road.id).toBe(`street_v_${index}`);
                expect(road.x).toBe(index * 10);
                expect(road.width).toBe(3);
            });
        });

        it('should create 20 side horizontal streets (side_h_0..side_h_19)', () => {
            const sideStreets = mapSystem.roads.filter(r => r.type === 'side');

            expect(sideStreets).toHaveLength(20);

            sideStreets.forEach((road, index) => {
                expect(road.id).toBe(`side_h_${index}`);
                expect(road.direction).toBe('horizontal');
                expect(road.y).toBe(index * 5);
                expect(road.width).toBe(1);
            });
        });

        it('should have unique road ids', () => {
            const ids = mapSystem.roads.map(r => r.id);
            expect(new Set(ids).size).toBe(ids.length);
        });
    });

    describe('getCityStructure', () => {
        it('should expose the same roads data as this.roads', () => {
            const structure = mapSystem.getCityStructure();
            expect(structure.roads).toBe(mapSystem.roads);
            expect(structure.roads).toHaveLength(40);
        });

        it('should include districts, roads, landmarks, and buildings', () => {
            const structure = mapSystem.getCityStructure();
            expect(structure).toHaveProperty('districts');
            expect(structure).toHaveProperty('roads');
            expect(structure).toHaveProperty('landmarks');
            expect(structure).toHaveProperty('buildings');
        });
    });
});
