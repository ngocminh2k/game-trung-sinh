// V12-debug: dump computed grid info for .game-shell + .world-content + .game-grid
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
await page.waitForSelector('.loading-screen', { timeout: 5000 })
await page.waitForFunction(() => document.querySelector('.loading-hint') !== null, { timeout: 5000 })
await page.locator('.loading-screen').click()
await page.waitForSelector('.hud-panel', { timeout: 10000 })
await page.waitForTimeout(500)

const info = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    return {
      sel,
      rect: `${Math.round(r.width)}x${Math.round(r.height)} @(${Math.round(r.x)},${Math.round(r.y)})`,
      display: cs.display,
      height: cs.height,
      minHeight: cs.minHeight,
      gridTemplateRows: cs.gridTemplateRows,
      gridTemplateColumns: cs.gridTemplateColumns,
      alignItems: cs.alignItems,
      alignSelf: cs.alignSelf,
      flex: cs.flex,
      boxSizing: cs.boxSizing,
    }
  }
  return {
    viewport: { w: window.innerWidth, h: window.innerHeight },
    shell: pick('.game-shell'),
    world: pick('.world-content'),
    grid: pick('.game-grid'),
    map: pick('.map-panel'),
    hud: pick('.hud-panel'),
    dock: pick('.system-dock'),
    // how many rows does shell actually have?
    shellChildren: [...document.querySelector('.game-shell').children].map(c => `${c.tagName}.${c.className}`.slice(0, 40)),
  }
})
console.log(JSON.stringify(info, null, 2))
await browser.close()
