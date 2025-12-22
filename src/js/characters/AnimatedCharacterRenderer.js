/**
 * AnimatedCharacterRenderer.js
 * Renders characters using sprite sheets with smooth animations
 * Handles frame sequences and animation states
 */

export class AnimatedCharacterRenderer {
    constructor(spriteSheetManager) {
        this.spriteSheetManager = spriteSheetManager;
        this.activeAnimations = new Map();
        this.animationStates = new Map();
    }
    
    /**
     * Create animated character element
     */
    createAnimatedCharacter(characterId, config) {
        const element = document.createElement('div');
        element.id = `animated-character-${characterId}`;
        element.className = 'animated-character';
        
        // Create canvas for sprite sheet rendering
        const canvas = document.createElement('canvas');
        canvas.width = config.frameWidth || 64;
        canvas.height = config.frameHeight || 64;
        canvas.className = 'character-canvas';
        element.appendChild(canvas);
        
        // Store character config
        this.animationStates.set(characterId, {
            currentAnimation: 'idle',
            currentFrame: 0,
            frameTimer: 0,
            direction: 'down',
            ...config
        });
        
        // Start animation loop
        this.startAnimation(characterId, 'idle');
        
        return element;
    }
    
    /**
     * Start animation
     */
    startAnimation(characterId, animationName, loop = true) {
        const state = this.animationStates.get(characterId);
        if (!state) return;
        
        state.currentAnimation = animationName;
        state.currentFrame = 0;
        state.frameTimer = 0;
        state.loop = loop;
        
        // Get animation config
        const sheetId = state.spriteSheetId;
        // Support both PixiSpriteManager and legacy SpriteSheetManager
        const animation = this.spriteSheetManager?.getAnimationFrames?.(sheetId, animationName) ||
                         this.spriteSheetManager?.getAnimation?.(sheetId, animationName);
        
        if (!animation) {
            console.warn(`Animation not found: ${animationName} for ${characterId}`);
            return;
        }
        
        // Store active animation
        this.activeAnimations.set(characterId, {
            name: animationName,
            frames: animation.frames,
            speed: animation.speed,
            loop: animation.loop !== false
        });
    }
    
    /**
     * Update animation frame
     */
    updateAnimation(characterId, deltaTime) {
        const state = this.animationStates.get(characterId);
        const animation = this.activeAnimations.get(characterId);
        
        if (!state || !animation) return;
        
        // Update frame timer
        state.frameTimer += deltaTime;
        
        // Check if it's time for next frame
        const frameDuration = 1000 / (animation.speed * 60); // Convert to milliseconds
        if (state.frameTimer >= frameDuration) {
            state.frameTimer = 0;
            state.currentFrame++;
            
            // Loop or stop
            if (state.currentFrame >= animation.frames.length) {
                if (animation.loop) {
                    state.currentFrame = 0;
                } else {
                    state.currentFrame = animation.frames.length - 1;
                    // Auto-return to idle
                    this.startAnimation(characterId, 'idle');
                }
            }
        }
        
        // Render current frame
        this.renderFrame(characterId);
    }
    
    /**
     * Render current animation frame
     */
    renderFrame(characterId) {
        const state = this.animationStates.get(characterId);
        if (!state) return;
        
        const element = document.getElementById(`animated-character-${characterId}`);
        const canvas = element?.querySelector('.character-canvas');
        if (!canvas) return;
        
        const ctx = canvas.getContext('2d');
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        
        // Get current frame
        const frame = this.spriteSheetManager.getCurrentFrame(
            state.spriteSheetId,
            state.currentAnimation,
            state.currentFrame
        );
        
        if (frame && frame.sheet) {
            this.spriteSheetManager.drawFrame(
                ctx,
                state.spriteSheetId,
                state.currentAnimation,
                state.currentFrame,
                0,
                0
            );
        }
    }
    
    /**
     * Set character direction
     */
    setDirection(characterId, direction) {
        const state = this.animationStates.get(characterId);
        if (!state) return;
        
        state.direction = direction;
        
        // Update animation based on direction
        if (state.currentAnimation === 'walk') {
            this.startAnimation(characterId, `walk_${direction}`);
        }
    }
    
    /**
     * Set character emotion
     */
    setEmotion(characterId, emotion) {
        // Emotion affects idle animation
        const state = this.animationStates.get(characterId);
        if (!state) return;
        
        state.emotion = emotion;
        
        // Use emotion-specific idle if available
        const emotionIdle = `idle_${emotion}`;
        if (this.spriteSheetManager.getAnimationFrames(state.spriteSheetId, emotionIdle)) {
            this.startAnimation(characterId, emotionIdle);
        }
    }
    
    /**
     * Play talking animation
     */
    playTalking(characterId, duration = 2000) {
        this.startAnimation(characterId, 'talk', false);
        
        setTimeout(() => {
            this.startAnimation(characterId, 'idle');
        }, duration);
    }
    
    /**
     * Update all active animations
     */
    updateAll(deltaTime) {
        this.activeAnimations.forEach((animation, characterId) => {
            this.updateAnimation(characterId, deltaTime);
        });
    }
}

