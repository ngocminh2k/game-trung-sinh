// Dump the LIVE PREVIEW scene tree from inside the browser (not the editor MCP)
import { chromium } from 'playwright'

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1280, height: 800 } })
const errors = []
page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text().slice(0, 300)) })
page.on('pageerror', (e) => errors.push('PAGE: ' + e.message.slice(0, 300)))

await page.goto('http://localhost:7456/', { waitUntil: 'load', timeout: 60000 })
await page.waitForTimeout(15000)

const dump = await page.evaluate(() => {
  const cc = window.cc || window['cc']
  if (!cc || !cc.director) return { error: 'no cc global' }
  const scene = cc.director.getScene()
  if (!scene) return { error: 'no scene' }
  const out = []
  function walk(n, d) {
    out.push('  '.repeat(d) + n.name + ' [' + n.components.map(c => c.constructor.name).join(',') + ']' + (n.active ? '' : ' (inactive)'))
    n.children.forEach(k => walk(k, d + 1))
  }
  walk(scene, 0)
  return { sceneName: scene.name, tree: out.join('\n') }
})
console.log('=== LIVE PREVIEW SCENE ===')
console.log(dump.sceneName ?? dump.error)
console.log(dump.tree ?? '')
console.log('=== ERRORS ===')
console.log(errors.length ? errors : 'none')
await browser.close()
