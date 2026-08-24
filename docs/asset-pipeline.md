# Asset pipeline: Phế Căn Ký

The game must not return to emoji or terrain-glyph art. Every gameplay-facing
entity is identified by its stable game id; art is an independent layer and can
grow without changing deterministic saves or rules.

## First playable scenario: production targets

| Asset family | Release target | How it is used |
|---|---:|---|
| NPC portraits | 30 individual portraits | One portrait per `NPCS[id]`; the active location renders each NPC as a separate card. |
| Player character | 1 portrait + 4 action poses | Idle, walk, cultivate, hurt, and item-use states. |
| World locations | 7 painted scenes | Map plus encounter/arrival panels. |
| Items | 40 high-value illustrations | Real first-seen equipment, pills, charms, manuals, ingredients, and quest relics. |
| Talents and techniques | 60 visual sigils | Data-driven schools, rarity, elemental tint, and activation effect. |
| Effects | 24 reusable animation layers | Step dust, qi aura, talisman burn, hit flash, heal, draw/lottery, and weather. |

## Scaling beyond one thousand assets

Do **not** bundle a thousand PNG files in the startup page. The project should
keep a small identity bundle (current map, player, the local NPCs) and load
location packs only when the player enters an area. A future art manifest must
record: canonical id, asset family, style seed, pose, rarity, elemental tint,
source prompt version, and whether the asset is final or a temporary fallback.

For common loot, a base illustration plus deterministic rarity/element overlays
creates readable variety without pretending that one hundred nearly identical
items are hand-painted. Named equipment, bosses, story NPCs, and legendary
talents always receive unique art.

## Animation policy

Current UI animation is driven by the same deterministic action that changes
state: movement, cultivation, rest, talk, and item use. This makes it safe for
saves and replay. The next visual tier is authored sprite/pose frames for the
player and bosses; animations must be decorative only and never decide combat
or story outcomes.

## Asset completion order

1. Finish all 30 Scenario I NPC portraits, grouped by location.
2. Add player action-pose frames and key encounter scenes.
3. Add equipment, pill, talisman, herb, and manual families.
4. Add talent-school sigils and technique effects.
5. Add enemies, bosses, alternate outfits, endings, and seasonal variants.

Generated art is reviewed before it enters `src/assets/art`; credentials and
generation service keys are never stored in the repository.
