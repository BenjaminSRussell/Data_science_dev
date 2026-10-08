/**
 * AudioManager reuses one AudioContext for sound effects (#273)
 */
import { describe, it, expect, vi, afterEach } from 'vitest';
import { AudioManager } from '../../src/js/audio/AudioManager.js';

function fakeContextClass() {
    const instances = [];
    class FakeCtx {
        constructor() {
            this.state = 'running';
            this.currentTime = 0;
            this.destination = {};
            this.resume = vi.fn(() => Promise.resolve());
            instances.push(this);
        }
        createOscillator() { return { connect: vi.fn(), frequency: {}, start: vi.fn(), stop: vi.fn() }; }
        createGain() { return { connect: vi.fn(), gain: { setValueAtTime: vi.fn(), exponentialRampToValueAtTime: vi.fn() } }; }
    }
    return { FakeCtx, instances };
}

describe('AudioManager AudioContext reuse', () => {
    afterEach(() => vi.unstubAllGlobals());

    it('plays many sounds through a single context', () => {
        const { FakeCtx, instances } = fakeContextClass();
        vi.stubGlobal('AudioContext', FakeCtx);
        const am = new AudioManager();
        for (let i = 0; i < 20; i++) expect(am.play('click')).toBe(true);
        expect(instances).toHaveLength(1);
    });

    it('resumes a suspended context and replaces a closed one', () => {
        const { FakeCtx, instances } = fakeContextClass();
        vi.stubGlobal('AudioContext', FakeCtx);
        const am = new AudioManager();
        am.play('click');
        instances[0].state = 'suspended';
        am.play('click');
        expect(instances[0].resume).toHaveBeenCalled();
        instances[0].state = 'closed';
        am.play('click');
        expect(instances).toHaveLength(2);
    });

    it('unknown sounds return false so callers can fall back', () => {
        const am = new AudioManager();
        expect(am.play('not_a_sound')).toBe(false);
    });
});
