/// <reference types="vitest/config" />
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'

function isSuggestPayload(body: unknown): body is { mode: 'suggest', locale: string, choices: Array<{ id: string }> } {
  if (typeof body !== 'object' || body === null) return false
  const candidate = body as { mode?: unknown, locale?: unknown, choices?: unknown }
  return candidate.mode === 'suggest'
    && (candidate.locale === 'en' || candidate.locale === 'vi')
    && Array.isArray(candidate.choices)
    && candidate.choices.every((choice) => typeof choice === 'object' && choice !== null && typeof (choice as { id?: unknown }).id === 'string')
}

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

        const baseUrl = process.env.AI_BASE_URL?.replace(/\/$/, '')
        const apiKey = process.env.AI_API_KEY
        const model = process.env.AI_MODEL
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
