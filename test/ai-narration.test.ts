import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { buildSuggestPayload, requestSuggestion } from '../src/ai/narration'
import { parseSuggestContent } from '../vite.config'
import { newGame } from '../src/engine'

describe('AI narration suggestions', () => {
  beforeEach(() => {
    vi.stubEnv('VITE_AI_NARRATION_ENABLED', 'true')
  })

  afterEach(() => {
    vi.unstubAllEnvs()
    vi.unstubAllGlobals()
  })

  it('sends only authored available choices and accepts a matching choice', async () => {
    const game = newGame('ai-suggestion')
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ choiceId: 'return_pin', reply: '  The red thread tightens.  ' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    const result = await requestSuggestion(game, '  I return the pin.  ', 'en')

    expect(result).toEqual({ status: 'suggested', suggestion: { choiceId: 'return_pin', reply: 'The red thread tightens.' } })
    expect(fetchMock).toHaveBeenCalledOnce()
    const body = JSON.parse(String(fetchMock.mock.calls[0]?.[1]?.body)) as { choices: Array<{ id: string }>; playerUtterance: string; mode: string }
    expect(body).toMatchObject({ mode: 'suggest', playerUtterance: 'I return the pin.' })
    expect(body.choices.map((choice) => choice.id)).toContain('return_pin')
  })

  it('falls back deterministically when the service is empty, invalid, or unavailable', async () => {
    const game = newGame('ai-fallback')
    const fetchMock = vi.fn()
    vi.stubGlobal('fetch', fetchMock)

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({}) })
    await expect(requestSuggestion(game, 'I listen.', 'en')).resolves.toEqual({ status: 'empty' })

    fetchMock.mockResolvedValueOnce({ ok: true, json: async () => ({ choiceId: 'made_up', reply: 'No.' }) })
    await expect(requestSuggestion(game, 'I listen.', 'en')).resolves.toEqual({ status: 'empty' })

    fetchMock.mockRejectedValueOnce(new Error('offline'))
    await expect(requestSuggestion(game, 'I listen.', 'en')).resolves.toEqual({ status: 'error' })
  })

  it('omits unavailable story choices from the request', () => {
    const game = newGame('ai-choices')
    const payload = buildSuggestPayload(game, 'return the pin', 'en')

    expect(payload.choices.map((choice) => choice.id)).toEqual(['return_pin', 'study_letter', 'sell_pin'])
    expect(payload.playerUtterance).toBe('return the pin')
  })
})

describe('proxy suggest-content parsing', () => {
  const choices = [{ id: 'return_pin' }, { id: 'study_letter' }]

  it('parses a valid JSON pick of an authored choice', () => {
    expect(parseSuggestContent('{"choiceId":"return_pin","reply":"  The thread tightens.  "}', choices))
      .toEqual({ choiceId: 'return_pin', reply: 'The thread tightens.' })
  })

  it('parses JSON embedded in surrounding prose', () => {
    expect(parseSuggestContent('Sure: {"choiceId":"study_letter","reply":"Read it."} done', choices))
      .toEqual({ choiceId: 'study_letter', reply: 'Read it.' })
  })

  it('drops a pick that is not one of the authored choices', () => {
    expect(parseSuggestContent('{"choiceId":"made_up","reply":"No."}', choices)).toBeNull()
    expect(parseSuggestContent('{"choiceId":123}', choices)).toBeNull()
    expect(parseSuggestContent('{}', choices)).toBeNull()
  })

  it('drops non-JSON content', () => {
    expect(parseSuggestContent('I would return the pin.', choices)).toBeNull()
    expect(parseSuggestContent('', choices)).toBeNull()
  })
})
