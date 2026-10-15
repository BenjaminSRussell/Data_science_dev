import { describe, it, expect, vi, afterEach } from 'vitest';
import { DemandingBossSystem } from '../../src/js/game/work/DemandingBossSystem.js';
import { WorkInteractionSystem } from '../../src/js/game/WorkInteractionSystem.js';
import { EmotionalBreakdownSystem } from '../../src/js/game/dialogue/EmotionalBreakdownSystem.js';
import { EconomySystem } from '../../src/js/game/EconomySystem.js';
import { NPCManager } from '../../src/js/game/NPCManager.js';
import { JealousySystem } from '../../src/js/game/social/JealousySystem.js';
import { RomanceSystem } from '../../src/js/game/RomanceSystem.js';
import { intervalLacksCleanup } from '../../scripts/static-bug-check.js';

afterEach(() => vi.restoreAllMocks());

describe('DemandingBossSystem (#385, #1014, #1777, #1779, #1780)', () => {
    const boss = (gs = { reputation: 100 }) => {
        const b = new DemandingBossSystem(gs);
        b.initializeBoss({ id: 'b1', demandLevel: 50 });
        return b;
    };

    it('initializeBoss defaults the name and copies demandLevel (#385)', () => {
        const b = boss();
        expect(b.boss.name).toBe('Mr. Anderson');
        expect(b.demandLevel).toBe(50);
    });

    it('difficulty/deadline/reward formulas scale with demand and clamp (#385)', () => {
        const b = boss();
        b.demandLevel = 0;
        expect(b.calculateDifficulty()).toBe(30);
        expect(b.calculateDeadline()).toBe(7);
        b.demandLevel = 100;
        expect(b.calculateDifficulty()).toBe(80);
        expect(b.calculateDeadline()).toBe(2);
        b.demandLevel = 1000;
        expect(b.calculateDifficulty()).toBeLessThanOrEqual(100);
        expect(b.calculateDeadline()).toBeGreaterThanOrEqual(1);
        expect(b.calculateReward(42)).toBe(420);
    });

    it('generateTask builds a task_ id from a known template (#385)', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0);
        const t = boss().generateTask();
        expect(t.id.startsWith('task_')).toBe(true);
        expect(typeof t.name).toBe('string');
        expect(t.name.length).toBeGreaterThan(0);
    });

    it('a +5 swing reads as good work, not neutral (#1780)', () => {
        const b = boss();
        expect(b.getBossMessage(5)).toBe(b.getBossMessage(10));
        expect(b.getBossMessage(4)).not.toBe(b.getBossMessage(5));
    });

    it('hard tasks swing satisfaction more on success and less on failure (#1777)', () => {
        const easyWin = boss().evaluateTask({ difficulty: 20 }, 90, true).change;
        const hardWin = boss().evaluateTask({ difficulty: 90 }, 90, true).change;
        expect(hardWin).toBeGreaterThan(easyWin);
        const easyFail = boss().evaluateTask({ difficulty: 20 }, 40, false).change;
        const hardFail = boss().evaluateTask({ difficulty: 90 }, 40, false).change;
        expect(hardFail).toBeGreaterThan(easyFail); // less negative
        expect(boss().evaluateTask({}, 90, true).change).toBe(15); // unknown difficulty is neutral
    });

    it('crossing praise/anger lines changes reputation once (#1779)', () => {
        const gs = { reputation: 100 };
        const b = boss(gs);
        b.satisfaction = 75;
        const r = b.evaluateTask({}, 90, true);
        expect(r.consequence.type).toBe('praise');
        expect(gs.reputation).toBe(105);
        expect(b.evaluateTask({}, 90, true).consequence).toBeNull();
        b.satisfaction = 25;
        const w = b.evaluateTask({}, 40, false);
        expect(w.consequence.type).toBe('warning');
        expect(gs.reputation).toBe(100);
    });

    it('recordTaskResult maps stars to quality and respects the time limit (#1014)', () => {
        const b = boss();
        const spy = vi.spyOn(b, 'evaluateTask');
        const now = 1_000_000;
        b.recordTaskResult({ timeLimit: 60, startTime: now - 30_000 }, { stars: 5 }, { now });
        expect(spy).toHaveBeenLastCalledWith(expect.anything(), 100, true);
        b.recordTaskResult({ timeLimit: 60, startTime: now - 90_000 }, { stars: 2 }, { now });
        expect(spy).toHaveBeenLastCalledWith(expect.anything(), 40, false);
        // perks extend the limit
        b.recordTaskResult({ timeLimit: 60, startTime: now - 80_000 }, { stars: 3 }, { now, timeLimit: 90 });
        expect(spy).toHaveBeenLastCalledWith(expect.anything(), 60, true);
        expect(b.recordTaskResult(null, { stars: 3 })).toBeNull();
    });

    it('main.js applyTaskRewards feeds the boss', async () => {
        const fs = await import('node:fs');
        const src = fs.readFileSync('src/js/main.js', 'utf8');
        const body = src.slice(src.indexOf('applyTaskRewards(score)'));
        expect(body.slice(0, 4000)).toMatch(/demandingBoss\?\.recordTaskResult\?\.\(/);
    });
});

