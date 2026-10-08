/**
 * OfficeManager - Handles office upgrades, equipment, and staff
 */

import { EQUIPMENT, OFFICES, STAFF_TYPES, MARKETING_CHANNELS } from '../data/tycoonData.js';

const EQUIPMENT_TYPES = ['computer', 'desk', 'monitor', 'chair', 'software'];

let staffSeq = 0;

function escapeHtml(value) {
    return String(value ?? '').replace(/[&<>"']/g, c => ({
        '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
    }[c]));
}

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

        // Keep the visual office tier in sync with the real office progression
        this.syncOfficeLevel();
    }

    /**
     * Map an OFFICES id to the background-tier string used by
     * LocationBackgroundSystem.getOfficeBackground().
     */
    static OFFICE_LEVEL_MAP = {
        bedroom: 'small',
        home_office: 'small',
        coworking: 'medium',
        small_office: 'medium',
        office_floor: 'large',
        headquarters: 'executive'
    };

    /**
     * Sync gameState.officeLevel to the current office so the location
     * background reflects the real office progression.
     */
    syncOfficeLevel() {
        const office = this.currentOffice;
        if (!office) return;
        const level = OfficeManager.OFFICE_LEVEL_MAP[office.id] || 'small';
        if (this.gameState.officeLevel !== level) {
            this.gameState.officeLevel = level;
        }
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

        // Keep the visual office tier in sync with the real office progression
        this.syncOfficeLevel();

        window.dispatchEvent(new CustomEvent('officeupgraded', {
            detail: { office: this.currentOffice }
        }));

        return { success: true, newOffice: this.currentOffice };
    }

    /**
     * Get available staff to hire
     */
    getAvailableStaff() {
        // A full office can't take anyone (#102)
        if (this.staff.length >= (this.currentOffice?.capacity ?? 0)) return [];
        // Only list roles the player can actually pay the hiring cost for
        const money = Number(this.gameState?.money) || 0;
        return STAFF_TYPES.filter(s => money >= OfficeManager.hiringCost(s));
    }

    /**
     * baseSalary is a daily rate (getDailyStaffCost sums it per day), so the
     * hiring fee is a fixed number of days' pay, not a "month" (#1799)
     */
    static HIRING_COST_DAYS = 2;

    static hiringCost(staffType) {
        return (Number(staffType?.baseSalary) || 0) * OfficeManager.HIRING_COST_DAYS;
    }

    /**
     * Skills the current team covers (#2328)
     */
    getTeamSkills() {
        const skills = new Set();
        for (const member of this.staff) {
            for (const skill of member?.type?.skills || []) skills.add(skill);
        }
        return [...skills];
    }

    /**
     * Sum the role bonuses (project manager, sales rep) of hired staff (#1798)
     */
    getStaffBonuses() {
        const totals = { clientSatisfaction: 0, clientLeadsPerDay: 0 };
        for (const member of this.staff) {
            const bonus = member?.type?.bonus;
            if (!bonus) continue;
            for (const [key, value] of Object.entries(bonus)) {
                totals[key] = (totals[key] || 0) + (Number(value) || 0);
            }
        }
        return totals;
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

        const hiringCost = OfficeManager.hiringCost(staffType);
        if (this.gameState.money < hiringCost) {
            return { success: false, reason: 'Not enough money for hiring' };
        }

        this.gameState.money -= hiringCost;

        const newStaff = {
            // Counter + random suffix: two hires in one millisecond stay distinct (#2229)
            id: OfficeManager.nextStaffId(this.staff),
            type: staffType,
            hiredAt: Date.now()
        };

        this.staff.push(newStaff);

        window.dispatchEvent(new CustomEvent('staffhired', { detail: newStaff }));

        return { success: true, staff: newStaff };
    }

    /**
     * Mint a staff id that is unique even within the same millisecond
     */
    static nextStaffId(existing = []) {
        const taken = new Set(existing.map(s => s?.id));
        let id;
        do {
            staffSeq += 1;
            id = `staff_${Date.now()}_${staffSeq}_${Math.random().toString(36).slice(2, 7)}`;
        } while (taken.has(id));
        return id;
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
                hiredAt: s.hiredAt
            })),
            activeMarketing: this.activeMarketing
        };
    }

    /**
     * Load from saved data
     */
    fromJSON(data) {
        if (!data) return;

        // Merge per key and clamp to real levels so a partial or stale save
        // can't break getEquipmentBonuses()/getEquipmentDetails() (#1802, #2228)
        const savedLevels = data.equipmentLevels && typeof data.equipmentLevels === 'object'
            ? data.equipmentLevels : {};
        this.equipmentLevels = {};
        for (const type of EQUIPMENT_TYPES) {
            const max = (EQUIPMENT[type]?.levels?.length || 1) - 1;
            this.equipmentLevels[type] = OfficeManager.clampIndex(savedLevels[type], max);
        }
        this.currentOfficeIndex = OfficeManager.clampIndex(data.currentOfficeIndex, OFFICES.length - 1);
        this.activeMarketing = Array.isArray(data.activeMarketing)
            ? data.activeMarketing.filter(id => MARKETING_CHANNELS.some(m => m.id === id))
            : ['word_of_mouth'];

        // Re-derive the visual office tier from the restored office index
        this.syncOfficeLevel();

        // Restore staff
        this.staff = (data.staff || []).map(s => ({
            id: s.id,
            type: STAFF_TYPES.find(t => t.id === s.typeId),
            hiredAt: s.hiredAt
        })).filter(s => s.type); // Filter out invalid staff
    }

    /**
     * Whole number in [0, max]; anything else becomes 0
     */
    static clampIndex(value, max) {
        const n = Math.floor(Number(value));
        if (!Number.isFinite(n) || n < 0) return 0;
        return Math.min(n, Math.max(0, max));
    }

    /**
     * Render office scene to element
     */
    renderOfficeScene(containerId) {
        const container = document.getElementById(containerId);
        if (!container) return;

        const office = this.currentOffice;
        const bonuses = this.getEquipmentBonuses();
        // GameState has no `character`; use the player's name when known (#1803)
        const playerName = this.gameState?.playerName || this.gameState?.characterStats?.name || '';
        const bonusRows = [
            ['Speed', bonuses.speed],
            ['Comfort', bonuses.comfort],
            ['Clarity', bonuses.clarity],
            ['Stamina', bonuses.stamina],
            ['Capability', bonuses.capability]
        ].map(([label, value]) =>
            `<li class="office-bonus"><span>${label}</span><strong>x${Number(value ?? 1).toFixed(2)}</strong></li>`
        ).join('');

        container.innerHTML = `
            <div class="office-scene" style="background: ${escapeHtml(office.background)}">
                <div class="office-background"></div>
                <div class="office-floor"></div>

                <div class="office-desk">
                    <div class="office-computer"></div>
                </div>

                <div class="office-character">
                    <div class="character-avatar char-working">${escapeHtml(playerName)}</div>
                </div>

                <div class="office-info">
                    <span class="office-name">${escapeHtml(office.icon)} ${escapeHtml(office.name)}</span>
                    <ul class="office-bonuses" aria-label="Equipment bonuses">${bonusRows}</ul>
                </div>
            </div>
        `;
    }
}
