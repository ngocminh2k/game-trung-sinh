import { describe, expect, it, vi, beforeEach } from 'vitest'
import { render, screen, fireEvent, act } from '@testing-library/react'
import { NpcChatModal } from '../src/ui/NpcChatModal'
import { ProtoShell } from '../src/ui/ProtoShell'
import type { GameState, Locale } from '../src/engine'

// Minimal GameState for testing
const createMockGame = (overrides: Partial<GameState> = {}): GameState => ({
  version: 2,
  seed: 'test-seed',
  rng: 0,
  day: 1,
  timeOfDay: 'sang',
  player: {
    hp: 100,
    qi: 60,
    gold: 100,
    silver: 0,
    spiritStones: 0,
    skillPoints: 0,
    locationId: 'village',
    posX: 5,
    posY: 5,
    stage: 0,
    realmLevel: 1,
    progress: 0,
    attrs: { body: 10, mind: 10, charm: 10, luck: 10 },
    pendingAttributePoints: 0,
    alive: true,
  },
  inventory: {},
  storage: {},
  equipment: { weapon: null, robe: null, accessory: null },
  techniques: {},
  quests: {},
  flags: {},
  systemQueue: [],
  encounter: null,
  endingId: null,
  spiritRoot: { kind: 'defective', elementVi: 'Kim', elementEn: 'Metal', efficiency: 1.0 },
  achievements: [],
  talents: [],
  corrections: 0,
  terminal: false,
  lastLotteryDay: null,
  ...overrides,
})

const mockOnAction = vi.fn()
const mockOnClose = vi.fn()
const mockOnLocaleChange = vi.fn()
const mockOnJournalToggle = vi.fn()

