import { expect } from 'chai';
import { JSDOM } from 'jsdom';
import { StoryUI } from '../../src/js/ui/StoryUI.js';

describe('StoryUI Accessibility', () => {
    let storyUI;
    let mockGame;
    let container;

    beforeEach(() => {
        // Setup DOM
        document.body.innerHTML = `
            <div id="screen-container"></div>
            <div class="top-bar-right"></div>
        `;
        container = document.getElementById('screen-container');

        // Create mock game object
        mockGame = {
            screenManager: null,
            gameState: {
                storylineManager: {
                    initialize: () => {},
                    getStatus: () => ({
                        arc: { name: 'Test Arc', description: 'Test description' },
                        progress: 50,
                        phase: 'mid',
                        decisions: []
                    }),
                    getCurrentArc: () => ({ name: 'Test Arc', description: 'Test description' }),
                    getAvailableDecisions: () => [],
                    getMajorDecisions: () => [],
                    majorDecisions: [],
                    storylinePhase: 'mid'
                },
                narrativeClaritySystem: null,
                storyBeatsSystem: null,
                timeManager: { totalDays: 0 },
                characterArcSystem: null
            },
            showToast: () => {},
            uiUpdater: null
        };

        storyUI = new StoryUI(mockGame);
    });

    afterEach(() => {
        document.body.innerHTML = '';
    });

    describe('Progress Bar Accessibility', () => {
        it('should have a progress bar with role="progressbar"', () => {
            storyUI.initialize();
            storyUI.updateStoryDisplay();

            const progressBar = document.querySelector('.progress-bar');
            expect(progressBar).to.exist;
            expect(progressBar.getAttribute('role')).to.equal('progressbar');
        });

        it('should have aria-valuenow attribute on progress bar', () => {
            storyUI.initialize();
            storyUI.updateStoryDisplay();

            const progressBar = document.querySelector('.progress-bar');
            expect(progressBar.getAttribute('aria-valuenow')).to.equal('50');
        });

        it('should have aria-valuemin and aria-valuemax on progress bar', () => {
            storyUI.initialize();
            storyUI.updateStoryDisplay();

            const progressBar = document.querySelector('.progress-bar');
            expect(progressBar.getAttribute('aria-valuemin')).to.equal('0');
            expect(progressBar.getAttribute('aria-valuemax')).to.equal('100');
        });

        it('should have aria-label describing the progress bar', () => {
            storyUI.initialize();
            storyUI.updateStoryDisplay();

            const progressBar = document.querySelector('.progress-bar');
            expect(progressBar.getAttribute('aria-label')).to.exist;
            expect(progressBar.getAttribute('aria-label')).to.include('progress');
        });

        it('should update aria-valuenow when progress changes', () => {
            storyUI.initialize();

            // Update status
            mockGame.gameState.storylineManager.getStatus = () => ({
                arc: { name: 'Test Arc', description: 'Test description' },
                progress: 75,
                phase: 'mid',
                decisions: []
            });

            storyUI.updateStoryDisplay();

            const progressBar = document.querySelector('.progress-bar');
            expect(progressBar.getAttribute('aria-valuenow')).to.equal('75');
        });
    });

    describe('Timeline Accessibility', () => {
        it('should have timeline items with data-phase attributes', () => {
            storyUI.initialize();
            storyUI.updateStoryDisplay();

            const timelineItems = document.querySelectorAll('.timeline-item');
            expect(timelineItems.length).to.be.greaterThan(0);

            // Check that all timeline items have data-phase
            timelineItems.forEach(item => {
                expect(item.getAttribute('data-phase')).to.exist;
            });
        });

        it('should mark active timeline phase with aria-current="step"', () => {
            storyUI.initialize();
            storyUI.updateStoryDisplay();

            const activeItem = document.querySelector('.timeline-item.active');
            expect(activeItem).to.exist;
            expect(activeItem.getAttribute('aria-current')).to.equal('step');
        });

        it('should expose the timeline as a list of listitems', () => {
            storyUI.initialize();
            storyUI.updateStoryDisplay();

            const timeline = document.querySelector('.phase-timeline');
            expect(timeline.getAttribute('role')).to.equal('list');
            document.querySelectorAll('.timeline-item').forEach(item => {
                expect(item.getAttribute('role')).to.equal('listitem');
                expect(item.getAttribute('role')).to.not.equal('presentation');
                expect(item.hasAttribute('aria-label')).to.be.false;
            });
        });

        it('should announce the active phase via visually-hidden status text', () => {
            storyUI.initialize();
            storyUI.updateStoryDisplay();

            const status = document.querySelector('.timeline-item.active .timeline-status');
            expect(status.classList.contains('visually-hidden')).to.be.true;
            expect(status.textContent).to.include('Current phase');
        });

        it('should announce completed timeline phases via visually-hidden status text', () => {
            storyUI.initialize();
            storyUI.updateStoryDisplay();

            const completedItems = document.querySelectorAll('.timeline-item.completed');
            completedItems.forEach(item => {
                expect(item.querySelector('.timeline-status').textContent).to.include('Completed');
            });
        });

        it('should announce upcoming timeline phases via visually-hidden status text', () => {
            storyUI.initialize();
            storyUI.updateStoryDisplay();

            const timelineItems = document.querySelectorAll('.timeline-item:not(.active):not(.completed)');
            expect(timelineItems.length).to.be.greaterThan(0);
            timelineItems.forEach(item => {
                expect(item.querySelector('.timeline-status').textContent).to.include('Upcoming');
            });
        });
    });
});
