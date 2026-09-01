// @vitest-environment jsdom
import { act, cleanup, fireEvent, render, screen, waitFor } from '@testing-library/react'
import { afterEach, describe, expect, it, vi } from 'vitest'
import type { Action } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'
import { newGame } from './test-utils'

afterEach(() => {
  cleanup()
  vi.unstubAllEnvs()
  vi.unstubAllGlobals()
})

function renderScreen(onAction: (action: Action) => void) {
  return render(
    <GameScreen
      actionNonce={1}
      chronicle={[]}
      game={newGame('ai-ui')}
      locale="vi"
      onAction={onAction}
      onLocaleChange={() => undefined}
      storyOpen
    />,
  )
}

function submitButton(): HTMLButtonElement {
  return screen.getByRole('button', { name: /Thử vận|Đang lắng nghe…/ }) as HTMLButtonElement
}

function typeAndSubmit(utterance: string): void {
  fireEvent.change(screen.getByLabelText('Viết hành động khác'), { target: { value: utterance } })
  fireEvent.click(submitButton())
}

describe('AI suggestion UI states', () => {
  it('shows a loading state, then a status line and the suggested choice', async () => {
    vi.stubEnv('VITE_AI_NARRATION_ENABLED', 'true')
    let resolveFetch: (value: unknown) => void = () => undefined
    vi.stubGlobal('fetch', vi.fn().mockReturnValue(new Promise((resolve) => { resolveFetch = resolve })))

    const actions: Action[] = []
    renderScreen((action) => actions.push(action))

    typeAndSubmit('ta sẽ trả lại cây trâm')
    // While waiting: the button is busy and shows the loading label.
    expect(submitButton().textContent).toBe('Đang lắng nghe…')
    expect(submitButton().disabled).toBe(true)
    expect(screen.queryByText('Ngươi cầm chặt cây trâm.')).toBeNull()
    expect(actions).toHaveLength(0)

    resolveFetch({ ok: true, json: async () => ({ choiceId: 'return_pin', reply: 'Ngươi cầm chặt cây trâm.' }) })
    await waitFor(() => expect(actions).toHaveLength(1))
    expect(actions[0]).toEqual({ kind: 'story_choice', choiceId: 'return_pin' })
    expect(await screen.findByText('Ngươi cầm chặt cây trâm.')).toBeTruthy()
    // The form returns to idle and accepts a new command.
    expect(submitButton().textContent).toBe('Thử vận')
  })

  it('never stays stuck: an AI failure falls back to free text and clears the busy state', async () => {
    vi.stubEnv('VITE_AI_NARRATION_ENABLED', 'true')
    vi.stubGlobal('fetch', vi.fn().mockRejectedValue(new Error('network down')))

    const actions: Action[] = []
    renderScreen((action) => actions.push(action))

    typeAndSubmit('đi về hướng bắc')
    await waitFor(() => expect(actions).toHaveLength(1))
    expect(actions[0]).toEqual({ kind: 'free_text', raw: 'đi về hướng bắc' })
    await waitFor(() => expect(submitButton().textContent).toBe('Thử vận'))
    expect(submitButton().disabled).toBe(true) // only because the input is empty again, not busy
    // The form accepts a new command right away.
    fireEvent.change(screen.getByLabelText('Viết hành động khác'), { target: { value: 'nghỉ ngơi' } })
    expect(submitButton().disabled).toBe(false)
  })

  it('treats an empty AI answer like a failure and falls back to free text', async () => {
    vi.stubEnv('VITE_AI_NARRATION_ENABLED', 'true')
    vi.stubGlobal('fetch', vi.fn().mockResolvedValue({ ok: true, json: async () => ({}) }))

    const actions: Action[] = []
    renderScreen((action) => actions.push(action))

    typeAndSubmit('ngồi với Ngô')
    await waitFor(() => expect(actions).toHaveLength(1))
    expect(actions[0]).toEqual({ kind: 'free_text', raw: 'ngồi với Ngô' })
    await waitFor(() => expect(submitButton().textContent).toBe('Thử vận'))
  })

  it('skips the AI entirely when narration is disabled and acts immediately', async () => {
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    const actions: Action[] = []
    renderScreen((action) => actions.push(action))

    typeAndSubmit('tu luyện')
    await act(async () => {
      await Promise.resolve()
    })
    expect(actions).toEqual([{ kind: 'free_text', raw: 'tu luyện' }])
    expect(fetchMock).not.toHaveBeenCalled()
    expect(submitButton().textContent).toBe('Thử vận')
  })
})
