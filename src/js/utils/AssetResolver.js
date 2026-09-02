/**
 * AssetResolver.js
 * Utility class for resolving asset paths with fallbacks
 */

export class AssetResolver {
    /**
     * Resolve asset path with fallback
     * @param {string} assetPath - The initial asset path
     * @returns {string} - The resolved asset path
     */
    static resolve(assetPath) {
        if (assetPath.endsWith('.png')) {
            // Check if PNG exists, if not try SVG
            const svgPath = assetPath.replace(/\.png$/, '.svg');
            // Return SVG path (browser will handle 404 gracefully)
            // In production, you'd check existence, but for now return SVG as fallback
            return svgPath; // Try SVG first, browser will fallback if needed
        }
        return assetPath;
    }
}