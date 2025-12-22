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
        if (iconContainer.querySelector('img')) return;

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
            iconContainer.textContent = '';
            iconContainer.style.background = '#ccc';
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
        const text = badge.textContent.trim();
        
        // Replace emoji lock with icon
        if (text === '') {
            badge.innerHTML = '';
            const img = document.createElement('img');
            img.src = '/assets/icons/ui/lock.png';
            img.style.width = '16px';
            img.style.height = '16px';
            img.onerror = () => badge.textContent = '';
            badge.appendChild(img);
        }
        
        // Replace vehicle emojis with icons
        if (text === '') {
            badge.innerHTML = '';
            const img = document.createElement('img');
            img.src = '/assets/icons/vehicles/bus_pass.png';
            img.style.width = '16px';
            img.style.height = '16px';
            img.onerror = () => {
                badge.textContent = '';
                badge.style.background = '#666';
            };
            badge.appendChild(img);
        }
        
        if (text === '') {
            badge.innerHTML = '';
            const img = document.createElement('img');
            img.src = '/assets/icons/vehicles/used_car.png';
            img.style.width = '16px';
            img.style.height = '16px';
            img.onerror = () => badge.textContent = '';
            badge.appendChild(img);
        }
    });
}

