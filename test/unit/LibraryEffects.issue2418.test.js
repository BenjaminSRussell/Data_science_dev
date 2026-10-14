/**
 * Learned libraries change scraping, cleaning, contracts, training, and creativity (#2418)
 */
import { describe, it, expect } from 'vitest';
import { ProjectSystem } from '../../src/js/game/ProjectSystem.js';
import { AISystem } from '../../src/js/game/AISystem.js';
import { ContractSystem, CONTRACT_CATEGORIES } from '../../src/js/game/contracts/ContractSystem.js';
import { cleaningBugChance, TRAINING_EFFECTIVENESS } from '../../src/js/game/LibraryEffects.js';

function state(libs = [], withAi = false) {
    const gameState = {
        money: 0,
        reputation: 0,
        unlockedLibraries: [...libs],
        characterStats: { stats: { luck: 0 }, getStat: () => 0, addExperience: () => {}, modifyEthics: () => {} }
    };
    if (withAi) gameState.aiSystem = new AISystem(gameState);
    return gameState;
}

describe('library effects (#2418)', () => {
    it('does nothing to work until the library is learned', () => {
        const gs = state();
        const ps = new ProjectSystem(gs);
        expect(ps.availableContracts.map(c => c.id)).not.toContain('dynamic_storefront_scraper');
        expect(ps.availableContracts.map(c => c.id)).not.toContain('basic_regression_contract');
        expect(ps.availableContracts.map(c => c.id)).toContain('static_catalog_scraper');

        ps.startProject('static_catalog_scraper');
        ps.workOnProject(10);
        expect(ps.activeProject.stageProgress).toBe(10);

        ps.activeProject = {
            stages: [{ type: 'cleaning', name: 'Clean', maxProgress: 100 }],
            currentStageIndex: 0,
            stageProgress: 0,
            totalProgress: 0
        };
        ps.workOnProject(10, () => 0);
        // No RegEx: a 0 roll is a bug and wastes half the tick
        expect(cleaningBugChance(gs)).toBe(0.2);
        expect(ps.activeProject.stageProgress).toBe(5);
        expect(ps.activeProject.cleaningBugs).toBe(1);
    });

    it('BeautifulSoup speeds static scrapes and not dynamic ones', () => {
        const gs = state(['lib_soup']);
        const ps = new ProjectSystem(gs);
        ps.startProject('static_catalog_scraper');
        ps.workOnProject(10);
        expect(ps.activeProject.stageProgress).toBeCloseTo(11, 5);

        ps.activeProject = {
            stages: [{ type: 'scraping', site: 'dynamic', name: 'Dyn', maxProgress: 100 }],
            currentStageIndex: 0,
            stageProgress: 0,
            totalProgress: 0
        };
        ps.workOnProject(10);
        expect(ps.activeProject.stageProgress).toBe(10);
    });

    it('Pandas speeds cleaning and RegEx halves the bug chance', () => {
        const gs = state(['lib_pandas', 'lib_regex']);
        const ps = new ProjectSystem(gs);
        ps.activeProject = {
            stages: [{ type: 'cleaning', name: 'Clean', maxProgress: 100 }],
            currentStageIndex: 0,
            stageProgress: 0,
            totalProgress: 0
        };
        expect(cleaningBugChance(gs)).toBeCloseTo(0.1, 5);
        // Roll above the reduced chance: no bug, full pandas multiplier
        ps.workOnProject(10, () => 0.5);
        expect(ps.activeProject.stageProgress).toBeCloseTo(12, 5);
        expect(ps.activeProject.cleaningBugs).toBeUndefined();

        ps.activeProject.stageProgress = 0;
        ps.workOnProject(10, () => 0);
        expect(ps.activeProject.stageProgress).toBeCloseTo(6, 5);
        expect(ps.activeProject.cleaningBugs).toBe(1);
    });

    it('Selenium and Scikit-Learn unlock their contracts', () => {
        const locked = new ProjectSystem(state());
        expect(locked.startProject('dynamic_storefront_scraper').success).toBe(false);
        expect(locked.startProject('basic_classification_contract').success).toBe(false);

        const gs = state(['lib_selenium', 'lib_sklearn']);
        const ps = new ProjectSystem(gs);
        const ids = ps.availableContracts.map(c => c.id);
        expect(ids).toContain('dynamic_storefront_scraper');
        expect(ids).toContain('basic_regression_contract');
        expect(ids).toContain('basic_classification_contract');
        expect(ps.startProject('basic_regression_contract').success).toBe(true);
    });

    it('TensorFlow multiplies training XP and PyTorch adds creativity', () => {
        const plain = new AISystem(state());
        expect(plain.train(5).xpGained).toBe(50);
        expect(plain.getEffectiveCreativity()).toBe(1);

        const gs = state(['lib_tensorflow', 'lib_pytorch'], true);
        expect(gs.aiSystem.train(5).xpGained).toBe(Math.floor(50 * TRAINING_EFFECTIVENESS));
        expect(gs.aiSystem.creativity).toBe(1);
        expect(gs.aiSystem.getEffectiveCreativity()).toBe(3);

        const ps = new ProjectSystem(gs);
        ps.startProject('data_toy_prototype');
        ps.workOnProject(10);
        // 10 work + processingPower 1.5 + effective creativity 3
        expect(ps.activeProject.stageProgress).toBeCloseTo(14.5, 5);
    });

    it('ContractSystem categories stay hidden until the library is learned', () => {
        expect(CONTRACT_CATEGORIES.DYNAMIC_SCRAPER.requiresLibrary).toBe('lib_selenium');
        expect(CONTRACT_CATEGORIES.BASIC_ML.requiresLibrary).toBe('lib_sklearn');

        const closed = new ContractSystem({ reputation: 1000, money: 0, unlockedLibraries: [] });
        expect(closed.availableContracts.some(c => c.category === 'DYNAMIC_SCRAPER')).toBe(false);
        expect(closed.availableContracts.some(c => c.category === 'BASIC_ML')).toBe(false);

        const open = new ContractSystem({
            reputation: 0,
            money: 0,
            unlockedLibraries: ['lib_selenium', 'lib_sklearn']
        });
        const titles = open.availableContracts.map(c => c.title);
        expect(titles).toContain('Dynamic Scraper: JS Storefront');
        expect(titles).toContain('Basic Regression');
        expect(titles).toContain('Basic Classification');

        const cleaning = new ContractSystem({
            reputation: 50,
            money: 0,
            unlockedLibraries: ['lib_pandas'],
            characterStats: { getStat: () => 100 }
        });
        const offer = cleaning.availableContracts.find(c => c.category === 'DATA_CLEANING');
        expect(offer).toBeTruthy();
        cleaning.gameState.reputation = 50;
        expect(cleaning.acceptContract(offer.id).success).toBe(true);
        const worked = cleaning.workOnContract(offer.id, 1);
        expect(worked.status).toBe('working');
        // Pandas: 1 * 1.2, still short of the contract's timeRequired
        expect(cleaning.activeContracts[0].progress).toBeCloseTo(1.2, 5);
    });
});
