import { describe, it, expect } from 'vitest'
import {
  SYSTEM_MESSAGES,
  SYSTEM_HEADER_VI,
  SYSTEM_HEADER_EN,
  type SystemMessage,
} from '../src/content/system-messages'
import {
  formatSystemMessage,
  queuePush,
  queueDrain,
  type QueuedNotification,
} from '../src/engine/system'

describe('system-messages data', () => {
  it('has at least 11 System messages (5 kinds + 1 dodge + 5 snark)', () => {
    expect(SYSTEM_MESSAGES.length).toBeGreaterThanOrEqual(11)
    const kinds = new Set(SYSTEM_MESSAGES.map((m) => m.kind))
    for (const kind of ['quest', 'reward', 'deadline', 'unlock', 'warning', 'dodge', 'snark'] as const) {
      expect(kinds.has(kind), `missing kind ${kind}`).toBe(true)
    }
    expect(SYSTEM_MESSAGES.filter((m) => m.kind === 'snark').length).toBeGreaterThanOrEqual(5)
  })

  it('has exact canon header strings', () => {
    expect(SYSTEM_HEADER_VI).toBe('【Hệ Thống】')
    expect(SYSTEM_HEADER_EN).toBe('【System】')
  })

  it('has a matching English template for every Vietnamese template', () => {
    for (const m of SYSTEM_MESSAGES as SystemMessage[]) {
      expect(m.templateVi.length, `missing Vi template: ${m.id}`).toBeGreaterThan(0)
      expect(m.templateEn.length, `missing En template: ${m.id}`).toBeGreaterThan(0)
    }
  })

  it('matches story-canon §5/§8 wording exactly and opens rewards with Đinh!', () => {
    const quest = SYSTEM_MESSAGES.find((m) => m.id === 'sys_quest_loaded')!
    // P3: neutral wording (side quests are not "nhiệm vụ chính") and no baked
    // deadline — the reducer prepends "Hạn: N ngày." to {objective} only when
    // the quest actually declares deadlineDays.
    expect(quest.templateVi).toBe('Nhiệm vụ tải xong: {quest}. {objective}')
    expect(quest.templateEn).toBe('Quest loaded: {quest}. {objective}')
    const reward = SYSTEM_MESSAGES.find((m) => m.id === 'sys_reward')!
    expect(reward.templateVi.startsWith('Đinh!')).toBe(true)
    expect(reward.templateEn.startsWith('Ding!')).toBe(true)
    const dodge = SYSTEM_MESSAGES.find((m) => m.id === 'sys_dodge')!
    expect(dodge.templateVi).toBe('Dữ liệu không đủ để trả lời.')
    expect(dodge.templateEn).toBe('Insufficient data to answer.')
  })

  it('keeps voice rules: no emoji, no "chủ nhân à~"', () => {
    const emoji = /[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/u
    for (const m of SYSTEM_MESSAGES) {
      expect(emoji.test(m.templateVi), `emoji in ${m.id}`).toBe(false)
      expect(m.templateVi).not.toContain('chủ nhân à')
      expect(m.templateEn).not.toMatch(/[!]{2,}/)
    }
  })
})

describe('formatSystemMessage', () => {
  it('formats quest message with Vi header, deadline carried by objective', () => {
    expect(
      formatSystemMessage('sys_quest_loaded', { quest: 'Chuộc danh dự', objective: 'Hạn: 4 ngày. Đánh bại Ma Thú Rừng Sương.' }, 'vi'),
    ).toBe('【Hệ Thống】 Nhiệm vụ tải xong: Chuộc danh dự. Hạn: 4 ngày. Đánh bại Ma Thú Rừng Sương.')
  })

  it('formats with En header, deadline carried by objective', () => {
    expect(
      formatSystemMessage('sys_quest_loaded', { quest: 'Restore honor', objective: 'Time limit: 4 days. Defeat the Mist Boar.' }, 'en'),
    ).toBe('【System】 Quest loaded: Restore honor. Time limit: 4 days. Defeat the Mist Boar.')
  })

  it('formats reward with Đinh! and reward token', () => {
    expect(
      formatSystemMessage('sys_reward', { reward: '10 Linh Thạch' }, 'vi'),
    ).toBe('【Hệ Thống】 Đinh! Nhiệm vụ hoàn tất. Thưởng: 10 Linh Thạch.')
  })

  it('keeps unknown/missing tokens as-is instead of throwing', () => {
    expect(formatSystemMessage('sys_warning', {}, 'vi')).toBe('【Hệ Thống】 Cảnh báo: {danger}.')
    expect(
      formatSystemMessage('sys_quest_loaded', { quest: 'Q' }, 'vi'),
    ).toBe('【Hệ Thống】 Nhiệm vụ tải xong: Q. {objective}')
  })

  it('never throws for unknown message id', () => {
    expect(() => formatSystemMessage('sys_missing_id', {}, 'vi')).not.toThrow()
    expect(formatSystemMessage('sys_missing_id', {}, 'vi')).toContain('【Hệ Thống】')
  })
})

describe('notification queue', () => {
  const a: QueuedNotification = { id: 'sys_quest_loaded', vars: { quest: 'A', days: 3 } }
  const b: QueuedNotification = { id: 'sys_reward', vars: { reward: '5' } }
  const c: QueuedNotification = { id: 'sys_unlock', vars: { feature: 'chợ' } }
  const d: QueuedNotification = { id: 'sys_warning', vars: { danger: 'ma thú' } }

  it('queuePush is a pure append (does not mutate input)', () => {
    const q: QueuedNotification[] = [a]
    const q2 = queuePush(q, 'sys_reward', { reward: '5' })
    expect(q).toEqual([a])
    expect(q2).toEqual([a, b])
    expect(queuePush(q, 'sys_unlock')).toEqual([a, { id: 'sys_unlock', vars: {} }])
  })

  it('queueDrain returns newest-first, at most 3 visible, and the rest', () => {
    const q = [a, b, c, d]
    const { visible, rest } = queueDrain(q)
    expect(visible).toEqual([d, c, b])
    expect(rest).toEqual([a])
    expect(q).toEqual([a, b, c, d]) // pure: input untouched
  })

  it('queueDrain respects custom max and empty queues', () => {
    expect(queueDrain([a, b], 5)).toEqual({ visible: [b, a], rest: [] })
    expect(queueDrain([], 3)).toEqual({ visible: [], rest: [] })
    expect(queueDrain([a], 0)).toEqual({ visible: [], rest: [a] })
  })

  it('drained notifications format correctly', () => {
    const { visible } = queueDrain([a, b, c, d])
    const top = visible[0] as QueuedNotification
    expect(formatSystemMessage(top.id, top.vars, 'vi')).toBe(
      '【Hệ Thống】 Cảnh báo: ma thú.',
    )
  })
})
