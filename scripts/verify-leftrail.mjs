import { chromium } from 'playwright'
import assert from 'node:assert/strict'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })

console.log('Navigating to game...')
await page.goto('http://127.0.0.1:5173/')
await page.waitForTimeout(2000)

console.log('Starting new game...')
await page.getByTestId('menu-new-game').click()
await page.waitForTimeout(800)
await page.locator('.system-tile').first().click()
await page.getByTestId('newgame-confirm').click()
await page.waitForSelector('.loading-screen', { timeout: 8000 })
await page.waitForFunction(() => document.querySelector('.loading-hint') !== null, { timeout: 8000 })
await page.locator('.loading-screen').click()
await page.waitForSelector('button.journal-launcher', { state: 'attached', timeout: 15000 })
await page.waitForTimeout(600)

console.log('Testing LeftRail: Hành trang tab (items)...')
const itemsTab = page.locator('.proto-leftrail .tabs button[data-tab="items"]')
await itemsTab.click()
await page.waitForTimeout(400)

const filledSlot = page.locator('.proto-slot.proto-slot--filled').first()
await filledSlot.waitFor({ state: 'visible', timeout: 5000 })

// Check icon inside slot
const iconCount = await page.locator('.proto-slot.proto-slot--filled .proto-slot__icon').count()
const glyphCount = await page.locator('.proto-slot.proto-slot--filled .proto-slot__glyph').count()
console.log(`Filled slots have: ${iconCount} icons, ${glyphCount} glyphs`)
assert(iconCount + glyphCount > 0, 'Slots should render icons or glyphs')

// Hover first slot
console.log('Hovering item slot...')
await filledSlot.hover()
await page.waitForTimeout(300)

const popover = page.locator('[data-testid="item-info-popover"]')
await popover.waitFor({ state: 'visible', timeout: 4000 })

const popoverName = await page.locator('.proto-item-popover__name').textContent()
const popoverDesc = await page.locator('.proto-item-popover__desc').textContent()
console.log(`Popover appears: name="${popoverName}", desc="${popoverDesc}"`)
assert(popoverName && popoverName.trim().length > 0, 'Popover must display item name')
assert(popoverDesc && popoverDesc.trim().length > 0, 'Popover must display item description')

// Check for "Sử dụng" button if the hovered item is usable
const useBtn = page.locator('[data-testid="use-item-btn"]')
const hasUseBtn = (await useBtn.count()) > 0
console.log(`Has "Sử dụng" button: ${hasUseBtn}`)

await page.screenshot({ path: 'screenshots/leftrail-items.png' })
console.log('Saved screenshot: screenshots/leftrail-items.png')

console.log('Testing LeftRail: Hệ thống tab (system)...')
const systemTab = page.locator('.proto-leftrail .tabs button[data-tab="system"]')
await systemTab.click()
await page.waitForTimeout(400)

const systemPanel = page.locator('[data-testid="leftrail-system-panel"]')
await systemPanel.waitFor({ state: 'visible', timeout: 5000 })

// Check conversation log
const chatLog = page.locator('.proto-system-chat-log')
await chatLog.waitFor({ state: 'visible' })
const msgCount = await page.locator('.proto-system-msg').count()
console.log(`System chat log message count: ${msgCount}`)
assert(msgCount > 0, 'System chat log should display messages')

// Check chat input
const chatInput = page.locator('.proto-system-input-form input')
await chatInput.waitFor({ state: 'visible' })

// Check current objective
const objective = page.locator('.proto-system-objective-text')
await objective.waitFor({ state: 'visible' })
const objectiveText = await objective.textContent()
console.log(`Current objective: "${objectiveText}"`)
assert(objectiveText && objectiveText.trim().length > 0, 'Objective text must be displayed')

// Check quests section
const questSection = page.locator('.proto-system-section-card').nth(1)
await questSection.waitFor({ state: 'visible' })
const questSectionText = await questSection.textContent()
console.log(`Quest section text preview: "${questSectionText.slice(0, 80)}..."`)

// Verify old static counters are NOT present
const oldCountersPresent = await page.evaluate(() => {
  const bodyText = document.querySelector('.proto-leftrail .body')?.textContent || ''
  return bodyText.includes('Tổng cờ đã bật') || bodyText.includes('Đang theo dõi')
})
console.log(`Old static counters present: ${oldCountersPresent}`)
assert(!oldCountersPresent, 'Old static counters should be replaced by chat and quests')

// Test sending a chat message to System
console.log('Testing typing a message to System...')
await chatInput.fill('Hệ thống có nhiệm vụ gì không?')
await page.locator('.proto-system-input-form button[type="submit"]').click()
await page.waitForTimeout(500)
const newMsgCount = await page.locator('.proto-system-msg').count()
console.log(`Message count after player chat: ${newMsgCount}`)
assert(newMsgCount > msgCount, 'Chat log should reflect newly sent message')

await page.screenshot({ path: 'screenshots/leftrail-system.png' })
console.log('Saved screenshot: screenshots/leftrail-system.png')

console.log('All LeftRail verifications passed successfully!')
await browser.close()
