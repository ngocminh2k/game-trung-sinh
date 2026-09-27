import { cleanup, fireEvent, render, screen, within } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import App from '../src/App'
import { ACHIEVEMENTS, NPCS } from '../src/content'
import { currentBeat, newGame } from '../src/engine'
import { applyAction } from '../src/engine/reducer'
import { GameScreen } from '../src/ui/GameScreen'
import { LeftRailTabContent } from '../src/ui/LeftRailTabContent'
import { ProtoShell } from '../src/ui/ProtoShell'
import { DockPanelMarket, DockPanelQuests, PeopleDockPanel } from '../src/ui/gameScreen/panels'
import { saveSlot, setActiveSlot, type GameSession } from '../src/ui/session'
import type { QuestRuntime } from '../src/engine/types'

vi.mock('../src/ai/system', () => ({
  requestSystemReply: vi.fn().mockResolvedValue({
    kind: 'offer_quest',
    textVi: 'Đề nghị',
    textEn: 'Quest offer',
    questId: 'q_sys_battle_01',
  }),
}))

afterEach(() => cleanup())

describe('S07 System UI', () => {
  it('renders the selected System pool and dispatches its panel actions', () => {
    const onAction = vi.fn()
    render(
      <GameScreen
        game={{ ...newGame('system-ui'), systemId: 'sys_battle' }}
        locale="en"
        chronicle={[]}
        onAction={onAction}
        onLocaleChange={() => undefined}
      />,
    )

    // The merged shell keeps the System pool in the .system-panel HUD card (the
    // proto-shell left rail has a separate 契 tab); scope to it so the counts below
    // stay meaningful.
    const panel = within(screen.getByTestId('system-panel'))
    expect(panel.getByText('【Battle System】')).toBeTruthy()
    // Chain ramp P1: a fresh pick shows only the chain head _01, not the whole
    // 6-quest pool — the rest are gated on their predecessor's _done flag.
    expect(panel.getAllByText(/Difficulty/)).toHaveLength(1)
    fireEvent.click(panel.getAllByRole('button', { name: 'Accept quest' })[0]!)
    expect(onAction).toHaveBeenCalledWith({ kind: 'system_accept_quest', questId: 'q_sys_battle_01' })
  })

  it('clears a chat-offered quest after accepting it', async () => {
    const onAction = vi.fn()
    render(
      <GameScreen
        game={{ ...newGame('system-offer'), systemId: 'sys_battle' }}
        locale="en"
        chronicle={[]}
        onAction={onAction}
        onLocaleChange={() => undefined}
      />,
    )

    fireEvent.change(screen.getByRole('textbox', { name: 'Battle System' }), { target: { value: 'offer' } })
    fireEvent.click(screen.getByRole('button', { name: 'Talk' }))
    // The merged shell renders a chat-offered quest as a `role="status"` line inside
    // .system-chat, with the Accept button nested in it; there is no dedicated testid.
    const reply = await screen.findByText('Quest offer')
    expect(reply.getAttribute('role')).toBe('status')
    fireEvent.click(within(reply).getByRole('button', { name: 'Accept quest' }))
    expect(onAction).toHaveBeenCalledWith({ kind: 'system_accept_quest', questId: 'q_sys_battle_01' })
    expect(screen.queryByText('Quest offer')).toBeNull()
  })

  it('does not render System UI for the rootless branch', () => {
    const base = newGame('system-rootless')
    render(
      <GameScreen
        game={{ ...base, flags: { ...base.flags, system_refused: true } }}
        locale="en"
        chronicle={[]}
        onAction={() => undefined}
        onLocaleChange={() => undefined}
      />,
    )

    expect(screen.queryByTestId('system-panel')).toBeNull()
  })

  it('T10: inerts .proto-shell-wrap and world background regions while journal is open', () => {
    const { container } = render(
      <GameScreen
        game={newGame('system-inert')}
        locale="en"
        chronicle={[]}
        onAction={() => undefined}
        onLocaleChange={() => undefined}
      />,
    )

    const shell = container.querySelector('.proto-shell-wrap')
    expect(shell, '.proto-shell-wrap must mount').not.toBeNull()
    expect(shell!.hasAttribute('inert')).toBe(false)

    fireEvent.click(screen.getByRole('button', { name: 'Open Journey journal' }))

    expect(shell!.hasAttribute('inert')).toBe(true)
    for (const selector of ['.topbar', '.stage-notices', '.hud-panel']) {
      const el = container.querySelector(selector)
      if (el !== null) expect(el.hasAttribute('inert'), `${selector} must be inert`).toBe(true)
    }

    const journal = container.querySelector('#journal-screen')
    expect(journal, '#journal-screen must be rendered').not.toBeNull()
    expect(journal!.hasAttribute('inert'), '#journal-screen itself must not be inert').toBe(false)
  })

  it('T-NPC-MODAL-INERT: inerts main.proto-shell and disables background controls when NpcChatModal is open', () => {
    const onAction = vi.fn()
    const { container } = render(
      <GameScreen
        game={newGame('npc-modal-inert')}
        locale="en"
        chronicle={[]}
        onAction={onAction}
        onLocaleChange={() => undefined}
      />,
    )

    const mainShell = container.querySelector('main.proto-shell')
    expect(mainShell, 'main.proto-shell must mount').not.toBeNull()
    expect(mainShell!.hasAttribute('inert'), 'main.proto-shell must not be inert when chat is closed').toBe(false)

    // Open chat modal via debug button or NPC pin
    const debugOpen = screen.getByTestId('debug-open-chat')
    fireEvent.click(debugOpen)

    // Modal is open
    expect(screen.getByRole('dialog', { name: /Chat with/i })).not.toBeNull()
    expect(mainShell!.hasAttribute('inert'), 'main.proto-shell must have inert when chat is open').toBe(true)

    // Background controls inside main.proto-shell cannot receive interactions
    const restChip = container.querySelector('main.proto-shell button[data-chip="rest"]')
    expect(restChip).not.toBeNull()
    fireEvent.click(restChip!)
    expect(onAction).not.toHaveBeenCalled()

    // Map pin cannot be clicked while chat is open
    const mapPin = container.querySelector('main.proto-shell button.pin[data-pin-id]')
    if (mapPin !== null) {
      fireEvent.click(mapPin)
      expect(onAction).not.toHaveBeenCalled()
    }

    // Close modal
    fireEvent.click(screen.getByRole('button', { name: /Close/i }))
    expect(mainShell!.hasAttribute('inert'), 'main.proto-shell must remove inert after closing chat').toBe(false)
  })

  it('T-MODAL-ISOLATION: isolates NpcChatModal clicks, prevents propagation and blocks click-through to underlying tabs and inventory', () => {
    const onAction = vi.fn()
    const game = {
      ...newGame('modal-isolation'),
      inventory: { pill_qi: 5 },
    }
    const { container } = render(
      <GameScreen
        game={game}
        locale="en"
        chronicle={[]}
        onAction={onAction}
        onLocaleChange={() => undefined}
      />,
    )

    const mainShell = container.querySelector('main.proto-shell') as HTMLElement
    const shellWrap = container.querySelector('.proto-shell-wrap') as HTMLElement
    expect(mainShell).not.toBeNull()
    expect(shellWrap).not.toBeNull()

    const itemsTab = container.querySelector('button[data-tab="items"]') as HTMLButtonElement
    const peopleTab = container.querySelector('button[data-tab="people"]') as HTMLButtonElement
    expect(itemsTab).not.toBeNull()
    expect(peopleTab).not.toBeNull()

    // Open chat modal via debug button
    fireEvent.click(screen.getByTestId('debug-open-chat'))

    const modalDialog = container.querySelector('[data-od-id="chat-modal"]')
    expect(modalDialog).not.toBeNull()
    expect(modalDialog!.classList.contains('npc-chat-modal')).toBe(true)

    // Underlying background elements must have inert and pointer-events: none
    expect(mainShell.hasAttribute('inert')).toBe(true)
    expect(mainShell.style.pointerEvents).toBe('none')

    const itemsTabClickListener = vi.fn()
    itemsTab.addEventListener('click', itemsTabClickListener)

    // Dialogue choice button
    const choiceButton = container.querySelector('[data-chat-choice]') as HTMLButtonElement
    expect(choiceButton).not.toBeNull()

    // Click on dialogue choice element
    fireEvent.click(choiceButton)

    // Verify choice click handled dialogue and did not propagate to underlying tab controls or inventory action buttons
    expect(itemsTabClickListener).not.toHaveBeenCalled()
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ kind: 'buy', itemId: 'pill_qi' }))
    expect(onAction).not.toHaveBeenCalledWith(expect.objectContaining({ kind: 'use_item' }))
    expect(container.querySelector('[data-od-id="chat-modal"]')).not.toBeNull()

    // Verify clicking underlying tab while modal is active does not switch active tab
    expect(peopleTab.classList.contains('active')).toBe(true)
    fireEvent.click(itemsTab)
    expect(itemsTab.classList.contains('active')).toBe(false)
    expect(peopleTab.classList.contains('active')).toBe(true)

    // Close chat
    fireEvent.click(screen.getByRole('button', { name: /Close/i }))
    expect(container.querySelector('[data-od-id="chat-modal"]')).toBeNull()

    // Open journal screen
    fireEvent.click(screen.getByRole('button', { name: 'Open Journey journal' }))
    const journalScreen = container.querySelector('#journal-screen') as HTMLElement
    expect(journalScreen).not.toBeNull()
    expect(shellWrap.hasAttribute('inert')).toBe(true)
    expect(shellWrap.style.pointerEvents).toBe('none')

    // Verify clicks inside #journal-screen do not bubble to shellWrap
    const journalClickListener = vi.fn()
    shellWrap.addEventListener('click', journalClickListener)
    fireEvent.click(journalScreen)
    expect(journalClickListener).not.toHaveBeenCalled()
  })

  it('T-STORY-LOOP: social chatter in NpcChatModal dispatches talk and updates affection without opening story-panel', () => {
    window.localStorage.clear()
    render(<App />)
    fireEvent.click(screen.getByTestId('menu-new-game'))
    fireEvent.click(screen.getByTestId('system-tile-sys_battle'))
    fireEvent.click(screen.getByTestId('newgame-confirm'))
    fireEvent.click(screen.getByRole('button', { name: /nhấn|press/i }))

    expect(screen.queryByTestId('narration-panel')).toBeNull()

    // Move from village (3,3) -> (2,3) -> (1,3, exitTo: 'market') where Merchant Bao is located
    fireEvent.keyDown(window, { key: 'ArrowLeft' })
    fireEvent.keyDown(window, { key: 'ArrowLeft' })

    fireEvent.click(screen.getByTestId('debug-open-chat'))
    expect(screen.getByRole('dialog', { name: /Trò chuyện|Chat with/i })).toBeTruthy()
    expect(screen.getByTestId('chat-rapport').textContent).toBe('♥ 0')

    const socialBtn = screen.getByRole('button', { name: /Hỏi thăm tin tức kỳ ngộ/i })
    fireEvent.click(socialBtn)

    expect(screen.getByTestId('chat-rapport').textContent).toBe('♥ 1')
    expect(screen.queryByTestId('narration-panel')).toBeNull()
    expect(screen.getByRole('dialog', { name: /Trò chuyện|Chat with/i })).toBeTruthy()
  })

  it('T-ATTR: unifies attribute names Thân/Tâm/Mị/Vận across ProtoShell HUD and allocation controls', () => {
    const base = newGame('attr-unify')
    const game = { ...base, player: { ...base.player, pendingAttributePoints: 2 } }
    render(
      <GameScreen
        game={game}
        locale="vi"
        chronicle={[]}
        onAction={() => undefined}
        onLocaleChange={() => undefined}
      />,
    )

    // 1. ProtoShell HUD tetragrammaton (.proto-tetragrammaton)
    const tgLabels = Array.from(document.querySelectorAll('.proto-tetragrammaton .proto-tg .lbl')).map(
      (el) => el.textContent?.trim(),
    )
    expect(tgLabels).toContain('Thân')
    expect(tgLabels).toContain('Tâm')
    expect(tgLabels).toContain('Mị')
    expect(tgLabels).toContain('Vận')
    expect(tgLabels).not.toContain('THẦN')
    expect(tgLabels).not.toContain('MẠCH')

    // Check aria-labels on HUD add buttons
    expect(screen.getByRole('button', { name: 'Thêm điểm Thân' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Thêm điểm Tâm' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Thêm điểm Mị' })).toBeTruthy()
    expect(screen.getByRole('button', { name: 'Thêm điểm Vận' })).toBeTruthy()

    // 2. Allocation banner
    const banner = within(screen.getByTestId('attribute-banner'))
    expect(banner.getByRole('button', { name: /Thân/ })).toBeTruthy()
    expect(banner.getByRole('button', { name: /Tâm/ })).toBeTruthy()
    expect(banner.getByRole('button', { name: /Mị/ })).toBeTruthy()
    expect(banner.getByRole('button', { name: /Vận/ })).toBeTruthy()

    // 3. Side allocation panel
    const alloc = within(screen.getByTestId('attribute-allocation'))
    expect(alloc.getByRole('button', { name: /Thân/ })).toBeTruthy()
    expect(alloc.getByRole('button', { name: /Tâm/ })).toBeTruthy()
    expect(alloc.getByRole('button', { name: /Mị/ })).toBeTruthy()
    expect(alloc.getByRole('button', { name: /Vận/ })).toBeTruthy()
  })

  it('T-QUEST-LOC: disables accept button and displays required location badge when player is at wrong location', () => {
    const base = newGame('quest-loc')
    const game = {
      ...base,
      player: { ...base.player, locationId: 'market' },
    }
    const onAction = vi.fn()
    const { rerender } = render(
      <LeftRailTabContent
        tab="quest"
        game={game}
        locale="vi"
        onAction={onAction}
      />,
    )

    // Player is at Chợ Vân Tập ('market'), q_main_letter requires Làng Thanh Mộc ('village')
    const acceptBtn = screen.getByRole('button', { name: /Nhận nhiệm vụ: Lá thư lúc rạng đông/i })
    expect((acceptBtn as HTMLButtonElement).disabled).toBe(true)
    expect(acceptBtn.hasAttribute('disabled')).toBe(true)
    const questItem = acceptBtn.closest('.proto-quest-tab-item') as HTMLElement
    expect(within(questItem).getByText('Cần tới: Làng Thanh Mộc')).toBeTruthy()

    fireEvent.click(acceptBtn)
    expect(onAction).not.toHaveBeenCalled()

    // When player is at Làng Thanh Mộc, accept button is enabled and no badge is shown for q_main_letter
    rerender(
      <LeftRailTabContent
        tab="quest"
        game={{ ...base, player: { ...base.player, locationId: 'village' } }}
        locale="vi"
        onAction={onAction}
      />,
    )
    const enabledBtn = screen.getByRole('button', { name: /Nhận nhiệm vụ: Lá thư lúc rạng đông/i })
    expect((enabledBtn as HTMLButtonElement).disabled).toBe(false)
    expect(enabledBtn.hasAttribute('disabled')).toBe(false)
    const enabledItem = enabledBtn.closest('.proto-quest-tab-item') as HTMLElement
    expect(within(enabledItem).queryByText(/Cần tới:/)).toBeNull()

    // When player is at Vạn Thảo Cốc ('thousand_herbs_valley'), accept button is again disabled with badge
    rerender(
      <LeftRailTabContent
        tab="quest"
        game={{ ...base, player: { ...base.player, locationId: 'thousand_herbs_valley' } }}
        locale="vi"
        onAction={onAction}
      />,
    )
    const valleyBtn = screen.getByRole('button', { name: /Nhận nhiệm vụ: Lá thư lúc rạng đông/i })
    expect((valleyBtn as HTMLButtonElement).disabled).toBe(true)
    expect(valleyBtn.hasAttribute('disabled')).toBe(true)
    const valleyItem = valleyBtn.closest('.proto-quest-tab-item') as HTMLElement
    expect(within(valleyItem).getByText('Cần tới: Làng Thanh Mộc')).toBeTruthy()
  })

  it('T-QUEST-LOC: disables accept button in DockPanelQuests and displays location requirement indicator when player is at wrong location', () => {
    const base = newGame('dock-quest-loc')
    const game = {
      ...base,
      player: { ...base.player, locationId: 'market' },
    }
    const onAction = vi.fn()
    const { rerender } = render(
      <DockPanelQuests
        encounterLocked={false}
        game={game}
        locale="vi"
        onAction={onAction}
      />,
    )

    // Player is at Chợ Vân Tập ('market'), q_main_letter requires Làng Thanh Mộc ('village')
    const acceptBtn = screen.getByRole('button', { name: /Nhận: Lá thư lúc rạng đông/i })
    expect((acceptBtn as HTMLButtonElement).disabled).toBe(true)
    expect(acceptBtn.hasAttribute('disabled')).toBe(true)
    const questItem = acceptBtn.closest('li') as HTMLElement
    expect(within(questItem).getByText('Cần tới: Làng Thanh Mộc')).toBeTruthy()

    fireEvent.click(acceptBtn)
    expect(onAction).not.toHaveBeenCalled()

    // When player is at Làng Thanh Mộc, accept button is enabled and no badge is shown for q_main_letter
    rerender(
      <DockPanelQuests
        encounterLocked={false}
        game={{ ...base, player: { ...base.player, locationId: 'village' } }}
        locale="vi"
        onAction={onAction}
      />,
    )
    const enabledBtn = screen.getByRole('button', { name: /Nhận: Lá thư lúc rạng đông/i })
    expect((enabledBtn as HTMLButtonElement).disabled).toBe(false)
    expect(enabledBtn.hasAttribute('disabled')).toBe(false)
    const enabledItem = enabledBtn.closest('li') as HTMLElement
    expect(within(enabledItem).queryByText(/Cần tới:/)).toBeNull()
  })

  it('T-TALK-LABEL: renders accessible distinct aria-labels for all Talk buttons in PeopleDockPanel', () => {
    const marketNpcs = NPCS.filter((npc) => npc.locationId === 'market')
    expect(marketNpcs.length).toBeGreaterThan(1)

    const base = newGame('talk-label-test')
    const game = {
      ...base,
      player: { ...base.player, locationId: 'market' },
    }

    // 1. Vietnamese locale
    const { rerender } = render(
      <PeopleDockPanel
        actionKind={null}
        encounterLocked={false}
        game={game}
        locale="vi"
        onAction={() => undefined}
        onCloseJournal={() => undefined}
      />,
    )

    const viButtons = screen.getAllByRole('button', { name: /^Nói chuyện với / })
    expect(viButtons).toHaveLength(marketNpcs.length)
    const viLabels = viButtons.map((btn) => btn.getAttribute('aria-label'))
    expect(new Set(viLabels).size).toBe(marketNpcs.length)
    for (const npc of marketNpcs) {
      expect(viLabels).toContain(`Nói chuyện với ${npc.nameVi}`)
    }

    // 2. English locale
    rerender(
      <PeopleDockPanel
        actionKind={null}
        encounterLocked={false}
        game={game}
        locale="en"
        onAction={() => undefined}
        onCloseJournal={() => undefined}
      />,
    )

    const enButtons = screen.getAllByRole('button', { name: /^Talk to / })
    expect(enButtons).toHaveLength(marketNpcs.length)
    const enLabels = enButtons.map((btn) => btn.getAttribute('aria-label'))
    expect(new Set(enLabels).size).toBe(marketNpcs.length)
    for (const npc of marketNpcs) {
      expect(enLabels).toContain(`Talk to ${npc.nameEn}`)
    }
  })

  it('T-STORY-COMBAT-POPUP: combat victory advancing milestone beat does not force-open story modal with unmet route prerequisites', () => {
    window.localStorage.clear()
    const storage = {
      get: (key: string) => window.localStorage.getItem(key),
      set: (key: string, value: string) => window.localStorage.setItem(key, value),
      remove: (key: string) => window.localStorage.removeItem(key),
    }
    const base = newGame('combat-popup-guard')
    const session: GameSession = {
      game: {
        ...base,
        player: {
          ...base.player,
          locationId: 'misty_forest',
          posX: 3,
          posY: 4,
          hp: 50,
          qi: 50,
        },
        encounter: {
          enemyId: 'mist_boar',
          hp: 1,
          maxHp: 32,
          guard: 0,
        },
        flags: {
          ...base.flags,
          movedOnce: true,
          story_scene: 'village_vow',
          story_route: 'mercy',
        },
      },
      locale: 'vi',
      chronicle: [],
      chronicleKinds: [],
    }
    saveSlot(storage, 1, session)
    setActiveSlot(storage, 1)

    expect(currentBeat(session.game).chapter).toBe(1)

    render(<App />)
    fireEvent.click(screen.getByRole('button', { name: /Màn hình tải|nhấn để bắt đầu|press to start/i }))
    expect(screen.queryByTestId('narration-panel')).toBeNull()

    const strikeBtn = screen.getByTestId('combat-attack')
    fireEvent.click(strikeBtn)

    expect(screen.queryByTestId('narration-panel')).toBeNull()
  })

  it('T-ACHIEVE-PROGRESS: renders achievements as interactive keyboard-focusable buttons with unlock criteria and quantitative progress', () => {
    const onAction = vi.fn()
    const base = newGame('achieve-progress-test')
    const game = {
      ...base,
      player: {
        ...base.player,
        gold: 150,
        stage: 1,
      },
      flags: {
        ...base.flags,
        moveCount: 2,
        gatherCount: 7,
        aff_n_elder_meihua: 1,
        aff_n_guard_truong: 1,
        aff_n_kid_xiaobao: 1,
      },
      achievements: ['first_step'],
    }

    const { container, rerender } = render(
      <DockPanelMarket
        actionKind={null}
        encounterLocked={false}
        entries={[]}
        game={game}
        locale="vi"
        onAction={onAction}
        unlockedAchievementIds={['first_purchase']}
      />,
    )

    // Verify .achievements container precedes .refinement-list in DOM order (above the fold)
    const achievementsContainer = container.querySelector('.achievements')
    const refinementList = container.querySelector('.refinement-list')
    expect(achievementsContainer).not.toBeNull()
    expect(refinementList).not.toBeNull()
    expect(
      Boolean(achievementsContainer!.compareDocumentPosition(refinementList!) & Node.DOCUMENT_POSITION_FOLLOWING),
      '.achievements container must precede .refinement-list in DOM order',
    ).toBe(true)

    const achievementButtons = container.querySelectorAll('.achievements button.achievement-badge')
    expect(achievementButtons.length).toBe(ACHIEVEMENTS.length)

    // No static spans as achievement root items
    const staticSpans = container.querySelectorAll('.achievements > span')
    expect(staticSpans.length).toBe(0)

    // 1. Check first_step (unlocked in current run): full progress, has seal, unlocked class
    const firstStepBtn = Array.from(achievementButtons).find((b) =>
      b.getAttribute('aria-label')?.includes('Bước đầu tiên'),
    ) as HTMLButtonElement
    expect(firstStepBtn).toBeDefined()
    expect(firstStepBtn.className).toContain('unlocked')
    expect(firstStepBtn.querySelector('[data-testid="achievement-seal"]')?.textContent).toBe('成')
    expect(firstStepBtn.getAttribute('aria-label')).toContain('Đi ba chặng đường, rời khỏi làng.')
    expect(firstStepBtn.getAttribute('aria-label')).toContain('3/3 chặng đường')
    expect(within(firstStepBtn).getByText('3/3 chặng đường')).toBeTruthy()

    // 2. Check green_thumb (in-progress: 7/10 herbs): criteria, quantitative progress, progress bar
    const greenThumbBtn = Array.from(achievementButtons).find((b) =>
      b.getAttribute('aria-label')?.includes('Bàn tay xanh'),
    ) as HTMLButtonElement
    expect(greenThumbBtn).toBeDefined()
    expect(greenThumbBtn.getAttribute('aria-label')).toContain('Hái được mười linh thảo.')
    expect(greenThumbBtn.getAttribute('aria-label')).toContain('7/10 thảo dược')
    expect(within(greenThumbBtn).getByText('7/10 thảo dược')).toBeTruthy()
    const greenProgressBar = greenThumbBtn.querySelector('.achievement-progress-fill') as HTMLElement
    expect(greenProgressBar).toBeDefined()
    expect(greenProgressBar.style.width).toBe('70%')

    // 3. Check socialite (in-progress: 3/5 NPCs): 3 distinct aff_* flags
    const socialiteBtn = Array.from(achievementButtons).find((b) =>
      b.getAttribute('aria-label')?.includes('Duyên rộng tình sâu'),
    ) as HTMLButtonElement
    expect(socialiteBtn).toBeDefined()
    expect(socialiteBtn.getAttribute('aria-label')).toContain('Nói chuyện với năm người khác nhau.')
    expect(socialiteBtn.getAttribute('aria-label')).toContain('3/5 nhân vật')
    expect(within(socialiteBtn).getByText('3/5 nhân vật')).toBeTruthy()

    // 4. Check wealthy (in-progress: 150/400 gold)
    const wealthyBtn = Array.from(achievementButtons).find((b) =>
      b.getAttribute('aria-label')?.includes('Túi đầy tiếng chuông'),
    ) as HTMLButtonElement
    expect(wealthyBtn).toBeDefined()
    expect(wealthyBtn.getAttribute('aria-label')).toContain('Giữ ít nhất 400 lượng.')
    expect(wealthyBtn.getAttribute('aria-label')).toContain('150/400 lượng vàng')
    expect(within(wealthyBtn).getByText('150/400 lượng vàng')).toBeTruthy()

    // 5. Check first_purchase (past-life unlocked): has is-past-life class and seal
    const firstPurchaseBtn = Array.from(achievementButtons).find((b) =>
      b.getAttribute('aria-label')?.includes('Vé đầu tiên'),
    ) as HTMLButtonElement
    expect(firstPurchaseBtn).toBeDefined()
    expect(firstPurchaseBtn.className).toContain('is-past-life')
    expect(firstPurchaseBtn.querySelector('[data-testid="achievement-seal"]')?.textContent).toBe('成')

    // 6. Keyboard focusability
    greenThumbBtn.focus()
    expect(document.activeElement).toBe(greenThumbBtn)

    // 7. Interactive toggle on click / activation
    expect(greenThumbBtn.getAttribute('aria-expanded')).toBe('false')
    fireEvent.click(greenThumbBtn)
    expect(greenThumbBtn.getAttribute('aria-expanded')).toBe('true')
    expect(greenThumbBtn.className).toContain('is-expanded')
    // Click again collapses
    fireEvent.click(greenThumbBtn)
    expect(greenThumbBtn.getAttribute('aria-expanded')).toBe('false')

    // 8. English locale support
    rerender(
      <DockPanelMarket
        actionKind={null}
        encounterLocked={false}
        entries={[]}
        game={game}
        locale="en"
        onAction={onAction}
        unlockedAchievementIds={['first_purchase']}
      />,
    )

    const enButtons = container.querySelectorAll('.achievements button.achievement-badge')
    const enGreenThumb = Array.from(enButtons).find((b) =>
      b.getAttribute('aria-label')?.includes('Green Thumb'),
    ) as HTMLButtonElement
    expect(enGreenThumb).toBeDefined()
    expect(enGreenThumb.getAttribute('aria-label')).toContain('Gather ten spirit herbs.')
    expect(enGreenThumb.getAttribute('aria-label')).toContain('7/10 herbs')
    expect(within(enGreenThumb).getByText('7/10 herbs')).toBeTruthy()
  })

  it('T-POST-COMBAT-GUARD: suppresses clicks on underlying NPC pins immediately after combat overlay unmount', async () => {
    const onAction = vi.fn()
    const base = newGame('post-combat-guard')
    const gameWithEncounter = {
      ...base,
      player: {
        ...base.player,
        locationId: 'village',
        posX: 3,
        posY: 3,
      },
      encounter: {
        enemyId: 'mist_boar',
        hp: 1,
        maxHp: 32,
        guard: 0,
      },
    }

    const { container, rerender } = render(
      <ProtoShell
        game={gameWithEncounter}
        locale="en"
        chronicle={[]}
        onAction={onAction}
        onLocaleChange={() => undefined}
      />,
    )

    // Verify combat overlay is mounted
    expect(screen.getByTestId('proto-combat')).not.toBeNull()

    // Simulate defeating enemy: encounter resolves to null
    const gameResolved = {
      ...gameWithEncounter,
      encounter: null,
    }

    rerender(
      <ProtoShell
        game={gameResolved}
        locale="en"
        chronicle={['Beast defeated.']}
        onAction={onAction}
        onLocaleChange={() => undefined}
      />,
    )

    // Combat overlay unmounted
    expect(screen.queryByTestId('proto-combat')).toBeNull()

    // Find underlying NPC pin on the map
    const npcPin = screen.getAllByRole('button', { name: /^Talk to /i })[0]!
    expect(npcPin).not.toBeNull()

    // Immediately simulate click on NPC pin within 200ms
    fireEvent.click(npcPin)

    // Assert chatNpcId remains null and NpcChatModal is not mounted
    expect(screen.queryByRole('dialog', { name: /Chat with|Trò chuyện/i })).toBeNull()

    // Also assert map cell travel pins do not dispatch move actions during cooldown
    const travelPin = container.querySelector('button.pin[data-pin-walkable]')
    if (travelPin !== null) {
      fireEvent.click(travelPin)
      expect(onAction).not.toHaveBeenCalled()
    }

    // After cooldown (>400ms), click on NPC pin successfully opens chat
    await new Promise((resolve) => setTimeout(resolve, 450))
    fireEvent.click(npcPin)
    expect(screen.getByRole('dialog', { name: /Chat with|Trò chuyện/i })).not.toBeNull()
  })

  it('T-ITEM-POPOVER: popover dismiss backdrop catches outside clicks without blocking adjacent equipment grid slot clicks', () => {
    const onAction = vi.fn()
    const base = newGame('item-popover-test')
    const game = {
      ...base,
      inventory: {
        spirit_herb: 5,
        bamboo_saber: 1,
      },
    }

    render(
      <LeftRailTabContent
        tab="items"
        game={game}
        locale="vi"
        onAction={onAction}
      />,
    )

    // Find slots in inventory
    const herbSlot = screen.getByRole('gridcell', { name: /Linh thảo/i })
    const saberSlot = screen.getByRole('gridcell', { name: /Trúc đao thanh mộc/i })

    expect(herbSlot).not.toBeNull()
    expect(saberSlot).not.toBeNull()

    // 1. Hover/enter on herb opens popover
    fireEvent.mouseEnter(herbSlot)
    const popover = screen.getByTestId('item-info-popover')
    expect(popover).not.toBeNull()
    expect(within(popover).getByText(/Linh thảo/i)).not.toBeNull()

    const backdrop = screen.getByTestId('item-popover-backdrop')
    expect(backdrop).not.toBeNull()

    // 2. Click adjacent equipment slot (Trúc đao thanh mộc) while popover is open
    // This should close the popover (click outside) AND trigger equip_item action
    fireEvent.click(saberSlot)

    // 3. Verify click event is received and triggers equipping
    expect(onAction).toHaveBeenCalledWith({ kind: 'equip_item', itemId: 'bamboo_saber' })

    // 4. Popover should be closed after clicking outside
    expect(screen.queryByTestId('item-info-popover')).toBeNull()
    // backdrop is removed when popover closes (tied to hovered state)
    expect(screen.queryByTestId('item-popover-backdrop')).toBeNull()
  })

  it('T-SECT-COMBAT-AFFORDANCE: does not render data-chip="fight" when location only has arena opponents', () => {
    const onAction = vi.fn()
    const base = newGame('sect-combat-affordance')
    const sectGame = {
      ...base,
      player: {
        ...base.player,
        locationId: 'sect',
      },
    }

    // Verify reducer rejects start_encounter at sect with NOT_AT_LOCATION
    const reducerResult = applyAction(sectGame, { kind: 'start_encounter' })
    expect(reducerResult.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ type: 'ERROR', code: 'NOT_AT_LOCATION' }),
      ]),
    )

    const { container, rerender } = render(
      <ProtoShell
        game={sectGame}
        locale="vi"
        chronicle={[]}
        onAction={onAction}
        onLocaleChange={() => undefined}
      />,
    )

    // At sect (only arena opponents), data-chip="fight" must not be rendered
    expect(container.querySelector('[data-chip="fight"]')).toBeNull()
    expect(screen.queryByRole('button', { name: /Giao chiến/i })).toBeNull()

    // When moving to a location with wild enemies (e.g. misty_forest), data-chip="fight" is rendered
    const forestGame = {
      ...base,
      player: {
        ...base.player,
        locationId: 'misty_forest',
      },
    }
    rerender(
      <ProtoShell
        game={forestGame}
        locale="vi"
        chronicle={[]}
        onAction={onAction}
        onLocaleChange={() => undefined}
      />,
    )
    expect(container.querySelector('[data-chip="fight"]')).not.toBeNull()
    expect(screen.getByRole('button', { name: /Giao chiến/i })).not.toBeNull()
  })
})

