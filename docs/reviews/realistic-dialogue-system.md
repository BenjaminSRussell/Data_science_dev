# RealisticDialogueSystem: keep it (#1596)

Decision: **keep** `src/js/game/RealisticDialogueSystem.js`. Do not trim it down to `generateBreakupDialogue`, and do not treat the rest as unused scaffolding.

When this question was filed, a call-graph pass found only `generateBreakupDialogue` (`RelationshipEmotionSystem.triggerBreakup`). That is no longer true. `main.js` constructs the system on `gameState.realisticDialogueSystem`, and #2272 wired the other methods in as the fallback flavor-text layer. Authored NPC files, `DialogueTreeSystem`, and `EnhancedDialogueSystem` still own story, flags, and payouts. This module only speaks when those have no line, or when the UI needs a short reaction that was never authored. Replacing those systems with the pattern library would throw away per-NPC writing and compete with lines that are already reachable. Deleting the methods now would silence greetings, generic replies, farewells, and social reactions that players already hear.

`generateEmotionalResponse` no longer has a `'gift'` branch (unknown actions return `"I see."`). `NPCHelpers.handleNPCGift` uses it with `'help'` only as the interim generic line, then replaces that text with the NPC's own `actions.gift_*` line when the dialogue file has one. `NPCManager.giveGift` stays the gift mechanic (cost and relationship). The generator does not compete with that path.

Where each method is called, and where it should stay:

- `generateDialogue` builds the line. `generateRelationshipDialogue` calls it, and `DialogueUI.speakFarewell` calls it directly with `situation: 'goodbye'` because the UI closes before a goodbye node can render. A new caller should already know emotion, situation, and personality. Do not point ordinary greetings here.
- `generateRelationshipDialogue` is the greeting when there is no memory line and no authored file (`NPCManager.startConversation`), the neutral case of `NPCManager.getGenericReply`, and the spoken root line in `DialogueUI.spokenText`. Those three are the right call sites.
- `determineEmotion` has no external caller, and it should not gain one. `generateRelationshipDialogue` calls it and passes the result into `generateDialogue`. Any new greeting or reply should go through `generateRelationshipDialogue` (with `conversationSituation`) so the emotion and the line stay on the same thresholds.
- `generateEmotionalResponse` is the generic reaction: positive (`'help'`) and negative (`'betrayal'`) in `getGenericReply`, synthesized social nodes in `NPCManager.makeChoice` and `DialogueUI.spokenText` (`SOCIAL_REACTION_ACTIONS`), and the interim gift line in `handleNPCGift`. Do not add a `'gift'` caller that overrides an authored gift line.
- `generateBreakupDialogue` stays the romance breakup line in `RelationshipEmotionSystem.triggerBreakup`, with the existing fallback string if the system was not constructed.

`addNaturalSpeech` is only a helper of `generateDialogue` and casual `generateEmotionalResponse` lines. It is not a conversation entry point.
