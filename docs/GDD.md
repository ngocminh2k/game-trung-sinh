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

### Minute-to-minute

- Walk with arrows/WASD on a **7×7 regional map**.
- Enter a glowing node to meet an NPC, trigger a story beat, gather, fight, or
  use an exit. Water/mountains block movement; exits change region.
- Choose one of three contextual actions or write an intention.  The UI never
  says an action is invalid because it breaks the plot; narration replies in
  world terms and preserves a route to an ending.

### Session loop

- Explore a safe or risky node.
- Gain material/quest progress/gold; lose qi/HP or face danger.
- At market/sect, sell materials, exchange for survival tools, buy manuals or
  equipment, store valuables and make build choices.
- Rest/train to turn safety and resources into cultivation progress.

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

### Desktop layout

- At desktop height >=801px the document has no outer scroll.
- **Stage:** left regional map, centre scene/story/choice/free-input, right
  compact cultivation HUD and four quick actions.
- **Journey systems dock:** full-width bottom strip; horizontal keyboard-accessible
  tabs: People, Quests, Bag & Storage, Market & Deeds, Path & Equipment. Only
  active content mounts and long lists scroll inside the panel.
- Map and story never move when a systems tab changes.  At lower heights the
  responsive document-flow fallback prioritizes reachable controls over the
  one-viewport constraint.

### Art and motion

- Each NPC has a distinct portrait; no group placeholder satisfies NPC content.
- Current region has a backdrop; player has 11 action poses (idle, move, talk,
  gather, cultivate, rest, use, attack, defend, hurt, death).
- Motion reflects real reducer events/action nonce and honours reduced-motion.
- All current content art is manifest-backed. New content stays `queued` or
  `loading` until its individual art exists; never lie with a ready count.

### Writing/localization

- Vietnamese uses natural cultivation prose: compact, concrete, and character
  driven. Do not translate English syntax/idioms literally.
- UI may be concise; internal IDs and mechanical words (`deterministic`,
  `forced convergence`, raw event IDs) are forbidden in player-facing copy.

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
