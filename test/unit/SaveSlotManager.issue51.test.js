/**
 * SaveSlotManager Unit Tests
 * Tests for listener leak fix (issue #51)
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SaveSlotManager } from '../../src/js/ui/SaveSlotManager.js';

describe('SaveSlotManager', () => {
    let saveManager;
    let slotManager;
    let addEventListenerSpy;
    let removeEventListenerSpy;

    beforeEach(() => {
        // Mock localStorage
        const localStorageMock = {
            getItem: vi.fn(() => null),
            setItem: vi.fn(),
            removeItem: vi.fn(),
            clear: vi.fn(),
            length: 0
        };
        Object.defineProperty(window, 'localStorage', {
            value: localStorageMock,
            writable: true
        });

        // Create mock SaveManager
        saveManager = {
            getAllSlotsInfo: vi.fn(() => [
                { isEmpty: false, slotIndex: 0, rank: 1, money: 1000, reputation: 100, daysPlayed: 5, metadata: { name: 'Save 1', lastPlayed: Date.now() } },
                { isEmpty: true, slotIndex: 1, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 2, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 3, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 4, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} }
            ]),
            hasSave: vi.fn(() => false),
            getSaveInfo: vi.fn(() => ({ isEmpty: false })),
            setSlotName: vi.fn(() => true),
            clearSave: vi.fn(() => true),
            duplicateSave: vi.fn(() => true),
            exportSave: vi.fn(() => 'encoded_data'),
            game: null
        };

        // Create SaveSlotManager
        slotManager = new SaveSlotManager(saveManager, null);

        // Set up DOM elements
        const menuNav = document.createElement('div');
        menuNav.className = 'menu-navigation';
        document.body.appendChild(menuNav);

        // Spy on document event listener methods
        addEventListenerSpy = vi.spyOn(document, 'addEventListener');
        removeEventListenerSpy = vi.spyOn(document, 'removeEventListener');
    });

    afterEach(() => {
        // Clean up DOM
        const menuNav = document.querySelector('.menu-navigation');
        if (menuNav) menuNav.remove();
        const dropdown = document.getElementById('save-slots-dropdown');
        if (dropdown) dropdown.remove();
        const btn = document.getElementById('btn-continue-dropdown');
        if (btn) btn.remove();

        addEventListenerSpy.mockRestore();
        removeEventListenerSpy.mockRestore();
    });

    describe('addSlotMenu listener leak prevention', () => {
        it('should not add multiple document click listeners when renderSlots is called multiple times', () => {
            // Initialize the manager
            slotManager.init();

            // Clear spy history from init
            addEventListenerSpy.mockClear();
            removeEventListenerSpy.mockClear();

            // First render - should add 1 click listener (for the filled slot at index 0)
            slotManager.toggleDropdown();
            const firstRenderAddCalls = addEventListenerSpy.mock.calls.filter(
                call => call[0] === 'click'
            ).length;

            // Clear spy history
            addEventListenerSpy.mockClear();
            removeEventListenerSpy.mockClear();

            // Second render (toggle off then on) - should remove the old listener and add a new one
            slotManager.toggleDropdown(); // close
            slotManager.toggleDropdown(); // open (this causes renderSlots to be called again)

            const secondRenderAddCalls = addEventListenerSpy.mock.calls.filter(
                call => call[0] === 'click'
            ).length;
            const secondRenderRemoveCalls = removeEventListenerSpy.mock.calls.filter(
                call => call[0] === 'click'
            ).length;

            // With the fix: should remove 1 old listener and add 1 new listener
            // The key assertion: remove count should equal add count for click listeners
            expect(secondRenderRemoveCalls).toBeGreaterThan(0);
            expect(secondRenderAddCalls).toBeGreaterThan(0);
            expect(secondRenderRemoveCalls).toEqual(secondRenderAddCalls);
        });

        it('should remove listener for a slot when renderSlots creates new slot elements', () => {
            // Initialize
            slotManager.init();
            addEventListenerSpy.mockClear();
            removeEventListenerSpy.mockClear();

            // Open dropdown
            slotManager.toggleDropdown();
            const firstOpenAddCalls = addEventListenerSpy.mock.calls.length;

            addEventListenerSpy.mockClear();
            removeEventListenerSpy.mockClear();

            // Close and reopen - this calls renderSlots which rebuilds elements
            slotManager.toggleDropdown();
            slotManager.toggleDropdown();

            // The old listener should be removed
            const removeCalls = removeEventListenerSpy.mock.calls;
            const clickRemoves = removeCalls.filter(call => call[0] === 'click');

            // Should have removed at least the slot menu listener
            expect(clickRemoves.length).toBeGreaterThan(0);
        });

        it('should track listeners by slot index correctly', () => {
            // Initialize
            slotManager.init();

            // Verify slotMenuListeners is initialized
            expect(slotManager.slotMenuListeners).toBeDefined();
            expect(typeof slotManager.slotMenuListeners).toBe('object');

            // Open dropdown to add listeners
            slotManager.toggleDropdown();

            // Check that listeners are tracked by slot index
            expect(slotManager.slotMenuListeners[0]).toBeDefined();
            expect(typeof slotManager.slotMenuListeners[0]).toBe('function');
        });

        it('should clean up listeners when a filled slot becomes empty (delete scenario)', () => {
            // Initialize
            slotManager.init();
            addEventListenerSpy.mockClear();
            removeEventListenerSpy.mockClear();

            // Open dropdown - slot 0 is filled, so addSlotMenu adds a listener
            slotManager.toggleDropdown();
            const listenerAdded = slotManager.slotMenuListeners[0];
            expect(listenerAdded).toBeDefined();

            addEventListenerSpy.mockClear();
            removeEventListenerSpy.mockClear();

            // Simulate deleteSlot: change slot 0 to empty and call renderSlots
            saveManager.getAllSlotsInfo.mockReturnValueOnce([
                { isEmpty: true, slotIndex: 0, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 1, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 2, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 3, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 4, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} }
            ]);

            // Call renderSlots (simulating what deleteSlot does)
            slotManager.renderSlots();

            // The old listener should have been removed
            const removeCalls = removeEventListenerSpy.mock.calls;
            const clickRemoves = removeCalls.filter(call => call[0] === 'click');
            expect(clickRemoves.length).toBeGreaterThan(0);

            // slotMenuListeners should be cleared at the start of renderSlots
            // and since slot 0 is now empty, no new listener should be added
            expect(slotManager.slotMenuListeners[0]).toBeUndefined();
        });

        it('should prevent listener leak when deleting and refilling the same slot', () => {
            // Initialize with function that returns default state
            const defaultSlots = () => [
                { isEmpty: false, slotIndex: 0, rank: 1, money: 1000, reputation: 100, daysPlayed: 5, metadata: { name: 'Save 1', lastPlayed: Date.now() } },
                { isEmpty: true, slotIndex: 1, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 2, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 3, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 4, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} }
            ];

            saveManager.getAllSlotsInfo = vi.fn(defaultSlots);
            slotManager = new SaveSlotManager(saveManager, null);
            slotManager.init();
            addEventListenerSpy.mockClear();
            removeEventListenerSpy.mockClear();

            // First, open dropdown and create listener for slot 0 (filled)
            slotManager.toggleDropdown();
            const firstListener = slotManager.slotMenuListeners[0];
            expect(firstListener).toBeDefined();

            addEventListenerSpy.mockClear();
            removeEventListenerSpy.mockClear();

            // Delete slot 0 (make it empty)
            saveManager.getAllSlotsInfo = vi.fn(() => [
                { isEmpty: true, slotIndex: 0, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 1, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 2, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 3, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 4, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} }
            ]);
            slotManager.renderSlots();

            // Verify the old listener was removed
            let removeCalls = removeEventListenerSpy.mock.calls.filter(call => call[0] === 'click');
            expect(removeCalls.length).toBeGreaterThan(0);
            expect(slotManager.slotMenuListeners[0]).toBeUndefined();

            addEventListenerSpy.mockClear();
            removeEventListenerSpy.mockClear();

            // Now refill slot 0 (duplicate into the same slot)
            saveManager.getAllSlotsInfo = vi.fn(() => [
                { isEmpty: false, slotIndex: 0, rank: 1, money: 1000, reputation: 100, daysPlayed: 5, metadata: { name: 'Save 1', lastPlayed: Date.now() } },
                { isEmpty: true, slotIndex: 1, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 2, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 3, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} },
                { isEmpty: true, slotIndex: 4, rank: 0, money: 0, reputation: 0, daysPlayed: 0, metadata: {} }
            ]);
            slotManager.renderSlots();

            // A new listener should be added for slot 0
            const secondListener = slotManager.slotMenuListeners[0];
            expect(secondListener).toBeDefined();
            expect(secondListener).not.toEqual(firstListener);

            // Count listeners added during refill phase
            let addCalls = addEventListenerSpy.mock.calls.filter(call => call[0] === 'click');

            // Should have added the new listener for the refilled slot
            expect(addCalls.length).toBeGreaterThan(0);
        });
    });
});