describe('WorkInteractionSystem dialogue returns one line (#1544)', () => {
    it('talkToCoworker / talkToBoss give a string plus the tier options', () => {
        const w = new WorkInteractionSystem({ reputation: 0 });
        const id = w.coworkers[0].id;
        const c = w.talkToCoworker(id);
        expect(typeof c.dialogue).toBe('string');
        expect(c.lines).toContain(c.dialogue);
        const b = w.talkToBoss();
        expect(typeof b.dialogue).toBe('string');
        expect(b.lines).toContain(b.dialogue);
    });

    it('pickLine handles strings, empties and the last index', () => {
        expect(WorkInteractionSystem.pickLine('hi')).toBe('hi');
        expect(WorkInteractionSystem.pickLine([])).toBe('');
        expect(WorkInteractionSystem.pickLine(['a', 'b'], () => 0.9999)).toBe('b');
    });
});

describe('Rank perks do something (#954)', () => {
    const econ = (rankIndex, extra = {}) => new EconomySystem({
        rankIndex, unlockedPerks: [], getSoftwareQualityMultiplier: () => ({}), ...extra
    });

    it('Senior Analyst+ gets extra task time', () => {
        expect(econ(0).getEffectiveTimeLimit({ timeLimit: 60 })).toBe(60);
        expect(econ(3).getEffectiveTimeLimit({ timeLimit: 60 })).toBe(60 + EconomySystem.RANK_TIME_BONUS_SECONDS);
    });

    it('Principal Scientist+ gets premium pay; CDO gets the time bonus for any on-time finish', () => {
        const task = { potentialReward: 100 };
        const base = econ(0).calculateMoneyReward(task, 3);
        expect(econ(5).calculateMoneyReward(task, 3)).toBe(Math.round(base * EconomySystem.RANK_PREMIUM_CLIENTS));
        const started = Date.now() - 40_000; // 40s of a 60s limit
        const t2 = { potentialReward: 100, timeLimit: 60, startTime: started };
        const low = econ(5).calculateMoneyReward(t2, 3);
        const top = econ(6).calculateMoneyReward(t2, 3);
        expect(top).toBeGreaterThan(low);
    });

    it('hasRankPerk is cumulative', () => {
        expect(econ(4).hasRankPerk('Boss tolerance increased')).toBe(true);
        expect(econ(6).hasRankPerk('Time bonus increased')).toBe(true);
        expect(econ(2).hasRankPerk('Boss tolerance increased')).toBe(false);
    });
});

