// System-quest chain ramp — acceptance criteria 3/4/5 (+ the P3 copy tripwire)
// played through the REAL browser UI.
// Design source of truth: docs/agent-work/active/system-quest-chain-ramp.md.
//
// Two quest surfaces are asserted, because they are driven by two different
// engine functions and only together cover the design:
//   * `[data-testid="system-panel"] .system-quest-list` — src/ui/GameScreen.tsx:818-836,
//     fed by `systemQuestsFor()` (src/engine/system-runtime.ts) — THE U2 filter.
//   * the Journey journal's Quests tab — src/ui/gameScreen/panels.tsx:507,
//     fed by `isQuestUnlocked()` (src/engine/quests.ts:29) — the same gate
//     `canAcceptQuest` uses, so it proves "acceptable", not just "visible".
//
// Shell trap: at >=921px src/ui/screens.css:1983 hides `.proto-shell-wrap ~
// .world-content` with `display: none !important`, and `.system-panel` lives
// inside `.world-content`. So system-panel assertions run at an 800px viewport
// (e2e/system-pick.spec.ts relies on the same thing at its default 1280 with a
// narrower legacy branch). The journal is a dialog mounted as a SIBLING of
// `.world-content` (GameScreen.tsx:1012) so it is reachable at desktop width.
// Rows are matched with a descendant selector there, not `ul > li`: the
// `<li>`s are not direct children of `#dock-panel-quests`.
//
// Deliberately NOT asserted: the ProtoShell LeftRail "Hệ thống" quest card
// (src/ui/LeftRailTabContent.tsx:418) — its available list is
// `availableQuests.slice(0, 3)` over the whole QUESTS array, so with 100+
// flagless side quests a chain id can never surface. Zero signal there.
//
// Seeding pattern (localStorage slot holding a real applyAction/newGame state):
// e2e/issue37-38-telegraph-and-context.spec.ts, e2e/system-notifications.spec.ts.
import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'
type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

const BATTLE_01 = /【Chiến Đấu I】|【Battle I】/
const BATTLE_02 = /【Chiến Đấu II】|【Battle II】/
const BATTLE_03 = /【Chiến Đấu III】|【Battle III】/
const NO_ZERO_DEADLINE = /Hạn:\s*0\s*ngày|Time limit:\s*0\s*days|\{days\}/i

/** reducer.ts:1851 writes `quest_${questId}${FLAG_QUEST_DONE}` and
 *  FLAG_QUEST_DONE ('_done', src/content/flag-keys.ts) already carries its own
 *  underscore — so the key really is `quest_q_sys_battle_01_done`. A second
 *  underscore silently deadlocks every chain in-game. */
const BATTLE_01_DONE = 'quest_q_sys_battle_01_done'

/** Play the two boot story choices (transmigration mercy -> pick the Battle
 *  System) the way the narration panel does, then hand back the state. */
