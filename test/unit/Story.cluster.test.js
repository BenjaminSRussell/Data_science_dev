/**
 * Story cluster: journal acts (#2151, #1772), money format (#1775), Story
 * button label (#2393), systems path (#2395), storyImpact shown (#1107,
 * #1505), whistleblower firing (#1504), arrest warning (#1503), real
 * investment gamble (#1762), phase-aware arc (#1421), arc changes shown
 * (#1478), CSS cleanups (#1793, #1797, #1795, #1788).
 */
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { readFileSync } from 'node:fs';
import { resolve } from 'node:path';
import { StorylineManager } from '../../src/js/game/StorylineManager.js';
import { StoryUI } from '../../src/js/ui/StoryUI.js';

const css = p => readFileSync(resolve(__dirname, '../../src/styles', p), 'utf8');

function makeManager(state = {}) {
    const gs = { money: 50000, reputation: 0, rankIndex: 3, timeManager: { totalDays: 0 }, characterStats: { ethics: 0, modifyEthics(d) { this.ethics += d; } }, ...state };
    const sm = new StorylineManager(gs);
    gs.storylineManager = sm;
    return { gs, sm };
}

function bareUI(game) {
    const ui = Object.create(StoryUI.prototype);
    ui.game = game;
    return ui;
}

describe('StorylineManager', () => {
    it('whistleblower expose costs a rank (#1504)', () => {
        const { gs, sm } = makeManager();
        sm.storylinePhase = 'mid';
        sm.processDecision('whistleblower', 'expose');
        expect(gs.rankIndex).toBe(2);
    });

    it('storyImpact is returned (#1107, #1505)', () => {
        const { sm } = makeManager();
        const res = sm.processDecision('first_job_offer', 'reject');
        expect(res.storyImpact).toMatch(/integrity/);
    });

    it('investing is a real gamble (#1762)', () => {
        const win = makeManager();
        win.sm.random = () => 0.1;
        const w = win.sm.processDecision('startup_investment', 'invest');
        expect(w.outcome).toBe('win');
        expect(win.gs.money).toBe(80000);
        const lose = makeManager();
        lose.sm.random = () => 0.9;
        const l = lose.sm.processDecision('startup_investment', 'invest');
        expect(l.outcome).toBe('lose');
        expect(lose.gs.money).toBe(40000);
        expect(lose.sm.majorDecisions[0].outcome).toBe('lose');
        const decline = makeManager();
        decline.sm.processDecision('startup_investment', 'decline');
        expect(decline.gs.money).toBe(50000);
    });

    it('arc text depends on the act (#1421)', () => {
        const { sm } = makeManager();
        sm.storylinePhase = 'early';
        const early = sm.getCurrentArc();
        sm.storylinePhase = 'endgame';
        const end = sm.getCurrentArc();
        expect(early.name).toBe(end.name);
        expect(early.description).not.toBe(end.description);
        expect(end.phase).toBe('endgame');
    });

    it('records and saves when each act began (#2151, #1772)', () => {
        const { gs, sm } = makeManager();
        gs.timeManager.totalDays = 31;
        sm.checkPhaseTransition();
        gs.timeManager.totalDays = 95;
        sm.checkPhaseTransition();
        expect(sm.phaseHistory).toEqual([{ phase: 'mid', day: 31 }, { phase: 'late', day: 95 }]);
        const fresh = makeManager().sm;
        fresh.fromJSON(JSON.parse(JSON.stringify(sm.toJSON())));
        expect(fresh.phaseHistory).toHaveLength(2);
    });
});

