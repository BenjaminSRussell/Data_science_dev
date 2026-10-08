#ifndef ECONOMY_H
#define ECONOMY_H

/**
 * Economy - Currency and reward calculations
 */
class Economy {
public:
  Economy();
  ~Economy();

  // Money reward. baseReward must be the rank-independent base (e.g.
  // TaskSystem::getBaseReward); rank scaling is applied here, once, via
  // salaryMultiplier (#151). stars outside 1-5 are clamped (#890).
  int calculateReward(int baseReward, int stars, double salaryMultiplier);

  // Calculate reputation gain (stars clamped to 1-5)
  int calculateReputation(int stars);

  // Get salary multiplier for rank
  double getSalaryMultiplier(int rankIndex);

  // The single per-rank pay table, shared with TaskSystem (#891).
  // Out-of-range ranks get 1.0.
  static double salaryMultiplierFor(int rankIndex);

  // Clamp a star rating into the valid 1-5 range
  static int clampStars(int stars);

  // Check if promotion is available
  bool canPromote(int reputation, int currentRank) const;

  // Get required reputation for rank
  int getRequiredReputation(int rankIndex) const;

  // Highest rank index (shared with GameState)
  static const int MAX_RANK = 6;

private:
  // Rank thresholds
  static const int RANK_THRESHOLDS[];
  static const double SALARY_MULTIPLIERS[];
};

#endif // ECONOMY_H
