// Repro v2: Bug 1 any-pin story panel; Bug 2 forest combat affordance visibility.
// v1 found both shells render pins with same data-testid; old .world-content is
// display:none on desktop. v2 scopes to the ProtoShell map (.proto-map), checks
// *visibility* (not just existence) of the encounter banner + start button.
import { chromium } from 'playwright'
import { mkdirSync } from 'node:fs'

const BASE = 'http://127.0.0.1:5173/'
const OUT = 'screenshots/tmp-repro'
mkdirSync(OUT, { recursive: true })

const browser = await chromium.launch({ headless: true })
const page = await browser.newPage({ viewport: { width: 1440, height: 900 } })
const pageErrors = []
page.on('pageerror', (e) => pageErrors.push(e.message))

const step = (label, data) => {
  console.log(`\n=== ${label} ===`)
  console.log(JSON.stringify(data, null, 2))
}

const state = () => page.evaluate(() => {
  const txt = (sel) => document.querySelector(sel)?.textContent?.replace(/\s+/g, ' ').trim() ?? null
  const vis = (el) => {
    if (el == null) return { visible: false, w: 0, h: 0 }
    const r = el.getBoundingClientRect()
    const cs = getComputedStyle(el)
    return { visible: r.width > 0 && r.height > 0 && cs.display !== 'none' && cs.visibility !== 'hidden', w: Math.round(r.width), h: Math.round(r.height) }
  }
  const storyEl = document.querySelector('.story-panel')
  const bannerEl = document.querySelector('.encounter-banner')
  const protoCombat = document.querySelector('[data-testid="proto-combat"]')
  // ALL combat affordances: any button/chip/aria-label mentioning giao chiến / encounter / fight / attack
  const combatBtns = [...document.querySelectorAll('button')].filter((b) => /giao chiến|start encounter|fight|đánh|combat|attack|strike|thủ thế|rút lui/i.test(`${b.textContent ?? ''} ${b.getAttribute('aria-label') ?? ''} ${b.getAttribute('data-chip') ?? ''} ${b.getAttribute('data-testid') ?? ''}`))
    .map((b) => {
      const w = b.closest('.world-content')
      return {
        label: (b.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 60),
        aria: b.getAttribute('aria-label'),
        testid: b.getAttribute('data-testid'),
        chip: b.getAttribute('data-chip'),
        visible: vis(b).visible,
        insideHiddenWorldContent: w !== null ? getComputedStyle(w).display === 'none' : false,
      }
    })
  return {
    location: txt('.map-overlay-label strong, [data-testid="location-label"]'),
    cell: txt('.map-overlay-label small'),
    hp: txt('.proto-righthud .proto-bar.hp .num'),
    gold: txt('[data-testid="currency-gold"]'),
    story: { present: !!storyEl, ...vis(storyEl), title: storyEl ? txt('.story-panel h2, #story-title') : null, para: storyEl ? (storyEl.querySelector('.beat-copy, p:not(.eyebrow)')?.textContent ?? '').replace(/\s+/g, ' ').trim().slice(0, 220) : null, backdrop: !!document.querySelector('.story-backdrop') },
    encounterBanner: { present: !!bannerEl, ...vis(bannerEl), ready: !!document.querySelector('.encounter-ready') },
    protoCombat: { present: !!protoCombat, ...vis(protoCombat), enemyName: txt('[data-testid="proto-combat"] .ename'), attackBtn: !!document.querySelector('[data-testid="combat-attack"]') },
    combatAffordances: combatBtns,
  }
})

async function clickPinXY(x, y, label, shot) {
  // Scope to ProtoShell's live map (old shell's pins are display:none)
  const sel = `.proto-map [data-testid="map-pin-${x}-${y}"], [data-testid="map-pin-${x}-${y}"]:not(.map-pin)`
  const loc = page.locator(sel).last()
  const found = await loc.count()
  if (found === 0) { step(label, { selector: sel, found: false }); return }
  const before = await state()
  const aria = await loc.getAttribute('aria-label')
  await loc.click({ force: true })
  await page.waitForTimeout(1000)
  const after = await state()
  if (shot) await page.screenshot({ path: `${OUT}/${shot}`, fullPage: false })
  step(label, { selector: sel, ariaLabel: aria, beforeHp: before.hp, afterHp: after.hp, after })
  // close story panel if it opened
  const closeBtn = page.locator('.story-close')
  if (await closeBtn.count() > 0) { await closeBtn.first().click(); await page.waitForTimeout(400) }
  else { await page.keyboard.press('Escape'); await page.waitForTimeout(400) }
}

