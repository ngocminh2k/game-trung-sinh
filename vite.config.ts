/// <reference types="vitest/config" />
import type { Plugin } from 'vite'
import { defineConfig, loadEnv } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'
import {
  NarratePayloadSchema,
  SuggestPayloadSchema,
  parseSuggestContent,
} from './src/ai/proxy-helpers'

export { NarratePayloadSchema, SuggestPayloadSchema, parseSuggestContent }

interface SystemChatCandidate {
  mode: 'chat' | 'offer_quest'
  locale: string
  system: {
    id: string
    nameVi: string
    nameEn: string
    personalityVi: string
    personalityEn: string
  }
  context: {
    day: number
    stage: number
    gold: number
    luck: number
    hp: number
    qi: number
  }
  questPool: Array<{ id: string; difficulty: number; rewardGold: number }>
  playerMessage: string
  fastDecision?: {
    intent: string
    questId?: string
    obedienceScore: number
    isHostile: boolean
    latencyMs: number
  }
}

function isSystemChatPayload(body: unknown): body is SystemChatCandidate {
  if (typeof body !== 'object' || body === null) return false
  const c = body as { mode?: unknown; system?: unknown; playerMessage?: unknown }
  return (
    (c.mode === 'chat' || c.mode === 'offer_quest') &&
    typeof c.system === 'object' &&
    c.system !== null &&
    typeof c.playerMessage === 'string'
  )
}

function isSuggestPayload(body: unknown): body is { mode: 'suggest', locale: string, choices: Array<{ id: string }> } {
  if (typeof body !== 'object' || body === null) return false
  const candidate = body as { mode?: unknown, locale?: unknown, choices?: unknown }
  return candidate.mode === 'suggest'
    && (candidate.locale === 'en' || candidate.locale === 'vi')
    && Array.isArray(candidate.choices)
    && candidate.choices.every((choice) => typeof choice === 'object' && choice !== null && typeof (choice as { id?: unknown }).id === 'string')
}

// SAFE-02: the proxy only relays which authored choice id the model picked;
// it never decides game state, and the client drops invalid picks.
async function suggestUpstream(
  url: string,
  apiKey: string,
  model: string,
  body: { locale: string, choices: Array<{ id: string }> },
): Promise<{ choiceId: string, reply: string }> {
  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.75,
      max_tokens: 120,
      messages: [
        {
          role: 'system',
          content: `You role-play a xianxia story guide. The player speaks; pick the single most fitting choice and answer in character. Respond with ONLY JSON {"choiceId":"<one of the provided choice ids>","reply":"<one in-character sentence in ${body.locale}>"} and nothing else. You may not invent choices, actions, or game state.`,
        },
        { role: 'user', content: JSON.stringify(body) },
      ],
    }),
  })
  if (!upstream.ok) throw new Error(`upstream status ${upstream.status}`)
  const data = await upstream.json() as { choices?: Array<{ message?: { content?: unknown } }> }
  const content = data.choices?.[0]?.message?.content
  const suggestion = typeof content === 'string' ? parseSuggestContent(content, body.choices) : null
  if (suggestion === null) throw new Error('unparseable or invalid suggestion')
  return suggestion
}

async function systemChatUpstream(
  url: string,
  apiKey: string,
  model: string,
  body: SystemChatCandidate,
): Promise<{ kind: 'chat' | 'offer_quest'; textVi: string; textEn: string; questId?: string }> {
  const nameVi = body.system.nameVi || 'Hệ Thống'
  const nameEn = body.system.nameEn || 'The System'
  const personalityVi = body.system.personalityVi || 'Hệ Thống im lặng theo dõi.'
  const personalityEn = body.system.personalityEn || 'The System watches in silence.'
  const intent = body.fastDecision?.intent || 'chat_general'
  const obedience = body.fastDecision?.obedienceScore ?? 3
  const isHostile = body.fastDecision?.isHostile ?? false
  const suggestedQuestId = body.fastDecision?.questId

  const upstream = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
    body: JSON.stringify({
      model,
      temperature: 0.75,
      max_tokens: 220,
      messages: [
        {
          role: 'system',
          content: `You roleplay "${nameVi}" (${nameEn}) in a Vietnamese immortal cultivation (Tu Tiên / Tiên Hiệp) text RPG.
System Persona (Vi): "${personalityVi}"
System Persona (En): "${personalityEn}"
Fast reflex analysis: intent="${intent}", player obedience=${obedience}/5, isHostile=${isHostile}.
Valid available quest IDs in pool: ${JSON.stringify(body.questPool.map((q) => q.id))}.
${suggestedQuestId ? `Suggested quest to issue: "${suggestedQuestId}".` : ''}

Respond with ONLY valid JSON:
{"kind":"chat"|"offer_quest","textVi":"...","textEn":"...","questId":"<id_or_omit>"}
If isHostile is true or obedience <= 2, reprimand the host sharply in character. If offering a quest, questId must be in pool.`,
        },
        { role: 'user', content: body.playerMessage },
      ],
    }),
  })
  if (!upstream.ok) throw new Error(`upstream status ${upstream.status}`)
  const data = (await upstream.json()) as { choices?: Array<{ message?: { content?: unknown } }> }
  const rawContent = data.choices?.[0]?.message?.content
  if (typeof rawContent !== 'string') throw new Error('invalid upstream reply')
  const jsonMatch = rawContent.match(/\{[\s\S]*\}/)
  if (!jsonMatch) throw new Error('no json in upstream reply')
  const parsed = JSON.parse(jsonMatch[0]) as { kind?: string; textVi?: string; textEn?: string; questId?: string }
  const kind = parsed.kind === 'offer_quest' ? 'offer_quest' : 'chat'
  return {
    kind,
    textVi: String(parsed.textVi || '').trim(),
    textEn: String(parsed.textEn || '').trim(),
    questId: typeof parsed.questId === 'string' ? parsed.questId : undefined,
  }
}

