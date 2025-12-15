#ifndef DATA_GENERATOR_H
#define DATA_GENERATOR_H

#include <random>
#include <string>
#include <vector>

/**
 * DataGenerator - Procedural data generation for visualization tasks
 * Generates realistic business data for game challenges
 */
class DataGenerator {
public:
  DataGenerator();
  ~DataGenerator();

  // Generate different types of datasets
  std::string generateQuarterlySalesJSON();
  std::string generateMonthlyRevenueJSON();
  std::string generateProductComparisonJSON();
  std::string generateCategoryBreakdownJSON();
  std::string generateTrendAnalysisJSON();
  std::string generateRandomDataJSON(int numPoints, int minVal, int maxVal);

private:
  std::mt19937 rng;

  // Helper functions
  int randomRange(int min, int max);
  double randomDouble(double min, double max);

  // Generate specific data patterns
  std::vector<int> generateTrendData(int length, int baseValue, double growth);
  std::vector<int> generateSeasonalData(int length, int baseValue,
                                        double amplitude);
  std::vector<int> generateNoisyData(int length, int baseValue,
                                     double noiseLevel);
};

#endif // DATA_GENERATOR_H
