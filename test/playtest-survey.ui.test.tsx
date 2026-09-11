// @vitest-environment jsdom
import { cleanup, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { newGame } from '../src/engine/constants'
import { PlaytestSurveyCard } from '../src/ui/PlaytestSurveyCard'

// Issue #20 — the post-ending feedback prompt. It must collect the three
// Likert rows plus an optional note, hand back a survey joined to its run id,
// and stay dismissible so it never blocks restart.

afterEach(() => cleanup())

function renderCard(onSubmit = vi.fn()) {
  const game = { ...newGame('pt-card'), terminal: true, endingId: 'quiet_harmony' }
  render(<PlaytestSurveyCard game={game} locale="vi" runId="pt-run-1" onSubmit={onSubmit} />)
  return { game, onSubmit }
}

describe('PlaytestSurveyCard', () => {
  it('submits a survey carrying the run id and ending of the journey it joins', () => {
    const { game, onSubmit } = renderCard()

    fireEvent.click(screen.getByRole('button', { name: /Gửi ấn tượng/ }))

    expect(onSubmit).toHaveBeenCalledWith({
      version: 1,
      runId: 'pt-run-1',
      day: game.day,
      endingId: 'quiet_harmony',
      clarity: 3,
      agency: 3,
      pressure: 3,
      note: '',
    })
  })

  it('captures slider and note input into the submitted survey', () => {
    const { onSubmit } = renderCard()
    const sliders = screen.getAllByRole('slider')

    fireEvent.change(sliders[2]!, { target: { value: '5' } })
    fireEvent.change(screen.getByRole('textbox'), { target: { value: 'Linh căn phế rất hợp.' } })
    fireEvent.click(screen.getByRole('button', { name: /Gửi ấn tượng/ }))

    expect(onSubmit.mock.calls[0]![0]).toMatchObject({ pressure: 5, note: 'Linh căn phế rất hợp.' })
  })

  it('thanks then removes itself, and skip never calls onSubmit', () => {
    const { onSubmit } = renderCard()

    fireEvent.click(screen.getByRole('button', { name: /Gửi ấn tượng/ }))
    expect(screen.getByRole('status').textContent).toMatch(/Tạ ơn/)
    // Both buttons are gone — the card is spent and cannot double-report.
    expect(screen.queryByRole('button', { name: /Gửi ấn tượng/ })).toBeNull()
    expect(screen.queryByRole('button', { name: /Bỏ qua/ })).toBeNull()
    expect(onSubmit).toHaveBeenCalledTimes(1)

    const skipped = renderCard()
    fireEvent.click(screen.getByRole('button', { name: /Bỏ qua/ }))
    expect(skipped.onSubmit).not.toHaveBeenCalled()
    expect(screen.queryByRole('button', { name: /Bỏ qua/ })).toBeNull()
  })
})
