/**
 * OfficeManager - Handles office upgrades, equipment, and staff
 */

import { EQUIPMENT, OFFICES, STAFF_TYPES, MARKETING_CHANNELS } from '../data/tycoonData.js';

export class OfficeManager {
    constructor(gameState) {
        this.gameState = gameState;

        // Equipment levels (index into EQUIPMENT[type].levels)
        this.equipmentLevels = {
            computer: 0,
            desk: 0,
            monitor: 0,
            chair: 0,
            software: 0
        };

        // Current office index
        this.currentOfficeIndex = 0;

        // Hired staff
        this.staff = [];

        // Active marketing channels
        this.activeMarketing = ['word_of_mouth'];
    }

    /**
     * Get current office
     */
    get currentOffice() {
        return OFFICES[this.currentOfficeIndex];
    }

    /**
     * Get equipment level details
     */
    getEquipmentDetails(type) {
        const equipment = EQUIPMENT[type];
        const level = this.equipmentLevels[type];
        return {
            ...equipment,
            currentLevel: level,
            current: equipment.levels[level],
            next: equipment.levels[level + 1] || null,
            maxLevel: equipment.levels.length - 1
        };
    }

    /**
     * Upgrade equipment
     */
    upgradeEquipment(type) {
        const details = this.getEquipmentDetails(type);

        if (!details.next) {
            return { success: false, reason: 'Already at max level' };
        }

        if (this.gameState.money < details.next.price) {
            return { success: false, reason: 'Not enough money' };
        }

        this.gameState.money -= details.next.price;
        this.equipmentLevels[type]++;

        // Dispatch event for UI
        window.dispatchEvent(new CustomEvent('equipmentupgraded', {
            detail: { type, level: this.equipmentLevels[type] }
        }));

        return { success: true, newLevel: this.equipmentLevels[type] };
    }

    /**
     * Calculate total equipment bonuses
     */
    getEquipmentBonuses() {
        return {
            speed: EQUIPMENT.computer.levels[this.equipmentLevels.computer].speed,
            comfort: EQUIPMENT.desk.levels[this.equipmentLevels.desk].comfort,
            clarity: EQUIPMENT.monitor.levels[this.equipmentLevels.monitor].clarity,
            stamina: EQUIPMENT.chair.levels[this.equipmentLevels.chair].stamina,
            capability: EQUIPMENT.software.levels[this.equipmentLevels.software].capability
        };
    }

    /**
     * Check if can upgrade office
     */
    canUpgradeOffice() {
        const nextOffice = OFFICES[this.currentOfficeIndex + 1];
        if (!nextOffice) return { can: false, reason: 'Already at best office' };
        if (this.gameState.money < nextOffice.price) {
            return { can: false, reason: 'Not enough money', needed: nextOffice.price };
        }
        return { can: true, nextOffice };
    }

    /**
     * Upgrade to next office
     */
    upgradeOffice() {
        const check = this.canUpgradeOffice();
        if (!check.can) return { success: false, reason: check.reason };

        const nextOffice = OFFICES[this.currentOfficeIndex + 1];
        this.gameState.money -= nextOffice.price;
        this.currentOfficeIndex++;

        window.dispatchEvent(new CustomEvent('officeupgraded', {
            detail: { office: this.currentOffice }
        }));

        return { success: true, newOffice: this.currentOffice };
    }

    /**
     * Get available staff to hire
     */
    getAvailableStaff() {
        return STAFF_TYPES.filter(s => {
            // Check capacity
            if (this.staff.length >= this.currentOffice.capacity) return false;
            return true;
        });
    }

    /**
     * Hire staff member
     */
    hireStaff(staffTypeId) {
        if (this.staff.length >= this.currentOffice.capacity) {
            return { success: false, reason: 'Office at capacity' };
        }

        const staffType = STAFF_TYPES.find(s => s.id === staffTypeId);
        if (!staffType) {
            return { success: false, reason: 'Invalid staff type' };
        }

        // First month salary as hiring cost
        const hiringCost = staffType.baseSalary * 2;
        if (this.gameState.money < hiringCost) {
            return { success: false, reason: 'Not enough money for hiring' };
        }

        this.gameState.money -= hiringCost;

        const newStaff = {
            id: `staff_${Date.now()}`,
            type: staffType,
            hiredAt: Date.now(),
            happiness: 100,
            productivity: 1.0
        };

        this.staff.push(newStaff);

        window.dispatchEvent(new CustomEvent('staffhired', { detail: newStaff }));

        return { success: true, staff: newStaff };
    }

