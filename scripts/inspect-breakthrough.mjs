import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://127.0.0.1:5176/?prototype=1')
await page.waitForTimeout(1500)
await page.locator('button:has-text("Tiếp Tục")').first().click()
await page.waitForTimeout(1500)
const start = await page.evaluate(() => document.querySelector('.bar.cultivation .fill, .proto-bar.cultivation .fill')?.style.width)
console.log('start cultivation:', start)
for (let i = 0; i < 8; i++) {
  await page.locator('.proto-command .chips button:has-text("Tu luyện")').click()
  await page.waitForTimeout(60)
  const w = await page.evaluate(() => document.querySelector('.proto-bar.cultivation .fill')?.style.width)
  const m = await page.evaluate(() => !!document.querySelector('.proto-modal.breakthrough.show'))
  console.log(`iter ${i+1}: width=${w}, breakthrough=${m}`)
  if (m) break
}
const final = await page.evaluate(() => ({ cultivation: document.querySelector('.proto-bar.cultivation .fill')?.style.width, modal: !!document.querySelector('.proto-modal.breakthrough.show') }))
console.log('final:', JSON.stringify(final))
await page.screenshot({ path: 'screenshots/proto-breakthrough-final.png' })
await browser.close()
