/**
 * workRewards.js
 * The one place work systems (ProjectSystem, ContractSystem,
 * RealWorldTaskSystem) hand out money and reputation, so the bookkeeping
 * can't drift between them again (#267):
 * - earned money also counts as weekly (taxable) income and lifetime
 *   earnings (#1989)
 * - reputation never goes below 0 (#1115)
 */

/**
 * @param {object} gameState
 * @param {{money?: number, reputation?: number}} reward
 * @returns {{money: number, reputation: number}} what was actually applied
 */
export function grantWorkReward(gameState, { money = 0, reputation = 0 } = {}) {
    if (!gameState) return { money: 0, reputation: 0 };
    const pay = Number.isFinite(Number(money)) ? Number(money) : 0;
    if (pay !== 0) {
        gameState.money = (Number(gameState.money) || 0) + pay;
        if (pay > 0) {
            gameState.weeklyIncome = (Number(gameState.weeklyIncome) || 0) + pay;
            gameState.totalEarned = (Number(gameState.totalEarned) || 0) + pay;
        }
    }
    let applied = 0;
    const rep = Number.isFinite(Number(reputation)) ? Number(reputation) : 0;
    if (rep !== 0) {
        const before = Number(gameState.reputation) || 0;
        gameState.reputation = Math.max(0, before + rep);
        applied = gameState.reputation - before;
    }
    return { money: pay, reputation: applied };
}
