/**
 * Save/load persistence: GameState round-trips, subsystem toJSON/fromJSON,
 * SaveManager import/export/migration, and SaveSlotManager behaviours.
 */
import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { GameState } from '../../src/js/game/GameState.js';
import {
    SaveManager, MAX_SAVE_SLOTS, SAVE_KEY_PREFIX, migrateSaveRecord, encodeSaveString, decodeSaveString
} from '../../src/js/save/SaveManager.js';
import { SaveSlotManager, formatLastPlayed } from '../../src/js/ui/SaveSlotManager.js';
import { IDESystem } from '../../src/js/game/IDESystem.js';
import { InvestmentEcommerceSystem } from '../../src/js/game/InvestmentEcommerceSystem.js';
import { CompanyManagementSystem } from '../../src/js/game/company/CompanyManagementSystem.js';
import { RelationshipEmotionSystem } from '../../src/js/game/RelationshipEmotionSystem.js';
import { StorylineManager } from '../../src/js/game/StorylineManager.js';
import { CharacterArcSystem } from '../../src/js/game/CharacterArcSystem.js';
import { StoryBeatsSystem } from '../../src/js/game/StoryBeatsSystem.js';
import { NPCMemorySystem } from '../../src/js/game/NPCMemorySystem.js';
import { WorkInteractionSystem } from '../../src/js/game/WorkInteractionSystem.js';
import { DemandingBossSystem } from '../../src/js/game/work/DemandingBossSystem.js';
import { RomanceProgressionSystem } from '../../src/js/game/romance/RomanceProgressionSystem.js';
import { AISystem } from '../../src/js/game/AISystem.js';
import { GameEndingSystem } from '../../src/js/game/GameEndingSystem.js';

function roundTrip(gs) {
    return JSON.parse(JSON.stringify(gs.toJSON()));
}

