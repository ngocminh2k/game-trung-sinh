import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
page.on('console', m => console.log('PAGE:', m.text()))
page.on('pageerror', e => console.log('ERROR:', e.message))
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

const beforeClick = await page.evaluate(() => ({
  npcCount: document.querySelectorAll('.pin.npc').length,
  firstNpc: document.querySelector('.pin.npc')?.outerHTML?.slice(0, 200),
  modalBefore: !!document.querySelector('.proto-modal-backdrop.show'),
}))
console.log('before click:', JSON.stringify(beforeClick, null, 2))

await page.locator('.pin.npc').first().click({ force: true })
await page.waitForTimeout(800)

const afterClick = await page.evaluate(() => ({
  npcCount: document.querySelectorAll('.pin.npc').length,
  modalShow: !!document.querySelector('.proto-modal-backdrop.show'),
  modalChat: !!document.querySelector('.proto-modal.chat'),
  backdrop: document.querySelector('.proto-modal-backdrop')?.className,
}))
console.log('after click:', JSON.stringify(afterClick, null, 2))
await page.screenshot({ path: 'screenshots/debug-npc-click.png' })
await browser.close()
