/**
 * SaveSlotManager - Manages save slot display and interactions in the main menu
 */

import { SaveManager } from '../save/SaveManager.js';
import { RANKS } from '../data/ranks.js';

export class SaveSlotManager {
    constructor(saveManager, onSlotSelected) {
        this.saveManager = saveManager;
        this.onSlotSelected = onSlotSelected; // Callback when slot is selected
        this.currentSlot = null;
    }

    /**
     * Initialize save slots display
     */
    init() {
        // Migrate old save to slot 0 if needed
        this.migrateOldSave();

        // Clean up any old containers first
        this.cleanupOldContainers();

        // Create save slots container
        this.createSlotsContainer();

        // Render all slots
        this.renderSlots();
    }

    /**
     * Clean up any old stacked save slot containers
     */
    cleanupOldContainers() {
        // Remove old stacked container
        const oldContainer = document.getElementById('save-slots-container');
        if (oldContainer) {
            oldContainer.remove();
        }

        // Remove any elements with old class names
        document.querySelectorAll('.save-slots-container').forEach(el => el.remove());
        document.querySelectorAll('.save-slot-card').forEach(el => el.remove());
    }

    /**
     * Migrate old single save format to slot 0
     */
    migrateOldSave() {
        const oldSaveKey = 'data_science_tycoon_save';
        const oldSave = localStorage.getItem(oldSaveKey);

        if (oldSave) {
            try {
                const parsed = JSON.parse(oldSave);
                // Check if slot 0 already exists
                if (!this.saveManager.hasSave(0)) {
                    // Move old save to slot 0
                    const newSaveData = {
                        ...parsed,
                        slotIndex: 0,
                        metadata: {
                            name: 'Migrated Save',
                            createdAt: parsed.timestamp || Date.now(),
                            lastPlayed: parsed.timestamp || Date.now()
                        }
                    };
                    localStorage.setItem('data_science_tycoon_save_0', JSON.stringify(newSaveData));

                }
                // Remove old save key
                localStorage.removeItem(oldSaveKey);
            } catch (error) {
                console.error('Failed to migrate old save:', error);
            }
        }
    }

