/**
 * Asset Validation System
 * Validates all sprite sheets and assets load correctly
 */

import { isAssetMissing } from '../assets/MissingAssetBlocklist.js';

const IMAGE_EXT = /\.(png|jpe?g|gif|webp|svg)(\?.*)?$/i;

/** Every image path in a manifest subtree: strings, `.url` fields, arrays, nested objects */
function collectImagePaths(node, out = []) {
    if (!node) return out;
    if (typeof node === 'string') {
        if (IMAGE_EXT.test(node)) out.push(node);
        return out;
    }
    if (Array.isArray(node)) {
        node.forEach(n => collectImagePaths(n, out));
        return out;
    }
    if (typeof node === 'object') {
        Object.values(node).forEach(n => collectImagePaths(n, out));
    }
    return out;
}

/** Tally per-file results; files on the missing-asset blocklist count as skipped, not loaded (#1438) */
function tally(paths, fileResults) {
    const results = { total: paths.length, loaded: 0, failed: 0, skipped: 0, errors: [] };
    fileResults.forEach((result, index) => {
        if (result.skipped) {
            results.skipped++;
        } else if (result.loaded) {
            results.loaded++;
        } else {
            results.failed++;
            results.errors.push({ path: paths[index], error: result.error });
        }
    });
    return results;
}

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
        results.skipped = (results.sprites?.skipped || 0) +
                         (results.images?.skipped || 0) +
                         (results.audio?.skipped || 0);

        return results;
    }

    async validateSprites() {
        const spritePaths = this.getSpritePaths();
        const results = tally(spritePaths, await Promise.all(spritePaths.map(path => this.validateImage(path))));

        // Check frame geometry for sheets that declare it (#1440)
        results.sheets = [];
        for (const sheet of this.getSpriteSheets()) {
            if (isAssetMissing(sheet.url)) continue;
            const check = await this.validateSpriteSheet(sheet.url, sheet.frameWidth, sheet.frameHeight);
            const expected = (sheet.columns && sheet.rows) ? sheet.columns * sheet.rows : null;
            const geometryOk = check.valid && (expected == null || check.totalFrames >= expected);
            results.sheets.push({ name: sheet.name, url: sheet.url, ...check, expectedFrames: expected, geometryOk });
            if (check.valid && !geometryOk) {
                results.errors.push({
                    path: sheet.url,
                    error: `Sheet has ${check.totalFrames} frames, manifest expects ${expected}`
                });
            }
        }

        return results;
    }

    /**
     * Sprite sheets in the manifest that declare frame sizes
     */
    getSpriteSheets() {
        const manifest = this.game?.assetManager?.getAssetManifest?.();
        const sheets = manifest?.characters?.spriteSheets;
        if (!sheets || typeof sheets !== 'object') return [];
        return Object.entries(sheets)
            .filter(([, sheet]) => sheet?.url && sheet.frameWidth > 0 && sheet.frameHeight > 0)
            .map(([name, sheet]) => ({ name, ...sheet }));
    }

    async validateImages() {
        // Validate background images and other assets
        const imagePaths = this.getImagePaths();
        return tally(imagePaths, await Promise.all(imagePaths.map(path => this.validateImage(path))));
    }

    async validateAudio() {
        const audioPaths = this.getAudioPaths();
        return tally(audioPaths, await Promise.all(audioPaths.map(path => this.validateAudioFile(path))));
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

            // Also check low-poly character sprites (base, walk, idle)
            // These are plain string paths, unlike spriteSheets which have .url property
            const characterSprites = ['base', 'walk', 'idle'];
            characterSprites.forEach(key => {
                if (manifest.characters?.[key] && typeof manifest.characters[key] === 'string') {
                    paths.push(manifest.characters[key]);
                }
            });
        }

        // Only manifest paths: the old hardcoded character_sheet/emotion_sheet
        // fallbacks were never real files and always failed (#1438)
        return [...new Set(paths)];
    }

    /**
     * Every image in the manifest except the character sprites validated by
     * validateSprites(): backgrounds at any depth (#2309, #1437), emotions,
     * poses, map tiles, icons (#1045). Pass a limit to sample.
     */
    getImagePaths(limit = Infinity) {
        const manifest = this.game?.assetManager?.getAssetManifest?.();
        if (!manifest) return [];
        const spritePaths = new Set(this.getSpritePaths());
        const paths = [...new Set(collectImagePaths(manifest))].filter(p => !spritePaths.has(p));
        return Number.isFinite(limit) ? paths.slice(0, limit) : paths;
    }

    getAudioPaths() {
        // Get audio file paths
        const audioManager = this.game?.audioManager;
        const paths = [];

        // Music tracks are the only audio files the game loads; sound effects
        // are synthesized tones (#2310)
        if (typeof audioManager?.getTrackUrls === 'function') {
            paths.push(...audioManager.getTrackUrls());
        }

        return [...new Set(paths)];
    }

    async validateImage(path) {
        if (isAssetMissing(path)) {
            return { loaded: false, skipped: true, error: null };
        }
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
        if (isAssetMissing(path)) {
            return { loaded: false, skipped: true, error: null };
        }
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

