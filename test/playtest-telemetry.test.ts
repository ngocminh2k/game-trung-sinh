import { describe, expect, it } from 'vitest'
import { applyAction } from '../src/engine'
import { newGame } from '../src/engine/constants'
import type { Action, GameState } from '../src/engine'
import {
  PLAYTEST_FEEDBACK_KEY,
  PLAYTEST_KEY,
  PLAYTEST_MAX_RUNS,
  PLAYTEST_MAX_STEPS,
  closeRun,
  loadFeedback,
  loadRuns,
  medianDeliberationMs,
  openRun,
  recordStep,
  saveFeedback,
  startRun,
  type PlaytestSurvey,
} from '../src/ui/playtest'
import type { SessionStorage } from '../src/ui/session'

// Issue #20 (Fullerton Ch.9) — the human-playtest telemetry contract. The
// protocol doc promises four things: the journey (day/location sequence),
// deliberation time (gaps between steps), the ending reached, and a survey
// joined back to its run. These tests prove exactly those, against a Map
// storage — the same seam test/session.test.ts uses.

function mapStorage(initial: Record<string, string> = {}): SessionStorage {
  const data = new Map<string, string>(Object.entries(initial))
  return {
    get: (key) => data.get(key) ?? null,
    set: (key, value) => void data.set(key, value),
    remove: (key) => void data.delete(key),
  }
}

/** Steps the engine actually accepts. A rejected action returns the same state
 *  object, which is how the caller can tell a legal move from a refused one. */
function play(state: GameState, actions: Action[]): GameState {
  let next = state
  for (const action of actions) next = applyAction(next, action).state
  return next
}

