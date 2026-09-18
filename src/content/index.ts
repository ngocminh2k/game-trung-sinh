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
  CoercionDefSchema,
} from '../engine/schema'
import type { QuestDef } from '../engine/content-types'
import { ACHIEVEMENTS } from './achievements-data'
import { BEATS, BEAT_PREDICATE_IDS } from './beats-data'
import { CHAPTERS } from './chapters'
import { ENDINGS } from './endings-data'
import { ITEMS } from './items'
import { RECIPES } from './refinement'
import { CELLS, isPassable, LOCATIONS, MAP_HEIGHT, MAP_WIDTH, REGION_MAPS } from './locations'
import { NPCS } from './npcs'
import { QUESTS } from './quests'
import { ARENA_FLOOR_COUNT, ENEMIES, EQUIPMENT, TALENTS, TECHNIQUES } from './rpg'
import { COERCIONS } from './killer'
import { STORY_SCENES } from './story'
import { SYSTEMS, systemById } from './system-defs'
import { validateShops } from '../engine/shopStock'

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
export { getSkillNode, SKILL_NODES, SKILL_TREES } from './skill-tree'
export { SHOPS, NPCS_WITHOUT_SHOP } from './shops'
export { SUBLAYERS, sublayerFor } from './sublayers'
export { SYSTEM_MESSAGES, SYSTEM_HEADER_EN, SYSTEM_HEADER_VI } from './system-messages'
export { SYSTEMS, systemById } from './system-defs'
export { SYSTEM_QUESTS } from './system-quests'
export { getNpc, NPCS, npcsAt } from './npcs'
export { getQuest, QUESTS } from './quests'
export {
  ARENA_FLOOR_COUNT,
  ENEMIES,
  EQUIPMENT,
  TALENTS,
  TECHNIQUES,
  arenaEnemyForFloor,
  arenaFloors,
  eligibleEnemiesAt,
  enemyAt,
  getEnemy,
  getEquipmentByItem,
  getTalent,
  getTechnique,
  newEncounter,
} from './rpg'
export { COERCIONS, coercionFor } from './killer'

export interface ContentValidationReport {
  ok: boolean
  errors: string[]
}

const SYSTEM_CHAIN_PREFIX = 'q_sys_'
/** `q_sys_<pool>_<NN>` — pool letters plus the 2-digit ordinal. */
const SYSTEM_CHAIN_ID = /^q_sys_([a-z]+)_(\d\d)$/
/** The flag `doCompleteQuest` really writes: `quest_${fullQuestId}_done`. */
const SYSTEM_CHAIN_DONE_FLAG = /^quest_q_sys_([a-z]+)_(\d\d)_done$/
const chainDoneFlag = (questId: string): string => `quest_${questId}_done`

/**
 * System quest chains must be walkable from their head, or the pool deadlocks in
 * silence: a typo'd gate flag is never written, so nothing behind it can ever be
 * accepted. Returns content errors (empty when the chains are sound).
 */
