/**
 * LibraryEffects.js
 * Mechanical bonuses for libraries the player has learned (#2418).
 * GameState.unlockedLibraries is the source of truth; nothing here is saved
 * separately, so loading a save cannot stack a bonus twice.
 */

export const LIBRARY_IDS = {
    SOUP: 'lib_soup',
    SELENIUM: 'lib_selenium',
    PANDAS: 'lib_pandas',
    REGEX: 'lib_regex',
    SKLEARN: 'lib_sklearn',
    TENSORFLOW: 'lib_tensorflow',
    PYTORCH: 'lib_pytorch'
};

/** BeautifulSoup: scraping speed on static sites */
export const STATIC_SCRAPE_SPEED = 1.1;
/** Pandas: data-cleaning work multiplier */
export const CLEANING_EFFICIENCY = 1.2;
/** Chance a cleaning tick hits a bug before RegEx */
export const CLEANING_BUG_CHANCE = 0.2;
/** RegEx: that chance is cut in half. A bug wastes half the tick. */
export const CLEANING_BUG_FACTOR = 0.5;
export const CLEANING_BUG_WASTE = 0.5;
/** TensorFlow: AI training XP multiplier */
export const TRAINING_EFFECTIVENESS = 1.5;
/** PyTorch: added to the companion's creativity stat */
export const CREATIVITY_BONUS = 2;

export function hasLibrary(gameState, id) {
    const list = gameState?.unlockedLibraries;
    return Array.isArray(list) && list.includes(id);
}

/** Contract or category with no requiresLibrary is open to everyone. */
export function libraryRequirementMet(gameState, record) {
    const req = record?.requiresLibrary;
    if (!req) return true;
    const ids = Array.isArray(req) ? req : [req];
    return ids.every(id => hasLibrary(gameState, id));
}

/** Static HTML. Dynamic (JS-rendered) pages are not BeautifulSoup's bonus. */
export function isStaticScrapeStage(stage) {
    return stage?.type === 'scraping' && stage.site !== 'dynamic';
}

export function isCleaningStage(stage) {
    return stage?.type === 'cleaning';
}

/** Game-dev / creative work is what AI creativity speeds up. */
export function isCreativeStage(stage) {
    return stage?.type === 'game_dev' || stage?.creative === true;
}

/**
 * Work multiplier for the current project stage. 1 when the player has
 * not learned the library, so unaugmented work stays exact.
 */
export function stageWorkMultiplier(gameState, stage) {
    if (isStaticScrapeStage(stage) && hasLibrary(gameState, LIBRARY_IDS.SOUP)) {
        return STATIC_SCRAPE_SPEED;
    }
    if (isCleaningStage(stage) && hasLibrary(gameState, LIBRARY_IDS.PANDAS)) {
        return CLEANING_EFFICIENCY;
    }
    return 1;
}

/** 20% normally, 10% once RegEx is learned. */
export function cleaningBugChance(gameState) {
    const base = CLEANING_BUG_CHANCE;
    return hasLibrary(gameState, LIBRARY_IDS.REGEX) ? base * CLEANING_BUG_FACTOR : base;
}

export function trainingXpMultiplier(gameState) {
    return hasLibrary(gameState, LIBRARY_IDS.TENSORFLOW) ? TRAINING_EFFECTIVENESS : 1;
}

export function creativityBonus(gameState) {
    return hasLibrary(gameState, LIBRARY_IDS.PYTORCH) ? CREATIVITY_BONUS : 0;
}

/**
 * Companion creativity including PyTorch. Prefers AISystem's own getter so
 * the bonus is not added twice.
 */
export function effectiveCreativity(gameState) {
    const ai = gameState?.aiSystem;
    if (typeof ai?.getEffectiveCreativity === 'function') {
        return ai.getEffectiveCreativity();
    }
    const base = Number(ai?.creativity);
    return (Number.isFinite(base) ? base : 0) + creativityBonus(gameState);
}
