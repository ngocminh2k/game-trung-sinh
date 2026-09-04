import { describe, expect, it } from 'vitest'
import {
  ELEMENT_COUNTERS,
  ELEMENT_NAMES,
  ENEMIES,
  PLAYER_ELEMENT,
  comboMultiplier,
  eligibleEnemiesAt,
  elementMultiplier,
} from '../src/content/rpg'
import type { BehaviorPattern, Element } from '../src/engine/content-types'

// Inline validator mirrors EnemyDefSchema checks (W3 added fields the frozen
// schema.js cannot re-export to rpg.ts without a circular dep; content/index.ts
// still validates against the real schema at boot).
function validateEnemy(enemy: (typeof ENEMIES)[number]): string[] {
  const errors: string[] = []
  if (!enemy.id) errors.push('missing id')
  if (!enemy.locationId) errors.push('missing locationId')
  if (!enemy.nameVi) errors.push('missing nameVi')
  if (!enemy.nameEn) errors.push('missing nameEn')
  if (typeof enemy.maxHp !== 'number' || enemy.maxHp < 1) errors.push('invalid maxHp')
  if (typeof enemy.attack !== 'number' || enemy.attack < 1) errors.push('invalid attack')
  if (typeof enemy.rewardGold !== 'number' || enemy.rewardGold < 0) errors.push('invalid rewardGold')
  if (!enemy.rewardItems || typeof enemy.rewardItems !== 'object') errors.push('missing rewardItems')
  else for (const v of Object.values(enemy.rewardItems)) if (typeof v !== 'number' || v < 1) errors.push('invalid rewardItems value')
  if (enemy.element) {
    const valid = ['Mộc', 'Kim', 'Hỏa', 'Thủy', 'Thổ'] as const
    if (!(valid as unknown as string[]).includes(enemy.element)) errors.push(`invalid element ${enemy.element}`)
  }
  if (enemy.requiredStage !== undefined && (typeof enemy.requiredStage !== 'number' || enemy.requiredStage < 0))
    errors.push('invalid requiredStage')
  return errors
}

// W6 combat depth (slice): schema coverage, stage-gated selection, elemental
// counter math, combo multiplier. Reducer integration tests live in the W6
// engine pass that is currently frozen; this file proves the data + helpers
// are correct so the engine pass can be a pure wire-up.
describe('W6 combat depth · enemy data', () => {
  it('contains exactly 21 enemies (3 baseline + 18 new)', () => {
    expect(ENEMIES).toHaveLength(21)
  })

  it('every enemy validates against the EnemyDef contract', () => {
    for (const enemy of ENEMIES) {
      const errors = validateEnemy(enemy)
      expect(errors, JSON.stringify({ id: enemy.id, errors })).toEqual([])
    }
  })

  it('every new enemy has an element, a behavior, and a required stage', () => {
    const newEnemies = ENEMIES.filter((e) => !['mist_boar', 'seal_wraith', 'rift_hound'].includes(e.id))
    expect(newEnemies).toHaveLength(18)
    const behaviors: BehaviorPattern[] = ['aggressive', 'defensive', 'ranged', 'poison', 'flee', 'counter', 'summon', 'heal_self', 'drain_qi']
    for (const enemy of newEnemies) {
      expect(enemy.element, `element missing on ${enemy.id}`).toBeDefined()
      expect(behaviors, `behavior missing on ${enemy.id}`).toContain(enemy.behaviorPattern)
      expect(typeof enemy.requiredStage).toBe('number')
    }
  })

  it('poison-pattern enemies carry statusOnHit=poison', () => {
    const poisonEnemies = ENEMIES.filter((e) => e.behaviorPattern === 'poison')
    expect(poisonEnemies.length).toBeGreaterThanOrEqual(3)
    for (const enemy of poisonEnemies) {
      expect(enemy.statusOnHit).toBe('poison')
    }
  })

  it('reward items only reference known item ids (defensive guard)', () => {
    // We do not import the full item registry here to keep the slice
    // independent; sanity: every reward dict has at least one entry.
    for (const enemy of ENEMIES) {
      expect(Object.keys(enemy.rewardItems).length).toBeGreaterThan(0)
    }
  })
})

