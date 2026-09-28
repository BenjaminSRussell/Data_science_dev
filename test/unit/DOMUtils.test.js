import { describe, it, expect, beforeEach } from 'vitest';
import { DOMUtils } from '../../src/js/utils/DOMUtils.js';

function addDiv(id) {
    const div = document.createElement('div');
    if (id) div.id = id;
    document.body.appendChild(div);
    return div;
}

describe('DOMUtils', () => {
    beforeEach(() => {
        // queryCache is a static Map shared by every call, and the jsdom body
        // is shared by every test in the file: reset both.
        DOMUtils.queryCache.clear();
        document.body.innerHTML = '';
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

    describe('query(selector, cache=true)', () => {
        it('should populate the cache on the first call', () => {
            const div = addDiv('testDiv');

            expect(DOMUtils.query('#testDiv')).toBe(div);
            expect(DOMUtils.queryCache.get('#testDiv')).toBe(div);
        });

        it('should return the stale cached element after the live one is replaced', () => {
            const original = addDiv('testDiv');
            const firstQuery = DOMUtils.query('#testDiv');

            document.body.removeChild(original);
            const replacement = addDiv('testDiv');

            const secondQuery = DOMUtils.query('#testDiv');
            expect(firstQuery).toBe(original);
            expect(secondQuery).toBe(original);
            expect(secondQuery).not.toBe(replacement);
        });

        it('should not cache a selector that matched nothing', () => {
            expect(DOMUtils.query('#testDiv')).toBe(null);
            expect(DOMUtils.queryCache.has('#testDiv')).toBe(false);

            const div = addDiv('testDiv');
            expect(DOMUtils.query('#testDiv')).toBe(div);
        });

        it('should bypass cache if cache is false', () => {
            const original = addDiv('testDiv');
            DOMUtils.query('#testDiv');

            document.body.removeChild(original);
            const replacement = addDiv('testDiv');

            // Re-queries the DOM instead of reading the cached entry...
            expect(DOMUtils.query('#testDiv', false)).toBe(replacement);
            // ...and leaves the cached entry as it was
            expect(DOMUtils.queryCache.get('#testDiv')).toBe(original);
        });

        it('should not write to the cache if cache is false', () => {
            const div = addDiv('testDiv');

            expect(DOMUtils.query('#testDiv', false)).toBe(div);
            expect(DOMUtils.queryCache.size).toBe(0);
        });
    });

    describe('queryAll(selector)', () => {
        it('should return an array of elements', () => {
            const div1 = addDiv('first');
            const div2 = addDiv('second');

            const elements = DOMUtils.queryAll('div');

            expect(Array.isArray(elements)).toBe(true);
            expect(elements.length).toBe(2);
            expect(elements[0]).toBe(div1);
            expect(elements[1]).toBe(div2);
            expect(elements.map(element => element.id)).toEqual(['first', 'second']);
        });

        it('should return an empty array when nothing matches', () => {
            expect(DOMUtils.queryAll('.missing')).toEqual([]);
        });
    });

    describe('updateElement(elementOrSelector, updates)', () => {
        it('should update textContent', () => {
            const div = addDiv('testDiv');

            DOMUtils.updateElement('#testDiv', { textContent: 'Hello' });

            expect(div.textContent).toBe('Hello');
        });

        it('should update innerHTML, className, style, attributes, and dataset', () => {
            const div = addDiv('testDiv');

            DOMUtils.updateElement('#testDiv', {
                innerHTML: '<span>World</span>',
                className: 'testClass',
                style: { color: 'red' },
                attributes: { 'aria-label': 'value' },
                dataset: { test: 'datasetValue' }
            });

            expect(div.innerHTML).toBe('<span>World</span>');
            expect(div.className).toBe('testClass');
            expect(div.style.color).toBe('red');
            expect(div.getAttribute('aria-label')).toBe('value');
            expect(div.dataset.test).toBe('datasetValue');
        });

        it('should apply innerHTML after textContent when both are given', () => {
            const div = addDiv('testDiv');

            DOMUtils.updateElement('#testDiv', {
                textContent: 'Hello',
                innerHTML: '<span>World</span>'
            });

            expect(div.innerHTML).toBe('<span>World</span>');
            expect(div.textContent).toBe('World');
        });

        it('should accept an element as well as a selector', () => {
            const div = document.createElement('div');

            DOMUtils.updateElement(div, { textContent: 'Detached', className: 'direct' });

            expect(div.textContent).toBe('Detached');
            expect(div.className).toBe('direct');
        });

        it('should leave properties that are not in updates untouched', () => {
            const div = addDiv('testDiv');
            div.className = 'keep';
            div.textContent = 'Keep me';

            DOMUtils.updateElement('#testDiv', { style: { color: 'blue' } });

            expect(div.className).toBe('keep');
            expect(div.textContent).toBe('Keep me');
            expect(div.style.color).toBe('blue');
        });

        it('should do nothing if the selector does not exist', () => {
            const bystander = addDiv('bystander');

            expect(() => DOMUtils.updateElement('#nonExistentDiv', {
                textContent: 'Hello'
            })).not.toThrow();

            expect(document.body.children.length).toBe(1);
            expect(bystander.textContent).toBe('');
        });
    });

    describe('remove(elementOrSelector)', () => {
        it('should remove the element from the DOM and clear the cache', () => {
            const div = addDiv('testDiv');
            DOMUtils.query('#testDiv');
            expect(DOMUtils.queryCache.has('#testDiv')).toBe(true);

            DOMUtils.remove('#testDiv');

            expect(div.parentNode).toBe(null);
            expect(document.getElementById('testDiv')).toBe(null);
            expect(DOMUtils.queryCache.has('#testDiv')).toBe(false);
            expect(DOMUtils.query('#testDiv')).toBe(null);
        });

        it('should run a fresh DOM query for the same id after removal', () => {
            addDiv('testDiv');
            DOMUtils.remove('#testDiv');

            const replacement = addDiv('testDiv');

            expect(DOMUtils.query('#testDiv')).toBe(replacement);
        });

        it('should accept an element as well as a selector', () => {
            const div = addDiv('testDiv');

            DOMUtils.remove(div);

            expect(document.body.contains(div)).toBe(false);
        });
    });

    describe('toggleClass, show, hide, clear', () => {
        it('should toggle a class', () => {
            const div = addDiv('testDiv');

            DOMUtils.toggleClass('#testDiv', 'testClass');
            expect(div.classList.contains('testClass')).toBe(true);

            DOMUtils.toggleClass('#testDiv', 'testClass');
            expect(div.classList.contains('testClass')).toBe(false);
        });

        it('should honour the force argument of toggleClass', () => {
            const div = addDiv('testDiv');

            DOMUtils.toggleClass('#testDiv', 'testClass', true);
            DOMUtils.toggleClass('#testDiv', 'testClass', true);
            expect(div.classList.contains('testClass')).toBe(true);

            DOMUtils.toggleClass('#testDiv', 'testClass', false);
            expect(div.classList.contains('testClass')).toBe(false);
        });

        it('should show an element', () => {
            const div = addDiv('testDiv');
            div.style.display = 'none';
            div.classList.add('hidden');

            DOMUtils.show('#testDiv');
            expect(div.style.display).toBe('');
            expect(div.classList.contains('hidden')).toBe(false);
        });

        it('should hide an element', () => {
            const div = addDiv('testDiv');

            DOMUtils.hide('#testDiv');
            expect(div.style.display).toBe('none');
            expect(div.classList.contains('hidden')).toBe(true);
        });

        it('should clear an element', () => {
            const div = addDiv('testDiv');
            div.innerHTML = '<p>Hello</p><p>World</p>';

            DOMUtils.clear('#testDiv');
            expect(div.innerHTML).toBe('');
            expect(div.childNodes.length).toBe(0);
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

        it('should contribute nothing for operations that return a falsy value or are not nodes', () => {
            const fragment = DOMUtils.batch([
                () => null,
                () => undefined,
                'not a node',
                () => document.createElement('p')
            ]);

            expect(fragment.childNodes.length).toBe(1);
            expect(fragment.childNodes[0].nodeName).toBe('P');
        });
    });
});
