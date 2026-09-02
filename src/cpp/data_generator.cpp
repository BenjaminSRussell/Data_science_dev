#include "data_generator.h"
#include <random>
#include <sstream>

// Constructor to initialize the random number generator
DataGenerator::DataGenerator() {
    rng.seed(std::random_device{}());
}

// Generate random data as JSON
std::string DataGenerator::generateRandomDataJSON(int numPoints, int minVal, int maxVal) {
    // Ensure minVal is less than or equal to maxVal
    if (minVal > maxVal) {
        std::swap(minVal, maxVal);
    }

    // Clamp numPoints to a reasonable upper limit to prevent excessive memory usage
    const int maxNumPoints = 10000;
    numPoints = std::min(numPoints, maxNumPoints);

    std::stringstream ss;
    ss << "[";
    for (int i = 0; i < numPoints; i++) {
        ss << randomRange(minVal, maxVal);
        if (i < numPoints - 1) {
            ss << ", ";
        }
    }
    ss << "]";

    return ss.str();
}

// Generate a random integer within a specified range
int DataGenerator::randomRange(int min, int max) {
    std::uniform_int_distribution<int> dist(min, max);
    return dist(rng);
}