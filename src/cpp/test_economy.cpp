// Regression test for Economy::calculateReward out-of-range star handling.
//
// Build & run (no WASM/emscripten needed):
//   g++ -std=c++17 -o test_economy test_economy.cpp economy.cpp && ./test_economy
//
// Verifies that out-of-range star values (0, negative, >5) fall back to the
// worst-case tier (0.2, same as 1 star) instead of the old default of 1.0.

#include "economy.h"
#include <cassert>
#include <cstdio>

int main() {
  Economy economy;

  // 1-star is the worst valid tier: 100 * 0.2 * 1.0 = 20
  int oneStar = economy.calculateReward(100, 1, 1.0);
  assert(oneStar == 20);

  // Out-of-range values must match the 1-star (worst-case) reward,
  // not the old near-maximum 1.0 multiplier (which would give 100).
  assert(economy.calculateReward(100, 0, 1.0) == oneStar);
  assert(economy.calculateReward(100, -3, 1.0) == oneStar);
  assert(economy.calculateReward(100, 6, 1.0) == oneStar);
  assert(economy.calculateReward(100, 99, 1.0) == oneStar);

  // In-range tiers still behave as before.
  assert(economy.calculateReward(100, 2, 1.0) == 40);  // 0.4
  assert(economy.calculateReward(100, 3, 1.0) == 70);  // 0.7
  assert(economy.calculateReward(100, 4, 1.0) == 100); // 1.0
  assert(economy.calculateReward(100, 5, 1.0) == 130); // 1.3

  // Minimum reward floor of 10 still applies.
  assert(economy.calculateReward(1, 0, 1.0) == 10);

  std::printf("All Economy::calculateReward regression checks passed.\n");
  return 0;
}
