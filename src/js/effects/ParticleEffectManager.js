/**
 * ParticleEffectManager.js
 * Manages particle effects using @pixi/particle-emitter
 * Priority 2: Visual Enhancement
 */

export class ParticleEffectManager {
    constructor(pixiApp) {
        this.app = pixiApp;
        this.emitters = new Map();
        this.initialized = false;
    }

    /**
     * Initialize particle system
     */
    async initialize() {
        if (this.initialized) return;

        try {
            // Lazy load particle emitter
            const { Emitter } = await import('@pixi/particle-emitter');
            this.Emitter = Emitter;
            this.initialized = true;
            return true;
        } catch (error) {
            console.warn('Particle emitter not available:', error);
            return false;
        }
    }

    /**
     * Create water ripple effect
     */
    createWaterRipple(x, y, container = null) {
        if (!this.initialized || !this.Emitter) return null;

        const targetContainer = container || this.app.stage;
        
        const config = {
            lifetime: { min: 0.5, max: 1.0 },
            frequency: 0.1,
            emitterLifetime: 0.3,
            maxParticles: 20,
            pos: { x, y },
            behaviors: [
                {
                    type: 'alpha',
                    config: {
                        alpha: {
                            list: [
                                { time: 0, value: 0.8 },
                                { time: 1, value: 0 }
                            ]
                        }
                    }
                },
                {
                    type: 'scale',
                    config: {
                        scale: {
                            list: [
                                { time: 0, value: 0.1 },
                                { time: 1, value: 1.0 }
                            ]
                        }
                    }
                },
                {
                    type: 'moveSpeed',
                    config: {
                        speed: {
                            list: [
                                { time: 0, value: 50 },
                                { time: 1, value: 10 }
                            ]
                        }
                    }
                },
                {
                    type: 'color',
                    config: {
                        color: {
                            list: [
                                { time: 0, value: '0x4fc3f7' },
                                { time: 1, value: '0x0277bd' }
                            ]
                        }
                    }
                }
            ]
        };

        try {
            const emitter = new this.Emitter(targetContainer, config);
            emitter.autoUpdate = true;
            emitter.emit = true;
            
            // Auto-cleanup after duration
            setTimeout(() => {
                emitter.destroy();
            }, 2000);

            return emitter;
        } catch (error) {
            console.warn('Failed to create water ripple:', error);
            return null;
        }
    }

    /**
     * Create magic sparkle effect
     */
    createMagicSparkle(x, y, container = null) {
        if (!this.initialized || !this.Emitter) return null;

        const targetContainer = container || this.app.stage;
        
        const config = {
            lifetime: { min: 0.3, max: 0.8 },
            frequency: 0.05,
            emitterLifetime: 0.2,
            maxParticles: 30,
            pos: { x, y },
            behaviors: [
                {
                    type: 'alpha',
                    config: {
                        alpha: {
                            list: [
                                { time: 0, value: 1.0 },
                                { time: 1, value: 0 }
                            ]
                        }
                    }
                },
                {
                    type: 'scale',
                    config: {
                        scale: {
                            list: [
                                { time: 0, value: 0.2 },
                                { time: 0.5, value: 0.8 },
                                { time: 1, value: 0.2 }
                            ]
                        }
                    }
                },
                {
                    type: 'moveSpeed',
                    config: {
                        speed: {
                            list: [
                                { time: 0, value: 100 },
                                { time: 1, value: 20 }
                            ]
                        },
                        minMult: 0.5
                    }
                },
                {
                    type: 'color',
                    config: {
                        color: {
                            list: [
                                { time: 0, value: '0xf472b6' },
                                { time: 0.5, value: '0x8b5cf6' },
                                { time: 1, value: '0xa78bfa' }
                            ]
                        }
                    }
                }
            ]
        };

        try {
            const emitter = new this.Emitter(targetContainer, config);
            emitter.autoUpdate = true;
            emitter.emit = true;
            
            setTimeout(() => {
                emitter.destroy();
            }, 1500);

            return emitter;
        } catch (error) {
            console.warn('Failed to create magic sparkle:', error);
            return null;
        }
    }

    /**
     * Create success celebration effect
     */
    createSuccessEffect(x, y, container = null) {
        if (!this.initialized || !this.Emitter) return null;

        const targetContainer = container || this.app.stage;
        
        const config = {
            lifetime: { min: 0.5, max: 1.5 },
            frequency: 0.02,
            emitterLifetime: 0.5,
            maxParticles: 50,
            pos: { x, y },
            behaviors: [
                {
                    type: 'alpha',
                    config: {
                        alpha: {
                            list: [
                                { time: 0, value: 1.0 },
                                { time: 1, value: 0 }
                            ]
                        }
                    }
                },
                {
                    type: 'scale',
                    config: {
                        scale: {
                            list: [
                                { time: 0, value: 0.3 },
                                { time: 0.5, value: 1.0 },
                                { time: 1, value: 0.5 }
                            ]
                        }
                    }
                },
                {
                    type: 'moveSpeed',
                    config: {
                        speed: {
                            list: [
                                { time: 0, value: 150 },
                                { time: 1, value: 30 }
                            ]
                        },
                        minMult: 0.3
                    }
                },
                {
                    type: 'color',
                    config: {
                        color: {
                            list: [
                                { time: 0, value: '0x10b981' },
                                { time: 0.5, value: '0xfbbf24' },
                                { time: 1, value: '0x8b5cf6' }
                            ]
                        }
                    }
                }
            ]
        };

        try {
            const emitter = new this.Emitter(targetContainer, config);
            emitter.autoUpdate = true;
            emitter.emit = true;
            
            setTimeout(() => {
                emitter.destroy();
            }, 2000);

            return emitter;
        } catch (error) {
            console.warn('Failed to create success effect:', error);
            return null;
        }
    }

