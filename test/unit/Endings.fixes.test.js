// @vitest-environment jsdom
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { GameEndingSystem } from '../../src/js/game/GameEndingSystem.js';
import { createGameEndingModal, formatEndingMoney, buildEndingStatsHTML } from '../../src/js/ui/GameEndingModal.js';
import { RANKS } from '../../src/js/data/ranks.js';
import { STATS } from '../../src/js/game/CharacterStats.js';

const TOP = RANKS.length - 1;

function gs(over = {}) {
    return { rankIndex: 0, money: 0, reputation: 0, timeManager: { totalDays: 10 }, ...over };
}

describe('GameEndingSystem precedence (#1984, #1259, #517, #400)', () => {
    it('speedrun beats early retirement, ethics and final rank', () => {
        const s = new GameEndingSystem(gs({ rankIndex: TOP, timeManager: { totalDays: 20 }, characterStats: { ethics: 90 } }));
        expect(s.checkVictoryConditions().type).toBe('speedrun');
    });
    it('early retirement between 30 and 50 days', () => {
        const s = new GameEndingSystem(gs({ rankIndex: TOP, timeManager: { totalDays: 40 } }));
        expect(s.checkVictoryConditions().type).toBe('early_retirement');
    });
    it('ethics endings beat the generic final rank (#1260 reads characterStats.ethics)', () => {
        const good = new GameEndingSystem(gs({ rankIndex: TOP, timeManager: { totalDays: 200 }, characterStats: { ethics: 85 } }));
        expect(good.checkVictoryConditions().type).toBe('ethical_leader');
        const bad = new GameEndingSystem(gs({ rankIndex: TOP, timeManager: { totalDays: 200 }, characterStats: { ethics: -60 } }));
        expect(bad.checkVictoryConditions().type).toBe('ruthless_climber');
        const meh = new GameEndingSystem(gs({ rankIndex: TOP, timeManager: { totalDays: 200 }, characterStats: { ethics: 10 } }));
        expect(meh.checkVictoryConditions().type).toBe('final_rank');
    });
    it('getEndingStats reports characterStats.ethics', () => {
        const s = new GameEndingSystem(gs({ characterStats: { ethics: 42, getStat: () => 5 } }));
        expect(s.getEndingStats().ethics).toBe(42);
    });
});

describe('previously impossible endings (#1986, #854, #2357, #2026, #1322)', () => {
    it('research master fires from unlocked breakthrough papers', () => {
        const papers = [{ isBreakthrough: true }, { isBreakthrough: true }, { isBreakthrough: true }];
        const s = new GameEndingSystem(gs({ researchPaperSystem: { getBreakthroughPapers: () => papers } }));
        expect(s.checkResearchBreakthrough()?.type).toBe('research_master');
        const few = new GameEndingSystem(gs({ researchPaperSystem: { getBreakthroughPapers: () => papers.slice(0, 2) } }));
        expect(few.checkResearchBreakthrough()).toBeNull();
    });
    it('company owner fires from an LLC plus a real team', () => {
        const staff = Array.from({ length: 5 }, (_, i) => ({ id: i }));
        const legal = { hasLicense: id => id === 'llc_registration' };
        expect(new GameEndingSystem(gs({ legalSystem: legal, staff })).checkCompanyOwnership()?.type).toBe('company_owner');
        expect(new GameEndingSystem(gs({ legalSystem: legal, staff: staff.slice(1) })).checkCompanyOwnership()).toBeNull();
        expect(new GameEndingSystem(gs({ legalSystem: { hasLicense: () => false }, staff })).checkCompanyOwnership()).toBeNull();
    });
});

