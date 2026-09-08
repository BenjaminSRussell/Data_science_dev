/**
 * PerformanceManager.js
 * Quality settings and performance optimization
 * Monitors FPS and adjusts quality automatically
 */

export class PerformanceManager {
    constructor() {
        this.quality = 'auto'; // auto, low, medium, high, ultra
        this.fps = 60;
        this.targetFPS = 60;
        this.frameTime = 16.67; // ms (60fps)
        this.monitoring = false;
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.fpsHistory = [];
        this.hardwareTier = 'unknown';

        // Quality presets
        this.presets = {
            low: {
                animations: false,
                particles: false,
                shadows: false,
                textures: 'low',
                resolution: 0.75,
                frameRateLimit: 30
            },
            medium: {
                animations: true,
                particles: 'low',
                shadows: 'basic',
                textures: 'medium',
                resolution: 1.0,
                frameRateLimit: 60
            },
            high: {
                animations: true,
                particles: 'medium',
                shadows: 'soft',
                textures: 'high',
                resolution: 1.0,
                frameRateLimit: 60
            },
            ultra: {
                animations: true,
                particles: 'high',
                shadows: 'advanced',
                textures: 'ultra',
                resolution: 1.5,
                frameRateLimit: 120
            }
        };
    }

    /**
     * Detect hardware capabilities
     */
    detectHardware() {
        const canvas = document.createElement('canvas');
        const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');

        let tier = 'low';

        if (gl) {
            const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
            if (debugInfo) {
                const renderer = gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL);

                // Detect GPU tier
                if (renderer.includes('NVIDIA') || renderer.includes('AMD') || renderer.includes('Intel Iris')) {
                    tier = 'high';
                } else if (renderer.includes('Intel')) {
                    tier = 'medium';
                } else {
                    tier = 'low';
                }
            }
        }

        // Check CPU cores
        const cores = navigator.hardwareConcurrency || 2;
        if (cores >= 8) {
            tier = tier === 'low' ? 'medium' : 'high';
        }

        // Check memory (if available)
        if (navigator.deviceMemory) {
            if (navigator.deviceMemory >= 8) {
                tier = 'high';
            } else if (navigator.deviceMemory >= 4) {
                tier = tier === 'low' ? 'medium' : tier;
            }
        }

        this.hardwareTier = tier;

        // Auto-set quality based on hardware
        if (this.quality === 'auto') {
            if (tier === 'high') {
                this.setQuality('high');
            } else if (tier === 'medium') {
                this.setQuality('medium');
            } else {
                this.setQuality('low');
            }
        }

        return tier;
    }

    /**
     * Set quality level
     */
    setQuality(level) {
        if (!this.presets[level] && level !== 'auto') {
            console.warn(`Unknown quality level: ${level}`);
            return;
        }

        this.quality = level;

        // Apply preset if not auto
        if (level !== 'auto') {
            const preset = this.presets[level];
            this.applyPreset(preset);
        }

        // Emit quality change event
        window.dispatchEvent(new CustomEvent('qualityChanged', {
            detail: { quality: level, preset: this.presets[level] }
        }));
    }

    /**
     * Apply quality preset
     */
    applyPreset(preset) {
        // Set CSS variables for quality
        const root = document.documentElement;
        root.style.setProperty('--quality-animations', preset.animations ? '1' : '0');
        root.style.setProperty('--quality-particles', preset.particles || 'none');
        root.style.setProperty('--quality-shadows', preset.shadows || 'none');
        root.style.setProperty('--quality-resolution', preset.resolution);

        // Update frame rate limit
        this.targetFPS = preset.frameRateLimit;
    }

    /**
     * Start FPS monitoring
     */
    startMonitoring() {
        if (this.monitoring) return;

        this.monitoring = true;
        this.frameCount = 0;
        this.lastFrameTime = performance.now();
        this.fpsHistory = [];

        this.monitor();
    }

    /**
     * Monitor FPS
     */
    monitor() {
        if (!this.monitoring) return;

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;

        this.frameCount++;

        // Calculate FPS every second
        if (deltaTime >= 1000) {
            this.fps = Math.round((this.frameCount * 1000) / deltaTime);
            this.frameTime = deltaTime / this.frameCount;

            this.fpsHistory.push(this.fps);
            if (this.fpsHistory.length > 60) {
                this.fpsHistory.shift(); // Keep last 60 seconds
            }

            // Auto-optimize if FPS is low
            if (this.quality === 'auto' && this.fps < this.targetFPS - 10) {
                this.autoOptimize();
            }

            this.frameCount = 0;
            this.lastFrameTime = currentTime;
        }

        // Use requestAnimationFrame if available, otherwise setTimeout
        if (typeof requestAnimationFrame !== 'undefined') {
            requestAnimationFrame(() => this.monitor());
        } else {
            setTimeout(() => this.monitor(), 16);
        }
    }

    /**
     * Stop monitoring
     */
    stopMonitoring() {
        this.monitoring = false;
    }

    /**
     * Get current FPS
     */
    getFPS() {
        return this.fps;
    }

    /**
     * Get average FPS
     */
    getAverageFPS() {
        if (this.fpsHistory.length === 0) return this.fps;
        const sum = this.fpsHistory.reduce((a, b) => a + b, 0);
        return Math.round(sum / this.fpsHistory.length);
    }

    /**
     * Auto-optimize based on performance
     */
    autoOptimize() {
        const avgFPS = this.getAverageFPS();

        if (avgFPS < 30 && this.quality !== 'low') {
            this.setQuality('low');
        } else if (avgFPS < 45 && this.quality === 'high') {
            this.setQuality('medium');
        } else if (avgFPS >= 55 && this.quality === 'low') {
            this.setQuality('medium');
        } else if (avgFPS >= 55 && this.quality === 'medium') {
            this.setQuality('high');
        } else if (avgFPS >= 55 && this.quality === 'high') {
            this.setQuality('ultra');
        }
    }

    /**
     * Get performance stats
     */
    getStats() {
        return {
            quality: this.quality,
            fps: this.fps,
            averageFPS: this.getAverageFPS(),
            frameTime: this.frameTime.toFixed(2),
            hardwareTier: this.hardwareTier,
            monitoring: this.monitoring
        };
    }

    /**
     * Show performance warning
     */
    showPerformanceWarning() {
        if (this.fps < 20) {
            return {
                level: 'critical',
                message: 'Performance is very low. Consider reducing quality settings.'
            };
        } else if (this.fps < 30) {
            return {
                level: 'warning',
                message: 'Performance is low. You may want to reduce quality settings.'
            };
        }
        return null;
    }
}

