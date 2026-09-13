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
await page.waitForTimeout(500)

const playing = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return `${Math.round(r.width)}x${Math.round(r.height)} @(${Math.round(r.x)},${Math.round(r.y)})`
  }
  return {
    topbar: pick('.proto-topbar'),
    leftrail: pick('.proto-leftrail'),
    center: pick('.proto-center'),
    command: pick('.proto-command'),
    righthud: pick('.proto-righthud'),
    ticker: pick('.proto-ticker'),
    map: pick('.proto-map'),
    gridCols: getComputedStyle(document.querySelector('.proto-grid-main')).gridTemplateColumns,
    playerMarker: pick('[data-testid="player-marker"]'),
    currency: {
      gold: document.querySelector('[data-testid="currency-gold"] .v')?.textContent,
      silver: document.querySelector('[data-testid="currency-silver"] .v')?.textContent,
      spirit: document.querySelector('[data-testid="currency-spirit-stones"] .v')?.textContent,
    },
    hpBar: document.querySelector('.proto-bar.hp .fill')?.style.width,
    qiBar: document.querySelector('.proto-bar.qi .fill')?.style.width,
  }
})
console.log('playing:', JSON.stringify(playing, null, 2))
await page.screenshot({ path: 'screenshots/proto-shell-main.png' })
await browser.close()
