/**
 * OfficeManager Unit Tests
 * Verifies that Character.js dead code removal doesn't break OfficeManager rendering
 */

import { describe, it, expect } from 'vitest';
import { OfficeManager } from '../../src/js/game/OfficeManager.js';

describe('OfficeManager', () => {
    describe('Office Rendering without Character class', () => {
        it('should render office scene correctly when gameState.character is undefined', () => {
            // Create a mock gameState without character property
            const gameState = {
                character: undefined  // Character class is never instantiated
            };

            // Create a mock DOM with container div
            const mockContainer = document.createElement('div');
            mockContainer.id = 'office-container';
            document.body.appendChild(mockContainer);

            // Create an OfficeManager instance
            const officeManager = new OfficeManager(gameState);

            // This should not throw even though gameState.character is undefined
            officeManager.renderOfficeScene('office-container');

            // Verify the office HTML was rendered
            expect(mockContainer.innerHTML).toContain('office-scene');
            expect(mockContainer.innerHTML).toContain('office-character');
            expect(mockContainer.innerHTML).toContain('character-avatar');

            // Clean up
            document.body.removeChild(mockContainer);
        });

        it('should render empty character avatar when gameState.character does not exist', () => {
            const gameState = {};  // No character property at all

            // Create a mock DOM with container div
            const mockContainer = document.createElement('div');
            mockContainer.id = 'office-container';
            document.body.appendChild(mockContainer);

            const officeManager = new OfficeManager(gameState);

            officeManager.renderOfficeScene('office-container');

            // The emoji should be empty since gameState.character is undefined
            const avatarDiv = mockContainer.querySelector('.character-avatar');
            expect(avatarDiv).toBeDefined();
            // Check that the emoji fallback is empty string (with trimmed whitespace)
            expect(avatarDiv.textContent.trim()).toBe('');

            // Clean up
            document.body.removeChild(mockContainer);
        });

        it('should not import or reference Character class anywhere in OfficeManager', async () => {
            // Verify that OfficeManager.js does not import Character.js
            const fs = await import('fs');
            const path = await import('path');
            const filePath = path.join(__dirname, '../../src/js/game/OfficeManager.js');
            const content = fs.readFileSync(filePath, 'utf8');

            // Character.js should not be imported
            expect(content).not.toMatch(/import.*Character\.js/);
            expect(content).not.toMatch(/from.*['"].*Character['"]$/m);
        });

        it('should verify Character.js dead code has been removed', async () => {
            // Verify that Character.js file no longer exists
            const fs = await import('fs');
            const path = await import('path');
            const filePath = path.join(__dirname, '../../src/js/game/Character.js');

            let fileExists = true;
            try {
                fs.readFileSync(filePath, 'utf8');
            } catch (e) {
                fileExists = false;
            }

            // Character.js should not exist (dead code removed)
            expect(fileExists).toBe(false);
        });
    });
});
