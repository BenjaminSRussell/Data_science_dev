#include "task_system.h"

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

int TaskSystem::calculatePotentialReward(int rankIndex, int difficulty) {
  // Base reward
  int baseReward = 100;

  // Rank multipliers
  double rankMultipliers[] = {1.0, 1.5, 2.0, 3.0, 5.0, 8.0, 15.0};
  double rankMult =
      (rankIndex >= 0 && rankIndex <= 6) ? rankMultipliers[rankIndex] : 1.0;

  // Difficulty bonus
  int difficultyBonus = difficulty * 20;

  return static_cast<int>(baseReward * rankMult) + difficultyBonus;
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