function battleRun(update?: (game: GameState) => GameState): GameState {
  let game = applyAction(newGame('sys-quest-chain'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
  game = applyAction(game, { kind: 'story_choice', choiceId: 'pick_sys_battle' }).state
  return update === undefined ? game : update(game)
}

async function openRun(page: Page, game: GameState, width = 800, height = 900): Promise<void> {
  await page.setViewportSize({ width, height })
  const session: GameSession = { game, locale: 'en', chronicle: ['Chain ramp.'] }
  const slot = { slotId: 1, savedAt: Date.now(), session }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    if (window.localStorage.getItem(slotsKey) !== null) return
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  // The boot scene is already played out in the seeded state; dismiss it if the
  // panel still opens, exactly like e2e/system-notifications.spec.ts does.
  const narration = page.getByTestId('narration-panel')
  if (await narration.count() > 0) await narration.locator('.story-close').click()
}

/** The legacy System panel's quest rows (systemQuestsFor-driven). */
function systemPanelQuests(page: Page) {
  return page.getByTestId('system-panel').locator('.system-quest-list li')
}

/** Open the Journey journal on its Quests tab (isQuestUnlocked-driven). */
async function openQuestJournal(page: Page) {
  await page.getByRole('button', { name: /Mở Hành trang|Open Journey journal/i }).click()
  await expect(page.getByTestId('journal-screen')).toBeVisible()
  await page.getByRole('tab', { name: /Nhiệm vụ|Quests/ }).click()
  return page.locator('#dock-panel-quests ul.quest-list li')
}

test.describe('system-quest chain ramp (UI)', () => {
  test('fresh sys_battle pick lists only the chain head — _02 is neither shown nor offered', async ({ page }) => {
    // AC 3: a brand-new Battle host sees 【Battle I】 and nothing behind it.
    await openRun(page, battleRun())
    await expect(page.getByTestId('system-panel')).toBeVisible()

    const panel = systemPanelQuests(page)
    await expect(panel.filter({ hasText: BATTLE_01 })).toHaveCount(1)
    await expect(panel.filter({ hasText: BATTLE_02 })).toHaveCount(0)
    await expect(panel.filter({ hasText: BATTLE_03 })).toHaveCount(0)
    // The battle pool holds 6 quests; the panel must not dump it on a fresh pick.
    expect(
      await panel.filter({ hasText: /【Chiến Đấu|【Battle/ }).count(),
      'the System panel must not list the whole 6-quest pool on a fresh pick',
    ).toBe(1)

    // Same ramp on the journal surface, which is where players actually accept.
    await page.setViewportSize({ width: 1280, height: 900 })
    const rows = await openQuestJournal(page)
    await expect(rows.filter({ hasText: BATTLE_01 })).toHaveCount(1)
    await expect(rows.filter({ hasText: BATTLE_02 })).toHaveCount(0)
    await expect(rows.filter({ hasText: BATTLE_03 })).toHaveCount(0)
  })

  test('completing _01 surfaces _02 and it accepts through the real gate; _03 stays hidden', async ({ page }) => {
    // AC 4: seed the exact state doCompleteQuest leaves behind (completed quest
    // + its `_done` flag) instead of grinding a combat loop.
    const cleared = battleRun((game) => ({
      ...game,
      flags: { ...game.flags, [BATTLE_01_DONE]: true },
      quests: { ...game.quests, q_sys_battle_01: { status: 'completed', step: 0 } },
    }))
    await openRun(page, cleared)

    const panel = systemPanelQuests(page)
    await expect(panel.filter({ hasText: BATTLE_01 })).toHaveCount(1)
    await expect(panel.filter({ hasText: BATTLE_02 })).toHaveCount(1)
    await expect(panel.filter({ hasText: BATTLE_03 })).toHaveCount(0)
    // _01 stays in the list after turn-in — it must not vanish under the player.
    await expect(panel.filter({ hasText: BATTLE_01 }).first()).toContainText(/Đã khóa|Locked/)

    // Accept _02 for real. The journal button dispatches system_accept_quest,
    // which the reducer refuses unless canAcceptQuest -> isQuestUnlocked passes,
    // so acceptance is proven by the row flipping to active, not by a toast.
    await page.setViewportSize({ width: 1280, height: 900 })
    const rows = await openQuestJournal(page)
    const second = rows.filter({ hasText: BATTLE_02 })
    await expect(second).toHaveCount(1)
    await expect(rows.filter({ hasText: BATTLE_03 })).toHaveCount(0)

    const accept = second.locator('button', { hasText: /Nhận nhiệm vụ|Accept quest/ })
    await expect(accept).toBeEnabled()
    await accept.click()

    await expect(page.locator('#dock-panel-quests li.quest-active').filter({ hasText: BATTLE_02 })).toHaveCount(1)
    // The next rung stays locked while _02 is merely active.
    await expect(rows.filter({ hasText: BATTLE_03 })).toHaveCount(0)
  })

  test('an ACTIVE mid-chain quest stays listed even with its predecessor flag missing', async ({ page }) => {
    // AC 5: never lose an in-flight quest to the ramp.
    const midChain = battleRun((game) => ({
      ...game,
      quests: { ...game.quests, q_sys_battle_02: { status: 'active', step: 0 } },
    }))
    await openRun(page, midChain)

    const panel = systemPanelQuests(page)
    await expect(panel.filter({ hasText: BATTLE_02 })).toHaveCount(1)
    await expect(panel.filter({ hasText: BATTLE_02 }).locator('button', { hasText: /Nộp nhiệm vụ|Turn in/ })).toBeVisible()
    // Still no _03 behind it, and no bogus done-flag was invented for _01.
    await expect(panel.filter({ hasText: BATTLE_03 })).toHaveCount(0)
    expect(midChain.flags[BATTLE_01_DONE]).toBeUndefined()
  })

  test('accepting a system quest never renders a "0 days" deadline', async ({ page }) => {
    // P3 regression tripwire: deadlineDays was stripped from every system quest,
    // so the accept notification must not fold a zero-day deadline into its copy
    // (and the template must not leak an unsubstituted {days} token).
    await openRun(page, battleRun(), 1280, 900)

    // Accept through the journal — the surface a desktop player really uses.
    const rows = await openQuestJournal(page)
    const head = rows.filter({ hasText: BATTLE_01 })
    await expect(head).toHaveCount(1)
    await head.locator('button', { hasText: /Nhận nhiệm vụ|Accept quest/ }).click()
    await expect(page.locator('#dock-panel-quests li.quest-active').filter({ hasText: BATTLE_01 })).toHaveCount(1)
    await page.keyboard.press('Escape')

    // The 【Hệ Thống】 feed only renders inside the legacy panel, below 921px.
    await page.setViewportSize({ width: 800, height: 900 })
    const feed = page.getByTestId('system-feed')
    await expect(feed).toBeVisible()
    await expect(feed).toContainText(/Nhiệm vụ tải xong|Quest loaded/)
    await expect(feed).toContainText(BATTLE_01)
    await expect(feed).not.toContainText(NO_ZERO_DEADLINE)

    // Whole-page sweep across both quest surfaces.
    await expect(page.getByTestId('world-content')).not.toContainText(NO_ZERO_DEADLINE)
  })
})
