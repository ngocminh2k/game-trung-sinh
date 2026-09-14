import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://127.0.0.1:5176/?prototype=1')
await page.waitForTimeout(1500)
await page.locator('button:has-text("Tiếp Tục")').first().click()
await page.waitForTimeout(1500)
// Get state via debug
for (let i = 0; i < 6; i++) {
  await page.locator('.proto-command .chips button:has-text("Tu luyện")').click()
  await page.waitForTimeout(120)
  const debug = await page.evaluate(() => {
    const all = [...document.querySelectorAll('.proto-modal-backdrop')].map(m => m.classList.contains('show') ? m.getAttribute('aria-label') : null).filter(Boolean)
    return { showModals: all, cultivation: document.querySelector('.proto-bar.cultivation .fill')?.style.width }
  })
  console.log(`iter ${i+1}:`, JSON.stringify(debug))
  if (debug.showModals.length > 0) break
}
await browser.close()
