/**
 * MissingAssetBlocklist.js
 * Manages a list of missing assets to handle gracefully
 */

export class MissingAssetBlocklist {
    constructor() {
        this.MISSING_ASSETS = new Set([
            'characters/placeholder.png',
            'backgrounds/default.png',
            'icons/question.png',
            'ui/loading.gif',
            'vehicles/car_placeholder.png'
        ]);
    }

    /**
     * Check if an asset is missing
     * @param {string} path - The asset path to check
     * @returns {boolean} - True if the asset is missing, false otherwise
     */
    isAssetMissing(path) {
        if (!path) {
            return true; // Falsy input guard
        }

        // Normalize path by stripping leading slash if present
        const normalizedPath = path.startsWith('/') ? path.slice(1) : path;

        return this.MISSING_ASSETS.has(normalizedPath);
    }
}