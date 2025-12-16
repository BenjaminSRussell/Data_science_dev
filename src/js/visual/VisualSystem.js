/**
 * VisualSystem.js
 * Central manager for all visual effects and rendering
 * Coordinates all visual subsystems
 */

export class VisualSystem {
    constructor(gameState) {
        this.gameState = gameState;
        this.renderers = new Map();
        this.effects = [];
        this.quality = 'high'; // low, medium, high, ultra
        this.enabled = true;
        this.lastUpdate = 0;
    }

    /**
     * Register a renderer
     */
    registerRenderer(name, renderer) {
        this.renderers.set(name, renderer);
        if (renderer.setQuality) {
            renderer.setQuality(this.quality);
        }
    }

    /**
     * Get a registered renderer
     */
    getRenderer(name) {
        return this.renderers.get(name);
    }

    /**
     * Add a visual effect
     */
    addEffect(effect) {
        if (!this.enabled) return;
        
        effect.id = effect.id || `effect_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        effect.startTime = Date.now();
        effect.active = true;
        
        this.effects.push(effect);
        
        // Apply effect immediately if it has an apply method
        if (effect.apply) {
            effect.apply();
        }
        
        return effect.id;
    }

    /**
     * Remove an effect
     */
    removeEffect(effectId) {
        const index = this.effects.findIndex(e => e.id === effectId);
        if (index !== -1) {
            const effect = this.effects[index];
            if (effect.cleanup) {
                effect.cleanup();
            }
            this.effects.splice(index, 1);
        }
    }

    /**
     * Update all visuals
     */
    update(deltaTime) {
        if (!this.enabled) return;

        const currentTime = Date.now();
        const delta = deltaTime || (currentTime - this.lastUpdate);

        // Update all effects
        this.effects.forEach((effect, index) => {
            if (!effect.active) return;

            const elapsed = currentTime - effect.startTime;
            
            // Check if effect has expired
            if (effect.duration && elapsed >= effect.duration) {
                if (effect.cleanup) {
                    effect.cleanup();
                }
                this.effects.splice(index, 1);
                return;
            }

            // Update effect
            if (effect.update) {
                effect.update(elapsed, delta);
            }
        });

        // Update all renderers
        this.renderers.forEach(renderer => {
            if (renderer.update) {
                renderer.update(delta);
            }
        });

        this.lastUpdate = currentTime;
    }

    /**
     * Set quality level
     */
    setQuality(level) {
        this.quality = level;
        
        // Update all renderers
        this.renderers.forEach(renderer => {
            if (renderer.setQuality) {
                renderer.setQuality(level);
            }
        });

        // Emit quality change event
        window.dispatchEvent(new CustomEvent('qualityChanged', {
            detail: { quality: level }
        }));
    }

    /**
     * Get current quality level
     */
    getQuality() {
        return this.quality;
    }

    /**
     * Enable/disable visual system
     */
    setEnabled(enabled) {
        this.enabled = enabled;
    }

    /**
     * Clear all effects
     */
    clearEffects() {
        this.effects.forEach(effect => {
            if (effect.cleanup) {
                effect.cleanup();
            }
        });
        this.effects = [];
    }

    /**
     * Get performance stats
     */
    getStats() {
        return {
            activeEffects: this.effects.length,
            renderers: this.renderers.size,
            quality: this.quality,
            enabled: this.enabled
        };
    }
}




