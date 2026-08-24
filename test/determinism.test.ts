import { describe, expect, it } from 'vitest'
import { applyAction, initialRng, newGame, nextFloat } from '../src/engine'
import type { Action } from '../src/engine'
import { runScript } from './test-utils'

const SCRIPT = [
  { kind: 'move', direction: 'west' },
  { kind: 'talk', npcId: 'n_merchant_bao' },
  { kind: 'buy', itemId: 'pill_qi' },
  { kind: 'move', direction: 'east' },
  { kind: 'train' },
  { kind: 'rest' },
  { kind: 'free_text', raw: 'luyen cong them mot lan nua' },
  { kind: 'draw_lottery' },
] as const

describe('determinism', () => {
  it('same seed produces identical rng streams', () => {
    const a = initialRng('ink-and-jade')
    const b = initialRng('ink-and-jade')
    expect(a).toBe(b)
    let [fa, sa] = nextFloat(a)
    let [fb, sb] = nextFloat(b)
    expect(fa).toBe(fb)
    for (let i = 0; i < 100; i++) {
      ;[fa, sa] = nextFloat(sa)
      ;[fb, sb] = nextFloat(sb)
      expect(fa).toBe(fb)
    }
  })

  it('different seeds diverge immediately', () => {
    expect(initialRng('alpha')).not.toBe(initialRng('beta'))
  })

  it('full replay with same seed yields deep-equal states and events', () => {
    const actions = SCRIPT.map((a) => ({ ...a })) as Action[]
    const runA = runScript('replay-seed-1', actions)
    const runB = runScript('replay-seed-1', actions)
    expect(JSON.stringify(runA.states)).toBe(JSON.stringify(runB.states))
    expect(JSON.stringify(runA.events)).toBe(JSON.stringify(runB.events))
  })

  it('different seed diverges within the script', () => {
    const actions = SCRIPT.map((a) => ({ ...a })) as Action[]
    const runA = runScript('replay-seed-1', actions)
    const runC = runScript('replay-seed-2', actions)
    const differ =
      JSON.stringify(runA.states) !== JSON.stringify(runC.states) ||
      JSON.stringify(runA.events) !== JSON.stringify(runC.events)
    expect(differ).toBe(true)
  })

  it('applyAction is pure — input state is never mutated', () => {
    const before = newGame('purity')
    const snapshot = JSON.stringify(before)
    applyAction(before, { kind: 'train' })
    applyAction(before, { kind: 'rest' })
    applyAction(before, { kind: 'free_text', raw: 'garbage nonsense xyz' })
    expect(JSON.stringify(before)).toBe(snapshot)
  })
})
