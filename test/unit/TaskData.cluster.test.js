import { describe, it, expect, beforeEach } from 'vitest';
import { COMPREHENSIVE_DATA_SCIENCE_TASKS as TASKS } from '../../src/js/data/comprehensive_datascience_tasks.js';
import { CHART_TYPES } from '../../src/js/data/chartTypes.js';
import { DATA_SCIENCE_TASKS } from '../../src/js/data/datascience_tasks.js';
import { taskBriefRows, taskBriefHTML, renderTaskBrief } from '../../src/js/game/taskBrief.js';
import { TaskSystem } from '../../src/js/game/TaskSystem.js';

describe('Comprehensive task data', () => {
    it('has no unfilled "standard" placeholders (#75)', () => {
        const offenders = TASKS.filter(t => /(?<![A-Za-z])standard(?![a-z])/.test(t.description)).map(t => t.id);
        expect(offenders).toEqual([]);
        const ds0134 = TASKS.find(t => t.id === 'ds_0134').description;
        expect(ds0134).toMatch(/Phase (II|III|IIb) clinical trial/);
        expect(ds0134).toMatch(/recruit [\d,]+ patients across \d+ sites in \d+ months/);
    });

    it('only references chart types the game offers (#2142)', () => {
        const valid = new Set(CHART_TYPES.map(c => c.id));
        const bad = [];
        for (const t of TASKS) {
            for (const key of ['optimalChartTypes', 'acceptableChartTypes']) {
                for (const c of t[key] || []) if (!valid.has(c)) bad.push(`${t.id}.${key}:${c}`);
            }
            expect(t.optimalChartTypes.length).toBeGreaterThan(0);
        }
        expect(bad).toEqual([]);
    });

    it('datascience_tasks.js also only uses real chart ids (#2156)', () => {
        const valid = new Set(CHART_TYPES.map(c => c.id));
        const bad = DATA_SCIENCE_TASKS.flatMap(t =>
            [...(t.optimalChartTypes || []), ...(t.acceptableChartTypes || [])]
                .filter(c => !valid.has(c)).map(c => `${t.id}:${c}`));
        expect(bad).toEqual([]);
    });

    it('still has 1000 tasks with ids intact', () => {
        expect(TASKS).toHaveLength(1000);
        expect(new Set(TASKS.map(t => t.id)).size).toBe(1000);
    });
});

describe('Task brief shows comprehensive-task metadata (#2430)', () => {
    beforeEach(() => {
        document.body.innerHTML = `
            <div id="task-content"><p class="task-description"></p>
            <div class="task-requirements"></div><div class="task-brief" hidden></div></div>
            <div id="boss-dialogue"><p></p></div>`;
    });

    it('builds rows from the task (template fallback) and escapes values', () => {
        const task = { template: { domain: 'finance', subdomain: 'banking', tools: ['XGBoost', '<b>SQL</b>'], skills: ['Classification'], deliverable: 'Report', realWorldContext: 'Bank' } };
        const labels = taskBriefRows(task).map(r => r.label);
        expect(labels).toEqual(['Domain', 'Tools', 'Skills', 'Deliverable', 'Context']);
        const html = taskBriefHTML(task);
        expect(html).toContain('finance / banking');
        expect(html).toContain('&lt;b&gt;SQL&lt;/b&gt;');
        expect(html).not.toContain('<b>SQL');
    });

    it('a generated task renders its domain, tools and deliverable', () => {
        const ts = new TaskSystem({ rankIndex: 0, currentRank: { salaryMultiplier: 1 }, currentTask: null });
        const template = TASKS.find(t => t.id === 'ds_0002');
        ts.updateDataTable = () => {};
        const task = ts.createTaskFromTemplate(template, { name: 'Boss', title: 'Lead', taskIntro: 'Hi' });
        const brief = document.querySelector('.task-brief');
        expect(brief.hidden).toBe(false);
        expect(brief.textContent).toContain(template.domain);
        expect(brief.textContent).toContain(template.tools[0]);
        expect(brief.textContent).toContain(template.deliverable);
        expect(task.realWorldContext).toBe(template.realWorldContext);
    });

    it('stays hidden when the task has no metadata', () => {
        renderTaskBrief({ template: { description: 'x' } });
        expect(document.querySelector('.task-brief').hidden).toBe(true);
    });
});
