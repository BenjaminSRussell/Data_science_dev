import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { RoommateSystem } from '../../src/js/game/social/RoommateSystem.js';
import { JealousySystem } from '../../src/js/game/social/JealousySystem.js';
import { DemandingBossSystem } from '../../src/js/game/work/DemandingBossSystem.js';
import { DayNightCycle } from '../../src/js/game/DayNightCycle.js';

afterEach(() => vi.restoreAllMocks());

describe('RoommateSystem.interact (#380)', () => {
    let r;
    beforeEach(() => { r = new RoommateSystem({}); });

    it('starts at relationship 30', () => expect(r.relationship).toBe(30));

    it('talk gives +2 and a topic chosen by Math.random', () => {
        vi.spyOn(Math, 'random').mockReturnValue(0.99);
        const res = r.interact('talk');
        expect(r.relationship).toBe(32);
        expect(res.topic).toBe('Want to grab food together?');
        Math.random.mockReturnValue(0);
        expect(r.interact('talk').topic).toBe('How was work today?');
    });

    it('ask_help declines below 40 and agrees at exactly 40', () => {
        r.setRelationship(39);
        const no = r.interact('ask_help');
        expect(no.help).toBeUndefined();
        expect(r.relationship).toBe(39);
        r.setRelationship(40);
        const yes = r.interact('ask_help');
        expect(yes.help).toBe(true);
        expect(r.relationship).toBe(43);
    });

    it('complain is -5 and hangout is +5 with an energy benefit', () => {
        r.interact('complain');
        expect(r.relationship).toBe(25);
        const h = r.interact('hangout');
        expect(r.relationship).toBe(30);
        expect(h.benefit).toBe('energy');
    });

    it('unknown actions do nothing', () => {
        expect(r.interact('juggle')).toEqual({ message: 'You interact with your roommate' });
        expect(r.relationship).toBe(30);
    });
});

describe('RoommateSystem status and rent (#381)', () => {
    it('splitRent uses rentSplit (50/50 by default)', () => {
        const r = new RoommateSystem({});
        expect(r.splitRent(1000)).toEqual({ player: 500, roommate: 500, total: 1000 });
        r.rentSplit = 0.25;
        expect(r.splitRent(1000)).toEqual({ player: 250, roommate: 750, total: 1000 });
    });

    it('relationship level boundaries', () => {
        const r = new RoommateSystem({});
        const at = (v) => { r.setRelationship(v); return r.getRelationshipLevel(); };
        // Shared RELATIONSHIP_STAGES ladder (#566)
        expect(at(19)).toBe('stranger');
        expect(at(20)).toBe('friendly');
        expect(at(39)).toBe('friendly');
        expect(at(40)).toBe('acquaintance');
        expect(at(59)).toBe('acquaintance');
        expect(at(60)).toBe('friend');
        expect(at(79)).toBe('friend');
        expect(at(80)).toBe('close_friend');
    });

    it('isAtHome follows the schedule by slot', () => {
        const gs = { timeManager: { timeSlot: 0 } };
        const r = new RoommateSystem(gs);
        const home = [0, 1, 2, 3, 4, 5].map(s => { gs.timeManager.timeSlot = s; return r.isAtHome(); });
        expect(home).toEqual([true, true, false, false, true, false]);
        expect(new RoommateSystem({}).isAtHome()).toBe(true);
    });

    it('getStatus summarizes the roommate', () => {
        const r = new RoommateSystem({ timeManager: { timeSlot: 2 } });
        expect(r.getStatus()).toEqual({ name: 'Alex', relationship: 30, relationshipLevel: 'friendly', atHome: false });
    });
});

function npcState(npcs) {
    const rel = {};
    const flags = {};
    for (const n of npcs) { rel[n.id] = 40; flags[n.id] = {}; }
    return {
        npcManager: {
            metNPCs: npcs.map(n => n.id),
            getMetNPCs: () => npcs,
            getNPC: id => npcs.find(n => n.id === id),
            getRelationship: id => rel[id],
            setRelationship: (id, v) => { rel[id] = v; },
            getNPCFlags: id => flags[id]
        },
        rel, flags
    };
}