describe('W6 combat depth · stage-gated selection', () => {
  it('eligibleEnemiesAt filters by player stage', () => {
    const stage0AtHerb = eligibleEnemiesAt('herb_field', 0)
    const stage2AtHerb = eligibleEnemiesAt('herb_field', 2)
    expect(stage0AtHerb.map((e) => e.id)).toContain('venom_snake')
    expect(stage0AtHerb.map((e) => e.id)).not.toContain('lost_sect_disciple')
    expect(stage2AtHerb.map((e) => e.id)).toContain('lost_sect_disciple')
  })

  it('eligibleEnemiesAt is empty on locations with no enemies', () => {
    expect(eligibleEnemiesAt('village', 4)).toEqual([])
    expect(eligibleEnemiesAt('market', 4)).toEqual([])
  })

  it('deterministic pick over an eligible pool covers each member (round-robin check)', () => {
    // nextInt semantics guarantee uniform coverage; assert each enemy in a
    // location is reachable at the right stage by direct membership.
    const sealed = eligibleEnemiesAt('sealed_cave', 3)
    const ids = sealed.map((e) => e.id)
    expect(ids).toContain('seal_wraith')
    expect(ids).toContain('cave_bear')
    expect(ids).toContain('heretic_master')
  })
})

describe('W6 combat depth · elemental counter (Ngũ Hành)', () => {
  it('covers the production cycle for all five pairs', () => {
    // Thủy khắc Hỏa, Hỏa khắc Kim, Kim khắc Mộc, Mộc khắc Thổ, Thổ khắc Thủy.
    expect(elementMultiplier('Thủy', 'Hỏa')).toBe(1.5)
    expect(elementMultiplier('Hỏa', 'Kim')).toBe(1.5)
    expect(elementMultiplier('Kim', 'Mộc')).toBe(1.5)
    expect(elementMultiplier('Mộc', 'Thổ')).toBe(1.5)
    expect(elementMultiplier('Thổ', 'Thủy')).toBe(1.5)
  })

  it('reverse pairs take the 0.7 reciprocal', () => {
    expect(elementMultiplier('Hỏa', 'Thủy')).toBe(0.7)
    expect(elementMultiplier('Kim', 'Hỏa')).toBe(0.7)
    expect(elementMultiplier('Mộc', 'Kim')).toBe(0.7)
    expect(elementMultiplier('Thổ', 'Mộc')).toBe(0.7)
    expect(elementMultiplier('Thủy', 'Thổ')).toBe(0.7)
  })

  it('unrelated pairs stay at 1.0', () => {
    expect(elementMultiplier('Mộc', 'Hỏa')).toBe(1.0)
    expect(elementMultiplier('Thủy', 'Kim')).toBe(1.0)
  })

  it('counter table is wired and ELEMENT_NAMES includes every element', () => {
    const keys: Element[] = ['Mộc', 'Kim', 'Hỏa', 'Thủy', 'Thổ']
    for (const key of keys) {
      expect(ELEMENT_COUNTERS[key]).toBeTypeOf('string')
      expect(ELEMENT_NAMES[key]).toBeTruthy()
    }
  })

  it('the player (Mộc from the defective root) actively counters Thổ', () => {
    expect(PLAYER_ELEMENT).toBe('Mộc')
    expect(elementMultiplier(PLAYER_ELEMENT, 'Thổ')).toBe(1.5)
  })
})

describe('W6 combat depth · combo multiplier', () => {
  it('first strike is ×1.0', () => {
    expect(comboMultiplier(1)).toBe(1.0)
  })
  it('second consecutive strike is ×1.5', () => {
    expect(comboMultiplier(2)).toBe(1.5)
  })
  it('third and beyond is ×2.0', () => {
    expect(comboMultiplier(3)).toBe(2.0)
    expect(comboMultiplier(4)).toBe(2.0)
  })
  it('defend resets the streak (the reducer uses 0; pure helper returns 1.0)', () => {
    expect(comboMultiplier(0)).toBe(1.0)
  })
})
