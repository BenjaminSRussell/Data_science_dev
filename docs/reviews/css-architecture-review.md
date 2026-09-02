# CSS Architecture Review

## 1. Bare Class Name Collisions

| Class Name       | File 1           | File 2            | Winning File | Intentional Override | Notes |
|------------------|------------------|-------------------|--------------|----------------------|-------|
| .screen          | components.css   | patches.css       | components.css | No                   | Likely an unintentional override. |
| .progress-bar    | components.css   | story-ui.css      | components.css | Yes                  | Confirmed in the known collision. |
| .progress-fill   | components.css   | story-ui.css      | components.css | Yes                  | Confirmed in the known collision. |
| .modular-panel   | text-ui.css      | research-inbox.css| text-ui.css    | No                   | Likely an unintentional override. |
| .phase-indicator | text-ui.css      | story-ui.css      | text-ui.css    | No                   | Likely an unintentional override. |
| .btn-manual-action | text-ui.css    | story-ui.css      | text-ui.css    | No                   | Likely an unintentional override. |

## 2. Naming Convention

- **BEM-style prefixes**: Not consistently applied.
- **Component-scoped classes**: Not consistently applied.
- **Overall convention**: No clear, consistent naming convention across the project.

## 3. Pragmatic Recommendation

- **Full CSS-scoping migration**: Worth the effort if the project is expected to grow significantly and if the current architecture is causing frequent bugs due to class name collisions. However, this requires substantial rework and might not be feasible for a short-term fix.
  
- **Lighter-weight fix**: Implementing a linting rule to catch cross-file duplicate selectors would help prevent future issues. Additionally, establishing and enforcing a consistent naming convention (such as BEM or component-scoped classes) would reduce the risk of class name collisions without requiring a full migration.

Given the current state of the project, a lighter-weight fix (linting rule and naming convention) would capture most of the value for much less work.