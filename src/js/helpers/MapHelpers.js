/**
 * MapHelpers.js - Optimized for linear time complexity
 * No delays, efficient DOM updates, cached lookups
 * Cleanup: Uses centralized utilities
 */

import { CameraSystem } from '../camera/CameraSystem.js';
import { NPCs } from '../game/NPCManager.js';
import { updateMapLocationIcons, updateLockBadges } from './MapIconRenderer.js';
import { initializeMapRenderer } from '../game/MapSystemInitializer.js';
import { DOMUtils } from '../utils/DOMUtils.js';
import { logger } from '../utils/Logger.js';
// WorldMapRenderer imported lazily to avoid circular dependencies

// Cache DOM elements to avoid repeated queries (using DOMUtils cache)
const domCache = {
    mapContainer: null,
    timeSlotEl: null,
    timeIconEl: null,
    dateEl: null,
    energyFillEl: null,
    energyTextEl: null,
    newsEl: null,
    actionsEl: null,
    playerMarker: null
};

// Cache for rendered elements to avoid recreation
const renderCache = {
    buildings: new Map(),
    environment: new Set()
};

/**
 * Initialize DOM cache - call once
 */
function initDOMCache() {
    if (!domCache.mapContainer) {
        domCache.mapContainer = document.getElementById('world-map');
        domCache.timeSlotEl = document.getElementById('current-time-slot');
        domCache.timeIconEl = document.getElementById('time-slot-icon');
        domCache.dateEl = document.getElementById('current-date');
        domCache.energyFillEl = document.getElementById('energy-fill');
        domCache.energyTextEl = document.getElementById('energy-text');
        domCache.newsEl = document.getElementById('news-ticker-content');
        domCache.actionsEl = document.getElementById('location-actions');
        domCache.playerMarker = document.getElementById('player-marker');
    }
}

/**
 * Initialize camera system for the map
 */
export function initializeCameraSystem(game) {
    initDOMCache();
    if (!game.cameraSystem && domCache.mapContainer) {
        try {
            game.cameraSystem = new CameraSystem(domCache.mapContainer);
            if (game.gameState) {
                game.gameState.cameraSystem = game.cameraSystem;
            }
        } catch (error) {
            logger.warn('Camera system initialization failed:', error);
        }
    }
}

/**
 * Update the map screen with current state - Optimized O(n) single pass
 */
export function updateMapScreen(game) {
    if (!game.worldMap || !game.timeManager) return;

    initDOMCache();
    initializeCameraSystem(game);

    // Update all displays in single pass
    updateTimeDisplay(game);
    updateEnergyDisplay(game);
    updateNewsTicker(game);
    updateLocationActions(game);

    // Use UnifiedMapSystem (PixiJS-based, replaces all old renderers)
    if (!game.unifiedMapSystem && domCache.mapContainer) {
        try {
            import('../game/UnifiedMapSystem.js').then(({ UnifiedMapSystem }) => {
                game.unifiedMapSystem = new UnifiedMapSystem(domCache.mapContainer, game);
                // Initialize map system
                game.unifiedMapSystem.initialize().then(() => {

                }).catch(err => {
                    console.error('UnifiedMapSystem initialization failed:', err);
                    // Fallback disabled - WorldMapRenderer causes import errors
                    // Game will continue without map renderer if UnifiedMapSystem fails
                    logger.warn('Map rendering unavailable - UnifiedMapSystem failed and fallback disabled');
                });
            }).catch(err => {
                logger.warn('UnifiedMapSystem load error:', err);
                // Fallback disabled - WorldMapRenderer causes import errors
                // Game will continue without map renderer if UnifiedMapSystem fails
                console.warn('Map rendering unavailable - UnifiedMapSystem failed to load');
            });
        } catch (err) {
            console.warn('UnifiedMapSystem initialization error:', err);
        }
    } else if (game.unifiedMapSystem) {
        // Update existing unified map system
        // If not rendered yet, try to initialize
        if (!game.unifiedMapSystem.rendered) {
            game.unifiedMapSystem.initialize().catch(err => {
                logger.warn('UnifiedMapSystem re-initialization failed:', err);
            });
        } else {
            game.unifiedMapSystem.update();
        }
    } else if (game.worldMapRenderer) {
        // Fallback to old world map renderer
        game.worldMapRenderer.update();
    } else if (game.simpleMapRenderer) {
        // Fallback to old simple map renderer
        game.simpleMapRenderer.update();
    }

    updateVehicleDisplay(game);
    updateMapLocationStates(game);

    // Update icons to use image assets
    updateMapLocationIcons(game);
    updateLockBadges();
}

