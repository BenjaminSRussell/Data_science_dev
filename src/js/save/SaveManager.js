/**
 * SaveManager - Handles game save/load using LocalStorage
 */

const SAVE_KEY = 'data_science_tycoon_save';
const SAVE_VERSION = 1;

export class SaveManager {
    constructor() {
        this.autoSaveInterval = null;
    }

    /**
     * Save game to LocalStorage
     */
    saveGame(gameState) {
        try {
            const saveData = {
                version: SAVE_VERSION,
                timestamp: Date.now(),
                state: gameState.toJSON()
            };

            localStorage.setItem(SAVE_KEY, JSON.stringify(saveData));
            console.log('💾 Game saved successfully');
            return true;
        } catch (error) {
            console.error('Failed to save game:', error);
            return false;
        }
    }

    /**
     * Load game from LocalStorage
     */
    loadGame(gameState) {
        try {
            const saveData = localStorage.getItem(SAVE_KEY);

            if (!saveData) {
                console.log('📂 No save data found');
                return false;
            }

            const parsed = JSON.parse(saveData);

            // Check version compatibility
            if (parsed.version !== SAVE_VERSION) {
                console.warn('Save version mismatch, may need migration');
                // Add migration logic here for future versions
            }

            gameState.fromJSON(parsed.state);
            console.log('📂 Game loaded successfully');
            return true;
        } catch (error) {
            console.error('Failed to load game:', error);
            return false;
        }
    }

    /**
     * Check if a save exists
     */
    hasSave() {
        return localStorage.getItem(SAVE_KEY) !== null;
    }

    /**
     * Clear save data
     */
    clearSave() {
        try {
            localStorage.removeItem(SAVE_KEY);
            console.log('🗑️ Save data cleared');
            return true;
        } catch (error) {
            console.error('Failed to clear save:', error);
            return false;
        }
    }

    /**
     * Export save as JSON string
     */
    exportSave() {
        const saveData = localStorage.getItem(SAVE_KEY);
        if (!saveData) return null;

        return btoa(saveData); // Base64 encode for easy sharing
    }

    /**
     * Import save from JSON string
     */
    importSave(encodedData, gameState) {
        try {
            const saveData = atob(encodedData);
            const parsed = JSON.parse(saveData);

            localStorage.setItem(SAVE_KEY, saveData);
            gameState.fromJSON(parsed.state);

            console.log('📥 Save imported successfully');
            return true;
        } catch (error) {
            console.error('Failed to import save:', error);
            return false;
        }
    }

    /**
     * Start auto-save interval
     */
    startAutoSave(gameState, intervalMs = 60000) {
        this.stopAutoSave();

        this.autoSaveInterval = setInterval(() => {
            if (gameState.isGameStarted) {
                this.saveGame(gameState);
            }
        }, intervalMs);

        console.log(`⏰ Auto-save enabled (every ${intervalMs / 1000}s)`);
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
     * Get save metadata without loading full state
     */
    getSaveInfo() {
        try {
            const saveData = localStorage.getItem(SAVE_KEY);
            if (!saveData) return null;

            const parsed = JSON.parse(saveData);
            return {
                timestamp: parsed.timestamp,
                version: parsed.version,
                rank: parsed.state?.rankIndex,
                money: parsed.state?.money,
                reputation: parsed.state?.reputation
            };
        } catch (error) {
            return null;
        }
    }
}
