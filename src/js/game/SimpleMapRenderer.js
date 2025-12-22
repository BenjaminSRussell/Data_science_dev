/**
 * SimpleMapRenderer.js
 * Unified, simplified map renderer with grass base, parks, and realistic roads
 * Removed all bloat - one simple system
 */

export class SimpleMapRenderer {
    constructor(container, game) {
        this.container = container;
        this.game = game;
        this.gridSize = 30; // 30×30 grid
        this.rendered = false;
    }

    /**
     * Initialize and render the map
     */
    initialize() {
        if (this.rendered) return;
        
        this.container.innerHTML = '';
        this.container.classList.add('simple-map-container');
        
        // Render in order: grass base -> zones -> parks -> roads -> buildings -> locations
        // Render layers in order for proper z-index stacking
        this.renderGrassBase();
        this.renderZones(); // Reduced opacity
        this.renderParks();
        this.renderRoads();
        this.renderBuildings();
        this.renderLocations(); // Labels hidden by default
        
        this.rendered = true;
    }

    /**
     * Render grass base covering entire map (more realistic texture)
     */
    renderGrassBase() {
        const grass = document.createElement('div');
        grass.className = 'map-grass-base';
        grass.style.cssText = `
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            background: 
                radial-gradient(circle at 20% 30%, rgba(124, 179, 66, 0.3) 0%, transparent 50%),
                radial-gradient(circle at 80% 70%, rgba(139, 195, 74, 0.3) 0%, transparent 50%),
                repeating-linear-gradient(
                    0deg,
                    #6a9a3a 0px,
                    #6a9a3a 15px,
                    #7cb342 15px,
                    #7cb342 30px,
                    #8bc34a 30px,
                    #8bc34a 45px
                ),
                repeating-linear-gradient(
                    90deg,
                    #6a9a3a 0px,
                    #6a9a3a 15px,
                    #7cb342 15px,
                    #7cb342 30px,
                    #8bc34a 30px,
                    #8bc34a 45px
                );
            background-color: #7cb342;
            z-index: 0;
        `;
        this.container.appendChild(grass);
    }

