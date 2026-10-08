/**
 * Intro replay, dev-mode flag, SW cache wipe, library label, exam threshold
 * (#2000, #1743, #1871, #1642, #1265)
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import fs from 'fs';
import path from 'path';
import { IntroSystem } from '../../src/js/game/IntroSystem.js';
import { isDevModeEnabled } from '../../src/js/dev/devMode.js';
import { CATEGORIES } from '../../src/js/game/LibraryDatabase.js';
import { EducationSystem } from '../../src/js/game/EducationSystem.js';
import * as Edu from '../../src/js/helpers/EducationHelpers.js';

const root = path.resolve(__dirname, '../..');
const html = fs.readFileSync(path.join(root, 'index.html'), 'utf8');

describe('intro video replays from the start (#2000)', () => {
    beforeEach(() => {
        document.body.innerHTML = `<div id="screen-intro-video" class="hidden"></div>
            <video id="intro-video"></video><button id="btn-skip-video"></button>`;
    });

    it('rewinds before playing and only shows the intro text once', async () => {
        const video = document.getElementById('intro-video');
        Object.defineProperty(video, 'currentTime', { value: 42, writable: true });
        let reject;
        video.play = vi.fn(() => new Promise((_, r) => { reject = r; }));
        video.pause = vi.fn();
        const intro = new IntroSystem({});
        intro.showIntroText = vi.fn();
        intro.showIntro();
        expect(video.currentTime).toBe(0);
        document.getElementById('btn-skip-video').click();
        reject(new Error('aborted'));
        await new Promise(r => setTimeout(r, 0));
        expect(intro.showIntroText).toHaveBeenCalledTimes(1);
    });
});

describe('dev mode is not permanently enabled by ?dev (#1743)', () => {
    const win = (search, host = 'example.com') => {
        const store = new Map();
        return {
            location: { hostname: host, search },
            localStorage: {
                getItem: (k) => (store.has(k) ? store.get(k) : null),
                setItem: (k, v) => store.set(k, String(v)),
                removeItem: (k) => store.delete(k)
            },
            store
        };
    };

    it('?dev applies to that page only', () => {
        const w = win('?dev');
        expect(isDevModeEnabled(w)).toBe(true);
        expect(w.store.has('dev_mode')).toBe(false);
        w.location.search = '';
        expect(isDevModeEnabled(w)).toBe(false);
    });

    it('?dev=off clears an old stored flag, even on localhost', () => {
        const w = win('?dev=off', 'localhost');
        w.localStorage.setItem('dev_mode', 'true');
        expect(isDevModeEnabled(w)).toBe(false);
        expect(w.store.has('dev_mode')).toBe(false);
    });

    it('a hand-set flag still works', () => {
        const w = win('');
        w.localStorage.setItem('dev_mode', 'true');
        expect(isDevModeEnabled(w)).toBe(true);
    });
});

describe('production loads keep their caches (#1871)', () => {
    it('service worker and Cache API wiping only run on dev hosts', () => {
        expect(html).toContain("const __dsdDevHost = ['localhost', '127.0.0.1'].includes(window.location.hostname);");
        expect(html).toContain("if (__dsdDevHost && 'serviceWorker' in navigator)");
        expect(html).toContain("if (__dsdDevHost && 'caches' in window)");
    });
});

describe('library AI label matches its tab (#1642)', () => {
    it('uses AI, not Deep Learning', () => {
        expect(CATEGORIES.ai.trim()).toBe('AI');
        expect(html).toMatch(/data-cat="ai">\s*AI</);
    });
});

describe('exam pass mark is reachable without a perfect score (#1265)', () => {
    it('every course can be passed with one wrong answer', () => {
        const edu = new EducationSystem({});
        for (const course of Object.values(edu.courses)) {
            const total = course.questions.length;
            expect(total, course.id).toBeGreaterThanOrEqual(3);
            expect(EducationSystem.requiredCorrect(total), course.id).toBeLessThan(total);
        }
    });

    it('the intro shows the real requirement', () => {
        document.body.innerHTML = `<div id="modal-exam" class="modal hidden"><div id="exam-intro"><p id="exam-pass-requirement"></p></div>
            <h2 id="exam-title"></h2><div id="exam-questions"></div><div id="exam-results"></div></div>`;
        const questions = Array.from({ length: 3 }, () => ({ q: 'q', options: ['a', 'b'], correct: 0 }));
        const game = {
            gameState: { money: 1000, educationSystem: { courses: { c: { name: 'C', cost: 10, questions } }, completedCourses: [] } },
            showToast: vi.fn(), uiUpdater: { updateAllUI: vi.fn() }
        };
        Edu.handleStartExam(game, 'c');
        expect(document.getElementById('exam-pass-requirement').textContent).toBe('To pass: 2 of 3 correct');
    });
});
