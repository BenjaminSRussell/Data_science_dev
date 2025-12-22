/**
 * MapRenderer.js
 * Complete map rendering system using the new blocky city layout
 * Renders zones, blocks, roads, buildings, and environment
 */

import { MapManager } from './MapManager.js';

export class MapRenderer {
    constructor(container, game) {
        this.container = container;
        this.game = game;
        this.mapManager = null;
        this.rendered = false;
    }

    /**
     * Initialize and render the map
     */
    initialize() {
        if (this.rendered) return;
        
        // Get container dimensions
        const containerWidth = this.container.offsetWidth || 600;
        const containerHeight = this.container.offsetHeight || 600;
        
        // Initialize map manager with proper tile size based on container
        const tileSize = Math.min(containerWidth / 30, containerHeight / 30);
        this.mapManager = new MapManager(this.container, {
            grid: {
                gridWidth: 30,
                gridHeight: 30,
                tileSize: Math.max(15, Math.min(25, tileSize)) // Clamp between 15-25px
            }
        });
        
        // Store in game for access
        if (this.game) {
            this.game.mapManager = this.mapManager;
        }
        
        // Clear old content completely
        this.container.innerHTML = '';
        
        // Render everything in order (background first, then layers)
        this.renderBackground();
        this.renderZones();
        this.renderBlocks();
        this.renderRoads();
        this.renderBuildings();
        this.renderEnvironment();
        this.renderLocations();
        
        this.rendered = true;
    }

    /**
     * Render city background
     */
    renderBackground() {
        // Check if background already exists
        let bg = this.container.querySelector('.map-background-city');
        if (!bg) {
            bg = document.createElement('div');
            bg.className = 'map-background-city';
            this.container.appendChild(bg);
        }
        
        bg.style.cssText = `
            position: absolute;
            inset: 0;
            width: 100%;
            height: 100%;
            background: 
                linear-gradient(180deg, #0a0e14 0%, #1a1a2e 25%, #2d3436 50%, #1a1a2e 75%, #0a0e14 100%),
                repeating-linear-gradient(
                    0deg,
                    transparent 0px,
                    transparent 20px,
                    rgba(255, 255, 255, 0.025) 20px,
                    rgba(255, 255, 255, 0.025) 40px
                ),
                repeating-linear-gradient(
                    90deg,
                    transparent 0px,
                    transparent 20px,
                    rgba(255, 255, 255, 0.025) 20px,
                    rgba(255, 255, 255, 0.025) 40px
                ),
                radial-gradient(ellipse at 20% 30%, rgba(100, 149, 237, 0.12) 0%, transparent 70%),
                radial-gradient(ellipse at 80% 70%, rgba(139, 92, 246, 0.12) 0%, transparent 70%);
            z-index: 0;
        `;
    }

    /**
     * Render zones
     */
    renderZones() {
        const zonesContainer = document.createElement('div');
        zonesContainer.className = 'map-zones-container';
        this.container.appendChild(zonesContainer);
        
        const zones = this.mapManager.getZoneSystem().getAllZones();
        const gridSystem = this.mapManager.getGridSystem();
        const containerWidth = this.container.offsetWidth || this.mapManager.getGridSystem().totalWidth;
        const containerHeight = this.container.offsetHeight || this.mapManager.getGridSystem().totalHeight;
        
        zones.forEach(zone => {
            const zoneEl = document.createElement('div');
            zoneEl.className = `map-zone ${zone.type}`;
            zoneEl.dataset.zoneId = zone.id;
            
            // Convert grid bounds to percentage
            const minPixel = gridSystem.gridToPixel(zone.bounds.minX, zone.bounds.minY);
            const maxPixel = gridSystem.gridToPixel(zone.bounds.maxX, zone.bounds.maxY);
            
            const left = (minPixel.x / containerWidth) * 100;
            const top = (minPixel.y / containerHeight) * 100;
            const width = ((maxPixel.x - minPixel.x) / containerWidth) * 100;
            const height = ((maxPixel.y - minPixel.y) / containerHeight) * 100;
            
            zoneEl.style.cssText = `
                position: absolute;
                left: ${left}%;
                top: ${top}%;
                width: ${width}%;
                height: ${height}%;
                background: ${zone.backgroundColor};
                border: 2px dashed ${zone.borderColor};
                z-index: 0;
                pointer-events: none;
            `;
            
            // Add label
            const label = document.createElement('div');
            label.className = 'map-zone-label';
            label.textContent = zone.name;
            zoneEl.appendChild(label);
            
            zonesContainer.appendChild(zoneEl);
        });
    }

