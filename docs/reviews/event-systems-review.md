# Event Systems Review

## 1. Responsibilities of Each System

### EnvironmentManager
- **Responsibility**: Manages and triggers environmental events within the office, such as power outages, broken equipment, or unexpected visitors.
- **Concerns**: 
  - Triggers random events based on a predefined list.
  - Uses a timer to schedule events.
  - Maintains a list of active events to prevent overlap.

### EventSystem
- **Responsibility**: Manages in-game news events that affect the player's reputation, such as media coverage, customer feedback, or industry awards.
- **Concerns**: 
  - Triggers events based on player actions or in-game conditions.
  - Uses a separate list to track active news events.
  - Ensures no overlapping news events occur.

### WorldEventManager
- **Responsibility**: Handles world/economic events that impact the global market, such as economic downturns, new regulations, or technological advancements.
- **Concerns**: 
  - Triggers events based on broader economic data or global conditions.
  - Uses a different mechanism to track active world events.
  - Prevents overlapping world events from occurring.

## 2. Potential for Shared Base Class or Utility

### Shared Base Class
- **Purpose**: A generic "active timed effect" tracker that can be extended by each system to handle specific types of events.
- **Design**:
  - **Base Class**: `ActiveEventTracker`
    - **Properties**: 
      - `activeEvents`: A list to store currently active events.
      - `eventList`: A predefined list of possible events.
    - **Methods**:
      - `triggerEvent(event)`: Adds an event to the active list and starts its timer.
      - `checkForOverlap(event)`: Checks if the new event conflicts with any active events.
      - `removeExpiredEvents()`: Removes events that have completed their duration.
  - **Extensions**:
    - `EnvironmentalEventTracker` extends `ActiveEventTracker` for office events.
    - `NewsEventTracker` extends `ActiveEventTracker` for in-game news events.
    - `WorldEventTracker` extends `ActiveEventTracker` for world/economic events.

### Benefits
- **Reduced Duplication**: Common logic for tracking active events and preventing overlaps is centralized.
- **Maintainability**: Easier to update and maintain shared functionality.
- **Consistency**: Ensures all event systems follow a consistent pattern and behavior.

## 3. Recommendation

### Priority
- **Unification**: Unifying these systems into a shared base class is recommended to reduce duplication and improve maintainability.
- **Implementation**: Focus on creating a robust `ActiveEventTracker` base class that can be extended by each specific event system.
- **Verification**: Ensure each extended class correctly implements its own event logic while leveraging the shared tracking functionality.

By unifying these systems, the codebase will be cleaner, more maintainable, and less prone to inconsistencies in event handling.