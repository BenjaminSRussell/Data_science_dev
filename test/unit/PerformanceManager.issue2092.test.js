/**
 * Unit tests for PerformanceManager
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PerformanceManager } from '../../src/js/performance/PerformanceManager.js';

describe('PerformanceManager', () => {
    let performanceManager;

    beforeEach(() => {
        performanceManager = new PerformanceManager();
        // Mock DOM
        document.body.innerHTML = '<div id="root"></div>';
    });

    describe('constructor', () => {
        it('should initialize with correct default values', () => {
            expect(performanceManager.quality).toBe('auto');
            expect(performanceManager.fps).toBe(60);
            expect(performanceManager.targetFPS).toBe(60);
            expect(performanceManager.monitoring).toBe(false);
        });

        it('should have quality presets defined', () => {
            expect(performanceManager.presets).toBeDefined();
            expect(performanceManager.presets.low).toBeDefined();
            expect(performanceManager.presets.medium).toBeDefined();
            expect(performanceManager.presets.high).toBeDefined();
            expect(performanceManager.presets.ultra).toBeDefined();
        });
    });

    describe('setQuality', () => {
        it('should set quality level', () => {
            performanceManager.setQuality('low');
            expect(performanceManager.quality).toBe('low');
        });

        it('should dispatch qualityChanged event with preset data', () => {
            return new Promise((resolve) => {
                const eventListener = (event) => {
                    expect(event.detail.quality).toBe('medium');
                    expect(event.detail.preset).toBeDefined();
                    expect(event.detail.preset.frameRateLimit).toBe(60);
                    window.removeEventListener('qualityChanged', eventListener);
                    resolve();
                };

                window.addEventListener('qualityChanged', eventListener);
                performanceManager.setQuality('medium');
            });
        });

        it('should not dispatch event for invalid quality level', () => {
            return new Promise((resolve) => {
                const eventListener = vi.fn();
                window.addEventListener('qualityChanged', eventListener);

                performanceManager.setQuality('invalid');

                setTimeout(() => {
                    expect(eventListener).not.toHaveBeenCalled();
                    window.removeEventListener('qualityChanged', eventListener);
                    resolve();
                }, 10);
            });
        });
    });

    describe('applyPreset', () => {
        it('should not set unused CSS variables', () => {
            const preset = performanceManager.presets.medium;
            performanceManager.applyPreset(preset);

            const root = document.documentElement;
            // These CSS variables should NOT be set as they are never read
            const animationsVar = getComputedStyle(root).getPropertyValue('--quality-animations');
            const particlesVar = getComputedStyle(root).getPropertyValue('--quality-particles');
            const shadowsVar = getComputedStyle(root).getPropertyValue('--quality-shadows');
            const resolutionVar = getComputedStyle(root).getPropertyValue('--quality-resolution');

            // After fix, these should be empty/not set
            expect(animationsVar.trim()).toBe('');
            expect(particlesVar.trim()).toBe('');
            expect(shadowsVar.trim()).toBe('');
            expect(resolutionVar.trim()).toBe('');
        });

        it('should update targetFPS from preset frameRateLimit', () => {
            const preset = performanceManager.presets.low;
            performanceManager.applyPreset(preset);
            expect(performanceManager.targetFPS).toBe(30);

            performanceManager.applyPreset(performanceManager.presets.ultra);
            expect(performanceManager.targetFPS).toBe(120);
        });
    });

    describe('quality presets should be observable via qualityChanged event', () => {
        it('should provide preset data in qualityChanged event for low preset', () => {
            return new Promise((resolve) => {
                const eventListener = (event) => {
                    expect(event.detail.preset.frameRateLimit).toBe(30);
                    expect(event.detail.preset.animations).toBe(false);
                    expect(event.detail.preset.particles).toBe(false);
                    expect(event.detail.preset.shadows).toBe(false);
                    window.removeEventListener('qualityChanged', eventListener);
                    resolve();
                };

                window.addEventListener('qualityChanged', eventListener);
                performanceManager.setQuality('low');
            });
        });

        it('should provide preset data in qualityChanged event for ultra preset', () => {
            return new Promise((resolve) => {
                const eventListener = (event) => {
                    expect(event.detail.preset.frameRateLimit).toBe(120);
                    expect(event.detail.preset.animations).toBe(true);
                    expect(event.detail.preset.particles).toBe('high');
                    expect(event.detail.preset.shadows).toBe('advanced');
                    window.removeEventListener('qualityChanged', eventListener);
                    resolve();
                };

                window.addEventListener('qualityChanged', eventListener);
                performanceManager.setQuality('ultra');
            });
        });
    });

    describe('getStats', () => {
        it('should return performance stats', () => {
            const stats = performanceManager.getStats();
            expect(stats).toHaveProperty('quality');
            expect(stats).toHaveProperty('fps');
            expect(stats).toHaveProperty('averageFPS');
            expect(stats).toHaveProperty('frameTime');
            expect(stats).toHaveProperty('hardwareTier');
            expect(stats).toHaveProperty('monitoring');
        });
    });

    describe('stopMonitoring', () => {
        it('should stop monitoring', () => {
            performanceManager.monitoring = true;
            performanceManager.stopMonitoring();
            expect(performanceManager.monitoring).toBe(false);
        });
    });
});
