# SPEC (parts 7–8) — Validation and Risks

## 7. Validation additions (`src/content/index.ts` — after T12)

- `SYSTEMS.length === 10`, ids unique, `order` strictly ascending.
- System quest (`requiredSystemId` set): `giverNpcId === null`, **NO**
  `storySceneNextId`, `difficulty` in [1,10], `rewardGold` within the system's
  `[minGold,maxGold]`, `rewardItems` ids inside the system's `itemPool` (or
  `rewardSpiritStones` within `[min,max]`).
- A system quest id must start with `q_sys_` and reference an existing `SystemId`.
- Non-system quests keep requiring a non-null `giverNpcId` (no change to authored quests).

## 8. Known risks & mitigations

| Risk | Mitigation |
|---|---|
| reducer.ts / GameScreen.tsx / content-index.ts / i18n are owned by x20 T12 | S05–S08 run strictly AFTER T12 on the merged tree; no parallel edit of those files |
| 50–80 authored system quests are a lot of content | Ship 5 per system minimum (10×5 = 50); 8 max per system |
| LLM chat requires a server mode | Optional separate task; client falls back to deterministic deterministically |
| Hard-lock surprises the player | Boot UI explains "choose once, never change"; e2e covers re-pick rejection |
| Save compatibility | `systemId` default null via schema; reuse x20 T13 save-compat test patterns |
| Quest pool bloat in the journal | System quests render only in the System panel, not the main quest list |