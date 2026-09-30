import { expect } from 'chai';
import { DevMenu } from '../../src/js/dev/DevMenu.js';
import { OptionTester } from '../../src/js/dev/OptionTester.js';

describe('DevMenu', () => {
    let devMenu;
    let mockGame;

    beforeEach(() => {
        // Mock game with necessary methods
        mockGame = {
            screenManager: {
                showScreen: () => {}
            },
            showToast: () => {},
            showError: () => {}
        };

        // Create a mock devTools with OptionTester
        const mockOptionTester = new OptionTester(mockGame);
        window.devTools = {
            optionTester: mockOptionTester
        };

        // Mock localStorage
        window.localStorage = {
            getItem: function() { return 'true'; },
            setItem: function() { },
            removeItem: function() { }
        };

        // Mock location
        Object.defineProperty(window, 'location', {
            value: { hostname: 'localhost' },
            writable: true,
            configurable: true
        });
    });

    afterEach(() => {
        if (devMenu && devMenu.menuContainer) {
            devMenu.menuContainer.remove();
        }
        const toggleBtn = document.getElementById('dev-menu-toggle');
        if (toggleBtn) {
            toggleBtn.remove();
        }
        delete window.devTools;
    });

    describe('testAllOptions', () => {
        it('should call optionTester.testAll instead of the unsafe duplicate', async () => {
            devMenu = new DevMenu(mockGame);

            let testAllCalled = false;
            const originalTestAll = window.devTools.optionTester.testAll;
            window.devTools.optionTester.testAll = async function() {
                testAllCalled = true;
                return {
                    total: 5,
                    passed: 5,
                    failed: 0,
                    errors: [],
                    screens: []
                };
            };

            let toastMessage = '';
            mockGame.showToast = function(msg) {
                toastMessage = msg;
            };

            await devMenu.testAllOptions();

            expect(testAllCalled).to.be.true;
            expect(toastMessage).to.include('Options tested: 5');
            expect(toastMessage).to.include('Passed: 5');
            expect(toastMessage).to.include('Failed: 0');

            window.devTools.optionTester.testAll = originalTestAll;
        });

        it('should show error if optionTester is not available', async () => {
            delete window.devTools;
            devMenu = new DevMenu(mockGame);

            let errorShown = false;
            mockGame.showError = function() {
                errorShown = true;
            };

            await devMenu.testAllOptions();

            expect(errorShown).to.be.true;
        });

        it('should display test results including failures count', async () => {
            devMenu = new DevMenu(mockGame);

            window.devTools.optionTester.testAll = async function() {
                return {
                    total: 10,
                    passed: 8,
                    failed: 2,
                    errors: [
                        { element: 'btn1', error: 'Error 1' },
                        { element: 'btn2', error: 'Error 2' }
                    ],
                    screens: []
                };
            };

            let toastMessage = '';
            mockGame.showToast = function(msg) {
                toastMessage = msg;
            };

            await devMenu.testAllOptions();

            expect(toastMessage).to.include('Options tested: 10');
            expect(toastMessage).to.include('Passed: 8');
            expect(toastMessage).to.include('Failed: 2');
        });

        it('should use the real OptionTester which excludes dev-menu buttons', async () => {
            // Create dev menu structure with a button
            const devMenuEl = document.createElement('div');
            devMenuEl.id = 'dev-menu';

            const devBtn = document.createElement('button');
            devBtn.id = 'dev-reset-btn';
            devBtn.textContent = 'Reset';
            devMenuEl.appendChild(devBtn);

            document.body.appendChild(devMenuEl);

            // Create a normal button
            const normalBtn = document.createElement('button');
            normalBtn.textContent = 'Normal';
            document.body.appendChild(normalBtn);

            devMenu = new DevMenu(mockGame);

            // Track what buttons would be tested
            const buttonIds = [];
            const originalTestAll = window.devTools.optionTester.testAll;
            window.devTools.optionTester.testAll = async function() {
                // Capture the buttons that getAllButtons returns
                const buttons = this.getAllButtons();
                buttons.forEach(function(btn) {
                    buttonIds.push(btn.id || btn.textContent);
                });

                return {
                    total: buttons.length,
                    passed: buttons.length,
                    failed: 0,
                    errors: [],
                    screens: []
                };
            };

            await devMenu.testAllOptions();

            // Verify that OptionTester's getAllButtons excludes dev-menu buttons
            expect(buttonIds).to.include('Normal', 'Normal button should be in test set');
            expect(buttonIds).to.not.include('dev-reset-btn', 'Dev menu button should be excluded');
            expect(buttonIds).to.not.include('Reset', 'Dev menu button should be excluded');

            window.devTools.optionTester.testAll = originalTestAll;
            devMenuEl.remove();
            normalBtn.remove();
        });

        it('should handle errors gracefully', async () => {
            devMenu = new DevMenu(mockGame);

            window.devTools.optionTester.testAll = async function() {
                throw new Error('Test execution failed');
            };

            let errorMessage = '';
            mockGame.showError = function(msg) {
                errorMessage = msg;
            };

            await devMenu.testAllOptions();

            expect(errorMessage).to.include('Test failed');
            expect(errorMessage).to.include('Test execution failed');
        });
    });
});
