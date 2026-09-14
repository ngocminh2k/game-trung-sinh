import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', e => console.log('ERROR:', e.message))
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

const debug = await page.evaluate(() => {
  // Use native click on first .pin.npc
  const pin = document.querySelector('.pin.npc')
  if (pin === null) return { err: 'no pin' }
  pin.click()
  return { clicked: true, html: pin.outerHTML.slice(0, 100) }
})
console.log('native click:', JSON.stringify(debug))
await page.waitForTimeout(800)

const state = await page.evaluate(() => ({
  backdrop: document.querySelectorAll('.proto-modal-backdrop').length,
  showBackdrop: document.querySelectorAll('.proto-modal-backdrop.show').length,
  anyBackdrop: document.querySelectorAll('.modal-backdrop').length,
  chatModal: document.querySelectorAll('.proto-modal.chat').length,
  npcButtonClick: document.querySelectorAll('[data-npc]').length,
}))
console.log('after native click:', JSON.stringify(state))
await page.screenshot({ path: 'screenshots/debug-npc-click2.png' })
await browser.close()
