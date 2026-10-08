/**
 * PerformanceManager.js
 * Quality settings and performance optimization
 * Monitors FPS and adjusts quality automatically
 */

export class PerformanceManager {
    static WARNING_INTERVAL_MS = 60000;

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
        this.level = null; // effective level; 'auto' resolves to one of the presets
        this.lastWarningAt = 0;
        this._visibilityHandler = null;
        this._resumeOnVisible = false;

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
     * Rate a WebGL renderer string. Apple Silicon is a strong GPU, mobile GPUs
     * are mid-range, and anything unrecognised is 'low' (#1444)
     */
    static classifyRenderer(renderer) {
        const r = String(renderer || '');
        if (/Adreno|Mali|PowerVR|Apple A\d/i.test(r)) return 'medium'; // phones/tablets
        if (/NVIDIA|GeForce|Quadro|AMD|Radeon|Intel.*Iris|Apple/i.test(r)) return 'high'; // incl. Apple M-series / "Apple GPU"
        if (/Intel/i.test(r)) return 'medium';
        return 'low';
    }

    /**
     * Combine the GPU rating with CPU/RAM. Plenty of cores or memory can lift a
     * tier by one step at most; it can't turn a weak GPU into 'high' (#1448, #2091)
     */
    static combineTier(gpuTier, cores, memory) {
        const order = ['low', 'medium', 'high'];
        let idx = Math.max(0, order.indexOf(gpuTier));
        const strongHost = (cores >= 8) || (memory >= 8);
        if (strongHost && idx < order.length - 1) idx += 1;
        // Very little memory holds a machine back
        if (memory && memory < 4 && idx > 0) idx -= 1;
        return order[idx];
    }

    /**
     * Detect hardware capabilities
     */
    detectHardware() {
        let gpuTier = 'low';
        try {
            const canvas = document.createElement('canvas');
            const gl = canvas.getContext('webgl') || canvas.getContext('experimental-webgl');
            if (gl) {
                const debugInfo = gl.getExtension('WEBGL_debug_renderer_info');
                // WebGL without the renderer string: assume a mid-range GPU
                gpuTier = debugInfo
                    ? PerformanceManager.classifyRenderer(gl.getParameter(debugInfo.UNMASKED_RENDERER_WEBGL))
                    : 'medium';
            }
        } catch (_) {
            gpuTier = 'low';
        }

        const nav = typeof navigator !== 'undefined' ? navigator : {};
        const tier = PerformanceManager.combineTier(gpuTier, nav.hardwareConcurrency || 2, nav.deviceMemory || 0);
        this.hardwareTier = tier;

        // In auto mode pick the starting level but stay in auto mode, so the
        // FPS monitor can keep adjusting it (#2090)
        if (this.quality === 'auto') {
            this.applyLevel(tier);
        }

        return tier;
    }

    /**
     * Set the player's quality setting: 'auto' or a fixed level
     */
    setQuality(level) {
        if (!this.presets[level] && level !== 'auto') {
            console.warn(`Unknown quality level: ${level}`);
            return;
        }

        this.quality = level;
        const effective = level === 'auto'
            ? (this.presets[this.hardwareTier] ? this.hardwareTier : (this.level || 'medium'))
            : level;
        this.applyLevel(effective);
    }

    /**
     * Switch the effective level without touching the player's setting
     */
    applyLevel(level) {
        const preset = this.presets[level];
        if (!preset) return;
        this.level = level;
        this.applyPreset(preset, level);

        // Emit quality change event (main.js listens and reflects it)
        if (typeof window !== 'undefined') {
            window.dispatchEvent(new CustomEvent('qualityChanged', {
                detail: { quality: level, setting: this.quality, preset }
            }));
        }
    }

    /**
     * The level actually in use (resolves 'auto')
     */
    getEffectiveLevel() {
        return this.level || (this.quality === 'auto' ? null : this.quality);
    }

    /**
     * Apply quality preset. Besides the frame-rate target this tags the
     * document so CSS can cut animations on low quality (#1443)
     */
    applyPreset(preset, level = null) {
        // Update frame rate limit
        this.targetFPS = preset.frameRateLimit;
        const root = typeof document !== 'undefined' ? document.documentElement : null;
        if (root) {
            if (level) root.dataset.quality = level;
            root.classList.toggle('quality-no-animations', preset.animations === false);
        }
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
        this.attachVisibilityHandling();

        this.monitor();
    }

    /**
     * Pause the monitor loop while the tab is hidden and resume it when the
     * player comes back, so it doesn't spin forever in the background (#1447)
     */
    attachVisibilityHandling() {
        if (this._visibilityHandler || typeof document === 'undefined') return;
        this._visibilityHandler = () => {
            if (document.hidden) {
                this._resumeOnVisible = this.monitoring;
                this.stopMonitoring();
            } else if (this._resumeOnVisible) {
                this._resumeOnVisible = false;
                this.startMonitoring();
            }
        };
        document.addEventListener('visibilitychange', this._visibilityHandler);
    }

    /**
     * Stop monitoring for good and drop listeners
     */
    destroy() {
        this.stopMonitoring();
        if (this._visibilityHandler && typeof document !== 'undefined') {
            document.removeEventListener('visibilitychange', this._visibilityHandler);
        }
        this._visibilityHandler = null;
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
            this.recordSample(Math.round((this.frameCount * 1000) / deltaTime), deltaTime / this.frameCount, Date.now());
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
     * Record one per-second FPS sample and react to it
     */
    recordSample(fps, frameTime = 1000 / Math.max(1, fps), now = Date.now()) {
        this.fps = fps;
        this.frameTime = frameTime;

        this.fpsHistory.push(this.fps);
        if (this.fpsHistory.length > 60) {
            this.fpsHistory.shift(); // Keep last 60 seconds
        }

        if (this.quality === 'auto') {
            // autoOptimize decides both downgrades and upgrades, so it runs
            // every sample, not only when FPS is below target
            this.autoOptimize();
        } else {
            // A fixed setting that the machine can't handle: tell the player
            // (at most once a minute) instead of overriding them (#1445)
            const warning = this.showPerformanceWarning();
            if (warning && now - (this.lastWarningAt || 0) >= PerformanceManager.WARNING_INTERVAL_MS) {
                this.lastWarningAt = now;
                if (typeof window !== 'undefined') {
                    window.dispatchEvent(new CustomEvent('performanceWarning', { detail: warning }));
                }
            }
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
     * Auto-optimize based on performance. Only acts in auto mode, and only
     * changes the effective level, so it keeps working after the first
     * adjustment (#60, #2090)
     */
    autoOptimize() {
        if (this.quality !== 'auto') return;
        const avgFPS = this.getAverageFPS();
        const level = this.level || 'medium';

        if (avgFPS < 30 && level !== 'low') {
            this.applyLevel('low');
        } else if (avgFPS < 45 && (level === 'high' || level === 'ultra')) {
            this.applyLevel('medium');
        } else if (avgFPS >= 55 && level === 'low') {
            this.applyLevel('medium');
        }
    }

    /**
     * Get performance stats
     */
    getStats() {
        return {
            quality: this.quality,
            level: this.getEffectiveLevel(),
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