describe('T-QUEST-HUD: DockPanelQuests displays active quest step description', () => {
  it('renders quest.steps[currentStepIndex].descVi for active quests', () => {
    const onAction = vi.fn()
    const base = newGame('dock-quest-step-test')
    const game = {
      ...base,
      quests: {
        q_main_letter: { status: 'active' as const, step: 0 },
      } as Record<string, QuestRuntime>,
    }

    const { container } = render(
      <DockPanelQuests
        encounterLocked={false}
        game={game}
        locale="vi"
        onAction={onAction}
      />,
    )

    const questItem = container.querySelector('.quest-active')
    expect(questItem).toBeTruthy()
    const stepElement = questItem?.querySelector('.quest-step')
    expect(stepElement).toBeTruthy()
    expect(stepElement?.textContent).toBe('Nói chuyện với cụ Mai Hoa về lá thư.')
  })

  it('updates step description when quest advances to next step', () => {
    const onAction = vi.fn()
    const base = newGame('dock-quest-step-test-2')
    // Quest at step 1 (after completing step 0)
    const game = {
      ...base,
      player: { ...base.player, locationId: 'village' },
      flags: { ...base.flags, talk_n_elder_meihua: true },
      quests: {
        q_main_letter: { status: 'active' as const, step: 1 },
      } as Record<string, QuestRuntime>,
    }

    const { container } = render(
      <DockPanelQuests
        encounterLocked={false}
        game={game}
        locale="vi"
        onAction={onAction}
      />,
    )

    const questItem = container.querySelector('.quest-active')
    expect(questItem).toBeTruthy()
    const stepElement = questItem?.querySelector('.quest-step')
    expect(stepElement).toBeTruthy()
    expect(stepElement?.textContent).toBe('Trở lại gặp cụ Mai Hoa.')
  })
})
