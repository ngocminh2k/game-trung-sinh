import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'

// Shell is viewport-selected (issue40-triage §4 "VIEWPORT RULE"): the legacy
// world surface (.world-content, map nodes, full-screen journal) is the visible
// one at <=920px; the ProtoShell surfaces (dock tabs, proto-map pins,
// proto-combat) exist only at >=921px. Tests target one shell each.
const LEGACY_VIEWPORT = { width: 800, height: 720 }
const PROTO_VIEWPORT = { width: 1280, height: 800 }

type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

function freshGame(update?: (game: GameState) => GameState): GameState {
  let game = applyAction(newGame('browser-acceptance-seed'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  game = applyAction(game, { kind: 'story_choice', choiceId: 'pick_sys_battle' }).state
  return update === undefined ? game : update(game)
}

function atLocation(locationId: string, posX: number, posY: number, update?: (game: GameState) => GameState): GameState {
  return freshGame((game) => {
    const located = { ...game, player: { ...game.player, locationId, posX, posY } }
    return update === undefined ? located : update(located)
  })
}

async function beginPlaying(page: Page): Promise<void> {
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
}

async function openGame(page: Page, game = freshGame(), locale: Locale = 'en'): Promise<void> {
  const session: GameSession = { game, locale, chronicle: ['Acceptance save is ready.'] }
  // savedAt must be fresh. A stale epoch boots as a months-long offline gap,
  // applyOfflineGains grants attribute points, and the #34 allocation gate
  // (ATTRIBUTE_ALLOCATION_REQUIRED, reducer.ts) then refuses every talk.
  const slot = { slotId: 1, savedAt: Date.now(), session }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    if (window.localStorage.getItem(slotsKey) !== null) return
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
  await beginPlaying(page)
}

async function openDialogue(page: Page): Promise<void> {
  await page.getByRole('button', { name: 'Open Journey journal' }).click()
  await page.getByRole('tab', { name: /People here/ }).click()
  // Scope to the journal: the map pins are labelled "Talk to <NPC>" and match
  // the same substring, but they sit behind the modal and swallow the click.
  await page.getByTestId('journal-screen').getByRole('button', { name: 'Talk' }).first().click()
  await expect(page.getByTestId('narration-panel')).toBeVisible()
}

test.describe('legacy shell (<=920px)', () => {
  test.use({ viewport: LEGACY_VIEWPORT })

  test('starts as exploration, travels without losing a day, and persists', async ({ page }) => {
    await openGame(page, freshGame(), 'vi')
    await expect(page.getByTestId('narration-panel')).toHaveCount(0)
    // Boot consumed two story-choice days; ordinary travel must not cost more.
    await expect(page.locator('.day-chip')).toContainText('Ngày 3')
    await page.getByRole('button', { name: 'EN', exact: true }).click()
    await expect(page.getByRole('heading', { name: 'Local area map' })).toBeVisible()
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(page.getByTestId('location-label')).toHaveText('Cloudgather Market')
    await expect(page.locator('.day-chip')).toContainText('Day 3')
    await page.reload()
    await beginPlaying(page)
    await expect(page.getByTestId('location-label')).toHaveText('Cloudgather Market')
  })

  test('regional map nodes and local exits are visible and usable', async ({ page }) => {
    await openGame(page)
    await expect(page.getByTestId('event-node-village-market-exit')).toBeVisible()
    await expect(page.getByTestId('event-node-village-elder-porch')).toBeVisible()
    await page.keyboard.press('ArrowLeft')
    await page.keyboard.press('ArrowLeft')
    await expect(page.getByTestId('event-node-market-square')).toBeVisible()
    await expect(page.getByTestId('event-node-market-village-exit')).toBeVisible()
  })

  test('Journal is a full mode with an inventory inspector and an explicit return', async ({ page }) => {
    await openGame(page)
    await page.getByRole('button', { name: 'Open Journey journal' }).click()
    await expect(page.getByTestId('world-content')).toBeHidden()
    await expect(page.getByTestId('inventory-inspector')).toBeVisible()
    // Accessible name carries the arrow glyph ("← Back to world"), so match by
    // substring, not the old exact 'Back to world'.
    await page.getByRole('button', { name: /Back to world/ }).click()
    await expect(page.getByTestId('world-content')).toBeVisible()
  })
})

test.describe('proto shell (>=921px)', () => {
  test.use({ viewport: PROTO_VIEWPORT })

  test('opens dialogue for NPC talk and blocks movement until dismissal', async ({ page }) => {
    await openGame(page)
    // Two shells can expose map-current-cell; the first is the one on screen.
    const startCell = (await page.getByTestId('map-current-cell').first().textContent()) ?? ''
    await openDialogue(page)
    const close = page.getByRole('button', { name: /Continue/ })
    // Story modal tier (panel z60, backdrop z59): the world goes inert while
    // it is up. Focus stays with the launcher that opened it, so dismissal is
    // proven reachable below via the Tab trap, not by autofocus.
    await expect(page.locator('.topbar')).toHaveAttribute('inert', '')
    await expect(page.locator('.stage-notices')).toHaveAttribute('inert', '')
    await page.locator('#free-command').fill('wait')
    await page.locator('.command-form button').focus()
    await page.keyboard.press('Tab')
    await expect(close).toBeFocused()
    await page.keyboard.press('ArrowDown')
    await expect(page.getByTestId('map-current-cell').first()).toHaveText(startCell)
    await page.keyboard.press('Escape')
    await expect(page.getByTestId('narration-panel')).toHaveCount(0)
    await expect(page.locator('.topbar')).not.toHaveAttribute('inert', '')
    await expect(page.locator('.stage-notices')).not.toHaveAttribute('inert', '')
    await expect(page.locator('.hud-panel')).not.toHaveAttribute('inert', '')
    await page.keyboard.press('ArrowDown')
    await expect(page.getByTestId('map-current-cell').first()).not.toHaveText(startCell)
  })

  test('dialogue contains authored choices and accepts a free-form action', async ({ page }) => {
    await openGame(page)
    await openDialogue(page)
    await page.locator('#free-command').fill('become moon emperor immediately')
    await page.locator('.command-form button').click()
    await expect(page.getByTestId('narration-panel')).toBeVisible()
    // The spoken line is recorded in the journal dock's chronicle, not in the
    // story panel (the panel no longer carries a .chronicle list).
    await page.getByRole('button', { name: /Continue/ }).click()
    await page.getByRole('button', { name: 'Open Journey journal' }).click()
    await page.getByRole('tab', { name: /Chronicle|Biên niên/i }).first().click()
    await expect(page.locator('.chronicle li').last()).toContainText('thought slips free')
  })

  test('combat presents deliberate technique and defence controls', async ({ page }) => {
    await openGame(page, atLocation('misty_forest', 4, 1, (game) => ({
      ...game,
      player: { ...game.player, stage: 1, qi: 30, pendingAttributePoints: 0 },
    })))
    await page.locator('button[data-chip="fight"]').click()
    const combat = page.getByTestId('proto-combat')
    await expect(combat).toBeVisible()
    await expect(page.getByTestId('combat-attack')).toBeVisible()
    await page.getByTestId('combat-attack').click()
    // Scope to the proto panel: the legacy encounter card keeps its own
    // (hidden) Defend control in the DOM at this width. HP is aria-labelled;
    // the visible text is Vietnamese.
    const enemyHealth = combat.getByLabel(/Enemy health/)
    await expect(enemyHealth).toBeVisible()
    const defend = combat.getByRole('button', { name: 'Defend' })
    await expect(defend).toBeVisible()
    await defend.click()
    await expect(enemyHealth).toBeVisible()
  })

  test('route evidence is carried into the next dialogue', async ({ page }) => {
    await openGame(page, atLocation('village', 2, 2, (game) => ({
      ...game,
      flags: { ...game.flags, story_scene: 'village_vow', story_route: 'mercy', story_route_arrived: true },
    })))
    const routeEncounter = page.getByTestId('route-encounter-screen')
    await expect(routeEncounter).toBeVisible()
    await expect(routeEncounter.getByRole('button')).toHaveCount(2)
    await routeEncounter.getByRole('button').first().click()

    await openDialogue(page)
    await expect(page.getByTestId('route-proof')).toContainText('Public')
    const choices = page.locator('.story-choices .choice-button')
    await expect(choices).toHaveCount(3)
    await expect(choices.nth(2)).toBeEnabled()
    await choices.nth(2).click()
    await expect(page.getByTestId('narration-panel')).toBeVisible()
    await expect(page.getByTestId('route-proof')).toBeVisible()
  })

  const endings: Array<{ name: string; ending: string; flags: GameState['flags']; choice: number }> = [
    { name: 'rootless star', ending: 'Ending: The Rootless Star', flags: { story_scene: 'scene_ascension', story_truth: 3 }, choice: 0 },
    { name: 'kingdom of the rift', ending: 'Ending: Kingdom of the Rift', flags: { story_scene: 'scene_ascension', story_power: 3, story_ha_bound: true }, choice: 0 },
    { name: 'remembering ghosts', ending: 'Ending: City of Remembering Ghosts', flags: { story_scene: 'scene_ascension', story_wealth: 2 }, choice: 0 },
    { name: 'spring for an enemy', ending: 'Ending: Spring for an Enemy', flags: { story_scene: 'scene_ascension', story_mercy: 3, story_khoa_trusted: true }, choice: 1 },
    { name: 'quiet harmony', ending: 'Ending: Harmony Under a Thatched Roof', flags: { story_scene: 'scene_ascension' }, choice: 2 },
  ]

  for (const endingCase of endings) {
    test(`story ending: ${endingCase.name}`, async ({ page }) => {
      await openGame(page, freshGame((game) => ({ ...game, flags: { ...game.flags, ...endingCase.flags } })))
      await openDialogue(page)
      await page.locator('.story-choices .choice-button').nth(endingCase.choice).click()
      // issue40 Step 2 hoisted the banner to a direct .game-shell child, so
      // visibility at desktop is now part of the contract, not just its text.
      const banner = page.locator('.ending-banner')
      await expect(banner).toBeVisible()
      await expect(banner).toContainText(endingCase.ending)
      await expect(page.getByTestId('narration-panel')).toHaveCount(0)
    })
  }
})