describe('EmotionalBreakdownSystem (#308, #1021, #1831, #2069, #2070, #2071, #2260, #887)', () => {
    const make = (rel = {}, settings = {}) => {
        const npcManager = {
            relationships: { ...rel },
            getNPC: id => ({ id, name: id, icon: '' }),
            modifyRelationship: vi.fn()
        };
        const sys = new EmotionalBreakdownSystem({ npcManager, settings });
        sys.showBreakdownUI = vi.fn();
        return { sys, npcManager };
    };

    it('low_relationship ignores strangers but fires after a fall-out (#2069)', () => {
        const { sys } = make({ amy: 0 });
        expect(sys.checkBreakdownConditions('amy', 'low_relationship')).toBe(false);
        sys.recordRelationshipChange('amy', 30, 30);
        sys.recordRelationshipChange('amy', -25, 5);
        sys.gameState.npcManager.relationships.amy = 5;
        expect(sys.checkBreakdownConditions('amy', 'low_relationship')).toBe(true);
    });

    it('relationship_drop uses the recent net loss (#2070)', () => {
        const { sys } = make({ bo: 40 });
        let t = 1_000;
        sys.now = () => t;
        sys.recordRelationshipChange('bo', -6, 44);
        expect(sys.checkRecentRelationshipDrop('bo')).toBe(6);
        expect(sys.checkBreakdownConditions('bo', 'relationship_drop')).toBe(false);
        sys.recordRelationshipChange('bo', -6, 38);
        expect(sys.checkBreakdownConditions('bo', 'relationship_drop')).toBe(true);
        t += EmotionalBreakdownSystem.RECENT_WINDOW_MS + 1;
        expect(sys.checkRecentRelationshipDrop('bo')).toBe(0);
    });

    it('rejection and betrayal fire when recorded recently (#2260)', () => {
        const { sys } = make();
        let t = 0;
        sys.now = () => t;
        expect(sys.checkBreakdownConditions('cy', 'rejection')).toBe(false);
        sys.recordRejection('cy');
        sys.recordBetrayal('cy');
        expect(sys.checkBreakdownConditions('cy', 'rejection')).toBe(true);
        expect(sys.checkBreakdownConditions('cy', 'betrayal')).toBe(true);
        t += EmotionalBreakdownSystem.RECENT_WINDOW_MS + 1;
        expect(sys.checkBreakdownConditions('cy', 'betrayal')).toBe(false);
    });

    it('only one active breakdown per NPC (#1021)', () => {
        const { sys } = make();
        sys.recordRejection('dee');
        expect(sys.triggerBreakdown('dee', 'rejection')).not.toBeNull();
        expect(sys.triggerBreakdown('dee', 'rejection')).toBeNull();
        expect(sys.activeBreakdowns.size).toBe(1);
    });

    it('timing out costs the same as the negative choice (#2071)', () => {
        vi.useFakeTimers();
        try {
            const { sys, npcManager } = make();
            sys.recordRejection('ed');
            const b = sys.triggerBreakdown('ed', 'rejection');
            sys.handleQuickTimeTimeout(b.id);
            expect(npcManager.modifyRelationship).toHaveBeenCalledWith('ed', sys.calculateRelationshipChange('negative', 'anger'));
            expect(sys.calculateRelationshipChange('negative', 'anger')).toBe(-20);
        } finally {
            vi.useRealTimers();
        }
    });

    it('relationship change table (#308)', () => {
        const { sys } = make();
        expect(sys.calculateRelationshipChange('positive', 'breakdown')).toBe(15);
        expect(sys.calculateRelationshipChange('neutral', 'rage')).toBe(-5);
        expect(sys.calculateRelationshipChange('bogus', 'hurt')).toBe(0);
    });

    it('the QTE window is adjustable and can be disabled (#887)', () => {
        expect(make().sys.getQuickTimeSeconds()).toBe(5);
        expect(make({}, { breakdownQteSeconds: 12 }).sys.getQuickTimeSeconds()).toBe(12);
        expect(make({}, { breakdownQteSeconds: 1 }).sys.getQuickTimeSeconds()).toBe(3);
        expect(make({}, { breakdownQteSeconds: 999 }).sys.getQuickTimeSeconds()).toBe(30);
        expect(make({}, { reduceTimePressure: true }).sys.getQuickTimeSeconds()).toBe(Infinity);
    });

    it('sad breakdowns get dialogue and CSS (#1831)', async () => {
        const { sys } = make();
        const line = sys.getBreakdownDialogue({}, 'sad', 'hurt');
        expect(line).not.toBe('...');
        const fs = await import('node:fs');
        const css = fs.readFileSync('src/styles/emotional-breakdown.css', 'utf8');
        expect(css).toMatch(/\.emotion-indicator\.sad\b/);
        expect(css).toMatch(/\.breakdown-character\.sad\b/);
    });
});

