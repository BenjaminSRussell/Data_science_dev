import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { PerformanceManager } from '../../src/js/performance/PerformanceManager.js';

// Value of UNMASKED_RENDERER_WEBGL in the WEBGL_debug_renderer_info extension
const UNMASKED_RENDERER_WEBGL = 0x9246;

function makeGl(renderer) {
    return {
        getExtension: (name) => (
            name === 'WEBGL_debug_renderer_info' ? { UNMASKED_RENDERER_WEBGL } : null
        ),
        getParameter: (parameter) => (
            parameter === UNMASKED_RENDERER_WEBGL ? renderer : null
        )
    };
}

/**
 * detectHardware() reads the renderer from canvas.getContext('webgl'), which
 * jsdom does not implement. `renderer` null means "no WebGL at all".
 */
function stubWebGL(renderer) {
    return vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
        (type) => (renderer !== null && type === 'webgl' ? makeGl(renderer) : null)
    );
}

function stubNavigator({ cores, memory } = {}) {
    vi.stubGlobal('navigator', { hardwareConcurrency: cores, deviceMemory: memory });
}

describe('PerformanceManager', () => {
    let manager;

    beforeEach(() => {
        document.documentElement.removeAttribute('style');
        manager = new PerformanceManager();
    });

    afterEach(() => {
        vi.unstubAllGlobals();
        vi.restoreAllMocks();
    });

    describe('detectHardware', () => {
        describe('GPU renderer alone (4 cores, memory not reported)', () => {
            it.each([
                ['NVIDIA GeForce GTX 1080', 'high'],
                ['AMD Radeon Pro 5500M', 'high'],
                ['Intel Iris Xe Graphics', 'high'],
                ['Intel(R) UHD Graphics 620', 'medium'],
                ['Apple M1', 'low']
            ])('should rate renderer "%s" as %s', (renderer, expectedTier) => {
                stubWebGL(renderer);
                stubNavigator({ cores: 4 });

                expect(manager.detectHardware()).toBe(expectedTier);
                expect(manager.hardwareTier).toBe(expectedTier);
            });

            it('should detect low tier with no WebGL support', () => {
                const getContext = stubWebGL(null);
                stubNavigator({ cores: 4 });

                expect(manager.detectHardware()).toBe('low');
                expect(manager.hardwareTier).toBe('low');
                expect(getContext).toHaveBeenCalledWith('webgl');
                expect(getContext).toHaveBeenCalledWith('experimental-webgl');
            });

            it('should fall back to the experimental-webgl context', () => {
                vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockImplementation(
                    (type) => (type === 'experimental-webgl' ? makeGl('NVIDIA GeForce GTX 1080') : null)
                );
                stubNavigator({ cores: 4 });

                expect(manager.detectHardware()).toBe('high');
            });

            it('should stay low when the debug renderer extension is unavailable', () => {
                vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue({
                    getExtension: () => null,
                    getParameter: () => 'NVIDIA GeForce GTX 1080'
                });
                stubNavigator({ cores: 4 });

                expect(manager.detectHardware()).toBe('low');
            });
        });

        describe('CPU cores', () => {
            it('should raise low to medium with 8 cores', () => {
                stubWebGL(null);
                stubNavigator({ cores: 8 });

                expect(manager.detectHardware()).toBe('medium');
            });

            it('should raise medium to high with 8 cores', () => {
                stubWebGL('Intel(R) UHD Graphics 620');
                stubNavigator({ cores: 8 });

                expect(manager.detectHardware()).toBe('high');
            });

            it('should not raise the tier with 7 cores', () => {
                stubWebGL('Intel(R) UHD Graphics 620');
                stubNavigator({ cores: 7 });

                expect(manager.detectHardware()).toBe('medium');
            });

            it('should treat a missing hardwareConcurrency as too few cores', () => {
                stubWebGL(null);
                stubNavigator({});

                expect(manager.detectHardware()).toBe('low');
            });
        });

        describe('device memory', () => {
            it('should force high with 8 GB regardless of GPU and cores', () => {
                stubWebGL(null);
                stubNavigator({ cores: 4, memory: 8 });

                expect(manager.detectHardware()).toBe('high');
            });

            it('should raise low to medium with 4 GB', () => {
                stubWebGL(null);
                stubNavigator({ cores: 4, memory: 4 });

                expect(manager.detectHardware()).toBe('medium');
            });

            it('should leave medium and high untouched with 4 GB', () => {
                stubNavigator({ cores: 4, memory: 4 });

                stubWebGL('Intel(R) UHD Graphics 620');
                expect(manager.detectHardware()).toBe('medium');

                stubWebGL('NVIDIA GeForce GTX 1080');
                expect(manager.detectHardware()).toBe('high');
            });

            it('should not raise the tier with 2 GB', () => {
                stubWebGL(null);
                stubNavigator({ cores: 4, memory: 2 });

                expect(manager.detectHardware()).toBe('low');
            });
        });

        describe('combined inputs', () => {
            it('should reach medium from 8 cores and keep it with 4 GB', () => {
                stubWebGL(null);
                stubNavigator({ cores: 8, memory: 4 });

                expect(manager.detectHardware()).toBe('medium');
            });

            it('should reach high from a plain Intel GPU with 8 cores and 4 GB', () => {
                stubWebGL('Intel(R) UHD Graphics 620');
                stubNavigator({ cores: 8, memory: 4 });

                expect(manager.detectHardware()).toBe('high');
            });

            it('should reach high from 8 GB even with a weak GPU and few cores', () => {
                stubWebGL('Apple M1');
                stubNavigator({ cores: 2, memory: 8 });

                expect(manager.detectHardware()).toBe('high');
            });
        });

        describe('resulting quality', () => {
            it.each([
                [{ cores: 4, memory: 8 }, 'high', 60],
                [{ cores: 4, memory: 4 }, 'medium', 60],
                [{ cores: 4, memory: 2 }, 'low', 30]
            ])('should set quality from the tier when quality is auto (%o -> %s)', (hardware, expectedQuality, expectedTargetFPS) => {
                stubWebGL(null);
                stubNavigator(hardware);

                manager.detectHardware();

                expect(manager.quality).toBe(expectedQuality);
                expect(manager.targetFPS).toBe(expectedTargetFPS);
            });

            it('should leave a manually chosen quality alone', () => {
                stubWebGL(null);
                stubNavigator({ cores: 4, memory: 2 });
                manager.setQuality('ultra');

                manager.detectHardware();

                expect(manager.hardwareTier).toBe('low');
                expect(manager.quality).toBe('ultra');
                expect(manager.targetFPS).toBe(120);
            });
        });
    });

    describe('autoOptimize', () => {
        it('should not change quality from auto to low if FPS is high', () => {
            manager.fps = 60;
            manager.autoOptimize();
            expect(manager.quality).toBe('auto');
        });

        it('should change quality to low if FPS is low', () => {
            manager.fps = 20;
            manager.autoOptimize();
            expect(manager.quality).toBe('low');
            expect(manager.targetFPS).toBe(30);
        });

        it('should decide on the average FPS, not the latest reading', () => {
            manager.fpsHistory = [60, 60, 60];
            manager.fps = 10;
            manager.autoOptimize();
            expect(manager.quality).toBe('auto');
        });

        it('should step high down to medium below 45 FPS', () => {
            manager.setQuality('high');
            manager.fps = 44;
            manager.autoOptimize();
            expect(manager.quality).toBe('medium');
        });

        it('should keep high at 45 FPS', () => {
            manager.setQuality('high');
            manager.fps = 45;
            manager.autoOptimize();
            expect(manager.quality).toBe('high');
        });

        it('should drop high straight to low below 30 FPS', () => {
            manager.setQuality('high');
            manager.fps = 29;
            manager.autoOptimize();
            expect(manager.quality).toBe('low');
        });

        it('should keep medium between 30 and 45 FPS', () => {
            manager.setQuality('medium');
            manager.fps = 40;
            manager.autoOptimize();
            expect(manager.quality).toBe('medium');
        });

        it('should raise low back to medium once FPS recovers', () => {
            manager.fps = 20;
            manager.autoOptimize();
            expect(manager.quality).toBe('low');

            manager.fps = 60;
            manager.autoOptimize();
            expect(manager.quality).toBe('medium');
        });

        it('should keep low below 55 FPS', () => {
            manager.setQuality('low');
            manager.fps = 54;
            manager.autoOptimize();
            expect(manager.quality).toBe('low');
        });
    });

    describe('monitor', () => {
        let now;
        let requestFrame;

        beforeEach(() => {
            now = 5000;
            vi.spyOn(performance, 'now').mockImplementation(() => now);
            // Frames are driven by hand: the scheduled callback is recorded, not run
            requestFrame = vi.fn();
            vi.stubGlobal('requestAnimationFrame', requestFrame);
        });

        /**
         * Render `frames` frames, the last of which lands `elapsedMs` after the
         * start of the current measuring window.
         */
        function runWindow(frames, elapsedMs = 1000) {
            while (manager.frameCount < frames - 1) {
                manager.monitor();
            }
            now += elapsedMs;
            manager.monitor();
        }

        it('should do nothing while monitoring is off', () => {
            manager.monitor();

            expect(manager.frameCount).toBe(0);
            expect(requestFrame).not.toHaveBeenCalled();
        });

        it('should count frames without measuring until a second has passed', () => {
            manager.startMonitoring();
            now += 999;
            manager.monitor();

            expect(manager.monitoring).toBe(true);
            expect(manager.frameCount).toBe(2);
            expect(manager.fpsHistory).toEqual([]);
        });

        it('should schedule the next frame with requestAnimationFrame', () => {
            manager.startMonitoring();
            expect(requestFrame).toHaveBeenCalledTimes(1);
            expect(manager.frameCount).toBe(1);

            const nextFrame = requestFrame.mock.calls[0][0];
            nextFrame();

            expect(manager.frameCount).toBe(2);
            expect(requestFrame).toHaveBeenCalledTimes(2);
        });

        it('should compute FPS from the frames counted over the elapsed time', () => {
            manager.startMonitoring();

            runWindow(60);
            expect(manager.fps).toBe(60);
            expect(manager.frameTime).toBeCloseTo(1000 / 60, 5);
            expect(manager.fpsHistory).toEqual([60]);
            expect(manager.frameCount).toBe(0);
            expect(manager.lastFrameTime).toBe(6000);

            // 81 frames in 1500ms = 54 FPS
            runWindow(81, 1500);
            expect(manager.fps).toBe(54);
            expect(manager.fpsHistory).toEqual([60, 54]);
        });

        it('should cap fpsHistory at 60 entries', () => {
            manager.startMonitoring();

            for (let i = 0; i < 70; i++) {
                runWindow(60 + i);
            }

            expect(manager.fpsHistory.length).toBe(60);
            // The ten oldest readings (60..69 FPS) were dropped
            expect(manager.fpsHistory[0]).toBe(70);
            expect(manager.fpsHistory[59]).toBe(129);
        });

        it('should lower quality when auto and FPS falls more than 10 below target', () => {
            manager.startMonitoring();

            runWindow(20);

            expect(manager.fps).toBe(20);
            expect(manager.quality).toBe('low');
            expect(manager.targetFPS).toBe(30);
        });

        it('should call autoOptimize at 49 FPS but not at 50 FPS', () => {
            const autoOptimize = vi.spyOn(manager, 'autoOptimize');
            manager.startMonitoring();

            runWindow(50);
            expect(autoOptimize).not.toHaveBeenCalled();

            runWindow(49);
            expect(autoOptimize).toHaveBeenCalledTimes(1);
            // Average of 50 and 49 rounds to 50: no threshold is crossed
            expect(manager.quality).toBe('auto');
        });

        it('should not auto-optimize a manually chosen quality', () => {
            const autoOptimize = vi.spyOn(manager, 'autoOptimize');
            manager.setQuality('high');
            manager.startMonitoring();

            runWindow(20);

            expect(manager.fps).toBe(20);
            expect(autoOptimize).not.toHaveBeenCalled();
            expect(manager.quality).toBe('high');
        });

        it('should keep the history when startMonitoring is called while running', () => {
            manager.startMonitoring();
            runWindow(60);

            manager.startMonitoring();

            expect(manager.fpsHistory).toEqual([60]);
        });

        it('should stop counting frames after stopMonitoring', () => {
            manager.startMonitoring();
            manager.stopMonitoring();
            requestFrame.mockClear();

            manager.monitor();

            expect(manager.monitoring).toBe(false);
            expect(manager.frameCount).toBe(1);
            expect(requestFrame).not.toHaveBeenCalled();
        });
    });

    describe('getAverageFPS', () => {
        it('should return the current FPS when there is no history', () => {
            manager.fps = 42;
            expect(manager.getAverageFPS()).toBe(42);
        });

        it('should calculate average FPS correctly', () => {
            manager.fpsHistory = [30, 30, 30, 30];
            expect(manager.getAverageFPS()).toBe(30);

            manager.fpsHistory = [20, 40];
            expect(manager.getAverageFPS()).toBe(30);
        });

        it('should round the average to a whole number', () => {
            manager.fpsHistory = [30, 31];
            expect(manager.getAverageFPS()).toBe(31);

            manager.fpsHistory = [59, 60, 60];
            expect(manager.getAverageFPS()).toBe(60);
        });
    });

    describe('setQuality', () => {
        let onQualityChanged;

        beforeEach(() => {
            onQualityChanged = vi.fn();
            window.addEventListener('qualityChanged', onQualityChanged);
        });

        afterEach(() => {
            window.removeEventListener('qualityChanged', onQualityChanged);
        });

        it('should reject unknown quality level', () => {
            const warn = vi.spyOn(console, 'warn').mockImplementation(() => {});

            manager.setQuality('unknown');

            expect(warn).toHaveBeenCalledWith('Unknown quality level: unknown');
            expect(manager.quality).toBe('auto');
            expect(manager.targetFPS).toBe(60);
            expect(onQualityChanged).not.toHaveBeenCalled();
        });

        it('should apply the preset and dispatch qualityChanged', () => {
            manager.setQuality('low');

            expect(manager.quality).toBe('low');
            expect(manager.targetFPS).toBe(30);

            const style = document.documentElement.style;
            expect(style.getPropertyValue('--quality-animations')).toBe('0');
            expect(style.getPropertyValue('--quality-particles')).toBe('none');
            expect(style.getPropertyValue('--quality-shadows')).toBe('none');
            expect(String(style.getPropertyValue('--quality-resolution'))).toBe('0.75');

            expect(onQualityChanged).toHaveBeenCalledTimes(1);
            expect(onQualityChanged.mock.calls[0][0].detail).toEqual({
                quality: 'low',
                preset: manager.presets.low
            });
        });

        it('should write the preset values of a richer preset', () => {
            manager.setQuality('ultra');

            const style = document.documentElement.style;
            expect(manager.targetFPS).toBe(120);
            expect(style.getPropertyValue('--quality-animations')).toBe('1');
            expect(style.getPropertyValue('--quality-particles')).toBe('high');
            expect(style.getPropertyValue('--quality-shadows')).toBe('advanced');
            expect(String(style.getPropertyValue('--quality-resolution'))).toBe('1.5');
        });

        it('should accept auto without applying a preset', () => {
            manager.setQuality('low');
            onQualityChanged.mockClear();

            manager.setQuality('auto');

            expect(manager.quality).toBe('auto');
            // The low preset's frame rate limit is still in force
            expect(manager.targetFPS).toBe(30);
            expect(onQualityChanged).toHaveBeenCalledTimes(1);
            expect(onQualityChanged.mock.calls[0][0].detail.quality).toBe('auto');
            expect(onQualityChanged.mock.calls[0][0].detail.preset).toBeUndefined();
        });
    });

    describe('showPerformanceWarning', () => {
        it('should return critical warning for very low FPS', () => {
            const critical = {
                level: 'critical',
                message: 'Performance is very low. Consider reducing quality settings.'
            };

            manager.fps = 15;
            expect(manager.showPerformanceWarning()).toEqual(critical);

            manager.fps = 19;
            expect(manager.showPerformanceWarning()).toEqual(critical);
        });

        it('should return warning for low FPS', () => {
            const warning = {
                level: 'warning',
                message: 'Performance is low. You may want to reduce quality settings.'
            };

            manager.fps = 20;
            expect(manager.showPerformanceWarning()).toEqual(warning);

            manager.fps = 29;
            expect(manager.showPerformanceWarning()).toEqual(warning);
        });

        it('should return no warning for sufficient FPS', () => {
            manager.fps = 30;
            expect(manager.showPerformanceWarning()).toBeNull();

            manager.fps = 35;
            expect(manager.showPerformanceWarning()).toBeNull();
        });
    });
});