describe('StoryUI', () => {
    beforeEach(() => { document.body.innerHTML = ''; });

    it('journal keeps every act, in order with decisions (#2151, #1772)', () => {
        document.body.innerHTML = '<div id="story-journal"></div>';
        const { gs, sm } = makeManager();
        gs.timeManager.totalDays = 10;
        sm.processDecision('first_job_offer', 'reject');
        sm.storylinePhase = 'late';
        sm.phaseHistory = [{ phase: 'mid', day: 31 }];
        gs.timeManager.totalDays = 120;
        const ui = bareUI({ gameState: gs });
        ui.getDecisionData = id => sm.getDecision(id);
        ui.updateJournalDisplay();
        const texts = [...document.querySelectorAll('.journal-text')].map(e => e.textContent);
        const iDecision = texts.findIndex(t => t.startsWith('Your First Big Opportunity'));
        const iAct2 = texts.findIndex(t => t.includes('Act 2'));
        const iAct3 = texts.findIndex(t => t.includes('Act 3'));
        expect(iDecision).toBeGreaterThan(0);
        expect(iAct2).toBeGreaterThan(iDecision);
        expect(iAct3).toBeGreaterThan(iAct2);
        expect(texts.some(t => t.includes('final act'))).toBe(false);
    });

    it('money reads -$2,000, not $-2,000 (#1775)', () => {
        expect(StoryUI.formatMoneyDelta(-2000)).toBe('-$2,000');
        expect(StoryUI.formatMoneyDelta(5000)).toBe('+$5,000');
        const html = bareUI({}).formatConsequences({ money: -2000 });
        expect(html).toContain('-$2,000');
        expect(html).not.toContain('$-');
    });

    it('arrest and firing are spelled out before choosing (#1503, #1504)', () => {
        const ui = bareUI({});
        expect(ui.formatConsequences({ risk: 'arrest' })).toMatch(/Arrest/);
        expect(ui.formatConsequences({ fired: true })).toMatch(/lose your job/);
        const { sm } = makeManager();
        expect(sm.getDecision('criminal_opportunity').choices.accept.stakes).toMatch(/arrested/);
    });

    it('Story nav button has a visible label (#2393)', () => {
        document.body.innerHTML = '<div class="top-bar-right"><button id="btn-settings">OPTS</button></div>';
        bareUI({}).createStoryButton();
        expect(document.getElementById('btn-nav-story').textContent).toBe('STORY');
    });

    it('decision choice reaches gameState systems and shows storyImpact (#2395, #1107)', () => {
        const { gs } = makeManager();
        gs.npcMemorySystem = { recordDecision: vi.fn() };
        gs.characterArcSystem = { updateCurrentState: vi.fn() };
        const game = { gameState: gs, showToast: vi.fn() };
        const ui = bareUI(game);
        ui.updateStoryDisplay = vi.fn();
        ui.handleDecisionChoice('first_job_offer', 'reject');
        expect(gs.npcMemorySystem.recordDecision).toHaveBeenCalledWith('first_job_offer', 'reject');
        expect(gs.characterArcSystem.updateCurrentState).toHaveBeenCalled();
        expect(game.showToast.mock.calls.some(c => /integrity/.test(c[0]))).toBe(true);
    });

    it('arc changes are shown (#1478)', () => {
        expect(StoryUI.formatArcChanges({ ethics: 12, reputation: 300, rank: 1, days: 9 })).toBe('Ethics +12 · Reputation +300 · Rank +1');
        expect(StoryUI.formatArcChanges({ ethics: 0, reputation: 0, rank: 0 })).toBe('');
    });
});

describe('story CSS', () => {
    it('no duplicate bare .choice-text rule (#1793)', () => {
        expect(css('story-ui.css')).not.toMatch(/(^|\n)\.choice-text\s*\{/);
    });

    it('decision modal stacks above the research inbox (#1797)', () => {
        const z = sel => Number(css(sel[0]).match(new RegExp(`\\${sel[1]}\\s*\\{[^}]*z-index:\\s*(\\d+)`))[1]);
        expect(z(['story-ui.css', '.story-decision-modal'])).toBeGreaterThan(z(['research-inbox.css', '.research-inbox-container']));
    });

    it('orphaned rules are gone (#1795, #1788)', () => {
        const story = css('story-ui.css');
        for (const c of ['.character-arc-display', '.arc-arrow', '.arc-label', '.story-arc-section-full']) expect(story).not.toContain(c);
        const text = css('text-ui.css');
        for (const c of ['.text-ui-content', '.hide-on-small', '.full-width-on-medium', '.text-progress-empty', '.phase-indicator', '.phase-dot', '.text-scroll-area', '.btn-grey-primary']) {
            expect(text).not.toContain(c);
        }
    });
});
