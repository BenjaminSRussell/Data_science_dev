import { describe, it, expect, beforeEach } from 'vitest';
import { AITrainingStoryline } from '../../src/js/game/ai/AITrainingStoryline.js';

const make = () => new AITrainingStoryline({ currentLocation: 'university' });

describe('AITrainingStoryline cluster', () => {
    beforeEach(() => { delete window.game; });

    it('#103 #2032 completing a run frees its cluster, so training can continue', () => {
        const ai = make();
        for (let i = 0; i < 6; i++) {
            const r = ai.startAITrainingProject('rnn');
            expect(r.success).toBe(true);
            expect(r.project?.clusterId ?? ai.universityLab.currentProjects.at(-1).clusterId).toMatch(/^gpu_cluster_/);
            ai.completeTrainingProject(ai.universityLab.currentProjects.at(-1).id);
        }
        expect(Object.values(ai.universityLab.computers).every(c => !c.inUse)).toBe(true);
    });

    it('older saves that stored only the display name still free the cluster', () => {
        const ai = make();
        ai.startAITrainingProject('rnn');
        const p = ai.universityLab.currentProjects[0];
        delete p.clusterId; // old save shape: cluster = 'GPU Cluster 1'
        ai.completeTrainingProject(p.id);
        expect(ai.universityLab.computers.gpu_cluster_1.inUse).toBe(false);
    });

    it('completing the same run twice pays out once', () => {
        const ai = make();
        ai.startAITrainingProject('rnn');
        const id = ai.universityLab.currentProjects[0].id;
        ai.completeTrainingProject(id);
        expect(ai.completeTrainingProject(id).success).toBe(false);
        expect(ai.researchProgress).toBe(10);
        expect(ai.modelsTrained).toHaveLength(1);
    });

    it('#2035 useUniversityComputer reserves the cluster until released', () => {
        const ai = make();
        expect(ai.useUniversityComputer('gpu_cluster_2').success).toBe(true);
        expect(ai.useUniversityComputer('gpu_cluster_2').message).toMatch(/in use/);
        expect(ai.releaseUniversityComputer('gpu_cluster_2')).toBe(true);
        expect(ai.useUniversityComputer('gpu_cluster_2').success).toBe(true);
        expect(ai.releaseUniversityComputer('nope')).toBe(false);
    });

    it('a cluster busy with training is not freed by release', () => {
        const ai = make();
        ai.startAITrainingProject('rnn');
        expect(ai.releaseUniversityComputer('gpu_cluster_1')).toBe(false);
        expect(ai.universityLab.computers.gpu_cluster_1.inUse).toBe(true);
    });

    it('#2034 training runs alone cannot skip the pre-attention milestones', () => {
        const ai = make();
        for (let i = 0; i < 6; i++) {
            ai.startAITrainingProject('rnn');
            ai.completeTrainingProject(ai.universityLab.currentProjects.at(-1).id);
        }
        expect(ai.researchProgress).toBeGreaterThanOrEqual(50);
        expect(ai.currentPhase).toBe('pre_attention');
        for (const m of ai.timeline.pre_attention.milestones) ai.completeMilestone(m.id);
        expect(ai.currentPhase).toBe('attention_era');
    });
});

describe('AITrainingStoryline finished runs (#2036)', () => {
    beforeEach(() => { delete window.game; });

    it('completing a run removes it from currentProjects and records it in modelsTrained', () => {
        const ai = make();
        ai.startAITrainingProject('rnn');
        ai.startAITrainingProject('cnn');
        const [first, second] = ai.universityLab.currentProjects.map(p => p.id);
        ai.completeTrainingProject(first);
        expect(ai.universityLab.currentProjects.map(p => p.id)).toEqual([second]);
        expect(ai.modelsTrained.map(m => m.id)).toEqual([first]);
        expect(ai.findTrainedModel(first).status).toBe('completed');
    });

    it('currentProjects stays bounded across many runs', () => {
        const ai = make();
        for (let i = 0; i < 20; i++) {
            ai.startAITrainingProject('rnn');
            ai.completeTrainingProject(ai.universityLab.currentProjects.at(-1).id);
        }
        expect(ai.universityLab.currentProjects).toHaveLength(0);
        expect(ai.modelsTrained).toHaveLength(20);
        expect(new Set(ai.modelsTrained.map(m => m.id)).size).toBe(20);
        expect(ai.toJSON().universityLab.currentProjects).toHaveLength(0);
    });

    it('learnFromModel works on finished runs and refuses runs in progress', () => {
        const ai = make();
        ai.gameState.stats = ai.gameState.stats || {};
        ai.startAITrainingProject('rnn');
        const id = ai.universityLab.currentProjects[0].id;
        expect(ai.learnFromModel(id).success).toBe(false);
        ai.completeTrainingProject(id);
        expect(ai.learnFromModel(id).success).toBe(true);
        expect(ai.learnFromModel('missing').success).toBe(false);
    });

    it('older saves with finished runs in currentProjects are migrated on load', () => {
        const ai = make();
        ai.startAITrainingProject('rnn');
        ai.startAITrainingProject('cnn');
        const save = JSON.parse(JSON.stringify(ai.toJSON()));
        const [done, live] = save.universityLab.currentProjects;
        done.status = 'completed';
        save.modelsTrained = [];
        const loaded = make();
        loaded.fromJSON(save);
        expect(loaded.universityLab.currentProjects.map(p => p.id)).toEqual([live.id]);
        expect(loaded.modelsTrained.map(m => m.id)).toEqual([done.id]);
        expect(loaded.completeTrainingProject(done.id).success).toBe(false);
    });
});
