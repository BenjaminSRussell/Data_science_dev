import { RealWorldTaskSystem } from '../../src/js/game/work/RealWorldTaskSystem.js';

describe('RealWorldTaskSystem step progression', () => {
    let system;
    let gameState;

    beforeEach(() => {
        gameState = {
            money: 0,
            reputation: 0,
            stats: {}
        };
        system = new RealWorldTaskSystem(gameState);
    });

    function makeTask(steps) {
        return {
            id: 'test_task',
            name: 'Test Task',
            steps: steps.map((s, i) => ({
                id: `step_${i}`,
                name: `Step ${i}`,
                visual: s,
                duration: 1,
                completed: false
            })),
            currentStep: 0,
            skills: ['python'],
            reward: { money: 100, reputation: 5, experience: 10 }
        };
    }

    describe('completeStep', () => {
        it('returns null when there is no current task', () => {
            expect(system.completeStep()).toBeNull();
        });

        it('marks the current step completed and increments currentStep when in progress', () => {
            const task = makeTask(['a', 'b', 'c']);
            system.startTask(task);

            const result = system.completeStep();

            expect(result).toBe(task);
            expect(task.steps[0].completed).toBe(true);
            expect(task.currentStep).toBe(1);
            expect(system.getCurrentTask()).toBe(task);
        });

        it('marks the last step completed and completes the task', () => {
            const task = makeTask(['a', 'b']);
            system.startTask(task);
            system.completeStep(); // complete step 0

            const result = system.completeStep(); // complete last step

            expect(task.steps[1].completed).toBe(true);
            expect(result).toBe(task);
            expect(system.getCurrentTask()).toBeNull();
            expect(system.taskHistory.length).toBe(1);
        });
    });

    describe('getCurrentTask', () => {
        it('returns null before any task is started', () => {
            expect(system.getCurrentTask()).toBeNull();
        });

        it('returns the started task', () => {
            const task = makeTask(['a']);
            system.startTask(task);
            expect(system.getCurrentTask()).toBe(task);
        });
    });

    describe('getCurrentStepVisual', () => {
        it('returns null when there is no current task', () => {
            expect(system.getCurrentStepVisual()).toBeNull();
        });

        it('returns the current step visual string', () => {
            const task = makeTask(['data_table', 'scatter_plot']);
            system.startTask(task);

            expect(system.getCurrentStepVisual()).toBe('data_table');

            system.completeStep();
            expect(system.getCurrentStepVisual()).toBe('scatter_plot');
        });
    });

    describe('getTaskProgress', () => {
        it('returns 0 when there is no current task', () => {
            expect(system.getTaskProgress()).toBe(0);
        });

        it('returns 0 for a fresh task', () => {
            const task = makeTask(['a', 'b', 'c', 'd']);
            system.startTask(task);
            expect(system.getTaskProgress()).toBe(0);
        });

        it('returns 50 for 2 of 4 steps completed', () => {
            const task = makeTask(['a', 'b', 'c', 'd']);
            system.startTask(task);
            system.completeStep();
            system.completeStep();
            expect(system.getTaskProgress()).toBe(50);
        });
    });
});
