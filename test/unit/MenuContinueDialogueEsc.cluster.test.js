import { describe, it, expect, vi, afterEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { SaveSlotManager } from '../../src/js/ui/SaveSlotManager.js';
import { DialogueUI } from '../../src/js/ui/DialogueUI.js';

const saveManager = () => ({
    getAllSlots: vi.fn(() => []), getSlotInfo: vi.fn(() => null), hasSave: vi.fn(() => false),
    getMostRecentSlot: vi.fn(() => null), loadGame: vi.fn(), setSlotName: vi.fn(), clearSave: vi.fn(),
    duplicateSave: vi.fn(), exportSave: vi.fn(), migrateOldSave: vi.fn(), game: null
});

describe('Continue dropdown mounts in the real menu markup (#1063)', () => {
    afterEach(() => { document.body.innerHTML = ''; vi.useRealTimers(); });

    it('index.html menu uses .menu-nav and the manager finds it', () => {
        const html = readFileSync('index.html', 'utf8');
        expect(html).toMatch(/<nav class="menu-nav"/);
        document.body.innerHTML = `<nav class="menu-nav">
            <button id="btn-new-game"></button>
            <button id="btn-continue" disabled></button></nav>`;
        const mgr = new SaveSlotManager(saveManager(), null);
        expect(mgr.createSlotsContainer()).not.toBe(false);
        const btn = document.getElementById('btn-continue-dropdown');
        expect(btn).not.toBeNull();
        expect(btn.parentElement.classList.contains('menu-nav')).toBe(true);
        expect(document.getElementById('btn-continue')).toBeNull();
    });

    it('if no nav ever appears, the plain Continue button is shown again', () => {
        vi.useFakeTimers();
        document.body.innerHTML = '<button id="btn-continue" style="display:none"></button>';
        const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});
        const mgr = new SaveSlotManager(saveManager(), null);
        mgr.createSlotsContainer();
        vi.advanceTimersByTime(100 * 25);
        expect(document.getElementById('btn-continue').style.display).toBe('');
        warn.mockRestore();
    });
});

describe('Escape closes the NPC dialogue (#1160)', () => {
    it('closes only while open', () => {
        document.body.innerHTML = '';
        const ui = new DialogueUI({});
        const close = vi.spyOn(ui, 'close');
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(close).not.toHaveBeenCalled();
        ui.isOpen = true;
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter' }));
        expect(close).not.toHaveBeenCalled();
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(close).toHaveBeenCalledTimes(1);
        expect(ui.isOpen).toBe(false);
        ui.destroy();
        ui.isOpen = true;
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(close).toHaveBeenCalledTimes(1);
    });
});

describe('save-slot options menu closes on Escape (#181)', () => {
    it('Escape inside the menu hides it and refocuses the options button', () => {
        document.body.innerHTML = '';
        const mgr = new SaveSlotManager(saveManager(), null);
        const card = document.createElement('div');
        card.innerHTML = '<button class="slot-btn-grey">⋯</button>';
        document.body.appendChild(card);
        mgr.addSlotMenu(card, { isEmpty: false, slotIndex: 0 }, 0);
        const btn = card.querySelector('.slot-btn-grey');
        const menu = card.querySelector('.slot-menu');
        btn.click();
        expect(menu.classList.contains('hidden')).toBe(false);
        const item = menu.querySelector('.menu-item');
        item.focus();
        item.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(menu.classList.contains('hidden')).toBe(true);
        expect(document.activeElement).toBe(btn);
        btn.click();
        btn.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape', bubbles: true }));
        expect(menu.classList.contains('hidden')).toBe(true);
    });
});
