import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('http://127.0.0.1:5176/?prototype=1')
await page.waitForTimeout(1500)
const info = await page.evaluate(() => {
  const pick = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)} @(${Math.round(r.x)},${Math.round(r.y)})` }
  return { protoRoot: !!document.querySelector('.proto-root'), sceneBoot: pick('.proto-scene-boot'), bootMenu: pick('.proto-boot-menu') }
})
console.log('boot:', JSON.stringify(info, null, 2))
await page.screenshot({ path: 'screenshots/proto-boot.png' })

// Wizard
await page.locator('button:has-text("Khởi Đạo Mới")').click()
await page.waitForTimeout(400)
await page.screenshot({ path: 'screenshots/proto-wizard.png' })
await page.getByRole('button', { name: 'Tiếp Tục', exact: true }).click()
await page.waitForTimeout(300)
await page.screenshot({ path: 'screenshots/proto-wizard-step2.png' })
await page.getByRole('button', { name: 'Tiếp Tục', exact: true }).click()
await page.waitForTimeout(300)
await page.screenshot({ path: 'screenshots/proto-wizard-step3.png' })
await page.getByRole('button', { name: 'Ký Khế Ước & Nhập Đạo' }).click()
await page.waitForTimeout(2000)

const main = await page.evaluate(() => {
  const pick = (sel) => { const el = document.querySelector(sel); if (!el) return null; const r = el.getBoundingClientRect(); return `${Math.round(r.width)}x${Math.round(r.height)} @(${Math.round(r.x)},${Math.round(r.y)})` }
  return { topbar: pick('.proto-topbar'), leftrail: pick('.proto-leftrail'), center: pick('.proto-center'), map: pick('.proto-map'), command: pick('.proto-command'), righthud: pick('.proto-righthud'), ticker: pick('.proto-ticker'), gridCols: getComputedStyle(document.querySelector('.proto-grid-main')).gridTemplateColumns }
})
console.log('main:', JSON.stringify(main, null, 2))
await page.screenshot({ path: 'screenshots/proto-main.png' })

// Zen
await page.keyboard.press('z')
await page.waitForTimeout(500)
const zen = await page.evaluate(() => ({ hasZen: document.querySelector('.proto-grid-main')?.classList.contains('zen'), gridCols: getComputedStyle(document.querySelector('.proto-grid-main')).gridTemplateColumns, pillShow: document.querySelector('.proto-zen-pill')?.classList.contains('show') }))
console.log('zen:', JSON.stringify(zen))
await page.screenshot({ path: 'screenshots/proto-zen.png' })
await page.keyboard.press('z')
await page.waitForTimeout(300)

// Settings
await page.locator('.proto-topbar .iconbtn').nth(1).click()
await page.waitForTimeout(300)
await page.screenshot({ path: 'screenshots/proto-settings.png' })
await page.getByRole('button', { name: 'Đóng', exact: true }).click()
await page.waitForTimeout(200)

// Cultivate until breakthrough
for (let i = 0; i < 10; i++) {
  await page.locator('.proto-command .chips button:has-text("Tu luyện")').click({ force: true })
  await page.waitForTimeout(40)
  const modalOpen = await page.evaluate(() => !!document.querySelector('.proto-modal.breakthrough.show'))
  if (modalOpen) break
}
await page.waitForTimeout(400)
const brk = await page.evaluate(() => ({ show: !!document.querySelector('.proto-modal.breakthrough.show') }))
console.log('breakthrough:', JSON.stringify(brk))
await page.screenshot({ path: 'screenshots/proto-breakthrough.png' })
await page.getByRole('button', { name: 'Đóng', exact: true }).click()
await page.waitForTimeout(200)

// Story pin
await page.locator('.pin.event').click()
await page.waitForTimeout(300)
await page.screenshot({ path: 'screenshots/proto-story.png' })
await page.keyboard.press('Escape')
await page.waitForTimeout(200)

// Combat via command
await page.locator('input[aria-label="Nhập mệnh lệnh"]').fill('đánh yêu')
await page.locator('.proto-command .try').click()
await page.waitForTimeout(400)
const combat = await page.evaluate(() => ({ show: !!document.querySelector('.proto-combat-overlay.show') }))
console.log('combat:', JSON.stringify(combat))
await page.screenshot({ path: 'screenshots/proto-combat.png' })

await page.locator('.proto-combat-overlay button:has-text("Đánh Thường")').click()
await page.waitForTimeout(200)
const enemyHp = await page.evaluate(() => document.querySelector('.proto-combat-overlay .ebar > i')?.style.width)
console.log('enemy hp after attack:', enemyHp)

await browser.close()
console.log('DONE')
