/**
 * AnimationManager.js
 * Handles all animations and transitions
 * Provides smooth, performant animations throughout the game
 */

import { EasingFunctions } from './EasingFunctions.js';

export class AnimationManager {
    constructor() {
        this.animations = new Map();
        this.queue = [];
        this.isPlaying = false;
        this.paused = false;
        this.animationId = null;
        this.lastFrameTime = performance.now();
    }

    /**
     * Create and start an animation
     */
    animate(element, properties, options = {}) {
        const {
            duration = 300,
            easing = 'easeInOut',
            delay = 0,
            onComplete = null,
            onUpdate = null,
            onStart = null
        } = options;

        const animationId = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        const startTime = performance.now() + delay;
        const easingFn = EasingFunctions[easing] || EasingFunctions.easeInOut;

        // Store initial values
        const initialValues = {};
        Object.keys(properties).forEach(key => {
            if (key.startsWith('transform.')) {
                initialValues[key] = this.getTransformValue(element, key.replace('transform.', ''));
            } else {
                initialValues[key] = this.getStyleValue(element, key);
            }
        });

        const animation = {
            id: animationId,
            element,
            properties,
            initialValues,
            duration,
            easing: easingFn,
            startTime,
            delay,
            onComplete,
            onUpdate,
            onStart,
            started: false,
            completed: false
        };

        this.animations.set(animationId, animation);

        // Start animation loop if not already running
        if (!this.isPlaying && !this.paused) {
            this.start();
        }

        return animationId;
    }

    /**
     * Queue an animation (runs after previous completes)
     */
    queue(animationConfig) {
        this.queue.push(animationConfig);
    }

    /**
     * Play animation queue
     */
    playQueue() {
        if (this.queue.length === 0) return;
        if (this.animations.size > 0) return; // Wait for current animations

        const next = this.queue.shift();
        this.animate(next.element, next.properties, next.options);
    }

    /**
     * Start animation loop
     */
    start() {
        if (this.isPlaying) return;
        
        this.isPlaying = true;
        this.paused = false;
        this.animateFrame();
    }

    /**
     * Animation frame loop
     */
    animateFrame() {
        if (this.paused) {
            this.isPlaying = false;
            return;
        }

        const currentTime = performance.now();
        const deltaTime = currentTime - this.lastFrameTime;
        this.lastFrameTime = currentTime;

        // Update all animations
        this.animations.forEach((animation, id) => {
            this.updateAnimation(animation, currentTime);
        });

        // Check queue
        if (this.animations.size === 0 && this.queue.length > 0) {
            this.playQueue();
        }

        // Continue loop if there are active animations or queued animations
        if (this.animations.size > 0 || this.queue.length > 0) {
            this.animationId = requestAnimationFrame(() => this.animateFrame());
        } else {
            this.isPlaying = false;
        }
    }

    /**
     * Update a single animation
     */
    updateAnimation(animation, currentTime) {
        const { element, properties, initialValues, duration, easing, startTime, onStart, onUpdate, onComplete } = animation;

        // Check if animation should start
        if (currentTime < startTime) {
            return;
        }

        // Call onStart once
        if (!animation.started && onStart) {
            onStart();
            animation.started = true;
        }

        // Calculate progress (0 to 1)
        const elapsed = currentTime - startTime;
        const progress = Math.min(1, elapsed / duration);
        const easedProgress = easing(progress);

        // Apply properties
        Object.keys(properties).forEach(key => {
            const startValue = initialValues[key];
            const endValue = properties[key];
            const currentValue = this.interpolate(startValue, endValue, easedProgress);
            
            this.setStyleValue(element, key, currentValue);
        });

        // Call onUpdate
        if (onUpdate) {
            onUpdate(easedProgress, progress);
        }

        // Check if complete
        if (progress >= 1 && !animation.completed) {
            animation.completed = true;
            if (onComplete) {
                onComplete();
            }
            this.animations.delete(animation.id);
        }
    }

    /**
     * Interpolate between two values
     */
    interpolate(start, end, progress) {
        // Handle numbers
        if (typeof start === 'number' && typeof end === 'number') {
            return start + (end - start) * progress;
        }

        // Handle colors (hex)
        if (typeof start === 'string' && start.startsWith('#') && typeof end === 'string' && end.startsWith('#')) {
            return this.interpolateColor(start, end, progress);
        }

        // Handle transforms
        if (typeof start === 'string' && (start.includes('px') || start.includes('%') || start.includes('deg'))) {
            return this.interpolateUnit(start, end, progress);
        }

        // Default: use end value
        return end;
    }

