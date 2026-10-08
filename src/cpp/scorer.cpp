#include "scorer.h"
#include <algorithm>
#include <map>

Scorer::Scorer() {
  std::random_device rd;
  rng.seed(rd());
}

Scorer::Scorer(unsigned int seed) { rng.seed(seed); }

Scorer::~Scorer() {}

int Scorer::variance(int lo, int hi) {
  std::uniform_int_distribution<int> dist(lo, hi);
  return dist(rng);
}

int Scorer::combineScores(int appropriateness, int clarity, int accuracy) {
  int weighted = appropriateness * APPROPRIATENESS_WEIGHT +
                 clarity * CLARITY_WEIGHT + accuracy * ACCURACY_WEIGHT;
  // Round half up in integer arithmetic (weighted is >= 0 for in-range input)
  int score = weighted >= 0 ? (weighted * 2 + WEIGHT_TOTAL) / (2 * WEIGHT_TOTAL)
                            : -((-weighted * 2 + WEIGHT_TOTAL) / (2 * WEIGHT_TOTAL));
  return std::max(0, std::min(100, score));
}

int Scorer::calculateChartScore(const std::string &dataType,
                                const std::string &chartType, bool hasLegend,
                                bool hasTitle, bool hasGrid) {
  int appropriateness = scoreChartAppropriateness(dataType, chartType);
  int clarity = scoreVisualClarity(hasLegend, hasTitle, hasGrid);
  int accuracy = scoreDataAccuracy();
  return combineScores(appropriateness, clarity, accuracy);
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
  return std::max(0, std::min(100, baseScore + variance(-5, 5)));
}

int Scorer::scoreVisualClarity(bool hasLegend, bool hasTitle, bool hasGrid) {
  // 50 with nothing, 100 with everything, so a bare chart can drag the
  // total into 1-star territory (#209)
  int score = 50;

  if (hasLegend)
    score += 20;
  if (hasTitle)
    score += 20;
  if (hasGrid)
    score += 10;

  return std::max(0, std::min(100, score + variance(-3, 3)));
}

int Scorer::scoreDataAccuracy() {
  // Simulated accuracy check: 60-100
  return std::max(0, std::min(100, 80 + variance(-20, 20)));
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
