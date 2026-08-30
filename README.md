# Phế Căn Ký / Tale of the Broken Root

A small xianxia cultivation/reincarnation RPG foundation: Vite + React + strict TypeScript,
plain CSS, Vitest, Zustand, Zod. PC-first, bilingual (Vietnamese/English), deterministic engine.

The canonical player-facing title is **Phế Căn Ký / Tale of the Broken Root** — use it
everywhere (document title, UI headers, i18n `common.appName`).

## Local run

```bash
npm install
npm run dev       # dev server
npm test          # unit + integration + UI tests
npm run test:coverage
npx playwright test
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
- `src/App.tsx` and `src/ui/**` — the playable PC interface: keyboard map travel,
  exactly three story choices, free-text command input, stats, NPCs, quests, items,
  storage, shop, lottery, achievements, ending screen, and browser save data.
- `e2e/**` — Playwright journeys for keyboard travel, story interaction, and save reload.

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

AI-generated text is decoration on top of the engine. The Vite development proxy runs **server-side
only**: `AI_BASE_URL`, `AI_MODEL`, and `AI_API_KEY` are consumed exclusively by that server
process and must never be exposed to the browser. In particular they must never be renamed to
`VITE_*` variables — anything prefixed `VITE_` is statically inlined into the client bundle and
would become public. `.env.example` contains placeholders only; never commit real secrets.

To enable it locally, create a private `.env` from `.env.example`, set the three `AI_*` values,
then set `VITE_AI_NARRATION_ENABLED=true` and start `npm run dev`. The browser only calls
`/api/narrate`; it cannot read the key. The proxy returns one short narration string and the client
never interprets that string as a command or state update. Keep the public flag `false` when the
local AI service is unavailable. For a production deployment, place the same endpoint behind a
server-side proxy rather than serving a raw static bundle.

## Design context

See `.impeccable.md`.

## Delivery acceptance

`docs/GDD.md` is the product source of truth. `docs/MASTER_ACCEPTANCE.md` is
the mandatory release checklist and current remediation queue; a feature is not
complete until it has the player-path, state, visible, downstream, and automated
evidence required there.
