```javascript
/**
 * Unit tests for InteractionManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { InteractionManager } from '../../src/js/interaction/InteractionManager.js';

describe('InteractionManager', () => {
    let interactionManager;
    let mockInteract;

    beforeEach(() => {
        mockInteract = {
            draggable: vi.fn(),
            resizable: vi.fn(),
            dropzone: vi.fn(),
            unset: vi.fn()
        };

        vi.mock('interactjs', () => ({
            default: vi.fn(() => mockInteract)
        }));

        interactionManager = new InteractionManager();
    });

    describe('loadInteract', () => {
        it('should resolve with interactjs instance', async () => {
            await interactionManager.loadInteract();
            expect(interactionManager.interact).toBe(mockInteract);
        });

        it('should log warning and return null if interactjs import fails', async () => {
            const mockConsoleWarn = vi.spyOn(console, 'warn');
            vi.mock('interactjs', () => ({
                default: vi.fn(() => Promise.reject(new Error('Mock reject')))
            }));

            const result = await interactionManager.loadInteract();
            expect(result).toBeNull();
            expect(mockConsoleWarn).toHaveBeenCalledWith('Failed to load interactjs:', expect.any(Error));
        });
    });

    describe('makeDraggable', () => {
        let mockElement;

        beforeEach(() => {
            mockElement = document.createElement('div');
            document.body.appendChild(mockElement);
        });

        afterEach(() => {
            document.body.removeChild(mockElement);
        });

        it('should do nothing if interactjs is not loaded', () => {
            interactionManager.interact = null;
            interactionManager.makeDraggable(mockElement, {});
            expect(mockInteract.draggable).not.toHaveBeenCalled();
        });

        it('should set up draggable with correct listeners', () => {
            interactionManager.makeDraggable(mockElement, {
                onMove: vi.fn(),
                onStart: vi.fn(),
                onEnd: vi.fn()
            });

            const [{ listeners }] = mockInteract.draggable.mock.calls[0][0].onstart;
            listeners.start({ target: mockElement });
            listeners.move({ target: mockElement, dx: 5 });
            listeners.move({ target: mockElement, dx: 10 });

            expect(mockElement.style.transform).toBe('translate(15px, 0px)');
        });

        it('should call onStart and onEnd if provided', () => {
            const onStart = vi.fn();
            const onEnd = vi.fn();
            interactionManager.makeDraggable(mockElement, { onStart, onEnd });

            const [{ listeners }] = mockInteract.draggable.mock.calls[0][0].onstart;
            listeners.start({ target: mockElement });
            listeners.end({ target: mockElement });

            expect(onStart).toHaveBeenCalled();
            expect(onEnd).toHaveBeenCalled();
        });
    });

    describe('makeResizable', () => {
        let mockElement;

        beforeEach(() => {
            mockElement = document.createElement('div');
            document.body.appendChild(mockElement);
        });

        afterEach(() => {
            document.body.removeChild(mockElement);
        });

        it('should do nothing if interactjs is not loaded', () => {
            interactionManager.interact = null;
            interactionManager.makeResizable(mockElement, {});
            expect(mockInteract.resizable).not.toHaveBeenCalled();
        });

        it('should set up resizable with correct listeners', () => {
            interactionManager.makeResizable(mockElement, {
                onMove: vi.fn()
            });

            const [{ listeners }] = mockInteract.resizable.mock.calls[0][0].onmove;
            listeners.move({ target: mockElement, rect: { width: 100, height: 200 } });

            expect(mockElement.style.width).toBe('100px');
            expect(mockElement.style.height).toBe('200px');
        });
    });

    describe('makeSortable', () => {
        let mockElements;

        beforeEach(() => {
            mockElements = Array.from({ length: 3 }, (_, i) => {
                const element = document.createElement('div');
                element.dataset.sortId = i;
                document.body.appendChild(element);
                return element;
            });
        });

        afterEach(() => {
            mockElements.forEach(element => document.body.removeChild(element));
        });

        it('should do nothing if interactjs is not loaded', () => {
            interactionManager.interact = null;
            interactionManager.makeSortable(mockElements[0], {});
            expect(mockInteract.draggable).not.toHaveBeenCalled();
        });

        it('should set up sortable with correct listeners', () => {
            interactionManager.makeSortable(mockElements[0], {
                onSort: vi.fn()
            });

            const [{ listeners }] = mockInteract.draggable.mock.calls[0][0].onstart;
            listeners.start({ target: mockElements[0] });

            expect(mockElements[0].style.opacity).toBe('0.5');

            listeners.end({ target: mockElements[0] });

            expect(mockElements[0].style.opacity).toBe('');
        });

        it('should call onSort if provided', () => {
            const onSort = vi.fn();
            interactionManager.makeSortable(mockElements[0], { onSort });

            const [{ listeners }] = mockInteract.draggable.mock.calls[0][0].onstart;
            listeners.start({ target: mockElements[0] });
            listeners.end({ target: mockElements[0] });

            expect(onSort).toHaveBeenCalled();
        });
    });

    describe('destroy', () => {
        it('should do nothing if interactjs is not loaded', () => {
            interactionManager.interact = null;
            interactionManager.destroy(mockElements[0]);
            expect(mockInteract.unset).not.toHaveBeenCalled();
        });

        it('should unset interactjs from the element', () => {
            interactionManager.interact = mockInteract;
            interactionManager.destroy(mockElements[0]);
            expect(mockInteract.unset).toHaveBeenCalledWith(mockElements[0]);
        });
    });
});