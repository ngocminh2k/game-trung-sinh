// browser-use control server for AI playtesting (issue: 20 AI players).
//
// Exposes a tiny HTTP API so an agent (which only has Read/Bash) can drive a
// real Chromium window: observe = a compact digest of the interactive element
// list + HUD + chronicle + a screenshot; act = click / type / keys. One
// browser context per player id, so each run gets isolated localStorage and
// its own playtest telemetry under 'phe-can-ky:playtest:v1'.
//
// Deliberately not a general Playwright wrapper: no CSS/XPath escape hatch. The
// agent must perceive the page the way a player does.
//
//   node scripts/browser-use-server.mjs            # starts on 127.0.0.1:4400
//   curl -s localhost:4400/sessions
//
// ponytail: single-file, in-memory session map, no auth. Ceiling: local
// playtest only — never expose this port; upgrade path is a per-session token.

import { createServer } from 'node:http'
import { mkdir, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { chromium } from '@playwright/test'

const PORT = Number(process.env.BROWSER_USE_PORT ?? 4400)
const GAME_URL = process.env.BROWSER_USE_URL ?? 'http://127.0.0.1:4174/'
const SHOTS = process.env.BROWSER_USE_SHOTS ?? 'docs/playtest-ai/shots'
const STEP_TIMEOUT = 20_000
const MAX_LABEL = 90

const sessions = new Map()
let browser = null

async function ensureBrowser() {
  if (browser === null) browser = await chromium.launch({ headless: true })
  return browser
}

function ok(res, body, status = 200) {
  const text = typeof body === 'string' ? body : JSON.stringify(body)
  res.writeHead(status, { 'content-type': 'application/json; charset=utf-8' })
  res.end(text)
}

function fail(res, message, status = 400) {
  ok(res, { error: message }, status)
}

function readBody(req) {
  return new Promise((resolve, reject) => {
    let raw = ''
    req.on('data', (chunk) => {
      raw += chunk
      if (raw.length > 64_000) reject(new Error('body too large'))
    })
    req.on('end', () => {
      if (raw === '') resolve({})
      else {
        try { resolve(JSON.parse(raw)) } catch { reject(new Error('invalid JSON body')) }
      }
    })
    req.on('error', reject)
  })
}

const oneLine = (value) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, MAX_LABEL)

