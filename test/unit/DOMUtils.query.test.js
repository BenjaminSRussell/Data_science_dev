import { describe, it, expect, beforeEach } from 'vitest';
import { DOMUtils } from '../../src/js/utils/DOMUtils.js';

describe('DOMUtils query/update/remove/batch (#478)', () => {
    beforeEach(() => {
        DOMUtils.queryCache.clear();
        document.body.innerHTML = '';
    });

    it('query caches by selector and returns the stale node after replacement', () => {
        document.body.innerHTML = '<div id="a">old</div>';
        const first = DOMUtils.query('#a');
        expect(DOMUtils.queryCache.has('#a')).toBe(true);
        document.body.innerHTML = '<div id="a">new</div>';
        expect(DOMUtils.query('#a')).toBe(first);
        const fresh = DOMUtils.query('#a', false);
        expect(fresh).not.toBe(first);
        expect(fresh.textContent).toBe('new');
    });

    it('query does not cache misses', () => {
        expect(DOMUtils.query('#nope')).toBeNull();
        expect(DOMUtils.queryCache.has('#nope')).toBe(false);
    });

    it('queryAll returns a real array', () => {
        document.body.innerHTML = '<i class="x">1</i><i class="x">2</i>';
        const all = DOMUtils.queryAll('.x');
        expect(Array.isArray(all)).toBe(true);
        expect(all.map(e => e.textContent)).toEqual(['1', '2']);
    });

    it('updateElement accepts an element or selector and applies each field', () => {
        document.body.innerHTML = '<div id="u"></div>';
        DOMUtils.updateElement('#u', {
            textContent: 'hi',
            className: 'c1 c2',
            style: { color: 'red' },
            attributes: { title: 'tip' },
            dataset: { role: 'npc' }
        });
        const el = document.getElementById('u');
        expect(el.textContent).toBe('hi');
        expect(el.className).toBe('c1 c2');
        expect(el.style.color).toBe('red');
        expect(el.getAttribute('title')).toBe('tip');
        expect(el.dataset.role).toBe('npc');
        DOMUtils.updateElement(el, { innerHTML: '<b>x</b>' });
        expect(el.innerHTML).toBe('<b>x</b>');
        expect(() => DOMUtils.updateElement('#missing', { textContent: 'x' })).not.toThrow();
    });

    it('remove detaches the node and drops its #id cache entry', () => {
        document.body.innerHTML = '<div id="r"></div>';
        DOMUtils.query('#r');
        DOMUtils.remove('#r');
        expect(document.getElementById('r')).toBeNull();
        expect(DOMUtils.queryCache.has('#r')).toBe(false);
        document.body.innerHTML = '<div id="r">again</div>';
        expect(DOMUtils.query('#r').textContent).toBe('again');
    });

    it('toggleClass / show / hide / clear', () => {
        document.body.innerHTML = '<div id="t"><span>x</span></div>';
        const el = document.getElementById('t');
        DOMUtils.toggleClass(el, 'on');
        expect(el.classList.contains('on')).toBe(true);
        DOMUtils.toggleClass(el, 'on', true);
        expect(el.classList.contains('on')).toBe(true);
        DOMUtils.hide(el);
        expect(el.style.display).toBe('none');
        expect(el.classList.contains('hidden')).toBe(true);
        DOMUtils.show(el);
        expect(el.style.display).toBe('');
        expect(el.classList.contains('hidden')).toBe(false);
        DOMUtils.clear(el);
        expect(el.innerHTML).toBe('');
    });

    it('batch builds a fragment in order and skips falsy results', () => {
        const a = document.createElement('a');
        const frag = DOMUtils.batch([
            () => document.createElement('p'),
            a,
            () => null,
            'not a node',
            () => document.createElement('span')
        ]);
        expect(frag).toBeInstanceOf(DocumentFragment);
        expect([...frag.childNodes].map(n => n.nodeName)).toEqual(['P', 'A', 'SPAN']);
    });
});
