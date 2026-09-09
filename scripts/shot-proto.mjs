import { chromium } from 'playwright'
const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
await page.goto('file:///C:/Users/minhd/AppData/Roaming/Open%20Design/namespaces/release-stable-win/data/projects/49374da1-4373-48ce-905f-c53960a81a40/phe-can-ky-ui-prototype.html')
await page.waitForTimeout(1500)
await page.screenshot({ path: 'screenshots/proto-boot.png' })
await browser.close()
console.log('done')
