/**
 * TileBasedCityMap.js
 * Professional tile-based city map renderer following MDN tilemap tutorial principles
 * Based on: https://developer.mozilla.org/en-US/docs/Games/Techniques/Tilemaps/Square_tilemaps_implementation:_Static_maps
 */

export class TileBasedCityMap {
    constructor(container, game) {
        this.container = container;
        this.game = game;
        
        // Map configuration (following MDN tutorial structure)
        this.map = {
            cols: 30,      // Width in columns
            rows: 30,      // Height in rows
            tsize: 20,     // Tile size in pixels
            tiles: []      // 1D array for tile data
        };
        
        // Tile types (like tile atlas indices)
        this.TILE_TYPES = {
            EMPTY: 0,
            ROAD_MAIN_H: 1,
            ROAD_MAIN_V: 2,
            ROAD_SECONDARY_H: 3,
            ROAD_SECONDARY_V: 4,
            ZONE_RESIDENTIAL: 10,
            ZONE_COMMERCIAL: 11,
            ZONE_EDUCATION: 12,
            ZONE_FINANCE: 13,
            ZONE_GOVERNMENT: 14,
            ZONE_PARK: 15,
            BUILDING_RESIDENCE: 20,
            BUILDING_WORK: 21,
            BUILDING_EDUCATION: 22,
            BUILDING_SHOP: 23
        };
        
        this.rendered = false;
        this.initMapData();
    }

    /**
     * Initialize map data structure (following MDN tutorial)
     */
    initMapData() {
        // Initialize tiles array (1D array as per MDN tutorial)
        const totalTiles = this.map.cols * this.map.rows;
        this.map.tiles = new Array(totalTiles).fill(this.TILE_TYPES.EMPTY);
        
        // Generate road network
        this.generateRoads();
        
        // Generate zones
        this.generateZones();
    }

    /**
     * Get tile at column and row (MDN tutorial helper method)
     */
    getTile(col, row) {
        return this.map.tiles[row * this.map.cols + col];
    }

    /**
     * Set tile at column and row
     */
    setTile(col, row, tileType) {
        if (col >= 0 && col < this.map.cols && row >= 0 && row < this.map.rows) {
            this.map.tiles[row * this.map.cols + col] = tileType;
        }
    }

    /**
     * Generate road network
     */
    generateRoads() {
        // Main horizontal roads (every 6 rows)
        for (let row = 6; row < this.map.rows; row += 6) {
            for (let col = 0; col < this.map.cols; col++) {
                this.setTile(col, row, this.TILE_TYPES.ROAD_MAIN_H);
            }
        }
        
        // Main vertical roads (every 6 columns)
        for (let col = 6; col < this.map.cols; col += 6) {
            for (let row = 0; row < this.map.rows; row++) {
                // Don't overwrite horizontal roads
                if (this.getTile(col, row) === this.TILE_TYPES.EMPTY) {
                    this.setTile(col, row, this.TILE_TYPES.ROAD_MAIN_V);
                }
            }
        }
        
        // Secondary horizontal roads
        for (let row = 3; row < this.map.rows; row += 6) {
            if (row % 6 !== 0) {
                for (let col = 0; col < this.map.cols; col++) {
                    if (this.getTile(col, row) === this.TILE_TYPES.EMPTY) {
                        this.setTile(col, row, this.TILE_TYPES.ROAD_SECONDARY_H);
                    }
                }
            }
        }
        
        // Secondary vertical roads
        for (let col = 3; col < this.map.cols; col += 6) {
            if (col % 6 !== 0) {
                for (let row = 0; row < this.map.rows; row++) {
                    if (this.getTile(col, row) === this.TILE_TYPES.EMPTY) {
                        this.setTile(col, row, this.TILE_TYPES.ROAD_SECONDARY_V);
                    }
                }
            }
        }
    }

    /**
     * Generate zones based on zone definitions
     */
    async generateZones() {
        try {
            const { ZONE_DEFINITIONS } = await import('../data/mapZones.js');
            
            ZONE_DEFINITIONS.forEach(zone => {
                const zoneTileType = this.getZoneTileType(zone.type);
                
                for (let row = zone.bounds.minY; row <= zone.bounds.maxY; row++) {
                    for (let col = zone.bounds.minX; col <= zone.bounds.maxX; col++) {
                        // Only set zone tiles where there are no roads
                        const currentTile = this.getTile(col, row);
                        if (currentTile === this.TILE_TYPES.EMPTY) {
                            this.setTile(col, row, zoneTileType);
                        }
                    }
                }
            });
        } catch (err) {
            console.warn('Failed to load zones:', err);
        }
    }

    /**
     * Get tile type for zone
     */
    getZoneTileType(zoneType) {
        const mapping = {
            'residential': this.TILE_TYPES.ZONE_RESIDENTIAL,
            'commercial': this.TILE_TYPES.ZONE_COMMERCIAL,
            'education': this.TILE_TYPES.ZONE_EDUCATION,
            'finance': this.TILE_TYPES.ZONE_FINANCE,
            'government': this.TILE_TYPES.ZONE_GOVERNMENT,
            'park': this.TILE_TYPES.ZONE_PARK
        };
        return mapping[zoneType] || this.TILE_TYPES.EMPTY;
    }

