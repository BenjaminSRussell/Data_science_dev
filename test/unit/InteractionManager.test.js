/**
 * Unit tests for InteractionManager
 */

import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { InteractionManager } from '../../src/js/interaction/InteractionManager.js';

// Mock interactjs
const createMockInteract = () => {
    const capturedListeners = {};

    const mockInteract = (selector) => {
        const mockInteractable = {
            draggable: (config) => {
                capturedListeners.draggable = config.listeners;
                return mockInteractable;
            },
            resizable: (config) => {
                capturedListeners.resizable = config.listeners;
                return mockInteractable;
            },
            dropzone: (config) => {
                capturedListeners.dropzone = config;
                return mockInteractable;
            },
            unset: () => {
                return mockInteractable;
            }
        };
        return mockInteractable;
    };

    return { mockInteract, capturedListeners };
};

describe('InteractionManager', () => {
    let interactionManager;
    let mockInteractLib;
    let capturedListeners;

    beforeEach(() => {
        // Setup mock interactjs
        const { mockInteract, capturedListeners: listeners } = createMockInteract();
        mockInteractLib = mockInteract;
        capturedListeners = listeners;

        // Mock the dynamic import
        vi.doMock('interactjs', () => ({
            default: mockInteractLib
        }));

        interactionManager = new InteractionManager();

        // Mock DOM
        document.body.innerHTML = '<div id="test-element" style="position: absolute;"></div>';
    });

    afterEach(() => {
        vi.unmock('interactjs');
        vi.clearAllMocks();
    });

    describe('loadInteract', () => {
        it('should load interactjs on first call and cache it', async () => {
            vi.doMock('interactjs', () => ({
                default: mockInteractLib
            }));

            const interactionMgr = new InteractionManager();
            expect(interactionMgr.interact).toBeNull();

            const result = await interactionMgr.loadInteract();
            expect(result).toBe(mockInteractLib);
            expect(interactionMgr.interact).toBe(mockInteractLib);

            // Second call should return cached version
            const result2 = await interactionMgr.loadInteract();
            expect(result2).toBe(mockInteractLib);
        });

        it('should return null and log warning when import fails', async () => {
            // Create a manager that will fail to load
            const failingInteractMgr = new InteractionManager();
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            // Mock failing import
            vi.doMock('interactjs', () => {
                throw new Error('Module not found');
            });

            const result = await failingInteractMgr.loadInteract();

            expect(result).toBeNull();
            expect(failingInteractMgr.interact).toBeNull();
            expect(warnSpy).toHaveBeenCalledWith(
                expect.stringContaining('interactjs not available'),
                expect.any(Error)
            );

            warnSpy.mockRestore();
        });
    });

    describe('makeDraggable', () => {
        it('should return null when interactjs is not available', async () => {
            const failingMgr = new InteractionManager();
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            vi.doMock('interactjs', () => {
                throw new Error('interactjs not found');
            });

            const result = await failingMgr.makeDraggable('#test-element');

            expect(result).toBeNull();
            expect(warnSpy).toHaveBeenCalled();

            warnSpy.mockRestore();
        });

        it('should make element draggable with accumulated position', async () => {
            await interactionManager.loadInteract();
            const element = document.getElementById('test-element');

            const mockMove = vi.fn();
            await interactionManager.makeDraggable('#test-element', {
                onMove: mockMove
            });

            // Get the captured listeners
            const listeners = capturedListeners.draggable;
            expect(listeners).toBeDefined();
            expect(listeners.move).toBeDefined();

            // Simulate first move event
            const event1 = {
                target: element,
                dx: 5,
                dy: 0
            };
            listeners.move(event1);

            // Check position accumulated correctly
            expect(element.style.transform).toBe('translate(5px, 0px)');
            expect(mockMove).toHaveBeenCalledWith(event1, { x: 5, y: 0 });

            // Simulate second move event
            const event2 = {
                target: element,
                dx: 10,
                dy: 0
            };
            listeners.move(event2);

            // Position should accumulate
            expect(element.style.transform).toBe('translate(15px, 0px)');
            expect(mockMove).toHaveBeenCalledWith(event2, { x: 15, y: 0 });
        });

        it('should not call onStart if not provided', async () => {
            await interactionManager.loadInteract();
            const element = document.getElementById('test-element');

            await interactionManager.makeDraggable('#test-element', {});

            const listeners = capturedListeners.draggable;
            const startEvent = { target: element };

            // Should not throw even though onStart is not provided
            expect(() => listeners.start(startEvent)).not.toThrow();
        });

        it('should call onStart when provided', async () => {
            await interactionManager.loadInteract();
            const element = document.getElementById('test-element');
            const mockStart = vi.fn();

            await interactionManager.makeDraggable('#test-element', {
                onStart: mockStart
            });

            const listeners = capturedListeners.draggable;
            const startEvent = { target: element };

            listeners.start(startEvent);
            expect(mockStart).toHaveBeenCalledWith(startEvent);
        });

        it('should call onEnd when provided', async () => {
            await interactionManager.loadInteract();
            const element = document.getElementById('test-element');
            const mockEnd = vi.fn();

            await interactionManager.makeDraggable('#test-element', {
                onEnd: mockEnd
            });

            const listeners = capturedListeners.draggable;
            const endEvent = { target: element };

            listeners.end(endEvent);
            expect(mockEnd).toHaveBeenCalledWith(endEvent);
        });

        it('should not call onEnd if not provided', async () => {
            await interactionManager.loadInteract();
            const element = document.getElementById('test-element');

            await interactionManager.makeDraggable('#test-element', {});

            const listeners = capturedListeners.draggable;
            const endEvent = { target: element };

            // Should not throw
            expect(() => listeners.end(endEvent)).not.toThrow();
        });

        it('should accumulate position with negative movement', async () => {
            await interactionManager.loadInteract();
            const element = document.getElementById('test-element');

            const mockMove = vi.fn();
            await interactionManager.makeDraggable('#test-element', {
                onMove: mockMove
            });

            const listeners = capturedListeners.draggable;

            // Move right and down
            listeners.move({ target: element, dx: 10, dy: 20 });
            expect(mockMove).toHaveBeenCalledWith(
                expect.objectContaining({ dx: 10, dy: 20 }),
                { x: 10, y: 20 }
            );

            // Move left and up (negative)
            listeners.move({ target: element, dx: -5, dy: -10 });
            expect(mockMove).toHaveBeenCalledWith(
                expect.objectContaining({ dx: -5, dy: -10 }),
                { x: 5, y: 10 }
            );

            expect(element.style.transform).toBe('translate(5px, 10px)');
        });
    });

    describe('makeResizable', () => {
        it('should return null when interactjs is not available', async () => {
            const failingMgr = new InteractionManager();
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            vi.doMock('interactjs', () => {
                throw new Error('interactjs not found');
            });

            const result = await failingMgr.makeResizable('#test-element');

            expect(result).toBeNull();
            expect(warnSpy).toHaveBeenCalled();

            warnSpy.mockRestore();
        });

        it('should set width and height from event.rect', async () => {
            await interactionManager.loadInteract();
            const element = document.getElementById('test-element');

            const mockMove = vi.fn();
            await interactionManager.makeResizable('#test-element', {
                onMove: mockMove
            });

            const listeners = capturedListeners.resizable;
            expect(listeners).toBeDefined();
            expect(listeners.move).toBeDefined();

            const resizeEvent = {
                target: element,
                rect: {
                    width: 100,
                    height: 200
                }
            };

            listeners.move(resizeEvent);

            expect(element.style.width).toBe('100px');
            expect(element.style.height).toBe('200px');
            expect(mockMove).toHaveBeenCalledWith(resizeEvent, { width: 100, height: 200 });
        });

        it('should not call onStart if not provided', async () => {
            await interactionManager.loadInteract();
            const element = document.getElementById('test-element');

            await interactionManager.makeResizable('#test-element', {});

            const listeners = capturedListeners.resizable;
            const startEvent = { target: element };

            expect(() => listeners.start(startEvent)).not.toThrow();
        });

        it('should call onStart when provided', async () => {
            await interactionManager.loadInteract();
            const element = document.getElementById('test-element');
            const mockStart = vi.fn();

            await interactionManager.makeResizable('#test-element', {
                onStart: mockStart
            });

            const listeners = capturedListeners.resizable;
            const startEvent = { target: element };

            listeners.start(startEvent);
            expect(mockStart).toHaveBeenCalledWith(startEvent);
        });

        it('should call onEnd when provided', async () => {
            await interactionManager.loadInteract();
            const element = document.getElementById('test-element');
            const mockEnd = vi.fn();

            await interactionManager.makeResizable('#test-element', {
                onEnd: mockEnd
            });

            const listeners = capturedListeners.resizable;
            const endEvent = { target: element };

            listeners.end(endEvent);
            expect(mockEnd).toHaveBeenCalledWith(endEvent);
        });
    });

    describe('makeSortable', () => {
        it('should set opacity to 0.5 on start', async () => {
            await interactionManager.loadInteract();
            const element = document.getElementById('test-element');

            await interactionManager.makeSortable('#test-element', {});

            const listeners = capturedListeners.draggable;
            listeners.start({ target: element });

            expect(element.style.opacity).toBe('0.5');
        });

        it('should reset opacity on end', async () => {
            await interactionManager.loadInteract();
            const element = document.getElementById('test-element');
            element.style.opacity = '0.5';

            await interactionManager.makeSortable('#test-element', {});

            const listeners = capturedListeners.draggable;
            listeners.end({ target: element });

            expect(element.style.opacity).toBe('');
        });

        it('should call onSort when both onSort and draggedElement exist', async () => {
            await interactionManager.loadInteract();
            const element = document.getElementById('test-element');
            const mockSort = vi.fn();

            await interactionManager.makeSortable('#test-element', {
                onSort: mockSort
            });

            const listeners = capturedListeners.draggable;

            // First start the drag
            listeners.start({ target: element });

            // Then end it
            const endEvent = { target: element };
            listeners.end(endEvent);

            expect(mockSort).toHaveBeenCalledWith(element, endEvent);
        });

        it('should not call onSort if onSort is not provided', async () => {
            await interactionManager.loadInteract();
            const element = document.getElementById('test-element');

            await interactionManager.makeSortable('#test-element', {});

            const listeners = capturedListeners.draggable;
            listeners.start({ target: element });

            // Should not throw
            expect(() => listeners.end({ target: element })).not.toThrow();
        });

        it('should not call onSort if draggedElement is not tracked', async () => {
            await interactionManager.loadInteract();
            const element = document.getElementById('test-element');
            const mockSort = vi.fn();

            await interactionManager.makeSortable('#test-element', {
                onSort: mockSort
            });

            const listeners = capturedListeners.draggable;

            // End without starting (draggedElement will be null)
            listeners.end({ target: element });

            expect(mockSort).not.toHaveBeenCalled();
        });

        it('should return null when interactjs is not available', async () => {
            const failingMgr = new InteractionManager();
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            vi.doMock('interactjs', () => {
                throw new Error('interactjs not found');
            });

            const result = await failingMgr.makeSortable('#test-element');

            expect(result).toBeUndefined();
            expect(warnSpy).toHaveBeenCalled();

            warnSpy.mockRestore();
        });
    });

    describe('destroy', () => {
        it('should be a no-op when interact was never loaded', () => {
            const unsetSpy = vi.fn();
            const mockInteractNeverLoaded = (selector) => ({
                unset: unsetSpy
            });

            const mgr = new InteractionManager();
            // Don't load interact, so it stays null

            mgr.destroy('#test-element');

            expect(unsetSpy).not.toHaveBeenCalled();
        });

        it('should call interact(selector).unset() when interact is loaded', async () => {
            await interactionManager.loadInteract();

            const unsetSpy = vi.fn().mockReturnValue({});
            const mockInteractWithUnset = (selector) => ({
                unset: unsetSpy
            });

            // Replace the interact lib with one that has unset spy
            interactionManager.interact = mockInteractWithUnset;

            interactionManager.destroy('#test-element');

            expect(unsetSpy).toHaveBeenCalled();
        });
    });

    describe('makeDropzone', () => {
        it('should return null when interactjs is not available', async () => {
            const failingMgr = new InteractionManager();
            const warnSpy = vi.spyOn(console, 'warn').mockImplementation(() => {});

            vi.doMock('interactjs', () => {
                throw new Error('interactjs not found');
            });

            const result = await failingMgr.makeDropzone('#test-element');

            expect(result).toBeNull();
            expect(warnSpy).toHaveBeenCalled();

            warnSpy.mockRestore();
        });

        it('should create dropzone with handlers', async () => {
            await interactionManager.loadInteract();

            const mockDrop = vi.fn();
            const mockDropEnter = vi.fn();
            const mockDropLeave = vi.fn();

            await interactionManager.makeDropzone('#test-element', {
                onDrop: mockDrop,
                onDropEnter: mockDropEnter,
                onDropLeave: mockDropLeave
            });

            const dropzoneConfig = capturedListeners.dropzone;
            expect(dropzoneConfig).toBeDefined();
            expect(dropzoneConfig.ondrop).toBe(mockDrop);
            expect(dropzoneConfig.ondropenter).toBe(mockDropEnter);
            expect(dropzoneConfig.ondropleave).toBe(mockDropLeave);
        });
    });
});
