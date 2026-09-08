/**
 * PixiSpriteManager.js
 * Handles sprite management and animation for the game using PixiJS
 */

import { Sprite, TextureCache } from 'pixi.js';
import { GameAssetLoader } from './GameAssetLoader';

export class PixiSpriteManager {
    constructor(loader) {
        this.loader = loader;
        this.textures = new Map();
    }

    /**
     * Load texture from asset path
     */
    async loadTexture(assetPath) {
        if (TextureCache[assetPath]) {
            return TextureCache[assetPath];
        }
        return new Promise((resolve, reject) => {
            const texture = PIXI.Texture.from(assetPath, { resourceOptions: { autoDetectFormat: true } });
            texture.baseTexture.on('loaded', () => {
                this.textures.set(assetPath, texture);
                resolve(texture);
            });
            texture.baseTexture.on('error', reject);
        });
    }

    /**
     * Create animated sprite from texture array
     */
    createAnimatedSprite(textureArray, sheetId) {
        const textures = textureArray.map(texturePath => TextureCache[texturePath]);
        const animatedSprite = new Sprite.from(textures);
        animatedSprite.animationSpeed = 0.1;
        animatedSprite.loop = true;
        animatedSprite.play();
        animatedSprite.sheetId = sheetId; // Assign sheetId to the sprite
        return animatedSprite;
    }

    /**
     * Play animation for sprite
     */
    playAnimation(sprite, animationName) {
        if (sprite.sheetId) {
            const sheet = this.loader.getSpriteSheet(sprite.sheetId);
            if (sheet) {
                const animation = sheet.animations[animationName];
                if (animation) {
                    sprite.textures = animation;
                    sprite.animationSpeed = 0.1;
                    sprite.loop = true;
                    sprite.play();
                }
            }
        }
    }

    /**
     * Stop animation for sprite
     */
    stopAnimation(sprite) {
        sprite.stop();
    }

    /**
     * Get sprite sheet by ID
     */
    getSpriteSheet(sheetId) {
        return this.textures.get(sheetId);
    }
}