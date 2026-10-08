import { describe, it, expect, vi } from 'vitest';
import { readFileSync } from 'node:fs';
import { CATEGORIES } from '../../src/js/game/LibraryDatabase.js';
import { EmotionalBreakdownSystem } from '../../src/js/game/dialogue/EmotionalBreakdownSystem.js';
import { RealWorldTaskSystem } from '../../src/js/game/work/RealWorldTaskSystem.js';

describe('library category labels (#1641)', () => {
    it('have no leading or trailing whitespace', () => {
        for (const label of Object.values(CATEGORIES)) expect(label).toBe(label.trim());
    });

    it('match the static Library tab buttons', () => {
        const html = readFileSync('index.html', 'utf8');
        for (const [cat, label] of Object.entries(CATEGORIES)) {
            expect(html).toContain(`data-cat="${cat}">${label}</button>`);
        }
    });
});

describe('quick-time breakdown is answered once (#1020)', () => {
    const setup = () => {
        const modifyRelationship = vi.fn();
        const sys = new EmotionalBreakdownSystem({ npcManager: { modifyRelationship } });
        sys.showBreakdownResult = vi.fn();
        sys.resolveBreakdown = vi.fn();
        sys.activeBreakdowns.set('b1', { id: 'b1', npcId: 'alex', type: 'stress', playerResponse: null, resolved: false });
        return { sys, modifyRelationship };
    };

    it('a second choice click is ignored', () => {
        vi.useFakeTimers();
        const { sys, modifyRelationship } = setup();
        sys.handleQuickTimeChoice('b1', 'comfort', 'positive');
        sys.handleQuickTimeChoice('b1', 'dismiss', 'negative');
        expect(modifyRelationship).toHaveBeenCalledTimes(1);
        expect(sys.activeBreakdowns.get('b1').playerResponse.choiceId).toBe('comfort');
        vi.runAllTimers();
        expect(sys.resolveBreakdown).toHaveBeenCalledTimes(1);
        vi.useRealTimers();
    });

    it('a timeout after an answer (or an answer after a timeout) is ignored', () => {
        vi.useFakeTimers();
        const a = setup();
        a.sys.handleQuickTimeChoice('b1', 'comfort', 'positive');
        a.sys.handleQuickTimeTimeout('b1');
        expect(a.modifyRelationship).toHaveBeenCalledTimes(1);
        const b = setup();
        b.sys.handleQuickTimeTimeout('b1');
        b.sys.handleQuickTimeChoice('b1', 'comfort', 'positive');
        expect(b.modifyRelationship).toHaveBeenCalledTimes(1);
        expect(b.sys.activeBreakdowns.get('b1').playerResponse.choiceId).toBe('timeout');
        vi.runAllTimers();
        vi.useRealTimers();
    });
});

describe('RealWorldTaskSystem.startTask keeps progress (#1822)', () => {
    const task = () => ({ id: 't', steps: [{ completed: false }, { completed: false }, { completed: false }] });

    it('restarting the running task does not reset its step', () => {
        const sys = new RealWorldTaskSystem({});
        const t = task();
        sys.startTask(t);
        sys.completeStep();
        const startedAt = t.startedAt;
        expect(sys.startTask(t)).toBe(t);
        expect(t.currentStep).toBe(1);
        expect(t.startedAt).toBe(startedAt);
    });

    it('a different task cannot replace the one in progress', () => {
        const sys = new RealWorldTaskSystem({});
        const t = task();
        sys.startTask(t);
        sys.completeStep();
        expect(sys.startTask(task())).toBeNull();
        expect(sys.currentTask).toBe(t);
        expect(t.currentStep).toBe(1);
    });
});
