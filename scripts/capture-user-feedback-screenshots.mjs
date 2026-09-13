import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

console.log('Navigating to http://127.0.0.1:5173/...')
await page.goto('http://127.0.0.1:5173/')
await page.waitForTimeout(1500)

// Start new game
await page.getByTestId('menu-new-game').click()
await page.waitForTimeout(600)
await page.locator('.system-tile').first().click()
await page.waitForTimeout(300)
await page.getByTestId('newgame-confirm').click()
await page.waitForSelector('.loading-screen', { timeout: 8000 })
await page.waitForFunction(() => document.querySelector('.loading-hint') !== null, { timeout: 8000 })
await page.locator('.loading-screen').click()
await page.waitForSelector('.proto-topbar', { timeout: 15000 })
await page.waitForTimeout(1000)

console.log('1. Capturing Chat Modal...')
await page.evaluate(() => window.__openChat('n_merchant_bao'))
await page.waitForSelector('.proto-modal.chat', { state: 'visible', timeout: 5000 })
await page.waitForTimeout(600)

const chatBox = await page.locator('.proto-modal.chat').boundingBox()
const chatLines = await page.locator('.proto-modal.chat .chat-log .line').count()
console.log('Chat modal dimensions:', chatBox)
console.log('Chat log lines:', chatLines)

await page.screenshot({ path: 'screenshot-chat-modal.png' })
console.log('Saved screenshot-chat-modal.png')

// Close chat
await page.keyboard.press('Escape')
await page.waitForTimeout(500)

console.log('2. Traveling to misty_forest to trigger combat...')
// Click exit pin (3,1)
const exitPin = page.locator('.proto-map [data-testid="map-pin-3-1"], [data-testid="map-pin-3-1"]:not(.map-pin)').last()
if (await exitPin.count() > 0) {
  console.log('Clicking exit pin (3,1)...')
  await exitPin.click({ force: true })
  await page.waitForTimeout(1500)
}

// Check location
const locText = await page.evaluate(() => document.querySelector('.map-overlay-label strong')?.textContent)
console.log('Current location:', locText)

// Check for fight button / chip
const fightBtn = page.locator('button[data-chip="fight"]')
console.log('Fight button count:', await fightBtn.count())

if (await fightBtn.count() > 0 && await fightBtn.isVisible()) {
  console.log('Clicking fight button...')
  await fightBtn.click()
} else {
  // If button not visible, look for danger pin or dispatch encounter
  console.log('Fight chip not visible directly, looking for danger pin...')
  const dangerPin = page.locator('.proto-map [data-testid="map-pin-4-1"]').last()
  if (await dangerPin.count() > 0) {
    await dangerPin.click({ force: true })
    await page.waitForTimeout(1000)
  }
  // Try fight chip again
  if (await fightBtn.count() > 0) {
    await fightBtn.click()
  }
}

// Wait for combat overlay
console.log('Waiting for combat overlay...')
await page.waitForSelector('[data-testid="proto-combat"]', { state: 'visible', timeout: 8000 })
await page.waitForTimeout(600)

const combatReport = await page.evaluate(() => {
  const overlay = document.querySelector('[data-testid="proto-combat"]')
  const playerBar = overlay?.querySelector('.cbar.player > i')
  const enemyBar = overlay?.querySelector('.combatant:nth-child(2) .cbar > i')
  return {
    enemyName: overlay?.querySelector('.ename')?.textContent,
    playerBarBg: playerBar ? getComputedStyle(playerBar).backgroundColor : null,
    enemyBarBg: enemyBar ? getComputedStyle(enemyBar).backgroundColor : null,
    enemyBarWidth: enemyBar ? getComputedStyle(enemyBar).width : null,
    overlayDisplay: overlay ? getComputedStyle(overlay).display : null,
  }
})
console.log('Combat details:', combatReport)

// Screenshot 1: 2 fighters side by side before attack
await page.screenshot({ path: 'screenshot-combat.png' })
console.log('Saved screenshot-combat.png')

// Screenshot 2: Click attack to see lunge / shake animation
console.log('Clicking attack button to trigger animation...')
await page.locator('[data-testid="combat-attack"]').click()
await page.waitForTimeout(180) // during attack animation

await page.screenshot({ path: 'screenshot-combat-attack-anim.png' })
console.log('Saved screenshot-combat-attack-anim.png')

await browser.close()
console.log('All screenshots captured successfully!')
