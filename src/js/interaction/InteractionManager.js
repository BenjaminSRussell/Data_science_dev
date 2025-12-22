/**
 * InteractionManager.js
 * Manages drag-and-drop and other interactions using Interact.js
 * Phase 4: Code Reduction - Using Interact.js instead of custom interaction code
 */

export class InteractionManager {
    constructor() {
        this.interactions = new Map();
        this.interact = null;
    }

    /**
     * Load interactjs library (lazy)
     */
    async loadInteract() {
        if (this.interact) return this.interact;
        
        try {
            const interactModule = await import('interactjs');
            this.interact = interactModule.default || interactModule;
            return this.interact;
        } catch (error) {
            console.warn('interactjs not available:', error);
            return null;
        }
    }

    /**
     * Make element draggable
     * Phase 4: Uses Interact.js
     */
    async makeDraggable(selector, options = {}) {
        const interactLib = await this.loadInteract();
        if (!interactLib) {
            console.warn('interactjs not available for draggable');
            return null;
        }
        
        const {
            onStart = null,
            onMove = null,
            onEnd = null,
            restrict = null,
            snap = null,
            inertia = false
        } = options;

        const position = { x: 0, y: 0 };

        return interactLib(selector).draggable({
            listeners: {
                start(event) {
                    if (onStart) onStart(event);
                },
                move(event) {
                    position.x += event.dx;
                    position.y += event.dy;

                    event.target.style.transform = `translate(${position.x}px, ${position.y}px)`;

                    if (onMove) onMove(event, position);
                },
                end(event) {
                    if (onEnd) onEnd(event);
                }
            },
            restrict: restrict || undefined,
            snap: snap || undefined,
            inertia: inertia
        });
    }

    /**
     * Make element resizable
     */
    async makeResizable(selector, options = {}) {
        const interactLib = await this.loadInteract();
        if (!interactLib) {
            console.warn('interactjs not available for resizable');
            return null;
        }
        
        const {
            onStart = null,
            onMove = null,
            onEnd = null,
            edges = { left: true, right: true, top: true, bottom: true }
        } = options;

        return interactLib(selector).resizable({
            edges,
            listeners: {
                start(event) {
                    if (onStart) onStart(event);
                },
                move(event) {
                    const { width, height } = event.rect;
                    event.target.style.width = `${width}px`;
                    event.target.style.height = `${height}px`;

                    if (onMove) onMove(event, { width, height });
                },
                end(event) {
                    if (onEnd) onEnd(event);
                }
            }
        });
    }

    /**
     * Make element dropzone
     */
    async makeDropzone(selector, options = {}) {
        const interactLib = await this.loadInteract();
        if (!interactLib) {
            console.warn('interactjs not available for dropzone');
            return null;
        }
        
        const {
            onDrop = null,
            onDropEnter = null,
            onDropLeave = null
        } = options;

        return interactLib(selector).dropzone({
            ondrop: onDrop,
            ondropenter: onDropEnter,
            ondropleave: onDropLeave
        });
    }

    /**
     * Make sortable list
     */
    async makeSortable(selector, options = {}) {
        const interactLib = await this.loadInteract();
        if (!interactLib) {
            console.warn('interactjs not available for sortable');
            return;
        }
        
        const {
            onSort = null
        } = options;

        let draggedElement = null;

        interactLib(selector).draggable({
            listeners: {
                start(event) {
                    draggedElement = event.target;
                    event.target.style.opacity = '0.5';
                },
                move(event) {
                    const target = event.target;
                    const x = (parseFloat(target.getAttribute('data-x')) || 0) + event.dx;
                    const y = (parseFloat(target.getAttribute('data-y')) || 0) + event.dy;

                    target.style.transform = `translate(${x}px, ${y}px)`;
                    target.setAttribute('data-x', x);
                    target.setAttribute('data-y', y);
                },
                end(event) {
                    event.target.style.opacity = '';
                    if (onSort && draggedElement) {
                        onSort(draggedElement, event);
                    }
                }
            }
        });
    }

    /**
     * Cleanup interactions
     */
    destroy(selector) {
        if (this.interact) {
            this.interact(selector).unset();
        }
    }
}
