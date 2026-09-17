// T5 (LEDGER "social chatter never dispatches talk"): a plain social choice in
// the chat modal must reach the engine as { kind: 'talk' } — doTalk is what
// moves ♥. Authored per-choice bonuses (buy / move / learn) must still win.
// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { useState } from 'react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { applyAction, getAffection, type Action, type GameState } from '../src/engine'
import { NpcChatModal } from '../src/ui/NpcChatModal'
import { navTo, newGame } from './test-utils'

const noop = (): undefined => undefined
const SOCIAL = 'Hỏi thăm tin tức kỳ ngộ gần đây.' // merchant start, no action
const BUY = 'Mua một bình — đang cần để tu luyện.' // merchant start, action: buy

afterEach(() => cleanup())

describe('T5: social chat choices dispatch talk', () => {
  it('dispatches { kind: talk } for a choice that carries no action', () => {
    const onAction = vi.fn()
    render(<NpcChatModal show npcId="n_merchant_bao" game={newGame('t5-plain')} locale="vi" onClose={noop} onAction={onAction} />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(SOCIAL) }))
    expect(onAction).toHaveBeenCalledWith({ kind: 'talk', npcId: 'n_merchant_bao' })
  })

  it('keeps the authored action when the choice carries one', () => {
    const onAction = vi.fn()
    render(<NpcChatModal show npcId="n_merchant_bao" game={newGame('t5-buy')} locale="vi" onClose={noop} onAction={onAction} />)
    fireEvent.click(screen.getByRole('button', { name: new RegExp(BUY) }))
    expect(onAction).toHaveBeenCalledWith({ kind: 'buy', itemId: 'pill_qi', qty: 1 })
    expect(onAction).not.toHaveBeenCalledWith({ kind: 'talk', npcId: 'n_merchant_bao' })
  })

  it('re-renders ♥ with the new affection once the talk reaches the engine', () => {
    // The player must be where the merchant is, or doTalk refuses NPC_NOT_HERE.
    const game = navTo(newGame('t5-heart'), 'market')

    function Harness({ initial }: { initial: GameState }) {
      const [state, setState] = useState(initial)
      return (
        <NpcChatModal
          show
          npcId="n_merchant_bao"
          game={state}
          locale="vi"
          onClose={noop}
          onAction={(action: Action) => setState((prev) => applyAction(prev, action).state)}
        />
      )
    }
    render(<Harness initial={game} />)
    expect(screen.getByTestId('chat-rapport').textContent).toBe('♥ 0')
    fireEvent.click(screen.getByRole('button', { name: new RegExp(SOCIAL) }))
    expect(screen.getByTestId('chat-rapport').textContent).toBe('♥ 1')
  })
})

describe('T5: the engine delta the modal now triggers', () => {
  it('a talk action raises affection by the authored step', () => {
    const game = navTo(newGame('t5-delta'), 'market')
    const before = getAffection(game, 'n_merchant_bao')
    const after = applyAction(game, { kind: 'talk', npcId: 'n_merchant_bao' }).state
    expect(getAffection(after, 'n_merchant_bao')).toBe(before + 1)
  })
})
