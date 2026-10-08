/**
 * UnifiedMapSystem.js
 * Replaces all map renderers with PixiJS for better performance
 * Consolidates WorldMapRenderer, SimpleMapRenderer, CityMapRenderer, etc.
 * 
 * Phase 1: Code Reduction - Using PixiJS instead of DOM manipulation
 */

import * as PIXI from 'pixi.js';
import { WORLD_GRID_SIZE } from '../config/mapGrid.js';
// Phase 4: Particle effects (lazy loaded to avoid breaking game)

export class UnifiedMapSystem {
    constructor(container, game) {
        this.container = container;
        this.game = game;
        this.gridSize = WORLD_GRID_SIZE; // shared city grid (#1934)
        this.currentArea = null;
        this.rendered = false;
        
        // PixiJS Application
        this.app = null;
        
        // Layer containers for proper z-ordering
        this.layers = {
            grass: null,
            zones: null,
            parks: null,
            roads: null,
            buildings: null,
            locations: null,
            ui: null // For labels, markers, etc.
        };
    }

    /**
     * Initialize PixiJS application
     */
    async initialize() {
        if (this.rendered) return;
        // update() can call this again before the first init finishes; share
        // the in-flight init instead of creating a second PIXI app
        if (this.initializing) return this.initializing;
        
        // Check if container exists
        if (!this.container) {
            console.error('UnifiedMapSystem: Container not found');
            return;
        }

        this.initializing = this._initialize().finally(() => {
            this.initializing = null;
        });
        return this.initializing;
    }

    /**
     * Container size, falling back to the parent and then 800x600 when the
     * container is hidden (clientWidth/Height = 0)
     */
    getDimensions() {
        let width = this.container?.clientWidth || 0;
        let height = this.container?.clientHeight || 0;
        if (width === 0 || height === 0) {
            const parent = this.container?.parentElement;
            width = parent?.clientWidth || 800;
            height = parent?.clientHeight || 600;
        }
        return { width, height };
    }

    async _initialize() {
        
        // Clear container
        this.container.innerHTML = '';
        this.container.classList.add('unified-map-container');
        
        const { width, height } = this.getDimensions();
        
        // Create PixiJS Application (PixiJS v8+ pattern)
        this.app = new PIXI.Application();
        
        // Initialize with options (PixiJS v8+ pattern)
        await this.app.init({
            width,
            height,
            backgroundColor: 0x7cb342, // Grass green
            antialias: true,
            resolution: window.devicePixelRatio || 1,
            autoDensity: true
        });
        
        // Append canvas to container (use canvas instead of view in v8+)
        this.container.appendChild(this.app.canvas);
        
        // Create layer containers in z-order
        this.createLayers();

        // Render local map
        await this.renderLocalMap();
        
        // Handle resize (kept so destroy() can remove it)
        if (!this.onResize) {
            this.onResize = () => this.handleResize();
            window.addEventListener('resize', this.onResize);
        }
        
        // Initialize particle effects (optional - lazy load)
        if (this.game?.gameState?.particleEffectManager) {
            this.particleManager = this.game.gameState.particleEffectManager;
        }
        
        if (this.game?.gameState?.tooltipManager) {
            this.tooltipManager = this.game.gameState.tooltipManager;
        } else {
            // Initialize tooltip manager
            import('../ui/TooltipManager.js').then(({ TooltipManager }) => {
                try {
                    this.tooltipManager = new TooltipManager();
                    this.tooltipManager.initialize().then(() => {
                        if (this.game?.gameState) {
                            this.game.gameState.tooltipManager = this.tooltipManager;
                        }
                    });
                } catch (error) {
                    console.warn('TooltipManager initialization failed:', error);
                }
            }).catch(error => {
                console.warn('TooltipManager not available:', error);
            });
        }
        
        // Initialize filter manager if available
        if (this.game?.gameState?.filterManager) {
            this.filterManager = this.game.gameState.filterManager;
        }
        
        this.rendered = true;
    }

    /**
     * Create layer containers for proper z-ordering
     */
    createLayers() {
        const layerOrder = [
            'grass', 'zones', 'parks',
            'roads', 'buildings', 'locations', 'ui'
        ];
        
        layerOrder.forEach(layerName => {
            const container = new PIXI.Container();
            container.name = layerName;
            this.layers[layerName] = container;
            this.app.stage.addChild(container);
        });
    }

