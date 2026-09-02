class StoryUI {
    // ... existing code ...

    /**
     * Update story progress bar
     */
    updateStoryProgressBar() {
        const progressBar = document.getElementById('story-progress-bar');
        const progressFill = document.getElementById('story-progress-fill');
        
        if (!progressBar || !progressFill) return;

        const storylineManager = this.game?.gameState?.storylineManager;
        const progress = storylineManager?.getProgress() || 0;

        progressFill.style.width = `${progress}%`;
    }

    // ... existing code ...
}