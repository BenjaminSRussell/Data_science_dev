import { describe, it, expect, vi, afterEach } from 'vitest';
import { TaskSystem } from '../../src/js/game/TaskSystem.js';
import { COMPREHENSIVE_DATA_SCIENCE_TASKS } from '../../src/js/data/comprehensive_datascience_tasks.js';
import { BOSSES } from '../../src/js/data/bosses.js';
import { WorkInteractionSystem } from '../../src/js/game/WorkInteractionSystem.js';
import { GitHubIssuesSystem } from '../../src/js/game/github/GitHubIssuesSystem.js';

afterEach(() => vi.restoreAllMocks());

describe('TaskSystem (#2141, #2319, #110, #2210)', () => {
    it('every comprehensive task is reachable by some rank', () => {
        const ts = new TaskSystem({});
        const unreachable = COMPREHENSIVE_DATA_SCIENCE_TASKS.filter(t =>
            ![0, 1, 2, 3, 4, 5, 6].some(r => Math.abs(Number(t.difficulty) - ts.getDifficultyForRank(r)) <= TaskSystem.DIFFICULTY_TOLERANCE));
        expect(unreachable).toHaveLength(0);
        expect(ts.getDifficultyForRank(0)).toBe(1);
        expect(ts.getDifficultyForRank(6)).toBeGreaterThan(9);
        expect(ts.getDifficultyForRank(-3)).toBe(1);
        expect(ts.getDifficultyForRank(99)).toBe(ts.getDifficultyForRank(6));
    });

    it('top-rank tasks are hard ones', () => {
        const gs = { rankIndex: 6, currentRank: { salaryMultiplier: 15 } };
        const ts = new TaskSystem(gs);
        for (let i = 0; i < 20; i++) {
            const task = ts.generateNewTask();
            expect(Number(task.template.difficulty)).toBeGreaterThanOrEqual(8.9);
        }
    });

    it('quarterly datasets match the table rows', () => {
        const data = new TaskSystem({}).generateQuarterlySalesData();
        expect(data.datasets.Revenue).toEqual(data.rows.map(r => r[1]));
        expect(data.datasets.Expenses).toEqual(data.rows.map(r => r[2]));
        expect(data.datasets.Profit).toEqual(data.rows.map(r => r[3]));
    });

    it('fallback task becomes the current task', () => {
        const gs = { rankIndex: 0 };
        const t = new TaskSystem(gs).generateFallbackTask();
        expect(gs.currentTask).toBe(t);
        expect(t.boss).toBe(BOSSES[0]);
    });

    it('boss panel shows the boss style, never an image path as text', () => {
        document.body.innerHTML = '<div id="boss-dialogue"><p></p></div><span id="boss-name"></span><div id="boss-title"></div><div id="boss-mood"></div>';
        const gs = { rankIndex: 0 };
        new TaskSystem(gs).generateFallbackTask();
        expect(document.getElementById('boss-mood').textContent).toBe('Mood: Neutral · Style: Traditional');
        expect(document.getElementById('boss-name').textContent).toBe('Mr. Anderson');
    });
});

describe('WorkInteractionSystem boss uses BOSSES (#1811)', () => {
    it('picks a real boss', () => {
        const w = new WorkInteractionSystem({});
        expect(BOSSES.map(b => b.name)).toContain(w.boss.name);
    });
});

