/**
 * GSAPAnimationManager.js
 * Replaces custom AnimationManager with GSAP
 * Phase 3: Code Reduction - Using GSAP instead of custom animation code
 */

import { gsap } from 'gsap';

export class GSAPAnimationManager {
    constructor() {
        this.timelines = new Map();
        this.animations = new Map();
    }

    /**
     * Animate element properties
     * Replaces AnimationManager.animate()
     */
    animate(element, properties, options = {}) {
        const {
            duration = 0.3,
            easing = 'power2.out',
            delay = 0,
            onComplete = null,
            onUpdate = null,
            onStart = null
        } = options;

        // Convert properties to GSAP format
        const gsapProps = { ...properties };
        
        // Handle transform properties
        if (gsapProps.transform) {
            Object.assign(gsapProps, gsapProps.transform);
            delete gsapProps.transform;
        }

        // Create animation
        const animation = gsap.to(element, {
            ...gsapProps,
            duration,
            ease: easing,
            delay,
            onComplete,
            onUpdate,
            onStart
        });

        const animationId = `anim_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.animations.set(animationId, animation);

        return animationId;
    }

    /**
     * Fade in element
     */
    fadeIn(element, options = {}) {
        return this.animate(element, { opacity: 1 }, {
            duration: options.duration || 0.5,
            ...options
        });
    }

    /**
     * Fade out element
     */
    fadeOut(element, options = {}) {
        return this.animate(element, { opacity: 0 }, {
            duration: options.duration || 0.5,
            onComplete: () => {
                if (element && element.style) {
                    element.style.display = 'none';
                }
                if (options.onComplete) options.onComplete();
            },
            ...options
        });
    }

    /**
     * Slide in from direction
     */
    slideIn(element, direction = 'left', options = {}) {
        const from = {
            left: { x: -100, opacity: 0 },
            right: { x: 100, opacity: 0 },
            top: { y: -100, opacity: 0 },
            bottom: { y: 100, opacity: 0 }
        };

        const fromProps = from[direction] || from.left;
        
        // Set initial state
        gsap.set(element, fromProps);

        return this.animate(element, { x: 0, y: 0, opacity: 1 }, {
            duration: options.duration || 0.5,
            ...options
        });
    }

    /**
     * Slide out to direction
     */
    slideOut(element, direction = 'left', options = {}) {
        const to = {
            left: { x: -100, opacity: 0 },
            right: { x: 100, opacity: 0 },
            top: { y: -100, opacity: 0 },
            bottom: { y: 100, opacity: 0 }
        };

        const toProps = to[direction] || to.left;

        return this.animate(element, toProps, {
            duration: options.duration || 0.5,
            onComplete: () => {
                if (element && element.style) {
                    element.style.display = 'none';
                }
                if (options.onComplete) options.onComplete();
            },
            ...options
        });
    }

    /**
     * Scale animation
     */
    scale(element, scale, options = {}) {
        return this.animate(element, { scale }, {
            duration: options.duration || 0.3,
            ...options
        });
    }

    /**
     * Pulse animation
     */
    pulse(element, options = {}) {
        const duration = options.duration || 0.3;
        const scale = options.scale || 1.1;
        
        return gsap.to(element, {
            scale,
            duration: duration / 2,
            yoyo: true,
            repeat: options.repeat || 1,
            ease: 'power2.inOut',
            onComplete: options.onComplete
        });
    }

    /**
     * Shake animation
     */
    shake(element, options = {}) {
        const intensity = options.intensity || 10;
        const duration = options.duration || 0.5;
        
        return gsap.to(element, {
            x: `+=${intensity}`,
            duration: duration / 10,
            repeat: 10,
            yoyo: true,
            ease: 'power1.inOut',
            onComplete: () => {
                gsap.set(element, { x: 0 });
                if (options.onComplete) options.onComplete();
            }
        });
    }

    /**
     * Bounce animation
     */
    bounce(element, options = {}) {
        const height = options.height || 20;
        const duration = options.duration || 0.6;
        
        return gsap.to(element, {
            y: -height,
            duration: duration / 2,
            ease: 'power2.out',
            yoyo: true,
            repeat: 1,
            onComplete: () => {
                gsap.set(element, { y: 0 });
                if (options.onComplete) options.onComplete();
            }
        });
    }

    /**
     * Rotate animation
     */
    rotate(element, rotation, options = {}) {
        return this.animate(element, { rotation }, {
            duration: options.duration || 0.3,
            ...options
        });
    }

    /**
     * Create timeline for sequenced animations
     */
    createTimeline(options = {}) {
        const timeline = gsap.timeline(options);
        const timelineId = `tl_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
        this.timelines.set(timelineId, timeline);
        return { id: timelineId, timeline };
    }

