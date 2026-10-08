import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { PerformanceManager } from '../../src/js/performance/PerformanceManager.js';
import { RomanceProgressionSystem, PARTNER_BIASES } from '../../src/js/game/romance/RomanceProgressionSystem.js';
import { NPCs } from '../../src/js/game/NPCManager.js';

function withRenderer(renderer, { cores = 4, memory = 4 } = {}) {
    const gl = renderer === null ? null : {
        getExtension: () => (renderer === undefined ? null : { UNMASKED_RENDERER_WEBGL: 1 }),
        getParameter: () => renderer
    };
    vi.spyOn(HTMLCanvasElement.prototype, 'getContext').mockReturnValue(gl);
    vi.spyOn(navigator, 'hardwareConcurrency', 'get').mockReturnValue(cores);
    Object.defineProperty(navigator, 'deviceMemory', { value: memory, configurable: true });
}

describe('PerformanceManager hardware tiers (#1448, #2091, #1444)', () => {
    afterEach(() => vi.restoreAllMocks());

    it('rates Apple Silicon high and mobile GPUs medium', () => {
        expect(PerformanceManager.classifyRenderer('Apple M2 Pro')).toBe('high');
        expect(PerformanceManager.classifyRenderer('Apple GPU')).toBe('high');
        expect(PerformanceManager.classifyRenderer('Adreno (TM) 740')).toBe('medium');
        expect(PerformanceManager.classifyRenderer('Mali-G78')).toBe('medium');
        expect(PerformanceManager.classifyRenderer('NVIDIA GeForce RTX 3060')).toBe('high');
        expect(PerformanceManager.classifyRenderer('Intel(R) UHD Graphics 620')).toBe('medium');
        expect(PerformanceManager.classifyRenderer('llvmpipe')).toBe('low');
    });

    it('8GB of RAM lifts a weak GPU one step, not straight to high', () => {
        withRenderer('llvmpipe', { cores: 4, memory: 8 });
        const pm = new PerformanceManager();
        expect(pm.detectHardware()).toBe('medium');
        expect(PerformanceManager.combineTier('low', 16, 32)).toBe('medium');
        expect(PerformanceManager.combineTier('medium', 8, 8)).toBe('high');
        expect(PerformanceManager.combineTier('high', 2, 2)).toBe('medium');
    });

    it('Apple Silicon machines start on high', () => {
        withRenderer('Apple M1', { cores: 8, memory: 8 });
        const pm = new PerformanceManager();
        pm.detectHardware();
        expect(pm.hardwareTier).toBe('high');
        expect(pm.level).toBe('high');
    });
});

describe('PerformanceManager auto mode (#2090, #60, #1443, #1445, #1446, #1447)', () => {
    let pm;
    beforeEach(() => {
        pm = new PerformanceManager();
    });
    afterEach(() => {
        pm.destroy();
        vi.restoreAllMocks();
    });

    it('detectHardware picks a level but stays in auto mode', () => {
        withRenderer('NVIDIA GeForce', { cores: 8, memory: 16 });
        pm.detectHardware();
        expect(pm.quality).toBe('auto');
        expect(pm.level).toBe('high');
    });

    it('auto mode keeps adjusting after the first change, both ways', () => {
        pm.applyLevel('high');
        for (let i = 0; i < 5; i++) pm.recordSample(20);
        expect(pm.level).toBe('low');
        expect(pm.quality).toBe('auto');
        pm.fpsHistory = [];
        for (let i = 0; i < 5; i++) pm.recordSample(60);
        expect(pm.level).toBe('medium');
    });

    it('a fixed setting is never overridden, but the player gets a warning at most once a minute', () => {
        pm.setQuality('ultra');
        const warn = vi.fn();
        window.addEventListener('performanceWarning', warn);
        pm.recordSample(15, 66, 100000);
        pm.recordSample(15, 66, 130000);
        pm.recordSample(15, 66, 161000);
        window.removeEventListener('performanceWarning', warn);
        expect(pm.level).toBe('ultra');
        expect(pm.quality).toBe('ultra');
        expect(warn).toHaveBeenCalledTimes(2);
        expect(warn.mock.calls[0][0].detail.level).toBe('critical');
    });

    it('low quality tags the document so CSS drops animations', () => {
        pm.setQuality('low');
        expect(document.documentElement.dataset.quality).toBe('low');
        expect(document.documentElement.classList.contains('quality-no-animations')).toBe(true);
        pm.setQuality('high');
        expect(document.documentElement.classList.contains('quality-no-animations')).toBe(false);
    });

    it('setQuality("auto") returns to the detected tier', () => {
        pm.hardwareTier = 'medium';
        pm.setQuality('low');
        pm.setQuality('auto');
        expect(pm.quality).toBe('auto');
        expect(pm.level).toBe('medium');
    });

    it('monitoring pauses while the tab is hidden and resumes after', () => {
        vi.stubGlobal('requestAnimationFrame', () => 0);
        pm.startMonitoring();
        const hidden = vi.spyOn(document, 'hidden', 'get');
        hidden.mockReturnValue(true);
        document.dispatchEvent(new Event('visibilitychange'));
        expect(pm.monitoring).toBe(false);
        hidden.mockReturnValue(false);
        document.dispatchEvent(new Event('visibilitychange'));
        expect(pm.monitoring).toBe(true);
        vi.unstubAllGlobals();
    });
});