    /**
     * Update all emitters
     */
    update(delta) {
        if (!this.initialized) return;
        
        // Emitters auto-update, but we can add custom logic here
        this.emitters.forEach((emitter, id) => {
            if (emitter.destroyed) {
                this.emitters.delete(id);
            }
        });
    }

    /**
     * Create money particle effect
     */
    createMoneyEffect(x, y, amount, container = null) {
        if (!this.initialized || !this.Emitter) return null;

        const targetContainer = container || this.app.stage;
        
        const config = {
            lifetime: { min: 1.0, max: 2.0 },
            frequency: 0.05,
            emitterLifetime: 0.5,
            maxParticles: Math.min(50, Math.floor(amount / 100)),
            pos: { x, y },
            behaviors: [
                {
                    type: 'alpha',
                    config: {
                        alpha: {
                            list: [
                                { time: 0, value: 1.0 },
                                { time: 0.5, value: 1.0 },
                                { time: 1, value: 0 }
                            ]
                        }
                    }
                },
                {
                    type: 'scale',
                    config: {
                        scale: {
                            list: [
                                { time: 0, value: 0.3 },
                                { time: 0.3, value: 0.8 },
                                { time: 1, value: 0.5 }
                            ]
                        }
                    }
                },
                {
                    type: 'moveSpeed',
                    config: {
                        speed: {
                            list: [
                                { time: 0, value: 80 },
                                { time: 1, value: 20 }
                            ]
                        },
                        minMult: 0.5
                    }
                },
                {
                    type: 'color',
                    config: {
                        color: {
                            list: [
                                { time: 0, value: '0xfbbf24' },
                                { time: 0.5, value: '0xffd700' },
                                { time: 1, value: '0xf59e0b' }
                            ]
                        }
                    }
                },
                {
                    type: 'rotation',
                    config: {
                        minStart: 0,
                        maxStart: 360,
                        minSpeed: -180,
                        maxSpeed: 180
                    }
                }
            ]
        };

        try {
            const emitter = new this.Emitter(targetContainer, config);
            emitter.autoUpdate = true;
            emitter.emit = true;
            
            setTimeout(() => {
                emitter.destroy();
            }, 2500);

            return emitter;
        } catch (error) {
            console.warn('Failed to create money effect:', error);
            return null;
        }
    }

    /**
     * Create data flow particle effect
     */
    createDataFlowEffect(startX, startY, endX, endY, container = null) {
        if (!this.initialized || !this.Emitter) return null;

        const targetContainer = container || this.app.stage;
        
        const distance = Math.sqrt((endX - startX) ** 2 + (endY - startY) ** 2);
        const angle = Math.atan2(endY - startY, endX - startX);
        
        const config = {
            lifetime: { min: distance / 200, max: distance / 150 },
            frequency: 0.02,
            emitterLifetime: distance / 200,
            maxParticles: 30,
            pos: { x: startX, y: startY },
            behaviors: [
                {
                    type: 'alpha',
                    config: {
                        alpha: {
                            list: [
                                { time: 0, value: 0.8 },
                                { time: 0.5, value: 1.0 },
                                { time: 1, value: 0 }
                            ]
                        }
                    }
                },
                {
                    type: 'scale',
                    config: {
                        scale: {
                            list: [
                                { time: 0, value: 0.2 },
                                { time: 0.5, value: 0.6 },
                                { time: 1, value: 0.3 }
                            ]
                        }
                    }
                },
                {
                    type: 'moveSpeed',
                    config: {
                        speed: {
                            list: [
                                { time: 0, value: 200 },
                                { time: 1, value: 150 }
                            ]
                        },
                        accel: {
                            x: Math.cos(angle) * 50,
                            y: Math.sin(angle) * 50
                        }
                    }
                },
                {
                    type: 'color',
                    config: {
                        color: {
                            list: [
                                { time: 0, value: '0x8b5cf6' },
                                { time: 0.5, value: '0xa78bfa' },
                                { time: 1, value: '0xf472b6' }
                            ]
                        }
                    }
                }
            ]
        };

        try {
            const emitter = new this.Emitter(targetContainer, config);
            emitter.autoUpdate = true;
            emitter.emit = true;
            
            setTimeout(() => {
                emitter.destroy();
            }, (distance / 200) * 1000 + 500);

            return emitter;
        } catch (error) {
            console.warn('Failed to create data flow effect:', error);
            return null;
        }
    }

    /**
     * Cleanup all emitters
     */
    cleanup() {
        this.emitters.forEach(emitter => {
            if (!emitter.destroyed) {
                emitter.destroy();
            }
        });
        this.emitters.clear();
    }
}