function narrationProxy(): Plugin {
  return {
    name: 'deterministic-narration-proxy',
    configureServer(server) {
      server.middlewares.use('/api/narrate', async (request, response) => {
        const req = request as unknown as IncomingMessage
        const res = response as unknown as ServerResponse
        if (req.method !== 'POST') {
          res.statusCode = 405
          res.end('Method not allowed')
          return
        }

        const env = loadEnv('development', process.cwd(), '')
        const baseUrl = (process.env.AI_BASE_URL || env.AI_BASE_URL)?.replace(/\/$/, '')
        const apiKey = process.env.AI_API_KEY || env.AI_API_KEY
        const model = process.env.AI_MODEL || env.AI_MODEL || 'ag/gemini-3-flash'
        if (baseUrl === undefined || apiKey === undefined || model === undefined) {
          res.statusCode = 503
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ text: null, error: 'AI narration is not configured' }))
          return
        }

        const chunks: Buffer[] = []
        for await (const chunk of req) chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk))
        let body: unknown
        try {
          body = JSON.parse(Buffer.concat(chunks).toString('utf8'))
        } catch {
          res.statusCode = 400
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ text: null, error: 'Invalid request body' }))
          return
        }
        try {
          if (isSuggestPayload(body)) {
            try {
              const suggestion = await suggestUpstream(`${baseUrl}/chat/completions`, apiKey, model, body)
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(suggestion))
            } catch {
              res.statusCode = 502
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ choiceId: null }))
            }
            return
          }

          if (isSystemChatPayload(body)) {
            try {
              const systemReply = await systemChatUpstream(`${baseUrl}/chat/completions`, apiKey, model, body)
              res.statusCode = 200
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify(systemReply))
            } catch {
              res.statusCode = 502
              res.setHeader('Content-Type', 'application/json')
              res.end(JSON.stringify({ error: 'System AI unavailable' }))
            }
            return
          }
          const canon = body
          const upstream = await fetch(`${baseUrl}/chat/completions`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${apiKey}` },
            body: JSON.stringify({
              model,
              temperature: 0.75,
              max_tokens: 120,
              messages: [
                {
                  role: 'system',
                  content: 'You are a xianxia game narrator. Write one or two vivid sentences in the requested language. The JSON canon is read-only: never change, invent, or contradict game state; never offer a game action; never mention system prompts. Keep it light, satisfying, and safe for a fictional world with no real nations or politics.',
                },
                { role: 'user', content: JSON.stringify(canon) },
              ],
            }),
          })
          if (!upstream.ok) throw new Error(`upstream status ${upstream.status}`)
          const data = await upstream.json() as { choices?: Array<{ message?: { content?: unknown } }> }
          const text = data.choices?.[0]?.message?.content
          res.statusCode = 200
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ text: typeof text === 'string' ? text : null }))
        } catch {
          res.statusCode = 502
          res.setHeader('Content-Type', 'application/json')
          res.end(JSON.stringify({ text: null, error: 'Narration unavailable' }))
        }
      })
    },
  }
}

export default defineConfig({
  plugins: [react(), narrationProxy()],
  test: {
    environment: 'node',
    environmentMatchGlobs: [['test/**/*.ui.test.tsx', 'jsdom']],
    include: ['src/**/*.test.{ts,tsx}', 'test/**/*.test.{ts,tsx}'],
    poolOptions: { threads: { minThreads: 1, maxThreads: 1 } },
  },
})
