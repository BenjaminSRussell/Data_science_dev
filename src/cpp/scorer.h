#ifndef SCORER_H
#define SCORER_H

#include <string>

/**
 * Scorer - Evaluates chart quality and calculates scores
 */
class Scorer {
public:
  Scorer();
  ~Scorer();

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
  // Chart type appropriateness lookup
  int getChartTypeScore(const std::string &dataType,
                        const std::string &chartType);
};

#endif // SCORER_H
