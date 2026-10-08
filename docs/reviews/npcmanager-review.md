# NPCManager.js review (#252)

`src/js/game/NPCManager.js` is about 1,900 lines. Most of it is data:

- `NPCs` (lines ~139-757)
- `DIALOGUE_TEMPLATES` / `DIALOGUE_CHOICES`
- `DIALOGUE_TREES` (~835-1098)

The `NPCManager` class is the last ~800 lines. I read the whole file. Line
numbers below are on this branch.

## 1. Top 5 correctness risks (by severity)

### 1. Authored dialogue trees pay out without limit. **Fixed here.**

Every `DIALOGUE_TREES` choice leads back to `root`, and `makeChoice()`
applied `choice.effect` each time it was picked. So within one conversation
a player could loop:

- `david_chen` → "I have a proposal" → "Data-driven AI for Healthcare"
  (line ~1093): +$5,000 and +5 relationship **per loop**.
- `vinnie_shark`'s loan (+$1,000, ~950), the "adjust some numbers" job
  (+$500) and `mike_johnson`'s data-cleaning gig (+$300) loop the same way.
- Free positive choices such as `david_chen`'s "*Nod silently*" → "..."
  farm the relationship to 100 in a single sitting.

The flags these choices set (`seed_interest`, `loan_taken`) are written but
**read nowhere**. That means the "20% weekly" loan has no repayment either.

Fix: `limitRepeatPayout()` (line ~1734), called from `makeChoice()`.

- A choice that sets a flag (a one-off event) pays only while that flag is
  unset.
- Any other paying choice pays its money, reputation, XP and positive
  relationship at most once per in-game day per node+choice.
- Costs and negative changes (energy, ethics, relationship loss) always
  apply.
