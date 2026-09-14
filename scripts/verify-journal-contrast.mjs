// Verify #journal-screen text/background contrast after the parchment fix.
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1461, height: 887 } })

await page.goto('http://127.0.0.1:5173/')
await page.waitForTimeout(2000)
await page.getByTestId('menu-new-game').click()
await page.waitForTimeout(800)
await page.locator('.system-tile').first().click()
await page.getByTestId('newgame-confirm').click()
await page.waitForSelector('.loading-screen', { timeout: 8000 })
await page.waitForFunction(() => document.querySelector('.loading-hint') !== null, { timeout: 8000 })
await page.locator('.loading-screen').click()
await page.waitForSelector('button.journal-launcher', { state: 'attached', timeout: 15000 })
await page.waitForTimeout(600)

const journal = page.locator('#journal-screen')
if (await journal.evaluate((el) => el.hasAttribute('hidden'))) {
  await page.keyboard.press('i')
}
await page.waitForTimeout(500)

const report = await page.evaluate(() => {
  const lum = (c) => {
    const [r, g, b] = c.map((v) => {
      const s = v / 255
      return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
    })
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const parse = (s) => (s.match(/[\d.]+/g) ?? []).slice(0, 3).map(Number)
  const ratio = (a, b) => {
    const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p)
    return (x + 0.05) / (y + 0.05)
  }
  const bgOf = (el) => {
    for (let n = el; n; n = n.parentElement) {
      const c = parse(getComputedStyle(n).backgroundColor)
      if (c.length === 3 && (getComputedStyle(n).backgroundColor.match(/[\d.]+\)$/) || [])[1] !== '0') return c
    }
    return [255, 255, 255]
  }
  const samples = [
    '#journal-screen .dock-heading h2',
    '#journal-screen .dock-tab',
    '#journal-screen .dock-tab.is-active',
    '#journal-screen .panel-heading h2',
    '#journal-screen .rpg-entry strong',
    '#journal-screen .rpg-entry span',
  ]
  return samples.map((sel) => {
    const el = document.querySelector(sel)
    if (!el) return { sel, missing: true }
    const fg = parse(getComputedStyle(el).color)
    const bg = bgOf(el)
    return { sel, color: `rgb(${fg.join(',')})`, bg: `rgb(${bg.join(',')})`, contrast: +ratio(fg, bg).toFixed(2) }
  })
})

console.log(JSON.stringify(report, null, 2))
await page.screenshot({ path: 'screenshots/journal-contrast.png' })
await browser.close()
