/**
 * MapIconRenderer.js
 * Renders location icons on the map using image assets
 */

/**
 * Update all map location icons to use image assets
 */
export function updateMapLocationIcons(game) {
    if (!game.worldMap) return;

    const locationElements = document.querySelectorAll('.map-location');

    locationElements.forEach(el => {
        const locationId = el.dataset.location;
        if (!locationId) return;

        const location = game.worldMap.getLocation(locationId);
        if (!location) return;

        const iconContainer = el.querySelector('.location-icon');
        if (!iconContainer) return;

        // Check if already has image (avoid re-rendering)
        if (iconContainer.querySelector('img') || iconContainer.dataset.iconFailed === 'true') return;

        // Clear emoji text
        iconContainer.textContent = '';

        // Create image element
        const img = document.createElement('img');
        img.src = location.icon || `/assets/icons/locations/${locationId}.png`;
        img.alt = location.name;
        img.style.width = '100%';
        img.style.height = '100%';
        img.style.objectFit = 'contain';
        img.style.objectPosition = 'center center';
        img.style.imageRendering = 'auto';

        // Fallback to default icon if image fails
        img.onerror = () => {
            // Drop the broken image and remember the failure, so the
            // placeholder stays clean and later refreshes don't re-request it (#2382)
            img.remove();
            iconContainer.dataset.iconFailed = 'true';
            iconContainer.textContent = location.name?.charAt(0) || '';
            iconContainer.style.background = 'var(--color-bg-tertiary, #ccc)';
            iconContainer.style.borderRadius = '4px';
        };

        iconContainer.appendChild(img);
    });
}

/**
 * Update lock badge icons
 */
export function updateLockBadges() {
    const lockBadges = document.querySelectorAll('.lock-badge');

    lockBadges.forEach(badge => {
        if (badge.querySelector('img')) return; // already converted
        const kind = (badge.dataset.icon || badge.dataset.type || badge.getAttribute('aria-label') || '').toLowerCase();
        const text = badge.textContent.trim();
        let src = null;
        if (kind.includes('lock') || text === String.fromCodePoint(0x1F512)) {
            src = '/assets/icons/ui/lock.png';
        } else if (kind.includes('bus') || text === String.fromCodePoint(0x1F68C)) {
            src = '/assets/icons/vehicles/bus_pass.png';
        } else if (kind.includes('car') || kind.includes('vehicle') || text === String.fromCodePoint(0x1F697)) {
            src = '/assets/icons/vehicles/used_car.png';
        } else if (badge.classList.contains('locked') || kind === 'locked') {
            src = '/assets/icons/ui/lock.png';
        } else {
            return; // unknown empty badge — do not stack all three icons (#35)
        }
        badge.textContent = '';
        const img = document.createElement('img');
        img.src = src;
        img.alt = kind || 'badge';
        img.style.width = '16px';
        img.style.height = '16px';
        img.onerror = () => { badge.textContent = ''; };
        badge.appendChild(img);
    });
}

