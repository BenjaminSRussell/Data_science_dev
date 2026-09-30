/**
 * Unit tests for DialogueUI
 * Verifies that NPC images are loaded in dialogue interface
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { DialogueUI } from '../../src/js/ui/DialogueUI.js';

describe('DialogueUI', () => {
    let game;
    let dialogueUI;

    beforeEach(() => {
        // Clear DOM
        document.body.innerHTML = '';

        // Mock game object
        game = {
            gameState: {
                npcManager: {
                    getRelationship: vi.fn(() => 0)
                }
            }
        };
    });

    describe('NPC Image Loading', () => {
        it('should import getNPCImage and getNPCFallback from NPCImageMapper', async () => {
            // Verify that the file imports these functions
            const fs = await import('fs');
            const path = await import('path');
            const filePath = path.join(__dirname, '../../src/js/ui/DialogueUI.js');
            const content = fs.readFileSync(filePath, 'utf8');

            expect(content).toContain("import { getNPCImage, getNPCFallback } from '../utils/NPCImageMapper.js'");
        });

        it('should render NPC image in dialogue avatar', () => {
            dialogueUI = new DialogueUI(game);

            const npc = {
                id: 'test_npc',
                name: 'Test NPC',
                title: 'Test Title',
                personality: 'friendly',
                image: '/assets/npcs/test.png'
            };

            // Mock getNPCImage to return a test image path
            vi.resetModules();

            dialogueUI.open(npc);

            // Check that avatar image element exists and has correct structure
            const avatarImage = document.querySelector('#dialogue-avatar-image');
            expect(avatarImage).toBeTruthy();
            expect(avatarImage.tagName).toBe('IMG');
        });

        it('should display image when getNPCImage returns a valid path', () => {
            dialogueUI = new DialogueUI(game);

            const npc = {
                id: 'alex_rivera',
                name: 'Alex Rivera',
                title: 'Mentor',
                personality: 'friendly'
            };

            dialogueUI.open(npc);

            const avatarImage = document.querySelector('#dialogue-avatar-image');
            expect(avatarImage).toBeTruthy();

            // Image should have a source set
            expect(avatarImage.src).toBeTruthy();
            expect(avatarImage.style.display).toBe('block');
        });

        it('should show initial letter as fallback when image is missing', () => {
            dialogueUI = new DialogueUI(game);

            const npc = {
                id: 'unknown_npc',
                name: 'Unknown NPC',
                title: 'Unknown Title',
                personality: 'neutral'
            };

            dialogueUI.open(npc);

            const initial = document.querySelector('#dialogue-avatar-initial');
            expect(initial).toBeTruthy();
            expect(initial.textContent).toBe('U'); // First letter of "Unknown"
        });

        it('should show icon fallback when image fails to load', async () => {
            dialogueUI = new DialogueUI(game);

            const npc = {
                id: 'test_npc',
                name: 'Test NPC',
                title: 'Test',
                personality: 'friendly',
                icon: '🎭' // Provide an icon for fallback
            };

            dialogueUI.open(npc);

            const avatarImage = document.querySelector('#dialogue-avatar-image');
            const avatarIcon = document.querySelector('#dialogue-avatar-icon');
            const initial = document.querySelector('#dialogue-avatar-initial');

            // Simulate image load error
            return new Promise((resolve) => {
                setTimeout(() => {
                    const errorEvent = new Event('error');
                    avatarImage.dispatchEvent(errorEvent);

                    // Check that image is hidden and icon is shown
                    expect(avatarImage.style.display).toBe('none');
                    expect(avatarIcon.textContent).toBe('🎭');
                    expect(avatarIcon.style.display).toBe('');
                    expect(initial.style.display).toBe('none');
                    resolve();
                }, 10);
            });
        });

        it('should trigger fallback to initial when image fails and no icon is available', async () => {
            dialogueUI = new DialogueUI(game);

            const npc = {
                id: 'test_npc',
                name: 'Test NPC',
                title: 'Test',
                personality: 'friendly'
                // no icon property
            };

            dialogueUI.open(npc);

            const avatarImage = document.querySelector('#dialogue-avatar-image');
            const avatarIcon = document.querySelector('#dialogue-avatar-icon');
            const initial = document.querySelector('#dialogue-avatar-initial');

            // Simulate image load error
            return new Promise((resolve) => {
                setTimeout(() => {
                    const errorEvent = new Event('error');
                    avatarImage.dispatchEvent(errorEvent);

                    // Check that image is hidden and initial is shown (no icon)
                    expect(avatarImage.style.display).toBe('none');
                    expect(avatarIcon.style.display).toBe('none');
                    expect(initial.style.display).toBe('');
                    resolve();
                }, 10);
            });
        });

        it('should have proper CSS styling for avatar circle', () => {
            dialogueUI = new DialogueUI(game);

            const npc = {
                id: 'test_npc',
                name: 'Test NPC',
                title: 'Test',
                personality: 'friendly'
            };

            dialogueUI.open(npc);

            const avatar = document.querySelector('#dialogue-avatar');
            expect(avatar).toBeTruthy();

            const styles = window.getComputedStyle(avatar);
            expect(styles.display).toBe('flex');
            expect(styles.borderRadius).toBe('50%');
            expect(styles.overflow).toBe('hidden');
        });

        it('should set data-personality attribute on avatar', () => {
            dialogueUI = new DialogueUI(game);

            const npc = {
                id: 'test_npc',
                name: 'Test NPC',
                title: 'Test',
                personality: 'ambitious'
            };

            dialogueUI.open(npc);

            const avatar = document.querySelector('#dialogue-avatar');
            expect(avatar.getAttribute('data-personality')).toBe('ambitious');
        });
    });

    describe('Dialogue Container Structure', () => {
        it('should create dialogue container with proper structure', () => {
            dialogueUI = new DialogueUI(game);

            const container = document.querySelector('#dialogue-ui');
            expect(container).toBeTruthy();
            expect(container.classList.contains('dialogue-container')).toBe(true);

            const box = container.querySelector('.dialogue-box');
            expect(box).toBeTruthy();

            const header = box.querySelector('.dialogue-header');
            expect(header).toBeTruthy();

            const avatar = header.querySelector('#dialogue-avatar');
            expect(avatar).toBeTruthy();

            const avatarImg = avatar.querySelector('#dialogue-avatar-image');
            expect(avatarImg).toBeTruthy();

            const avatarIcon = avatar.querySelector('#dialogue-avatar-icon');
            expect(avatarIcon).toBeTruthy();

            const initial = avatar.querySelector('#dialogue-avatar-initial');
            expect(initial).toBeTruthy();
        });

        it('should display NPC name and title', () => {
            dialogueUI = new DialogueUI(game);

            const npc = {
                id: 'test_npc',
                name: 'Test NPC',
                title: 'Test Title',
                personality: 'friendly'
            };

            dialogueUI.open(npc);

            const nameEl = document.querySelector('#dialogue-npc-name');
            const titleEl = document.querySelector('#dialogue-npc-title');

            expect(nameEl.textContent).toBe('Test NPC');
            expect(titleEl.textContent).toBe('Test Title');
        });
    });
});
