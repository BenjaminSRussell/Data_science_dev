#include "scorer.h"
#include <cstdlib>
#include <ctime>

Scorer::Scorer() {
  std::srand(std::time(0)); // Seed the random number generator
}

int Scorer::scoreChart(const Chart &chart) {
  int appropriateness = scoreChartAppropriateness(chart);
  int clarity = scoreVisualClarity(chart.hasAxes, chart.hasLegend, chart.hasGrid);
  int accuracy = scoreDataAccuracy(chart.data);

  int score = static_cast<int>(appropriateness * 0.4 + clarity * 0.3 + accuracy * 0.3);
  return std::max(0, std::min(100, score));
}

int Scorer::getStarsFromScore(int score) {
  if (score >= 90) return 5;
  if (score >= 75) return 4;
  if (score >= 55) return 3;
  if (score >= 35) return 2;
  return 1;
}

int Scorer::scoreChartAppropriateness(const Chart &chart) {
  static const int chartTypeScores[][5] = {
    {80, 70, 60, 50, 40}, // line
    {70, 80, 60, 50, 40}, // bar
    {60, 60, 80, 50, 40}, // pie
    {50, 50, 50, 80, 40}, // scatter
    {40, 40, 40, 40, 80}  // bubble
  };

  int typeScore = chartTypeScores[chart.type][chart.category];
  int variance = (std::rand() % 11) - 5; // Random variance between -5 and +5
  return std::max(0, std::min(100, typeScore + variance));
}

int Scorer::scoreVisualClarity(bool hasAxes, bool hasLegend, bool hasGrid) {
  int baseScore = 70;
  int bonus = 0;

  if (hasAxes) bonus += 10;
  if (hasLegend) bonus += 10;
  if (hasGrid) bonus += 10;

  int variance = (std::rand() % 6) - 3; // Random variance between -3 and +2
  return std::max(0, std::min(100, baseScore + bonus + variance));
}

int Scorer::scoreDataAccuracy(const std::vector<int> &data) {
  int baseScore = 80;
  int variance = (std::rand() % 21) - 5; // Random variance between -5 and +15
  return std::max(0, std::min(100, baseScore + variance));
}