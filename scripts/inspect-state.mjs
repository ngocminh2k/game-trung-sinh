// V7-debug: simpler inspection — just navigate and dump body
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

page.on('console', msg => console.log(`[browser ${msg.type()}]`, msg.text()))
page.on('pageerror', err => console.log('[pageerror]', err.message))

await page.goto('http://127.0.0.1:5173/')
await page.waitForTimeout(3000)

const initial = await page.evaluate(() => ({
  url: location.href,
  title: document.title,
  bodyClass: document.body.className,
  dataTestIds: Array.from(document.querySelectorAll('[data-testid]')).map(el => el.getAttribute('data-testid')),
  hasMain: !!document.querySelector('main'),
  hasGameScreen: !!document.querySelector('[data-testid="game-screen"]'),
  hasMenuNewGame: !!document.querySelector('[data-testid="menu-new-game"]'),
  bodyChildren: Array.from(document.body.children).map(el => `${el.tagName}.${el.className}`.slice(0, 60))
}))
console.log('=== INITIAL ===', JSON.stringify(initial, null, 2))

const newGameBtn = page.getByTestId('menu-new-game')
console.log('newGameBtn visible:', await newGameBtn.isVisible().catch(e => 'ERR ' + e.message))
await newGameBtn.click()
await page.waitForTimeout(1500)

const afterNewGame = await page.evaluate(() => ({
  hasSystemTiles: document.querySelectorAll('.system-tile').length,
  hasNewgameConfirm: !!document.querySelector('[data-testid="newgame-confirm"]'),
  dataTestIds: Array.from(document.querySelectorAll('[data-testid]')).map(el => el.getAttribute('data-testid'))
}))
console.log('=== AFTER NEW GAME CLICK ===', JSON.stringify(afterNewGame, null, 2))

const firstSystem = page.locator('.system-tile').first()
console.log('firstSystem visible:', await firstSystem.isVisible().catch(e => 'ERR ' + e.message))
if (await firstSystem.isVisible().catch(() => false)) {
  await firstSystem.click()
  await page.waitForTimeout(500)
}

const confirmBtn = page.getByTestId('newgame-confirm')
console.log('confirmBtn visible:', await confirmBtn.isVisible().catch(e => 'ERR ' + e.message))
if (await confirmBtn.isVisible().catch(() => false)) {
  await confirmBtn.click()
  await page.waitForTimeout(3000)
}

const afterConfirm = await page.evaluate(() => ({
  url: location.href,
  hasMain: !!document.querySelector('main'),
  hasGameScreen: !!document.querySelector('[data-testid="game-screen"]'),
  hasHudPanel: !!document.querySelector('.hud-panel'),
  hasTopbar: !!document.querySelector('.topbar'),
  hasWorldContent: !!document.querySelector('[data-testid="world-content"]'),
  hasJournalScreen: !!document.querySelector('[data-testid="journal-screen"]'),
  bodyChildren: Array.from(document.body.children).map(el => `${el.tagName}.${el.className}`.slice(0, 60)),
  dataTestIds: Array.from(document.querySelectorAll('[data-testid]')).map(el => el.getAttribute('data-testid')),
  mainInnerHTML: (document.querySelector('main')?.innerHTML ?? '').slice(0, 500)
}))
console.log('=== AFTER CONFIRM ===', JSON.stringify(afterConfirm, null, 2))

await browser.close()
