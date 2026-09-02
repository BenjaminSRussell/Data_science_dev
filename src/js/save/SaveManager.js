class SaveManager {
    constructor() {
        this.autoSaveInterval = null;
    }

    /**
     * Save game state to localStorage
     * @param {GameState} gameState - Game state to save
     * @param {number} slotIndex - Target slot index, defaults to 0
     */
    saveGame(gameState, slotIndex = 0) {
        const saveData = {
            slotIndex: slotIndex,
            timestamp: Date.now(),
            version: gameState.version,
            state: gameState.toJSON(),
            metadata: gameState.metadata || {}
        };

        const saveKey = SAVE_KEY_PREFIX + slotIndex;
        localStorage.setItem(saveKey, JSON.stringify(saveData));
    }

    /**
     * Export save to base64 encoded string
     * @param {number} slotIndex - Source slot index, defaults to 0
     * @returns {string|null} Base64 encoded save data
     */
    exportSave(slotIndex = 0) {
        const saveKey = SAVE_KEY_PREFIX + slotIndex;
        const saveData = localStorage.getItem(saveKey);
        if (!saveData) return null;

        return btoa(saveData); // Base64 encode for easy sharing
    }

    /**
     * Import save from JSON string
     * @param {string} encodedData - Base64 encoded save data
     * @param {GameState} gameState - Game state to load into
     * @param {number} slotIndex - Target slot index, defaults to 0
     * @returns {boolean} Success status
     */
    importSave(encodedData, gameState, slotIndex = 0) {
        try {
            const saveData = atob(encodedData);
            const parsed = JSON.parse(saveData);

            // Update slot index and metadata
            parsed.slotIndex = slotIndex;
            if (!parsed.metadata) {
                parsed.metadata = {};
            }
            parsed.metadata.lastPlayed = Date.now();
            if (!parsed.metadata.createdAt) {
                parsed.metadata.createdAt = Date.now();
            }

            const saveKey = SAVE_KEY_PREFIX + slotIndex;
            localStorage.setItem(saveKey, JSON.stringify(parsed));
            gameState.fromJSON(parsed.state);

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
            if (gameState.isGameStarted) {
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
        try {
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