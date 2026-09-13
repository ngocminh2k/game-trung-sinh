// Verify: portrait shows the full character and swaps with the player's action;
// map pins are enabled only where the engine actually connects the cells.
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

await page.goto('http://127.0.0.1:5173/')
await page.waitForTimeout(2000)
await page.getByTestId('menu-new-game').click()
await page.waitForTimeout(800)
await page.locator('.system-tile').first().click()
await page.getByTestId('newgame-confirm').click()
await page.waitForSelector('.loading-screen', { timeout: 8000 })
await page.waitForFunction(() => document.querySelector('.loading-hint') !== null, { timeout: 8000 })
await page.locator('.loading-screen').click()
await page.waitForSelector('button.journal-launcher', { state: 'attached', timeout: 15000 })
await page.waitForTimeout(800)

const faceSel = '.proto-righthud .proto-portrait .face .proto-portrait-art'

const readFace = () => page.evaluate((sel) => {
  const img = document.querySelector(sel)
  const box = document.querySelector('.proto-righthud .proto-portrait .face')
  if (img === null || box === null) return null
  const r = img.getBoundingClientRect()
  const b = box.getBoundingClientRect()
  return {
    src: img.getAttribute('src')?.split('/').pop() ?? null,
    natural: `${img.naturalWidth}x${img.naturalHeight}`,
    rendered: `${Math.round(r.width)}x${Math.round(r.height)}`,
    frame: `${Math.round(b.width)}x${Math.round(b.height)}`,
    cropped: r.width > b.width + 1 || r.height > b.height + 1,
    fit: getComputedStyle(img).objectFit,
  }
}, faceSel)

console.log('INITIAL PORTRAIT:', JSON.stringify(await readFace()))
const initialPins = await page.evaluate(() => [...document.querySelectorAll('button.pin[data-pin-id]')].map((el) => ({
  id: el.dataset.pinId ?? '',
  testid: el.dataset.testid ?? null,
  walkable: el.dataset.pinWalkable ?? null,
  disabled: el.disabled,
  title: el.title,
})))
console.log('INITIAL PINS:', JSON.stringify(initialPins, null, 2))

// Take screenshot before action
const portraitBox = await page.locator('.proto-righthud .proto-portrait').boundingBox()
if (portraitBox) {
  await page.screenshot({ path: 'screenshots/portrait-before.png', clip: portraitBox })
}

// Move south (key 's') -> moves from (3,3) toward (3,5) "Bờ ruộng linh thảo" (herb_field exit)
await page.keyboard.press('s')
await page.waitForTimeout(600)
console.log('AFTER MOVE KEY S:', JSON.stringify(await readFace()))
if (portraitBox) {
  await page.screenshot({ path: 'screenshots/portrait-after-move.png', clip: portraitBox })
}

// Check pins again: is any pin now adjacent and enabled?
const pinsAfterMove = await page.evaluate(() => [...document.querySelectorAll('button.pin[data-pin-id]')].map((el) => ({
  id: el.dataset.pinId ?? '',
  disabled: el.disabled,
  walkable: el.dataset.pinWalkable ?? null,
  title: el.title,
})))
console.log('PINS AFTER 1 MOVE:', JSON.stringify(pinsAfterMove, null, 2))

// Now click an enabled pin if available, or test Rest
const enabledPin = page.locator('button.pin[data-pin-walkable]:not([disabled])').first()
if (await enabledPin.count() > 0) {
  const pinId = await enabledPin.getAttribute('data-pin-id')
  console.log(`Clicking enabled pin ${pinId}...`)
  await enabledPin.click()
  await page.waitForTimeout(600)
  console.log('AFTER PIN CLICK:', JSON.stringify(await readFace()))
}

// Close story dialog if an event node opened it
if (await page.locator('.story-panel, .story-backdrop').count() > 0) {
  await page.keyboard.press('Escape')
  await page.waitForTimeout(400)
}

// Click Rest chip -> changes pose to rest
await page.locator('[data-chip="rest"]').click({ force: true })
await page.waitForTimeout(600)
console.log('AFTER REST CHIP:', JSON.stringify(await readFace()))
if (portraitBox) {
  await page.screenshot({ path: 'screenshots/portrait-after-rest.png', clip: portraitBox })
}

await page.screenshot({ path: 'screenshots/verify-portrait-pins.png', fullPage: true })
console.log('Verification finished successfully.')
await browser.close()

