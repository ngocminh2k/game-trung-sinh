// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { newGame } from '../src/engine'
import { LunarCalendarModal } from '../src/ui/LunarCalendarModal'
import { ProtoShell } from '../src/ui/ProtoShell'

describe('C3-15: Lunar Calendar & Forecast UI (React Component Tests)', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('does not render when show is false', () => {
    const game = newGame('calendar_test_1')
    const { container } = render(
      <LunarCalendarModal
        show={false}
        game={game}
        locale="vi"
        onClose={() => {}}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders accessible dialog with 7-day forecast cards when show is true', () => {
    const game = newGame('calendar_test_1')
    const onClose = vi.fn()

    render(
      <LunarCalendarModal
        show={true}
        game={game}
        locale="vi"
        onClose={onClose}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: /Lịch Âm & Dự Báo Thiên Tượng/i })
    expect(dialog).toBeTruthy()
    expect(dialog.getAttribute('aria-modal')).toBe('true')

    // Today overview
    const overview = screen.getByTestId('today-overview')
    expect(overview).toBeTruthy()
    expect(overview.textContent).toContain('Giáp Tý')
    expect(overview.textContent).toContain('Ngày 1')

    // 7-day forecast grid
    const grid = screen.getByTestId('forecast-grid')
    expect(grid).toBeTruthy()

    // 7 days present
    for (let day = 1; day <= 7; day++) {
      expect(screen.getByTestId(`forecast-day-${day}`)).toBeTruthy()
    }
  })

  it('triggers onClose when close button is clicked or Escape is pressed', () => {
    const game = newGame('calendar_test_1')
    const onClose = vi.fn()

    render(
      <LunarCalendarModal
        show={true}
        game={game}
        locale="vi"
        onClose={onClose}
      />,
    )

    const closeBtn = screen.getByTestId('lunar-calendar-close-btn')
    fireEvent.click(closeBtn)
    expect(onClose).toHaveBeenCalledTimes(1)

    // Fire Escape key
    fireEvent.keyDown(window, { key: 'Escape' })
    expect(onClose).toHaveBeenCalledTimes(2)
  })

  it('displays Blood Moon alert banner and badge when day is 15', () => {
    const baseGame = newGame('calendar_test_1')
    const bloodMoonGame = { ...baseGame, day: 15 }

    render(
      <LunarCalendarModal
        show={true}
        game={bloodMoonGame}
        locale="vi"
        onClose={() => {}}
      />,
    )

    // Banner is rendered
    const banner = screen.getByTestId('blood-moon-banner')
    expect(banner).toBeTruthy()
    expect(banner.textContent).toContain('CẢNH BÁO ĐÊM TRĂNG MÁU')
  })

  it('supports English locale rendering properly', () => {
    const game = newGame('calendar_test_1')

    render(
      <LunarCalendarModal
        show={true}
        game={game}
        locale="en"
        onClose={() => {}}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: /Lunar Calendar & Astronomical Forecast/i })
    expect(dialog).toBeTruthy()
    expect(screen.getAllByText(/7-Day Astronomical Forecast/i).length).toBeGreaterThanOrEqual(1)
  })

  it('integrates with ProtoShell topbar button to toggle modal', () => {
    const game = newGame('calendar_test_1')
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

    const lunarBtn = screen.getByTestId('lunar-calendar-btn')
    expect(lunarBtn).toBeTruthy()

    // Initially modal is not visible
    expect(screen.queryByRole('dialog', { name: /Lịch Âm & Dự Báo Thiên Tượng/i })).toBeNull()

    // Click topbar button
    fireEvent.click(lunarBtn)

    // Modal opens
    const dialog = screen.getByRole('dialog', { name: /Lịch Âm & Dự Báo Thiên Tượng/i })
    expect(dialog).toBeTruthy()

    // Close modal via close button
    const closeBtn = screen.getByTestId('lunar-calendar-close-btn')
    fireEvent.click(closeBtn)

    // Modal closed
    expect(screen.queryByRole('dialog', { name: /Lịch Âm & Dự Báo Thiên Tượng/i })).toBeNull()
  })
})
