#include <iostream>
#include <string>
#include <vector>
#include <cassert>
#include <cmath>
#include "data_generator.h"

// Helper function to parse JSON-like string into key-value pairs
std::pair<std::string, std::vector<std::string>> parseJSONString(const std::string& jsonStr) {
    std::string key;
    std::vector<std::string> values;
    size_t pos = jsonStr.find_first_of("{[");
    if (pos != std::string::npos) {
        key = jsonStr.substr(0, pos);
        size_t start = jsonStr.find_first_of("[{", pos);
        size_t end = jsonStr.find_last_of("]}");
        if (start != std::string::npos && end != std::string::npos) {
            std::string valuesStr = jsonStr.substr(start + 1, end - start - 1);
            size_t valuePos = 0;
            while (true) {
                size_t commaPos = valuesStr.find(',', valuePos);
                if (commaPos == std::string::npos) {
                    values.push_back(valuesStr.substr(valuePos));
                    break;
                }
                values.push_back(valuesStr.substr(valuePos, commaPos - valuePos));
                valuePos = commaPos + 1;
            }
        }
    }
    return {key, values};
}

// Helper function to parse JSON-like numeric values
std::vector<int> parseJSONNumbers(const std::string& jsonStr) {
    std::vector<int> numbers;
    size_t start = jsonStr.find_first_of("[{");
    size_t end = jsonStr.find_last_of("]}");
    if (start != std::string::npos && end != std::string::npos) {
        std::string numbersStr = jsonStr.substr(start + 1, end - start - 1);
        size_t valuePos = 0;
        while (true) {
            size_t commaPos = numbersStr.find(',', valuePos);
            if (commaPos == std::string::npos) {
                numbers.push_back(std::stoi(numbersStr.substr(valuePos)));
                break;
            }
            numbers.push_back(std::stoi(numbersStr.substr(valuePos, commaPos - valuePos)));
            valuePos = commaPos + 1;
        }
    }
    return numbers;
}

void testGenerateQuarterlySalesJSON() {
    DataGenerator generator;
    std::string json = generator.generateQuarterlySalesJSON();
    auto [key, labels] = parseJSONString(json);
    assert(key == "labels");
    assert(labels.size() == 4);
    assert(labels[0] == "Q1 2024");
    assert(labels[1] == "Q2 2024");
    assert(labels[2] == "Q3 2024");
    assert(labels[3] == "Q4 2024");

    auto revenue = parseJSONNumbers(json);
    assert(revenue.size() == 4);
    // Assuming revenue is bounded per quarter index formula
    // Add specific bounds checks based on the formula used
}

void testGenerateMonthlyRevenueJSON() {
    DataGenerator generator;
    std::string json = generator.generateMonthlyRevenueJSON();
    auto revenue = parseJSONNumbers(json);
    assert(revenue.size() == 12);
    for (int value : revenue) {
        assert(value >= 0);
    }
}

void testGenerateProductComparisonJSON() {
    DataGenerator generator;
    std::string json = generator.generateProductComparisonJSON();
    auto products = parseJSONString(json);
    assert(products.first == "datasets");
    assert(products.second.size() == 5);
    for (const std::string& product : products.second) {
        assert(product.find("Product") == 0);
    }

    auto sales = parseJSONNumbers(json);
    assert(sales.size() == 5);
    for (int sale : sales) {
        assert(sale >= 5000 && sale <= 50000);
    }
}

void testGenerateCategoryBreakdownJSON() {
    DataGenerator generator;
    std::string json = generator.generateCategoryBreakdownJSON();
    auto categories = parseJSONString(json);
    assert(categories.first == "categories");
    assert(categories.second.size() == 5);
    for (int i = 0; i < 5; ++i) {
        std::string category = categories.second[i];
        assert(category.find("Category") == 0);
    }

    auto breakdown = parseJSONNumbers(json);
    assert(breakdown.size() == 5);
    int sum = 0;
    for (int value : breakdown) {
        sum += value;
    }
    assert(sum == 100);
}

void testGenerateTrendAnalysisJSON() {
    DataGenerator generator;
    std::string json = generator.generateTrendAnalysisJSON();
    auto trends = parseJSONString(json);
    assert(trends.first == "labels");
    assert(trends.second.size() == 12);
    for (int i = 0; i < 12; ++i) {
        assert(trends.second[i] == "Week " + std::to_string(i + 1));
    }

    auto values = parseJSONNumbers(json);
    assert(values.size() == 12);
    for (int value : values) {
        assert(value >= 0);
    }
}

void testGenerateRandomDataJSON() {
    DataGenerator generator;
    std::string json = generator.generateRandomDataJSON(5, 10, 20);
    auto [key, labels] = parseJSONString(json);
    assert(key == "labels");
    assert(labels.size() == 5);
    for (int i = 0; i < 5; ++i) {
        assert(labels[i] == "Point " + std::to_string(i + 1));
    }

    auto values = parseJSONNumbers(json);
    assert(values.size() == 5);
    for (int value : values) {
        assert(value >= 10 && value <= 20);
    }
}

int main() {
    testGenerateQuarterlySalesJSON();
    testGenerateMonthlyRevenueJSON();
    testGenerateProductComparisonJSON();
    testGenerateCategoryBreakdownJSON();
    testGenerateTrendAnalysisJSON();
    testGenerateRandomDataJSON();

    std::cout << "All tests passed!" << std::endl;
    return 0;
}