    /**
     * Animate character emotion change
     */
    animateCharacterEmotion(element, emotion, options = {}) {
        const animations = {
            happy: () => this.pulse(element, { scale: 1.1, duration: 0.3 }),
            sad: () => this.fadeOut(element, { duration: 0.2 }).then(() => this.fadeIn(element, { duration: 0.2 })),
            angry: () => this.shake(element, { intensity: 15, duration: 0.5 }),
            excited: () => this.bounce(element, { height: 30, duration: 0.6 }),
            thinking: () => this.rotate(element, 5, { duration: 0.3, yoyo: true, repeat: 2 })
        };

        const anim = animations[emotion];
        if (anim) {
            return anim();
        }

        // Default: fade transition
        return this.fadeOut(element, { duration: 0.2 }).then(() => {
            this.fadeIn(element, { duration: 0.2 });
        });
    }

    /**
     * Animate UI element entrance
     */
    animateEntrance(element, type = 'fade', options = {}) {
        switch (type) {
            case 'fade':
                return this.fadeIn(element, options);
            case 'slide-left':
                return this.slideIn(element, 'left', options);
            case 'slide-right':
                return this.slideIn(element, 'right', options);
            case 'slide-up':
                return this.slideIn(element, 'top', options);
            case 'slide-down':
                return this.slideIn(element, 'bottom', options);
            case 'scale':
                gsap.set(element, { scale: 0 });
                return this.scale(element, 1, options);
            default:
                return this.fadeIn(element, options);
        }
    }

    /**
     * Animate UI element exit
     */
    animateExit(element, type = 'fade', options = {}) {
        switch (type) {
            case 'fade':
                return this.fadeOut(element, options);
            case 'slide-left':
                return this.slideOut(element, 'left', options);
            case 'slide-right':
                return this.slideOut(element, 'right', options);
            case 'slide-up':
                return this.slideOut(element, 'top', options);
            case 'slide-down':
                return this.slideOut(element, 'bottom', options);
            case 'scale':
                return this.scale(element, 0, {
                    ...options,
                    onComplete: () => {
                        if (element && element.style) {
                            element.style.display = 'none';
                        }
                        if (options.onComplete) options.onComplete();
                    }
                });
            default:
                return this.fadeOut(element, options);
        }
    }

    /**
     * Stop animation
     */
    stop(animationId) {
        const animation = this.animations.get(animationId);
        if (animation) {
            animation.kill();
            this.animations.delete(animationId);
        }
    }

    /**
     * Stop all animations
     */
    stopAll() {
        this.animations.forEach(animation => animation.kill());
        this.timelines.forEach(timeline => timeline.kill());
        this.animations.clear();
        this.timelines.clear();
    }

    /**
     * Pause all animations
     */
    pauseAll() {
        this.animations.forEach(animation => animation.pause());
        this.timelines.forEach(timeline => timeline.pause());
    }

    /**
     * Resume all animations
     */
    resumeAll() {
        this.animations.forEach(animation => animation.resume());
        this.timelines.forEach(timeline => timeline.resume());
    }

    /**
     * Get active animation count
     */
    getActiveCount() {
        return this.animations.size;
    }
}
