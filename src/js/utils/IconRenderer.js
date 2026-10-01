/**
 * IconRenderer.js
 * Utility for rendering icons as images instead of emojis
 * Handles fallback to emoji if image fails to load
 */

/**
 * Determine if a string represents an image reference or emoji/text
 * @param {string} value - The value to check
 * @returns {boolean} - True if this is an image reference, false if emoji/text
 */
function isImageReference(value) {
    if (!value) return false;

    // Check for absolute paths
    if (value.startsWith('/')) return true;

    // Check for HTTP(S) URLs
    if (value.startsWith('http://') || value.startsWith('https://')) return true;

    // Check for data URIs
    if (value.startsWith('data:')) return true;

    // Check for blob URIs
    if (value.startsWith('blob:')) return true;

    // Check for relative paths with image extensions
    const imageExtensions = /\.(png|jpg|jpeg|gif|svg|webp|bmp)$/i;
    if (imageExtensions.test(value)) return true;

    // Everything else is treated as emoji/text
    return false;
}

/**
 * Create an icon image element
 * @param {string} iconPath - Path to icon image
 * @param {string} fallbackEmoji - Emoji to show if image fails
 * @param {Object} options - Additional options (size, className, etc.)
 * @returns {HTMLElement} - Icon element (img or span)
 */
export function createIconElement(iconPath, fallbackEmoji = '', options = {}) {
    const {
        size = 32,
        className = '',
        alt = '',
        style = {}
    } = options;

    // If iconPath is not an image reference, treat as emoji/text
    if (iconPath && !isImageReference(iconPath)) {
        const span = document.createElement('span');
        span.textContent = iconPath;
        span.className = className;
        span.style.fontSize = `${size}px`;
        Object.assign(span.style, style);
        return span;
    }

    // Create image element
    const img = document.createElement('img');
    img.src = iconPath || '';
    img.alt = alt || 'icon';
    img.className = className;
    img.style.width = `${size}px`;
    img.style.height = `${size}px`;
    img.style.objectFit = 'contain';
    img.style.objectPosition = 'center center';
    img.style.imageRendering = 'auto';
    Object.assign(img.style, style);

    // Fallback to emoji if image fails
    img.onerror = () => {
        const span = document.createElement('span');
        span.textContent = fallbackEmoji;
        span.className = className;
        span.style.fontSize = `${size}px`;
        span.style.display = 'inline-block';
        span.style.width = `${size}px`;
        span.style.height = `${size}px`;
        span.style.textAlign = 'center';
        span.style.lineHeight = `${size}px`;
        Object.assign(span.style, style);
        img.parentNode?.replaceChild(span, img);
    };

    return img;
}

/**
 * Update an existing element to show an icon
 * @param {HTMLElement} element - Element to update
 * @param {string} iconPath - Path to icon image
 * @param {string} fallbackEmoji - Emoji fallback
 */
export function updateIconElement(element, iconPath, fallbackEmoji = '') {
    if (!element) return;

    // Clear existing content
    element.innerHTML = '';

    // If iconPath is not an image reference, treat as emoji/text
    if (iconPath && !isImageReference(iconPath)) {
        element.textContent = iconPath;
        return;
    }

    // Create and append image
    const img = document.createElement('img');
    img.src = iconPath || '';
    img.style.width = '100%';
    img.style.height = '100%';
    img.style.objectFit = 'contain';
    img.style.objectPosition = 'center center';
    img.style.imageRendering = 'auto';

    img.onerror = () => {
        element.textContent = fallbackEmoji;
    };

    element.appendChild(img);
}

/**
 * Get icon path from location data
 * @param {Object} location - Location object
 * @returns {string} - Icon path or emoji
 */
export function getLocationIconPath(location) {
    if (!location) return '';

    // If icon is provided, return it (whether it's a path, URL, emoji, or other valid value)
    if (location.icon) {
        return location.icon;
    }

    // Otherwise, construct path from location ID as fallback
    return `/assets/icons/locations/${location.id}.png`;
}

/**
 * Get icon path for NPC type
 * @param {string} npcType - NPC type
 * @returns {string} - Icon path
 */
export function getNPCIconPath(npcType) {
    return `/assets/icons/npcs/${npcType}.png`;
}

/**
 * Get icon path for UI element
 * @param {string} uiElement - UI element name
 * @returns {string} - Icon path
 */
export function getUIIconPath(uiElement) {
    return `/assets/icons/ui/${uiElement}.png`;
}

/**
 * Get icon path for feature
 * @param {string} featureId - Feature ID
 * @returns {string} - Icon path
 */
export function getFeatureIconPath(featureId) {
    return `/assets/icons/features/${featureId}.png`;
}

/**
 * Get icon path for chart type
 * @param {string} chartType - Chart type
 * @returns {string} - Icon path
 */
export function getChartIconPath(chartType) {
    return `/assets/icons/charts/${chartType}.png`;
}

/**
 * Get icon path for vehicle
 * @param {string} vehicleId - Vehicle ID
 * @returns {string} - Icon path
 */
export function getVehicleIconPath(vehicleId) {
    return `/assets/icons/vehicles/${vehicleId}.png`;
}




