class SaveSlotManager {
    constructor(saveManager) {
        this.saveManager = saveManager;
        this.currentSlot = 0;
        this.documentClickHandler = null;
    }

    renderSlots() {
        const container = document.querySelector('.save-slot-container');
        container.innerHTML = ''; // Clear existing slots

        for (let i = 0; i < 5; i++) {
            const slotInfo = this.saveManager.getSaveInfo(i);
            const card = this.createSlotCard(slotInfo, i);
            container.appendChild(card);

            this.addSlotMenu(card, slotInfo, i);

            card.addEventListener('click', (e) => {
                e.stopPropagation();
                this.handleSlotClick(i, !slotInfo);
            });
        }

        // Attach document-level click handler once
        this.attachDocumentClickHandler();
    }

    createSlotCard(slotInfo, slotIndex) {
        const isEmpty = !slotInfo;
        const card = document.createElement('div');
        card.className = 'save-slot-item';
        card.dataset.slotIndex = slotIndex;

        if (!isEmpty) {
            card.innerHTML = this.getSlotCardContent(slotInfo);
        } else {
            card.innerHTML = `
                <div class="slot-item-content">
                    <div class="slot-item-title">New Game</div>
                    <div class="slot-item-footer">
                        <span class="slot-item-last-played">Start a new game</span>
                    </div>
                </div>
            `;
        }

        return card;
    }

    getSlotCardContent(slotInfo) {
        const rank = RANKS[slotInfo.rank] || RANKS[0];
        const money = slotInfo.money || 0;
        const reputation = slotInfo.reputation || 0;
        const daysPlayed = slotInfo.daysPlayed || 0;
        const lastPlayed = slotInfo.metadata?.lastPlayed || slotInfo.timestamp;
        const slotName = slotInfo.metadata?.name || `Save Slot ${slotInfo.slotIndex + 1}`;

        const completion = Math.min(100, Math.round((slotInfo.rank / 6) * 100));

        const lastPlayedDate = new Date(lastPlayed);
        const now = new Date();
        const diffMs = now - lastPlayedDate;
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
        let lastPlayedText = 'Just now';
        if (diffDays === 0) {
            lastPlayedText = 'Today';
        } else if (diffDays === 1) {
            lastPlayedText = 'Yesterday';
        } else if (diffDays < 7) {
            lastPlayedText = `${diffDays} days ago`;
        } else {
            lastPlayedText = lastPlayedDate.toLocaleDateString();
        }

        return `
            <div class="slot-item-content">
                <div class="slot-item-header">
                    <div class="slot-item-rank">${rank.title}</div>
                    <button class="slot-btn-grey" aria-label="Slot options">Ã¢â€¹Â¯</button>
                </div>
                <div class="slot-item-title">${slotName}</div>
                <div class="slot-item-stats">
                    <span>$${money.toLocaleString()}</span>
                    <span>Ã¢â‚¬Â¢</span>
                    <span>${reputation} Rep</span>
                    <span>Ã¢â‚¬Â¢</span>
                    <span>Day ${daysPlayed}</span>
                </div>
                <div class="slot-item-footer">
                    <span class="slot-item-last-played">${lastPlayedText}</span>
                </div>
            </div>
        `;
    }

