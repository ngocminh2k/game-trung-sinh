// Runtime smoke test for round 11.
// Captures console events, page errors, and screenshots at every major state.
import { chromium } from '@playwright/test'
import { mkdir, writeFile } from 'node:fs/promises'
import { existsSync } from 'node:fs'
import { join } from 'node:path'

const BASE = 'http://127.0.0.1:5173'
const SHOTS = 'screenshots'
const STATES = []
const ERRORS = []
const CONSOLE = []

function log(msg) {
  // eslint-disable-next-line no-console
  console.log(msg)
}

async function shot(page, name) {
  const path = join(SHOTS, `runtime-r11-${name}.png`)
  await page.screenshot({ path, fullPage: true })
  return path
}

async function main() {
  if (!existsSync(SHOTS)) await mkdir(SHOTS, { recursive: true })

  const browser = await chromium.launch({ headless: true })
  const context = await browser.newContext({
    viewport: { width: 1440, height: 900 },
    deviceScaleFactor: 1,
  })
  const page = await context.newPage()

  // Capture all console events and page errors
  page.on('console', (msg) => {
    const entry = `[${msg.type()}] ${msg.text()}`
    CONSOLE.push(entry)
    if (msg.type() === 'error' || msg.type() === 'warning') {
      ERRORS.push({ state: STATES[STATES.length - 1]?.name ?? '?', severity: msg.type(), text: msg.text() })
    }
  })
  page.on('pageerror', (err) => {
    const text = `${err.name}: ${err.message}\n${err.stack ?? ''}`
    ERRORS.push({ state: STATES[STATES.length - 1]?.name ?? '?', severity: 'pageerror', text })
  })

  // 1. Initial / menu
  await page.addInitScript(() => window.localStorage.clear())
  await page.goto(BASE, { waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(500)
  const mainMenuFile = await shot(page, '01-initial')
  STATES.push({ name: '01-initial', file: mainMenuFile, note: 'first paint after navigation' })

  // 2. Main menu (already there)
  await page.waitForSelector('[data-testid="main-menu"]', { timeout: 5000 }).catch(() => {})
  await page.waitForTimeout(500)
  const menuFile = await shot(page, '02-main-menu')
  STATES.push({ name: '02-main-menu', file: menuFile, note: 'main menu' })

  // 3. New game setup
  await page.locator('[data-testid="menu-new-game"]').click()
  await page.waitForSelector('[data-testid="new-game-screen"]', { timeout: 5000 }).catch(() => {})
  await page.waitForTimeout(500)
  const newGameFile = await shot(page, '03-newgame')
  STATES.push({ name: '03-newgame', file: newGameFile, note: 'new game setup (system grid, difficulty)' })

  // 4. Pick a system + difficulty, confirm
  await page.locator('[data-testid="system-tile-sys_battle"]').click().catch(() => {})
  await page.locator('[data-testid="difficulty-hard"]').click().catch(() => {})
  await page.waitForTimeout(300)
  await page.locator('[data-testid="newgame-confirm"]').click().catch(() => {})
  await page.waitForTimeout(500)
  const confirmFile = await shot(page, '04-after-confirm')
  STATES.push({ name: '04-after-confirm', file: confirmFile, note: 'after confirm new game' })

  // 5. Loading / begin screen -> press to start
  const beginBtn = page.getByRole('button', { name: /nhấn|press/i })
  await beginBtn.waitFor({ state: 'visible', timeout: 5000 }).catch(() => {})
  await beginBtn.click().catch(() => {})
  await page.waitForSelector('[data-testid="game-screen"]', { timeout: 5000 }).catch(() => {})
  await page.waitForTimeout(800)
  const playFile = await shot(page, '05-gameplay')
  STATES.push({ name: '05-gameplay', file: playFile, note: 'initial gameplay after press-to-begin' })

  // 6. Move via arrow key
  await page.keyboard.press('ArrowLeft').catch(() => {})
  await page.keyboard.press('ArrowLeft').catch(() => {})
  await page.waitForTimeout(500)
  const moveFile = await shot(page, '06-after-move')
  STATES.push({ name: '06-after-move', file: moveFile, note: 'after ArrowLeft x2' })

  // 7. Open journey journal
  const journalBtn = page.getByRole('button', { name: /Open Journey journal/i })
  await journalBtn.click().catch(() => {})
  await page.waitForTimeout(500)
  const journalFile = await shot(page, '07-journal')
  STATES.push({ name: '07-journal', file: journalFile, note: 'journey journal open' })

  // Close journal
  const back = page.getByRole('button', { name: /Back to world/i })
  await back.click().catch(() => {})
  await page.waitForTimeout(300)

  // 8. Open system/codex panel — try a "system" tab/button
  // Many RPG UIs have a "System" or "Codex" sidebar entry. Try common labels.
  const candidates = ['System', 'Codex', 'Cultivation', 'Character', 'Stats']
  let opened = false
  for (const c of candidates) {
    const el = page.getByRole('button', { name: new RegExp(c, 'i') }).first()
    if (await el.count()) {
      try { await el.click({ timeout: 1500 }); opened = true; break } catch {}
    }
  }
  await page.waitForTimeout(500)
  const codexFile = await shot(page, '08-codex-or-system')
  STATES.push({ name: '08-codex-or-system', file: codexFile, note: `tried to open side panel (opened=${opened})` })

  // Return to world
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(300)

  // 9. Trigger encounter
  const encBtn = page.getByRole('button', { name: /Start encounter/i })
  await encBtn.click().catch(() => {})
  await page.waitForTimeout(700)
  const encFile = await shot(page, '09-encounter')
  STATES.push({ name: '09-encounter', file: encFile, note: 'after Start encounter click' })

  // Try Defend
  const defendBtn = page.getByRole('button', { name: /^Defend$/ })
  if (await defendBtn.count()) {
    await defendBtn.click().catch(() => {})
    await page.waitForTimeout(500)
    await shot(page, '10-encounter-defend')
    STATES.push({ name: '10-encounter-defend', file: 'screenshots/runtime-r11-10-encounter-defend.png', note: 'after Defend click' })
  }

  // 10. Save/load path
  await page.keyboard.press('Escape').catch(() => {})
  await page.waitForTimeout(300)
  // Try to find a save slot / menu save action
  const saveBtn = page.getByRole('button', { name: /Save/i }).first()
  if (await saveBtn.count()) {
    await saveBtn.click().catch(() => {})
    await page.waitForTimeout(400)
    await shot(page, '11-save-menu')
    STATES.push({ name: '11-save-menu', file: 'screenshots/runtime-r11-11-save-menu.png', note: 'save menu opened' })
    const slot1 = page.locator('[data-testid="save-slot-1"]')
    if (await slot1.count()) {
      await slot1.click().catch(() => {})
      await page.waitForTimeout(300)
      await shot(page, '12-save-slot-1')
      STATES.push({ name: '12-save-slot-1', file: 'screenshots/runtime-r11-12-save-slot-1.png', note: 'click save slot 1' })
    }
  }

  // Reload and load
  await page.reload({ waitUntil: 'domcontentloaded' })
  await page.waitForTimeout(500)
  const reloadFile = await shot(page, '13-after-reload')
  STATES.push({ name: '13-after-reload', file: reloadFile, note: 'after reload (before clicking load)' })
  const loadBtn = page.locator('[data-testid="menu-load-game"]')
  if (await loadBtn.count()) {
    await loadBtn.click().catch(() => {})
    await page.waitForTimeout(500)
    await shot(page, '14-load-menu')
    STATES.push({ name: '14-load-menu', file: 'screenshots/runtime-r11-14-load-menu.png', note: 'load menu' })
    const slot1 = page.locator('[data-testid="save-slot-1"]')
    if (await slot1.count()) {
      await slot1.click().catch(() => {})
      await page.waitForTimeout(500)
      const begin2 = page.getByRole('button', { name: /nhấn|press/i })
      if (await begin2.count()) await begin2.click().catch(() => {})
      await page.waitForTimeout(800)
      await shot(page, '15-after-load')
      STATES.push({ name: '15-after-load', file: 'screenshots/runtime-r11-15-after-load.png', note: 'after load + begin' })
    }
  }

  // Dump console log
  await writeFile(join(SHOTS, 'runtime-r11-console.log'), CONSOLE.join('\n'), 'utf8')

  // Dump state summary
  const summary = STATES.map((s) => ({
    name: s.name,
    file: s.file,
    note: s.note,
  }))
  await writeFile(join(SHOTS, 'runtime-r11-states.json'), JSON.stringify(summary, null, 2), 'utf8')

  // Dump errors summary
  await writeFile(join(SHOTS, 'runtime-r11-errors.json'), JSON.stringify(ERRORS, null, 2), 'utf8')

  log('=== STATES ===')
  for (const s of STATES) log(`- ${s.name}: ${s.file} (${s.note})`)
  log(`\n=== ERROR COUNT: ${ERRORS.length} ===`)
  for (const e of ERRORS) log(`[${e.severity} @ ${e.state}] ${e.text}`)

  await browser.close()
}

main().catch((e) => {
  // eslint-disable-next-line no-console
  console.error('SMOKE FAIL:', e)
  process.exit(1)
})