    /**
     * Initialize and render the map (following MDN tutorial rendering approach)
     */
    initialize() {
        if (this.rendered) return;
        
        // Calculate tile size based on container
        const containerWidth = this.container.offsetWidth || 600;
        const containerHeight = this.container.offsetHeight || 600;
        this.map.tsize = Math.min(
            containerWidth / this.map.cols,
            containerHeight / this.map.rows
        );
        
        // Clear container
        this.container.innerHTML = '';
        this.container.classList.add('tile-city-map');
        
        // Render map following MDN tutorial pattern
        this.renderMap();
        
        // Render buildings and locations
        this.renderBuildings();
        this.renderLocations();
        
        this.rendered = true;
    }

    /**
     * Render the map (following MDN tutorial rendering loop)
     */
    renderMap() {
        const mapContainer = document.createElement('div');
        mapContainer.className = 'tile-map-container';
        mapContainer.style.cssText = `
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
        `;
        
        // Render tiles (MDN tutorial approach: iterate over columns and rows)
        for (let row = 0; row < this.map.rows; row++) {
            for (let col = 0; col < this.map.cols; col++) {
                const tile = this.getTile(col, row);
                this.renderTile(mapContainer, col, row, tile);
            }
        }
        
        this.container.appendChild(mapContainer);
    }

    /**
     * Render a single tile (adapted from MDN drawImage approach)
     */
    renderTile(container, col, row, tileType) {
        const tile = document.createElement('div');
        tile.className = `tile tile-${tileType}`;
        
        const left = (col / this.map.cols) * 100;
        const top = (row / this.map.rows) * 100;
        const width = (1 / this.map.cols) * 100;
        const height = (1 / this.map.rows) * 100;
        
        tile.style.cssText = `
            position: absolute;
            left: ${left}%;
            top: ${top}%;
            width: ${width}%;
            height: ${height}%;
            z-index: ${this.getTileZIndex(tileType)};
        `;
        
        // Try to load actual image asset if available
        const tileImage = this.getTileImagePath(tileType);
        if (tileImage) {
            const img = document.createElement('img');
            img.src = tileImage;
            img.style.cssText = `
                width: 100%;
                height: 100%;
                object-fit: cover;
                image-rendering: pixelated;
                image-rendering: -moz-crisp-edges;
                image-rendering: crisp-edges;
            `;
            img.onerror = () => {
                // Tile image failed to load - CSS styling will handle it
            };
            tile.appendChild(img);
        }
        
        container.appendChild(tile);
    }

    /**
     * Get image path for tile type
     * Uses existing assets from assets/map/roads/ folder
     */
    getTileImagePath(tileType) {
        // Use existing road assets (road_00.png through road_09.png)
        const roadImages = [
            '/assets/map/roads/road_00.png',
            '/assets/map/roads/road_01.png',
            '/assets/map/roads/road_02.png',
            '/assets/map/roads/road_03.png',
            '/assets/map/roads/road_04.png',
            '/assets/map/roads/road_05.png',
            '/assets/map/roads/road_06.png',
            '/assets/map/roads/road_07.png',
            '/assets/map/roads/road_08.png',
            '/assets/map/roads/road_09.png'
        ];
        
        const imageMap = {
            // Main roads - use darker road images
            [this.TILE_TYPES.ROAD_MAIN_H]: roadImages[0] || null,
            [this.TILE_TYPES.ROAD_MAIN_V]: roadImages[1] || null,
            // Secondary roads - use lighter road images
            [this.TILE_TYPES.ROAD_SECONDARY_H]: roadImages[2] || null,
            [this.TILE_TYPES.ROAD_SECONDARY_V]: roadImages[3] || null,
            // Zones - no images yet, use CSS
            [this.TILE_TYPES.ZONE_RESIDENTIAL]: null,
            [this.TILE_TYPES.ZONE_COMMERCIAL]: null,
            [this.TILE_TYPES.ZONE_EDUCATION]: null,
            [this.TILE_TYPES.ZONE_FINANCE]: null,
            [this.TILE_TYPES.ZONE_GOVERNMENT]: null,
            [this.TILE_TYPES.ZONE_PARK]: null
        };
        
        return imageMap[tileType] || null;
    }

    /**
     * Get image path for building type
     * Uses existing assets from assets/map/buildings/ folder
     */
    getBuildingImagePath(buildingType) {
        // Use existing building assets (building_00.png through building_09.png)
        const buildingImages = [
            '/assets/map/buildings/building_00.png',
            '/assets/map/buildings/building_01.png',
            '/assets/map/buildings/building_02.png',
            '/assets/map/buildings/building_03.png',
            '/assets/map/buildings/building_04.png',
            '/assets/map/buildings/building_05.png',
            '/assets/map/buildings/building_06.png',
            '/assets/map/buildings/building_07.png',
            '/assets/map/buildings/building_08.png',
            '/assets/map/buildings/building_09.png'
        ];
        
        // Map building types to image indices
        const typeToIndex = {
            'residence': 0,
            'work': 1,
            'education': 2,
            'shop': 3,
            'finance': 4,
            'government': 5,
            'social': 6,
            'training': 7,
            'business': 8,
            'elite': 9
        };
        
        const index = typeToIndex[buildingType] || 0;
        return buildingImages[index] || null;
    }