describe('GameState persistence', () => {
    it('persists startTime, jailSentence, totalSpent, settings and location', () => {
        const gs = new GameState();
        gs.startTime = 1234567;
        gs.jailSentence = 12;
        gs.totalSpent = 450;
        gs.currentLocation = 'office';
        gs.settings.autoSave = false;
        gs.npcMemories = { sarah: { decisions: [1], reactions: [] } };
        gs.completedStoryBeats = ['first_day'];

        const loaded = new GameState();
        loaded.fromJSON(roundTrip(gs));
        expect(loaded.startTime).toBe(1234567);
        expect(loaded.jailSentence).toBe(12);
        expect(loaded.totalSpent).toBe(450);
        expect(loaded.currentLocation).toBe('office');
        expect(loaded.settings.autoSave).toBe(false);
        expect(loaded.npcMemories.sarah.decisions).toEqual([1]);
        expect(loaded.completedStoryBeats).toEqual(['first_day']);
    });

    it('persists the in-progress task without letting its timer expire across the reload', () => {
        const gs = new GameState();
        gs.currentTask = { id: 'task_1', startTime: Date.now() - 5000, timeLimit: 60 };
        const data = roundTrip(gs);
        expect(data.currentTask.startTime).toBeUndefined();
        expect(data.currentTask.elapsedMs).toBeGreaterThanOrEqual(5000);

        const loaded = new GameState();
        loaded.fromJSON(data);
        expect(loaded.currentTask.id).toBe('task_1');
        const elapsed = Date.now() - loaded.currentTask.startTime;
        expect(elapsed).toBeGreaterThanOrEqual(5000);
        expect(elapsed).toBeLessThan(10000);
    });

    it('purchaseItem tracks totalSpent', () => {
        const gs = new GameState();
        gs.money = 1000;
        expect(gs.purchaseItem({ id: 'x', price: 300, type: 'software' })).toBe(true);
        expect(gs.totalSpent).toBe(300);
    });

    it('no longer serializes the dead bankSystem wiring; bank state lives in gameState.bank', () => {
        const gs = new GameState();
        gs.bank = { savings: 10, loan: 0 };
        const data = roundTrip(gs);
        expect('bankSystem' in data).toBe(false);
        const loaded = new GameState();
        loaded.fromJSON(data);
        expect(loaded.bank).toEqual({ savings: 10, loan: 0 });
    });

    it('isolates subsystem restore failures so later subsystems still load', () => {
        const gs = new GameState();
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        gs.worldMap = { fromJSON: () => { throw new Error('boom'); }, toJSON: () => ({ a: 1 }) };
        gs.gameEndingSystem = new GameEndingSystem(gs);
        gs.fromJSON({ worldMap: { a: 1 }, gameEndingSystem: { endingTriggered: true, endingType: 'millionaire' } });
        expect(gs.gameEndingSystem.endingTriggered).toBe(true);
        expect(errSpy).toHaveBeenCalled();
        errSpy.mockRestore();
    });

    it('isolates subsystem save failures', () => {
        const gs = new GameState();
        const errSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
        gs.worldMap = { toJSON: () => { throw new Error('boom'); } };
        gs.gameEndingSystem = new GameEndingSystem(gs);
        gs.gameEndingSystem.endingTriggered = true;
        const data = gs.toJSON();
        expect(data.worldMap).toBeNull();
        expect(data.gameEndingSystem.endingTriggered).toBe(true);
        errSpy.mockRestore();
    });

    it('restores characterStats before projectSystem', () => {
        const order = [];
        const gs = new GameState();
        gs.projectSystem = { fromJSON: () => order.push('project'), toJSON: () => ({}) };
        gs.characterStats = { fromJSON: () => order.push('stats'), toJSON: () => ({}) };
        gs.fromJSON({ projectSystem: {}, characterStats: {} });
        expect(order).toEqual(['stats', 'project']);
    });

    it('caps realWorldTaskSystem history in saves', () => {
        const gs = new GameState();
        gs.realWorldTaskSystem = { currentTask: null, taskHistory: Array.from({ length: 250 }, (_, i) => ({ i })) };
        const data = roundTrip(gs);
        expect(data.realWorldTaskSystem.taskHistory).toHaveLength(GameState.MAX_TASK_HISTORY);
        expect(data.realWorldTaskSystem.taskHistory.at(-1)).toEqual({ i: 249 });
    });

    it('round-trips subsystems that previously had no save path', () => {
        const gs = new GameState();
        gs.ideSystem = new IDESystem(gs);
        gs.investmentEcommerceSystem = new InvestmentEcommerceSystem(gs);
        gs.companyManagement = new CompanyManagementSystem(gs);
        gs.relationshipEmotionSystem = new RelationshipEmotionSystem(gs);
        gs.storylineManager = new StorylineManager(gs);
        gs.characterArcSystem = new CharacterArcSystem(gs);
        gs.storyBeatsSystem = new StoryBeatsSystem(gs);
        gs.npcMemorySystem = new NPCMemorySystem(gs);
        gs.workInteractionSystem = new WorkInteractionSystem(gs);
        gs.demandingBoss = new DemandingBossSystem(gs);
        gs.romanceProgressionSystem = new RomanceProgressionSystem(gs);
        gs.gameEndingSystem = new GameEndingSystem(gs);

        gs.ideSystem.completedProjects = [{ id: 'p1' }];
        gs.ideSystem.currentProject = { id: 'p2', progress: 40 };
        gs.investmentEcommerceSystem.portfolio.totalValue = 999;
        gs.investmentEcommerceSystem.ecommerceBusiness = { name: 'Shop' };
        gs.companyManagement.playerCompany = { name: 'DataCo' };
        gs.companyManagement.employees = [{ id: 'e1' }];
        gs.relationshipEmotionSystem.emotionalStates = { sarah: { trust: 70 } };
        gs.storylineManager.majorDecisions = [{ id: 'd1' }];
        gs.storylineManager.storylineProgress = 42;
        gs.characterArcSystem.startingState = { ethics: 5 };
        gs.characterArcSystem.arcHistory = [{ week: 1 }];
        gs.storyBeatsSystem.completedBeats = ['b1'];
        gs.npcMemorySystem.npcMemories = { mike: { decisions: [], reactions: ['x'] } };
        gs.workInteractionSystem.boss.relationship = 77;
        gs.workInteractionSystem.boss.promotionReadiness = 55;
        gs.demandingBoss.satisfaction = 12;
        gs.demandingBoss.demandLevel = 90;
        gs.romanceProgressionSystem.relationshipStage = 'engaged';
        gs.gameEndingSystem.endingTriggered = true;

        const data = roundTrip(gs);

        const loaded = new GameState();
        loaded.ideSystem = new IDESystem(loaded);
        loaded.investmentEcommerceSystem = new InvestmentEcommerceSystem(loaded);
        loaded.companyManagement = new CompanyManagementSystem(loaded);
        loaded.relationshipEmotionSystem = new RelationshipEmotionSystem(loaded);
        loaded.storylineManager = new StorylineManager(loaded);
        loaded.characterArcSystem = new CharacterArcSystem(loaded);
        loaded.storyBeatsSystem = new StoryBeatsSystem(loaded);
        loaded.npcMemorySystem = new NPCMemorySystem(loaded);
        loaded.workInteractionSystem = new WorkInteractionSystem(loaded);
        loaded.demandingBoss = new DemandingBossSystem(loaded);
        loaded.romanceProgressionSystem = new RomanceProgressionSystem(loaded);
        loaded.gameEndingSystem = new GameEndingSystem(loaded);
        loaded.fromJSON(data);

        expect(loaded.ideSystem.completedProjects).toEqual([{ id: 'p1' }]);
        expect(loaded.ideSystem.currentProject).toEqual({ id: 'p2', progress: 40 });
        expect(loaded.ideSystem.availableProjects.length).toBeGreaterThan(0);
        expect(loaded.investmentEcommerceSystem.portfolio.totalValue).toBe(999);
        expect(loaded.investmentEcommerceSystem.ecommerceBusiness).toEqual({ name: 'Shop' });
        expect(loaded.companyManagement.playerCompany).toEqual({ name: 'DataCo' });
        expect(loaded.companyManagement.employees).toEqual([{ id: 'e1' }]);
        expect(loaded.relationshipEmotionSystem.emotionalStates).toEqual({ sarah: { trust: 70 } });
        expect(loaded.storylineManager.majorDecisions).toEqual([{ id: 'd1' }]);
        expect(loaded.storylineManager.storylineProgress).toBe(42);
        expect(loaded.characterArcSystem.startingState).toEqual({ ethics: 5 });
        expect(loaded.characterArcSystem.arcHistory).toEqual([{ week: 1 }]);
        expect(loaded.storyBeatsSystem.completedBeats).toEqual(['b1']);
        expect(loaded.completedStoryBeats).toEqual(['b1']);
        expect(loaded.npcMemorySystem.npcMemories.mike.reactions).toEqual(['x']);
        expect(loaded.workInteractionSystem.boss.relationship).toBe(77);
        expect(loaded.workInteractionSystem.boss.promotionReadiness).toBe(55);
        expect(loaded.demandingBoss.satisfaction).toBe(12);
        expect(loaded.demandingBoss.demandLevel).toBe(90);
        expect(loaded.romanceProgressionSystem.relationshipStage).toBe('engaged');
        expect(loaded.gameEndingSystem.endingTriggered).toBe(true);
    });

    it('subsystem snapshots never include the gameState back-reference', () => {
        const gs = new GameState();
        const ide = new IDESystem(gs);
        expect(ide.toJSON().gameState).toBeUndefined();
    });
});

