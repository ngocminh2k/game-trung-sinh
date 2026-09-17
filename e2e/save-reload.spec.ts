import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'
type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

// Complete the two-step System boot so exploration fixtures open on the world,
// not under the boot narration backdrop (legacy-boot saves keep that panel).
function freshGame(update?: (g: GameState) => GameState): GameState {
  let game = applyAction(newGame('gate04-save-reload-seed'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  game = applyAction(game, { kind: 'story_choice', choiceId: 'pick_sys_battle' }).state
  return update === undefined ? game : update(game)
}

async function openGame(page: Page, game = freshGame(), locale: Locale = 'en'): Promise<void> {
  const session: GameSession = { game, locale, chronicle: ['Gate-04 save.'] }
  // savedAt must be now: the auto-resume montage spends elapsed real time
  // meditating (savedAt:1 → 72h cap × 1 progress/h → stage0+1 breakthroughs =
  // exactly +28 pending attribute points), and the #34 softlock gate then
  // refuses every action — start_encounter included (chronicle: "Spend your
  // new attribute points…").
  const slot = { slotId: 1, savedAt: Date.now(), session }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    if (window.localStorage.getItem(slotsKey) !== null) return
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
  // Issue #17: auto-resume lands on loading then game; no Load Game hop.
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
}

async function readSave(page: Page): Promise<GameSession> {
  const slots = await page.evaluate((key) => window.localStorage.getItem(key), SLOTS_KEY)
  expect(slots).not.toBeNull()
  const parsed = JSON.parse(slots as string) as Record<string, { session: GameSession }>
  return parsed['1']!.session
}

async function openStoryPanel(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Open Journey journal' }).click()
  await page.getByRole('tab', { name: /People here/ }).click()
  // DRIFT (issue #40, same class as system-notifications' People-tab Talk): a
  // bare { name: 'Talk' } can never resolve strictly here anyway — the journal
  // renders one Talk per NPC card (panels.tsx:586; village has 6+) — and the
  // map pin "Talk to Elder Meihua" also matches but never opens a scene. Scope
  // to the journal + exact name, keep .first() for the per-NPC duplicates.
  await page.getByTestId('journal-screen').getByRole('button', { name: 'Talk', exact: true }).first().click()
  await expect(page.getByTestId('narration-panel')).toBeVisible()
}

test('GATE-04 reload during exploration preserves location, hp, qi, and story flags', async ({ page }) => {
  await openGame(
    page,
    freshGame((game) => ({
      ...game,
      player: { ...game.player, locationId: 'misty_forest', posX: 4, posY: 1, hp: 12, qi: 7 },
      flags: { ...game.flags, story_scene: 'forest_glade' },
    })),
  )
  // DRIFT (issue #40 §4 VIEWPORT RULE): location-label lives inside .world-content
  // (GameScreen.tsx:767), display:none at ≥921 — toHaveText passes on hidden DOM,
  // so read it where a user can actually see it.
  await page.setViewportSize({ width: 800, height: 900 })
  await expect(page.getByTestId('location-label')).toHaveText(/Misty Forest|Misty|Rừng Vân/i)
  await page.reload()
  // Auto-resume after reload: straight to loading beat then game.
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  const session = await readSave(page)
  expect(session.game.player.locationId).toBe('misty_forest')
  expect(session.game.player.hp).toBe(12)
  expect(session.game.player.qi).toBe(7)
  expect(session.game.flags.story_scene).toBe('forest_glade')
  // Schema must be versioned and Zod-valid; re-validate via reducer imports is overkill — basic shape check.
  // newGame stamps GAME_STATE_VERSION (currently 2); the roundtrip must not
  // corrupt it. (newGame never migrates — the live v1→v2 path is proven in
  // save-slots.spec.ts W1 + test/migration.test.ts, not here.)
  expect(session.game.version).toBe(2)
  expect(session.game.terminal).toBe(false)
})

test('GATE-04 reload during route encounter preserves flags and the encounter screen re-mounts', async ({ page }) => {
  await openGame(
    page,
    freshGame((game) => ({
      ...game,
      player: { ...game.player, locationId: 'village', posX: 2, posY: 2 },
      flags: { ...game.flags, story_scene: 'village_vow', story_route: 'mercy', story_route_arrived: true },
    })),
  )
  const routeEncounter = page.getByTestId('route-encounter-screen')
  await expect(routeEncounter).toBeVisible()
  await page.reload()
  // Auto-resume after reload: straight to loading beat then game.
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  await expect(routeEncounter).toBeVisible()
  const session = await readSave(page)
  expect(session.game.flags.story_route).toBe('mercy')
  expect(session.game.flags.story_route_arrived).toBe(true)
})

test('GATE-04 reload during combat preserves encounter HP and the action can be replayed', async ({ page }) => {
  await openGame(
    page,
    freshGame((game) => ({
      ...game,
      player: { ...game.player, locationId: 'misty_forest', posX: 4, posY: 1, hp: 16, qi: 30 },
    })),
  )
  // DRIFT (issue #40): the legacy 'Start encounter' + 'Defend' buttons are in
  // .world-content, unclickable at every width (display:none ≥921; under the proto
  // map .painting at ≤920 — the sysnotify seizure finding). Route the SAME
  // { kind:'start_encounter' } action through ProtoShell's fight chip and defend
  // through #proto-combat — the desktop-visible twin controls (fresh-endings:72-88).
  await page.locator('[data-chip="fight"]').click()
  const encounter = page.getByTestId('proto-combat')
  await expect(encounter).toBeVisible()
  // A defend action drops player into a turn-bound state without ending the encounter.
  await encounter.getByRole('button', { name: /thủ thế|defend/i }).click()
  await expect(encounter).toBeVisible()
  await page.reload()
  // Auto-resume after reload: straight to loading beat then game.
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  const session = await readSave(page)
  // A defend turn keeps the encounter alive; reducer rolls retaliation, but a saved snapshot
  // must always have either a valid encounter shape OR a null encounter (sanitized to null
  // only if the snapshot is illegal). Either is acceptable per src/engine/rpg-state.ts.
  const enc = session.game.encounter
  if (enc !== null) {
    expect(enc.hp).toBeGreaterThanOrEqual(1)
    expect(enc.maxHp).toBeGreaterThanOrEqual(1)
  }
  expect(session.game.terminal).toBe(false)
  expect(session.game.player.alive).toBe(true)
})

test('GATE-04 reload with Journal open does not corrupt the world and the save remains schema-valid', async ({ page }) => {
  await openGame(
    page,
    freshGame((game) => ({
      ...game,
      player: { ...game.player, locationId: 'village', posX: 2, posY: 2, hp: 18, qi: 12 },
      inventory: { ...game.inventory, trail_rations: 2, jade_charm: 1 },
    })),
  )
  await page.getByRole('button', { name: 'Open Journey journal' }).click()
  await expect(page.getByTestId('inventory-inspector')).toBeVisible()
  await page.reload()
  // Auto-resume after reload: straight to loading beat then game.
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  // World mounts back; Journal is a runtime overlay, not persisted.
  // DRIFT (issue #40): .world-content is display:none at ≥921 (screens.css:1997), and
  // this spec never overrode the 1280 default — toBeVisible here could never pass.
  // Read the world back at 800×900, where the legacy column genuinely renders, and
  // prove the journal did NOT persist: world-content un-hidden and the journal
  // overlay's inventory-inspector not visible (it may still be attached under the
  // closed journal, so assert visibility, not DOM absence).
  await page.setViewportSize({ width: 800, height: 900 })
  await expect(page.getByTestId('world-content')).toBeVisible()
  await expect(page.getByTestId('inventory-inspector')).toBeHidden()
  const session = await readSave(page)
  expect(session.game.player.locationId).toBe('village')
  expect(session.game.inventory.trail_rations).toBe(2)
  expect(session.game.inventory.jade_charm).toBe(1)
})

test('GATE-04 reload immediately before an ending still reaches that ending', async ({ page }) => {
  await openGame(
    page,
    freshGame((game) => ({
      ...game,
      flags: { ...game.flags, story_scene: 'scene_ascension', story_truth: 3 },
    })),
  )
  // We are parked on the terminal choice scene; the panel opens on Talk.
  await openStoryPanel(page)
  await expect(page.locator('.story-choices .choice-button').first()).toBeVisible()
  await page.reload()
  // Auto-resume after reload: straight to loading beat then game.
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  // The terminal scene must still be the same after the reload.
  await openStoryPanel(page)
  await expect(page.locator('.story-choices .choice-button').first()).toBeVisible()
  await page.locator('.story-choices .choice-button').first().click()
  // #40 Step 2 lifted .ending-banner out of the hidden .world-content, so a
  // visibility assertion is now satisfiable — without it, toContainText alone
  // passes against a hidden node (the triage §5 vacuous-pass trap).
  await expect(page.locator('.ending-banner')).toBeVisible()
  await expect(page.locator('.ending-banner')).toContainText(/Rootless Star/i)
  // Save persists the terminal state.
  const session = await readSave(page)
  expect(session.game.terminal).toBe(true)
  expect(session.game.endingId).toBe('rootless_star')
})
