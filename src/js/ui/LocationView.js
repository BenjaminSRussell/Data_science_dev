/**
 * LocationView.js
 * Renders location with background and interactive features
 * Phase 2: Now uses Lit component (LocationViewComponent) with fallback
 */

export class LocationView {
    constructor(game, assetManager, characterAnimationSystem, threeRenderer) {
        this.game = game;
        this.assetManager = assetManager;
        this.characterAnimationSystem = characterAnimationSystem;
        this.threeRenderer = threeRenderer;
        this.currentLocation = null;
        this.container = null;
        this.litComponent = null;
    }

    /**
     * Show location view
     * Phase 2: Uses Lit component if available
     */
    showLocation(locationId) {
        const locationDetails = this.game.locationDetailSystem?.getLocationDetails(locationId);
        if (!locationDetails) {
            console.warn(`Location details not found: ${locationId}`);
            return;
        }

        this.currentLocation = locationId;

        // Try to use Lit component first
        if (this.game?.uiUpdater?.litUIManager) {
            const background = this.assetManager?.getLocationBackground(locationId);
            const backgroundImage = background?.src &&
                typeof background.src === 'string' &&
                !background.src.includes('data:') &&
                !background.src.includes('canvas')
                ? background.src : '';
            const timeOfDay = this.game.dayNightCycle?.getTimeOfDay() || 'noon';

            this.game.uiUpdater?.litUIManager?.updateLocationView(
                locationId,
                locationDetails,
                backgroundImage,
                timeOfDay
            );

            // Still render characters (not yet migrated to Lit)
            this.renderCharacters(locationId);
            return;
        }

        // Fallback to old DOM method
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
     * Render location (fallback method using DOM)
     */
    renderLocation(locationId, details) {
        const background = this.assetManager?.getLocationBackground(locationId);
        const timeOfDay = this.game.dayNightCycle?.getTimeOfDay() || 'noon';

        // Only set inline background-image if we have a valid asset
        const backgroundStyle = background && background.src &&
            typeof background.src === 'string' &&
            !background.src.includes('data:') &&
            !background.src.includes('canvas')
            ? `background-image: url('${background.src}');`
            : '';

        this.container.innerHTML = `
            <div class="location-background ${locationId} time-${timeOfDay}" 
                 style="${backgroundStyle}">
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

        features?.forEach((feature, index) => {
            const featureEl = document.createElement('button');
            featureEl.type = 'button';
            featureEl.className = 'location-feature';
            featureEl.dataset.featureId = feature.id;
            featureEl.setAttribute('aria-label', feature.name);
            featureEl.style.left = `${20 + (index % 5) * 15}%`;
            featureEl.style.top = `${30 + Math.floor(index / 5) * 20}%`;
            // Use icon image if available, otherwise use emoji
            const iconEl = feature.icon && feature.icon.startsWith('/')
                ? `<img src="${feature.icon}" alt="${feature.name}" style="width: 32px; height: 32px; object-fit: contain; object-position: center center;">`
                : `<span>${feature.icon || ''}</span>`;

            featureEl.innerHTML = `
                ${iconEl}
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

        locationNPCs?.forEach((npc, index) => {
            // Check for 3D model
            if (npc.modelPath && this.threeRenderer) {
                // Render 3D
                let charEl = document.getElementById(`location-char-${npc.id}`);
                if (!charEl) {
                    charEl = document.createElement('div');
                    charEl.id = `location-char-${npc.id}`;
                    charEl.className = 'location-character-container';
                    // Add some spacing/positioning if needed
                    charEl.style.margin = '0 10px';
                    charactersContainer.appendChild(charEl);
                }

                // Clear previous content if switching renderers or refreshing
                charEl.innerHTML = '';

                // create3DCharacter returns a div containing the canvas
                const modelEl = this.threeRenderer.create3DCharacter(npc.id, {
                    path: npc.modelPath,
                    width: 120, // Smaller for location view
                    height: 180
                });
                charEl.appendChild(modelEl);

                // We might want to add click handlers here if not handled by the renderer
                charEl.addEventListener('click', () => {
                    // Trigger conversation or interaction
                    this.game.conversationScreen?.showConversation(npc.id);
                });

            } else {
                // Register character if not already (2D Fallback)
                if (this.characterAnimationSystem && !this.characterAnimationSystem.characters.has(npc.id)) {
                    this.characterAnimationSystem.registerCharacter(npc.id, {
                        name: npc.name,
                        currentEmotion: 'neutral',
                        currentPose: 'standing'
                    });
                }

                // Create character element
                if (this.characterAnimationSystem) {
                    this.characterAnimationSystem.createCharacterElement(npc.id, charactersContainer);

                    // Set initial emotion based on relationship
                    const relationship = this.game.gameState.npcManager?.getRelationship(npc.id) || 0;
                    if (relationship > 50) {
                        this.characterAnimationSystem.setEmotion(npc.id, 'happy');
                    } else if (relationship < 20) {
                        this.characterAnimationSystem.setEmotion(npc.id, 'neutral');
                    }
                }
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

