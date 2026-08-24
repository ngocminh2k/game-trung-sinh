/// <reference types="vitest/config" />
import type { Plugin } from 'vite'
import { defineConfig } from 'vite'
import type { IncomingMessage, ServerResponse } from 'node:http'
import react from '@vitejs/plugin-react'

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
        try {
          const canon = JSON.parse(Buffer.concat(chunks).toString('utf8'))
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
