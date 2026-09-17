// P3 — sys_quest_loaded copy bug (docs/agent-work/active/system-quest-chain-ramp.md §"P3").
// Two failures being reproduced here:
//   (a) template mislabels System side quests as "Nhiệm vụ chính" / "Main quest".
//   (b) after the chain-ramp removed `deadlineDays` from every System quest,
//       the emit site pushes `days: def.deadlineDays ?? 0` and the template
//       renders "Hạn: 0 ngày." / "Time limit: 0 days."
// The fix moves the deadline clause out of the shared template and into an
// emit-site conditional baked into `objective` / `objectiveEn`, so every
// off-limits UI consumer (`src/ui/GameScreen.tsx`, `src/ui/gameScreen/helpers.ts`)
// keeps working unchanged.

import { describe, expect, it } from 'vitest'
import { applyAction, formatSystemMessage, newGame as engineNewGame } from '../src/engine'
import type { GameState } from '../src/engine'
import { SYSTEM_MESSAGES } from '../src/content'
import { newGame } from './test-utils'

function lastQueued(state: GameState): { id: string; vars: Record<string, string | number> } | undefined {
  const queue = state.systemQueue ?? []
  return queue[queue.length - 1]
}

function transition(state: GameState, action: Parameters<typeof applyAction>[1]): GameState {
  const result = applyAction(state, action)
  expect(result.events.some((e) => e.type === 'ERROR')).toBe(false)
  return result.state
}

/** Mirrors src/ui/gameScreen/helpers.ts `systemNotificationText` for `sys_quest_loaded`
 *  (that path is off-limits; the test reproduces it so we know the UI still renders
 *  a sane string after the emit-site change). */
function renderQuestLoaded(entry: { vars: Record<string, string | number> }, locale: 'vi' | 'en'): string {
  return formatSystemMessage('sys_quest_loaded', {
    quest: locale === 'vi' ? String(entry.vars.quest ?? '') : String(entry.vars.questEn ?? ''),
    days: Number(entry.vars.days ?? 0),
    objective: locale === 'vi' ? String(entry.vars.objective ?? '') : String(entry.vars.objectiveEn ?? ''),
  }, locale)
}

describe('P3 — sys_quest_loaded template wording', () => {
  it('Vietnamese template calls it "Nhiệm vụ tải xong", not "Nhiệm vụ chính tải xong"', () => {
    const quest = SYSTEM_MESSAGES.find((m) => m.id === 'sys_quest_loaded')!
    expect(quest.templateVi).not.toContain('Nhiệm vụ chính')
    expect(quest.templateVi).toContain('Nhiệm vụ tải xong')
  })

  it('English template says "Quest loaded", not "Main quest loaded"', () => {
    const quest = SYSTEM_MESSAGES.find((m) => m.id === 'sys_quest_loaded')!
    expect(quest.templateEn).not.toMatch(/Main quest/i)
    expect(quest.templateEn).toContain('Quest loaded')
  })

  it('template does not embed a {days} clause — the deadline is per-quest optional', () => {
    const quest = SYSTEM_MESSAGES.find((m) => m.id === 'sys_quest_loaded')!
    expect(quest.templateVi).not.toContain('{days}')
    expect(quest.templateEn).not.toContain('{days}')
  })
})

describe('P3 — reducer emit for quests without a deadline', () => {
  it('accepting a System chain quest (no deadlineDays) never renders "0 ngày" / "0 days"', () => {
    const state = transition(newGame('p3-sys-no-deadline'), { kind: 'system_accept_quest', questId: 'q_sys_battle_01' })
    const entry = lastQueued(state)
    expect(entry?.id).toBe('sys_quest_loaded')
    // No deadline → no `days` var at all (never a misleading `days: 0`).
    expect(entry?.vars.days).toBeUndefined()
    const vi = renderQuestLoaded(entry!, 'vi')
    const en = renderQuestLoaded(entry!, 'en')
    expect(vi).not.toMatch(/0\s*ngày/)
    expect(en).not.toMatch(/0\s*days/)
    expect(vi).not.toContain('{days}')
    expect(en).not.toContain('{days}')
    expect(vi).toContain('Chiến Đấu I')
    expect(en).toContain('Battle I')
    expect(vi).toContain('Giao nanh thú cho Hệ Thống.')
    expect(en).toContain('Deliver beast fangs to the System.')
  })
})

describe('P3 — reducer emit for quests WITH a deadline', () => {
  it('accepting a world quest that declares deadlineDays still announces the limit', () => {
    let game = engineNewGame('p3-world-deadline')
    game = transition(game, { kind: 'story_choice', choiceId: 'accept_system_mercy' })
    game = transition(game, { kind: 'story_choice', choiceId: 'pick_sys_battle' })
    // Player is at village; n_guard_truong is at village; q_world_forest_clear.deadlineDays = 5.
    const state = transition(game, { kind: 'accept_quest', questId: 'q_world_forest_clear' })
    const entry = lastQueued(state)
    expect(entry?.id).toBe('sys_quest_loaded')
    expect(entry?.vars.days).toBe(5)
    const vi = renderQuestLoaded(entry!, 'vi')
    const en = renderQuestLoaded(entry!, 'en')
    expect(vi).toContain('Hạn: 5 ngày.')
    expect(en).toContain('Time limit: 5 days.')
    expect(vi).toContain('Dọn quái Rừng Vân Mộ')
    expect(en).toContain('Clear the Cloudgrave Forest')
  })
})

describe('P3 — formatSystemMessage guards', () => {
  it('rendering with days=0 does not leak a "0 ngày" phrase or an unrendered {days} token', () => {
    const vi = formatSystemMessage('sys_quest_loaded', { quest: 'X', days: 0, objective: 'Y.' }, 'vi')
    const en = formatSystemMessage('sys_quest_loaded', { quest: 'X', days: 0, objective: 'Y.' }, 'en')
    expect(vi).not.toMatch(/0\s*ngày/)
    expect(en).not.toMatch(/0\s*days/)
    expect(vi).not.toContain('{days}')
    expect(en).not.toContain('{days}')
  })
})