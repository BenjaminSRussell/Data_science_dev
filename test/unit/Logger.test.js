import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { Logger, LOG_LEVELS, logger } from '../../src/js/utils/Logger.js';

describe('Logger (#480)', () => {
    let spies;
    beforeEach(() => {
        spies = {};
        for (const m of ['debug', 'info', 'warn', 'error', 'group', 'groupEnd', 'time', 'timeEnd']) {
            spies[m] = vi.spyOn(console, m).mockImplementation(() => {});
        }
    });
    afterEach(() => vi.restoreAllMocks());

    it('defaults to DEBUG outside production', () => {
        const l = new Logger();
        expect(l.level).toBe(LOG_LEVELS.DEBUG);
        l.debug('x');
        expect(spies.debug).toHaveBeenCalledWith('[DEBUG]', 'x');
    });

    it('exports a singleton instance', () => {
        expect(logger).toBeInstanceOf(Logger);
    });

    it('WARN level suppresses debug/info only', () => {
        const l = new Logger();
        l.setLevel('WARN');
        l.debug('d'); l.info('i'); l.warn('w'); l.error('e');
        expect(spies.debug).not.toHaveBeenCalled();
        expect(spies.info).not.toHaveBeenCalled();
        expect(spies.warn).toHaveBeenCalledWith('[WARN]', 'w');
        expect(spies.error).toHaveBeenCalledWith('[ERROR]', 'e');
    });

    it('setLevel accepts lowercase names and maps DEBUG to 0 (not the INFO fallback)', () => {
        const l = new Logger();
        l.setLevel('error');
        expect(l.level).toBe(LOG_LEVELS.ERROR);
        l.setLevel('DEBUG');
        expect(l.level).toBe(LOG_LEVELS.DEBUG);
        l.setLevel('none');
        expect(l.level).toBe(LOG_LEVELS.NONE);
    });

    it('unknown level names fall back to INFO', () => {
        const l = new Logger();
        l.setLevel('chatty');
        expect(l.level).toBe(LOG_LEVELS.INFO);
        l.setLevel('toString');
        expect(l.level).toBe(LOG_LEVELS.INFO);
    });

    it('numeric levels are set directly', () => {
        const l = new Logger();
        l.setLevel(3);
        expect(l.level).toBe(3);
    });

    it('prefixes each level with a bracketed tag', () => {
        const l = new Logger();
        l.info('a', 1);
        l.warn('b');
        l.error('c');
        expect(spies.info).toHaveBeenCalledWith('[INFO]', 'a', 1);
        expect(spies.warn.mock.calls[0][0]).toBe('[WARN]');
        expect(spies.error.mock.calls[0][0]).toBe('[ERROR]');
    });

    it('setEnabled(false) silences everything, including group and time', () => {
        const l = new Logger();
        l.setEnabled(false);
        l.debug(); l.info(); l.warn(); l.error();
        l.group('g'); l.groupEnd(); l.time('t'); l.timeEnd('t');
        for (const s of Object.values(spies)) expect(s).not.toHaveBeenCalled();
        l.setEnabled(true);
        l.group('g');
        expect(spies.group).toHaveBeenCalledWith('g');
    });
});