    /**
     * Render blocks
     */
    renderBlocks() {
        const blocksContainer = document.createElement('div');
        blocksContainer.className = 'map-blocks-container';
        this.container.appendChild(blocksContainer);
        
        const blocks = this.mapManager.getBlockSystem().getAllBlocks();
        const gridSystem = this.mapManager.getGridSystem();
        const containerWidth = this.container.offsetWidth || this.mapManager.getGridSystem().totalWidth;
        const containerHeight = this.container.offsetHeight || this.mapManager.getGridSystem().totalHeight;
        
        blocks.forEach(block => {
            const blockEl = document.createElement('div');
            blockEl.className = `map-block ${block.zone || ''} ${block.locations.length > 0 ? 'has-location' : ''}`;
            blockEl.dataset.blockId = block.id;
            
            const minPixel = gridSystem.gridToPixel(block.bounds.x, block.bounds.y);
            const maxPixel = gridSystem.gridToPixel(
                block.bounds.x + block.bounds.width - 1,
                block.bounds.y + block.bounds.height - 1
            );
            
            const left = (minPixel.x / containerWidth) * 100;
            const top = (minPixel.y / containerHeight) * 100;
            const width = ((maxPixel.x - minPixel.x) / containerWidth) * 100;
            const height = ((maxPixel.y - minPixel.y) / containerHeight) * 100;
            
            blockEl.style.cssText = `
                position: absolute;
                left: ${left}%;
                top: ${top}%;
                width: ${width}%;
                height: ${height}%;
                z-index: 0;
                pointer-events: none;
            `;
            
            blocksContainer.appendChild(blockEl);
        });
    }

    /**
     * Render roads using the road renderer
     */
    renderRoads() {
        this.mapManager.render();
    }

