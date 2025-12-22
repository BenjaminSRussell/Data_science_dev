/**
 * AssetManager.js
 * Manages loading and organization of all game assets
 * Handles sprites, backgrounds, icons, and animations
 */


export class AssetManager {
    constructor() {
        this.assets = new Map();
        this.loaded = false;
        this.loadProgress = 0;
        this.totalAssets = 0;
        this.loadedAssets = 0;
    }
    
    /**
     * Asset manifest - only assets that actually exist
     * Game can run without all assets - missing assets return null
     */
    getAssetManifest() {
        return {
            characters: {
                // Sprite sheets (preferred - has animations)
                spriteSheets: {
                    main: {
                        url: '/assets/characters/sprites/character_sheet.png',
                        frameWidth: 64,
                        frameHeight: 64,
                        columns: 8,
                        rows: 8,
                        type: 'spriteSheet'
                    },
                    emotions: {
                        url: '/assets/characters/sprites/emotion_sheet.png',
                        frameWidth: 64,
                        frameHeight: 64,
                        columns: 6,
                        rows: 1,
                        type: 'spriteSheet'
                    }
                },
                // Low-poly character sprites (1000 available)
                // Using generated Low-poly characters from downloaded_assets
                base: '/downloaded_assets/characters/sprites/generated_low_poly_character_0000.png',
                walk: '/downloaded_assets/characters/sprites/generated_low_poly_character_0001.png',
                idle: '/downloaded_assets/characters/sprites/generated_low_poly_character_0002.png',
                emotions: {
                    // Basic emotions (using SVG files that exist)
                    happy: '/assets/characters/emotions/happy.svg',
                    sad: '/assets/characters/emotions/sad.svg',
                    angry: '/assets/characters/emotions/angry.svg',
                    neutral: '/assets/characters/emotions/neutral.svg',
                    // These don't exist yet - will return null gracefully
                    excited: '/assets/characters/emotions/excited.png',
                    thinking: '/assets/characters/emotions/thinking.png',
                    // Breakdown emotions
                    crying: '/assets/characters/emotions/crying.png',
                    yelling: '/assets/characters/emotions/yelling.png',
                    fighting: '/assets/characters/emotions/fighting.png',
                    // Relationship emotions
                    grateful: '/assets/characters/emotions/grateful.png',
                    jealous: '/assets/characters/emotions/jealous.png',
                    hurt: '/assets/characters/emotions/hurt.png',
                    embarrassed: '/assets/characters/emotions/embarrassed.png',
                    proud: '/assets/characters/emotions/proud.png',
                    worried: '/assets/characters/emotions/worried.png',
                    relieved: '/assets/characters/emotions/relieved.png',
                    surprised: '/assets/characters/emotions/surprised.png',
                    disappointed: '/assets/characters/emotions/disappointed.png',
                    hopeful: '/assets/characters/emotions/hopeful.png',
                    confused: '/assets/characters/emotions/confused.png',
                    determined: '/assets/characters/emotions/determined.png',
                    tired: '/assets/characters/emotions/tired.png',
                    content: '/assets/characters/emotions/content.png'
                },
                bodyLanguage: {
                    // Basic poses
                    standing: '/assets/characters/body_language/standing.png',
                    sitting: '/assets/characters/body_language/sitting.png',
                    walking: '/assets/characters/body_language/walking.png',
                    // Communication poses
                    talking: '/assets/characters/body_language/talking.png',
                    listening: '/assets/characters/body_language/listening.png',
                    thinking: '/assets/characters/body_language/thinking.png',
                    explaining: '/assets/characters/body_language/explaining.png',
                    // Work poses
                    working: '/assets/characters/body_language/working.png',
                    typing: '/assets/characters/body_language/typing.png',
                    reading: '/assets/characters/body_language/reading.png',
                    presenting: '/assets/characters/body_language/presenting.png',
                    // Emotional poses
                    happy_pose: '/assets/characters/body_language/happy_pose.png',
                    sad_pose: '/assets/characters/body_language/sad_pose.png',
                    angry_pose: '/assets/characters/body_language/angry_pose.png',
                    defensive: '/assets/characters/body_language/defensive.png',
                    open: '/assets/characters/body_language/open.png',
                    // Breakdown poses
                    crying_pose: '/assets/characters/body_language/crying_pose.png',
                    yelling_pose: '/assets/characters/body_language/yelling_pose.png',
                    fighting_pose: '/assets/characters/body_language/fighting_pose.png',
                    // Social poses
                    greeting: '/assets/characters/body_language/greeting.png',
                    handshake: '/assets/characters/body_language/handshake.png',
                    hugging: '/assets/characters/body_language/hugging.png',
                    pointing: '/assets/characters/body_language/pointing.png',
                    nodding: '/assets/characters/body_language/nodding.png',
                    shaking_head: '/assets/characters/body_language/shaking_head.png',
                    // Rest poses
                    resting: '/assets/characters/body_language/resting.png',
                    sleeping: '/assets/characters/body_language/sleeping.png',
                    stretching: '/assets/characters/body_language/stretching.png'
                }
            },
            backgrounds: {
                locations: {
                    // Low-poly generated backdrops (490 total across 49 locations)
                    // Using generated Low-poly backdrops from assets/backgrounds/locations/
                    home: '/assets/backgrounds/locations/home/home_backdrop_00.png',
                    office: '/assets/backgrounds/locations/office/office_backdrop_00.png',
                    coffee_shop: '/assets/backgrounds/locations/coffee_shop/coffee_shop_backdrop_00.png',
                    cafe: '/assets/backgrounds/locations/cafe/cafe_backdrop_00.png',
                    university: '/assets/backgrounds/locations/university/university_backdrop_00.png',
                    bank: '/assets/backgrounds/locations/bank/bank_backdrop_00.png',
                    library: '/assets/backgrounds/locations/library/library_backdrop_00.png',
                    gym: '/assets/backgrounds/locations/gym/gym_backdrop_00.png',
                    donut_shop: '/assets/backgrounds/locations/donut_shop/donut_shop_backdrop_00.png',
                    bagel_shop: '/assets/backgrounds/locations/bagel_shop/bagel_shop_backdrop_00.png',
                    flower_store: '/assets/backgrounds/locations/flower_store/flower_store_backdrop_00.png',
                    mall: '/assets/backgrounds/locations/mall/mall_backdrop_00.png',
                    car_dealership: '/assets/backgrounds/locations/car_dealership/car_dealership_backdrop_00.png',
                    networking_bar: '/assets/backgrounds/locations/networking_bar/networking_bar_backdrop_00.png',
                    downtown: '/assets/backgrounds/locations/downtown/downtown_backdrop_00.png',
                    tech_hub: '/assets/backgrounds/locations/tech_hub/tech_hub_backdrop_00.png',
                    luxury_district: '/assets/backgrounds/locations/luxury_district/luxury_district_backdrop_00.png',
                    stock_exchange: '/assets/backgrounds/locations/stock_exchange/stock_exchange_backdrop_00.png',
                    city_hall: '/assets/backgrounds/locations/city_hall/city_hall_backdrop_00.png',
                    real_estate: '/assets/backgrounds/locations/real_estate/real_estate_backdrop_00.png',
                    apartment: '/assets/backgrounds/locations/apartment/apartment_backdrop_00.png',
                    park: '/assets/backgrounds/locations/park/park_backdrop_00.png',
                    restaurant: '/assets/backgrounds/locations/restaurant/restaurant_backdrop_00.png',
                    bar: '/assets/backgrounds/locations/bar/bar_backdrop_00.png',
                    club: '/assets/backgrounds/locations/club/club_backdrop_00.png',
                    hospital: '/assets/backgrounds/locations/hospital/hospital_backdrop_00.png',
                    school: '/assets/backgrounds/locations/school/school_backdrop_00.png',
                    warehouse: '/assets/backgrounds/locations/warehouse/warehouse_backdrop_00.png',
                    factory: '/assets/backgrounds/locations/factory/factory_backdrop_00.png',
                    airport: '/assets/backgrounds/locations/airport/airport_backdrop_00.png',
                    train_station: '/assets/backgrounds/locations/train_station/train_station_backdrop_00.png',
                    hotel: '/assets/backgrounds/locations/hotel/hotel_backdrop_00.png',
                    museum: '/assets/backgrounds/locations/museum/museum_backdrop_00.png',
                    theater: '/assets/backgrounds/locations/theater/theater_backdrop_00.png',
                    stadium: '/assets/backgrounds/locations/stadium/stadium_backdrop_00.png',
                    courthouse: '/assets/backgrounds/locations/courthouse/courthouse_backdrop_00.png',
                    police_station: '/assets/backgrounds/locations/police_station/police_station_backdrop_00.png',
                    fire_station: '/assets/backgrounds/locations/fire_station/fire_station_backdrop_00.png',
                    post_office: '/assets/backgrounds/locations/post_office/post_office_backdrop_00.png',
                    grocery_store: '/assets/backgrounds/locations/grocery_store/grocery_store_backdrop_00.png',
                    pharmacy: '/assets/backgrounds/locations/pharmacy/pharmacy_backdrop_00.png',
                    bookstore: '/assets/backgrounds/locations/bookstore/bookstore_backdrop_00.png',
                    electronics_store: '/assets/backgrounds/locations/electronics_store/electronics_store_backdrop_00.png',
                    clothing_store: '/assets/backgrounds/locations/clothing_store/clothing_store_backdrop_00.png',
                    jewelry_store: '/assets/backgrounds/locations/jewelry_store/jewelry_store_backdrop_00.png',
                    beach: '/assets/backgrounds/locations/beach/beach_backdrop_00.png',
                    mountain: '/assets/backgrounds/locations/mountain/mountain_backdrop_00.png',
                    forest: '/assets/backgrounds/locations/forest/forest_backdrop_00.png',
                    suburb: '/assets/backgrounds/locations/suburb/suburb_backdrop_00.png'
                }
            },
            map: {
                // Simple 2D map tiles
                grass: '/assets/map/grass.png',
                roads: {
                    main_h: '/assets/map/roads/main_horizontal.png',
                    main_v: '/assets/map/roads/main_vertical.png',
                    secondary_h: '/assets/map/roads/secondary_horizontal.png',
                    secondary_v: '/assets/map/roads/secondary_vertical.png'
                },
                buildings: {
                    residence: '/assets/map/buildings/residence.png',
                    work: '/assets/map/buildings/work.png',
                    education: '/assets/map/buildings/education.png',
                    finance: '/assets/map/buildings/finance.png',
                    government: '/assets/map/buildings/government.png',
                    shop: '/assets/map/buildings/shop.png',
                    social: '/assets/map/buildings/social.png',
                    training: '/assets/map/buildings/training.png',
                    business: '/assets/map/buildings/business.png',
                    elite: '/assets/map/buildings/elite.png'
                },
                parks: {
                    tree: '/assets/map/parks/tree.png',
                    grass_park: '/assets/map/parks/grass_park.png'
                }
            },
            icons: {
                // Simple 2D location icons (when available)
                locations: {
                    home: '/assets/icons/locations/home.png',
                    office: '/assets/icons/locations/office.png',
                    library: '/assets/icons/locations/library.png',
                    coffee_shop: '/assets/icons/locations/coffee_shop.png',
                    university: '/assets/icons/locations/university.png',
                    bank: '/assets/icons/locations/bank.png',
                    gym: '/assets/icons/locations/gym.png',
                    donut_shop: '/assets/icons/locations/donut_shop.png',
                    bagel_shop: '/assets/icons/locations/bagel_shop.png',
                    flower_store: '/assets/icons/locations/flower_store.png',
                    networking_bar: '/assets/icons/locations/networking_bar.png',
                    stock_exchange: '/assets/icons/locations/stock_exchange.png',
                    city_hall: '/assets/icons/locations/city_hall.png',
                    mall: '/assets/icons/locations/mall.png',
                    car_dealership: '/assets/icons/locations/car_dealership.png',
                    downtown: '/assets/icons/locations/downtown.png',
                    tech_hub: '/assets/icons/locations/tech_hub.png',
                    luxury_district: '/assets/icons/locations/luxury_district.png',
                    real_estate: '/assets/icons/locations/real_estate.png'
                }
            }
        };
    }
    
