import { Tile } from './Tile.js';
import { MapZones } from '../data/mapZones.js';

/**
 * TileBasedCityMap.js
 * Manages the tile-based city map
 */

export class TileBasedCityMap {
    constructor(container, game) {
        this.container = container;
        this.game = game;
        this.cols = 30;
        this.rows = 20;
        this.tiles = new Array(this.cols * this.rows).fill(null);
        this.initMapData();
    }

    initMapData() {
        this.generateRoads();
        this.generateZones().then(() => {
            this.renderMap();
        });
    }

    generateRoads() {
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (row % 6 === 0 || col % 6 === 0) {
                    this.setTile(col, row, 'road');
                }
            }
        }
    }

    async generateZones() {
        const zones = await import('../data/mapZones.js');
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                if (this.getTile(col, row) === null) {
                    const zoneType = zones.getZoneType(col, row);
                    this.setTile(col, row, zoneType);
                }
            }
        }
    }

    setTile(col, row, tileType) {
        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            this.tiles[row * this.cols + col] = new Tile(tileType);
        }
    }

    getTile(col, row) {
        if (col >= 0 && col < this.cols && row >= 0 && row < this.rows) {
            return this.tiles[row * this.cols + col]?.type;
        }
        return null;
    }

    getTileZIndex(tileType) {
        switch (tileType) {
            case 'road':
                return 1;
            case 'zone_residential':
                return 2;
            default:
                return 0;
        }
    }

    renderMap() {
        this.container.innerHTML = '';
        for (let row = 0; row < this.rows; row++) {
            for (let col = 0; col < this.cols; col++) {
                const tile = this.getTile(col, row);
                const tileElement = document.createElement('div');
                tileElement.style.position = 'absolute';
                tileElement.style.width = `${100 / this.cols}%`;
                tileElement.style.height = `${100 / this.rows}%`;
                tileElement.style.left = `${col * (100 / this.cols)}%`;
                tileElement.style.top = `${row * (100 / this.rows)}%`;
                tileElement.style.zIndex = this.getTileZIndex(tile);
                tileElement.style.backgroundColor = this.getTileColor(tile);
                this.container.appendChild(tileElement);
            }
        }
    }

    getTileColor(tileType) {
        switch (tileType) {
            case 'road':
                return 'gray';
            case 'zone_residential':
                return 'lightblue';
            default:
                return 'green';
        }
    }
}