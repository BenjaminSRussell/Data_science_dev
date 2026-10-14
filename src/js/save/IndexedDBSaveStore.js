/**
 * IndexedDB save store (#2714).
 *
 * LocalStorage migration (one release shim)
 * -----------------------------------------
 * Old keys, still read and still written this release:
 * - `data_science_tycoon_save` — legacy unslotted blob. Either a full record
 *   (`{ state, timestamp, version? }`) or a bare GameState JSON. Copied to
 *   IndexedDB slot 0 only when slot 0 is empty in both stores. This module
 *   does not delete the key. SaveSlotManager.migrateOldSave removes it after
 *   slot 0 exists (LocalStorage or IndexedDB).
 * - `data_science_tycoon_save_0` .. `data_science_tycoon_save_4` — slot
 *   records (`SAVE_KEY_PREFIX` + index). Copied into IndexedDB when that
 *   slot is empty there. Left in LocalStorage so a browser without
 *   IndexedDB, or a one-release downgrade, can still load.
 *
 * Synchronous reads prefer the LocalStorage slot key, then the in-memory
 * copy filled from IndexedDB. New saves are written to both.
 *
 * IndexedDB database `data_science_tycoon`, object store `saves`, key
 * `slotIndex` (schema `IDB_SCHEMA_VERSION`). Record shape is unchanged:
 * `{ version, timestamp, slotIndex, metadata, state }`. `version` is the
 * save-blob SAVE_VERSION, not this schema version.
 */

export const IDB_DB_NAME = 'data_science_tycoon';
export const IDB_STORE = 'saves';
export const IDB_SCHEMA_VERSION = 1;
export const LEGACY_UNSLOTTED_SAVE_KEY = 'data_science_tycoon_save';

export const LOCALSTORAGE_MIGRATION = Object.freeze({
    legacyUnslottedKey: LEGACY_UNSLOTTED_SAVE_KEY,
    slotKeyPrefix: 'data_science_tycoon_save_',
    slots: 5,
    indexedDBName: IDB_DB_NAME,
    objectStore: IDB_STORE,
    schemaVersion: IDB_SCHEMA_VERSION,
    shim: 'slot keys are still written to LocalStorage for one release; synchronous reads prefer them'
});

function requestToPromise(request) {
    return new Promise((resolve, reject) => {
        request.onsuccess = () => resolve(request.result);
        request.onerror = () => reject(request.error || new Error('IndexedDB request failed'));
    });
}

export class IndexedDBSaveStore {
    /**
     * @param {IDBFactory|null|undefined} indexedDBImpl - defaults to global indexedDB.
     *   Pass null to disable IndexedDB (LocalStorage shim only).
     */
    constructor(indexedDBImpl) {
        this.idb = indexedDBImpl === undefined ? globalThis.indexedDB : indexedDBImpl;
        this._dbPromise = null;
    }

    get available() {
        return !!this.idb && typeof this.idb.open === 'function';
    }

    _open() {
        if (!this.available) return Promise.resolve(null);
        if (!this._dbPromise) {
            this._dbPromise = new Promise((resolve, reject) => {
                let request;
                try {
                    request = this.idb.open(IDB_DB_NAME, IDB_SCHEMA_VERSION);
                } catch (err) {
                    reject(err);
                    return;
                }
                request.onupgradeneeded = () => {
                    const db = request.result;
                    if (!db.objectStoreNames.contains(IDB_STORE)) {
                        db.createObjectStore(IDB_STORE, { keyPath: 'slotIndex' });
                    }
                };
                request.onsuccess = () => resolve(request.result);
                request.onerror = () => reject(request.error || new Error('IndexedDB open failed'));
            }).catch((err) => {
                this._dbPromise = null;
                throw err;
            });
        }
        return this._dbPromise;
    }

    async get(slotIndex) {
        try {
            const db = await this._open();
            if (!db) return null;
            const tx = db.transaction(IDB_STORE, 'readonly');
            const result = await requestToPromise(tx.objectStore(IDB_STORE).get(slotIndex));
            return result ?? null;
        } catch (err) {
            console.error('IndexedDB read failed:', err);
            return null;
        }
    }

    async getAll() {
        try {
            const db = await this._open();
            if (!db) return [];
            const tx = db.transaction(IDB_STORE, 'readonly');
            const rows = await requestToPromise(tx.objectStore(IDB_STORE).getAll());
            return Array.isArray(rows) ? rows : [];
        } catch (err) {
            console.error('IndexedDB read failed:', err);
            return [];
        }
    }

    async put(record) {
        try {
            const db = await this._open();
            if (!db) return false;
            if (!record || !Number.isInteger(record.slotIndex)) return false;
            const tx = db.transaction(IDB_STORE, 'readwrite');
            await requestToPromise(tx.objectStore(IDB_STORE).put(record));
            return true;
        } catch (err) {
            console.error('IndexedDB put failed:', err);
            return false;
        }
    }

    async delete(slotIndex) {
        try {
            const db = await this._open();
            if (!db) return false;
            const tx = db.transaction(IDB_STORE, 'readwrite');
            await requestToPromise(tx.objectStore(IDB_STORE).delete(slotIndex));
            return true;
        } catch (err) {
            console.error('IndexedDB delete failed:', err);
            return false;
        }
    }
}
