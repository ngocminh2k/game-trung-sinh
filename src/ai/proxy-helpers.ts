import { z } from 'zod'

// Proxy payload shapes: exported so tests can validate the same gates the
// middleware enforces. The suggest shape is strict (caps choices at 20);
// the narrate shape is a permissive record — the proxy only relays canon.
export const SuggestPayloadSchema = z.object({
  mode: z.literal('suggest'),
  locale: z.enum(['en', 'vi']),
  choices: z.array(z.object({ id: z.string().min(1) })).max(20),
})
export const NarratePayloadSchema = z.record(z.unknown())

export function parseSuggestContent(raw: string, choices: Array<{ id: string }>): { choiceId: string, reply: string } | null {
  try {
    const jsonStart = raw.indexOf('{')
    const jsonEnd = raw.lastIndexOf('}')
    if (jsonStart < 0 || jsonEnd <= jsonStart) return null
    const parsed = JSON.parse(raw.slice(jsonStart, jsonEnd + 1)) as { choiceId?: unknown, reply?: unknown }
    if (typeof parsed.choiceId !== 'string' || !choices.some((choice) => choice.id === parsed.choiceId)) return null
    const reply = typeof parsed.reply === 'string' ? parsed.reply.replace(/\s+/g, ' ').trim().slice(0, 300) : ''
    return { choiceId: parsed.choiceId, reply }
  } catch {
    return null
  }
}
