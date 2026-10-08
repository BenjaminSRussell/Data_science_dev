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

  // Rank-independent base reward for a task: the value to pass to
  // Economy::calculateReward (#151)
  int getBaseReward(int difficulty);

  // What the task pays at par (4 stars) for this rank, for display. Rank
  // scaling comes from Economy's table, applied once (#151, #891); don't
  // feed this back into Economy::calculateReward.
  int calculatePotentialReward(int rankIndex, int difficulty);

  // Get time limit for difficulty
  int getTimeLimitForDifficulty(int difficulty);
};

#endif // TASK_SYSTEM_H
