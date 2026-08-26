import { getEnemy, getEquipmentByItem } from '../content/rpg'
import { entryPositionFor, getRegionMap, isPassable, regionCellAt } from '../content/locations'
import type { EquipmentState, GameState } from './types'

const EMPTY_EQUIPMENT: EquipmentState = { weapon: null, robe: null, accessory: null }
const DIRECTIONS = [
  { x: 0, y: -1 }, { x: 0, y: 1 }, { x: -1, y: 0 }, { x: 1, y: 0 },
] as const

function hasWalkableNeighbor(locationId: string, x: number, y: number): boolean {
  return DIRECTIONS.some((direction) => {
    const cell = regionCellAt(locationId, x + direction.x, y + direction.y)
    return cell !== undefined && isPassable(cell)
  })
}

/** Older saves may point at the retired overview's wilderness or at a tile
 * that is now an impassable regional rim. Recover them at an authored entry
 * rather than loading a player who can no longer move. */
function sanitizeMapPosition(state: GameState): GameState {
  const locationId = state.player.locationId
  const currentCell = regionCellAt(locationId, state.player.posX, state.player.posY)
  const needsRecovery = getRegionMap(locationId) === undefined
    || currentCell === undefined
    || !isPassable(currentCell)
    || !hasWalkableNeighbor(locationId, state.player.posX, state.player.posY)
  if (!needsRecovery) return state
  const recoveredLocationId = getRegionMap(locationId) === undefined ? 'village' : locationId
  const entry = entryPositionFor(recoveredLocationId)
  return {
    ...state,
    player: { ...state.player, locationId: recoveredLocationId, posX: entry.x, posY: entry.y },
  }
}

function ownedEquipment(state: GameState, equipment: EquipmentState): EquipmentState {
  const next: EquipmentState = { ...EMPTY_EQUIPMENT }
  for (const slot of ['weapon', 'robe', 'accessory'] as const) {
    const itemId = equipment[slot]
    const definition = itemId === null ? undefined : getEquipmentByItem(itemId)
    if (definition?.slot === slot && itemId !== null && (state.inventory[itemId] ?? 0) > 0) {
      next[slot] = itemId
    }
  }
  return next
}

export function hasValidEncounter(state: GameState): boolean {
  const encounter = state.encounter
  if (encounter === null || state.terminal || !state.player.alive) return encounter === null
  const enemy = getEnemy(encounter.enemyId)
  return (
    enemy !== undefined &&
    enemy.locationId === state.player.locationId &&
    encounter.maxHp === enemy.maxHp &&
    encounter.hp >= 1 &&
    encounter.hp <= enemy.maxHp &&
    encounter.guard >= 0
  )
}

// Save files are user-controlled data. Invalid combat state is reset rather
// than kept as an unescapable turn lock; equipment is always derived from
// actually owned inventory entries, never from ids alone.
export function sanitizeRpgState(state: GameState): GameState {
  const mapped = sanitizeMapPosition(state)
  const equipment = ownedEquipment(mapped, mapped.equipment)
  const equipmentChanged =
    equipment.weapon !== mapped.equipment.weapon ||
    equipment.robe !== mapped.equipment.robe ||
    equipment.accessory !== mapped.equipment.accessory
  const encounter = hasValidEncounter(mapped) ? mapped.encounter : null
  if (!equipmentChanged && encounter === mapped.encounter) return mapped
  return { ...mapped, equipment, encounter }
}

export function isEquippedItem(state: GameState, itemId: string): boolean {
  return Object.values(state.equipment).includes(itemId)
}
