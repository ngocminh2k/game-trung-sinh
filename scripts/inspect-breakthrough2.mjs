import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://127.0.0.1:5176/?prototype=1')
await page.waitForTimeout(1500)
await page.locator('button:has-text("Tiếp Tục")').first().click()
await page.waitForTimeout(1500)
// Click cultivate exactly 6 times to fill to 100
for (let i = 0; i < 6; i++) {
  await page.locator('.proto-command .chips button:has-text("Tu luyện")').click()
  await page.waitForTimeout(100)
}
await page.waitForTimeout(500)
const after = await page.evaluate(() => ({
  cultivation: document.querySelector('.proto-bar.cultivation .fill')?.style.width,
  modalShow: !!document.querySelector('.proto-modal.breakthrough.show'),
  modalCount: document.querySelectorAll('.proto-modal.breakthrough').length,
}))
console.log('after 6 clicks:', JSON.stringify(after))
await page.screenshot({ path: 'screenshots/proto-breakthrough-final.png' })
await browser.close()
