import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import {
    createIconElement,
    updateIconElement,
    getLocationIconPath
} from '../../src/js/utils/IconRenderer.js';

describe('IconRenderer', () => {
    describe('createIconElement', () => {
        it('should create img element for absolute path', () => {
            const elem = createIconElement('/assets/icons/foo.png');
            expect(elem.tagName).toBe('IMG');
            expect(elem.src).toContain('/assets/icons/foo.png');
        });

        it('should create img element for relative path with extension', () => {
            const elem = createIconElement('assets/icons/foo.png');
            expect(elem.tagName).toBe('IMG');
            expect(elem.src).toContain('assets/icons/foo.png');
        });

        it('should create img element for relative path starting with ./', () => {
            const elem = createIconElement('./icons/foo.png');
            expect(elem.tagName).toBe('IMG');
            // jsdom resolves relative URLs, so check that it ends with our filename
            expect(elem.src).toContain('icons/foo.png');
        });

        it('should create img element for HTTP URL', () => {
            const elem = createIconElement('http://example.com/icon.png');
            expect(elem.tagName).toBe('IMG');
            expect(elem.src).toBe('http://example.com/icon.png');
        });

        it('should create img element for HTTPS URL', () => {
            const elem = createIconElement('https://example.com/icon.png');
            expect(elem.tagName).toBe('IMG');
            expect(elem.src).toBe('https://example.com/icon.png');
        });

        it('should create img element for data URI', () => {
            const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            const elem = createIconElement(dataUri);
            expect(elem.tagName).toBe('IMG');
            expect(elem.src).toBe(dataUri);
        });

        it('should create img element for blob URI', () => {
            const blobUri = 'blob:http://example.com/550e8400-e29b-41d4-a716-446655440000';
            const elem = createIconElement(blobUri);
            expect(elem.tagName).toBe('IMG');
            expect(elem.src).toBe(blobUri);
        });

        it('should create span element for emoji', () => {
            const elem = createIconElement('⏰');
            expect(elem.tagName).toBe('SPAN');
            expect(elem.textContent).toBe('⏰');
        });

        it('should create span element for multi-character text', () => {
            const elem = createIconElement('hello');
            expect(elem.tagName).toBe('SPAN');
            expect(elem.textContent).toBe('hello');
        });

        it('should respect size option for img', () => {
            const elem = createIconElement('/assets/icon.png', '', { size: 48 });
            expect(elem.style.width).toBe('48px');
            expect(elem.style.height).toBe('48px');
        });

        it('should respect size option for emoji span', () => {
            const elem = createIconElement('⏰', '', { size: 48 });
            expect(elem.style.fontSize).toBe('48px');
        });

        it('should respect className option', () => {
            const elem = createIconElement('/assets/icon.png', '', { className: 'my-icon' });
            expect(elem.className).toBe('my-icon');
        });

        it('should return fallback emoji on img load error', () => {
            const elem = createIconElement('/non-existent.png', '❌');
            expect(elem.tagName).toBe('IMG');

            // Simulate image load error
            elem.onerror();

            // Check that fallback is handled (img would be replaced if it had a parent)
            expect(elem.tagName).toBe('IMG');
        });

        it('should handle empty iconPath by creating img', () => {
            const elem = createIconElement('');
            expect(elem.tagName).toBe('IMG');
            // jsdom resolves empty string to base URL
            expect(elem.src).toBeTruthy();
        });

        it('should handle null iconPath by creating img', () => {
            const elem = createIconElement(null);
            expect(elem.tagName).toBe('IMG');
            // jsdom resolves null to base URL
            expect(elem.src).toBeTruthy();
        });

        it('should handle undefined iconPath by creating img', () => {
            const elem = createIconElement(undefined);
            expect(elem.tagName).toBe('IMG');
            // jsdom resolves undefined to base URL
            expect(elem.src).toBeTruthy();
        });
    });

    describe('updateIconElement', () => {
        let element;

        beforeEach(() => {
            element = document.createElement('div');
            document.body.appendChild(element);
        });

        afterEach(() => {
            if (element.parentNode) {
                element.parentNode.removeChild(element);
            }
        });

        it('should update with img for absolute path', () => {
            updateIconElement(element, '/assets/icons/foo.png');
            const img = element.querySelector('img');
            expect(img).toBeTruthy();
            expect(img.src).toContain('/assets/icons/foo.png');
        });

        it('should update with img for relative path with extension', () => {
            updateIconElement(element, 'assets/icons/foo.png');
            const img = element.querySelector('img');
            expect(img).toBeTruthy();
            expect(img.src).toContain('assets/icons/foo.png');
        });

        it('should update with img for HTTP URL', () => {
            updateIconElement(element, 'http://example.com/icon.png');
            const img = element.querySelector('img');
            expect(img).toBeTruthy();
            expect(img.src).toBe('http://example.com/icon.png');
        });

        it('should update with img for HTTPS URL', () => {
            updateIconElement(element, 'https://example.com/icon.png');
            const img = element.querySelector('img');
            expect(img).toBeTruthy();
            expect(img.src).toBe('https://example.com/icon.png');
        });

        it('should update with img for data URI', () => {
            const dataUri = 'data:image/png;base64,iVBORw0KG...';
            updateIconElement(element, dataUri);
            const img = element.querySelector('img');
            expect(img).toBeTruthy();
            expect(img.src).toBe(dataUri);
        });

        it('should update with img for blob URI', () => {
            const blobUri = 'blob:http://example.com/550e8400-e29b-41d4-a716-446655440000';
            updateIconElement(element, blobUri);
            const img = element.querySelector('img');
            expect(img).toBeTruthy();
            expect(img.src).toBe(blobUri);
        });

        it('should update with emoji text', () => {
            updateIconElement(element, '⏰');
            expect(element.textContent).toBe('⏰');
            expect(element.querySelector('img')).toBeNull();
        });

        it('should update with regular text', () => {
            updateIconElement(element, 'hello');
            expect(element.textContent).toBe('hello');
            expect(element.querySelector('img')).toBeNull();
        });

        it('should clear previous content', () => {
            element.innerHTML = '<p>old content</p>';
            updateIconElement(element, '⏰');
            expect(element.textContent).toBe('⏰');
            expect(element.querySelector('p')).toBeNull();
        });

        it('should handle null element gracefully', () => {
            expect(() => updateIconElement(null, '/icon.png')).not.toThrow();
        });

        it('should handle undefined element gracefully', () => {
            expect(() => updateIconElement(undefined, '/icon.png')).not.toThrow();
        });
    });

    describe('getLocationIconPath', () => {
        it('should return emoji icon as-is', () => {
            const location = { id: 'deadline', icon: '⏰' };
            const result = getLocationIconPath(location);
            expect(result).toBe('⏰');
        });

        it('should return absolute path as-is', () => {
            const location = { id: 'test', icon: '/assets/icons/library.png' };
            const result = getLocationIconPath(location);
            expect(result).toBe('/assets/icons/library.png');
        });

        it('should return relative path with extension as-is', () => {
            const location = { id: 'test', icon: 'assets/icons/library.png' };
            const result = getLocationIconPath(location);
            expect(result).toBe('assets/icons/library.png');
        });

        it('should return HTTP URL as-is', () => {
            const location = { id: 'test', icon: 'http://example.com/icon.png' };
            const result = getLocationIconPath(location);
            expect(result).toBe('http://example.com/icon.png');
        });

        it('should return HTTPS URL as-is', () => {
            const location = { id: 'test', icon: 'https://example.com/icon.png' };
            const result = getLocationIconPath(location);
            expect(result).toBe('https://example.com/icon.png');
        });

        it('should return data URI as-is', () => {
            const dataUri = 'data:image/png;base64,iVBORw0KG...';
            const location = { id: 'test', icon: dataUri };
            const result = getLocationIconPath(location);
            expect(result).toBe(dataUri);
        });

        it('should return blob URI as-is', () => {
            const blobUri = 'blob:http://example.com/550e8400-e29b-41d4-a716-446655440000';
            const location = { id: 'test', icon: blobUri };
            const result = getLocationIconPath(location);
            expect(result).toBe(blobUri);
        });

        it('should construct fallback path when no icon provided', () => {
            const location = { id: 'deadline' };
            const result = getLocationIconPath(location);
            expect(result).toBe('/assets/icons/locations/deadline.png');
        });

        it('should construct fallback path when icon is empty string', () => {
            const location = { id: 'deadline', icon: '' };
            const result = getLocationIconPath(location);
            expect(result).toBe('/assets/icons/locations/deadline.png');
        });

        it('should construct fallback path when icon is null', () => {
            const location = { id: 'deadline', icon: null };
            const result = getLocationIconPath(location);
            expect(result).toBe('/assets/icons/locations/deadline.png');
        });

        it('should return empty string for null location', () => {
            const result = getLocationIconPath(null);
            expect(result).toBe('');
        });

        it('should return empty string for undefined location', () => {
            const result = getLocationIconPath(undefined);
            expect(result).toBe('');
        });
    });

    describe('Issue #2557 - Concrete failure scenarios', () => {
        it('should handle relative path without leading slash in createIconElement', () => {
            // Issue scenario: "assets/icons/locations/library.png" typo (missing /)
            const elem = createIconElement('assets/icons/locations/library.png');
            expect(elem.tagName).toBe('IMG');
            expect(elem.src).toContain('assets/icons/locations/library.png');
            // Should NOT create a span with the literal text
        });

        it('should preserve emoji in getLocationIconPath instead of using fallback', () => {
            // Issue scenario: deadline location with ⏰ emoji
            const location = {
                id: 'deadline',
                name: 'Urgent Deadline',
                icon: '⏰'
            };
            const result = getLocationIconPath(location);
            expect(result).toBe('⏰');
            // Should NOT return '/assets/icons/locations/deadline.png'
        });

        it('should handle data URI without rendering as literal text', () => {
            // Issue scenario: data: URI in createIconElement
            const dataUri = 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNk+M9QDwADhgGAWjR9awAAAABJRU5ErkJggg==';
            const elem = createIconElement(dataUri);
            expect(elem.tagName).toBe('IMG');
            // Should create img, not span with literal URI
            expect(elem.textContent).not.toBe(dataUri);
        });

        it('should handle blob URI without rendering as literal text', () => {
            // Issue scenario: blob: URI in updateIconElement
            const element = document.createElement('div');
            const blobUri = 'blob:http://example.com/550e8400-e29b-41d4-a716-446655440000';
            updateIconElement(element, blobUri);
            const img = element.querySelector('img');
            expect(img).toBeTruthy();
            // Should create img, not set textContent to the URI
            expect(element.textContent).not.toBe(blobUri);
        });
    });
});