describe('JealousySystem triggering and escalation (#378)', () => {
    const rival = { id: 'rival', name: 'Rival', personality: 'competitive' };
    const boss = { id: 'boss', name: 'Boss', type: 'business' };
    const mentor = { id: 'mentor', name: 'Mentor', type: 'mentor' };
    const pal = { id: 'pal', name: 'Pal', type: 'friend' };

    it('competitive, business and mentor NPCs only resent career/financial wins', () => {
        const gs = npcState([rival, boss, mentor]);
        const j = new JealousySystem(gs);
        for (const npc of [rival, boss, mentor]) {
            expect(j.shouldBeJealous(npc, { type: 'career' })).toBe(true);
            expect(j.shouldBeJealous(npc, { type: 'financial' })).toBe(true);
            expect(j.shouldBeJealous(npc, { type: 'romance' })).toBe(false);
        }
    });

    it('others are jealous on a 30% roll; strangers never are', () => {
        const gs = npcState([pal]);
        const j = new JealousySystem(gs);
        vi.spyOn(Math, 'random').mockReturnValue(0.1);
        expect(j.shouldBeJealous(pal, { type: 'romance' })).toBe(true);
        Math.random.mockReturnValue(0.5);
        expect(j.shouldBeJealous(pal, { type: 'romance' })).toBe(false);
        expect(j.shouldBeJealous({ id: 'stranger', personality: 'competitive' }, { type: 'career' })).toBe(false);
    });

    it('checkJealousy raises levels by success level (default 10)', () => {
        const gs = npcState([rival]);
        const j = new JealousySystem(gs);
        j.checkJealousy({ type: 'career' });
        expect(j.getJealousyLevel('rival')).toBe(10);
        j.checkJealousy({ type: 'career', level: 25 });
        expect(j.getJealousyLevel('rival')).toBe(35);
        j.checkJealousy({ type: 'romance' });
        expect(j.getJealousyLevel('rival')).toBe(35);
    });

    it('accumulates, clamps at 100 and fires penalties when crossing 50 and 75', () => {
        const gs = npcState([rival]);
        const j = new JealousySystem(gs);
        j.increaseJealousy('rival', 50);
        expect(gs.rel.rival).toBe(40);
        j.increaseJealousy('rival', 10);
        expect(gs.rel.rival).toBe(35);
        expect(gs.flags.rival.willNotTalk).toBeUndefined();
        j.increaseJealousy('rival', 20);
        expect(gs.flags.rival.willNotTalk).toBe(true);
        expect(gs.flags.rival.jealousyMessage).toContain('Rival');
        j.increaseJealousy('rival', 500);
        expect(j.getJealousyLevel('rival')).toBe(100);
        expect(gs.rel.rival).toBe(35);
    });

    it('ignores negative and NaN amounts', () => {
        const j = new JealousySystem(npcState([rival]));
        j.increaseJealousy('rival', 20);
        j.increaseJealousy('rival', -50);
        j.increaseJealousy('rival', NaN);
        j.increaseJealousy('rival', 'lots');
        expect(j.getJealousyLevel('rival')).toBe(20);
    });

    it('does nothing without an npcManager or when disabled', () => {
        expect(() => new JealousySystem({}).checkJealousy({ type: 'career' })).not.toThrow();
        const gs = npcState([rival]);
        gs.gameplaySettings = { settings: { relationships: { enabled: true, jealousy: false } } };
        const j = new JealousySystem(gs);
        j.checkJealousy({ type: 'career' });
        expect(j.getJealousyLevel('rival')).toBe(0);
    });
});

describe('JealousySystem decay and recovery (#379)', () => {
    const rival = { id: 'rival', name: 'Rival', personality: 'competitive' };

    it('affectRelationship floors at 0 and tracks changes', () => {
        const gs = npcState([rival]);
        const j = new JealousySystem(gs);
        j.affectRelationship('rival', -100);
        expect(gs.rel.rival).toBe(0);
        expect(j.getRelationshipChanges('rival')).toBe(-100);
        expect(() => new JealousySystem({}).affectRelationship('x', -5)).not.toThrow();
    });

    it('stopTalking ignores unknown NPCs and sets the flag + a message', () => {
        const gs = npcState([rival]);
        const j = new JealousySystem(gs);
        expect(() => j.stopTalking('ghost')).not.toThrow();
        j.stopTalking('rival');
        expect(gs.flags.rival.willNotTalk).toBe(true);
        expect(typeof gs.flags.rival.jealousyMessage).toBe('string');
    });

    it('reduceJealousy floors at 0, defaults to 1 and lets the NPC talk again below 50', () => {
        const gs = npcState([rival]);
        const j = new JealousySystem(gs);
        j.increaseJealousy('rival', 80);
        expect(gs.flags.rival.willNotTalk).toBe(true);
        j.reduceJealousy('rival');
        expect(j.getJealousyLevel('rival')).toBe(79);
        j.reduceJealousy('rival', 29);
        expect(gs.flags.rival.willNotTalk).toBe(true);
        j.reduceJealousy('rival', 1);
        expect(gs.flags.rival.willNotTalk).toBe(false);
        expect(gs.rel.rival).toBe(40);
        j.reduceJealousy('rival', 999);
        expect(j.getJealousyLevel('rival')).toBe(0);
    });

    it('getJealousyLevel defaults to 0', () => {
        expect(new JealousySystem({}).getJealousyLevel('never')).toBe(0);
    });
});

