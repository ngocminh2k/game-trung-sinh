import { expect, test, type Page } from '@playwright/test'
import { applyAction, newGame, type GameState, type Locale } from '../src/engine'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'

type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

function freshGame(update?: (game: GameState) => GameState): GameState {
  let game = applyAction(newGame('npc-on-map-e2e-seed'), { kind: 'story_choice', choiceId: 'accept_system_mercy' }).state
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
  const session: GameSession = { game, locale, chronicle: ['NPC on map E2E run.'] }
  const slot = { slotId: 1, savedAt: 1, session }
  await page.addInitScript(({ slotsKey, activeSlotKey, value }) => {
    if (window.localStorage.getItem(slotsKey) !== null) return
    window.localStorage.setItem(slotsKey, value)
    window.localStorage.setItem(activeSlotKey, '1')
  }, { slotsKey: SLOTS_KEY, activeSlotKey: ACTIVE_SLOT_KEY, value: JSON.stringify({ 1: slot }) })
  await page.goto('/')
  await page.getByTestId('menu-load-game').click()
  await page.getByTestId('save-slot-1').click()
  await beginPlaying(page)
}

test.describe('NPC presence and representation on regional map', () => {
  test('renders NPC nodes as distinct map pins and lists NPC node details in accessible summary', async ({ page }) => {
    await openGame(page, atLocation('village', 3, 3), 'vi')

    // 1. Check NPC node pin exists on map grid with node-npc class and node testid
    const elderPorchPin = page.getByTestId('event-node-village-elder-porch')
    await expect(elderPorchPin).toBeVisible()
    await expect(elderPorchPin).toHaveClass(/node-npc/)

    const elderDoorPin = page.getByTestId('event-node-village-elder-home')
    await expect(elderDoorPin).toBeVisible()
    await expect(elderDoorPin).toHaveClass(/node-npc/)

    // 2. Check title attribute contains node kind and translated name
    await expect(elderPorchPin).toHaveAttribute('title', 'Người: Hiên nhà Cụ Mai Hoa')
    await expect(elderDoorPin).toHaveAttribute('title', 'Người: Cửa nhà Cụ Mai Hoa')

    // 3. Accessible map summary list contains NPC node names, coordinates, and types
    const summaryList = page.getByRole('list', { name: 'Các điểm trên bản đồ' })
    await expect(summaryList.getByText(/Hiên nhà Cụ Mai Hoa — npc, ô 3 · 3/)).toBeAttached()
    await expect(summaryList.getByText(/Cửa nhà Cụ Mai Hoa — npc, ô 3 · 4/)).toBeAttached()

    // 4. Map legend describes NPC pins
    const legend = page.getByLabel('Chú giải bản đồ')
    await expect(legend).toContainText('Người — nói chuyện, nhận việc')
  })

  test('updates map context trail notes when stepping onto an NPC node', async ({ page }) => {
    await openGame(page, atLocation('village', 3, 3), 'vi') // Player at (3,3) "Your old hut"

    await expect(page.getByTestId('map-current-cell')).toContainText('Nhà cũ của ngươi')
    await page.keyboard.press('ArrowLeft') // Move to (2,3) Elder Meihua's Door

    await expect(page.getByTestId('map-current-cell')).toContainText('Cửa nhà Cụ Mai Hoa')
    const mapContext = page.locator('.map-context')
    await expect(mapContext).toContainText('Cửa nhà Cụ Mai Hoa')
    await expect(mapContext).toContainText('Một chốn có chuyện để nghe hoặc tự mình đổi thay.')
  })

  test('allows talking to local NPCs via Journey journal people tab', async ({ page }) => {
    await openGame(page, atLocation('village', 3, 3), 'vi')

    // Open Journal -> People tab
    await page.getByRole('button', { name: 'Mở Hành trang và giang hồ' }).click()
    await page.getByRole('tab', { name: /Người ở đây/ }).click()

    // Elder Meihua NPC card is displayed
    const npcCard = page.locator('.npc-portrait-card[data-npc-id="n_elder_meihua"]')
    await expect(npcCard).toBeVisible()
    await expect(npcCard).toContainText('Cụ Mai Hoa')

    // Click "Talk" button -> opens narration dialogue panel
    await npcCard.getByRole('button', { name: 'Nói chuyện' }).click()
    const narrationPanel = page.getByTestId('narration-panel')
    await expect(narrationPanel).toBeVisible()
    await expect(narrationPanel).toContainText('Cụ Mai Hoa')
  })
})
