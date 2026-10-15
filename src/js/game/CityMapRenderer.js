/**
 * CityMapRenderer.js
 * Simplified, professional city map renderer based on Cities: Skylines approach
 * Tile-based system with clear visual hierarchy
 */

export class CityMapRenderer {
    constructor(container, game) {
        this.container = container;
        this.game = game;
        this.gridSize = 30; // 30x30 grid like Cities: Skylines approach
        this.tileSize = 20; // 20px per tile
        this.rendered = false;
    }

    /**
     * Initialize and render the complete city map
     */
    initialize() {
        if (this.rendered) return;
        
        // Clear container and ensure proper class
        this.container.innerHTML = '';
        this.container.classList.add('city-map-container');
        if (!this.container.classList.contains('map-container')) {
            this.container.classList.add('map-container');
        }
        
        // Hidden containers report 0×0. The 600 fallback is only a first paint;
        // _tileSizeProvisional keeps it from staying locked once a real size exists.
        this._applyContainerSize(this._readContainerSize());
        
        // Render in order: background -> grid -> zones -> roads -> buildings -> locations
        this.renderBackground();
        this.renderGrid();
        this.renderZones(); // Async but will render
        this.renderRoads();
        this.renderBuildings();
        this.renderLocations();
        
        this.rendered = true;
        this._watchContainerSize();
        if (this._tileSizeProvisional) {
            this._scheduleProvisionalRemeasure();
        }
    }

    /**
     * offsetWidth/offsetHeight, with the historical 600 fallback when a side is 0.
     * provisional is true until both sides have been measured above 0.
     */
    _readContainerSize() {
        const width = this.container.offsetWidth || 0;
        const height = this.container.offsetHeight || 0;
        return {
            width: width || 600,
            height: height || 600,
            provisional: width <= 0 || height <= 0
        };
    }

    _applyContainerSize(size) {
        this.tileSize = Math.min(size.width / this.gridSize, size.height / this.gridSize);
        this._tileSizeProvisional = size.provisional;
    }

    /**
     * Recompute tileSize from the live container. Ignores 0×0 so a later hide
     * does not bake the 600 fallback over a measurement that was already real.
     */
    _syncTileSizeFromContainer() {
        if (!this.container || !this.rendered) return;
        const size = this._readContainerSize();
        if (size.provisional) return;
        const next = Math.min(size.width / this.gridSize, size.height / this.gridSize);
        const unchanged = !this._tileSizeProvisional && Math.abs(next - this.tileSize) < 0.01;
        this._tileSizeProvisional = false;
        if (unchanged) return;
        this.tileSize = next;
        this._refreshTileSizedLayers();
    }

    _scheduleProvisionalRemeasure() {
        if (this._remeasureFrame != null) return;
        if (typeof requestAnimationFrame !== 'function') return;
        this._remeasureFrame = requestAnimationFrame(() => {
            this._remeasureFrame = null;
            if (!this._tileSizeProvisional || !this.rendered) return;
            this._syncTileSizeFromContainer();
        });
    }

    _watchContainerSize() {
        if (this._sizeWatchBound) return;
        this._sizeWatchBound = true;
        const ResizeObs = window.ResizeObserver;
        if (typeof ResizeObs === 'function') {
            this._resizeObserver = new ResizeObs(() => {
                this._syncTileSizeFromContainer();
            });
            this._resizeObserver.observe(this.container);
            return;
        }
        this._onWindowResize = () => this._syncTileSizeFromContainer();
        window.addEventListener('resize', this._onWindowResize);
    }

    /**
     * Grid overlay and building blocks are the only layers sized in px.
     * Zones, roads, and markers stay in % and scale with the container.
     */
    _refreshTileSizedLayers() {
        const grid = this.container.querySelector('.city-map-grid');
        if (grid) {
            grid.style.backgroundSize = `${this.tileSize}px ${this.tileSize}px`;
        }
        const buildingPx = `${this.tileSize * 2}px`;
        this.container.querySelectorAll('.city-building').forEach((building) => {
            building.style.width = buildingPx;
            building.style.height = buildingPx;
        });
    }

