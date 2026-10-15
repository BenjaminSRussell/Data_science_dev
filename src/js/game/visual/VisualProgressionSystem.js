/**
 * VisualProgressionSystem.js
 * Progressively upgrades game visuals as player advances.
 * Better sprites unlock at milestones. Tier art is the shipped LPC
 * sheets and generated location backdrops — the old
 * *_character_sheet.png names are blocklisted and are not registered (#2084).
 */

import { LPC_SHEET_URLS, lpcSheet } from '../../assets/AssetManager.js';

const TIER_ORDER = ['basic', 'mid', 'premium'];

/** Index into each location's generated backdrop set (00–09 all exist). */
const TIER_BACKDROP_INDEX = {
    basic: '00',
    mid: '04',
    premium: '09'
};

/**
 * Show one frame of a tier sheet on a marker. LPC sheets are 13×21
 * cells, so 1300%×2100% makes a single cell fill the element. The frame
 * is row 10 (down-facing idle/walk): cell (0,0) is blank in every shipped
 * sheet, so the marker would show nothing from it.
 * Does not touch textContent (the evolution emoji stays).
 */
export function mountTierSprite(element, url) {
    if (!element || !url) return;
    if (!element.style.width) element.style.width = '48px';
    if (!element.style.height) element.style.height = '48px';
    element.style.backgroundImage = `url("${url}")`;
    element.style.backgroundRepeat = 'no-repeat';
    element.style.backgroundSize = '1300% 2100%';
    element.style.backgroundPosition = '0% 50%';
}

