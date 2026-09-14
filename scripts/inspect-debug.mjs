import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', e => console.log('ERR:', e.message))
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

// Force display debug button + click
await page.evaluate(() => {
  const btn = document.querySelector('[data-testid="debug-open-chat"]')
  if (btn) btn.style.display = 'inline'
})
const btnVisible = await page.locator('[data-testid="debug-open-chat"]').isVisible()
console.log('debug button visible:', btnVisible)
await page.locator('[data-testid="debug-open-chat"]').click()
await page.waitForTimeout(800)
const r = await page.evaluate(() => ({
  backdrop: document.querySelectorAll('.proto-modal-backdrop').length,
  showBackdrop: document.querySelectorAll('.proto-modal-backdrop.show').length,
}))
console.log('after debug button click:', JSON.stringify(r))
await browser.close()
