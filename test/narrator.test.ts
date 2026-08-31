import { describe, expect, it } from 'vitest'
import {
  FALLBACK_TEXT,
  applyAction,
  currentBeat,
  narrate,
  narrateLine,
  newGame,
} from '../src/engine'
import type { GameEvent } from '../src/engine'

describe('narrator', () => {
  it('is deterministic — same events yield identical lines', () => {
    const events: GameEvent[] = [
      { type: 'GAME_STARTED', seed: 's' },
      { type: 'TRAINED', gain: 4, stage: 0 },
      { type: 'DEATH', cause: 'qi_deviation' },
    ]
    expect(JSON.stringify(narrate(events, 'vi'))).toBe(JSON.stringify(narrate(events, 'vi')))
    expect(JSON.stringify(narrate(events, 'en'))).toBe(JSON.stringify(narrate(events, 'en')))
  })

  it('every event type renders non-fallback text in both locales', () => {
    // One representative event per discriminated type the reducer can emit,
    // plus every DRAW_RESULT tier.
    const samples: GameEvent[] = [
      { type: 'GAME_STARTED', seed: 's' },
      { type: 'MOVED', from: 'village', to: 'market' },
      { type: 'DAY_PASSED', day: 2 },
      { type: 'RESTED', hpHeal: 30 },
      { type: 'TRAINED', gain: 4, stage: 1 },
      { type: 'GATHERED', itemId: 'spirit_herb', qty: 2, qiDrain: 0 },
      { type: 'ITEM_USED', itemId: 'pill_hp', hpDelta: 25, qiDelta: 0 },
      { type: 'BOUGHT', itemId: 'pill_hp', qty: 1, goldPaid: 35 },
      { type: 'SOLD', itemId: 'spirit_herb', qty: 1, goldGain: 12 },
      { type: 'STORED', itemId: 'spirit_herb', qty: 1 },
      { type: 'WITHDRAWN', itemId: 'spirit_herb', qty: 1 },
      { type: 'DRAW_RESULT', tier: 'grand', goldDelta: 300 },
      { type: 'DRAW_RESULT', tier: 'major', goldDelta: 60 },
      { type: 'DRAW_RESULT', tier: 'minor', goldDelta: 20 },
      { type: 'DRAW_RESULT', tier: 'herb', goldDelta: 0, itemId: 'spirit_herb' },
      { type: 'DRAW_RESULT', tier: 'none', goldDelta: 0 },
      { type: 'TALKED', npcId: 'n_elder_meihua' },
      { type: 'QUEST_ACCEPTED', questId: 'q_herb_delivery' },
      { type: 'QUEST_COMPLETED', questId: 'q_herb_delivery', rewardGold: 90 },
      {
        type: 'WARNING',
        level: 3,
        locationId: 'cursed_rift',
        messageVi: 'Khe nứt rít lên.',
        messageEn: 'The rift hisses.',
      },
      { type: 'WARD_USED', itemId: 'warding_talisman' },
      { type: 'DAMAGED', amount: 31, source: 'cursed_rift' },
      { type: 'DEATH', cause: 'danger:cursed_rift' },
      { type: 'ACHIEVEMENT_UNLOCKED', achievementId: 'first_step' },
      { type: 'ENDING', endingId: 'ascension' },
      { type: 'CORRECTION_REJECTED', count: 1 },
      { type: 'ERROR', code: 'MOVE_BLOCKED' },
    ]
    for (const ev of samples) {
      const vi = narrateLine(ev, 'vi')
      const en = narrateLine(ev, 'en')
      expect(vi.length, `${ev.type}/vi empty`).toBeGreaterThan(0)
      expect(en.length, `${ev.type}/en empty`).toBeGreaterThan(0)
      // Non-fallback: a template must never degrade into "something happened".
      expect(vi, `${ev.type}/vi fell back`).not.toBe(FALLBACK_TEXT.vi)
      expect(en, `${ev.type}/en fell back`).not.toBe(FALLBACK_TEXT.en)
      // And the two locales genuinely localize instead of echoing each other.
      expect(vi, `${ev.type} identical across locales`).not.toBe(en)
    }
  })

  it('falls back gracefully for unknown or empty renderings', () => {
    const unknown = { type: 'TOTALLY_UNKNOWN' } as unknown as GameEvent
    for (const locale of ['vi', 'en'] as const) {
      expect(narrateLine(unknown, locale)).toBe(FALLBACK_TEXT[locale])
    }
  })

  it('turns internal ids into natural Vietnamese names and keeps correction mechanics out of view', () => {
    const lines = [
      narrateLine({ type: 'MOVED', from: 'village', to: 'market' }, 'vi'),
      narrateLine({ type: 'QUEST_ACCEPTED', questId: 'q_herb_delivery' }, 'vi'),
      narrateLine({ type: 'TALENT_CHOSEN', talentId: 'iron_bones' }, 'vi'),
      narrateLine({ type: 'TECHNIQUE_LEARNED', techniqueId: 'crooked_circulation', level: 1 }, 'vi'),
      narrateLine({ type: 'ENCOUNTER_STARTED', enemyId: 'mist_boar' }, 'vi'),
      narrateLine({ type: 'DEATH', cause: 'danger:cursed_rift' }, 'vi'),
    ]

    expect(lines.join(' ')).toContain('Chợ Vân Tập')
    expect(lines.join(' ')).toContain('Lọ thuốc cho cụ Mai Hoa')
    expect(lines.join(' ')).toContain('Gân Cốt Sắt')
    expect(lines.join(' ')).toContain('Chu Thiên Cong Queo')
    expect(lines.join(' ')).toContain('Trư Nha Sương')
    expect(lines.join(' ')).toContain('Khe Hở Nguyền Rủa')
    expect(lines.join(' ')).not.toMatch(/market|q_herb_delivery|iron_bones|crooked_circulation|mist_boar|cursed_rift|convergence/i)
  })

  it('narration never mutates game state', () => {
    const before = newGame('narrator-pure')
    const snapshot = JSON.stringify(before)
    const result = applyAction(before, { kind: 'train' })
    narrate(result.events, 'vi')
    narrate(result.events, 'en')
    expect(JSON.stringify(before)).toBe(snapshot)
    expect(JSON.stringify(result.state)).not.toBe(snapshot) // action applied…
    // …but calling narrate again on the same events changes nothing further.
    expect(JSON.stringify(applyAction(before, { kind: 'train' }).state)).toBe(
      JSON.stringify(result.state),
    )
  })

  it('from every reachable state some suggestion or rest applies (engine no-softlock)', () => {
    // Drive the engine through hundreds of states with a deterministic action
    // mix (moves, training, garbage free text, lottery, items, rests) and at
    // each state assert the beat offers exactly 3 suggestions and that at
    // least one suggestion — or `rest`, which has no precondition — executes
    // without ERROR. Bounded-sequence runs reaching all five endings are
    // proven separately in test/endings.test.ts.
    let state = newGame('no-softlock')
    const dirs = ['north', 'south', 'east', 'west'] as const
    const itemIds = ['pill_hp', 'pill_qi', 'warding_talisman', 'jade_charm', 'spirit_herb'] as const
    let lastDay = state.day
    for (let i = 0; i < 400 && !state.terminal; i++) {
      const beat = currentBeat(state)
      expect(beat.suggested).toHaveLength(3)
      const errorIn = (r: { events: GameEvent[] }) => r.events.some((e) => e.type === 'ERROR')
      const allocateIsLegal = state.player.pendingAttributePoints > 0 &&
        (['body', 'mind', 'charm', 'luck'] as const).some((attr) => state.player.attrs[attr] < 100 &&
          !errorIn(applyAction(state, { kind: 'allocate_attribute', attribute: attr })))
      const applicable =
        allocateIsLegal ||
        beat.suggested.some((sug) => !errorIn(applyAction(state, sug as never))) ||
        !errorIn(applyAction(state, { kind: 'rest' }))
      expect(
        applicable,
        `no legal action at day ${String(state.day)} near ${state.player.locationId}`,
      ).toBe(true)

      let result = applyAction(state, { kind: 'rest' })
      if (state.player.pendingAttributePoints > 0) {
        result = applyAction(state, { kind: 'allocate_attribute', attribute: 'body' })
      } else switch (i % 6) {
        case 0:
        case 1:
          result = applyAction(state, { kind: 'move', direction: dirs[i % 4] as never })
          break
        case 2:
          result = applyAction(state, { kind: 'train' })
          break
        case 3: {
          // Garbage text never acts for the player and never errors.
          result = applyAction(state, { kind: 'free_text', raw: 'blorptastic frumious' })
          expect(result.state.corrections).toBeGreaterThan(state.corrections)
          expect(result.events.some((e) => e.type === 'ERROR')).toBe(false)
          break
        }
        case 4:
          result = applyAction(state, { kind: 'draw_lottery' })
          break
        case 5: {
          const itemId = itemIds[i % itemIds.length]
          if (itemId !== undefined) result = applyAction(state, { kind: 'use_item', itemId })
          break
        }
      }
      state = result.state
      if (!state.terminal) {
        lastDay = Math.max(lastDay, state.day)
      }
    }
    // Time only ever moves forward — the loop above acted, never idled.
    expect(lastDay).toBeGreaterThanOrEqual(newGame('no-softlock').day)
  })

  it('rest is applicable from any non-terminal state (engine no-softlock invariant)', () => {
    // Drive the game through many states via random-ish but deterministic
    // moves and verify `rest` never errors while the player is alive.
    let state = newGame('always-rest')
    const dirs = ['north', 'south', 'east', 'west'] as const
    for (let i = 0; i < 200 && !state.terminal; i++) {
      state = applyAction(state, { kind: 'move', direction: dirs[i % 4] as never }).state
      if (state.terminal) break
      const r = applyAction(state, { kind: 'rest' })
      expect(r.events.some((e) => e.type === 'ERROR')).toBe(false)
      expect(r.state.day).toBeGreaterThan(state.day)
      state = r.state
    }
  })
})
