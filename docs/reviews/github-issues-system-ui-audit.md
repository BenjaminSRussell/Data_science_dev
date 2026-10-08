# GitHubIssuesSystem UI audit (#528)

## 1. Is there a UI entry point?

No. The property is `gameState.githubIssuesSystem` (lowercase `h`), aliased as `game.githubIssuesSystem`, and it's constructed in `main.js loadDeferredSystems()` (around line 4235). Grepping `src/js/ui/`, `src/js/helpers/`, `index.html` and `main.js` for `githubIssuesSystem`, `getOpenIssues`, `assignIssue`, `completeIssue`, `getPullRequests` or `mergePullRequest` finds only that construction and the save/load code. No screen, button, menu entry, location feature or dialogue option calls the gameplay API.

## 2. A real entry point?

Not applicable: there's no entry point. The methods themselves are real, not stubs:

- `assignIssue` checks intelligence against `getRequiredIntelligence(difficulty)`.
- `completeIssue` opens a pull request.
- `mergePullRequest` pays money and reputation and closes the issue.
- `refreshRepositoryCounts` keeps the per-repo totals in sync (#2087–#2089, #932).

## 3. Conclusion and minimal screen

This is a fully implemented gameplay loop that a player can never reach. A minimal screen to expose it, which a follow-up feature ticket could scope (≈150–250 lines, reusing existing patterns):

- **Entry point:** a "GitHub" or "Open Source" feature at an existing location (the tech hub or library, via `LOCATION_FEATURES`) or a desktop/menu button that calls `screenManager.showScreen('screen-github')`.
- **Issues list:** `getOpenIssues({ difficulty, repository })`, rendered like the job and shop lists (title, repo, difficulty, reward, required intelligence), with an **Assign** button calling `assignIssue(id)` and showing `result.message` in a toast.
- **My work:** issues with `assignee === 'player'`, each with a **Submit fix** button (`completeIssue(id)`), which spends a time slot and energy like other work actions.
- **Pull requests:** `getPullRequests({ status: 'open' })`, each with a **Merge** button (`mergePullRequest(id)`). Apply the returned money and reputation through the normal reward path and toast the result.
- Call `generateNewIssue()` on the daily tick so the board refills.

Whether to build this screen or remove the system is still Ben's decision, tracked in #2251. This audit doesn't change it.

## 4. Save / load

State **is** persisted. `GameState.toJSON()`:

```js
data.githubIssuesSystem = this.githubIssuesSystem ? this._safeSubsystemStep('save githubIssuesSystem', () => ({
    openIssues: this.githubIssuesSystem.openIssues,
    closedIssues: this.githubIssuesSystem.closedIssues,
    pullRequests: this.githubIssuesSystem.pullRequests
})) : ...
```

`GameState.fromJSON()` restores the three lists when the system exists. On Continue, `main.js continueGame()` runs `loadDeferredSystems()` *before* `saveManager.loadGame(...)`, so the system is there to receive the data.

One gap, **fixed here**: after restoring, the repository issue/PR counts kept the values from the freshly generated issues, because `refreshRepositoryCounts()` wasn't re-run. `fromJSON` now calls it after restoring the lists (`test/unit/GitHubIssuesSystem.restoreCounts.test.js`). `repositories` isn't saved at all. That's fine, because it's static catalogue data and the counts are derived.
