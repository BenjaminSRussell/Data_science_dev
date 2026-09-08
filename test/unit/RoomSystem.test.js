/**
 * Unit tests for RoomSystem
 */

import { describe, it, expect, beforeEach } from 'vitest';
import { RoomSystem } from '../../src/js/game/locations/RoomSystem.js';

describe('RoomSystem', () => {
    let roomSystem;

    beforeEach(() => {
        roomSystem = new RoomSystem({});
    });

    describe('getLocationRooms', () => {
        it('should return exactly 4 rooms for \'home\'', () => {
            const rooms = roomSystem.getLocationRooms('home');
            expect(rooms).toHaveLength(4);
            expect(rooms.map(r => r.id).sort()).toEqual([
                'apartment_bathroom',
                'apartment_bedroom',
                'apartment_kitchen',
                'apartment_living_room'
            ]);
        });

        it('should return an empty array for \'gym\' (no rooms registered)', () => {
            expect(roomSystem.getLocationRooms('gym')).toEqual([]);
        });
    });

    describe('getRoom', () => {
        it('should return the exact object for \'apartment_bedroom\'', () => {
            const room = roomSystem.getRoom('apartment_bedroom');
            expect(room).toEqual({
                id: 'apartment_bedroom',
                location: 'home',
                name: 'Bedroom',
                description: 'Your private bedroom',
                features: [
                    { id: 'bed', name: 'Bed', action: 'sleep' },
                    { id: 'desk', name: 'Desk', action: 'work' },
                    { id: 'closet', name: 'Closet', action: 'dress' },
                    { id: 'window', name: 'Window', action: 'view' }
                ]
            });
            expect(room.name).toBe('Bedroom');
            expect(room.features).toContainEqual({ id: 'bed', name: 'Bed', action: 'sleep' });
        });

        it('should return undefined for a non-existent room', () => {
            expect(roomSystem.getRoom('not_a_real_room')).toBeUndefined();
        });
    });

    describe('enterRoom', () => {
        it('should return { room, features: room.features, canInteract: true } for \'office_main\'', () => {
            const result = roomSystem.enterRoom('office_main');
            const room = roomSystem.getRoom('office_main');
            expect(result).toEqual({
                room: room,
                features: room.features,
                canInteract: true
            });
            expect(result.room).toBe(room);
            expect(result.features).toBe(room.features);
            expect(result.canInteract).toBe(true);
        });

        it('should return null for a non-existent room', () => {
            expect(roomSystem.enterRoom('not_a_real_room')).toBeNull();
        });
    });
});
