#include "vendor/doctest.h"
#include "src/cpp/data_generator.h"

TEST_CASE("DataGenerator JSON generation") {
    DataGenerator dataGen;
    std::string quarterlySales = dataGen.generateQuarterlySalesJSON();
    std::string monthlyRevenue = dataGen.generateMonthlyRevenueJSON();
    std::string productComparison = dataGen.generateProductComparisonJSON();
    std::string randomData = dataGen.generateRandomDataJSON();

    CHECK_FALSE(quarterlySales.empty());
    CHECK_FALSE(monthlyRevenue.empty());
    CHECK_FALSE(productComparison.empty());
    CHECK_FALSE(randomData.empty());
}