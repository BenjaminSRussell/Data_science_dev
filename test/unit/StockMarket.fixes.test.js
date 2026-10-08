import { describe, it, expect, vi, beforeEach } from 'vitest';
import { StockMarket, Portfolio } from '../../src/js/game/StockMarket.js';
import { LegalSystem, LICENSES } from '../../src/js/game/LegalSystem.js';
import { CrimeSystem } from '../../src/js/game/CrimeSystem.js';
import { QuotronTicker } from '../../src/js/game/QuotronTicker.js';
import { handleArrest, handleBribeGuard } from '../../src/js/helpers/StockMarketHelpers.js';

function makeState(extra = {}) {
    const gs = { money: 100000, reputation: 50, characterStats: { ethics: 0 }, ...extra };
    gs.legalSystem = new LegalSystem(gs);
    return gs;
}

describe('StockMarket trading', () => {
    let gs, sm;
    beforeEach(() => { gs = makeState(); sm = new StockMarket(gs); });

    it('rejects zero/negative/fractional quantities (#895, #1354)', () => {
        gs.legalSystem.licenses.series_7 = true;
        expect(sm.buyStock('ggl', -5).success).toBe(false);
        expect(sm.buyStock('ggl', 0).success).toBe(false);
        expect(sm.buyStock('ggl', 1.5).success).toBe(false);
        sm.buyStock('ggl', 2);
        expect(sm.sellStock('ggl', -3).success).toBe(false);
        expect(gs.money).toBeCloseTo(100000 - 2 * sm.getStock('ggl').price);
    });

    it('Series 63 permits selling as well as buying (#1214, #2364)', () => {
        gs.legalSystem.licenses.series_63 = true;
        expect(sm.buyStock('ggl', 3).success).toBe(true);
        expect(sm.sellStock('ggl', 3).success).toBe(true);
    });

    it('unlicensed low-ethics trading adds heat (#1714)', () => {
        gs.characterStats.ethics = -50;
        gs.crimeSystem = { addHeat: vi.fn() };
        const r = sm.buyStock('ggl', 1);
        expect(r.success && r.unlicensed).toBe(true);
        expect(gs.crimeSystem.addHeat).toHaveBeenCalledWith(StockMarket.UNLICENSED_TRADE_HEAT);
    });

    it('selling reduces totalInvested by cost basis (#899, #2365)', () => {
        const p = new Portfolio();
        p.buy('a', 10, 10);
        p.sell('a', 5, 20);
        expect(p.totalInvested).toBeCloseTo(50);
        p.sell('a', 5, 20);
        expect(p.totalInvested).toBeCloseTo(0);
    });

    it('ignores inactive world events (#896)', () => {
        const before = { ...sm.marketTrends };
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        sm.update([], [{ type: 'market_crash', active: false }]);
        vi.restoreAllMocks();
        Object.keys(before).forEach(m => expect(sm.marketTrends[m]).toBeGreaterThan(-0.01));
    });

    it('crash()/boost() exist and move prices (#1213, #2411)', () => {
        const p0 = sm.getStock('ggl').price;
        sm.crash(30);
        expect(sm.getStock('ggl').price).toBeCloseTo(p0 * 0.7);
        sm.boost(10);
        expect(sm.getStock('ggl').price).toBeCloseTo(p0 * 0.7 * 1.1);
    });

    it('manipulateStock records the change (#106, #2046)', () => {
        const s = sm.getStock('ggl');
        const p0 = s.price;
        sm.manipulateStock('ggl', 'pump', 1.5);
        expect(s.lastChangePct).toBeCloseTo(0.5);
        expect(s.lastChange).toBeCloseTo(p0 * 0.5);
        sm.manipulateStock('bnk', 'crash', -2);
        expect(sm.getStock('bnk').price).toBeGreaterThanOrEqual(0.01);
    });

    it('correlations use the previous tick regardless of order (#1217)', () => {
        sm.stocks.forEach(s => { s.lastChangePct = 0.01; });
        vi.spyOn(Math, 'random').mockReturnValue(0.5);
        sm.update([], []);
        vi.restoreAllMocks();
        sm.stocks.forEach(s => expect(s.prevChangePct).toBe(0.01));
    });

    it('US indices no longer move identically (#2048)', () => {
        sm.stocks.forEach(s => { s.lastChangePct = s.sector === 'Tech' ? 0.05 : -0.02; });
        const d0 = sm.indices.DOW.value, n0 = sm.indices.NASDAQ.value;
        sm.updateIndices();
        expect(sm.indices.DOW.value / d0).not.toBeCloseTo(sm.indices.NASDAQ.value / n0, 4);
    });

    it('saves volume, correlations and cost basis (#1215, #1218)', () => {
        gs.legalSystem.licenses.series_7 = true;
        sm.buyStock('ggl', 4);
        sm.getStock('ggl').volume = 12345;
        const corr = { ...sm.getStock('ggl').correlation };
        const sm2 = new StockMarket(gs);
        sm2.fromJSON(JSON.parse(JSON.stringify(sm.toJSON())));
        expect(sm2.getStock('ggl').volume).toBe(12345);
        expect(sm2.getStock('ggl').correlation).toEqual(corr);
        expect(sm2.portfolio.costBasis.ggl).toBeCloseTo(sm.portfolio.costBasis.ggl);
    });
});

