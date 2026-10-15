/**
 * SaveManager - Save/load for multiple slots (0-4).
 * New saves are written to IndexedDB. The LocalStorage slot keys remain a
 * one-release shim so existing browsers keep working (#2714). See
 * IndexedDBSaveStore.js for the key migration.
 */

import { IndexedDBSaveStore, LEGACY_UNSLOTTED_SAVE_KEY } from './IndexedDBSaveStore.js';
import { ValidationUtils } from '../utils/ValidationUtils.js';

export { LEGACY_UNSLOTTED_SAVE_KEY, LOCALSTORAGE_MIGRATION } from './IndexedDBSaveStore.js';

export const SAVE_KEY_PREFIX = 'data_science_tycoon_save_';
export const SAVE_VERSION = 1;
export const MAX_SAVE_SLOTS = 5;

/**
 * Save migrations, keyed by the version they upgrade FROM. Each step receives
 * the parsed save record and must return a record for version + 1. Add a new
 * entry here whenever SAVE_VERSION is bumped (#845).
 */
export const SAVE_MIGRATIONS = {
    // Version 0 = legacy/unversioned records that stored the state at the top level
    0: (record) => {
        if (record.state && typeof record.state === 'object') return { ...record, version: 1 };
        const { slotIndex, metadata, timestamp, version, ...state } = record;
        return { slotIndex, metadata, timestamp, version: 1, state };
    }
};

/**
 * Bring a parsed save record up to SAVE_VERSION. Returns null if the record
 * is unusable or comes from a newer, unknown version.
 */
export function migrateSaveRecord(record) {
    if (!record || typeof record !== 'object' || Array.isArray(record)) return null;
    let current = record;
    let version = Number.isInteger(current.version) ? current.version : 0;
    if (version > SAVE_VERSION) {
        console.warn(`Save version ${version} is newer than supported version ${SAVE_VERSION}`);
        return null;
    }
    while (version < SAVE_VERSION) {
        const step = SAVE_MIGRATIONS[version];
        if (!step) {
            console.warn(`No save migration registered for version ${version}`);
            return null;
        }
        current = step(current);
        version += 1;
        current.version = version;
    }
    return current;
}

/** UTF-8 safe base64 helpers (plain btoa throws on emoji/CJK names, #2106) */
export function encodeSaveString(text) {
    const bytes = new TextEncoder().encode(text);
    let binary = '';
    for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
    return btoa(binary);
}

export function decodeSaveString(encoded) {
    const binary = atob(String(encoded).trim());
    const bytes = new Uint8Array(binary.length);
    for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
    return new TextDecoder().decode(bytes);
}

function isValidSlot(slotIndex) {
    return ValidationUtils.isInteger(slotIndex)
        && ValidationUtils.isInRange(slotIndex, 0, MAX_SAVE_SLOTS - 1);
}

/** JSON text, or the legacy base64 export (UTF-8, then Latin-1). */
function payloadFromImport(encodedData) {
    const text = String(encodedData ?? '').trim();
    if (text.startsWith('{')) return text;
    try {
        return decodeSaveString(text);
    } catch {
        return atob(text);
    }
}

/** null/undefined slot means "default slot 0" (callers pass currentSaveSlot, which may be unset) */
function normalizeSlot(slotIndex) {
    return (slotIndex === null || slotIndex === undefined) ? 0 : slotIndex;
}

export class SaveManager {
    constructor(options = {}) {
        this.autoSaveInterval = null;
        // Optional (error, slotIndex) => void so the UI can tell the player a save
        // failed (quota exceeded, storage disabled) instead of failing silently (#1221)
        this.onSaveError = null;
        // Bumped whenever slot contents may change, so readers such as
        // StatisticsAggregator can reuse cached results (#140)
        this.revision = 0;
        // IndexedDB is the durable store. Pass options.store in tests.
        this.idb = options.store ?? new IndexedDBSaveStore(options.indexedDB);
        this._cache = new Map();
        this._mirrored = new Map();
        this._persist = Promise.resolve();
    }

    /** Resolves when queued IndexedDB writes have finished. */
    whenPersisted() {
        return this._persist;
    }

    _enqueue(work) {
        this._persist = this._persist.then(async () => {
            try {
                await work();
            } catch (err) {
                console.error('IndexedDB save failed:', err);
            }
        });
    }

    _readLocal(key) {
        try {
            return localStorage.getItem(key);
        } catch (err) {
            console.error('Failed to read LocalStorage save:', err);
            return null;
        }
    }

