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

        // Try to use Lit component first. LitUIManager mounts into
        // #location-view, which nothing created before (#2130, #1633)
        if (this.game?.uiUpdater?.litUIManager) {
            this.container = this.ensureContainer();
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

            // The Lit component only dispatches feature-click; handle it here
            // like the DOM fallback's click handler (#2063)
            const component = this.getLitComponent();
            if (component && !component.__dsdFeatureListener) {
                component.addEventListener('feature-click', (e) => {
                    if (e.detail?.feature) this.interactWithFeature(e.detail.feature);
                });
                component.__dsdFeatureListener = true;
            }

            // Still render characters (not yet migrated to Lit)
            this.renderCharacters(locationId);
            return;
        }

        // Fallback to old DOM method
        this.container = this.ensureContainer();
        this.renderLocation(locationId, locationDetails);
    }

    ensureContainer() {
        let container = document.getElementById('location-view');
        if (!container) {
            container = this.createContainer();
            document.body.appendChild(container);
        }
        return container;
    }

    getLitComponent() {
        return this.game?.uiUpdater?.litUIManager?.components?.get?.('locationView')
            || document.querySelector('location-view-component');
    }

    /**
     * The characters container lives in the Lit component's shadow root
     * when Lit renders the view, where document.getElementById can't see
     * it (#2202)
     */
    getCharactersContainer() {
        const shadow = this.getLitComponent()?.shadowRoot;
        return shadow?.getElementById('location-characters')
            || document.getElementById('location-characters');
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

        // Render features using getLocationFeatures() instead of direct access
        const features = this.game.locationDetailSystem?.getLocationFeatures(locationId) || [];
        this.renderFeatures(features);

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
            const featureEl = document.createElement('div');
            featureEl.className = 'location-feature';
            featureEl.dataset.featureId = feature.id;
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

            // Keyboard users can reach and activate features too (#878)
            featureEl.setAttribute('role', 'button');
            featureEl.setAttribute('tabindex', '0');
            featureEl.setAttribute('aria-label', feature.name || feature.id);
            featureEl.addEventListener('click', () => {
                this.interactWithFeature(feature);
            });
            featureEl.addEventListener('keydown', (e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    this.interactWithFeature(feature);
                }
            });

            featuresContainer.appendChild(featureEl);
        });
    }

    /**
     * Render characters in location
     */
    renderCharacters(locationId) {
        const charactersContainer = this.getCharactersContainer();
        if (!charactersContainer) return;
        // Rebuild from scratch like renderFeatures(), so repeat calls don't
        // stack duplicate characters (#2204)
        charactersContainer.innerHTML = '';

        // Get NPCs at this location
        // Only NPCs whose unlock requirements are met appear here
        const npcManager = this.game.gameState.npcManager;
        const locationNPCs = npcManager?.getNPCsAtLocation
            ? npcManager.getNPCsAtLocation(locationId).map(npc => npcManager.getAllNPCs().find(n => n.id === npc.id) || npc)
            : [];

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
                    // Every band sets an emotion, so dropping back below 50
                    // no longer leaves the NPC stuck on 'happy' (#2203)
                    const relationship = this.game.gameState.npcManager?.getRelationship(npc.id) || 0;
                    this.characterAnimationSystem.setEmotion(npc.id, LocationView.emotionForRelationship(relationship));
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

        if (!result?.result) return null;
        const applied = this.applyFeatureResult(result.result);
        if (this.game.showToast) {
            this.game.showToast(applied.blocked || result.result.message, applied.blocked ? 'error' : 'info');
        }
        if (!applied.blocked) this.game.uiUpdater?.updateAllUI?.();
        return applied;
    }

    /**
     * Apply a feature's energy/skill/money effects; they used to be read
     * and thrown away (#2391, #2063, #45). Paid features need the cash.
     */
    applyFeatureResult(res) {
        const gs = this.game.gameState || {};
        const money = Number(res.money) || 0;
        if (money < 0 && (Number(gs.money) || 0) < -money) {
            return { blocked: `You need $${-money} for that.` };
        }
        const applied = { energy: 0, skill: 0, money: 0 };
        if (money) {
            gs.money = (Number(gs.money) || 0) + money;
            if (money < 0) gs.totalSpent = (gs.totalSpent || 0) - money;
            applied.money = money;
        }
        const energy = Number(res.energy) || 0;
        const tm = this.game.timeManager || gs.timeManager;
        if (energy > 0 && tm?.restoreEnergy) {
            tm.restoreEnergy(energy);
            applied.energy = energy;
        } else if (energy < 0 && tm?.useEnergy) {
            tm.useEnergy(-energy);
            applied.energy = energy;
        }
        const skill = Number(res.skill) || 0;
        const stats = this.game.characterStats || gs.characterStats;
        if (skill > 0 && stats?.addExperience) {
            stats.addExperience(LocationView.SKILL_STAT, skill * LocationView.XP_PER_SKILL_POINT);
            applied.skill = skill;
        }
        return applied;
    }

    static SKILL_STAT = 'intelligence';
    static XP_PER_SKILL_POINT = 10;

    static emotionForRelationship(relationship) {
        const r = Number(relationship) || 0;
        if (r > 50) return 'happy';
        if (r < 0) return 'sad';
        return 'neutral';
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

