import { describe, it, expect, vi } from 'vitest';
import { JobSystem, JOB_CATEGORIES } from '../../src/js/game/JobSystem.js';
import { RealWorldTaskSystem, JOB_CATEGORY_ROLES } from '../../src/js/game/work/RealWorldTaskSystem.js';
import { CAREER_TASK_WORKFLOW, describeWorkReward } from '../../src/js/game/work/jobCatalogLink.js';

const stats = (v = 100) => ({
    getStat: () => v,
    addExperience: vi.fn(),
    getTotalBonuses: () => ({ clientPay: 0 })
});

describe('one job catalog, workflows consumed by it (#1827)', () => {
    it('every career category has a workflow role and is not a second job list', () => {
        const rw = new RealWorldTaskSystem({ money: 0, reputation: 0 });
        expect(rw.careerCategories()).toBe(JOB_CATEGORIES);
        expect(Object.keys(JOB_CATEGORY_ROLES).sort()).toEqual(Object.keys(JOB_CATEGORIES).sort());
        expect(JOB_CATEGORIES.data_engineer).toBeUndefined();
        expect(rw.getAvailableTasks('data_engineer').length).toBeGreaterThan(0);
        // Higher tiers follow the career ladder, not the old data_analyst fallback
        expect(JOB_CATEGORY_ROLES.principal_scientist).toBe('research_scientist');
        expect(JOB_CATEGORY_ROLES.chief_data_officer).toBe('research_scientist');
        expect(rw.getAvailableTasks('principal_scientist')).toEqual(rw.getAvailableTasks('research_scientist'));
        expect(rw.getAvailableTasks('chief_data_officer')).toEqual(rw.getAvailableTasks('research_scientist'));
    });

    it('each career assignment points at a workflow that job offers', () => {
        const rw = new RealWorldTaskSystem({});
        const js = new JobSystem({ reputation: 0, characterStats: stats() });
        const seen = new Set();
        for (const [categoryId, category] of Object.entries(JOB_CATEGORIES)) {
            const offered = new Set(rw.getAvailableTasks(categoryId));
            expect(offered.size).toBeGreaterThan(0);
            for (const task of category.tasks) {
                seen.add(task.id);
                const workflowId = js.workflowForTask(task.id);
                expect(workflowId).toBe(CAREER_TASK_WORKFLOW[task.id]);
                expect(rw.taskTypes[workflowId]).toBeDefined();
                expect(offered.has(workflowId)).toBe(true);
                expect(rw.workflowForCareerTask(task.id)).toBe(workflowId);
            }
        }
        expect(Object.keys(CAREER_TASK_WORKFLOW).sort()).toEqual([...seen].sort());
        js.updateCurrentJob();
        expect(js.workflowRole()).toBe('data_analyst');
        expect(js.workflowsForCurrentJob()).toEqual(rw.getAvailableTasks('entry_level'));
    });

    it('shared reward view keeps both catalogs payout numbers', () => {
        const js = new JobSystem({ reputation: 0, characterStats: stats() });
        const rw = new RealWorldTaskSystem({ money: 0, reputation: 0, characterStats: stats() });
        const career = js.describeTaskReward('data_entry');
        expect(career.money).toBe(JOB_CATEGORIES.entry_level.tasks[0].basePay);
        expect(career.money).toBe(50);
        expect(career.reputation).toBe(JobSystem.reputationFor(JOB_CATEGORIES.entry_level.tasks[0]));
        expect(career.xpByStat).toEqual({ focus: 5 });
        const workflow = rw.describeTaskReward('data_cleaning');
        expect(workflow.money).toBe(500);
        expect(workflow.reputation).toBe(10);
        expect(workflow.experience).toBe(50);
        expect(Object.values(workflow.xpByStat).reduce((s, n) => s + n, 0)).toBe(50);
        expect(describeWorkReward(rw.taskTypes.data_cleaning)).toEqual(workflow);
    });

    it('completing a career task still pays basePay through the shared book', () => {
        const gs = { money: 0, reputation: 0, totalEarned: 0, weeklyIncome: 0, characterStats: stats(50) };
        const js = new JobSystem(gs);
        js.startTask('data_entry');
        const res = js.completeTask('data_entry', 1);
        expect(res.pay).toBe(50);
        expect(res.reputation).toBe(5);
        expect(gs.money).toBe(50);
        expect(gs.totalEarned).toBe(50);
        expect(gs.weeklyIncome).toBe(50);
        expect(gs.characterStats.addExperience).toHaveBeenCalledWith('focus', 5);
    });
});
