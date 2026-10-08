#include "doctest.h"
#include "game_state.h"

namespace {
void expectDefaults(const GameState &g) {
  CHECK(g.getMoney() == 100);
  CHECK(g.getReputation() == 0);
  CHECK(g.getRankIndex() == 0);
  CHECK(g.getTasksCompleted() == 0);
  CHECK(g.getPerfectScores() == 0);
  CHECK(g.getTotalEarned() == 0);
}
} // namespace

TEST_CASE("GameState defaults and reset") {
  GameState g;
  expectDefaults(g);
  g.setMoney(5);
  g.addReputation(9);
  g.setRankIndex(3);
  g.incrementTasksCompleted();
  g.incrementPerfectScores();
  g.addToTotalEarned(50);
  g.reset();
  expectDefaults(g);
}

TEST_CASE("GameState money/reputation mutators accumulate, negatives allowed") {
  GameState g;
  g.addMoney(50);
  g.addMoney(-200);
  CHECK(g.getMoney() == -50);
  g.setMoney(1000);
  CHECK(g.getMoney() == 1000);
  g.addReputation(30);
  g.addReputation(-40);
  CHECK(g.getReputation() == -10);
  g.addToTotalEarned(70);
  g.addToTotalEarned(-20);
  CHECK(g.getTotalEarned() == 50);
}

TEST_CASE("GameState::setRankIndex only accepts 0..6") {
  GameState g;
  g.setRankIndex(4);
  CHECK(g.getRankIndex() == 4);
  g.setRankIndex(-1);
  CHECK(g.getRankIndex() == 4);
  g.setRankIndex(7);
  CHECK(g.getRankIndex() == 4);
  g.setRankIndex(6);
  CHECK(g.getRankIndex() == 6);
  g.setRankIndex(0);
  CHECK(g.getRankIndex() == 0);
}

TEST_CASE("GameState counters") {
  GameState g;
  for (int i = 0; i < 3; i++)
    g.incrementTasksCompleted();
  g.incrementPerfectScores();
  CHECK(g.getTasksCompleted() == 3);
  CHECK(g.getPerfectScores() == 1);
}

TEST_CASE("GameState toJSON/fromJSON round trip, including negatives") {
  GameState a;
  a.setMoney(-50);
  a.setReputation(1234);
  a.setRankIndex(5);
  for (int i = 0; i < 7; i++)
    a.incrementTasksCompleted();
  a.incrementPerfectScores();
  a.addToTotalEarned(987654);

  GameState b;
  b.fromJSON(a.toJSON());
  CHECK(b.getMoney() == -50);
  CHECK(b.getReputation() == 1234);
  CHECK(b.getRankIndex() == 5);
  CHECK(b.getTasksCompleted() == 7);
  CHECK(b.getPerfectScores() == 1);
  CHECK(b.getTotalEarned() == 987654);
  CHECK(b.toJSON() == a.toJSON());
}

TEST_CASE("GameState::fromJSON resets fields missing from a partial object") {
  GameState g;
  g.setMoney(999);
  g.addReputation(50);
  g.incrementTasksCompleted();
  g.fromJSON("{\"reputation\":42}");
  CHECK(g.getReputation() == 42);
  CHECK(g.getMoney() == 100);
  CHECK(g.getTasksCompleted() == 0);
}

TEST_CASE("GameState::fromJSON is bounded per field and never throws (#83)") {
  GameState g;
  // non-numeric value must not borrow the next field's digits
  CHECK_NOTHROW(g.fromJSON("{\"money\":null,\"reputation\":50}"));
  CHECK(g.getMoney() == 100);
  CHECK(g.getReputation() == 50);

  // bare '-' used to make std::stoi("") throw
  CHECK_NOTHROW(g.fromJSON("{\"money\":-,\"reputation\":7}"));
  CHECK(g.getMoney() == 100);
  CHECK(g.getReputation() == 7);

  CHECK_NOTHROW(g.fromJSON("{\"money\":\"12\",\"tasksCompleted\":3}"));
  CHECK(g.getMoney() == 100);
  CHECK(g.getTasksCompleted() == 3);

  // whitespace around ':' and before ',' / '}' is fine
  g.fromJSON("{ \"money\" : 250 , \"rankIndex\": 2 }");
  CHECK(g.getMoney() == 250);
  CHECK(g.getRankIndex() == 2);

  // trailing number at end of input
  g.fromJSON("\"perfectScores\":9");
  CHECK(g.getPerfectScores() == 9);

  // fractions, junk suffixes and int overflow are rejected
  CHECK_NOTHROW(g.fromJSON("{\"money\":1.5,\"reputation\":12abc,\"totalEarned\":99999999999}"));
  CHECK(g.getMoney() == 100);
  CHECK(g.getReputation() == 0);
  CHECK(g.getTotalEarned() == 0);

  // int limits are accepted
  g.fromJSON("{\"money\":2147483647,\"reputation\":-2147483648}");
  CHECK(g.getMoney() == 2147483647);
  CHECK(g.getReputation() == -2147483647 - 1);

  // out-of-range rank still goes through setRankIndex's guard
  g.fromJSON("{\"rankIndex\":9}");
  CHECK(g.getRankIndex() == 0);

  CHECK_NOTHROW(g.fromJSON(""));
  CHECK_NOTHROW(g.fromJSON("garbage"));
  CHECK(g.getMoney() == 100);
}