describe('DemandingBossSystem (#386)', () => {
    it('evaluateTask deltas and clamping', () => {
        const b = new DemandingBossSystem({});
        expect(b.evaluateTask({}, 90, true)).toMatchObject({ change: 15, satisfaction: 65 });
        b.satisfaction = 50;
        expect(b.evaluateTask({}, 70, true)).toMatchObject({ change: 5, satisfaction: 55 });
        b.satisfaction = 10;
        expect(b.evaluateTask({}, 40, false)).toMatchObject({ change: -25, satisfaction: 0 });
        b.satisfaction = 95;
        expect(b.evaluateTask({}, 80, true).satisfaction).toBe(100);
        b.satisfaction = 50;
        expect(b.evaluateTask({}, 60, false).change).toBe(-10);
    });

    it('getBossMessage boundaries', () => {
        const b = new DemandingBossSystem({});
        expect(b.getBossMessage(6)).toBe('Good work. Keep it up.');
        // decent work on time (+5) is good work (#1780)
        expect(b.getBossMessage(5)).toBe('Good work. Keep it up.');
        expect(b.getBossMessage(4)).toBe('Adequate. I expect more next time.');
        expect(b.getBossMessage(0)).toBe('Adequate. I expect more next time.');
        expect(b.getBossMessage(-5)).toBe('Adequate. I expect more next time.');
        expect(b.getBossMessage(-6)).toBe('This is unacceptable. Do better.');
    });

    it('getBossDialogue boundaries', () => {
        const b = new DemandingBossSystem({});
        const at = (v) => { b.satisfaction = v; return b.getBossDialogue(); };
        expect(at(29)).toMatch(/disappointing/);
        expect(at(30)).toMatch(/meeting expectations/);
        expect(at(59)).toMatch(/meeting expectations/);
        expect(at(60)).toMatch(/^Good work/);
    });

    it('initializeBoss tolerates missing data, keeps demandLevel 0 and syncs satisfaction', () => {
        const b = new DemandingBossSystem({});
        expect(() => b.initializeBoss()).not.toThrow();
        expect(b.boss.name).toBe('Mr. Anderson');
        expect(b.demandLevel).toBe(70);
        b.initializeBoss({ demandLevel: 0 });
        expect(b.demandLevel).toBe(0);
        b.evaluateTask({}, 90, true);
        expect(b.boss.satisfaction).toBe(b.satisfaction);
    });

    it('generated tasks get unique ids', () => {
        vi.spyOn(Date, 'now').mockReturnValue(5);
        const b = new DemandingBossSystem({});
        expect(b.generateTask().id).not.toBe(b.generateTask().id);
    });
});

describe('DayNightCycle (#398)', () => {
    beforeEach(() => { document.body.className = ''; document.body.innerHTML = '<div class="map-container"></div>'; });

    it('falls back to morning without a timeManager', () => {
        expect(new DayNightCycle({}).getTimeOfDay()).toBe('morning');
    });

    it('applies the body/map class on the first update, even in the morning', () => {
        const d = new DayNightCycle({ timeManager: { timeSlot: 0 } });
        d.update();
        expect(document.body.classList.contains('time-morning')).toBe(true);
        expect(document.querySelector('.map-container').classList.contains('time-morning')).toBe(true);
    });

    it('only swaps classes when the time of day actually changes, keeping other body classes', () => {
        const gs = { timeManager: { timeSlot: 0 } };
        const d = new DayNightCycle(gs);
        document.body.classList.add('keep-me');
        d.update();
        const spy = vi.spyOn(d, 'updateMapAppearance');
        d.update();
        gs.timeManager.timeSlot = 1;
        d.update();
        expect(spy).not.toHaveBeenCalled();
        gs.timeManager.timeSlot = 4;
        d.update();
        expect(spy).toHaveBeenCalledTimes(1);
        expect(document.body.classList.contains('time-night')).toBe(true);
        expect(document.body.classList.contains('time-morning')).toBe(false);
        expect(document.body.classList.contains('keep-me')).toBe(true);
    });
});
