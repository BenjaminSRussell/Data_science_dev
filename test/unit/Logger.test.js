```javascript
import { Logger } from '../../src/js/utils/Logger.js';

describe('Logger', () => {
    let logger;

    beforeEach(() => {
        logger = new Logger();
    });

    it('should default to DEBUG level when NODE_ENV is not production', () => {
        const consoleSpy = jest.spyOn(console, 'debug');
        logger.debug('Test debug');
        expect(consoleSpy).toHaveBeenCalledWith('[DEBUG]', 'Test debug');
        consoleSpy.mockRestore();
    });

    it('should filter out lower level logs when set to WARN', () => {
        const debugSpy = jest.spyOn(console, 'debug');
        const infoSpy = jest.spyOn(console, 'info');
        const warnSpy = jest.spyOn(console, 'warn');
        const errorSpy = jest.spyOn(console, 'error');
        logger.setLevel('WARN');
        logger.debug('Test debug');
        logger.info('Test info');
        logger.warn('Test warn');
        logger.error('Test error');
        expect(debugSpy).not.toHaveBeenCalled();
        expect(infoSpy).not.toHaveBeenCalled();
        expect(warnSpy).toHaveBeenCalledWith('[WARN]', 'Test warn');
        expect(errorSpy).toHaveBeenCalledWith('[ERROR]', 'Test error');
        debugSpy.mockRestore();
        infoSpy.mockRestore();
        warnSpy.mockRestore();
        errorSpy.mockRestore();
    });

    it('should fall back to INFO level for unrecognized level strings', () => {
        const debugSpy = jest.spyOn(console, 'debug');
        const infoSpy = jest.spyOn(console, 'info');
        logger.setLevel('UNRECOGNIZED');
        logger.debug('Test debug');
        logger.info('Test info');
        expect(debugSpy).not.toHaveBeenCalled();
        expect(infoSpy).toHaveBeenCalledWith('[INFO]', 'Test info');
        debugSpy.mockRestore();
        infoSpy.mockRestore();
    });

    it('should set level directly for numeric values', () => {
        const debugSpy = jest.spyOn(console, 'debug');
        const infoSpy = jest.spyOn(console, 'info');
        logger.setLevel(1);
        logger.debug('Test debug');
        logger.info('Test info');
        expect(debugSpy).toHaveBeenCalledWith('[DEBUG]', 'Test debug');
        expect(infoSpy).toHaveBeenCalledWith('[INFO]', 'Test info');
        debugSpy.mockRestore();
        infoSpy.mockRestore();
    });

    it('should suppress all logs when disabled', () => {
        const debugSpy = jest.spyOn(console, 'debug');
        const infoSpy = jest.spyOn(console, 'info');
        const warnSpy = jest.spyOn(console, 'warn');
        const errorSpy = jest.spyOn(console, 'error');
        logger.setEnabled(false);
        logger.debug('Test debug');
        logger.info('Test info');
        logger.warn('Test warn');
        logger.error('Test error');
        expect(debugSpy).not.toHaveBeenCalled();
        expect(infoSpy).not.toHaveBeenCalled();
        expect(warnSpy).not.toHaveBeenCalled();
        expect(errorSpy).not.toHaveBeenCalled();
        debugSpy.mockRestore();
        infoSpy.mockRestore();
        warnSpy.mockRestore();
        errorSpy.mockRestore();
    });
});