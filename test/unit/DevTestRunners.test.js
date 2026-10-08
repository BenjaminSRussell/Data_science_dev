import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserContinuousTestRunner } from '../../test/integration/browser-test-runner.js';
import { isContinuousTestsEnabled } from '../../test/integration/auto-start-continuous-tests.js';

describe('continuous test runner', () => {
    beforeEach(() => localStorage.clear());

    it('is opt-in (#2327)', () => {
        expect(isContinuousTestsEnabled({ localStorage, location: { search: '' } })).toBe(false);
        expect(isContinuousTestsEnabled({ localStorage, location: { search: '?autotest' } })).toBe(true);
        localStorage.setItem('continuousTestsEnabled', 'true');
        expect(isContinuousTestsEnabled({ localStorage, location: { search: '' } })).toBe(true);
        localStorage.setItem('continuousTestsDisabled', 'true');
        expect(isContinuousTestsEnabled({ localStorage, location: { search: '?autotest' } })).toBe(false);
    });

    it('counts resolved async tests as passed (#89)', async () => {
        const runner = new BrowserContinuousTestRunner({});
        await runner.safeExecute('async ok', async () => true, 'cat');
        expect(runner.testResults.cat.passed).toBe(1);
        await runner.safeExecute('async fail', async () => { throw new Error('x'); }, 'cat');
        expect(runner.testResults.cat.passed).toBe(1);
    });

    it('save round-trip does not clobber a real slot (#2327)', async () => {
        class FakeState { constructor() { this.money = 0; } }
        const gameState = new FakeState(); gameState.money = 42;
        const saveManager = {
            saveGame: vi.fn((gs, slot) => { localStorage.setItem(`data_science_tycoon_save_${slot}`, JSON.stringify({ money: gs.money })); return true; }),
            loadGame: vi.fn((gs, slot) => { const d = JSON.parse(localStorage.getItem(`data_science_tycoon_save_${slot}`)); gs.money = d.money; return true; }),
            startAutoSave: vi.fn(), stopAutoSave: vi.fn()
        };
        localStorage.setItem('data_science_tycoon_save_4', 'PLAYER_SAVE');
        const runner = new BrowserContinuousTestRunner({ saveManager, gameState });
        await runner.testSaveLoadSystem();
        expect(saveManager.saveGame).toHaveBeenCalledWith(gameState, 4);
        expect(saveManager.saveGame.mock.calls.every(c => c[1] !== 0)).toBe(true);
        expect(saveManager.loadGame.mock.calls[0][0]).not.toBe(gameState);
        expect(localStorage.getItem('data_science_tycoon_save_4')).toBe('PLAYER_SAVE');
        expect(gameState.money).toBe(42);
    });

    it('restores money and rank after mutation tests (#2327)', async () => {
        const gameState = { money: 500, rankIndex: 2 };
        const runner = new BrowserContinuousTestRunner({ gameState });
        runner.testGameState = vi.fn(async () => true);
        await runner.mutateStateAndRetest();
        expect(runner.testGameState).toHaveBeenCalledTimes(2);
        expect(gameState.money).toBe(500);
        expect(gameState.rankIndex).toBe(2);
    });
});
