#include "doctest.h"
#include "economy.h"
#include "task_system.h"

TEST_CASE("TaskSystem::getDifficultyForRank tiers") {
  TaskSystem t;
  for (int r : {-1, 0, 1})
    CHECK(t.getDifficultyForRank(r) == 1);
  for (int r : {2, 3})
    CHECK(t.getDifficultyForRank(r) == 2);
  for (int r : {4, 5})
    CHECK(t.getDifficultyForRank(r) == 3);
  for (int r : {6, 7, 100})
    CHECK(t.getDifficultyForRank(r) == 4);
}

TEST_CASE("TaskSystem::getTimeLimitForDifficulty") {
  TaskSystem t;
  CHECK(t.getTimeLimitForDifficulty(1) == 300);
  CHECK(t.getTimeLimitForDifficulty(2) == 240);
  CHECK(t.getTimeLimitForDifficulty(3) == 200);
  CHECK(t.getTimeLimitForDifficulty(4) == 150);
  for (int d : {0, 5, -1})
    CHECK(t.getTimeLimitForDifficulty(d) == 300);
}

TEST_CASE("TaskSystem::getBaseReward is rank-independent") {
  TaskSystem t;
  CHECK(t.getBaseReward(1) == 120);
  CHECK(t.getBaseReward(4) == 180);
  CHECK(t.getBaseReward(0) == 100);
}

TEST_CASE("TaskSystem::calculatePotentialReward = par reward, rank applied once (#151, #891)") {
  TaskSystem t;
  Economy e;
  const double table[] = {1.0, 1.5, 2.0, 3.0, 5.0, 8.0, 15.0};
  for (int r = 0; r <= 6; r++) {
    for (int d = 1; d <= 4; d++) {
      int expected = static_cast<int>((100 + d * 20) * table[r]);
      CHECK(t.calculatePotentialReward(r, d) == expected);
      // Same as paying the base at 4 stars through Economy
      CHECK(t.calculatePotentialReward(r, d) ==
            e.calculateReward(t.getBaseReward(d), 4, e.getSalaryMultiplier(r)));
    }
  }
  CHECK(t.calculatePotentialReward(0, 1) == 120);
  CHECK(t.calculatePotentialReward(6, 4) == 2700);
  // out-of-range ranks fall back to 1.0x
  CHECK(t.calculatePotentialReward(-1, 2) == 140);
  CHECK(t.calculatePotentialReward(7, 2) == 140);
}

TEST_CASE("Composing TaskSystem with Economy applies the rank multiplier once (#151)") {
  TaskSystem t;
  Economy e;
  // rank 6, difficulty 4, 5 stars: 180 * 1.3 * 15 = 3510 (was 1580 * 1.3 * 15 = 30810)
  int earned = e.calculateReward(t.getBaseReward(4), 5, e.getSalaryMultiplier(6));
  CHECK(earned == 3510);
}
