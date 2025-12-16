/**
 * NPC Image Mapper
 * Maps all NPCs to their visual assets with fallback system
 * Ensures every NPC has a visual representation
 */

// Base path for NPC images
const NPC_IMAGE_BASE = '/assets/npcs/';

// Existing NPC images
const EXISTING_IMAGES = {
    'alex_rivera': 'alex_young.png',
    'vinnie_shark': 'loan_shark.png',
    'the_broker': 'the_broker.png',
    'zero_cool': 'the_hacker.png',
    'emma_bloom': 'npc_good_character_1765747743170.png',
    'player': 'player_young.png'
};

// Generate image path for NPC based on type and name
export function getNPCImage(npc) {
    // If NPC has explicit image, use it
    if (npc.image) {
        return npc.image;
    }
    
    // Check if we have an existing image
    if (EXISTING_IMAGES[npc.id]) {
        return NPC_IMAGE_BASE + EXISTING_IMAGES[npc.id];
    }
    
    // Generate image path based on NPC type and characteristics
    return generateImagePath(npc);
}

/**
 * Generate image path based on NPC characteristics
 * Uses a deterministic hash to ensure consistency
 */
function generateImagePath(npc) {
    // Create a hash from NPC properties
    const hash = simpleHash(npc.id + npc.type + npc.personality);
    
    // Map to image category based on type
    const typeMap = {
        'mentor': 'mentor',
        'business': 'business',
        'investor': 'investor',
        'shopkeeper': 'shopkeeper',
        'friend': 'friend',
        'rival': 'rival',
        'criminal': 'criminal',
        'romance': 'romance',
        'authority': 'authority',
        'service': 'service'
    };
    
    const category = typeMap[npc.type] || 'friend';
    
    // Use hash to select variant (0-9)
    const variant = hash % 10;
    
    // Return path - will use placeholder system until images are created
    // Format: /assets/npcs/{category}_{variant}.png
    return NPC_IMAGE_BASE + `${category}_${variant}.png`;
}

/**
 * Simple hash function for deterministic image selection
 */
function simpleHash(str) {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
        const char = str.charCodeAt(i);
        hash = ((hash << 5) - hash) + char;
        hash = hash & hash; // Convert to 32bit integer
    }
    return Math.abs(hash);
}

/**
 * Get fallback emoji/icon if image fails to load
 */
export function getNPCFallback(npc) {
    return npc.icon || '👤';
}

/**
 * Check if image exists (for error handling)
 */
export function hasNPCImage(npc) {
    return !!npc.image || !!EXISTING_IMAGES[npc.id];
}

/**
 * Get all NPC image paths (for preloading)
 */
export function getAllNPCImagePaths(npcs) {
    return npcs.map(npc => getNPCImage(npc)).filter(Boolean);
}

