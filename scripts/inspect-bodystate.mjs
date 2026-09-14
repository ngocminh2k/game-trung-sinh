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

await page.locator('.proto-leftrail .tabs button[data-tab="people"]').click()
await page.waitForTimeout(300)

const r = await page.evaluate(() => {
  const lr = document.querySelector('.proto-leftrail')
  const body = lr?.querySelector('.body')
  const btn = body?.querySelector('.proto-npc')
  const cs1 = lr ? getComputedStyle(lr) : null
  const cs2 = body ? getComputedStyle(body) : null
  return {
    lrWidth: cs1?.width,
    lrDisplay: cs1?.display,
    bodyDisplay: cs2?.display,
    btnExists: !!btn,
    btnOnclick: btn?.onclick?.toString().slice(0, 100),
    btnAttr: btn?.getAttribute('onclick'),
  }
})
console.log('state:', JSON.stringify(r, null, 2))
await browser.close()