    /**
     * Get z-index for tile type (rendering order)
     */
    getTileZIndex(tileType) {
        if (tileType >= this.TILE_TYPES.ZONE_RESIDENTIAL && tileType <= this.TILE_TYPES.ZONE_PARK) {
            return 1; // Zones behind roads
        }
        if (tileType >= this.TILE_TYPES.ROAD_MAIN_H && tileType <= this.TILE_TYPES.ROAD_SECONDARY_V) {
            return 2; // Roads
        }
        return 0; // Empty/background
    }

    /**
     * Render buildings
     */
    renderBuildings() {
        if (!this.game?.worldMap) return;
        
        const buildingsContainer = document.createElement('div');
        buildingsContainer.className = 'tile-buildings-container';
        this.container.appendChild(buildingsContainer);
        
        const locations = this.game.worldMap.getAccessibleLocations();
        locations.forEach(location => {
            if (!location.position) return;
            
            const isGridCoords = location.position.x <= this.map.cols && location.position.y <= this.map.rows;
            if (!isGridCoords && location.position.x > 100) return;
            
            const building = document.createElement('div');
            building.className = `tile-building tile-building-${location.type}`;
            
            let left, top;
            if (isGridCoords) {
                left = (location.position.x / this.map.cols) * 100;
                top = (location.position.y / this.map.rows) * 100;
            } else {
                left = location.position.x;
                top = location.position.y;
            }
            
            building.style.cssText = `
                position: absolute;
                left: ${left}%;
                top: ${top}%;
                transform: translate(-50%, -50%);
                width: ${this.map.tsize * 2}px;
                height: ${this.map.tsize * 2}px;
                z-index: 3;
            `;
            
            // Try to load building image if available
            const buildingImage = this.getBuildingImagePath(location.type);
            if (buildingImage) {
                const img = document.createElement('img');
                img.src = buildingImage;
                img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    object-position: center bottom;
                    image-rendering: pixelated;
                    image-rendering: -moz-crisp-edges;
                    image-rendering: crisp-edges;
                `;
                img.onerror = () => {
                    console.warn(`Building image not found: ${buildingImage}`);
                };
                building.appendChild(img);
            }
            
            buildingsContainer.appendChild(building);
        });
    }

    /**
     * Render location markers
     */
    renderLocations() {
        if (!this.game?.worldMap) return;
        
        const locationsContainer = document.createElement('div');
        locationsContainer.className = 'tile-locations-container';
        this.container.appendChild(locationsContainer);
        
        const locations = this.game.worldMap.getAccessibleLocations();
        const currentLocationId = this.game.worldMap.currentLocation;
        
        locations.forEach(location => {
            const locEl = document.createElement('div');
            locEl.className = `tile-location ${location.id === currentLocationId ? 'current' : ''}`;
            locEl.dataset.location = location.id;
            
            let left, top;
            const isGridCoords = location.position.x <= this.map.cols && location.position.y <= this.map.rows;
            
            if (isGridCoords) {
                left = (location.position.x / this.map.cols) * 100;
                top = (location.position.y / this.map.rows) * 100;
            } else {
                left = location.position.x;
                top = location.position.y;
            }
            
            locEl.style.cssText = `
                position: absolute;
                left: ${left}%;
                top: ${top}%;
                transform: translate(-50%, -50%);
                z-index: 10;
                cursor: pointer;
            `;
            
            const icon = document.createElement('div');
            icon.className = 'tile-location-icon';
            if (location.icon && location.icon.startsWith('/')) {
                const img = document.createElement('img');
                img.src = location.icon;
                img.alt = location.name;
                icon.appendChild(img);
            } else {
                icon.textContent = location.icon || '';
            }
            locEl.appendChild(icon);
            
            const name = document.createElement('div');
            name.className = 'tile-location-name';
            name.textContent = location.name;
            locEl.appendChild(name);
            
            locEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.game.handleTravel?.(location.id);
            });
            
            locationsContainer.appendChild(locEl);
        });
        
        this.renderPlayerMarker(locationsContainer);
    }

    /**
     * Render player marker
     */
    renderPlayerMarker(container) {
        const currentLocation = this.game.worldMap.getCurrentLocation();
        if (!currentLocation) return;
        
        const marker = document.createElement('div');
        marker.className = 'tile-player-marker';
        
        let left, top;
        const isGridCoords = currentLocation.position.x <= this.map.cols && currentLocation.position.y <= this.map.rows;
        
        if (isGridCoords) {
            left = (currentLocation.position.x / this.map.cols) * 100;
            top = (currentLocation.position.y / this.map.rows) * 100;
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
     * Update map
     */
    update() {
        if (!this.rendered) {
            this.initialize();
        } else {
            const locationsContainer = this.container.querySelector('.tile-locations-container');
            if (locationsContainer) {
                locationsContainer.remove();
            }
            this.renderLocations();
        }
    }
}
