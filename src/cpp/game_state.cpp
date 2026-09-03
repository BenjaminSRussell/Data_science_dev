#include "game_state.h"
#include <sstream>
#include <cstdlib>
#include <cerrno>
#include <climits>

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
  // Basic JSON parsing - extracts numeric values from JSON string
  // For production, consider using a proper JSON library like nlohmann/json
  reset();

  // Parse the integer value of a single field, bounded to the field's own
  // value (up to the next ',' or '}') so a missing/non-numeric value can
  // never leak digits from a later field. Returns false if the field is
  // absent or its value is not a valid integer.
  auto parseField = [&json](const char *key, int &out) -> bool {
    size_t pos = json.find(key);
    if (pos == std::string::npos) return false;
    pos += std::string(key).size();
    // Skip whitespace after the colon
    while (pos < json.size() && (json[pos] == ' ' || json[pos] == '\t' ||
                                 json[pos] == '\n' || json[pos] == '\r')) {
      pos++;
    }
    if (pos >= json.size()) return false;
    // Bound the value at the next ',' or '}'
    size_t end = json.find_first_of(",}", pos);
    if (end == std::string::npos) end = json.size();
    std::string value = json.substr(pos, end - pos);
    // Trim surrounding whitespace
    size_t b = value.find_first_not_of(" \t\n\r");
    if (b == std::string::npos) return false;
    size_t e = value.find_last_not_of(" \t\n\r");
    value = value.substr(b, e - b + 1);
    // Validate: optional sign followed by at least one digit
    size_t i = 0;
    if (value[i] == '-' || value[i] == '+') i++;
    if (i >= value.size()) return false;
    for (size_t j = i; j < value.size(); j++) {
      if (value[j] < '0' || value[j] > '9') return false;
    }
    errno = 0;
    char *endp = nullptr;
    long v = std::strtol(value.c_str(), &endp, 10);
    if (errno == ERANGE || endp == value.c_str() || *endp != '\0') return false;
    if (v < INT_MIN || v > INT_MAX) return false;
    out = static_cast<int>(v);
    return true;
  };

  parseField("\"money\":", money);
  parseField("\"reputation\":", reputation);
  int idx;
  if (parseField("\"rankIndex\":", idx)) {
    setRankIndex(idx);
  }
  parseField("\"tasksCompleted\":", tasksCompleted);
  parseField("\"perfectScores\":", perfectScores);
  parseField("\"totalEarned\":", totalEarned);
}
