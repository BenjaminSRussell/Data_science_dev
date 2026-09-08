/**
 * Hardware Systems - Detailed PC building components
 * Replaces generic equipment upgrades with specific parts
 */

export const HARDWARE_TYPES = {
    COOLING: 'cooling',
    CASE: 'case',
    MONITOR: 'monitor',
    GPU: 'gpu',
    CPU: 'cpu',
    RAM: 'ram',
    STORAGE: 'storage'
};

export const HARDWARE_PARTS = {
    [HARDWARE_TYPES.CPU]: [
        { id: 'cpu_generic', name: 'Generic Dual Core', description: 'Struggles with Chrome tabs.', price: 0, stats: { compute: 2, power_draw: 65 }, unlockRank: 0 },
        { id: 'cpu_i3', name: 'Core i3 Equivalent', description: 'Good for basic scripts.', price: 120, stats: { compute: 5, power_draw: 75 }, unlockRank: 1 },
        { id: 'cpu_i5', name: 'Core i5 Equivalent', description: 'Solid multitasking.', price: 200, stats: { compute: 10, power_draw: 95 }, unlockRank: 2 },
        { id: 'cpu_r5', name: 'Ryzen 5 Equivalent', description: 'Great value performance.', price: 220, stats: { compute: 12, power_draw: 95 }, unlockRank: 2 },
        { id: 'cpu_i7', name: 'Core i7 Equivalent', description: 'Serious number crunching.', price: 350, stats: { compute: 20, power_draw: 125 }, unlockRank: 3 },
        { id: 'cpu_r7', name: 'Ryzen 7 Equivalent', description: 'Multithreaded beast.', price: 380, stats: { compute: 24, power_draw: 105 }, unlockRank: 3 },
        { id: 'cpu_i9', name: 'Core i9 Extreme', description: 'Hot but fast.', price: 550, stats: { compute: 35, power_draw: 200 }, unlockRank: 4 },
        { id: 'cpu_threadripper', name: 'Threadripper 32-Core', description: 'Compiles in seconds.', price: 1500, stats: { compute: 80, power_draw: 280 }, unlockRank: 5 },
        { id: 'cpu_epyc', name: 'EPYC Server Chip', description: 'Data center grade.', price: 3000, stats: { compute: 150, power_draw: 300 }, unlockRank: 7 },
        { id: 'cpu_cluster', name: 'Cluster Node Access', description: 'Distributed computing.', price: 8000, stats: { compute: 500 }, unlockRank: 9 },
        { id: 'cpu_quantum', name: 'Quantum Processor', description: ' Solving NP-hard problems.', price: 50000, stats: { compute: 5000 }, unlockRank: 10 }
    ],
    [HARDWARE_TYPES.GPU]: [
        { id: 'gpu_integrated', name: 'Integrated Graphics', description: 'Good enough for spreadsheets.', price: 0, stats: { compute: 1, vram: 0 }, unlockRank: 0 },
        { id: 'gpu_gt1030', name: 'GT 1030', description: 'Just for display output.', price: 80, stats: { compute: 2, vram: 2 }, unlockRank: 1 },
        { id: 'gpu_gtx1650', name: 'GTX 1650', description: 'Entry level cuda.', price: 180, stats: { compute: 5, vram: 4 }, unlockRank: 2 },
        { id: 'gpu_rtx3060', name: 'RTX 3060', description: 'The people\'s champion.', price: 350, stats: { compute: 12, vram: 12 }, unlockRank: 3 },
        { id: 'gpu_rtx4070', name: 'RTX 4070', description: 'Serious ML training.', price: 600, stats: { compute: 25, vram: 12 }, unlockRank: 4 },
        { id: 'gpu_rtx4090', name: 'RTX 4090', description: 'Melts power cables.', price: 1600, stats: { compute: 60, vram: 24 }, unlockRank: 5 },
        { id: 'gpu_a4000', name: 'RTX A4000', description: 'Professional stable.', price: 1200, stats: { compute: 45, vram: 16 }, unlockRank: 6 },
        { id: 'gpu_a6000', name: 'RTX A6000', description: 'VRAM monster.', price: 4500, stats: { compute: 100, vram: 48 }, unlockRank: 7 },
        { id: 'gpu_h100', name: 'H100 Tensor Core', description: 'Banned for export.', price: 30000, stats: { compute: 400, vram: 80 }, unlockRank: 8 },
        { id: 'gpu_pod', name: 'H100 NVL Pod', description: 'Training LLMs daily.', price: 100000, stats: { compute: 2000, vram: 500 }, unlockRank: 10 }
    ],
    [HARDWARE_TYPES.RAM]: [
        { id: 'ram_4gb', name: '4GB Stick', description: 'Bare minimum.', price: 0, stats: { productivity: 0.8 }, unlockRank: 0 },
        { id: 'ram_8gb', name: '8GB DDR4', description: 'Standard office use.', price: 40, stats: { productivity: 1.0 }, unlockRank: 1 },
        { id: 'ram_16gb', name: '16GB DDR4', description: 'Gaming standard.', price: 80, stats: { productivity: 1.2 }, unlockRank: 2 },
        { id: 'ram_32gb', name: '32GB DDR4', description: 'Dev comfort zone.', price: 150, stats: { productivity: 1.4 }, unlockRank: 2 },
        { id: 'ram_64gb', name: '64GB DDR5', description: 'Virtual machines galore.', price: 300, stats: { productivity: 1.7, compute: 2 }, unlockRank: 3 },
        { id: 'ram_128gb', name: '128GB DDR5', description: 'Never close a tab.', price: 600, stats: { productivity: 2.0, compute: 5 }, unlockRank: 5 },
        { id: 'ram_256gb_ecc', name: '256GB ECC', description: 'Error correcting server memory.', price: 1500, stats: { productivity: 2.2, reliability: 1.5 }, unlockRank: 7 },
        { id: 'ram_1tb', name: '1TB LR-DIMM', description: 'In-memory database ready.', price: 5000, stats: { productivity: 3.0, compute: 20 }, unlockRank: 9 }
    ],
    [HARDWARE_TYPES.STORAGE]: [
        { id: 'hdd_500gb', name: '500GB HDD', description: 'Spinning rust. Slow.', price: 0, stats: { productivity: 0.9, noise: 5 }, unlockRank: 0 },
        { id: 'ssd_sata_500', name: '500GB SATA SSD', description: 'Silence is golden.', price: 50, stats: { productivity: 1.1, noise: 0 }, unlockRank: 1 },
        { id: 'ssd_nvme_1tb', name: '1TB NVMe Gen3', description: 'Fast boot times.', price: 100, stats: { productivity: 1.3 }, unlockRank: 2 },
        { id: 'ssd_nvme_2tb_gen4', name: '2TB NVMe Gen4', description: 'Blinking fast IO.', price: 200, stats: { productivity: 1.5, compute: 2 }, unlockRank: 3 },
        { id: 'ssd_nvme_4tb_gen5', name: '4TB NVMe Gen5', description: 'Hot but instant.', price: 500, stats: { productivity: 1.8, compute: 5 }, unlockRank: 5 },
        { id: 'raid_array', name: '20TB RAID 10', description: 'Redundancy implies reliability.', price: 1200, stats: { productivity: 1.6, reliability: 2.0 }, unlockRank: 6 },
        { id: 'ssd_optane', name: 'Optane Drive', description: 'Low latency king.', price: 2000, stats: { productivity: 2.5, compute: 10 }, unlockRank: 8 }
    ],
    [HARDWARE_TYPES.COOLING]: [
        { id: 'stock_cooler', name: 'Stock Cooler', description: 'Loud but free.', price: 0, stats: { noise: 10, cooling: 1, reliability: 0.8 }, unlockRank: 0 },
        { id: 'silent_fan_120', name: 'Silent Fan (120mm)', description: 'Quiet airflow.', price: 50, stats: { noise: 5, cooling: 2, reliability: 0.9 }, unlockRank: 1 },
        { id: 'air_tower', name: 'Tower Cooler', description: 'Efficient heat pipes.', price: 80, stats: { noise: 6, cooling: 4, reliability: 0.95 }, unlockRank: 2 },
        { id: 'rgb_fan_pack', name: 'RGB Fan Pack', description: 'More FPS due to lights.', price: 150, stats: { noise: 6, cooling: 3, style: 5 }, unlockRank: 2 },
        { id: 'aio_240', name: 'AIO 240mm', description: 'Water cooling entry.', price: 180, stats: { noise: 4, cooling: 6, style: 2 }, unlockRank: 3 },
        { id: 'aio_360', name: 'AIO 360mm', description: 'Serious cooling.', price: 250, stats: { noise: 4, cooling: 8, style: 3 }, unlockRank: 4 },
        { id: 'custom_loop_soft', name: 'Soft Tube Loop', description: 'Custom cooling loop.', price: 600, stats: { noise: 2, cooling: 12, style: 10 }, unlockRank: 6 },
        { id: 'custom_loop_hard', name: 'Hardline Loop', description: 'Art of cooling.', price: 1200, stats: { noise: 1, cooling: 15, style: 20 }, unlockRank: 7 },
        { id: 'phase_change', name: 'Phase Change Cooler', description: 'Sub-zero cooling.', price: 2500, stats: { noise: 20, cooling: 25, compute: 10 }, unlockRank: 9 }
    ],
    [HARDWARE_TYPES.CASE]: [
        { id: 'beige_box', name: 'Beige Office Box', description: 'Nostalgic.', price: 0, stats: { aesthetics: 0, noise_dampening: 2 }, unlockRank: 0 },
        { id: 'black_tower', name: 'Black Mid-Tower', description: 'Standard.', price: 80, stats: { aesthetics: 3, airflow: 3 }, unlockRank: 1 },
        { id: 'white_tower', name: 'White Mesh Case', description: 'Clean look.', price: 120, stats: { aesthetics: 5, airflow: 5 }, unlockRank: 2 },
        { id: 'glass_case', name: 'Tempered Glass', description: 'Show off parts.', price: 200, stats: { aesthetics: 8, noise_dampening: 1 }, unlockRank: 3 },
        { id: 'quiet_case', name: 'Sound Proof Case', description: 'Padded walls.', price: 250, stats: { aesthetics: 4, noise_dampening: 10 }, unlockRank: 3 },
        { id: 'open_bench', name: 'Test Bench', description: 'Max airflow.', price: 350, stats: { aesthetics: 7, airflow: 10, noise_dampening: 0 }, unlockRank: 5 },
        { id: 'dual_chamber', name: 'Dual Chamber', description: 'Cable management joy.', price: 500, stats: { aesthetics: 10, airflow: 6 }, unlockRank: 6 },
        { id: 'desk_case', name: 'Desk PC Case', description: 'The PC is the desk.', price: 2000, stats: { aesthetics: 20, airflow: 8 }, unlockRank: 9 }
    ],
    [HARDWARE_TYPES.MONITOR]: [
        { id: 'crt_monitor', name: '17" CRT', description: 'Heavy.', price: 0, stats: { resolution: 1, refresh_rate: 60 }, unlockRank: 0 },
        { id: 'lcd_24', name: '24" 1080p', description: 'Standard.', price: 150, stats: { resolution: 2, refresh_rate: 60 }, unlockRank: 1 },
        { id: 'lcd_27_144', name: '27" 144Hz', description: 'Smooth scrolling.', price: 300, stats: { resolution: 2, refresh_rate: 144, productivity: 1.2 }, unlockRank: 2 },
        { id: 'dual_24', name: 'Dual 24" Monitors', description: 'Multitasking.', price: 350, stats: { resolution: 4, productivity: 1.5 }, unlockRank: 3 },
        { id: 'ultrawide_34', name: '34" Ultrawide', description: 'No bezels.', price: 600, stats: { resolution: 6, productivity: 1.8 }, unlockRank: 4 },
        { id: '4k_32', name: '32" 4K IPS', description: 'Crisp text.', price: 800, stats: { resolution: 8, productivity: 1.6 }, unlockRank: 5 },
        { id: 'dual_4k', name: 'Dual 4K', description: 'Pixel paradise.', price: 1600, stats: { resolution: 16, productivity: 2.2 }, unlockRank: 7 },
        { id: 'odyssey_ark', name: '55" Curved Ark', description: 'Cockpit view.', price: 3000, stats: { resolution: 12, productivity: 2.5, aesthetics: 10 }, unlockRank: 9 }
    ]
};