    /**
     * Render local map (city/town view)
     */
    async renderLocalMap() {
        const gridSize = this.gridSize;
        
        // Clear existing content (destroying it, so re-renders don't leak)
        Object.values(this.layers).forEach(layer => this.clearLayer(layer));
        
        // Render in order: grass -> zones -> parks -> roads -> buildings -> locations
        this.renderLocalGrass();
        this.renderLocalZones();
        this.renderLocalParks();
        this.renderLocalRoads();
        this.renderLocalBuildings();
        this.renderLocalLocations();
        this.renderPlayerMarker();
    }

    /**
     * Render local grass base
     */
    renderLocalGrass() {
        const { width, height } = this.app.screen;
        
        const grass = new PIXI.Graphics();
        grass.beginFill(0x7cb342);
        grass.drawRect(0, 0, width, height);
        
        // Add texture pattern
        grass.beginFill(0x6a9a3a);
        for (let x = 0; x < width; x += 15) {
            for (let y = 0; y < height; y += 15) {
                if ((x + y) % 30 === 0) {
                    grass.drawRect(x, y, 15, 15);
                }
            }
        }
        
        // Radial overlays for variation
        const overlay1 = new PIXI.Graphics();
        overlay1.beginFill(0x8bc34a, 0.3);
        overlay1.drawCircle(width * 0.2, height * 0.3, width * 0.2);
        
        const overlay2 = new PIXI.Graphics();
        overlay2.beginFill(0x8bc34a, 0.3);
        overlay2.drawCircle(width * 0.8, height * 0.7, width * 0.2);
        
        this.layers.grass.addChild(grass);
        this.layers.grass.addChild(overlay1);
        this.layers.grass.addChild(overlay2);
    }

    /**
     * Render local zones
     */
    renderLocalZones() {
        if (!this.game?.worldMap) return;
        
        const { width, height } = this.app.screen;
        const gridSize = this.gridSize;
        
        const zones = [
            { type: 'residential', bounds: { minX: 10, minY: 15, maxX: 20, maxY: 25 }, color: 0xd4a574 },
            { type: 'commercial', bounds: { minX: 5, minY: 5, maxX: 20, maxY: 20 }, color: 0xf59e0b },
            { type: 'education', bounds: { minX: 20, minY: 5, maxX: 30, maxY: 15 }, color: 0x8b5cf6 },
            { type: 'finance', bounds: { minX: 15, minY: 5, maxX: 30, maxY: 20 }, color: 0x10b981 },
            { type: 'government', bounds: { minX: 20, minY: 0, maxX: 30, maxY: 10 }, color: 0x64748b },
            { type: 'park', bounds: { minX: 0, minY: 0, maxX: 10, maxY: 10 }, color: 0x66bb6a }
        ];
        
        zones?.forEach(zone => {
            const zoneGraphic = new PIXI.Graphics();
            zoneGraphic.beginFill(zone.color, 0.15);
            zoneGraphic.lineStyle(1, 0x000000, 0.1, 1, true); // Dashed line effect
            
            const x = (zone.bounds.minX / gridSize) * width;
            const y = (zone.bounds.minY / gridSize) * height;
            const w = ((zone.bounds.maxX - zone.bounds.minX + 1) / gridSize) * width;
            const h = ((zone.bounds.maxY - zone.bounds.minY + 1) / gridSize) * height;
            
            zoneGraphic.drawRect(x, y, w, h);
            zoneGraphic.interactive = false;
            this.layers.zones.addChild(zoneGraphic);
        });
    }

    /**
     * Render local parks with trees
     */
    renderLocalParks() {
        const { width, height } = this.app.screen;
        const gridSize = this.gridSize;
        
        const parkAreas = [
            { minX: 0, minY: 0, maxX: 5, maxY: 5 },
            { minX: 12, minY: 18, maxX: 18, maxY: 24 },
            { minX: 22, minY: 22, maxX: 28, maxY: 28 }
        ];
        
        parkAreas?.forEach(park => {
            for (let x = park.minX; x <= park.maxX; x += 3) {
                for (let y = park.minY; y <= park.maxY; y += 3) {
                    if (Math.random() > 0.5) {
                        const tree = new PIXI.Graphics();
                        tree.beginFill(0x2e7d32);
                        tree.drawEllipse(
                            (x / gridSize) * width,
                            (y / gridSize) * height,
                            10,
                            12
                        );
                        this.layers.parks.addChild(tree);
                    }
                }
            }
        });
    }

