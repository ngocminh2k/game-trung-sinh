import { expect, test, type Page } from '@playwright/test'
import { newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'
type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

function freshGame(update?: (game: GameState) => GameState): GameState {
  const game = newGame('system-pick-e2e')
  return update === undefined ? game : update(game)
}

async function openGame(page: Page, game = freshGame(), locale: Locale = 'en'): Promise<void> {
  await page.setViewportSize({ width: 800, height: 900 })
  const session: GameSession = { game, locale, chronicle: ['System E2E run.'] }
  const slot = { slotId: 1, savedAt: Date.now(), session }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
}

async function openStory(page: Page): Promise<void> {
  // #journal-launcher is only clickable at desktop width: below 921px the
  // legacy header mounts it under ProtoShell's out-of-flow .proto-grid-main
  // overlay (src/ui/screens.css:2022 + the #31 note at :1995), which swallows
  // the click. At >=921px the control is handed to .proto-topbar instead.
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.getByRole('button', { name: /Mở Hành trang|Open Journey journal/i }).click()
  await expect(page.getByTestId('journal-screen')).toBeVisible()
  const journal = page.getByTestId('journal-screen')
  await journal.getByRole('tab', { name: /Người ở đây|People here/ }).click()
  // Scoped: the legacy System chat also renders a submit button labelled 'Talk'
  // (src/ui/GameScreen.tsx:891), and it is merely display:none above 921px.
  await journal.getByRole('button', { name: /Nói chuyện|Talk/ }).first().click()
  await expect(page.getByTestId('narration-panel')).toBeVisible()
}

async function savedGame(page: Page): Promise<GameState> {
  return await page.evaluate((slotsKey) => JSON.parse(window.localStorage.getItem(slotsKey) ?? '{}')['1'].session.game, SLOTS_KEY)
}

test('selects Battle System, turns in its first quest, and leaves the story scene unchanged', async ({ page }) => {
  await openGame(page, freshGame((game) => ({
    ...game,
    inventory: { ...game.inventory, beast_fang: 1 },
  })))
  await expect(page.getByTestId('narration-panel')).toContainText('This Life Opens Its Eyes')

  await page.getByRole('button', { name: /Accept the host contract, but keep/i }).click()
  await expect(page.getByTestId('narration-panel')).toContainText('Ten Systems Apply for the Job')
  await page.getByRole('button', { name: /Battle System — it rewards/i }).click()
  await expect(page.getByTestId('narration-panel')).toHaveCount(0)
  await expect(page.getByTestId('system-panel')).toBeVisible()
  await expect(page.getByTestId('system-panel')).toContainText('【Battle System】')

  const sceneBeforeQuest = (await savedGame(page)).flags.story_scene

  // Accept/turn in through the Journey journal. The legacy panel's buttons are
  // still unclickable at 800px: elementFromPoint there resolves to the
  // `.proto-map` container itself (probe, #40 §4c-note — .painting's missing
  // `pointer-events: none` at screens.css:1368 is real but a no-op half-fix),
  // and `.proto-shell-wrap ~ .world-content` is `display: none` at >=921px
  // (screens.css:1997) — so the panel is not a clickable surface at any width.
  // The journal dispatches the same system_accept_quest/system_turn_in_quest
  // actions (src/ui/gameScreen/panels.tsx:523,532) and the reducer still has to
  // pass canAcceptQuest/canCompleteQuest, so this is the real gate.
  await page.setViewportSize({ width: 1280, height: 900 })
  await page.getByRole('button', { name: /Mở Hành trang|Open Journey journal/i }).click()
  await expect(page.getByTestId('journal-screen')).toBeVisible()
  await page.getByRole('tab', { name: /Nhiệm vụ|Quests/ }).click()
  const rows = page.locator('#dock-panel-quests ul.quest-list li')
  const head = rows.filter({ hasText: /【Chiến Đấu I】|【Battle I】/ })
  await expect(head).toHaveCount(1)
  await head.locator('button', { hasText: /Nhận nhiệm vụ|Accept quest/ }).click()
  const active = page.locator('#dock-panel-quests li.quest-active').filter({ hasText: /【Chiến Đấu I】|【Battle I】/ })
  await expect(active).toHaveCount(1)
  await expect(active.first()).toBeVisible()
  const beforeTurnIn = await savedGame(page)

  await head.locator('button', { hasText: /Nộp nhiệm vụ|Turn in/ }).click()
  await expect(head).toContainText(/Xong|Done/)

  // 'Locked' renders ONLY in the legacy panel (GameScreen.tsx:864), whose column
  // is display:none above 921px. Re-read it at 800px and assert visibility —
  // toContainText alone would pass on hidden DOM (issue #40 triage).
  await page.keyboard.press('Escape')
  await page.setViewportSize({ width: 800, height: 900 })
  const lockedRow = page.getByTestId('system-panel').locator('.system-quest-list li').filter({ hasText: /【Chiến Đấu I】|【Battle I】/ })
  await expect(lockedRow).toBeVisible()
  await expect(lockedRow).toContainText(/Đã khóa|Locked/)

  const afterTurnIn = await savedGame(page)
  expect(afterTurnIn.quests.q_sys_battle_01?.status).toBe('completed')
  expect(afterTurnIn.player.gold).toBe(beforeTurnIn.player.gold + 45)
  expect(afterTurnIn.player.spiritStones).toBe((beforeTurnIn.player.spiritStones ?? 0) + 1)
  expect(afterTurnIn.flags.story_scene).toBe(sceneBeforeQuest)

  await openStory(page)
  await expect(page.getByTestId('narration-panel')).not.toContainText('Ten Systems Apply for the Job')
  await expect(page.getByRole('button', { name: /Battle System — it rewards/i })).toHaveCount(0)
})

test('rootless boot path never renders the System panel', async ({ page }) => {
  await openGame(page)
  await expect(page.getByTestId('narration-panel')).toContainText('This Life Opens Its Eyes')

  await page.getByRole('button', { name: /Refuse activation/i }).click()
  await expect(page.getByTestId('narration-panel')).toHaveCount(0)
  await expect(page.getByTestId('system-panel')).toHaveCount(0)
  expect((await savedGame(page)).flags.system_refused).toBe(true)
})