describe('AISystem persistence', () => {
    it('persists xpToNextLevel and isTraining', () => {
        const ai = new AISystem({});
        ai.level = 3;
        ai.xpToNextLevel = 225;
        ai.isTraining = true;
        const restored = new AISystem({});
        restored.fromJSON(JSON.parse(JSON.stringify(ai.toJSON())));
        expect(restored.xpToNextLevel).toBe(225);
        expect(restored.isTraining).toBe(true);
    });

    it('derives xpToNextLevel from level for older saves', () => {
        const restored = new AISystem({});
        restored.fromJSON({ level: 3, xp: 10 });
        expect(restored.xpToNextLevel).toBe(225); // 100 -> 150 -> 225
    });
});

describe('GameEndingSystem playtime', () => {
    it('caps wall-clock hours by an activity estimate', () => {
        const gs = new GameState();
        gs.startTime = Date.now() - 144 * 3600 * 1000; // a week ago
        gs.tasksCompleted = 5; // ~1 hour of play
        const stats = new GameEndingSystem(gs).getEndingStats();
        expect(stats.hours).toBe(1);
    });
});

describe('SaveManager', () => {
    let sm;
    beforeEach(() => {
        localStorage.clear();
        sm = new SaveManager();
    });
    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
        sm.stopAutoSave();
    });

    it('exports MAX_SAVE_SLOTS', () => {
        expect(MAX_SAVE_SLOTS).toBe(5);
    });

    it('export/import round-trips, storing the parsed record (not a string) and handling non-Latin1 names', () => {
        const gs = new GameState();
        gs.money = 4321;
        expect(sm.saveGame(gs, 0)).toBe(true);
        sm.setSlotName(0, 'Café 🚀 データ');
        const encoded = sm.exportSave(0);
        expect(typeof encoded).toBe('string');

        const target = new GameState();
        expect(sm.importSave(encoded, target, 2)).toBe(true);
        const stored = JSON.parse(localStorage.getItem(SAVE_KEY_PREFIX + 2));
        expect(typeof stored).toBe('object');
        expect(stored.slotIndex).toBe(2);
        expect(stored.metadata.name).toBe('Café 🚀 データ');
        expect(sm.getSaveInfo(2).money).toBe(4321);
        expect(target.money).toBe(4321);
    });

    it('importSave can store without loading when no gameState is given', () => {
        const gs = new GameState();
        gs.money = 77;
        sm.saveGame(gs, 0);
        expect(sm.importSave(sm.exportSave(0), null, 1)).toBe(true);
        expect(sm.getSaveInfo(1).money).toBe(77);
    });

    it('importSave rejects garbage', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(sm.importSave(encodeSaveString('"just a string"'), null, 1)).toBe(false);
        expect(sm.importSave('%%%not-base64', null, 1)).toBe(false);
        expect(localStorage.getItem(SAVE_KEY_PREFIX + 1)).toBeNull();
    });

    it('UTF-8 base64 helpers are inverse', () => {
        const s = '{"name":"😀 ü 中文"}';
        expect(decodeSaveString(encodeSaveString(s))).toBe(s);
    });

    it('migrates unversioned legacy records that kept state at the top level', () => {
        const migrated = migrateSaveRecord({ money: 50, rankIndex: 2, timestamp: 1 });
        expect(migrated.version).toBe(1);
        expect(migrated.state.money).toBe(50);
        expect(migrated.state.rankIndex).toBe(2);
    });

    it('refuses saves from a newer version', () => {
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(migrateSaveRecord({ version: 99, state: {} })).toBeNull();
        localStorage.setItem(SAVE_KEY_PREFIX + 0, JSON.stringify({ version: 99, state: { money: 1 } }));
        const gs = new GameState();
        expect(sm.loadGame(gs, 0)).toBe(false);
        expect(gs.money).toBe(100);
    });

    it('hasSave does not throw when localStorage does', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(Storage.prototype, 'getItem').mockImplementation(() => { throw new Error('denied'); });
        expect(sm.hasSave()).toBe(false);
        expect(sm.hasSave(1)).toBe(false);
    });

    it('treats a null slot as slot 0 when saving', () => {
        expect(sm.saveGame(new GameState(), null)).toBe(true);
        expect(localStorage.getItem(SAVE_KEY_PREFIX + 0)).not.toBeNull();
    });

    it('autosave respects settings.autoSave', () => {
        vi.useFakeTimers();
        const gs = new GameState();
        gs.isGameStarted = true;
        gs.settings.autoSave = false;
        const spy = vi.spyOn(sm, 'saveGame');
        sm.startAutoSave(gs, 1000, 1);
        vi.advanceTimersByTime(3000);
        expect(spy).not.toHaveBeenCalled();
        gs.settings.autoSave = true;
        vi.advanceTimersByTime(1000);
        expect(spy).toHaveBeenCalledWith(gs, 1);
    });

    it('duplicateSave rejects out-of-range targets', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        sm.saveGame(new GameState(), 0);
        expect(sm.duplicateSave(0, 9)).toBe(false);
        expect(sm.duplicateSave(0, 0)).toBe(false);
        expect(sm.duplicateSave(0, 3)).toBe(true);
    });
});

