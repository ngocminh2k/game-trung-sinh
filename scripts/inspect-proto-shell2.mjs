import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://127.0.0.1:5177/')
await page.waitForTimeout(2000)
await page.getByTestId('menu-new-game').click()
await page.waitForTimeout(1500)
const newgame = await page.evaluate(() => ({
  tiles: document.querySelectorAll('.system-tile').length,
  confirms: document.querySelectorAll('[data-testid="newgame-confirm"]').length,
  body: document.body.innerText.slice(0, 200),
}))
console.log('newgame:', JSON.stringify(newgame))
await page.screenshot({ path: 'screenshots/proto-shell-newgame.png' })
await browser.close()
