import { expect, test, type Page } from '@playwright/test'
import { newGame, type GameState, type Locale } from '../src/engine'

const SESSION_KEY = 'phe-can-ky:save:v1'

type GameSession = {
  game: GameState
  locale: Locale
  chronicle: string[]
}

function freshGame(update?: (game: GameState) => GameState): GameState {
  const game = newGame('browser-acceptance-seed')
  return update === undefined ? game : update(game)
}

async function openGame(page: Page, game = freshGame(), locale: Locale = 'vi'): Promise<void> {
  const session: GameSession = {
    game,
    locale,
    chronicle: [locale === 'vi' ? 'Acceptance save đã sẵn sàng.' : 'Acceptance save is ready.'],
  }
  await page.addInitScript(({ key, value }) => {
    if (window.localStorage.getItem(key) === null) window.localStorage.setItem(key, value)
  }, {
    key: SESSION_KEY,
    value: JSON.stringify(session),
  })
  await page.goto('/')
}

function atLocation(
  locationId: string,
  posX: number,
  posY: number,
  update?: (game: GameState) => GameState,
): GameState {
  return freshGame((game) => {
    const located = {
      ...game,
      player: { ...game.player, locationId, posX, posY },
    }
    return update === undefined ? located : update(located)
  })
}

function itemRow(page: Page, name: string) {
  return page.locator('.item-list > li').filter({ hasText: name })
}

function rpgEntry(page: Page, name: string) {
  return page.locator('.rpg-entry').filter({ hasText: name })
}

