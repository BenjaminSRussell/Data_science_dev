/**
 * Unit tests for DOMUtils
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DOMUtils } from '../../src/js/utils/DOMUtils.js';

describe('DOMUtils', () => {
    let container;

    beforeEach(() => {
        // Create a container for testing DOM operations
        container = document.createElement('div');
        container.id = 'test-container';
        document.body.appendChild(container);
    });

    afterEach(() => {
        // Clean up after each test
        if (container && container.parentNode) {
            container.parentNode.removeChild(container);
        }
    });

    describe('queryAll', () => {
        it('should return array of matching elements', () => {
            // Create test elements
            const btn1 = document.createElement('button');
            btn1.className = 'test-btn';
            const btn2 = document.createElement('button');
            btn2.className = 'test-btn';
            const btn3 = document.createElement('button');
            btn3.className = 'test-btn';

            container.appendChild(btn1);
            container.appendChild(btn2);
            container.appendChild(btn3);

            const results = DOMUtils.queryAll('#test-container .test-btn');
            expect(results).toHaveLength(3);
            expect(results[0]).toBe(btn1);
            expect(results[1]).toBe(btn2);
            expect(results[2]).toBe(btn3);
        });

        it('should return empty array when no elements match', () => {
            const results = DOMUtils.queryAll('#test-container .nonexistent');
            expect(results).toEqual([]);
        });

        it('should return fresh results each call without caching', () => {
            // First call
            const btn1 = document.createElement('button');
            btn1.className = 'test-btn';
            container.appendChild(btn1);

            const results1 = DOMUtils.queryAll('#test-container .test-btn');
            expect(results1).toHaveLength(1);

            // Add another element and call again
            const btn2 = document.createElement('button');
            btn2.className = 'test-btn';
            container.appendChild(btn2);

            const results2 = DOMUtils.queryAll('#test-container .test-btn');
            expect(results2).toHaveLength(2);

            // Verify different array instances were returned
            expect(results1 !== results2).toBe(true);
        });

        it('should return array instance (not NodeList)', () => {
            const btn = document.createElement('button');
            btn.className = 'test-btn';
            container.appendChild(btn);

            const results = DOMUtils.queryAll('#test-container .test-btn');
            expect(Array.isArray(results)).toBe(true);
        });
    });

    describe('query', () => {
        it('should cache query results', () => {
            const div = document.createElement('div');
            div.id = 'cached-element';
            container.appendChild(div);

            const result1 = DOMUtils.query('#cached-element');
            const result2 = DOMUtils.query('#cached-element');

            expect(result1).toBe(result2);
            expect(result1).toBe(div);
        });

        it('should respect cache parameter', () => {
            const div = document.createElement('div');
            div.id = 'uncached-element';
            container.appendChild(div);

            const result1 = DOMUtils.query('#uncached-element', false);
            const result2 = DOMUtils.query('#uncached-element', false);

            // Without caching, should still return the same element reference
            expect(result1).toBe(result2);
            expect(result1).toBe(div);
        });
    });
});
