import { z } from 'zod'
import {
  AchievementDefSchema,
  BeatDefSchema,
  ChapterDefSchema,
  CellDefSchema,
  EndingDefSchema,
  ItemDefSchema,
  LocationDefSchema,
  NpcDefSchema,
  QuestDefSchema,
} from '../engine/schema'
import { ACHIEVEMENTS } from './achievements-data'
import { BEATS } from './beats-data'
import { CHAPTERS } from './chapters'
import { ENDINGS } from './endings-data'
import { ITEMS } from './items'
import { CELLS, LOCATIONS, MAP_HEIGHT, MAP_WIDTH } from './locations'
import { NPCS } from './npcs'
import { QUESTS } from './quests'

export { ACHIEVEMENTS, getAchievement } from './achievements-data'
export { BEATS } from './beats-data'
export { CHAPTERS } from './chapters'
export { ENDINGS } from './endings-data'
export {
  cellAt,
  CELLS,
  getLocation,
  isPassable,
  LOCATIONS,
  locationDanger,
  MAP_HEIGHT,
  MAP_WIDTH,
} from './locations'
export { getItem, ITEMS, SHOP_STOCK } from './items'
export { getNpc, NPCS, npcsAt } from './npcs'
export { getQuest, QUESTS } from './quests'

export interface ContentValidationReport {
  ok: boolean
  errors: string[]
}

export function validateAllContent(): ContentValidationReport {
  const errors: string[] = []
  const check = <T>(schema: z.ZodType<T>, data: T, label: string): void => {
    const result = schema.safeParse(data)
    if (!result.success) {
      const details = result.error.issues
        .map((i) => `${i.path.join('.') || '<root>'}: ${i.message}`)
        .join('; ')
      errors.push(`${label}: ${details}`)
    }
  }
  check(z.array(ItemDefSchema).min(1), ITEMS, 'ITEMS')
  check(z.array(LocationDefSchema).min(1), LOCATIONS, 'LOCATIONS')
  check(z.array(CellDefSchema).length(MAP_WIDTH * MAP_HEIGHT), CELLS, 'CELLS')
  check(NpcDefSchema.array().length(30), NPCS, 'NPCS')
  check(z.array(ChapterDefSchema).length(5), CHAPTERS, 'CHAPTERS')
  check(z.array(EndingDefSchema).length(5), ENDINGS, 'ENDINGS')
  check(z.array(QuestDefSchema).min(1), QUESTS, 'QUESTS')
  check(z.array(AchievementDefSchema).min(1), ACHIEVEMENTS, 'ACHIEVEMENTS')
  check(z.array(BeatDefSchema).min(1), BEATS, 'BEATS')

  const npcIds = new Set(NPCS.map((n) => n.id))
  for (const q of QUESTS) {
    if (!npcIds.has(q.giverNpcId)) errors.push(`QUESTS: giver ${q.giverNpcId} missing`)
  }
  for (const n of NPCS) {
    if (!LOCATIONS.some((l) => l.id === n.locationId)) {
      errors.push(`NPCS: ${n.id} at unknown location ${n.locationId}`)
    }
  }
  for (const b of BEATS) {
    for (const a of b.suggested) {
      if (a.kind === 'talk' && 'npcId' in a && !npcIds.has(String(a.npcId))) {
        errors.push(`BEATS: ${b.id} talks to unknown npc ${String(a.npcId)}`)
      }
    }
  }
  const ids = new Set(BEATS.map((b) => b.id))
  if (ids.size !== BEATS.length) errors.push('BEATS: duplicate beat ids')
  return { ok: errors.length === 0, errors }
}
