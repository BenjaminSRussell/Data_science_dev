/**
 * Data Science Tycoon - C++ WASM Core
 * Main entry point for WebAssembly module
 * 
 * Build with:
 * emcc src/cpp/main.cpp src/cpp/game_state.cpp src/cpp/data_generator.cpp \
 *      src/cpp/task_system.cpp src/cpp/scorer.cpp src/cpp/economy.cpp \
 *      -O3 -s WASM=1 -s MODULARIZE=1 -s EXPORT_ES6=1 \
 *      -s ENVIRONMENT=web -s ALLOW_MEMORY_GROWTH=1 \
 *      --bind -o public/wasm/game.js
 *
 * Native unit tests (no Emscripten): npm run test:cpp
 */

#include <emscripten/bind.h>
#include <emscripten/emscripten.h>
#include "game_state.h"
#include "data_generator.h"
#include "scorer.h"
#include "economy.h"
#include "task_system.h"

using namespace emscripten;

// Defined before EMSCRIPTEN_BINDINGS takes their addresses (#79)

// Version info
std::string getVersion() {
    return "1.0.0";
}

// Initialize WASM module
bool initializeWASM() {
    // Initialization logic here
    return true;
}

// Expose C++ classes to JavaScript
EMSCRIPTEN_BINDINGS(DataScienceTycoon) {
    
    // GameState class
    class_<GameState>("GameState")
        .constructor<>()
        .function("getMoney", &GameState::getMoney)
        .function("setMoney", &GameState::setMoney)
        .function("addMoney", &GameState::addMoney)
        .function("getReputation", &GameState::getReputation)
        .function("setReputation", &GameState::setReputation)
        .function("addReputation", &GameState::addReputation)
        .function("getRankIndex", &GameState::getRankIndex)
        .function("setRankIndex", &GameState::setRankIndex)
        // Promotion checks live in Economy::canPromote(reputation, rank) (#893)
        .function("getTasksCompleted", &GameState::getTasksCompleted)
        .function("incrementTasksCompleted", &GameState::incrementTasksCompleted)
        .function("getPerfectScores", &GameState::getPerfectScores)
        .function("incrementPerfectScores", &GameState::incrementPerfectScores)
        .function("getTotalEarned", &GameState::getTotalEarned)
        .function("addToTotalEarned", &GameState::addToTotalEarned)
        .function("reset", &GameState::reset)
        .function("toJSON", &GameState::toJSON)
        .function("fromJSON", &GameState::fromJSON);
    
    // DataGenerator class
    class_<DataGenerator>("DataGenerator")
        .constructor<>()
        .function("generateQuarterlySales", &DataGenerator::generateQuarterlySalesJSON)
        .function("generateMonthlyRevenue", &DataGenerator::generateMonthlyRevenueJSON)
        .function("generateProductComparison", &DataGenerator::generateProductComparisonJSON)
        .function("generateCategoryBreakdown", &DataGenerator::generateCategoryBreakdownJSON)
        .function("generateTrendAnalysis", &DataGenerator::generateTrendAnalysisJSON)
        .function("generateRandomData", &DataGenerator::generateRandomDataJSON);
    
    // Scorer class
    class_<Scorer>("Scorer")
        .constructor<>()
        .function("calculateChartScore", &Scorer::calculateChartScore)
        .function("getStarsFromScore", &Scorer::getStarsFromScore);
    
    // Economy class
    class_<Economy>("Economy")
        .constructor<>()
        .function("calculateReward", &Economy::calculateReward)
        .function("calculateReputation", &Economy::calculateReputation)
        .function("getSalaryMultiplier", &Economy::getSalaryMultiplier)
        .function("canPromote", &Economy::canPromote)
        .function("getRequiredReputation", &Economy::getRequiredReputation);

    // TaskSystem class (#80)
    class_<TaskSystem>("TaskSystem")
        .constructor<>()
        .function("getDifficultyForRank", &TaskSystem::getDifficultyForRank)
        .function("getBaseReward", &TaskSystem::getBaseReward)
        .function("calculatePotentialReward", &TaskSystem::calculatePotentialReward)
        .function("getTimeLimitForDifficulty", &TaskSystem::getTimeLimitForDifficulty);
    
    // Utility functions
    function("getVersion", &getVersion);
    function("initializeWASM", &initializeWASM);
}

// Main function for WASM
int main() {
    // WASM module initialized
    return 0;
}
