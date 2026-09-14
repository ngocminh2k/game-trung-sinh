import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://127.0.0.1:5177/')
await page.waitForTimeout(2000)

const init = await page.evaluate(() => ({
  protoRoot: !!document.querySelector('.proto-root, .proto-topbar'),
  gameScreen: !!document.querySelector('[data-testid="game-screen"]'),
  worldContent: !!document.querySelector('[data-testid="world-content"]'),
}))
console.log('boot/init:', JSON.stringify(init))

// New game flow
await page.getByTestId('menu-new-game').click()
await page.waitForTimeout(800)
await page.locator('.system-tile').first().click()
await page.waitForTimeout(200)
await page.getByTestId('newgame-confirm').click()
await page.waitForSelector('main', { timeout: 10000 })
await page.waitForSelector('.proto-topbar', { timeout: 5000 })
await page.waitForTimeout(500)

const playing = await page.evaluate(() => {
  const pick = (sel) => {
    const el = document.querySelector(sel)
    if (!el) return null
    const r = el.getBoundingClientRect()
    return `${Math.round(r.width)}x${Math.round(r.height)} @(${Math.round(r.x)},${Math.round(r.y)})`
  }
  return {
    topbar: pick('.proto-topbar'),
    leftrail: pick('.proto-leftrail'),
    center: pick('.proto-center'),
    command: pick('.proto-command'),
    righthud: pick('.proto-righthud'),
    ticker: pick('.proto-ticker'),
    map: pick('.proto-map'),
    gridCols: getComputedStyle(document.querySelector('.proto-grid-main')).gridTemplateColumns,
    playerMarker: pick('[data-testid="player-marker"]'),
    currency: {
      gold: document.querySelector('[data-testid="currency-gold"] .v')?.textContent,
      silver: document.querySelector('[data-testid="currency-silver"] .v')?.textContent,
      spirit: document.querySelector('[data-testid="currency-spirit-stones"] .v')?.textContent,
    },
    hpBar: document.querySelector('.proto-bar.hp .fill')?.style.width,
    qiBar: document.querySelector('.proto-bar.qi .fill')?.style.width,
  }
})
console.log('playing:', JSON.stringify(playing, null, 2))
await page.screenshot({ path: 'screenshots/proto-shell-main.png' })

// Click NPC pin
const npcPins = await page.locator('.pin.npc').count()
console.log('npc pins:', npcPins)
if (npcPins > 0) {
  await page.locator('.pin.npc').first().click()
  await page.waitForTimeout(800)
  const chat = await page.evaluate(() => ({
    show: !!document.querySelector('.proto-modal-backdrop.show .proto-modal.chat'),
    choices: [...document.querySelectorAll('.proto-modal.chat .chat-choices button')].map(b => b.textContent?.trim()),
  }))
  console.log('chat:', JSON.stringify(chat, null, 2))
  await page.screenshot({ path: 'screenshots/proto-shell-chat.png' })

  // Pick first choice → may dispatch action
  if (chat.choices.length > 0) {
    await page.locator('.proto-modal.chat .chat-choices button').first().click()
    await page.waitForTimeout(800)
    const after = await page.evaluate(() => ({
      log: [...document.querySelectorAll('.proto-modal.chat .chat-log .line')].map(l => l.textContent?.trim()),
      choices: [...document.querySelectorAll('.proto-modal.chat .chat-choices button')].map(b => b.textContent?.trim()),
    }))
    console.log('after choice 1:', JSON.stringify(after, null, 2))
  }
  await page.getByRole('button', { name: 'Đóng', exact: true }).click()
  await page.waitForTimeout(300)
}

// Zen mode
await page.keyboard.press('z')
await page.waitForTimeout(500)
const zen = await page.evaluate(() => ({
  hasZen: document.querySelector('.proto-grid-main')?.classList.contains('zen'),
  gridCols: getComputedStyle(document.querySelector('.proto-grid-main')).gridTemplateColumns,
  pillShow: document.querySelector('.proto-zen-pill')?.classList.contains('show'),
  tickerHidden: getComputedStyle(document.querySelector('.proto-ticker')).display,
}))
console.log('zen:', JSON.stringify(zen))
await page.screenshot({ path: 'screenshots/proto-shell-zen.png' })
await page.keyboard.press('z')
await page.waitForTimeout(300)

// Cultivate chip → check chronicle update
const beforeCult = await page.evaluate(() => document.querySelector('.proto-ticker .msg')?.textContent)
console.log('chronicle before cultivate:', beforeCult?.slice(0, 60))
await page.locator('.proto-command .chips button:has-text("Tu luyện")').click()
await page.waitForTimeout(800)
const afterCult = await page.evaluate(() => document.querySelector('.proto-ticker .msg')?.textContent)
console.log('chronicle after cultivate:', afterCult?.slice(0, 60))
await page.screenshot({ path: 'screenshots/proto-shell-after-cultivate.png' })

await browser.close()
console.log('DONE')
