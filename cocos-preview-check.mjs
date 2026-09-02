// Verify the Cocos Creator preview actually boots without runtime errors.
import { chromium } from 'playwright'

const url = 'http://localhost:7456/'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })

const consoleErrors = []
const pageErrors = []
page.on('console', (msg) => {
  if (msg.type() === 'error') consoleErrors.push(msg.text().slice(0, 400))
})
page.on('pageerror', (err) => pageErrors.push(err.message.slice(0, 400)))

try {
  await page.goto(url, { waitUntil: 'load', timeout: 60000 })
  // Cocos boot: give it time to compile + run the scene scripts
  await page.waitForTimeout(15000)

  const title = await page.title()
  const canvas = await page.locator('canvas').count()
  const bodyText = (await page.evaluate(() => document.body ? document.body.innerText.slice(0, 300) : '')).trim()

  await page.screenshot({ path: 'C:/Users/NGOCMINHPC/AppData/Local/Temp/cocos-main-menu.png', fullPage: false })

  console.log('=== COCOS PREVIEW CHECK ===')
  console.log('title:', title)
  console.log('canvas count:', canvas)
  console.log('body text (first 300):', JSON.stringify(bodyText))
  console.log('page errors:', pageErrors.length ? pageErrors : 'none')
  console.log('console errors:', consoleErrors.length ? consoleErrors.slice(0, 8) : 'none')
} catch (e) {
  console.log('NAV ERROR:', e.message.slice(0, 500))
}
await browser.close()
