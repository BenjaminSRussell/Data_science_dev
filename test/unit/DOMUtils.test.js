import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { DOMUtils } from '../../src/js/utils/DOMUtils.js';

describe('DOMUtils', () => {
    beforeEach(() => {
        document.body.innerHTML = ''; // Clear body before each test
    });

    afterEach(() => {
        document.body.innerHTML = ''; // Clear body after each test
    });

    describe('createElement', () => {
        it('should create a bare element with no options', () => {
            const element = DOMUtils.createElement('div');
            expect(element.tagName).toBe('DIV');
            expect(element.className).toBe('');
            expect(element.id).toBe('');
            expect(element.textContent).toBe('');
            expect(element.innerHTML).toBe('');
            expect(element.style.cssText).toBe('');
            expect(element.dataset).toEqual({});
            expect(element.hasEventListeners('click')).toBe(false);
        });

        it('should set className, id, textContent, innerHTML, attributes, style, and dataset', () => {
            const options = {
                className: 'test-class',
                id: 'test-id',
                textContent: 'Hello',
                innerHTML: '<span>World</span>',
                attributes: { 'data-test': 'value' },
                style: { color: 'red', fontSize: '16px' },
                dataset: { key: 'value' },
                listeners: { click: () => {} }
            };
            const element = DOMUtils.createElement('div', options);

            expect(element.className).toBe('test-class');
            expect(element.id).toBe('test-id');
            expect(element.textContent).toBe('Hello');
            expect(element.innerHTML).toBe('<span>World</span>');
            expect(element.getAttribute('data-test')).toBe('value');
            expect(element.style.color).toBe('red');
            expect(element.style.fontSize).toBe('16px');
            expect(element.dataset.key).toBe('value');
            expect(element.hasEventListeners('click')).toBe(true);
        });
    });

    describe('createContainer', () => {
        it('should create a container with string children', () => {
            const container = DOMUtils.createContainer({}, 'Hello', ' ', 'World');
            expect(container.tagName).toBe('DIV');
            expect(container.textContent).toBe('Hello World');
        });

        it('should create a container with DOM-node children', () => {
            const child1 = document.createElement('span');
            child1.textContent = 'Hello';
            const child2 = document.createElement('span');
            child2.textContent = 'World';
            const container = DOMUtils.createContainer({}, child1, child2);
            expect(container.tagName).toBe('DIV');
            expect(container.children.length).toBe(2);
            expect(container.children[0].textContent).toBe('Hello');
            expect(container.children[1].textContent).toBe('World');
        });

        it('should skip falsy children', () => {
            const container = DOMUtils.createContainer({}, 'Hello', null, undefined, false, 'World');
            expect(container.tagName).toBe('DIV');
            expect(container.textContent).toBe('Hello World');
        });
    });

    describe('getOrCreate', () => {
        it('should return an existing element by selector', () => {
            const existingElement = document.createElement('div');
            existingElement.id = 'test-id';
            document.body.appendChild(existingElement);
            const element = DOMUtils.getOrCreate('#test-id', 'div');
            expect(element).toBe(existingElement);
        });

        it('should create a new element and append it to the body', () => {
            const element = DOMUtils.getOrCreate('#test-id', 'div');
            expect(element.tagName).toBe('DIV');
            expect(element.id).toBe('test-id');
            expect(document.body.contains(element)).toBe(true);
        });

        it('should create a new element and append it to a specified parent', () => {
            const parent = document.createElement('div');
            parent.id = 'parent-id';
            document.body.appendChild(parent);
            const element = DOMUtils.getOrCreate('#child-id', 'div', { parent });
            expect(element.tagName).toBe('DIV');
            expect(element.id).toBe('child-id');
            expect(parent.contains(element)).toBe(true);
        });
    });
});