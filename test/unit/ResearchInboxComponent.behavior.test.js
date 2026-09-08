import { describe, it, expect, beforeAll } from 'vitest';
import { html, render } from 'lit';
import { ResearchInboxComponent } from '../src/js/ui/components/ResearchInboxComponent.js';

describe('ResearchInboxComponent Behavior', () => {
    let component;

    beforeAll(() => {
        component = new ResearchInboxComponent();
        document.body.appendChild(component);
    });

    afterAll(() => {
        document.body.removeChild(component);
    });

    it('should open the inbox and set state correctly', () => {
        const papers = [{ id: 1, notification: { title: 'Paper 1' } }];
        const unreadCount = 1;

        component.open(papers, unreadCount);

        expect(component.isOpen).toBe(true);
        expect(component.papers).toBe(papers);
        expect(component.unreadCount).toBe(unreadCount);
        expect(component.activeTab).toBe('all');
    });

    it('should close the inbox without altering papers or unreadCount', () => {
        const papers = [{ id: 1, notification: { title: 'Paper 1' } }];
        const unreadCount = 1;

        component.open(papers, unreadCount);
        component.close();

        expect(component.isOpen).toBe(false);
        expect(component.papers).toBe(papers);
        expect(component.unreadCount).toBe(unreadCount);
    });

    it('should update papers and unreadCount correctly', () => {
        const papers = [{ id: 1, notification: { title: 'Paper 1' } }];
        const unreadCount = 1;

        component.updatePapers(papers, unreadCount);

        expect(component.papers).toBe(papers);
        expect(component.unreadCount).toBe(unreadCount);
    });

    it('should update papers and unreadCount to default values when undefined', () => {
        component.updatePapers();

        expect(component.papers).toEqual([]);
        expect(component.unreadCount).toBe(0);
    });

    it('should dispatch paper-click event with reference-equal notification on paper card click', () => {
        const papers = [{ id: 1, notification: { title: 'Paper 1' } }];
        component.open(papers);

        const paperCard = component.shadowRoot.querySelector('.paper-card');
        const mockEvent = new MouseEvent('click');
        paperCard.dispatchEvent(mockEvent);

        expect(component.dispatchEvent).toHaveBeenCalledWith(
            new CustomEvent('paper-click', {
                detail: papers[0].notification
            })
        );
    });

    it('should dispatch inbox-close event with empty detail on close button click', () => {
        component.open([{ id: 1, notification: { title: 'Paper 1' } }]);

        const closeButton = component.shadowRoot.querySelector('.inbox-close-btn');
        const mockEvent = new MouseEvent('click');
        closeButton.dispatchEvent(mockEvent);

        expect(component.dispatchEvent).toHaveBeenCalledWith(
            new CustomEvent('inbox-close', {
                detail: {}
            })
        );
    });
});