// The page's own view of itself: what can be clicked, what the HUD says, what
// just happened. Runs in the document, so it sees the live DOM only.
function collectDigest() {
  // Self-contained: this function is serialized into the page, so it may close
  // over nothing from module scope.
  const clip = (value, max) => String(value ?? '').replace(/\s+/g, ' ').trim().slice(0, max)
  const oneLine = (value) => clip(value, 90)
  const text = (node) => (node?.textContent ?? '').replace(/\s+/g, ' ').trim()
  const visible = (node) => {
    const style = getComputedStyle(node)
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false
    const rect = node.getBoundingClientRect()
    return rect.width > 1 && rect.height > 1
  }
  const inert = (node) => {
    for (let el = node; el !== null && el !== document.body; el = el.parentElement) {
      if (el.hasAttribute?.('inert')) return true
    }
    return false
  }
  const labelFor = (node) => oneLine(
    // What the player actually reads first; aria-label wins when the visible
    // text is an icon or empty.
    node.getAttribute('aria-label')
    || text(node)
    || text(node.querySelector('img[alt]')?.alt ?? '')
    || node.getAttribute('data-testid')
    || (node.tagName === 'INPUT' || node.tagName === 'TEXTAREA' ? `nhập: ${node.name || node.id || 'trống'}` : ''),
  )

  const controls = []
  const nodes = document.querySelectorAll('button, a[href], input, select, textarea, [role="button"], [role="option"], [role="radio"], [role="tab"], [role="switch"], [role="link"], [contenteditable="true"], [tabindex]:not([tabindex="-1"])')
  nodes.forEach((node) => {
    if (!visible(node) || inert(node)) return
    const rect = node.getBoundingClientRect()
    const disabled = node.disabled === true || node.getAttribute('aria-disabled') === 'true'
    const isField = /^(INPUT|TEXTAREA|SELECT)$/.test(node.tagName) || node.isContentEditable === true
    const id = node.getAttribute('data-testid')
    const role = node.getAttribute('role') ?? (node.tagName === 'A' ? 'link' : node.tagName.toLowerCase())
    controls.push({
      i: controls.length,
      role,
      name: labelFor(node) || '(无名)',
      id: id ?? '',
      disabled,
      field: isField,
      focused: document.activeElement === node,
      y: Math.round(rect.top),
    })
  })

  const read = (selector) => {
    const node = document.querySelector(selector)
    return node === null ? null : oneLine(text(node) || node.getAttribute('aria-label'))
  }

  const hud = {
    day: read('.day-chip') || read('[data-testid="day-stamp"]'),
    location: read('[data-testid="location-label"]'),
    night: read('[data-testid="night-deadline-chip"]'),
    objective: read('[data-testid="objective-line"]'),
  }

  const chronicle = [...document.querySelectorAll('.chronicle li')].slice(-6).map((node) => oneLine(text(node))).filter(Boolean)
  const notices = [...document.querySelectorAll('.stage-notices li, [role="status"]')].slice(-6).map((node) => oneLine(text(node))).filter(Boolean)
  const headings = [...document.querySelectorAll('h1, h2, h3')].filter(visible).slice(0, 8).map((node) => oneLine(text(node))).filter(Boolean)
  const dialog = (() => {
    const node = document.querySelector('[role="dialog"], [aria-modal="true"], .narration-panel, .route-encounter-screen')
    if (node === null || !visible(node)) return null
    return {
      title: oneLine(text(node.querySelector('h1, h2, h3'))),
      body: oneLine(text(node)).slice(0, 400),
    }
  })()
  const screen = document.querySelector('[data-testid="main-menu"]') !== null ? 'menu'
    : document.querySelector('[data-testid="new-game-screen"]') !== null ? 'newgame'
      : document.querySelector('[data-testid="save-slots-screen"]') !== null ? 'slots'
        : document.querySelector('[data-testid="settings-screen"]') !== null ? 'settings'
          : document.querySelector('[data-testid="loading-screen"], .loading-screen') !== null ? 'loading'
            : document.querySelector('[data-testid="game-screen"]') !== null ? 'game'
              : document.querySelector('.death-screen, [data-testid="death-screen"]') !== null ? 'death'
                : document.querySelector('.ending-banner') !== null ? 'ending' : 'unknown'

  const state = (() => {
    try {
      const slot = JSON.parse(localStorage.getItem('phe-can-ky:slots') ?? 'null')
      const active = localStorage.getItem('phe-can-ky:active-slot')
      const game = slot?.[active]?.session?.game
      if (!game) return null
      return {
        day: game.day, locationId: game.player?.locationId, hp: game.player?.hp, qi: game.player?.qi,
        gold: game.gold ?? game.player?.gold, silver: game.silver, spiritStones: game.spiritStones,
        stage: game.player?.stage, realm: game.player?.realm, systemId: game.systemId,
        difficulty: game.difficulty, terminal: game.terminal ?? null, endingId: game.endingId ?? null,
      }
    } catch { return null }
  })()

  return { screen, hud, state, headings, dialog, chronicle, notices, controls }
}

