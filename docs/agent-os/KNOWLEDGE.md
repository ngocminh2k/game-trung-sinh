# Shared knowledge map

This is a routing map, not a duplicate specification. Read only the sources relevant to the work and update the actual source of truth rather than copying facts here.

| Need | Authoritative source | Notes |
| --- | --- | --- |
| Product scope, systems, content plan | `docs/GDD.md` | Product-design authority. |
| Narrative canon and player-facing story | `docs/STORY.md` | Keep Vietnamese and English content in parity. |
| Delivery contract | `docs/complete-game-contract.md` | Defines what a complete game must provide. |
| Acceptance status | `docs/MASTER_ACCEPTANCE.md` | Validate against this before release-oriented work. |
| Visual, tone, accessibility constraints | `.impeccable.md` | Ink-and-jade style; keyboard-first; no dark-neon dashboard. |
| Engine/content/UI contracts | `src/engine/types.ts`, `src/engine/content-types.ts`, `src/content/index.ts` | Use Codebase Memory to trace impact before changing a contract. |
| Regression coverage | `test/` and `e2e/` | Unit tests first; Playwright for user-visible flows. |

## Architecture boundaries

- `src/content/`: declarative game data and validation.
- `src/engine/`: deterministic state transitions and domain rules.
- `src/ui/`: rendering, input, and UI-only derivations.
- `src/ai/`: optional narration/suggestion integration; it must not become the source of game truth.
- `src/App.tsx`: application composition.

If two sources conflict, stop and record the conflict in the handoff or ask the user; do not silently choose a new canon.
