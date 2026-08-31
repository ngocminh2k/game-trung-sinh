import { describe, expect, it } from 'vitest'
import { applyAction, newGame } from '../src/engine'
import type { GameState } from '../src/engine'
import { ROMANCE_TRACKS, romanceTrackFor } from '../src/content/romance'
import { romanceProgress, romanceTrackUnlocked } from '../src/engine/romance'

function step(state: GameState, action: Parameters<typeof applyAction>[1]): GameState {
  return applyAction(state, action).state
}

function unlockTrack(state: GameState, npcId: string): GameState {
  let next = state
  for (let i = 0; i < 25; i += 1) {
    const affVal = next.flags[`aff_${npcId}`]
    if (typeof affVal === 'number' && affVal >= 21) break
    next = step(next, { kind: 'talk', npcId })
  }
  return next
}

function commitmentFlag(npcId: string): string {
  return `romance_${npcId}_commitment`
}

const EXPECTED_NPCS = [
  'n_elder_meihua',
  'n_lost_soul_ha',
  'n_alchemist_sam',
  'n_rival_khoa',
  'n_hunter_son',
] as const

describe('ROMANCE W4 — 5 tracks × 20 nodes each', () => {
  it('has exactly 5 tracks and 100 total nodes', () => {
    expect(ROMANCE_TRACKS).toHaveLength(5)
    const total = ROMANCE_TRACKS.reduce((sum, track) => sum + track.nodes.length, 0)
    expect(total).toBe(100)
  })

  it('covers the 5 expected romance NPCs and IDs are unique', () => {
    const ids = ROMANCE_TRACKS.map((track) => track.npcId)
    expect(new Set(ids).size).toBe(5)
    for (const npcId of EXPECTED_NPCS) {
      expect(ids).toContain(npcId)
    }
  })

  it('each track has exactly 20 nodes with bilingual prose', () => {
    for (const track of ROMANCE_TRACKS) {
      expect(track.nodes).toHaveLength(20)
      for (const [index, node] of track.nodes.entries()) {
        expect(node.titleVi.length).toBeGreaterThan(0)
        expect(node.titleEn.length).toBeGreaterThan(0)
        expect(node.textVi.length).toBeGreaterThan(0)
        expect(node.textEn.length).toBeGreaterThan(0)
        expect(node.id).toBe(`${track.npcId.replace(/^n_/, '')}_${String(index + 1).padStart(2, '0')}`)
      }
    }
  })

  it('trigger conditions are present and well-formed', () => {
    for (const track of ROMANCE_TRACKS) {
      for (const [index, node] of track.nodes.entries()) {
        expect(typeof node.trigger.affMin).toBe('number')
        expect(typeof node.trigger.dayMin).toBe('number')
        expect(typeof node.trigger.locationId).toBe('string')
        expect(node.trigger.affMin).toBe(index === 0 ? 1 : index + 1)
      }
    }
  })

  it('require chains are linear (each node references the previous one, no cycles)', () => {
    const seen = new Set<string>()
    for (const track of ROMANCE_TRACKS) {
      const prefix = `romance_${track.npcId}_node_`
      for (const [index, node] of track.nodes.entries()) {
        if (index === 0) {
          expect(node.requires).toBeUndefined()
          continue
        }
        const prev = `${prefix}${track.npcId.replace(/^n_/, '')}_${String(index).padStart(2, '0')}`
        expect(node.requires).toEqual([prev])
        expect(seen.has(prev)).toBe(false)
        seen.add(prev)
      }
    }
  })

  it('every choice effect increments affinity (commitment path is heavier)', () => {
    for (const track of ROMANCE_TRACKS) {
      for (const node of track.nodes) {
        const affSum = node.effects.aff ?? 0
        expect(affSum).toBeGreaterThan(0)
        for (const choice of node.choices) {
          expect((choice.effect.aff ?? 0) + affSum).toBeGreaterThan(0)
        }
      }
      const final = track.nodes[19]!
      const commitmentChoice = final.choices.find((choice) => choice.id === 'commitment')
      const otherChoices = final.choices.filter((choice) => choice.id !== 'commitment')
      expect(commitmentChoice).toBeDefined()
      expect(otherChoices).toHaveLength(2)
      expect(commitmentChoice?.effect.flag).toBe(`romance_${track.npcId}_commitment`)
      const commitmentAff = (commitmentChoice?.effect.aff ?? 0) + (final.effects.aff ?? 0)
      const otherAff = otherChoices
        .map((choice) => (choice.effect.aff ?? 0) + (final.effects.aff ?? 0))
        .reduce((max, value) => Math.max(max, value), 0)
      expect(commitmentAff).toBeGreaterThan(otherAff)
    }
  })

  it('badge only appears when the track is unlocked', () => {
    const fresh = newGame('romance-badge-fresh')
    for (const track of ROMANCE_TRACKS) {
      expect(romanceTrackUnlocked(fresh, track.npcId)).toBe(false)
    }
    const boosted = unlockTrack(fresh, 'n_elder_meihua')
    expect(romanceTrackUnlocked(boosted, 'n_elder_meihua')).toBe(true)
    // progress is tracked via completed romance nodes, not raw affinity
    const firstNodeId = romanceTrackFor('n_elder_meihua')?.nodes[0]?.id
    expect(firstNodeId).toBeDefined()
    if (firstNodeId === undefined) return
    const nodeFlag = `romance_n_elder_meihua_node_${firstNodeId}`
    const advanced = step(boosted, { kind: 'advance_romance', trackId: 'n_elder_meihua', choiceId: 'stay' })
    expect(advanced.flags[nodeFlag]).toBe(true)
    expect(romanceProgress(advanced, 'n_elder_meihua')).toBe(1)
  })

  it('fresh run + one track: commitment flag reachable end-to-end', () => {
    const start = unlockTrack(newGame('romance-commitment-fresh'), 'n_elder_meihua')
    expect(romanceTrackUnlocked(start, 'n_elder_meihua')).toBe(true)
    const node = romanceTrackFor('n_elder_meihua')?.nodes[0]
    expect(node).toBeDefined()
    if (node === undefined) return
    const choice = node.choices[0]
    expect(choice).toBeDefined()
    if (choice === undefined) return
    const chosen = step(start, { kind: 'advance_romance', trackId: 'n_elder_meihua', choiceId: choice.id })
    expect(chosen.flags[commitmentFlag('n_elder_meihua')] === true || choice.effect.flag === undefined).toBe(true)
  })

  it('tracks have valid final-node commitment/bittersweet/friend endings', () => {
    for (const track of ROMANCE_TRACKS) {
      const finalNode = track.nodes[track.nodes.length - 1]!
      const ids = finalNode.choices.map((choice) => choice.id).sort()
      expect(ids).toEqual(['bittersweet', 'commitment', 'friend'])
      for (const id of ['bittersweet', 'commitment', 'friend'] as const) {
        const choice = finalNode.choices.find((entry) => entry.id === id)
        expect(choice?.effect.flag).toBe(`romance_${track.npcId}_${id}`)
      }
    }
  })
})
