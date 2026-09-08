#include <gtest/gtest.h>
#include <random>
#include "scorer.h"

class ScorerTest : public ::testing::Test {
protected:
    Scorer scorer;

    void SetUp() override {
        // Seed the random number generator with a fixed value for deterministic tests
        std::srand(42);
    }
};

TEST_F(ScorerTest, GetStarsFromScore) {
    EXPECT_EQ(scorer.getStarsFromScore(-10), 1);
    EXPECT_EQ(scorer.getStarsFromScore(34), 1);
    EXPECT_EQ(scorer.getStarsFromScore(35), 2);
    EXPECT_EQ(scorer.getStarsFromScore(54), 2);
    EXPECT_EQ(scorer.getStarsFromScore(55), 3);
    EXPECT_EQ(scorer.getStarsFromScore(74), 3);
    EXPECT_EQ(scorer.getStarsFromScore(75), 4);
    EXPECT_EQ(scorer.getStarsFromScore(89), 4);
    EXPECT_EQ(scorer.getStarsFromScore(90), 5);
    EXPECT_EQ(scorer.getStarsFromScore(100), 5);
    EXPECT_EQ(scorer.getStarsFromScore(150), 5);
}

TEST_F(ScorerTest, ScoreVisualClarity) {
    const std::vector<std::tuple<bool, bool, bool, int>> cases = {
        {false, false, false, 70},
        {true, false, false, 80},
        {false, true, false, 80},
        {false, false, true, 75},
        {true, true, false, 90},
        {true, false, true, 85},
        {false, true, true, 85},
        {true, true, true, 95}
    };

    for (const auto& [hasLegend, hasTitle, hasGrid, base] : cases) {
        for (int i = 0; i < 200; ++i) {
            int score = scorer.scoreVisualClarity(hasLegend, hasTitle, hasGrid);
            EXPECT_GE(score, base - 3);
            EXPECT_LE(score, base + 3);
        }
    }
}

TEST_F(ScorerTest, ScoreDataAccuracy) {
    for (int i = 0; i < 200; ++i) {
        int score = scorer.scoreDataAccuracy();
        EXPECT_GE(score, 75);
        EXPECT_LE(score, 95);
    }
}

TEST_F(ScorerTest, ScoreChartAppropriatenessKnownPairs) {
    const std::vector<std::tuple<std::string, std::string, int>> cases = {
        {"quarterly_sales", "bar", 95},
        {"monthly_revenue", "line", 90},
        {"daily_visits", "scatter", 85}
    };

    for (const auto& [dataType, chartType, base] : cases) {
        for (int i = 0; i < 200; ++i) {
            int score = scorer.scoreChartAppropriateness(dataType, chartType);
            EXPECT_GE(score, base - 5);
            EXPECT_LE(score, base + 5);
        }
    }
}

TEST_F(ScorerTest, ScoreChartAppropriatenessUnknownPair) {
    for (int i = 0; i < 200; ++i) {
        int score = scorer.scoreChartAppropriateness("unknown", "unknown");
        EXPECT_GE(score, 45);
        EXPECT_LE(score, 55);
    }
}

TEST_F(ScorerTest, CalculateChartScore) {
    int baseAppropriateness = 95;
    int baseClarity = 80;
    int baseAccuracy = 85;

    int minScore = static_cast<int>(baseAppropriateness * 0.4 + baseClarity * 0.3 + baseAccuracy * 0.3);
    int maxScore = static_cast<int>(baseAppropriateness * 0.5 + baseClarity * 0.4 + baseAccuracy * 0.4);

    for (int i = 0; i < 200; ++i) {
        int score = scorer.calculateChartScore(baseAppropriateness, baseClarity, baseAccuracy);
        EXPECT_GE(score, minScore);
        EXPECT_LE(score, maxScore);
    }
}