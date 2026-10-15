/**
 * LocationView was imported but only constructed inside a comment, and that
 * call passed AnimatedCharacterRenderer where the animation system belongs (#2201).
 */
import { describe, it, expect, vi } from 'vitest';
import fs from 'fs';
import path from 'path';
import { UIUpdater } from '../../src/js/ui/UIUpdater.js';

describe('LocationView is constructed (#2201)', () => {
    it('main.js builds it with the asset manager and ThreeCharacterRenderer, not a comment', () => {
        const src = fs.readFileSync(path.resolve(__dirname, '../../src/js/main.js'), 'utf8');
        const live = src.replace(/\/\*[\s\S]*?\*\//g, '');
        expect(live).toMatch(/this\.threeRenderer\s*=\s*new ThreeCharacterRenderer\(\)/);
        expect(live).toMatch(
            /this\.locationView\s*=\s*new LocationView\(\s*this\s*,\s*this\.assetManager\s*,\s*null\s*,\s*this\.threeRenderer\s*\)/
        );
        expect(live).toMatch(/this\.gameState\.locationView\s*=\s*this\.locationView/);
        expect(live).not.toMatch(/new LocationView\([\s\S]*?this\.characterRenderer/);
        expect(live).not.toMatch(/new CharacterAnimationSystem\(/);
        expect(live).not.toMatch(/new AnimatedCharacterRenderer\(/);
    });

    it('arriving at a location shows that interior', () => {
        document.body.innerHTML = '<span id="current-office-name"></span>';
        const ui = new UIUpdater({ gameState: { officeIndex: 0 } });
        ui.updateOfficeEquipment = () => {};
        ui.game.worldMap = {
            getLocation: () => ({ id: 'home', type: 'home', name: 'Home', activities: [] })
        };
        ui.game.locationView = { showLocation: vi.fn() };
        ui.updateLocationLayout('home');
        expect(ui.game.locationView.showLocation).toHaveBeenCalledWith('home');
    });
});