export class VisualProgressionSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentTier = 'basic'; // basic, mid, premium
        this.unlockedTiers = ['basic'];
        this.milestones = this.initializeMilestones();
        this.visualUpgrades = new Map();
        // New games start on the basic look too, not only loaded saves (#1577)
        if (typeof document !== 'undefined' && document.body) {
            this.upgradeBackgrounds(this.currentTier);
        }
        // Register and load the basic sheet up front, so the player sprite
        // is not waiting for the first milestone (#2084)
        this.upgradeSpriteSheets(this.currentTier);
    }
    
    /**
     * Initialize progression milestones
     */
    initializeMilestones() {
        return {
            // Money milestones
            money_10k: { tier: 'mid', threshold: 10000, type: 'money', unlocked: false },
            money_50k: { tier: 'mid', threshold: 50000, type: 'money', unlocked: false },
            money_100k: { tier: 'premium', threshold: 100000, type: 'money', unlocked: false },
            money_500k: { tier: 'premium', threshold: 500000, type: 'money', unlocked: false },
            
            // Relationship milestones
            relationships_5: { tier: 'mid', threshold: 5, type: 'relationships', unlocked: false },
            relationships_10: { tier: 'mid', threshold: 10, type: 'relationships', unlocked: false },
            relationships_20: { tier: 'premium', threshold: 20, type: 'relationships', unlocked: false },
            
            // Days played milestones
            days_30: { tier: 'mid', threshold: 30, type: 'days', unlocked: false },
            days_60: { tier: 'mid', threshold: 60, type: 'days', unlocked: false },
            days_100: { tier: 'premium', threshold: 100, type: 'days', unlocked: false },
            
            // Job level milestones
            job_level_5: { tier: 'mid', threshold: 5, type: 'jobLevel', unlocked: false },
            // Job tiers run 0-6 (JOB_CATEGORIES), so the top milestone is the CDO tier (#2082)
            job_level_10: { tier: 'premium', threshold: 6, type: 'jobLevel', unlocked: false },
            
            // Skills milestones: stat points gained above the starting 10 per stat
            skills_50: { tier: 'mid', threshold: 50, type: 'totalSkills', unlocked: false },
            skills_100: { tier: 'premium', threshold: 100, type: 'totalSkills', unlocked: false }
        };
    }
    
    /**
     * Check milestones and unlock visual tiers
     */
    checkMilestones() {
        const stats = this.getCurrentStats();
        const tierBefore = this.currentTier;
        let unlockedMilestone = null;

        for (const [milestoneId, milestone] of Object.entries(this.milestones)) {
            if (milestone.unlocked) continue;

            const currentValue = stats[milestone.type] || 0;

            if (currentValue >= milestone.threshold) {
                milestone.unlocked = true;
                this.unlockTier(milestone.tier);
                unlockedMilestone = unlockedMilestone || milestoneId;
            }
        }

        // Update current tier based on unlocked tiers
        this.updateCurrentTier();

        // Only an actual tier change is a visual upgrade worth announcing;
        // later milestones of an already-unlocked tier stay quiet (#2273, #1576)
        const tierChanged = this.currentTier !== tierBefore;
        if (tierChanged) {
            this.showVisualUpgradeNotification(this.currentTier, unlockedMilestone);
        }

        return tierChanged;
    }

    /**
     * Get current player stats
     */
    getCurrentStats() {
        const stats = {
            money: this.gameState.money || 0,
            relationships: 0,
            days: 0,
            jobLevel: 0,
            totalSkills: 0
        };
        
        // Count relationships
        if (this.gameState.npcManager) {
            const metNPCs = this.gameState.npcManager?.getMetNPCs() || [];
            stats.relationships = metNPCs.length;
        }
        
        // Get days played
        if (this.gameState.timeManager) {
            stats.days = this.gameState.timeManager?.totalDays || 0;
        }
        
        // Job tier from reputation (JobSystem.updateCurrentJob sets level) (#2082)
        const job = this.gameState.jobSystem?.updateCurrentJob?.() || this.gameState.jobSystem?.currentJob;
        if (job) {
            stats.jobLevel = job.level || 0;
        }

        // Total skills from the real CharacterStats (gameState.stats never existed) (#2082)
        const allStats = this.gameState.characterStats?.getAllStats?.();
        if (Array.isArray(allStats)) {
            stats.totalSkills = allStats.reduce((sum, s) => sum + Math.max(0, (Number(s.value) || 0) - 10), 0);
        }
        
        return stats;
    }
    
    /**
     * Unlock visual tier
     */
    unlockTier(tier) {
        if (!TIER_ORDER.includes(tier) || this.unlockedTiers.includes(tier)) return;
        this.unlockedTiers.push(tier);
        this.updateCurrentTier();
        if (tier === this.currentTier) {
            this.applyVisualUpgrade(tier);
        } else {
            // A lower tier unlocked after a higher one: record it, but don't
            // downgrade the visuals that are already showing
            this.visualUpgrades.set(tier, { applied: true, timestamp: Date.now() });
        }
    }
    
    /**
     * Update current tier (highest unlocked)
     */
    updateCurrentTier() {
        if (this.unlockedTiers.includes('premium')) {
            this.currentTier = 'premium';
        } else if (this.unlockedTiers.includes('mid')) {
            this.currentTier = 'mid';
        } else {
            this.currentTier = 'basic';
        }
    }
    
    /**
     * Apply visual upgrade for tier
     */
    applyVisualUpgrade(tier) {
        this.visualUpgrades.set(tier, {
            applied: true,
            timestamp: Date.now()
        });
        
        // Update sprite sheets
        this.upgradeSpriteSheets(tier);
        
        // Update backgrounds
        this.upgradeBackgrounds(tier);
        
        // Update world appearance
        this.upgradeWorldAppearance(tier);
        
        // Update UI elements
        this.upgradeUI(tier);

        // Markers that already exist pick up the new sheet immediately
        this.paintPlayerSprites();
    }
    
    /**
     * Upgrade sprite sheets based on tier.
     * Registers a file that exists, then loads it. registerSpriteSheet only
     * stores metadata; nothing rendered until loadSpriteSheet runs (#2084).
     */
    upgradeSpriteSheets(tier) {
        const spriteSheetManager = this.gameState?.spriteSheetManager;
        if (typeof spriteSheetManager?.registerSpriteSheet !== 'function') return;

        // Tier sheets are real LPC files, all 64px cells. The old
        // basic/mid/premium_character_sheet.png names were never created (#2542).
        const url = LPC_SHEET_URLS[tier];
        if (!url) return;

        const config = lpcSheet(url);
        const id = `character_${tier}`;
        spriteSheetManager.registerSpriteSheet(id, config);
        this.loadRegisteredSheet(spriteSheetManager, id);

        // ComprehensiveSpriteSystem draws 'main_character', not character_${tier}
        if (tier === this.currentTier) {
            spriteSheetManager.registerSpriteSheet('main_character', config);
            this.loadRegisteredSheet(spriteSheetManager, 'main_character');
        }
    }

    /**
     * loadSpriteSheet rejects when the image 404s. A tier unlock must not.
     */
    loadRegisteredSheet(manager, id) {
        const load = manager.loadSpriteSheet;
        if (typeof load !== 'function') return;
        try {
            const pending = load.call(manager, id);
            if (pending && typeof pending.then === 'function') pending.catch(() => {});
        } catch {
            // Missing image: keep the metadata, skip the pixels
        }
    }

    /**
     * Point existing player markers at the current tier sheet
     */
    paintPlayerSprites() {
        if (typeof document === 'undefined') return;
        const url = this.getSpriteSheetUrl('main');
        document.querySelectorAll('.player-icon, .city-player-marker').forEach(el => {
            mountTierSprite(el, url);
        });
    }
    
    /**
     * Upgrade backgrounds based on tier
     */
    upgradeBackgrounds(tier) {
        // Apply CSS classes for better backgrounds
        const body = document.body;
        body.classList.remove('visual-basic', 'visual-mid', 'visual-premium');
        body.classList.add(`visual-${tier}`);
        
        // Update location backgrounds
        const locationElements = document.querySelectorAll('.location-view-container');
        locationElements.forEach(el => {
            el.classList.remove('visual-basic', 'visual-mid', 'visual-premium');
            el.classList.add(`visual-${tier}`);
        });

        // Repaint through LocationBackgroundSystem so getBackgroundUrl is
        // what the background renderer actually draws (#2084)
        this.applyTierBackground();
    }

    /**
     * Ask the location background renderer to repaint the screen the
     * player is looking at. No-op until that system and a location exist.
     */
    applyTierBackground() {
        const raw = this.gameState?.worldMap?.currentLocation;
        const id = typeof raw === 'string' ? raw : raw?.id;
        const system = this.gameState?.locationBackgroundSystem;
        if (!id || typeof system?.applyBackground !== 'function') return;
        if (typeof document === 'undefined') return;
        const target = document.getElementById('screen-office');
        if (target) system.applyBackground(id, target);
    }
    
    /**
     * Upgrade world appearance
     */
    upgradeWorldAppearance(tier) {
        const mapContainer = document.querySelector('.map-container, .map-detailed');
        if (mapContainer) {
            mapContainer.classList.remove('visual-basic', 'visual-mid', 'visual-premium');
            mapContainer.classList.add(`visual-${tier}`);
        }
        
        // Update building appearances
        const buildings = document.querySelectorAll('.map-building, .map-npc-house');
        buildings.forEach(building => {
            building.classList.remove('visual-basic', 'visual-mid', 'visual-premium');
            building.classList.add(`visual-${tier}`);
        });
        
        // Update roads
        const roads = document.querySelectorAll('.map-road');
        roads.forEach(road => {
            road.classList.remove('visual-basic', 'visual-mid', 'visual-premium');
            road.classList.add(`visual-${tier}`);
        });
    }
    
    /**
     * Upgrade UI elements
     */
    upgradeUI(tier) {
        // Update UI panels
        const panels = document.querySelectorAll('.panel, .card, .modal-content');
        panels.forEach(panel => {
            panel.classList.remove('visual-basic', 'visual-mid', 'visual-premium');
            panel.classList.add(`visual-${tier}`);
        });
        
        // Update buttons
        const buttons = document.querySelectorAll('button, .button, .btn');
        buttons.forEach(button => {
            button.classList.remove('visual-basic', 'visual-mid', 'visual-premium');
            button.classList.add(`visual-${tier}`);
        });
    }
    
    /**
     * Show visual upgrade notification
     */
    showVisualUpgradeNotification(tier, milestoneId) {
        const tierNames = {
            basic: 'Basic',
            mid: 'Mid-Game',
            premium: 'Premium'
        };
        
        const messages = {
            mid: ' Visual Upgrade! The world is looking better!',
            premium: ' Premium Visuals Unlocked! Everything looks amazing!'
        };
        
        const message = messages[tier] || `Visual upgrade to ${tierNames[tier]} tier!`;
        
        // Show toast notification
        if (window.game && window.game.showToast) {
            window.game.showToast(message, 'success');
        }
        
        // Trigger visual upgrade effect
        this.playVisualUpgradeEffect();
    }
    
    /**
     * Play visual upgrade effect
     */
    playVisualUpgradeEffect() {
        // Add flash effect
        const overlay = document.createElement('div');
        overlay.className = 'visual-upgrade-overlay';
        overlay.style.cssText = `
            position: fixed;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background: radial-gradient(circle, rgba(255,255,255,0.3) 0%, transparent 70%);
            pointer-events: none;
            z-index: 10000;
            animation: visualUpgradeFlash 1s ease-out;
        `;
        
        document.body.appendChild(overlay);
        
        setTimeout(() => {
            overlay.remove();
        }, 1000);
    }
    
    /**
     * Get sprite sheet URL for current tier.
     * 'basic'|'mid'|'premium' name that tier's sheet; anything else
     * (including 'main') follows the unlocked tier.
     */
    getSpriteSheetUrl(characterType = 'main') {
        if (LPC_SHEET_URLS[characterType]) return LPC_SHEET_URLS[characterType];
        return LPC_SHEET_URLS[this.currentTier] || LPC_SHEET_URLS.basic;
    }
    
    /**
     * Get background URL for location and tier.
     * Files are assets/backgrounds/locations/<id>/<id>_backdrop_NN.png.
     */
    getBackgroundUrl(locationId) {
        if (!locationId) return null;
        const tier = TIER_BACKDROP_INDEX[this.currentTier] ? this.currentTier : 'basic';
        const index = TIER_BACKDROP_INDEX[tier];
        return `/assets/backgrounds/locations/${locationId}/${locationId}_backdrop_${index}.png`;
    }
    
    /**
     * Get current visual tier
     */
    getCurrentTier() {
        return this.currentTier;
    }
    
    /**
     * Check if tier is unlocked
     */
    isTierUnlocked(tier) {
        return this.unlockedTiers.includes(tier);
    }
    
    /**
     * Serialize for save
     */
    toJSON() {
        // Only progress is saved; thresholds and tiers come from code (#1578)
        const milestones = {};
        for (const [id, milestone] of Object.entries(this.milestones)) {
            milestones[id] = { unlocked: !!milestone.unlocked };
        }
        return {
            currentTier: this.currentTier,
            unlockedTiers: [...this.unlockedTiers],
            milestones,
            visualUpgrades: Array.from(this.visualUpgrades.entries())
        };
    }

    /**
     * Deserialize from save
     */
    fromJSON(data) {
        if (!data || typeof data !== 'object') return;
        if (Array.isArray(data.unlockedTiers)) {
            const tiers = data.unlockedTiers.filter(t => TIER_ORDER.includes(t));
            this.unlockedTiers = Array.from(new Set(['basic', ...tiers]));
        }
        if (data.milestones && typeof data.milestones === 'object') {
            // Only restore the unlocked flag; thresholds and tiers come from the
            // current code so old saves can't bring back outdated values (#2082)
            for (const [id, saved] of Object.entries(data.milestones)) {
                if (this.milestones[id] && saved && typeof saved === 'object') {
                    this.milestones[id].unlocked = !!saved.unlocked;
                }
            }
        }
        if (Array.isArray(data.visualUpgrades)) {
            this.visualUpgrades = new Map(data.visualUpgrades.filter(e => Array.isArray(e) && e.length === 2));
        }
        // The current tier is always the highest unlocked one
        this.updateCurrentTier();
        if (this.currentTier !== 'basic' || data.visualUpgrades) {
            // Reapply only the tier that should be showing, so the DOM never
            // ends up on a lower tier than currentTier
            this.applyVisualUpgrade(this.currentTier);
        }
    }
}

