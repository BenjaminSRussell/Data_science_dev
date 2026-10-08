import { describe, it, expect, vi, afterEach } from 'vitest';
import { TaskVisualRenderer } from '../../src/js/game/work/TaskVisualRenderer.js';

const task = (visuals, extra = {}) => ({
    name: 'Task <X>',
    steps: visuals.map((v, i) => ({ name: `Step ${i + 1}`, visual: v, ...(extra[i] || {}) }))
});

afterEach(() => { vi.restoreAllMocks(); document.body.innerHTML = ''; });

describe('TaskVisualRenderer pure helpers (#390)', () => {
    const r = new TaskVisualRenderer();
    it('calculateStepProgress', () => {
        const t = task(['a', 'b', 'c', 'd']);
        expect(r.calculateStepProgress(t, t.steps[2])).toBe(75);
        expect(r.calculateStepProgress(t, t.steps[0])).toBe(25);
        expect(r.calculateStepProgress(t, { name: 'other' })).toBe(0);
        expect(r.calculateStepProgress({}, {})).toBe(0);
    });
    it('#2102 icon tables return real glyphs with fallbacks', () => {
        for (const s of ['Extract', 'Transform', 'Load', 'Source', 'Process', 'Destination']) {
            expect(r.getStageIcon(s)).not.toBe('');
        }
        expect(r.getStageIcon('nope')).toBe('●');
        for (const v of ['data_loading', 'statistics', 'pattern_analysis', 'documentation', 'architecture']) {
            expect(r.getVisualIcon(v)).not.toBe('');
        }
        expect(r.getVisualIcon('nope')).toBe('◆');
    });
});

describe('TaskVisualRenderer.renderTaskVisual (#389)', () => {
    it('guards bad input', () => {
        const r = new TaskVisualRenderer();
        expect(r.renderTaskVisual(null, 0, 'x')).toBeNull();
        expect(r.renderTaskVisual({}, 0, 'x')).toBeNull();
        expect(r.renderTaskVisual(task(['pipeline']), 1, 'x')).toBeNull();
    });
    it('falls back for an unknown visual and errors on a missing container', () => {
        const r = new TaskVisualRenderer();
        vi.spyOn(console, 'warn').mockImplementation(() => {});
        vi.spyOn(console, 'error').mockImplementation(() => {});
        document.body.innerHTML = '<div id="v"></div>';
        r.renderTaskVisual(task(['mystery']), 0, 'v');
        expect(document.getElementById('v').textContent).toContain('Working');
        expect(r.renderTaskVisual(task(['pipeline']), 0, 'missing')).toBeNull();
    });
    it('renders the happy path with container classes, animation and escaped header', () => {
        const r = new TaskVisualRenderer();
        document.body.innerHTML = '<div id="v"></div>';
        const el = r.renderTaskVisual(task(['pipeline_diagram']), 0, 'v');
        expect(el.className).toContain('task-visual-container');
        expect(el.className).toContain('task-visual--pipeline-diagram');
        expect(el.classList.contains('animate-etl-flow')).toBe(true);
        expect(el.textContent).toContain('Extract');
        expect(el.querySelector('.task-header p').textContent).toBe('Task <X>');
        const other = r.createVisualHTML('pipeline', r.visuals.pipeline, task(['pipeline']), task(['pipeline']).steps[0]);
        expect(other).toContain('Source');
        expect(other).not.toContain('Extract');
    });
});

describe('TaskVisualRenderer visuals', () => {
    it('#1061 the progress width is on a fill inside the track', () => {
        const r = new TaskVisualRenderer();
        const t = task(['pipeline', 'pipeline']);
        document.body.innerHTML = '<div id="v"></div>';
        r.renderTaskVisual(t, 0, 'v');
        const track = document.querySelector('.task-progress .progress-bar');
        expect(track.getAttribute('style')).toBeNull();
        expect(track.querySelector('.progress-fill').style.width).toBe('50%');
    });

    it('#2103 every registered type gets its own visual, not the shared placeholder', () => {
        const r = new TaskVisualRenderer();
        for (const type of Object.keys(r.visuals)) {
            const t = task([type]);
            const html = r.createVisualHTML(type, r.visuals[type], t, t.steps[0]);
            expect(html, type).not.toContain('default-visual');
        }
        const t = task(['monitoring']);
        const html = r.createVisualHTML('monitoring', r.visuals.monitoring, t, t.steps[0]);
        expect(html).toContain('dashboard');
        expect(html).toContain('alerts');
    });

    it('#2104 generators use the task and step data', () => {
        const r = new TaskVisualRenderer();
        const t = task(['code_editor', 'data_table', 'training', 'github_issue', 'charting'], {
            0: { code: ['SELECT 1'] },
            1: { columns: ['city'], rows: [['Boston']] },
            2: { metrics: { loss: 0.5, accuracy: 61 } },
            3: { title: 'Nulls crash loader', description: 'Fix it' },
            4: { data: [1, 2] }
        });
        const html = (i) => r.createVisualHTML(t.steps[i].visual, r.visuals[t.steps[i].visual], t, t.steps[i]);
        expect(html(0)).toContain('SELECT 1');
        expect(html(1)).toContain('Boston');
        expect(html(2)).toContain('Loss: 0.500');
        expect(html(2)).toContain('Accuracy: 61.0%');
        expect(html(3)).toContain('Nulls crash loader');
        expect((html(4).match(/chart-point/g) || []).length).toBe(2);
        // training without metrics follows the step position
        const t2 = task(['training', 'training']);
        const a = r.createVisualHTML('training', r.visuals.training, t2, t2.steps[0]);
        const b = r.createVisualHTML('training', r.visuals.training, t2, t2.steps[1]);
        expect(a).not.toBe(b);
    });
});
