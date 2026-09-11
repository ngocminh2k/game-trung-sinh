import type { GameDifficulty, GameState, Locale } from '../engine'
import type { SessionStorage } from './session'

// Issue #20 (Fullerton Ch.9) — client-side playtest telemetry. This is the
// qualitative-measurement half of the human playtest protocol in
// docs/testing/playtest-protocol.md: the bot sim in test/playtest-sim.test.ts
// can already prove a route is winnable, but only a human run produces the
// path/timing data that shows how it *felt* to walk it.
//
// Deliberation time is never stored: it is the `t` gap between two steps, so
// the log stays append-only. Free-text attempts are recorded too (a step whose
// snapshot equals the previous one was a move the world refused) — that is
// signal, not noise.

export const PLAYTEST_KEY = 'phe-can-ky:playtest:v1'
export const PLAYTEST_FEEDBACK_KEY = 'phe-can-ky:playtest-feedback:v1'

/** Ceilings, not tuning knobs: a full Scenario I run is a few hundred actions.
 *  Beyond these the oldest entries fall off so one session cannot outgrow
 *  localStorage. */
export const PLAYTEST_MAX_STEPS = 1_000
export const PLAYTEST_MAX_RUNS = 10
export const PLAYTEST_MAX_FEEDBACK = 20
export const PLAYTEST_NOTE_MAX = 280

export interface PlaytestStep {
  /** ms since the run started. */
  t: number
  day: number
  kind: string
  loc: string
  hp: number
  qi: number
  gold: number
}

export interface PlaytestRun {
  version: 1
  id: string
  seed: string
  locale: Locale
  difficulty: GameDifficulty
  startedAt: number
  endedAt: number | null
  endingId: string | null
  finalDay: number
  corrections: number
  nightForgotten: boolean
  steps: PlaytestStep[]
}

export interface PlaytestSurvey {
  version: 1
  runId: string
  day: number
  endingId: string | null
  clarity: number
  agency: number
  pressure: number
  note: string
}

/** Derives a player from 'a'..'z' so the codepoint is always a letter and
 *  always below the 5 ms gap between two calls to this function — no imports,
 *  no crypto dependency, good enough to key a survey to its run locally. */
function runId(now: number, salt: number): string {
  const tail = (now + salt).toString(36)
  return `pt-${tail}-${Math.floor(Math.random() * 1e6).toString(36)}`
}

function isNumber(value: unknown): value is number {
  return typeof value === 'number' && Number.isFinite(value)
}

function isStep(value: unknown): value is PlaytestStep {
  if (typeof value !== 'object' || value === null) return false
  const step = value as Partial<PlaytestStep>
  return isNumber(step.t) && isNumber(step.day) && typeof step.kind === 'string'
    && typeof step.loc === 'string' && isNumber(step.hp) && isNumber(step.qi) && isNumber(step.gold)
}

function isRun(value: unknown): value is PlaytestRun {
  if (typeof value !== 'object' || value === null) return false
  const run = value as Partial<PlaytestRun>
  return run.version === 1 && typeof run.id === 'string' && typeof run.seed === 'string'
    && isNumber(run.startedAt) && Array.isArray(run.steps) && run.steps.every(isStep)
}

function parseArray<T>(raw: string | null | undefined, guard: (value: unknown) => value is T): T[] {
  if (typeof raw !== 'string') return []
  try {
    const candidate: unknown = JSON.parse(raw)
    return Array.isArray(candidate) ? candidate.filter(guard) : []
  } catch {
    return []
  }
}

function write(storage: SessionStorage, key: string, value: unknown): void {
  try {
    storage.set(key, JSON.stringify(value))
  } catch {
    // Telemetry must never break a run — a full or locked-down storage quota
    // is the player's problem to ignore, not the game's to surface.
  }
}

export function loadRuns(storage: SessionStorage): PlaytestRun[] {
  return parseArray(storage.get(PLAYTEST_KEY), isRun)
}

/** The still-open run, if the player closed the tab mid-session. */
export function openRun(storage: SessionStorage): PlaytestRun | null {
  const runs = loadRuns(storage)
  return runs.length > 0 && runs[runs.length - 1]?.endedAt === null ? runs[runs.length - 1] ?? null : null
}

