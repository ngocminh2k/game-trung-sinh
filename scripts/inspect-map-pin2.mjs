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

// Try direct call to window.__openChat
const r1 = await page.evaluate(() => {
  const w = window
  const fn = w.__openChat
  return { hasFn: typeof fn, type: typeof fn }
})
console.log('window.__openChat:', JSON.stringify(r1))

await page.evaluate(() => { window.__openChat('n_merchant_bao') })
await page.waitForTimeout(800)
const r2 = await page.evaluate(() => ({
  backdrop: document.querySelectorAll('.proto-modal-backdrop').length,
  show: document.querySelectorAll('.proto-modal-backdrop.show').length,
  chat: document.querySelectorAll('.proto-modal.chat').length,
}))
console.log('after window call:', JSON.stringify(r2))
await browser.close()
