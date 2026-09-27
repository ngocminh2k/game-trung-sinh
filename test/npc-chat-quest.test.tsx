// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { QUESTS } from '../src/content'
import { newGame } from '../src/engine'
import type { GameState } from '../src/engine/types'
import { NpcChatModal } from '../src/ui/NpcChatModal'

const noop = (): undefined => undefined
const herbQuest = QUESTS.find((q) => q.id === 'q_herb_delivery')!

afterEach(() => cleanup())

describe('NpcChatModal — Quest Integration in NPC Dialogue', () => {
  it('offers [Nhận nhiệm vụ] choice when an NPC has an available quest', () => {
    const onAction = vi.fn()
    const game = newGame('test-npc-quest-accept')
    // Player is at village, where n_elder_meihua is located, q_herb_delivery is available
    render(
      <NpcChatModal
        show
        npcId="n_elder_meihua"
        game={game}
        locale="vi"
        onClose={noop}
        onAction={onAction}
      />
    )

    const acceptBtn = screen.getByRole('button', { name: new RegExp(`\\[Nhận nhiệm vụ\\] ${herbQuest.nameVi}`) })
    expect(acceptBtn).toBeTruthy()

    fireEvent.click(acceptBtn)
    expect(onAction).toHaveBeenCalledWith({ kind: 'accept_quest', questId: 'q_herb_delivery' })
  })

  it('offers bilingual [Accept quest] in English mode', () => {
    const onAction = vi.fn()
    const game = newGame('test-npc-quest-accept-en')
    render(
      <NpcChatModal
        show
        npcId="n_elder_meihua"
        game={game}
        locale="en"
        onClose={noop}
        onAction={onAction}
      />
    )

    const acceptBtn = screen.getByRole('button', { name: new RegExp(`\\[Accept quest\\] ${herbQuest.nameEn}`) })
    expect(acceptBtn).toBeTruthy()
  })

  it('offers [Nộp nhiệm vụ] choice when quest turn-in is ready at the NPC', () => {
    const onAction = vi.fn()
    const base = newGame('test-npc-quest-turnin')
    // Setup state where quest is active and ready for turn in:
    // q_herb_delivery step 0 requires 3 spirit herbs, step 1 is turnIn
    const game: GameState = {
      ...base,
      inventory: { spirit_herb: 3 },
      quests: {
        q_herb_delivery: { status: 'active', step: 1 },
      },
    }

    render(
      <NpcChatModal
        show
        npcId="n_elder_meihua"
        game={game}
        locale="vi"
        onClose={noop}
        onAction={onAction}
      />
    )

    const turnInBtn = screen.getByRole('button', { name: new RegExp(`\\[Nộp nhiệm vụ\\] ${herbQuest.nameVi}`) })
    expect(turnInBtn).toBeTruthy()

    fireEvent.click(turnInBtn)
    expect(onAction).toHaveBeenCalledWith({ kind: 'complete_quest', questId: 'q_herb_delivery' })
  })

  it('transitions to quest acknowledgement node without softlock when quest is accepted', () => {
    vi.useFakeTimers()
    const base = newGame('test-npc-quest-lifecycle')
    let currentGame: GameState = base
    const onAction = vi.fn((action) => {
      if (action.kind === 'accept_quest') {
        currentGame = {
          ...currentGame,
          quests: {
            ...currentGame.quests,
            [action.questId]: { status: 'active', step: 0 },
          },
        }
      }
    })

    const { rerender } = render(
      <NpcChatModal
        show
        npcId="n_elder_meihua"
        game={currentGame}
        locale="vi"
        onClose={noop}
        onAction={onAction}
      />
    )

    const acceptBtn = screen.getByRole('button', { name: new RegExp(`\\[Nhận nhiệm vụ\\] ${herbQuest.nameVi}`) })
    fireEvent.click(acceptBtn)
    expect(onAction).toHaveBeenCalledWith({ kind: 'accept_quest', questId: 'q_herb_delivery' })

    // Simulate parent re-rendering with updated game state
    rerender(
      <NpcChatModal
        show
        npcId="n_elder_meihua"
        game={currentGame}
        locale="vi"
        onClose={noop}
        onAction={onAction}
      />
    )

    // Advance past choice transition timer (520ms) and unlock timer (1800ms)
    act(() => {
      vi.advanceTimersByTime(2500)
    })

    // Verify follow-up choice button exists and is clickable without softlocking
    const farewellBtn = screen.getByRole('button', { name: /Ta sẽ đi làm ngay/ })
    expect(farewellBtn).toBeTruthy()
    act(() => {
      fireEvent.click(farewellBtn)
    })

    vi.useRealTimers()
  })
})
