/**
 * Visual content is keyed by the stable deterministic IDs used in saves. This
 * keeps art additions independent from the game reducer and content rules.
 *
 * Registration is glob-driven: every `*.png` present under the art folders is
 * auto-discovered and exposed by its kebab-case filename mapped back to the
 * snake_case content id (e.g. `dew-pill.png` -> `dew_pill`). New illustrations
 * therefore need no code change — drop the file in and it registers. Missing
 * art simply stays absent (`undefined`) so the UI degrades to text instead of
 * showing a broken image, and the asset manifest reports an honest count.
 */

import { TALENTS, TECHNIQUES } from '../content/rpg'

const itemModules = import.meta.glob('../assets/art/items/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

const talentTechModules = import.meta.glob('../assets/art/talents/*.png', {
  eager: true,
  query: '?url',
  import: 'default',
}) as Record<string, string>

function toArtMap(modules: Record<string, string>): Record<string, string> {
  const out: Record<string, string> = {}
  for (const [path, url] of Object.entries(modules)) {
    const base = path
      .split('/')
      .pop()!
      .replace(/\.png$/i, '')
      .replace(/-/g, '_')
    out[base] = url
  }
  return out
}

const allTalentTech = toArtMap(talentTechModules)
const talentIds = new Set(TALENTS.map((t) => t.id))
const techniqueIds = new Set(TECHNIQUES.map((t) => t.id))

export const ITEM_ART: Readonly<Record<string, string>> = toArtMap(itemModules)
export const TALENT_ART: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(allTalentTech).filter(([id]) => talentIds.has(id)),
)
export const TECHNIQUE_ART: Readonly<Record<string, string>> = Object.fromEntries(
  Object.entries(allTalentTech).filter(([id]) => techniqueIds.has(id)),
)

export function itemArtFor(itemId: string): string | undefined {
  return ITEM_ART[itemId]
}

export function talentArtFor(talentId: string): string | undefined {
  return TALENT_ART[talentId]
}

export function techniqueArtFor(techniqueId: string): string | undefined {
  return TECHNIQUE_ART[techniqueId]
}

export function itemArtCount(): number {
  return Object.keys(ITEM_ART).length
}

export function talentTechArtCount(): number {
  return Object.keys(TALENT_ART).length + Object.keys(TECHNIQUE_ART).length
}
