// Detailed runtime tree inspection
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
await page.goto('http://localhost:7456/', { waitUntil: 'load', timeout: 60000 })
await page.waitForTimeout(15000)

const out = await page.evaluate(() => {
  const cc = window.cc || window['cc']
  if (!cc || !cc.director) return 'no cc'
  const scene = cc.director.getScene()
  if (!scene) return 'no scene'
  const canvas = scene.getChildByName('Canvas')
  if (!canvas) return 'no canvas'
  const mainMenu = canvas.getChildByName('MainMenu')
  if (!mainMenu) {
    return 'no MainMenu; children of Canvas: ' + canvas.children.map(c => c.name).join(',')
  }
  const lines = ['MainMenu children: ' + mainMenu.children.length]
  for (const c of mainMenu.children) {
    const comps = c.components.map(x => x.constructor.name)
    const lbl = c.getComponent('Label')
    const btn = c.getComponent('Button')
    lines.push(`  ${c.name}: comps=[${comps.join(',')}] lbl.string=${lbl ? JSON.stringify(lbl.string) : 'N/A'} btn=${btn ? 'yes' : 'no'}`)
  }
  return lines.join('\n')
})
console.log(out)
await browser.close()