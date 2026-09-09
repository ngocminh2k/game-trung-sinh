import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('pageerror', e => console.log('ERR:', e.message))
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

// Tab People, click NPC button in leftrail body
await page.locator('.proto-leftrail .tabs button[data-tab="people"]').click()
await page.waitForTimeout(300)
const leftrailNpc = await page.locator('.proto-leftrail .body .proto-npc').count()
console.log('leftrail npc buttons:', leftrailNpc)

await page.locator('.proto-leftrail .body .proto-npc').first().click()
await page.waitForTimeout(800)

const check = await page.evaluate(() => ({
  backdrop: document.querySelectorAll('.proto-modal-backdrop').length,
  showBackdrop: document.querySelectorAll('.proto-modal-backdrop.show').length,
  chatModal: document.querySelectorAll('.proto-modal.chat').length,
  nameplate: document.querySelector('.proto-modal.chat .nameplate')?.textContent,
  choices: [...document.querySelectorAll('.proto-modal.chat .chat-choices button')].map(b => b.textContent?.trim().slice(0, 40)),
}))
console.log('after leftrail click:', JSON.stringify(check, null, 2))
await page.screenshot({ path: 'screenshots/proto-shell-chat-leftrail.png' })
await browser.close()
