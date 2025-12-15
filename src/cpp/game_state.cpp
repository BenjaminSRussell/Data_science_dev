#include "game_state.h"
#include <sstream>

GameState::GameState() { reset(); }

GameState::~GameState() {}

// Money management
int GameState::getMoney() const { return money; }

void GameState::setMoney(int amount) { money = amount; }

void GameState::addMoney(int amount) { money += amount; }

// Reputation management
int GameState::getReputation() const { return reputation; }

void GameState::setReputation(int amount) { reputation = amount; }

void GameState::addReputation(int amount) { reputation += amount; }

// Rank management
int GameState::getRankIndex() const { return rankIndex; }

void GameState::setRankIndex(int index) {
  if (index >= 0 && index <= MAX_RANK) {
    rankIndex = index;
  }
}

bool GameState::canPromote(int requiredRep) const {
  return reputation >= requiredRep && rankIndex < MAX_RANK;
}

// Task tracking
int GameState::getTasksCompleted() const { return tasksCompleted; }

void GameState::incrementTasksCompleted() { tasksCompleted++; }

// Statistics
int GameState::getPerfectScores() const { return perfectScores; }

void GameState::incrementPerfectScores() { perfectScores++; }

int GameState::getTotalEarned() const { return totalEarned; }

void GameState::addToTotalEarned(int amount) { totalEarned += amount; }

// Reset state
void GameState::reset() {
  money = INITIAL_MONEY;
  reputation = 0;
  rankIndex = 0;
  tasksCompleted = 0;
  perfectScores = 0;
  totalEarned = 0;
}

// Serialization
std::string GameState::toJSON() const {
  std::ostringstream ss;
  ss << "{";
  ss << "\"money\":" << money << ",";
  ss << "\"reputation\":" << reputation << ",";
  ss << "\"rankIndex\":" << rankIndex << ",";
  ss << "\"tasksCompleted\":" << tasksCompleted << ",";
  ss << "\"perfectScores\":" << perfectScores << ",";
  ss << "\"totalEarned\":" << totalEarned;
  ss << "}";
  return ss.str();
}

void GameState::fromJSON(const std::string &json) {
  // Simple JSON parsing (in production, use a proper JSON library)
  // For now, this is a placeholder
  reset();
}
