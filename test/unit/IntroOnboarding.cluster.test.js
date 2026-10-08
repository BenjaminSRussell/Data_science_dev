import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'node:fs';
import { IntroSystem } from '../../src/js/game/IntroSystem.js';

const flush = () => new Promise(r => setTimeout(r, 0));

beforeEach(() => { document.body.innerHTML = ''; });

const makeGame = (audio) => ({ gameState: {}, audioManager: audio, finishGameStart: vi.fn() });

describe('IntroSystem onboarding (#867, #1066, #1071, #1316, #1317, #1999)', () => {
    it('intro video follows the sound settings (#867)', () => {
        document.body.innerHTML = '<div id="screen-intro-video" class="hidden"><video id="intro-video"></video></div>';
        const video = document.getElementById('intro-video');
        video.play = vi.fn(() => Promise.resolve());
        video.pause = vi.fn();
        new IntroSystem(makeGame({ soundEnabled: false, soundVolume: 0.3 })).showIntro();
        expect(video.muted).toBe(true);
        expect(video.volume).toBeCloseTo(0.3);
    });

    it('double Apply hires once and shows one welcome overlay (#1999)', async () => {
        const game = makeGame();
        const intro = new IntroSystem(game);
        intro.showJobApplication();
        await flush();
        intro.applyForJob('junior_analyst');
        intro.applyForJob('intern');
        intro.showJobWelcome({ title: 'x', company: 'y', salary: '$1' });
        expect(game.gameState.currentJob.id).toBe('junior_analyst');
        expect(document.querySelectorAll('#btn-intro-start-game').length).toBe(1);
    });

    it('selection feeds applyForJob and Enter applies the selected card (#1317)', async () => {
        const game = makeGame();
        const intro = new IntroSystem(game);
        intro.showJobApplication();
        await flush();
        expect('currentStep' in intro).toBe(false);
        const card = document.querySelector('.job-card[data-job-id="intern"]');
        expect(card.getAttribute('tabindex')).toBe('0');
        card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(intro.selectedJob).toBe('intern');
        expect(card.classList.contains('selected')).toBe(true);
        card.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(game.gameState.currentJob.id).toBe('intern');
    });

    it('startGame removes the job board so a replay gets fresh DOM (#1316)', async () => {
        const game = makeGame();
        const intro = new IntroSystem(game);
        intro.showIntroText();
        intro.showJobApplication();
        await flush();
        intro.applyForJob('freelance');
        intro.startGame();
        expect(document.getElementById('job-application-screen')).toBeNull();
        expect(document.getElementById('intro-screen')).toBeNull();
        expect(game.finishGameStart).toHaveBeenCalled();
        // a stale board left by an older build is dropped when onboarding restarts
        const stale = document.createElement('div');
        stale.id = 'job-application-screen';
        document.body.appendChild(stale);
        new IntroSystem(makeGame()).showIntroText();
        expect(document.getElementById('job-application-screen')).toBeNull();
    });

    it('the starter job pays weekly; freelance varies (#1071)', () => {
        expect(IntroSystem.weeklyPay({ id: 'junior_analyst', salary: 600 })).toBe(600);
        expect(IntroSystem.weeklyPay({ id: 'freelance', salary: 300 }, () => 0)).toBe(150);
        expect(IntroSystem.weeklyPay({ id: 'freelance', salary: 300 }, () => 0.999)).toBe(450);
        expect(IntroSystem.weeklyPay(null)).toBe(0);
        const main = fs.readFileSync('src/js/main.js', 'utf8');
        expect(main).toMatch(/IntroSystem\.weeklyPay\(this\.gameState\.currentJob\)/);
    });

    it('onboarding has a stylesheet that index.html links (#1066)', () => {
        const css = fs.readFileSync('src/styles/intro.css', 'utf8');
        for (const sel of ['.intro-screen', '.intro-content', '.intro-btn', '.intro-step', '.job-application-screen', '.job-card', '.job-card-apply', '.job-card.selected']) {
            expect(css).toContain(sel);
        }
        expect(fs.readFileSync('index.html', 'utf8')).toMatch(/href="\/src\/styles\/intro\.css"/);
    });
});
