#ifndef GAME_STATE_H
#define GAME_STATE_H

#include <string>
#include <vector>

#include "economy.h"

/**
 * GameState - Core game state management in C++
 * High-performance state management for WASM
 */
class GameState {
public:
  GameState();
  ~GameState();

  // Money management
  int getMoney() const;
  void setMoney(int amount);
  void addMoney(int amount);

  // Reputation management
  int getReputation() const;
  void setReputation(int amount);
  void addReputation(int amount);

  // Rank management
  int getRankIndex() const;
  void setRankIndex(int index);

  // Task tracking
  int getTasksCompleted() const;
  void incrementTasksCompleted();

  // Statistics
  int getPerfectScores() const;
  void incrementPerfectScores();
  int getTotalEarned() const;
  void addToTotalEarned(int amount);

  // Reset state
  void reset();

  // Serialization
  std::string toJSON() const;
  void fromJSON(const std::string &json);

private:
  int money;
  int reputation;
  int rankIndex;
  int tasksCompleted;
  int perfectScores;
  int totalEarned;

  // Configuration
  static const int INITIAL_MONEY = 100;

public:
  // Invariants enforced by every mutator and by fromJSON (#152).
  // Money may go negative (rent/debt) but never below MIN_MONEY, reputation
  // never drops below MIN_REPUTATION (rank math assumes >= 0), totalEarned is
  // lifetime earnings and only grows. Additions saturate instead of overflowing.
  static const int MIN_MONEY = -1000000000;
  static const int MIN_REPUTATION = 0;
};

#endif // GAME_STATE_H
