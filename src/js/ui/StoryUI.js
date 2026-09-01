class StoryUI {
    constructor(game) {
        this.game = game;
    }

    // Other methods...

    updateStoryDisplay() {
        const storylineManager = this.game?.gameState?.storylineManager;
        if (storylineManager) {
            storylineManager.initialize();
        }
        const status = storylineManager.getStatus();

        // Other code...
    }

    // Other methods...
}