/**
 * VisualEffectsLibrary.js
 * Library of common visual effects
 * All effects can be used with the VisualSystem
 */

import { ParticleSystem } from './ParticleSystem.js';

export class VisualEffectsLibrary {
    /**
     * Create an explosion effect
     */
    static createExplosion(canvas, x, y, options = {}) {
        const particleSystem = new ParticleSystem(canvas, {
            maxParticles: options.maxParticles || 200,
            gravity: options.gravity || 0.2,
            friction: 0.95
        });

        const count = options.count || 100;
        const speed = options.speed || 5;
        const colors = options.colors || ['#ff6b6b', '#ffa500', '#ffff00', '#ff4500'];

        // Emit particles in all directions
        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const particleSpeed = speed * (0.5 + Math.random() * 0.5);
            const color = colors[Math.floor(Math.random() * colors.length)];

            particleSystem.createParticle(x, y, {
                vx: Math.cos(angle) * particleSpeed,
                vy: Math.sin(angle) * particleSpeed,
                life: 1.0,
                decay: Math.random() * 0.02 + 0.01,
                size: Math.random() * 4 + 2,
                color: color,
                shape: Math.random() > 0.7 ? 'star' : 'circle'
            });
        }

        return {
            particleSystem,
            duration: options.duration || 2000,
            startTime: Date.now(),
            update: function() {
                this.particleSystem.update();
                this.particleSystem.draw();
                return Date.now() - this.startTime < this.duration;
            },
            cleanup: function() {
                this.particleSystem.stop();
                this.particleSystem.clear();
            }
        };
    }

    /**
     * Create a fire effect
     */
    static createFire(canvas, x, y, width, height, options = {}) {
        const particleSystem = new ParticleSystem(canvas, {
            maxParticles: options.maxParticles || 100,
            gravity: -0.1, // Negative gravity for upward movement
            friction: 0.98
        });

        const emitInterval = options.emitInterval || 50;
        let lastEmit = Date.now();

        return {
            particleSystem,
            x, y, width, height,
            emitInterval,
            lastEmit,
            update: function() {
                const now = Date.now();
                
                // Emit new particles
                if (now - this.lastEmit >= this.emitInterval) {
                    const emitX = this.x + Math.random() * this.width;
                    const emitY = this.y + this.height;
                    
                    for (let i = 0; i < 3; i++) {
                        const life = Math.random() * 0.3 + 0.2;
                        const hue = 20 + Math.random() * 40; // Orange to red
                        const size = Math.random() * 8 + 4;
                        
                        particleSystem.createParticle(emitX, emitY, {
                            vx: (Math.random() - 0.5) * 1,
                            vy: -Math.random() * 3 - 1,
                            life: life,
                            decay: 0.01,
                            size: size,
                            color: `hsl(${hue}, 100%, 50%)`
                        });
                    }
                    
                    this.lastEmit = now;
                }
                
                // Update existing particles
                this.particleSystem.update();
                this.particleSystem.draw();
                
                return true; // Fire continues indefinitely
            },
            cleanup: function() {
                this.particleSystem.stop();
                this.particleSystem.clear();
            }
        };
    }

    /**
     * Create a rain effect
     */
    static createRain(canvas, options = {}) {
        const particleSystem = new ParticleSystem(canvas, {
            maxParticles: options.maxParticles || 500,
            gravity: options.gravity || 5
        });

        const dropCount = options.dropCount || 200;
        const color = options.color || 'rgba(174, 194, 224, 0.6)';

        // Create initial raindrops
        for (let i = 0; i < dropCount; i++) {
            particleSystem.createParticle(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                {
                    vx: 0,
                    vy: Math.random() * 3 + 2,
                    life: 1.0,
                    decay: 0,
                    size: Math.random() * 2 + 1,
                    color: color,
                    shape: 'square'
                }
            );
        }

        return {
            particleSystem,
            canvas,
            update: function() {
                // Reset particles that go off screen
                this.particleSystem.particles.forEach(p => {
                    if (p.y > this.canvas.height) {
                        p.y = -p.size;
                        p.x = Math.random() * this.canvas.width;
                    }
                });
                
                this.particleSystem.update();
                this.particleSystem.draw();
                return true;
            },
            cleanup: function() {
                this.particleSystem.stop();
                this.particleSystem.clear();
            }
        };
    }

    /**
     * Create a starfield effect
     */
    static createStarfield(canvas, options = {}) {
        const particleSystem = new ParticleSystem(canvas, {
            maxParticles: options.starCount || 200
        });

        const starCount = options.starCount || 200;
        const speed = options.speed || 0.5;

        // Create stars
        for (let i = 0; i < starCount; i++) {
            particleSystem.createParticle(
                Math.random() * canvas.width,
                Math.random() * canvas.height,
                {
                    vx: 0,
                    vy: speed,
                    life: 1.0,
                    decay: 0,
                    size: Math.random() * 2 + 0.5,
                    color: 'white',
                    shape: 'circle'
                }
            );
        }

        return {
            particleSystem,
            canvas,
            update: function() {
                // Reset stars that go off screen
                this.particleSystem.particles.forEach(p => {
                    if (p.y > this.canvas.height) {
                        p.y = 0;
                        p.x = Math.random() * this.canvas.width;
                    }
                });
                
                this.particleSystem.update();
                this.particleSystem.draw();
                return true;
            },
            cleanup: function() {
                this.particleSystem.stop();
                this.particleSystem.clear();
            }
        };
    }

    /**
     * Create a sparkle effect
     */
    static createSparkle(canvas, x, y, options = {}) {
        const particleSystem = new ParticleSystem(canvas, {
            maxParticles: options.maxParticles || 50
        });

        const count = options.count || 20;
        const colors = options.colors || ['#ffffff', '#ffff00', '#a78bfa'];

        for (let i = 0; i < count; i++) {
            const angle = (Math.PI * 2 * i) / count;
            const speed = Math.random() * 2 + 1;
            const color = colors[Math.floor(Math.random() * colors.length)];

            particleSystem.createParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                life: 1.0,
                decay: 0.02,
                size: Math.random() * 3 + 1,
                color: color,
                shape: 'star',
                rotationSpeed: (Math.random() - 0.5) * 0.2
            });
        }

        return {
            particleSystem,
            duration: options.duration || 1000,
            startTime: Date.now(),
            update: function() {
                this.particleSystem.update();
                this.particleSystem.draw();
                return Date.now() - this.startTime < this.duration;
            },
            cleanup: function() {
                this.particleSystem.stop();
                this.particleSystem.clear();
            }
        };
    }

    /**
     * Create a smoke effect
     */
    static createSmoke(canvas, x, y, options = {}) {
        const particleSystem = new ParticleSystem(canvas, {
            maxParticles: options.maxParticles || 100,
            gravity: -0.05,
            friction: 0.99
        });

        const emitInterval = options.emitInterval || 100;
        let lastEmit = Date.now();

        return {
            particleSystem,
            x, y,
            emitInterval,
            lastEmit,
            update: function() {
                const now = Date.now();
                
                // Emit new smoke particles
                if (now - this.lastEmit >= this.emitInterval) {
                    for (let i = 0; i < 2; i++) {
                        const life = Math.random() * 0.5 + 0.5;
                        const size = Math.random() * 15 + 10;
                        
                        particleSystem.createParticle(this.x, this.y, {
                            vx: (Math.random() - 0.5) * 0.5,
                            vy: -Math.random() * 1 - 0.5,
                            life: life,
                            decay: 0.005,
                            size: size,
                            color: `rgba(100, 100, 100, ${life})`
                        });
                    }
                    
                    this.lastEmit = now;
                }
                
                this.particleSystem.update();
                this.particleSystem.draw();
                return true;
            },
            cleanup: function() {
                this.particleSystem.stop();
                this.particleSystem.clear();
            }
        };
    }

    /**
     * Create a magic aura effect
     */
    static createMagicAura(canvas, x, y, options = {}) {
        const particleSystem = new ParticleSystem(canvas, {
            maxParticles: options.maxParticles || 150
        });

        const radius = options.radius || 50;
        const colors = options.colors || ['#9b59b6', '#3498db', '#e74c3c'];
        const particleCount = options.particleCount || 30;

        // Create particles in a circle
        for (let i = 0; i < particleCount; i++) {
            const angle = (Math.PI * 2 * i) / particleCount;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            const color = colors[Math.floor(Math.random() * colors.length)];

            particleSystem.createParticle(px, py, {
                vx: Math.cos(angle + Math.PI) * 0.5,
                vy: Math.sin(angle + Math.PI) * 0.5,
                life: 1.0,
                decay: 0.01,
                size: Math.random() * 3 + 2,
                color: color,
                shape: 'star',
                rotationSpeed: (Math.random() - 0.5) * 0.1
            });
        }

        return {
            particleSystem,
            duration: options.duration || 3000,
            startTime: Date.now(),
            update: function() {
                this.particleSystem.update();
                this.particleSystem.draw();
                return Date.now() - this.startTime < this.duration;
            },
            cleanup: function() {
                this.particleSystem.stop();
                this.particleSystem.clear();
            }
        };
    }
}
