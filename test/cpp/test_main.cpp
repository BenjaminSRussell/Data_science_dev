// Native unit tests for src/cpp (no Emscripten). Run: npm run test:cpp
#define DOCTEST_CONFIG_IMPLEMENT_WITH_MAIN
#include "doctest.h"

TEST_CASE("harness sanity") { CHECK(1 + 1 == 2); }
