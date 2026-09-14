// V9: After V8's loading-screen click → reach phase=playing → measure real boxes
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

page.on('pageerror', e => console.log('[pageerror]', e.message))
page.on('console', m => { if (m.type() === 'error') console.log('[err]', m.text()) })

await page.goto('http://127.0.0.1:5173/')
await page.waitForTimeout(2500)
await page.getByTestId('menu-new-game').click()
await page.waitForTimeout(1000)
await page.locator('.system-tile').first().click()
await page.waitForTimeout(300)
await page.getByTestId('newgame-confirm').click()

// V8 fix: click loading-screen to call onDone
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
  console.log('=== REACHED PLAYING PHASE ===')
} catch (e) {
  console.log('=== FAILED TO REACH PLAYING ===', e.message)
  await browser.close()
  process.exit(1)
}

const targets = [
  { sel: '.topbar', label: 'topbar' },
  { sel: '[data-testid="world-content"]', label: 'world-content' },
  { sel: '.hud-panel', label: 'hud-panel (right)' },
  { sel: 'main', label: 'main' },
  { sel: '.drawer-panel', label: 'drawer-panel' },
  { sel: '.stage-notices', label: 'stage-notices' },
  { sel: '[data-testid="chronicle-panel"]', label: 'chronicle-panel' },
  { sel: '.command-bar', label: 'command-bar' },
  { sel: '.map-context', label: 'map-context' },
  { sel: 'button.journal-launcher', label: 'journal-launcher' }
]

for (const { sel, label } of targets) {
  const info = await page.evaluate((s) => {
    const el = document.querySelector(s)
    if (!el) return { found: false }
    const r = el.getBoundingClientRect()
    const cs = window.getComputedStyle(el)
    return {
      found: true,
      w: Math.round(r.width), h: Math.round(r.height),
      x: Math.round(r.x), y: Math.round(r.y),
      display: cs.display, visibility: cs.visibility, position: cs.position,
      hidden: el.getAttribute('hidden')
    }
  }, sel)
  console.log(`\n[${label}] ${sel}`)
  if (!info.found) { console.log('  → NOT FOUND'); continue }
  console.log(`  rect: ${info.w}×${info.h} at (${info.x}, ${info.y})`)
  console.log(`  display=${info.display} visibility=${info.visibility} position=${info.position} hidden=${info.hidden}`)
}

await browser.close()