describe('GitHubIssuesSystem (#931, #2086, #313, #363, #364, #365)', () => {
    const make = (intel = 100) => {
        const gs = { money: 0, reputation: 0, characterStats: { getStat: () => intel } };
        return { gs, gh: new GitHubIssuesSystem(gs) };
    };

    it('getOpenIssues filters by repository, difficulty and labels', () => {
        const { gh } = make();
        const all = gh.getOpenIssues();
        expect(all.length).toBeGreaterThan(0);
        const repo = all[0].repository;
        expect(gh.getOpenIssues({ repository: repo }).every(i => i.repository === repo)).toBe(true);
        const diff = all[0].difficulty;
        expect(gh.getOpenIssues({ difficulty: diff }).every(i => i.difficulty === diff)).toBe(true);
        const label = all[0].labels[0];
        expect(gh.getOpenIssues({ labels: [label] }).every(i => i.labels.includes(label))).toBe(true);
        expect(gh.getOpenIssues({ labels: ['no-such-label'] })).toHaveLength(0);
    });

    it('completeIssue needs assignment, pays out, closes the issue and opens a PR', () => {
        const { gs, gh } = make();
        const issue = gh.getOpenIssues()[0];
        expect(gh.completeIssue(issue.id).success).toBe(false);
        expect(gh.assignIssue(issue.id).success).toBe(true);
        expect(gh.assignIssue(issue.id).success).toBe(false);
        const r = gh.completeIssue(issue.id);
        expect(r.success).toBe(true);
        expect(gs.money).toBe(issue.reward.money);
        expect(gs.reputation).toBe(issue.reward.reputation);
        expect(gh.openIssues.find(i => i.id === issue.id)).toBeUndefined();
        expect(gh.closedIssues).toContain(issue);
        expect(gh.getPullRequests({ status: 'open' })).toEqual([r.pullRequest]);
    });

    it('assignIssue is gated on intelligence', () => {
        const { gh } = make(0);
        const hard = gh.getOpenIssues().find(i => gh.getRequiredIntelligence(i.difficulty) > 0);
        expect(gh.assignIssue(hard.id).success).toBe(false);
    });

    it('merging needs an approving review, which requestReview can now add', () => {
        const { gh } = make();
        const issue = gh.getOpenIssues()[0];
        gh.assignIssue(issue.id);
        const pr = gh.completeIssue(issue.id).pullRequest;
        expect(gh.mergePullRequest(pr.id).success).toBe(false);
        expect(gh.requestReview(pr.id, { reviewer: 'bob', approved: false }).success).toBe(true);
        expect(gh.requestReview(pr.id, { reviewer: 'alice' }).success).toBe(true);
        expect(gh.mergePullRequest(pr.id).message).toMatch(/requested changes/);
        pr.reviews = pr.reviews.filter(r => r.reviewer === 'alice');
        expect(gh.mergePullRequest(pr.id).success).toBe(true);
        expect(gh.mergePullRequest(pr.id).success).toBe(false);
        expect(gh.getPullRequests({ status: 'merged' })).toHaveLength(1);
        expect(gh.mergePullRequest('nope').success).toBe(false);
    });

    it('generateNewIssue numbers issues uniquely with a reward by difficulty', () => {
        const { gh } = make();
        const before = gh.openIssues.length;
        const maxNum = Math.max(...gh.openIssues.map(i => i.number));
        const a = gh.generateNewIssue();
        const b = gh.generateNewIssue();
        expect(gh.openIssues.length).toBe(before + 2);
        expect(a.number).toBe(maxNum + 1);
        expect(b.number).toBe(maxNum + 2);
        expect(a.reward.money).toBe({ easy: 200, medium: 400 }[a.difficulty] ?? 600);
        expect(gh.repositories.map(r => r.id)).toContain(a.repository);
    });
});

describe('RealWorldTaskSystem (#164, #165)', () => {
    it('one task at a time, XP lands in CharacterStats', async () => {
        const { RealWorldTaskSystem } = await import('../../src/js/game/work/RealWorldTaskSystem.js');
        const { CharacterStats } = await import('../../src/js/game/CharacterStats.js');
        const gs = { money: 0, reputation: 0, characterStats: new CharacterStats() };
        const rw = new RealWorldTaskSystem(gs);
        const [a, b] = [rw.generateTask('data_analyst'), rw.generateTask('data_analyst')];
        expect(rw.startTask(a)).toBe(a);
        expect(rw.startTask(b)).toBeNull();
        const xpBefore = JSON.stringify(gs.characterStats.xp) + JSON.stringify(gs.characterStats.stats);
        while (rw.getCurrentTask()) rw.completeStep();
        if (a.reward?.experience) {
            expect(JSON.stringify(gs.characterStats.xp) + JSON.stringify(gs.characterStats.stats)).not.toBe(xpBefore);
        }
        expect(gs.stats).toBeUndefined();
    });
});

describe('RealWorldTaskSystem task types (#249, #387)', () => {
    it('every task listed for every job can be generated', async () => {
        const { RealWorldTaskSystem } = await import('../../src/js/game/work/RealWorldTaskSystem.js');
        const rw = new RealWorldTaskSystem({ money: 0, reputation: 0 });
        for (const job of ['data_analyst', 'data_engineer', 'ml_engineer', 'research_scientist']) {
            const types = rw.getAvailableTasks(job);
            expect(types.length).toBeGreaterThan(0);
            types.forEach(t => expect(rw.taskTypes[t]).toBeDefined());
            expect(types).not.toContain('ai_model_training');
            for (let i = 0; i < 20; i++) {
                const task = rw.generateTask(job);
                expect(task.steps.length).toBeGreaterThan(0);
                expect(task.steps.every(s => s.completed === false)).toBe(true);
            }
        }
        expect(rw.getAvailableTasks('data_engineer')).toContain('pipeline_optimization');
        expect(rw.getAvailableTasks('research_scientist', { inUniversityLab: true })).toEqual(['ai_model_training']);
    });
});

describe('TaskVisualRenderer covers every visual RealWorldTaskSystem uses (#1227)', () => {
    it('no missing step or task visuals', async () => {
        const { RealWorldTaskSystem } = await import('../../src/js/game/work/RealWorldTaskSystem.js');
        const { TaskVisualRenderer } = await import('../../src/js/game/work/TaskVisualRenderer.js');
        const rw = new RealWorldTaskSystem({});
        const r = new TaskVisualRenderer({});
        const used = new Set();
        Object.values(rw.taskTypes).forEach(t => { used.add(t.visual); t.steps.forEach(st => used.add(st.visual)); });
        expect([...used].filter(v => !r.visuals[v])).toEqual([]);
    });
});
