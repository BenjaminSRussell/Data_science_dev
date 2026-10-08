import { describe, it, expect, vi, beforeAll } from 'vitest';
import { EventSystem } from '../../src/js/game/events/EventSystem.js';

let MainGame;
beforeAll(async () => {
    globalThis.__DSD_NO_AUTOBOOT__ = true;
    ({ MainGame } = await import('../../src/js/main.js'));
});

const tm = (year, month, day) => ({
    year, month, day,
    totalDays: EventSystem.absoluteDay(year, month, day),
    energy: 100,
    hasEnergy(n) { return this.energy >= n; },
    useEnergy(n) { this.energy -= n; return { success: true }; }
});

describe('EventSystem calendar (#922, #1704, #1710, #2412, #2414)', () => {
    it('holidays recur after Year 1 (#2412, #922)', () => {
        const gs = { timeManager: tm(3, 11, 25) };
        const es = new EventSystem(gs);
        expect(es.checkTodayEvents().map(e => e.id)).toContain('christmas');
        expect(es.upcomingEvents.filter(e => e.type === 'holiday').every(e => e.year === undefined)).toBe(true);
    });

    it('fromJSON un-pins holidays saved with year 1 (#2412)', () => {
        const es = new EventSystem({ timeManager: tm(1, 0, 1) });
        es.fromJSON({ upcomingEvents: [{ id: 'christmas', type: 'holiday', month: 11, day: 25, year: 1 }], activeEvents: [], eventHistory: [] });
        expect(es.upcomingEvents[0].year).toBeUndefined();
    });

    it('getUpcomingEvents works across the year boundary and in later years (#1710)', () => {
        const gs = { timeManager: tm(2, 11, 28) };
        const es = new EventSystem(gs);
        const soon = es.getUpcomingEvents(5, { types: ['holiday'] });
        expect(soon.map(e => e.id)).toContain('new_years');
        const ny = soon.find(e => e.id === 'new_years');
        expect(ny.occursOnDay).toBe(EventSystem.absoluteDay(3, 0, 1));
        expect(ny.inDays).toBe(3);
        // pinned one-off in the past is skipped
        expect(es.getEventDay({ year: 1, month: 0, day: 1 }, gs.timeManager.totalDays)).toBeNull();
    });

    it('holiday effects are kept and honoured (#1704)', () => {
        const gs = { timeManager: tm(1, 11, 25) };
        const es = new EventSystem(gs);
        expect(es.isShopClosed()).toBe(false);
        es.triggerEvent('christmas');
        expect(es.isShopClosed()).toBe(true);
        expect(es.getActiveEffects().npcAvailability).toBe(0.5);
        const ids = Array.from({ length: 200 }, (_, i) => `npc_${i}`);
        const around = ids.filter(id => es.isNPCAvailable(id)).length;
        expect(around).toBeGreaterThan(50);
        expect(around).toBeLessThan(150);
        expect(es.isNPCAvailable('npc_1')).toBe(es.isNPCAvailable('npc_1')); // stable
        gs.timeManager.totalDays += 1; // next day: effects lapse
        expect(es.isShopClosed()).toBe(false);
        expect(es.isNPCAvailable('npc_1')).toBe(true);
    });

    it('party attend spends energy and boosts relationships; skip is free (#2414)', () => {
        const npcManager = { boostNearbyRelationships: vi.fn(() => 3) };
        const gs = { timeManager: tm(1, 0, 15), npcManager };
        const es = new EventSystem(gs);
        const r = es.triggerEvent('office_party_0');
        expect(r.eventId).toBe('office_party_0');
        const out = es.resolvePartyAction('office_party_0', 'attend');
        expect(out.success).toBe(true);
        expect(gs.timeManager.energy).toBe(80);
        expect(npcManager.boostNearbyRelationships).toHaveBeenCalledWith(5, 'office');
        expect(es.resolvePartyAction('office_party_0', 'attend')).toBeNull(); // once
        const gs2 = { timeManager: tm(1, 1, 15), npcManager };
        const es2 = new EventSystem(gs2);
        es2.triggerEvent('office_party_1');
        expect(es2.resolvePartyAction('office_party_1', 'skip').action).toBe('skip');
        expect(gs2.timeManager.energy).toBe(100);
    });

    it('too tired to attend leaves the choice open', () => {
        const gs = { timeManager: tm(1, 0, 15), npcManager: { boostNearbyRelationships: vi.fn() } };
        gs.timeManager.energy = 5;
        const es = new EventSystem(gs);
        es.triggerEvent('office_party_0');
        expect(es.resolvePartyAction('office_party_0', 'attend').success).toBe(false);
        gs.timeManager.energy = 50;
        expect(es.resolvePartyAction('office_party_0', 'attend').success).toBe(true);
    });

    it('main offers the party choice in the shared modal and resolves it', () => {
        document.body.innerHTML = '<div id="modal-container" class="hidden"><div class="modal-backdrop"></div><div id="modal-content"></div></div>';
        const fake = {
            eventSystem: { resolvePartyAction: vi.fn(() => ({ message: 'fun', success: true })) },
            showToast: vi.fn(), uiUpdater: { updateAllUI: vi.fn() },
            getModalFocusables: MainGame.prototype.getModalFocusables,
            handleModalKeydown: () => {},
            closeModal: vi.fn()
        };
        fake.showModal = MainGame.prototype.showModal.bind(fake);
        MainGame.prototype.offerPartyChoice.call(fake, {
            eventId: 'office_party_0', name: 'Office Party', message: 'Party!',
            effects: { energyCost: 20, relationshipBonus: 5 },
            actions: [{ id: 'attend', text: 'Attend Party' }, { id: 'skip', text: 'Skip Party' }]
        });
        const btn = document.querySelector('[data-party-action="attend"]');
        expect(btn).not.toBeNull();
        btn.click();
        expect(fake.eventSystem.resolvePartyAction).toHaveBeenCalledWith('office_party_0', 'attend');
        expect(fake.showToast).toHaveBeenCalledWith('fun', 'success');
        if (fake.modalKeyHandler) document.removeEventListener('keydown', fake.modalKeyHandler);
    });
});

describe('Local map labels on touch (#2532)', () => {
    it('isCoarsePointer reads the pointer media query', async () => {
        const { UnifiedMapSystem } = await import('../../src/js/game/UnifiedMapSystem.js');
        const orig = window.matchMedia;
        window.matchMedia = (q) => ({ matches: q === '(pointer: coarse)' });
        expect(UnifiedMapSystem.isCoarsePointer()).toBe(true);
        window.matchMedia = () => ({ matches: false });
        expect(UnifiedMapSystem.isCoarsePointer()).toBe(false);
        window.matchMedia = orig;
    });

    it('labels also reveal on pointerdown and stay visible on touch', async () => {
        const fs = await import('node:fs');
        const src = fs.readFileSync('src/js/game/UnifiedMapSystem.js', 'utf8');
        expect(src).toMatch(/icon\.on\('pointerdown'/);
        expect(src).toMatch(/isCurrent \|\| UnifiedMapSystem\.isCoarsePointer\(\)/);
    });
});