function renderDigest(digest, screenshotPath, opts = {}) {
  const lines = []
  lines.push(`MÀN HÌNH: ${digest.screen}`)
  const hudBits = Object.entries({ ...digest.hud, ...digest.state }).filter(([, v]) => v !== null && v !== undefined && v !== '')
  if (hudBits.length > 0) lines.push(`HUD: ${hudBits.map(([k, v]) => `${k}=${v}`).join(' | ')}`)
  if (digest.headings.length > 0) lines.push(`TIÊU ĐỀ: ${digest.headings.join(' / ')}`)
  if (digest.dialog !== null) lines.push(`HỘP THOẠI:\n  ${digest.dialog.body}`)
  if (digest.notices.length > 0) lines.push(`THÔNG BÁO: ${digest.notices.join(' | ')}`)
  if (digest.chronicle.length > 0) {
    lines.push('DIỄN BIẾN:')
    for (const entry of digest.chronicle) lines.push(`  · ${entry}`)
  }
  // A player reads affordances, not chrome: disabled controls and one-glyph
  // icon buttons without a label are dropped unless the caller wants everything.
  const readable = digest.controls.filter((control) => {
    if (opts.all === true) return true
    if (control.disabled) return false
    if (control.name.length <= 2 && !control.field) return false
    return true
  })
  lines.push(`ĐIỀU KHIỂN (${readable.length}/${digest.controls.length}${opts.all ? ', tất cả' : ', đã lược icon/trường disabled'}):`)
  for (const control of readable) {
    lines.push(`  [${control.i}] ${control.role} "${control.name}"${control.id ? ` #${control.id}` : ''}${control.focused ? ' <con trỏ>' : ''}${control.field ? ' <nhập>' : ''}`)
  }
  if (screenshotPath !== null) lines.push(`ẢNH: ${screenshotPath}`)
  lines.push('HÀNH ĐỘNG: POST /sessions/<id>/action {"click":N} | {"type":N,"text":"..."} | {"press":"ArrowUp"}')
  return lines.join('\n')
}

async function getSession(id) {
  const session = sessions.get(id)
  if (session === undefined) throw new Error(`unknown session ${id}`)
  return session
}

async function openSession(id, seed) {
  const b = await ensureBrowser()
  const context = await b.newContext({ viewport: { width: 1280, height: 800 }, locale: 'vi-VN' })
  const page = await context.newPage()
  const errors = []
  page.on('pageerror', (error) => errors.push(`pageerror: ${error.message}`))
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(`console: ${message.text()}`)
  })
  await page.goto(GAME_URL, { waitUntil: 'domcontentloaded', timeout: STEP_TIMEOUT })
  const session = { id, seed, context, page, errors, actions: 0, createdAt: Date.now() }
  sessions.set(id, session)
  return session
}

const CONTROL_SELECTOR = 'button, a[href], input, select, textarea, [role="button"], [role="option"], [role="radio"], [role="tab"], [role="switch"], [role="link"], [contenteditable="true"], [tabindex]:not([tabindex="-1"])'

// Same visibility/inert filter as collectDigest, so the index the agent was
// shown is the element that gets acted on. `selector` is passed in because the
// function is serialized to the page and cannot close over module scope.
function nthActionable(arg) {
  const visible = (node) => {
    const style = getComputedStyle(node)
    if (style.display === 'none' || style.visibility === 'hidden' || style.opacity === '0') return false
    const rect = node.getBoundingClientRect()
    return rect.width > 1 && rect.height > 1
  }
  const inert = (node) => {
    for (let el = node; el !== null && el !== document.body; el = el.parentElement) {
      if (el.hasAttribute?.('inert')) return true
    }
    return false
  }
  const nodes = [...document.querySelectorAll(arg.selector)].filter((node) => visible(node) && !inert(node))
  return nodes[arg.index] ?? null
}

async function nthHandle(page, index) {
  const handle = await page.evaluateHandle(nthActionable, { selector: CONTROL_SELECTOR, index })
  const element = handle.asElement()
  if (element === null) {
    await handle.dispose()
    throw new Error(`chỉ số ${index} không khớp điều khiển nào đang hiện`)
  }
  return element
}

async function act(session, body) {
  const { page } = session
  await page.waitForLoadState('domcontentloaded')
  if (typeof body.click === 'number') {
    const target = await nthHandle(page, body.click)
    await target.click({ timeout: STEP_TIMEOUT })
  } else if (typeof body.type === 'number') {
    const target = await nthHandle(page, body.type)
    await target.fill(String(body.text ?? ''), { timeout: STEP_TIMEOUT })
    if (body.submit === true) await target.press('Enter')
  } else if (typeof body.keys === 'string') {
    if (typeof body.focus === 'number') await (await nthHandle(page, body.focus)).focus()
    await page.keyboard.type(body.keys, { delay: 5 })
    if (body.submit === true) await page.keyboard.press('Enter')
  } else if (typeof body.press === 'string') {
    await page.keyboard.press(body.press)
  } else if (typeof body.scroll === 'string') {
    await page.mouse.wheel(0, body.scroll === 'down' ? 600 : -600)
  } else {
    throw new Error('cần một trong: click, type, keys, press, scroll')
  }
  session.actions += 1
  await page.waitForTimeout(250)
}

