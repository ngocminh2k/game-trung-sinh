import { z } from 'zod'
import {
  AchievementDefSchema,
  BeatDefSchema,
  ChapterDefSchema,
  CellDefSchema,
  EndingDefSchema,
  ItemDefSchema,
  RefinementRecipeDefSchema,
  LocationDefSchema,
  NpcDefSchema,
  QuestDefSchema,
  EnemyDefSchema,
  EquipmentDefSchema,
  TalentDefSchema,
  TechniqueDefSchema,
} from '../engine/schema'
import { ACHIEVEMENTS } from './achievements-data'
import { BEATS, BEAT_PREDICATE_IDS } from './beats-data'
import { CHAPTERS } from './chapters'
import { ENDINGS } from './endings-data'
import { ITEMS } from './items'
import { RECIPES } from './refinement'
import { CELLS, isPassable, LOCATIONS, MAP_HEIGHT, MAP_WIDTH, REGION_MAPS } from './locations'
import { NPCS } from './npcs'
import { QUESTS } from './quests'
import { ENEMIES, EQUIPMENT, TALENTS, TECHNIQUES } from './rpg'
import { STORY_SCENES } from './story'

export { ACHIEVEMENTS, getAchievement } from './achievements-data'
export { BEATS, BEAT_PREDICATE_IDS } from './beats-data'
export type { BeatPredicateId } from './beats-data'
export { CHAPTERS } from './chapters'
export { ENDINGS } from './endings-data'
export { getStoryScene, STORY_SCENES } from './story'
export {
  cellAt,
  CELLS,
  entryPositionFor,
  getLocation,
  getRegionMap,
  isPassable,
  LOCATIONS,
  locationDanger,
  MAP_HEIGHT,
  MAP_WIDTH,
  REGION_MAPS,
  regionCellAt,
} from './locations'
export { getItem, ITEMS, SHOP_STOCK } from './items'
export { HYBRID_RECIPES, hybridForSeason } from './alchemy'
export { BEASTS } from './beasts'
export { NAME_MEMORIES, NIGHT_PAGES } from './name-memories'
export { getRecipe, RECIPES } from './refinement'
export { ROMANCE_TRACKS, romanceTrackFor } from './romance'
export { SHOPS, NPCS_WITHOUT_SHOP } from './shops'
export { SUBLAYERS, sublayerFor } from './sublayers'
export { SYSTEM_MESSAGES, SYSTEM_HEADER_EN, SYSTEM_HEADER_VI } from './system-messages'
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
  check(z.array(RefinementRecipeDefSchema).min(1), RECIPES, 'RECIPES')
  check(z.array(TalentDefSchema).min(1), TALENTS, 'TALENTS')
  check(z.array(TechniqueDefSchema).min(1), TECHNIQUES, 'TECHNIQUES')
  check(z.array(EquipmentDefSchema).min(1), EQUIPMENT, 'EQUIPMENT')
  check(z.array(EnemyDefSchema).min(1), ENEMIES, 'ENEMIES')
  check(z.array(LocationDefSchema).min(1), LOCATIONS, 'LOCATIONS')
  check(z.array(CellDefSchema).length(MAP_WIDTH * MAP_HEIGHT), CELLS, 'CELLS')
  check(NpcDefSchema.array().min(60), NPCS, 'NPCS')
  check(z.array(ChapterDefSchema).length(8), CHAPTERS, 'CHAPTERS')
  check(z.array(EndingDefSchema).length(12), ENDINGS, 'ENDINGS')
  check(z.array(QuestDefSchema).min(150), QUESTS, 'QUESTS')
  check(z.array(AchievementDefSchema).min(1), ACHIEVEMENTS, 'ACHIEVEMENTS')
  check(z.array(BeatDefSchema).min(1), BEATS, 'BEATS')
  if (STORY_SCENES.length < 6) errors.push('STORY_SCENES: six authored scenes are required')

  const checkUniqueIds = (label: string, records: ReadonlyArray<{ id: string }>): void => {
    const seen = new Set<string>()
    for (const record of records) {
      if (seen.has(record.id)) errors.push(`${label}: duplicate id ${record.id}`)
      seen.add(record.id)
    }
  }
  checkUniqueIds('ITEMS', ITEMS)
  checkUniqueIds('RECIPES', RECIPES)
  checkUniqueIds('TALENTS', TALENTS)
  checkUniqueIds('TECHNIQUES', TECHNIQUES)
  checkUniqueIds('EQUIPMENT', EQUIPMENT)
  checkUniqueIds('ENEMIES', ENEMIES)
  checkUniqueIds('LOCATIONS', LOCATIONS)
  checkUniqueIds('QUESTS', QUESTS)
  checkUniqueIds('ACHIEVEMENTS', ACHIEVEMENTS)
  checkUniqueIds('BEATS', BEATS)

  const npcIds = new Set(NPCS.map((n) => n.id))
  const itemIds = new Set(ITEMS.map((item) => item.id))
  for (const q of QUESTS) {
    if (!npcIds.has(q.giverNpcId)) errors.push(`QUESTS: giver ${q.giverNpcId} missing`)
    if (q.steps.length === 0) errors.push(`QUESTS: ${q.id} has no steps`)
    for (const step of q.steps) {
      if (step.completeItems !== undefined) {
        for (const itemId of Object.keys(step.completeItems)) {
          if (!itemIds.has(itemId)) errors.push(`QUESTS: ${q.id} step ${step.id} references missing item ${itemId}`)
        }
      }
    }
    if (q.nextQuestId !== undefined && !QUESTS.some((qq) => qq.id === q.nextQuestId)) {
      errors.push(`QUESTS: ${q.id} nextQuest ${q.nextQuestId} not found`)
    }
  }
  for (const n of NPCS) {
    if (!LOCATIONS.some((l) => l.id === n.locationId)) {
      errors.push(`NPCS: ${n.id} at unknown location ${n.locationId}`)
    }
  }
  const locationIds = new Set(LOCATIONS.map((location) => location.id))
  for (const recipe of RECIPES) {
    if (!locationIds.has(recipe.locationId)) errors.push(`RECIPES: ${recipe.id} has unknown location`)
    for (const itemId of Object.keys(recipe.ingredients)) {
      if (!itemIds.has(itemId)) errors.push(`RECIPES: ${recipe.id} ingredient ${itemId} missing`)
    }
    if (!itemIds.has(recipe.output.itemId)) errors.push(`RECIPES: ${recipe.id} output ${recipe.output.itemId} missing`)
  }
  if (REGION_MAPS.length !== LOCATIONS.length) errors.push('REGION_MAPS: every location needs one local map')
  for (const map of REGION_MAPS) {
    if (!locationIds.has(map.locationId)) errors.push(`REGION_MAPS: unknown location ${map.locationId}`)
    if (map.cells.length !== MAP_WIDTH * MAP_HEIGHT) errors.push(`REGION_MAPS: ${map.locationId} must have ${String(MAP_WIDTH * MAP_HEIGHT)} cells`)
    const positions = new Set(map.cells.map((cell) => `${cell.x},${cell.y}`))
    if (positions.size !== map.cells.length) errors.push(`REGION_MAPS: ${map.locationId} has duplicate cells`)
    const entry = map.cells.find((cell) => cell.x === map.entry.x && cell.y === map.entry.y)
    if (entry === undefined || !isPassable(entry)) errors.push(`REGION_MAPS: ${map.locationId} needs a passable entry`)
    for (const cell of map.cells) {
      if (cell.exitTo !== undefined && !locationIds.has(cell.exitTo)) errors.push(`REGION_MAPS: ${map.locationId} exits to unknown ${cell.exitTo}`)
    }
  }
  const techniqueIds = new Set(TECHNIQUES.map((technique) => technique.id))
  for (const equipment of EQUIPMENT) {
    if (!itemIds.has(equipment.itemId)) errors.push(`EQUIPMENT: item ${equipment.itemId} missing`)
    const item = ITEMS.find((entry) => entry.id === equipment.itemId)
    if (item !== undefined && item.equipmentSlot !== equipment.slot) {
      errors.push(`EQUIPMENT: ${equipment.id} slot does not match item ${equipment.itemId}`)
    }
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
    if (!BEAT_PREDICATE_IDS.includes(b.predicate)) errors.push(`BEATS: ${b.id} has unknown predicate ${b.predicate}`)
    for (const a of b.suggested) {
      if (a.kind === 'talk' && 'npcId' in a && !npcIds.has(String(a.npcId))) {
        errors.push(`BEATS: ${b.id} talks to unknown npc ${String(a.npcId)}`)
      }
    }
  }
  return { ok: errors.length === 0, errors }
}
