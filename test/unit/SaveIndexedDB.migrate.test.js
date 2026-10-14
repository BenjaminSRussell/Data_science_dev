/**
 * IndexedDB saves, LocalStorage shim migration, and JSON export/import (#2714).
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { GameState } from '../../src/js/game/GameState.js';
import {
    SaveManager, SAVE_KEY_PREFIX, MAX_SAVE_SLOTS, LOCALSTORAGE_MIGRATION, LEGACY_UNSLOTTED_SAVE_KEY
} from '../../src/js/save/SaveManager.js';
import { IndexedDBSaveStore, IDB_DB_NAME, IDB_STORE, IDB_SCHEMA_VERSION } from '../../src/js/save/IndexedDBSaveStore.js';
import { downloadSaveJson } from '../../src/js/save/saveTransferUI.js';

vi.hoisted(() => { globalThis.__DSD_NO_AUTOBOOT__ = true; });

import { MainGame } from '../../src/js/main.js';
import { AudioManager } from '../../src/js/audio/AudioManager.js';

class MemorySaveStore {
    constructor() {
        this.map = new Map();
    }

    async get(slot) {
        const value = this.map.get(slot);
        return value ? JSON.parse(JSON.stringify(value)) : null;
    }

    async getAll() {
        return [...this.map.values()].map(value => JSON.parse(JSON.stringify(value)));
    }

    async put(record) {
        if (!record || !Number.isInteger(record.slotIndex)) return false;
        this.map.set(record.slotIndex, JSON.parse(JSON.stringify(record)));
        return true;
    }

    async delete(slot) {
        this.map.delete(slot);
        return true;
    }
}

function createFakeIndexedDB() {
    const databases = new Map();

    function later(result) {
        const request = {};
        queueMicrotask(() => {
            request.result = result;
            request.onsuccess?.();
        });
        return request;
    }

    function makeDb(name, version, prev) {
        const stores = new Map(prev ? prev._stores : []);
        return {
            name,
            version,
            _stores: stores,
            objectStoreNames: {
                contains: (storeName) => stores.has(storeName)
            },
            createObjectStore(storeName, options = {}) {
                const rows = new Map();
                rows.keyPath = options.keyPath || 'slotIndex';
                stores.set(storeName, rows);
                return rows;
            },
            transaction(storeName) {
                const rows = stores.get(storeName);
                if (!rows) throw new Error(`missing store ${storeName}`);
                return {
                    objectStore() {
                        return {
                            get: (key) => later(rows.has(key) ? JSON.parse(JSON.stringify(rows.get(key))) : undefined),
                            getAll: () => later([...rows.values()].map(value => JSON.parse(JSON.stringify(value)))),
                            put: (value) => {
                                const key = value[rows.keyPath];
                                rows.set(key, JSON.parse(JSON.stringify(value)));
                                return later(key);
                            },
                            delete: (key) => {
                                rows.delete(key);
                                return later(undefined);
                            }
                        };
                    }
                };
            },
            close() {}
        };
    }

    return {
        open(name, version) {
            const request = {};
            queueMicrotask(() => {
                const prev = databases.get(name);
                const db = prev && prev.version >= version ? prev : makeDb(name, version, prev);
                if (!prev || prev.version < version) {
                    request.result = db;
                    request.onupgradeneeded?.();
                    databases.set(name, db);
                }
                request.result = db;
                request.onsuccess?.();
            });
            return request;
        }
    };
}

describe('IndexedDB save store', () => {
    it('opens a versioned object store and round-trips a slot', async () => {
        const store = new IndexedDBSaveStore(createFakeIndexedDB());
        const record = {
            version: 1,
            slotIndex: 2,
            timestamp: 10,
            metadata: { name: 'A' },
            state: { money: 15, rankIndex: 1, tasksCompleted: 3 }
        };
        expect(await store.put(record)).toBe(true);
        expect(await store.get(2)).toEqual(record);
        expect(await store.getAll()).toEqual([record]);
        expect(await store.delete(2)).toBe(true);
        expect(await store.get(2)).toBeNull();
        expect(store.available).toBe(true);
    });

    it('no-ops when IndexedDB is missing', async () => {
        const store = new IndexedDBSaveStore(null);
        expect(store.available).toBe(false);
        expect(await store.put({ slotIndex: 0, state: {} })).toBe(false);
        expect(await store.get(0)).toBeNull();
        expect(await store.getAll()).toEqual([]);
        expect(await store.delete(0)).toBe(false);
    });
});

describe('LocalStorage to IndexedDB migration', () => {
    let store;
    let sm;

    beforeEach(() => {
        localStorage.clear();
        store = new MemorySaveStore();
        sm = new SaveManager({ store });
    });

    it('documents the old LocalStorage keys and IndexedDB schema', () => {
        expect(LOCALSTORAGE_MIGRATION.legacyUnslottedKey).toBe(LEGACY_UNSLOTTED_SAVE_KEY);
        expect(LOCALSTORAGE_MIGRATION.legacyUnslottedKey).toBe('data_science_tycoon_save');
        expect(LOCALSTORAGE_MIGRATION.slotKeyPrefix).toBe(SAVE_KEY_PREFIX);
        expect(LOCALSTORAGE_MIGRATION.slots).toBe(MAX_SAVE_SLOTS);
        expect(LOCALSTORAGE_MIGRATION.indexedDBName).toBe(IDB_DB_NAME);
        expect(LOCALSTORAGE_MIGRATION.objectStore).toBe(IDB_STORE);
        expect(LOCALSTORAGE_MIGRATION.schemaVersion).toBe(IDB_SCHEMA_VERSION);
        expect(IDB_SCHEMA_VERSION).toBe(1);
    });

    it('copies an unversioned slot into IndexedDB and leaves the shim key', async () => {
        localStorage.setItem(SAVE_KEY_PREFIX + 1, JSON.stringify({
            money: 80, rankIndex: 4, tasksCompleted: 9, timestamp: 3
        }));
        const result = await sm.migrateFromLocalStorage();
        expect(result.migrated).toEqual([1]);
        expect(result.legacy).toBe(false);
        expect(localStorage.getItem(SAVE_KEY_PREFIX + 1)).not.toBeNull();

        const saved = await store.get(1);
        expect(saved.version).toBe(1);
        expect(saved.slotIndex).toBe(1);
        expect(saved.state.money).toBe(80);
        expect(saved.state.rankIndex).toBe(4);
        expect(saved.state.tasksCompleted).toBe(9);
    });

    it('copies the legacy unslotted key into slot 0 without deleting it', async () => {
        localStorage.setItem(LEGACY_UNSLOTTED_SAVE_KEY, JSON.stringify({
            money: 999, rankIndex: 1, tasksCompleted: 4, timestamp: 5
        }));
        const result = await sm.migrateFromLocalStorage();
        expect(result.legacy).toBe(true);
        expect(result.migrated).toContain(0);
        expect(localStorage.getItem(LEGACY_UNSLOTTED_SAVE_KEY)).not.toBeNull();

        const shim = JSON.parse(localStorage.getItem(SAVE_KEY_PREFIX + 0));
        expect(shim.version).toBe(1);
        expect(shim.state.money).toBe(999);
        expect(shim.state.tasksCompleted).toBe(4);
        expect((await store.get(0)).state.rankIndex).toBe(1);
    });

    it('does not overwrite an IndexedDB slot that is already newer', async () => {
        await store.put({
            version: 1,
            slotIndex: 0,
            timestamp: 1,
            metadata: {},
            state: { money: 1, rankIndex: 0, tasksCompleted: 0 }
        });
        localStorage.setItem(SAVE_KEY_PREFIX + 0, JSON.stringify({
            version: 1,
            slotIndex: 0,
            state: { money: 999, rankIndex: 2, tasksCompleted: 8 }
        }));
        const result = await sm.migrateFromLocalStorage();
        expect(result.migrated).not.toContain(0);
        expect((await store.get(0)).state.money).toBe(1);
    });
});

describe('IndexedDB save and JSON round-trip', () => {
    let store;
    let sm;

    beforeEach(() => {
        localStorage.clear();
        store = new MemorySaveStore();
        sm = new SaveManager({ store });
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('writes new saves to IndexedDB and keeps the LocalStorage shim', async () => {
        const gs = new GameState();
        gs.money = 2500;
        gs.rankIndex = 3;
        gs.tasksCompleted = 12;
        expect(sm.saveGame(gs, 0)).toBe(true);
        expect(localStorage.getItem(SAVE_KEY_PREFIX + 0)).not.toBeNull();
        await sm.whenPersisted();

        const saved = await store.get(0);
        expect(saved.version).toBe(1);
        expect(saved.state.money).toBe(2500);
        expect(saved.state.rankIndex).toBe(3);
        expect(saved.state.tasksCompleted).toBe(12);
    });

    it('restores rank, money, and task progress from IndexedDB when LocalStorage is gone', async () => {
        const gs = new GameState();
        gs.money = 2500;
        gs.rankIndex = 3;
        gs.tasksCompleted = 12;
        gs.currentTask = { id: 'task_etl', startTime: Date.now() - 1000, timeLimit: 90 };
        sm.saveGame(gs, 2);
        await sm.whenPersisted();
        localStorage.clear();

        const next = new SaveManager({ store });
        const prepared = await next.prepareStorage();
        expect(prepared.hydrated).toContain(2);
        const loaded = new GameState();
        expect(next.loadGame(loaded, 2)).toBe(true);
        expect(loaded.money).toBe(2500);
        expect(loaded.rankIndex).toBe(3);
        expect(loaded.tasksCompleted).toBe(12);
        expect(loaded.currentTask.id).toBe('task_etl');
    });

    it('export/import JSON round-trips rank, money, and task progress into IndexedDB', async () => {
        const gs = new GameState();
        gs.money = 2500;
        gs.rankIndex = 3;
        gs.tasksCompleted = 12;
        gs.currentTask = { id: 'task_etl', startTime: Date.now() - 1000, timeLimit: 90 };
        sm.saveGame(gs, 0);
        const json = sm.exportSaveJSON(0);
        const exported = JSON.parse(json);
        expect(exported.state.money).toBe(2500);
        expect(exported.state.rankIndex).toBe(3);
        expect(exported.state.tasksCompleted).toBe(12);

        const target = new GameState();
        expect(sm.importSave(json, target, 1)).toBe(true);
        expect(target.money).toBe(2500);
        expect(target.rankIndex).toBe(3);
        expect(target.tasksCompleted).toBe(12);
        expect(target.currentTask.id).toBe('task_etl');
        await sm.whenPersisted();
        expect((await store.get(1)).state.tasksCompleted).toBe(12);
        expect((await store.get(1)).state.rankIndex).toBe(3);
    });

    it('imports an unversioned JSON blob through the save migration', () => {
        const gs = new GameState();
        const raw = JSON.stringify({ money: 40, rankIndex: 2, tasksCompleted: 6, timestamp: 1 });
        expect(sm.importSave(raw, gs, 0)).toBe(true);
        expect(gs.money).toBe(40);
        expect(gs.rankIndex).toBe(2);
        expect(gs.tasksCompleted).toBe(6);
        const stored = JSON.parse(localStorage.getItem(SAVE_KEY_PREFIX + 0));
        expect(stored.version).toBe(1);
        expect(stored.state.tasksCompleted).toBe(6);
    });

    it('still saves to the LocalStorage shim when IndexedDB rejects the write', async () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        const failing = new SaveManager({
            store: {
                get: async () => null,
                getAll: async () => [],
                put: async () => { throw new Error('idb down'); },
                delete: async () => false
            }
        });
        expect(failing.saveGame(new GameState(), 0)).toBe(true);
        expect(localStorage.getItem(SAVE_KEY_PREFIX + 0)).not.toBeNull();
        await failing.whenPersisted();
    });

    it('removes the IndexedDB slot when the save is cleared', async () => {
        sm.saveGame(new GameState(), 1);
        await sm.whenPersisted();
        expect(sm.clearSave(1)).toBe(true);
        await sm.whenPersisted();
        expect(sm.hasSave(1)).toBe(false);
        expect(await store.get(1)).toBeNull();
    });

    it('downloads the JSON export for Settings', () => {
        const gs = new GameState();
        gs.money = 10;
        sm.saveGame(gs, 0);
        URL.createObjectURL = vi.fn(() => 'blob:save');
        URL.revokeObjectURL = vi.fn();
        const click = vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(() => {});
        expect(downloadSaveJson(sm, 0)).toBe(true);
        expect(click).toHaveBeenCalled();
        expect(URL.createObjectURL).toHaveBeenCalled();
        const blob = URL.createObjectURL.mock.calls[0][0];
        expect(blob.type).toBe('application/json');
    });
});

describe('Settings save backup', () => {
    beforeEach(() => { localStorage.clear(); });

    it('offers JSON export and import without adding settings rows', () => {
        document.body.innerHTML = `
            <div id="modal-container" class="hidden"><div class="modal-backdrop"></div><div id="modal-content"></div></div>`;
        const fake = { audioManager: new AudioManager(), saveManager: new SaveManager({ store: new MemorySaveStore() }), currentSaveSlot: 0 };
        for (const method of ['showModal', 'closeModal', 'getModalFocusables', 'handleModalKeydown', 'showSettings']) {
            fake[method] = MainGame.prototype[method].bind(fake);
        }
        fake.showSettings();
        expect(document.querySelectorAll('.settings-row')).toHaveLength(5);
        expect(document.getElementById('settings-export-save')).not.toBeNull();
        expect(document.getElementById('settings-import-save')).not.toBeNull();
        expect(readFileSync('src/styles/main.css', 'utf8')).toContain('.settings-backup');
        fake.closeModal();
    });
});
