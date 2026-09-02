# Work Systems Convergence Review

## Overview

This review aims to assess whether the `ContractSystem`, `ProjectSystem`, and `RealWorldTaskSystem` should be consolidated into a single system or maintained as separate implementations. The review will focus on comparing their core contracts (accept/start, progress tracking, completion, reward granting), analyzing the known behavioral inconsistencies, and determining the best course of action.

## Side-by-Side Comparison

| Feature/Aspect                | ContractSystem                           | ProjectSystem                           | RealWorldTaskSystem                      |
|-------------------------------|------------------------------------------|-----------------------------------------|------------------------------------------|
| **Accept/Start**              | `acceptContract(contractId)`            | `startProject(projectId)`                | `acceptTask(taskId)`                      |
| **Progress Tracking**         | `trackProgress(contractId, progress)`   | `trackProgress(projectId, progress)`   | `trackProgress(taskId, progress)`        |
| **Completion**                | `completeContract(contractId)`          | `completeProject(projectId)`             | `completeTask(taskId)`                    |
| **Reward Granting**           | `grantReward(contractId, reward)`       | `grantReward(projectId, reward)`        | `grantReward(taskId, reward)`            |

### Identical in Spirit

- **Accept/Start**: All systems provide a method to accept/start a task or project.
- **Progress Tracking**: All systems offer a way to track the progress of a task or project.
- **Completion**: All systems have a mechanism to complete a task or project.
- **Reward Granting**: All systems allow granting rewards upon completion.

### Genuine Differences Justifying Separate Code

- **Prerequisite Re-check**: `ContractSystem` re-checks prerequisites upon task acceptance, while `ProjectSystem` and `RealWorldTaskSystem` lack this feature.
- **XP Routing**: `ProjectSystem` routes XP into a dead-end stat store, whereas the other systems do not have this issue.
- **Concurrency Guard**: `ProjectSystem` includes a concurrency guard, which `ContractSystem` and `RealWorldTaskSystem` do not have.

## Behavioral Inconsistencies

1. **Prerequisite Re-check**: `ContractSystem` re-checks prerequisites upon task acceptance, while the other systems lack this feature.
2. **XP Routing**: `ProjectSystem` routes XP into a dead-end stat store, which is not present in the other systems.
3. **Concurrency Guard**: `ProjectSystem` includes a concurrency guard, which is missing in the other systems.

## Consolidation Analysis

### Preventing Future Drift

- **Pros**:
  - Consolidating the systems into one shared base implementation would reduce code duplication and make maintenance easier.
  - It would ensure that all systems adhere to a common contract, potentially preventing behavioral drift.

- **Cons**:
  - If the differences between the systems are significant, consolidating them might lead to a larger, more complex file, which could be harder to manage and understand.
  - The known behavioral inconsistencies (prerequisite re-check, XP routing, concurrency guard) might not be fully addressed if they are integrated into a single system without careful design.

### Relocation of Bugs

- Consolidating the systems into one file might relocate the same bugs into the new, larger file, making them harder to isolate and fix.

## Recommendation

Given the significant differences between the systems and the known behavioral inconsistencies, it is recommended to keep them separate but ensure they honor a shared contract. This approach would maintain the distinct features and functionalities of each system while ensuring consistency and reducing redundancy.

### Shared Contract

1. **Accept/Start**: Implement a method to accept/start a task or project.
2. **Progress Tracking**: Implement a way to track the progress of a task or project.
3. **Completion**: Implement a mechanism to complete a task or project.
4. **Reward Granting**: Implement a method to grant rewards upon completion.

### Migration Sketch

1. **Define a Shared Contract Interface**:
   - Create a shared interface or abstract class that defines the core methods (`accept`, `trackProgress`, `complete`, `grantReward`).
   - Ensure each system implements this interface.

2. **Refactor Existing Systems**:
   - Refactor `ContractSystem`, `ProjectSystem`, and `RealWorldTaskSystem` to implement the shared contract interface.
   - Ensure that each system maintains its unique features (e.g., prerequisite re-check, XP routing, concurrency guard) while adhering to the shared contract.

3. **Unit Testing**:
   - Write unit tests for each system to ensure that they honor the shared contract and maintain their unique behaviors.

## Conclusion

Keeping the `ContractSystem`, `ProjectSystem`, and `RealWorldTaskSystem` separate but ensuring they honor a shared contract is the best approach. This will maintain the distinct features and functionalities of each system while reducing redundancy and ensuring consistency.