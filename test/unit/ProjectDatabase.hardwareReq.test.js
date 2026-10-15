/**
 * Stage hardwareReq ids must exist in the player's GPU catalog (#2173).
 * AI_HARDWARE is a separate companion catalog and does not satisfy this.
 */
import { describe, it, expect } from 'vitest';
import { CONTRACTS } from '../../src/js/game/ProjectDatabase.js';
import { HARDWARE_PARTS, HARDWARE_TYPES } from '../../src/js/game/HardwareSystems.js';

const gpuIds = new Set(HARDWARE_PARTS[HARDWARE_TYPES.GPU].map(p => p.id));

describe('contract hardware requirements', () => {
    it('fashion_trends CNN stage requires a real entry-level CUDA GPU', () => {
        const fashion = CONTRACTS.find(c => c.id === 'fashion_trends');
        const cnn = fashion.stages.find(s => s.name === 'Train CNN Model');
        expect(cnn.hardwareReq).toBe('gpu_gtx1650');
        expect(gpuIds.has(cnn.hardwareReq)).toBe(true);
    });

    it('every stage hardwareReq is a catalogued player GPU', () => {
        for (const contract of CONTRACTS) {
            for (const stage of contract.stages) {
                if (stage.hardwareReq) {
                    expect(gpuIds.has(stage.hardwareReq), `${contract.id} ${stage.name}`).toBe(true);
                }
            }
        }
    });
});
