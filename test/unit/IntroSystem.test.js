/**
 * Unit tests for IntroSystem
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { IntroSystem } from '../../src/js/game/IntroSystem.js';

describe('IntroSystem', () => {
    let introSystem;
    let mockGameState;

    beforeEach(() => {
        mockGameState = {
            currentJob: null
        };
        introSystem = new IntroSystem({ gameState: mockGameState });

        // Mock DOM
        document.body.innerHTML = `
            <div id="intro-screen">
                <div class="job-card" data-job-id="junior_analyst"></div>
                <div class="job-card" data-job-id="mid_level_designer"></div>
                <div class="job-card" data-job-id="senior_developer"></div>
                <div class="job-card" data-job-id="junior_analyst"></div>
            </div>
            <div id="job-application-screen"></div>
        `;
    });

    describe('getStarterJobs', () => {
        it('should return exactly 4 fixed jobs with documented salaryNum values', () => {
            const jobs = introSystem.getStarterJobs();
            expect(jobs).toHaveLength(4);
            expect(jobs[0]).toEqual(expect.objectContaining({ salaryNum: 400 }));
            expect(jobs[1]).toEqual(expect.objectContaining({ salaryNum: 600 }));
            expect(jobs[2]).toEqual(expect.objectContaining({ salaryNum: 300 }));
            expect(jobs[3]).toEqual(expect.objectContaining({ salaryNum: 200 }));
        });
    });

    describe('selectJob', () => {
        it('should add \'selected\' only to matching card, removes from previous, sets this.selectedJob', () => {
            const juniorAnalystCard = document.querySelector('.job-card[data-job-id="junior_analyst"]');
            const midLevelDesignerCard = document.querySelector('.job-card[data-job-id="mid_level_designer"]');

            introSystem.selectJob('junior_analyst');
            expect(juniorAnalystCard.classList.contains('selected')).toBe(true);
            expect(midLevelDesignerCard.classList.contains('selected')).toBe(false);
            expect(introSystem.selectedJob).toBe('junior_analyst');

            introSystem.selectJob('mid_level_designer');
            expect(juniorAnalystCard.classList.contains('selected')).toBe(false);
            expect(midLevelDesignerCard.classList.contains('selected')).toBe(true);
            expect(introSystem.selectedJob).toBe('mid_level_designer');
        });
    });

    describe('applyForJob', () => {
        it('should set currentJob to exact object, removes \'active\' class from #job-application-screen if present', () => {
            const jobApplicationScreen = document.getElementById('job-application-screen');
            jobApplicationScreen.classList.add('active');

            introSystem.applyForJob('junior_analyst');
            expect(mockGameState.currentJob).toEqual(expect.objectContaining({ id: 'junior_analyst' }));
            expect(jobApplicationScreen.classList.contains('active')).toBe(false);
        });

        it('should return early, no mutation if job does not exist', () => {
            const originalCurrentJob = mockGameState.currentJob;
            const jobApplicationScreen = document.getElementById('job-application-screen');
            jobApplicationScreen.classList.add('active');

            introSystem.applyForJob('does_not_exist');
            expect(mockGameState.currentJob).toBe(originalCurrentJob);
            expect(jobApplicationScreen.classList.contains('active')).toBe(true);
        });
    });

    describe('startGame', () => {
        it('should remove #intro-screen, remove welcomeOverlay, call finishGameStart()', () => {
            const introScreen = document.getElementById('intro-screen');
            const welcomeOverlay = document.createElement('div');
            welcomeOverlay.id = 'welcomeOverlay';
            document.body.appendChild(welcomeOverlay);

            const finishGameStartSpy = vi.spyOn(introSystem, 'finishGameStart');
            introSystem.startGame();

            expect(introScreen.style.display).toBe('none');
            expect(document.getElementById('welcomeOverlay')).toBeNull();
            expect(finishGameStartSpy).toHaveBeenCalled();
        });
    });

    describe('showIntro', () => {
        beforeEach(() => {
            // Setup DOM for video intro tests
            document.body.innerHTML = `
                <div id="screen-intro-video" class="hidden">
                    <video id="intro-video"></video>
                    <button id="btn-skip-video">Skip</button>
                </div>
                <div id="intro-screen"></div>
            `;
        });

        it('should show video screen, handle onended, and show intro text (happy path)', async () => {
            const videoScreen = document.getElementById('screen-intro-video');
            const video = document.getElementById('intro-video');

            // Mock video methods - jsdom doesn't implement these
            video.play = vi.fn(() => Promise.resolve());
            video.pause = vi.fn();

            const showIntroTextSpy = vi.spyOn(introSystem, 'showIntroText');

            introSystem.showIntro();

            // After initial call, screen should be visible
            expect(videoScreen.classList.contains('hidden')).toBe(false);

            // Simulate video ending
            video.onended();

            // Video pause should have been called
            expect(video.pause).toHaveBeenCalled();
            // Screen should be hidden
            expect(videoScreen.classList.contains('hidden')).toBe(true);
            // showIntroText should have been called
            expect(showIntroTextSpy).toHaveBeenCalled();
        });

        it('should fallback to showIntroText if video screen is missing', () => {
            document.body.innerHTML = '<div id="intro-screen"></div>';

            const showIntroTextSpy = vi.spyOn(introSystem, 'showIntroText');

            introSystem.showIntro();

            expect(showIntroTextSpy).toHaveBeenCalled();
        });

        it('should fallback to showIntroText if video element is missing', () => {
            document.body.innerHTML = `
                <div id="screen-intro-video"></div>
                <div id="intro-screen"></div>
            `;

            const showIntroTextSpy = vi.spyOn(introSystem, 'showIntroText');

            introSystem.showIntro();

            expect(showIntroTextSpy).toHaveBeenCalled();
        });

        it('should handle video.play() rejection gracefully', async () => {
            const videoScreen = document.getElementById('screen-intro-video');
            const video = document.getElementById('intro-video');

            // Mock video.play() to reject
            video.play = vi.fn(() => Promise.reject(new Error('NotAllowedError')));
            // Mock video methods
            video.pause = vi.fn();

            const showIntroTextSpy = vi.spyOn(introSystem, 'showIntroText');

            introSystem.showIntro();

            // Flush microtasks to allow promise rejection to be caught
            await Promise.resolve();
            await Promise.resolve();

            // Despite rejection, finishVideo effects should occur
            expect(video.pause).toHaveBeenCalled();
            expect(videoScreen.classList.contains('hidden')).toBe(true);
            expect(showIntroTextSpy).toHaveBeenCalled();
        });

        it('should call finishVideo when skip button is clicked', async () => {
            const videoScreen = document.getElementById('screen-intro-video');
            const video = document.getElementById('intro-video');
            const skipBtn = document.getElementById('btn-skip-video');

            // Mock video.play()
            video.play = vi.fn(() => Promise.resolve());
            video.pause = vi.fn();

            const showIntroTextSpy = vi.spyOn(introSystem, 'showIntroText');

            introSystem.showIntro();

            // Initial state: screen visible
            expect(videoScreen.classList.contains('hidden')).toBe(false);

            // Simulate skip button click
            skipBtn.onclick();

            // Check effects are same as onended
            expect(video.pause).toHaveBeenCalled();
            expect(videoScreen.classList.contains('hidden')).toBe(true);
            expect(showIntroTextSpy).toHaveBeenCalled();
        });
    });

    describe('showJobWelcome', () => {
        it('should create overlay with job details, append to body, and store reference', () => {
            const job = {
                id: 'test_job',
                title: 'Test Position',
                company: 'Test Company',
                salary: 500
            };

            introSystem.showJobWelcome(job);

            // Check overlay was created and appended
            const overlay = document.querySelector('.intro-screen.active');
            expect(overlay).not.toBeNull();

            // Check job details are in the overlay
            expect(overlay.innerHTML).toContain('Test Position');
            expect(overlay.innerHTML).toContain('Test Company');
            expect(overlay.innerHTML).toContain('500');

            // Check reference is stored
            expect(introSystem.welcomeOverlay).toBe(overlay);
        });

        it('should create overlay with correct congratulations message structure', () => {
            const job = {
                id: 'analyst',
                title: 'Data Analyst',
                company: 'Tech Corp',
                salary: 750
            };

            introSystem.showJobWelcome(job);

            const overlay = document.querySelector('.intro-screen.active');
            expect(overlay.querySelector('.intro-title')).not.toBeNull();
            expect(overlay.querySelector('.intro-subtitle')).not.toBeNull();
            expect(overlay.querySelector('.intro-story')).not.toBeNull();
            expect(overlay.querySelector('#btn-intro-start-game')).not.toBeNull();
        });
    });

    describe('createIntroScreen', () => {
        it('should create screen with correct id and append to DOM', () => {
            const screen = introSystem.createIntroScreen();

            expect(screen.id).toBe('intro-screen');
            expect(screen.className).toBe('intro-screen');
        });

        it('should have button that calls showJobApplication after setTimeout', async () => {
            const screen = introSystem.createIntroScreen();
            document.body.appendChild(screen);

            const showJobApplicationSpy = vi.spyOn(introSystem, 'showJobApplication');

            // Wait for setTimeout to execute
            await new Promise(resolve => setTimeout(resolve, 10));

            // Click the button
            const btn = screen.querySelector('#btn-intro-find-job');
            expect(btn).not.toBeNull();
            btn.click();

            expect(showJobApplicationSpy).toHaveBeenCalled();
        });

        it('should contain all required content sections', () => {
            const screen = introSystem.createIntroScreen();

            expect(screen.querySelector('.intro-content')).not.toBeNull();
            expect(screen.querySelector('.intro-title')).not.toBeNull();
            expect(screen.querySelector('.intro-subtitle')).not.toBeNull();
            expect(screen.querySelector('.intro-story')).not.toBeNull();
            expect(screen.querySelector('.intro-steps')).not.toBeNull();
            expect(screen.querySelector('#btn-intro-find-job')).not.toBeNull();
        });
    });
});