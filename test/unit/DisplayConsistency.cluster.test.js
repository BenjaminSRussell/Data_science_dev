import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { CommonUtils } from '../../src/js/utils/CommonUtils.js';
import { LitUIManager } from '../../src/js/ui/LitUIManager.js';
import { CompanyManagementSystem } from '../../src/js/game/company/CompanyManagementSystem.js';
import { finishExam } from '../../src/js/helpers/EducationHelpers.js';
import { WeeklyNewsSystem } from '../../src/js/game/WeeklyNewsSystem.js';
import { StorylineManager } from '../../src/js/game/StorylineManager.js';
import { ethicsBand, ETHICS_ARC_THRESHOLD } from '../../src/js/data/ethics.js';

describe('money format is the same on every screen (#142)', () => {
    it('formatMoney uses separators and cents only when needed', () => {
        expect(CommonUtils.formatMoney(1250)).toBe('$1,250');
        expect(CommonUtils.formatMoney(1250.5)).toBe('$1,250.50');
        expect(CommonUtils.formatMoney(1250.004)).toBe('$1,250');
        expect(CommonUtils.formatMoney(-42.1)).toBe('-$42.10');
        expect(CommonUtils.formatMoney(undefined)).toBe('$0');
        expect(CommonUtils.formatMoney(NaN)).toBe('$0');
    });

    it('top bar and stock market cash readout render the same string', () => {
        document.body.innerHTML = '<span id="money-value"></span><span id="liquid-cash"></span><span id="portfolio-value"></span>';
        const game = { gameState: { money: 1250.5 } };
        const mgr = Object.create(LitUIManager.prototype);
        mgr.game = game;
        mgr.updateTopBarFallback();
        expect(document.getElementById('money-value').textContent).toBe('$1,250.50');
        const src = readFileSync('src/js/helpers/StockMarketHelpers.js', 'utf8');
        const start = src.indexOf('function updatePortfolioSummary');
        const fn = src.slice(start, src.indexOf('\n}\n', start));
        expect(fn).toContain('CommonUtils.formatMoney(game.gameState.money)');
        expect(fn).not.toContain('toFixed(2)');
    });

    it('the top bar markup has no literal "$" in front of the formatted value', () => {
        const html = readFileSync('index.html', 'utf8');
        expect(html).toContain('<span id="money-value">$0</span>');
        expect(html).not.toMatch(/\$ <span id="money-value">/);
    });
});

describe('Continue dropdown uses a defined button class (#1783)', () => {
    it('matches the menu button it replaces', () => {
        const src = readFileSync('src/js/ui/SaveSlotManager.js', 'utf8');
        expect(src).not.toMatch(/className = '[^']*btn-grey-secondary/);
        expect(src).toContain("dropdownBtn.className = 'btn-manual-action'");
        expect(readFileSync('src/styles/text-ui.css', 'utf8')).toContain('.btn-manual-action {');
    });
});

describe('employee work progress is clamped (#1399)', () => {
    const make = (totalDays, task, productivity = 1) => {
        const sys = new CompanyManagementSystem({ timeManager: { totalDays } });
        sys.employees = [{ id: 'e1', name: 'Pat', productivity, satisfaction: 50, currentTask: task }];
        return sys.getEmployeeWorkStatus('e1');
    };

    it('never reports negative progress when assigned is in the future', () => {
        const s = make(3, { name: 'ETL', difficulty: 2, assigned: 10 });
        expect(s.progress).toBe(0);
        expect(s.message).toContain('(0% complete)');
    });

    it('handles zero difficulty, bad assigned and caps at 100', () => {
        expect(make(5, { name: 'x', difficulty: 0, assigned: 1 }).progress).toBeGreaterThan(0);
        expect(make(5, { name: 'x', difficulty: 1, assigned: 'junk' }).progress).toBeLessThanOrEqual(100);
        expect(make(500, { name: 'x', difficulty: 1, assigned: 1 }).progress).toBe(100);
        expect(Number.isFinite(make(5, { name: 'x', difficulty: 1, assigned: 1 }, NaN).progress)).toBe(true);
    });
});

describe('exam toast names the course (#1639)', () => {
    it('shows the course name instead of its id', () => {
        document.body.innerHTML = '';
        const showToast = vi.fn();
        const game = {
            currentExam: { courseId: 'python_101', questions: [{}, {}], score: 2 },
            gameState: { educationSystem: { courses: { python_101: { name: 'Intro to Python' } }, completeCourse: vi.fn() } },
            showToast
        };
        finishExam(game);
        expect(showToast).toHaveBeenCalledWith('Passed Intro to Python!', 'success');
    });

    it('falls back to the id for an unknown course', () => {
        const showToast = vi.fn();
        finishExam({
            currentExam: { courseId: 'mystery', questions: [{}], score: 1 },
            gameState: { educationSystem: { courses: {}, completeCourse: vi.fn() } },
            showToast
        });
        expect(showToast).toHaveBeenCalledWith('Passed mystery!', 'success');
    });
});

describe('newspaper and storyline agree on the ethics path (#1190)', () => {
    it('ethicsBand uses the shared ±30 threshold', () => {
        expect(ETHICS_ARC_THRESHOLD).toBe(30);
        expect(ethicsBand(-31)).toBe('dark');
        expect(ethicsBand(-25)).toBe('balanced');
        expect(ethicsBand(25)).toBe('balanced');
        expect(ethicsBand(31)).toBe('righteous');
        expect(ethicsBand(undefined)).toBe('balanced');
    });

    it.each([[-25, 'balanced'], [-35, 'dark'], [35, 'righteous'], [0, 'balanced']])('ethics %i → same branch in both systems', (ethics, band) => {
        const gameState = { characterStats: { ethics }, timeManager: { totalDays: 1, week: 1 } };
        const news = new WeeklyNewsSystem(gameState);
        const calls = [];
        news.generateCriminalStory = () => calls.push('dark');
        news.generateEthicalStory = () => calls.push('righteous');
        news.generateNeutralStory = () => calls.push('balanced');
        news.generateMainStory();
        expect(calls).toEqual([band]);
        const arc = new StorylineManager(gameState).getCurrentArc();
        const arcBand = { 'The Dark Path': 'dark', 'The Righteous Path': 'righteous' }[arc.name] || 'balanced';
        expect(arcBand).toBe(band);
    });
});
