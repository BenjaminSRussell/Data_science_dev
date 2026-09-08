import { describe, it, expect, beforeAll, beforeEach } from 'vitest';
import { PerformanceManager } from '../../src/js/performance/PerformanceManager';

describe('PerformanceManager', () => {
    let manager;

    beforeAll(() => {
        // Mock WebGL context and navigator properties
        globalThis.WebGLRenderingContext = {
            getExtension: () => ({
                UNMASKED_RENDERER_WEBGL: 'NVIDIA GeForce GTX'
            })
        };
        globalThis.navigator = {
            hardwareConcurrency: 8,
            deviceMemory: 8
        };
    });

    beforeEach(() => {
        manager = new PerformanceManager();
    });

    describe('detectHardware', () => {
        it('should detect high tier with NVIDIA renderer', () => {
            manager.detectHardware();
            expect(manager.hardwareTier).toBe('high');
        });

        it('should detect medium tier with Intel Iris renderer', () => {
            globalThis.WebGLRenderingContext.getExtension().UNMASKED_RENDERER_WEBGL = 'Intel Iris';
            manager.detectHardware();
            expect(manager.hardwareTier).toBe('medium');
        });

        it('should detect low tier with plain Intel renderer', () => {
            globalThis.WebGLRenderingContext.getExtension().UNMASKED_RENDERER_WEBGL = 'Intel';
            manager.detectHardware();
            expect(manager.hardwareTier).toBe('low');
        });

        it('should detect low tier with no WebGL support', () => {
            globalThis.WebGLRenderingContext = null;
            manager.detectHardware();
            expect(manager.hardwareTier).toBe('low');
        });

        it('should override tier based on hardwareConcurrency and deviceMemory', () => {
            globalThis.navigator.hardwareConcurrency = 4;
            globalThis.navigator.deviceMemory = 4;
            manager.detectHardware();
            expect(manager.hardwareTier).toBe('high'); // High due to hardwareConcurrency

            globalThis.navigator.hardwareConcurrency = 4;
            globalThis.navigator.deviceMemory = 2;
            manager.detectHardware();
            expect(manager.hardwareTier).toBe('medium'); // Medium due to deviceMemory
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
        });

        it('should not change quality after one optimization', () => {
            manager.fps = 20;
            manager.autoOptimize();
            expect(manager.quality).toBe('low');

            manager.fps = 60;
            manager.autoOptimize();
            expect(manager.quality).toBe('low'); // Quality is locked to 'low'
        });
    });

    describe('monitor', () => {
        it('should cap fpsHistory at 60 entries', () => {
            for (let i = 0; i < 70; i++) {
                manager.fpsHistory.push(i);
            }
            expect(manager.fpsHistory.length).toBe(60);
        });

        it('should calculate average FPS correctly', () => {
            manager.fpsHistory = [30, 30, 30, 30];
            expect(manager.getAverageFPS()).toBe(30);

            manager.fpsHistory = [20, 40];
            expect(manager.getAverageFPS()).toBe(30);
        });
    });

    describe('setQuality', () => {
        it('should reject unknown quality level', () => {
            const dispatch = jest.fn();
            manager = new PerformanceManager(dispatch);
            manager.setQuality('unknown');
            expect(dispatch).not.toHaveBeenCalled();
        });
    });

    describe('showPerformanceWarning', () => {
        it('should return critical warning for very low FPS', () => {
            manager.fps = 15;
            expect(manager.showPerformanceWarning()).toEqual({
                level: 'critical',
                message: 'Performance is very low. Consider reducing quality settings.'
            });
        });

        it('should return warning for low FPS', () => {
            manager.fps = 25;
            expect(manager.showPerformanceWarning()).toEqual({
                level: 'warning',
                message: 'Performance is low. You may want to reduce quality settings.'
            });
        });

        it('should return no warning for sufficient FPS', () => {
            manager.fps = 35;
            expect(manager.showPerformanceWarning()).toBeNull();
        });
    });
});