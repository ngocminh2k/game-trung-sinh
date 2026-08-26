# Phế Căn Ký / Tale of the Broken Root — Game Design Document

> **Status:** source of truth for all implementation work.  A worker may not
> invent a feature, content schema, UI state, or progression rule that conflicts
> with this document.  Amend this document first when a product decision changes.

## 1. Product promise

**Phế Căn Ký** is a single-player, PC-browser, illustrated cultivation RPG.
The player is a reincarnated underdog with a broken spirit root.  They should
feel that they are freely improvising a xianxia life: travelling local areas,
meeting memorable people, taking risks, getting stronger, and reaching one of
several authored conclusions.  The deterministic game protects coherence; it
must never reveal its rails or correction machinery to the player.

The target experience combines the local, consequence-heavy exploration of a
wuxia sandbox with the clear long-term cultivation goals of a xianxia RPG.  It
is **not** a generic dashboard, idle game, visual novel, or AI chat wrapper.

### Design pillars

1. **A world, not a form.** The player walks a detailed regional map to nodes,
   exits and hazards; choices come from place and people, not an abstract menu.
2. **Visible ambition, hidden rails.** Free text is encouraged.  The world
   responds in-character and can redirect an impossible intention without
   telling the player that it was corrected.
3. **Every outing has a trade-off.** Health, qi, danger, materials, gold and
   time make exploration, combat, rest, purchase and crafting/exchange choices
   meaningful.
4. **Cultivation is discovery.** Stronger talents, manuals and equipment are
   earned or found.  Future content is a silhouette/rumour with a requirement,
   never a complete spoiler catalogue.
5. **One focused play surface.** On a normal PC desktop the game remains in one
   viewport: regional map, current scene, HUD and a bounded systems dock.  Only
   lists inside a dock scroll.

## 2. Audience and format

- **Platform:** desktop web first; keyboard and mouse; 16:9 PC is reference.
- **Languages:** Vietnamese is the canonical authored voice; English is a
  faithful adaptation, not a word-by-word translation.
- **Run length:** Scenario I is a complete 45–90 minute first playthrough with
  replayable endings and optional grinding.  Later scenarios are data packs.
- **Tone:** satisfying underdog xianxia, warm absurd humour, danger with
  consequence; no real-world political/country simulation.

## 3. Player loop

```
Read scene → walk local map → meet/event/exit → decide or free-type
  → spend/earn HP, qi, time, gold, materials → improve build
  → unlock harder region/node → resolve chapter/ending
```

The loop is intentionally **rail-free on the surface**. Research on cultivation
RPGs (仙途/XianTu, 文字修仙, Idle Xanxia) and narrative RPGs (Disco Elysium,
Pentiment) converges on three concrete rules the UI must honour:

1. **Always show the next milestone.** Idle Xanxia's "objective on the battle
   screen" pattern keeps the player oriented. Every scene renders one
   `objective` line derived from save state (e.g. `Mở khóa Cảnh 2: tìm manh mối
   ở Hang Phong Ấn` / `Unlock Tier 2: find the clue in Sealed Cave`). This is a
   deterministic fact, never a spoiler of the ending.
2. **Three authored choices + free text.** CMU dialogue-interface research
   (Façade study) shows sentence-selection maximises *story involvement* while
   natural-language entry is the *most enjoyable*. Phế Căn Ký ships both: three
   contextual choices (sentence-selection) and a free-text command box. The free
   text is parsed by the deterministic reducer, never by an LLM.
