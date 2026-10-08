#include "data_generator.h"
#include "doctest.h"
#include "json_helpers.h"

#include <numeric>

TEST_CASE("DataGenerator::generateQuarterlySalesJSON shape and bounds") {
  DataGenerator g;
  for (int iter = 0; iter < 200; iter++) {
    std::string json = g.generateQuarterlySalesJSON();
    CHECK(labels(json) == std::vector<std::string>{"Q1 2024", "Q2 2024", "Q3 2024", "Q4 2024"});
    auto revenue = numbers(json, "Revenue");
    REQUIRE(revenue.size() == 4);
    for (int i = 0; i < 4; i++) {
      // base in [80000,150000], growth in [1 + 0.05i, 1.1 + 0.05i]
      CHECK(revenue[i] >= static_cast<long long>(80000 * (1.0 + i * 0.05)) - 1);
      CHECK(revenue[i] <= static_cast<long long>(150000 * (1.1 + i * 0.05)) + 1);
    }
  }
}

TEST_CASE("DataGenerator::generateMonthlyRevenueJSON") {
  DataGenerator g;
  const std::vector<std::string> months = {"Jan", "Feb", "Mar", "Apr", "May", "Jun",
                                           "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"};
  for (int iter = 0; iter < 200; iter++) {
    std::string json = g.generateMonthlyRevenueJSON();
    CHECK(labels(json) == months);
    auto values = numbers(json, "Revenue");
    REQUIRE(values.size() == 12);
    for (auto v : values)
      CHECK(v >= 0);
  }
}

TEST_CASE("DataGenerator::generateProductComparisonJSON") {
  DataGenerator g;
  for (int iter = 0; iter < 200; iter++) {
    std::string json = g.generateProductComparisonJSON();
    CHECK(labels(json) == std::vector<std::string>{"Product A", "Product B", "Product C",
                                                   "Product D", "Product E"});
    auto sales = numbers(json, "Sales");
    REQUIRE(sales.size() == 5);
    for (auto v : sales) {
      CHECK(v >= 5000);
      CHECK(v <= 50000);
    }
  }
}

TEST_CASE("DataGenerator::generateCategoryBreakdownJSON sums to 100, each 10..40 (#82)") {
  DataGenerator g;
  for (int iter = 0; iter < 5000; iter++) {
    std::string json = g.generateCategoryBreakdownJSON();
    auto pct = numbers(json, "Percentage");
    REQUIRE(pct.size() == 5);
    CHECK(std::accumulate(pct.begin(), pct.end(), 0LL) == 100);
    for (auto v : pct) {
      CHECK(v >= 10);
      CHECK(v <= 40);
    }
  }
  CHECK(labels(g.generateCategoryBreakdownJSON()) ==
        std::vector<std::string>{"Electronics", "Clothing", "Food", "Home & Garden", "Sports"});
}

TEST_CASE("DataGenerator::generateTrendAnalysisJSON") {
  DataGenerator g;
  for (int iter = 0; iter < 200; iter++) {
    std::string json = g.generateTrendAnalysisJSON();
    auto l = labels(json);
    REQUIRE(l.size() == 12);
    CHECK(l.front() == "Week 1");
    CHECK(l.back() == "Week 12");
    for (auto v : numbers(json, "Users"))
      CHECK(v >= 0);
  }
}

TEST_CASE("DataGenerator::generateRandomDataJSON range and labels") {
  DataGenerator g;
  std::string json = g.generateRandomDataJSON(5, 10, 20);
  CHECK(labels(json) == std::vector<std::string>{"Point 1", "Point 2", "Point 3", "Point 4", "Point 5"});
  for (int iter = 0; iter < 200; iter++) {
    for (auto v : numbers(g.generateRandomDataJSON(8, 10, 20), "Value")) {
      CHECK(v >= 10);
      CHECK(v <= 20);
    }
  }
  CHECK(g.generateRandomDataJSON(0, 1, 2) == "{\"labels\":[],\"datasets\":{\"Value\":[]}}");
  auto same = numbers(g.generateRandomDataJSON(3, 7, 7), "Value");
  CHECK(same == std::vector<long long>{7, 7, 7});
}

TEST_CASE("DataGenerator::generateRandomDataJSON sanitizes JS input (#208)") {
  DataGenerator g;
  // reversed bounds are swapped instead of hitting UB
  for (int iter = 0; iter < 200; iter++)
    for (auto v : numbers(g.generateRandomDataJSON(4, 20, 10), "Value")) {
      CHECK(v >= 10);
      CHECK(v <= 20);
    }
  // negative count -> empty, huge count -> capped
  CHECK(labels(g.generateRandomDataJSON(-5, 1, 2)).empty());
  CHECK(numbers(g.generateRandomDataJSON(DataGenerator::MAX_RANDOM_POINTS + 50, 1, 2), "Value").size() ==
        static_cast<size_t>(DataGenerator::MAX_RANDOM_POINTS));
}
