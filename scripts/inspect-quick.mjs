import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', e => console.log('ERR:', e.message))
page.on('console', m => { if (m.type() === 'error') console.log('CONSOLE-ERR:', m.text()) })
await page.goto('http://127.0.0.1:5177/')
await page.waitForTimeout(2000)
await page.getByTestId('menu-new-game').click()
await page.waitForSelector('.system-tile', { timeout: 5000 })
await page.locator('.system-tile').first().click()
await page.waitForTimeout(300)
await page.getByTestId('newgame-confirm').click()
await page.waitForSelector('.loading-screen', { timeout: 5000 })
await page.locator('.loading-screen').click()
await page.waitForTimeout(2500)
const r = await page.evaluate(() => ({
  hasProtoTopbar: !!document.querySelector('.proto-topbar'),
  hasProtoGrid: !!document.querySelector('.proto-grid-main'),
  bodyText: document.body.innerText.slice(0, 200),
}))
console.log(JSON.stringify(r))
await page.screenshot({ path: 'screenshots/debug-current.png' })
await browser.close()
