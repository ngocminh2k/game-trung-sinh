// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { newGame, type GameState } from '../src/engine'
import { OutfitTitleModal } from '../src/ui/OutfitTitleModal'
import { ProtoShell } from '../src/ui/ProtoShell'

describe('C3-16: Outfits & Titles UI (React Component Tests)', () => {
  afterEach(() => {
    cleanup()
    vi.restoreAllMocks()
  })

  it('does not render when show is false', () => {
    const game = newGame('outfit_test_1')
    const { container } = render(
      <OutfitTitleModal
        show={false}
        game={game}
        locale="vi"
        onAction={() => {}}
        onClose={() => {}}
      />,
    )
    expect(container.firstChild).toBeNull()
  })

  it('renders accessible dialog with E4 invariant banner when show is true', () => {
    const game = newGame('outfit_test_2')
    const onClose = vi.fn()
    const onAction = vi.fn()

    render(
      <OutfitTitleModal
        show={true}
        game={game}
        locale="vi"
        onAction={onAction}
        onClose={onClose}
      />,
    )

    const dialog = screen.getByRole('dialog', { name: /Ngoại Trang & Danh Hiệu/i })
    expect(dialog).toBeTruthy()
    expect(dialog.getAttribute('aria-modal')).toBe('true')

    // E4 badge
    const e4Badge = screen.getByTestId('e4-badge')
    expect(e4Badge).toBeTruthy()
    expect(e4Badge.textContent).toContain('0 chỉ số công thủ')

    // Active loadout
    const outfitBadge = screen.getByTestId('active-outfit-badge')
    expect(outfitBadge.textContent).toContain('Chưa mặc')

    const titleBadge = screen.getByTestId('active-title-badge')
    expect(titleBadge.textContent).toContain('Chưa đeo')
  })

  it('allows switching tabs between Outfits, Titles, and Resonances', () => {
    const game = newGame('outfit_test_3')
    render(
      <OutfitTitleModal
        show={true}
        game={game}
        locale="vi"
        onAction={() => {}}
        onClose={() => {}}
      />,
    )

    // Outfits list shown by default
    expect(screen.getByTestId('outfits-list')).toBeTruthy()

    // Switch to Titles tab
    fireEvent.click(screen.getByTestId('tab-titles'))
    expect(screen.getByTestId('titles-list')).toBeTruthy()

    // Switch to Resonance tab
    fireEvent.click(screen.getByTestId('tab-resonance'))
    expect(screen.getByTestId('resonance-list')).toBeTruthy()
  })

  it('dispatches buy_outfit when clicking buy button for an unowned outfit', () => {
    const game = newGame('outfit_test_4')
    // Give enough silver to buy bamboo scholar
    game.player.silver = 200
    const onAction = vi.fn()

    render(
      <OutfitTitleModal
        show={true}
        game={game}
        locale="vi"
        onAction={onAction}
        onClose={() => {}}
      />,
    )

    const buyBtn = screen.getByTestId('buy-outfit-outfit_bamboo_scholar')
    expect(buyBtn).toBeTruthy()
    fireEvent.click(buyBtn)

    expect(onAction).toHaveBeenCalledWith({
      kind: 'buy_outfit',
      outfitId: 'outfit_bamboo_scholar',
    })
  })

  it('dispatches equip_outfit when clicking equip button for an owned outfit', () => {
    const game = newGame('outfit_test_5')
    game.unlockedOutfits = ['outfit_bamboo_scholar']
    const onAction = vi.fn()

    render(
      <OutfitTitleModal
        show={true}
        game={game}
        locale="vi"
        onAction={onAction}
        onClose={() => {}}
      />,
    )

    const equipBtn = screen.getByTestId('equip-outfit-outfit_bamboo_scholar')
    expect(equipBtn).toBeTruthy()
    fireEvent.click(equipBtn)

    expect(onAction).toHaveBeenCalledWith({
      kind: 'equip_outfit',
      outfitId: 'outfit_bamboo_scholar',
    })
  })

  it('dispatches equip_title when clicking equip button for an unlocked title', () => {
    const game = newGame('outfit_test_6')
    const onAction = vi.fn()

    render(
      <OutfitTitleModal
        show={true}
        game={game}
        locale="vi"
        onAction={onAction}
        onClose={() => {}}
      />,
    )

    // Switch to titles tab
    fireEvent.click(screen.getByTestId('tab-titles'))

    const equipBtn = screen.getByTestId('equip-title-title_novice')
    expect(equipBtn).toBeTruthy()
    fireEvent.click(equipBtn)

    expect(onAction).toHaveBeenCalledWith({
      kind: 'equip_title',
      titleId: 'title_novice',
    })
  })

  it('displays synergy banner and active badge when matching outfit and title are equipped', () => {
    const game: GameState = {
      ...newGame('outfit_test_7'),
      activeOutfitId: 'outfit_bamboo_scholar',
      activeTitleId: 'title_novice',
      unlockedOutfits: ['outfit_bamboo_scholar'],
      unlockedTitles: ['title_novice'],
    }

    render(
      <OutfitTitleModal
        show={true}
        game={game}
        locale="vi"
        onAction={() => {}}
        onClose={() => {}}
      />,
    )

    const banner = screen.getByTestId('synergy-banner')
    expect(banner).toBeTruthy()
    expect(banner.textContent).toContain('Trúc Vận Đạo Đồng')

    // Switch to resonance tab and check active badge
    fireEvent.click(screen.getByTestId('tab-resonance'))
    const resCard = screen.getByTestId('resonance-card-synergy_bamboo_novice')
    expect(resCard.textContent).toContain('ĐANG KÍCH HOẠT')
  })

  it('ProtoShell has 👘 topbar button that opens OutfitTitleModal', () => {
    const game = newGame('outfit_test_shell')
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

    const outfitBtn = screen.getByTestId('outfits-titles-btn')
    expect(outfitBtn).toBeTruthy()

    // Click topbar button to open modal
    fireEvent.click(outfitBtn)

    const dialog = screen.getByRole('dialog', { name: /Ngoại Trang & Danh Hiệu/i })
    expect(dialog).toBeTruthy()

    // Close button works
    const closeBtn = screen.getByTestId('outfit-modal-close-btn')
    fireEvent.click(closeBtn)
    expect(screen.queryByRole('dialog', { name: /Ngoại Trang & Danh Hiệu/i })).toBeNull()
  })
})
