// Headless policy bots for the AI playtest campaign ("bàn tay", not "đầu óc").
//
// Reads the SAME digest the LLM players see (collectDigest/renderDigest are
// imported from browser-use-server.mjs — one source of truth for perception),
// clicks by testid/name regex instead of volatile indices, and writes a
// delta log + one verdict JSON per session. An LLM then reads those logs and
// reports what it "felt" — that is the play phase of the hybrid campaign.
//
// Machine-detected signals (no model needed):
//   - dead clicks: control produced zero digest change
//   - unnamed/glued/CJK controls: accessibility/affordance smell from the digest
//   - gaps: a wanted affordance (e.g. heal in combat) with nothing matching it
//   - console/page errors
//
//   node scripts/browser-play-bot.mjs --ids b01,b02,...  (comma list of session ids)
//   env BOT_SERVER_PORT=4401 (its browser-use server, auto-started)
//       BOT_HOST_PORT=4175   (game origin; separate port = separate localStorage)
//       BOT_STEPS=150 BOT_SETTLE=900
//
// ponytail: policy table lives here, personas are coarse. Upgrade path: if
// bots need branching narratives, move policy into a tiny data file.

import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'

// starts THIS module's HTTP server on BOT_SERVER_PORT — that's the point:
// each bot process owns one browser and one control API, zero cross-talk.
process.env.BROWSER_USE_PORT = process.env.BOT_SERVER_PORT ?? '4401'
process.env.BROWSER_USE_URL = `http://127.0.0.1:${process.env.BOT_HOST_PORT ?? 4175}/`
process.env.BROWSER_USE_SHOTS = 'docs/playtest-ai/shots-bots'
const serverMod = await import('./browser-use-server.mjs')

const PORT = Number(process.env.BROWSER_USE_PORT)
const GAME = process.env.BROWSER_USE_URL
const API = `http://127.0.0.1:${PORT}`
const STEPS = Number(process.env.BOT_STEPS ?? 150)
const SETTLE = Number(process.env.BOT_SETTLE ?? 900)
// hard wall-clock cap per session: flush partial log instead of hanging
const SESSION_MS = Number(process.env.BOT_SESSION_MS ?? 600_000)
const OUT = 'docs/playtest-ai/bots'

const wait = (ms) => new Promise((res) => setTimeout(res, ms))
// every HTTP call is bounded — a hung page must not hang the session forever
const FETCH_MS = 30_000
const post = async (path, body) => {
  const res = await fetch(API + path, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify(body ?? {}),
    signal: AbortSignal.timeout(FETCH_MS),
  })
  return res.text()
}
const get = async (path) => (await fetch(API + path, { signal: AbortSignal.timeout(FETCH_MS) })).text()

