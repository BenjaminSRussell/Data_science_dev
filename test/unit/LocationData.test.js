/**
 * Unit tests for location data emoji restoration
 * Verifies that emoji fields in locations.js are properly populated
 */

import { describe, it, expect } from 'vitest';
import { OFFICE_LOCATIONS, WEATHER_EFFECTS } from '../../src/js/data/locations.js';

describe('Location Data - Emoji Fields', () => {
    describe('OFFICE_LOCATIONS ambiance icons', () => {
        it('should have non-empty ambiance emoji for all locations', () => {
            OFFICE_LOCATIONS.forEach((location) => {
                expect(location.ambiance, `Location ${location.id} should have an ambiance emoji`)
                    .not.toBe('');
                expect(location.ambiance, `Location ${location.id} ambiance should be a string`)
                    .toBeTypeOf('string');
                expect(location.ambiance.length, `Location ${location.id} ambiance should not be empty`)
                    .toBeGreaterThan(0);
            });
        });

        it('should have specific emoji for home_office location', () => {
            const homeOffice = OFFICE_LOCATIONS.find(l => l.id === 'home_office');
            expect(homeOffice.ambiance).toBe('🏠');
        });

        it('should have specific emoji for startup_office location', () => {
            const startup = OFFICE_LOCATIONS.find(l => l.id === 'startup_office');
            expect(startup.ambiance).toBe('🚀');
        });

        it('should have specific emoji for corporate_floor location', () => {
            const corporate = OFFICE_LOCATIONS.find(l => l.id === 'corporate_floor');
            expect(corporate.ambiance).toBe('🏢');
        });

        it('should have specific emoji for innovation_lab location', () => {
            const lab = OFFICE_LOCATIONS.find(l => l.id === 'innovation_lab');
            expect(lab.ambiance).toBe('🔬');
        });

        it('should have specific emoji for executive_suite location', () => {
            const executive = OFFICE_LOCATIONS.find(l => l.id === 'executive_suite');
            expect(executive.ambiance).toBe('👔');
        });

        it('should have specific emoji for donut_shop location', () => {
            const donutShop = OFFICE_LOCATIONS.find(l => l.id === 'donut_shop');
            expect(donutShop.ambiance).toBe('🍩');
        });

        it('should have specific emoji for bagel_shop location', () => {
            const bagelShop = OFFICE_LOCATIONS.find(l => l.id === 'bagel_shop');
            expect(bagelShop.ambiance).toBe('🥯');
        });

        it('should have specific emoji for flower_store location', () => {
            const flowerStore = OFFICE_LOCATIONS.find(l => l.id === 'flower_store');
            expect(flowerStore.ambiance).toBe('💐');
        });
    });

    describe('OFFICE_LOCATIONS elements', () => {
        it('should have non-empty elements array for all locations', () => {
            OFFICE_LOCATIONS.forEach((location) => {
                expect(Array.isArray(location.elements), `Location ${location.id} elements should be an array`)
                    .toBe(true);
                expect(location.elements.length, `Location ${location.id} should have 4 elements`)
                    .toBe(4);
            });
        });

        it('should have no empty strings in elements arrays', () => {
            OFFICE_LOCATIONS.forEach((location) => {
                location.elements.forEach((element, index) => {
                    expect(element, `Location ${location.id} element ${index} should not be empty`)
                        .not.toBe('');
                    expect(element.length, `Location ${location.id} element ${index} should have content`)
                        .toBeGreaterThan(0);
                });
            });
        });

        it('should have specific emojis for home_office elements', () => {
            const homeOffice = OFFICE_LOCATIONS.find(l => l.id === 'home_office');
            expect(homeOffice.elements).toEqual(['💻', '☕', '📚', '🪴']);
        });

        it('should have specific emojis for startup_office elements', () => {
            const startup = OFFICE_LOCATIONS.find(l => l.id === 'startup_office');
            expect(startup.elements).toEqual(['💡', '🎯', '📊', '🍕']);
        });

        it('should have specific emojis for corporate_floor elements', () => {
            const corporate = OFFICE_LOCATIONS.find(l => l.id === 'corporate_floor');
            expect(corporate.elements).toEqual(['🖥️', '📈', '☕', '🏆']);
        });

        it('should have specific emojis for innovation_lab elements', () => {
            const lab = OFFICE_LOCATIONS.find(l => l.id === 'innovation_lab');
            expect(lab.elements).toEqual(['🧪', '🔮', '💎', '⚡']);
        });

        it('should have specific emojis for executive_suite elements', () => {
            const executive = OFFICE_LOCATIONS.find(l => l.id === 'executive_suite');
            expect(executive.elements).toEqual(['🌆', '🥂', '🏅', '💼']);
        });

        it('should have specific emojis for donut_shop elements', () => {
            const donutShop = OFFICE_LOCATIONS.find(l => l.id === 'donut_shop');
            expect(donutShop.elements).toEqual(['🍩', '☕', '🍰', '🥛']);
        });

        it('should have specific emojis for bagel_shop elements', () => {
            const bagelShop = OFFICE_LOCATIONS.find(l => l.id === 'bagel_shop');
            expect(bagelShop.elements).toEqual(['🥯', '☕', '🥪', '🧀']);
        });

        it('should have specific emojis for flower_store elements', () => {
            const flowerStore = OFFICE_LOCATIONS.find(l => l.id === 'flower_store');
            expect(flowerStore.elements).toEqual(['🌻', '🌹', '🌷', '🪴']);
        });
    });

    describe('WEATHER_EFFECTS icons', () => {
        it('should have non-empty icon emoji for all weather effects', () => {
            WEATHER_EFFECTS.forEach((weather) => {
                expect(weather.icon, `Weather effect ${weather.id} should have an icon emoji`)
                    .not.toBe('');
                expect(weather.icon, `Weather effect ${weather.id} icon should be a string`)
                    .toBeTypeOf('string');
                expect(weather.icon.length, `Weather effect ${weather.id} icon should not be empty`)
                    .toBeGreaterThan(0);
            });
        });

        it('should have specific emoji for clear weather', () => {
            const clear = WEATHER_EFFECTS.find(w => w.id === 'clear');
            expect(clear.icon).toBe('☀️');
        });

        it('should have specific emoji for cloudy weather', () => {
            const cloudy = WEATHER_EFFECTS.find(w => w.id === 'cloudy');
            expect(cloudy.icon).toBe('☁️');
        });

        it('should have specific emoji for rainy weather', () => {
            const rainy = WEATHER_EFFECTS.find(w => w.id === 'rainy');
            expect(rainy.icon).toBe('🌧️');
        });

        it('should have specific emoji for snowy weather', () => {
            const snowy = WEATHER_EFFECTS.find(w => w.id === 'snowy');
            expect(snowy.icon).toBe('❄️');
        });
    });
});
