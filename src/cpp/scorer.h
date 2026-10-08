#ifndef SCORER_H
#define SCORER_H

#include <random>
#include <string>

/**
 * Scorer - Evaluates chart quality and calculates scores
 */
class Scorer {
public:
  Scorer();
  // Deterministic variance for tests/replays
  explicit Scorer(unsigned int seed);
  ~Scorer();

  // Component weights, in fifths: appropriateness 3/5, clarity 1/5,
  // accuracy 1/5. Integer math so a mathematically exact tier boundary
  // can't truncate down a tier (#894).
  static constexpr int APPROPRIATENESS_WEIGHT = 3;
  static constexpr int CLARITY_WEIGHT = 1;
  static constexpr int ACCURACY_WEIGHT = 1;
  static constexpr int WEIGHT_TOTAL = 5;

  // Weighted, rounded, clamped combination of the three components
  static int combineScores(int appropriateness, int clarity, int accuracy);

  // Calculate overall chart score (0-100)
  int calculateChartScore(const std::string &dataType,
                          const std::string &chartType, bool hasLegend,
                          bool hasTitle, bool hasGrid);

  // Convert raw score to stars (1-5)
  int getStarsFromScore(int score);

  // Individual scoring components
  int scoreChartAppropriateness(const std::string &dataType,
                                const std::string &chartType);
  int scoreVisualClarity(bool hasLegend, bool hasTitle, bool hasGrid);
  int scoreDataAccuracy();

private:
  // Per-instance RNG: constructing a Scorer no longer reseeds the
  // process-wide rand() (#85)
  std::mt19937 rng;
  int variance(int lo, int hi);

  // Chart type appropriateness lookup
  int getChartTypeScore(const std::string &dataType,
                        const std::string &chartType);
};

#endif // SCORER_H
