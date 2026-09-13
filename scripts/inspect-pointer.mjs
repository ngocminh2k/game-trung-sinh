import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://127.0.0.1:5177/')
await page.waitForTimeout(2000)
await page.getByTestId('menu-new-game').click()
await page.waitForSelector('.system-tile', { timeout: 5000 })
await page.locator('.system-tile').first().click()
await page.waitForTimeout(300)
await page.getByTestId('newgame-confirm').click()
await page.waitForSelector('.loading-screen', { timeout: 5000 })
await page.locator('.loading-screen').click()
await page.waitForSelector('.proto-topbar', { timeout: 10000 })
await page.waitForTimeout(800)
await page.locator('.proto-leftrail .tabs button[data-tab="people"]').click()
await page.waitForTimeout(300)

const r = await page.evaluate(() => {
  const btn = document.querySelector('.proto-leftrail .body .proto-npc')
  if (!btn) return { err: 'no btn' }
  const cs = getComputedStyle(btn)
  // Find what element is at btn center
  const r = btn.getBoundingClientRect()
  const elAt = document.elementFromPoint(r.x + r.width/2, r.y + r.height/2)
  return {
    pointerEvents: cs.pointerEvents,
    elAtCenter: elAt?.tagName + '.' + (elAt?.className?.toString().slice(0, 60) ?? ''),
    sameAsBtn: elAt === btn,
  }
})
console.log(JSON.stringify(r, null, 2))
await browser.close()
