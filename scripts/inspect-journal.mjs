// Inspect journal mode layout - check whether drawer covers the viewport
// or whether map shows through (z-index/visibility bug)
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

// Open journal
const journalBtn = page.locator('button.journal-launcher')
await journalBtn.first().click()
await page.waitForTimeout(800)

const info = await page.evaluate(() => {
  const w = window.innerWidth
  const h = window.innerHeight

  // Helper: get rect + computed style snapshot of element
  const pick = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const cs = getComputedStyle(el)
    const r = el.getBoundingClientRect()
    return {
      sel,
      visible: r.width > 0 && r.height > 0,
      rect: `${Math.round(r.width)}x${Math.round(r.height)} @(${Math.round(r.x)},${Math.round(r.y)})`,
      display: cs.display,
      visibility: cs.visibility,
      opacity: cs.opacity,
      position: cs.position,
      zIndex: cs.zIndex,
      top: cs.top,
      left: cs.left,
      right: cs.right,
      bottom: cs.bottom,
      backgroundColor: cs.backgroundColor,
      transform: cs.transform,
      pointerEvents: cs.pointerEvents,
    }
  }

  const journalScreen = document.querySelector('[data-testid="journal-screen"]')
  const worldContent = document.querySelector('[data-testid="world-content"]')
  const hud = document.querySelector('.hud-panel')
  const main = document.querySelector('main')

  // Find what's at center of viewport
  const centerEl = document.elementFromPoint(w / 2, h / 2)
  // Find what's at top-right (where map used to show through)
  const topRight = document.elementFromPoint(w - 100, 50)
  // Find what's at bottom-right
  const bottomRight = document.elementFromPoint(w - 100, h - 100)

  return {
    viewport: { w, h },
    journalScreen: pick('[data-testid="journal-screen"]'),
    worldContent: worldContent ? {
      hidden: worldContent.hasAttribute('hidden'),
      display: getComputedStyle(worldContent).display,
      visibility: getComputedStyle(worldContent).visibility,
      opacity: getComputedStyle(worldContent).opacity,
    } : null,
    hud: hud ? {
      display: getComputedStyle(hud).display,
      visibility: getComputedStyle(hud).visibility,
    } : null,
    main: main ? {
      display: getComputedStyle(main).display,
    } : null,
    journalOpen: journalScreen ? !journalScreen.hasAttribute('hidden') : null,
    elementAtCenter: centerEl ? {
      tag: centerEl.tagName,
      testid: centerEl.getAttribute('data-testid'),
      class: centerEl.className,
    } : null,
    elementAtTopRight: topRight ? {
      tag: topRight.tagName,
      testid: topRight.getAttribute('data-testid'),
      class: topRight.className,
    } : null,
    elementAtBottomRight: bottomRight ? {
      tag: bottomRight.tagName,
      testid: bottomRight.getAttribute('data-testid'),
      class: bottomRight.className,
    } : null,
  }
})

console.log(JSON.stringify(info, null, 2))
await browser.close()