describe('SaveSlotManager', () => {
    let sm;
    let ssm;
    let game;
    let selected;

    beforeEach(() => {
        localStorage.clear();
        document.body.innerHTML = '<div class="menu-navigation"><button id="btn-new-game"></button></div>';
        sm = new SaveManager();
        game = { showToast: vi.fn(), showError: vi.fn() };
        selected = vi.fn();
        ssm = new SaveSlotManager(sm, selected, game);
    });
    afterEach(() => {
        vi.restoreAllMocks();
        vi.useRealTimers();
    });

    it('escapes slot names and rank titles in the rendered list', () => {
        sm.saveGame(new GameState(), 0);
        sm.setSlotName(0, '<img src=x onerror=alert(1)>');
        ssm.init();
        const title = document.querySelector('.save-slot-item.filled .slot-item-title');
        expect(title.textContent).toBe('<img src=x onerror=alert(1)>');
        expect(document.querySelector('.save-slot-item.filled img')).toBeNull();
    });

    it('renders a completion percentage', () => {
        const gs = new GameState();
        sm.saveGame(gs, 0);
        ssm.init();
        expect(document.querySelector('.slot-item-completion').textContent).toMatch(/\d+% complete/);
    });

    it('formatLastPlayed never shows negative days', () => {
        const now = Date.now();
        expect(formatLastPlayed(now + 3 * 86400000, now)).toBe('Today');
        expect(formatLastPlayed(now - 86400000, now)).toBe('Yesterday');
        expect(formatLastPlayed(now - 3 * 86400000, now)).toBe('3 days ago');
    });

    it('slot rows are keyboard operable and track the current slot', () => {
        sm.saveGame(new GameState(), 1);
        ssm.init();
        const row = document.querySelector('.save-slot-item[data-slot-index="1"]');
        expect(row.getAttribute('tabindex')).toBe('0');
        expect(row.getAttribute('role')).toBe('button');
        row.dispatchEvent(new KeyboardEvent('keydown', { key: 'Enter', bubbles: true }));
        expect(selected).toHaveBeenCalledWith(1, false);
        expect(ssm.getCurrentSlot()).toBe(1);
    });

    it('continue dropdown exposes aria-haspopup/aria-expanded', () => {
        sm.saveGame(new GameState(), 0);
        ssm.init();
        const btn = document.getElementById('btn-continue-dropdown');
        expect(btn.getAttribute('aria-haspopup')).toBe('true');
        expect(btn.getAttribute('aria-expanded')).toBe('false');
        ssm.toggleDropdown();
        expect(btn.getAttribute('aria-expanded')).toBe('true');
        ssm.toggleDropdown();
        expect(btn.getAttribute('aria-expanded')).toBe('false');
    });

    it('new game picks the first empty slot', () => {
        sm.saveGame(new GameState(), 0);
        expect(ssm.pickNewGameSlot()).toBe(1);
    });

    it('new game with all slots full asks before overwriting the least recently played slot', () => {
        for (let i = 0; i < MAX_SAVE_SLOTS; i++) sm.saveGame(new GameState(), i);
        const records = [5, 1, 4, 3, 2];
        records.forEach((t, i) => {
            const rec = JSON.parse(localStorage.getItem(SAVE_KEY_PREFIX + i));
            rec.metadata.lastPlayed = t;
            localStorage.setItem(SAVE_KEY_PREFIX + i, JSON.stringify(rec));
        });
        const confirmSpy = vi.spyOn(window, 'confirm').mockReturnValue(false);
        expect(ssm.pickNewGameSlot()).toBeNull();
        confirmSpy.mockReturnValue(true);
        expect(ssm.pickNewGameSlot()).toBe(1);
    });

    it('deleted slots can be undone within the window', () => {
        sm.saveGame(new GameState(), 2);
        ssm.init();
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        ssm.deleteSlot(2);
        expect(sm.hasSave(2)).toBe(false);
        expect(document.querySelector('[data-action="undo-delete"]')).not.toBeNull();
        expect(ssm.undoDelete()).toBe(true);
        expect(sm.hasSave(2)).toBe(true);
        expect(document.querySelector('[data-action="undo-delete"]')).toBeNull();
    });

    it('undo is unavailable after the window expires', () => {
        vi.useFakeTimers();
        sm.saveGame(new GameState(), 2);
        ssm.init();
        vi.spyOn(window, 'confirm').mockReturnValue(true);
        ssm.deleteSlot(2);
        vi.advanceTimersByTime(11000);
        expect(ssm.undoDelete()).toBe(false);
        expect(sm.hasSave(2)).toBe(false);
    });

    it('imports exported text into the first empty slot', () => {
        const gs = new GameState();
        gs.money = 31337;
        sm.saveGame(gs, 0);
        const text = sm.exportSave(0);
        ssm.init();
        expect(ssm.importFromText(text)).toBe(1);
        expect(sm.getSaveInfo(1).money).toBe(31337);
        expect(document.querySelector('[data-action="import"]')).not.toBeNull();
    });

    it('migrateOldSave writes a record with a state key', () => {
        localStorage.setItem('data_science_tycoon_save', JSON.stringify({ money: 999, rankIndex: 1, timestamp: 5 }));
        expect(ssm.migrateOldSave()).toBe(true);
        const rec = JSON.parse(localStorage.getItem(SAVE_KEY_PREFIX + 0));
        expect(rec.state.money).toBe(999);
        expect(localStorage.getItem('data_science_tycoon_save')).toBeNull();
        const gs = new GameState();
        expect(sm.loadGame(gs, 0)).toBe(true);
        expect(gs.money).toBe(999);
    });

    it('migrateOldSave keeps the legacy key if the write fails', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        localStorage.setItem('data_science_tycoon_save', JSON.stringify({ money: 1 }));
        const orig = Storage.prototype.setItem;
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(function (k, v) {
            if (k.startsWith(SAVE_KEY_PREFIX)) throw new Error('QuotaExceededError');
            return orig.call(this, k, v);
        });
        expect(ssm.migrateOldSave()).toBe(false);
        expect(localStorage.getItem('data_science_tycoon_save')).not.toBeNull();
        expect(game.showError).toHaveBeenCalled();
    });

    it('renders slots once the menu container appears late', () => {
        vi.useFakeTimers();
        document.body.innerHTML = '';
        sm.saveGame(new GameState(), 0);
        ssm.init();
        document.body.innerHTML = '<div class="menu-navigation"></div>';
        vi.advanceTimersByTime(150);
        const subtext = document.getElementById('continue-subtext-dropdown');
        expect(subtext.textContent).toBe('1 saved game available');
    });
});

