// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { newGame, type GameState } from '../src/engine'
import { SessionRecapModal } from '../src/ui/SessionRecapModal'
import { ProtoShell } from '../src/ui/ProtoShell'

describe('C3-17: System Assistant & Session Recap UI (React Component Tests)', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('does not render when show is false', () => {
    const game = newGame('recap_ui_1')
    const { container } = render(
      <SessionRecapModal
        show={false}
        game={game}
        locale="vi"
        onClose={() => {}}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders accessible dialog with away banner and primary advice when show is true', () => {
    const game: GameState = {
      ...newGame('recap_ui_2'),
      player: {
        ...newGame('recap_ui_2').player,
        pendingAttributePoints: 4,
      },
    }
    const onClose = vi.fn()
    const now = 1770000000000
    const twoHoursAgo = now - 2 * 60 * 60 * 1000

    render(
      <SessionRecapModal
        show={true}
        game={game}
        locale="vi"
        lastSavedAt={twoHoursAgo}
        onClose={onClose}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: /Trợ Lý Hệ Thống & Tóm Tắt Tu Tiên/i })
    expect(dialog).toBeTruthy()
    expect(dialog.getAttribute('aria-modal')).toBe('true')

    // Away banner
    const awayBanner = screen.getByTestId('recap-away-banner')
    expect(awayBanner).toBeTruthy()
    expect(awayBanner.textContent).toContain('Thời gian vắng mặt')

    // Primary advice card
    const adviceCard = screen.getByTestId('recap-primary-advice')
    expect(adviceCard.textContent).toContain('NGUY CẤP')
    expect(adviceCard.textContent).toContain('Phân bổ điểm tiềm năng!')

    // Status grid
    expect(screen.getByTestId('recap-location')).toBeTruthy()
    expect(screen.getByTestId('recap-hp')).toBeTruthy()
    expect(screen.getByTestId('recap-qi')).toBeTruthy()
    expect(screen.getByTestId('recap-stage')).toBeTruthy()

    // Suggested actions
    const suggested = screen.getByTestId('recap-suggested-actions')
    expect(suggested.textContent).toContain('Phân bổ điểm tiềm năng')
  })

  it('closes when clicking close button or continue button', () => {
    const game = newGame('recap_ui_3')
    const onClose = vi.fn()

    render(
      <SessionRecapModal
        show={true}
        game={game}
        locale="vi"
        onClose={onClose}
      />,
    )

    const closeBtn = screen.getByTestId('recap-modal-close-btn')
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)

    const continueBtn = screen.getByTestId('recap-continue-btn')
    fireEvent.click(continueBtn)
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('renders active quests when present in game state', () => {
    const base = newGame('recap_ui_4')
    const game: GameState = {
      ...base,
      quests: {
        q_main_letter: {
          status: 'active',
          step: 0,
        },
      },
    }

    render(
      <SessionRecapModal
        show={true}
        game={game}
        locale="vi"
        onClose={() => {}}
      />,
    )

    const questList = screen.getByTestId('recap-quests-list')
    expect(questList.textContent).toContain('Lá thư lúc rạng đông')
  })

  it('ProtoShell has 💡 topbar button that opens SessionRecapModal', () => {
    const game = newGame('recap_ui_shell')
    const onAction = vi.fn()

    render(
      <ProtoShell
        game={game}
        locale="vi"
        chronicle={[]}
        onAction={onAction}
        onLocaleChange={() => {}}
      />,
    )

    const assistantBtn = screen.getByTestId('system-assistant-btn')
    expect(assistantBtn).toBeTruthy()

    // Click topbar button to open modal
    fireEvent.click(assistantBtn)

    const dialog = screen.getByRole('dialog', { name: /Trợ Lý Hệ Thống & Tóm Tắt Tu Tiên/i })
    expect(dialog).toBeTruthy()

    // Close modal
    const continueBtn = screen.getByTestId('recap-continue-btn')
    fireEvent.click(continueBtn)
    expect(screen.queryByRole('dialog', { name: /Trợ Lý Hệ Thống & Tóm Tắt Tu Tiên/i })).toBeNull()
  })

  it('ProtoShell objective line has assistant button that opens SessionRecapModal', () => {
    const game = newGame('recap_ui_obj')
    render(
      <ProtoShell
        game={game}
        locale="vi"
        chronicle={[]}
        onAction={() => {}}
        onLocaleChange={() => {}}
      />,
    )

    const objBtn = screen.getByTestId('objective-assistant-btn')
    expect(objBtn).toBeTruthy()

    fireEvent.click(objBtn)
    expect(screen.getByRole('dialog', { name: /Trợ Lý Hệ Thống & Tóm Tắt Tu Tiên/i })).toBeTruthy()
  })
})
