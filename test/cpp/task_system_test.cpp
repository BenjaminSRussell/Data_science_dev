#include "gtest/gtest.h"
#include "task_system.h"

// Test getDifficultyForRank
TEST(TaskSystemTest, GetDifficultyForRank) {
  EXPECT_EQ(TaskSystem::getDifficultyForRank(-1), 1);
  EXPECT_EQ(TaskSystem::getDifficultyForRank(0), 1);
  EXPECT_EQ(TaskSystem::getDifficultyForRank(1), 1);
  EXPECT_EQ(TaskSystem::getDifficultyForRank(2), 2);
  EXPECT_EQ(TaskSystem::getDifficultyForRank(3), 2);
  EXPECT_EQ(TaskSystem::getDifficultyForRank(4), 3);
  EXPECT_EQ(TaskSystem::getDifficultyForRank(5), 3);
  EXPECT_EQ(TaskSystem::getDifficultyForRank(6), 4);
  EXPECT_EQ(TaskSystem::getDifficultyForRank(7), 4);
  EXPECT_EQ(TaskSystem::getDifficultyForRank(100), 4);
}

// Test getTimeLimitForDifficulty
TEST(TaskSystemTest, GetTimeLimitForDifficulty) {
  EXPECT_EQ(TaskSystem::getTimeLimitForDifficulty(1), 300);
  EXPECT_EQ(TaskSystem::getTimeLimitForDifficulty(2), 240);
  EXPECT_EQ(TaskSystem::getTimeLimitForDifficulty(3), 200);
  EXPECT_EQ(TaskSystem::getTimeLimitForDifficulty(4), 150);
  EXPECT_EQ(TaskSystem::getTimeLimitForDifficulty(0), 300);
  EXPECT_EQ(TaskSystem::getTimeLimitForDifficulty(5), 300);
  EXPECT_EQ(TaskSystem::getTimeLimitForDifficulty(-1), 300);
}

// Test calculatePotentialReward
TEST(TaskSystemTest, CalculatePotentialReward) {
  EXPECT_EQ(TaskSystem::calculatePotentialReward(0, 1), 120);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(1, 1), 130);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(2, 1), 140);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(3, 1), 170);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(4, 1), 200);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(5, 1), 250);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(6, 1), 350);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(0, 2), 140);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(1, 2), 150);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(2, 2), 160);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(3, 2), 190);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(4, 2), 220);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(5, 2), 270);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(6, 2), 370);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(0, 3), 160);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(1, 3), 170);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(2, 3), 180);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(3, 3), 210);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(4, 3), 240);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(5, 3), 290);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(6, 3), 390);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(0, 4), 180);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(1, 4), 190);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(2, 4), 200);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(3, 4), 230);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(4, 4), 260);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(5, 4), 310);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(6, 4), 410);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(-1, 1), 120);
  EXPECT_EQ(TaskSystem::calculatePotentialReward(7, 1), 120);
}

int main(int argc, char **argv) {
  ::testing::InitGoogleTest(&argc, argv);
  return RUN_ALL_TESTS();
}