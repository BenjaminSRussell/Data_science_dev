/**
 * LocationBackgroundSystem.js
 * Dynamic backgrounds that change based on location and time
 */

import { isAssetMissing } from '../assets/MissingAssetBlocklist.js';

export class LocationBackgroundSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.backgrounds = this.initializeBackgrounds();
    }

    /**
     * Initialize location backgrounds
     */
    initializeBackgrounds() {
        return {
            home: {
                apartment: 'linear-gradient(135deg, #2d3436 0%, #1a1a2e 100%)',
                condo: 'linear-gradient(135deg, #3c4153 0%, #2a2d3a 100%)',
                house: 'linear-gradient(135deg, #4a5568 0%, #2d3748 100%)',
                mansion: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            coffee_shop: {
                morning: 'linear-gradient(135deg, #ffd93d 0%, #c8a415 100%)',
                afternoon: 'linear-gradient(135deg, #feca57 0%, #ff9f43 100%)',
                evening: 'linear-gradient(135deg, #a855f7 0%, #7c3aed 100%)',
                night: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)'
            },
            office: {
                small: 'linear-gradient(135deg, #1a1a3e 0%, #2d1b4e 100%)',
                medium: 'linear-gradient(135deg, #2d3748 0%, #1a202c 100%)',
                large: 'linear-gradient(135deg, #2d3748 0%, #4a5568 100%)',
                executive: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)'
            },
            library: {
                default: 'linear-gradient(135deg, #8b5a2b 0%, #3c2a14 100%)'
            },
            gym: {
                default: 'linear-gradient(135deg, #ff6b9d 0%, #c44569 100%)'
            },
            downtown: {
                day: 'linear-gradient(135deg, #64748b 0%, #475569 100%)',
                night: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)',
                rain: 'linear-gradient(135deg, #475569 0%, #334155 100%)'
            },
            tech_hub: {
                default: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                night: 'linear-gradient(135deg, #1e3a8a 0%, #1e40af 100%)'
            },
            luxury_district: {
                default: 'linear-gradient(135deg, #8b5cf6 0%, #7c3aed 100%)',
                evening: 'linear-gradient(135deg, #a78bfa 0%, #8b5cf6 100%)'
            },
            // Type-level palettes so every WorldMap location type has one (#2007)
            shop: {
                default: 'linear-gradient(135deg, #f6ad55 0%, #c05621 100%)',
                night: 'linear-gradient(135deg, #7b341e 0%, #3c1a0e 100%)'
            },
            finance: {
                default: 'linear-gradient(135deg, #2f855a 0%, #1c4532 100%)',
                night: 'linear-gradient(135deg, #1c4532 0%, #0f2419 100%)'
            },
            government: {
                default: 'linear-gradient(135deg, #a0aec0 0%, #4a5568 100%)'
            },
            shopping: {
                default: 'linear-gradient(135deg, #ed64a6 0%, #97266d 100%)',
                night: 'linear-gradient(135deg, #702459 0%, #3b1230 100%)'
            },
            investment: {
                default: 'linear-gradient(135deg, #d69e2e 0%, #744210 100%)'
            }
        };
    }

    /**
     * Get background for location
     */
    getBackground(locationId) {
        const location = this.gameState.worldMap?.getLocation(locationId);
        if (!location) return this.getDefaultBackground();

        const timeOfDay = this.getTimeOfDay();
        const playerState = this.getPlayerState();

        // Get base background category
        let backgroundCategory = this.backgrounds[locationId];
        if (!backgroundCategory) {
            // Try to find by location type
            backgroundCategory = this.getBackgroundByType(location.type);
        }

        if (!backgroundCategory) {
            return this.getDefaultBackground();
        }

        // Select specific background based on context
        if (locationId === 'home') {
            return this.getHomeBackground(playerState.housingLevel);
        } else if (locationId === 'coffee_shop') {
            return backgroundCategory[timeOfDay] || backgroundCategory.morning;
        } else if (locationId === 'office') {
            return this.getOfficeBackground(playerState.officeLevel);
        } else if (locationId === 'downtown') {
            const weather = this.getWeather();
            return backgroundCategory[weather] || backgroundCategory[timeOfDay] || backgroundCategory.day;
        } else {
            return backgroundCategory[timeOfDay] || backgroundCategory.default || Object.values(backgroundCategory)[0];
        }
    }

    /**
     * Background for a location with the WorldMap's own image layered on top
     * of the gradient, which still shows if the image is missing (#2470)
     */
    getLayeredBackground(locationId) {
        const gradient = this.getBackground(locationId);
        const image = this.gameState.worldMap?.getLocation?.(locationId)?.background;
        const match = typeof image === 'string' ? image.match(/url\(["']?([^"')]+)["']?\)/) : null;
        if (!match || isAssetMissing(match[1])) return gradient;
        return `${image}, ${gradient}`;
    }

    /**
     * Paint a (possibly layered) background-image value onto an element
     */
    static paint(element, value) {
        if (!element || !value) return;
        element.style.background = '';
        element.style.backgroundImage = value;
        element.style.backgroundSize = 'cover';
        element.style.backgroundPosition = 'center';
        element.style.backgroundRepeat = 'no-repeat';
    }

    /**
     * Get home background based on housing level
     */
    getHomeBackground(housingLevel) {
        const backgrounds = this.backgrounds.home;
        switch(housingLevel) {
            case 'mansion': return backgrounds.mansion;
            case 'house': return backgrounds.house;
            case 'condo': return backgrounds.condo;
            default: return backgrounds.apartment;
        }
    }

    /**
     * Get office background based on office level
     */
    getOfficeBackground(officeLevel) {
        const backgrounds = this.backgrounds.office;
        switch(officeLevel) {
            case 'executive': return backgrounds.executive;
            case 'large': return backgrounds.large;
            case 'medium': return backgrounds.medium;
            default: return backgrounds.small;
        }
    }

    /**
     * Get background by location type
     */
    getBackgroundByType(type) {
        const typeMap = {
            'residence': this.backgrounds.home,
            'work': this.backgrounds.office,
            'social': this.backgrounds.coffee_shop,
            'education': this.backgrounds.library,
            'training': this.backgrounds.gym,
            'shop': this.backgrounds.shop,
            'finance': this.backgrounds.finance,
            'government': this.backgrounds.government,
            'shopping': this.backgrounds.shopping,
            'business': this.backgrounds.downtown,
            'elite': this.backgrounds.luxury_district,
            'investment': this.backgrounds.investment
        };
        return typeMap[type];
    }

    /**
     * Get time of day
     */
    getTimeOfDay() {
        // TimeManager tracks 3-hour slots (0-5 = 6:00 ... 21:00), not hours (#215, #1285)
        const slot = Number(this.gameState.timeManager?.timeSlot);
        if (!Number.isFinite(slot)) return 'afternoon';
        if (slot <= 1) return 'morning';     // 6:00 - 12:00
        if (slot <= 3) return 'afternoon';   // 12:00 - 18:00
        if (slot === 4) return 'evening';    // 18:00 - 21:00
        return 'night';                      // 21:00 - 00:00
    }

    /**
     * Get weather (simplified)
     */
    getWeather() {
        // The game's real weather (EnvironmentManager rolls it each morning),
        // not a coin flip on every render (#971)
        const env = this.gameState.mainGame?.environmentManager
            || (typeof window !== 'undefined' ? window.game?.environmentManager : null);
        const id = env?.currentWeather?.id;
        return id === 'rainy' || id === 'stormy' ? 'rain' : 'clear';
    }

    /**
     * Get player state for context
     */
    getPlayerState() {
        return {
            housingLevel: this.gameState.housingLevel || 'apartment',
            officeLevel: this.gameState.officeLevel || 'small',
            money: this.gameState.money || 0
        };
    }

    /**
     * Get default background
     */
    getDefaultBackground() {
        return 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)';
    }

    /**
     * Apply background to screen
     */
    applyBackground(locationId, element) {
        const background = this.getLayeredBackground(locationId);
        LocationBackgroundSystem.paint(element, background);
        return background;
    }
}




