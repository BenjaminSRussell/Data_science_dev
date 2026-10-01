/**
 * Unit tests for UIUpdater
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { UIUpdater } from '../../src/js/ui/UIUpdater.js';
import { logger } from '../../src/js/utils/Logger.js';

// Mock the logger
vi.mock('../../src/js/utils/Logger.js', () => ({
    logger: {
        warn: vi.fn(),
        error: vi.fn(),
        debug: vi.fn(),
        info: vi.fn(),
        setLevel: vi.fn(),
        setEnabled: vi.fn()
    }
}));

// Mock LitUIManager to avoid complex initialization
vi.mock('../../src/js/ui/LitUIManager.js', () => ({
    LitUIManager: class {
        constructor() {}
        initialize() {}
    }
}));

describe('UIUpdater', () => {
    let uiUpdater;
    let mockGame;

    beforeEach(() => {
        // Clear all mocks before each test
        vi.clearAllMocks();

        // Setup mock game object
        mockGame = {
            newsManager: {
                getDailyPaper: vi.fn(() => null) // Returns null to trigger the warning
            },
            gameStore: {},
            gameState: {}
        };

        uiUpdater = new UIUpdater(mockGame);
    });

    describe('updateNewspaperScreen', () => {
        it('should call logger.warn when paper is not found', () => {
            uiUpdater.updateNewspaperScreen();
            expect(logger.warn).toHaveBeenCalledWith('No paper found!');
        });

        it('should not call console.warn when paper is not found', () => {
            const consoleWarnSpy = vi.spyOn(console, 'warn');
            uiUpdater.updateNewspaperScreen();
            expect(consoleWarnSpy).not.toHaveBeenCalled();
            consoleWarnSpy.mockRestore();
        });

        it('should not log when paper is found', () => {
            const mockPaper = { id: 1 };
            mockGame.newsManager.getDailyPaper = vi.fn(() => mockPaper);
            uiUpdater.updateNewspaperScreen();
            expect(logger.warn).not.toHaveBeenCalled();
        });
    });
});