    /**
     * Render buildings
     */
    renderBuildings() {
        const buildings = this.mapManager.getBuildingSystem().getAllBuildings();
        const gridSystem = this.mapManager.getGridSystem();
        const containerWidth = this.container.offsetWidth || this.mapManager.getGridSystem().totalWidth;
        const containerHeight = this.container.offsetHeight || this.mapManager.getGridSystem().totalHeight;
        
        buildings.forEach(building => {
            const buildingEl = document.createElement('div');
            buildingEl.className = `map-building-block ${building.type}`;
            buildingEl.dataset.buildingId = building.id;
            
            const minPixel = gridSystem.gridToPixel(building.position.x, building.position.y);
            const maxPixel = gridSystem.gridToPixel(
                building.position.x + building.size.width - 1,
                building.position.y + building.size.height - 1
            );
            
            const left = (minPixel.x / containerWidth) * 100;
            const top = (minPixel.y / containerHeight) * 100;
            const width = ((maxPixel.x - minPixel.x) / containerWidth) * 100;
            const height = ((maxPixel.y - minPixel.y) / containerHeight) * 100;
            
            // Different colors per building type
            const buildingColors = {
                'residence': 'linear-gradient(135deg, #d4a574 0%, #b8956a 100%)',
                'work': 'linear-gradient(135deg, #7a8ba3 0%, #5a6b83 100%)',
                'education': 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                'finance': 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                'government': 'linear-gradient(135deg, #607d8b 0%, #455a64 100%)',
                'shop': 'linear-gradient(135deg, #f59e0b 0%, #d97706 100%)',
                'social': 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                'business': 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                'elite': 'linear-gradient(135deg, #ffd700 0%, #b8860b 100%)'
            };
            
            buildingEl.style.cssText = `
                position: absolute;
                left: ${left}%;
                top: ${top}%;
                width: ${width}%;
                height: ${height}%;
                background: ${buildingColors[building.type] || 'linear-gradient(135deg, #64748b 0%, #475569 100%)'};
                border: 3px solid rgba(255, 255, 255, 0.4);
                border-radius: 6px;
                z-index: 3;
                box-shadow: 
                    0 6px 16px rgba(0, 0, 0, 0.5),
                    inset 0 2px 4px rgba(255, 255, 255, 0.2),
                    inset 0 -2px 4px rgba(0, 0, 0, 0.3);
                transition: all 0.2s ease;
            `;
            
            // Add hover effect
            buildingEl.addEventListener('mouseenter', () => {
                buildingEl.style.transform = 'scale(1.05)';
                buildingEl.style.zIndex = '4';
                buildingEl.style.boxShadow = '0 8px 20px rgba(0, 0, 0, 0.6), inset 0 2px 4px rgba(255, 255, 255, 0.3)';
            });
            buildingEl.addEventListener('mouseleave', () => {
                buildingEl.style.transform = 'scale(1)';
                buildingEl.style.zIndex = '3';
                buildingEl.style.boxShadow = '0 6px 16px rgba(0, 0, 0, 0.5), inset 0 2px 4px rgba(255, 255, 255, 0.2), inset 0 -2px 4px rgba(0, 0, 0, 0.3)';
            });
            
            this.container.appendChild(buildingEl);
        });
    }

    /**
     * Render environment elements
     */
    renderEnvironment() {
        const envContainer = document.createElement('div');
        envContainer.className = 'map-environment-container';
        this.container.appendChild(envContainer);
        
        const elements = this.mapManager.environmentSystem.getAllElements();
        const gridSystem = this.mapManager.getGridSystem();
        const containerWidth = this.container.offsetWidth || this.mapManager.getGridSystem().totalWidth;
        const containerHeight = this.container.offsetHeight || this.mapManager.getGridSystem().totalHeight;
        
        elements.forEach(element => {
            if (element.type === 'tree') {
                const treeEl = document.createElement('div');
                treeEl.className = 'map-tree';
                
                const pixel = gridSystem.gridToPixel(element.x, element.y);
                const left = (pixel.x / containerWidth) * 100;
                const top = (pixel.y / containerHeight) * 100;
                
                treeEl.style.cssText = `
                    position: absolute;
                    left: ${left}%;
                    top: ${top}%;
                    transform: translate(-50%, -50%);
                    width: 20px;
                    height: 20px;
                    z-index: 2;
                    pointer-events: none;
                `;
                
                envContainer.appendChild(treeEl);
            }
        });
    }