describe('Emotional breakdowns fire from play (#1830)', () => {
    const NPC = 'professor_higgins';
    let gs, mgr, sys;

    const setup = () => {
        gs = {
            money: 100000,
            reputation: 0,
            timeManager: { totalDays: 1, energy: 100, useEnergy() { return { success: true }; }, advanceTime() {} },
            characterStats: { ethics: 50, getStat: () => 100, addExperience() {}, modifyEthics() {} }
        };
        mgr = new NPCManager(gs);
        gs.npcManager = mgr;
        sys = new EmotionalBreakdownSystem(gs);
        gs.emotionalBreakdownSystem = sys;
    };

    const clearBreakdowns = () => {
        if (!sys) return;
        for (const b of [...sys.activeBreakdowns.values()]) {
            if (b.timer) clearInterval(b.timer);
            sys.resolveBreakdown(b.id);
        }
        document.querySelectorAll('.emotional-breakdown-overlay').forEach(n => n.remove());
    };

    afterEach(() => clearBreakdowns());

    it('a relationship drop mounts the breakdown markup, and a later loss does not repeat it', () => {
        setup();
        // Score already exists; the recent window has not recorded the climb,
        // so a 12-point loss is a net drop (#2070).
        mgr.relationships[NPC] = 40;
        expect(mgr.setRelationship(NPC, 28)).toBe(28);
        const overlay = document.querySelector('.emotional-breakdown-overlay');
        expect(overlay).not.toBeNull();
        expect(overlay.querySelector('.breakdown-container')).not.toBeNull();
        expect(overlay.querySelector('.qte-choice')).not.toBeNull();
        expect(overlay.querySelector('.breakdown-dialogue')).not.toBeNull();
        expect(overlay.querySelector('.qte-bar')).not.toBeNull();
        expect(sys.breakdownHistory).toHaveLength(1);
        expect(sys.breakdownHistory[0].type).toBe('breakdown');

        clearBreakdowns();
        expect(mgr.setRelationship(NPC, 22)).toBe(22);
        expect(sys.breakdownHistory).toHaveLength(1);
        expect(document.querySelector('.emotional-breakdown-overlay')).toBeNull();
    });

    it('falling under 20 after a real relationship opens the hurt breakdown', () => {
        setup();
        mgr.relationships[NPC] = 25;
        mgr.setRelationship(NPC, 18);
        expect(sys.breakdownHistory).toHaveLength(1);
        expect(sys.breakdownHistory[0].emotion).toBe('sad');
        expect(document.querySelector('.emotional-breakdown-overlay')).not.toBeNull();
    });

    it('gains inside the window offset a later dip, so a net gain does not break down', () => {
        setup();
        mgr.relationships[NPC] = 0;
        mgr.setRelationship(NPC, 40);
        mgr.setRelationship(NPC, 28);
        expect(sys.breakdownHistory).toHaveLength(0);
        expect(document.querySelector('.emotional-breakdown-overlay')).toBeNull();
    });

    it('dialogue losses go through modifyRelationship to the same overlay', () => {
        setup();
        mgr.relationships[NPC] = 50;
        // generous personality scales by 1.1; -12 becomes -13, past the drop line
        mgr.modifyRelationship(NPC, -12);
        expect(mgr.getRelationship(NPC)).toBe(37);
        expect(document.querySelector('.qte-choice')).not.toBeNull();
    });

    it('jealous silence and a breakup each open one breakdown', () => {
        setup();
        gs.jealousySystem = new JealousySystem(gs);
        mgr.relationships[NPC] = 40;
        gs.jealousySystem.increaseJealousy(NPC, 80);
        expect(sys.breakdownHistory.some(b => b.type === 'jealousy')).toBe(true);

        clearBreakdowns();
        const npc = mgr.getAllNPCs().find(n => {
            if (!n.romanceOptions) return false;
            const min = n.romanceOptions.minEthics;
            const max = n.romanceOptions.maxEthics;
            return (typeof min !== 'number' || min <= 50) && (typeof max !== 'number' || max >= 50);
        });
        mgr.relationships[npc.id] = 40;
        const romance = new RomanceSystem(gs);
        gs.romanceSystem = romance;
        expect(romance.askOnDate(npc.id).success).toBe(true);
        const before = sys.breakdownHistory.length;
        romance.breakUp('mutual');
        expect(sys.breakdownHistory.length).toBe(before + 1);
        expect(sys.breakdownHistory.at(-1).type).toBe('anger');
    });

    it('cheating on a partner is a betrayal breakdown', () => {
        setup();
        gs.characterStats.ethics = 0;
        const ok = mgr.getAllNPCs().filter(n => {
            if (!n.romanceOptions) return false;
            const min = n.romanceOptions.minEthics;
            const max = n.romanceOptions.maxEthics;
            return (typeof min !== 'number' || min <= 0) && (typeof max !== 'number' || max >= 0);
        });
        expect(ok.length).toBeGreaterThan(1);
        mgr.relationships[ok[0].id] = 40;
        mgr.relationships[ok[1].id] = 40;
        const romance = new RomanceSystem(gs);
        gs.romanceSystem = romance;
        expect(romance.askOnDate(ok[0].id).success).toBe(true);
        expect(romance.askOnDate(ok[1].id).message).toMatch(/Cheater/);
        expect(sys.breakdownHistory.at(-1).type).toBe('rage');
        expect(sys.breakdownHistory.at(-1).npcId).toBe(ok[0].id);
    });
});

describe('static-bug-check interval detector (#2320)', () => {
    it('does not require a destroy() method', () => {
        const line = 'this.t = setInterval(tick, 16);';
        expect(intervalLacksCleanup(line, `${line}\nstop(){ clearInterval(this.t); }`)).toBe(false);
        expect(intervalLacksCleanup(line, line)).toBe(true);
        expect(intervalLacksCleanup('// setInterval(x)', 'whatever')).toBe(false);
    });
});
