#include "economy.h"
#include <algorithm>

// Static member definitions
const int Economy::RANK_THRESHOLDS[] = {0, 100, 300, 600, 1200, 2500, 5000};
const double Economy::SALARY_MULTIPLIERS[] = {1.0, 1.5, 2.0, 3.0,
                                              5.0, 8.0, 15.0};

Economy::Economy() {}

Economy::~Economy() {}

int Economy::clampStars(int stars) { return std::max(1, std::min(5, stars)); }

int Economy::calculateReward(int baseReward, int stars,
                             double salaryMultiplier) {
  // Star multipliers. A 0-star / failed submission pays like 1 star rather
  // than falling back to a 1.0 multiplier (#890).
  static const double starMultipliers[] = {0.2, 0.4, 0.7, 1.0, 1.3};
  double multiplier = starMultipliers[clampStars(stars) - 1];

  int reward = static_cast<int>(baseReward * multiplier * salaryMultiplier);

  return std::max(10, reward); // Minimum reward of 10
}

int Economy::calculateReputation(int stars) {
  static const int repRewards[] = {2, 5, 10, 18, 30};
  return repRewards[clampStars(stars) - 1];
}

double Economy::salaryMultiplierFor(int rankIndex) {
  if (rankIndex >= 0 && rankIndex <= MAX_RANK) {
    return SALARY_MULTIPLIERS[rankIndex];
  }
  return 1.0;
}

double Economy::getSalaryMultiplier(int rankIndex) {
  return salaryMultiplierFor(rankIndex);
}

bool Economy::canPromote(int reputation, int currentRank) const {
  if (currentRank >= MAX_RANK)
    return false; // Max rank

  int requiredRep = getRequiredReputation(currentRank + 1);
  return reputation >= requiredRep;
}

int Economy::getRequiredReputation(int rankIndex) const {
  if (rankIndex >= 0 && rankIndex <= MAX_RANK) {
    return RANK_THRESHOLDS[rankIndex];
  }
  return 999999; // Unreachable
}
