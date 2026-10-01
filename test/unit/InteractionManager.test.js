import { expect } from 'chai';
import { InteractionManager } from '../../src/js/interaction/InteractionManager.js';

describe('InteractionManager', () => {
    let container;
    let interactionManager;

    beforeEach(() => {
        interactionManager = new InteractionManager();
        container = document.createElement('div');
        document.body.appendChild(container);
    });

    afterEach(() => {
        if (container && container.parentNode) {
            document.body.removeChild(container);
        }
        interactionManager.destroy('.card');
        interactionManager.destroy('.draggable');
    });

    describe('makeDraggable', () => {
        it('should track position independently for each element matched by a selector', async function() {
            // Create multiple draggable cards matching a selector
            const card1 = document.createElement('div');
            card1.className = 'card';
            card1.style.position = 'absolute';
            container.appendChild(card1);

            const card2 = document.createElement('div');
            card2.className = 'card';
            card2.style.position = 'absolute';
            container.appendChild(card2);

            // Make both cards draggable using a selector
            const interactLib = await interactionManager.loadInteract();
            if (!interactLib) {
                this.skip();
                return;
            }

            await interactionManager.makeDraggable('.card', {});

            // Get the draggable instance to access its listeners
            const draggable = interactLib('.card');
            const listeners = draggable.options.drag.listeners;

            if (listeners && listeners.move) {
                // Simulate dragging card1 by (100, 50)
                listeners.move({
                    target: card1,
                    dx: 100,
                    dy: 50
                });

                // card1 should be at transform(100px, 50px)
                expect(card1.style.transform).to.equal('translate(100px, 50px)');

                // Now drag card2 by (10, 10)
                listeners.move({
                    target: card2,
                    dx: 10,
                    dy: 10
                });

                // card2 should be at (10, 10), NOT (110, 60) as the bug would cause
                // (because the old code shares a single position object across all elements)
                expect(card2.style.transform).to.equal('translate(10px, 10px)');

                // Verify card1 is unchanged
                expect(card1.style.transform).to.equal('translate(100px, 50px)');
            }
        });

        it('should not accumulate position from previous drags when switching between elements', async function() {
            const item1 = document.createElement('div');
            item1.className = 'draggable';
            item1.style.position = 'absolute';
            container.appendChild(item1);

            const item2 = document.createElement('div');
            item2.className = 'draggable';
            item2.style.position = 'absolute';
            container.appendChild(item2);

            const interactLib = await interactionManager.loadInteract();
            if (!interactLib) {
                this.skip();
                return;
            }

            await interactionManager.makeDraggable('.draggable', {});

            const draggable = interactLib('.draggable');
            const listeners = draggable.options.drag.listeners;

            if (listeners && listeners.move) {
                // Drag item1 by (50, 50)
                listeners.move({ target: item1, dx: 50, dy: 50 });
                expect(item1.style.transform).to.equal('translate(50px, 50px)');

                // Drag item1 again by (30, 20)
                listeners.move({ target: item1, dx: 30, dy: 20 });

                // item1 should be at cumulative (80, 70)
                expect(item1.style.transform).to.equal('translate(80px, 70px)');

                // Now drag item2 by (15, 25)
                listeners.move({ target: item2, dx: 15, dy: 25 });

                // item2 should be at (15, 25), not inheriting item1's accumulated offset
                // In the buggy version, item2 would be at (95, 95) = (80 + 15, 70 + 25)
                expect(item2.style.transform).to.equal('translate(15px, 25px)');
            }
        });
    });
});
