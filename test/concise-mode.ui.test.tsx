// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { SettingsScreen } from '../src/ui/MainMenu'
import { ProtoShell } from '../src/ui/ProtoShell'
import { GameScreen } from '../src/ui/GameScreen'
import { newGame } from '../src/engine/constants'
import { DEFAULT_SETTINGS, type PlayerSettings } from '../src/ui/session'

describe('Concise Mode UI Touchpoints (C3-18)', () => {
  afterEach(() => cleanup())

  it('renders concise mode switch in SettingsScreen and toggles state', () => {
    const onChange = vi.fn()
    const onBack = vi.fn()
    const settings: PlayerSettings = { ...DEFAULT_SETTINGS, conciseMode: false }

    const { rerender } = render(
      <SettingsScreen
        locale="vi"
        settings={settings}
        onChange={onChange}
        onBack={onBack}
      />
    )

    const toggleSwitch = screen.getByTestId('concise-mode-switch')
    expect(toggleSwitch.getAttribute('aria-checked')).toBe('false')
    expect(toggleSwitch.textContent).toContain('Tóm tắt: tắt')

    fireEvent.click(toggleSwitch)
    expect(onChange).toHaveBeenCalledTimes(1)
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ conciseMode: true }))

    // Re-render with conciseMode: true
    rerender(
      <SettingsScreen
        locale="vi"
        settings={{ ...settings, conciseMode: true }}
        onChange={onChange}
        onBack={onBack}
      />
    )
    const activeSwitch = screen.getByTestId('concise-mode-switch')
    expect(activeSwitch.getAttribute('aria-checked')).toBe('true')
    expect(activeSwitch.textContent).toContain('Tóm tắt: đang bật')
  })

  it('renders quick concise toggle button in ProtoShell and triggers callback', () => {
    const game = newGame('test-seed-proto')
    const onToggle = vi.fn()
    const chronicle: string[] = [
      'Cụ Mai Hoa bước vào sân. Trên tay cụ là một bức thư niêm phong bằng sáp đỏ. Gió sớm lay động cành đào khô.',
    ]

    const { rerender } = render(
      <ProtoShell
        game={game}
        locale="vi"
        chronicle={chronicle}
        chronicleKinds={['train']}
        journalOpen={false}
        onAction={() => {}}
        onJournalToggle={() => {}}
        onLocaleChange={() => {}}
        conciseMode={false}
        onConciseModeToggle={onToggle}
      />
    )

    const btn = screen.getByTestId('concise-mode-btn')
    expect(btn.getAttribute('aria-pressed')).toBe('false')
    fireEvent.click(btn)
    expect(onToggle).toHaveBeenCalledTimes(1)

    // Rerender with conciseMode: true
    rerender(
      <ProtoShell
        game={game}
        locale="vi"
        chronicle={chronicle}
        chronicleKinds={['train']}
        journalOpen={false}
        onAction={() => {}}
        onJournalToggle={() => {}}
        onLocaleChange={() => {}}
        conciseMode={true}
        onConciseModeToggle={onToggle}
      />
    )
    const activeBtn = screen.getByTestId('concise-mode-btn')
    expect(activeBtn.getAttribute('aria-pressed')).toBe('true')

    // Ticker line should be condensed
    const ticker = screen.getByTestId('proto-ticker-msg')
    expect(ticker.textContent).toContain('Cụ Mai Hoa bước vào sân.')
    expect(ticker.textContent).not.toContain('Gió sớm lay động cành đào khô.')
  })

  it('renders concise mode toggle button and condensed scene copy in GameScreen story dialog', () => {
    const game = newGame('test-seed-story', { storyScene: 'letter_at_dawn' })
    const onToggle = vi.fn()
    const chronicle: string[] = []

    // 1. Render in full prose mode
    const { rerender } = render(
      <GameScreen
        game={game}
        locale="vi"
        chronicle={chronicle}
        chronicleKinds={[]}
        onAction={() => {}}
        onLocaleChange={() => {}}
        storyOpen={true}
        onStoryClose={() => {}}
        conciseMode={false}
        onConciseModeToggle={onToggle}
      />
    )

    const storyCopy = screen.getByText((_content, element) => {
      return element?.tagName.toLowerCase() === 'p' && element.className.includes('beat-copy')
    })
    // In full prose, letter_at_dawn is long:
    expect(storyCopy.textContent?.length).toBeGreaterThan(120)

    const storyToggleBtn = screen.getByTestId('story-concise-toggle-btn')
    expect(storyToggleBtn.getAttribute('aria-pressed')).toBe('false')
    expect(screen.queryByTestId('story-concise-badge')).toBeNull()

    fireEvent.click(storyToggleBtn)
    expect(onToggle).toHaveBeenCalledTimes(1)

    // 2. Rerender with conciseMode: true
    rerender(
      <GameScreen
        game={game}
        locale="vi"
        chronicle={chronicle}
        chronicleKinds={[]}
        onAction={() => {}}
        onLocaleChange={() => {}}
        storyOpen={true}
        onStoryClose={() => {}}
        conciseMode={true}
        onConciseModeToggle={onToggle}
      />
    )

    const badge = screen.getByTestId('story-concise-badge')
    expect(badge).toBeTruthy()
    expect(badge.textContent).toBe('Tóm tắt')

    const condensedCopy = screen.getByText((_content, element) => {
      return element?.tagName.toLowerCase() === 'p' && element.className.includes('beat-copy')
    })
    // Condensed version is punchy:
    expect(condensedCopy.textContent).toBe(
      'Trước cổng làng, phong thư kiếp trước trao ngươi nửa bản đồ hang Phong Ấn và trâm ngọc cụ Mai Hoa.'
    )
  })
})
