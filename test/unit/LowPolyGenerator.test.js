/**
 * LowPolyGenerator Tests
 * Verifies that the generator can fill gaps for all asset categories including vehicles and map assets
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest';
import { execSync } from 'child_process';
import fs from 'fs';
import path from 'path';

const projectRoot = path.resolve(__dirname, '../../');
const generatorScript = path.join(projectRoot, 'scripts/archive/generators/generate_more_low_poly.py');

describe('LowPolyGenerator', () => {
    let testOutputDir = '';

    beforeAll(() => {
        // Create a temporary test directory
        testOutputDir = path.join(projectRoot, '.test-low-poly-output');
        if (!fs.existsSync(testOutputDir)) {
            fs.mkdirSync(testOutputDir, { recursive: true });
        }

        // Create subdirectories that the generator expects
        const categories = [
            'characters/sprites',
            'icons/items',
            'icons/features',
            'ui/elements',
            'effects/particles',
            'vehicles/sprites',
            'map/assets'
        ];

        categories.forEach(category => {
            const categoryPath = path.join(testOutputDir, category);
            if (!fs.existsSync(categoryPath)) {
                fs.mkdirSync(categoryPath, { recursive: true });
            }
        });
    });

    afterAll(() => {
        // Clean up test directory
        if (fs.existsSync(testOutputDir)) {
            fs.rmSync(testOutputDir, { recursive: true, force: true });
        }
    });

    it('should have generate_low_poly_vehicle method', () => {
        // Verify the method exists in the Python script
        const scriptContent = fs.readFileSync(generatorScript, 'utf8');
        expect(scriptContent).toMatch(/def generate_low_poly_vehicle/);
    });

    it('should have generate_low_poly_map_asset method', () => {
        // Verify the method exists in the Python script
        const scriptContent = fs.readFileSync(generatorScript, 'utf8');
        expect(scriptContent).toMatch(/def generate_low_poly_map_asset/);
    });

    it('should have vehicle category in targets dict', () => {
        // Verify that vehicles/sprites is in the targets
        const scriptContent = fs.readFileSync(generatorScript, 'utf8');
        expect(scriptContent).toMatch(/'vehicles\/sprites':\s*300/);
    });

    it('should have map category in targets dict', () => {
        // Verify that map/assets is in the targets
        const scriptContent = fs.readFileSync(generatorScript, 'utf8');
        expect(scriptContent).toMatch(/'map\/assets':\s*500/);
    });

    it('should handle vehicle category in fill_category method', () => {
        // Verify that the fill_category method handles vehicles
        const scriptContent = fs.readFileSync(generatorScript, 'utf8');
        expect(scriptContent).toMatch(/elif 'vehicle' in category:/);
        expect(scriptContent).toMatch(/self\.generate_low_poly_vehicle\(/);
    });

    it('should handle map category in fill_category method', () => {
        // Verify that the fill_category method handles maps
        const scriptContent = fs.readFileSync(generatorScript, 'utf8');
        expect(scriptContent).toMatch(/elif 'map' in category:/);
        expect(scriptContent).toMatch(/self\.generate_low_poly_map_asset\(/);
    });

    it('should generate vehicle assets when fill_category is called for vehicles', () => {
        // Create a test script that fills vehicles category
        const testScript = `
import sys
sys.path.insert(0, '${projectRoot}')
from scripts.archive.generators.generate_more_low_poly import LowPolyGenerator

gen = LowPolyGenerator('${testOutputDir}')
result = gen.fill_category('vehicles/sprites', 3, 0)
print(f'Generated {result} vehicle assets')
`;

        const scriptPath = path.join(projectRoot, '.test-fill-vehicles.py');
        fs.writeFileSync(scriptPath, testScript);

        try {
            const output = execSync(`python3 "${scriptPath}"`, {
                cwd: projectRoot,
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe']
            });
            expect(output).toMatch(/Generated 3 vehicle assets/);

            // Verify files were created
            const vehiclesDir = path.join(testOutputDir, 'vehicles/sprites');
            const files = fs.readdirSync(vehiclesDir).filter(f => f.endsWith('.png'));
            expect(files.length).toBeGreaterThanOrEqual(3);
        } finally {
            if (fs.existsSync(scriptPath)) {
                fs.unlinkSync(scriptPath);
            }
        }
    });

    it('should generate map assets when fill_category is called for maps', () => {
        // Create a test script that fills map category
        const testScript = `
import sys
sys.path.insert(0, '${projectRoot}')
from scripts.archive.generators.generate_more_low_poly import LowPolyGenerator

gen = LowPolyGenerator('${testOutputDir}')
result = gen.fill_category('map/assets', 3, 0)
print(f'Generated {result} map assets')
`;

        const scriptPath = path.join(projectRoot, '.test-fill-maps.py');
        fs.writeFileSync(scriptPath, testScript);

        try {
            const output = execSync(`python3 "${scriptPath}"`, {
                cwd: projectRoot,
                encoding: 'utf8',
                stdio: ['pipe', 'pipe', 'pipe']
            });
            expect(output).toMatch(/Generated 3 map assets/);

            // Verify files were created
            const mapsDir = path.join(testOutputDir, 'map/assets');
            const files = fs.readdirSync(mapsDir).filter(f => f.endsWith('.png'));
            expect(files.length).toBeGreaterThanOrEqual(3);
        } finally {
            if (fs.existsSync(scriptPath)) {
                fs.unlinkSync(scriptPath);
            }
        }
    });
});
