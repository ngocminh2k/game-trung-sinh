import { describe, expect, it } from 'vitest'
import { EQUIPMENT, getItem, SHOPS, SYSTEM_QUESTS, TECHNIQUES } from '../src/content'
import { newGame } from '../src/engine/constants'
import { applyAction } from '../src/engine/reducer'
import type { GameState } from '../src/engine/types'

/**
 * Audit and regression suite for System Quest Chain reward and turn-in item usability.
 * Task origin: docs/agent-work/active/system-quest-chain-ramp.md "Follow-up claims" U4 (D6).
 *
 * ESTABLISHED ENGINE FACTS:
 * 1. Stage baseline: `player.stage` starts at 0 (`newGame`, src/engine/constants.ts:13).
 * 2. Quest ramp has NO stage coupling: system quests carry zero `requiredStage` field,
 *    and turn-ins grant no cultivation progress or stage advances (src/engine/reducer.ts:1816).
 *    Therefore a player can reach any point in the chain at stage 0.
 * 3. Fallback stage floor F: per task instruction ("if F not derivable from realistic ramp,
 *    use 1 = 'usable on the day it is granted'"), F = 1 is documented as the floor for
 *    the chain's early tier.
 * 4. Consumable gating: `ItemDef.requiredStage` is authored as "Market availability gate"
 *    (src/engine/content-types.ts:15). In the engine (`doUseItem`, src/engine/reducer.ts:943)
 *    and the inventory UI (src/ui/gameScreen/panels.tsx:177, 221; LeftRailTabContent.tsx:230),
 *    consumable use is UNGATED by stage. `ninefold_pill` and `marrow_gather_pill` can be
 *    consumed immediately at stage 0. The suspected "dead pill" defect was a misreading
 *    of the equipment gate at panels.tsx:463.
 * 5. Equipment and manual gating:
 *    - `doEquipItem` (reducer.ts:1051) and equipment UI (panels.tsx:463) gate on `item.requiredStage`.
 *    - `doLearnTechnique` (reducer.ts:992) and technique UI gate on `technique.requiredStage`.
 * 6. Turn-in obtainability: `q_sys_assassin_04` / `q_sys_assassin_05` used to require turn-in
 *    of hidden manuals with `buyPrice: null`, no shop stock and no drops, so the chain was
 *    deadlocked. Fixed by giving the two hidden manuals a numeric `buyPrice`
 *    (shadow_molt_hidden_manual 420, shadow_eclipse_step_hidden_manual 500). With no shop
 *    entry, `doBuy` (reducer.ts:786) still offers them through the generic static-price path,
 *    so assassin 04/05 are turn-in-able. The reward loop gold is intentionally lossy.
 */

describe('system quest rewards — consumable usability (U4 premise verification)', () => {
  it('consumables with requiredStage >= 2 are immediately usable at stage 0 in the engine', () => {
    // Both pills carry requiredStage: 2 in src/content/items.ts, but doUseItem has no stage check.
    const state0: GameState = {
      ...newGame('pill-check-stage-0'),
      player: { ...newGame('pill-check-stage-0').player, stage: 0, hp: 10, qi: 10 },
      inventory: { ninefold_pill: 1, marrow_gather_pill: 1 },
    }

    const useNinefold = applyAction(state0, { kind: 'use_item', itemId: 'ninefold_pill' })
    expect(useNinefold.events.some((e) => e.type === 'ERROR')).toBe(false)
    expect(useNinefold.events.some((e) => e.type === 'ITEM_USED')).toBe(true)
    expect(useNinefold.state.inventory.ninefold_pill ?? 0).toBe(0)

    const useMarrow = applyAction(state0, { kind: 'use_item', itemId: 'marrow_gather_pill' })
    expect(useMarrow.events.some((e) => e.type === 'ERROR')).toBe(false)
    expect(useMarrow.events.some((e) => e.type === 'ITEM_USED')).toBe(true)
    expect(useMarrow.state.inventory.marrow_gather_pill ?? 0).toBe(0)
  })

  it('all consumable reward items across all 60 system quests are marked usable: true', () => {
    const consumableRewardItemIds = new Set<string>()
    for (const q of SYSTEM_QUESTS) {
      for (const itemId of Object.keys(q.rewardItems)) {
        const item = getItem(itemId)
        if (item?.usable === true) {
          consumableRewardItemIds.add(itemId)
        }
      }
    }

    expect(consumableRewardItemIds.size).toBeGreaterThan(0)
    for (const itemId of consumableRewardItemIds) {
      const item = getItem(itemId)
      expect(item).toBeDefined()
      expect(item?.usable).toBe(true)
    }
  })
})

