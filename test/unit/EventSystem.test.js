/**
 * Unit tests for EventSystem
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { EventSystem } from '../../src/js/game/events/EventSystem.js';

describe('EventSystem', () => {
    let eventSystem;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            timeManager: {
                day: 1,
                month: 0,
                year: 1,
                totalDays: 1
            },
            stockMarket: {
                crash: vi.fn(),
                boost: vi.fn()
            }
        };
        eventSystem = new EventSystem(mockGameState);
    });

    describe('constructor', () => {
        it('should initialize with empty active events', () => {
            expect(eventSystem.activeEvents).toEqual([]);
            expect(eventSystem.upcomingEvents.length).toBeGreaterThan(0);
            expect(eventSystem.eventHistory).toEqual([]);
        });
    });

    describe('triggerEvent', () => {
        it('should add event to activeEvents when triggered', () => {
            const event = eventSystem.upcomingEvents[0];
            eventSystem.triggerEvent(event.id);

            expect(eventSystem.activeEvents.length).toBe(1);
            expect(eventSystem.activeEvents[0].event.id).toBe(event.id);
        });

        it('should not trigger the same event twice on same day', () => {
            const event = eventSystem.upcomingEvents[0];
            const eventId = event.id;

            // First trigger
            eventSystem.triggerEvent(eventId);
            expect(eventSystem.activeEvents.length).toBe(1);

            // Try to trigger same event again - should not add duplicate
            eventSystem.triggerEvent(eventId);
            expect(eventSystem.activeEvents.length).toBe(1);
        });

        it('should allow different events to be active simultaneously', () => {
            const event1 = eventSystem.upcomingEvents[0];
            const event2 = eventSystem.upcomingEvents[1];

            eventSystem.triggerEvent(event1.id);
            eventSystem.triggerEvent(event2.id);

            expect(eventSystem.activeEvents.length).toBe(2);
        });

        it('should return null for non-existent event', () => {
            const result = eventSystem.triggerEvent('non_existent_event');
            expect(result).toBeNull();
        });

        it('should handle stock crash events', () => {
            const crashEvent = {
                id: 'test_crash',
                name: 'Test Crash',
                type: 'crash',
                severity: 30
            };
            eventSystem.upcomingEvents.push(crashEvent);

            const result = eventSystem.triggerEvent('test_crash');
            expect(result.type).toBe('crash');
            expect(mockGameState.stockMarket.crash).toHaveBeenCalledWith(30);
        });

        it('should handle bull market events', () => {
            const bullEvent = {
                id: 'test_bull',
                name: 'Test Bull',
                type: 'bull',
                boost: 20
            };
            eventSystem.upcomingEvents.push(bullEvent);

            const result = eventSystem.triggerEvent('test_bull');
            expect(result.type).toBe('bull');
            expect(mockGameState.stockMarket.boost).toHaveBeenCalledWith(20);
        });
    });

    describe('clearExpiredEvents', () => {
        it('should remove expired active events', () => {
            const event = eventSystem.upcomingEvents[0];
            
            // Trigger event
            eventSystem.triggerEvent(event.id);
            expect(eventSystem.activeEvents.length).toBe(1);

            // Advance time beyond expiry
            mockGameState.timeManager.totalDays = 10;
            eventSystem.clearExpiredEvents();

            expect(eventSystem.activeEvents.length).toBe(0);
        });

        it('should allow recurring events to trigger again after expiry', () => {
            // Find a recurring office party event
            const officeParty = eventSystem.upcomingEvents.find(e => e.id === 'office_party_0');
            expect(officeParty).toBeDefined();

            // First trigger on day 1
            eventSystem.triggerEvent('office_party_0');
            expect(eventSystem.activeEvents.length).toBe(1);

            // Advance one day - event should expire
            mockGameState.timeManager.totalDays = 2;
            eventSystem.clearExpiredEvents();
            expect(eventSystem.activeEvents.length).toBe(0);

            // Try to trigger same event again - should succeed because it expired
            const result = eventSystem.triggerEvent('office_party_0');
            expect(result).not.toBeNull();
            expect(eventSystem.activeEvents.length).toBe(1);
        });
    });

    describe('checkTodayEvents', () => {
        it('should return events scheduled for today', () => {
            mockGameState.timeManager = {
                day: 1,
                month: 0,
                year: 1
            };

            const todayEvents = eventSystem.checkTodayEvents();
            expect(Array.isArray(todayEvents)).toBe(true);
        });
    });

    describe('getUpcomingEvents', () => {
        it('should return upcoming events within specified days', () => {
            const upcomingEvents = eventSystem.getUpcomingEvents(7);
            expect(Array.isArray(upcomingEvents)).toBe(true);
        });
    });
});
