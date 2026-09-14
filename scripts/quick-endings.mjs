// Quick Playwright driver: load several endings and capture screenshots.
// Uses the existing dev server on http://127.0.0.1:5173

import { chromium } from 'playwright'
import { writeFileSync } from 'node:fs'
import { join } from 'node:path'

const BASE = 'http://127.0.0.1:5173'
const SHOTS_DIR = 'F:/game-trung-sinh/ending-shots'
const SLOT_KEY = 'phe-can-ky:slots'
const ACTIVE_KEY = 'phe-can-ky:active-slot'

// Builds a session JSON for an ending: imports engine to construct the state
async function loadEnding(page, label, endingFlagPatch, storyChoiceRegex, shotsBase) {
  // Dynamic import to use TypeScript engine via on-the-fly transpile is messy;
  // instead we inject a minimal state directly. The opening path needs the
  // game booted through system pick + an action that sets story_scene.
  // Easier: use the localStorage-relative "Click from menu" flow with crafted
  // story flags that the engine respects via the quest/story system.

  // Preload empty slot
  await page.addInitScript(({ slotsKey, activeKey }) => {
    try { window.localStorage.removeItem(slotsKey) } catch (_) {}
    try { window.localStorage.removeItem(activeKey) } catch (_) {}
  }, { slotsKey: SLOT_KEY, activeKey: ACTIVE_KEY })

  await page.goto(BASE + '/')
  await page.waitForLoadState('domcontentloaded')

  // Click New Game
  await page.getByTestId('menu-new-game').click()
  // Pick the first system (Battle) for default flow
  await page.getByTestId('system-tile-sys_battle').click()
  // Sign covenant
  await page.getByTestId('newgame-confirm').click()
  // Press to enter (loading screen button; role=button, accessible)
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  // Wait until game-screen appears (it replaces loading after click)
  await page.waitForSelector('[data-testid="game-screen"]', { timeout: 15000 })
  await page.screenshot({ path: join(SHOTS_DIR, `${shotsBase}-01-boot.png`), fullPage: true })

  // Inject ending flags directly into the live localStorage save and reload
  const patched = await page.evaluate(({ slotsKey, activeKey, patch }) => {
    const raw = window.localStorage.getItem(slotsKey)
    if (raw === null) return { ok: false, reason: 'no-slot' }
    const slots = JSON.parse(raw)
    const slot = slots['1']
    if (!slot) return { ok: false, reason: 'no-slot-1' }
    slot.session.game.flags = { ...slot.session.game.flags, ...patch }
    window.localStorage.setItem(slotsKey, JSON.stringify(slots))
    window.localStorage.setItem(activeKey, '1')
    return { ok: true, flagKeys: Object.keys(slot.session.game.flags) }
  }, { slotsKey: SLOT_KEY, activeKey: ACTIVE_KEY, patch: endingFlagPatch })
  console.log(`[${label}] patch result:`, JSON.stringify(patched))

  // Reload to pick up new flags
  await page.reload()
  await page.waitForLoadState('domcontentloaded')
  await page.waitForTimeout(1000)
  await page.screenshot({ path: join(SHOTS_DIR, `${shotsBase}-debug-after-reload.png`), fullPage: true })
  // After reload, loading screen still shows — click to advance
  try {
    await page.getByRole('button', { name: /nhấn|press/i }).click({ timeout: 5000 })
  } catch (_) {}
  await page.waitForTimeout(500)
  await page.screenshot({ path: join(SHOTS_DIR, `${shotsBase}-debug-after-click.png`), fullPage: true })
  await page.waitForSelector('[data-testid="game-screen"]', { timeout: 15000 })

  // Now trigger the story choice that resolves to the ending
  try {
    await page.getByRole('button', { name: 'Open Journey journal' }).click({ timeout: 5000 })
    await page.getByRole('tab', { name: /People here/ }).click({ timeout: 5000 })
    await page.getByRole('button', { name: 'Talk' }).first().click({ timeout: 5000 })
  } catch (_) {
    // panel may already be open
  }
  try {
    await page.getByRole('button', { name: storyChoiceRegex }).click({ timeout: 5000 })
  } catch (e) {
    console.log(`[${label}] could not click story choice: ${e.message}`)
  }

  await page.waitForTimeout(800)
  await page.screenshot({ path: join(SHOTS_DIR, `${shotsBase}-02-after-choice.png`), fullPage: true })

  // Look for ending banner
  const banner = page.locator('.ending-banner')
  let endingText = ''
  try {
    await banner.waitFor({ state: 'visible', timeout: 6000 })
    endingText = (await banner.textContent() || '').trim()
  } catch (_) {
    endingText = '(no ending banner found)'
  }
  return { label, endingText }
}

async function main() {
  // Ensure shots dir
  try { writeFileSync(join(SHOTS_DIR, '.keep'), '') } catch (_) {}

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({ viewport: { width: 1280, height: 800 } })
  const page = await context.newPage()

  const results = []

  // Ending: Spring for an Enemy (mercy road)
  results.push(await loadEnding(page, 'Spring for an Enemy',
    { story_scene: 'scene_ascension', story_mercy: 3, story_khoa_trusted: true },
    /give the choice/i,
    '01-spring-for-enemy'
  ))

  // Ending: Rootless Star (truth road)
  results.push(await loadEnding(page, 'Rootless Star',
    { story_scene: 'scene_ascension', story_truth: 3 },
    /open the mirror/i,
    '02-rootless-star'
  ))

  // Ending: Borrowed Face (power road)
  results.push(await loadEnding(page, 'Borrowed Face',
    { story_scene: 'scene_ascension', story_power: 3 },
    /open the mirror/i,
    '03-borrowed-face'
  ))

  // Ending: Iron Lantern (default)
  results.push(await loadEnding(page, 'Iron Lantern',
    { story_scene: 'scene_ascension' },
    /open the mirror/i,
    '04-iron-lantern'
  ))

  await browser.close()
  console.log('\n=== ENDINGS REACHED ===')
  for (const r of results) {
    console.log(`- ${r.label}: ${r.endingText}`)
  }
}

main().catch(e => { console.error(e); process.exit(1) })