    /**
     * Create save slots container as dropdown button
     */
    createSlotsContainer() {
        const menuNav = document.querySelector('.menu-navigation');
        if (!menuNav) {
            console.warn('SaveSlotManager: .menu-navigation not found, retrying...');
            // Retry after a short delay
            setTimeout(() => {
                const retryNav = document.querySelector('.menu-navigation');
                if (retryNav) {
                    this.createSlotsContainer();
                }
            }, 100);
            return;
        }

        // Remove old continue button if it exists
        const oldContinueBtn = document.getElementById('btn-continue');
        if (oldContinueBtn) {
            oldContinueBtn.style.display = 'none';
        }

        // Remove any old stacked save slots container
        const oldContainer = document.getElementById('save-slots-container');
        if (oldContainer) {
            oldContainer.remove();
        }

        // Create dropdown button to replace continue button
        let dropdownBtn = document.getElementById('btn-continue-dropdown');
        if (!dropdownBtn) {
            dropdownBtn = document.createElement('button');
            dropdownBtn.id = 'btn-continue-dropdown';
            dropdownBtn.className = 'btn-grey btn-grey-secondary';
            dropdownBtn.innerHTML = `
                <div class="btn-content">
                    <span class="btn-icon"></span>
                    <div class="btn-text-group">
                        <span class="btn-text">Continue</span>
                        <span class="btn-subtext" id="continue-subtext-dropdown">No saved games</span>
                    </div>
                </div>
                <div class="btn-ripple"></div>
            `;

            // Insert after new game button (replace the old continue button position)
            const newGameBtn = document.getElementById('btn-new-game');
            const oldContinueBtn = document.getElementById('btn-continue');
            if (oldContinueBtn && oldContinueBtn.parentNode) {
                // Replace old continue button
                oldContinueBtn.parentNode.replaceChild(dropdownBtn, oldContinueBtn);
            } else if (newGameBtn && newGameBtn.parentNode) {
                // Insert after new game button
                newGameBtn.parentNode.insertBefore(dropdownBtn, newGameBtn.nextSibling);
            } else {
                menuNav.insertBefore(dropdownBtn, menuNav.firstChild);
            }

            // Create dropdown menu
            const dropdown = document.createElement('div');
            dropdown.id = 'save-slots-dropdown';
            dropdown.className = 'save-slots-dropdown hidden';
            document.body.appendChild(dropdown);

            // Toggle dropdown on button click
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !dropdownBtn.contains(e.target)) {
                    dropdown.classList.add('hidden');
                }
            });
        }
    }

    /**
     * Render all save slots in dropdown
     */
    renderSlots() {
        const dropdown = document.getElementById('save-slots-dropdown');
        const subtext = document.getElementById('continue-subtext-dropdown');
        if (!dropdown) return;

        dropdown.innerHTML = '';

        const slots = this.saveManager.getAllSlotsInfo();
        const hasSaves = slots.some(s => !s.isEmpty);

        // Update button subtext
        if (subtext) {
            if (hasSaves) {
                const filledCount = slots.filter(s => !s.isEmpty).length;
                subtext.textContent = `${filledCount} saved game${filledCount !== 1 ? 's' : ''} available`;
            } else {
                subtext.textContent = 'No saved games';
            }
        }

        // Enable/disable button
        const dropdownBtn = document.getElementById('btn-continue-dropdown');
        if (dropdownBtn) {
            if (hasSaves) {
                dropdownBtn.disabled = false;
            } else {
                dropdownBtn.disabled = true;
            }
        }

        // Create dropdown header
        const header = document.createElement('div');
        header.className = 'save-slots-header';
        header.innerHTML = '<h3>Saved Games</h3>';
        dropdown.appendChild(header);

        // Create slots list
        const slotsList = document.createElement('div');
        slotsList.className = 'save-slots-list';

        slots.forEach((slotInfo, index) => {
            const slotItem = this.createSlotItem(slotInfo, index);
            slotsList.appendChild(slotItem);
        });

        dropdown.appendChild(slotsList);

        // Add new game option at bottom
        const newGameOption = document.createElement('button');
        newGameOption.className = 'save-slot-item new-game-option';
        newGameOption.innerHTML = `
            <div class="slot-item-content">
                <div class="slot-item-icon"></div>
                <div class="slot-item-info">
                    <div class="slot-item-title">Start New Game</div>
                    <div class="slot-item-subtitle">Create a new career</div>
                </div>
            </div>
        `;
        newGameOption.addEventListener('click', () => {
            this.handleNewGame();
        });
        dropdown.appendChild(newGameOption);
    }

    /**
     * Toggle dropdown visibility
     */
    toggleDropdown() {
        const dropdown = document.getElementById('save-slots-dropdown');
        if (!dropdown) return;

        dropdown.classList.toggle('hidden');

        // Re-render to get latest save data
        if (!dropdown.classList.contains('hidden')) {
            this.renderSlots();
        }
    }

    /**
     * Handle new game from dropdown
     */
    handleNewGame() {
        const dropdown = document.getElementById('save-slots-dropdown');
        if (dropdown) dropdown.classList.add('hidden');

        // Find first empty slot or use slot 0
        const slots = this.saveManager.getAllSlotsInfo();
        let emptySlot = 0;
        for (let i = 0; i < slots.length; i++) {
            if (slots[i].isEmpty) {
                emptySlot = i;
                break;
            }
        }

        if (this.onSlotSelected) {
            this.onSlotSelected(emptySlot, true);
        }
    }

    /**
     * Create a save slot item for dropdown
     */
    createSlotItem(slotInfo, slotIndex) {
        const item = document.createElement('div');
        item.className = `save-slot-item ${slotInfo.isEmpty ? 'empty' : 'filled'}`;
        item.dataset.slotIndex = slotIndex;

        if (slotInfo.isEmpty) {
            item.innerHTML = this.createEmptySlotHTML(slotIndex);
        } else {
            item.innerHTML = this.createFilledSlotHTML(slotInfo);
        }

        // Add click handler
        item.addEventListener('click', (e) => {
            if (e.target.closest('.slot-btn-grey') || e.target.closest('.slot-menu')) return;
            this.handleSlotClick(slotIndex, slotInfo.isEmpty);
        });

        // Add context menu for filled slots
        if (!slotInfo.isEmpty) {
            this.addSlotMenu(item, slotInfo, slotIndex);
        }

        return item;
    }

    /**
     * Create HTML for empty slot
     */
    createEmptySlotHTML(slotIndex) {
        return `
            <div class="slot-item-content">
                <div class="slot-item-icon"></div>
                <div class="slot-item-info">
                    <div class="slot-item-title">Empty Slot ${slotIndex + 1}</div>
                    <div class="slot-item-subtitle">Click to start new game</div>
                </div>
            </div>
        `;
    }

    /**
     * Create HTML for filled slot
     */
    createFilledSlotHTML(slotInfo) {
        const rank = RANKS[slotInfo.rank] || RANKS[0];
        const money = slotInfo.money || 0;
        const reputation = slotInfo.reputation || 0;
        const daysPlayed = slotInfo.daysPlayed || 0;
        const lastPlayed = slotInfo.metadata?.lastPlayed || slotInfo.timestamp;
        const slotName = slotInfo.metadata?.name || `Save Slot ${slotInfo.slotIndex + 1}`;

        // Calculate completion percentage (assuming 6 ranks total)
        const completion = Math.min(100, Math.round((slotInfo.rank / 6) * 100));

        // Format last played date
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
                    <button class="slot-btn-grey" aria-label="Slot options" aria-haspopup="true" aria-expanded="false">⋯</button>
                </div>
                <div class="slot-item-title">${slotName}</div>
                <div class="slot-item-stats">
                    <span>$${money.toLocaleString()}</span>
                    <span>•</span>
                    <span>${reputation} Rep</span>
                    <span>•</span>
                    <span>Day ${daysPlayed}</span>
                </div>
                <div class="slot-item-footer">
                    <span class="slot-item-last-played">${lastPlayedText}</span>
                </div>
            </div>
        `;
    }

    /**
     * Add context menu to slot card
     */
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

            // Handle menu item clicks
            menu.addEventListener('click', (e) => {
                const action = e.target.dataset.action;
                if (action) {
                    this.handleMenuAction(action, slotIndex, slotInfo);
                }
            });
        }

        // Toggle menu on button click
        menuBtn.addEventListener('click', (e) => {
            e.stopPropagation();
            this.toggleSlotMenu(card);
            menuBtn.setAttribute('aria-expanded', menu.classList.contains('hidden') ? 'false' : 'true');
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (!card.contains(e.target)) {
                menu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
            }
        });

        // Close menu when Escape is pressed
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && !menu.classList.contains('hidden')) {
                menu.classList.add('hidden');
                menuBtn.setAttribute('aria-expanded', 'false');
                menuBtn.focus();
            }
        });
    }

    /**
     * Toggle slot menu visibility
     */
    toggleSlotMenu(card) {
        const menu = card.querySelector('.slot-menu');
        if (!menu) return;

        // Close all other menus
        document.querySelectorAll('.slot-menu').forEach(m => {
            if (m !== menu) m.classList.add('hidden');
        });

        menu.classList.toggle('hidden');
    }

    /**
     * Handle slot click
     */
    handleSlotClick(slotIndex, isEmpty) {
        if (isEmpty) {
            // Start new game in this slot
            if (this.onSlotSelected) {
                this.onSlotSelected(slotIndex, true);
            }
        } else {
            // Load existing game
            if (this.onSlotSelected) {
                this.onSlotSelected(slotIndex, false);
            }
        }
    }

    /**
     * Handle menu action
     */
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

    /**
     * Rename a save slot
     */
    renameSlot(slotIndex, slotInfo) {
        const currentName = slotInfo.metadata?.name || `Save Slot ${slotIndex + 1}`;
        const newName = prompt('Enter new name for this save:', currentName);

        if (newName && newName.trim()) {
            if (this.saveManager.setSlotName(slotIndex, newName.trim())) {
                this.renderSlots();
            }
        }
    }

    /**
     * Duplicate a save slot
     */
    duplicateSlot(slotIndex) {
        // Find next empty slot
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

    /**
     * Export a save slot
     */
    exportSlot(slotIndex) {
        const encoded = this.saveManager.exportSave(slotIndex);
        if (!encoded) {
            if (this.saveManager.game && this.saveManager.game.showError) {
                this.saveManager.game.showError('Failed to export save.');
            }
            return;
        }

        // Create download link
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

    /**
     * Delete a save slot
     */
    deleteSlot(slotIndex) {
        const slotInfo = this.saveManager.getSaveInfo(slotIndex);
        const slotName = slotInfo?.metadata?.name || `Save Slot ${slotIndex + 1}`;

        if (confirm(`Are you sure you want to delete "${slotName}"?\n\nThis action cannot be undone.`)) {
            if (this.saveManager.clearSave(slotIndex)) {
                this.renderSlots();
            }
        }
    }

    /**
     * Get current selected slot
     */
    getCurrentSlot() {
        return this.currentSlot;
    }

    /**
     * Set current slot
     */
    setCurrentSlot(slotIndex) {
        this.currentSlot = slotIndex;
        // Update visual selection
        document.querySelectorAll('.save-slot-item').forEach(item => {
            item.classList.remove('selected');
            if (parseInt(item.dataset.slotIndex) === slotIndex) {
                item.classList.add('selected');
            }
        });
    }
}