    /**
     * Drop the resize listener. Safe to call more than once.
     */
    destroy() {
        if (this._remeasureFrame != null && typeof cancelAnimationFrame === 'function') {
            cancelAnimationFrame(this._remeasureFrame);
        }
        this._remeasureFrame = null;
        if (this._resizeObserver) {
            this._resizeObserver.disconnect();
            this._resizeObserver = null;
        }
        if (this._onWindowResize) {
            window.removeEventListener('resize', this._onWindowResize);
            this._onWindowResize = null;
        }
        this._sizeWatchBound = false;
    }

    /**
     * Render city background
     */
    renderBackground() {
        const bg = document.createElement('div');
        bg.className = 'city-map-background';
        this.container.appendChild(bg);
    }

    /**
     * Render subtle grid overlay
     */
    renderGrid() {
        const grid = document.createElement('div');
        grid.className = 'city-map-grid';
        grid.style.cssText = `
            position: absolute;
            inset: 0;
            background-image: 
                linear-gradient(rgba(255, 255, 255, 0.03) 1px, transparent 1px),
                linear-gradient(90deg, rgba(255, 255, 255, 0.03) 1px, transparent 1px);
            background-size: ${this.tileSize}px ${this.tileSize}px;
            pointer-events: none;
            z-index: 1;
        `;
        this.container.appendChild(grid);
    }

    /**
     * Render zones with clear visual distinction
     */
    async renderZones() {
        const zonesContainer = document.createElement('div');
        zonesContainer.className = 'city-zones-container';
        this.container.appendChild(zonesContainer);
        
        try {
            // Import zone definitions
            const { ZONE_DEFINITIONS } = await import('../data/mapZones.js');
            ZONE_DEFINITIONS.forEach(zone => {
                const zoneEl = document.createElement('div');
                zoneEl.className = `city-zone city-zone-${zone.type}`;
                
                const left = (zone.bounds.minX / this.gridSize) * 100;
                const top = (zone.bounds.minY / this.gridSize) * 100;
                const width = ((zone.bounds.maxX - zone.bounds.minX + 1) / this.gridSize) * 100;
                const height = ((zone.bounds.maxY - zone.bounds.minY + 1) / this.gridSize) * 100;
                
                zoneEl.style.cssText = `
                    position: absolute;
                    left: ${left}%;
                    top: ${top}%;
                    width: ${width}%;
                    height: ${height}%;
                    z-index: 2;
                `;
                
                zonesContainer.appendChild(zoneEl);
            });
        } catch (err) {
            console.warn('Failed to load zone definitions:', err);
        }
    }

    /**
     * Render road network with clear hierarchy
     */
    renderRoads() {
        const roadsContainer = document.createElement('div');
        roadsContainer.className = 'city-roads-container';
        this.container.appendChild(roadsContainer);
        
        // Main horizontal roads (every 6 tiles)
        for (let y = 6; y < this.gridSize; y += 6) {
            this.renderRoad(roadsContainer, 'horizontal', y, 'main');
        }
        
        // Main vertical roads (every 6 tiles)
        for (let x = 6; x < this.gridSize; x += 6) {
            this.renderRoad(roadsContainer, 'vertical', x, 'main');
        }
        
        // Secondary horizontal roads (every 3 tiles, not on main)
        for (let y = 3; y < this.gridSize; y += 6) {
            if (y % 6 !== 0) {
                this.renderRoad(roadsContainer, 'horizontal', y, 'secondary');
            }
        }
        
        // Secondary vertical roads
        for (let x = 3; x < this.gridSize; x += 6) {
            if (x % 6 !== 0) {
                this.renderRoad(roadsContainer, 'vertical', x, 'secondary');
            }
        }
    }

    /**
     * Render a single road segment
     */
    renderRoad(container, direction, position, type) {
        const road = document.createElement('div');
        road.className = `city-road city-road-${type} city-road-${direction}`;
        
        if (direction === 'horizontal') {
            const top = (position / this.gridSize) * 100;
            road.style.cssText = `
                position: absolute;
                left: 0;
                top: ${top}%;
                width: 100%;
                height: ${type === 'main' ? '3.5%' : '2%'};
                transform: translateY(-50%);
                z-index: 3;
            `;
        } else {
            const left = (position / this.gridSize) * 100;
            road.style.cssText = `
                position: absolute;
                left: ${left}%;
                top: 0;
                width: ${type === 'main' ? '3.5%' : '2%'};
                height: 100%;
                transform: translateX(-50%);
                z-index: 3;
            `;
        }
        
        container.appendChild(road);
    }

