// Verify the Label text in the main-menu scene actually renders
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.goto('http://localhost:7456/', { waitUntil: 'load', timeout: 60000 })
await page.waitForTimeout(15000)

const text = await page.evaluate(() => {
  const cc = window.cc || window['cc']
  if (!cc || !cc.director) return 'no cc'
  const scene = cc.director.getScene()
  if (!scene) return 'no scene'
  const canvas = scene.getChildByName('Canvas')
  if (!canvas) return 'no canvas'
  const mainMenu = canvas.getChildByName('MainMenu')
  if (!mainMenu) return 'no MainMenu'
  const out = []
  for (const c of mainMenu.children) {
    const label = c.getComponent('Label')
    if (label) out.push(c.name + ': ' + (label.string || '(empty)'))
  }
  return out.join('\n') || 'no labels found'
})
console.log('=== LABEL TEXT ===')
console.log(text)
await browser.close()