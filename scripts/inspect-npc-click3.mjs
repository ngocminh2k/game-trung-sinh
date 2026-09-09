import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const errors = []
page.on('pageerror', e => errors.push('PAGEERR: ' + e.message))
page.on('console', m => { if (m.type() === 'error' || m.type() === 'warning') errors.push(m.type() + ': ' + m.text()) })
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
console.log('errors before click:', errors.length, errors.slice(0, 5))
await page.locator('.pin.npc').first().click({ force: true })
await page.waitForTimeout(500)
console.log('errors after click:', errors.length, errors.slice(0, 5))

const check = await page.evaluate(() => {
  const allDivs = [...document.querySelectorAll('div')]
  const hidden = allDivs.find(d => d.style.display === 'none' && d.className.includes('backdrop'))
  return {
    bodyText: document.body.innerText.slice(0, 300),
    pinCount: document.querySelectorAll('.pin.npc').length,
    backdropCount: document.querySelectorAll('.proto-modal-backdrop').length,
  }
})
console.log('check:', JSON.stringify(check))
await browser.close()
