/**
 * Vehicle Icons Unit Tests
 * Verifies that all vehicle icon files referenced in WorldMap.js exist
 */

import { describe, it, expect } from 'vitest';
import fs from 'fs';
import path from 'path';
import { VEHICLES } from '../../src/js/game/WorldMap.js';

describe('Vehicle Icons', () => {
    it('should have all vehicle icon files exist in assets/icons/vehicles/', () => {
        const vehiclesWithIcons = VEHICLES.filter(vehicle => vehicle.icon);

        vehiclesWithIcons.forEach(vehicle => {
            // Convert the icon path to a filesystem path
            // Icon paths are like /assets/icons/vehicles/sedan.png
            // These map to ./assets/icons/vehicles/sedan.png in the project root
            const iconPath = path.join(
                __dirname,
                '../../',
                vehicle.icon.startsWith('/') ? vehicle.icon.substring(1) : vehicle.icon
            );

            // Check if file exists
            const exists = fs.existsSync(iconPath);
            expect(
                exists,
                `Vehicle "${vehicle.name}" (${vehicle.id}) references icon at "${vehicle.icon}" but file does not exist at ${iconPath}`
            ).toBe(true);
        });
    });

    it('should specifically have sedan.png icon file', () => {
        const sedanVehicle = VEHICLES.find(v => v.id === 'sedan');
        expect(sedanVehicle).toBeDefined();
        expect(sedanVehicle.icon).toBe('/assets/icons/vehicles/sedan.png');

        const sedanIconPath = path.join(
            __dirname,
            '../../assets/icons/vehicles/sedan.png'
        );
        expect(fs.existsSync(sedanIconPath)).toBe(true);
    });
});
