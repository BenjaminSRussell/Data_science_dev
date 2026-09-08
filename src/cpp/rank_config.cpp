#include "rank_config.h"

namespace RankConfig {

const double SALARY_MULTIPLIERS[RANK_COUNT] = {1.0, 1.5, 2.0, 3.0, 5.0, 8.0,
                                               15.0};

const int RANK_THRESHOLDS[RANK_COUNT] = {0, 100, 300, 600, 1200, 2500, 5000};

} // namespace RankConfig
