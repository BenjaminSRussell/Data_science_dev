// Player promotion logic
function promotePlayer(gameState) {
    const { reputation, rankIndex, ranks } = gameState;
    const nextRank = ranks[rankIndex + 1];

    if (!nextRank) {
        return false;
    }

    if (reputation < nextRank.reputationRequirement) {
        return false;
    }

    gameState.rankIndex += 1;
    gameState.nextRank = ranks[gameState.rankIndex + 1];
    window.dispatchEvent(new CustomEvent('playerPromoted', { detail: gameState }));

    return true;
}

export { promotePlayer };