# Hardware and Equipment Systems Review

## Overview

This review compares the `HardwareManager` system in `src/js/game/HardwareSystems.js` and the `EQUIPMENT` table in `src/js/data/tycoonData.js`. Both systems provide progression and upgrades for a player's tech company, but they operate in parallel and have distinct mechanics. The review aims to understand what each system gates/boosts, how they interact, and whether their progression curves are complementary or clashing.

## 1. What Does Each System Actually Gate/Boost?

### HardwareManager

- **Gated/Boosted Mechanics:**
  - **Productivity:** The system primarily boosts productivity. The `getTotalStats()` method calculates the total productivity by taking the maximum value of productivity across all equipped hardware parts (CPU, GPU, RAM, storage, cooling, case, monitor).
  - **Speed:** Hardware components like CPU and GPU also contribute to speed, which affects task completion times.
  - **Capacity:** Storage capacity is another key metric, influencing the amount of data that can be processed or stored.

- **Formulas Consuming `getTotalStats()`:**
  - Productivity and speed are the main metrics consumed by formulas related to task completion, employee efficiency, and overall company performance.

### OfficeManager

- **Gated/Boosted Mechanics:**
  - **Productivity Multipliers:** The system uses five equipment items (computer, desk, monitor, chair, software) to apply multipliers to various productivity metrics.
  - **Comfort and Efficiency:** Each piece of equipment can affect employee comfort and efficiency, which in turn affects overall productivity and morale.

- **Formulas Consuming Multipliers:**
  - Productivity, comfort, and efficiency multipliers are applied to formulas that determine task completion times, employee satisfaction, and overall company performance.

## 2. Consistency in Combining Stats

### HardwareManager

- **Approach:**
  - The `getTotalStats()` method takes the maximum value of productivity across all equipped parts. This approach ensures that the best-performing component (e.g., CPU) dictates the overall productivity, rather than a simple sum.

- **Defensibility:**
  - This approach is defensible because it emphasizes the critical role of a single high-performance component. It aligns with real-world scenarios where a bottleneck (e.g., slow CPU) can limit overall system performance.

### OfficeManager

- **Approach:**
  - The OfficeManager combines its five equipment multipliers. Each piece of equipment contributes independently to the overall productivity and comfort metrics.

- **Defensibility:**
  - This approach is defensible because it allows for a more balanced improvement across multiple aspects of the office environment. It reflects the idea that a well-rounded workspace can lead to better overall performance and employee satisfaction.

## 3. Coherence of Equipment Purchases

- **Parallel Systems:**
  - The systems are designed to operate in parallel, allowing players to choose which upgrades to prioritize. This provides flexibility and allows players to tailor their office setup to their specific needs and playstyle.

- **Potential for Redundancy:**
  - While both systems can influence productivity and speed, they do so through different mechanisms. A player might choose to upgrade both a "Gaming Rig" computer (tycoonData) and a discrete CPU/GPU/RAM loadout (HardwareSystems) to achieve optimal performance.

- **Legacy/Superseded:**
  - The two systems are not inherently legacy or superseded. Instead, they offer complementary paths to upgrading the office environment. Players can choose to focus on holistic upgrades (tycoonData) or on individual hardware components (HardwareSystems).

## 4. Progression Curves and Scaling

### HardwareManager

- **Scaling:**
  - The hardware parts scale from $0 to $100,000 across `unlockRank` 0-10. This provides a wide range of options and allows for gradual or rapid progression.

- **Progression Curve:**
  - The progression curve is steep, with significant increases in cost and performance as players progress.

### OfficeManager

- **Scaling:**
  - The EQUIPMENT table in `tycoonData.js` tops out at around $8,000. This limits the maximum investment in equipment upgrades.

- **Progression Curve:**
  - The progression curve is more moderate, with a clear but limited range of upgrade options.

## Conclusion

Both the `HardwareManager` and the `OfficeManager` systems play crucial roles in providing progression and upgrades for a player's tech company. They influence similar mechanics (productivity, speed, capacity, and comfort) but do so through different mechanisms and progression curves. While there is potential for redundancy in equipment purchases, the parallel systems offer distinct paths to optimizing the office environment.

The progression curves of the two systems are complementary rather than clashing. The `HardwareManager` provides a wide range of options for high-end upgrades, while the `OfficeManager` offers more moderate but comprehensive upgrades. Together, they create a robust and flexible system for players to enhance their tech company.

### Recommendations

1. **Clarify Documentation:**
   - Ensure that players understand the differences between the two systems and how they interact. Clear documentation can help players make informed decisions about which upgrades to prioritize.

2. **Balance Progression Curves:**
   - Consider aligning the progression curves more closely if players find the current gap between the two systems to be too significant. This can help create a more cohesive upgrade path.

3. **Consistent Scaling:**
   - Ensure that the scaling of hardware parts and equipment items is consistent and intuitive. Players should be able to predict the cost and benefits of each upgrade option.

4. **User Feedback:**
   - Gather user feedback to identify any areas of confusion or imbalance in the upgrade systems. Use this feedback to refine and improve the systems over time.

By addressing these recommendations, the game can provide a more cohesive and satisfying upgrade experience for players.