    /**
     * Load all assets (non-blocking, fails gracefully)
     */
    async loadAll() {
        const manifest = this.getAssetManifest();
        this.totalAssets = this.countAssets(manifest);
        this.loadedAssets = 0;
        
        try {
            // Load assets but don't fail if some are missing
            await this.loadAssets(manifest);
            this.loaded = true;
            return true;
        } catch (error) {
            // Asset loading errors are non-critical - game can run without all assets
            this.loaded = true; // Mark as loaded anyway so game can proceed
            return false;
        }
    }
    
    /**
     * Count total assets
     */
    countAssets(obj, count = 0) {
        for (const key in obj) {
            if (typeof obj[key] === 'string') {
                count++;
            } else if (typeof obj[key] === 'object') {
                count = this.countAssets(obj[key], count);
            }
        }
        return count;
    }
    
    /**
     * Load assets recursively (fails gracefully for missing assets)
     */
    async loadAssets(manifest, path = '') {
        for (const key in manifest) {
            const currentPath = path ? `${path}.${key}` : key;
            
            if (typeof manifest[key] === 'string') {
                // It's an asset path - load it (will resolve null if missing)
                try {
                    await this.loadImage(manifest[key], currentPath);
                } catch (error) {
                    // Continue loading other assets even if one fails
                }
            } else if (typeof manifest[key] === 'object') {
                // It's a nested object
                try {
                    await this.loadAssets(manifest[key], currentPath);
                } catch (error) {
                    // Continue loading other assets even if one fails
                }
            }
        }
    }
    
