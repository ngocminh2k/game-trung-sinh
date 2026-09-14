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

// Native click via evaluate
await page.evaluate(() => {
  const pin = document.querySelector('.proto-map .pin.npc')
  if (pin) pin.click()
})
await page.waitForTimeout(800)
const r = await page.evaluate(() => ({ backdrop: document.querySelectorAll('.proto-modal-backdrop').length }))
console.log('after native click:', JSON.stringify(r))

// Try via elementFromPoint
const r2 = await page.evaluate(() => {
  const pin = document.querySelector('.proto-map .pin.npc')
  if (!pin) return { err: 'no pin' }
  const rect = pin.getBoundingClientRect()
  const x = rect.x + rect.width/2
  const y = rect.y + rect.height/2
  const el = document.elementFromPoint(x, y)
  return { x, y, elTag: el?.tagName, elClass: el?.className?.toString().slice(0, 60), isPin: el === pin }
})
console.log('elementFromPoint:', JSON.stringify(r2))

// Force click via mouse event
await page.mouse.click(r2.x, r2.y)
await page.waitForTimeout(800)
const r3 = await page.evaluate(() => ({ backdrop: document.querySelectorAll('.proto-modal-backdrop').length }))
console.log('after mouse.click:', JSON.stringify(r3))
await browser.close()
