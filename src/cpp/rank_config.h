#ifndef RANK_CONFIG_H
#define RANK_CONFIG_H

/**
 * RankConfig - Shared rank-indexed economic constants.
 *
 * Single source of truth for the per-rank pay/reward scaling factors and
 * rank reputation thresholds, used by both Economy and TaskSystem.
 */
namespace RankConfig {

// Number of ranks
constexpr int RANK_COUNT = 7;

// Per-rank salary/reward multipliers
extern const double SALARY_MULTIPLIERS[RANK_COUNT];

// Reputation required to reach each rank
extern const int RANK_THRESHOLDS[RANK_COUNT];

} // namespace RankConfig

#endif // RANK_CONFIG_H