- The ledger is `npcStates[id].payouts`, so it is saved.
- Still open as a design question: wiring `loan_taken` into debt (see #1283).

### 2. `startConversation()` can be overtaken by a second call

`startConversation()` (line ~1398) is `async`. It reads `relationship`
(~1421), awaits `relationshipDialogueSystem.getDialogue()` (~1440), and only
then writes `this.currentConversation` (~1481).

Say the player opens NPC A, then NPC B before A's dialogue file has loaded.
Whichever call finishes *last* owns `currentConversation`, even though the
UI may be showing the other NPC's greeting. `makeChoice(index)` would then
resolve the index against the wrong NPC's choice list.

The `relationship` it returns is also a snapshot from before the talk gain
and memory-dialogue changes made in the same call. So the tier shown at the
start of a conversation lags one interaction behind.

Fix direction:

- Take a per-call token (`const token = ++this.conversationSeq`) and drop
  the result if `token !== this.conversationSeq` after the await.
- Re-read `this.relationships[npcId]` after the awaits.

### 3. Saved relationship scores were trusted as numbers. **Fixed here.**

`fromJSON()` (line ~1175) assigned `data.relationships` as-is. A string
score from an edited or older save (`"50"`) makes
`modifyRelationship()` compute `before + applied` as string concatenation:
`"50" + 1 → "501"`, which then clamps to 100. One talk would max the
relationship.

Fix: scores are now coerced to finite numbers and clamped to 0-100.
`npcStates` and `interactionHistory` are still restored unchecked. The
dialogue code tolerates missing fields, but a schema check there would be
the next step.

### 4. Two "meet an NPC" paths. **Fixed here.**

`registerVisit()` (line ~1312) is the shared "first meeting" path (#1465):

- it marks the NPC met,
- it records an interaction for neglect tracking,
- it fires the `meet_first_npc` story beat.

`giveGift()` instead called `markNPCAsMet()` directly. If the player's first
contact was a gift, the first-NPC beat never fired, and gifts recorded the
neglect interaction on their own. `giveGift()` now calls `registerVisit()`.

### 5. Module-level NPC objects are mutated and shared

`initializeNPCImages()` (line 11, run at import, ~775) and `getAllNPCs()`
(~1263) write `npc.image` / `npc.fallbackIcon` onto the exported `NPCs`
objects. Every `NPCManager` (new game, continue, tests) shares them.

Once `getNPCImage()` has returned its SVG placeholder, that data URI is
stored in `npc.image`. From then on, `getNPCImage()` takes the "explicit
property" branch and returns it for the rest of the session, even after the
real art ships or the blocklist changes.

Fix direction: compute display fields into a per-manager cache, or return
shallow copies (`{ ...npc, image }`), and never write to `NPCs`.

Honourable mention: the constructor wires the module-singleton
`dialogueTreeSystem` to `this` inside a `setTimeout(0)` (~1133). After a
load, the singleton points at the previous manager for one tick, and the
last manager constructed always wins.

## 2. The same operation implemented more than once

| Operation | Implementations | Drift |
|---|---|---|
| Diminishing relationship gains | `startConversation` talk gain (~1426): 1 → 0.5 above 60 → 0.25 above 85. `giveGift` (~1930): ×0.5 (min 3) above 60, ×0.3 (min 2) above 85 | two different curves with the same 60/85 breakpoints, both then scaled again by `modifyRelationship`'s personality factor |
| Set vs change a relationship | `modifyRelationship` (personality-scaled, fractional carry) vs `setRelationship` (absolute, resets carry) | intended, but callers that "add" through `setRelationship(get()+n)` skip personality scaling |
| Romance closeness | `NPCManager.relationships` (0-100) vs `RomanceSystem.relationshipScore` (0-500) | two numbers for "how close we are" (filed as #1416). Dates move both; RelationshipEmotionSystem can zero one of them |
| Relationship bands | `getGreetingPool` hardcodes 40/60/80; `getRelationshipTier` uses `relationshipStage()` | in step today (#916/#566), but it's a copy |
| Picking choices | `getAvailableChoices` has three sources (authored tree, generated tree, legacy stages) | the authored and legacy sources hide locked choices; the generated-tree source shows them locked (#1581) |
| Gift reactions | `giveGift` vs the dead gift-reaction helpers (decision #1306) | out of scope here |

## 3. Should the file be split?

Yes, along the lines it already has. About 75% of the file is static
content: NPC records, templates and trees. It changes for writing reasons,
not code reasons, and it makes the logic hard to review.

A low-risk split:

1. `data/npcs.js`: `NPCs`, `PERSONALITY_TRAITS`, `GIFT_COSTS`.
2. `data/npcDialogue.js`: `DIALOGUE_TEMPLATES`, `DIALOGUE_CHOICES`, `DIALOGUE_TREES`.
3. Keep `NPCManager` for relationship state and conversation flow.

Conversation flow (`startConversation`, `buildConversationChoices`,
`makeChoice`, `applyChoiceEffects`) could later become a `ConversationSession`
object, one per conversation. That would also fix risk #2 structurally. But
it touches `DialogueUI` and the dev menu, so I wouldn't do it first.

Relationship math is small and cohesive, and fine where it is.

## 4. Worth preserving

- **`modifyRelationship`'s fractional carry.** Personality-scaled gains
  truncate toward zero and carry the remainder, so small gains aren't lost
  and small losses aren't amplified. The carry is dropped at the 0/100
  bounds.
- **`buildConversationChoices()` as the single list.** The list it renders
  is the same list `makeChoice(index)` resolves, so a click can't run a
  different choice. Locked choices are refused in `makeChoice`.
- **`startConversation({ preview: true })`.** It builds the same output with
  no side effects and restores the previous conversation. That makes
  dialogue testable from the dev menu.
- **`isNPCUnlocked`'s signed ethics rule.** A positive requirement is a
  minimum and a negative one is a maximum. It is compact and clear.
- **Gift economics.** Cost, a one-per-day cooldown, rivals refusing, and a
  returned `relationshipGain` that is what was actually applied, not the
  nominal value.

Tests for the fixes: `test/unit/NPCManager.review252.test.js`.