describe('LegalSystem', () => {
    it('licenses can actually be bought (catalog exists)', () => {
        const gs = makeState();
        const r = gs.legalSystem.acquireLicense('series_63');
        expect(r.success).toBe(true);
        expect(gs.money).toBe(100000 - LICENSES.find(l => l.id === 'series_63').cost);
    });

    it('addLegalIssue exists (#1173, #2074)', () => {
        const gs = makeState();
        gs.crimeSystem = { addHeat: vi.fn() };
        gs.legalSystem.addLegalIssue({ type: 'data_violation', severity: 20 });
        expect(gs.legalSystem.legalIssues).toHaveLength(1);
        expect(gs.legalSystem.legalTrouble).toBe(20);
        expect(gs.crimeSystem.addHeat).toHaveBeenCalled();
    });

    it('fromJSON merges and accepts the legacy shape (#1539)', () => {
        const gs = makeState();
        gs.legalSystem.licenses.llc_registration = true;
        gs.legalSystem.fromJSON({ licenses: { series_7: { acquired: true }, drivers_license: { acquired: false } } });
        expect(gs.legalSystem.hasLicense('series_7')).toBe(true);
        expect(gs.legalSystem.hasLicense('llc_registration')).toBe(true);
        expect(gs.legalSystem.hasLicense('drivers_license')).toBe(false);
    });
});

describe('Crime / jail helpers', () => {
    it('pump & dump reports paper profit on held shares (#904)', () => {
        const gs = makeState();
        gs.stockMarket = new StockMarket(gs);
        gs.legalSystem.licenses.series_7 = true;
        gs.stockMarket.buyStock('ggl', 10);
        const cs = Object.create(CrimeSystem.prototype);
        cs.gameState = gs;
        const p0 = gs.stockMarket.getStock('ggl').price;
        const profit = cs.manipulateAndMeasure('ggl', 'pump', 1.5);
        expect(profit).toBeCloseTo(p0 * 0.5 * 10, 1);
    });

    function makeGame(money) {
        document.body.innerHTML = '<span id="jail-time-left"></span>';
        return {
            gameState: { money, reputation: 100, jailSentence: 0, legalSystem: null },
            screenManager: { showScreen: vi.fn() },
            uiUpdater: { updateHeatMeter: vi.fn(), updateAllUI: vi.fn() },
            showToast: vi.fn(), audioManager: { play: vi.fn() },
            characterStats: { modifyEthics: vi.fn() }
        };
    }

    it('arrest fine is capped at available money, uses reason, refreshes UI (#1277, #1521, #1280)', () => {
        const g = makeGame(200);
        handleArrest(g, 'Caught insider trading.');
        expect(g.gameState.money).toBe(0);
        expect(g.showToast.mock.calls[0][0]).toContain('Caught insider trading.');
        expect(g.uiUpdater.updateAllUI).toHaveBeenCalled();
    });

    it('bribing when not in jail is a no-op (#2232)', () => {
        const g = makeGame(10000);
        handleBribeGuard(g);
        expect(g.gameState.money).toBe(10000);
        expect(g.gameState.jailSentence).toBe(0);
    });
});

describe('QuotronTicker', () => {
    it('is inert without a container (#108)', () => {
        document.body.innerHTML = '';
        const t = new QuotronTicker('missing', null);
        expect(() => { t.update(); t.start(); t.animate(); t.refresh(); }).not.toThrow();
    });

    it('can switch markets and stops when its screen is hidden (#898, #2463)', () => {
        document.body.innerHTML = '<div class="screen" id="s"><div id="qt"></div></div>';
        const sm1 = new StockMarket(makeState());
        const sm2 = new StockMarket(makeState());
        const t = new QuotronTicker('qt', sm1);
        t.setStockMarket(sm2);
        expect(t.stockMarket).toBe(sm2);
        t.isRunning = true;
        t.animate();
        expect(t.isRunning).toBe(false);
    });
});