    /**
     * Render local roads
     */
    renderLocalRoads() {
        const { width, height } = this.app.screen;
        const gridSize = this.gridSize;
        
        // Main horizontal roads (every 10 tiles)
        for (let y = 10; y < gridSize; y += 10) {
            const road = new PIXI.Graphics();
            road.beginFill(0x3a3a3a);
            road.lineStyle(1, 0xffd700, 0.6);
            
            const roadY = (y / gridSize) * height;
            const roadHeight = (3 / gridSize) * height;
            
            road.drawRect(0, roadY - roadHeight / 2, width, roadHeight);
            
            // Center line
            road.lineStyle(2, 0xffd700, 0.8);
            road.moveTo(0, roadY);
            road.lineTo(width, roadY);
            
            this.layers.roads.addChild(road);
        }
        
        // Main vertical roads (every 6 tiles)
        for (let x = 6; x < gridSize; x += 6) {
            const road = new PIXI.Graphics();
            road.beginFill(0x3a3a3a);
            road.lineStyle(1, 0xffd700, 0.6);
            
            const roadX = (x / gridSize) * width;
            const roadWidth = (3 / gridSize) * width;
            
            road.drawRect(roadX - roadWidth / 2, 0, roadWidth, height);
            
            // Center line
            road.lineStyle(2, 0xffd700, 0.8);
            road.moveTo(roadX, 0);
            road.lineTo(roadX, height);
            
            this.layers.roads.addChild(road);
        }
        
        // Secondary roads (every 15 tiles)
        for (let y = 5; y < gridSize; y += 15) {
            if (y % 10 !== 0) {
                const road = new PIXI.Graphics();
                road.beginFill(0x555555);
                const roadY = (y / gridSize) * height;
                const roadHeight = (2 / gridSize) * height;
                road.drawRect(0, roadY - roadHeight / 2, width, roadHeight);
                this.layers.roads.addChild(road);
            }
        }
        
        for (let x = 5; x < gridSize; x += 15) {
            if (x % 10 !== 0) {
                const road = new PIXI.Graphics();
                road.beginFill(0x555555);
                const roadX = (x / gridSize) * width;
                const roadWidth = (2 / gridSize) * width;
                road.drawRect(roadX - roadWidth / 2, 0, roadWidth, height);
                this.layers.roads.addChild(road);
            }
        }
        
        // Curved roads (using SVG paths converted to PixiJS)
        this.renderCurvedRoads();
    }

    /**
     * Render curved roads using PixiJS Graphics
     */
    renderCurvedRoads() {
        if (!this.game?.worldMap) return;
        
        const { width, height } = this.app.screen;
        const gridSize = this.gridSize;
        
        // Convert grid coordinates to screen coordinates
        const toScreen = (gridX, gridY) => ({
            x: (gridX / gridSize) * width,
            y: (gridY / gridSize) * height
        });
        
        // Curved road: Starting Town → City Center
        const road1 = new PIXI.Graphics();
        road1.lineStyle(3, 0x424242);
        
        const from1 = toScreen(13, 18);
        const to1 = toScreen(18, 10);
        const mid1 = { x: (from1.x + to1.x) / 2, y: (from1.y + to1.y) / 2 };
        
        // Quadratic bezier curve
        road1.moveTo(from1.x, from1.y);
        road1.quadraticCurveTo(
            mid1.x + 20, // Control point offset
            mid1.y - 20,
            to1.x,
            to1.y
        );
        
        this.layers.roads.addChild(road1);
    }

