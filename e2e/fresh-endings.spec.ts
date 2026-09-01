import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'
type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

// These journeys drive the authored story from letter_at_dawn onward, so the
// fixture completes the two-step System boot (no narration backdrop left open).
function freshGame(update?: (g: GameState) => GameState): GameState {
  let game = applyAction(newGame('e2e-fresh-seed'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  game = applyAction(game, { kind: 'story_choice', choiceId: 'pick_sys_battle' }).state
  return update === undefined ? game : update(game)
}

async function openGame(page: Page, game = freshGame(), locale: Locale = 'en'): Promise<void> {
  const session: GameSession = { game, locale, chronicle: ['Fresh E2E run.'] }
  const slot = { slotId: 1, savedAt: 1, session }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    if (window.localStorage.getItem(slotsKey) !== null) return
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
  await page.getByTestId('menu-load-game').click()
  await page.getByTestId('save-slot-1').click()
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
}

async function clickChoice(page: Page, choiceLabel: string | RegExp): Promise<void> {
  // The story panel is transient (opens on Talk / event nodes) and its backdrop
  // blocks the world. Route-encounter buttons need the panel closed; story
  // choices need it open (re-opened via the journal's Talk action).
  const panelOpen = await page.getByTestId('narration-panel').isVisible().catch(() => false)
  const routeOpen = await page.getByTestId('route-encounter-screen').isVisible().catch(() => false)
  if (routeOpen) {
    if (panelOpen) await page.keyboard.press('Escape')
  } else if (!panelOpen) {
    await page.getByRole('button', { name: 'Open Journey journal' }).click()
    await page.getByRole('tab', { name: /People here/ }).click()
    await page.getByRole('button', { name: 'Talk' }).first().click()
  }
  await page.getByRole('button', { name: choiceLabel }).click()
  // Wait for state to propagate and UI to re-render
  await page.waitForTimeout(100)
  // Ensure map is visible
  await expect(page.getByTestId('game-screen')).toBeVisible()
}

async function moveDirection(page: Page, direction: 'north' | 'south' | 'east' | 'west'): Promise<void> {
  const keyMap = { north: 'ArrowUp', south: 'ArrowDown', east: 'ArrowRight', west: 'ArrowLeft' }
  await page.keyboard.press(keyMap[direction])
  await page.waitForTimeout(50)
}

async function getPlayerPos(page: Page): Promise<{ locationId: string; x: number; y: number }> {
  return await page.evaluate(() => {
    const raw = window.localStorage.getItem('phe-can-ky:slots')
    if (!raw) return { locationId: 'unknown', x: -1, y: -1 }
    const session = JSON.parse(raw)['1'] ?? {}
    return {
      locationId: session.game?.player?.locationId || 'unknown',
      x: session.game?.player?.posX ?? -1,
      y: session.game?.player?.posY ?? -1,
    }
  })
}

async function startEncounter(page: Page): Promise<void> {
  await page.getByRole('button', { name: /bước vào giao chiến|start encounter/i }).click()
  await page.waitForTimeout(50)
}

async function combatDefend(page: Page): Promise<void> {
  await page.getByRole('button', { name: /thủ thế|defend/i }).click()
  await page.waitForTimeout(50)
}

async function waitForEnding(page: Page): Promise<string> {
  await expect(page.locator('.ending-banner')).toBeVisible({ timeout: 10000 })
  return await page.locator('.ending-banner').textContent() || ''
}

async function waitForMapReady(page: Page): Promise<void> {
  // Simplified wait - just ensure game screen is stable
  await expect(page.getByTestId('game-screen')).toBeVisible()
  await page.waitForTimeout(200)
}

test.describe('Phase 0 P0-B: Fresh browser journeys to all endings + death', () => {
  test.beforeEach(async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
  })

test('Ending: Rootless Star (truth route, present proof)', async ({ page }) => {
    await openGame(page)
    
    // Hồi I: study_letter (hide pin, decipher)
    await clickChoice(page, /giấu trâm|hide the pin/i)
    await waitForMapReady(page)

    // Hồi II: ask_ngo (sit with Ngo)
    await clickChoice(page, /ngồi với ngô|sit with ngo/i)
    await waitForMapReady(page)

// Navigate to market (truth route target): west, west, east from village
    await page.keyboard.press('Escape')
    await moveDirection(page, 'west')
    let pos = await getPlayerPos(page)
    console.log(`[Rootless Star] After west 1: location=${pos.locationId}, pos=(${pos.x},${pos.y})`)
    
    await moveDirection(page, 'west')
    pos = await getPlayerPos(page)
    console.log(`[Rootless Star] After west 2: location=${pos.locationId}, pos=(${pos.x},${pos.y})`)
    
    await moveDirection(page, 'east')
    pos = await getPlayerPos(page)
    console.log(`[Rootless Star] After east: location=${pos.locationId}, pos=(${pos.x},${pos.y})`)
    
    await expect(page.getByTestId('location-label')).toHaveText('Cloudgather Market')
    await expect(page.getByTestId('route-encounter-screen')).toBeVisible()

    // The route encounter supplies proof; then its authored scene advances the story.
    await clickChoice(page, /chép tên thứ tám|copy the eighth name/i)
    await clickChoice(page, /chép bảy cái tên|copy all seven names/i)
    await clickChoice(page, /chép lời hà|record ha/i)
    await waitForMapReady(page)

    // Sect trial: expose_vo
    await clickChoice(page, /đưa lời hà|read ha/i)
    await waitForMapReady(page)

    // Mirror choice: confess
    await clickChoice(page, /nói sự thật|tell khoa/i)
    await waitForMapReady(page)

    // Last page: open_last_page
    await clickChoice(page, /mở gương|open the mirror/i)

    const endingText = await waitForEnding(page)
    expect(endingText).toContain('Rootless Star')
  })

  test('Ending: Spring for an Enemy (mercy route, present proof)', async ({ page }) => {
    await openGame(page)

    // Hồi I: return_pin
    await clickChoice(page, /trả trâm|return meihua/i)

    // Hồi II: warn_village
    await clickChoice(page, /tin lời bà ma|trust granny ma/i)

    // The route lead replaces the normal node test id; assert it before entering the porch.
    await page.keyboard.press('Escape')
    await moveDirection(page, 'north')
    await expect(page.getByTestId('route-event-node')).toBeVisible()
    await moveDirection(page, 'west')
    await expect(page.getByTestId('route-encounter-screen')).toBeVisible()

    // The on-site encounter supplies proof; its authored scene advances afterward.
    await clickChoice(page, /đọc cái tên|read the name aloud/i)
    await clickChoice(page, /đi cùng mai hoa|walk with meihua/i)

    // Cave witness: free_ha
    await clickChoice(page, /phá một góc phong ấn|break part of the seal/i)

    // Sect trial: keep_seal
    await clickChoice(page, /giữ gương kín|keep the mirror sealed/i)

    // Mirror choice: confess
    await clickChoice(page, /nói sự thật|tell khoa/i)

    // Last page: share_last_page
    await clickChoice(page, /đưa quyết định|give the choice/i)

    const endingText = await waitForEnding(page)
    expect(endingText).toContain('Spring for an Enemy')
  })

  test('Ending: Kingdom of the Rift (truth route, withhold proof, Ha bound)', async ({ page }) => {
    await openGame(page)

    await clickChoice(page, /giấu trâm|hide the pin/i)
    await clickChoice(page, /ngồi với ngô|sit with ngo/i)

    await page.keyboard.press('Escape')
    await moveDirection(page, 'west')
    await moveDirection(page, 'west')
    await moveDirection(page, 'east')
    await expect(page.getByTestId('location-label')).toHaveText('Cloudgather Market')
    await expect(page.getByTestId('route-encounter-screen')).toBeVisible()

    // Route encounter (truth): withhold the copy, then keep truth < 3 by
    // taking Ngo's joke (mercy) instead of tracing the erased name (truth+1
    // would reach 3 and resolve rootless_star before the power check).
    await clickChoice(page, /gấp bản sao|fold the copy/i) // withhold
    await clickChoice(page, /bắt ngô kể|make ngo tell/i) // tell_ngo_joke

    await clickChoice(page, /xin hà nhập|ask ha to enter/i) // bind_ha

    await clickChoice(page, /cướp gương|take the mirror/i) // take_mirror

    await clickChoice(page, /nhập ký ức|merge with the past/i) // inherit_self

    await clickChoice(page, /mở gương|open the mirror/i) // open_last_page

    const endingText = await waitForEnding(page)
    expect(endingText).toContain('Kingdom of the Rift')
  })

  test('Ending: City of Remembering Ghosts (wealth route)', async ({ page }) => {
    await openGame(page)

    await clickChoice(page, /mang trâm đến chợ|take the pin to market/i)
    await clickChoice(page, /bán bản đồ cho bảo|sell the map to bao/i)

    // Navigate to the wealth lead: west x4, south from village.
    await page.keyboard.press('Escape')
    await moveDirection(page, 'west')
    await moveDirection(page, 'west')
    await moveDirection(page, 'west')
    await moveDirection(page, 'west')
    await moveDirection(page, 'south')
    await expect(page.getByTestId('route-encounter-screen')).toBeVisible()

    // Route encounter (wealth): seal the debt publicly, then buy the ward.
    await clickChoice(page, /ép dấu tay|seal the debt/i) // present
    await clickChoice(page, /bỏ tiền mua bùa|pay for the ward/i) // buy_ward

    await clickChoice(page, /phá một góc|break part of the seal/i) // free_ha

    await clickChoice(page, /giữ gương kín|keep the mirror sealed/i) // keep_seal

    await clickChoice(page, /nói sự thật|tell khoa/i) // confess

    await clickChoice(page, /mở gương|open the mirror/i)

    const endingText = await waitForEnding(page)
    expect(endingText).toContain('City of Remembering Ghosts')
  })

  test('Ending: The Iron Lantern (default open_last_page)', async ({ page }) => {
    await openGame(page)

    await clickChoice(page, /trả trâm|return meihua/i)
    await clickChoice(page, /tin lời bà ma|trust granny ma/i)

    await page.keyboard.press('Escape')
    await moveDirection(page, 'north')
    await expect(page.getByTestId('route-event-node')).toBeVisible()
    await moveDirection(page, 'west')
    await expect(page.getByTestId('route-encounter-screen')).toBeVisible()

    // Route encounter (mercy): read the name publicly, then keep the roll call.
    await clickChoice(page, /đọc cái tên|read the name aloud/i) // present
    await clickChoice(page, /đi cùng mai hoa|walk with meihua/i) // keep_roll_call

    await clickChoice(page, /phá một góc|break part of the seal/i) // free_ha (cave_witness)
    await clickChoice(page, /giữ gương kín|keep the mirror sealed/i) // keep_seal
    await clickChoice(page, /xóa tên mình|erase your name/i) // leave_blank (mirror_choice)
    await clickChoice(page, /mở gương|open the mirror/i) // open_last_page: no truth/power/wealth → iron_lantern

    const endingText = await waitForEnding(page)
    expect(endingText).toContain('Iron Lantern')
  })

  test('Ending: The Borrowed Face (truth route, withhold, power)', async ({ page }) => {
    await openGame(page)

    await clickChoice(page, /giấu trâm|hide the pin/i)
    await clickChoice(page, /ngồi với ngô|sit with ngo/i)

    await page.keyboard.press('Escape')
    await moveDirection(page, 'west')
    await moveDirection(page, 'west')
    await moveDirection(page, 'east')
    await expect(page.getByTestId('route-encounter-screen')).toBeVisible()

    // Route encounter (truth): withhold the copy, then keep truth < 3 with
    // Ngo's joke; power alone (no ha_bound) resolves borrowed_face.
    await clickChoice(page, /gấp bản sao|fold the copy/i) // withhold
    await clickChoice(page, /bắt ngô kể|make ngo tell/i) // tell_ngo_joke

    await clickChoice(page, /đọc cái tên thứ tám|read the eighth name/i) // name_the_eighth (no stat change)
    await clickChoice(page, /cướp gương|take the mirror/i) // take_mirror

    await clickChoice(page, /nhập ký ức|merge with the past/i) // inherit_self

    await clickChoice(page, /mở gương|open the mirror/i)

    const endingText = await waitForEnding(page)
    expect(endingText).toContain('Borrowed Face')
  })

  test('Ending: Forgiven Enemy (mercy route, share, mercy 3 + khoa trust)', async ({ page }) => {
    await openGame(page)

    await clickChoice(page, /trả trâm|return meihua/i)
    await clickChoice(page, /tin lời bà ma|trust granny ma/i)

    // keep_roll_call grants story_mercy + companion, the present proof grants
    // another mercy point, and confess at the mirror grants khoa_trusted —
    // mercy >= 3 + khoa_trusted resolves forgiven_enemy at share_last_page.
    await page.keyboard.press('Escape')
    await moveDirection(page, 'north')
    await expect(page.getByTestId('route-event-node')).toBeVisible()
    await moveDirection(page, 'west')
    await expect(page.getByTestId('route-encounter-screen')).toBeVisible()
    await clickChoice(page, /đọc cái tên|read the name aloud/i) // present proof
    await clickChoice(page, /đi cùng mai hoa|walk with meihua/i) // keep_roll_call

    await clickChoice(page, /phá một góc|break part of the seal/i) // free_ha
    await clickChoice(page, /giữ gương kín|keep the mirror sealed/i) // keep_seal
    await clickChoice(page, /nói sự thật|tell khoa/i) // confess
    await clickChoice(page, /đưa quyết định|give the choice/i) // share_last_page

    const endingText = await waitForEnding(page)
    expect(endingText).toContain('Spring for an Enemy')
  })

  test('Death ending: tragic_death via combat', async ({ page }) => {
    await openGame(page, freshGame((g) => ({
      ...g,
      // hp 16: the misty_forest hazard deals 15 on arrival, leaving exactly 1,
      // so the boar's next reply (min 1 after defend's guard) is a guaranteed
      // combat death — not an environment death.
      player: { ...g.player, hp: 16, stage: 0, qi: 10 },
    })))

    // North twice: (3,3) → (3,2) → (3,1) village-forest-exit → misty_forest,
    // where the mist boar is the location enemy and the fight button shows.
    await moveDirection(page, 'north')
    await moveDirection(page, 'north')
    await expect(page.getByRole('button', { name: /bước vào giao chiến|start encounter/i })).toBeVisible()

    await startEncounter(page)

    // Defend with hp=1: the guaranteed enemy reply kills without a coin flip.
    await combatDefend(page)

    // The death dialog is dismissable but modal; its banner carries the epitaph.
    await expect(page.locator('.death-screen')).toBeVisible({ timeout: 5000 })
    const deathText = await page.locator('.death-epitaph').textContent() || ''
    expect(deathText).toContain('overturned herb basket')
    // The ending identity lands in the autosave (the chronicle lives inside the
    // transient story panel, which is closed after a terminal combat).
    const saved = await page.evaluate(() => window.localStorage.getItem('phe-can-ky:slots'))
    const endingId = saved === null ? null : (JSON.parse(saved)['1']?.session?.game?.endingId ?? null)
    expect(endingId).toBe('tragic_death')
  })
})