    /**
     * Load a single image
     */
    loadImage(src, key) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                this.assets.set(key, img);
                this.loadedAssets++;
                this.loadProgress = (this.loadedAssets / this.totalAssets) * 100;
                resolve(img);
            };
            
            img.onerror = () => {
                // Asset failed to load - don't add to assets map
                // This ensures missing assets don't show broken images
                this.loadedAssets++;
                this.loadProgress = (this.loadedAssets / this.totalAssets) * 100;
                resolve(null);
            };
            
            img.src = src;
        });
    }
    /**
     * Get asset by key
     */
    getAsset(key) {
        return this.assets.get(key) || null;
    }
    
    /**
     * Get character emotion asset
     */
    getCharacterEmotion(emotion) {
        return this.getAsset(`characters.emotions.${emotion}`) || null;
    }
    
    /**
     * Get character body language asset
     */
    getCharacterBodyLanguage(pose) {
        return this.getAsset(`characters.bodyLanguage.${pose}`) || 
               this.getAsset('characters.base');
    }
    
    /**
     * Get location background
     * Now uses Low-poly generated backdrops
     */
    getLocationBackground(locationId) {
        // Try to get PNG image first
        const asset = this.getAsset(`backgrounds.locations.${locationId}`);
        if (asset) return asset;
        
        // Try alternative backdrop variations
        const variations = [0, 1, 2, 3, 4, 5, 6, 7, 8, 9];
        for (const variant of variations) {
            const variantPath = `/assets/backgrounds/locations/${locationId}/${locationId}_backdrop_0${variant}.png`;
            const variantAsset = this.getAsset(`backgrounds.locations.${locationId}.variant${variant}`);
            if (variantAsset) return variantAsset;
        }
        
        // Fallback to first backdrop
        return null;
    }
    
    /**
     * Get location icon
     */
    /**
     * Get location icon asset path (organized, replaces emojis)
     */
    getLocationIcon(locationId) {
        return this.getAsset(`icons.locations.${locationId}`) || `/assets/icons/locations/${locationId}.png`;
    }

    /**
     * Get NPC icon asset path (organized)
     */
    getNPCIcon(npcType) {
        return this.getAsset(`icons.npcs.${npcType}`) || `/assets/icons/npcs/${npcType}.png`;
    }

    /**
     * Get UI icon asset path (organized)
     */
    getUIIcon(iconName) {
        return this.getAsset(`icons.ui.${iconName}`) || `/assets/icons/ui/${iconName}.png`;
    }

    /**
     * Get vehicle icon asset path (organized)
     */
    getVehicleIcon(vehicleId) {
        return this.getAsset(`icons.vehicles.${vehicleId}`) || `/assets/icons/vehicles/${vehicleId}.png`;
    }

    /**
     * Get item icon asset path (organized)
     */
    getItemIcon(itemName) {
        return this.getAsset(`icons.items.${itemName}`) || `/assets/icons/items/${itemName}.png`;
    }

    /**
     * Get feature icon asset path (organized)
     */
    getFeatureIcon(featureId) {
        return this.getAsset(`icons.features.${featureId}`) || `/assets/icons/features/${featureId}.png`;
    }

    /**
     * Get chart icon asset path (organized)
     */
    getChartIcon(chartType) {
        return this.getAsset(`icons.charts.${chartType}`) || `/assets/icons/charts/${chartType}.png`;
    }
    
    /**
     * Get map icon
     */
    getMapIcon(type) {
        return this.getAsset(`icons.map.${type}`) || null;
    }
    
    /**
     * Check if assets are loaded
     */
    isLoaded() {
        return this.loaded;
    }
    
    /**
     * Get load progress (0-100)
     */
    getLoadProgress() {
        return this.loadProgress;
    }
}
