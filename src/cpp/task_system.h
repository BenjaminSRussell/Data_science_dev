#ifndef TASK_SYSTEM_H
#define TASK_SYSTEM_H

#include <string>

/**
 * TaskSystem - Task generation and management
 */
class TaskSystem {
public:
  TaskSystem();
  ~TaskSystem();

  // Get difficulty for rank
  int getDifficultyForRank(int rankIndex);

  // Calculate potential reward
  int calculatePotentialReward(int rankIndex, int difficulty);

  // Get time limit for difficulty
  int getTimeLimitForDifficulty(int difficulty);
};

#endif // TASK_SYSTEM_H
