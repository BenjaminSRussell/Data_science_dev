/**
 * NPC Image Mapper
 * Maps all NPCs to their visual assets with fallback system
 * Ensures every NPC has a visual representation
 */

import { isAssetMissing } from '../assets/MissingAssetBlocklist.js';

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
    let imagePath = null;

    // 1. Check explicit property
    if (npc.image) {
        imagePath = npc.image;
    }
    // 2. Check existing mapping
    else if (EXISTING_IMAGES[npc.id]) {
        imagePath = NPC_IMAGE_BASE + EXISTING_IMAGES[npc.id];
    }
    // 3. Generate path
    else {
        imagePath = generateImagePath(npc);
    }

    // FINAL CHECK: If missing, return generated SVG placeholder
    if (imagePath && isAssetMissing(imagePath)) {
        return generateSVGPlaceholder(npc);
    }

    return imagePath;
}

/**
 * Generate a clean SVG placeholder for missing assets
 */
function generateSVGPlaceholder(npc) {
    const initials = npc.name.split(' ').map(n => n[0]).join('').substring(0, 2).toUpperCase();
    // Deterministic color
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#ec4899', '#6366f1'];
    const hash = simpleHash(npc.name);
    const color = colors[hash % colors.length];

    // Simple SVG data URI
    const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
        <rect width="100" height="100" fill="${color}" rx="10" ry="10"/>
        <text x="50" y="50" dy=".35em" text-anchor="middle" fill="white" font-family="sans-serif" font-size="40" font-weight="bold">${initials}</text>
    </svg>`;

    return `data:image/svg+xml;base64,${btoa(svg)}`;
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
    return npc.icon || '';
}

/**
 * Get all NPC image paths (for preloading)
 */
export function getAllNPCImagePaths(npcs) {
    return npcs.map(npc => getNPCImage(npc)).filter(Boolean);
}