export function startRun(storage: SessionStorage, game: GameState, locale: Locale, now = Date.now()): PlaytestRun {
  const run: PlaytestRun = {
    version: 1,
    id: runId(now, game.day),
    seed: game.seed,
    locale,
    difficulty: game.difficulty ?? 'balanced',
    startedAt: now,
    endedAt: null,
    endingId: null,
    finalDay: game.day,
    corrections: game.corrections,
    nightForgotten: game.flags['night_forgotten'] === true,
    steps: [],
  }
  const runs = loadRuns(storage)
  // Reuse the still-empty open run rather than pushing a phantom — React 18
  // StrictMode double-invokes the start effect in dev, which would otherwise
  // spawn a second zero-step run per session.
  const open = openRun(storage)
  if (open !== null && open.steps.length === 0) return open
  runs.push(run)
  write(storage, PLAYTEST_KEY, runs.slice(-PLAYTEST_MAX_RUNS))
  return run
}

/** Appends one step to the run carrying `runId`. Cheap enough to call on every
 *  action: it re-reads only the tail run, which the storage layer already keeps
 *  as a string. */
export function recordStep(storage: SessionStorage, runId: string, game: GameState, kind: string, now = Date.now()): void {
  const runs = loadRuns(storage)
  const index = runs.findIndex((run) => run.id === runId)
  if (index === -1) return
  const run = runs[index]!
  // A closed run is a completed record: post-terminal dispatches (the restart
  // button, a stray key after the ending) must not append steps and skew
  // medianDeliberationMs.
  if (run.endedAt !== null) return
  const step: PlaytestStep = {
    t: Math.max(0, now - run.startedAt),
    day: game.day,
    kind,
    loc: game.player.locationId,
    hp: game.player.hp,
    qi: game.player.qi,
    gold: game.player.gold,
  }
  const steps = [...run.steps, step].slice(-PLAYTEST_MAX_STEPS)
  runs[index] = { ...run, steps, finalDay: game.day, corrections: game.corrections, nightForgotten: game.flags['night_forgotten'] === true }
  write(storage, PLAYTEST_KEY, runs)
}

export function closeRun(storage: SessionStorage, runId: string, game: GameState, now = Date.now()): void {
  const runs = loadRuns(storage)
  const index = runs.findIndex((run) => run.id === runId)
  if (index === -1) return
  const run = runs[index]!
  if (run.endedAt !== null) return
  runs[index] = {
    ...run,
    endedAt: now,
    endingId: game.endingId,
    finalDay: game.day,
    corrections: game.corrections,
    nightForgotten: game.flags['night_forgotten'] === true,
  }
  write(storage, PLAYTEST_KEY, runs)
}

export function loadFeedback(storage: SessionStorage): PlaytestSurvey[] {
  return parseArray(storage.get(PLAYTEST_FEEDBACK_KEY), isSurvey)
}

function isSurvey(value: unknown): value is PlaytestSurvey {
  if (typeof value !== 'object' || value === null) return false
  const survey = value as Partial<PlaytestSurvey>
  return survey.version === 1 && typeof survey.runId === 'string'
    && isNumber(survey.day) && likert(survey.clarity) && likert(survey.agency) && likert(survey.pressure)
    && typeof survey.note === 'string'
}

function likert(value: unknown): boolean {
  return typeof value === 'number' && Number.isInteger(value) && value >= 1 && value <= 5
}

/** Clamps rather than rejects: a hand-edited localStorage value should not
 *  throw inside a submit handler. */
function clampLikert(value: number): number {
  return Math.min(5, Math.max(1, Math.round(value)))
}

export function saveFeedback(storage: SessionStorage, survey: PlaytestSurvey): void {
  const next: PlaytestSurvey = {
    version: 1,
    runId: survey.runId,
    day: survey.day,
    endingId: survey.endingId,
    clarity: clampLikert(survey.clarity),
    agency: clampLikert(survey.agency),
    pressure: clampLikert(survey.pressure),
    note: survey.note.slice(0, PLAYTEST_NOTE_MAX),
  }
  const all = loadFeedback(storage)
  all.push(next)
  write(storage, PLAYTEST_FEEDBACK_KEY, all.slice(-PLAYTEST_MAX_FEEDBACK))
}

/** Median deliberation gap in ms — the "thời gian cân nhắc" the protocol asks
 *  about, derived so it never has to be recorded correctly in the first place. */
export function medianDeliberationMs(run: PlaytestRun): number {
  const gaps: number[] = []
  for (let i = 1; i < run.steps.length; i += 1) {
    const gap = run.steps[i]!.t - run.steps[i - 1]!.t
    if (gap >= 0) gaps.push(gap)
  }
  if (gaps.length === 0) return 0
  gaps.sort((a, b) => a - b)
  const mid = Math.floor(gaps.length / 2)
  return gaps.length % 2 === 1 ? gaps[mid]! : (gaps[mid - 1]! + gaps[mid]!) / 2
}
