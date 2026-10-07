/**
 * SaveSlotManager - Manages save slot display and interactions in the main menu
 */

import { SaveManager, MAX_SAVE_SLOTS, SAVE_KEY_PREFIX } from '../save/SaveManager.js';
import { RANKS } from '../data/ranks.js';

const UNDO_DELETE_WINDOW_MS = 10000;

function escapeHTML(value) {
    return String(value ?? '')
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

/**
 * Human-readable "last played" label. Future timestamps (clock skew, imported
 * saves) are treated as "Today" rather than negative day counts (#2109).
 */
export function formatLastPlayed(lastPlayed, now = Date.now()) {
    if (!lastPlayed) return 'Unknown';
    const lastPlayedDate = new Date(lastPlayed);
    const diffMs = Math.max(0, now - lastPlayedDate.getTime());
    const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));
    if (diffDays === 0) return 'Today';
    if (diffDays === 1) return 'Yesterday';
    if (diffDays < 7) return `${diffDays} days ago`;
    return lastPlayedDate.toLocaleDateString();
}

export class SaveSlotManager {
    constructor(saveManager, onSlotSelected, game = null) {
        this.saveManager = saveManager;
        this.onSlotSelected = onSlotSelected; // Callback when slot is selected
        this.game = game || saveManager?.game || null; // For toasts/errors
        this.currentSlot = null;
        this.slotMenuListeners = {}; // Track document click listeners by slot index
        this.recentlyDeleted = null; // { slotIndex, raw, name, expiresAt } - in-memory only, cleared on reload
        this.undoTimer = null;
    }

    notify(message, type = 'info') {
        if (type === 'error' && this.game?.showError) {
            this.game.showError(message);
        } else if (this.game?.showToast) {
            this.game.showToast(message, type);
        } else if (type === 'error') {
            console.warn(message);
        }
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
        let oldSave = null;
        try {
            oldSave = localStorage.getItem(oldSaveKey);
        } catch (_) {
            return false;
        }
        if (!oldSave) return false;

        try {
            const parsed = JSON.parse(oldSave);
            // Check if slot 0 already exists
            if (!this.saveManager.hasSave(0)) {
                // Legacy saves were either a full record ({ state, timestamp }) or
                // the bare GameState blob; always produce a record with a `state` key (#2107)
                const hasState = parsed && typeof parsed.state === 'object' && parsed.state !== null;
                const newSaveData = {
                    version: parsed?.version ?? 1,
                    timestamp: parsed?.timestamp || Date.now(),
                    slotIndex: 0,
                    metadata: {
                        name: 'Migrated Save',
                        createdAt: parsed?.timestamp || Date.now(),
                        lastPlayed: parsed?.timestamp || Date.now()
                    },
                    state: hasState ? parsed.state : parsed
                };
                localStorage.setItem(`${SAVE_KEY_PREFIX}0`, JSON.stringify(newSaveData));
            }
            // Only remove the legacy key once the new record is safely written (#1663)
            localStorage.removeItem(oldSaveKey);
            return true;
        } catch (error) {
            console.error('Failed to migrate old save:', error);
            this.notify('Could not migrate your old save (storage may be full). It has been kept and will be retried next time.', 'error');
            return false;
        }
    }

    /**
     * Create save slots container as dropdown button
     */
    createSlotsContainer(attempt = 0) {
        const menuNav = document.querySelector('.menu-navigation');
        if (!menuNav) {
            if (attempt >= 20) {
                console.warn('SaveSlotManager: .menu-navigation never appeared; save slots unavailable');
                return false;
            }
            // Retry after a short delay, then render once the container exists (#2108)
            setTimeout(() => {
                if (this.createSlotsContainer(attempt + 1)) {
                    this.renderSlots();
                }
            }, 100);
            return false;
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
            dropdownBtn.setAttribute('aria-haspopup', 'true');
            dropdownBtn.setAttribute('aria-expanded', 'false');
            dropdownBtn.setAttribute('aria-controls', 'save-slots-dropdown');
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
            dropdown.setAttribute('role', 'menu');
            document.body.appendChild(dropdown);

            // Toggle dropdown on button click
            dropdownBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.toggleDropdown();
            });

