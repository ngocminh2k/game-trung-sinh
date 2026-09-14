// Issue #33 (UI half): the tree is actually on screen. skill-tree.test.ts
// covers content + engine; this covers the panel itself — every node renders
// a row, locked nodes carry a readable reason, and the Unlock affordance
// exists exactly when the engine would accept unlock_skill (jsdom markup,
// the house renderToStaticMarkup pattern).
// @vitest-environment jsdom
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { applyAction, newGame } from '../src/engine'
import type { GameState } from '../src/engine/types'
import { SkillTreePanel, actionBlockedReason } from '../src/ui/gameScreen/skillTree/SkillTreePanel'

const noop = (): undefined => undefined

function render(game: GameState, locale: 'vi' | 'en' = 'vi'): string {
  return renderToStaticMarkup(<SkillTreePanel game={game} locale={locale} onAction={noop} onClose={noop} />)
}

describe('issue 33: the skill tree panel shows the tree', () => {
  it('renders the balance, the legend and all six branch chips', () => {
    const markup = render(newGame('i33-ui'))
    expect(markup).toContain('data-testid="skill-tree-panel"')
    expect(markup).toContain('data-testid="skill-point-balance"')
    expect(markup).toContain('data-testid="skill-tree-legend"')
    for (const branch of ['sword', 'aura', 'herbal', 'shadow', 'thunder', 'secret']) {
      expect(markup, branch).toContain(`data-testid="skill-branch-${branch}"`)
    }
    // Default view: the sword branch's 20 rows, first node named.
    expect(markup).toContain('data-testid="skill-node-sword_t1"')
    expect(markup).toContain('Lưỡi Kiếm Khai Môn')
  })

  it('with zero points nothing is clickable and the lock names the debt', () => {
    const markup = render(newGame('i33-poor'))
    expect(markup).not.toContain('data-testid="skill-unlock-sword_t1"')
    expect(markup).toContain('data-testid="skill-lock-sword_t1"')
    expect(markup).toContain('Thiếu 1 điểm kỹ năng')
  })

  it('one skill point turns exactly the frontier row into a real button', () => {
    let game: GameState = { ...newGame('i33-point'), player: { ...newGame('i33-point').player, skillPoints: 1 } }
    const markup = render(game)
    expect(markup).toContain('data-testid="skill-unlock-sword_t1"')
    expect(markup).toContain('Lĩnh ngộ')
    // Tier 2 is still sealed behind the tier chain — the reason names the row.
    expect(markup).toContain('data-testid="skill-lock-sword_t2"')
    expect(markup).toContain('Sau “Lưỡi Kiếm Khai Môn”')
  })

  it('unspent attribute points block the tree and say so', () => {
    const base = newGame('i33-softlock')
    const game: GameState = { ...base, player: { ...base.player, skillPoints: 1, pendingAttributePoints: 2 } }
    expect(actionBlockedReason(game, 'vi')).toContain('2 điểm thuộc tính chưa chia')
    const markup = render(game)
    expect(markup).toContain('data-testid="skill-tree-blocked"')
    expect(markup).not.toContain('data-testid="skill-unlock-sword_t1"')
  })

  it('a real unlock_skill lands in the tree and the point counter drops', () => {
    // Two points: one pays for sword_t1, the other stays to prove the counter
    // and let the frontier (t2) become openable.
    const base: GameState = { ...newGame('i33-spend'), player: { ...newGame('i33-spend').player, skillPoints: 2 } }
    const result = applyAction(base, { kind: 'unlock_skill', nodeId: 'sword_t1' })
    expect(result.events.some((e) => e.type === 'SKILL_UNLOCKED')).toBe(true)
    const markup = render(result.state)
    expect(markup).toContain('Điểm kỹ năng <span class="v">1</span>')
    expect(markup).toContain('data-testid="skill-unlock-sword_t2"') // frontier advanced
    expect(markup).toContain('Đã lĩnh ngộ')
  })

  it('both locales render the panel chrome', () => {
    const en = render(newGame('i33-en'), 'en')
    expect(en).toContain('Skill Tree')
    expect(en).toContain('1 more skill point needed')
    expect(en).not.toContain('Cây Công Pháp')
  })

  it('inert nodes carry the honesty badge, honoured ones do not', () => {
    const markup = render(newGame('i33-inert'))
    // sword_t1 is an attack buff — honoured. Some later node is not; spot-check
    // the badge exists in the DOM for at least one node of each branch list.
    expect(markup).not.toContain('data-testid="skill-inert-sword_t1"')
    expect(markup).toMatch(/data-testid="skill-inert-/)
  })
})
