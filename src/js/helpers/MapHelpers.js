/**
 * MapHelpers.js
 * Helper functions for map navigation, travel, and location rendering
 */

import { CameraSystem } from '../camera/CameraSystem.js';
import { NPCs } from '../game/NPCManager.js';

/**
 * Initialize camera system for the map
 */
export function initializeCameraSystem(game) {
    const mapContainer = document.getElementById('world-map');
    if (!game.cameraSystem && mapContainer) {
        try {
            game.cameraSystem = new CameraSystem(mapContainer);
            if (game.gameState) {
                game.gameState.cameraSystem = game.cameraSystem;
            }
        } catch (error) {
            console.warn('Camera system initialization failed:', error);
        }
    }
}

/**
 * Update the map screen with current state
 */
export function updateMapScreen(game) {
    if (!game.worldMap || !game.timeManager) return;

    // Initialize camera system if needed
    initializeCameraSystem(game);

    // Update time display
    updateTimeDisplay(game);
    
    // Update energy display
    updateEnergyDisplay(game);
    
    // Update news ticker
    updateNewsTicker(game);
    
    // Update location actions
    updateLocationActions(game);
    
    // Render buildings and NPC houses
    renderMapBuildings(game);
    renderNPCHouses(game);
    
    // Update map location states
    updateMapLocationStates(game);
    
    // Update player marker
    updatePlayerMarker(game);
    
    // Update vehicles
    updateVehicleDisplay(game);
}

/**
 * Update time display elements
 */
function updateTimeDisplay(game) {
    const timeSlot = game.timeManager.getCurrentSlot();
    const timeSlotEl = document.getElementById('current-time-slot');
    const timeIconEl = document.getElementById('time-slot-icon');
    const dateEl = document.getElementById('current-date');
    
    if (timeSlotEl) timeSlotEl.textContent = timeSlot.name;
    if (timeIconEl) timeIconEl.textContent = timeSlot.icon;
    if (dateEl) dateEl.textContent = game.timeManager.getDateString();
}

/**
 * Update energy display
 */
function updateEnergyDisplay(game) {
    const energyPct = game.timeManager.getEnergyPercent();
    const energyFillEl = document.getElementById('energy-fill');
    const energyTextEl = document.getElementById('energy-text');
    
    if (energyFillEl) energyFillEl.style.width = `${energyPct}%`;
    if (energyTextEl) energyTextEl.textContent = `${Math.floor(game.timeManager.energy)}/${game.timeManager.maxEnergy}`;
}

/**
 * Update news ticker
 */
function updateNewsTicker(game) {
    if (game.newsManager) {
        const latestNews = game.newsManager.getRecentNews(5);
        const newsEl = document.getElementById('news-ticker-content');
        if (latestNews.length > 0 && newsEl) {
            const newsText = latestNews.map(n => `[${n.category}] ${n.text}`).join('    •    ');
            newsEl.textContent = newsText + '    •    ' + newsText;
        }
    }
}

/**
 * Update location-specific action buttons
 */
function updateLocationActions(game) {
    const actionsEl = document.getElementById('location-actions');
    if (!actionsEl) return;

    actionsEl.innerHTML = '';
    const locId = game.worldMap.currentLocation;

    if (locId === 'stock_exchange') {
        const btn = document.createElement('button');
        btn.className = 'btn-cartoon';
        btn.textContent = '📈 Enter Stock Exchange';
        btn.onclick = () => {
            game.screenManager.showScreen('screen-stock-market');
            game.updateStockMarketScreen();
        };
        actionsEl.appendChild(btn);
    } else if (locId === 'gym') {
        const btn = document.createElement('button');
        btn.className = 'btn-cartoon';
        btn.textContent = '🏋️ Workout ($20 / 2h)';
        btn.onclick = () => {
            game.handleTraining('gym_workout');
        };
        actionsEl.appendChild(btn);
    } else if (locId === 'library') {
        const btnStudy = document.createElement('button');
        btnStudy.className = 'btn-cartoon';
        btnStudy.textContent = '📚 Study (2h)';
        btnStudy.onclick = () => {
            game.handleTraining('study_books');
        };
        actionsEl.appendChild(btnStudy);

        const btnGrimoire = document.createElement('button');
        btnGrimoire.className = 'btn-cartoon btn-special';
        btnGrimoire.textContent = '📖 Open Manual';
        btnGrimoire.onclick = () => {
            game.screenManager.showScreen('screen-library');
            game.uiUpdater.updateLibraryScreen();
        };
        actionsEl.appendChild(btnGrimoire);
    } else if (locId === 'city_hall') {
        createCityHallActions(game, actionsEl);
    }
}