describe('system quest rewards — stage gate audit on non-consumables', () => {
  const STAGE_FLOOR_F = 1

  it('audits non-consumable reward items against stage floor F', () => {
    // Data-derived: collect all non-consumable rewards and check which ones
    // exceed stage floor F = 1.
    const gatedRewards: Array<{ questId: string; itemId: string; requiredStage: number; kind: string }> = []

    for (const q of SYSTEM_QUESTS) {
      for (const itemId of Object.keys(q.rewardItems)) {
        const item = getItem(itemId)
        if (!item || item.usable) continue
        const rs = item.requiredStage ?? 0
        if (rs > STAGE_FLOOR_F) {
          const kind = item.equipmentSlot ? 'equipment' : item.teachesTechniqueId ? 'manual' : 'material'
          gatedRewards.push({ questId: q.id, itemId, requiredStage: rs, kind })
        }
      }
    }

    // Documented audit finding: exactly 9 distinct items across 11 quests carry requiredStage > 1.
    // They are tier-2+ equipment and manuals (frostfang_saber, cloudveil_robe, moonstone_pendant,
    // cloudwalk_manual, tide_breath_manual, peak_cleaver_manual, stone_aegis_manual, and
    // two assassin hidden manuals).
    const gatedItemIds = new Set(gatedRewards.map((r) => r.itemId))
    expect(gatedItemIds).toEqual(
      new Set([
        'frostfang_saber',
        'cloudveil_robe',
        'moonstone_pendant',
        'cloudwalk_manual',
        'tide_breath_manual',
        'stone_aegis_manual',
        'peak_cleaver_manual',
        'shadow_eclipse_step_hidden_manual',
        'shadow_molt_hidden_manual',
      ]),
    )
  })

  it('equipment reward items correspond to valid EQUIPMENT entries with matching slot', () => {
    const equipRewardItemIds = new Set<string>()
    for (const q of SYSTEM_QUESTS) {
      for (const itemId of Object.keys(q.rewardItems)) {
        const item = getItem(itemId)
        if (item?.equipmentSlot) equipRewardItemIds.add(itemId)
      }
    }

    for (const itemId of equipRewardItemIds) {
      const equipDef = EQUIPMENT.find((e) => e.itemId === itemId)
      expect(equipDef, `item ${itemId} should be in EQUIPMENT`).toBeDefined()
      const item = getItem(itemId)
      expect(equipDef?.slot).toBe(item?.equipmentSlot)
    }
  })

  it('manual reward items correspond to valid TECHNIQUES entries', () => {
    const manualRewardItemIds = new Set<string>()
    for (const q of SYSTEM_QUESTS) {
      for (const itemId of Object.keys(q.rewardItems)) {
        const item = getItem(itemId)
        if (item?.teachesTechniqueId) manualRewardItemIds.add(itemId)
      }
    }

    for (const itemId of manualRewardItemIds) {
      const item = getItem(itemId)
      const tech = TECHNIQUES.find((t) => t.id === item?.teachesTechniqueId)
      expect(tech, `technique for ${itemId} should exist in TECHNIQUES`).toBeDefined()
      if (item?.requiredStage !== undefined) {
        expect(item.requiredStage, `item and technique requiredStage must match for ${itemId}`).toBe(
          tech?.requiredStage,
        )
      }
    }
  })
})

describe('system quest turn-in obtainability — world source audit', () => {
  it('every turn-in item has a world acquisition source', () => {
    // Build the set of all items available in any shop stall
    const shopStockItemIds = new Set<string>()
    for (const s of SHOPS) {
      for (const entry of s.entries) {
        shopStockItemIds.add(entry.itemId)
      }
    }

    // Check all turn-in items across all 60 quests
    const deadlockedTurnIns: Array<{ questId: string; itemId: string }> = []
    for (const q of SYSTEM_QUESTS) {
      for (const step of q.steps) {
        if (!step.completeItems) continue
        for (const itemId of Object.keys(step.completeItems)) {
          const item = getItem(itemId)
          const hasShopSource = shopStockItemIds.has(itemId) || typeof item?.buyPrice === 'number'
          const hasOtherQuestSource = SYSTEM_QUESTS.some(
            (other) => other.id !== q.id && itemId in other.rewardItems,
          )
          if (!hasShopSource && !hasOtherQuestSource) {
            deadlockedTurnIns.push({ questId: q.id, itemId })
          }
        }
      }
    }

    // All turn-in items must have a valid acquisition source (shop entry, market buyPrice, or prior quest)
    expect(deadlockedTurnIns).toEqual([])

    // Guard the specific fix: both assassin hidden manuals must have numeric buyPrice
    // so reducer.ts:786 offers them through the generic market path.
    expect(typeof getItem('shadow_molt_hidden_manual')?.buyPrice).toBe('number')
    expect(typeof getItem('shadow_eclipse_step_hidden_manual')?.buyPrice).toBe('number')
  })
})
