// V7: Inspect layout boxes that returned null boundingBox in V6 round-1
// We use page.evaluate() to read computed styles + rects directly from the browser.

import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto('http://127.0.0.1:5173/')
await page.waitForTimeout(2500)

const newGameBtn = page.getByTestId('menu-new-game')
if (!(await newGameBtn.isVisible({ timeout: 5000 }).catch(() => false))) {
  console.error('menu-new-game not visible, aborting')
  await browser.close()
  process.exit(1)
}
await newGameBtn.click()
await page.waitForTimeout(1000)
const firstSystem = page.locator('.system-tile').first()
if (await firstSystem.isVisible({ timeout: 3000 }).catch(() => false)) {
  await firstSystem.click()
}
const confirmBtn = page.getByTestId('newgame-confirm')
if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
  await confirmBtn.click()
}
await page.waitForTimeout(2500)

console.log('--- INSPECTING 0x0 CANDIDATES ---')

const targets = [
  { sel: '.hud-panel', testid: 'hud-panel' },
  { sel: '.topbar', testid: 'topbar' },
  { sel: '[data-testid="world-content"]', testid: 'world-content' },
  { sel: '[data-testid="journal-screen"]', testid: 'journal-screen' },
  { sel: '[data-testid="game-screen"]', testid: 'game-screen' },
  { sel: 'main', testid: 'main-tag' }
]

for (const { sel, testid } of targets) {
  const info = await page.evaluate((s) => {
    const el = document.querySelector(s)
    if (!el) return { found: false }
    const rect = el.getBoundingClientRect()
    const cs = window.getComputedStyle(el)
    return {
      found: true,
      rect: { w: rect.width, h: rect.height, x: rect.x, y: rect.y },
      display: cs.display,
      visibility: cs.visibility,
      position: cs.position,
      gridArea: cs.gridArea,
      gridColumn: cs.gridColumn,
      gridRow: cs.gridRow,
      offsetParent: el.offsetParent?.tagName ?? null,
      hidden: el.hidden,
      attrHidden: el.getAttribute('hidden'),
      classes: el.className,
      parentTag: el.parentElement?.tagName ?? null,
      parentClasses: el.parentElement?.className ?? null
    }
  }, sel)
  console.log(`\n[${testid}] ${sel}`)
  if (!info.found) {
    console.log('  → NOT FOUND in DOM')
    continue
  }
  console.log('  rect:', info.rect)
  console.log('  display:', info.display, ' visibility:', info.visibility, ' position:', info.position)
  console.log('  gridArea:', info.gridArea, ' gridColumn:', info.gridColumn, ' gridRow:', info.gridRow)
  console.log('  offsetParent:', info.offsetParent)
  console.log('  hidden attr:', info.attrHidden)
  console.log('  classes:', info.classes)
  console.log('  parent:', info.parentTag, info.parentClasses)
}

console.log('\n--- PARENT GRID INSPECTION ---')
const mainGrid = await page.evaluate(() => {
  const main = document.querySelector('main')
  if (!main) return null
  const cs = window.getComputedStyle(main)
  return {
    display: cs.display,
    gridTemplateAreas: cs.gridTemplateAreas,
    gridTemplateColumns: cs.gridTemplateColumns,
    gridTemplateRows: cs.gridTemplateRows,
    width: main.getBoundingClientRect().width,
    height: main.getBoundingClientRect().height
  }
})
console.log('main.grid:', mainGrid)

await browser.close()
