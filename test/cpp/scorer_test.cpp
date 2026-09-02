#include "vendor/doctest.h"
#include "src/cpp/scorer.h"

TEST_CASE("Scorer functionality") {
    Scorer scorer;
    int score = scorer.calculateChartScore(100);
    int stars = scorer.getStarsFromScore(score);

    CHECK(score > 0);
    CHECK(stars >= 0);
}