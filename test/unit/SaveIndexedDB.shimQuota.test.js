/**
 * A full LocalStorage shim must not block a save when IndexedDB is available (#2714).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameState } from '../../src/js/game/GameState.js';
import { SaveManager, SAVE_KEY_PREFIX, decodeSaveString } from '../../src/js/save/SaveManager.js';

class AvailableStore {
    constructor() {
        this.available = true;
        this.failPut = false;
        this.map = new Map();
    }

    async get(slot) {
        const value = this.map.get(slot);
        return value ? JSON.parse(JSON.stringify(value)) : null;
    }

    async getAll() {
        return [...this.map.values()].map((value) => JSON.parse(JSON.stringify(value)));
    }

    async put(record) {
        if (this.failPut || !record || !Number.isInteger(record.slotIndex)) return false;
        this.map.set(record.slotIndex, JSON.parse(JSON.stringify(record)));
        return true;
    }

    async delete(slot) {
        this.map.delete(slot);
        return true;
    }
}

const KEY = SAVE_KEY_PREFIX + 0;

function gameWithMoney(money) {
    const gs = new GameState();
    gs.money = money;
    return gs;
}

/** LocalStorage keeps reading, but every save slot write fails like a full quota. */
function fillShim() {
    const setItem = Storage.prototype.setItem;
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (key, value) {
        if (key.startsWith(SAVE_KEY_PREFIX)) {
            const err = new Error('storage full');
            err.name = 'QuotaExceededError';
            throw err;
        }
        return setItem.call(this, key, value);
    });
}

describe('saves when the LocalStorage shim is full (#2714)', () => {
    let store;
    let sm;

    beforeEach(async () => {
        localStorage.clear();
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        store = new AvailableStore();
        sm = new SaveManager({ store });
        expect(sm.saveGame(gameWithMoney(100), 0)).toBe(true);
        await sm.whenPersisted();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        localStorage.clear();
    });

    it('saves to IndexedDB, reports success, and drops the stale shim', async () => {
        fillShim();
        const onSaveError = vi.fn();
        sm.onSaveError = onSaveError;

        expect(sm.saveGame(gameWithMoney(555), 0)).toBe(true);
        expect(onSaveError).not.toHaveBeenCalled();
        expect(sm.getSaveData(0).state.money).toBe(555);

        await sm.whenPersisted();
        expect(store.map.get(0).state.money).toBe(555);
        expect(localStorage.getItem(KEY)).toBeNull();
    });

    it('exports the newer save, not the stale shim', () => {
        fillShim();
        expect(sm.saveGame(gameWithMoney(555), 0)).toBe(true);
        expect(JSON.parse(decodeSaveString(sm.exportSave(0))).state.money).toBe(555);
    });

    it('a fresh session loads the IndexedDB save after the shim is dropped', async () => {
        fillShim();
        expect(sm.saveGame(gameWithMoney(555), 0)).toBe(true);
        await sm.whenPersisted();
        vi.restoreAllMocks();

        const next = new SaveManager({ store });
        await next.prepareStorage();
        const loaded = new GameState();
        expect(next.loadGame(loaded, 0)).toBe(true);
        expect(loaded.money).toBe(555);
    });

    it('keeps the old shim and reports the failure when IndexedDB also rejects the write', async () => {
        fillShim();
        const onSaveError = vi.fn();
        sm.onSaveError = onSaveError;
        store.failPut = true;
        expect(sm.saveGame(gameWithMoney(555), 0)).toBe(true);
        await sm.whenPersisted();
        expect(JSON.parse(localStorage.getItem(KEY)).state.money).toBe(100);
        expect(onSaveError).toHaveBeenCalledWith(expect.any(Error), 0);
    });

    it('still reports the failure when there is no IndexedDB to take the save', () => {
        const shimOnly = new SaveManager({ store: { put: async () => true } });
        const onSaveError = vi.fn();
        shimOnly.onSaveError = onSaveError;
        fillShim();
        expect(shimOnly.saveGame(gameWithMoney(555), 0)).toBe(false);
        expect(onSaveError).toHaveBeenCalledTimes(1);
    });
});
