/**
 * MapHelpers.js - Optimized for linear time complexity
 * No delays, efficient DOM updates, cached lookups
 * Cleanup: Uses centralized utilities
 */

import { LAWYER_TIERS } from '../game/LegalSystem.js';
import { CameraSystem } from '../camera/CameraSystem.js';
import { updateMapLocationIcons, updateLockBadges } from './MapIconRenderer.js';
import { initializeMapRenderer } from '../game/MapSystemInitializer.js';
import { DOMUtils } from '../utils/DOMUtils.js';
import { logger } from '../utils/Logger.js';
import { VEHICLES, VEHICLES_MAP } from '../game/WorldMap.js';
import { TRAINING_ACTIVITIES } from '../game/CharacterStats.js';
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
                    // First visit: the map finished loading after ScreenManager's
                    // resize call, so size it now if the map is still showing (#2147)
                    if (game.screenManager?.isScreenActive?.('screen-map')) {
                        game.unifiedMapSystem?.handleResize?.();
                    }
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
    updatePlayerMarker(game);

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

        // Mark news as read when displayed in ticker
        latestNews.forEach(n => game.newsManager.markAsRead(n.id));

        // Update the news badge
        if (game.updateNewsBadge) {
            game.updateNewsBadge();
        }
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
            // Label derived from the real activity so cost/time can't drift (#1171)
            textContent: (() => {
                const act = TRAINING_ACTIVITIES.find(a => a.id === 'gym_workout');
                if (!act) return 'Workout';
                const hours = (act.timeSlots || 1) * 3;
                return `Workout ($${act.cost} / ${hours}h)`;
            })(),
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
        createCityHallActions(game, domCache.actionsEl); // appends its own buttons
    }

    // People here: the live way to meet and talk to NPCs (#1467)
    buttons.push(...createNPCTalkButtons(game, locId));

    // Batch append buttons
    if (buttons.length > 0) {
        domCache.actionsEl.appendChild(DOMUtils.batch(buttons));
    }
}

/**
 * "Talk to <name>" buttons for the (unlocked) NPCs at a location
 */
export function createNPCTalkButtons(game, locId) {
    const npcManager = game.gameState?.npcManager;
    const npcs = npcManager?.getNPCsAtLocation?.(locId) || [];
    return npcs.map(npc => DOMUtils.createElement('button', {
        className: 'btn-cartoon btn-npc-talk',
        textContent: `Talk to ${npc.name}`,
        attributes: { 'data-npc': npc.id },
        listeners: {
            click: () => game.handleVisitNPC(npc.id)
        }
    }));
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

    // The cheaper Series 63 alternative for stock trading (#1537)
    const series63Owned = game.gameState.legalSystem?.hasLicense('series_63') || false;
    const s63Btn = document.createElement('button');
    s63Btn.className = `btn-cartoon ${series63Owned ? 'disabled' : ''}`;
    s63Btn.innerHTML = series63Owned ? 'Series 63 Active' : 'Take Series 63 Exam ($1,000)';
    if (!series63Owned) s63Btn.onclick = () => game.handleBuyLicense('series_63');
    actionsEl.appendChild(s63Btn);

    // Driver's License gates cars, Business License gates senior hires (#1536)
    const extraLicenses = [
        { id: 'drivers_license', buy: "Get Driver's License ($200)", owned: "Driver's License" },
        { id: 'business_license', buy: 'Get Business License ($2,000)', owned: 'Business Licensed' }
    ];
    for (const lic of extraLicenses) {
        const owned = game.gameState.legalSystem?.hasLicense(lic.id) || false;
        const btn = document.createElement('button');
        btn.className = `btn-cartoon ${owned ? 'disabled' : ''}`;
        btn.textContent = owned ? lic.owned : lic.buy;
        if (!owned) btn.onclick = () => game.handleBuyLicense(lic.id);
        actionsEl.appendChild(btn);
    }

    // Lawyer retainers: only offer upgrades over the current one (#1535)
    const currentLawyer = game.gameState.legalSystem?.lawyer || null;
    const currentRank = LAWYER_TIERS.findIndex(t => t.id === currentLawyer);
    if (currentRank >= 0) {
        const status = document.createElement('button');
        status.className = 'btn-cartoon disabled';
        status.textContent = `${LAWYER_TIERS[currentRank].name} on retainer`;
        actionsEl.appendChild(status);
    }
    LAWYER_TIERS.slice(currentRank + 1).forEach(tier => {
        const btn = document.createElement('button');
        btn.className = 'btn-cartoon';
        btn.textContent = `Retain ${tier.name} ($${tier.cost.toLocaleString()}, -${Math.round(tier.reduction * 100)}% penalties)`;
        btn.onclick = () => game.handleHireLawyer(tier.id);
        actionsEl.appendChild(btn);
    });
}

