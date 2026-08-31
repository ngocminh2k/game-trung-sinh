# S06 — AI chat boundary (`src/ai/system.ts`)

> Self-contained. Runs AFTER S05 (runtime helpers). Mirror `src/ai/narration.ts`.

## Objective

LLM-backed System chat + quest-offer, strictly inside the repo's AI boundary:
AI may only **suggest** from the frozen pool; engine never accepts anything else;
deterministic fallback when AI is unavailable.

## Files you own (exclusive)

- `src/ai/system.ts` (new)
- `test/ai-system.test.ts` (new)

Forbidden: reducer.ts, store.ts, engine writes, any state mutation, authored content.

## Do this — follow `src/ai/narration.ts` exactly

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
  questId?: string        // MUST exist in questPool
}
export async function requestSystemReply(game: GameState, message: string, locale: Locale): Promise<SystemReply | null>
```

- Gate: `if (import.meta.env.VITE_AI_NARRATION_ENABLED !== 'true' || message.trim().length === 0) return null`.
- `fetch('/api/narrate', { method:'POST', headers, body: JSON.stringify(payload) })`.
- Validate `questId` **must be one of `questPool` ids** sent up — else `null`.
- Sanitize text: collapse whitespace, trim, slice to 300 chars.
- On any fetch/parse error → `null`.
- `context.luck` — read `game.player.attrs.luck` (exists in `Attrs`, types.ts line 7).
- `systemQuestsFor` comes from `src/engine` (S05) — import it; it is NOT authored content.

## Acceptance

- Disabled env → always `null` (UI falls back).
- Mocked fetch with pooled `questId` → accepted `SystemReply`.
- Mocked fetch with non-pooled `questId` → `null`.
- No import of authored story/npcs/locations/endings/chapters/quests.

## Verification

```powershell
npx vitest run test/ai-system.test.ts
npm run typecheck
npm run lint
```

## Handoff

Files touched, commands+results, next action (`S07`).