    /**
     * Render location markers
     */
    renderLocations() {
        const locations = this.game.worldMap.getAccessibleLocations();
        const gridSystem = this.mapManager.getGridSystem();
        const containerWidth = this.container.offsetWidth || this.mapManager.getGridSystem().totalWidth;
        const containerHeight = this.container.offsetHeight || this.mapManager.getGridSystem().totalHeight;
        
        locations.forEach(location => {
            const locEl = document.createElement('div');
            locEl.className = `map-location ${location.id === this.game.worldMap.currentLocation ? 'current' : ''}`;
            locEl.dataset.location = location.id;
            
            let percentX, percentY;
            if (location.position.x > 100 || location.position.y > 100) {
                const pixel = gridSystem.gridToPixel(location.position.x, location.position.y);
                percentX = (pixel.x / containerWidth) * 100;
                percentY = (pixel.y / containerHeight) * 100;
            } else {
                percentX = location.position.x;
                percentY = location.position.y;
            }
            
            locEl.style.cssText = `
                position: absolute;
                left: ${percentX}%;
                top: ${percentY}%;
                transform: translate(-50%, -50%);
                z-index: 10;
                cursor: pointer;
            `;
            
            const icon = document.createElement('div');
            icon.className = 'location-icon';
            icon.style.cssText = `
                width: 60px;
                height: 60px;
                background: var(--cartoon-bg-secondary);
                border: 3px solid rgba(255, 255, 255, 0.3);
                border-radius: var(--radius-lg);
                display: flex;
                align-items: center;
                justify-content: center;
                font-size: 1.8rem;
                box-shadow: 0 4px 0 rgba(0, 0, 0, 0.4);
            `;
            if (location.icon && location.icon.startsWith('/')) {
                const img = document.createElement('img');
                img.src = location.icon;
                img.style.width = '100%';
                img.style.height = '100%';
                img.style.objectFit = 'contain';
                icon.appendChild(img);
            } else {
                icon.textContent = location.icon || '';
            }
            locEl.appendChild(icon);
            
            const name = document.createElement('div');
            name.className = 'location-name';
            name.textContent = location.name;
            name.style.cssText = `
                margin-top: 4px;
                font-size: 12px;
                font-weight: 600;
                color: white;
                text-shadow: 1px 1px 2px rgba(0, 0, 0, 0.8);
                white-space: nowrap;
            `;
            locEl.appendChild(name);
            
            // Add click handler
            locEl.addEventListener('click', (e) => {
                e.stopPropagation();
                this.game.handleTravel?.(location.id);
            });
            
            this.container.appendChild(locEl);
        });
        
        // Render player marker
        this.renderPlayerMarker();
    }

    /**
     * Render player marker
     */
    renderPlayerMarker() {
        const currentLocation = this.game.worldMap.getCurrentLocation();
        if (!currentLocation) return;
        
        const marker = document.createElement('div');
        marker.id = 'player-marker';
        marker.className = 'player-marker';
        
        const gridSystem = this.mapManager.getGridSystem();
        const containerWidth = this.container.offsetWidth || this.mapManager.getGridSystem().totalWidth;
        const containerHeight = this.container.offsetHeight || this.mapManager.getGridSystem().totalHeight;
        
        let percentX, percentY;
        if (currentLocation.position.x > 100 || currentLocation.position.y > 100) {
            const pixel = gridSystem.gridToPixel(currentLocation.position.x, currentLocation.position.y);
            percentX = (pixel.x / containerWidth) * 100;
            percentY = (pixel.y / containerHeight) * 100;
        } else {
            percentX = currentLocation.position.x;
            percentY = currentLocation.position.y;
        }
        
        marker.style.cssText = `
            position: absolute;
            left: ${percentX}%;
            top: ${percentY}%;
            transform: translate(-50%, -50%);
            width: 50px;
            height: 50px;
            z-index: 100;
        `;
        
        const icon = document.createElement('div');
        icon.className = 'player-icon';
        icon.style.cssText = `
            width: 100%;
            height: 100%;
            background: var(--cartoon-gradient-hero);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 1.5rem;
            border: 3px solid white;
            box-shadow: 0 4px 0 rgba(0, 0, 0, 0.4);
            animation: playerBounce 1s ease-in-out infinite;
        `;
        icon.textContent = '';
        marker.appendChild(icon);
        
        this.container.appendChild(marker);
    }

    /**
     * Update map (refresh rendering)
     */
    update() {
        if (!this.rendered) {
            this.initialize();
        } else {
            // Update locations and player marker
            const container = this.container;
            container.querySelectorAll('.map-location').forEach(el => el.remove());
            container.querySelector('#player-marker')?.remove();
            this.renderLocations();
        }
    }
}
