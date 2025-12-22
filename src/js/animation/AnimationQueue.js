/**
 * AnimationQueue.js
 * Manages queued animations and animation sequences
 */

export class AnimationQueue {
    constructor(animationManager) {
        this.animationManager = animationManager;
        this.queue = [];
        this.isPlaying = false;
    }

    /**
     * Add animation to queue
     */
    add(element, properties, options = {}) {
        const animationConfig = {
            element,
            properties,
            options: {
                ...options,
                onComplete: () => {
                    if (options.onComplete) {
                        options.onComplete();
                    }
                    this.playNext();
                }
            }
        };

        this.queue.push(animationConfig);

        // Start playing if not already
        if (!this.isPlaying && this.queue.length === 1) {
            this.playNext();
        }
    }

    /**
     * Play next animation in queue
     */
    playNext() {
        if (this.queue.length === 0) {
            this.isPlaying = false;
            return;
        }

        this.isPlaying = true;
        const next = this.queue.shift();
        this.animationManager.animate(next.element, next.properties, next.options);
    }

    /**
     * Clear queue
     */
    clear() {
        this.queue = [];
        this.isPlaying = false;
    }

    /**
     * Get queue length
     */
    getLength() {
        return this.queue.length;
    }
}







