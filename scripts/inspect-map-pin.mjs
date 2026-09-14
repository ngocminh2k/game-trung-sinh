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

const r = await page.evaluate(() => {
  const pin = document.querySelector('.proto-map .pin.npc')
  return {
    found: !!pin,
    html: pin?.outerHTML?.slice(0, 200),
    onclick: pin?.onclick?.toString().slice(0, 100),
  }
})
console.log('map pin:', JSON.stringify(r, null, 2))

await page.locator('.proto-map .pin.npc').first().click({ force: true })
await page.waitForTimeout(800)
const after = await page.evaluate(() => ({ backdrop: document.querySelectorAll('.proto-modal-backdrop').length }))
console.log('after map pin click:', JSON.stringify(after))
await browser.close()