/**
 * Update time display elements - O(1)
 */
function updateTimeDisplay(game) {
    const timeSlot = game.timeManager?.getCurrentSlot();
    if (domCache.timeSlotEl && timeSlot) domCache.timeSlotEl.textContent = timeSlot.name || '';
    if (domCache.timeIconEl && timeSlot) domCache.timeIconEl.textContent = timeSlot.icon || '';
    if (domCache.dateEl) domCache.dateEl.textContent = game.timeManager?.getDateString() || '';
}

/**
 * Update energy display - O(1)
 */
function updateEnergyDisplay(game) {
    const energyPct = game.timeManager?.getEnergyPercent() || 0;
    DOMUtils.updateElement(domCache.energyFillEl, {
        style: { width: `${energyPct}%` }
    });
    DOMUtils.updateElement(domCache.energyTextEl, {
        textContent: `${Math.floor(game.timeManager.energy)}/${game.timeManager.maxEnergy}`
    });
}

/**
 * Update news ticker - O(k) where k is news count (typically 5)
 */
function updateNewsTicker(game) {
    if (!game.newsManager || !domCache.newsEl) return;

    const latestNews = game.newsManager.getRecentNews(5);
    if (latestNews.length > 0) {
        const newsText = latestNews.map(n => `[${n.category}] ${n.text}`).join('    •    ');
        domCache.newsEl.textContent = newsText + '    •    ' + newsText;
    }
}

/**
 * Update location-specific action buttons - O(1)
 */
function updateLocationActions(game) {
    if (!domCache.actionsEl) return;

    // Clear only if location changed
    const locId = game.worldMap.currentLocation;
    if (domCache.actionsEl.dataset.currentLocation !== locId) {
        DOMUtils.clear(domCache.actionsEl);
        domCache.actionsEl.dataset.currentLocation = locId;
    } else {
        return; // Already correct, skip
    }

    const buttons = [];

    if (locId === 'stock_exchange') {
        buttons.push(DOMUtils.createElement('button', {
            className: 'btn-cartoon',
            textContent: 'Enter Stock Exchange',
            listeners: {
                click: () => {
                    game.screenManager.showScreen('screen-stock-market');
                    game.updateStockMarketScreen();
                }
            }
        }));
    } else if (locId === 'gym') {
        buttons.push(DOMUtils.createElement('button', {
            className: 'btn-cartoon',
            textContent: 'Workout ($20 / 2h)',
            listeners: {
                click: () => game.handleTraining('gym_workout')
            }
        }));
    } else if (locId === 'library') {
        buttons.push(
            DOMUtils.createElement('button', {
                className: 'btn-cartoon',
                textContent: 'Study (2h)',
                listeners: {
                    click: () => game.handleTraining('study_books')
                }
            }),
            DOMUtils.createElement('button', {
                className: 'btn-cartoon btn-special',
                textContent: 'Open Manual',
                listeners: {
                    click: () => {
                        game.screenManager.showScreen('screen-library');
                        game.uiUpdater.updateLibraryScreen();
                    }
                }
            })
        );
    } else if (locId === 'city_hall') {
        createCityHallActions(game, domCache.actionsEl);
        return; // createCityHallActions handles its own buttons
    }

    // Batch append buttons
    if (buttons.length > 0) {
        domCache.actionsEl.appendChild(DOMUtils.batch(buttons));
    }
}

/**
 * Create city hall license buttons - O(1)
 */
function createCityHallActions(game, actionsEl) {
    const llcOwned = game.gameState.legalSystem?.hasLicense('llc_registration') || false;
    const series7Owned = game.gameState.legalSystem?.hasLicense('series_7') || false;

    const llcBtn = document.createElement('button');
    llcBtn.className = `btn-cartoon ${llcOwned ? 'disabled' : ''}`;
    llcBtn.innerHTML = llcOwned ? 'LLC Registered' : 'Register LLC ($500)';
    if (!llcOwned) llcBtn.onclick = () => game.handleBuyLicense('llc_registration');
    actionsEl.appendChild(llcBtn);

    const s7Btn = document.createElement('button');
    s7Btn.className = `btn-cartoon ${series7Owned ? 'disabled' : ''}`;
    s7Btn.innerHTML = series7Owned ? 'Series 7 Active' : 'Take Series 7 Exam ($1,500)';
    if (!series7Owned) s7Btn.onclick = () => game.handleBuyLicense('series_7');
    actionsEl.appendChild(s7Btn);
}

