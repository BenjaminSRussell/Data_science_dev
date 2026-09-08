/**
 * QuotronTicker Unit Tests
 * Tests DOM construction, scroll animation, and start/stop lifecycle
 */

import { describe, it, expect, beforeAll, beforeEach, vi } from 'vitest';
import { JSDOM } from 'jsdom';
import QuotronTicker from '../../src/components/QuotronTicker';

let dom;

beforeAll(() => {
    dom = new JSDOM(`
        <!DOCTYPE html>
        <html>
        <body>
            <div id="ticker"></div>
        </body>
        </html>
    `);
    global.window = dom.window;
    global.document = dom.window.document;
});

beforeEach(() => {
    // Clear the ticker container before each test
    const tickerContainer = document.getElementById('ticker');
    if (tickerContainer) {
        tickerContainer.innerHTML = '';
    }
});

describe('QuotronTicker', () => {
    it('should log an error if the container does not exist', () => {
        const consoleSpy = vi.spyOn(console, 'error');
        new QuotronTicker('missing-id', {});
        expect(consoleSpy).toHaveBeenCalledWith('QuotronTicker: Container with id "missing-id" does not exist');
        consoleSpy.mockRestore();
    });

    it('should initialize the ticker container and structure', () => {
        const mockStockMarket = {
            getRecentChanges: vi.fn(() => [{ symbol: 'AAPL', changePct: 2.5 }]),
        };
        const ticker = new QuotronTicker('ticker', mockStockMarket);
        const tickerContainer = document.querySelector('.quotron-ticker-container');
        expect(tickerContainer).toBeTruthy();
        expect(tickerContainer.querySelector('.quotron-ticker-scroll')).toBeTruthy();
        expect(tickerContainer.querySelector('.quotron-ticker-content')).toBeTruthy();
    });

    it('should update with recent changes and apply correct classes', () => {
        const mockStockMarket = {
            getRecentChanges: vi.fn(() => [
                { symbol: 'AAPL', changePct: 2.5 },
                { symbol: 'GOOGL', changePct: -1.2 },
            ]),
        };
        const ticker = new QuotronTicker('ticker', mockStockMarket);
        ticker.update();
        const items = document.querySelectorAll('.quotron-ticker-item');
        expect(items.length).toBe(4); // 2x items.length for seamless loop
        expect(items[0].textContent).toContain('AAPL');
        expect(items[0].classList.contains('positive')).toBe(true);
        expect(items[1].textContent).toContain('GOOGL');
        expect(items[1].classList.contains('negative')).toBe(true);
    });

    it('should be a no-op when stockMarket is falsy', () => {
        const ticker = new QuotronTicker('ticker', null);
        const consoleSpy = vi.spyOn(console, 'error');
        ticker.update();
        expect(consoleSpy).toHaveBeenCalledWith('QuotronTicker: stockMarket is falsy');
        consoleSpy.mockRestore();
    });

    it('should start and stop the animation loop', () => {
        const mockStockMarket = {
            getRecentChanges: vi.fn(() => [{ symbol: 'AAPL', changePct: 2.5 }]),
        };
        const requestAnimationFrameSpy = vi.fn();
        const cancelAnimationFrameSpy = vi.fn();
        global.requestAnimationFrame = requestAnimationFrameSpy;
        global.cancelAnimationFrame = cancelAnimationFrameSpy;

        const ticker = new QuotronTicker('ticker', mockStockMarket);
        ticker.start();
        expect(ticker.isRunning).toBe(true);
        expect(requestAnimationFrameSpy).toHaveBeenCalled();
        const handle = requestAnimationFrameSpy.mock.calls[0][0];

        ticker.start(); // Calling start again while running
        expect(requestAnimationFrameSpy).toHaveBeenCalledTimes(1); // No new loop scheduled

        ticker.stop();
        expect(ticker.isRunning).toBe(false);
        expect(cancelAnimationFrameSpy).toHaveBeenCalledWith(handle);
    });

    it('should refresh and restart the animation if not running', () => {
        const mockStockMarket = {
            getRecentChanges: vi.fn(() => [{ symbol: 'AAPL', changePct: 2.5 }]),
        };
        const ticker = new QuotronTicker('ticker', mockStockMarket);
        ticker.stop();
        const startSpy = vi.spyOn(ticker, 'start');
        ticker.refresh();
        expect(startSpy).toHaveBeenCalled();
        startSpy.mockRestore();
    });
});