/**
 * Force the location action buttons to rebuild (e.g. after buying a license),
 * bypassing the "location unchanged" skip (#1163, #2377).
 */
export function refreshLocationActions(game) {
    if (domCache.actionsEl) delete domCache.actionsEl.dataset.currentLocation;
    updateLocationActions(game);
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
    // Render every vehicle in the catalog, not just the 3 hard-coded in
    // index.html (#1164). Clicks are handled by the delegated #vehicle-options
    // listener in main.js.
    const container = document.getElementById('vehicle-options');
    const wm = game.worldMap;
    if (!container || !wm) return;
    const ownedSet = wm.ownedVehicles || new Set(['walking']);
    const atDealer = wm.currentLocation === 'car_dealership';
    container.innerHTML = '';
    for (const v of VEHICLES) {
        const owned = ownedSet.has(v.id);
        const dealerOnly = vehicleRequiresDealership(v);
        const el = document.createElement('div');
        el.className = 'vehicle-option';
        el.dataset.vehicle = v.id;
        el.setAttribute('role', 'button');
        el.tabIndex = 0;
        if (!owned) el.classList.add('locked');
        if (wm.currentVehicle === v.id) el.classList.add('active');
        const icon = document.createElement('span');
        icon.className = 'vehicle-icon';
        const name = document.createElement('span');
        name.className = 'vehicle-name';
        name.textContent = v.name;
        el.append(icon, name);
        if (v.id !== 'walking') {
            const price = document.createElement('span');
            price.className = 'vehicle-price';
            price.textContent = owned
                ? 'Owned'
                : (dealerOnly && !atDealer ? `$${v.price.toLocaleString()} @ Auto World` : `$${v.price.toLocaleString()}${v.isMonthly ? '/mo' : ''}`);
            el.appendChild(price);
        }
        el.title = owned ? `Switch to ${v.name}` : (dealerOnly && !atDealer ? 'Buy cars at Auto World (car dealership)' : `Buy ${v.name}`);
        container.appendChild(el);
    }
}

/**
 * Cars can only be bought at the car dealership; the bus pass is sold anywhere (#1703).
 */
export function vehicleRequiresDealership(vehicle) {
    return !!vehicle && vehicle.id !== 'walking' && vehicle.id !== 'bus_pass';
}

/**
 * Handle travel to a location - No delays, immediate execution
 */