    /**
     * Write the LocalStorage shim, then the same record to IndexedDB.
     * Throws if LocalStorage throws so callers can report quota errors.
     */
    _persistSlot(slotIndex, record) {
        if (record && typeof record === 'object' && !Number.isInteger(record.slotIndex)) {
            record.slotIndex = slotIndex;
        }
        localStorage.setItem(SAVE_KEY_PREFIX + slotIndex, JSON.stringify(record));
        this._mirrorToIdb(record, slotIndex);
    }

    _mirrorToIdb(record, slotIndex) {
        if (!this.idb || typeof this.idb.put !== 'function') return;
        if (!record || typeof record !== 'object') return;
        let json;
        try {
            json = JSON.stringify(record);
        } catch (err) {
            console.error('IndexedDB save failed:', err);
            return;
        }
        if (this._mirrored.get(slotIndex) === json) return;
        let migrated;
        try {
            migrated = migrateSaveRecord(JSON.parse(json));
        } catch (err) {
            console.error('IndexedDB save failed:', err);
            return;
        }
        if (!migrated || !migrated.state) return;
        if (!Number.isInteger(migrated.slotIndex)) migrated.slotIndex = slotIndex;
        this._mirrored.set(slotIndex, json);
        this._cache.set(slotIndex, migrated);
        this._enqueue(() => this.idb.put(migrated));
    }

    _forget(slotIndex) {
        this._cache.delete(slotIndex);
        this._mirrored.delete(slotIndex);
        if (this.idb && typeof this.idb.delete === 'function') {
            this._enqueue(() => this.idb.delete(slotIndex));
        }
    }

    _recordFromLegacy(raw) {
        let parsed;
        try {
            parsed = JSON.parse(raw);
        } catch {
            return null;
        }
        if (!parsed || typeof parsed !== 'object' || Array.isArray(parsed)) return null;
        const hasState = typeof parsed.state === 'object' && parsed.state !== null;
        return migrateSaveRecord({
            version: Number.isInteger(parsed.version) ? parsed.version : 0,
            timestamp: parsed.timestamp || Date.now(),
            slotIndex: 0,
            metadata: {
                name: 'Migrated Save',
                createdAt: parsed.timestamp || Date.now(),
                lastPlayed: parsed.timestamp || Date.now()
            },
            state: hasState ? parsed.state : parsed
        });
    }

    /**
     * Load IndexedDB slots into memory when the LocalStorage shim is missing,
     * then copy LocalStorage slots (and the legacy unslotted key) into
     * IndexedDB. Does not delete LocalStorage keys. See LOCALSTORAGE_MIGRATION.
     * @returns {Promise<{migrated: number[], legacy: boolean, hydrated: number[]}>}
     */
    async prepareStorage() {
        const hydrated = await this.hydrateFromIndexedDB();
        const migrated = await this.migrateFromLocalStorage();
        return { hydrated, ...migrated };
    }

    async hydrateFromIndexedDB() {
        if (!this.idb || typeof this.idb.getAll !== 'function') return [];
        let rows;
        try {
            rows = await this.idb.getAll();
        } catch (err) {
            console.error('IndexedDB read failed:', err);
            return [];
        }
        const loaded = [];
        for (const row of rows || []) {
            if (!row || !Number.isInteger(row.slotIndex)) continue;
            if (this._readLocal(SAVE_KEY_PREFIX + row.slotIndex) !== null) continue;
            const migrated = migrateSaveRecord(row);
            if (!migrated || !migrated.state) continue;
            this._cache.set(row.slotIndex, migrated);
            try {
                this._mirrored.set(row.slotIndex, JSON.stringify(row));
            } catch { /* non-serializable row; cache still serves reads */ }
            loaded.push(row.slotIndex);
        }
        return loaded;
    }

    async migrateFromLocalStorage() {
        const migrated = [];
        let legacy = false;
        if (!this.idb || typeof this.idb.get !== 'function' || typeof this.idb.put !== 'function') {
            return { migrated, legacy };
        }

        for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
            const raw = this._readLocal(SAVE_KEY_PREFIX + i);
            if (!raw) continue;
            let existing = null;
            try {
                existing = await this.idb.get(i);
            } catch (err) {
                console.error('IndexedDB read failed:', err);
            }
            if (existing) continue;
            let parsed;
            try {
                parsed = migrateSaveRecord(JSON.parse(raw));
            } catch {
                continue;
            }
            if (!parsed || !parsed.state) continue;
            parsed.slotIndex = i;
            const ok = await this.idb.put(parsed);
            if (ok === false) continue;
            this._cache.set(i, parsed);
            this._mirrored.set(i, JSON.stringify(parsed));
            migrated.push(i);
        }