    addSlotMenu(card, slotInfo, slotIndex) {
        const menuBtn = card.querySelector('.slot-btn-grey');
        if (!menuBtn) return;

        let menu = card.querySelector('.slot-menu');
        if (!menu) {
            menu = document.createElement('div');
            menu.className = 'slot-menu hidden';
            menu.innerHTML = `
                <button class="menu-item" data-action="load">Load Game</button>
                <button class="menu-item" data-action="rename">Rename</button>
                <button class="menu-item" data-action="duplicate">Duplicate</button>
                <button class="menu-item" data-action="export">Export</button>
                <button class="menu-item danger" data-action="delete">Delete</button>
            `;
            card.appendChild(menu);

            menu.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action) {
                    this.handleMenuAction(action, slotIndex, slotInfo);
                }
            });
        }

        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSlotMenu(card);
        });
    }

    toggleSlotMenu(card) {
        const menu = card.querySelector('.slot-menu');
        if (!menu) return;

        document.querySelectorAll('.slot-menu').forEach(m => {
            if (m !== menu) m.classList.add('hidden');
        });

        menu.classList.toggle('hidden');
    }

    handleSlotClick(slotIndex, isEmpty) {
        if (isEmpty) {
            if (this.onSlotSelected) {
                this.onSlotSelected(slotIndex, true);
            }
        } else {
            if (this.onSlotSelected) {
                this.onSlotSelected(slotIndex, false);
            }
        }
    }

    handleMenuAction(action, slotIndex, slotInfo) {
        const menu = document.querySelector(`[data-slot-index="${slotIndex}"] .slot-menu`);
        if (menu) menu.classList.add('hidden');

        switch (action) {
            case 'load':
                if (this.onSlotSelected) {
                    this.onSlotSelected(slotIndex, false);
                }
                break;

            case 'rename':
                this.renameSlot(slotIndex, slotInfo);
                break;

            case 'duplicate':
                this.duplicateSlot(slotIndex);
                break;

            case 'export':
                this.exportSlot(slotIndex);
                break;

            case 'delete':
                this.deleteSlot(slotIndex);
                break;
        }
    }

    renameSlot(slotIndex, slotInfo) {
        const currentName = slotInfo.metadata?.name || `Save Slot ${slotIndex + 1}`;
        const newName = prompt('Enter new name for this save:', currentName);

        if (newName && newName.trim()) {
            if (this.saveManager.setSlotName(slotIndex, newName.trim())) {
                this.renderSlots();
            }
        }
    }

    duplicateSlot(slotIndex) {
        let targetSlot = null;
        for (let i = 0; i < 5; i++) {
            if (i !== slotIndex && this.saveManager.hasSave(i) === false) {
                targetSlot = i;
                break;
            }
        }

        if (targetSlot === null) {
            if (this.saveManager.game && this.saveManager.game.showError) {
                this.saveManager.game.showError('No empty slots available. Please delete a save first.');
            } else {
                console.warn('No empty slots available');
            }
            return;
        }

        if (this.saveManager.duplicateSave(slotIndex, targetSlot)) {
            this.renderSlots();
        }
    }

    exportSlot(slotIndex) {
        const encoded = this.saveManager.exportSave(slotIndex);
        if (!encoded) {
            if (this.saveManager.game && this.saveManager.game.showError) {
                this.saveManager.game.showError('Failed to export save.');
            }
            return;
        }

        const blob = new Blob([encoded], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `save_slot_${slotIndex + 1}_${Date.now()}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);

        if (this.saveManager.game && this.saveManager.game.showToast) {
            this.saveManager.game.showToast('Save exported successfully!', 'success');
        }
    }

    deleteSlot(slotIndex) {
        const slotInfo = this.saveManager.getSaveInfo(slotIndex);
        const slotName = slotInfo?.metadata?.name || `Save Slot ${slotIndex + 1}`;

        if (confirm(`Are you sure you want to delete "${slotName}"?\n\nThis action cannot be undone.`)) {
            if (this.saveManager.clearSave(slotIndex)) {
                this.renderSlots();
            }
        }
    }

    getCurrentSlot() {
        return this.currentSlot;
    }

    setCurrentSlot(slotIndex) {
        this.currentSlot = slotIndex;
        document.querySelectorAll('.save-slot-item').forEach(item => {
            item.classList.remove('selected');
            if (parseInt(item.dataset.slotIndex) === slotIndex) {
                item.classList.add('selected');
            }
        });
    }

    attachDocumentClickHandler() {
        if (this.documentClickHandler) {
            document.removeEventListener('click', this.documentClickHandler);
        }

        this.documentClickHandler = (e) => {
            document.querySelectorAll('.slot-menu').forEach(menu => {
                if (!menu.contains(e.target)) {
                    menu.classList.add('hidden');
                }
            });
        };

        document.addEventListener('click', this.documentClickHandler);
    }
}