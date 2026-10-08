/**
 * SpriteSheetManager.js
 * Manages sprite sheets with animation frames
 * Supports frame sequences for smooth animations
 */

export class SpriteSheetManager {
    /**
     * Fallback layout (Universal LPC style) used when a sheet is registered
     * without its own `animations`. Frame indices run left to right, top to
     * bottom across `columns`.
     */
    static DEFAULT_ANIMATIONS = {
        idle: { startFrame: 0, frameCount: 4 },
        walk_down: { startFrame: 4, frameCount: 4 },
        walk_up: { startFrame: 8, frameCount: 4 },
        walk_left: { startFrame: 12, frameCount: 4 },
        walk_right: { startFrame: 16, frameCount: 4 },
        talk: { startFrame: 20, frameCount: 4 }
    };

    constructor() {
        this.spriteSheets = new Map();
        this.animations = new Map();
    }
    
    /**
     * Register a sprite sheet
     */
    registerSpriteSheet(id, config) {
        this.spriteSheets.set(id, {
            id: id,
            image: null, // Will be loaded
            frameWidth: config.frameWidth || 64,
            frameHeight: config.frameHeight || 64,
            columns: config.columns || 8,
            rows: config.rows || 8,
            // Caller-supplied frame layout; parseAnimations() turns it into
            // frame rects instead of discarding it (#2294, #1050)
            animationDefs: config.animations || null,
            animations: {},
            url: config.url
        });
    }
    
    /**
     * Load sprite sheet image
     */
    async loadSpriteSheet(id) {
        const sheet = this.spriteSheets.get(id);
        if (!sheet) {
            console.error(`Sprite sheet not found: ${id}`);
            return false;
        }
        
        return new Promise((resolve, reject) => {
            const img = new Image();
            
            img.onload = () => {
                sheet.image = img;
                this.parseAnimations(id);
                resolve(true);
            };
            
            img.onerror = () => {
                console.error(`Failed to load sprite sheet: ${sheet.url}`);
                reject(new Error(`Failed to load sprite sheet: ${sheet.url}`));
            };
            
            img.src = sheet.url;
        });
    }
    
    /**
     * Parse animation frames from sprite sheet
     */
    parseAnimations(sheetId) {
        const sheet = this.spriteSheets.get(sheetId);
        if (!sheet || !sheet.image) return;
        
        // Calculate frame positions
        sheet.animations = this.calculateFramePositions(sheet);
    }
    
    /**
     * Calculate frame positions in sprite sheet
     */
    calculateFramePositions(sheet) {
        const animations = {};
        const animationDefs = (sheet.animationDefs && Object.keys(sheet.animationDefs).length > 0)
            ? sheet.animationDefs
            : SpriteSheetManager.DEFAULT_ANIMATIONS;
        
        for (const [animName, animDef] of Object.entries(animationDefs)) {
            const frames = [];
            // Optional `row`: startFrame then counts from the start of that row
            const base = (Number.isInteger(animDef.row) ? animDef.row * sheet.columns : 0) + (animDef.startFrame || 0);
            for (let i = 0; i < animDef.frameCount; i++) {
                const frameIndex = base + i;
                const col = frameIndex % sheet.columns;
                const row = Math.floor(frameIndex / sheet.columns);
                
                frames.push({
                    x: col * sheet.frameWidth,
                    y: row * sheet.frameHeight,
                    width: sheet.frameWidth,
                    height: sheet.frameHeight
                });
            }
            
            animations[animName] = {
                frames: frames,
                speed: animDef.speed || 0.15,
                loop: animDef.loop !== false
            };
        }
        
        return animations;
    }
    
    /**
     * Get animation frames
     */
    getAnimationFrames(sheetId, animationName) {
        const sheet = this.spriteSheets.get(sheetId);
        if (!sheet || !sheet.animations) return null;
        
        return sheet.animations[animationName] || null;
    }
    
    /**
     * Get current frame for animation
     */
    getCurrentFrame(sheetId, animationName, frameIndex) {
        const animation = this.getAnimationFrames(sheetId, animationName);
        if (!animation || !animation.frames || animation.frames.length === 0) return null;

        // JS % keeps the dividend's sign: (-1 % 4) === -1, which indexes undefined (#2555).
        const len = animation.frames.length;
        const idx = ((Number(frameIndex) % len) + len) % len;
        const frame = animation.frames[idx];
        if (!frame) return null;
        const sheet = this.spriteSheets.get(sheetId);
        if (!sheet) return null;

        return {
            sheet: sheet.image,
            ...frame
        };
    }
    
    /**
     * Draw sprite frame to canvas
     */
    drawFrame(ctx, sheetId, animationName, frameIndex, x, y) {
        const frame = this.getCurrentFrame(sheetId, animationName, frameIndex);
        if (!frame || !frame.sheet) return;
        
        ctx.drawImage(
            frame.sheet,
            frame.x, frame.y, frame.width, frame.height,
            x, y, frame.width, frame.height
        );
    }
}

