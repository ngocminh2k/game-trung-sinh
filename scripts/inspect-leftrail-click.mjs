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

// Switch to People tab
await page.locator('.proto-leftrail .tabs button[data-tab="people"]').click()
await page.waitForTimeout(300)

// Click first npc button via DOM
const before = await page.evaluate(() => ({ backdrop: document.querySelectorAll('.proto-modal-backdrop').length }))
console.log('before:', JSON.stringify(before))

const clickResult = await page.evaluate(() => {
  const btn = document.querySelector('.proto-leftrail .body .proto-npc')
  if (!btn) return { err: 'no button' }
  const r = btn.getBoundingClientRect()
  btn.click()
  return { clicked: true, x: r.x, y: r.y, w: r.width, h: r.height, text: btn.textContent?.trim().slice(0, 30) }
})
console.log('clicked:', JSON.stringify(clickResult))
await page.waitForTimeout(800)
const after = await page.evaluate(() => ({ backdrop: document.querySelectorAll('.proto-modal-backdrop').length }))
console.log('after:', JSON.stringify(after))
await browser.close()