    /**
     * Render local buildings
     */
    renderLocalBuildings() {
        if (!this.game?.worldMap) return;
        
        const { width, height } = this.app.screen;
        const gridSize = this.gridSize;
        
        const locations = this.game.worldMap?.getAccessibleLocations() || [];
        
        const buildingColors = {
            'residence': 0xd4a574,
            'work': 0x7a8ba3,
            'education': 0x8b5cf6,
            'finance': 0x10b981,
            'government': 0x607d8b,
            'shop': 0xf59e0b,
            'social': 0xa855f7,
            'training': 0xef4444,
            'business': 0x64748b,
            'elite': 0xffd700,
            'shopping': 0xfb923c,
            'investment': 0x0ea5e9
        };
        
        const buildingSizes = {
            'home': { width: 35, height: 35 },
            'office': { width: 45, height: 45 },
            'bank': { width: 50, height: 50 },
            'stock_exchange': { width: 55, height: 55 },
            'university': { width: 50, height: 50 },
            'city_hall': { width: 50, height: 50 },
            'downtown': { width: 55, height: 55 },
            'tech_hub': { width: 50, height: 50 },
            'luxury_district': { width: 60, height: 60 },
            'mall': { width: 50, height: 50 }
        };
        
        locations.forEach(location => {
            if (!location.position) return;
            
            const size = buildingSizes[location.id] || { width: 40, height: 40 };
            const isImportant = ['bank', 'stock_exchange', 'university', 'city_hall', 'downtown', 'tech_hub', 'luxury_district'].includes(location.id);
            
            const building = new PIXI.Graphics();
            building.beginFill(buildingColors[location.type] || 0x64748b);
            building.lineStyle(isImportant ? 3 : 2, 0x000000, isImportant ? 0.5 : 0.3);
            
            const x = (location.position.x / gridSize) * width;
            const y = (location.position.y / gridSize) * height;
            
            building.drawRoundedRect(
                x - size.width / 2,
                y - size.height / 2,
                size.width,
                size.height,
                4
            );
            
            building.interactive = true;
            building.cursor = 'pointer';
            building.on('pointerdown', () => {
                this.game.handleTravel?.(location.id);
            });
            
            // Add shadow effect for important buildings
            if (isImportant) {
                // Shadow effect - using alpha for visual distinction instead of filter
                building.alpha = 0.95;
            }
            
            this.layers.buildings.addChild(building);
        });
    }

    /**
     * Render local location markers
     */
    renderLocalLocations() {
        if (!this.game?.worldMap) return;
        
        const { width, height } = this.app.screen;
        const gridSize = this.gridSize;
        
        const locations = this.game.worldMap?.getAccessibleLocations() || [];
        const currentLocationId = this.game.worldMap?.currentLocation;
        
        locations.forEach(location => {
            if (!location.position) return;
            
            const x = (location.position.x / gridSize) * width;
            const y = (location.position.y / gridSize) * height;
            
            // Location icon
            const icon = new PIXI.Graphics();
            const isCurrent = location.id === currentLocationId;
            
            icon.beginFill(0xffffff, 0.9);
            icon.lineStyle(2, isCurrent ? 0x10b981 : 0x333333);
            icon.drawCircle(x, y, 12);
            
            // Apply glow filter to current location
            if (isCurrent && this.game?.gameState?.filterManager) {
                this.game.gameState.filterManager.applyGlow(icon, 0x10b981, 10);
            }
            
            icon.interactive = true;
            icon.cursor = 'pointer';
            icon.on('pointerdown', (e) => {
                // Add particle effect on click
                if (this.particleManager) {
                    const bounds = icon.getBounds();
                    this.particleManager.createMagicSparkle(
                        bounds.x + bounds.width / 2,
                        bounds.y + bounds.height / 2,
                        this.layers.locations
                    );
                }
                this.game.handleTravel?.(location.id);
            });
            
            // Add icon content: image paths load as sprites, anything else is
            // drawn as text, matching the DOM renderers (#214)
            if (location.icon && location.icon.startsWith('/')) {
                this.addIconSprite(location.icon, x, y);
            } else if (location.icon) {
                const iconText = new PIXI.Text(location.icon, {
                    fontSize: 10,
                    fill: 0x333333
                });
                iconText.anchor.set(0.5);
                iconText.x = x;
                iconText.y = y;
                this.layers.locations.addChild(iconText);
            }
            
            this.layers.locations.addChild(icon);
            
            // Label (show on hover or if current)
            const label = new PIXI.Text(location.name, {
                fontSize: 11,
                fill: 0xffffff,
                fontWeight: 'bold',
                stroke: 0x000000,
                strokeThickness: 2
            });
            label.anchor.set(0.5);
            label.x = x;
            label.y = y + 20;
            label.alpha = isCurrent ? 1 : 0; // Show only if current
            
            // Phase 4: Use tooltip manager for better tooltips (for DOM elements)
            // Note: PixiJS elements need DOM wrapper for Floating UI
            // For now, use label visibility on hover
            icon.on('pointerover', () => {
                label.alpha = 1;
            });
            icon.on('pointerout', () => {
                if (!isCurrent) label.alpha = 0;
            });
            
            // Future: Can create DOM overlay for PixiJS elements to use Floating UI
            
            if (isCurrent) {
                label.style.fill = 0x10b981;
            }
            
            this.layers.ui.addChild(label);
        });
    }

