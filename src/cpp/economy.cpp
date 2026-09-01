#include "economy.h"

const double Economy::SALARY_MULTIPLIERS[] = {1.0, 1.5, 2.0, 3.0, 5.0, 8.0, 15.0};

Economy::Economy() {
  // Constructor implementation
}

Economy::~Economy() {
  // Destructor implementation
}

double Economy::getSalaryMultiplier(int rankIndex) const {
  if (rankIndex >= 0 && rankIndex <= 6) {
    return SALARY_MULTIPLIERS[rankIndex];
  }
  return 1.0;
}

int Economy::calculateReward(int baseReward, int stars) const {
  double starMultipliers[] = {0.2, 0.4, 0.7, 1.0, 1.3};
  double multiplier = 1.0;
  if (stars >= 1 && stars <= 5) {
    multiplier = starMultipliers[stars - 1];
  }
  int reward = static_cast<int>(baseReward * multiplier);
  return std::max(10, reward);
}