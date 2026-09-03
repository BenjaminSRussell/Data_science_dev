// Tests for Economy (src/cpp/economy.h/.cpp)
// Build: g++ -std=c++11 -Isrc/cpp test/cpp/economy_test.cpp src/cpp/economy.cpp -o economy_test
#include "economy.h"
#include <cstdio>
#include <cstdlib>

static int failures = 0;

#define CHECK_INT(expr, expected)                                            \
  do {                                                                       \
    int got = (expr);                                                        \
    int want = (expected);                                                   \
    if (got != want) {                                                       \
      std::printf("FAIL %s: got %d, expected %d\n", #expr, got, want);       \
      ++failures;                                                            \
    }                                                                        \
  } while (0)

#define CHECK_DOUBLE(expr, expected)                                         \
  do {                                                                       \
    double got = (expr);                                                     \
    double want = (expected);                                                \
    if (got != want) {                                                       \
      std::printf("FAIL %s: got %f, expected %f\n", #expr, got, want);       \
      ++failures;                                                            \
    }                                                                        \
  } while (0)

#define CHECK_BOOL(expr, expected)                                           \
  do {                                                                       \
    bool got = (expr);                                                       \
    bool want = (expected);                                                  \
    if (got != want) {                                                       \
      std::printf("FAIL %s: got %d, expected %d\n", #expr, (int)got,         \
                  (int)want);                                                \
      ++failures;                                                            \
    }                                                                        \
  } while (0)

int main() {
  Economy e;

  // calculateReward: star multipliers {0.2,0.4,0.7,1.0,1.3}
  CHECK_INT(e.calculateReward(100, 1, 1.0), 20);
  CHECK_INT(e.calculateReward(100, 5, 1.0), 130);
  // Invalid star count -> multiplier defaults to 1.0
  CHECK_INT(e.calculateReward(100, 0, 1.0), 100);
  CHECK_INT(e.calculateReward(100, 6, 1.0), 100);
  // std::max(10, reward) floor
  CHECK_INT(e.calculateReward(1, 1, 1.0), 10);
  CHECK_INT(e.calculateReward(-100, 1, 1.0), 10);

  // calculateReputation: table {2,5,10,18,30}, default 5
  CHECK_INT(e.calculateReputation(1), 2);
  CHECK_INT(e.calculateReputation(5), 30);
  CHECK_INT(e.calculateReputation(0), 5);
  CHECK_INT(e.calculateReputation(6), 5);
  CHECK_INT(e.calculateReputation(-1), 5);

  // getSalaryMultiplier: table {1.0,1.5,2.0,3.0,5.0,8.0,15.0}, default 1.0
  CHECK_DOUBLE(e.getSalaryMultiplier(0), 1.0);
  CHECK_DOUBLE(e.getSalaryMultiplier(6), 15.0);
  CHECK_DOUBLE(e.getSalaryMultiplier(-1), 1.0);
  CHECK_DOUBLE(e.getSalaryMultiplier(7), 1.0);

  // getRequiredReputation: table {0,100,300,600,1200,2500,5000}, sentinel 999999
  CHECK_INT(e.getRequiredReputation(0), 0);
  CHECK_INT(e.getRequiredReputation(6), 5000);
  CHECK_INT(e.getRequiredReputation(-1), 999999);
  CHECK_INT(e.getRequiredReputation(7), 999999);

  // canPromote: max rank always false
  CHECK_BOOL(e.canPromote(999999, 6), false);
  // rank 5 boundary inclusive
  CHECK_BOOL(e.canPromote(4999, 5), false);
  CHECK_BOOL(e.canPromote(5000, 5), true);
  // rank -1 unguarded: getRequiredReputation(0)==0, any non-negative rep promotes
  CHECK_BOOL(e.canPromote(0, -1), true);
  CHECK_BOOL(e.canPromote(1, -1), true);

  if (failures == 0) {
    std::printf("All Economy tests passed.\n");
    return 0;
  }
  std::printf("%d test(s) failed.\n", failures);
  return 1;
}
