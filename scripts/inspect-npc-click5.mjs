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

// Inspect ProtoShell code
const src = await page.evaluate(() => {
  const shell = document.querySelector('.proto-grid-main')?.parentElement
  return { shellClass: shell?.className, hasBackdrop: !!document.querySelector('.proto-modal-backdrop') }
})
console.log('init:', JSON.stringify(src))

// Try clicking with React-aware click via dispatch
await page.locator('.proto-leftrail .body .proto-npc').first().click()
await page.waitForTimeout(1500)

const after = await page.evaluate(() => {
  const shell = document.querySelector('.proto-grid-main')?.parentElement
  return {
    shellChildren: shell?.children.length,
    hasBackdrop: !!document.querySelector('.proto-modal-backdrop'),
    allBackdrops: document.querySelectorAll('[class*="backdrop"]').length,
    bodyContains: document.body.innerHTML.includes('proto-modal chat'),
  }
})
console.log('after:', JSON.stringify(after))
await page.screenshot({ path: 'screenshots/debug-click5.png', fullPage: true })
await browser.close()