describe('Graphics quality setting in the settings modal (#1449, #1446)', () => {
    it('showSettings offers a quality select that drives setQuality', async () => {
        globalThis.__DSD_NO_AUTOBOOT__ = true;
        const { MainGame } = await import('../../src/js/main.js');
        document.body.innerHTML = '<div id="modal-root"></div>';
        const pm = new PerformanceManager();
        pm.hardwareTier = 'high';
        pm.applyLevel('high');
        const fake = {
            gameState: { performanceManager: pm },
            audioManager: { soundEnabled: true, musicEnabled: true, musicVolume: 0.5, soundVolume: 0.5 },
            showModal(html) { document.getElementById('modal-root').innerHTML = html; },
            describeQualitySetting: MainGame.prototype.describeQualitySetting,
            updateQualitySetting: MainGame.prototype.updateQualitySetting
        };
        MainGame.prototype.showSettings.call(fake);
        const select = document.getElementById('settings-quality');
        expect(select.value).toBe('auto');
        expect(document.getElementById('settings-quality-current').textContent).toBe('Auto (currently high)');
        select.value = 'low';
        select.dispatchEvent(new Event('change'));
        expect(pm.quality).toBe('low');
        expect(document.getElementById('settings-quality-current').textContent).toBe('Low');
    });
});

describe('RomanceProgressionSystem (#2062, #2060, #2059, #1414, #1417, #2058, #1413, #125, #124, #123, #277)', () => {
    const npc = (id) => NPCs.find(n => n.id === id);
    function make() {
        return new RomanceProgressionSystem({
            npcManager: { getNPC: npc },
            economySystem: { money: 1000 },
            currentTask: { id: 't1', title: 'Software dashboard', category: 'software', difficulty: 8 },
            taskSystem: { availableTasks: [{ id: 't2', title: 'Easy chart', difficulty: 1 }] }
        });
    }

    it('real romance partners get varied biases', () => {
        const rps = make();
        expect(rps.determineBias(npc('bella_lux'))).toBe('ambitious');
        expect(rps.determineBias(npc('maya_engineer'))).toBe('practical');
        expect(rps.determineBias(npc('noah_artist'))).toBe('creative');
        expect(rps.determineBias(npc('emma_bloom'))).toBe('ethical');
        expect(rps.determineBias({ personality: 'grumpy' })).toBe('cautious');
        expect(rps.describeBias('creative')).toBe(PARTNER_BIASES.creative);
        expect(rps.calculatePartnerIncome(npc('bella_lux'))).not.toBe(rps.calculatePartnerIncome(npc('emma_bloom')));
    });

    it('switching partners resets points, so no instant proposal (#2062)', () => {
        const rps = make();
        rps.startDating('emma_bloom');
        rps.increaseRelationship(150);
        rps.startDating('bella_lux');
        expect(rps.relationshipPoints).toBe(0);
        expect(rps.propose().success).toBe(false);
    });

    it('marriage and engagement are protected from startDating (#1417)', () => {
        const rps = make();
        rps.startDating('emma_bloom');
        rps.increaseRelationship(100);
        expect(rps.propose().success).toBe(true);
        expect(rps.startDating('bella_lux').success).toBe(false);
        rps.getMarried();
        const res = rps.startDating('bella_lux');
        expect(res.success).toBe(false);
        expect(res.message).toMatch(/married/);
        expect(rps.romancePartner.id).toBe('emma_bloom');
        expect(rps.relationshipStage).toBe('married');
    });

    it('partner stage/points stay in sync and milestones are reported (#2060, #2059, #1414)', () => {
        const rps = make();
        rps.startDating('maya_engineer');
        const half = rps.increaseRelationship(60);
        expect(half.canPropose).toBe(false);
        expect(rps.romancePartner.relationshipPoints).toBe(60);
        const full = rps.increaseRelationship(40);
        expect(full.canPropose).toBe(true);
        expect(full.proposeUnlocked).toBe(true);
        expect(rps.increaseRelationship(1).proposeUnlocked).toBe(false);
        rps.propose();
        expect(rps.romancePartner.stage).toBe('engaged');
        rps.getMarried();
        expect(rps.romancePartner.stage).toBe('married');
    });

    it('a crush can unlock dating', () => {
        const rps = make();
        expect(rps.increaseRelationship(50).canStartDating).toBe(true);
    });

    it('advice names the recommended option (#124)', () => {
        const rps = make();
        rps.startDating('noah_artist');
        const advice = rps.getAdviceForChoice('c1', [
            { id: 'a', text: 'Play it safe', safe: true },
            { id: 'b', text: 'Try a bold redesign', creative: true }
        ]);
        expect(advice.bias).toBe('creative');
        expect(advice.recommendation.id).toBe('b');
        expect(advice.message).toContain('"Try a bold redesign"');
        expect(make().getAdviceForChoice('c', [{ id: 'x' }])).toBeNull();
    });

    it('workTogether depends on the project (#125)', () => {
        const rps = make();
        rps.startDating('maya_engineer');
        const hard = rps.workTogether('t1');
        const easy = rps.workTogether('t2');
        expect(hard.success && easy.success).toBe(true);
        expect(hard.bonus).toBeGreaterThan(easy.bonus);
        expect(hard.bonus).toBe(1.75); // 1.25 + 8*0.05 + 0.1 software match
        expect(easy.bonus).toBe(1.3);
        expect(rps.workTogether('nope').success).toBe(false);
    });
});
