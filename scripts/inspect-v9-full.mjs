// V9: Full-page screenshot to see ALL rendered content (not just viewport)
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto('http://127.0.0.1:5173/')
await page.waitForTimeout(2500)
await page.getByTestId('menu-new-game').click()
await page.waitForTimeout(1000)
await page.locator('.system-tile').first().click()
await page.waitForTimeout(300)
await page.getByTestId('newgame-confirm').click()

try {
  await page.waitForSelector('.loading-screen', { timeout: 5000 })
  await page.waitForFunction(
    () => document.querySelector('.loading-hint') !== null,
    { timeout: 5000 }
  )
  await page.locator('.loading-screen').click()
  await page.waitForSelector('main', { timeout: 10000 })
  await page.waitForSelector('.topbar', { timeout: 10000 })
  await page.waitForSelector('.hud-panel', { timeout: 10000 })
  await page.waitForSelector('[data-testid="world-content"]', { timeout: 10000 })
  await page.waitForTimeout(500)
} catch (e) {
  console.log('Phase transition failed:', e.message)
  await browser.close()
  process.exit(1)
}

// Full-page screenshot
await page.screenshot({ path: 'screenshots/v9-fullpage.png', fullPage: true })
console.log('Saved screenshots/v9-fullpage.png')

// Viewport-only screenshot
await page.screenshot({ path: 'screenshots/v9-viewport.png', fullPage: false })
console.log('Saved screenshots/v9-viewport.png')

// Read body scroll dimensions
const dim = await page.evaluate(() => ({
  bodyScrollW: document.body.scrollWidth,
  bodyScrollH: document.body.scrollHeight,
  bodyClientW: document.body.clientWidth,
  bodyClientH: document.body.clientHeight,
  htmlScrollW: document.documentElement.scrollWidth,
  htmlScrollH: document.documentElement.scrollHeight,
  mainRect: (() => { const r = document.querySelector('main')?.getBoundingClientRect(); return r ? { w: r.width, h: r.height, x: r.x, y: r.y } : null })()
}))
console.log('Dimensions:', JSON.stringify(dim, null, 2))

await browser.close()
