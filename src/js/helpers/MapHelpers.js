/**
 * Render the map screen - O(n) where n is number of locations
 * @param {Game} game
 */
export function updateMapScreen(game) {
    const currentLocation = game.worldMap.currentLocation;

    if (domCache.mapContainer) {
        DOMUtils.clearElement(domCache.mapContainer);
    }

    // Location elements
    const locations = game.worldMap.locations;
    const locationElements = locations.map(location => {
        return DOMUtils.createElement('div', {
            className: 'map-location',
            attributes: {
                'data-location': location.id
            },
            style: {
                left: `${location.position.x}%`,
                top: `${location.position.y}%`
            },
            children: [
                DOMUtils.createElement('img', {
                    src: `/assets/map/locations/${location.icon}.png`,
                    style: {
                        width: '100%',
                        height: '100%',
                        objectFit: 'cover',
                        objectPosition: 'center center'
                    }
                })
            ]
        });
    });

    const fragment = DOMUtils.batch(locationElements);
    domCache.mapContainer.appendChild(fragment);

    // Player marker
    updatePlayerMarker(game);

    // Render buildings and NPCs if needed
    // ...
}

/**
 * Update player marker position - O(1)
 * Now supports grid coordinates
 */
function updatePlayerMarker(game) {
    const currentLocation = game.worldMap.getCurrentLocation();
    if (currentLocation?.position && domCache.playerMarker) {
        // All locations use grid coordinates (0-30) - convert to percentage
        let percentX, percentY;
        if (game.mapManager) {
            const percent = game.mapManager.gridToPercent(
                currentLocation.position.x,
                currentLocation.position.y
            );
            percentX = percent.x;
            percentY = percent.y;
        } else {
            // Fallback: assume 30x30 grid
            percentX = (currentLocation.position.x / 30) * 100;
            percentY = (currentLocation.position.y / 30) * 100;
        }
        domCache.playerMarker.style.left = `${percentX}%`;
        domCache.playerMarker.style.top = `${percentY}%`;
    }
}