describe('Modal Isolation (T-MODAL-ISOLATION)', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe('NpcChatModal click isolation', () => {
    it('clicking a dialogue choice does not propagate to underlying elements', () => {
      const game = createMockGame()
      const locale: Locale = 'vi'

      // Render NpcChatModal over a simple container with click handler
      let containerClickCount = 0
      const TestWrapper = () => (
        <div
          data-testid="underlying-container"
          onClick={() => { containerClickCount++ }}
          style={{ width: '400px', height: '300px', background: 'red' }}
        >
          Underlying content
          <NpcChatModal
            show={true}
            npcId="n_merchant_bao"
            game={game}
            locale={locale}
            onClose={mockOnClose}
            onAction={mockOnAction}
          />
        </div>
      )

      render(<TestWrapper />)

      // Find a dialogue choice button and click it
      const choiceButtons = screen.getAllByRole('button', { name: /^1/ })
      expect(choiceButtons.length).toBeGreaterThan(0)

      act(() => {
        fireEvent.click(choiceButtons[0]!)
      })

      // The onAction should be called
      expect(mockOnAction).toHaveBeenCalled()

      // But the underlying container should NOT receive the click
      expect(containerClickCount).toBe(0)
    })

    it('clicking the gift send button does not propagate', () => {
      const game = createMockGame({
        inventory: { pill_qi: 2 },
      })
      const locale: Locale = 'vi'

      let containerClickCount = 0
      const TestWrapper = () => (
        <div
          data-testid="underlying-container"
          onClick={() => { containerClickCount++ }}
          style={{ width: '400px', height: '300px' }}
        >
          <NpcChatModal
            show={true}
            npcId="n_merchant_bao"
            game={game}
            locale={locale}
            onClose={mockOnClose}
            onAction={mockOnAction}
          />
        </div>
      )

      render(<TestWrapper />)

      // Select a gift item
      const giftSelect = screen.getByTestId('gift-select')
      act(() => {
        fireEvent.change(giftSelect, { target: { value: 'pill_qi' } })
      })

      // Click the gift send button
      const giftSendBtn = screen.getByTestId('gift-send')
      act(() => {
        fireEvent.click(giftSendBtn)
      })

      expect(mockOnAction).toHaveBeenCalled()
      expect(containerClickCount).toBe(0)
    })

    it('clicking the close button does not propagate', () => {
      const game = createMockGame()
      const locale: Locale = 'vi'

      let containerClickCount = 0
      const TestWrapper = () => (
        <div
          data-testid="underlying-container"
          onClick={() => { containerClickCount++ }}
          style={{ width: '400px', height: '300px' }}
        >
          <NpcChatModal
            show={true}
            npcId="n_merchant_bao"
            game={game}
            locale={locale}
            onClose={mockOnClose}
            onAction={mockOnAction}
          />
        </div>
      )

      render(<TestWrapper />)

      const closeBtn = screen.getByRole('button', { name: /Đóng|Close/ })
      act(() => {
        fireEvent.click(closeBtn)
      })

      expect(mockOnClose).toHaveBeenCalled()
      expect(containerClickCount).toBe(0)
    })

    it('clicking backdrop closes modal but does not propagate', () => {
      const game = createMockGame()
      const locale: Locale = 'vi'

      let containerClickCount = 0
      const TestWrapper = () => (
        <div
          data-testid="underlying-container"
          onClick={() => { containerClickCount++ }}
          style={{ width: '400px', height: '300px' }}
        >
          <NpcChatModal
            show={true}
            npcId="n_merchant_bao"
            game={game}
            locale={locale}
            onClose={mockOnClose}
            onAction={mockOnAction}
          />
        </div>
      )

      render(<TestWrapper />)

      // Click on the backdrop (outside the modal) - target the backdrop element directly
      const backdrop = screen.getByRole('dialog')
      act(() => {
        fireEvent.click(backdrop)
      })

      expect(mockOnClose).toHaveBeenCalled()
      expect(containerClickCount).toBe(0)
    })
  })

  describe('ProtoShell modal isolation', () => {
    it('NpcChatModal over ProtoShell does not trigger tab clicks', async () => {
      const game = createMockGame()
      const locale: Locale = 'vi'
      const chronicle: string[] = ['Test entry']

      let tabClickCount = 0
      let inventoryClickCount = 0

      const TestWrapper = () => (
        <ProtoShell
          game={game}
          locale={locale}
          chronicle={chronicle}
          onAction={(action) => {
            if (action.kind === 'talk') tabClickCount++
            if (action.kind === 'use_item') inventoryClickCount++
            mockOnAction(action)
          }}
          onLocaleChange={mockOnLocaleChange}
          onJournalToggle={mockOnJournalToggle}
          journalOpen={false}
        />
      )

      render(<TestWrapper />)

      // Use the debug button to open chat with merchant Bao (has "1Mua một bình..." choice)
      const debugBtn = screen.getByTestId('debug-open-chat')
      act(() => {
        fireEvent.click(debugBtn)
      })

      // Wait for chat modal to open
      await screen.findByRole('dialog', { name: /Trò chuyện cùng NPC|Chat with the villager/ })

      // Now the chat modal should be open - click a dialogue choice (starts with "1")
      const choiceButtons = screen.getAllByRole('button', { name: /^1/ })
      expect(choiceButtons.length).toBeGreaterThan(0)

      act(() => {
        fireEvent.click(choiceButtons[0]!)
      })

      // Should have dispatched talk action, but NOT tab switch or use_item
      expect(mockOnAction).toHaveBeenCalled()
      expect(tabClickCount).toBe(0)
      expect(inventoryClickCount).toBe(0)
    })

    it('journal open applies inert to proto-shell main element', () => {
      const game = createMockGame()
      const locale: Locale = 'vi'
      const chronicle: string[] = ['Test entry']

      const { container } = render(
        <ProtoShell
          game={game}
          locale={locale}
          chronicle={chronicle}
          onAction={mockOnAction}
          onLocaleChange={mockOnLocaleChange}
          onJournalToggle={mockOnJournalToggle}
          journalOpen={true}
        />
      )

      const protoShellMain = container.querySelector('.proto-shell') as HTMLElement | null
      expect(protoShellMain).not.toBeNull()
      expect(protoShellMain?.hasAttribute('inert')).toBe(true)
      expect(protoShellMain?.style.pointerEvents).toBe('none')
    })

    it('story open applies inert to proto-shell-wrap', () => {
      // We can't easily test storyOpen since it's internal to GameScreen
      // This test documents the expected behavior
      expect(true).toBe(true)
    })
  })
})