    /**
     * Render buildings as simple blocks
     */
    renderBuildings() {
        if (!this.game?.worldMap) return;
        
        const buildingsContainer = document.createElement('div');
        buildingsContainer.className = 'city-buildings-container';
        this.container.appendChild(buildingsContainer);
        
        const locations = this.game.worldMap?.getAccessibleLocations() || [];
        locations.forEach(location => {
            if (!location.position) return;
            
            // All locations use grid coordinates (0-30)
            const building = document.createElement('div');
            building.className = `city-building city-building-${location.type}`;
            
            const left = (location.position.x / this.gridSize) * 100;
            const top = (location.position.y / this.gridSize) * 100;
            
            building.style.cssText = `
                position: absolute;
                left: ${left}%;
                top: ${top}%;
                transform: translate(-50%, -50%);
                width: ${this.tileSize * 2}px;
                height: ${this.tileSize * 2}px;
                z-index: 4;
            `;
            
            buildingsContainer.appendChild(building);
        });
    }

    /**
     * Render location markers
     */
    renderLocations() {
        if (!this.game?.worldMap) return;
        
        const locationsContainer = document.createElement('div');
        locationsContainer.className = 'city-locations-container';
        this.container.appendChild(locationsContainer);
        
        const locations = this.game.worldMap?.getAccessibleLocations() || [];
        const currentLocationId = this.game.worldMap?.currentLocation;
        
        locations.forEach(location => {
            const locEl = document.createElement('div');
            locEl.className = `city-location ${location.id === currentLocationId ? 'current' : ''}`;
            locEl.dataset.location = location.id;
            
            // All locations use grid coordinates (0-30)
            const left = (location.position.x / this.gridSize) * 100;
            const top = (location.position.y / this.gridSize) * 100;
            
            locEl.style.cssText = `
                position: absolute;
                left: ${left}%;
                top: ${top}%;
                transform: translate(-50%, -50%);
                z-index: 10;
                cursor: pointer;
            `;
            
            // Icon
            const icon = document.createElement('div');
            icon.className = 'city-location-icon';
            if (location.icon && location.icon.startsWith('/')) {
                const img = document.createElement('img');
                img.src = location.icon;
                img.alt = location.name;
                icon.appendChild(img);
            } else {
                icon.textContent = location.icon || '';
            }
            locEl.appendChild(icon);
            
            // Name
            const name = document.createElement('div');
            name.className = 'city-location-name';
            name.textContent = location.name;
            locEl.appendChild(name);
            
            // Click handler
            locEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.game.handleTravel?.(location.id);
            });
            
            locationsContainer.appendChild(locEl);
        });
        
        // Player marker
        this.renderPlayerMarker(locationsContainer);
    }

    /**
     * Render player marker
     */
    renderPlayerMarker(container) {
        const currentLocation = this.game.worldMap?.getCurrentLocation();
        if (!currentLocation) return;
        
        const marker = document.createElement('div');
        marker.className = 'city-player-marker';
        
        let left, top;
        // All locations use grid coordinates (0-30)
        const isGridCoords = currentLocation.position.x <= this.gridSize && currentLocation.position.y <= this.gridSize;
        
        if (isGridCoords) {
            left = (currentLocation.position.x / this.gridSize) * 100;
            top = (currentLocation.position.y / this.gridSize) * 100;
        } else {
            left = currentLocation.position.x;
            top = currentLocation.position.y;
        }
        
        marker.style.cssText = `
            position: absolute;
            left: ${left}%;
            top: ${top}%;
            transform: translate(-50%, -50%);
            z-index: 100;
        `;
        
        container.appendChild(marker);
    }

    /**
     * Update map (refresh locations and player marker)
     */
    update() {
        if (!this.rendered) {
            this.initialize();
        } else {
            // Remove and re-render dynamic elements
            const locationsContainer = this.container.querySelector('.city-locations-container');
            if (locationsContainer) {
                locationsContainer.remove();
            }
            this.renderLocations();
        }
    }
}
