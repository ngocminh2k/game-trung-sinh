// Measure #journal-screen after widening it into a full-stage modal.
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

const journal = page.locator('#journal-screen')
if (await journal.evaluate((el) => el.hasAttribute('hidden'))) {
  await page.keyboard.press('i')
}
await page.waitForTimeout(500)

// Switch to the inventory tab so the two-column layout is exercised.
await page.locator('#dock-tab-inventory').click()
await page.waitForTimeout(400)

const info = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return `${Math.round(r.width)}x${Math.round(r.height)} @(${Math.round(r.x)},${Math.round(r.y)})`
  }
  return {
    viewport: `${innerWidth}x${innerHeight}`,
    journal: pick('#journal-screen'),
    panel: pick('#journal-screen .dock-panel'),
    invLayout: pick('.inventory-layout'),
    inspector: pick('.inventory-inspector'),
  }
})
console.log(JSON.stringify(info, null, 2))

await page.screenshot({ path: 'screenshots/journal-wide.png' })
await browser.close()