async function capture(session, name) {
  await mkdir(SHOTS, { recursive: true })
  const path = join(SHOTS, `${name}.png`)
  try {
    await session.page.screenshot({ path, timeout: STEP_TIMEOUT })
    return path
  } catch {
    return null
  }
}

const server = createServer((req, res) => {
  const url = new URL(req.url ?? '/', `http://localhost:${PORT}`)
  const parts = url.pathname.split('/').filter(Boolean)
  handle(req, res, parts, url).catch(async (error) => {
    fail(res, String(error?.message ?? error), 500)
  })
})

async function handle(req, res, parts, url) {
  if (req.method === 'GET' && parts[0] === 'health') {
    return ok(res, { ok: true, sessions: sessions.size, game: GAME_URL, browser: browser !== null })
  }
  if (req.method === 'GET' && parts.length === 1 && parts[0] === 'sessions') {
    return ok(res, [...sessions.values()].map((s) => ({ id: s.id, seed: s.seed, actions: s.actions, errors: s.errors.length })))
  }
  if (req.method === 'POST' && parts.length === 1 && parts[0] === 'sessions') {
    const body = await readBody(req)
    const id = String(body.id ?? `p${Math.random().toString(36).slice(2, 8)}`)
    if (sessions.has(id)) return fail(res, `session ${id} đã tồn tại`)
    await openSession(id, String(body.seed ?? id))
    return ok(res, { id, url: GAME_URL })
  }
  if (req.method === 'DELETE' && parts[0] === 'sessions' && parts.length === 2) {
    const session = sessions.get(parts[1])
    if (session === undefined) return fail(res, 'unknown session', 404)
    const report = { id: session.id, seed: session.seed, actions: session.actions, errors: session.errors.slice(0, 20) }
    await session.context.close()
    sessions.delete(parts[1])
    return ok(res, report)
  }
  if (parts[0] === 'sessions' && parts.length === 3) {
    const session = await getSession(parts[1])
    const verb = parts[2]
    if (req.method === 'GET' && verb === 'state') {
      const shot = url.searchParams.get('shot') !== '0'
      const screenshotPath = shot ? await capture(session, `${session.id}-last`) : null
      const digest = await session.page.evaluate(collectDigest)
      return ok(res, renderDigest(digest, screenshotPath, { all: url.searchParams.get('all') === '1' }))
    }
    if (req.method === 'GET' && verb === 'errors') return ok(res, { errors: session.errors.slice(0, 30) })
    if (req.method === 'GET' && verb === 'telemetry') {
      const raw = await session.page.evaluate(() => ({
        run: localStorage.getItem('phe-can-ky:playtest:v1'),
        survey: localStorage.getItem('phe-can-ky:playtest-feedback:v1'),
      }))
      return ok(res, { id: session.id, seed: session.seed, actions: session.actions, errors: session.errors.slice(0, 30), run: raw.run === null ? null : JSON.parse(raw.run), survey: raw.survey === null ? null : JSON.parse(raw.survey) })
    }
    if (req.method === 'POST' && verb === 'action') {
      const body = await readBody(req)
      try { await act(session, body) } catch (error) { return fail(res, String(error?.message ?? error)) }
      if (body.settle === false) return ok(res, { ok: true, actions: session.actions })
      const digest = await session.page.evaluate(collectDigest)
      const screenshotPath = body.shot === true ? await capture(session, `${session.id}-${session.actions}`) : null
      return ok(res, renderDigest(digest, screenshotPath, { all: body.all === true }))
    }
    return fail(res, 'not found', 404)
  }
  return fail(res, 'not found', 404)
}

server.listen(PORT, '127.0.0.1', () => {
  // eslint-disable-next-line no-console
  console.log(`browser-use on http://127.0.0.1:${PORT} -> ${GAME_URL}`)
})

async function shutdown() {
  for (const session of sessions.values()) await session.context.close().catch(() => {})
  await browser?.close().catch(() => {})
  server.close()
}

process.on('SIGINT', () => { void shutdown().then(() => process.exit(0)) })
process.on('SIGTERM', () => { void shutdown().then(() => process.exit(0)) })
