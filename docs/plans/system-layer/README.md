# System Layer — Pick ONE System at Boot + System Quest Pool + LLM Chat

> Implementation plan for the System-selection feature, shipped **in the same release
> batch as the x20 expansion** (not deferred). This document set is the single source
> of truth for the "System" part; it deliberately leaves the x20 authored-story plan
> untouched. On any conflict about System behavior, this set wins.

## User decisions captured (2026-09-01)

1. The player is given **exactly one System** chosen from **10 kinds**, selected once
   at boot, then **hard-locked** ("choose wrong, live with it").
2. The System issues **hard, high-reward quests** but **never advances the main story**:
   no main-scene push, no branch/ending mutation. Pure side challenges.
3. An **LLM can be attached to the System** to talk with the player, suggest quests,
   and flavor rewards — but only under the repo's existing AI boundary
   (`AGENTS.md` + `src/ai/narration.ts` pattern). Deterministic fallback always works.
4. **Future: a completely new story / playthrough 2–3** must be able to keep the System
   layer and swap only authored content. This is a hard acceptance criterion
   (see `SPEC.md` §6 Scenario independence).

## Relationship to the x20 plan

- `docs/plans/expansion-x20/tasks/T14-system-interface.md` (system-messages + systemQueue
  + engine/system.ts) is the **foundation** — kept as-is, extended, not rewritten.
- This layer runs **after T12 (integration) and T13 (verification)** of x20 because it
  touches the same files (reducer.ts, content/index.ts, GameScreen.tsx, i18n).
- The x20 content gates raised by T12 are untouched; this plan only adds new data and
  new gates on top.

## Document layout

| File | Contents |
|---|---|
| `README.md` | Overview, decisions, relationship to x20 (this file) |
| `SPEC.md` | Architecture principles + data layer (system-defs, system quests, state, i18n) |
| `SPEC-ENGINE.md` | Engine layer (system-runtime, quest gates, reducer, boot scene) |
| `SPEC-AI-UI.md` | AI layer + UI layer + scenario independence |
| `SPEC-VALIDATION-RISKS.md` | Content validation additions + known risks |
| `S01-reference-data.md` | Concrete 10 `SystemDef` samples with real `items.ts` ids (reference for S01) |
| `TASKS.md` | Execution index + dependency chain + cross-cutting rules |
| `tasks/` | **Self-contained agent-executable task docs** S01–S08 (each owns files + verification) |