// ---- boot ----
await page.goto(BASE)
await page.waitForTimeout(1500)
await page.getByTestId('menu-new-game').click()
await page.waitForSelector('.system-tile', { timeout: 8000 })
await page.locator('.system-tile').first().click()
await page.waitForTimeout(400)
await page.getByTestId('newgame-confirm').click()
await page.waitForSelector('.loading-screen', { timeout: 8000 })
await page.waitForFunction(() => document.querySelector('.loading-hint') !== null, { timeout: 8000 })
await page.locator('.loading-screen').click()
await page.waitForSelector('.proto-topbar', { timeout: 20000 })
await page.waitForTimeout(900)
step('boot state (village)', await state())
await page.screenshot({ path: `${OUT}/00-boot-village.png` })

// ---- BUG 1 ----
await clickPinXY(5, 5, 'BUG1 event pin "Giếng làng" (5,5) in VILLAGE', '01-well-story-panel.png')

// empty/plain cell: ProtoShell renders no pin for node-less cells, so there is
// nothing clickable for an empty cell — verify no plain pins exist in proto map.
const plainInfo = await page.evaluate(() => {
  const el = document.querySelector('.world-map-pins .map-pin--plain:not(.is-route-target)')
  const protoPlainPins = [...document.querySelectorAll('.proto-map .pin')].filter((p) => !(p.className.includes('event') || p.className.includes('npc') || p.className.includes('you')))
  return {
    plainPinExistsInOldShell: !!el,
    oldWorldContentDisplay: getComputedStyle(document.querySelector('.world-content')).display,
    protoShellPlainPinCount: protoPlainPins.length,
    protoShellPinCount: document.querySelectorAll('.proto-map .pin').length,
  }
})
step('BUG1 plain-cell pin check', plainInfo)

// ---- BUG 1 (exit pin, non-event) + BUG 2 (travel): forest exit pin (3,1) ----
await clickPinXY(3, 1, 'BUG1+2 exit pin "Đường vào rừng sương" (3,1) in VILLAGE — expect travel, no story', '02-forest-exit-pin-result.png')
const forest = await state()
step('arrived in Rừng Sương Mù', forest)
await page.screenshot({ path: `${OUT}/11-forest-overview.png` })

// forest pins dump
const forestPins = await page.evaluate(() =>
  [...document.querySelectorAll('.proto-map .pin')].map((p) => ({
    id: p.getAttribute('data-pin-id'), testid: p.getAttribute('data-testid'),
    text: p.textContent?.replace(/\s+/g, ' ').trim().slice(0, 36),
    aria: p.getAttribute('aria-label')?.slice(0, 70),
  }))
)
console.log('\nforest pins:'); console.log(JSON.stringify(forestPins, null, 2))

// enemy visibility anywhere in visible text
const enemyScan = await page.evaluate(() => {
  const t = document.body.innerText
  const names = ['Yêu Lang', 'Hồ Ly', 'Trư Nha', 'Mist-Tusk', 'Demon Wolf', 'Fox Spirit', 'lang yêu']
  return { visibleNames: names.filter((n) => t.includes(n)) }
})
step('BUG2 enemy names visible in DOM', enemyScan)

// ---- BUG2 danger pin (4,1) ----
await clickPinXY(4, 1, 'BUG2 danger pin "Dấu chân lang yêu" (4,1) in FOREST', '12-danger-pin-result.png')

// command input as combat affordance
step('BUG2 pre-command state (forest, before free text)', await state())
const cmd = page.locator('.proto-command input')
if (await cmd.count() > 0) {
  await cmd.first().fill('Bước vào giao chiến')
  await page.locator('.proto-command button[type="submit"]').first().click()
  await page.waitForTimeout(1000)
  step('BUG2 command input "Bước vào giao chiến" → after', await state())
  await page.screenshot({ path: `${OUT}/20-command-start-encounter.png` })
} else step('BUG2 command input', { found: false })

// full-page evidence shot
await page.screenshot({ path: `${OUT}/21-final-state.png`, fullPage: true })
console.log('\npage errors:', pageErrors.length ? pageErrors : 'none')
await browser.close()
