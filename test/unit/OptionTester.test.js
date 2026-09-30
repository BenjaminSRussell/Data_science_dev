import { expect } from 'chai';
import { OptionTester } from '../../src/js/dev/OptionTester.js';

describe('OptionTester', () => {
    let tester;
    let mockGame;

    beforeEach(() => {
        mockGame = {
            screenManager: {
                showScreen: () => {}
            }
        };
        tester = new OptionTester(mockGame);
    });

    afterEach(() => {
        // Clean up any test elements
        const testElements = document.querySelectorAll('[data-test-element]');
        testElements.forEach(el => el.remove());
    });

    describe('getAllButtons', () => {
        it('should exclude buttons inside #dev-menu', () => {
            // Create a dev menu
            const devMenu = document.createElement('div');
            devMenu.id = 'dev-menu';

            // Create a button inside dev menu
            const devMenuBtn = document.createElement('button');
            devMenuBtn.textContent = 'Dev Button';
            devMenuBtn.setAttribute('data-test-element', 'true');
            devMenu.appendChild(devMenuBtn);

            // Create a button outside dev menu
            const regularBtn = document.createElement('button');
            regularBtn.textContent = 'Regular Button';
            regularBtn.setAttribute('data-test-element', 'true');

            document.body.appendChild(devMenu);
            document.body.appendChild(regularBtn);

            const buttons = tester.getAllButtons();

            // Regular button should be included
            expect(buttons).to.include(regularBtn);

            // Dev menu button should NOT be included
            expect(buttons).to.not.include(devMenuBtn);

            devMenu.remove();
            regularBtn.remove();
        });

        it('should exclude buttons with dev- in their id', () => {
            const devBtn = document.createElement('button');
            devBtn.id = 'dev-test-button';
            devBtn.setAttribute('data-test-element', 'true');

            const regularBtn = document.createElement('button');
            regularBtn.id = 'regular-button';
            regularBtn.setAttribute('data-test-element', 'true');

            document.body.appendChild(devBtn);
            document.body.appendChild(regularBtn);

            const buttons = tester.getAllButtons();

            expect(buttons).to.include(regularBtn);
            expect(buttons).to.not.include(devBtn);

            devBtn.remove();
            regularBtn.remove();
        });

        it('should deduplicate buttons using Set', () => {
            const btn = document.createElement('button');
            btn.className = 'clickable nav-btn';
            btn.setAttribute('data-test-element', 'true');

            document.body.appendChild(btn);

            const buttons = tester.getAllButtons();

            // Count occurrences of this button in the results
            const count = buttons.filter(b => b === btn).length;
            expect(count).to.equal(1, 'Button should appear exactly once despite multiple selectors');

            btn.remove();
        });

        it('should find buttons by multiple selectors', () => {
            const button1 = document.createElement('button');
            button1.setAttribute('data-test-element', 'true');

            const button2 = document.createElement('div');
            button2.setAttribute('role', 'button');
            button2.className = 'clickable';
            button2.setAttribute('data-test-element', 'true');

            const button3 = document.createElement('div');
            button3.className = 'nav-btn';
            button3.setAttribute('data-test-element', 'true');

            document.body.appendChild(button1);
            document.body.appendChild(button2);
            document.body.appendChild(button3);

            const buttons = tester.getAllButtons();

            expect(buttons).to.include(button1);
            expect(buttons).to.include(button2);
            expect(buttons).to.include(button3);

            button1.remove();
            button2.remove();
            button3.remove();
        });

        it('should return an array', () => {
            const btn = document.createElement('button');
            btn.setAttribute('data-test-element', 'true');
            document.body.appendChild(btn);

            const buttons = tester.getAllButtons();

            expect(Array.isArray(buttons)).to.be.true;

            btn.remove();
        });
    });

    describe('testAll', () => {
        it('should return results object with proper structure', async () => {
            const btn = document.createElement('button');
            btn.setAttribute('data-test-element', 'true');
            document.body.appendChild(btn);

            const results = await tester.testAll();

            expect(results).to.have.property('total');
            expect(results).to.have.property('passed');
            expect(results).to.have.property('failed');
            expect(results).to.have.property('errors');
            expect(results).to.have.property('screens');

            expect(results.total).to.be.a('number');
            expect(results.passed).to.be.a('number');
            expect(results.failed).to.be.a('number');
            expect(Array.isArray(results.errors)).to.be.true;
            expect(Array.isArray(results.screens)).to.be.true;

            btn.remove();
        });

        it('should exclude dev-menu buttons from testing', async () => {
            // Create dev menu
            const devMenu = document.createElement('div');
            devMenu.id = 'dev-menu';

            const resetBtn = document.createElement('button');
            resetBtn.id = 'dev-reset-state';
            resetBtn.textContent = 'Reset State';
            devMenu.appendChild(resetBtn);

            document.body.appendChild(devMenu);

            // Create a normal button
            const normalBtn = document.createElement('button');
            normalBtn.textContent = 'Normal Button';
            normalBtn.setAttribute('data-test-element', 'true');
            document.body.appendChild(normalBtn);

            const results = await tester.testAll();

            // Both should exist in the page, but getAllButtons should only return normal buttons
            const allButtons = tester.getAllButtons();
            expect(allButtons).to.include(normalBtn);
            expect(allButtons).to.not.include(resetBtn);

            devMenu.remove();
            normalBtn.remove();
        });
    });
});
