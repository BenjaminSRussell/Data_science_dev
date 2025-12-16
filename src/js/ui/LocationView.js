/**
 * LocationView.js
 * Renders location with background and interactive features
 * Uses cartoonish backgrounds and character animations
 */

export class LocationView {
    constructor(game, assetManager, characterAnimationSystem) {
        this.game = game;
        this.assetManager = assetManager;
        this.characterAnimationSystem = characterAnimationSystem;
        this.currentLocation = null;
        this.container = null;
    }
    
    /**
     * Show location view
     */
    showLocation(locationId) {
        const locationDetails = this.game.locationDetailSystem?.getLocationDetails(locationId);
        if (!locationDetails) {
            console.warn(`Location details not found: ${locationId}`);
            return;
        }
        
        this.currentLocation = locationId;
        
        // Create or get container
        let container = document.getElementById('location-view');
        if (!container) {
            container = this.createContainer();
            document.body.appendChild(container);
        }
        
        this.container = container;
        this.renderLocation(locationId, locationDetails);
    }
    
    /**
     * Create location view container
     */
    createContainer() {
        const container = document.createElement('div');
        container.id = 'location-view';
        container.className = 'location-view-container';
        return container;
    }
    
    /**
     * Render location
     */
    renderLocation(locationId, details) {
        const background = this.assetManager?.getLocationBackground(locationId);
        const timeOfDay = this.game.dayNightCycle?.getTimeOfDay() || 'noon';
        
        this.container.innerHTML = `
            <div class="location-background ${locationId} time-${timeOfDay}" 
                 style="${background ? `background-image: url('${background.src}');` : ''}">
                <div class="location-content">
                    <h2 class="location-title">${details.name}</h2>
                    <p class="location-description">${details.description}</p>
                </div>
                <div class="location-features" id="location-features"></div>
                <div class="character-container" id="location-characters"></div>
            </div>
        `;
        
        // Render features
        this.renderFeatures(details.features);
        
        // Render characters in location
        this.renderCharacters(locationId);
    }
    
    /**
     * Render location features
     */
    renderFeatures(features) {
        const featuresContainer = document.getElementById('location-features');
        if (!featuresContainer) return;
        
        featuresContainer.innerHTML = '';
        
        features.forEach((feature, index) => {
            const featureEl = document.createElement('div');
            featureEl.className = 'location-feature';
            featureEl.dataset.featureId = feature.id;
            featureEl.style.left = `${20 + (index % 5) * 15}%`;
            featureEl.style.top = `${30 + Math.floor(index / 5) * 20}%`;
            featureEl.innerHTML = `
                <span>${feature.icon || '📦'}</span>
                <div class="location-feature-label">${feature.name}</div>
            `;
            
            featureEl.addEventListener('click', () => {
                this.interactWithFeature(feature);
            });
            
            featuresContainer.appendChild(featureEl);
        });
    }
    
    /**
     * Render characters in location
     */
    renderCharacters(locationId) {
        const charactersContainer = document.getElementById('location-characters');
        if (!charactersContainer) return;
        
        // Get NPCs at this location
        const npcs = this.game.gameState.npcManager?.getAllNPCs() || [];
        const locationNPCs = npcs.filter(npc => npc.location === locationId);
        
        locationNPCs.forEach((npc, index) => {
            // Register character if not already
            if (!this.characterAnimationSystem.characters.has(npc.id)) {
                this.characterAnimationSystem.registerCharacter(npc.id, {
                    name: npc.name,
                    currentEmotion: 'neutral',
                    currentPose: 'standing'
                });
            }
            
            // Create character element
            this.characterAnimationSystem.createCharacterElement(npc.id, charactersContainer);
            
            // Set initial emotion based on relationship
            const relationship = this.game.gameState.npcManager?.getRelationship(npc.id) || 0;
            if (relationship > 50) {
                this.characterAnimationSystem.setEmotion(npc.id, 'happy');
            } else if (relationship < 20) {
                this.characterAnimationSystem.setEmotion(npc.id, 'neutral');
            }
        });
    }
    
    /**
     * Interact with feature
     */
    interactWithFeature(feature) {
        const result = this.game.locationDetailSystem?.interactWithFeature(
            this.currentLocation,
            feature.id
        );
        
        if (result) {
            // Show result message
            if (this.game.showToast) {
                this.game.showToast(result.result.message, 'info');
            }
            
            // Update game state based on result
            if (result.result.energy) {
                // Restore energy
            }
            if (result.result.skill) {
                // Increase skill
            }
            if (result.result.money) {
                // Change money
            }
        }
    }
    
    /**
     * Update location based on time of day
     */
    updateTimeOfDay(timeOfDay) {
        const background = this.container?.querySelector('.location-background');
        if (background) {
            background.className = `location-background ${this.currentLocation} time-${timeOfDay}`;
        }
    }
}

