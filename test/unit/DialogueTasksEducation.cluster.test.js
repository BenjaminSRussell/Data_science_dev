import { describe, it, expect, vi, afterEach } from 'vitest';
import { RealWorldTaskSystem, JOB_CATEGORY_ROLES } from '../../src/js/game/work/RealWorldTaskSystem.js';
import { EducationSystem } from '../../src/js/game/EducationSystem.js';
import { handleStartExam } from '../../src/js/helpers/EducationHelpers.js';

afterEach(() => { vi.restoreAllMocks(); document.body.innerHTML = ''; });

describe('RealWorldTaskSystem (#1819, #1820, #1821, #2094, #2095, #2097)', () => {
    const gs = () => ({ money: 0, reputation: 0, characterStats: { addExperience: vi.fn() } });

    it('task ids are unique under rapid calls (#2097)', () => {
        const s = new RealWorldTaskSystem(gs());
        const ids = new Set(Array.from({ length: 50 }, () => s.generateTask('data_analyst').id));
        expect(ids.size).toBe(50);
    });

    it('real JobSystem ids map to roles; unknown jobs never see the lab task (#1819)', () => {
        const s = new RealWorldTaskSystem(gs());
        expect(s.getAvailableTasks('senior_analyst')).toEqual(s.getAvailableTasks('ml_engineer'));
        expect(s.getAvailableTasks('entry_level')).toEqual(s.getAvailableTasks('data_analyst'));
        expect(s.getAvailableTasks('mystery_job', { inUniversityLab: true })).not.toContain('ai_model_training');
        expect(s.getAvailableTasks('lead_scientist', { inUniversityLab: true })).toEqual(['ai_model_training']);
        expect(JOB_CATEGORY_ROLES.junior_analyst).toBe('data_analyst');
    });

    it('lab-only tasks cannot start outside the lab (#2094)', () => {
        const s = new RealWorldTaskSystem(gs());
        const task = s.generateTask('research_scientist', { inUniversityLab: true });
        expect(task.requiresLab).toBe(true);
        const copy = { ...task, context: {} };
        expect(s.startTask(copy)).toBeNull();
        expect(s.startTask(copy, { inUniversityLab: true })).toBe(copy);
    });

    it('an out-of-range step index finishes or recovers instead of stalling (#2095)', () => {
        const s = new RealWorldTaskSystem(gs());
        const t = s.startTask(s.generateTask('data_analyst'));
        t.currentStep = t.steps.length + 3;
        expect(s.completeStep()).toBe(t);
        expect(s.currentTask).toBeNull();
        const t2 = s.startTask(s.generateTask('data_analyst'));
        t2.currentStep = -4;
        s.completeStep();
        expect(t2.steps[0].completed).toBe(true);
        expect(t2.currentStep).toBe(1);
    });

    it('money is paid regardless of canTakeModel; XP remainder is not lost (#1820, #1821)', () => {
        const state = gs();
        const s = new RealWorldTaskSystem(state);
        s.currentTask = { steps: [], startedAt: Date.now(), canTakeModel: false,
            skills: ['python', 'sql', 'pandas'], reward: { money: 300, experience: 100 } };
        s.completeTask();
        expect(state.money).toBe(300);
        const total = state.characterStats.addExperience.mock.calls.reduce((a, c) => a + c[1], 0);
        expect(total).toBe(100);
    });
});

describe('EducationSystem (#949, #1424, #1425, #1427, #2163, #2164)', () => {
    const gs = () => ({ money: 10000, reputation: 0, characterStats: { addExperience: vi.fn() }, newsManager: { addNews: vi.fn() } });

    it('every question has a valid correct index and 4 options (#1427)', () => {
        const e = new EducationSystem(gs());
        for (const c of Object.values(e.courses)) {
            expect(c.questions.length).toBeGreaterThanOrEqual(3);
            for (const q of c.questions) {
                expect(q.options.length).toBe(4);
                expect(Number.isInteger(q.correct)).toBe(true);
                expect(q.correct).toBeGreaterThanOrEqual(0);
                expect(q.correct).toBeLessThan(q.options.length);
            }
        }
        // spot-check answers verified by hand in #1427
        const median = e.courses.stats_201.questions[0];
        expect(median.options[median.correct]).toBe('6');
        const over = e.courses.ml_intro.questions[1];
        expect(over.options[over.correct]).toBe('Model memorizes noise');
    });

    it('completeCourse rejects ids outside the catalog (#1424)', () => {
        const e = new EducationSystem(gs());
        expect(e.completeCourse('basket_weaving')).toBe(false);
        expect(e.completedCourses).toEqual([]);
    });

    it('earning a degree grants reputation and XP once (#949)', () => {
        const state = gs();
        const e = new EducationSystem(state);
        e.completeCourse('python_101');
        const before = state.reputation;
        e.completeCourse('sql_101');
        expect(e.hasDegree('bootcamp')).toBe(true);
        expect(state.reputation - before).toBe(10 + EducationSystem.DEGREE_REWARDS.bootcamp.reputation);
        expect(state.characterStats.addExperience).toHaveBeenCalledWith('intelligence', 40);
    });

    it('fromJSON tolerates junk and re-derives degrees silently (#1425, #2163, #2164)', () => {
        const state = gs();
        const e = new EducationSystem(state);
        expect(() => e.fromJSON({ completedCourses: 'oops', degrees: { bootcamp: null, masters: 7 } })).not.toThrow();
        expect(e.completedCourses).toEqual([]);
        e.fromJSON({ completedCourses: ['python_101', 'sql_101', 'fake', 'sql_101'], degrees: { bootcamp: { acquired: false } } });
        expect(e.completedCourses).toEqual(['python_101', 'sql_101']);
        expect(e.hasDegree('bootcamp')).toBe(true);
        expect(state.reputation).toBe(0);
        expect(state.newsManager.addNews).not.toHaveBeenCalled();
    });

    it('handleStartExam enrolls via EducationSystem.enroll and honours prereqs (#1426, #1640)', () => {
        document.body.innerHTML = '<div id="modal-exam" class="hidden"><button id="btn-start-exam"></button></div>';
        const state = gs();
        state.educationSystem = new EducationSystem(state);
        const game = { gameState: state, showToast: vi.fn(), uiUpdater: { updateAllUI: vi.fn() } };
        const spy = vi.spyOn(state.educationSystem, 'canEnroll');
        handleStartExam(game, 'stats_201'); // needs python_101
        expect(spy).toHaveBeenCalledWith('stats_201');
        expect(state.money).toBe(10000);
        expect(game.showToast).toHaveBeenCalledWith(expect.stringMatching(/Prerequisites/), 'error');
        handleStartExam(game, 'python_101');
        expect(state.money).toBe(10000); // charged on Start, not on open (#1270)
        document.getElementById('btn-start-exam').click();
        expect(state.money).toBe(9500);
        state.educationSystem.completedCourses.push('sql_101');
        handleStartExam(game, 'sql_101');
        expect(state.money).toBe(9500); // never charged twice
    });
});