    /**
     * Render zones with subtle grass variations
     */
    renderZones() {
        const zonesContainer = document.createElement('div');
        zonesContainer.className = 'map-zones-container';
        
        // Zone definitions with distinct colors for visual clarity
        // Colors chosen for maximum contrast and accessibility
        const zones = [
            { type: 'residential', bounds: { minX: 8, minY: 16, maxX: 18, maxY: 25 }, color: '#fbbf24' },
            { type: 'commercial', bounds: { minX: 4, minY: 6, maxX: 18, maxY: 20 }, color: '#ef4444' },
            { type: 'education', bounds: { minX: 20, minY: 5, maxX: 30, maxY: 12 }, color: '#6366f1' },
            { type: 'finance', bounds: { minX: 15, minY: 4, maxX: 28, maxY: 15 }, color: '#10b981' },
            { type: 'government', bounds: { minX: 20, minY: 0, maxX: 30, maxY: 8 }, color: '#64748b' },
            { type: 'park', bounds: { minX: 0, minY: 0, maxX: 8, maxY: 8 }, color: '#22c55e' }
        ];
        
        zones.forEach(zone => {
            const zoneEl = document.createElement('div');
            zoneEl.className = `map-zone map-zone-${zone.type}`;
            
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
                background: ${zone.color};
                opacity: 0.15;
                z-index: 1;
                pointer-events: none;
                border: 1px dashed rgba(0, 0, 0, 0.1);
            `;
            
            zonesContainer.appendChild(zoneEl);
        });
        
        this.container.appendChild(zonesContainer);
    }

    /**
     * Render organic roads with curves (reduced density)
     */
    renderRoads() {
        const roadsContainer = document.createElement('div');
        roadsContainer.className = 'map-roads-container';
        
        // Main horizontal roads (every 10 tiles - reduced from 6)
        for (let y = 10; y < this.gridSize; y += 10) {
            const road = document.createElement('div');
            road.className = 'map-road map-road-main map-road-horizontal';
            const top = (y / this.gridSize) * 100;
            road.style.cssText = `
                position: absolute;
                left: 0;
                top: ${top}%;
                width: 100%;
                height: 3%;
                transform: translateY(-50%);
                background: 
                    linear-gradient(to bottom, #3a3a3a 0%, #2a2a2a 50%, #3a3a3a 100%),
                    repeating-linear-gradient(
                        90deg,
                        #424242 0px,
                        #424242 20px,
                        #3a3a3a 20px,
                        #3a3a3a 40px
                    );
                border-top: 1px solid rgba(255, 215, 0, 0.6);
                border-bottom: 1px solid rgba(255, 215, 0, 0.6);
                box-shadow: 
                    inset 0 1px 2px rgba(0, 0, 0, 0.5),
                    0 0 0 1px rgba(0, 0, 0, 0.3);
                z-index: 2;
            `;
            // Add center line
            const centerLine = document.createElement('div');
            centerLine.style.cssText = `
                position: absolute;
                top: 50%;
                left: 0;
                right: 0;
                height: 2px;
                transform: translateY(-50%);
                background: repeating-linear-gradient(
                    90deg,
                    #ffd700 0px,
                    #ffd700 15px,
                    transparent 15px,
                    transparent 30px
                );
                opacity: 0.8;
            `;
            road.appendChild(centerLine);
            roadsContainer.appendChild(road);
        }
        
        // Main vertical roads (every 6 tiles) - more realistic
        for (let x = 6; x < this.gridSize; x += 6) {
            const road = document.createElement('div');
            road.className = 'map-road map-road-main map-road-vertical';
            const left = (x / this.gridSize) * 100;
            road.style.cssText = `
                position: absolute;
                left: ${left}%;
                top: 0;
                width: 3%;
                height: 100%;
                transform: translateX(-50%);
                background: 
                    linear-gradient(to right, #3a3a3a 0%, #2a2a2a 50%, #3a3a3a 100%),
                    repeating-linear-gradient(
                        0deg,
                        #424242 0px,
                        #424242 20px,
                        #3a3a3a 20px,
                        #3a3a3a 40px
                    );
                border-left: 1px solid rgba(255, 215, 0, 0.6);
                border-right: 1px solid rgba(255, 215, 0, 0.6);
                box-shadow: 
                    inset 1px 0 2px rgba(0, 0, 0, 0.5),
                    0 0 0 1px rgba(0, 0, 0, 0.3);
                z-index: 2;
            `;
            // Add center line
            const centerLine = document.createElement('div');
            centerLine.style.cssText = `
                position: absolute;
                left: 50%;
                top: 0;
                bottom: 0;
                width: 2px;
                transform: translateX(-50%);
                background: repeating-linear-gradient(
                    0deg,
                    #ffd700 0px,
                    #ffd700 15px,
                    transparent 15px,
                    transparent 30px
                );
                opacity: 0.8;
            `;
            road.appendChild(centerLine);
            roadsContainer.appendChild(road);
        }
        
        // Secondary horizontal roads (every 15 tiles - much reduced)
        for (let y = 5; y < this.gridSize; y += 15) {
            if (y % 10 !== 0) {
                const road = document.createElement('div');
                road.className = 'map-road map-road-secondary map-road-horizontal';
                const top = (y / this.gridSize) * 100;
                road.style.cssText = `
                    position: absolute;
                    left: 0;
                    top: ${top}%;
                    width: 100%;
                    height: 2%;
                    transform: translateY(-50%);
                    background: 
                        linear-gradient(to bottom, #555 0%, #4a4a4a 50%, #555 100%),
                        repeating-linear-gradient(
                            90deg,
                            #616161 0px,
                            #616161 20px,
                            #555 20px,
                            #555 40px
                        );
                    box-shadow: 
                        inset 0 1px 2px rgba(0, 0, 0, 0.4),
                        0 0 0 1px rgba(0, 0, 0, 0.2);
                    z-index: 2;
                `;
                roadsContainer.appendChild(road);
            }
        }
        
        // Secondary vertical roads (every 15 tiles - much reduced)
        for (let x = 5; x < this.gridSize; x += 15) {
            if (x % 10 !== 0) {
                const road = document.createElement('div');
                road.className = 'map-road map-road-secondary map-road-vertical';
                const left = (x / this.gridSize) * 100;
                road.style.cssText = `
                    position: absolute;
                    left: ${left}%;
                    top: 0;
                    width: 2%;
                    height: 100%;
                    transform: translateX(-50%);
                    background: 
                        linear-gradient(to right, #555 0%, #4a4a4a 50%, #555 100%),
                        repeating-linear-gradient(
                            0deg,
                            #616161 0px,
                            #616161 20px,
                            #555 20px,
                            #555 40px
                        );
                    box-shadow: 
                        inset 1px 0 2px rgba(0, 0, 0, 0.4),
                        0 0 0 1px rgba(0, 0, 0, 0.2);
                    z-index: 2;
                `;
                roadsContainer.appendChild(road);
            }
        }
        
        // Add curved connecting roads (organic flow)
        this.renderCurvedRoads(roadsContainer);
        
        this.container.appendChild(roadsContainer);
    }

    /**
     * Render curved roads connecting areas organically
     * Calculates bezier curves to connect zone centers smoothly
     */
    renderCurvedRoads(container) {
        if (!this.game?.worldMap) return;
        
        const locations = this.game.worldMap?.getAccessibleLocations() || [];
        
        // Group locations by approximate area
        const startingTown = locations.filter(l => 
            l.position.x >= 4 && l.position.x <= 15 && 
            l.position.y >= 8 && l.position.y <= 20
        );
        const cityCenter = locations.filter(l => 
            l.position.x >= 14 && l.position.x <= 24 && 
            l.position.y >= 5 && l.position.y <= 15
        );
        const educationArea = locations.filter(l => 
            l.type === 'education' && l.position.x >= 8 && l.position.x <= 24
        );
        
        // Curved road: Starting Town → City Center (smooth curve)
        if (startingTown.length > 0 && cityCenter.length > 0) {
            this.createCurvedRoad(container, 
                { x: 13, y: 18 }, // Starting town center
                { x: 18, y: 10 }, // City center
                3, // width
                '#424242' // main road color
            );
        }
        
        // Curved road: City Center → Education Area
        if (cityCenter.length > 0 && educationArea.length > 0) {
            this.createCurvedRoad(container,
                { x: 18, y: 10 }, // City center
                { x: 16, y: 8 },  // Education area
                2, // width (secondary)
                '#616161' // secondary road color
            );
        }
        
        // Curved road: Shopping area connection
        const shoppingArea = locations.filter(l => 
            (l.type === 'shop' || l.id === 'mall') && 
            l.position.x >= 4 && l.position.x <= 12
        );
        if (shoppingArea.length > 0 && startingTown.length > 0) {
            this.createCurvedRoad(container,
                { x: 8, y: 17 },  // Shopping area
                { x: 13, y: 18 }, // Starting town
                2, // width (secondary)
                '#616161'
            );
        }
    }

    /**
     * Create a curved road using SVG path for smooth curves
     * Calculates bezier curves to connect zone centers smoothly
     */
    createCurvedRoad(container, from, to, width, color) {
        // Get or create SVG container for curved roads
        let svgContainer = container.querySelector('.curved-roads-svg');
        if (!svgContainer) {
            svgContainer = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
            svgContainer.setAttribute('class', 'curved-roads-svg');
            svgContainer.style.cssText = `
                position: absolute;
                left: 0;
                top: 0;
                width: 100%;
                height: 100%;
                z-index: 2;
                pointer-events: none;
            `;
            container.appendChild(svgContainer);
        }
        
        // Convert grid coordinates to percentages
        const fromX = (from.x / this.gridSize) * 100;
        const fromY = (from.y / this.gridSize) * 100;
        const toX = (to.x / this.gridSize) * 100;
        const toY = (to.y / this.gridSize) * 100;
        
        // Calculate control points for smooth curve (quadratic bezier)
        const midX = (fromX + toX) / 2;
        const midY = (fromY + toY) / 2;
        const dx = toX - fromX;
        const dy = toY - fromY;
        const curveAmount = Math.sqrt(dx * dx + dy * dy) * 0.25;
        
        // Control point offset perpendicular to line
        const angle = Math.atan2(dy, dx);
        const perpAngle = angle + Math.PI / 2;
        const controlX = midX + Math.cos(perpAngle) * curveAmount;
        const controlY = midY + Math.sin(perpAngle) * curveAmount;
        
        // Create curved path
        const path = document.createElementNS('http://www.w3.org/2000/svg', 'path');
        const pathData = `M ${fromX} ${fromY} Q ${controlX} ${controlY} ${toX} ${toY}`;
        path.setAttribute('d', pathData);
        path.setAttribute('stroke', color);
        path.setAttribute('stroke-width', width);
        path.setAttribute('fill', 'none');
        path.setAttribute('stroke-linecap', 'round');
        path.setAttribute('stroke-linejoin', 'round');
        path.style.filter = 'drop-shadow(0 2px 4px rgba(0, 0, 0, 0.3))';
        
        svgContainer.appendChild(path);
    }

    /**
     * Render parks with trees (comforting green spaces)
     */
    renderParks() {
        const parksContainer = document.createElement('div');
        parksContainer.className = 'map-parks-container';
        
        // Define park areas (grid coordinates)
        const parkAreas = [
            { minX: 0, minY: 0, maxX: 5, maxY: 5 },   // Top-left park
            { minX: 12, minY: 18, maxX: 18, maxY: 24 }, // Central park
            { minX: 22, minY: 22, maxX: 28, maxY: 28 }  // Bottom-right park
        ];
        
        parkAreas.forEach(park => {
            // Add trees throughout park area (reduced density for less clutter)
            for (let x = park.minX; x <= park.maxX; x += 3) {
                for (let y = park.minY; y <= park.maxY; y += 3) {
                    // Reduced tree density (50% instead of 70%)
                    if (Math.random() > 0.5) {
                        const tree = document.createElement('div');
                        tree.className = 'map-tree';
                        const left = (x / this.gridSize) * 100;
                        const top = (y / this.gridSize) * 100;
                        tree.style.cssText = `
                            position: absolute;
                            left: ${left}%;
                            top: ${top}%;
                            transform: translate(-50%, -50%);
                            width: 20px;
                            height: 20px;
                            background: #2e7d32;
                            border-radius: 50% 50% 50% 50% / 60% 60% 40% 40%;
                            z-index: 3;
                        `;
                        parksContainer.appendChild(tree);
                    }
                }
            }
        });
        
        this.container.appendChild(parksContainer);
    }

    /**
     * Render buildings (simple, no overlays)
     */
    renderBuildings() {
        if (!this.game?.worldMap) return;
        
        const buildingsContainer = document.createElement('div');
        buildingsContainer.className = 'map-buildings-container';
        
        const locations = this.game.worldMap?.getAccessibleLocations() || [];
        locations.forEach(location => {
            if (!location.position) return;
            
            const building = document.createElement('div');
            building.className = `map-building map-building-${location.type}`;
            building.dataset.locationId = location.id;
            
            const left = (location.position.x / this.gridSize) * 100;
            const top = (location.position.y / this.gridSize) * 100;
            
            // Building colors by type (distinct colors)
            const buildingColors = {
                'residence': '#d4a574',
                'work': '#7a8ba3',
                'education': '#8b5cf6',
                'finance': '#10b981',
                'government': '#607d8b',
                'shop': '#f59e0b',
                'social': '#a855f7',
                'training': '#ef4444',
                'business': '#64748b',
                'elite': '#ffd700'
            };
            
            // Calculate building size based on location type and importance
            const buildingSizes = {
                'home': { width: 35, height: 35 }, // Smaller - residence
                'office': { width: 45, height: 45 }, // Medium - work
                'bank': { width: 50, height: 50 }, // Larger - important
                'stock_exchange': { width: 55, height: 55 }, // Large - very important
                'university': { width: 50, height: 50 }, // Large - education
                'city_hall': { width: 50, height: 50 }, // Large - government
                'downtown': { width: 55, height: 55 }, // Large - business
                'tech_hub': { width: 50, height: 50 }, // Large - business
                'luxury_district': { width: 60, height: 60 }, // Largest - elite
                'mall': { width: 50, height: 50 } // Large - shopping
            };
            
            const size = buildingSizes[location.id] || { width: 40, height: 40 };
            const isImportant = ['bank', 'stock_exchange', 'university', 'city_hall', 'downtown', 'tech_hub', 'luxury_district'].includes(location.id);
            
            building.style.cssText = `
                position: absolute;
                left: ${left}%;
                top: ${top}%;
                transform: translate(-50%, -50%);
                width: ${size.width}px;
                height: ${size.height}px;
                background: ${buildingColors[location.type] || '#64748b'};
                border: ${isImportant ? '3px' : '2px'} solid rgba(0, 0, 0, ${isImportant ? '0.5' : '0.3'});
                border-radius: 4px;
                z-index: 4;
                cursor: pointer;
                box-shadow: ${isImportant ? '0 4px 12px rgba(0, 0, 0, 0.4)' : '0 2px 6px rgba(0, 0, 0, 0.3)'};
            `;
            
            // Try to load building image (simple 2D asset)
            const buildingImage = this.getBuildingImage(location);
            if (buildingImage) {
                const img = document.createElement('img');
                img.src = buildingImage;
                img.style.cssText = `
                    width: 100%;
                    height: 100%;
                    object-fit: contain;
                    object-position: center bottom;
                `;
                img.onerror = () => {
                    // Image failed - colored background is fine
                };
                building.appendChild(img);
            }
            
            // NO OVERLAYS - clean, simple building display
            
            buildingsContainer.appendChild(building);
        });
        
        this.container.appendChild(buildingsContainer);
    }

    /**
     * Get building image path (simple 2D assets)
     */
    getBuildingImage(location) {
        // Simple 2D building images per location type
        const imageMap = {
            'home': '/assets/map/buildings/residence.png',
            'office': '/assets/map/buildings/work.png',
            'library': '/assets/map/buildings/education.png',
            'university': '/assets/map/buildings/education.png',
            'bank': '/assets/map/buildings/finance.png',
            'stock_exchange': '/assets/map/buildings/finance.png',
            'city_hall': '/assets/map/buildings/government.png',
            'coffee_shop': '/assets/map/buildings/shop.png',
            'donut_shop': '/assets/map/buildings/shop.png',
            'bagel_shop': '/assets/map/buildings/shop.png',
            'flower_store': '/assets/map/buildings/shop.png',
            'mall': '/assets/map/buildings/shop.png',
            'gym': '/assets/map/buildings/training.png',
            'networking_bar': '/assets/map/buildings/social.png',
            'downtown': '/assets/map/buildings/business.png',
            'tech_hub': '/assets/map/buildings/business.png',
            'luxury_district': '/assets/map/buildings/elite.png',
            'real_estate': '/assets/map/buildings/finance.png',
            'car_dealership': '/assets/map/buildings/shop.png'
        };
        
        return imageMap[location.id] || null;
    }

    /**
     * Render location markers (simple icons, no overlays)
     */
    renderLocations() {
        if (!this.game?.worldMap) return;
        
        const locationsContainer = document.createElement('div');
        locationsContainer.className = 'map-locations-container';
        
        const locations = this.game.worldMap?.getAccessibleLocations() || [];
        const currentLocationId = this.game.worldMap?.currentLocation;
        
        locations.forEach(location => {
            const locEl = document.createElement('div');
            locEl.className = `map-location ${location.id === currentLocationId ? 'current' : ''}`;
            locEl.dataset.location = location.id;
            
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
            
            // Simple icon
            const icon = document.createElement('div');
            icon.className = 'map-location-icon';
            icon.style.cssText = `
                width: 24px;
                height: 24px;
                background: rgba(255, 255, 255, 0.9);
                border: 2px solid #333;
                border-radius: 50%;
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 12px;
            `;
            
            if (location.icon && location.icon.startsWith('/')) {
                const img = document.createElement('img');
                img.src = location.icon;
                img.style.width = '16px';
                img.style.height = '16px';
                img.style.objectFit = 'contain';
                icon.appendChild(img);
            } else {
                if (location.icon && location.icon.startsWith('/')) {
                    const img = document.createElement('img');
                    img.src = location.icon;
                    img.style.width = '16px';
                    img.style.height = '16px';
                    img.style.objectFit = 'contain';
                    icon.appendChild(img);
                } else {
                    icon.textContent = location.icon || '';
                }
            }
            locEl.appendChild(icon);
            
            // Location label (show on hover only to reduce clutter)
            const label = document.createElement('div');
            label.className = 'map-location-label';
            label.textContent = location.name;
            label.style.cssText = `
                position: absolute;
                top: 100%;
                left: 50%;
                transform: translateX(-50%);
                margin-top: 4px;
                padding: 2px 6px;
                background: rgba(0, 0, 0, 0.75);
                color: #fff;
                font-size: 11px;
                font-weight: 600;
                white-space: nowrap;
                border-radius: 3px;
                pointer-events: none;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
                border: 1px solid rgba(255, 255, 255, 0.2);
                opacity: 0;
                transition: opacity 0.2s ease;
            `;
            locEl.appendChild(label);
            
            // Show label on hover (reduces clutter)
            locEl.addEventListener('mouseenter', () => {
                label.style.opacity = '1';
            });
            locEl.addEventListener('mouseleave', () => {
                if (location.id !== currentLocationId) {
                    label.style.opacity = '0';
                }
            });
            
            // Always show label for current location
            if (location.id === currentLocationId) {
                label.style.opacity = '1';
                label.style.background = 'rgba(16, 185, 129, 0.85)';
            }
            
            // Click handler
            locEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.game.handleTravel?.(location.id);
            });
            
            locationsContainer.appendChild(locEl);
        });
        
        // Player marker
        this.renderPlayerMarker(locationsContainer);
        
        this.container.appendChild(locationsContainer);
    }

    /**
     * Render player marker
     */
    renderPlayerMarker(container) {
        const currentLocation = this.game.worldMap?.getCurrentLocation();
        if (!currentLocation) return;
        
        const marker = document.createElement('div');
        marker.className = 'map-player-marker';
        
        const left = (currentLocation.position.x / this.gridSize) * 100;
        const top = (currentLocation.position.y / this.gridSize) * 100;
        
        marker.style.cssText = `
            position: absolute;
            left: ${left}%;
            top: ${top}%;
            transform: translate(-50%, -50%);
            width: 20px;
            height: 20px;
            background: #3b82f6;
            border: 2px solid white;
            border-radius: 50%;
            z-index: 100;
            box-shadow: 0 2px 4px rgba(0, 0, 0, 0.3);
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
            // Remove and re-render dynamic elements
            const locationsContainer = this.container.querySelector('.map-locations-container');
            if (locationsContainer) {
                locationsContainer.remove();
            }
            this.renderLocations();
        }
    }
}