/**
 * Render map environment - Optimized to only update changed elements
 */
// Map environment now handled by SimpleMapRenderer
export function renderMapEnvironment(game) {
    // No longer needed - SimpleMapRenderer handles parks/trees
    if (!domCache.mapContainer) return;

    // Static tree positions - only render once
    if (renderCache.environment.has('trees')) {
        return; // Already rendered
    }

    const treePositions = [
        { x: 15, y: 20 }, { x: 25, y: 15 }, { x: 35, y: 25 },
        { x: 65, y: 30 }, { x: 75, y: 20 }, { x: 85, y: 25 },
        { x: 20, y: 60 }, { x: 30, y: 65 }, { x: 70, y: 70 },
        { x: 80, y: 75 }, { x: 15, y: 80 }, { x: 25, y: 85 }
    ];

    // Batch DOM operations
    const treeElements = treePositions.map((pos, index) => {
        const treeIndex = index % 10;
        const treeImg = DOMUtils.createElement('img', {
            attributes: {
                src: `/assets/map/trees/tree_${String(treeIndex).padStart(2, '0')}.png`
            },
            style: {
                width: '100%',
                height: '100%',
                objectFit: 'contain',
                objectPosition: 'center center'
            },
            listeners: {
                error: function () {
                    this.style.background = 'linear-gradient(135deg, #228B22 0%, #006400 100%)';
                    this.style.borderRadius = '50% 50% 50% 50% / 60% 60% 40% 40%';
                }
            }
        });

        return DOMUtils.createElement('div', {
            className: 'map-tree',
            style: {
                left: `${pos.x}%`,
                top: `${pos.y}%`
            },
            children: [treeImg]
        });
    });

    const fragment = DOMUtils.batch(treeElements);

    // Road segments
    const roadSegments = [
        { x: 20, y: 25, width: 60, height: 2 },
        { x: 50, y: 10, width: 2, height: 75 },
        { x: 30, y: 40, width: 30, height: 1 },
        { x: 40, y: 50, width: 15, height: 1 },
    ];

    roadSegments.forEach((segment, index) => {
        const roadTile = document.createElement('div');
        roadTile.className = 'map-road-tile';
        roadTile.style.left = `${segment.x}%`;
        roadTile.style.top = `${segment.y}%`;
        roadTile.style.width = `${segment.width}%`;
        roadTile.style.height = `${segment.height}%`;

        const roadImg = document.createElement('img');
        const roadIndex = index % 10;
        roadImg.src = `/assets/map/roads/road_${String(roadIndex).padStart(2, '0')}.png`;
        roadImg.style.width = '100%';
        roadImg.style.height = '100%';
        roadImg.style.objectFit = 'cover';
        roadImg.style.objectPosition = 'center center';
        roadImg.onerror = () => {
            roadTile.style.background = '#4a4a4a';
            roadTile.style.border = '1px solid #2a2a2a';
        };
        roadTile.appendChild(roadImg);
        fragment.appendChild(roadTile);
    });

    domCache.mapContainer.appendChild(fragment);
    renderCache.environment.add('trees');
}

/**
 * Render building visuals - Only update changed buildings
 */
// Map buildings now handled by SimpleMapRenderer - no separate rendering needed

/**
 * Render NPC houses - DISABLED
 * No people on map for cleaner, simpler appearance
 */
export function renderNPCHouses(game) {
    // No longer rendering NPC houses - map is cleaner without people
    // SimpleMapRenderer handles all map rendering
}

/**
 * Update map location access states - O(n) single pass
 */
