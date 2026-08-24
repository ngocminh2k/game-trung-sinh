# Phế Căn Ký / Tale of the Broken Root

A small xianxia cultivation/reincarnation RPG foundation: Vite + React + strict TypeScript,
plain CSS, Vitest, Zustand, Zod. PC-first, bilingual (Vietnamese/English), deterministic engine.

The canonical player-facing title is **Phế Căn Ký / Tale of the Broken Root** — use it
everywhere (document title, UI headers, i18n `common.appName`).

## Local run

```bash
npm install
npm run dev       # dev server
npm test          # vitest run (engine tests)
npm run build     # typecheck + production build
npm run preview   # preview the build
```

## Structure

- `src/engine/**` — pure deterministic game engine (state machine, RNG, map, economy, quests,
  lottery, endings, narrator). No DOM access, no network calls.
- `src/content/**` — bilingual data: items, locations, 30 NPCs, chapters, story beats, endings,
  quests, achievements. Data only; validated with Zod schemas.
- `src/i18n/**` — UI dictionaries (`vi` primary, `en`) with a parity helper.
- `test/**` — Vitest suites covering determinism, invariants, storage, lottery, death, corrections,
  i18n parity and ending reachability.
- `src/main.tsx` mounts the UI entry (`src/App.tsx`, owned by the UI worker).

## Engine rule: determinism

**Never call `Math.random()` or `Date.now()` directly inside engine or content code.**
All randomness and time live in the injected deterministic state:

- the seeded RNG counter (`state.rng`) advanced only through `nextFloat` / `nextInt` /
  `pickFrom` from `src/engine/rng.ts`;
- the in-game day (`state.day`), advanced only by explicit actions such as `rest`.

Same seed + same action list ⇒ byte-identical state/event streams. This is enforced
by tests in `test/determinism.test.ts`. Narration (`src/engine/narrator.ts`) is a pure
function of events and locale; it can never mutate state or roll dice.

## Product rule: forced convergence after 3 invalid inputs

After the **third consecutive invalid free-text attempt**, the engine forces one
**lore-consistent valid action** (the current story beat's first applicable suggestion,
falling back to `rest`, which always succeeds). The forced action runs through the normal
finalize pipeline, so achievements and endings are evaluated on that same transition.
Guarantee: repeated invalid input alone still deterministically leads to *an* ending —
after several fruitless convergences the fallback escalates to a canonical cultivation
plan (`train`, else `rest`) whose progress is unbounded, so ascension or death arrives
eventually rather than the run idling forever. See `test/corrections.test.ts`.

## AI narration boundary

AI-generated text is decoration on top of the engine. The planned AI proxy runs **server-side
only**: `AI_BASE_URL`, `AI_MODEL`, and `AI_API_KEY` are consumed exclusively by that server
process and must never be exposed to the browser. In particular they must never be renamed to
`VITE_*` variables — anything prefixed `VITE_` is statically inlined into the client bundle and
would become public. `.env.example` contains placeholders only; never commit real secrets.

The AI layer receives a read-only snapshot of game state and returns prose; it never writes to
state, never rolls dice, and its output is never persisted as gameplay truth. Any gameplay effect
must originate from engine rules.

## Design context

See `.impeccable.md`.
