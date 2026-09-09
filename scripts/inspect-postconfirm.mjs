// V8-debug: after confirm + wait 4s, what is the actual DOM?
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

// Try various wait strategies
for (let i = 1; i <= 6; i++) {
  await page.waitForTimeout(1000)
  const state = await page.evaluate(() => ({
    hasMain: !!document.querySelector('main'),
    hasGameScreen: !!document.querySelector('[data-testid="game-screen"]'),
    hasTopbar: !!document.querySelector('.topbar'),
    hasHudPanel: !!document.querySelector('.hud-panel'),
    hasWorldContent: !!document.querySelector('[data-testid="world-content"]'),
    hasLoadingScreen: !!document.querySelector('.loading-screen'),
    bodyClass: document.body.className,
    bodyChildren: Array.from(document.body.children).map(el => `${el.tagName}.${el.className}`.slice(0, 60)),
    testIds: Array.from(document.querySelectorAll('[data-testid]')).map(el => el.getAttribute('data-testid')).slice(0, 25)
  }))
  console.log(`t+${i}s:`, JSON.stringify(state, null, 2))
}
await browser.close()
