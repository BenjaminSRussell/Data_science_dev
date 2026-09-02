/**
 * Unit tests for ParticleSystem
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { ParticleSystem } from '../../src/js/systems/ParticleSystem.js';

describe('ParticleSystem', () => {
    let particleSystem;
    let mockCanvas;
    let mockContext;

    beforeEach(() => {
        // Mock the canvas and context
        mockCanvas = {
            width: 800,
            height: 600,
            getContext: vi.fn(() => mockContext)
        };
        mockContext = {
            fillStyle: '',
            beginPath: vi.fn(),
            arc: vi.fn(),
            fill: vi.fn()
        };
        vi.spyOn(document, 'getElementById').mockReturnValue(mockCanvas);
        vi.spyOn(global, 'requestAnimationFrame').mockImplementation((callback) => callback());
    });

    describe('init', () => {
        it('should bail cleanly if #menu-particles-canvas is not in DOM', () => {
            document.getElementById.mockReturnValue(null);
            particleSystem = new ParticleSystem();
            particleSystem.init();
            expect(particleSystem.particles.length).toBe(0);
            expect(particleSystem.animate).not.toBeCalled();
        });

        it('should create exactly 50 particles within canvas bounds with correct radius and opacity', () => {
            particleSystem = new ParticleSystem();
            particleSystem.init();
            expect(particleSystem.particles.length).toBe(50);
            particleSystem.particles.forEach(particle => {
                expect(particle.x).toBeGreaterThanOrEqual(0);
                expect(particle.x).toBeLessThanOrEqual(mockCanvas.width);
                expect(particle.y).toBeGreaterThanOrEqual(0);
                expect(particle.y).toBeLessThanOrEqual(mockCanvas.height);
                expect(particle.radius).toBeGreaterThanOrEqual(0.5);
                expect(particle.radius).toBeLessThan(2.5);
                expect(particle.opacity).toBeGreaterThanOrEqual(0.2);
                expect(particle.opacity).toBeLessThan(0.7);
            });
        });
    });

    describe('wraparound', () => {
        it('should wraparound particle x=-1 to canvas.width', () => {
            particleSystem = new ParticleSystem();
            particleSystem.init();
            particleSystem.particles[0].x = -1;
            particleSystem.animate();
            expect(particleSystem.particles[0].x).toBe(mockCanvas.width);
        });

        it('should wraparound particle x>canvas.width to 0', () => {
            particleSystem = new ParticleSystem();
            particleSystem.init();
            particleSystem.particles[0].x = mockCanvas.width + 1;
            particleSystem.animate();
            expect(particleSystem.particles[0].x).toBe(0);
        });

        it('should wraparound particle y<0 to canvas.height', () => {
            particleSystem = new ParticleSystem();
            particleSystem.init();
            particleSystem.particles[0].y = -1;
            particleSystem.animate();
            expect(particleSystem.particles[0].y).toBe(mockCanvas.height);
        });

        it('should wraparound particle y>canvas.height to 0', () => {
            particleSystem = new ParticleSystem();
            particleSystem.init();
            particleSystem.particles[0].y = mockCanvas.height + 1;
            particleSystem.animate();
            expect(particleSystem.particles[0].y).toBe(0);
        });
    });

    describe('color parsing', () => {
        it('should correctly parse color with particle opacity', () => {
            particleSystem = new ParticleSystem();
            particleSystem.init();
            particleSystem.particles[0].color = 'rgba(10,20,30,0.5)';
            particleSystem.animate();
            expect(mockContext.fillStyle).toBe(`rgba(10,20,30,${particleSystem.particles[0].opacity})`);
        });

        it('should fallback to default purple color for unparseable color', () => {
            particleSystem = new ParticleSystem();
            particleSystem.init();
            particleSystem.particles[0].color = 'invalid-color';
            particleSystem.animate();
            expect(mockContext.fillStyle).toBe('rgba(128,0,128,1)');
        });
    });

    describe('destroy', () => {
        it('should cancel animation frame and null animationId', () => {
            particleSystem = new ParticleSystem();
            particleSystem.init();
            const animationId = 123;
            particleSystem.animationId = animationId;
            vi.spyOn(global, 'cancelAnimationFrame').mockImplementation(vi.fn());
            particleSystem.destroy();
            expect(global.cancelAnimationFrame).toHaveBeenCalledWith(animationId);
            expect(particleSystem.animationId).toBeNull();
            particleSystem.destroy(); // Second call is a no-op
        });
    });
});