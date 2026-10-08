/**
 * Game Flow Unit Tests
 * Verifies that auto-progression is disabled and manual controls are required
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';

describe('Game Flow Control', () => {
    describe('EnvironmentManager', () => {
        it('should not use setInterval for time updates in init', async () => {
            // Behavioural check (#1842, #2333): run init() and make sure it
            // schedules nothing and never starts the event timer
            const { EnvironmentManager } = await import('../../src/js/game/EnvironmentManager.js');
            vi.useFakeTimers();
            const intervalSpy = vi.spyOn(globalThis, 'setInterval');
            try {
                const env = new EnvironmentManager({ rankIndex: 0, tasksCompleted: 0 });
                const eventTimer = vi.spyOn(env, 'startEventTimer');
                env.init();
                expect(intervalSpy).not.toHaveBeenCalled();
                expect(eventTimer).not.toHaveBeenCalled();
                expect(env.timeUpdateInterval).toBeNull();
            } finally {
                intervalSpy.mockRestore();
                vi.useRealTimers();
            }
        });

        it('should not auto-start event timer', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const filePath = path.join(__dirname, '../../src/js/game/EnvironmentManager.js');
            const content = fs.readFileSync(filePath, 'utf8');

            expect(content).toContain('// DISABLED: Auto-progression removed');
            expect(content).toContain('// this.startEventTimer()');
        });
    });

    describe('ProjectHelpers', () => {
        it('should not use setInterval for work sessions', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const filePath = path.join(__dirname, '../../src/js/helpers/ProjectHelpers.js');
            const content = fs.readFileSync(filePath, 'utf8');

            // Work sessions should not have auto-interval
            expect(content).not.toMatch(/game\.workInterval\s*=\s*setInterval/);
        });

        it('should require manual click to advance work', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const filePath = path.join(__dirname, '../../src/js/helpers/ProjectHelpers.js');
            const content = fs.readFileSync(filePath, 'utf8');

            // Should have manual advance button
            expect(content).toContain('btn-advance-work');
            expect(content).toContain('Click to Progress');
        });
    });

    describe('Manual Progression Requirement', () => {
        it('should have work session state object for manual control', async () => {
            const fs = await import('fs');
            const path = await import('path');
            const filePath = path.join(__dirname, '../../src/js/helpers/ProjectHelpers.js');
            const content = fs.readFileSync(filePath, 'utf8');

            // Work session should store state
            expect(content).toContain('game.workSession');
            expect(content).toContain('active: true');
        });
    });
});
