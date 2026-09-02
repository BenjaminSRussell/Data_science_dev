1. Grep `src/js/ui/` and `src/js/helpers/` for any reference to `gitHubIssuesSystem`/`githubIssuesSystem` (check the exact property name used in `GameState.js`/`main.js`) â€” is there a screen, button, or menu entry anywhere that surfaces `getOpenIssues()`, `assignIssue()`, `completeIssue()`, or `mergePullRequest()` to the player?

No references to `gitHubIssuesSystem` or `githubIssuesSystem` were found in `src/js/ui/` or `src/js/helpers/`. There is no screen, button, or menu entry that surfaces the `getOpenIssues()`, `assignIssue()`, `completeIssue()`, or `mergePullRequest()` methods to the player.

2. If a UI entry point exists, briefly describe it and confirm it actually exercises the real methods (not a stub).

N/A

3. If no UI entry point exists anywhere, this is a fully-implemented gameplay system with no way for a player to ever reach it â€” say so plainly, and give a rough estimate of what a minimal screen would need (a list view of open issues, an assign/complete action, a simple PR-review affordance) so a follow-up feature ticket could be scoped from your findings.

The `GitHubIssuesSystem` gameplay loop is fully implemented but there is no way for the player to interact with it through the UI. A minimal screen would need the following:

- A list view of open issues
- An action to assign an issue to the player
- An action to complete an issue for a money/reputation reward
- A simple PR-review affordance to merge the resulting pull request

4. Cross-check against `save`/serialization: does `GameState.toJSON()`/`fromJSON()` actually persist `gitHubIssuesSystem` state, or would progress in this system (if reachable) be lost on reload? Quote the relevant save/load code either way.

The `GameState.toJSON()` and `fromJSON()` methods do not persist the `gitHubIssuesSystem` state. The relevant code is as follows:

```javascript
toJSON() {
  return {
    // Other properties...
  };
}

fromJSON(data) {
  if (!data) return;
  // Other properties...
}
```

The `gitHubIssuesSystem` state will be lost on reload.