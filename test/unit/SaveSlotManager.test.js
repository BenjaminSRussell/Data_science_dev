/**
 * Unit tests for SaveSlotManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { SaveSlotManager } from '../../src/js/ui/SaveSlotManager.js';
import { RANKS } from '../../src/js/data/ranks.js';

describe('SaveSlotManager', () => {
    let manager;
    let fakeSaveManager;
    let noopCallback;

    beforeEach(() => {
        fakeSaveManager = {
            getAllSlotsInfo: () => [],
            hasSave: () => false
        };
        noopCallback = () => {};
        manager = new SaveSlotManager(fakeSaveManager, noopCallback);
        document.body.innerHTML = '';
    });

    afterEach(() => {
        vi.useRealTimers();
    });

    const makeSlot = (overrides = {}) => ({
        slotIndex: 0,
        isEmpty: false,
        rank: 0,
        money: 0,
        reputation: 0,
        daysPlayed: 0,
        metadata: { name: 'Test Save', lastPlayed: Date.now() },
        ...overrides
    });

    describe('constructor', () => {
        it('should store its dependencies', () => {
            expect(manager.saveManager).toBe(fakeSaveManager);
            expect(manager.onSlotSelected).toBe(noopCallback);
            expect(manager.currentSlot).toBeNull();
        });
    });

    describe('createFilledSlotHTML - completion percentage capping', () => {
        it('should render 100% for rank 6', () => {
            const html = manager.createFilledSlotHTML(makeSlot({ rank: 6 }));
            expect(html).toContain('100%');
        });

        it('should clamp to 100% for rank 7 (corrupted data)', () => {
            const html = manager.createFilledSlotHTML(makeSlot({ rank: 7 }));
            expect(html).toContain('100%');
            expect(html).not.toContain('116%');
        });

        it('should render 0% for rank 0', () => {
            const html = manager.createFilledSlotHTML(makeSlot({ rank: 0 }));
            expect(html).toContain('0%');
        });
    });

    describe('createFilledSlotHTML - last played date buckets', () => {
        const NOW = new Date('2024-06-15T12:00:00');

        beforeEach(() => {
            vi.useFakeTimers();
            vi.setSystemTime(NOW);
        });

        const daysAgo = (n) => NOW.getTime() - n * 24 * 60 * 60 * 1000;

        it('should show "Today" when diffDays is 0', () => {
            const html = manager.createFilledSlotHTML(
                makeSlot({ metadata: { name: 'S', lastPlayed: NOW.getTime() - 3600 * 1000 } })
            );
            expect(html).toContain('Today');
        });

        it('should show "Yesterday" when diffDays is 1', () => {
            const html = manager.createFilledSlotHTML(
                makeSlot({ metadata: { name: 'S', lastPlayed: daysAgo(1) } })
            );
            expect(html).toContain('Yesterday');
        });

        it('should show "N days ago" for 2-6 days', () => {
            const html = manager.createFilledSlotHTML(
                makeSlot({ metadata: { name: 'S', lastPlayed: daysAgo(3) } })
            );
            expect(html).toContain('3 days ago');
        });

        it('should fall through to toLocaleDateString for 7+ days', () => {
            const lastPlayed = daysAgo(10);
            const html = manager.createFilledSlotHTML(
                makeSlot({ metadata: { name: 'S', lastPlayed } })
            );
            expect(html).toContain(new Date(lastPlayed).toLocaleDateString());
            expect(html).not.toContain('days ago');
        });
    });

    describe('createFilledSlotHTML - fallbacks', () => {
        it('should fall back to "Save Slot N" when metadata is absent', () => {
            const slot = makeSlot({ slotIndex: 2 });
            delete slot.metadata;
            slot.timestamp = Date.now();
            const html = manager.createFilledSlotHTML(slot);
            expect(html).toContain('Save Slot 3');
        });

        it('should fall back to RANKS[0] for an out-of-range rank index', () => {
            const html = manager.createFilledSlotHTML(makeSlot({ rank: 99 }));
            expect(html).toContain(RANKS[0].title);
        });
    });

    describe('createFilledSlotHTML - money/reputation formatting', () => {
        it('should render 0 for money: 0 and reputation: undefined', () => {
            const slot = makeSlot({ money: 0, reputation: undefined });
            const html = manager.createFilledSlotHTML(slot);
            expect(html).toContain('$0');
            expect(html).toContain('0 Rep');
            expect(html).not.toContain('undefined');
        });
    });
});
