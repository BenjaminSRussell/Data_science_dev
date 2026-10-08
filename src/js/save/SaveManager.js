/**
 * SaveManager - Handles game save/load using LocalStorage
 * Supports multiple save slots (0-4) for multiple playthroughs
 */

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
    return Number.isInteger(slotIndex) && slotIndex >= 0 && slotIndex < MAX_SAVE_SLOTS;
}

/** null/undefined slot means "default slot 0" (callers pass currentSaveSlot, which may be unset) */
function normalizeSlot(slotIndex) {
    return (slotIndex === null || slotIndex === undefined) ? 0 : slotIndex;
}

export class SaveManager {
    constructor() {
        this.autoSaveInterval = null;
        // Optional (error, slotIndex) => void so the UI can tell the player a save
        // failed (quota exceeded, storage disabled) instead of failing silently (#1221)
        this.onSaveError = null;
        // Bumped whenever slot contents may change, so readers such as
        // StatisticsAggregator can reuse cached results (#140)
        this.revision = 0;
    }

    /**
     * Save game to LocalStorage
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

            const saveKey = SAVE_KEY_PREFIX + slotIndex;
            localStorage.setItem(saveKey, JSON.stringify(saveData));

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
     * Load game from LocalStorage
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

            const saveKey = SAVE_KEY_PREFIX + slotIndex;
            const saveData = localStorage.getItem(saveKey);

            if (!saveData) {

                return false;
            }

            const parsed = migrateSaveRecord(JSON.parse(saveData));
            if (!parsed || !parsed.state) {
                console.error(`Save in slot ${slotIndex} is unreadable or from an unsupported version`);
                return false;
            }

            gameState.fromJSON(parsed.state);

            // Update last played timestamp
            if (parsed.metadata) {
                parsed.metadata.lastPlayed = Date.now();
                localStorage.setItem(saveKey, JSON.stringify(parsed));
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
        try {
            if (slotIndex !== null) {
                const saveKey = SAVE_KEY_PREFIX + slotIndex;
                return localStorage.getItem(saveKey) !== null;
            }

            // Check all slots
            for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
                if (localStorage.getItem(SAVE_KEY_PREFIX + i) !== null) {
                    return true;
                }
            }
            return false;
        } catch (error) {
            // localStorage can throw (privacy mode / disabled storage) (#1224)
            console.error('Failed to check for saves:', error);
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

            const saveKey = SAVE_KEY_PREFIX + slotIndex;
            localStorage.removeItem(saveKey);

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
            const saveKey = SAVE_KEY_PREFIX + slotIndex;
            const saveData = localStorage.getItem(saveKey);
            if (!saveData) return null;

            return encodeSaveString(saveData); // UTF-8 safe base64 for easy sharing
        } catch (error) {
            console.error('Failed to export save:', error);
            return null;
        }
    }

    /**
     * Import save from JSON string
     * @param {string} encodedData - Base64 encoded save data
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

            let saveData;
            try {
                saveData = decodeSaveString(encodedData);
            } catch (_) {
                saveData = atob(encodedData); // Legacy Latin-1 exports
            }
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
            const saveKey = SAVE_KEY_PREFIX + slotIndex;
            localStorage.setItem(saveKey, JSON.stringify(parsed));
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
        try {
            const saveKey = SAVE_KEY_PREFIX + slotIndex;
            const saveData = localStorage.getItem(saveKey);
            if (!saveData) return null;
            return JSON.parse(saveData);
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

            const saveKey = SAVE_KEY_PREFIX + slotIndex;
            localStorage.setItem(saveKey, JSON.stringify(saveData));
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

            const saveKey = SAVE_KEY_PREFIX + targetSlot;
            localStorage.setItem(saveKey, JSON.stringify(clonedData));

            return true;
        } catch (error) {
            console.error('Failed to duplicate save:', error);
            return false;
        }
    }
}