describe('triggerEnding and continue playing (#1136, #1137, #1138, #1139, #401)', () => {
    it('records earned endings, and later endings can still be earned', () => {
        const state = gs({ money: 2_000_000 });
        const s = new GameEndingSystem(state);
        const first = s.checkVictoryConditions();
        expect(first.type).toBe('millionaire');
        s.triggerEnding(first);
        expect(s.checkVictoryConditions()).toBeNull();
        state.perfectScores = 100;
        const second = s.checkVictoryConditions();
        expect(second.type).toBe('perfectionist');
        s.triggerEnding(second);
        expect(s.getEarnedEndings().map(e => e.type)).toEqual(['millionaire', 'perfectionist']);
    });
    it('reaching the top rank earns only one top-rank ending', () => {
        const state = gs({ rankIndex: TOP, timeManager: { totalDays: 20 }, characterStats: { ethics: 90 } });
        const s = new GameEndingSystem(state);
        s.triggerEnding(s.checkVictoryConditions());
        state.timeManager.totalDays = 300;
        expect(s.checkVictoryConditions()).toBeNull();
    });
    it('computes stats once and honors showEnding', () => {
        const mainGame = { showGameEnding: vi.fn() };
        const s = new GameEndingSystem(gs({ mainGame }));
        const spy = vi.spyOn(s, 'getEndingStats');
        s.triggerEnding({ type: 'millionaire', title: 'M', showEnding: true });
        expect(spy).toHaveBeenCalledTimes(1);
        expect(mainGame.showGameEnding).toHaveBeenCalledTimes(1);
        s.triggerEnding({ type: 'perfectionist', title: 'P', showEnding: false });
        expect(mainGame.showGameEnding).toHaveBeenCalledTimes(1);
        expect(s.hasEarned('perfectionist')).toBe(true);
    });
    it('round-trips earned endings and migrates old saves', () => {
        const s = new GameEndingSystem(gs());
        s.triggerEnding({ type: 'millionaire', title: 'Millionaire', showEnding: false });
        const back = new GameEndingSystem(gs());
        back.fromJSON(JSON.parse(JSON.stringify(s.toJSON())));
        expect(back.hasEarned('millionaire')).toBe(true);
        const old = new GameEndingSystem(gs());
        old.fromJSON({ endingTriggered: true, endingType: 'perfectionist', endingData: { title: 'Perfectionist' } });
        expect(old.getEarnedEndings()[0].type).toBe('perfectionist');
    });
    it('skill breakdown uses real CharacterStats ids (#1261)', () => {
        const s = new GameEndingSystem(gs({ characterStats: { getStat: () => 7 } }));
        expect(Object.keys(s.getSkillStats())).toEqual(Object.keys(STATS));
        expect(Object.values(s.getSkillStats()).every(v => v === 7)).toBe(true);
    });
});

describe('ending screen (#1509, #1510, #1511)', () => {
    beforeEach(() => { document.body.innerHTML = ''; });

    it('formats negative money as -$500', () => {
        expect(formatEndingMoney(-500)).toBe('-$500');
        expect(formatEndingMoney(1500)).toBe('$1,500');
    });
    it('shows all computed stats', () => {
        const html = buildEndingStatsHTML({ hours: 12, totalEarned: 900, totalSpent: 300, averageRating: 4.25,
            coursesCompleted: 3, ethics: 20, relationships: { a: 40, b: 60 }, skills: { technical: 9 } });
        for (const text of ['Hours Played', 'Total Earned', 'Total Spent', 'Average Rating', 'Courses', 'Ethics', 'People Met', 'Technical']) {
            expect(html).toContain(text);
        }
        expect(html).toContain('4.3');
    });
    it('uses the stored stats and closes on backdrop click and Escape', () => {
        const endingSystem = { getEndingStats: vi.fn(() => ({})), getEarnedEndings: () => [{ type: 'm', title: 'Millionaire' }] };
        const context = { gameState: { gameEndingSystem: endingSystem, gameEnding: { stats: { money: -500, days: 9 } } }, showToast: vi.fn() };
        createGameEndingModal({ title: 'Millionaire' }, context);
        const modal = document.getElementById('game-ending-modal');
        expect(endingSystem.getEndingStats).not.toHaveBeenCalled();
        expect(modal.textContent).toContain('-$500');
        expect(modal.textContent).toContain('Endings earned (1)');
        modal.dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(document.getElementById('game-ending-modal')).toBeNull();

        createGameEndingModal({ title: 'Millionaire' }, context);
        document.dispatchEvent(new KeyboardEvent('keydown', { key: 'Escape' }));
        expect(document.getElementById('game-ending-modal')).toBeNull();
    });
    it('clicks inside the card do not close it', () => {
        const context = { gameState: { gameEnding: { stats: {} } } };
        createGameEndingModal({ title: 'X' }, context);
        document.querySelector('.ending-content').dispatchEvent(new MouseEvent('click', { bubbles: true }));
        expect(document.getElementById('game-ending-modal')).not.toBeNull();
    });
});
