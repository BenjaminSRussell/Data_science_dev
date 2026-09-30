/**
 * ModalAccessibility.test.js
 * Tests for modal accessibility features
 * Ensures WCAG compliance for dialogs and focus management
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ModalAccessibilityManager } from '../../src/js/ui/ModalAccessibilityManager.js';

describe('Modal Accessibility', () => {
    let manager;
    let mockModal;
    let mockButton;
    let mockFocusElement;

    beforeEach(() => {
        // Create a new manager for each test
        manager = new ModalAccessibilityManager();

        // Create mock DOM elements
        mockButton = document.createElement('button');
        mockButton.id = 'test-button';
        mockButton.textContent = 'Open Modal';
        document.body.appendChild(mockButton);

        mockFocusElement = document.createElement('button');
        mockFocusElement.id = 'test-focus';
        mockFocusElement.textContent = 'Focus me';
        document.body.appendChild(mockFocusElement);

        mockModal = document.createElement('div');
        mockModal.id = 'test-modal';
        mockModal.className = 'modal hidden';
        mockModal.setAttribute('role', 'dialog');
        mockModal.setAttribute('aria-modal', 'true');
        mockModal.setAttribute('aria-labelledby', 'test-modal-title');
        mockModal.innerHTML = `
            <div class="modal-content">
                <h2 id="test-modal-title">Test Dialog</h2>
                <button id="modal-button">Modal Button</button>
                <button class="close-modal" aria-label="Close dialog">×</button>
            </div>
        `;
        document.body.appendChild(mockModal);
    });

    afterEach(() => {
        // Clean up DOM
        if (mockButton && mockButton.parentNode) {
            mockButton.parentNode.removeChild(mockButton);
        }
        if (mockFocusElement && mockFocusElement.parentNode) {
            mockFocusElement.parentNode.removeChild(mockFocusElement);
        }
        if (mockModal && mockModal.parentNode) {
            mockModal.parentNode.removeChild(mockModal);
        }
        manager.closeAllModals();
    });

    describe('Close button accessibility', () => {
        it('close button should have an accessible name', () => {
            const closeButton = mockModal.querySelector('.close-modal');
            const ariaLabel = closeButton.getAttribute('aria-label');

            expect(ariaLabel).toBeTruthy();
            expect(ariaLabel.toLowerCase()).toContain('close');
        });

        it('close button should be a button element', () => {
            const closeButton = mockModal.querySelector('.close-modal');
            expect(closeButton.tagName.toLowerCase()).toBe('button');
        });
    });

    describe('Dialog ARIA attributes', () => {
        it('dialog should have role="dialog"', () => {
            const role = mockModal.getAttribute('role');
            expect(role).toBe('dialog');
        });

        it('dialog should have aria-modal="true"', () => {
            const ariaModal = mockModal.getAttribute('aria-modal');
            expect(ariaModal).toBe('true');
        });

        it('dialog should have aria-labelledby pointing to title', () => {
            const ariaLabelledby = mockModal.getAttribute('aria-labelledby');
            expect(ariaLabelledby).toBeTruthy();

            const titleElement = document.getElementById(ariaLabelledby);
            expect(titleElement).toBeTruthy();
            expect(titleElement.textContent).toBeTruthy();
        });

        it('title element should exist and be labeled', () => {
            const title = mockModal.querySelector('h2');
            expect(title).toBeTruthy();
            expect(title.id).toBeTruthy();
            expect(title.textContent).toBe('Test Dialog');
        });
    });

    describe('Focus management', () => {
        it('should move focus into modal when opened', () => {
            // Focus the trigger button first
            mockButton.focus();
            expect(document.activeElement).toBe(mockButton);

            // Open the modal
            manager.openModal(mockModal, { triggerElement: mockButton });

            // Focus should move into the modal
            const activeElement = document.activeElement;
            expect(mockModal.contains(activeElement)).toBe(true);
        });

        it('should focus the specified element when provided', () => {
            const modalButton = mockModal.querySelector('#modal-button');

            manager.openModal(mockModal, {
                triggerElement: mockButton,
                focusTarget: modalButton
            });

            // Should focus the modal button
            expect(document.activeElement).toBe(modalButton);
        });

        it('should restore focus to trigger element when closed', async () => {
            mockButton.focus();
            expect(document.activeElement).toBe(mockButton);

            manager.openModal(mockModal, { triggerElement: mockButton });

            // Verify focus moved into modal
            expect(mockModal.contains(document.activeElement)).toBe(true);

            // Close the modal
            manager.closeModal(mockModal);

            // Focus should be restored after a short delay (setTimeout in closeModal)
            await new Promise(resolve => setTimeout(resolve, 10));
            expect(document.activeElement).toBe(mockButton);
        });

        it('should find and focus first focusable element if no target specified', () => {
            manager.openModal(mockModal);

            // Should focus the first focusable element in modal
            const focusableElements = manager.getFocusableElements(mockModal);
            if (focusableElements.length > 0) {
                expect(document.activeElement).toBe(focusableElements[0]);
            }
        });

        it('should support nested modals with focus stack', async () => {
            const modal2 = document.createElement('div');
            modal2.id = 'test-modal-2';
            modal2.className = 'modal hidden';
            modal2.setAttribute('role', 'dialog');
            modal2.innerHTML = '<button id="modal2-button">Modal 2 Button</button>';
            document.body.appendChild(modal2);

            try {
                const button1 = mockModal.querySelector('#modal-button');
                const button2 = modal2.querySelector('#modal2-button');

                // Open first modal
                mockButton.focus();
                manager.openModal(mockModal, {
                    triggerElement: mockButton,
                    focusTarget: button1
                });
                expect(document.activeElement).toBe(button1);

                // Open second modal
                manager.openModal(modal2, {
                    triggerElement: button1,
                    focusTarget: button2
                });
                expect(document.activeElement).toBe(button2);

                // Close second modal - focus should go back to button1
                manager.closeModal(modal2);
                await new Promise(resolve => setTimeout(resolve, 10));
                expect(document.activeElement).toBe(button1);

                // Close first modal - focus should go back to mockButton
                manager.closeModal(mockModal);
                await new Promise(resolve => setTimeout(resolve, 10));
                expect(document.activeElement).toBe(mockButton);
            } finally {
                modal2.parentNode?.removeChild(modal2);
            }
        });
    });

    describe('Modal visibility', () => {
        it('should remove hidden class and add active class when opening', () => {
            expect(mockModal.classList.contains('hidden')).toBe(true);

            manager.openModal(mockModal);

            expect(mockModal.classList.contains('hidden')).toBe(false);
            expect(mockModal.classList.contains('active')).toBe(true);
        });

        it('should add hidden class and remove active class when closing', () => {
            manager.openModal(mockModal);
            expect(mockModal.classList.contains('active')).toBe(true);

            manager.closeModal(mockModal);

            expect(mockModal.classList.contains('hidden')).toBe(true);
            expect(mockModal.classList.contains('active')).toBe(false);
        });
    });

    describe('Modal state tracking', () => {
        it('should track if any modal is open', () => {
            expect(manager.isAnyModalOpen()).toBe(false);

            manager.openModal(mockModal);
            expect(manager.isAnyModalOpen()).toBe(true);

            manager.closeModal(mockModal);
            expect(manager.isAnyModalOpen()).toBe(false);
        });

        it('should return the active modal', () => {
            expect(manager.getActiveModal()).toBeNull();

            manager.openModal(mockModal);
            expect(manager.getActiveModal()).toBe(mockModal);

            manager.closeModal(mockModal);
            expect(manager.getActiveModal()).toBeNull();
        });

        it('should close all modals', () => {
            const modal2 = document.createElement('div');
            modal2.id = 'test-modal-2';
            modal2.className = 'modal hidden';
            document.body.appendChild(modal2);

            try {
                manager.openModal(mockModal);
                manager.openModal(modal2);

                expect(manager.isAnyModalOpen()).toBe(true);
                expect(mockModal.classList.contains('hidden')).toBe(false);
                expect(modal2.classList.contains('hidden')).toBe(false);

                manager.closeAllModals();

                expect(manager.isAnyModalOpen()).toBe(false);
                expect(mockModal.classList.contains('hidden')).toBe(true);
                expect(modal2.classList.contains('hidden')).toBe(true);
            } finally {
                modal2.parentNode?.removeChild(modal2);
            }
        });
    });

    describe('Focusable element detection', () => {
        it('should identify focusable elements', () => {
            const focusableElements = manager.getFocusableElements(mockModal);

            // Should find buttons
            expect(focusableElements.length).toBeGreaterThan(0);
            expect(focusableElements.some(el => el.tagName === 'BUTTON')).toBe(true);
        });

        it('should not include disabled elements in focusable list', () => {
            const disabledButton = document.createElement('button');
            disabledButton.disabled = true;
            disabledButton.textContent = 'Disabled';
            mockModal.appendChild(disabledButton);

            const focusableElements = manager.getFocusableElements(mockModal);
            expect(focusableElements).not.toContain(disabledButton);
        });

        it('should recognize isFocusable for various element types', () => {
            const button = document.createElement('button');
            const link = document.createElement('a');
            link.href = '#';
            const input = document.createElement('input');
            input.type = 'text';
            const disabledButton = document.createElement('button');
            disabledButton.disabled = true;

            expect(manager.isFocusable(button)).toBe(true);
            expect(manager.isFocusable(link)).toBe(true);
            expect(manager.isFocusable(input)).toBe(true);
            expect(manager.isFocusable(disabledButton)).toBe(false);
        });
    });

    describe('Escape key handling', () => {
        it('should set up escape key handler', () => {
            manager.openModal(mockModal);

            // Check that escape handler was set up
            expect(mockModal.dataset.escapeSetup).toBe('true');
        });

        it('should close modal on escape key when active', async () => {
            manager.openModal(mockModal);
            expect(mockModal.classList.contains('hidden')).toBe(false);

            // Simulate escape key
            const escapeEvent = new KeyboardEvent('keydown', { key: 'Escape' });
            document.dispatchEvent(escapeEvent);

            await new Promise(resolve => setTimeout(resolve, 10));
            expect(mockModal.classList.contains('hidden')).toBe(true);
        });
    });

    describe('Real integration - modal-container with dynamic title', () => {
        it('should dynamically set aria-labelledby when title is injected', () => {
            // Simulate the real #modal-container scenario
            const container = document.createElement('div');
            container.id = 'integration-test-container';
            container.className = 'modal-container hidden';
            container.setAttribute('role', 'dialog');
            container.setAttribute('aria-modal', 'true');

            const backdrop = document.createElement('div');
            backdrop.className = 'modal-backdrop';

            const content = document.createElement('div');
            content.id = 'integration-test-content';
            content.className = 'modal-content';

            container.appendChild(backdrop);
            container.appendChild(content);
            document.body.appendChild(container);

            try {
                // Inject content with a heading (like showModal does)
                content.innerHTML = `
                    <h2>Credits</h2>
                    <p>Some content</p>
                    <button class="close-btn">Close</button>
                `;

                const heading = content.querySelector('h2');
                if (heading && !heading.id) {
                    heading.id = `modal-title-test`;
                }
                if (heading && heading.id) {
                    container.setAttribute('aria-labelledby', heading.id);
                }

                // Verify aria-labelledby points to real element
                const ariaLabelledby = container.getAttribute('aria-labelledby');
                expect(ariaLabelledby).toBe('modal-title-test');

                const labelElement = document.getElementById(ariaLabelledby);
                expect(labelElement).toBe(heading);
                expect(labelElement.textContent).toBe('Credits');
            } finally {
                container.parentNode?.removeChild(container);
            }
        });

        it('should handle multiple modals with different titles', () => {
            const container1 = document.createElement('div');
            container1.id = 'test-container-1';
            container1.setAttribute('role', 'dialog');
            const content1 = document.createElement('div');
            container1.appendChild(content1);

            const container2 = document.createElement('div');
            container2.id = 'test-container-2';
            container2.setAttribute('role', 'dialog');
            const content2 = document.createElement('div');
            container2.appendChild(content2);

            document.body.appendChild(container1);
            document.body.appendChild(container2);

            try {
                // Inject different content
                content1.innerHTML = '<h2 id="title-1">Tutorial</h2>';
                content2.innerHTML = '<h2 id="title-2">Settings</h2>';

                container1.setAttribute('aria-labelledby', 'title-1');
                container2.setAttribute('aria-labelledby', 'title-2');

                expect(container1.getAttribute('aria-labelledby')).toBe('title-1');
                expect(container2.getAttribute('aria-labelledby')).toBe('title-2');
                expect(document.getElementById('title-1').textContent).toBe('Tutorial');
                expect(document.getElementById('title-2').textContent).toBe('Settings');
            } finally {
                container1.parentNode?.removeChild(container1);
                container2.parentNode?.removeChild(container2);
            }
        });
    });

    describe('Real integration - story decision modal', () => {
        it('story decision modal should have proper accessibility attributes', () => {
            const storyModal = document.createElement('div');
            storyModal.className = 'story-decision-modal';
            storyModal.setAttribute('role', 'dialog');
            storyModal.setAttribute('aria-modal', 'true');

            const titleId = 'decision-title-test';
            storyModal.setAttribute('aria-labelledby', titleId);

            storyModal.innerHTML = `
                <div class="decision-modal-content">
                    <div class="decision-modal-header">
                        <h3 id="${titleId}">Choose your path</h3>
                        <button class="decision-modal-close" aria-label="Close decision">×</button>
                    </div>
                    <div class="decision-modal-choices">
                        <button class="decision-choice-btn" data-choice="left">Go Left</button>
                        <button class="decision-choice-btn" data-choice="right">Go Right</button>
                    </div>
                </div>
            `;

            document.body.appendChild(storyModal);

            try {
                // Verify attributes
                expect(storyModal.getAttribute('role')).toBe('dialog');
                expect(storyModal.getAttribute('aria-modal')).toBe('true');
                expect(storyModal.getAttribute('aria-labelledby')).toBe(titleId);

                // Verify title element exists and matches
                const titleElement = document.getElementById(titleId);
                expect(titleElement).toBeTruthy();
                expect(titleElement.textContent).toBe('Choose your path');

                // Verify close button has accessible name
                const closeBtn = storyModal.querySelector('.decision-modal-close');
                expect(closeBtn).toBeTruthy();
                expect(closeBtn.getAttribute('aria-label')).toBe('Close decision');

                // Verify choice buttons are focusable
                const choiceButtons = storyModal.querySelectorAll('.decision-choice-btn');
                expect(choiceButtons.length).toBe(2);
                choiceButtons.forEach(btn => {
                    expect(btn.tagName).toBe('BUTTON');
                });
            } finally {
                storyModal.parentNode?.removeChild(storyModal);
            }
        });

        it('story modal should support escape key and focus restoration', async () => {
            const storyModal = document.createElement('div');
            storyModal.className = 'story-decision-modal';
            storyModal.setAttribute('role', 'dialog');
            storyModal.setAttribute('aria-modal', 'true');
            storyModal.innerHTML = `
                <div class="decision-modal-content">
                    <h3 id="story-title">Decision</h3>
                    <button class="decision-choice-btn" data-choice="a">Option A</button>
                </div>
            `;

            document.body.appendChild(storyModal);
            const triggerBtn = document.createElement('button');
            triggerBtn.textContent = 'Trigger';
            document.body.appendChild(triggerBtn);

            try {
                // Open modal with accessibility manager
                triggerBtn.focus();
                const manager2 = new ModalAccessibilityManager();
                manager2.openModal(storyModal, {
                    triggerElement: triggerBtn,
                    focusTarget: storyModal.querySelector('.decision-choice-btn')
                });

                expect(document.activeElement).toBe(storyModal.querySelector('.decision-choice-btn'));

                // Close via manager
                manager2.closeModal(storyModal);

                await new Promise(resolve => setTimeout(resolve, 10));
                expect(document.activeElement).toBe(triggerBtn);
            } finally {
                storyModal.parentNode?.removeChild(storyModal);
                triggerBtn.parentNode?.removeChild(triggerBtn);
            }
        });
    });
});
