#include "scorer.h"
#include <cstdlib>
#include <map>

Scorer::Scorer() {}

Scorer::~Scorer() {}

int Scorer::calculateChartScore(const std::string &dataType,
                                const std::string &chartType, bool hasLegend,
                                bool hasTitle, bool hasGrid) {
  int appropriateness = scoreChartAppropriateness(dataType, chartType);
  int clarity = scoreVisualClarity(hasLegend, hasTitle, hasGrid);
  int accuracy = scoreDataAccuracy();

  // Weighted average
  int score =
      static_cast<int>(appropriateness * 0.4 + clarity * 0.3 + accuracy * 0.3);

  return std::max(0, std::min(100, score));
}

int Scorer::getStarsFromScore(int score) {
  if (score >= 90)
    return 5;
  if (score >= 75)
    return 4;
  if (score >= 55)
    return 3;
  if (score >= 35)
    return 2;
  return 1;
}

int Scorer::scoreChartAppropriateness(const std::string &dataType,
                                      const std::string &chartType) {
  int baseScore = getChartTypeScore(dataType, chartType);

  // Add small variance
  int variance = (rand() % 11) - 5; // -5 to +5

  return std::max(0, std::min(100, baseScore + variance));
}

int Scorer::scoreVisualClarity(bool hasLegend, bool hasTitle, bool hasGrid) {
  int score = 70; // Base score

  if (hasLegend)
    score += 10;
  if (hasTitle)
    score += 10;
  if (hasGrid)
    score += 5;

  // Add small variance
  int variance = (rand() % 6) - 3;

  return std::max(0, std::min(100, score + variance));
}

int Scorer::scoreDataAccuracy() {
  // Base score with variance (simulating data accuracy check)
  int baseScore = 80;
  int variance = (rand() % 21) - 5; // -5 to +15

  return std::max(60, std::min(100, baseScore + variance));
}

int Scorer::getChartTypeScore(const std::string &dataType,
                              const std::string &chartType) {
  // Chart appropriateness matrix
  std::map<std::string, std::map<std::string, int>> matrix = {
      {"quarterly_sales",
       {{"bar", 95},
        {"line", 85},
        {"pie", 40},
        {"scatter", 30},
        {"doughnut", 45},
        {"radar", 35}}},
      {"monthly_revenue",
       {{"bar", 75},
        {"line", 95},
        {"pie", 30},
        {"scatter", 50},
        {"doughnut", 35},
        {"radar", 40}}},
      {"product_comparison",
       {{"bar", 95},
        {"line", 50},
        {"pie", 60},
        {"scatter", 45},
        {"doughnut", 55},
        {"radar", 70}}},
      {"category_breakdown",
       {{"bar", 60},
        {"line", 30},
        {"pie", 95},
        {"scatter", 25},
        {"doughnut", 90},
        {"radar", 40}}},
      {"trend_analysis",
       {{"bar", 50},
        {"line", 95},
        {"pie", 20},
        {"scatter", 70},
        {"doughnut", 25},
        {"radar", 30}}},
      {"customer_demographics",
       {{"bar", 85},
        {"line", 40},
        {"pie", 90},
        {"scatter", 35},
        {"doughnut", 85},
        {"radar", 50}}},
      {"performance_metrics",
       {{"bar", 70},
        {"line", 45},
        {"pie", 40},
        {"scatter", 35},
        {"doughnut", 45},
        {"radar", 95}}}};

  // Lookup score
  if (matrix.find(dataType) != matrix.end()) {
    auto &chartScores = matrix[dataType];
    if (chartScores.find(chartType) != chartScores.end()) {
      return chartScores[chartType];
    }
  }

  // Default score for unknown combinations
  return 50;
}
