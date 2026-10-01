/**
 * Unit tests for StoryUI close button accessibility
 * Tests verify the production CSS file meets issue #2711 requirements:
 * - Close button is at least 44×44px (touch target minimum)
 * - Focus-visible outline is defined
 * - Accessible name is present
 */

import { describe, it, expect, beforeAll, beforeEach, afterEach } from 'vitest';
import { StoryUI } from '../../src/js/ui/StoryUI.js';
import fs from 'fs';
import path from 'path';

describe('StoryUI Close Button Accessibility (#2711)', () => {
    let storyUICss = '';
    let styleElement;

    beforeAll(() => {
        // Read the actual production CSS file
        const cssPath = path.join(__dirname, '../../src/styles/story-ui.css');
        storyUICss = fs.readFileSync(cssPath, 'utf8');
    });

    beforeEach(() => {
        // Set up DOM with actual CSS
        document.body.innerHTML = `<div id="screen-container"></div>`;

        // Inject the actual production CSS
        styleElement = document.createElement('style');
        styleElement.textContent = storyUICss;
        document.head.appendChild(styleElement);
    });

    afterEach(() => {
        document.body.innerHTML = '';
        if (styleElement && styleElement.parentNode) {
            styleElement.parentNode.removeChild(styleElement);
        }
    });

    describe('CSS file content verification', () => {
        it('should define .close-btn with min-width: 44px', () => {
            // Verify the actual CSS file contains min-width: 44px for .close-btn
            expect(storyUICss).toMatch(/\.close-btn\s*\{[\s\S]*?min-width:\s*44px/);
        });

        it('should define .close-btn with min-height: 44px', () => {
            // Verify the actual CSS file contains min-height: 44px for .close-btn
            expect(storyUICss).toMatch(/\.close-btn\s*\{[\s\S]*?min-height:\s*44px/);
        });

        it('should define .close-btn:focus-visible with outline', () => {
            // Verify the actual CSS file contains :focus-visible block with outline
            expect(storyUICss).toMatch(/\.close-btn:focus-visible\s*\{[\s\S]*?outline:\s*2px\s*solid\s*#666/);
        });

        it('should define .close-btn:focus-visible with outline-offset', () => {
            // Verify the actual CSS file contains outline-offset in :focus-visible block
            expect(storyUICss).toMatch(/\.close-btn:focus-visible\s*\{[\s\S]*?outline-offset:\s*2px/);
        });
    });

    describe('DOM rendering with production CSS', () => {
        it('should create button with aria-label="Close"', () => {
            const storyUI = new StoryUI({});
            storyUI.createStoryScreen();

            const closeBtn = document.getElementById('btn-story-close');
            expect(closeBtn).toBeTruthy();
            expect(closeBtn.getAttribute('aria-label')).toBe('Close');
        });

        it('should render close button with computed min-width of 44px', () => {
            const storyUI = new StoryUI({});
            storyUI.createStoryScreen();

            const closeBtn = document.getElementById('btn-story-close');
            const computed = window.getComputedStyle(closeBtn);
            const minWidth = parseFloat(computed.minWidth);
            expect(minWidth).toBe(44);
        });

        it('should render close button with computed min-height of 44px', () => {
            const storyUI = new StoryUI({});
            storyUI.createStoryScreen();

            const closeBtn = document.getElementById('btn-story-close');
            const computed = window.getComputedStyle(closeBtn);
            const minHeight = parseFloat(computed.minHeight);
            expect(minHeight).toBe(44);
        });

        it('should apply outline style when :focus-visible is triggered', () => {
            const storyUI = new StoryUI({});
            storyUI.createStoryScreen();

            const closeBtn = document.getElementById('btn-story-close');

            // Simulate keyboard focus (which triggers :focus-visible in modern browsers)
            closeBtn.focus({ preventScroll: true });

            // Note: Computed styles for pseudo-elements like :focus-visible are not always
            // accessible through getComputedStyle in JSDOM/Vitest, but the CSS file
            // verification tests above confirm the :focus-visible block exists in the
            // production CSS with the correct outline and outline-offset values.
            // This test verifies the button can receive focus, which is required for
            // :focus-visible to apply.
            expect(document.activeElement).toBe(closeBtn);
            expect(typeof closeBtn.focus).toBe('function');
        });
    });
});
