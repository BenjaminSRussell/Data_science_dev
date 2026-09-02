class SaveSlotManager {
    constructor(savePrefix) {
        this.savePrefix = savePrefix;
        this.recentlyDeleted = []; // Temporary holding area for recently deleted slots
    }

    getSave(slotIndex) {
        const key = `${this.savePrefix}_slot_${slotIndex}`;
        return JSON.parse(localStorage.getItem(key));
    }

    saveGame(slotIndex, saveData) {
        const key = `${this.savePrefix}_slot_${slotIndex}`;
        localStorage.setItem(key, JSON.stringify(saveData));
    }

    clearSave(slotIndex) {
        const slotInfo = this.getSaveInfo(slotIndex);
        if (!slotInfo) return false;

        const key = `${this.savePrefix}_slot_${slotIndex}`;
        localStorage.removeItem(key);

        // Move to recently deleted
        this.recentlyDeleted.push({
            slotIndex: slotIndex,
            data: slotInfo.data,
            metadata: slotInfo.metadata,
            timestamp: Date.now()
        });

        return true;
    }

    getSaveInfo(slotIndex) {
        const key = `${this.savePrefix}_slot_${slotIndex}`;
        const saveData = localStorage.getItem(key);
        if (!saveData) return null;

        const data = JSON.parse(saveData);
        const metadata = JSON.parse(localStorage.getItem(`${this.savePrefix}_slot_${slotIndex}_metadata`)) || {};
        return { data: data, metadata: metadata };
    }

    // ... rest of the class methods remain unchanged ...

    deleteSlot(slotIndex) {
        const slotInfo = this.getSaveInfo(slotIndex);
        const slotName = slotInfo?.metadata?.name || `Save Slot ${slotIndex + 1}`;

        if (confirm(`Are you sure you want to delete "${slotName}"?\n\nThis action cannot be undone.`)) {
            if (this.clearSave(slotIndex)) {
                this.renderSlots();
                this.showUndoToast(slotIndex);
            }
        }
    }

    showUndoToast(slotIndex) {
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.innerHTML = `Save "${slotName}" deleted. <button class="undo-btn">Undo</button>`;
        document.body.appendChild(toast);

        const undoBtn = toast.querySelector('.undo-btn');
        undoBtn.addEventListener('click', () => {
            this.undoDelete(slotIndex);
            toast.remove();
        });

        setTimeout(() => {
            toast.remove();
        }, 10000); // 10 seconds before expiring
    }

    undoDelete(slotIndex) {
        const deletedSlot = this.recentlyDeleted.find(d => d.slotIndex === slotIndex);
        if (!deletedSlot) return;

        const key = `${this.savePrefix}_slot_${slotIndex}`;
        localStorage.setItem(key, JSON.stringify(deletedSlot.data));
        localStorage.setItem(`${this.savePrefix}_slot_${slotIndex}_metadata`, JSON.stringify(deletedSlot.metadata));

        // Remove from recently deleted
        this.recentlyDeleted = this.recentlyDeleted.filter(d => d.slotIndex !== slotIndex);

        this.renderSlots();
    }

    // ... rest of the class methods remain unchanged ...
}