    /**
     * Fire staff member
     */
    fireStaff(staffId) {
        const index = this.staff.findIndex(s => s.id === staffId);
        if (index === -1) return { success: false, reason: 'Staff not found' };

        const removed = this.staff.splice(index, 1)[0];

        window.dispatchEvent(new CustomEvent('stafffired', { detail: removed }));

        return { success: true, staff: removed };
    }

    /**
     * Calculate daily staff salary
     */
    getDailyStaffCost() {
        return this.staff.reduce((total, s) => total + s.type.baseSalary, 0);
    }

    /**
     * Calculate daily marketing cost
     */
    getDailyMarketingCost() {
        return this.activeMarketing.reduce((total, channelId) => {
            const channel = MARKETING_CHANNELS.find(m => m.id === channelId);
            return total + (channel?.costPerDay || 0);
        }, 0);
    }

    /**
     * Get total daily expenses
     */
    getDailyExpenses() {
        return this.getDailyStaffCost() + this.getDailyMarketingCost();
    }

    /**
     * Calculate team efficiency
     */
    getTeamEfficiency() {
        if (this.staff.length === 0) return 1.0;

        const totalEfficiency = this.staff.reduce((sum, s) =>
            sum + s.type.efficiency * s.productivity, 0
        );

        return 1.0 + totalEfficiency;
    }

    /**
     * Toggle marketing channel
     */
    toggleMarketing(channelId) {
        const index = this.activeMarketing.indexOf(channelId);
        if (index === -1) {
            this.activeMarketing.push(channelId);
            return { active: true };
        } else {
            this.activeMarketing.splice(index, 1);
            return { active: false };
        }
    }

    /**
     * Is marketing active
     */
    isMarketingActive(channelId) {
        return this.activeMarketing.includes(channelId);
    }

    /**
     * Serialize for saving
     */
    toJSON() {
        return {
            equipmentLevels: this.equipmentLevels,
            currentOfficeIndex: this.currentOfficeIndex,
            staff: this.staff.map(s => ({
                id: s.id,
                typeId: s.type.id,
                hiredAt: s.hiredAt,
                happiness: s.happiness,
                productivity: s.productivity
            })),
            activeMarketing: this.activeMarketing
        };
    }

    /**
     * Load from saved data
     */
    fromJSON(data) {
        if (!data) return;

        this.equipmentLevels = data.equipmentLevels || {
            computer: 0, desk: 0, monitor: 0, chair: 0, software: 0
        };
        this.currentOfficeIndex = data.currentOfficeIndex || 0;
        this.activeMarketing = data.activeMarketing || ['word_of_mouth'];

        // Restore staff
        this.staff = (data.staff || []).map(s => ({
            id: s.id,
            type: STAFF_TYPES.find(t => t.id === s.typeId),
            hiredAt: s.hiredAt,
            happiness: s.happiness,
            productivity: s.productivity
        })).filter(s => s.type); // Filter out invalid staff
    }

    /**
     * Render office scene to element
     */
    renderOfficeScene(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const office = this.currentOffice;
        const bonuses = this.getEquipmentBonuses();

        container.innerHTML = `
            <div class="office-scene" style="background: ${office.background}">
                <div class="office-background"></div>
                <div class="office-floor"></div>
                
                <div class="office-desk">
                    <div class="office-computer"></div>
                </div>
                
                <div class="office-character">
                    <div class="character-avatar char-working">
                        ${this.gameState.character?.getEmoji() || ''}
                    </div>
                </div>
                
                <div class="office-info">
                    <span class="office-name">${office.icon} ${office.name}</span>
                </div>
            </div>
        `;
    }
}
