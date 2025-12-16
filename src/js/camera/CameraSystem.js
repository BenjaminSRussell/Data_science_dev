/**
 * CameraSystem.js
 * Handles viewport and camera movements
 * Manages pan, zoom, and camera effects
 */

export class CameraSystem {
    constructor(container) {
        this.container = container;
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        this.target = null;
        this.followSpeed = 0.1;
        this.bounds = null; // { minX, maxX, minY, maxY }
        this.shakeIntensity = 0;
        this.shakeDuration = 0;
        this.shakeStartTime = 0;
    }

    /**
     * Move camera to position
     */
    moveTo(x, y, smooth = false) {
        if (smooth) {
            this.target = { x, y };
        } else {
            this.x = this.clampX(x);
            this.y = this.clampY(y);
            this.applyTransform();
        }
    }

    /**
     * Follow a target element
     */
    follow(target, offsetX = 0, offsetY = 0) {
        this.target = {
            element: target,
            offsetX,
            offsetY
        };
    }

    /**
     * Stop following
     */
    stopFollowing() {
        this.target = null;
    }

    /**
     * Set zoom level
     */
    setZoom(level, smooth = false) {
        const minZoom = 0.5;
        const maxZoom = 3.0;
        const clampedZoom = Math.max(minZoom, Math.min(maxZoom, level));

        if (smooth) {
            // Smooth zoom animation would go here
            this.zoom = clampedZoom;
        } else {
            this.zoom = clampedZoom;
        }

        this.applyTransform();
    }

    /**
     * Zoom in
     */
    zoomIn(amount = 0.1) {
        this.setZoom(this.zoom + amount);
    }

    /**
     * Zoom out
     */
    zoomOut(amount = 0.1) {
        this.setZoom(this.zoom - amount);
    }

    /**
     * Set camera bounds
     */
    setBounds(minX, maxX, minY, maxY) {
        this.bounds = { minX, maxX, minY, maxY };
    }

    /**
     * Clamp X position
     */
    clampX(x) {
        if (!this.bounds) return x;
        return Math.max(this.bounds.minX, Math.min(this.bounds.maxX, x));
    }

    /**
     * Clamp Y position
     */
    clampY(y) {
        if (!this.bounds) return y;
        return Math.max(this.bounds.minY, Math.min(this.bounds.maxY, y));
    }

    /**
     * Apply camera transform
     */
    applyTransform() {
        if (!this.container) return;

        let transformX = -this.x;
        let transformY = -this.y;

        // Apply shake
        if (this.shakeIntensity > 0) {
            const elapsed = Date.now() - this.shakeStartTime;
            if (elapsed < this.shakeDuration) {
                const shakeX = (Math.random() - 0.5) * this.shakeIntensity;
                const shakeY = (Math.random() - 0.5) * this.shakeIntensity;
                transformX += shakeX;
                transformY += shakeY;
            } else {
                this.shakeIntensity = 0;
            }
        }

        // Apply transform
        this.container.style.transform = `translate(${transformX}px, ${transformY}px) scale(${this.zoom})`;
        this.container.style.transformOrigin = '0 0';
    }

    /**
     * Shake camera effect
     */
    shake(intensity, duration) {
        this.shakeIntensity = intensity;
        this.shakeDuration = duration;
        this.shakeStartTime = Date.now();
    }

    /**
     * Update camera (call in game loop)
     */
    update() {
        // Follow target if set
        if (this.target) {
            if (this.target.element) {
                // Follow element
                const rect = this.target.element.getBoundingClientRect();
                const containerRect = this.container.parentElement.getBoundingClientRect();
                
                const targetX = rect.left + rect.width / 2 - containerRect.width / 2 + this.target.offsetX;
                const targetY = rect.top + rect.height / 2 - containerRect.height / 2 + this.target.offsetY;

                // Smooth follow
                this.x += (targetX - this.x) * this.followSpeed;
                this.y += (targetY - this.y) * this.followSpeed;
            } else {
                // Follow coordinates
                this.x += (this.target.x - this.x) * this.followSpeed;
                this.y += (this.target.y - this.y) * this.followSpeed;
            }

            this.x = this.clampX(this.x);
            this.y = this.clampY(this.y);
        }

        // Update shake
        if (this.shakeIntensity > 0) {
            const elapsed = Date.now() - this.shakeStartTime;
            if (elapsed >= this.shakeDuration) {
                this.shakeIntensity = 0;
            }
        }

        this.applyTransform();
    }

    /**
     * Convert screen coordinates to world coordinates
     */
    screenToWorld(screenX, screenY) {
        const rect = this.container.getBoundingClientRect();
        return {
            x: (screenX - rect.left) / this.zoom + this.x,
            y: (screenY - rect.top) / this.zoom + this.y
        };
    }

    /**
     * Convert world coordinates to screen coordinates
     */
    worldToScreen(worldX, worldY) {
        const rect = this.container.getBoundingClientRect();
        return {
            x: (worldX - this.x) * this.zoom + rect.left,
            y: (worldY - this.y) * this.zoom + rect.top
        };
    }

    /**
     * Reset camera
     */
    reset() {
        this.x = 0;
        this.y = 0;
        this.zoom = 1;
        this.target = null;
        this.shakeIntensity = 0;
        this.applyTransform();
    }

    /**
     * Get camera state
     */
    getState() {
        return {
            x: this.x,
            y: this.y,
            zoom: this.zoom,
            hasTarget: this.target !== null,
            shaking: this.shakeIntensity > 0
        };
    }
}