/**
 * Hardware Manager Class
 * Manages player's hardware parts and stats
 */
export class HardwareManager {
    constructor(gameState) {
        this.gameState = gameState;
        this.ownedParts = {
            [HARDWARE_TYPES.COOLING]: ['stock_cooler'],
            [HARDWARE_TYPES.CASE]: ['beige_box'],
            [HARDWARE_TYPES.MONITOR]: ['crt_monitor'],
            [HARDWARE_TYPES.GPU]: ['gpu_integrated'],
            [HARDWARE_TYPES.CPU]: ['cpu_generic'],
            [HARDWARE_TYPES.RAM]: ['ram_4gb'],
            [HARDWARE_TYPES.STORAGE]: ['hdd_500gb']
        };
        this.equippedParts = {
            [HARDWARE_TYPES.COOLING]: 'stock_cooler',
            [HARDWARE_TYPES.CASE]: 'beige_box',
            [HARDWARE_TYPES.MONITOR]: 'crt_monitor',
            [HARDWARE_TYPES.GPU]: 'gpu_integrated',
            [HARDWARE_TYPES.CPU]: 'cpu_generic',
            [HARDWARE_TYPES.RAM]: 'ram_4gb',
            [HARDWARE_TYPES.STORAGE]: 'hdd_500gb'
        };
    }