    /**
     * Interpolate color
     */
    interpolateColor(start, end, progress) {
        const startRgb = this.hexToRgb(start);
        const endRgb = this.hexToRgb(end);
        
        const r = Math.round(startRgb.r + (endRgb.r - startRgb.r) * progress);
        const g = Math.round(startRgb.g + (endRgb.g - startRgb.g) * progress);
        const b = Math.round(startRgb.b + (endRgb.b - startRgb.b) * progress);
        
        return `rgb(${r}, ${g}, ${b})`;
    }

    /**
     * Hex to RGB
     */
    hexToRgb(hex) {
        const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
        return result ? {
            r: parseInt(result[1], 16),
            g: parseInt(result[2], 16),
            b: parseInt(result[3], 16)
        } : { r: 0, g: 0, b: 0 };
    }

    /**
     * Interpolate unit values
     */
    interpolateUnit(start, end, progress) {
        const startValue = parseFloat(start);
        const endValue = parseFloat(end);
        const unit = start.match(/[a-z%]+$/)?.[0] || 'px';
        const value = startValue + (endValue - startValue) * progress;
        return `${value}${unit}`;
    }

    /**
     * Get style value
     */
    getStyleValue(element, property) {
        if (property.startsWith('transform.')) {
            return this.getTransformValue(element, property.replace('transform.', ''));
        }
        
        const computed = window.getComputedStyle(element);
        return computed.getPropertyValue(this.camelToKebab(property)) || '0';
    }

    /**
     * Set style value
     */
    setStyleValue(element, property, value) {
        if (property.startsWith('transform.')) {
            this.setTransformValue(element, property.replace('transform.', ''), value);
            return;
        }
        
        element.style[property] = value;
    }

    /**
     * Get transform value
     */
    getTransformValue(element, transformType) {
        const transform = window.getComputedStyle(element).transform;
        if (transform === 'none') return '0';
        
        // Parse transform matrix or return 0
        const matrix = new DOMMatrix(transform);
        
        switch(transformType) {
            case 'translateX': return `${matrix.m41}px`;
            case 'translateY': return `${matrix.m42}px`;
            case 'scale': return matrix.m11;
            case 'rotate': return `${Math.atan2(matrix.m21, matrix.m11) * 180 / Math.PI}deg`;
            default: return '0';
        }
    }

    /**
     * Set transform value
     */
    setTransformValue(element, transformType, value) {
        const currentTransform = element.style.transform || '';
        const transforms = this.parseTransforms(currentTransform);
        
        transforms[transformType] = value;
        
        let transformString = '';
        Object.keys(transforms).forEach(key => {
            if (transforms[key] !== undefined) {
                transformString += `${key}(${transforms[key]}) `;
            }
        });
        
        element.style.transform = transformString.trim();
    }

    /**
     * Parse transforms
     */
    parseTransforms(transformString) {
        const transforms = {};
        if (!transformString || transformString === 'none') return transforms;
        
        const regex = /(\w+)\(([^)]+)\)/g;
        let match;
        while ((match = regex.exec(transformString)) !== null) {
            transforms[match[1]] = match[2];
        }
        
        return transforms;
    }

    /**
     * Camel case to kebab case
     */
    camelToKebab(str) {
        return str.replace(/([a-z0-9])([A-Z])/g, '$1-$2').toLowerCase();
    }

    /**
     * Stop an animation
     */
    stop(animationId) {
        const animation = this.animations.get(animationId);
        if (animation) {
            if (animation.onComplete) {
                animation.onComplete();
            }
            this.animations.delete(animationId);
        }
    }

    /**
     * Stop all animations
     */
    stopAll() {
        this.animations.forEach(animation => {
            if (animation.onComplete) {
                animation.onComplete();
            }
        });
        this.animations.clear();
        this.queue = [];
    }

    /**
     * Pause animations
     */
    pause() {
        this.paused = true;
    }

    /**
     * Resume animations
     */
    resume() {
        this.paused = false;
        if (this.animations.size > 0 || this.queue.length > 0) {
            this.start();
        }
    }

    /**
     * Get active animation count
     */
    getActiveCount() {
        return this.animations.size;
    }
}







