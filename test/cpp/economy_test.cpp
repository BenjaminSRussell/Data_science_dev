#include "doctest.h"
#include "economy.h"

TEST_CASE("Economy::calculateReward star multipliers and floor") {
  Economy e;
  CHECK(e.calculateReward(100, 1, 1.0) == 20);
  CHECK(e.calculateReward(100, 2, 1.0) == 40);
  CHECK(e.calculateReward(1000, 3, 1.0) == 700);
  CHECK(e.calculateReward(100, 4, 1.0) == 100);
  CHECK(e.calculateReward(100, 5, 1.0) == 130);
  CHECK(e.calculateReward(1000, 5, 2.0) == 2600);
  // floor of 10
  CHECK(e.calculateReward(1, 1, 1.0) == 10);
  CHECK(e.calculateReward(-100, 1, 1.0) == 10);
}

TEST_CASE("Economy::calculateReward clamps out-of-range stars (#890)") {
  Economy e;
  // 0 stars / failed used to pay 1.0x (5x a 1-star result)
  CHECK(e.calculateReward(1000, 0, 1.0) == e.calculateReward(1000, 1, 1.0));
  CHECK(e.calculateReward(1000, -3, 1.0) == 200);
  CHECK(e.calculateReward(1000, 6, 1.0) == e.calculateReward(1000, 5, 1.0));
  for (int stars = -2; stars <= 7; stars++)
    CHECK(e.calculateReward(1000, stars, 1.0) <= e.calculateReward(1000, 5, 1.0));
}

TEST_CASE("Economy::calculateReputation") {
  Economy e;
  const int expected[] = {2, 5, 10, 18, 30};
  for (int s = 1; s <= 5; s++)
    CHECK(e.calculateReputation(s) == expected[s - 1]);
  CHECK(e.calculateReputation(0) == 2);
  CHECK(e.calculateReputation(-1) == 2);
  CHECK(e.calculateReputation(6) == 30);
}

TEST_CASE("Economy salary table is the single source (#891)") {
  Economy e;
  const double table[] = {1.0, 1.5, 2.0, 3.0, 5.0, 8.0, 15.0};
  for (int r = 0; r <= Economy::MAX_RANK; r++) {
    CHECK(e.getSalaryMultiplier(r) == doctest::Approx(table[r]));
    CHECK(Economy::salaryMultiplierFor(r) == doctest::Approx(table[r]));
  }
  CHECK(e.getSalaryMultiplier(-1) == doctest::Approx(1.0));
  CHECK(e.getSalaryMultiplier(7) == doctest::Approx(1.0));
}

TEST_CASE("Economy::getRequiredReputation and canPromote") {
  Economy e;
  const int thresholds[] = {0, 100, 300, 600, 1200, 2500, 5000};
  for (int r = 0; r <= 6; r++)
    CHECK(e.getRequiredReputation(r) == thresholds[r]);
  CHECK(e.getRequiredReputation(-1) == 999999);
  CHECK(e.getRequiredReputation(7) == 999999);

  CHECK_FALSE(e.canPromote(1000000, 6));
  CHECK_FALSE(e.canPromote(4999, 5));
  CHECK(e.canPromote(5000, 5));
  CHECK_FALSE(e.canPromote(99, 0));
  CHECK(e.canPromote(100, 0));
  // currentRank -1 is unguarded: needs getRequiredReputation(0) == 0
  CHECK(e.canPromote(0, -1));
}

TEST_CASE("Economy::clampStars") {
  CHECK(Economy::clampStars(-5) == 1);
  CHECK(Economy::clampStars(0) == 1);
  CHECK(Economy::clampStars(3) == 3);
  CHECK(Economy::clampStars(9) == 5);
}
