#include "doctest.h"
#include "scorer.h"

#include <set>

TEST_CASE("Scorer::getStarsFromScore boundaries") {
  Scorer s(1);
  const int cases[][2] = {{34, 1}, {35, 2}, {54, 2}, {55, 3}, {74, 3}, {75, 4},
                          {89, 4}, {90, 5}, {100, 5}, {-10, 1}, {150, 5}, {0, 1}};
  for (const auto &c : cases)
    CHECK(s.getStarsFromScore(c[0]) == c[1]);
}

TEST_CASE("Scorer::combineScores weights, rounding and clamp (#894)") {
  CHECK(Scorer::combineScores(100, 100, 100) == 100);
  CHECK(Scorer::combineScores(0, 0, 0) == 0);
  // exact 90: (90*3 + 90 + 90) / 5 must not truncate to 89
  CHECK(Scorer::combineScores(90, 90, 90) == 90);
  CHECK(Scorer::combineScores(100, 70, 80) == 90);
  // rounding: 3*50+51+50 = 251 -> 50.2 -> 50; 3*50+52+51 = 253 -> 50.6 -> 51
  CHECK(Scorer::combineScores(50, 51, 50) == 50);
  CHECK(Scorer::combineScores(50, 52, 51) == 51);
  // half rounds up: 3*0+0+2 = 2 -> 0.4 -> 0; 3*1+0+0 = 3 -> 0.6 -> 1
  CHECK(Scorer::combineScores(0, 0, 2) == 0);
  CHECK(Scorer::combineScores(1, 0, 0) == 1);
  CHECK(Scorer::combineScores(200, 200, 200) == 100);
  CHECK(Scorer::combineScores(-50, -50, -50) == 0);
}

TEST_CASE("Scorer::scoreVisualClarity per flag combo") {
  Scorer s(42);
  for (int mask = 0; mask < 8; mask++) {
    bool legend = mask & 1, title = mask & 2, grid = mask & 4;
    int base = 50 + (legend ? 20 : 0) + (title ? 20 : 0) + (grid ? 10 : 0);
    for (int i = 0; i < 200; i++) {
      int v = s.scoreVisualClarity(legend, title, grid);
      CHECK(v >= std::max(0, base - 3));
      CHECK(v <= std::min(100, base + 3));
    }
  }
}

TEST_CASE("Scorer::scoreDataAccuracy range") {
  Scorer s(7);
  int lo = 1000, hi = -1;
  for (int i = 0; i < 2000; i++) {
    int v = s.scoreDataAccuracy();
    lo = std::min(lo, v);
    hi = std::max(hi, v);
  }
  CHECK(lo >= 60);
  CHECK(hi <= 100);
  CHECK(lo < 65); // the low end is actually reachable
  CHECK(hi > 95);
}

TEST_CASE("Scorer::scoreChartAppropriateness known pairs and default") {
  Scorer s(3);
  for (int i = 0; i < 200; i++) {
    int good = s.scoreChartAppropriateness("quarterly_sales", "bar");
    CHECK(good >= 90);
    CHECK(good <= 100);
    int bad = s.scoreChartAppropriateness("trend_analysis", "pie");
    CHECK(bad >= 15);
    CHECK(bad <= 25);
    int unknown = s.scoreChartAppropriateness("nope", "bar");
    CHECK(unknown >= 45);
    CHECK(unknown <= 55);
  }
}

TEST_CASE("Scorer: a bad chart can score 1 star, a great one 5 (#209)") {
  Scorer s(11);
  std::set<int> worst, best;
  for (int i = 0; i < 3000; i++) {
    worst.insert(s.getStarsFromScore(s.calculateChartScore("trend_analysis", "pie", false, false, false)));
    best.insert(s.getStarsFromScore(s.calculateChartScore("quarterly_sales", "bar", true, true, true)));
  }
  CHECK(worst.count(1) == 1);
  CHECK(*worst.rbegin() <= 2);
  CHECK(best.count(5) == 1);
  CHECK(*best.begin() >= 4);
  // floor of the formula: worst components 15 / 47 / 60
  CHECK(s.getStarsFromScore(Scorer::combineScores(15, 47, 60)) == 1);
}

TEST_CASE("Scorer instances don't share or reset RNG state (#85)") {
  Scorer a(123), b(123), c(456);
  std::vector<int> va, vb, vc;
  for (int i = 0; i < 50; i++) {
    va.push_back(a.scoreDataAccuracy());
    vb.push_back(b.scoreDataAccuracy());
    vc.push_back(c.scoreDataAccuracy());
  }
  CHECK(va == vb); // same seed -> same sequence (deterministic replays)
  CHECK(va != vc);
  // default-constructed instances made back to back don't repeat each other
  Scorer d, e;
  std::vector<int> vd, ve;
  for (int i = 0; i < 50; i++) {
    vd.push_back(d.scoreDataAccuracy());
    ve.push_back(e.scoreDataAccuracy());
  }
  CHECK(vd != ve);
}
