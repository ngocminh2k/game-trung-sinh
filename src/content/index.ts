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
  EnemyDefSchema,
  EquipmentDefSchema,
  TalentDefSchema,
  TechniqueDefSchema,
} from '../engine/schema'
import { ACHIEVEMENTS } from './achievements-data'
import { BEATS } from './beats-data'
import { CHAPTERS } from './chapters'
import { ENDINGS } from './endings-data'
import { ITEMS } from './items'
import { CELLS, LOCATIONS, MAP_HEIGHT, MAP_WIDTH } from './locations'
import { NPCS } from './npcs'
import { QUESTS } from './quests'
import { ENEMIES, EQUIPMENT, TALENTS, TECHNIQUES } from './rpg'

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
export {
  ENEMIES,
  EQUIPMENT,
  TALENTS,
  TECHNIQUES,
  enemyAt,
  getEnemy,
  getEquipmentByItem,
  getTalent,
  getTechnique,
} from './rpg'

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
  check(z.array(TalentDefSchema).min(1), TALENTS, 'TALENTS')
  check(z.array(TechniqueDefSchema).min(1), TECHNIQUES, 'TECHNIQUES')
  check(z.array(EquipmentDefSchema).min(1), EQUIPMENT, 'EQUIPMENT')
  check(z.array(EnemyDefSchema).min(1), ENEMIES, 'ENEMIES')
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
  const itemIds = new Set(ITEMS.map((item) => item.id))
  const locationIds = new Set(LOCATIONS.map((location) => location.id))
  const techniqueIds = new Set(TECHNIQUES.map((technique) => technique.id))
  for (const equipment of EQUIPMENT) {
    if (!itemIds.has(equipment.itemId)) errors.push(`EQUIPMENT: item ${equipment.itemId} missing`)
  }
  for (const technique of TECHNIQUES) {
    if (technique.sourceItemId !== undefined && !itemIds.has(technique.sourceItemId)) {
      errors.push(`TECHNIQUES: source item ${technique.sourceItemId} missing`)
    }
  }
  for (const item of ITEMS) {
    if (item.teachesTechniqueId !== undefined && !techniqueIds.has(item.teachesTechniqueId)) {
      errors.push(`ITEMS: technique ${item.teachesTechniqueId} missing`)
    }
  }
  for (const enemy of ENEMIES) {
    if (!locationIds.has(enemy.locationId)) errors.push(`ENEMIES: ${enemy.id} at unknown location`)
    for (const itemId of Object.keys(enemy.rewardItems)) {
      if (!itemIds.has(itemId)) errors.push(`ENEMIES: reward item ${itemId} missing`)
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
