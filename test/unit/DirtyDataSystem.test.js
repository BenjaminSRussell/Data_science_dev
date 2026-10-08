/**
 * DirtyDataSystem risk/reward and reputation math (#303, #114, #2073, #2075)
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { DirtyDataSystem } from '../../src/js/game/data/DirtyDataSystem.js';

describe('DirtyDataSystem', () => {
    let gs;
    let dds;

    beforeEach(() => {
        gs = { money: 1000, reputation: 50, timeManager: { totalDays: 12 }, legalSystem: { addLegalIssue: vi.fn() } };
        dds = new DirtyDataSystem(gs);
    });

    afterEach(() => vi.restoreAllMocks());

    it('rejects unknown actions without side effects', () => {
        expect(dds.performAction('nope')).toEqual({ success: false });
        expect(dds.unethicalActions).toHaveLength(0);
        expect(dds.reputation).toBe(0);
        expect(gs.money).toBe(1000);
    });

    it('not caught: records the action, pays the reward, and lowers reputation', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        const r = dds.performAction('manipulate_data');
        expect(r).toMatchObject({ success: true, caught: false, reward: 200 });
        expect(dds.unethicalActions).toEqual([{ action: 'manipulate_data', date: 12, caught: false }]);
        expect(dds.reputation).toBe(-10);
        expect(gs.money).toBe(1200);
        expect(gs.reputation).toBe(40);
    });

    it('caught: reputation drops by double the hit and a legal issue is filed', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const r = dds.performAction('manipulate_data');
        expect(r.caught).toBe(true);
        expect(r.success).toBe(false);
        expect(dds.reputation).toBe(-20);
        expect(gs.reputation).toBe(30);
        expect(gs.money).toBe(1000);
        expect(gs.legalSystem.addLegalIssue).toHaveBeenCalledWith(expect.objectContaining({ type: 'data_violation', severity: 5 }));
        expect(dds.unethicalActions[0].caught).toBe(true);
    });

    it('getting caught is always worse than getting away with it', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        dds.performAction('sell_data');
        const caughtRep = dds.reputation;
        const other = new DirtyDataSystem({ money: 0 });
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        other.performAction('sell_data');
        expect(caughtRep).toBeLessThan(other.reputation);
    });

    it('works without a legal system, money or reputation on gameState', () => {
        const bare = new DirtyDataSystem({});
        vi.spyOn(Math, 'random').mockReturnValue(0);
        expect(() => bare.performAction('fake_results')).not.toThrow();
        expect(bare.reputation).toBe(-30);
        expect(bare.unethicalActions[0].date).toBe(1);
    });

    it('player reputation never goes below 0', () => {
        gs.reputation = 5;
        vi.spyOn(Math, 'random').mockReturnValue(0);
        dds.performAction('privacy_violation');
        expect(gs.reputation).toBe(0);
    });

    it('getReputationLevel boundaries', () => {
        const at = (v) => { dds.reputation = v; return dds.getReputationLevel(); };
        expect(at(0)).toBe('clean');
        expect(at(-9)).toBe('clean');
        expect(at(-10)).toBe('questionable');
        expect(at(-29)).toBe('questionable');
        expect(at(-30)).toBe('bad');
        expect(at(-49)).toBe('bad');
        expect(at(-50)).toBe('terrible');
    });

    it('round-trips through toJSON/fromJSON', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        dds.performAction('manipulate_data');
        const restored = new DirtyDataSystem(gs);
        restored.fromJSON(JSON.parse(JSON.stringify(dds.toJSON())));
        expect(restored.reputation).toBe(-10);
        expect(restored.unethicalActions).toHaveLength(1);
    });
});
