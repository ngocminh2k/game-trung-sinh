// V8: Snapshot with proper phase='playing' wait + locator.screenshot()
// Key fixes vs V6:
//  1. Wait for `<main>` after confirm (LoadingScreen → GameScreen transition)
//  2. Use locator.screenshot() to bypass the encoding issue that broke 04 in V6
//  3. Class-based selectors for panels that don't have data-testid (hud-panel, topbar)

import { chromium } from 'playwright'
import { mkdirSync, statSync } from 'node:fs'

const round = process.argv[2] ?? '0'
const outDir = `screenshots/round-${round}`
mkdirSync(outDir, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const results = []
function note (label, ok, extra = '') {
  results.push({ label, ok, extra })
  console.log(`[${ok ? 'OK' : '!!'}] ${label}${extra ? ' — ' + extra : ''}`)
}

async function shoot (file, locator) {
  try {
    await locator.screenshot({ path: `${outDir}/${file}` })
    const sz = statSync(`${outDir}/${file}`).size
    note(file, sz > 1000, `${sz} bytes`)
  } catch (err) {
    note(file, false, `screenshot error: ${err.message.slice(0, 80)}`)
  }
}

await page.goto('http://127.0.0.1:5173/')
await page.waitForTimeout(2500)

await shoot('01-initial.png', page)

const newGameBtn = page.getByTestId('menu-new-game')
if (await newGameBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
  await shoot('02-menu.png', page)
  await newGameBtn.click()
  await page.waitForTimeout(1000)
  await shoot('03-newgame.png', page)

  const firstSystem = page.locator('.system-tile').first()
  if (await firstSystem.isVisible({ timeout: 3000 }).catch(() => false)) {
    await firstSystem.click()
    const confirmBtn = page.getByTestId('newgame-confirm')
    if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmBtn.click()

      // === V8 FIX: LoadingScreen shows a "press to begin" hint after 2200ms,
      // then the user must click anywhere on the loading screen to call onDone.
      // We wait for .loading-screen to be visible, wait for ready hint (2.2s),
      // then click the loading screen to advance to phase='playing'.
      try {
        await page.waitForSelector('.loading-screen', { timeout: 5000 })
        await page.waitForFunction(
          () => document.querySelector('.loading-hint') !== null,
          { timeout: 5000 }
        )
        // Click anywhere on the loading screen to fire onDone
        await page.locator('.loading-screen').click()
        // Now wait for GameScreen to mount
        await page.waitForSelector('main', { timeout: 10000 })
        await page.waitForSelector('.topbar', { timeout: 10000 })
        await page.waitForSelector('.hud-panel', { timeout: 10000 })
        await page.waitForSelector('[data-testid="world-content"]', { timeout: 10000 })
        await page.waitForTimeout(500) // settle layout
      } catch (e) {
        note('transition', false, `did not reach playing phase: ${e.message.slice(0, 120)}`)
      }

      await shoot('04-gameplay-full.png', page)

      // Use locator.screenshot() for each panel (V8 fix vs V6 page.screenshot)
      await shoot('05-stage.png', page.locator('[data-testid="world-content"]'))
      await shoot('06-hud.png', page.locator('.hud-panel'))
      await shoot('07-topbar.png', page.locator('.topbar'))

      // Test journal button (V6 had no testid for it)
      const journalBtn = page.locator('button.journal-launcher')
      if (await journalBtn.count() > 0) {
        await journalBtn.first().click()
        await page.waitForTimeout(500)
        await shoot('09-journal-open.png', page)
      } else {
        note('09-journal-open', false, 'no .journal-launcher button found')
      }
    }
  }
}

await browser.close()

const failed = results.filter(r => !r.ok)
console.log(`\n=== ${results.length} shots, ${failed.length} failed ===`)
if (failed.length) {
  failed.forEach(f => console.log(`FAILED: ${f.label} — ${f.extra}`))
  process.exit(1)
}
