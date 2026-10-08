#include "game_state.h"
#include <cctype>
#include <limits>
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
  if (index >= 0 && index <= Economy::MAX_RANK) {
    rankIndex = index;
  }
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

namespace {

// Read the integer value of "key": from a flat JSON object. Only the text
// right after the key is considered (whitespace, optional '-', digits), so a
// non-numeric value can't borrow digits from a later field, and malformed or
// out-of-range values are rejected instead of throwing (#83).
bool readIntField(const std::string &json, const std::string &key, int &out) {
  const std::string needle = "\"" + key + "\"";
  size_t pos = json.find(needle);
  if (pos == std::string::npos)
    return false;
  pos += needle.size();
  while (pos < json.size() && std::isspace(static_cast<unsigned char>(json[pos])))
    pos++;
  if (pos >= json.size() || json[pos] != ':')
    return false;
  pos++;
  while (pos < json.size() && std::isspace(static_cast<unsigned char>(json[pos])))
    pos++;

  bool negative = false;
  if (pos < json.size() && json[pos] == '-') {
    negative = true;
    pos++;
  }
  size_t digitsStart = pos;
  long long value = 0;
  while (pos < json.size() && std::isdigit(static_cast<unsigned char>(json[pos]))) {
    value = value * 10 + (json[pos] - '0');
    if (value > static_cast<long long>(std::numeric_limits<int>::max()) + 1)
      return false; // overflow
    pos++;
  }
  if (pos == digitsStart)
    return false; // no digits: null, string, bare '-', ...
  // Must end the value: ',', '}', whitespace or end of input (rejects 1.5, 12abc)
  if (pos < json.size() && json[pos] != ',' && json[pos] != '}' &&
      !std::isspace(static_cast<unsigned char>(json[pos])))
    return false;

  if (negative)
    value = -value;
  if (value < std::numeric_limits<int>::min() ||
      value > std::numeric_limits<int>::max())
    return false;
  out = static_cast<int>(value);
  return true;
}

} // namespace

void GameState::fromJSON(const std::string &json) {
  // Fields that are missing or malformed keep their reset() defaults
  reset();

  int value;
  if (readIntField(json, "money", value))
    money = value;
  if (readIntField(json, "reputation", value))
    reputation = value;
  if (readIntField(json, "rankIndex", value))
    setRankIndex(value);
  if (readIntField(json, "tasksCompleted", value))
    tasksCompleted = value;
  if (readIntField(json, "perfectScores", value))
    perfectScores = value;
  if (readIntField(json, "totalEarned", value))
    totalEarned = value;
}
