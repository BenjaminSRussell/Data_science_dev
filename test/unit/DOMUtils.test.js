import { describe, it, expect, beforeEach } from 'vitest';
import { DOMUtils } from '../src/DOMUtils';

describe('DOMUtils', () => {
    beforeEach(() => {
        // Clear the query cache before each test
        DOMUtils.queryCache.clear();
    });

    describe('query(selector, cache=true)', () => {
        it('should return the cached element if cache is true', () => {
            const div = document.createElement('div');
            div.id = 'testDiv';
            document.body.appendChild(div);

            const firstQuery = DOMUtils.query('#testDiv');
            const secondQuery = DOMUtils.query('#testDiv');

            expect(firstQuery).toBe(secondQuery);
        });

        it('should return a new element if the cached one is removed', () => {
            const div = document.createElement('div');
            div.id = 'testDiv';
            document.body.appendChild(div);

            const firstQuery = DOMUtils.query('#testDiv');
            document.body.removeChild(div);

            const secondQuery = DOMUtils.query('#testDiv');
            expect(firstQuery).not.toBe(secondQuery);
        });

        it('should bypass cache if cache is false', () => {
            const div = document.createElement('div');
            div.id = 'testDiv';
            document.body.appendChild(div);

            const firstQuery = DOMUtils.query('#testDiv', false);
            const secondQuery = DOMUtils.query('#testDiv', false);

            expect(firstQuery).not.toBe(secondQuery);
        });
    });

    describe('queryAll(selector)', () => {
        it('should return an array of elements', () => {
            const div1 = document.createElement('div');
            const div2 = document.createElement('div');
            document.body.appendChild(div1);
            document.body.appendChild(div2);

            const elements = DOMUtils.queryAll('div');

            expect(Array.isArray(elements)).toBe(true);
            expect(elements.length).toBe(2);
            expect(elements[0]).toBe(div1);
            expect(elements[1]).toBe(div2);
        });
    });

    describe('updateElement(elementOrSelector, updates)', () => {
        it('should update textContent, innerHTML, className, style, attributes, and dataset', () => {
            const div = document.createElement('div');
            div.id = 'testDiv';
            document.body.appendChild(div);

            DOMUtils.updateElement('#testDiv', {
                textContent: 'Hello',
                innerHTML: '<span>World</span>',
                className: 'testClass',
                style: { color: 'red' },
                attributes: { 'data-test': 'value' },
                dataset: { test: 'datasetValue' }
            });

            expect(div.textContent).toBe('Hello');
            expect(div.innerHTML).toBe('<span>World</span>');
            expect(div.className).toBe('testClass');
            expect(div.style.color).toBe('red');
            expect(div.getAttribute('data-test')).toBe('value');
            expect(div.dataset.test).toBe('datasetValue');
        });

        it('should do nothing if the selector does not exist', () => {
            DOMUtils.updateElement('#nonExistentDiv', {
                textContent: 'Hello'
            });

            expect(DOMUtils.query('#nonExistentDiv')).toBe(null);
        });
    });

    describe('remove(elementOrSelector)', () => {
        it('should remove the element from the DOM and clear the cache', () => {
            const div = document.createElement('div');
            div.id = 'testDiv';
            document.body.appendChild(div);

            DOMUtils.remove('#testDiv');

            expect(DOMUtils.query('#testDiv')).toBe(null);
            expect(document.getElementById('testDiv')).toBe(null);
        });
    });

    describe('toggleClass, show, hide, clear', () => {
        it('should toggle a class', () => {
            const div = document.createElement('div');
            div.id = 'testDiv';
            document.body.appendChild(div);

            DOMUtils.toggleClass('#testDiv', 'testClass');
            expect(div.classList.contains('testClass')).toBe(true);

            DOMUtils.toggleClass('#testDiv', 'testClass');
            expect(div.classList.contains('testClass')).toBe(false);
        });

        it('should show an element', () => {
            const div = document.createElement('div');
            div.id = 'testDiv';
            div.style.display = 'none';
            div.classList.add('hidden');
            document.body.appendChild(div);

            DOMUtils.show('#testDiv');
            expect(div.style.display).toBe('');
            expect(div.classList.contains('hidden')).toBe(false);
        });

        it('should hide an element', () => {
            const div = document.createElement('div');
            div.id = 'testDiv';
            document.body.appendChild(div);

            DOMUtils.hide('#testDiv');
            expect(div.style.display).toBe('none');
            expect(div.classList.contains('hidden')).toBe(true);
        });

        it('should clear an element', () => {
            const div = document.createElement('div');
            div.id = 'testDiv';
            div.innerHTML = 'Hello World';
            document.body.appendChild(div);

            DOMUtils.clear('#testDiv');
            expect(div.innerHTML).toBe('');
        });
    });

    describe('batch(operations)', () => {
        it('should return a DocumentFragment with function-return elements and direct Node instances', () => {
            const fragment = DOMUtils.batch([
                () => document.createElement('div'),
                document.createElement('span')
            ]);

            expect(fragment.nodeType).toBe(Node.DOCUMENT_FRAGMENT_NODE);
            expect(fragment.childNodes.length).toBe(2);
            expect(fragment.childNodes[0].nodeName).toBe('DIV');
            expect(fragment.childNodes[1].nodeName).toBe('SPAN');
        });
    });
});