/**
 * Create city hall license buttons
 */
function createCityHallActions(game, actionsEl) {
    const llcOwned = game.gameState.legalSystem.hasLicense('llc_registration');
    const series7Owned = game.gameState.legalSystem.hasLicense('series_7');

    const llcBtn = document.createElement('button');
    llcBtn.className = `btn-cartoon ${llcOwned ? 'disabled' : ''}`;
    llcBtn.innerHTML = llcOwned ? '✅ LLC Registered' : '📝 Register LLC ($500)';
    if (!llcOwned) llcBtn.onclick = () => game.handleBuyLicense('llc_registration');
    actionsEl.appendChild(llcBtn);

    const s7Btn = document.createElement('button');
    s7Btn.className = `btn-cartoon ${series7Owned ? 'disabled' : ''}`;
    s7Btn.innerHTML = series7Owned ? '✅ Series 7 Active' : '📜 Take Series 7 Exam ($1,500)';
    if (!series7Owned) s7Btn.onclick = () => game.handleBuyLicense('series_7');
    actionsEl.appendChild(s7Btn);
}

/**
 * Render building visuals on the map
 */
export function renderMapBuildings(game) {
    const mapContainer = document.getElementById('world-map');
    if (!mapContainer) return;

    // Remove existing buildings
    mapContainer.querySelectorAll('.map-building').forEach(el => el.remove());

    // Add buildings for each location
    const accessible = game.worldMap.getAccessibleLocations();
    accessible.forEach(location => {
        const building = document.createElement('div');
        building.className = `map-building ${location.type || 'commercial'}`;
        building.style.left = `${location.position.x}%`;
        building.style.top = `${location.position.y}%`;
        mapContainer.appendChild(building);
    });
}

/**
 * Render NPC houses on the map
 */
export function renderNPCHouses(game) {
    const mapContainer = document.getElementById('world-map');
    if (!mapContainer || !game.npcManager) return;

    // Remove existing NPC houses
    mapContainer.querySelectorAll('.map-npc-house').forEach(el => el.remove());

    // Get ALL NPCs - every character needs a house
    const npcs = NPCs.filter(npc => {
        const npcLocation = game.worldMap.getLocation(npc.location);
        return npcLocation && npcLocation.position;
    });

    npcs.forEach(npc => {
        const npcLocation = game.worldMap.getLocation(npc.location);
        if (!npcLocation || !npcLocation.position) return;

        // Use coordinate system to find available position
        let houseCoord;
        if (game.mapCoordinateSystem) {
            houseCoord = game.mapCoordinateSystem.findNPCHouseCoord(
                npcLocation.position.x,
                npcLocation.position.y
            );
        } else {
            // Fallback to random offset
            const offsetX = (Math.random() - 0.5) * 8;
            const offsetY = (Math.random() - 0.5) * 8;
            houseCoord = {
                x: npcLocation.position.x + offsetX,
                y: npcLocation.position.y + offsetY
            };
        }

        const house = document.createElement('div');
        house.className = 'map-npc-house';
        house.style.left = `${houseCoord.x}%`;
        house.style.top = `${houseCoord.y}%`;
        house.title = `${npc.name}'s House - ${npc.title || npc.type}`;
        house.dataset.npcId = npc.id;
        house.dataset.npcType = npc.type || 'friend';
        
        // Add house image (simple placeholder)
        const houseImg = document.createElement('img');
        houseImg.src = '/assets/backgrounds/locations/house_simple.svg';
        houseImg.style.width = '100%';
        houseImg.style.height = '100%';
        houseImg.style.objectFit = 'contain';
        houseImg.onerror = () => {
            // Fallback to colored div if SVG doesn't load
            house.style.background = 'linear-gradient(135deg, #DEB887 0%, #8B4513 100%)';
            house.style.border = '2px solid #654321';
        };
        house.appendChild(houseImg);
        
        // Add visual indicator for NPC type
        const houseIcon = document.createElement('div');
        houseIcon.className = 'npc-house-icon';
        // Use first letter of name, or icon if available
        houseIcon.textContent = npc.icon || npc.name.charAt(0).toUpperCase();
        house.appendChild(houseIcon);
        
        // Add tooltip with NPC info
        house.setAttribute('data-tooltip', `${npc.name}\n${npc.title || npc.type}\n${npc.description || npc.backstory || ''}`);

        house.addEventListener('click', (e) => {
            e.stopPropagation();
            game.showToast(`${npc.name} lives near ${npcLocation.name}`, 'info');
        });

        mapContainer.appendChild(house);
    });
}

