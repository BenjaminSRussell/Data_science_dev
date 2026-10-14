/**
 * Verifies that Character.js dead code removal stays removed.
 * OfficeManager rendering coverage left with the unwired manager.
 */

import { describe, it, expect } from 'vitest';

describe('Character dead code', () => {
    it('should verify Character.js dead code has been removed', async () => {
        const fs = await import('fs');
        const path = await import('path');
        const filePath = path.join(__dirname, '../../src/js/game/Character.js');

        let fileExists = true;
        try {
            fs.readFileSync(filePath, 'utf8');
        } catch {
            fileExists = false;
        }

        expect(fileExists).toBe(false);
    });
});
