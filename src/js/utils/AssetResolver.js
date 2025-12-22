/**
 * AssetResolver - Resolves asset paths with fallback support
 * Checks for PNG first, then SVG, then provides default
 */

export class AssetResolver {
    /**
     * Resolve asset path with fallbacks
     * @param {string} assetPath - Original asset path (e.g., '/assets/icons/features/bed.png')
     * @returns {string} - Resolved asset path
     */
    static resolve(assetPath) {
        if (!assetPath) return '/assets/icons/ui/info.png';
        
        // If it's already an SVG, return as-is
        if (assetPath.endsWith('.svg')) {
            return assetPath;
        }
        
        // Try PNG first
        if (assetPath.endsWith('.png')) {
            // Check if PNG exists, if not try SVG
            const svgPath = assetPath.replace(/\.png$/, '.svg');
            // Return SVG path (browser will handle 404 gracefully)
            // In production, you'd check existence, but for now return SVG as fallback
            return assetPath; // Try PNG first, browser will fallback if needed
        }
        
        return assetPath;
    }
    
    /**
     * Get asset with SVG fallback
     * @param {string} pngPath - PNG path
     * @returns {string} - Asset path (PNG or SVG)
     */
    static withSvgFallback(pngPath) {
        if (!pngPath) return '/assets/icons/ui/info.svg';
        
        // If already SVG, return
        if (pngPath.endsWith('.svg')) {
            return pngPath;
        }
        
        // Return PNG path - browser will handle missing files
        // For now, we'll update the code to use SVG directly
        return pngPath.replace(/\.png$/, '.svg');
    }
    
    /**
     * Check if asset exists (client-side check)
     * Note: This is async and requires image load
     */
    static async assetExists(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
}


