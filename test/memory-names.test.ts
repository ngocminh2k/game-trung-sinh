import { describe, expect, it } from 'vitest'
import { NAME_MEMORIES, NIGHT_PAGES } from '../src/content/name-memories'
import {
  MEMORY_GATE,
  MEMORY_TOTAL,
  memoryMilestone,
  rememberNames,
  rememberedCount,
} from '../src/engine/memory'

describe('NAME_MEMORIES catalog', () => {
  it('has exactly 200 entries (MEMORY_TOTAL)', () => {
    expect(NAME_MEMORIES).toHaveLength(200)
    expect(NAME_MEMORIES).toHaveLength(MEMORY_TOTAL)
  })

  it('uses unique sequential ids nm_001..nm_200', () => {
    const ids = NAME_MEMORIES.map((m) => m.id)
    expect(new Set(ids).size).toBe(200)
    for (let i = 0; i < 200; i++) {
      expect(ids[i]).toBe(`nm_${String(i + 1).padStart(3, '0')}`)
    }
  })

  it('splits sources 100 quest / 60 ash / 40 night on contiguous id ranges', () => {
    const bySource = {
      quest: NAME_MEMORIES.filter((m) => m.source === 'quest'),
      ash: NAME_MEMORIES.filter((m) => m.source === 'ash'),
      night: NAME_MEMORIES.filter((m) => m.source === 'night'),
    }
    expect(bySource.quest).toHaveLength(100)
    expect(bySource.ash).toHaveLength(60)
    expect(bySource.night).toHaveLength(40)
    for (let i = 0; i < 100; i++) expect(NAME_MEMORIES[i]?.source).toBe('quest')
    for (let i = 100; i < 160; i++) expect(NAME_MEMORIES[i]?.source).toBe('ash')
    for (let i = 160; i < 200; i++) expect(NAME_MEMORIES[i]?.source).toBe('night')
  })

  it('keeps Vi/En parity: non-empty names and hints, 2-3 word period names', () => {
    for (const m of NAME_MEMORIES) {
      expect(m.nameVi.length).toBeGreaterThan(0)
      expect(m.nameEn.length).toBeGreaterThan(0)
      expect(m.hintVi.length).toBeGreaterThan(0)
      expect(m.hintEn.length).toBeGreaterThan(0)
      const words = m.nameVi.split(/\s+/)
      expect(words.length).toBeGreaterThanOrEqual(2)
      expect(words.length).toBeLessThanOrEqual(3)
    }
  })

  it('quest hints name their quest type (side/secret/find/affinity/timed)', () => {
    const quest = NAME_MEMORIES.filter((m) => m.source === 'quest')
    for (const m of quest) {
      expect(m.hintEn).toMatch(/side|secret|find|affinity|timed/i)
    }
  })

  it('ash hints reference the bone ash / Priest Cuu', () => {
    const ash = NAME_MEMORIES.filter((m) => m.source === 'ash')
    for (const m of ash) {
      expect(m.hintEn).toMatch(/ash|cuu/i)
      expect(m.hintVi).toMatch(/tro|cuu/i)
    }
  })

  it('night hints reference the night ledger pages', () => {
    const night = NAME_MEMORIES.filter((m) => m.source === 'night')
    for (const m of night) {
      expect(m.hintEn).toMatch(/night|ledger|page/i)
    }
  })
})

describe('NIGHT_PAGES', () => {
  it('has exactly four pages night_1..night_4 with 10 ids each', () => {
    expect(Object.keys(NIGHT_PAGES).sort()).toEqual(['night_1', 'night_2', 'night_3', 'night_4'])
    for (const page of Object.values(NIGHT_PAGES)) {
      expect(page).toHaveLength(10)
    }
  })

  it('covers nm_161..nm_200 in order with night-source memories', () => {
    const flattened = Object.values(NIGHT_PAGES).flat()
    expect(flattened).toHaveLength(40)
    flattened.forEach((id, i) => {
      expect(id).toBe(`nm_${String(161 + i).padStart(3, '0')}`)
      const memory = NAME_MEMORIES.find((m) => m.id === id)
      expect(memory).toBeDefined()
      expect(memory?.source).toBe('night')
    })
  })
})

describe('memory engine helpers', () => {
  it('exposes the frozen constants', () => {
    expect(MEMORY_TOTAL).toBe(200)
    expect(MEMORY_GATE).toBe(50)
  })

  it('rememberedCount counts the remembered slice', () => {
    expect(rememberedCount({ rememberedNames: [] })).toBe(0)
    expect(rememberedCount({ rememberedNames: ['nm_001', 'nm_002'] })).toBe(2)
  })

  it('rememberNames merges and dedupes without mutating inputs', () => {
    const state = { rememberedNames: ['nm_001', 'nm_002'] }
    const result = rememberNames(state, ['nm_002', 'nm_003', 'nm_003'])
    expect(result).toEqual(['nm_001', 'nm_002', 'nm_003'])
    expect(state).toEqual({ rememberedNames: ['nm_001', 'nm_002'] })
    expect(rememberNames({ rememberedNames: [] }, [])).toEqual([])
    expect(rememberNames({ rememberedNames: ['nm_001'] }, ['nm_001'])).toEqual(['nm_001'])
  })

  it('memoryMilestone tiers at 50/100/200', () => {
    expect(memoryMilestone(0)).toBe(0)
    expect(memoryMilestone(49)).toBe(0)
    expect(memoryMilestone(50)).toBe(1)
    expect(memoryMilestone(99)).toBe(1)
    expect(memoryMilestone(100)).toBe(2)
    expect(memoryMilestone(199)).toBe(2)
    expect(memoryMilestone(200)).toBe(3)
    expect(memoryMilestone(201)).toBe(3)
  })
})