describe('SaveManager core slot management', () => {
    let sm;
    beforeEach(() => {
        localStorage.clear();
        sm = new SaveManager();
    });

    it('clearSave removes only the target slot', () => {
        sm.saveGame(new GameState(), 0);
        sm.saveGame(new GameState(), 1);
        expect(sm.clearSave(0)).toBe(true);
        expect(sm.hasSave(0)).toBe(false);
        expect(sm.hasSave(1)).toBe(true);
    });

    it('getMostRecentSlot follows lastPlayed', () => {
        sm.saveGame(new GameState(), 0);
        sm.saveGame(new GameState(), 3);
        const rec = JSON.parse(localStorage.getItem(SAVE_KEY_PREFIX + 3));
        rec.metadata.lastPlayed = Date.now() + 1000;
        localStorage.setItem(SAVE_KEY_PREFIX + 3, JSON.stringify(rec));
        expect(sm.getMostRecentSlot()).toBe(3);
    });

    it('getAllSlotsInfo returns MAX_SAVE_SLOTS entries with empty markers', () => {
        const gs = new GameState();
        gs.money = 500;
        sm.saveGame(gs, 2);
        const all = sm.getAllSlotsInfo();
        expect(all).toHaveLength(MAX_SAVE_SLOTS);
        expect(all[0].isEmpty).toBe(true);
        expect(all[2].money).toBe(500);
    });

    it('keeps createdAt across saves and names across renames', () => {
        sm.saveGame(new GameState(), 0);
        const created = sm.getSlotCreatedAt(0);
        sm.setSlotName(0, 'Run A');
        sm.saveGame(new GameState(), 0);
        expect(sm.getSlotCreatedAt(0)).toBe(created);
        expect(sm.getSlotName(0)).toBe('Run A');
    });

    it('loadGame refuses an out-of-range slot', () => {
        vi.spyOn(console, 'error').mockImplementation(() => {});
        expect(sm.loadGame(new GameState(), 7)).toBe(false);
        vi.restoreAllMocks();
    });
});

