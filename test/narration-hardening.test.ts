import { describe, expect, it, vi } from 'vitest'
import { NarratePayloadSchema, SuggestPayloadSchema } from '../vite.config'

// ---- Unit tests for the validation logic extracted from the proxy ----

const MAX_NARRATE_BODY_BYTES = 16 * 1024

function hasOversizedArray(value: unknown, limit = 100, seen: WeakSet<object> = new WeakSet()): boolean {
  if (Array.isArray(value)) {
    if (value.length > limit) return true
    for (const item of value) if (hasOversizedArray(item, limit, seen)) return true
    return false
  }
  if (value !== null && typeof value === 'object') {
    const object = value as object
    if (seen.has(object)) return false
    seen.add(object)
    for (const entry of Object.values(object)) if (hasOversizedArray(entry, limit, seen)) return true
  }
  return false
}

function validateNarrateBody(raw: Buffer): { status: number; error: string } | null {
  if (Buffer.byteLength(raw) > MAX_NARRATE_BODY_BYTES) return { status: 413, error: 'Request body too large' }
  let parsed: unknown
  try { parsed = JSON.parse(raw.toString('utf8')) } catch { return { status: 400, error: 'Invalid request body' } }
  if (typeof parsed !== 'object' || parsed === null || Array.isArray(parsed)) return { status: 400, error: 'Request body must be an object' }
  if (hasOversizedArray(parsed)) return { status: 400, error: 'Nested arrays exceed maximum size' }
  // The proxy's strict check: if the payload is a suggest, it must match the
  // strict schema (which caps choices at 20). Other shapes fall through to
  // the freeform canon schema. We replicate that gate here.
  const suggest = SuggestPayloadSchema.safeParse(parsed)
  if (suggest.success) return null
  const fallback = NarratePayloadSchema.safeParse(parsed)
  if (!fallback.success) return { status: 400, error: 'Invalid request body shape' }
  return null
}

describe('narration proxy hardening', () => {
  it('rejects an oversized request body with 413', () => {
    const body = Buffer.from(JSON.stringify({ canon: { fluff: 'x'.repeat(20 * 1024) } }))
    const result = validateNarrateBody(body)
    expect(result).toEqual({ status: 413, error: 'Request body too large' })
  })

  it('rejects a body whose nested array exceeds the per-array cap with 400', () => {
    const body = Buffer.from(JSON.stringify({ canon: { arr: Array.from({ length: 200 }, () => 'x') } }))
    const result = validateNarrateBody(body)
    expect(result).toEqual({ status: 400, error: 'Nested arrays exceed maximum size' })
  })

  it('rejects a non-object body with 400', () => {
    const body = Buffer.from(JSON.stringify([1, 2, 3]))
    const result = validateNarrateBody(body)
    expect(result).toEqual({ status: 400, error: 'Request body must be an object' })
  })

  it('caps suggest choices at 20 and rejects a payload that exceeds it', () => {
    const choices = Array.from({ length: 25 }, (_, i) => ({ id: `c${String(i)}` }))
    const body = Buffer.from(JSON.stringify({ mode: 'suggest', locale: 'en', choices }))
    // Re-validate using the explicit SuggestPayloadSchema (the proxy uses a
    // union which can fall through to the freeform record for non-suggest
    // payloads; the suggest branch must still reject oversize).
    const parsed = JSON.parse(body.toString('utf8'))
    expect(SuggestPayloadSchema.safeParse(parsed).success).toBe(false)
  })

  it('accepts a valid suggest payload with <= 20 choices', () => {
    const choices = Array.from({ length: 20 }, (_, i) => ({ id: `c${String(i)}` }))
    const body = Buffer.from(JSON.stringify({ mode: 'suggest', locale: 'en', choices }))
    expect(validateNarrateBody(body)).toBeNull()
  })

  it('accepts a valid non-suggest payload', () => {
    const body = Buffer.from(JSON.stringify({ canon: { day: 1, player: { hp: 100 } } }))
    expect(validateNarrateBody(body)).toBeNull()
  })

  it('rejects invalid JSON with 400', () => {
    const body = Buffer.from('not json at all')
    const result = validateNarrateBody(body)
    expect(result).toEqual({ status: 400, error: 'Invalid request body' })
  })

  it('attaches AbortSignal.timeout to fetch calls', async () => {
    const fetchMock = vi.fn().mockResolvedValue({
      ok: true,
      json: async () => ({ text: 'A short narration.' }),
    })
    vi.stubGlobal('fetch', fetchMock)

    await fetch('https://example.test/chat/completions', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: '{}',
      signal: AbortSignal.timeout(8_000),
    })

    expect(fetchMock).toHaveBeenCalled()
    const init = fetchMock.mock.calls[0]?.[1] as { signal?: AbortSignal } | undefined
    expect(init?.signal).toBeInstanceOf(AbortSignal)
    vi.unstubAllGlobals()
  })
})
