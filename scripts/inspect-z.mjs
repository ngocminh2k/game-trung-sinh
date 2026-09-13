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

const r = await page.evaluate(() => {
  const pin = document.querySelector('.proto-map .pin.npc')
  if (!pin) return { err: 'no pin' }
  const r = pin.getBoundingClientRect()
  // What is on top at click point?
  const elTop = document.elementFromPoint(r.x + r.width/2, r.y + r.height/2)
  return {
    pinRect: { x: r.x, y: r.y, w: r.width, h: r.height },
    elAtCenter: elTop?.outerHTML?.slice(0, 100),
  }
})
console.log(JSON.stringify(r, null, 2))
await browser.close()
