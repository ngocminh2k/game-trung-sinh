// V7-deep-debug: capture all errors during newgame flow
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

const errors = []
const warnings = []
const logs = []
page.on('console', msg => {
  const text = msg.text()
  if (msg.type() === 'error') errors.push(text)
  else if (msg.type() === 'warning') warnings.push(text)
  else logs.push(`[${msg.type()}] ${text}`)
})
page.on('pageerror', err => errors.push(`PAGEERROR: ${err.message}\n${err.stack ?? ''}`))
page.on('requestfailed', req => errors.push(`REQFAIL: ${req.url()} - ${req.failure()?.errorText}`))

await page.goto('http://127.0.0.1:5173/')
await page.waitForTimeout(2500)
const newGameBtn = page.getByTestId('menu-new-game')
await newGameBtn.click()
await page.waitForTimeout(1000)
const firstSystem = page.locator('.system-tile').first()
await firstSystem.click()
await page.waitForTimeout(300)
const confirmBtn = page.getByTestId('newgame-confirm')
await confirmBtn.click()
await page.waitForTimeout(3000)

console.log('=== ERRORS ===')
errors.forEach(e => console.log(e))
console.log('\n=== WARNINGS ===')
warnings.forEach(w => console.log(w))
console.log('\n=== LOGS (last 30) ===')
logs.slice(-30).forEach(l => console.log(l))

// Also try to get the React error overlay
const reactError = await page.evaluate(() => {
  const overlay = document.querySelector('vite-error-overlay')
  if (overlay && overlay.shadowRoot) {
    return overlay.shadowRoot.textContent?.slice(0, 3000)
  }
  return null
})
if (reactError) {
  console.log('\n=== VITE ERROR OVERLAY ===')
  console.log(reactError)
}

await browser.close()
