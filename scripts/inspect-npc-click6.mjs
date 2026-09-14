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

// Manually call setChatNpcId via window
await page.evaluate(() => {
  const w = window
  const proto = w.__proto
  console.log('proto from window:', proto)
  if (proto?.setChatNpcId) {
    proto.setChatNpcId('n_merchant_bao')
    console.log('called setChatNpcId')
  }
})
await page.waitForTimeout(800)
const r = await page.evaluate(() => ({
  backdrop: document.querySelectorAll('.proto-modal-backdrop').length,
  showBackdrop: document.querySelectorAll('.proto-modal-backdrop.show').length,
  chatModal: document.querySelectorAll('.proto-modal.chat').length,
}))
console.log('after manual set:', JSON.stringify(r))
await browser.close()