function updateMapLocationStates(game) {
    const accessible = game.worldMap.getAccessibleLocations();
    const accessibleSet = new Set(accessible.map(l => l.id)); // O(n) to build Set
    const currentLocation = game.worldMap.currentLocation;

    // Single pass through DOM elements
    const locationElements = DOMUtils.queryAll('.map-location');
    for (const el of locationElements) {
        const id = el.dataset.location;
        if (!id) continue;

        // O(1) Set lookup
        const isAccessible = accessibleSet.has(id);
        DOMUtils.toggleClass(el, 'locked', !isAccessible);

        // Highlight current location
        DOMUtils.toggleClass(el, 'current', currentLocation === id);
    }
}

/**
 * Update player marker position - O(1)
 * Now supports grid coordinates
 */
function updatePlayerMarker(game) {
    const currentLocation = game.worldMap.getCurrentLocation();
    if (currentLocation?.position && domCache.playerMarker) {
        // All locations use grid coordinates (0-30) - convert to percentage
        let percentX, percentY;
        if (game.mapManager) {
            const percent = game.mapManager.gridToPercent(
                currentLocation.position.x,
                currentLocation.position.y
            );
            percentX = percent.x;
            percentY = percent.y;
        } else {
            // Fallback: assume 30x30 grid
            percentX = (currentLocation.position.x / 30) * 100;
            percentY = (currentLocation.position.y / 30) * 100;
        }
        domCache.playerMarker.style.left = `${percentX}%`;
        domCache.playerMarker.style.top = `${percentY}%`;
    }
}

/**
 * Update vehicle display - O(m) where m is vehicle count
 */
function updateVehicleDisplay(game) {
    const vehicleElements = DOMUtils.queryAll('.vehicle-option');
    const ownedSet = game.worldMap.ownedVehicles; // Already a Set

    for (const el of vehicleElements) {
        const id = el.dataset.vehicle;
        if (!id) continue;

        // O(1) Set lookup
        if (ownedSet.has(id)) {
            DOMUtils.toggleClass(el, 'locked', false);
            const priceEl = el.querySelector('.vehicle-price');
            if (priceEl) {
                DOMUtils.updateElement(priceEl, { textContent: 'Owned' });
            }
        }

        // Highlight active
        DOMUtils.toggleClass(el, 'active', game.worldMap.currentVehicle === id);
    }
}

/**
 * Handle travel to a location - No delays, immediate execution
 */
export function handleTravel(game, locationId) {
    const result = game.worldMap.travelTo(locationId);

    if (result.success) {
        // Advance time immediately
        game.handleTimeAdvance(result.timeCost);

        // Update immediately (no setTimeout)
        updateMapScreen(game);
        updateEnvironmentForLocation(game, locationId);
        game.uiUpdater.updateLocationLayout(locationId);
        game.showToast(`Traveled to ${result.location.name}`, 'success');

        // Switch screen immediately
        game.screenManager.showScreen('screen-office');
    } else {
        game.showError(result.reason);
    }
}

/**
 * Update environment for a specific location - O(1)
 */
export function updateEnvironmentForLocation(game, locationId) {
    if (game.locationBackgroundSystem) {
        const screen = document.getElementById('screen-map');
        if (screen) {
            game.locationBackgroundSystem.applyBackground(locationId, screen);
        }
    }
}

/**
 * Handle location-based shop actions - O(1)
 */
export function handleLocationAction(game, action) {
    const actions = {
        'buy_donut': { cost: 5, energyGain: 10, message: "Yummy donut! +10 Energy" },
        'eat_donut': { cost: 5, energyGain: 10, message: "Yum!" },
        'buy_coffee': { cost: 4, energyGain: 15, message: "Caffeine boost! +15 Energy" },
        'buy_bagel': { cost: 6, energyGain: 12, message: "Tasty bagel! +12 Energy" },
        'buy_flowers': { cost: 15, energyGain: 0, message: "Smells nice! You feel happier." },
        'buy_plant': { cost: 25, energyGain: 0, message: "A nice plant for your office. (Visual only for now)" }
    };

    const actionData = actions[action];
    if (!actionData) {
        logger.warn("Unknown action:", action);
        return;
    }

    if (game.gameState.money < actionData.cost) {
        game.showError("Not enough money!");
        return;
    }

    // Apply effects immediately
    game.gameState.money -= actionData.cost;
    if (actionData.energyGain > 0) {
        game.timeManager.gainEnergy(actionData.energyGain);
    }

    game.uiUpdater.updateAllUI();
    updateMapScreen(game);
    game.showToast(actionData.message, 'success');
    game.audioManager.play('kaching');
}
