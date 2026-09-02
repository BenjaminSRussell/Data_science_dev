#include "vendor/doctest.h"
#include "src/cpp/economy.h"

TEST_CASE("Economy functionality") {
    Economy economy;
    int reward = economy.calculateReward(100);
    int reputation = economy.calculateReputation(100);
    double salaryMultiplier = economy.getSalaryMultiplier();

    CHECK(reward > 0);
    CHECK(reputation > 0);
    CHECK(salaryMultiplier > 0);
}