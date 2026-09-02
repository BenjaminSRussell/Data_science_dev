```javascript
import { getNPCImage, getAllNPCImagePaths } from '../../src/js/utils/NPCImageMapper.js';
import { isAssetMissing } from '../../src/js/assets/MissingAssetBlocklist.js';

// Mock the MissingAssetBlocklist module
jest.mock('../../src/js/assets/MissingAssetBlocklist.js', () => {
    return {
        isAssetMissing: jest.fn()
    };
});

describe('NPCImageMapper', () => {
    describe('getNPCImage', () => {
        it('should return explicit image path if provided', () => {
            const npc = { image: '/custom/path.png' };
            expect(getNPCImage(npc)).toBe('/custom/path.png');
        });

        it('should return hardcoded image path for known NPC id', () => {
            const npc = { id: 'alex_rivera' };
            expect(getNPCImage(npc)).toBe('/assets/npcs/alex_young.png');
        });

        it('should generate deterministic image path for new NPC', () => {
            const npc = { id: 'brand_new_npc', type: 'mentor', personality: 'wise' };
            const expectedPath = '/assets/npcs/mentor_3.png'; // Captured once and hardcoded
            expect(getNPCImage(npc)).toBe(expectedPath);
        });

        it('should return SVG placeholder if generated path is missing', () => {
            const npc = { id: 'x', name: 'Jane Doe', type: 'unknown_blocked' };
            isAssetMissing.mockReturnValue(true);
            const svgPlaceholder = getNPCImage(npc);
            expect(svgPlaceholder.startsWith('data:image/svg+xml;base64,')).toBe(true);
            const svgData = Buffer.from(svgPlaceholder.split(',')[1], 'base64').toString('utf8');
            expect(svgData).toContain('<text x="50" y="50" dy=".35em" text-anchor="middle" fill="white" font-family="sans-serif" font-size="40" font-weight="bold">JD</text>');
            expect(svgData).toContain('<rect width="100" height="100" fill="#3b82f6" rx="10" ry="10"/>');
        });
    });

    describe('getAllNPCImagePaths', () => {
        it('should return array matching input order/length', () => {
            const npc1 = { id: 'npc1', image: '/path/to/npc1.png' };
            const npc2 = { id: 'npc2', type: 'mentor', personality: 'wise' };
            const npc3 = { id: 'npc3', name: 'Jane Doe', type: 'unknown_blocked' };
            const npcs = [npc1, npc2, npc3];
            const imagePaths = getAllNPCImagePaths(npcs);
            expect(imagePaths).toEqual([npc1.image, '/assets/npcs/mentor_3.png', 'data:image/svg+xml;base64,']);
        });
    });
});