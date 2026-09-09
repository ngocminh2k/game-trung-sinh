import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1461, height: 887 } })
page.on('pageerror', (e) => console.log('PAGE ERROR:', e.message))

await page.goto('http://127.0.0.1:5173/')
await page.waitForTimeout(800)
await page.getByTestId('menu-new-game').click()
await page.waitForTimeout(400)
await page.locator('.system-tile').first().click()
await page.getByTestId('newgame-confirm').click()
await page.waitForSelector('.loading-screen', { timeout: 8000 })
await page.waitForFunction(() => document.querySelector('.loading-hint') !== null, { timeout: 8000 })
await page.locator('.loading-screen').click()
await page.waitForSelector('.proto-righthud', { timeout: 20000 })
await page.waitForTimeout(500)
console.log('booted OK')

// Check initial pins in Village
let pins = await page.evaluate(() => Array.from(document.querySelectorAll('.proto-map .pin')).map((p) => ({
  id: p.getAttribute('data-pin-id'),
  text: p.innerText.replace(/\s+/g, ' ').trim().slice(0, 30),
  label: p.getAttribute('aria-label'),
  walkable: p.getAttribute('data-pin-walkable')
})))
console.log('Village pins:', pins)

// Click sect exit: map-pin-5-3
console.log('Clicking sect exit (5, 3)...')
await page.locator('[data-testid="map-pin-5-3"]').click()
await page.waitForTimeout(800)

let locInfo = await page.evaluate(() => {
  const topbar = document.querySelector('.proto-topbar')?.innerText.replace(/\s+/g, ' ')
  const currentCell = document.querySelector('[data-testid="map-current-cell"]')?.innerText.replace(/\s+/g, ' ')
  return { topbar, currentCell }
})
console.log('After sect exit click:', locInfo)

// In sect: click azure pavilion exit: map-pin-3-4
console.log('Clicking azure pavilion exit (3, 4)...')
await page.locator('[data-testid="map-pin-3-4"]').click()
await page.waitForTimeout(800)

locInfo = await page.evaluate(() => {
  const topbar = document.querySelector('.proto-topbar')?.innerText.replace(/\s+/g, ' ')
  const currentCell = document.querySelector('[data-testid="map-current-cell"]')?.innerText.replace(/\s+/g, ' ')
  return { topbar, currentCell }
})
console.log('After azure pavilion exit click:', locInfo)

// Now we should be at Azure Pavilion (Thanh Van Cac)!
// Let's inspect pins at Thanh Van Cac!
pins = await page.evaluate(() => Array.from(document.querySelectorAll('.proto-map .pin')).map((p) => ({
  id: p.getAttribute('data-pin-id'),
  text: p.innerText.replace(/\s+/g, ' ').trim().slice(0, 30),
  label: p.getAttribute('aria-label'),
  walkable: p.getAttribute('data-pin-walkable')
})))
console.log('Azure Pavilion pins:', pins)

// Now click on Chuong phong van: map-pin-5-3
console.log('Clicking Chuong phong van (5, 3)...')
await page.locator('[data-testid="map-pin-5-3"]').click()
await page.waitForTimeout(800)

const afterBell = await page.evaluate(() => {
  const currentCell = document.querySelector('[data-testid="map-current-cell"]')?.innerText.replace(/\s+/g, ' ')
  const storyOpen = !!document.querySelector('.story-panel')
  const narrationOpen = !!document.querySelector('[data-testid="narration-panel"]')
  const storyBackdrop = !!document.querySelector('.story-backdrop')
  return { currentCell, storyOpen, narrationOpen, storyBackdrop }
})
console.log('After bell click:', afterBell)
await page.screenshot({ path: 'screenshots/debug-after-bell.png' })

await browser.close()
