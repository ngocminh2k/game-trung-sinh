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
  const slot = { slotId: 1, savedAt: Date.now(), session }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
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
    // Open the journal with the I hotkey, not a click on 'Open Journey journal':
    // at <=800px ProtoShell's map .painting intercepts that pointer hit
    // (issue #40), and GameScreen.tsx:362 opens the same dialog on 'i' without
    // a hit-test. Talk stays scoped INSIDE the journal dialog — unscoped,
    // name 'Talk' substring-matches the map pin "Talk to Elder Meihua" behind
    // the modal and stalls 30s on intercepted pointer events.
    await page.keyboard.press('i')
    const journal = page.getByTestId('journal-screen')
    await expect(journal).toBeVisible({ timeout: 5000 })
    await journal.getByRole('tab', { name: /People here|Người ở đây/i }).click()
    await journal.getByRole('button', { name: /^(Talk|Nói chuyện)$/ }).first().click()
    await expect(page.getByTestId('narration-panel')).toBeVisible({ timeout: 5000 })
  }
  await page.getByRole('button', { name: choiceLabel }).click()
  // Wait for state to propagate and UI to re-render
  await page.waitForTimeout(100)
  // Ensure map is visible
  await expect(page.getByTestId('game-screen')).toBeVisible()
}

// DRIFT (issue #40): the route-target highlight on the porch pin
// (data-testid="route-event-node", GameScreen.tsx:778) exists only in the legacy map,
// and screens.css:1992 sets the whole legacy .world-content to display:none at
// >=921px. ProtoShell's .proto-map has no route-target decoration at all (zero 'route'
// references in ProtoShell.tsx), so there is no visible equivalent: the marker is
// asserted as DOM state (toBeAttached = storyRouteTarget still marks the porch) and the
// *visible* consequence is proven by the next step — travelling west opens the
// route-encounter screen.

async function moveDirection(page: Page, direction: 'north' | 'south' | 'east' | 'west'): Promise<void> {
  const keyMap = { north: 'ArrowUp', south: 'ArrowDown', east: 'ArrowRight', west: 'ArrowLeft' }
  await page.keyboard.press(keyMap[direction])
  await page.waitForTimeout(50)
}

async function startEncounter(page: Page): Promise<void> {
  // DRIFT (issue #40): the legacy 'Start encounter' button lives in .world-content
  // (GameScreen.tsx:734) which is display:none at >=921px, so it is absent from the
  // a11y tree (Playwright: "element(s) not found") at the desktop drive width.
  // ProtoShell's fight chip renders the same { kind:'start_encounter' } action
  // (ProtoShell.tsx:586) and is the desktop-visible control.
  await page.locator('[data-chip="fight"]').click()
  await page.waitForTimeout(50)
}

async function combatDefend(page: Page): Promise<void> {
  // At >=921px only ProtoShell's combat overlay is visible (the legacy encounter-banner
  // with its own 'Defend' is inside the display:none .world-content), so this name is
  // unique. Scope anyway so a future desktop render of the legacy banner can't make it
  // a strict-mode violation.
  await page.getByTestId('proto-combat').getByRole('button', { name: /thủ thế|defend/i }).click()
  await page.waitForTimeout(50)
}

async function waitForEnding(page: Page): Promise<string> {
  // Terminal banners are read at the drive width as-is: issue #40 lifted DeathScreen
  // and .ending-banner out of .world-content into .game-shell (GameScreen.tsx:651-671,
  // styled visible at screens.css:2062), so they render at every breakpoint now.
  const banner = page.locator('.ending-banner')
  await expect(banner).toBeVisible({ timeout: 10000 })
  return await banner.textContent() || ''
}

async function waitForMapReady(page: Page): Promise<void> {
  // Simplified wait - just ensure game screen is stable
  await expect(page.getByTestId('game-screen')).toBeVisible()
  await page.waitForTimeout(200)
}