    /**
     * Render player marker
     */
    renderPlayerMarker() {
        if (!this.game?.worldMap) return;
        
        const currentLocation = this.game.worldMap?.getCurrentLocation();
        if (!currentLocation?.position) return;
        
        const { width, height } = this.app.screen;
        const gridSize = this.gridSize;
        
        const x = (currentLocation.position.x / gridSize) * width;
        const y = (currentLocation.position.y / gridSize) * height;
        
        const marker = new PIXI.Graphics();
        marker.beginFill(0x3b82f6);
        marker.lineStyle(2, 0xffffff);
        marker.drawCircle(x, y, 10);
        
        // Add pulsing animation using GSAP (Phase 3)
        const pulse = new PIXI.Graphics();
        pulse.beginFill(0x3b82f6, 0.3);
        pulse.drawCircle(x, y, 15);
        
        // Pulse on the Pixi ticker (no GSAP animator exists, #2295). One
        // callback at a time: the previous marker's is removed first (#1349)
        this.removePulseTicker();
        const ticker = this.app.ticker;
        if (ticker?.add) {
            this.pulseTick = () => {
                const scale = 1 + Math.sin((ticker.lastTime || 0) / 200) * 0.2;
                pulse.scale.x = scale;
                pulse.scale.y = scale;
            };
            this.pulseTicker = ticker;
            ticker.add(this.pulseTick);
        }
        
        // Phase 4: Add particle effect around player marker (optional)
        if (this.particleManager) {
            // Subtle particle effect for player marker
            this.particleManager.createMagicEffect(x, y, this.layers.ui);
        }
        
        this.layers.ui.addChild(pulse);
        this.layers.ui.addChild(marker);
    }

    /**
     * Remove a layer's children and destroy them, so every re-render doesn't
     * leave orphaned Graphics/Text objects behind (#1909)
     */
    clearLayer(layer) {
        if (!layer) return;
        const removed = layer.removeChildren() || [];
        removed.forEach(child => {
            try {
                child.destroy?.({ children: true });
            } catch {
                // already destroyed
            }
        });
        if (layer === this.layers.ui) this.removePulseTicker();
    }

    removePulseTicker() {
        if (this.pulseTick && this.pulseTicker?.remove) {
            this.pulseTicker.remove(this.pulseTick);
        }
        this.pulseTick = null;
        this.pulseTicker = null;
    }

    /**
     * Draw an image icon on a location marker once its texture loads
     */
    addIconSprite(url, x, y) {
        const layer = this.layers.locations;
        if (!layer || !PIXI.Sprite || !PIXI.Assets?.load) return null;
        return PIXI.Assets.load(url).then(texture => {
            // Skip if the map was cleared or destroyed while loading
            if (!texture || this.layers.locations !== layer || layer.destroyed) return null;
            const sprite = new PIXI.Sprite(texture);
            sprite.anchor?.set?.(0.5);
            sprite.width = 16;
            sprite.height = 16;
            sprite.x = x;
            sprite.y = y;
            sprite.eventMode = 'none';
            layer.addChild(sprite);
            return sprite;
        }).catch(() => null);
    }

    /**
     * Handle window resize
     */
    handleResize() {
        if (!this.app || !this.container) return;
        
        const { width, height } = this.getDimensions();
        
        // Only resize if we have valid dimensions
        if (width > 0 && height > 0) {
            this.app.renderer.resize(width, height);

            // Re-render if needed
            if (this.rendered) {
                this.renderLocalMap();
            }
        }
    }

    /**
     * Update map (called when game state changes)
     */
    update() {
        if (!this.rendered) {
            this.initialize();
        } else {
            // Update dynamic elements (locations, player marker)
            // Clear and re-render locations layer
            this.clearLayer(this.layers.locations);
            this.clearLayer(this.layers.ui);
            this.renderLocalLocations();
            this.renderPlayerMarker();
        }
    }

    /**
     * Cleanup
     */
    destroy() {
        this.removePulseTicker();
        if (this.onResize) {
            window.removeEventListener('resize', this.onResize);
            this.onResize = null;
        }
        if (this.app) {
            this.app.destroy(true);
            this.app = null;
        }
        // Allow a later initialize() to rebuild the map
        this.rendered = false;
        Object.keys(this.layers).forEach(k => { this.layers[k] = null; });
        if (this.container) this.container.innerHTML = '';
    }
}