test('a player can see the map, switch language, and walk west with the keyboard', async ({ page }) => {
  await openGame(page)

  await expect(page.getByRole('heading', { name: /Phế Căn Ký/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Bản đồ khu vực' })).toBeVisible()
  await expect(page.getByTestId('location-label')).toHaveText('Làng Thanh Mộc')

  await page.getByRole('button', { name: 'EN', exact: true }).click()
  await expect(page.getByRole('heading', { name: 'Local area map' })).toBeVisible()
  await expect(page.getByLabel('Chronicle')).toBeVisible()
  await page.getByRole('button', { name: 'VI', exact: true }).click()

  await page.keyboard.press('ArrowLeft')
  await expect(page.getByTestId('location-label')).toHaveText('Chợ Vân Tập')
  await page.reload()
  await expect(page.getByTestId('location-label')).toHaveText('Chợ Vân Tập')
})

test('regional maps show authored event nodes and use a local exit to change areas', async ({ page }) => {
  await openGame(page)

  await expect(page.getByTestId('event-node-village-market-exit')).toBeVisible()
  await expect(page.getByTestId('event-node-village-elder')).toBeVisible()
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByTestId('location-label')).toHaveText('Chợ Vân Tập')
  await expect(page.getByTestId('event-node-market-square')).toBeVisible()
  await expect(page.getByTestId('event-node-market-village-exit')).toBeVisible()
})

test('the three story choices and free-text convergence keep a new run on a valid path', async ({ page }) => {
  await openGame(page)

  await expect(page.getByText('Lựa chọn của ngươi', { exact: true })).toBeVisible()
  await expect(page.locator('.story-choices .choice-button')).toHaveCount(3)
  await page.getByRole('button', { name: /Nói chuyện với Cụ Mai Hoa/ }).click()
  await expect(page.getByLabel('Biên niên ký')).toContainText('Mai Hoa')

  const command = page.getByLabel('Viết hành động khác')
  for (let attempt = 0; attempt < 3; attempt += 1) {
    await command.fill('ta biến thành hoàng đế của mặt trăng ngay lập tức')
    await page.getByRole('button', { name: 'Thử vận', exact: true }).click()
  }
  await expect(page.getByLabel('Biên niên ký')).toContainText('Cảnh vật quanh ngươi dần rõ nét trở lại')
  await expect(page.getByTestId('location-label')).toHaveText('Chợ Vân Tập')
})

test('items, sect storage, market shop, achievement, and reload persistence work through the UI', async ({ page }) => {
  await openGame(page, atLocation('sect', 4, 3, (game) => ({
    ...game,
    player: { ...game.player, hp: 50 },
    inventory: { ...game.inventory, spirit_herb: 2 },
  })))

  await itemRow(page, 'Viên hồi nguyên').getByRole('button', { name: 'Dùng', exact: true }).click()
  await expect(page.getByLabel('Biên niên ký')).toContainText('Ngươi dùng Viên hồi nguyên')
  await expect(page.getByText('75/100', { exact: true })).toBeVisible()

  await itemRow(page, 'Linh thảo').getByRole('button', { name: 'Gửi', exact: true }).click()
  const storage = page.locator('.storage-list')
  await expect(storage).toContainText('Linh thảo ×1')
  await storage.getByRole('button', { name: /Linh thảo.*lấy/ }).click()
  await expect(storage).toHaveCount(0)

  await page.keyboard.press('ArrowLeft')
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByTestId('location-label')).toHaveText('Chợ Vân Tập')
  const qiPillShopRow = page.getByText('Viên tụ khí · 30◎', { exact: true }).locator('..')
  await qiPillShopRow.getByRole('button', { name: 'Mua', exact: true }).click()
  await expect(itemRow(page, 'Viên tụ khí')).toContainText('×1')
  await expect(page.getByText('Vé đầu tiên', { exact: true })).toHaveClass(/unlocked/)

  await page.reload()
  await expect(itemRow(page, 'Viên tụ khí')).toContainText('×1')
  await expect(page.getByTestId('location-label')).toHaveText('Chợ Vân Tập')
})

test('combat trophies can be exchanged for expedition protection instead of being sold', async ({ page }) => {
  await openGame(page, atLocation('market', 3, 3, (game) => ({
    ...game,
    inventory: { ...game.inventory, beast_fang: 1, spirit_herb: 2 },
  })))

  await expect(page.getByRole('heading', { name: 'Quầy đổi linh tài' })).toBeVisible()
  const exchange = page.getByTestId('refinement-warding_exchange')
  await expect(exchange).toContainText('Bùa hồi lộ')
  await exchange.getByRole('button', { name: 'Đổi', exact: true }).click()
  await expect(page.getByLabel('Biên niên ký')).toContainText('Bùa trừ tà')
  await expect(itemRow(page, 'Bùa trừ tà')).toContainText('×1')
})

test('talent, technique, equipment, and combat controls operate in browser', async ({ page }) => {
  await openGame(page, atLocation('misty_forest', 4, 1, (game) => ({
    ...game,
    player: { ...game.player, stage: 1, qi: 30 },
    inventory: { ...game.inventory, old_manual: 1, jade_charm: 1 },
    equipment: { ...game.equipment, accessory: null },
  })))

  await rpgEntry(page, 'Gân Cốt Sắt').getByRole('button', { name: 'Chọn', exact: true }).click()
  await expect(rpgEntry(page, 'Gân Cốt Sắt')).toContainText('Đã chọn')
  await rpgEntry(page, 'Chu Thiên Cong Queo').getByRole('button', { name: 'Lĩnh ngộ', exact: true }).click()
  await expect(rpgEntry(page, 'Chu Thiên Cong Queo')).toContainText('Đã học')
  await rpgEntry(page, 'Ngọc Bội Hộ Tâm').getByRole('button', { name: 'Trang bị', exact: true }).click()
  await expect(rpgEntry(page, 'Ngọc Bội Hộ Tâm')).toContainText('Đang dùng')
  await expect(page.getByText('35/60', { exact: true })).toBeVisible()

  await page.getByRole('button', { name: 'Bước vào giao chiến', exact: true }).click()
  const encounter = page.getByLabel('Giao chiến đang diễn ra')
  await expect(encounter).toBeVisible()
  await page.getByRole('button', { name: 'Thủ thế', exact: true }).click()
  await page.getByLabel('Viết hành động khác').fill('attack with the wooden staff')
  await page.getByRole('button', { name: 'Thử vận', exact: true }).click()
  await expect(encounter).not.toContainText('32/32')

  for (let turn = 0; turn < 4; turn += 1) {
    const attack = page.getByRole('button', { name: /Xuất Mộc Trượng Thức/ })
    if (await attack.count() === 0) break
    await attack.click()
  }
  await expect(page.getByLabel('Giao chiến đang diễn ra')).toHaveCount(0)
  await expect(page.getByLabel('Biên niên ký')).toContainText('Hạ Trư Nha Sương')
})

const authoredEndings: Array<{
  name: string
  ending: string
  game: GameState
  act: (page: Page) => Promise<void>
}> = [
  {
    name: 'a road left unfinished through danger',
    ending: 'Kết cục: Đường về dang dở',
    game: atLocation('cursed_rift', 3, 3, (game) => ({
      ...game,
      player: { ...game.player, hp: 1 },
    })),
    // West is the authored Rift-heart danger node on the local Cursed Rift map.
    act: async (page) => { await page.keyboard.press('ArrowLeft') },
  },
  {
    name: 'ascension through a final cultivation action',
    ending: 'Kết cục: Phi thăng dưới mưa sao',
    game: freshGame((game) => ({
      ...game,
      player: { ...game.player, stage: 4, progress: 119, hp: 100, qi: 60 },
    })),
    act: async (page) => { await page.getByRole('button', { name: 'Tu luyện', exact: true }).click() },
  },
  {
    name: 'a grand lottery windfall',
    ending: 'Kết cục: Vận may trời cho',
    game: atLocation('market', 2, 3, (game) => ({ ...game, rng: 7 })),
    act: async (page) => { await page.getByRole('button', { name: 'Quay', exact: true }).click() },
  },
  {
    name: 'merchant tycoon through a sale typed by the player',
    ending: 'Kết cục: Đại thương nhân mực ngọc',
    game: atLocation('market', 2, 3, (game) => ({
      ...game,
      player: { ...game.player, gold: 599 },
      inventory: { ...game.inventory, spirit_herb: 1 },
    })),
    act: async (page) => {
      await page.getByLabel('Viết hành động khác').fill('sell spirit herb')
      await page.getByRole('button', { name: 'Thử vận', exact: true }).click()
    },
  },
  {
    name: 'quiet harmony through a final rest',
    ending: 'Kết cục: An cư dưới mái tranh',
    game: freshGame((game) => ({
      ...game,
      day: 29,
      player: { ...game.player, gold: 200 },
    })),
    act: async (page) => { await page.getByRole('button', { name: 'Nghỉ', exact: true }).click() },
  },
]

for (const endingCase of authoredEndings) {
  test(`Scenario I ending: valid near-threshold persisted save + final UI action — ${endingCase.name}`, async ({ page }) => {
    await openGame(page, endingCase.game)
    await endingCase.act(page)
    const endingBanner = page.locator('.ending-banner')
    await expect(endingBanner).toBeVisible()
    await expect(endingBanner).toContainText(endingCase.ending)
    await expect(page.getByLabel('Viết hành động khác')).toBeDisabled()
  })
}
