class MapCoordinateSystem {
    constructor(gridSystem = null) {
        this.gridSystem = gridSystem || new MapGridSystem();
        this.typeIndex = new Map();
    }

    isAvailable(x, y, radius = 1) {
        for (let i = x - radius; i <= x + radius; i++) {
            for (let j = y - radius; j <= y + radius; j++) {
                if (this.gridSystem.get(i, j) !== null) {
                    return false;
                }
            }
        }
        return true;
    }

    occupyCoord(x, y, type) {
        if (!this.gridSystem.get(x, y)) {
            this.gridSystem.set(x, y, type);
            if (!this.typeIndex.has(type)) {
                this.typeIndex.set(type, new Set());
            }
            this.typeIndex.get(type).add(`${x},${y}`);
        } else {
            console.error(`Coordinate (${x}, ${y}) is already occupied.`);
        }
    }

    releaseCoord(x, y, type) {
        const cell = this.gridSystem.get(x, y);
        if (cell === type) {
            this.gridSystem.set(x, y, null);
            const typeSet = this.typeIndex.get(type);
            typeSet.delete(`${x},${y}`);
            if (typeSet.size === 0) {
                this.typeIndex.delete(type);
            }
        } else {
            console.error(`Coordinate (${x}, ${y}) is not occupied by type ${type}.`);
        }
    }

    findAvailableCoord(preferredX, preferredY, type = 'location') {
        if (this.gridSystem.get(preferredX, preferredY) === null) {
            return { x: preferredX, y: preferredY };
        }
        for (let radius = 1; radius <= 10; radius++) {
            for (let angle = 0; angle < 360; angle += 15) {
                const x = Math.round(preferredX + radius * Math.cos(angle * Math.PI / 180));
                const y = Math.round(preferredY + radius * Math.sin(angle * Math.PI / 180));
                if (this.gridSystem.get(x, y) === null) {
                    return { x, y };
                }
            }
        }
        return this.findRandomAvailable(type);
    }

    findRandomAvailable(type = 'random') {
        for (let i = 0; i < 100; i++) {
            const x = Math.floor(Math.random() * 200);
            const y = Math.floor(Math.random() * 200);
            if (this.gridSystem.get(x, y) === null) {
                return { x, y };
            }
        }
        return { x: 100, y: 100 }; // Last resort: use center
    }

    findNPCHouseCoord(locationX, locationY) {
        if (locationX > 100 || locationY > 100) {
            return this.findRandomAvailable('npc_house');
        }
        const x = Math.floor(locationX / 2);
        const y = Math.floor(locationY / 2);
        return this.findAvailableCoord(x, y, 'npc_house');
    }

    clearType(type) {
        if (this.typeIndex.has(type)) {
            this.typeIndex.get(type).forEach(coord => {
                const [x, y] = coord.split(',').map(Number);
                this.releaseCoord(x, y, type);
            });
            this.typeIndex.delete(type);
        }
    }

    initializeWithLocations(locations) {
        locations.forEach(location => {
            if (location.position) {
                this.occupyCoord(location.position.x, location.position.y, 'location');
            }
        });
    }
}