test.describe('Phase 0 P0-B: Fresh browser journeys to all endings + death', () => {
  test.beforeEach(async ({ page }) => {
    // Desktop drive width: #journal-screen is position:fixed (screens.css .drawer-panel
    // + its own centering block) so its tabs stay in the viewport here, and the story
    // panel / route encounter / travel keys all work. Issue #40 lifted the terminal
    // outputs (.ending-banner, DeathScreen) to .game-shell so they show at every
    // width; the rest of the legacy .world-content (its map pins, .location-label,
    // encounter banner) is still display:none at >=921px per screens.css:1990, so
    // those assertions use the ProtoShell equivalents or DOM state (toBeAttached).
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
    await moveDirection(page, 'west')
    await moveDirection(page, 'east')

    // DRIFT (issue #40): the legacy map keeps its own data-testid="map-current-cell"
    // attached but display:none at >=921px, so the bare testid is a 2-element strict
    // mode violation — scope to the desktop-visible .proto-map copy.
    await expect(page.locator('.proto-map [data-testid="map-current-cell"]')).toContainText('Cloudgather Market')
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

    // Issue #15 climb: last_page → the mercy road → chapter 7 → chapter 8.
    await clickChoice(page, /MERCY road|đường MINH/i)
    await clickChoice(page, /fading spirit|đứng trước vong hồn/i)

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
    await expect(page.getByTestId('route-event-node')).toBeAttached()
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

    // Issue #15 climb: last_page → the mercy road → chapter 7 → chapter 8.
    await clickChoice(page, /MERCY road|đường MINH/i)
    await clickChoice(page, /true name|gọi đúng tên/i)

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
    // DRIFT (issue #40): as in the Rootless Star journey — scope to the visible
    // .proto-map copy (GameScreen.tsx:801 keeps the same testid, hidden).
    await expect(page.locator('.proto-map [data-testid="map-current-cell"]')).toContainText('Cloudgather Market')
    await expect(page.getByTestId('route-encounter-screen')).toBeVisible()

    // Route encounter (truth): withhold the copy, then keep truth < 3 by
    // taking Ngo's joke (mercy) instead of tracing the erased name (truth+1
    // would reach 3 and resolve rootless_star before the power check).
    await clickChoice(page, /gấp bản sao|fold the copy/i) // withhold
    await clickChoice(page, /bắt ngô kể|make ngo tell/i) // tell_ngo_joke

    await clickChoice(page, /xin hà nhập|ask ha to enter/i) // bind_ha

    await clickChoice(page, /cướp gương|take the mirror/i) // take_mirror

    await clickChoice(page, /nhập ký ức|merge with the past/i) // inherit_self

    // Issue #15 climb: the mercy road (boot branch) → chapter 7 → chapter 8.
    await clickChoice(page, /MERCY road|đường MINH/i)
    await clickChoice(page, /halt the trial|chấm dừng phép thử/i)

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

    // Issue #15 climb: the mercy road (boot branch) → chapter 7 → chapter 8.
    await clickChoice(page, /MERCY road|đường MINH/i)
    await clickChoice(page, /fading spirit|đứng trước vong hồn/i)

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
    await expect(page.getByTestId('route-event-node')).toBeAttached()
    await moveDirection(page, 'west')
    await expect(page.getByTestId('route-encounter-screen')).toBeVisible()

    // Route encounter (mercy): read the name publicly, then keep the roll call.
    await clickChoice(page, /đọc cái tên|read the name aloud/i) // present
    await clickChoice(page, /đi cùng mai hoa|walk with meihua/i) // keep_roll_call

    await clickChoice(page, /phá một góc|break part of the seal/i) // free_ha (cave_witness)
    await clickChoice(page, /giữ gương kín|keep the mirror sealed/i) // keep_seal
    await clickChoice(page, /xóa tên mình|erase your name/i) // leave_blank (mirror_choice)
    // Issue #15 climb: the mercy road (boot branch) → chapter 7 → chapter 8.
    await clickChoice(page, /MERCY road|đường MINH/i)
    await clickChoice(page, /halt the trial|chấm dừng phép thử/i)
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

    // Issue #15 climb: the mercy road (boot branch) → chapter 7 → chapter 8.
    await clickChoice(page, /MERCY road|đường MINH/i)
    await clickChoice(page, /true name|gọi đúng tên/i)

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
    await expect(page.getByTestId('route-event-node')).toBeAttached()
    await moveDirection(page, 'west')
    await expect(page.getByTestId('route-encounter-screen')).toBeVisible()
    await clickChoice(page, /đọc cái tên|read the name aloud/i) // present proof
    await clickChoice(page, /đi cùng mai hoa|walk with meihua/i) // keep_roll_call

    await clickChoice(page, /phá một góc|break part of the seal/i) // free_ha
    await clickChoice(page, /giữ gương kín|keep the mirror sealed/i) // keep_seal
    await clickChoice(page, /nói sự thật|tell khoa/i) // confess
    // Issue #15 climb: the mercy road (boot branch) → chapter 7 → chapter 8.
    await clickChoice(page, /MERCY road|đường MINH/i)
    await clickChoice(page, /fading spirit|đứng trước vong hồn/i)
    await clickChoice(page, /đưa quyết định|give the choice/i) // share_last_page

    const endingText = await waitForEnding(page)
    expect(endingText).toContain('Spring for an Enemy')
  })

  test('Death ending: tragic_death via combat', async ({ page }) => {
    const readGame = () => page.evaluate(() => {
      const raw = window.localStorage.getItem('phe-can-ky:slots')
      return raw === null ? undefined : (JSON.parse(raw)['1'] as { session?: { game?: GameState } })?.session?.game
    })

    await openGame(page, freshGame((g) => ({
      ...g,
      // DRIFT (issue #40): the misty_forest border-crossing roll for this seed
      // deals 11 (reducer.ts:585-590 damageRoll), not the 15 this journey assumed,
      // so hp 16 used to land on exactly 1 and one Defend killed. Now hp lands at 5
      // and the boar's guarded reply takes >=1 per turn (Math.max(1, ...) at
      // reducer.ts:1374), so the journey defends until the death screen appears —
      // a bounded-but-guaranteed combat death instead of a tuned one-hit kill.
      player: { ...g.player, hp: 16, stage: 0, qi: 10 },
    })))

    // North twice: (3,3) → (3,2) → misty_forest, where the mist boar is the
    // location enemy and the fight chip shows.
    await moveDirection(page, 'north')
    await moveDirection(page, 'north')
    expect((await readGame())?.player.hp).toBeLessThan(16)
    // DRIFT (issue #40): the legacy 'Start encounter' button is display:none at
    // >=921px ("element(s) not found" for a role query); the desktop-visible control
    // that dispatches the same start_encounter action is ProtoShell's fight chip.
    await expect(page.locator('[data-chip="fight"]')).toBeVisible()

    await startEncounter(page)

    // Survived the woods and the boar is on the field ⇒ every hit from here is a
    // combat hit. Defend (guard 4, enemy damage floor 1) until hp runs out.
    for (let turn = 0; turn < 20; turn += 1) {
      if ((await readGame())?.player.alive === false) break
      await combatDefend(page)
    }

    // The death dialog is dismissable but modal; its banner carries the epitaph.
    await expect(page.locator('.death-screen')).toBeVisible({ timeout: 5000 })
    const deathText = await page.locator('.death-epitaph').textContent() || ''
    expect(deathText).toContain('overturned herb basket')
    // The ending identity lands in the autosave (the chronicle lives inside the
    // transient story panel, which is closed after a terminal combat).
    const saved = await readGame()
    expect(saved?.endingId).toBe('tragic_death')
    // The cause distinguishes this from a hazard death on the way in.
    expect(saved?.flags?.death_cause).toBe('combat:mist_boar')
  })
})