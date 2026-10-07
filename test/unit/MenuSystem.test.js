import { describe, it, expect, vi } from 'vitest';
import { MenuSystem } from '../../src/js/systems/MenuSystem.js';
import { StatisticsAggregator } from '../../src/js/ui/StatisticsAggregator.js';
import { RANKS } from '../../src/js/data/ranks.js';

describe('MenuSystem', () => {
    let menuSystem;
    let mockSaveSlotManager;
    let mockStatisticsAggregator;

    beforeEach(() => {
        mockSaveSlotManager = {
            init: vi.fn(),
        };

        mockStatisticsAggregator = {
            calculate: vi.fn(),
            getStats: vi.fn(),
            formatPlaytime: vi.fn(),
            formatMoney: vi.fn(),
        };

        // Mocking the import of SaveSlotManager
        vi.mock('../../src/js/ui/SaveSlotManager.js', () => ({
            __esModule: true,
            default: mockSaveSlotManager,
        }));

        // Mocking the StatisticsAggregator
        vi.mock('../../src/js/ui/StatisticsAggregator.js', () => ({
            __esModule: true,
            default: mockStatisticsAggregator,
        }));

        menuSystem = new MenuSystem();
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    describe('init', () => {
        it('should hide btn-continue when saveSlotManager init succeeds', async () => {
            await menuSystem.init();
            expect(document.querySelector('#btn-continue').style.display).toBe('none');
        });

        it('should show btn-continue when saveSlotManager init fails', async () => {
            mockSaveSlotManager.init.mockRejectedValue(new Error('Failed to initialize SaveSlotManager'));
            await menuSystem.init();
            expect(document.querySelector('#btn-continue').style.display).toBe('');
        });
    });

    describe('renderStatisticsDashboard', () => {
        it('should hide dashboard when totalPlaytime and gamesCompleted are 0', () => {
            mockStatisticsAggregator.calculate.mockReturnValue({ totalPlaytime: 0, gamesCompleted: 0 });
            menuSystem.renderStatisticsDashboard();
            expect(document.querySelector('#statistics-dashboard').style.display).toBe('none');
        });

        it('should populate dashboard with formatted values when totalPlaytime and gamesCompleted are non-zero', () => {
            mockStatisticsAggregator.calculate.mockReturnValue({
                totalPlaytime: 10,
                gamesCompleted: 1,
                highestRankName: RANKS[6].title,
                totalMoney: 10000,
                totalTasks: 50,
                totalReputation: 100,
                sessions: 3,
                averageSessionLength: 2,
                lastUpdated: Date.now(),
            });
            mockStatisticsAggregator.formatPlaytime.mockReturnValue('10h');
            mockStatisticsAggregator.formatMoney.mockReturnValue('$10.0K');
            menuSystem.renderStatisticsDashboard();
            expect(document.querySelector('#statistics-dashboard').style.display).toBe('grid');
            expect(document.querySelector('#total-playtime').textContent).toBe('10h');
            expect(document.querySelector('#games-completed').textContent).toBe('1');
            expect(document.querySelector('#highest-rank').textContent).toBe(RANKS[6].title);
            expect(document.querySelector('#total-money').textContent).toBe('$10.0K');
            expect(document.querySelector('#total-tasks').textContent).toBe('50');
            expect(document.querySelector('#total-reputation').textContent).toBe('100');
            expect(document.querySelector('#sessions').textContent).toBe('3');
            expect(document.querySelector('#average-session-length').textContent).toBe('2');
        });
    });

    describe('initEnhancements', () => {
        it('should update time-of-day to night at 5:00 AM', () => {
            vi.setSystemTime(new Date('2023-10-01T05:00:00Z'));
            menuSystem.initEnhancements();
            expect(document.querySelector('#time-of-day').textContent).toBe('Night');
        });

        it('should update time-of-day to morning at 6:00 AM', () => {
            vi.setSystemTime(new Date('2023-10-01T06:00:00Z'));
            menuSystem.initEnhancements();
            expect(document.querySelector('#time-of-day').textContent).toBe('Morning');
        });

        it('should update time-of-day to morning at 11:00 AM', () => {
            vi.setSystemTime(new Date('2023-10-01T11:00:00Z'));
            menuSystem.initEnhancements();
            expect(document.querySelector('#time-of-day').textContent).toBe('Morning');
        });

        it('should update time-of-day to afternoon at 12:00 PM', () => {
            vi.setSystemTime(new Date('2023-10-01T12:00:00Z'));
            menuSystem.initEnhancements();
            expect(document.querySelector('#time-of-day').textContent).toBe('Afternoon');
        });

        it('should update time-of-day to afternoon at 17:00 PM', () => {
            vi.setSystemTime(new Date('2023-10-01T17:00:00Z'));
            menuSystem.initEnhancements();
            expect(document.querySelector('#time-of-day').textContent).toBe('Afternoon');
        });

        it('should update time-of-day to evening at 18:00 PM', () => {
            vi.setSystemTime(new Date('2023-10-01T18:00:00Z'));
            menuSystem.initEnhancements();
            expect(document.querySelector('#time-of-day').textContent).toBe('Evening');
        });

        it('should update time-of-day to evening at 21:00 PM', () => {
            vi.setSystemTime(new Date('2023-10-01T21:00:00Z'));
            menuSystem.initEnhancements();
            expect(document.querySelector('#time-of-day').textContent).toBe('Evening');
        });

        it('should update time-of-day to night at 22:00 PM', () => {
            vi.setSystemTime(new Date('2023-10-01T22:00:00Z'));
            menuSystem.initEnhancements();
            expect(document.querySelector('#time-of-day').textContent).toBe('Night');
        });
    });

    describe('setupKeyboardNavigation', () => {
        let buttons;

        beforeEach(() => {
            buttons = [
                document.createElement('button'),
                document.createElement('button'),
                document.createElement('button'),
            ];
            buttons.forEach((btn, index) => {
                btn.classList.add('btn-manual-action');
                btn.tabIndex = index;
            });
            document.body.append(...buttons);
            menuSystem.setupKeyboardNavigation();
        });

        afterEach(() => {
            buttons.forEach(btn => document.body.removeChild(btn));
        });

        it('should focus the next button on arrow-right', () => {
            buttons[0].focus();
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            document.dispatchEvent(event);
            expect(document.activeElement).toBe(buttons[1]);
        });

        it('should focus the first button on arrow-right at the last button', () => {
            buttons[2].focus();
            const event = new KeyboardEvent('keydown', { key: 'ArrowRight' });
            document.dispatchEvent(event);
            expect(document.activeElement).toBe(buttons[0]);
        });

        it('should focus the previous button on arrow-left', () => {
            buttons[2].focus();
            const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            document.dispatchEvent(event);
            expect(document.activeElement).toBe(buttons[1]);
        });

        it('should focus the last button on arrow-left at the first button', () => {
            buttons[0].focus();
            const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' });
            document.dispatchEvent(event);
            expect(document.activeElement).toBe(buttons[2]);
        });
    });
});