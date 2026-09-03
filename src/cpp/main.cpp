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
 */

#include <emscripten/bind.h>
#include <emscripten/emscripten.h>
#include <cstdlib>
#include <ctime>
#include "game_state.h"
#include "data_generator.h"
#include "scorer.h"
#include "economy.h"

using namespace emscripten;

// Expose C++ classes to JavaScript
EMSCRIPTEN_BINDINGS(DataScienceTycoon) {
    
    // GameState class
    class_<GameState>("GameState")
        .constructor<>()
        .function("getMoney", &GameState::getMoney)
        .function("setMoney", &GameState::setMoney)
        .function("getReputation", &GameState::getReputation)
        .function("setReputation", &GameState::setReputation)
        .function("getRankIndex", &GameState::getRankIndex)
        .function("setRankIndex", &GameState::setRankIndex)
        .function("getTasksCompleted", &GameState::getTasksCompleted)
        .function("incrementTasksCompleted", &GameState::incrementTasksCompleted)
        .function("reset", &GameState::reset);
    
    // DataGenerator class
    class_<DataGenerator>("DataGenerator")
        .constructor<>()
        .function("generateQuarterlySales", &DataGenerator::generateQuarterlySalesJSON)
        .function("generateMonthlyRevenue", &DataGenerator::generateMonthlyRevenueJSON)
        .function("generateProductComparison", &DataGenerator::generateProductComparisonJSON)
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
        .function("getSalaryMultiplier", &Economy::getSalaryMultiplier);
    
    // Utility functions
    function("getVersion", &getVersion);
    function("initializeWASM", &initializeWASM);
}

// Version info
std::string getVersion() {
    return "1.0.0";
}

// Initialize WASM module
bool initializeWASM() {
    // Seed the global RNG once at program start
    srand(static_cast<unsigned int>(time(nullptr)));
    return true;
}

// Main function for WASM
int main() {
    // Seed the global RNG once at program start
    srand(static_cast<unsigned int>(time(nullptr)));
    // WASM module initialized
    return 0;
}
