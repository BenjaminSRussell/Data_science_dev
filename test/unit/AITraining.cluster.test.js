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
