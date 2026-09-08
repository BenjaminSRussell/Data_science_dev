#include <gtest/gtest.h>
#include "game_state.h"

TEST(GameState, Reset) {
    GameState state;
    state.reset();
    EXPECT_EQ(state.getMoney(), 100);
    EXPECT_EQ(state.getReputation(), 0);
    EXPECT_EQ(state.getRankIndex(), 0);
    EXPECT_EQ(state.getTasksCompleted(), 0);
    EXPECT_EQ(state.getPerfectScores(), 0);
    EXPECT_EQ(state.getTotalEarned(), 0);
}

TEST(GameState, SetRankIndex) {
    GameState state;
    state.setRankIndex(5);
    EXPECT_EQ(state.getRankIndex(), 5);
    state.setRankIndex(-1);
    EXPECT_EQ(state.getRankIndex(), 5);
    state.setRankIndex(7);
    EXPECT_EQ(state.getRankIndex(), 5);
}

TEST(GameState, CanPromote) {
    GameState state;
    EXPECT_FALSE(state.canPromote(100));
    state.addReputation(100);
    EXPECT_TRUE(state.canPromote(100));
    state.setRankIndex(6);
    EXPECT_FALSE(state.canPromote(0));
}

TEST(GameState, AddMoneyReputation) {
    GameState state;
    state.addMoney(50);
    EXPECT_EQ(state.getMoney(), 150);
    state.addMoney(-30);
    EXPECT_EQ(state.getMoney(), 120);
    state.addReputation(20);
    EXPECT_EQ(state.getReputation(), 20);
    state.addReputation(-10);
    EXPECT_EQ(state.getReputation(), 10);
}

TEST(GameState, AddToTotalEarned) {
    GameState state;
    state.addToTotalEarned(100);
    EXPECT_EQ(state.getTotalEarned(), 100);
    state.addToTotalEarned(-50);
    EXPECT_EQ(state.getTotalEarned(), 50);
}

TEST(GameState, JSONRoundTrip) {
    GameState state;
    state.addMoney(200);
    state.addReputation(50);
    state.setRankIndex(3);
    state.setTasksCompleted(10);
    state.setPerfectScores(5);
    state.addToTotalEarned(300);

    std::string json = state.toJSON();
    GameState state2;
    state2.fromJSON(json);

    EXPECT_EQ(state2.getMoney(), 200);
    EXPECT_EQ(state2.getReputation(), 50);
    EXPECT_EQ(state2.getRankIndex(), 3);
    EXPECT_EQ(state2.getTasksCompleted(), 10);
    EXPECT_EQ(state2.getPerfectScores(), 5);
    EXPECT_EQ(state2.getTotalEarned(), 300);
}

TEST(GameState, JSONPartialRoundTrip) {
    GameState state;
    state.addMoney(200);
    state.addReputation(50);
    state.setRankIndex(3);
    state.setTasksCompleted(10);
    state.setPerfectScores(5);
    state.addToTotalEarned(300);

    std::string json = "{\"money\":300}";
    GameState state2;
    state2.fromJSON(json);

    EXPECT_EQ(state2.getMoney(), 300);
    EXPECT_EQ(state2.getReputation(), 0);
    EXPECT_EQ(state2.getRankIndex(), 0);
    EXPECT_EQ(state2.getTasksCompleted(), 0);
    EXPECT_EQ(state2.getPerfectScores(), 0);
    EXPECT_EQ(state2.getTotalEarned(), 0);
}

TEST(GameState, JSONNegativeValueRoundTrip) {
    GameState state;
    state.addMoney(200);
    state.addReputation(50);
    state.setRankIndex(3);
    state.setTasksCompleted(10);
    state.setPerfectScores(5);
    state.addToTotalEarned(300);

    std::string json = "{\"money\":-50}";
    GameState state2;
    state2.fromJSON(json);

    EXPECT_EQ(state2.getMoney(), 100); // Expected to fail until bug is fixed
    EXPECT_EQ(state2.getReputation(), 0);
    EXPECT_EQ(state2.getRankIndex(), 0);
    EXPECT_EQ(state2.getTasksCompleted(), 0);
    EXPECT_EQ(state2.getPerfectScores(), 0);
    EXPECT_EQ(state2.getTotalEarned(), 0);
}