describe('playtest telemetry (issue #20)', () => {
  it('records the journey: day, location, and resource snapshot per action', () => {
    const storage = mapStorage()
    const game = newGame('pt-journey')
    const run = startRun(storage, game, 'vi', 1_000)

    const afterTrain = play(game, [{ kind: 'train' }])
    recordStep(storage, run.id, afterTrain, 'train', 1_500)
    const afterRest = play(afterTrain, [{ kind: 'rest' }])
    recordStep(storage, run.id, afterRest, 'rest', 2_400)

    const loaded = loadRuns(storage)
    expect(loaded).toHaveLength(1)
    expect(loaded[0]!.steps.map((step) => step.kind)).toEqual(['train', 'rest'])
    // Each step is a full snapshot: the protocol derives the resource curve from these.
    expect(loaded[0]!.steps[0]).toEqual({
      t: 500,
      day: afterTrain.day,
      kind: 'train',
      loc: afterTrain.player.locationId,
      hp: afterTrain.player.hp,
      qi: afterTrain.player.qi,
      gold: afterTrain.player.gold,
    })
    expect(loaded[0]!.steps[1]!.t).toBe(1_400)
  })

  it('derives deliberation time from step gaps rather than storing it', () => {
    const storage = mapStorage()
    const game = newGame('pt-gaps')
    const run = startRun(storage, game, 'vi', 0)
    let state = game
    let at = 0
    for (const gap of [2_000, 8_000, 8_000]) {
      at += gap
      state = play(state, [{ kind: 'train' }])
      recordStep(storage, run.id, state, 'train', at)
    }

    const loaded = openRun(storage)
    expect(loaded).not.toBeNull()
    expect(loaded!.id).toBe(run.id)
    expect(medianDeliberationMs(loaded!)).toBe(8_000)
    // A run with one step has no gaps to measure — it reports 0, not NaN.
    expect(medianDeliberationMs({ ...loaded!, steps: loaded!.steps.slice(0, 1) })).toBe(0)
  })

  it('closes the run with the ending id, and a second close cannot rewind it', () => {
    const storage = mapStorage()
    const game = newGame('pt-close')
    const run = startRun(storage, game, 'vi', 1_000)
    const state = play(game, [{ kind: 'train' }])
    const terminal: GameState = { ...state, terminal: true, endingId: 'quiet_harmony', flags: { ...state.flags, night_forgotten: true } }

    closeRun(storage, run.id, terminal, 9_999)
    closeRun(storage, run.id, terminal, 99_999)

    const loaded = loadRuns(storage)[0]!
    expect(loaded.endedAt).toBe(9_999)
    expect(loaded.endingId).toBe('quiet_harmony')
    expect(loaded.finalDay).toBe(terminal.day)
    expect(loaded.nightForgotten).toBe(true)
    // Closed runs are no longer the open one.
    expect(openRun(storage)).toBeNull()
  })

  it('ignores malformed stored telemetry instead of crashing a new session', () => {
    const storage = mapStorage({
      [PLAYTEST_KEY]: '{"not":"an array"}',
      [PLAYTEST_FEEDBACK_KEY]: '[not json',
    })
    expect(loadRuns(storage)).toEqual([])
    expect(loadFeedback(storage)).toEqual([])
    expect(openRun(storage)).toBeNull()

    const run = startRun(storage, newGame('pt-rubble'), 'vi')
    expect(loadRuns(storage).map((entry) => entry.id)).toEqual([run.id])
    // Steps recorded against an unknown run are dropped, not invented.
    recordStep(storage, 'pt-nope', newGame('pt-x'), 'train', 1)
    expect(loadRuns(storage)[0]!.steps).toEqual([])
  })

  it('round-trips the post-ending survey and clamps hostile values at the boundary', () => {
    const storage = mapStorage()
    const good: PlaytestSurvey = { version: 1, runId: 'pt-1', day: 21, endingId: 'keeper_of_names', clarity: 4, agency: 5, pressure: 2, note: 'Cảm ơn đạo hữu.' }
    saveFeedback(storage, good)
    expect(loadFeedback(storage)).toEqual([good])

    const hostile: PlaytestSurvey = { version: 1, runId: 'pt-2', day: 30, endingId: null, clarity: 99, agency: -3, pressure: 3.7, note: 'x'.repeat(500) }
    saveFeedback(storage, hostile)

    const all = loadFeedback(storage)
    expect(all).toHaveLength(2)
    expect(all[1]).toEqual({ ...hostile, clarity: 5, agency: 1, pressure: 4, note: 'x'.repeat(280) })
  })

  it('keeps each run distinct so a survey can be joined back to its journey', () => {
    const storage = mapStorage()
    const game = newGame('pt-multi')
    const first = startRun(storage, game, 'vi', 1_000)
    // The player abandons the tab mid-run; the next session starts a fresh log.
    // A step must exist first: a still-empty open run is reused, not duplicated
    // (React 18 dev double-invokes the start effect).
    recordStep(storage, first.id, play(game, [{ kind: 'train' }]), 'train', 1_500)
    const second = startRun(storage, game, 'en', 2_000)

    const runs = loadRuns(storage)
    expect(runs).toHaveLength(2)
    expect(first.id).not.toBe(second.id)
    expect(runs.map((entry) => entry.locale)).toEqual(['vi', 'en'])
    expect(openRun(storage)!.id).toBe(second.id)
  })

  it('reuses a still-empty open run instead of spawning a phantom', () => {
    const storage = mapStorage()
    const game = newGame('pt-phantom')
    const first = startRun(storage, game, 'vi', 1_000)
    // Dev StrictMode double-invocation: same session, no steps yet.
    const second = startRun(storage, game, 'vi', 1_001)

    expect(second.id).toBe(first.id)
    expect(loadRuns(storage)).toHaveLength(1)
  })

  it('never appends steps to a closed run', () => {
    const storage = mapStorage()
    const game = newGame('pt-afterlife')
    const run = startRun(storage, game, 'vi', 1_000)
    const mid = play(game, [{ kind: 'train' }])
    recordStep(storage, run.id, mid, 'train', 1_500)
    closeRun(storage, run.id, { ...mid, terminal: true, endingId: 'quiet_harmony' }, 2_000)

    // A stray dispatch after the ending (restart click, buffered key) is dropped.
    recordStep(storage, run.id, mid, 'train', 9_999)
    const loaded = loadRuns(storage)[0]!
    expect(loaded.steps).toHaveLength(1)
    expect(medianDeliberationMs(loaded)).toBe(0)
  })

  it('swallows a full or locked-down storage quota instead of breaking the run', () => {
    const data = new Map<string, string>()
    const failing: SessionStorage = {
      get: (key) => data.get(key) ?? null,
      set: () => { throw new DOMException('quota', 'QuotaExceededError') },
      remove: (key) => void data.delete(key),
    }
    const game = newGame('pt-quota')
    // None of these may throw: telemetry is an observer, never a gate.
    expect(() => startRun(failing, game, 'vi', 1_000)).not.toThrow()
    expect(() => recordStep(failing, 'pt-nope', game, 'train', 1_500)).not.toThrow()
    expect(() => closeRun(failing, 'pt-nope', game, 2_000)).not.toThrow()
    expect(() => saveFeedback(failing, { version: 1, runId: 'pt-1', day: 1, endingId: null, clarity: 3, agency: 3, pressure: 3, note: '' })).not.toThrow()
  })

  it('prunes old runs and steps so one session cannot outgrow localStorage', () => {
    const storage = mapStorage()
    const game = newGame('pt-prune')
    let last = startRun(storage, game, 'vi', 0)
    for (let i = 1; i <= PLAYTEST_MAX_RUNS + 3; i += 1) {
      recordStep(storage, last.id, play(game, [{ kind: 'train' }]), 'train', i * 100)
      last = startRun(storage, game, 'vi', i * 1_000)
    }
    expect(loadRuns(storage)).toHaveLength(PLAYTEST_MAX_RUNS)

    const steps = loadRuns(storage)
    const steppy = steps[steps.length - 1]!
    let state = game
    for (let i = 0; i < PLAYTEST_MAX_STEPS + 50; i += 1) {
      state = play(state, [{ kind: 'train' }])
      recordStep(storage, steppy.id, state, 'train', 100 + i)
    }
    expect(loadRuns(storage).find((run) => run.id === steppy.id)!.steps).toHaveLength(PLAYTEST_MAX_STEPS)
  })
})
