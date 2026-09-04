/**
 * SaveManager Unit Tests
 * Verifies slot-index bounds validation in exportSave/importSave
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { SaveManager } from '../../src/js/save/SaveManager.js';

describe('SaveManager slot-index validation', () => {
    let saveManager;
    let setItemSpy;
    let getItemSpy;

    beforeEach(() => {
        saveManager = new SaveManager();
        setItemSpy = vi.spyOn(localStorage, 'setItem');
        getItemSpy = vi.spyOn(localStorage, 'getItem');
    });

    afterEach(() => {
        vi.restoreAllMocks();
    });

    it('importSave returns false for out-of-range slot index without touching localStorage', () => {
        const validEncoded = btoa(JSON.stringify({
            version: 1,
            timestamp: Date.now(),
            slotIndex: 0,
            metadata: { name: 'Test', createdAt: Date.now(), lastPlayed: Date.now() },
            state: {}
        }));
        const gameState = { fromJSON: vi.fn() };

        const result = saveManager.importSave(validEncoded, gameState, 99);

        expect(result).toBe(false);
        expect(setItemSpy).not.toHaveBeenCalled();
        expect(getItemSpy).not.toHaveBeenCalled();
        expect(gameState.fromJSON).not.toHaveBeenCalled();
    });

    it('importSave returns false for negative slot index without touching localStorage', () => {
        const validEncoded = btoa(JSON.stringify({
            version: 1,
            timestamp: Date.now(),
            slotIndex: 0,
            metadata: { name: 'Test', createdAt: Date.now(), lastPlayed: Date.now() },
            state: {}
        }));
        const gameState = { fromJSON: vi.fn() };

        const result = saveManager.importSave(validEncoded, gameState, -1);

        expect(result).toBe(false);
        expect(setItemSpy).not.toHaveBeenCalled();
        expect(getItemSpy).not.toHaveBeenCalled();
    });

    it('exportSave returns null for out-of-range slot index without touching localStorage', () => {
        const result = saveManager.exportSave(99);

        expect(result).toBeNull();
        expect(getItemSpy).not.toHaveBeenCalled();
    });

    it('exportSave returns null for negative slot index without touching localStorage', () => {
        const result = saveManager.exportSave(-1);

        expect(result).toBeNull();
        expect(getItemSpy).not.toHaveBeenCalled();
    });
});