describe('RoommateSystem persistence', async () => {
    const { RoommateSystem } = await import('../../src/js/game/social/RoommateSystem.js');
    it('round-trips relationship and roommate', () => {
        const gs = new GameState();
        gs.roommateSystem = new RoommateSystem(gs);
        gs.roommateSystem.relationship = 81;
        const name = gs.roommateSystem.roommate?.name;
        const data = JSON.parse(JSON.stringify(gs.toJSON()));
        const loaded = new GameState();
        loaded.roommateSystem = new RoommateSystem(loaded);
        loaded.fromJSON(data);
        expect(loaded.roommateSystem.relationship).toBe(81);
        expect(loaded.roommateSystem.roommate?.name).toBe(name);
    });
});

describe('More subsystem persistence', async () => {
    const { JealousySystem } = await import('../../src/js/game/social/JealousySystem.js');
    const { EventSystem } = await import('../../src/js/game/events/EventSystem.js');
    const { DirtyDataSystem } = await import('../../src/js/game/data/DirtyDataSystem.js');
    const { CharacterStats } = await import('../../src/js/game/CharacterStats.js');

    it('round-trips jealousy maps, event calendar, dirty data, office index and character ethics', () => {
        const gs = new GameState();
        gs.jealousySystem = new JealousySystem(gs);
        gs.eventSystem = new EventSystem(gs);
        gs.dirtyDataSystem = new DirtyDataSystem(gs);
        gs.characterStats = new CharacterStats();
        gs.jealousySystem.jealousyLevels.set('sarah', 40);
        gs.eventSystem.upcomingEvents = [{ id: 'crash_1', day: 9 }];
        gs.dirtyDataSystem.reputation = -15;
        gs.dirtyDataSystem.unethicalActions = [{ type: 'p_hack' }];
        gs.characterStats.ethics = -42;
        gs.characterStats.visualStage = 'level_2_evil';
        gs.officeIndex = 3;
        gs.lastEventCheck = 12;

        const data = JSON.parse(JSON.stringify(gs.toJSON()));
        const loaded = new GameState();
        loaded.jealousySystem = new JealousySystem(loaded);
        loaded.eventSystem = new EventSystem(loaded);
        loaded.dirtyDataSystem = new DirtyDataSystem(loaded);
        loaded.characterStats = new CharacterStats();
        loaded.fromJSON(data);

        expect(loaded.jealousySystem.jealousyLevels.get('sarah')).toBe(40);
        expect(loaded.eventSystem.upcomingEvents).toEqual([{ id: 'crash_1', day: 9 }]);
        expect(loaded.dirtyDataSystem.reputation).toBe(-15);
        expect(loaded.dirtyDataSystem.unethicalActions).toEqual([{ type: 'p_hack' }]);
        expect(loaded.characterStats.ethics).toBe(-42);
        expect(loaded.characterStats.visualStage).toBe('level_2_evil');
        expect(loaded.officeIndex).toBe(3);
        expect(loaded.lastEventCheck).toBe(12);
    });

    it('SaveManager reports save failures through onSaveError', () => {
        const sm = new SaveManager();
        const handler = vi.fn();
        sm.onSaveError = handler;
        vi.spyOn(console, 'error').mockImplementation(() => {});
        vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
            const e = new Error('quota'); e.name = 'QuotaExceededError'; throw e;
        });
        expect(sm.saveGame(new GameState(), 1)).toBe(false);
        expect(handler).toHaveBeenCalledWith(expect.objectContaining({ name: 'QuotaExceededError' }), 1);
        vi.restoreAllMocks();
    });
});