// digest text -> {screen, state, dialog, controls:[{i,name,id}], chronicle, raw}
function parseDigest(text) {
  const out = { screen: '', state: {}, dialog: false, controls: [], chronicle: [], raw: text }
  for (const line of text.split('\n')) {
    if (line.startsWith('MÀN HÌNH:')) out.screen = line.slice(9).trim()
    else if (line.startsWith('HỘP THOẠI:')) out.dialog = true
    else if (line.startsWith('HUD:')) for (const bit of line.slice(4).split('|')) {
      const [key, ...rest] = bit.trim().split('=')
      if (key && rest.length > 0) out.state[key.trim()] = rest.join('=').trim()
    }
    else if (line.startsWith('DIỄN BIẾN:')) out.chronicle = out.chronicle ?? []
    else if (/^\s+· /.test(line)) out.chronicle.push(line.slice(4).trim())
    else {
      const m = line.match(/^\s+\[(\d+)\]\s+(\S+)\s+"(.*?)"(?:\s+#(\S+))?(?:\s+<con trỏ>)?(?:\s+<nhập>)?\s*$/)
      if (m) out.controls.push({ i: Number(m[1]), role: m[2], name: m[3], id: m[4] ?? '' })
    }
  }
  return out
}

// volatile noise that must not count as "the world reacted"
const stableText = (d) => d.raw
  .split('\n')
  .filter((l) => !l.includes('<con trỏ>'))
  .map((l) => l.replace(/bước\)/g, 'b)').replace(/bước tới/g, 't'))
  .join('\n')

// ---- personas: coarse policy tables, in the spirit of ROSTER.md ----
const VARIANTS = {
  busy: { sys: 'sys_battle', diff: 'balanced', loop: ['tu luyện', 'map', 'talk', 'hái thảo', 'nghỉ'] },
  walker: { sys: 'sys_explorer', diff: 'balanced', loop: ['map', 'map', 'hái thảo', 'tu luyện', 'talk'] },
  social: { sys: 'sys_healer', diff: 'story', loop: ['talk', 'talk', 'nghỉ', 'tu luyện'] },
  grinder: { sys: 'sys_void', diff: 'hard', loop: ['tu luyện', 'tu luyện', 'map', 'Chợ', 'Hệ thống'] },
  shopper: { sys: 'sys_merchant', diff: 'balanced', loop: ['Chợ', 'map', 'hái thảo', 'Đạo đồ', 'Hệ thống'] },
  gambler: { sys: 'sys_lottery', diff: 'hard', loop: ['Quay số', 'Thử Vận', 'tu luyện', 'map', 'talk'] },
  scribe: { sys: 'sys_scholar', diff: 'story', loop: ['talk', 'Đạo đồ', 'Hệ thống', 'tu luyện', 'nghỉ'] },
  stabber: { sys: 'sys_assassin', diff: 'hard', loop: ['map', 'talk', 'tu luyện', 'Hành trang'] },
  alchemist: { sys: 'sys_alchemy', diff: 'balanced', loop: ['hái thảo', 'Hành trang', 'Chợ', 'tu luyện'] },
  smith: { sys: 'sys_artisan', diff: 'balanced', loop: ['hái thảo', 'tu luyện', 'map', 'Chợ'] },
}
const VARIANT_NAMES = Object.keys(VARIANTS)

function findControl(digest, want) {
  // want: {id} or {re} — testid wins, indices never trusted
  if (want.id) {
    const hit = digest.controls.find((c) => c.id === want.id && !c.disabled)
    if (hit) return hit
  }
  if (want.re) {
    const hit = digest.controls.find((c) => !c.disabled && want.re.test(c.name))
    if (hit) return hit
  }
  return null
}

function smellControls(digest) {
  const issues = []
  for (const c of digest.controls) {
    if (c.name === '(无名)' || c.name.trim() === '') issues.push(`control không tên: [${c.i}] ${c.role} #${c.id || '?'}`)
    else if (/[一-鿿]/.test(c.name) && !/VI|EN/.test(c.name)) issues.push(`chữ Hán lọt tên nút: "${c.name.slice(0, 40)}"`)
    else if (/^[\p{Lu}][\p{Lu}]/u.test(c.name) && /(.)\1\p{Lu}/u.test('' + c.name.replace(/^./, ''))) {
      // glued prefix artifact like "CCụ Mai Hoa" — first two caps doubled
    }
  }
  const glued = digest.controls.filter((c) => /^(.)\1/u.test(c.name) && /\p{L}/u.test(c.name[1] ?? ' '))
  for (const c of glued) issues.push(`tên dính chuỗi vô hồn: "${c.name.slice(0, 40)}" #${c.id || c.role}`)
  return issues
}

async function runBot(id) {
  // char-sum hash: '0101' vs '0111' both %10 = 1 would give twins identical
  // policies (and byte-identical logs, observed r01b04 == r01b14)
  const variantName = VARIANT_NAMES[[...id].reduce((a, c) => a + c.charCodeAt(0), 0) % VARIANT_NAMES.length]
  const variant = VARIANTS[variantName]
  const log = { id, variant: variantName, seed: id, host: GAME, actions: [], dead: [], issues: [], gaps: [], errors: [] }
  const deadline = Date.now() + SESSION_MS
  await post('/sessions', { id, seed: id })
  let d = parseDigest(await get(`/sessions/${id}/state?shot=0`))

  const act = async (label, want, d0, extra = {}) => {
    if (Date.now() > deadline) { log.gaps.push('session hết giờ (deadline) — flush sớm'); return null }
    const c = findControl(d0, want)
    if (!c) { log.gaps.push(`${label}: không tìm được điều khiển (${want.id ?? want.re}) trên màn ${d0.screen}`); return null }
    const t0 = Date.now()
    await post(`/sessions/${id}/action`, { click: c.i, settle: false })
    await wait(SETTLE)
    let d1
    try { d1 = parseDigest(await get(`/sessions/${id}/state?shot=0`)) } catch { d1 = d0 }
    const changed = stableText(d1) !== stableText(d0) || d1.screen !== d0.screen
    const entry = { a: log.actions.length + 1, t: label, name: c.name.slice(0, 60), id: c.id, changed, ms: Date.now() - t0, ...extra }
    if (!changed) { log.dead.push(`#${entry.a} "${label}" (${c.id || c.name.slice(0, 30)}) — bấm không thế giới phản hồi`) }
    log.actions.push(entry)
    const newLines = d1.chronicle.filter((line) => !d0.chronicle.includes(line))
    if (newLines.length > 0) entry.saw = newLines.slice(-3)
    return d1
  }

  // ---- boot: menu -> newgame -> contract -> loading -> game ----
  if (d.screen === 'menu') {
    const nd = await act('boot:new-game', { id: 'menu-new-game' }, d)
    if (nd) d = nd
  }
  if (d.screen === 'newgame') {
    let nd = await act('boot:pick-system', { id: `system-tile-${variant.sys}` }, d)
    if (nd) d = nd
    nd = await act('boot:difficulty', { id: `difficulty-${variant.diff}` }, d)
    if (nd) d = nd
    nd = await act('boot:confirm', { id: 'newgame-confirm' }, d)
    if (nd) d = nd
  }
  for (let i = 0; i < 6 && d.screen === 'loading'; i++) {
    await wait(1500)
    const nd = await act('boot:skip-loading', { re: /bắt đầu|tiếp tục|bỏ qua/i }, d)
    if (nd) d = nd
    else d = parseDigest(await get(`/sessions/${id}/state?shot=0`))
  }

  // ---- main loop ----
  let pref = 0
  for (let step = 0; step < STEPS; step++) {
    if (Date.now() > deadline) { log.gaps.push('session hết giờ (deadline) — flush sớm'); break }
    d = parseDigest(await get(`/sessions/${id}/state?shot=0`))
    const smelly = smellControls(d)
    for (const s of smelly) if (!log.issues.includes(s)) log.issues.push(s)

    if (d.screen === 'death' || d.screen === 'ending') {
      log.actions.push({ a: step, t: `reached-${d.screen}`, name: (d.chronicle.at(-1) ?? '').slice(0, 80), id: '', changed: true, ms: 0 })
      const nd = await act(`end:${d.screen}-continue`, { re: /kiếp mới|chơi lại|bắt đầu lại|vòng quay|luân hồi|menu/i }, d)
      if (!nd) break
      d = nd
      if (d.screen === 'menu') break
      continue
    }

    if (d.dialog) {
      // dialogs: play one affordance inside when possible, else close it
      const inside = d.controls.filter((c) => !/đóng|close|esc|✕|quay lại|skip|bỏ qua/i.test(c.name))
      const choice = inside.find((c) => /tặng|quà|gift|đưa|cho/i.test(c.name)) ?? inside.at(-1)
      if (choice && log.actions.at(-1)?.name !== choice.name) {
        const nd = await act('dialog:choose', { re: new RegExp(`^${choice.name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&').slice(0, 30)}`) }, d)
        if (nd) { d = nd; continue }
      }
      const nd = await act('dialog:close', { re: /đóng|close|✕|quay lại/i }, d)
      if (!nd) { log.gaps.push('dialog mở nhưng không tìm thấy cách đóng'); break }
      continue
    }

    if (d.screen !== 'game') {
      const nd = await act(`screen:${d.screen}-proceed`, { re: /kiếp mới|chơi|bắt đầu|tiếp/i }, d)
      if (!nd) break
      continue
    }

    const want = variant.loop[pref % variant.loop.length]
    pref += 1
    if (want === 'map') {
      await act('map:travel', { re: /^Đi (tới|\d)/ }, d)
    } else if (want === 'talk') {
      await act('npc:talk', { re: /nói chuyện với|trò chuyện/ }, d)
    } else {
      await act(`play:${want}`, { re: new RegExp(want, 'i') }, d)
    }
    if (log.actions.length >= STEPS) break
  }

  log.errors = JSON.parse(await get(`/sessions/${id}/errors`)).errors ?? []
  let telemetry = null
  try { telemetry = JSON.parse(await get(`/sessions/${id}/telemetry`)) } catch { /* session may have closed */ }
  log.summary = {
    steps: log.actions.length,
    dead_clicks: log.dead.length,
    unique_gaps: [...new Set(log.gaps)].slice(0, 20),
    unique_issues: [...new Set(log.issues)].slice(0, 20),
    last_chronicle: parseDigest(await get(`/sessions/${id}/state?shot=0&all=1`).then((t) => t).catch(() => '')).chronicle ?? [],
    screens_seen: [...new Set(log.actions.map((a) => a.t.split(':')[0]))],
    days_seen: telemetry?.run?.days ?? null,
    errors: log.errors.slice(0, 10),
  }
  await new Promise((res) => fetch(`${API}/sessions/${id}`, { method: 'DELETE' }).then(() => res()).catch(() => res()))
  return { log, telemetry }
}

// ---- main ----
const argIds = (process.argv.find((a) => a.startsWith('--ids=')) ?? '').replace('--ids=', '')
const ids = (argIds || process.env.BOT_IDS || 'b01').split(',').filter(Boolean)
await mkdir(OUT, { recursive: true })
// sessions run concurrently inside this one browser; groups parallelize across processes
await Promise.all(ids.map(async (id) => {
  const { log, telemetry } = await runBot(id)
  await writeFile(`${OUT}/${id}.jsonl`,
    log.actions.map((a) => JSON.stringify(a)).join('\n') + '\n' + JSON.stringify({ _summary: log.summary }) + '\n' + JSON.stringify({ _telemetry_head: { actions: telemetry?.actions, errors: telemetry?.errors?.slice(0, 5), run: typeof telemetry?.run === 'string' ? telemetry.run.slice(0, 4000) : telemetry?.run } }) + '\n',
    { encoding: 'utf8' })
  // eslint-disable-next-line no-console
  console.log(`${id}: ${log.summary.steps} steps, dead=${log.summary.dead_clicks}, gaps=${log.summary.unique_gaps.length}, errors=${log.errors.length}`)
}))
// eslint-disable-next-line no-console
console.log(`group done: ${ids.join(',')}`)
process.exit(0)
