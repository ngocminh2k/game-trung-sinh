import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto('http://127.0.0.1:5174/')
await page.waitForTimeout(3000)

// Screenshot 1: initial screen (Loading or Menu)
await page.screenshot({ path: 'screenshot-1-initial.png', fullPage: true })

// If on loading screen, click to skip or wait for menu
const newGameBtn = page.getByTestId('menu-new-game')
if (await newGameBtn.isVisible({ timeout: 5000 }).catch(() => false)) {
  await page.screenshot({ path: 'screenshot-2-menu.png' })
  await newGameBtn.click()
  await page.waitForTimeout(1000)
  await page.screenshot({ path: 'screenshot-3-newgame.png' })

  // Pick a system and start game
  const firstSystem = page.locator('.system-tile').first()
  if (await firstSystem.isVisible({ timeout: 3000 }).catch(() => false)) {
    await firstSystem.click()
    const confirmBtn = page.getByTestId('newgame-confirm')
    if (await confirmBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await confirmBtn.click()
      await page.waitForTimeout(2000)
      await page.screenshot({ path: 'screenshot-4-gameplay.png', fullPage: true })
    }
  }
} else {
  // If already on gameplay
  await page.screenshot({ path: 'screenshot-gameplay-direct.png', fullPage: true })
}

await browser.close()
console.log('Screenshots taken!')