    /**
     * Get total stats from equipped hardware
     */
    getTotalStats() {
        let stats = {
            cooling: 0,
            noise: 0,
            aesthetics: 0,
            compute: 0,
            productivity: 1.0,
            reliability: 1.0
        };

        for (const [type, partId] of Object.entries(this.equippedParts)) {
            const part = HARDWARE_PARTS[type].find(p => p.id === partId);
            if (part && part.stats) {
                if (part.stats.cooling) stats.cooling += part.stats.cooling;
                if (part.stats.noise) stats.noise += part.stats.noise;
                if (part.stats.style) stats.aesthetics += part.stats.style;
                if (part.stats.compute) stats.compute += part.stats.compute;
                if (part.stats.productivity) stats.productivity = Math.max(stats.productivity, part.stats.productivity); // Max, not add
            }
        }
        return stats;
    }

    buyPart(type, partId) {
        if (this.ownedParts[type].includes(partId)) return { success: false, message: "Already owned" };

        const part = HARDWARE_PARTS[type].find(p => p.id === partId);
        if (!part) return { success: false, message: "Part not found" };

        const currentRank = this.gameState.currentRank?.level ?? 0;
        if (part.unlockRank > currentRank) return { success: false, message: `Requires rank ${part.unlockRank}` };

        if (this.gameState.money < part.price) return { success: false, message: "Not enough money" };

        this.gameState.money -= part.price;
        this.ownedParts[type].push(partId);
        this.equippedParts[type] = partId; // Auto-equip

        return { success: true, message: `Purchased ${part.name}!` };
    }

    equipPart(type, partId) {
        if (!this.ownedParts[type].includes(partId)) return { success: false, message: "Part not owned" };
        this.equippedParts[type] = partId;
        return { success: true, message: "Equipped" };
    }

    toJSON() {
        return {
            ownedParts: this.ownedParts,
            equippedParts: this.equippedParts
        };
    }

    fromJSON(data) {
        if (!data) return;
        this.ownedParts = data.ownedParts || this.ownedParts;
        this.equippedParts = data.equippedParts || this.equippedParts;
    }
}
