// Verify round-2 feedback: real HUD data, clickable travel pins, chat log height + bubble z-order.
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1461, height: 887 } })
const fails = []
const ok = (cond, msg) => { console.log(`${cond ? 'ok' : 'FAIL'}: ${msg}`); if (!cond) fails.push(msg) }

await page.goto('http://127.0.0.1:5173/')
await page.waitForTimeout(2000)
await page.getByTestId('menu-new-game').click()
await page.waitForTimeout(800)
await page.locator('.system-tile').first().click()
await page.getByTestId('newgame-confirm').click()
await page.waitForSelector('.loading-screen', { timeout: 8000 })
await page.waitForFunction(() => document.querySelector('.loading-hint') !== null, { timeout: 8000 })
await page.locator('.loading-screen').click()
await page.waitForSelector('.proto-righthud', { timeout: 15000 })
await page.waitForTimeout(600)

// --- 1. Right HUD real data ---
const hud = await page.evaluate(() => {
  const txt = (sel) => document.querySelector(sel)?.textContent ?? ''
  const tg = [...document.querySelectorAll('.proto-tetragrammaton .proto-tg .v')].map((e) => e.textContent)
  return {
    hp: txt('.proto-bar.hp .num'),
    qi: txt('.proto-bar.qi .num'),
    cult: txt('.proto-bar.cultivation .num'),
    cultWidth: document.querySelector('.proto-bar.cultivation .fill')?.getAttribute('style') ?? '',
    tg,
    realm: txt('.proto-portrait .realm'),
    quest: txt('.proto-quest .d'),
  }
})
console.log(JSON.stringify(hud))
ok(hud.hp === '100/100', `HP bar real (got ${hud.hp})`)
ok(hud.cult === '0/2', `TU VI real progress/threshold (got ${hud.cult})`)
ok(!hud.tg.includes('14') || !hud.tg.includes('11'), `tetragrammaton not hardcoded 14/11/09/07 (got ${hud.tg.join('/')})`)
ok(/Luyện Khí|Qi Refining/.test(hud.realm), `realm name real (got ${hud.realm})`)
ok(hud.quest.length > 5, `quest box shows objective (got ${JSON.stringify(hud.quest)})`)

// --- 2. Distant pin click travels (map change) ---
const before = await page.evaluate(() => ({
  pos: document.querySelector('.map-overlay-label small')?.textContent ?? '',
  loc: document.querySelector('.map-overlay-label strong')?.textContent ?? '',
}))
const pin = page.locator('[data-testid="map-pin-5-3"]') // Sơn môn Vân Ẩn (exit), xa player ở 3,3
const disabled = await pin.evaluate((el) => el.disabled)
ok(!disabled, 'far exit pin (5,3) is enabled (BFS path)')
await pin.click()
await page.waitForTimeout(1200)
const after = await page.evaluate(() => ({
  pos: document.querySelector('.map-overlay-label small')?.textContent ?? '',
  loc: document.querySelector('.map-overlay-label strong')?.textContent ?? '',
}))
console.log('travel:', JSON.stringify({ before, after }))
ok(after.pos !== before.pos || after.loc !== before.loc, `pin click moved player (pos ${before.pos} -> ${after.pos}, loc ${before.loc} -> ${after.loc})`)

// --- 3. Chat modal: log height + bubble z-order ---
await page.locator('.pin.npc').first().click()
await page.waitForSelector('.proto-modal.chat', { timeout: 5000 })
await page.waitForTimeout(500)
const chat = await page.evaluate(() => {
  const log = document.querySelector('.chat-log')
  const bubble = document.querySelector('.chat-stage .speech-bubble.show') ?? document.querySelector('.chat-stage .speech-bubble')
  const body = document.querySelector('.chat-stage .char .body')
  const z = (el) => Number(getComputedStyle(el).zIndex || 0)
  return {
    logH: log ? Math.round(log.getBoundingClientRect().height) : 0,
    bubbleZ: bubble ? getComputedStyle(bubble).zIndex : '',
    bodyZ: body ? getComputedStyle(body).zIndex : '',
    bubbleAbove: bubble && body ? bubble.getBoundingClientRect().top < body.getBoundingClientRect().top : false,
  }
})
console.log(JSON.stringify(chat))
ok(chat.logH >= 100, `chat-log height >= 100px (got ${chat.logH})`)
ok(chat.bubbleZ !== 'auto' && Number(chat.bubbleZ) >= 1, `speech-bubble has z-index (got ${chat.bubbleZ})`)
await page.screenshot({ path: 'screenshots/real-backend-chat.png' })

await browser.close()
console.log(fails.length === 0 ? 'RESULT: PASS' : `RESULT: ${String(fails.length)} FAILURES`)
process.exit(fails.length === 0 ? 0 : 1)
