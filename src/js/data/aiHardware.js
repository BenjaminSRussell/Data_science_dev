/**
 * AI Hardware - GPU accelerators and processing upgrades for the AI companion
 * Parallel to HARDWARE_PARTS in HardwareSystems.js
 */

export const AI_HARDWARE = {
    GPU: [
        {
            id: 'gpu_basic',
            name: 'Basic GPU',
            description: 'Entry-level GPU for AI acceleration.',
            price: 500,
            multiplier: 1.0,
            unlockRank: 1
        },
        {
            id: 'gpu_mid',
            name: 'Mid-Range GPU',
            description: 'Solid GPU for AI training.',
            price: 1200,
            multiplier: 2.5,
            unlockRank: 2
        },
        {
            id: 'gpu_v100',
            name: 'NVIDIA V100',
            description: 'Professional GPU for deep learning.',
            price: 2800,
            multiplier: 4.0,
            unlockRank: 3
        },
        {
            id: 'gpu_rtx4090',
            name: 'RTX 4090',
            description: 'Consumer flagship for AI workloads.',
            price: 3200,
            multiplier: 5.0,
            unlockRank: 4
        },
        {
            id: 'gpu_a100',
            name: 'NVIDIA A100',
            description: 'Data center GPU for large models.',
            price: 8000,
            multiplier: 8.0,
            unlockRank: 5
        },
        {
            id: 'gpu_h100',
            name: 'NVIDIA H100',
            description: 'Latest tensor GPU for transformer models.',
            price: 15000,
            multiplier: 12.0,
            unlockRank: 7
        }
    ],
    ACCELERATOR: [
        {
            id: 'tpu_v4',
            name: 'TPU v4',
            description: 'Tensor Processing Unit for ML.',
            price: 3500,
            multiplier: 6.0,
            unlockRank: 4
        },
        {
            id: 'gaudi_accelerator',
            name: 'Gaudi Accelerator',
            description: 'Deep learning accelerator.',
            price: 2500,
            multiplier: 3.5,
            unlockRank: 3
        }
    ]
};

/**
 * Helper function to get all AI hardware items
 */
export function getAllAIHardware() {
    return Object.values(AI_HARDWARE).flat();
}

/**
 * Helper function to find AI hardware by ID
 */
export function findAIHardwareById(id) {
    return getAllAIHardware().find(item => item.id === id);
}
