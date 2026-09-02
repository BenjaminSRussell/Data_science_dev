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
});