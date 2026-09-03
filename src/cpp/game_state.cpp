#include "game_state.h"
#include <sstream>

GameState::GameState() { reset(); }

GameState::~GameState() {}

// Money management
int GameState::getMoney() const { return money; }

void GameState::setMoney(int amount) {
  if (amount >= MIN_MONEY) {
    money = amount;
  }
}

void GameState::addMoney(int amount) {
  if (money + amount >= MIN_MONEY) {
    money += amount;
  }
}

// Reputation management
int GameState::getReputation() const { return reputation; }

void GameState::setReputation(int amount) {
  if (amount >= MIN_REPUTATION) {
    reputation = amount;
  }
}

void GameState::addReputation(int amount) {
  if (reputation + amount >= MIN_REPUTATION) {
    reputation += amount;
  }
}

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

void GameState::addToTotalEarned(int amount) {
  if (totalEarned + amount >= MIN_TOTAL_EARNED) {
    totalEarned += amount;
  }
}

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
  // Basic JSON parsing - extracts numeric values from JSON string
  // For production, consider using a proper JSON library like nlohmann/json
  reset();
  
  // Find and extract values using simple string parsing
  size_t pos = json.find("\"money\":");
  if (pos != std::string::npos) {
    size_t start = json.find_first_of("0123456789-", pos);
    size_t end = json.find_first_not_of("0123456789", start);
    if (start != std::string::npos && end != std::string::npos) {
      money = std::stoi(json.substr(start, end - start));
    }
  }
  
  pos = json.find("\"reputation\":");
  if (pos != std::string::npos) {
    size_t start = json.find_first_of("0123456789-", pos);
    size_t end = json.find_first_not_of("0123456789", start);
    if (start != std::string::npos && end != std::string::npos) {
      reputation = std::stoi(json.substr(start, end - start));
    }
  }
  
  pos = json.find("\"rankIndex\":");
  if (pos != std::string::npos) {
    size_t start = json.find_first_of("0123456789-", pos);
    size_t end = json.find_first_not_of("0123456789", start);
    if (start != std::string::npos && end != std::string::npos) {
      int idx = std::stoi(json.substr(start, end - start));
      setRankIndex(idx);
    }
  }
  
  pos = json.find("\"tasksCompleted\":");
  if (pos != std::string::npos) {
    size_t start = json.find_first_of("0123456789-", pos);
    size_t end = json.find_first_not_of("0123456789", start);
    if (start != std::string::npos && end != std::string::npos) {
      tasksCompleted = std::stoi(json.substr(start, end - start));
    }
  }
  
  pos = json.find("\"perfectScores\":");
  if (pos != std::string::npos) {
    size_t start = json.find_first_of("0123456789-", pos);
    size_t end = json.find_first_not_of("0123456789", start);
    if (start != std::string::npos && end != std::string::npos) {
      perfectScores = std::stoi(json.substr(start, end - start));
    }
  }
  
  pos = json.find("\"totalEarned\":");
  if (pos != std::string::npos) {
    size_t start = json.find_first_of("0123456789-", pos);
    size_t end = json.find_first_not_of("0123456789", start);
    if (start != std::string::npos && end != std::string::npos) {
      totalEarned = std::stoi(json.substr(start, end - start));
    }
  }
}
