# Complete Game Acceptance Contract

This document defines **complete** for *Phế Căn Ký / Tale of the Broken Root*. It is an acceptance contract, not a progress claim. A build remains incomplete until every required condition has verifiable evidence.

## Playable RPG core

- A PC web build starts a new run, allows keyboard map movement, presents three authored choices plus free text, and always reaches one of the authored endings.
- Scenario I, **Phế linh căn**, is playable from opening to a terminal ending. Death is a valid terminal state; a run may not become directionless or unfinishable.
- The deterministic game layer owns HP, Qi, gold, positions, inventory, quests, flags, danger, endings, and all rewards. The browser save restores that state across reloads and validates/migrates its schema.
- Missions, shop, lottery, stats, storage, achievements, usable items, danger notices, continuous story events, and VI/EN UI all work in a browser journey.
- Combat/encounters, equipment, talents, techniques, and their progression must each have deterministic rules, UI feedback, tests, and at least one full player-facing path before the game can be called complete.

## NPC and illustrated-world requirement

- The shipped scenario has exactly 30 discoverable NPC definitions, with a meaningful role, location, localized name, greeting, and story/quest/encounter relationship.
- Every one of the 30 NPCs has its own visually distinct, verified portrait or character sprite. A group image, placeholder, CSS silhouette, emoji, or reused portrait does **not** satisfy this condition.
- The player has a distinct visual identity and readable action animation for at least idle, move, talk, gather, cultivate, rest, use-item, combat/encounter, hurt, and death.
- Each playable location has an illustrated map/environment. Items, equipment, talents, techniques, enemies, and effects have coherent art families rather than icon-only stand-ins.
- The game package includes all approved assets. It may load regional packs on demand for performance, but every pack is listed in a manifest with expected counts and verified loading status. “Queued” or missing art cannot be represented as complete.

## Content model and extension safety

- NPCs, locations, items, talents, techniques, enemies, quests, encounters, chapters, endings, art records, and asset packs use stable IDs and localized content fields.
- New content can be added as data plus assets without rewriting the deterministic reducer or invalidating a valid save. Content validation rejects duplicate IDs, broken references, missing localizations, and asset records that claim readiness without a real file.
- Asset-pack loading is progressive only at runtime: it must not remove a player-owned item, hide required gameplay information, or alter game rules when a cosmetic load fails.

## AI boundary

- The optional AI narrator may create prose, bounded NPC flavor, and side-content proposals only under a fixed schema and lore rules.
- AI output never directly writes deterministic state, grants items/currency, changes combat/quest outcomes, creates an ending, bypasses a locked route, or makes the game unwinnable.
- AI is optional for a complete browser run. If the local model is unavailable, deterministic authored narration remains playable.
- Credentials stay server-side/local environment only; no key appears in source, commits, browser bundles, logs, screenshots, or documentation.

## Browser acceptance evidence

Completion requires a clean production build plus recorded automated evidence for:

1. Typecheck, lint, unit/component tests, build, and browser E2E all pass.
2. A fresh save can complete Scenario I through each authored ending route, including a death outcome, without a soft lock.
3. Keyboard movement, VI/EN toggle, choices, free-text correction, item use, storage, shop, lottery, achievements, combat/encounter, equipment/talent/technique changes, and reload persistence are exercised.
4. Visual review at desktop PC size confirms illustrated map, individual NPC art, action animation, readable controls, no replacement icon-only gameplay art, and no missing-art claims.
5. Asset manifest evidence shows every shipped required pack ready and every 30-NPC portrait verified.

Until those five evidence groups and all earlier clauses are met, the correct status is **in progress**, not “complete.”