3. **Micro-reactivity, not branching trees.** Per Disco Elysium's writing
   doctrine, most choices are *aesthetic/textural*, not instrumental. The
   reducer records lightweight flags/booleans (e.g. `helped_farmer_tu`,
   `insulted_guard_truong`) that later narration references ("Ông Tu vẫn nhớ
   hôm ngươi giúp gặt lúa" / "Old Tu still remembers the day you helped him
   reap"). Flags never branch the plot off a rail; they re-tint narration.

### Minute-to-minute

- Walk with arrows/WASD on a **7×7 regional map** (see §6.4 for the node/edge
  contract; this matches the Slay the Spire / FTL node-map convention).
- Enter a glowing node to meet an NPC, trigger a story beat, gather, fight, or
  use an exit. Water/mountains block movement; exits change region.
- Choose one of three contextual actions or write an intention. The UI never
  says an action is invalid because it breaks the plot; narration replies in
  world terms and preserves a route to an ending (see §5 forced-convergence
  rule in the engine).

### Session loop

- Explore a safe or risky node; gain material/quest progress/gold, lose qi/HP
  or face danger (telegraphed before risky nodes — §5).
- At market/sect: sell materials, **exchange** a material for a survival tool
  (first strategic fork, §5), buy manuals/equipment, store valuables, make
  talent/technique/equipment choices.
- Rest/train to convert safety + resources into cultivation progress; the realm
  ladder (§6.2) makes the next breakthrough legible at a glance.

## 4. Scenario I: Phế linh căn

### Narrative premise

The protagonist returns to Greenwood Village with a crooked wood spirit root.
Their first goal is not immortality: survive, earn a foothold, learn why the
root did not die, and decide what kind of cultivator to become.

### Regions

| Region | Role | Core node payoff | Exit direction |
|---|---|---|---|
| Greenwood Village | tutorial/home | first NPCs, herb work | market, terraces |
| Cloudgather Market | economy/social | shop, exchanges, rumours | village, sect |
| Herb Terraces | gathering | herbs/materials, fatigue | village, forest |
| Mistbound Sect | advancement | storage, manuals, mentors | market, forest |
| Misty Forest | risk tutorial | beast material, encounter | terraces, cave |
| Sealed Cave | investigation | seal relics, elite danger | forest, rift |
| Cursed Rift | high-risk test | rare drop, death risk | cave, peak |
| Cloud Peak | finale | breakthrough/choice | authored terminal route |

Every region owns a local 7×7 map, one illustrated backdrop, passable terrain,
at least one entry/exit, NPC/event nodes and a safe recovery entry for old saves.

### NPC content contract

- Scenario I ships **30 named NPCs**, each with individual portrait, location,
  VI/EN name, role, greeting, relationship hook and at least one meaningful
  story/quest/market/combat connection.
- NPCs are not map decoration. A node must either offer conversation, quest
  state, trade, a rumour, a combat consequence or a future unlock.

### Endings

Scenario I has terminal authored outcomes: dangerous unfinished road/death,
ascension, market windfall, merchant path, and quiet harmony.  A terminal must
always explain the consequence, preserve the ending ID in save history, and
offer restart.  No valid run may soft-lock before an ending.

## 5. Systems

### Deterministic state

Only the reducer owns: seed/RNG, location/position, day, HP, qi, progress,
gold, inventory/storage, quests, achievements, flags, talents, techniques,
equipment, encounters, terminal state and ending.  Saves are schema-validated
and migrated.  Cosmetic loading never changes state.

### Combat and danger

- Encounters are turn-based: attack with learned technique, defend, or use a
  legal item. Enemy retaliation is deterministic from seed/state.
- HP=0 produces a terminal death only where rules say so; protective items can
  alter risk, not erase all consequence.
- Danger is telegraphed before a risky node/action.  Combat drops feed economy.

### Economy and material exchange

- Gold buys known goods, but exploration/combat materials are separately useful.
- At market, a material can be sold for immediate gold **or** exchanged for a
  healing/protection/cultivation tool.  This is the first strategic fork, not a
  cosmetic recipe list.
- Storage is capacity-limited; equipped items cannot be sold/stored; purchases,
  exchanges and rewards are all deterministic and testable.

### Cultivation/progression

- Five cultivation tiers gate increasingly dangerous regions and content.
- Scenario I has tiered talents, techniques/manuals, and equipment.  A player
  may choose at most one talent per tier; techniques/equipment have explicit
  acquisition and requirement rules.
- Locked content is visually dimmed or reduced to a non-spoiler silhouette with
  a requirement such as `Cảnh 2` or `Hãy tìm manh mối ở Hang Phong Ấn`.
- New content must declare stable ID, localization, source, requirement,
  mechanical effect, art record and test coverage.  Nothing is marked ready
  without a real registered asset.

### AI narrator boundary

The optional local narrator may supply bounded flavour prose, NPC banter and
side-quest proposals under lore/schema rules. It may not mutate game state,
grant rewards, change combat/quest results, unlock endings or make a run
unwinnable. Authored deterministic narration is always the fallback. Keys never
appear in browser source, commits, screenshots or logs.

## 6. UI/UX contract

This section is the implementation blueprint. A developer reading only this
section plus §4 (content) and §5 (systems) must be able to build the surface
without further clarification. Patterns below are drawn from shipped
cultivation RPGs (仙途/XianTu, 文字修仙, Idle Xanxia, react-xiuxian-game) and
narrative RPGs (Disco Elysium, Pentiment); see Appendix A.

### 6.1 Desktop one-viewport layout

At desktop height `>= 801px` the document has **no outer scroll**. The viewport
is a fixed CSS grid:

```
┌──────────────────────────────────────────────────────────────────────┐
│ TOP BAR  · title "Phế Căn Ký" · day counter · VI/EN toggle · save dot  │
├──────────────┬───────────────────────────────────┬──────────────────┤
│  LEFT         │  CENTER  (story / scene)           │  RIGHT HUD       │
│  Regional     │  ┌─ backdrop (region art)         │  Cultivation     │
│  7×7 map      │  ├─ scene text (typographic voice)│  realm ladder    │
│  (nodes,      │  ├─ 3 contextual choices           │  qi / breakthrough
│  player marker,│  ├─ free-text command box          │  progress bars   │
│  exits, fog)  │  └─ objective line (next milestone)│  4 quick actions │
│               │                                    │  (rest/train/   │
│               │                                    │   map/codex)    │
├──────────────┴───────────────────────────────────┴──────────────────┤
│ BOTTOM DOCK · keyboard tabs: People · Quests · Bag&Storage ·          │
│   Market&Deeds · Path&Equipment   (only active panel mounts;          │
│   long lists scroll inside the panel)                                 │
└──────────────────────────────────────────────────────────────────────┘
```

- **Stage (left/center/right) never moves** when a dock tab changes. Only the
  bottom dock panel swaps. At `height < 801px` the responsive document-flow
  fallback stacks the panels and prioritises reachable controls over the
  one-viewport constraint.
- **Palette:** ink-wash paper ground; panels are glassmorphism (translucent
  dark + `backdrop-filter: blur`) with a 1px jade (`#3fae9f`/`#7fd1c4`) hairline
  and crimson (`#c0392b`) accent for danger/damage and gold (`#d4af37`) for
  cultivation/breakthrough. Vietnamese cultivation prose uses a humanist serif
  for scene text (Pentiment's "typographic voice" lesson: the *type* carries
  tone); UI chrome uses a clean sans.
- **Reduced motion:** every transition that reacts to a reducer event/action
  nonce honours `prefers-reduced-motion: reduce` (no pose animation, instant
  state swap).

### 6.2 Cultivation HUD (right column)

The HUD is the player's at-a-glance cultivation status. It must render, in
order:

1. **Realm ladder** — the five Scenario-I tiers (§5) as a vertical track:
   `Phàm nhân → Luyện khí → Trúc cơ → Kim đan → Nguyên anh` (extendable). The
   current tier is highlighted (`is-current`); reached tiers are lit
   (`is-reached`); locked tiers are dimmed with a requirement whisper (never a
   full spoiler), e.g. `Yêu cầu: Cảnh 3` / `Requires: Tier 3`.
2. **Progress bars** — two bars: `Khí` (qi toward next action budget / tier
   threshold) and `Đột phá` (breakthrough progress). Bars are deterministic
   (`state.qi`, `state.progress`); width = percentage only.
3. **Resource chips** — HP, qi, gold, day, and a material-count summary.
4. **Four quick actions** — `Nghỉ` (rest), `Tu luyện` (train), `Bản đồ` (map
   focus), `Thư viện` (codex/people). These mirror reducer actions; disabled
   when `state.terminal`.

Reference: 仙途's realm + breakthrough bars and Idle Xanxia's always-visible
objective are the proven pattern — the player must never wonder "what now?".

### 6.3 Dialogue & choice UI (center)

- **Scene text** uses the typographic-voice treatment (§6.1 font): compact,
  concrete, character-driven Vietnamese. Internal "voice" lines (Disco
  Elysium's competing-authors idea) may appear as italic `nội tâm` asides when
  the player has a relevant talent/flag — purely flavour, never mechanical.
- **Three contextual choices** are rendered as sentence-selection buttons
  (best story involvement per CMU study). They are authored per story beat in
  content; the reducer maps each to a deterministic transition.
- **Free-text command box** sits below the choices. Submitting parses the
  command against the reducer (aliases in content). On the 3rd consecutive
  invalid input the engine forces a lore-consistent valid action (§5). The box
  must *never* say "invalid" — it replies in-world.
- **Objective line** (§3 rule 1) is always visible at the bottom of the center
  column, derived from save state.

### 6.4 Regional map (left column)

The map is a **node-and-edge graph** on a 7×7 grid, matching the Slay the
Spire / FTL convention:

- **Nodes** carry a `type`: `npc`, `event`, `gather`, `combat`, `exit`,
  `rest`, `shop`, `storage`. Each glowing node shows its art/icon and, on
  hover/focus, a one-line label.
- **Edges** connect orthogonal neighbours. Movement is blocked by
  water/mountain terrain. Each step may cost `qi`/`time` (deterministic); risky
  nodes telegraph danger before entry (§5).
- **Fog:** only nodes adjacent to the player (or already discovered) are
  interactive; distant nodes are dimmed. Exits are edges that change
  `state.regionId` and load the next region's 7×7 map.
- **Player marker** is the protagonist sprite in its current action pose,
  keyed off the reducer's `actionKind`/`actionNonce` so motion reflects real
  events.
- Keyboard: arrows/WASD move; `Enter`/`Space` enters the focused node; `Esc`
  returns focus to the center column.

### 6.5 Art and motion

- Each NPC has a distinct portrait; no group placeholder, emoji, CSS
  silhouette, or reused portrait satisfies the NPC content contract (30 NPCs,
  §4).
- Current region has a backdrop; the player has 11 action poses (idle, move,
  talk, gather, cultivate, rest, use, attack, defend, hurt, death).
- Motion reflects real reducer events/action nonce and honours reduced-motion.
- All current content art is manifest-backed (§5 asset registry). New content
  stays `queued` or `loading` until its individual art exists; **never lie with
  a ready count** (the asset-pack manifest reports honest loaded/required
  counts and flips to `ready` only when loaded >= required).

### 6.6 Writing / localization

- Vietnamese uses natural cultivation prose: compact, concrete, and
  character-driven. Do not translate English syntax/idioms literally.
- UI may be concise; internal IDs and mechanical words (`deterministic`,
  `forced convergence`, raw event IDs) are forbidden in player-facing copy.
- Bilingual fields are required on every content record (§4 schemas): `vi` is
  canonical authored voice, `en` is a faithful adaptation.

### 6.7 Content authoring templates (implementation-ready)

These schemas are the contract every content record must satisfy. IDs are
stable snake_case; art filenames are the kebab-case of the id
(`moonstone_pendant` → `moonstone-pendant.png`). See `src/content/*` for the
live Zod-validated implementations.

```ts
// NPC — exactly 30 in Scenario I
{ id, nameVi, nameEn, roleVi, roleEn, regionId, nodeId,
  greetingVi, greetingEn, relationshipHookVi, relationshipHookEn,
  portraitArt, // filename in src/assets/art/npcs/
  connections: ('quest'|'trade'|'rumour'|'combat'|'unlock')[] }

// Item — usable / material / equipment / manual
{ id, nameVi, nameEn, descVi, descEn, aliases: string[],
  usable?: boolean, effects?: { hp?, qi? },
  equipmentSlot?: 'weapon'|'robe'|'accessory',
  requiredStage?: number, buyPrice: number|null, sellPrice: number|null,
  teachesTechniqueId?: string, art? /* src/assets/art/items/<id>.png */ }

// Talent (choose ≤1 per tier) / Technique (learned from manual)
{ id, nameVi, nameEn, descVi, descEn, tier: number,
  requirement?: string, art /* src/assets/art/talents/<id>.png */ }

// Region — owns a 7×7 map
{ id, nameVi, nameEn, backdropArt, entryNodeId, exits: {toRegionId, viaNodeId}[],
  nodes: { id, type, x, y, terrain?: 'water'|'mountain' }[],
  npcs: string[], safeRecoveryNodeId }

// Ending — terminal, always explains consequence + preserves endingId
{ id, nameVi, nameEn, kind: 'death'|'ascension'|'windfall'|'merchant'|'harmony',
  condition: (state) => boolean, proseVi, proseEn, restartAllowed: true }
```

Adding content is **data + art + a deterministic source/requirement**, never a
reducer rewrite (§7). Validation rejects duplicate IDs, broken references,
missing localizations, and art records that claim readiness without a real file.

### 6.8 Accessibility

- Keyboard-operable everywhere: map movement, choices, dock tabs (arrow +
  Enter), free-text, shop/storage/codex actions.
- Visible focus rings; `prefers-reduced-motion` disables pose/motion animation.
- Text contrast meets WCAG AA on the ink-wash palette; art never carries
  information required to play (labels accompany every portrait/icon).
- VI/EN toggle is a single keypress and persists in the save.

## 7. Content pipeline for future scenarios

1. Add a scenario manifest (regions, node maps, chapters, NPCs, endings).
2. Add IDs/localization/data validation before reducer changes.
3. Add art registry and manifest entries; create one asset per promised record.
4. Add deterministic sources/requirements and save migration if needed.
5. Add unit tests, browser route(s), desktop screenshot review, then push.

## 8. Delivery roadmap and gates

### M0 — Foundation (complete/maintain)
One-viewport UX, save/schema, bilingual UI, 30 NPCs, regional maps, deterministic
story/endings, basic combat/shop/lottery/storage/achievements.

### M1 — Scenario I vertical slice
Complete all regional nodes with authored encounter/reward/relationship purpose;
all 5 endings reachable from a fresh run; one intentional build path per tier.

### M2 — Depth
Material exchange/crafting decisions, faction reputation/relationship thresholds,
elite encounters, secrets/rumours and meaningful alternative routes.  Each adds
an E2E route and no unearned UI bulk.

### M3 — Expansion-ready
Scenario-pack loader, authoring templates, validation for broken references,
asset pipeline and content-editor documentation.  Adding Scenario II must not
require rewriting Scenario I reducer rules or invalidating saves.

## 9. Definition of done for any worker ticket

A ticket is not done because a file exists. It must have:

1. a GDD section and acceptance rule it satisfies;
2. stable data/ID and no hidden rule bypass;
3. UI that is reachable in the one-viewport layout;
4. tests at appropriate reducer/component/browser layers;
5. typecheck, lint, production build and relevant Playwright paths green;
6. desktop screenshot review where visual/layout changed;
7. truthful asset/save migration status; and
8. a focused commit with no unrelated WIP.

## 10. Agent operating protocol

Before coding: cite the GDD section, inspect current state, define files owned
and an acceptance route.  After coding: run the gate above, request a read-only
cross-review for behaviour/UX risk, fix findings, then commit.  Never mix a
new content slice with another worker's uncommitted assets.  Benchmark research
can inspire a specific pattern, but it may not expand scope without adding it
to this GDD and a milestone.

## Appendix A — Reference games & UI research

Compiled to ground the §6 UI contract in shipped, comparable products. Patterns
here are *inspiration for layout/tone*, not features to copy blindly — every
adopted pattern must still satisfy the deterministic/AI-boundary rules in §5.

### A.1 Cultivation / xianxia RPGs (genre peers)

| Game | Stack / form | UI patterns adopted into §6 |
|---|---|---|
| **仙途 / XianTu** (qianye60) | Vue3+TS, AI-driven, open world | Three-zone desktop (left attrs · center log · right sects/functions); realm + breakthrough progress bars; zoomable/draggable SVG map (洞府/宗门/城镇/秘境 icons); sect contribution + 藏经阁 manuals; 3000-Daos side systems; multi-save + preset import/export |
| **文字修仙** (Martinqi826) | Single-file HTML, idle | Ink-wash + jade/crimson/gold glassmorphism; robe colour tracks spirit element; 21 realm tiers; tribulations; alchemy/sect/dungeon/partner systems; ships a 19-chapter whitepaper (documentation discipline) |
| **Idle Xanxia** (Cezae) | Browser idle | **Always-visible objective / next milestone**; clear Aspect/Body/Dao separation; tooltips; active-effects tab; guardrails after tab-switch |
| **react-xiuxian-game** (zhangchengyu) | React+TS+Vite | Modal-per-system architecture (inventory/shop/sect/lottery/alchemy/achievement); 7 realms × 10 layers; equipment slots; lifebound treasure; achievements/titles |
| **我的文字修仙世界** (Steam) | Text MMORPG | Equipment 10 tiers × quality ranks; auto-combat treasures; auction-house economy; sect trial zones (grid-flip) |

**Takeaways:** (1) the three-zone desktop is the genre standard — §6.1 matches
it; (2) a persistent **objective line** is what separates a confusing sandbox
from a directed experience — mandated in §3 rule 1 and §6.2/§6.3; (3) realm
ladders with progress bars are non-negotiable for cultivation feel — §6.2; (4)
glassmorphism + restrained jade/crimson/gold reads as "xianxia" without 3D art.

### A.2 Narrative RPGs (dialogue & text craft)

| Game | Lesson adopted |
|---|---|
| **Disco Elysium** | Branching choices are *aesthetic/textural*, not instrumental; **micro-reactivity** (trivial choices flip booleans later referenced); "river" + "detour" structures; minimize gamification; radical asymmetry (different builds → different experiences) → §3 rules 2–3, §6.3 internal-voice asides |
| **Pentiment** | **Typographic voice**: typeface carries class/culture/tone; dynamic text is part of the experience, not decoration → §6.1 scene-text font treatment |
| **CMU Façade dialogue study** | Sentence-selection → best *story involvement*; free-text NLU → most *enjoyable* (least control); abstract menus → most *sense of control*. Phế Căn Ký ships **both** sentence-selection choices **and** free-text, satisfying all three → §3 rule 2, §6.3 |

### A.3 Map / exploration conventions

| Game | Lesson adopted |
|---|---|
| **Slay the Spire** | Node-and-edge map; multiple converging paths; path-summary tooling → §6.4 |
| **FTL** | Move only along linked edges; travel has a resource cost (fuel); visible-neighbour fog; one-way/impassable states → §6.4 edges, fog, exits |

### A.4 Non-goals (explicitly excluded from Phế Căn Ký)

- No idle/auto-play loop as the core (idle peers prove the genre, but our pillar
  2 "visible ambition, hidden rails" wants *agency*, not AFK grind).
- No real-money economy / auction house / MMO persistence (single-player,
  deterministic save only — §5).
- No LLM-authored state, rewards, or endings (AI boundary, §5).
- No 3D or heavy animation pipeline; 2D illustrated + pose motion only (§6.5).
