#ifndef ECONOMY_H
#define ECONOMY_H

#include "rank_config.h"

/**
 * Economy - Currency and reward calculations
 */
class Economy {
public:
  Economy();
  ~Economy();

  // Calculate money reward
  int calculateReward(int baseReward, int stars, double salaryMultiplier);

  // Calculate reputation gain
  int calculateReputation(int stars);

  // Get salary multiplier for rank
  double getSalaryMultiplier(int rankIndex);

  // Check if promotion is available
  bool canPromote(int reputation, int currentRank);

  // Get required reputation for rank
  int getRequiredReputation(int rankIndex);
};

#endif // ECONOMY_H
