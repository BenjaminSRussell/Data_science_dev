#include "task_system.h"
#include "economy.h"

TaskSystem::TaskSystem() {}

TaskSystem::~TaskSystem() {}

int TaskSystem::getDifficultyForRank(int rankIndex) {
  if (rankIndex <= 1)
    return 1; // Entry level
  if (rankIndex <= 3)
    return 2; // Mid level
  if (rankIndex <= 5)
    return 3; // Senior level
  return 4;   // Expert level
}

int TaskSystem::getBaseReward(int difficulty) {
  const int baseReward = 100;
  const int difficultyBonus = difficulty * 20;
  return baseReward + difficultyBonus;
}

int TaskSystem::calculatePotentialReward(int rankIndex, int difficulty) {
  const int parStars = 4; // 1.0x star multiplier
  Economy economy;
  return economy.calculateReward(getBaseReward(difficulty), parStars,
                                 Economy::salaryMultiplierFor(rankIndex));
}

int TaskSystem::getTimeLimitForDifficulty(int difficulty) {
  // Time limits in seconds
  switch (difficulty) {
  case 1:
    return 300; // 5 minutes
  case 2:
    return 240; // 4 minutes
  case 3:
    return 200; // 3:20
  case 4:
    return 150; // 2:30
  default:
    return 300;
  }
}
