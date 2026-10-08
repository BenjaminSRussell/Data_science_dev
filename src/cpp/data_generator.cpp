#include "data_generator.h"
#include <algorithm>
#include <cmath>
#include <random>
#include <sstream>

DataGenerator::DataGenerator() {
  // Seed random number generator with a high-entropy source so that
  // instances constructed in the same second are not correlated.
  std::random_device rd;
  rng.seed(rd());
}

DataGenerator::~DataGenerator() {}

int DataGenerator::randomRange(int min, int max) {
  if (min > max)
    std::swap(min, max); // never hand the distribution an invalid range
  std::uniform_int_distribution<int> dist(min, max);
  return dist(rng);
}

double DataGenerator::randomDouble(double min, double max) {
  std::uniform_real_distribution<double> dist(min, max);
  return dist(rng);
}

std::vector<int> DataGenerator::generateTrendData(int length, int baseValue,
                                                  double growth) {
  std::vector<int> data;
  double value = baseValue;

  for (int i = 0; i < length; i++) {
    // Add trend growth with some randomness
    value = value * (1 + growth) + randomRange(-10, 20);
    data.push_back(static_cast<int>(std::max(0.0, value)));
  }

  return data;
}

std::vector<int> DataGenerator::generateSeasonalData(int length, int baseValue,
                                                     double amplitude) {
  std::vector<int> data;

  for (int i = 0; i < length; i++) {
    // Seasonal pattern with noise
    double seasonal =
        std::sin((static_cast<double>(i) / length) * M_PI * 2) * amplitude;
    int value = baseValue + static_cast<int>(baseValue * seasonal) +
                randomRange(-50, 50);
    data.push_back(std::max(0, value));
  }

  return data;
}

std::vector<int> DataGenerator::generateNoisyData(int length, int baseValue,
                                                  double noiseLevel) {
  std::vector<int> data;

  for (int i = 0; i < length; i++) {
    int noise =
        static_cast<int>(baseValue * noiseLevel * randomDouble(-1.0, 1.0));
    data.push_back(std::max(0, baseValue + noise));
  }

  return data;
}

std::string DataGenerator::generateQuarterlySalesJSON() {
  int baseRevenue = randomRange(80000, 150000);

  std::ostringstream ss;
  ss << "{\"labels\":[\"Q1 2024\",\"Q2 2024\",\"Q3 2024\",\"Q4 2024\"],";
  ss << "\"datasets\":{\"Revenue\":[";

  for (int i = 0; i < 4; i++) {
    double growth = 1.0 + (i * 0.05) + randomDouble(0, 0.1);
    int revenue = static_cast<int>(baseRevenue * growth);
    if (i > 0)
      ss << ",";
    ss << revenue;
  }

  ss << "]}}";
  return ss.str();
}

std::string DataGenerator::generateMonthlyRevenueJSON() {
  int baseRevenue = randomRange(50000, 100000);
  const char *months[] = {"Jan", "Feb", "Mar", "Apr", "May", "Jun",
                          "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};

  std::ostringstream ss;
  ss << "{\"labels\":[";

  for (int i = 0; i < 12; i++) {
    if (i > 0)
      ss << ",";
    ss << "\"" << months[i] << "\"";
  }

  ss << "],\"datasets\":{\"Revenue\":[";

  std::vector<int> data = generateSeasonalData(12, baseRevenue, 0.2);
  for (int i = 0; i < 12; i++) {
    if (i > 0)
      ss << ",";
    ss << data[i];
  }

  ss << "]}}";
  return ss.str();
}

std::string DataGenerator::generateProductComparisonJSON() {
  const char *products[] = {"Product A", "Product B", "Product C", "Product D",
                            "Product E"};

  std::ostringstream ss;
  ss << "{\"labels\":[";

  for (int i = 0; i < 5; i++) {
    if (i > 0)
      ss << ",";
    ss << "\"" << products[i] << "\"";
  }

  ss << "],\"datasets\":{\"Sales\":[";

  for (int i = 0; i < 5; i++) {
    if (i > 0)
      ss << ",";
    ss << randomRange(5000, 50000);
  }

  ss << "]}}";
  return ss.str();
}

std::string DataGenerator::generateCategoryBreakdownJSON() {
  const char *categories[] = {"Electronics", "Clothing", "Food",
                              "Home & Garden", "Sports"};

  std::ostringstream ss;
  ss << "{\"labels\":[";

  for (int i = 0; i < 5; i++) {
    if (i > 0)
      ss << ",";
    ss << "\"" << categories[i] << "\"";
  }

  ss << "],\"datasets\":{\"Percentage\":[";

  // Five percentages, each in [10, 40], summing to exactly 100. Each draw
  // is bounded so the categories still to come can always fit in [10, 40],
  // which keeps lo <= hi on every call (the old bound could ask for
  // randomRange(10, 5), undefined behaviour, #82).
  const int count = 5, minPct = 10, maxPct = 40;
  int remaining = 100;
  for (int i = 0; i < count; i++) {
    if (i > 0)
      ss << ",";

    int val;
    int left = count - 1 - i; // categories after this one
    if (left == 0) {
      val = remaining;
    } else {
      int lo = std::max(minPct, remaining - maxPct * left);
      int hi = std::min(maxPct, remaining - minPct * left);
      val = randomRange(lo, hi);
    }
    remaining -= val;
    ss << val;
  }

  ss << "]}}";
  return ss.str();
}

std::string DataGenerator::generateTrendAnalysisJSON() {
  std::ostringstream ss;
  ss << "{\"labels\":[";

  for (int i = 1; i <= 12; i++) {
    if (i > 1)
      ss << ",";
    ss << "\"Week " << i << "\"";
  }

  ss << "],\"datasets\":{\"Users\":[";

  std::vector<int> data = generateTrendData(12, randomRange(1000, 5000), 0.05);
  for (size_t i = 0; i < data.size(); i++) {
    if (i > 0)
      ss << ",";
    ss << data[i];
  }

  ss << "]}}";
  return ss.str();
}

std::string DataGenerator::generateRandomDataJSON(int numPoints, int minVal,
                                                  int maxVal) {
  // These arrive straight from JS via embind: sanitize before they reach
  // uniform_int_distribution, which is UB for min > max (#208)
  numPoints = std::max(0, std::min(MAX_RANDOM_POINTS, numPoints));
  if (minVal > maxVal)
    std::swap(minVal, maxVal);

  std::ostringstream ss;
  ss << "{\"labels\":[";

  for (int i = 0; i < numPoints; i++) {
    if (i > 0)
      ss << ",";
    ss << "\"Point " << (i + 1) << "\"";
  }

  ss << "],\"datasets\":{\"Value\":[";

  for (int i = 0; i < numPoints; i++) {
    if (i > 0)
      ss << ",";
    ss << randomRange(minVal, maxVal);
  }

  ss << "]}}";
  return ss.str();
}
