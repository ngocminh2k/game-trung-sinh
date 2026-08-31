# SPEC (parts 4–6) — AI, UI, Scenario independence

## 4. AI layer — `src/ai/system.ts` (new)

Follows the `src/ai/narration.ts` pattern (validate + fallback + fetch `/api/narrate`):

```ts
export interface SystemChatPayload {
  mode: 'chat' | 'offer_quest'
  locale: Locale
  system: { id: string; nameVi: string; nameEn: string; personalityVi: string; personalityEn: string }
  context: { day: number; stage: number; gold: number; luck: number; hp: number; qi: number }
  questPool: Array<{ id: string; difficulty: number; rewardGold: number }>  // systemQuestsFor(state)
  playerMessage: string
}
export interface SystemReply {
  kind: 'chat' | 'offer_quest'
  textVi: string; textEn: string
  questId?: string        // MUST be inside the sent questPool (validated client-side)
}
export async function requestSystemReply(game: GameState, message: string, locale: Locale): Promise<SystemReply | null>
```

- `VITE_AI_NARRATION_ENABLED !== 'true'` or a fetch failure → `null` → UI shows
  `system.chatFallback` and still offers quests deterministically (`systemQuestsFor`).
- Client-side validation identical to `requestSuggestion`: `questId` not in the pool → reject.
- **The AI never** invents quests/rewards outside the frozen pool/budget, and never writes state.

### 4.1 Server (out-of-scope for S*, optional small task)

A container/server mode `'system'` may accept `SystemChatPayload` and return
`SystemReply` — never echo stale/stateful numbers back, preserving the AI boundary.

## 5. UI layer — `src/ui/GameScreen.tsx` (after T12)

- **HUD**: when `state.systemId != null`, show the system header (distinct color), a
  `system.poolHeader` list of `systemQuestsFor(state)` with `difficulty` (1–10) and
  Accept / Turn-in buttons dispatching `system_accept_quest` / `system_turn_in_quest`.
- **Chat panel**: text input + "Talk" button; on send → `requestSystemReply` (async) →
  render the reply in the panel (no state write). If the reply carries `questId`, offer
  an Accept button dispatching `system_accept_quest`.
- **Quest log** (existing): quests whose id starts with `q_sys_` are tagged with
  `[<system header>]` and show `difficulty`.
- **Rootless**: when the `systemRefused` flag is set, hide every System panel and never
  render `scene_system_selection` (twist: the System is off).
- **i18n**: use the `system.*` keys (SPEC §2.4) with `word(locale, ...)`; keep vi/en parity.

## 6. Scenario independence (user: "new story later, keep the System")

- **Forbidden imports in core files** (any of `../content/story`, `npcs`, `locations`,
  `endings-data`, `chapters`, `quests` authored Scenario-I modules):
  - `src/content/system-defs.ts`
  - `src/content/system-quests.ts`
  - `src/engine/system-runtime.ts`
  - `src/ai/system.ts`
  - (existing `src/content/system-messages.ts` and `src/engine/system.ts` already are pure)
- **Containment test** (`test/system-scenario.test.ts`, in S08): read the raw source of
  every core file and assert none imports into the forbidden authored modules. This is
  the enforcement that keeps the layer reusable when Scenario II / playthrough 2–3 ships.
- **Contract for a future scenario**: provide its own authored content
  (locations/npcs/quests/story/endings), define a boot scene with a choice carrying
  `effects.systemId`, reuse the shared System pool. No engine/system-layer change needed.
  A `scenario` field + `scenarios/<id>/` directory registry is **explicitly out of scope**
  now; this plan only keeps the boundary clean so that step needs no refactor.