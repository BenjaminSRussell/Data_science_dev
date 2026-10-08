# Narrative tracking overlap (#512)

The four systems that answer "where is the player in their story":

| System | Output | Derived from |
|---|---|---|
| `StorylineManager.determinePhase()` | `storylinePhase`: early / mid / late / endgame | days (30 / 90 / 180), **or** reputation (≥1000 → mid, ≥5000 → late), whichever is further (#1420) |
| `StoryBeatsSystem` | which beats can fire | `storylineManager.storylinePhase` (it reads the phase and keeps earlier acts reachable, #857). It doesn't derive its own phase |
| `NarrativeClaritySystem.getNarrativeContext().chapter` | Chapter 1–5 title | **before:** its own day bands (7 / 30 / 90 / 180); **now:** StorylineManager's phase |
| `CharacterArcSystem.determineArcDirection()` | corruption / redemption / success / decline / growth / balanced | *deltas* in ethics, money, reputation and rank since the last check |

## 1. Did they diverge in practice?

Yes, between StorylineManager and NarrativeClaritySystem. The day bands matched at 30/90/180, but StorylineManager also advances on reputation. A player at day 10 with 1,500 reputation was in phase `mid` ("Act II" highlighted on the story timeline), while the chapter line said "Chapter 2: Finding Your Way", which is the `early` chapter. At ≥5,000 reputation before day 90 the gap was two steps (phase `late`, Chapter 2 or 3).

StoryBeatsSystem can't diverge, because it consumes the phase. CharacterArcSystem answers a different question (the *direction* of change, not the *position*), so it doesn't conflict with either.

## 2. Shown together?

Yes. `StoryUI` renders the phase timeline (`getPhaseClass` marks the current phase `active`) and the `#narrative-chapter` line from `getNarrativeContext()` in the same story panel, so the mismatch above was visible.

## 3. Unify or keep separate?

**Position should have one source of truth. Direction can stay separate.**

- *Fixed here:* `NarrativeClaritySystem` now takes the chapter from `storylineManager.storylinePhase` (`chapterFor(phase, days)`). The one extra distinction it adds is a first-week Chapter 1 inside `early`. Without a StorylineManager it falls back to `phaseForDays()`, which uses the same day bands. `test/unit/NarrativeChapterPhase.test.js` covers the reputation-accelerated case and checks every phase/chapter pair.
- `CharacterArcSystem`'s arc direction is legitimately separate data: it's a classification of *how* the player changed, used for the milestone history. Merging it into the phase logic would couple two unrelated rules. The real overlap is with `StorylineManager.getCurrentArc()`, which picks an arc from the *current* ethics band. That's a third "arc" notion, and the naming is confusing (#1960 tracks the broader CharacterArcSystem/CharacterStats/Character.js overlap). If arcs get consolidated, the cheapest step is to have `CharacterArcSystem` label its output "trajectory" and leave "arc" to StorylineManager.

## 4. Ethics access pattern (brief)

`CharacterArcSystem` reads `characterStats.ethics` directly. `NarrativeClaritySystem` reads `characterStats.ethics` and falls back to `getStat('ethics')`. `ethics` is a plain field on CharacterStats (not a `STATS` entry), so the direct read is the correct one, and the `getStat` fallback is a no-op kept for older save shapes. The access-pattern question as a whole is covered in `docs/reviews/character-stats-audit.md`.
