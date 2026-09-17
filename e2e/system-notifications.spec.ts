import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'
type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

function freshGame(update?: (game: GameState) => GameState): GameState {
  let game = applyAction(newGame('sys-notify-seed'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  game = applyAction(game, { kind: 'story_choice', choiceId: 'pick_sys_battle' }).state
  return update === undefined ? game : update(game)
}

async function openGame(page: Page, game = freshGame()): Promise<void> {
  await page.setViewportSize({ width: 800, height: 900 })
  const session: GameSession = { game, locale: 'en', chronicle: ['System notification save.'] }
  const slot = { slotId: 1, savedAt: Date.now(), session }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    if (window.localStorage.getItem(slotsKey) !== null) return
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  const narration = page.getByTestId('narration-panel')
  if (await narration.count() > 0) await narration.locator('.story-close').click()
}

test('accepting and turning in a system quest announces load and exact reward', async ({ page }) => {
  await openGame(page, freshGame((game) => ({
    ...game,
    inventory: { ...game.inventory, beast_fang: 3 },
  })))
  await expect(page.getByTestId('system-panel')).toBeVisible()
  await expect(page.getByTestId('system-feed')).toHaveCount(0)

  // Seizure fix (round-6 sweep, owner lane idle): the panel's buttons are
  // UNCLICKABLE at every width — display:none at ≥921 (screens.css:1997), and
  // at 800 the bounding-box-visible panel sits UNDER ProtoShell's absolutely
  // positioned map layers: elementFromPoint at the legacy Accept button's
  // centre resolves to DIV.proto-map itself ("subtree intercepts pointer
  // events"). Round-7 probe: pointer-events:none on .painting alone does NOT
  // fix it — the container still hit-tests (the full fix needs it on
  // .proto-map/.proto-grid-main too; filed as the §4b follow-up). So actions go
  // through the journal Quests tab at desktop width — the route
  // e2e/system-quest-chain.spec.ts proves — and the feed is read back at 800,
  // the only width where it renders. (P3 renamed "Main quest loaded" →
  // "Quest loaded"; the feed also carries the deadline sentence when
  // deadlineDays > 0, which system quests no longer set.)
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.getByRole('button', { name: 'Open Journey journal' }).click()
  await page.getByRole('tab', { name: /Nhiệm vụ|Quests/ }).click()
  const head = page.locator('#dock-panel-quests ul.quest-list li').filter({ hasText: /【Battle I】/ })
  await expect(head).toHaveCount(1)
  await head.locator('button', { hasText: /Accept quest/ }).click()
  await expect(page.locator('#dock-panel-quests li.quest-active').filter({ hasText: /【Battle I】/ })).toHaveCount(1)
  await page.keyboard.press('Escape')

  await page.setViewportSize({ width: 800, height: 900 })
  const feed = page.getByTestId('system-feed')
  await expect(feed).toBeVisible()
  await expect(feed).toContainText(/Quest loaded/)
  await expect(feed).toContainText(/Battle I/)
  await expect(feed).toContainText(/Deliver beast fangs to the System/)
  // No li.count()<=3 line here: GameScreen.tsx:274 renders queueDrain(…,3)
  // one-to-one, so the cap is tautological in e2e — it is unit-tested for real
  // at test/system.test.ts:108-113 (r7-review MEDIUM).

  await page.setViewportSize({ width: 1280, height: 900 })
  await page.getByRole('button', { name: 'Open Journey journal' }).click()
  await page.getByRole('tab', { name: /Nhiệm vụ|Quests/ }).click()
  await page.locator('#dock-panel-quests li.quest-active')
    .filter({ hasText: /【Battle I】/ })
    .locator('button', { hasText: /Turn in/ })
    .click()
  await expect(page.locator('#dock-panel-quests li.quest-active').filter({ hasText: /【Battle I】/ })).toHaveCount(0)
  await page.keyboard.press('Escape')

  await page.setViewportSize({ width: 800, height: 900 })
  await expect(feed).toContainText(/Ding!/)
  await expect(feed).toContainText(/45 gold/)
  await expect(feed).toContainText(/Beast Fang/)
})

test('pressing on the System origin returns the authored data dodge', async ({ page }) => {
  await openGame(page, freshGame((game) => ({
    ...game,
    flags: { ...game.flags, story_scene: 'scene_system_doubt' },
  })))

  // Story scenes reopen through the journal's People tab. .first() is required
  // no matter the scoping: the journal renders ONE Talk button per NPC card
  // (panels.tsx:586; village carries 6+ NPCs), so a strict locator cannot
  // resolve. The map pin "Talk to Elder Meihua" and the legacy chat submit
  // "Talk" are real secondary collisions — neither opens a scene.
  await page.getByRole('button', { name: 'Open Journey journal' }).click()
  await page.getByRole('tab', { name: /People here/ }).click()
  await page.getByTestId('journal-screen').getByRole('button', { name: 'Talk', exact: true }).first().click()

  await page.getByRole('button', { name: /Then who wrote you/i }).click()
  await expect(page.getByTestId('system-feed')).toContainText(/Insufficient data to answer/)
})
