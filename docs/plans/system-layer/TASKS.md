# TASKS — System Layer execution index

> Each task is a **self-contained agent-executable doc** in `tasks/` — pick one up and
> execute without reading the whole SPEC. They run **AFTER x20 T12+T13** on the merged tree.
> One task owns its files exclusively (`S0X` header in each file lists them).
> Every task: run its verification commands, paste real output into the handoff.

## Dependency chain

```
S01 system-defs ──► S02 state/schema ──► S03 quest pool
      │                  │                    │
      └──────────────────┴────────────────────┴──► S04 quest-engine + merge
                                                        │
                                              S05 reducer + boot scene
                                                        │
                                              S06 AI chat boundary
                                                        │
                                              S07 UI + i18n
                                                        │
                                              S08 scenario gate + e2e (+ full 5-gate)
```

S01/S02/S03 can be parallel only if file ownership is disjoint (they are). S04 needs all
three. S05 needs S04. S06 needs S05. S07 needs S05+S06. S08 last.

## Index

| Task | Doc | Scope (top-level) | Key verification |
|---|---|---|---|
| S01 | `tasks/S01-system-defs.md` | `content/system-defs.ts` (new) | `vitest test/system-defs.test.ts` |
| S02 | `tasks/S02-state-schema.md` | `engine/types.ts`, `schema.ts`, `content-types.ts` | `vitest test/system-schema.test.ts + economy` |
| S03 | `tasks/S03-system-quest-pool.md` | `content/system-quests.ts` (new, 50+ quests) | `vitest test/system-quests.test.ts`; grep `q_sys_` ≥ 50 |
| S04 | `tasks/S04-quest-engine-merge.md` | `engine/quests.ts` (3 fns), `content/index.ts` | `vitest system-engine + content`; gates green |
| S05 | `tasks/S05-reducer-boot.md` | `engine/system-runtime.ts` (new), `reducer.ts`, `types.ts`, `story.ts` | `vitest test/system-boot.test.ts`; lint |
| S06 | `tasks/S06-ai-chat.md` | `ai/system.ts` (new) | `vitest test/ai-system.test.ts`; lint |
| S07 | `tasks/S07-ui-i18n.md` | `ui/GameScreen.tsx`, `i18n/vi.ts` + `en.ts` | `vitest test/system-ui + i18n`; build |
| S08 | `tasks/S08-scenario-e2e.md` | `test/system-scenario.test.ts` + `e2e/system-pick.spec.ts` (new) | full 5-gate + playwright |

## Cross-cutting requirements (every task)

- Determinism: no `Math.random`, `Date.now`, `console.log` in `src/engine/` (CONVENTIONS.md).
- i18n: every new `*Vi` field needs its `*En`; i18n parity test stays green.
- Scenario independence: core files (`system-defs`, `system-quests`, `system-runtime`,
  `ai/system`) must not import authored Scenario-I modules (enforced in S08).
- Save compat: new `GameState` fields use `.default()` in schema.
- Handoff: name files, commands + real output, risks, one next action
  (same format as `docs/agent-work/handoffs/`).