export function handleTravel(game, locationId) {
    const result = game.worldMap.travelTo(locationId);

    if (result.success && result.alreadyHere) {
        // No time charged for "travelling" to where you already are (#1434, #2168)
        game.showToast(`You're already at ${result.location?.name || 'this location'}`, 'info');
        game.screenManager.showScreen('screen-office');
        return;
    }

    if (result.success) {
        // gameState.currentLocation reads through to the world map; keep the
        // persisted store copy in step too (#982)
        game.gameStore?.getState?.()?.setCurrentLocation?.(locationId);

        // Advance time immediately
        game.handleTimeAdvance(result.timeCost);

        // Update immediately (no setTimeout). The location background goes on
        // after the layout so nothing overwrites it (#2008, #1065)
        updateMapScreen(game);
        game.uiUpdater.updateLocationLayout(locationId);
        updateEnvironmentForLocation(game, locationId);
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
    // Paint the location screen the player is about to see, not #screen-map,
    // which is hidden right after travel and re-themed by ScreenThemeManager
    // whenever it is shown (#2008, #1065)
    const system = game.locationBackgroundSystem || game.gameState?.locationBackgroundSystem;
    if (system) {
        const target = document.getElementById('screen-office');
        if (target) {
            system.applyBackground(locationId, target);
        }
    }
}

/**
 * Handle location-based shop actions - O(1)
 */
export function handleLocationAction(game, action) {
    // Handle car-related activities
    if (action === 'browse_cars') {
        handleBrowseCars(game);
        return;
    }

    if (action === 'buy_car') {
        handleBuyCar(game);
        return;
    }

    if (action === 'sell_car') {
        handleSellCar(game);
        return;
    }

    // Handle simple shop actions
    const actions = {
        'buy_donut': { cost: 5, energyGain: 10, message: "Yummy donut! +10 Energy" },
        'eat_donut': { cost: 5, energyGain: 10, message: "Yum!" },
        'buy_coffee': { cost: 4, energyGain: 15, message: "Caffeine boost! +15 Energy" },
        'buy_bagel': { cost: 6, energyGain: 12, message: "Tasty bagel! +12 Energy" },
        'eat_bagel': { cost: 0, energyGain: 12, message: "Ate your bagel! +12 Energy" },
        'coffee_network': { cost: 4, energyGain: 5, relationshipGain: 2, message: "Networked over coffee! +5 Energy" },
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
        // TimeManager exposes restoreEnergy(), not gainEnergy() (#2397)
        (game.timeManager || game.gameState.timeManager)?.restoreEnergy?.(actionData.energyGain);
    }
    // Networking actually builds relationships with whoever is here; the
    // method this called never existed, so the gain was silently dropped
    let networkMessage = '';
    const npcManager = game.npcManager || game.gameState.npcManager;
    if (actionData.relationshipGain && npcManager?.boostNearbyRelationships) {
        const locationId = game.worldMap?.currentLocation || game.gameState.worldMap?.currentLocation;
        const boosted = npcManager.boostNearbyRelationships(actionData.relationshipGain, locationId);
        networkMessage = boosted > 0 ? ` (+${actionData.relationshipGain} with ${boosted} ${boosted === 1 ? 'person' : 'people'} here)` : ' (nobody to network with here)';
    }

    game.uiUpdater?.updateAllUI?.();
    updateMapScreen(game);
    game.showToast(actionData.message + networkMessage, 'success');
    game.audioManager?.play?.('kaching');
}

/**
 * Handle browse cars action - O(n) where n is number of vehicles
 * Shows available vehicles without purchase prompt
 */
function handleBrowseCars(game) {
    if (!game.worldMap) {
        game.showError("Vehicle shop temporarily unavailable");
        return;
    }

    const ownedVehicles = game.worldMap.ownedVehicles || new Set();

    // Build vehicle list from VEHICLES constant (skip walking)
    const vehicleList = VEHICLES
        .filter(v => v.id !== 'walking')
        .map(v => ({
            id: v.id,
            name: v.name,
            price: v.price,
            owned: ownedVehicles.has(v.id)
        }));

    if (vehicleList.length === 0) {
        game.showError("Vehicle shop temporarily unavailable");
        return;
    }

    // Create a browse display without purchase prompt
    const message = vehicleList
        .map(v => {
            const status = v.owned ? '(Owned)' : `$${v.price.toLocaleString()}`;
            return `${v.name}: ${status}`;
        })
        .join('\n');

    game.showToast(`Available Vehicles:\n\n${message}`, 'info');
}

/**
 * Handle buy car action - O(n) where n is number of vehicles
 * Prompts player to select and purchase a vehicle
 */
function handleBuyCar(game) {
    if (!game.worldMap) {
        game.showError("Vehicle shop temporarily unavailable");
        return;
    }

    const ownedVehicles = game.worldMap.ownedVehicles || new Set();

    // Build vehicle list from VEHICLES constant (skip walking)
    const vehicleList = VEHICLES
        .filter(v => v.id !== 'walking')
        .map(v => ({
            id: v.id,
            name: v.name,
            price: v.price,
            owned: ownedVehicles.has(v.id)
        }));

    if (vehicleList.length === 0) {
        game.showError("Vehicle shop temporarily unavailable");
        return;
    }

    // Create a simple dialog to purchase vehicles
    const message = vehicleList
        .map(v => {
            const status = v.owned ? '(Owned)' : `$${v.price.toLocaleString()}`;
            return `${v.name}: ${status}`;
        })
        .join('\n');

    // Use vehicle ID (e.g., 'used_car') as default - more robust than name matching
    const selected = prompt(
        `Available Vehicles:\n\n${message}\n\nEnter vehicle ID to purchase (or cancel):`,
        'used_car'
    );

    if (!selected) return;

    // Match by vehicle ID first, then by name as fallback for user convenience
    let selectedVehicle = vehicleList.find(v => v.id === selected);
    if (!selectedVehicle) {
        selectedVehicle = vehicleList.find(v => v.name.toLowerCase() === selected.toLowerCase());
    }

    if (!selectedVehicle) {
        game.showError(`Vehicle "${selected}" not found`);
        return;
    }

    if (selectedVehicle.owned) {
        game.showError(`You already own the ${selectedVehicle.name}`);
        return;
    }

    if (game.gameState.money < selectedVehicle.price) {
        game.showError(`Not enough money! Need $${selectedVehicle.price.toLocaleString()}`);
        return;
    }

    if (confirm(`Buy ${selectedVehicle.name} for $${selectedVehicle.price.toLocaleString()}?`)) {
        const result = game.worldMap.buyVehicle(selectedVehicle.id);
        if (result.success) {
            game.showToast(`Bought ${selectedVehicle.name}!`, 'success');
            if (game.audioManager?.play) game.audioManager.play('kaching');
            updateMapScreen(game);
            if (game.uiUpdater?.updateAllUI) game.uiUpdater.updateAllUI();
        } else {
            game.showError(result.reason);
        }
    }
}

/**
 * Handle sell car action - O(n) where n is number of owned vehicles
 */
function handleSellCar(game) {
    if (!game.worldMap) {
        game.showError("Vehicle shop temporarily unavailable");
        return;
    }

    const ownedVehicles = game.worldMap.ownedVehicles || new Set();

    // Build list of owned vehicles (skip walking)
    const vehicleList = VEHICLES
        .filter(v => ownedVehicles.has(v.id) && v.id !== 'walking')
        .map(v => ({
            id: v.id,
            name: v.name,
            price: v.price,
            salePrice: Math.floor(v.price * 0.5)
        }));

    if (vehicleList.length === 0) {
        game.showError("You don't own any vehicles to sell!");
        return;
    }

    const message = vehicleList
        .map(v => `${v.name}: $${v.salePrice.toLocaleString()}`)
        .join('\n');

    // Use vehicle ID as default for more reliable matching
    const selected = prompt(
        `Vehicles for Sale:\n\n${message}\n\nEnter vehicle ID to sell (or cancel):`,
        vehicleList.length > 0 ? vehicleList[0].id : ''
    );

    if (!selected) return;

    // Match by vehicle ID first, then by name as fallback
    let selectedVehicle = vehicleList.find(v => v.id === selected);
    if (!selectedVehicle) {
        selectedVehicle = vehicleList.find(v => v.name.toLowerCase() === selected.toLowerCase());
    }

    if (!selectedVehicle) {
        game.showError(`Vehicle "${selected}" not found`);
        return;
    }

    if (confirm(`Sell ${selectedVehicle.name} for $${selectedVehicle.salePrice.toLocaleString()}?`)) {
        const result = game.worldMap.sellVehicle(selectedVehicle.id);
        if (result.success) {
            game.showToast(`Sold ${selectedVehicle.name} for $${result.salePrice}!`, 'success');
            if (game.audioManager?.play) game.audioManager.play('kaching');
            updateMapScreen(game);
            if (game.uiUpdater?.updateAllUI) game.uiUpdater.updateAllUI();
        } else {
            game.showError(result.reason);
        }
    }
}
