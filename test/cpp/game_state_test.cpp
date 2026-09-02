#include "vendor/doctest.h"
#include "src/cpp/game_state.h"

TEST_CASE("GameState initialization") {
    GameState gameState;
    CHECK(gameState.getMoney() == 0);
    CHECK(gameState.getReputation() == 0);
    CHECK(gameState.getRankIndex() == 0);
    CHECK(gameState.getTasksCompleted() == 0);
    CHECK(gameState.getPerfectScores() == 0);
    CHECK(gameState.getTotalEarned() == 0);
}

TEST_CASE("GameState setters and getters") {
    GameState gameState;
    gameState.setMoney(1000);
    gameState.setReputation(500);
    gameState.setRankIndex(10);
    gameState.incrementTasksCompleted();
    gameState.setPerfectScores(2);
    gameState.setTotalEarned(1500);

    CHECK(gameState.getMoney() == 1000);
    CHECK(gameState.getReputation() == 500);
    CHECK(gameState.getRankIndex() == 10);
    CHECK(gameState.getTasksCompleted() == 1);
    CHECK(gameState.getPerfectScores() == 2);
    CHECK(gameState.getTotalEarned() == 1500);
}

TEST_CASE("GameState reset") {
    GameState gameState;
    gameState.setMoney(1000);
    gameState.setReputation(500);
    gameState.setRankIndex(10);
    gameState.incrementTasksCompleted();
    gameState.setPerfectScores(2);
    gameState.setTotalEarned(1500);
    gameState.reset();

    CHECK(gameState.getMoney() == 0);
    CHECK(gameState.getReputation() == 0);
    CHECK(gameState.getRankIndex() == 0);
    CHECK(gameState.getTasksCompleted() == 0);
    CHECK(gameState.getPerfectScores() == 0);
    CHECK(gameState.getTotalEarned() == 0);
}