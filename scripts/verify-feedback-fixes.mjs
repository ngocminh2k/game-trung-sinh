/* eslint-disable no-undef -- Playwright page.evaluate callbacks chạy trong browser; script Node */
// Verify the 3 proto-shell feedback fixes on the live dev server (:5173):
//   1. Enemy HP bar fill is danger-red (scoped --danger on .proto-combat-overlay).
//   2. Combat overlay sits inside .proto-map, acts row below the fighters,
//      command bar (.proto-command chips) below the overlay.
//   3. NpcChatModal shows at most ONE speech-bubble at a time, on the correct
//      side (left=player, right=NPC) with the text of the line just spoken.
// Run: node scripts/verify-feedback-fixes.mjs
import { chromium } from 'playwright'
import fs from 'node:fs'
import path from 'node:path'

const URL = 'http://127.0.0.1:5173/'
const OUT = path.resolve('./screenshots')
fs.mkdirSync(OUT, { recursive: true })
const result = { chat: {}, combat: {}, checks: {}, errors: [] }
const fails = []
const ok = (name, cond, info = '') => {
  result.checks[name] = cond ? 'pass' : `fail: ${info}`
  if (!cond) fails.push(`${name} — ${info}`)
  console.log(`${cond ? 'OK  ' : 'FAIL'} ${name}${info ? ' — ' + info : ''}`)
}

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', (e) => result.errors.push(`pageerror: ${e.message}`))
try {
  await page.goto(URL, { waitUntil: 'networkidle', timeout: 30000 })
  await page.waitForTimeout(1500)
  await page.getByTestId('menu-new-game').click()
  await page.locator('.system-tile').first().click()
  await page.getByTestId('newgame-confirm').click()
  await page.waitForSelector('.loading-screen', { timeout: 8000 })
  await page.waitForFunction(() => document.querySelector('.loading-hint') !== null, { timeout: 8000 })
  await page.locator('.loading-screen').click()
  await page.waitForSelector('.proto-topbar', { timeout: 15000 })
  await page.waitForTimeout(600)

  // --- Fix 3: chat bubbles ---
  await page.evaluate(() => window.__openChat('n_merchant_bao'))
  await page.waitForSelector('[data-od-id="chat-modal"]', { timeout: 8000 })

  // Chờ bubble NPC hiện rõ (opacity ≥ 0.5) VÀ text khớp dòng cuối của chat-log —
  // bỏ qua bubble '…' tạm hiển thị trước khi greeting render vào log.
  const waitNpcBubbleSynced = () => page.waitForFunction(() => {
    const el = document.querySelector('[data-od-id="chat-modal"] .speech-bubble.right')
    if (el === null || parseFloat(getComputedStyle(el).opacity) < 0.5) return false
    const lines = document.querySelectorAll('[data-od-id="chat-modal"] .chat-log .line')
    const last = lines.length > 0 ? lines[lines.length - 1] : null
    const logText = last !== null ? (last.querySelector('.text')?.textContent.trim() ?? '') : ''
    return logText.length > 0 && el.textContent.trim() === logText
  }, undefined, { timeout: 5000 })
  await waitNpcBubbleSynced()

  const bubbleState = () => page.evaluate(() => {
    const pick = (side) => {
      const el = document.querySelector(`[data-od-id="chat-modal"] .speech-bubble.${side}`)
      if (!el) return null
      const cs = getComputedStyle(el)
      // Bubble chuyển class qua lại với transition opacity .25s → bubble vừa ẩn
      // vẫn còn mờ dần một lúc. Ngưỡng 0.5 = "hiện rõ với người chơi".
      return { visible: parseFloat(cs.opacity) >= 0.5, text: el.textContent.trim() }
    }
    const lines = [...document.querySelectorAll('[data-od-id="chat-modal"] .chat-log .line')]
    const last = lines[lines.length - 1]
    return { left: pick('left'), right: pick('right'), lastLog: last ? last.querySelector('.text')?.textContent.trim() : null }
  })

  const greet = await bubbleState()
  result.chat.greeting = greet
  ok('chat.greeting: NPC bubble visible, player bubble hidden', greet.right?.visible === true && greet.left?.visible === false, JSON.stringify(greet))
  ok('chat.greeting: NPC bubble text matches last log line', greet.right?.text === greet.lastLog, `"${greet.right?.text}" vs "${greet.lastLog}"`)
  await page.screenshot({ path: path.join(OUT, 'feedback-chat-npc.png') })

  // Chat-log cố ý chỉ render dòng NPC cuối → so bubble người chơi với label lựa chọn.
  const choiceLabel = (await page.locator('[data-od-id="chat-modal"] [data-chat-choice]').first().locator('.msg').textContent())?.trim() ?? ''
  await page.locator('[data-od-id="chat-modal"] [data-chat-choice]').first().click()
  // Chờ bubble người chơi hiện rõ rồi bubble NPC fade-out xong (không phụ thuộc timing cố định).
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-od-id="chat-modal"] .speech-bubble.left')
    return el !== null && parseFloat(getComputedStyle(el).opacity) >= 0.5
  }, undefined, { timeout: 3000 })
  await page.waitForFunction(() => {
    const el = document.querySelector('[data-od-id="chat-modal"] .speech-bubble.right')
    return el === null || parseFloat(getComputedStyle(el).opacity) < 0.5
  }, undefined, { timeout: 2000 })
  const playerTurn = await bubbleState()
  result.chat.playerTurn = playerTurn
  ok('chat.playerTurn: player bubble visible, NPC bubble hidden', playerTurn.left?.visible === true && playerTurn.right?.visible === false, JSON.stringify(playerTurn))
  ok('chat.playerTurn: player bubble shows the chosen line', playerTurn.left?.text === choiceLabel, `"${playerTurn.left?.text}" vs choice "${choiceLabel}"`)
  await page.screenshot({ path: path.join(OUT, 'feedback-chat-player.png') })

  // Reply NPC: chờ bubble phải hiện rõ, text khớp log, bubble trái đã tắt hẳn.
  await page.waitForFunction(() => {
    const r = document.querySelector('[data-od-id="chat-modal"] .speech-bubble.right')
    const l = document.querySelector('[data-od-id="chat-modal"] .speech-bubble.left')
    if (r === null || parseFloat(getComputedStyle(r).opacity) < 0.5) return false
    const lines = document.querySelectorAll('[data-od-id="chat-modal"] .chat-log .line')
    const last = lines.length > 0 ? lines[lines.length - 1] : null
    const logText = last !== null ? (last.querySelector('.text')?.textContent.trim() ?? '') : ''
    return logText.length > 0 && r.textContent.trim() === logText && (l === null || parseFloat(getComputedStyle(l).opacity) < 0.5)
  }, undefined, { timeout: 5000 })
  const reply = await bubbleState()
  result.chat.reply = reply
  ok('chat.reply: NPC bubble visible, player bubble hidden', reply.right?.visible === true && reply.left?.visible === false, JSON.stringify(reply))
  ok('chat.reply: NPC bubble text matches last log line', reply.right?.text === reply.lastLog, `"${reply.right?.text}" vs "${reply.lastLog}"`)
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
  // --- Fixes 1+2: combat overlay on the map ---
  const exitPin = page.locator('[data-testid="map-pin-3-1"]').last()
  if (await exitPin.count() > 0) await exitPin.click({ force: true })
  await page.waitForTimeout(1500)
  await page.locator('button[data-chip="fight"]').click()
  await page.waitForSelector('[data-testid="proto-combat"]', { timeout: 8000 })
  await page.waitForTimeout(500)

  const geo = await page.evaluate(() => {
    const rect = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const r = el.getBoundingClientRect()
      return { x: Math.round(r.x), y: Math.round(r.y), w: Math.round(r.width), h: Math.round(r.height), bottom: Math.round(r.bottom), right: Math.round(r.right) }
    }
    const bar = (sel) => {
      const el = document.querySelector(sel)
      if (!el) return null
      const i = el.querySelector('i')
      const cs = i ? getComputedStyle(i) : null
      return { bg: cs?.backgroundColor ?? null, trackWidth: cs ? Math.round(el.getBoundingClientRect().width) : 0, fillWidth: i ? Math.round(i.getBoundingClientRect().width) : 0 }
    }
    return {
      map: rect('.proto-map'),
      overlay: rect('[data-testid="proto-combat"]'),
      cmd: rect('.proto-command'),
      stage: rect('.proto-combat-overlay .combat-stage'),
      acts: rect('.proto-combat-overlay .acts'),
      playerBar: bar('.proto-combat-overlay .cbar.player'),
      enemyBar: bar('.proto-combat-overlay .combatant:nth-child(2) .cbar'),
      enemyName: document.querySelector('.proto-combat-overlay .ename')?.textContent.trim() ?? null,
    }
  })
  result.combat = geo
  console.log('COMBAT GEO ' + JSON.stringify(geo, null, 2))
  await page.screenshot({ path: path.join(OUT, 'feedback-combat.png') })

  ok('combat.enemyBar fill is danger-red oklch(0.48 0.18 25)', geo.enemyBar?.bg === 'oklch(0.48 0.18 25)', String(geo.enemyBar?.bg))
  ok('combat.enemyBar fill width > 0', (geo.enemyBar?.fillWidth ?? 0) > 0, String(geo.enemyBar?.fillWidth))
  ok('combat.playerBar fill is accent oklch(0.56 0.1 175)', geo.playerBar?.bg === 'oklch(0.56 0.1 175)', String(geo.playerBar?.bg))
  ok('combat.overlay sits inside .proto-map', geo.overlay !== null && geo.map !== null
    && geo.overlay.x >= geo.map.x - 1 && geo.overlay.y >= geo.map.y - 1
    && geo.overlay.right <= geo.map.right + 1 && geo.overlay.bottom <= geo.map.bottom + 1,
    `overlay=${JSON.stringify(geo.overlay)} map=${JSON.stringify(geo.map)}`)
  ok('combat.command bar below overlay (chips row not covered)', geo.cmd !== null && geo.overlay !== null && geo.cmd.y >= geo.overlay.bottom - 1,
    `cmd.y=${String(geo.cmd?.y)} overlay.bottom=${String(geo.overlay?.bottom)}`)
  ok('combat.acts row below fighters (enemy HUD above actions)', geo.acts !== null && geo.stage !== null && geo.acts.y >= geo.stage.bottom - 1,
    `acts.y=${String(geo.acts?.y)} stage.bottom=${String(geo.stage?.bottom)}`)

} catch (err) {
  result.errors.push(`fatal: ${err.message}`)
  console.error('FATAL', err.message)
}
fs.writeFileSync(path.join(OUT, 'verify-feedback-fixes-result.json'), JSON.stringify(result, null, 2))
await browser.close()
const failed = fails.length
console.log(`RESULT: ${failed === 0 && result.errors.length === 0 ? 'PASS' : 'FAIL'} (${Object.keys(result.checks).length - failed}/${Object.keys(result.checks).length} checks)`)
process.exit(failed === 0 && result.errors.length === 0 ? 0 : 2)
