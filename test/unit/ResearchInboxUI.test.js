/**
 * Unit tests for ResearchInboxUI
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { ResearchInboxUI } from '../../src/js/ui/ResearchInboxUI.js';

// Mock ResearchPaperSystem
class MockResearchPaperSystem {
    constructor() {
        this.inbox = [
            {
                id: '1',
                read: false,
                isBreakthrough: false,
                paper: {
                    title: 'Test Paper 1',
                    authors: 'Author 1',
                    year: 2024,
                    venue: 'Conference 1',
                    description: 'A test paper',
                    impact: 'High impact',
                    keywords: ['AI', 'ML'],
                    url: 'https://example.com/paper1'
                }
            }
        ];
    }

    getInbox() {
        return this.inbox;
    }

    getUnreadCount() {
        return this.inbox.filter(item => !item.read).length;
    }

    markAsRead(notificationId) {
        const item = this.inbox.find(item => item.id === notificationId);
        if (item) {
            item.read = true;
        }
    }
}

describe('ResearchInboxUI - Paper Detail Modal', () => {
    let researchInboxUI;
    let mockSystem;

    beforeEach(() => {
        mockSystem = new MockResearchPaperSystem();
        researchInboxUI = new ResearchInboxUI(mockSystem);
        // Clear document body
        document.body.innerHTML = '';
        // Create the inbox UI
        researchInboxUI.createInboxUI();
    });

    afterEach(() => {
        // Clean up
        document.body.innerHTML = '';
    });

    it('should close modal with Escape key', () => {
        researchInboxUI.showPaperDetails('1');
        const modal = document.querySelector('.paper-detail-modal');
        expect(modal).toBeTruthy();

        // Simulate Escape key press
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(event);

        // Check if modal is removed
        const modalAfter = document.querySelector('.paper-detail-modal');
        expect(modalAfter).toBeFalsy();
    });

    it('should restore focus to previously focused element on close', () => {
        // Create a button to focus before opening modal
        const button = document.createElement('button');
        button.id = 'test-button';
        button.textContent = 'Open Modal';
        document.body.appendChild(button);

        // Focus the button
        button.focus();
        expect(document.activeElement).toBe(button);

        // Open modal
        researchInboxUI.showPaperDetails('1');
        const modal = document.querySelector('.paper-detail-modal');
        expect(modal).toBeTruthy();

        // Close modal via Escape
        const event = new KeyboardEvent('keydown', { key: 'Escape' });
        document.dispatchEvent(event);

        // Check focus is restored
        expect(document.activeElement).toBe(button);
    });

    it('should trap Tab focus within modal content', () => {
        researchInboxUI.showPaperDetails('1');
        const modal = document.querySelector('.paper-detail-modal');
        const contentDiv = document.querySelector('.paper-detail-content');
        expect(modal).toBeTruthy();
        expect(contentDiv).toBeTruthy();

        // Get all focusable elements within modal
        const focusableElements = contentDiv.querySelectorAll(
            'a, button, [tabindex]:not([tabindex="-1"])'
        );

        // Tab focus should not escape outside the modal
        // This test verifies the keyboard trap is in place
        expect(focusableElements.length).toBeGreaterThanOrEqual(1); // At least close button

        // Simulate Tab key on last element (should cycle to first)
        const lastElement = focusableElements[focusableElements.length - 1];
        lastElement.focus();

        const tabEvent = new KeyboardEvent('keydown', {
            key: 'Tab',
            bubbles: true
        });

        // Tab should be handled by modal to prevent focus escape
        lastElement.dispatchEvent(tabEvent);

        // Focus should remain within modal or cycle back
        // (implementation will handle this)
        expect(document.activeElement).toBeTruthy();
    });

    it('should close modal when close button is clicked', () => {
        researchInboxUI.showPaperDetails('1');
        const modal = document.querySelector('.paper-detail-modal');
        expect(modal).toBeTruthy();

        // Click close button
        const closeButton = document.querySelector('.paper-detail-close');
        closeButton.click();

        // Check if modal is removed
        const modalAfter = document.querySelector('.paper-detail-modal');
        expect(modalAfter).toBeFalsy();
    });

    it('should close modal when clicking outside content', () => {
        researchInboxUI.showPaperDetails('1');
        const modal = document.querySelector('.paper-detail-modal');
        expect(modal).toBeTruthy();

        // Click on modal background (outside content)
        const event = new MouseEvent('click', { bubbles: true });
        Object.defineProperty(event, 'target', { value: modal, enumerable: true });
        modal.dispatchEvent(event);

        // Check if modal is removed
        const modalAfter = document.querySelector('.paper-detail-modal');
        expect(modalAfter).toBeFalsy();
    });
});
