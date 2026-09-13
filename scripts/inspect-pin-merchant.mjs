import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://127.0.0.1:5177/')
await page.waitForTimeout(2000)
await page.getByTestId('menu-new-game').click()
await page.waitForSelector('.system-tile', { timeout: 5000 })
await page.locator('.system-tile').first().click()
await page.waitForTimeout(300)
await page.getByTestId('newgame-confirm').click()
await page.waitForSelector('.loading-screen', { timeout: 5000 })
await page.locator('.loading-screen').click()
await page.waitForSelector('.proto-topbar', { timeout: 10000 })
await page.waitForTimeout(800)

// Open chat via window for n_merchant_bao
await page.evaluate(() => window.__openChat('n_merchant_bao'))
await page.waitForTimeout(800)
const r = await page.evaluate(() => ({
  backdrop: document.querySelectorAll('.proto-modal-backdrop').length,
  show: document.querySelectorAll('.proto-modal-backdrop.show').length,
  chat: document.querySelectorAll('.proto-modal.chat').length,
  nameplate: document.querySelector('.proto-modal.chat .nameplate')?.textContent,
  choices: [...document.querySelectorAll('.proto-modal.chat .chat-choices button')].map(b => b.textContent?.trim().slice(0, 50)),
}))
console.log('after open n_merchant_bao:', JSON.stringify(r, null, 2))
await page.screenshot({ path: 'screenshots/proto-shell-chat-working.png' })

// Pick choice 1 (Buy pill) → check inventory
const beforeInv = await page.evaluate(() => {
  // Read inventory via __openChat window doesn't give us state. Use gold count instead.
  return { gold: document.querySelector('[data-testid="currency-gold"] .v')?.textContent }
})
console.log('before buy:', JSON.stringify(beforeInv))
await page.locator('.proto-modal.chat .chat-choices button').first().click()
await page.waitForTimeout(1500)
const after = await page.evaluate(() => ({
  gold: document.querySelector('[data-testid="currency-gold"] .v')?.textContent,
  silver: document.querySelector('[data-testid="currency-silver"] .v')?.textContent,
  log: [...document.querySelectorAll('.proto-modal.chat .chat-log .line')].map(l => l.textContent?.trim().slice(0, 60)),
  chronicle: document.querySelector('.proto-ticker .msg')?.textContent?.slice(0, 80),
}))
console.log('after buy:', JSON.stringify(after, null, 2))
await page.screenshot({ path: 'screenshots/proto-shell-chat-after-buy.png' })
await browser.close()