export function validateSystemQuestChains(
  quests: readonly QuestDef[],
  systemIds: readonly string[],
): string[] {
  const errors: string[] = []
  const byId = new Map(quests.map((quest) => [quest.id, quest]))
  const pools = new Map<string, QuestDef[]>()
  for (const systemId of systemIds) pools.set(systemId.replace(/^sys_/, ''), [])

  for (const quest of quests) {
    if (!quest.id.startsWith(SYSTEM_CHAIN_PREFIX)) continue
    const own = SYSTEM_CHAIN_ID.exec(quest.id)
    const ownPool = own?.[1] ?? ''
    if (own === null || !pools.has(ownPool)) {
      errors.push(`SYSTEM_CHAIN: ${quest.id} matches no known system pool id (q_sys_<pool>_<NN>)`)
      continue
    }
    pools.get(ownPool)!.push(quest)
    if (quest.deadlineDays !== undefined) {
      errors.push(`SYSTEM_CHAIN: ${quest.id} has deadlineDays; an expired chain quest is untakeable and has no abandon path`)
    }
    for (const flag of quest.requiredFlags) {
      const gate = SYSTEM_CHAIN_DONE_FLAG.exec(flag)
      if (gate === null) {
        errors.push(`SYSTEM_CHAIN: ${quest.id} gate '${flag}' is not a chain completion flag (expected quest_q_sys_<pool>_<NN>_done, with the inner q_)`)
        continue
      }
      if (gate[1] !== ownPool) {
        errors.push(`SYSTEM_CHAIN: ${quest.id} gate '${flag}' references a quest outside its own pool ${ownPool}`)
      } else if (!byId.has(`q_sys_${gate[1]}_${gate[2]}`)) {
        errors.push(`SYSTEM_CHAIN: ${quest.id} gate '${flag}' names a quest that does not exist`)
      }
    }
    if (quest.nextQuestId === undefined) continue
    const target = byId.get(quest.nextQuestId)
    if (target === undefined || !target.id.startsWith(SYSTEM_CHAIN_PREFIX)) {
      errors.push(`SYSTEM_CHAIN: ${quest.id} nextQuest ${quest.nextQuestId} is not an existing system quest`)
      continue
    }
    const targetPool = SYSTEM_CHAIN_ID.exec(target.id)?.[1] ?? ''
    if (targetPool !== ownPool) {
      errors.push(`SYSTEM_CHAIN: ${quest.id} nextQuest ${quest.nextQuestId} is outside pool ${ownPool}`)
      continue
    }
    const expected = chainDoneFlag(quest.id)
    if (target.requiredFlags.length !== 1 || target.requiredFlags[0] !== expected) {
      errors.push(`SYSTEM_CHAIN: ${quest.id} -> ${quest.nextQuestId} is a one-way link: successor's requiredFlags are not exactly ['${expected}']`)
    }
  }

  for (const [pool, members] of pools) {
    if (members.length === 0) {
      errors.push(`SYSTEM_CHAIN: pool sys_${pool} has no system quests`)
      continue
    }
    // A fully-flat pool (no gates, no next links anywhere) is a legitimate
    // pre-migration state — every quest is a "head" by default, so head
    // uniqueness is not meaningful yet. The moment a pool shows chain evidence,
    // the ramp contract applies: exactly one head, or the chain has a branch or
    // a missing start and deadlocks.
    const chained = members.some((quest) => quest.requiredFlags.length > 0 || quest.nextQuestId !== undefined)
    if (!chained) continue
    const heads = members.filter((quest) => quest.requiredFlags.length === 0)
    if (heads.length !== 1) {
      errors.push(`SYSTEM_CHAIN: pool sys_${pool}: expected exactly one head quest with no gate, found ${String(heads.length)}`)
    }
  }
  return errors
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
  check(z.array(EndingDefSchema).length(22), ENDINGS, 'ENDINGS')
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
  if (SYSTEMS.length !== 10) errors.push('SYSTEMS: exactly 10 systems are required')
  const systemIds = new Set<string>()
  for (const [index, system] of SYSTEMS.entries()) {
    if (systemIds.has(system.id)) errors.push(`SYSTEMS: duplicate id ${system.id}`)
    systemIds.add(system.id)
    if (system.order !== index + 1) errors.push(`SYSTEMS: ${system.id} order must be ${String(index + 1)}`)
  }

  const npcIds = new Set(NPCS.map((n) => n.id))
  const itemIds = new Set(ITEMS.map((item) => item.id))
  // Issue 7: wire the NPC shop data gate — shops.ts was dead test-only data.
  validateShops(errors, itemIds, npcIds)
  for (const q of QUESTS) {
    if (q.requiredSystemId !== undefined) {
      const system = systemById(q.requiredSystemId)
      if (!q.id.startsWith('q_sys_')) errors.push(`QUESTS: system quest ${q.id} must use q_sys_ id`)
      if (q.giverNpcId !== null) errors.push(`QUESTS: system quest ${q.id} must have no giver`)
      if (q.storySceneNextId !== undefined) errors.push(`QUESTS: system quest ${q.id} must not advance story`)
      if (q.difficulty === undefined || q.difficulty < 1 || q.difficulty > 10) errors.push(`QUESTS: system quest ${q.id} difficulty must be 1..10`)
      if (system === undefined) {
        errors.push(`QUESTS: system quest ${q.id} has unknown system ${q.requiredSystemId}`)
      } else {
        const budget = system.rewardBudget
        if (q.rewardGold < budget.minGold || q.rewardGold > budget.maxGold) errors.push(`QUESTS: system quest ${q.id} reward gold outside budget`)
        if (q.rewardSpiritStones === undefined || q.rewardSpiritStones < budget.minSpiritStones || q.rewardSpiritStones > budget.maxSpiritStones) errors.push(`QUESTS: system quest ${q.id} spirit stones outside budget`)
        for (const itemId of Object.keys(q.rewardItems)) {
          if (!budget.itemPool.includes(itemId)) errors.push(`QUESTS: system quest ${q.id} reward ${itemId} outside budget`)
        }
      }
    } else if (q.giverNpcId === null) {
      errors.push(`QUESTS: ${q.id} has no giver and no system`)
    } else if (!npcIds.has(q.giverNpcId)) errors.push(`QUESTS: giver ${q.giverNpcId} missing`)
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
  errors.push(...validateSystemQuestChains(QUESTS, SYSTEMS.map((system) => system.id)))
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
  const arenaFloorsSeen = new Set<number>()
  for (const enemy of ENEMIES) {
    if (!locationIds.has(enemy.locationId)) errors.push(`ENEMIES: ${enemy.id} at unknown location`)
    for (const itemId of Object.keys(enemy.rewardItems)) {
      if (!itemIds.has(itemId)) errors.push(`ENEMIES: reward item ${itemId} missing`)
    }
    if (enemy.arena !== undefined) {
      // A duplicate floor number would make arenaEnemyForFloor return the
      // wrong warden; a number outside 1..N leaves a gap the ladder can never
      // climb past. Both must be content errors, not silent gameplay traps.
      if (arenaFloorsSeen.has(enemy.arena)) errors.push(`ENEMIES: arena floor ${enemy.arena} claimed twice (${enemy.id})`)
      arenaFloorsSeen.add(enemy.arena)
      if (enemy.arena < 1 || enemy.arena > ARENA_FLOOR_COUNT) {
        errors.push(`ENEMIES: ${enemy.id} arena floor ${enemy.arena} outside 1..${ARENA_FLOOR_COUNT}`)
      } else if (enemy.arena !== 1 && !ENEMIES.some((other) => other.arena === enemy.arena! - 1)) {
        errors.push(`ENEMIES: arena floor ${enemy.id} has no floor below it`)
      }
    }
  }
  // Issue #19 acceptance: at least one resource-plunder coercion choice must
  // exist, and every coercion must point at a real NPC with real loot.
  if (COERCIONS.length < 1) errors.push('COERCIONS: at least one coercion target is required')
  const coercionResult = z.array(CoercionDefSchema).min(1).safeParse(COERCIONS)
  if (!coercionResult.success) {
    for (const issue of coercionResult.error.issues) {
      errors.push(`COERCIONS: ${issue.path.join('.')}: ${issue.message}`)
    }
  } else {
    for (const coercion of COERCIONS) {
      if (!npcIds.has(coercion.npcId)) errors.push(`COERCIONS: unknown npc ${coercion.npcId}`)
      for (const itemId of Object.keys(coercion.stealItems)) {
        if (!itemIds.has(itemId)) errors.push(`COERCIONS: steal item ${itemId} missing`)
      }
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
