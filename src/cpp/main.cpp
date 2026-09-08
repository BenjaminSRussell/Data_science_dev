#include <emscripten/bind.h>
#include "game_state.h"
#include "data_generator.h"
#include "scorer.h"
#include "economy.h"
#include "task_system.h"

using namespace emscripten;

EMSCRIPTEN_BINDINGS(module) {
  class_<GameState>("GameState")
    .constructor<>()
    .function("update", &GameState::update)
    .function("getScore", &GameState::getScore);

  class_<DataGenerator>("DataGenerator")
    .constructor<>()
    .function("generateData", &DataGenerator::generateData);

  class_<Scorer>("Scorer")
    .constructor<>()
    .function("calculateScore", &Scorer::calculateScore)
    .function("getStarsFromScore", &Scorer::getStarsFromScore);

  class_<Economy>("Economy")
    .constructor<>()
    .function("getPriceForItem", &Economy::getPriceForItem)
    .function("updateCurrency", &Economy::updateCurrency);

  class_<TaskSystem>("TaskSystem")
    .constructor<>()
    .function("getDifficultyForRank", &TaskSystem::getDifficultyForRank)
    .function("calculatePotentialReward", &TaskSystem::calculatePotentialReward)
    .function("getTimeLimitForDifficulty", &TaskSystem::getTimeLimitForDifficulty);
}