import { getEnemy, getEquipmentByItem } from '../content/rpg'
import type { EquipmentState, GameState } from './types'

const EMPTY_EQUIPMENT: EquipmentState = { weapon: null, robe: null, accessory: null }

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
  const equipment = ownedEquipment(state, state.equipment)
  const equipmentChanged =
    equipment.weapon !== state.equipment.weapon ||
    equipment.robe !== state.equipment.robe ||
    equipment.accessory !== state.equipment.accessory
  const encounter = hasValidEncounter(state) ? state.encounter : null
  if (!equipmentChanged && encounter === state.encounter) return state
  return { ...state, equipment, encounter }
}

export function isEquippedItem(state: GameState, itemId: string): boolean {
  return Object.values(state.equipment).includes(itemId)
}