        const legacyRaw = this._readLocal(LEGACY_UNSLOTTED_SAVE_KEY);
        const slot0 = this._readLocal(SAVE_KEY_PREFIX + 0);
        if (legacyRaw && !slot0 && !migrated.includes(0)) {
            let existing = null;
            try {
                existing = await this.idb.get(0);
            } catch (err) {
                console.error('IndexedDB read failed:', err);
            }
            const parsed = existing ? null : this._recordFromLegacy(legacyRaw);
            if (parsed && parsed.state) {
                parsed.slotIndex = 0;
                const ok = await this.idb.put(parsed);
                if (ok !== false) {
                    try {
                        localStorage.setItem(SAVE_KEY_PREFIX + 0, JSON.stringify(parsed));
                    } catch (err) {
                        console.error('Failed to write LocalStorage save shim:', err);
                    }
                    this._cache.set(0, parsed);
                    this._mirrored.set(0, JSON.stringify(parsed));
                    migrated.push(0);
                    legacy = true;
                }
            }
        }

        return { migrated, legacy };
    }

    /**
     * Save game to IndexedDB and the LocalStorage shim
     * @param {GameState} gameState - The game state to save
     * @param {number} slotIndex - Save slot index (0-4), defaults to 0
     * @returns {boolean} Success status
     */
    saveGame(gameState, slotIndex = 0) {
        this.revision++;
        try {
            slotIndex = normalizeSlot(slotIndex);
            if (!isValidSlot(slotIndex)) {
                console.error(`Invalid slot index: ${slotIndex}. Must be 0-${MAX_SAVE_SLOTS - 1}`);
                return false;
            }

            const saveData = {
                version: SAVE_VERSION,
                timestamp: Date.now(),
                slotIndex: slotIndex,
                metadata: {
                    name: this.getSlotName(slotIndex) || `Save Slot ${slotIndex + 1}`,
                    createdAt: this.getSlotCreatedAt(slotIndex) || Date.now(),
                    lastPlayed: Date.now()
                },
                state: gameState.toJSON()
            };

            this._persistSlot(slotIndex, saveData);

            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            if (typeof this.onSaveError === 'function') {
                try { this.onSaveError(error, slotIndex); } catch (_) { /* never let the handler break saving */ }
            }
            return false;
        }
    }

    /**
     * Load game from the LocalStorage shim, or from IndexedDB if the shim is empty
     * @param {GameState} gameState - The game state to load into
     * @param {number} slotIndex - Save slot index (0-4), defaults to 0
     * @returns {boolean} Success status
     */
    loadGame(gameState, slotIndex = 0) {
        try {
            slotIndex = normalizeSlot(slotIndex);
            if (!isValidSlot(slotIndex)) {
                console.error(`Invalid slot index: ${slotIndex}. Must be 0-${MAX_SAVE_SLOTS - 1}`);
                return false;
            }

            const saved = this.getSaveData(slotIndex);
            if (!saved) return false;

            const parsed = migrateSaveRecord(saved);
            if (!parsed || !parsed.state) {
                console.error(`Save in slot ${slotIndex} is unreadable or from an unsupported version`);
                return false;
            }

            gameState.fromJSON(parsed.state);

            // Update last played timestamp
            if (parsed.metadata) {
                parsed.metadata.lastPlayed = Date.now();
                this._persistSlot(slotIndex, parsed);
            }


            return true;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    }

    /**
     * Check if a save exists
     * @param {number} slotIndex - Optional slot index to check, if not provided checks all slots
     * @returns {boolean} True if save exists
     */
    hasSave(slotIndex = null) {
        const slots = slotIndex !== null ? [slotIndex] : [...Array(MAX_SAVE_SLOTS).keys()];
        try {
            for (const slot of slots) {
                if (localStorage.getItem(SAVE_KEY_PREFIX + slot) !== null || this._cache.has(slot)) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            // localStorage can throw (privacy mode / disabled storage) (#1224)
            console.error('Failed to check for saves:', error);
            for (const slot of slots) {
                if (this._cache.has(slot)) return true;
            }
            return false;
        }
    }

    /**
     * First empty slot index, or null when every slot is used
     * @returns {number|null}
     */
    findEmptySlot() {
        for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
            if (!this.hasSave(i)) return i;
        }
        return null;
    }

    /**
     * Get the most recent save slot index
     * @returns {number|null} Slot index of most recent save, or null if no saves
     */
    getMostRecentSlot() {
        let mostRecent = null;
        let mostRecentTime = 0;

        for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
            const saveData = this.getSaveData(i);
            if (saveData) {
                const timestamp = saveData.metadata?.lastPlayed || saveData.timestamp || 0;
                if (timestamp > mostRecentTime) {
                    mostRecentTime = timestamp;
                    mostRecent = i;
                }
            }
        }

        return mostRecent;
    }

    /**
     * Clear save data
     * @param {number} slotIndex - Save slot index to clear, defaults to 0
     * @returns {boolean} Success status
     */
    clearSave(slotIndex = 0) {
        this.revision++;
        try {
            if (!isValidSlot(slotIndex)) {
                console.error(`Invalid slot index: ${slotIndex}`);
                return false;
            }

            localStorage.removeItem(SAVE_KEY_PREFIX + slotIndex);
            this._forget(slotIndex);

            return true;
        } catch (error) {
            console.error('Failed to clear save:', error);
            return false;
        }
    }

    /**
     * Export save as JSON string
     * @param {number} slotIndex - Save slot index to export, defaults to 0
     * @returns {string|null} Base64 encoded save data
     */
    exportSave(slotIndex = 0) {
        if (!isValidSlot(slotIndex)) {
            console.error(`Invalid slot index: ${slotIndex}. Must be 0-${MAX_SAVE_SLOTS - 1}`);
            return null;
        }

        try {
            const saveData = localStorage.getItem(SAVE_KEY_PREFIX + slotIndex);
            if (saveData) return encodeSaveString(saveData);
            const cached = this._cache.get(slotIndex);
            if (!cached) return null;
            return encodeSaveString(JSON.stringify(cached));
        } catch (error) {
            console.error('Failed to export save:', error);
            return null;
        }
    }

    /**
     * Export one slot as a JSON string (Settings backup). Null if the slot is empty.
     * @param {number} slotIndex
     * @returns {string|null}
     */
    exportSaveJSON(slotIndex = 0) {
        if (!isValidSlot(slotIndex)) {
            console.error(`Invalid slot index: ${slotIndex}. Must be 0-${MAX_SAVE_SLOTS - 1}`);
            return null;
        }
        try {
            const data = this.getSaveData(slotIndex);
            if (!data) return null;
            const parsed = migrateSaveRecord(data);
            if (!parsed || !parsed.state) return null;
            parsed.slotIndex = slotIndex;
            return JSON.stringify(parsed);
        } catch (error) {
            console.error('Failed to export save:', error);
            return null;
        }
    }

    /**
     * Import save from a JSON string or a legacy base64 export
     * @param {string} encodedData - JSON record, or base64 encoded save data
     * @param {GameState} gameState - Game state to load into
     * @param {number} slotIndex - Target slot index, defaults to 0
     * @returns {boolean} Success status
     */
    importSave(encodedData, gameState, slotIndex = 0) {
        this.revision++;
        try {
            if (!isValidSlot(slotIndex)) {
                console.error(`Invalid slot index: ${slotIndex}. Must be 0-${MAX_SAVE_SLOTS - 1}`);
                return false;
            }

            const saveData = payloadFromImport(encodedData);
            const parsed = migrateSaveRecord(JSON.parse(saveData));
            if (!parsed || !parsed.state || typeof parsed.state !== 'object') {
                console.error('Import failed: not a valid save file');
                return false;
            }

            // Update slot index and metadata
            parsed.slotIndex = slotIndex;
            if (!parsed.metadata) {
                parsed.metadata = {};
            }
            parsed.metadata.lastPlayed = Date.now();
            if (!parsed.metadata.createdAt) {
                parsed.metadata.createdAt = Date.now();
            }

            // Store the updated record object, not the raw decoded string (#56)
            this._persistSlot(slotIndex, parsed);
            if (gameState && typeof gameState.fromJSON === 'function') {
                gameState.fromJSON(parsed.state);
            }

            return true;
        } catch (error) {
            console.error('Failed to import save:', error);
            return false;
        }
    }

    /**
     * Start auto-save interval
     * @param {GameState} gameState - Game state to save
     * @param {number} intervalMs - Auto-save interval in milliseconds
     * @param {number} slotIndex - Save slot index, defaults to current slot or 0
     */
    startAutoSave(gameState, intervalMs = 60000, slotIndex = 0) {
        this.stopAutoSave();

        this.autoSaveInterval = setInterval(() => {
            // Respect the player's autosave setting (#1252)
            if (gameState.isGameStarted && gameState.settings?.autoSave !== false) {
                this.saveGame(gameState, slotIndex);
            }
        }, intervalMs);


    }

    /**
     * Stop auto-save
     */
    stopAutoSave() {
        if (this.autoSaveInterval) {
            clearInterval(this.autoSaveInterval);
            this.autoSaveInterval = null;
        }
    }

    /**
     * Get save data for display
     * @param {number} slotIndex - Save slot index, defaults to 0
     * @returns {Object|null} Parsed save data
     */
    getSaveData(slotIndex = 0) {
        let raw;
        try {
            raw = localStorage.getItem(SAVE_KEY_PREFIX + slotIndex);
        } catch (error) {
            console.error('Failed to get save data:', error);
            const cached = this._cache.get(slotIndex);
            return cached ? JSON.parse(JSON.stringify(cached)) : null;
        }
        if (!raw) {
            const cached = this._cache.get(slotIndex);
            return cached ? JSON.parse(JSON.stringify(cached)) : null;
        }
        try {
            const parsed = JSON.parse(raw);
            this._mirrorToIdb(parsed, slotIndex);
            return parsed;
        } catch (error) {
            console.error('Failed to get save data:', error);
            return null;
        }
    }

    /**
     * Get save metadata without loading full state
     * @param {number} slotIndex - Save slot index, defaults to 0
     * @returns {Object|null} Save metadata
     */
    getSaveInfo(slotIndex = 0) {
        try {
            const saveData = this.getSaveData(slotIndex);
            if (!saveData) return null;

            const state = saveData.state || {};
            return {
                slotIndex: slotIndex,
                timestamp: saveData.timestamp,
                version: saveData.version,
                metadata: saveData.metadata || {},
                rank: state.rankIndex,
                money: state.money,
                reputation: state.reputation,
                daysPlayed: state.timeManager?.totalDays || 0,
                tasksCompleted: state.tasksCompleted || 0
            };
        } catch (error) {
            return null;
        }
    }

    /**
     * Get all save slots info
     * @returns {Array} Array of save info objects for all slots
     */
    getAllSlotsInfo() {
        const slots = [];
        for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
            const info = this.getSaveInfo(i);
            slots.push(info || { slotIndex: i, isEmpty: true });
        }
        return slots;
    }

    /**
     * Set slot name
     * @param {number} slotIndex - Slot index
     * @param {string} name - Slot name
     * @returns {boolean} Success status
     */
    setSlotName(slotIndex, name) {
        try {
            const saveData = this.getSaveData(slotIndex);
            if (!saveData) return false;

            if (!saveData.metadata) {
                saveData.metadata = {};
            }
            saveData.metadata.name = name;

            this._persistSlot(slotIndex, saveData);
            return true;
        } catch (error) {
            console.error('Failed to set slot name:', error);
            return false;
        }
    }

    /**
     * Get slot name
     * @param {number} slotIndex - Slot index
     * @returns {string|null} Slot name
     */
    getSlotName(slotIndex) {
        const saveData = this.getSaveData(slotIndex);
        return saveData?.metadata?.name || null;
    }

    /**
     * Get slot creation timestamp
     * @param {number} slotIndex - Slot index
     * @returns {number|null} Creation timestamp
     */
    getSlotCreatedAt(slotIndex) {
        const saveData = this.getSaveData(slotIndex);
        return saveData?.metadata?.createdAt || saveData?.timestamp || null;
    }

    /**
     * Duplicate a save slot
     * @param {number} sourceSlot - Source slot index
     * @param {number} targetSlot - Target slot index
     * @returns {boolean} Success status
     */
    duplicateSave(sourceSlot, targetSlot) {
        this.revision++;
        try {
            if (!isValidSlot(targetSlot) || targetSlot === sourceSlot) {
                console.error(`Invalid duplicate target slot: ${targetSlot}`);
                return false;
            }
            const sourceData = this.getSaveData(sourceSlot);
            if (!sourceData) {
                console.error(`No save data in slot ${sourceSlot}`);
                return false;
            }

            // Deep clone
            const clonedData = JSON.parse(JSON.stringify(sourceData));
            clonedData.slotIndex = targetSlot;
            clonedData.timestamp = Date.now();

            if (!clonedData.metadata) {
                clonedData.metadata = {};
            }
            clonedData.metadata.name = (clonedData.metadata.name || `Save Slot ${sourceSlot + 1}`) + ' (Copy)';
            clonedData.metadata.lastPlayed = Date.now();

            this._persistSlot(targetSlot, clonedData);

            return true;
        } catch (error) {
            console.error('Failed to duplicate save:', error);
            return false;
        }
    }
}
