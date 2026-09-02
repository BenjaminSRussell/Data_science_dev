// ... (rest of the file remains unchanged)

class MainGame {
    // ... (rest of the class remains unchanged)

    /**
     * Initialize audio system
     */
    initAudio() {
        this.audioManager = new AudioManager(this.assetManager);
        this.gameState.audioManager = this.audioManager;

        // ... (rest of the method remains unchanged)
    }

    /**
     * Load saved game state
     */
    async loadGameState() {
        // ... (rest of the method remains unchanged)

        // Ensure sound and music states are synchronized
        if (this.gameState.soundEnabled !== undefined) {
            this.audioManager.setSoundEnabled(this.gameState.soundEnabled);
        }
        if (this.gameState.musicEnabled !== undefined) {
            this.audioManager.setMusicEnabled(this.gameState.musicEnabled);
        }
    }

    /**
     * Save game state
     */
    saveGameState() {
        // ... (rest of the method remains unchanged)

        // Ensure sound and music states are synchronized
        this.gameState.soundEnabled = this.audioManager.isSoundEnabled();
        this.gameState.musicEnabled = this.audioManager.isMusicEnabled();
    }

    /**
     * Handle audio toggle from settings UI
     */
    handleAudioToggle(setting, value) {
        // ... (rest of the method remains unchanged)

        // Ensure sound and music states are synchronized
        if (setting === 'sound') {
            this.audioManager.setSoundEnabled(value);
            this.gameState.soundEnabled = value;
        } else if (setting === 'music') {
            this.audioManager.setMusicEnabled(value);
            this.gameState.musicEnabled = value;
        }
    }

    // ... (rest of the class remains unchanged)
}

// ... (rest of the file remains unchanged)