            // Close dropdown when clicking outside
            document.addEventListener('click', (e) => {
                if (!dropdown.contains(e.target) && !dropdownBtn.contains(e.target)) {
                    this.setDropdownOpen(false);
                }
            });
        }
        return true;
    }

    /**
     * Open/close the dropdown and keep aria-expanded in sync (#182)
     */
    setDropdownOpen(open) {
        const dropdown = document.getElementById('save-slots-dropdown');
        const dropdownBtn = document.getElementById('btn-continue-dropdown');
        if (dropdown) dropdown.classList.toggle('hidden', !open);
        if (dropdownBtn) dropdownBtn.setAttribute('aria-expanded', open ? 'true' : 'false');
    }

    /**
     * Render all save slots in dropdown
     */
    renderSlots() {
        const dropdown = document.getElementById('save-slots-dropdown');
        const subtext = document.getElementById('continue-subtext-dropdown');
        if (!dropdown) return;

        dropdown.innerHTML = '';

        // Clear all tracked listeners before rebuilding slots
        // This handles cases where slots transition from filled to empty (e.g., deleteSlot)
        Object.keys(this.slotMenuListeners).forEach(slotIndex => {
            if (this.slotMenuListeners[slotIndex]) {
                document.removeEventListener('click', this.slotMenuListeners[slotIndex]);
            }
        });
        this.slotMenuListeners = {};

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

        // Undo affordance for a just-deleted slot (#245)
        if (this.recentlyDeleted && this.recentlyDeleted.expiresAt > Date.now()) {
            const undoBtn = document.createElement('button');
            undoBtn.className = 'save-slot-undo';
            undoBtn.dataset.action = 'undo-delete';
            undoBtn.textContent = `Undo delete of "${this.recentlyDeleted.name}"`;
            undoBtn.addEventListener('click', (e) => {
                e.stopPropagation();
                this.undoDelete();
            });
            dropdown.appendChild(undoBtn);
        }

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

        // Import a previously exported save file (#1024)
        const importOption = document.createElement('button');
        importOption.className = 'save-slot-item import-save-option';
        importOption.dataset.action = 'import';
        importOption.innerHTML = `
            <div class="slot-item-content">
                <div class="slot-item-info">
                    <div class="slot-item-title">Import Save</div>
                    <div class="slot-item-subtitle">Load an exported save file into an empty slot</div>
                </div>
            </div>
        `;
        importOption.addEventListener('click', (e) => {
            e.stopPropagation();
            this.promptImport();
        });
        dropdown.appendChild(importOption);

        if (this.currentSlot !== null) this.setCurrentSlot(this.currentSlot);
    }

    /**
     * Toggle dropdown visibility
     */
    toggleDropdown() {
        const dropdown = document.getElementById('save-slots-dropdown');
        if (!dropdown) return;

        const open = dropdown.classList.contains('hidden');
        this.setDropdownOpen(open);

        // Re-render to get latest save data
        if (open) {
            this.renderSlots();
        }
    }

    /**
     * Handle new game from dropdown
     */
    handleNewGame() {
        this.setDropdownOpen(false);

        const slot = this.pickNewGameSlot();
        if (slot === null) return;

        this.setCurrentSlot(slot);
        if (this.onSlotSelected) {
            this.onSlotSelected(slot, true);
        }
    }

    /**
     * Choose the slot for a new game: the first empty slot, or - when every
     * slot is full - the least recently played one, but only after the player
     * confirms overwriting it. Returns null if the player declines (#143).
     */
    pickNewGameSlot() {
        const slots = this.saveManager.getAllSlotsInfo();
        const empty = slots.findIndex(s => s.isEmpty);
        if (empty !== -1) return empty;

        let oldest = 0;
        let oldestTime = Infinity;
        slots.forEach((slot, i) => {
            const t = slot.metadata?.lastPlayed || slot.timestamp || 0;
            if (t < oldestTime) {
                oldestTime = t;
                oldest = i;
            }
        });
        const name = slots[oldest]?.metadata?.name || `Save Slot ${oldest + 1}`;
        const ok = typeof confirm === 'function'
            ? confirm(`All save slots are full. Overwrite "${name}" (least recently played)?`)
            : false;
        return ok ? oldest : null;
    }

    /**
     * Create a save slot item for dropdown
     */
    createSlotItem(slotInfo, slotIndex) {
        const item = document.createElement('div');
        item.className = `save-slot-item ${slotInfo.isEmpty ? 'empty' : 'filled'}`;
        item.dataset.slotIndex = slotIndex;
        // Keyboard accessible like the "Start New Game" button (#130, #1878)
        item.setAttribute('role', 'button');
        item.setAttribute('tabindex', '0');
        item.setAttribute('aria-label', slotInfo.isEmpty
            ? `Empty slot ${slotIndex + 1}, start new game`
            : `Load ${slotInfo.metadata?.name || `Save Slot ${slotIndex + 1}`}`);

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
        item.addEventListener('keydown', (e) => {
            if (e.target !== item) return; // let inner buttons handle their own keys
            if (e.key === 'Enter' || e.key === ' ' || e.key === 'Spacebar') {
                e.preventDefault();
                this.handleSlotClick(slotIndex, slotInfo.isEmpty);
            }
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

        // Completion = progress through the rank ladder (#52)
        const maxRankIndex = Math.max(1, RANKS.length - 1);
        const completion = Math.max(0, Math.min(100, Math.round(((slotInfo.rank || 0) / maxRankIndex) * 100)));

        const lastPlayedText = formatLastPlayed(lastPlayed);

        return `
            <div class="slot-item-content">
                <div class="slot-item-header">
                    <div class="slot-item-rank">${escapeHTML(rank.title)}</div>
                    <button class="slot-btn-grey" aria-label="Slot options">⋯</button>
                </div>
                <div class="slot-item-title">${escapeHTML(slotName)}</div>
                <div class="slot-item-stats">
                    <span>$${money.toLocaleString()}</span>
                    <span>•</span>
                    <span>${reputation} Rep</span>
                    <span>•</span>
                    <span>Day ${daysPlayed}</span>
                </div>
                <div class="slot-item-footer">
                    <span class="slot-item-last-played">${escapeHTML(lastPlayedText)}</span>
                    <span class="slot-item-completion" title="Career completion">${completion}% complete</span>
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
        });

        // Remove old listener if it exists to prevent listener leak
        if (this.slotMenuListeners[slotIndex]) {
            document.removeEventListener('click', this.slotMenuListeners[slotIndex]);
        }

        // Close menu when clicking outside
        const closeMenuListener = (e) => {
            if (!card.contains(e.target)) {
                menu.classList.add('hidden');
            }
        };

        this.slotMenuListeners[slotIndex] = closeMenuListener;
        document.addEventListener('click', closeMenuListener);
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
        this.setCurrentSlot(slotIndex);
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
                this.setCurrentSlot(slotIndex);
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
        for (let i = 0; i < MAX_SAVE_SLOTS; i++) {
            if (i !== slotIndex && this.saveManager.hasSave(i) === false) {
                targetSlot = i;
                break;
            }
        }

        if (targetSlot === null) {
            this.notify('No empty slots available. Please delete a save first.', 'error');
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
            this.notify('Failed to export save.', 'error');
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

        this.notify('Save exported successfully!', 'success');
    }

    /**
     * Delete a save slot
     */
    deleteSlot(slotIndex) {
        const slotInfo = this.saveManager.getSaveInfo(slotIndex);
        const slotName = slotInfo?.metadata?.name || `Save Slot ${slotIndex + 1}`;

        if (confirm(`Are you sure you want to delete "${slotName}"?\n\nYou can undo this for ${UNDO_DELETE_WINDOW_MS / 1000} seconds.`)) {
            let raw = null;
            try {
                raw = localStorage.getItem(SAVE_KEY_PREFIX + slotIndex);
            } catch (_) { /* storage unavailable */ }
            if (this.saveManager.clearSave(slotIndex)) {
                if (raw) {
                    this.recentlyDeleted = { slotIndex, raw, name: slotName, expiresAt: Date.now() + UNDO_DELETE_WINDOW_MS };
                    clearTimeout(this.undoTimer);
                    this.undoTimer = setTimeout(() => {
                        this.recentlyDeleted = null;
                        this.renderSlots();
                    }, UNDO_DELETE_WINDOW_MS);
                }
                if (this.currentSlot === slotIndex) this.currentSlot = null;
                this.notify(`Deleted "${slotName}". Use "Undo delete" in the save list to restore it.`, 'info');
                this.renderSlots();
            }
        }
    }

    /**
     * Restore the most recently deleted slot if still within the undo window (#245)
     * @returns {boolean}
     */
    undoDelete() {
        const deleted = this.recentlyDeleted;
        if (!deleted || deleted.expiresAt <= Date.now()) {
            this.recentlyDeleted = null;
            return false;
        }
        if (this.saveManager.hasSave(deleted.slotIndex)) {
            this.notify('That slot has been reused; the deleted save can no longer be restored.', 'error');
            this.recentlyDeleted = null;
            this.renderSlots();
            return false;
        }
        try {
            localStorage.setItem(SAVE_KEY_PREFIX + deleted.slotIndex, deleted.raw);
        } catch (error) {
            this.notify('Could not restore the save (storage may be full).', 'error');
            return false;
        }
        this.recentlyDeleted = null;
        clearTimeout(this.undoTimer);
        this.notify(`Restored "${deleted.name}".`, 'success');
        this.renderSlots();
        return true;
    }

    /**
     * Open a file picker and import an exported save into the first empty slot (#1024)
     */
    promptImport() {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.txt,text/plain';
        input.addEventListener('change', () => {
            const file = input.files && input.files[0];
            if (!file) return;
            file.text().then(text => this.importFromText(text)).catch(() => {
                this.notify('Could not read that file.', 'error');
            });
        });
        input.click();
    }

    /**
     * Import exported save text into the first empty slot without starting it
     * @param {string} text - Base64 text produced by exportSave()
     * @returns {number|null} slot index used, or null on failure
     */
    importFromText(text) {
        const slot = this.saveManager.findEmptySlot
            ? this.saveManager.findEmptySlot()
            : [...Array(MAX_SAVE_SLOTS).keys()].find(i => !this.saveManager.hasSave(i)) ?? null;
        if (slot === null || slot === undefined) {
            this.notify('No empty slots available. Please delete a save first.', 'error');
            return null;
        }
        if (!this.saveManager.importSave(String(text || '').trim(), null, slot)) {
            this.notify('That file is not a valid save export.', 'error');
            return null;
        }
        this.notify(`Save imported into slot ${slot + 1}.`, 'success');
        this.renderSlots();
        return slot;
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

