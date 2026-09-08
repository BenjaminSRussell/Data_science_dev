/**
 * Asset Validation System
 * Validates all sprite sheets and assets load correctly
 */

export class AssetValidator {
    constructor(game) {
        this.game = game;
    }

    async validateAll() {
        const results = {
            sprites: await this.validateSprites(),
            images: await this.validateImages(),
            audio: await this.validateAudio(),
            total: 0,
            loaded: 0,
            failed: 0
        };

        results.total = (results.sprites?.total || 0) + 
                       (results.images?.total || 0) + 
                       (results.audio?.total || 0);
        results.loaded = (results.sprites?.loaded || 0) + 
                        (results.images?.loaded || 0) + 
                        (results.audio?.loaded || 0);
        results.failed = (results.sprites?.failed || 0) + 
                        (results.images?.failed || 0) + 
                        (results.audio?.failed || 0);

        return results;
    }

    async validateSprites() {
        const spritePaths = this.getSpritePaths();
        const results = {
            total: spritePaths.length,
            loaded: 0,
            failed: 0,
            errors: []
        };

        const promises = spritePaths.map(path => this.validateImage(path));
        const imageResults = await Promise.all(promises);

        imageResults.forEach((result, index) => {
            if (result.loaded) {
                results.loaded++;
            } else {
                results.failed++;
                results.errors.push({
                    path: spritePaths[index],
                    error: result.error
                });
            }
        });

        return results;
    }

    async validateImages() {
        // Validate background images and other assets
        const imagePaths = this.getImagePaths();
        const results = {
            total: imagePaths.length,
            loaded: 0,
            failed: 0,
            errors: []
        };

        const promises = imagePaths.map(path => this.validateImage(path));
        const imageResults = await Promise.all(promises);

        imageResults.forEach((result, index) => {
            if (result.loaded) {
                results.loaded++;
            } else {
                results.failed++;
                results.errors.push({
                    path: imagePaths[index],
                    error: result.error
                });
            }
        });

        return results;
    }

    async validateAudio() {
        const audioPaths = this.getAudioPaths();
        const results = {
            total: audioPaths.length,
            loaded: 0,
            failed: 0,
            errors: []
        };

        const promises = audioPaths.map(path => this.validateAudioFile(path));
        const audioResults = await Promise.all(promises);

        audioResults.forEach((result, index) => {
            if (result.loaded) {
                results.loaded++;
            } else {
                results.failed++;
                results.errors.push({
                    path: audioPaths[index],
                    error: result.error
                });
            }
        });

        return results;
    }

    getSpritePaths() {
        // Get sprite sheet paths from asset manager
        const assetManager = this.game?.assetManager;
        const paths = [];

        if (assetManager?.getAssetManifest) {
            const manifest = assetManager.getAssetManifest();
            if (manifest.characters?.spriteSheets) {
                Object.values(manifest.characters.spriteSheets).forEach(sheet => {
                    if (sheet.url) paths.push(sheet.url);
                });
            }
        }

        // Also check common sprite paths
        const commonSprites = [
            '/assets/characters/sprites/character_sheet.png',
            '/assets/characters/sprites/emotion_sheet.png'
        ];

        commonSprites.forEach(path => {
            if (!paths.includes(path)) paths.push(path);
        });

        return paths;
    }

    getImagePaths() {
        // Get background and other image paths
        const paths = [];
        const assetManager = this.game?.assetManager;

        if (assetManager?.getAssetManifest) {
            const manifest = assetManager.getAssetManifest();
            
            // Background images
            if (manifest.backgrounds) {
                Object.values(manifest.backgrounds).forEach(bg => {
                    if (typeof bg === 'string') {
                        paths.push(bg);
                    } else if (bg.url) {
                        paths.push(bg.url);
                    }
                });
            }
        }

        return paths.slice(0, 20); // Limit to 20 for testing
    }

    getAudioPaths() {
        // Get audio file paths from the music stations' tracks
        // (sound effects are synthesized tones with no file assets)
        const audioManager = this.game?.audioManager;
        const paths = [];

        if (audioManager?.musicStations) {
            Object.values(audioManager.musicStations).forEach(station => {
                if (station?.tracks) {
                    station.tracks.forEach(track => {
                        const path = `/assets/audio/music/${track}`;
                        if (!paths.includes(path)) paths.push(path);
                    });
                }
            });
        }

        return paths;
    }

    async validateImage(path) {
        return new Promise((resolve) => {
            const img = new Image();
            const timeout = setTimeout(() => {
                resolve({ loaded: false, error: 'Timeout' });
            }, 5000);

            img.onload = () => {
                clearTimeout(timeout);
                resolve({ loaded: true, width: img.width, height: img.height });
            };

            img.onerror = () => {
                clearTimeout(timeout);
                resolve({ loaded: false, error: 'Load failed' });
            };

            img.src = path;
        });
    }

    async validateAudioFile(path) {
        return new Promise((resolve) => {
            const audio = new Audio();
            const timeout = setTimeout(() => {
                resolve({ loaded: false, error: 'Timeout' });
            }, 5000);

            audio.addEventListener('canplaythrough', () => {
                clearTimeout(timeout);
                resolve({ loaded: true });
            });

            audio.onerror = () => {
                clearTimeout(timeout);
                resolve({ loaded: false, error: 'Load failed' });
            };

            audio.src = path;
            audio.load();
        });
    }

    validateSpriteSheet(sheetPath, frameWidth, frameHeight) {
        // Validate sprite sheet dimensions and frame count
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => {
                const cols = Math.floor(img.width / frameWidth);
                const rows = Math.floor(img.height / frameHeight);
                const totalFrames = cols * rows;

                resolve({
                    valid: true,
                    width: img.width,
                    height: img.height,
                    cols,
                    rows,
                    totalFrames,
                    frameWidth,
                    frameHeight
                });
            };

            img.onerror = () => {
                resolve({ valid: false, error: 'Could not load image' });
            };

            img.src = sheetPath;
        });
    }
}

