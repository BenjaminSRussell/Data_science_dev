/**
 * VisualEffectsManager.js
 * Manager for all visual effects
 * Integrates with VisualSystem and provides easy-to-use API
 */

import { ParticleSystem } from './ParticleSystem.js';
import { VisualEffectsLibrary } from './VisualEffectsLibrary.js';

export class VisualEffectsManager {
    constructor(visualSystem) {
        this.visualSystem = visualSystem;
        this.activeEffects = new Map();
        this.canvasCache = new Map();
    }

    /**
     * Create a canvas for effects
     */
    createEffectCanvas(container, options = {}) {
        const canvas = document.createElement('canvas');
        canvas.width = options.width || container.clientWidth || 800;
        canvas.height = options.height || container.clientHeight || 600;
        canvas.style.cssText = `
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            pointer-events: none;
            z-index: ${options.zIndex || 1000};
        `;
        
        container.appendChild(canvas);
        return canvas;
    }

    /**
     * Create explosion effect
     */
    createExplosion(x, y, container, options = {}) {
        const canvas = this.createEffectCanvas(container, options);
        const effect = VisualEffectsLibrary.createExplosion(canvas, x, y, options);
        
        const effectId = this.visualSystem.addEffect({
            id: `explosion_${Date.now()}`,
            update: () => {
                const isActive = effect.update();
                if (!isActive) {
                    this.removeEffect(effect.id);
                }
                return isActive;
            },
            cleanup: () => {
                effect.cleanup();
                canvas.remove();
            },
            duration: effect.duration
        });
        
        this.activeEffects.set(effectId, { effect, canvas });
        return effectId;
    }

    /**
     * Create fire effect
     */
    createFire(x, y, width, height, container, options = {}) {
        const canvas = this.createEffectCanvas(container, options);
        const effect = VisualEffectsLibrary.createFire(canvas, x, y, width, height, options);
        
        const effectId = this.visualSystem.addEffect({
            id: `fire_${Date.now()}`,
            update: () => {
                effect.update();
                return true; // Fire continues until manually stopped
            },
            cleanup: () => {
                effect.cleanup();
                canvas.remove();
            }
        });
        
        this.activeEffects.set(effectId, { effect, canvas });
        return effectId;
    }

    /**
     * Create rain effect
     */
    createRain(container, options = {}) {
        const canvas = this.createEffectCanvas(container, options);
        const effect = VisualEffectsLibrary.createRain(canvas, options);
        
        const effectId = this.visualSystem.addEffect({
            id: `rain_${Date.now()}`,
            update: () => {
                effect.update();
                return true; // Rain continues until manually stopped
            },
            cleanup: () => {
                effect.cleanup();
                canvas.remove();
            }
        });
        
        this.activeEffects.set(effectId, { effect, canvas });
        return effectId;
    }

    /**
     * Create starfield effect
     */
    createStarfield(container, options = {}) {
        const canvas = this.createEffectCanvas(container, options);
        const effect = VisualEffectsLibrary.createStarfield(canvas, options);
        
        const effectId = this.visualSystem.addEffect({
            id: `starfield_${Date.now()}`,
            update: () => {
                effect.update();
                return true; // Starfield continues until manually stopped
            },
            cleanup: () => {
                effect.cleanup();
                canvas.remove();
            }
        });
        
        this.activeEffects.set(effectId, { effect, canvas });
        return effectId;
    }

    /**
     * Create sparkle effect
     */
    createSparkle(x, y, container, options = {}) {
        const canvas = this.createEffectCanvas(container, options);
        const effect = VisualEffectsLibrary.createSparkle(canvas, x, y, options);
        
        const effectId = this.visualSystem.addEffect({
            id: `sparkle_${Date.now()}`,
            update: () => {
                const isActive = effect.update();
                if (!isActive) {
                    this.removeEffect(effect.id);
                }
                return isActive;
            },
            cleanup: () => {
                effect.cleanup();
                canvas.remove();
            },
            duration: effect.duration
        });
        
        this.activeEffects.set(effectId, { effect, canvas });
        return effectId;
    }

    /**
     * Create smoke effect
     */
    createSmoke(x, y, container, options = {}) {
        const canvas = this.createEffectCanvas(container, options);
        const effect = VisualEffectsLibrary.createSmoke(canvas, x, y, options);
        
        const effectId = this.visualSystem.addEffect({
            id: `smoke_${Date.now()}`,
            update: () => {
                effect.update();
                return true; // Smoke continues until manually stopped
            },
            cleanup: () => {
                effect.cleanup();
                canvas.remove();
            }
        });
        
        this.activeEffects.set(effectId, { effect, canvas });
        return effectId;
    }

    /**
     * Create magic aura effect
     */
    createMagicAura(x, y, container, options = {}) {
        const canvas = this.createEffectCanvas(container, options);
        const effect = VisualEffectsLibrary.createMagicAura(canvas, x, y, options);
        
        const effectId = this.visualSystem.addEffect({
            id: `magic_${Date.now()}`,
            update: () => {
                const isActive = effect.update();
                if (!isActive) {
                    this.removeEffect(effect.id);
                }
                return isActive;
            },
            cleanup: () => {
                effect.cleanup();
                canvas.remove();
            },
            duration: effect.duration
        });
        
        this.activeEffects.set(effectId, { effect, canvas });
        return effectId;
    }

    /**
     * Remove an effect
     */
    removeEffect(effectId) {
        if (this.activeEffects.has(effectId)) {
            const { effect, canvas } = this.activeEffects.get(effectId);
            if (effect.cleanup) {
                effect.cleanup();
            }
            if (canvas && canvas.parentNode) {
                canvas.remove();
            }
            this.activeEffects.delete(effectId);
        }
        this.visualSystem.removeEffect(effectId);
    }

    /**
     * Clear all effects
     */
    clearAllEffects() {
        this.activeEffects.forEach(({ effect, canvas }, effectId) => {
            if (effect.cleanup) {
                effect.cleanup();
            }
            if (canvas && canvas.parentNode) {
                canvas.remove();
            }
        });
        this.activeEffects.clear();
        this.visualSystem.clearEffects();
    }

    /**
     * Get active effect count
     */
    getActiveEffectCount() {
        return this.activeEffects.size;
    }
}
