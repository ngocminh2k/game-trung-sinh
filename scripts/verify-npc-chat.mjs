// Verify NPC chat: display names (not raw ids) + generic dialogue for scriptless NPCs.
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto('http://127.0.0.1:5173/')
await page.waitForTimeout(2000)
await page.getByTestId('menu-new-game').click()
await page.waitForTimeout(800)
await page.locator('.system-tile').first().click()
await page.getByTestId('newgame-confirm').click()
await page.waitForSelector('.loading-screen', { timeout: 8000 })
await page.waitForFunction(() => document.querySelector('.loading-hint') !== null, { timeout: 8000 })
await page.locator('.loading-screen').click()
await page.waitForSelector('button.journal-launcher', { state: 'attached', timeout: 15000 })
await page.waitForTimeout(600)

// Open chat with an NPC that has no branching script (village militia guard).
// Same path the left-rail people tab uses.
await page.evaluate(() => window.__openChat('n_guard_truong'))
await page.waitForSelector('[data-od-id="chat-modal"]', { timeout: 8000 })
await page.waitForTimeout(1200) // let the greeting bubble land

const read = () => page.evaluate(() => {
  const plates = [...document.querySelectorAll('[data-od-id="chat-modal"] .nameplate')].map((e) => e.textContent.trim())
  return {
    nameplate: plates[1] ?? null,
    playerNameplate: plates[0] ?? null,
    lines: [...document.querySelectorAll('[data-od-id="chat-modal"] .chat-log .line')].map((e) => ({
      who: e.querySelector('.who')?.textContent.trim(),
      text: e.querySelector('.text')?.textContent.trim(),
    })),
    choices: [...document.querySelectorAll('[data-od-id="chat-modal"] [data-chat-choice]')].map((e) => e.textContent.trim()),
  }
})

const before = await read()
console.log('BEFORE', JSON.stringify(before, null, 2))

const assert = (cond, msg) => { if (!cond) { console.error('FAIL:', msg); process.exitCode = 1 } else console.log('ok:', msg) }

assert(before.nameplate !== null && !before.nameplate.startsWith('n_'), `nameplate is a display name, not an id (got "${before.nameplate}")`)
assert(before.nameplate === 'Dân binh Trường', `nameplate matches NPCS nameVi (got "${before.nameplate}")`)
assert(before.playerNameplate === 'Lâm Phàm', `player nameplate (got "${before.playerNameplate}")`)
assert(before.lines.length >= 1 && !before.lines.some((l) => l.who?.startsWith('n_')), 'chat-log .who shows no raw ids')
assert(before.lines[0]?.text?.length > 10 && !before.lines.some((l) => l.text?.includes('chưa có hội thoại')), 'chat-log has a real line, no dead-end message')
assert(before.choices.length >= 1, `>=1 choice button (got ${before.choices.length})`)

// Clicking a choice must append more lines.
await page.locator('[data-od-id="chat-modal"] [data-chat-choice]').first().click()
await page.waitForTimeout(2600)
const after = await read()
console.log('AFTER', JSON.stringify(after, null, 2))
assert(after.lines.length > before.lines.length, `choice appended lines (${before.lines.length} -> ${after.lines.length})`)
assert(!after.lines.some((l) => l.text?.includes('chưa có hội thoại')), 'still no dead-end message after choosing')

await page.screenshot({ path: 'screenshots/npc-chat-fixed.png' })
await browser.close()
console.log(process.exitCode === 1 ? 'RESULT: FAIL' : 'RESULT: PASS')
