import { describe, it, expect } from 'vitest';
import { MenuThemeSystem } from '../../src/js/game/MenuThemeSystem.js';

describe('MenuThemeSystem', () => {
    describe('initializeThemes', () => {
        it('should return an object with all theme definitions', () => {
            const system = new MenuThemeSystem();
            const themes = system.initializeThemes();

            expect(themes).toBeDefined();
            expect(typeof themes).toBe('object');
            expect(themes).not.toBeNull();
        });

        it('should include the starter theme', () => {
            const system = new MenuThemeSystem();
            const themes = system.initializeThemes();

            expect(themes.starter).toBeDefined();
            expect(themes.starter.id).toBe('starter');
            expect(themes.starter.name).toBe('Starter');
            expect(themes.starter.unlocked).toBe(true);
        });

        it('should include the corporate theme', () => {
            const system = new MenuThemeSystem();
            const themes = system.initializeThemes();

            expect(themes.corporate).toBeDefined();
            expect(themes.corporate.id).toBe('corporate');
            expect(themes.corporate.name).toBe('Corporate');
            expect(themes.corporate.unlocked).toBe(false);
        });

        it('should include the executive theme', () => {
            const system = new MenuThemeSystem();
            const themes = system.initializeThemes();

            expect(themes.executive).toBeDefined();
            expect(themes.executive.id).toBe('executive');
            expect(themes.executive.name).toBe('Executive');
            expect(themes.executive.unlocked).toBe(false);
        });

        it('should include the dataViz theme', () => {
            const system = new MenuThemeSystem();
            const themes = system.initializeThemes();

            expect(themes.dataViz).toBeDefined();
            expect(themes.dataViz.id).toBe('dataViz');
            expect(themes.dataViz.name).toBe('Data Visualization');
            expect(themes.dataViz.unlocked).toBe(false);
        });

        it('should include the minimalist theme', () => {
            const system = new MenuThemeSystem();
            const themes = system.initializeThemes();

            expect(themes.minimalist).toBeDefined();
            expect(themes.minimalist.id).toBe('minimalist');
            expect(themes.minimalist.name).toBe('Minimalist');
            expect(themes.minimalist.unlocked).toBe(false);
        });

        it('should include all required properties for each theme', () => {
            const system = new MenuThemeSystem();
            const themes = system.initializeThemes();

            const requiredProperties = ['id', 'name', 'unlocked', 'particleColors', 'gradient', 'pattern', 'background'];

            Object.values(themes).forEach(theme => {
                requiredProperties.forEach(prop => {
                    expect(theme).toHaveProperty(prop);
                });
            });
        });
    });
});