/**
 * Update map location access states
 */
function updateMapLocationStates(game) {
    const accessible = game.worldMap.getAccessibleLocations();
    document.querySelectorAll('.map-location').forEach(el => {
        const id = el.dataset.location;
        if (!id) return;

        const isAccessible = accessible.some(l => l.id === id);
        if (isAccessible) {
            el.classList.remove('locked');
        } else {
            el.classList.add('locked');
        }

        // Highlight current location
        if (game.worldMap.currentLocation === id) {
            el.classList.add('current');
        } else {
            el.classList.remove('current');
        }
    });
}

/**
 * Update player marker position
 */
function updatePlayerMarker(game) {
    const currentLocation = game.worldMap.getCurrentLocation();
    if (currentLocation && currentLocation.position) {
        const marker = document.getElementById('player-marker');
        if (marker) {
            marker.style.left = `${currentLocation.position.x}%`;
            marker.style.top = `${currentLocation.position.y}%`;
        }
    }
}

/**
 * Update vehicle display
 */
function updateVehicleDisplay(game) {
    document.querySelectorAll('.vehicle-option').forEach(el => {
        const id = el.dataset.vehicle;
        if (!id) return;

        // Check if owned
        if (game.worldMap.ownedVehicles.includes(id)) {
            el.classList.remove('locked');
            const priceEl = el.querySelector('.vehicle-price');
            if (priceEl) priceEl.textContent = 'Owned';
        }

        // Highlight active
        if (game.worldMap.currentVehicle === id) {
            el.classList.add('active');
        } else {
            el.classList.remove('active');
        }
    });
}

/**
 * Handle travel to a location
 */
export function handleTravel(game, locationId) {
    const result = game.worldMap.travelTo(locationId);

    if (result.success) {
        // Advance time based on travel
        game.handleTimeAdvance(result.timeCost);
        updateMapScreen(game);
        updateEnvironmentForLocation(game, locationId);
        game.uiUpdater.updateLocationLayout(locationId);
        game.showToast(`Traveled to ${result.location.name}`, 'success');

        // Switch to location view
        setTimeout(() => {
            game.screenManager.showScreen('screen-office');
        }, 500);
    } else {
        game.showError(result.reason);
    }
}

/**
 * Update environment for a specific location
 */
export function updateEnvironmentForLocation(game, locationId) {
    // Update location background
    if (game.locationBackgroundSystem) {
        const screen = document.getElementById('screen-map');
        if (screen) {
            game.locationBackgroundSystem.applyBackground(locationId, screen);
        }
    }
}

/**
 * Handle location-based shop actions
 */
export function handleLocationAction(game, action) {
    let cost = 0;
    let message = '';
    let energyGain = 0;

    switch (action) {
        case 'buy_donut':
            cost = 5;
            if (game.gameState.money < cost) {
                game.showError("Not enough money!");
                return;
            }
            energyGain = 10;
            message = "Yummy donut! +10 Energy";
            break;
        case 'eat_donut':
            cost = 5;
            energyGain = 10;
            message = "Yum!";
            break;
        case 'buy_coffee':
            cost = 4;
            if (game.gameState.money < cost) {
                game.showError("Not enough money!");
                return;
            }
            energyGain = 15;
            message = "Caffeine boost! +15 Energy";
            break;
        case 'buy_bagel':
            cost = 6;
            if (game.gameState.money < cost) {
                game.showError("Not enough money!");
                return;
            }
            energyGain = 12;
            message = "Tasty bagel! +12 Energy";
            break;
        case 'buy_flowers':
            cost = 15;
            if (game.gameState.money < cost) {
                game.showError("Not enough money!");
                return;
            }
            message = "Smells nice! You feel happier.";
            break;
        case 'buy_plant':
            cost = 25;
            if (game.gameState.money < cost) {
                game.showError("Not enough money!");
                return;
            }
            message = "A nice plant for your office. (Visual only for now)";
            break;
        default:
            console.log("Unknown action:", action);
            return;
    }

    // Apply effects
    game.gameState.money -= cost;
    if (energyGain > 0) game.timeManager.gainEnergy(energyGain);

    game.uiUpdater.updateAllUI();
    updateMapScreen(game);
    game.showToast(message, 'success');
    game.audioManager.play('kaching');
}



