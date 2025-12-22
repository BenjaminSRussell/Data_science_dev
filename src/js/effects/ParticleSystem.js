/**
 * ParticleSystem.js
 * Canvas-based particle system for visual effects
 * Based on industry best practices and MDN tutorials
 */

export class ParticleSystem {
    constructor(canvas, options = {}) {
        this.canvas = canvas;
        this.ctx = canvas.getContext('2d');
        this.particles = [];
        this.isRunning = false;
        this.animationId = null;
        
        // Configuration
        this.config = {
            maxParticles: options.maxParticles || 1000,
            gravity: options.gravity || 0.1,
            wind: options.wind || 0,
            friction: options.friction || 0.98,
            ...options
        };
        
        // Performance tracking
        this.lastFrameTime = performance.now();
        this.frameCount = 0;
        this.fps = 60;
    }

    /**
     * Create a new particle
     */
    createParticle(x, y, options = {}) {
        if (this.particles.length >= this.config.maxParticles) {
            // Remove oldest particle
            this.particles.shift();
        }

        const particle = {
            x: x,
            y: y,
            vx: options.vx || (Math.random() - 0.5) * 4,
            vy: options.vy || (Math.random() - 0.5) * 4,
            life: options.life !== undefined ? options.life : 1.0,
            decay: options.decay || Math.random() * 0.02 + 0.01,
            size: options.size || Math.random() * 5 + 2,
            color: options.color || this.getRandomColor(),
            shape: options.shape || 'circle', // 'circle', 'square', 'star'
            rotation: options.rotation || 0,
            rotationSpeed: options.rotationSpeed || (Math.random() - 0.5) * 0.1,
            ...options
        };

        this.particles.push(particle);
        return particle;
    }

    /**
     * Emit particles from a point
     */
    emit(x, y, count = 50, options = {}) {
        for (let i = 0; i < count; i++) {
            const angle = options.angle !== undefined 
                ? options.angle + (Math.random() - 0.5) * (options.spread || Math.PI * 2)
                : Math.random() * Math.PI * 2;
            
            const speed = options.speed || (Math.random() * 3 + 1);
            
            this.createParticle(x, y, {
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                ...options
            });
        }
    }

    /**
     * Update all particles
     */
    update() {
        const now = performance.now();
        const deltaTime = (now - this.lastFrameTime) / 1000; // Convert to seconds
        this.lastFrameTime = now;

        // Update FPS
        this.frameCount++;
        if (this.frameCount % 60 === 0) {
            this.fps = Math.round(1 / deltaTime);
        }

        for (let i = this.particles.length - 1; i >= 0; i--) {
            const p = this.particles[i];
            
            // Apply physics
            p.vy += this.config.gravity * deltaTime * 60; // Scale by 60 for consistent behavior
            p.vx += this.config.wind * deltaTime * 60;
            
            // Apply friction
            p.vx *= this.config.friction;
            p.vy *= this.config.friction;
            
            // Update position
            p.x += p.vx * deltaTime * 60;
            p.y += p.vy * deltaTime * 60;
            
            // Update rotation
            if (p.rotationSpeed) {
                p.rotation += p.rotationSpeed * deltaTime * 60;
            }
            
            // Update life
            p.life -= p.decay * deltaTime * 60;
            
            // Remove dead particles
            if (p.life <= 0 || p.x < -100 || p.x > this.canvas.width + 100 || 
                p.y < -100 || p.y > this.canvas.height + 100) {
                this.particles.splice(i, 1);
            }
        }
    }

    /**
     * Draw all particles
     */
    draw() {
        // Clear canvas
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // Draw particles
        this.particles.forEach(p => {
            this.ctx.save();
            
            // Set opacity based on life
            this.ctx.globalAlpha = Math.max(0, Math.min(1, p.life));
            
            // Set color
            this.ctx.fillStyle = p.color;
            this.ctx.strokeStyle = p.color;
            
            // Move to particle position
            this.ctx.translate(p.x, p.y);
            
            // Rotate if needed
            if (p.rotation) {
                this.ctx.rotate(p.rotation);
            }
            
            // Draw shape
            this.drawParticleShape(p);
            
            this.ctx.restore();
        });
    }

    /**
     * Draw particle based on shape
     */
    drawParticleShape(particle) {
        const size = particle.size;
        
        switch (particle.shape) {
            case 'square':
                this.ctx.fillRect(-size / 2, -size / 2, size, size);
                break;
            case 'star':
                this.drawStar(0, 0, size / 2, size, 5);
                break;
            case 'circle':
            default:
                this.ctx.beginPath();
                this.ctx.arc(0, 0, size, 0, Math.PI * 2);
                this.ctx.fill();
                break;
        }
    }

    /**
     * Draw a star shape
     */
    drawStar(x, y, innerRadius, outerRadius, points) {
        this.ctx.beginPath();
        for (let i = 0; i < points * 2; i++) {
            const radius = i % 2 === 0 ? outerRadius : innerRadius;
            const angle = (i * Math.PI) / points;
            const px = x + Math.cos(angle) * radius;
            const py = y + Math.sin(angle) * radius;
            
            if (i === 0) {
                this.ctx.moveTo(px, py);
            } else {
                this.ctx.lineTo(px, py);
            }
        }
        this.ctx.closePath();
        this.ctx.fill();
    }

    /**
     * Get random color
     */
    getRandomColor() {
        const hues = [
            { h: 0, s: 100, l: 50 },    // Red
            { h: 30, s: 100, l: 50 },   // Orange
            { h: 60, s: 100, l: 50 },   // Yellow
            { h: 120, s: 100, l: 50 },  // Green
            { h: 240, s: 100, l: 50 },  // Blue
            { h: 270, s: 100, l: 50 }   // Purple
        ];
        const color = hues[Math.floor(Math.random() * hues.length)];
        return `hsl(${color.h}, ${color.s}%, ${color.l}%)`;
    }

    /**
     * Start animation loop
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastFrameTime = performance.now();
        this.animate();
    }

    /**
     * Stop animation loop
     */
    stop() {
        this.isRunning = false;
        if (this.animationId) {
            cancelAnimationFrame(this.animationId);
            this.animationId = null;
        }
    }

    /**
     * Animation loop
     */
    animate() {
        if (!this.isRunning) return;
        
        this.update();
        this.draw();
        
        this.animationId = requestAnimationFrame(() => this.animate());
    }

    /**
     * Clear all particles
     */
    clear() {
        this.particles = [];
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    /**
     * Get particle count
     */
    getParticleCount() {
        return this.particles.length;
    }

    /**
     * Get FPS
     */
    getFPS() {
        return this.fps;
    }

    /**
     * Set configuration
     */
    setConfig(config) {
        this.config = { ...this.config, ...config };
    }
}
