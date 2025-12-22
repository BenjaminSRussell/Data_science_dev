/**
 * VisualProgressionSystem.js
 * Progressively upgrades game visuals as player advances
 * Better sprites unlock at milestones
 */

export class VisualProgressionSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.currentTier = 'basic'; // basic, mid, premium
        this.unlockedTiers = ['basic'];
        this.milestones = this.initializeMilestones();
        this.visualUpgrades = new Map();
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
            job_level_10: { tier: 'premium', threshold: 10, type: 'jobLevel', unlocked: false },
            
            // Skills milestones
            skills_50: { tier: 'mid', threshold: 50, type: 'totalSkills', unlocked: false },
            skills_100: { tier: 'premium', threshold: 100, type: 'totalSkills', unlocked: false }
        };
    }
    
    /**
     * Check milestones and unlock visual tiers
     */
    checkMilestones() {
        const stats = this.getCurrentStats();
        let unlockedNewTier = false;
        
        for (const [milestoneId, milestone] of Object.entries(this.milestones)) {
            if (milestone.unlocked) continue;
            
            const currentValue = stats[milestone.type] || 0;
            
            if (currentValue >= milestone.threshold) {
                milestone.unlocked = true;
                this.unlockTier(milestone.tier);
                unlockedNewTier = true;
                
                // Show upgrade notification
                this.showVisualUpgradeNotification(milestone.tier, milestoneId);
            }
        }
        
        // Update current tier based on unlocked tiers
        this.updateCurrentTier();
        
        return unlockedNewTier;
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
        
        // Get job level
        if (this.gameState.jobSystem && this.gameState.jobSystem.currentJob) {
            stats.jobLevel = this.gameState.jobSystem?.currentJob?.level || 0;
        }
        
        // Calculate total skills
        if (this.gameState.stats) {
            stats.totalSkills = Object.values(this.gameState.stats).reduce((sum, val) => sum + (val || 0), 0);
        }
        
        return stats;
    }
    
    /**
     * Unlock visual tier
     */
    unlockTier(tier) {
        if (!this.unlockedTiers.includes(tier)) {
            this.unlockedTiers.push(tier);
            this.applyVisualUpgrade(tier);
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
    }
    
    /**
     * Upgrade sprite sheets based on tier
     */
    upgradeSpriteSheets(tier) {
        const spriteSheetManager = this.gameState?.spriteSheetManager;
        if (!spriteSheetManager) return;
        
        // Register better sprite sheets for higher tiers
        const spriteSheets = {
            basic: {
                url: '/assets/characters/sprites/basic_character_sheet.png',
                quality: 'low'
            },
            mid: {
                url: '/assets/characters/sprites/mid_character_sheet.png',
                quality: 'medium'
            },
            premium: {
                url: '/assets/characters/sprites/premium_character_sheet.png',
                quality: 'high'
            }
        };
        
        const sheet = spriteSheets[tier];
        if (sheet) {
            spriteSheetManager.registerSpriteSheet(`character_${tier}`, {
                url: sheet.url,
                frameWidth: tier === 'premium' ? 128 : 64,
                frameHeight: tier === 'premium' ? 128 : 64,
                columns: 8,
                rows: 8
            });
        }
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
     * Get sprite sheet URL for current tier
     */
    getSpriteSheetUrl(characterType = 'main') {
        const urls = {
            basic: `/assets/characters/sprites/${characterType}_basic.png`,
            mid: `/assets/characters/sprites/${characterType}_mid.png`,
            premium: `/assets/characters/sprites/${characterType}_premium.png`
        };
        
        return urls[this.currentTier] || urls.basic;
    }
    
    /**
     * Get background URL for location and tier
     */
    getBackgroundUrl(locationId) {
        const urls = {
            basic: `/assets/backgrounds/locations/${locationId}_basic.png`,
            mid: `/assets/backgrounds/locations/${locationId}_mid.png`,
            premium: `/assets/backgrounds/locations/${locationId}_premium.png`
        };
        
        return urls[this.currentTier] || urls.basic;
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
        return {
            currentTier: this.currentTier,
            unlockedTiers: this.unlockedTiers,
            milestones: this.milestones,
            visualUpgrades: Array.from(this.visualUpgrades.entries())
        };
    }
    
    /**
     * Deserialize from save
     */
    fromJSON(data) {
        if (data.currentTier) this.currentTier = data.currentTier;
        if (data.unlockedTiers) this.unlockedTiers = data.unlockedTiers;
        if (data.milestones) {
            Object.assign(this.milestones, data.milestones);
        }
        if (data.visualUpgrades) {
            this.visualUpgrades = new Map(data.visualUpgrades);
            // Reapply visual upgrades
            this.unlockedTiers.forEach(tier => {
                this.applyVisualUpgrade(tier);
            });
        }
    }
}

