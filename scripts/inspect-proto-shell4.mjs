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
await page.waitForTimeout(500)

const npcPins = await page.locator('.pin.npc').count()
console.log('npc pins:', npcPins)

if (npcPins > 0) {
  await page.locator('.pin.npc').first().click()
  await page.waitForTimeout(600)
  const chat = await page.evaluate(() => ({
    show: !!document.querySelector('.proto-modal-backdrop.show .proto-modal.chat'),
    nameplate: document.querySelector('.proto-modal.chat .nameplate')?.textContent,
    choices: [...document.querySelectorAll('.proto-modal.chat .chat-choices button')].map(b => b.textContent?.trim().slice(0, 50)),
  }))
  console.log('chat:', JSON.stringify(chat, null, 2))
  await page.screenshot({ path: 'screenshots/proto-shell-chat.png' })

  await page.locator('.proto-modal.chat .chat-choices button').first().click()
  await page.waitForTimeout(1200)
  const after = await page.evaluate(() => ({
    log: [...document.querySelectorAll('.proto-modal.chat .chat-log .line')].map(l => l.textContent?.trim().slice(0, 60)),
    chronicleMsg: document.querySelector('.proto-ticker .msg')?.textContent?.slice(0, 80),
  }))
  console.log('after pick:', JSON.stringify(after, null, 2))
  await page.screenshot({ path: 'screenshots/proto-shell-chat-after.png' })
  // close chat if still open (Tạm biệt / Đóng button)
  const closeBtn = page.locator('.proto-modal.chat .x, .proto-modal.chat .chat-choices button:has-text("Tạm biệt")').first()
  if (await closeBtn.count() > 0) await closeBtn.click()
  await page.waitForTimeout(300)
}

// Zen
await page.keyboard.press('z')
await page.waitForTimeout(500)
const zen = await page.evaluate(() => ({
  hasZen: document.querySelector('.proto-grid-main')?.classList.contains('zen'),
  gridCols: getComputedStyle(document.querySelector('.proto-grid-main')).gridTemplateColumns,
  tickerHidden: getComputedStyle(document.querySelector('.proto-ticker')).display,
}))
console.log('zen:', JSON.stringify(zen))
await page.screenshot({ path: 'screenshots/proto-shell-zen.png' })
await page.keyboard.press('z')
await page.waitForTimeout(300)

// Cultivate
const beforeCult = await page.evaluate(() => document.querySelector('.proto-ticker .msg')?.textContent)
console.log('before cultivate:', beforeCult?.slice(0, 60))
await page.locator('.proto-command .chips button:has-text("Tu luyện")').click()
await page.waitForTimeout(800)
const afterCult = await page.evaluate(() => document.querySelector('.proto-ticker .msg')?.textContent)
console.log('after cultivate:', afterCult?.slice(0, 60))
await page.screenshot({ path: 'screenshots/proto-shell-after-cultivate.png' })

await browser.close()
console.log('DONE')
