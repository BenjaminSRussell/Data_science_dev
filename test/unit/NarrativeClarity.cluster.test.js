import { describe, it, expect, beforeEach } from 'vitest';
import { NarrativeClaritySystem } from '../../src/js/game/NarrativeClaritySystem.js';
import { StoryUI } from '../../src/js/ui/StoryUI.js';

const gs = (o = {}) => ({ timeManager: { totalDays: 40 }, money: 500, reputation: 0, characterStats: { ethics: 0 }, ...o });

describe('NarrativeClaritySystem cluster', () => {
    it('#1528 has no write-only cached context', () => {
        expect(new NarrativeClaritySystem(gs())).not.toHaveProperty('narrativeContext');
    });

    it('#1529 the situation reacts to money, reputation and ethics', () => {
        const n = new NarrativeClaritySystem(gs());
        const plain = n.getSituationDescription(40, 500, 0, 0);
        expect(plain).toEqual(n.getPhaseSituation(40));
        const debt = n.getSituationDescription(40, -100, 0, 0);
        expect(debt.title).toBe(plain.title);
        expect(debt.goals[0]).toBe('Get out of debt');
        expect(debt.description).toMatch(/debt/);
        const famous = n.getSituationDescription(40, 500, 2000, 50);
        expect(famous.goals).toContain('Use your influence wisely');
        expect(famous.description).toMatch(/doors/);
        expect(famous.description).toMatch(/right way/);
        expect(n.getSituationDescription(40, 500, 0, -50).description).toMatch(/shortcuts/);
        expect(n.getSituationDescription(40, 500, -10, 0).goals[0]).toBe('Repair your reputation');
    });

    describe('#1531 recommendation uses the decision and context', () => {
        const decision = {
            choices: {
                accept: { consequences: { ethics: -10, money: 5000, reputation: 50 } },
                reject: { consequences: { ethics: 10, reputation: 20 } },
                leak: { consequences: { ethics: 5, reputation: 80, risk: 'legal action' } }
            }
        };
        const n = new NarrativeClaritySystem(gs());
        it('integrity favours the most ethical choice', () => {
            expect(n.getDecisionRecommendation(decision, { themes: ['integrity'], motivation: 'growth' })).toMatch(/"reject" fits best/);
        });
        it('a struggling player is pointed at the money', () => {
            expect(n.getDecisionRecommendation(decision, { themes: ['balance'], motivation: 'survival' })).toMatch(/finances, "accept"/);
        });
        it('otherwise reputation, and risks are called out', () => {
            const r = n.getDecisionRecommendation(decision, { themes: ['balance'], motivation: 'success' });
            expect(r).toMatch(/"leak" fits best/);
            expect(r).toMatch(/carries risk: legal action/);
        });
        it('no choices falls back to the generic line; no context reads live state', () => {
            expect(n.getDecisionRecommendation({}, null)).toMatch(/goals and values/);
            expect(n.getDecisionRecommendation(decision)).toMatch(/fits best/);
        });
    });
});

describe('#1533 StoryUI shows motivation and themes', () => {
    beforeEach(() => {
        document.body.innerHTML = `<div class="story-narrative-info">
            <div id="narrative-chapter"></div><div id="narrative-situation"></div><div id="narrative-goals"></div></div>`;
    });
    it('renders the motivation line and one tag per theme, once', () => {
        const n = new NarrativeClaritySystem(gs({ money: 20000, reputation: 1500, characterStats: { ethics: 40 } }));
        const ui = Object.create(StoryUI.prototype);
        ui.game = { gameState: { narrativeClaritySystem: n } };
        ui.updateNarrativeContext();
        ui.updateNarrativeContext();
        expect(document.querySelectorAll('#narrative-themes')).toHaveLength(1);
        expect(document.querySelector('.narrative-motivation').textContent).toBe(NarrativeClaritySystem.MOTIVATION_TEXT.success);
        const tags = [...document.querySelectorAll('.narrative-theme')].map(t => t.textContent);
        expect(tags).toEqual(['integrity', 'justice', 'influence']);
    });
});

describe('#2176 location unlock uses the location message', () => {
    it('shows unlockMessage, falling back to the generic toast', async () => {
        const { EnvironmentManager } = await import('../../src/js/game/EnvironmentManager.js');
        const { OFFICE_LOCATIONS } = await import('../../src/js/data/locations.js');
        const toasts = [];
        window.game = { showToast: (m) => toasts.push(m) };
        const em = Object.create(EnvironmentManager.prototype);
        const loc = OFFICE_LOCATIONS.find(l => l.unlockMessage);
        expect(em.showLocationUnlock(loc)).toBe(loc.unlockMessage);
        em.showLocationUnlock({ name: 'Garage' });
        expect(toasts).toEqual([loc.unlockMessage, 'New Location Unlocked: Garage!']);
        delete window.game;
    });
});
