#include "economy.h"
#include <algorithm>

// Static member definitions
const int Economy::RANK_THRESHOLDS[] = {0, 100, 300, 600, 1200, 2500, 5000};
const double Economy::SALARY_MULTIPLIERS[] = {1.0, 1.5, 2.0, 3.0,
                                              5.0, 8.0, 15.0};

Economy::Economy() {}

Economy::~Economy() {}

int Economy::calculateReward(int baseReward, int stars,
                             double salaryMultiplier) {
  // Star multipliers
  double starMultipliers[] = {0.2, 0.4, 0.7, 1.0, 1.3};

  double multiplier = 1.0;
  if (stars >= 1 && stars <= 5) {
    multiplier = starMultipliers[stars - 1];
  }

  int reward = static_cast<int>(baseReward * multiplier * salaryMultiplier);

  return std::max(10, reward); // Minimum reward of 10
}

int Economy::calculateReputation(int stars) {
  int repRewards[] = {2, 5, 10, 18, 30};

  if (stars >= 1 && stars <= 5) {
    return repRewards[stars - 1];
  }

  return 5; // Default
}

double Economy::getSalaryMultiplier(int rankIndex) {
  if (rankIndex >= 0 && rankIndex <= 6) {
    return SALARY_MULTIPLIERS[rankIndex];
  }
  return 1.0;
}

bool Economy::canPromote(int reputation, int currentRank) {
  if (currentRank >= 6)
    return false; // Max rank

  int requiredRep = getRequiredReputation(currentRank + 1);
  return reputation >= requiredRep;
}

int Economy::getRequiredReputation(int rankIndex) {
  if (rankIndex >= 0 && rankIndex <= 6) {
    return RANK_THRESHOLDS[rankIndex];
  }
  return 999999; // Unreachable
}
