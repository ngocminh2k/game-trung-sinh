// Interactive check: click main-menu buttons + trigger keyboard
import { chromium } from 'playwright'

const url = 'http://localhost:7456/'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

const consoleErrors = []
const pageErrors = []
page.on('console', (m) => { if (m.type() === 'error') consoleErrors.push(m.text().slice(0, 400)) })
page.on('pageerror', (e) => pageErrors.push(e.message.slice(0, 400)))

try {
  await page.goto(url, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(15000)
  await page.screenshot({ path: 'C:/Users/NGOCMINHPC/AppData/Local/Temp/cocos-1-mainmenu.png' })

  // Find the cocos canvas, click at coordinates of "New Game" button.
  // MainMenu self-builds at y=60 (from addButton in buildChildren)
  // For 1280x720 design res, button positions are around center-x, y=380 (60 from center 360+)
  const canvas = await page.locator('canvas').first()
  await canvas.click({ position: { x: 640, y: 380 } })
  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'C:/Users/NGOCMINHPC/AppData/Local/Temp/cocos-2-afterclick.png' })

  // Press Enter (keyboard)
  await page.keyboard.press('ArrowDown')
  await page.waitForTimeout(500)
  await page.keyboard.press('Enter')
  await page.waitForTimeout(2000)
  await page.screenshot({ path: 'C:/Users/NGOCMINHPC/AppData/Local/Temp/cocos-3-afterEnter.png' })

  console.log('=== INTERACTIVE CHECK ===')
  console.log('page errors:', pageErrors.length ? pageErrors : 'none')
  console.log('console errors:', consoleErrors.length ? consoleErrors.slice(0, 8) : 'none')
  console.log('screenshots: 1-mainmenu, 2-afterclick, 3-afterEnter')
} catch (e) {
  console.log('NAV ERROR:', e.message.slice(0, 500))
}
await browser.close()
