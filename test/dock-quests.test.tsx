// @vitest-environment jsdom
// Playtest LEDGER (docs/playtest-ai/rounds/LEDGER.md): dock quest rows offered a
// bare "Nhận" button — a screen reader could not tell which quest it accepts —
// and both quest counters reported completed/total, pinning every run at 0/210,
// so accepting an quest produced no visible change in the panel itself.
import type { RefObject } from 'react'
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { QUESTS } from '../src/content'
import { applyAction, newGame } from '../src/engine'
import { narrate } from '../src/engine/narrator'
import type { GameState, QuestRuntime } from '../src/engine/types'
import { LeftRailTabContent } from '../src/ui/LeftRailTabContent'
import { ChronicleFeed, DockPanelQuests, DockTabBar } from '../src/ui/gameScreen/panels'

const NULL_REF = { current: null } as unknown as RefObject<HTMLDivElement>
const NULL_LI_REF = { current: null } as unknown as RefObject<HTMLLIElement>

vi.mock('../src/ai/system', () => ({
  requestSystemReply: vi.fn().mockResolvedValue({ kind: 'idle', textVi: '', textEn: '' }),
}))

const letter = QUESTS.find((q) => q.id === 'q_main_letter')!
const herb = QUESTS.find((q) => q.id === 'q_herb_delivery')!

function bootFixture(quests: Record<string, QuestRuntime> = {}): GameState {
  const base = newGame('dock-quests')
  return { ...base, quests: { q_main_letter: { status: 'available' }, q_herb_delivery: { status: 'available' }, ...quests } }
}

afterEach(() => cleanup())

describe('dock quest panel — accept buttons carry their quest title', () => {
  it('names every dock accept button with its quest title', () => {
    render(<DockPanelQuests encounterLocked={false} game={bootFixture()} locale="en" onAction={vi.fn()} />)
    expect(screen.getByRole('button', { name: `Accept: ${letter.nameEn}` })).toBeTruthy()
    expect(screen.getByRole('button', { name: `Accept: ${herb.nameEn}` })).toBeTruthy()
  })

  it('names the left-rail accept buttons with their quest titles', () => {
    render(<LeftRailTabContent tab="system" game={bootFixture()} locale="en" onAction={vi.fn()} />)
    expect(screen.getByRole('button', { name: `Accept quest: ${letter.nameEn}` })).toBeTruthy()
    expect(screen.getByRole('button', { name: `Accept quest: ${herb.nameEn}` })).toBeTruthy()
  })

  it('still dispatches accept_quest from the named button', () => {
    const onAction = vi.fn()
    render(<DockPanelQuests encounterLocked={false} game={bootFixture()} locale="en" onAction={onAction} />)
    fireEvent.click(screen.getByRole('button', { name: `Accept: ${letter.nameEn}` }))
    expect(onAction).toHaveBeenCalledWith({ kind: 'accept_quest', questId: 'q_main_letter' })
  })
})

describe('dock quest counters — act on what the player can see, not completed/total', () => {
  it('panel header counts available quests at boot, never 0/<total>', () => {
    const { container } = render(<DockPanelQuests encounterLocked={false} game={bootFixture()} locale="en" onAction={vi.fn()} />)
    const header = container.querySelector('.panel-heading')?.textContent ?? ''
    expect(header).not.toContain(`0/${String(QUESTS.length)}`)
    expect(header).toMatch(/\d+ available/)
  })

  it('panel header shows the active count after an accept', () => {
    const { container, rerender } = render(<DockPanelQuests encounterLocked={false} game={bootFixture()} locale="en" onAction={vi.fn()} />)
    rerender(<DockPanelQuests encounterLocked={false} game={bootFixture({ q_main_letter: { status: 'active' } })} locale="en" onAction={vi.fn()} />)
    const header = container.querySelector('.panel-heading')?.textContent ?? ''
    expect(header).toContain('1 active')
  })

  it('tab badge reports active/available instead of completed/210', () => {
    render(<DockTabBar activeDock="quests" entriesCount={0} game={bootFixture({ q_main_letter: { status: 'active' } })} locale="en" onSelect={vi.fn()} localNpcsCount={0} chronicleLength={0} />)
    const badge = screen.getByRole('tab', { name: /^Quests:/ }).getAttribute('aria-label') ?? ''
    expect(badge).toMatch(/^Quests: \d+ (active|available)$/)
  })
})

describe('dock quest panel — accepting is visible in the row the player clicked', () => {
  // T2 criterion: the row itself must change (quest-active), show the step, offer
  // Nộp, and drop the available count by one. Driven through the REAL reducer so a
  // state shape the panel cannot read fails here.
  it('flips the row to quest-active, shows the step, reveals Nộp and drops available by 1', () => {
    const before = bootFixture()
    const { container, rerender } = render(<DockPanelQuests encounterLocked={false} game={before} locale="en" onAction={vi.fn()} />)
    const rowFor = () => [...container.querySelectorAll<HTMLLIElement>('.quest-list li')].find((li) => li.textContent?.includes(letter.nameEn))
    const availableRows = () => container.querySelectorAll('.quest-list li.quest-available').length

    expect(rowFor()?.className).toBe('quest-available')
    expect(rowFor()?.querySelector('.quest-step')).toBeNull()
    expect(rowFor()?.querySelector(`button[aria-label="Accept: ${letter.nameEn}"]`)).toBeTruthy()
    const availableBefore = availableRows()

    const after = applyAction(before, { kind: 'accept_quest', questId: 'q_main_letter' }).state
    rerender(<DockPanelQuests encounterLocked={false} game={after} locale="en" onAction={vi.fn()} />)

    const row = rowFor()
    expect(row?.className).toBe('quest-active')
    expect(row?.querySelector('.quest-step')?.textContent).toBe(letter.steps[0]!.descEn)
    expect(row?.querySelector('button[aria-label="Turn in: ' + letter.nameEn + '"]')).toBeTruthy()
    expect(row?.querySelector(`button[aria-label="Accept: ${letter.nameEn}"]`)).toBeNull()
    expect(availableRows()).toBe(availableBefore - 1)
    expect(container.querySelector('.panel-heading')?.textContent).toContain('1 active')
  })
})

describe('quest accept confirmation reaches the chronicle', () => {
  // T2 criterion 3: accepting must leave a line the player can read back, not
  // just a silent status flip. Driven through the REAL reducer + narrator — the
  // same pair App.act() calls — so a dropped QUEST_ACCEPTED event fails here.
  it('narrates the accepted quest by name in both locales', () => {
    const { state, events } = applyAction(bootFixture(), { kind: 'accept_quest', questId: 'q_herb_delivery' })
    expect(state.quests.q_herb_delivery!.status).toBe('active')

    const lines = narrate(events, 'en')
    expect(lines.some((line) => line.includes('Quest accepted') && line.includes(herb.nameEn))).toBe(true)
    expect(narrate(events, 'vi').some((line) => line.includes(herb.nameVi))).toBe(true)

    render(
      <ChronicleFeed
        chronicle={lines}
        chronicleKinds={events.map((event) => event.type.toLowerCase())}
        chronicleEndRef={NULL_LI_REF}
        chronicleNewAt={lines.length}
        chronicleRef={NULL_REF}
        locale="en"
      />,
    )
    expect(screen.getByText(new RegExp(`Quest accepted: ${herb.nameEn}`))).toBeTruthy()
  })
})
