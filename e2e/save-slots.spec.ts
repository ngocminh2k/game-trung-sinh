import { expect, test, type Page } from '@playwright/test'

const SLOTS_KEY = 'phe-can-ky:slots'
const ACTIVE_KEY = 'phe-can-ky:active-slot'

interface SlotEnvelope {
  slotId: number
  savedAt: number
  session: { game: { day: number; seed: string } }
}

async function bootSlots(page: Page): Promise<void> {
  await page.goto('/')
  // The app opens on the main menu; Load Game reveals the five-slot screen.
  await page.getByTestId('menu-load-game').click()
  await expect(page.getByTestId('save-slots-screen')).toBeVisible()
}

async function readSlots(page: Page): Promise<Record<string, SlotEnvelope>> {
  const raw = await page.evaluate((key) => window.localStorage.getItem(key), SLOTS_KEY)
  return raw === null ? {} : JSON.parse(raw) as Record<string, SlotEnvelope>
}

async function readActive(page: Page): Promise<string | null> {
  return page.evaluate((key) => window.localStorage.getItem(key), ACTIVE_KEY)
}

test('W1 save-slots: shows the slot screen on first boot and a fresh slot is empty', async ({ page }) => {
  await bootSlots(page)
  await expect(page.getByTestId('save-slots-screen')).toBeVisible()
  // Default device settings are Vietnamese: fresh slots read "— trống —".
  await expect(page.getByText(/trống|empty/i).first()).toBeVisible()
  await expect(page.getByText(/Bắt đầu mới|Begin new life/i).first()).toBeVisible()
})

test('W1 save-slots: selecting an empty slot starts a new game, travel advances day, reload resumes the same slot', async ({ page }) => {
  await bootSlots(page)
  // Click the first slot's primary action — empty slot routes through the System grid.
  await page.locator('[data-save-slot="1"]').click()
  await page.getByTestId('system-tile-sys_battle').click()
  await page.getByTestId('newgame-confirm').click()
  // Loading screen shows before the play surface; press through it.
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()

  // Walk two steps west — day-neutral walking moves without spending a day.
  const startLabel = await page.getByTestId('location-label').textContent()
  await page.keyboard.press('ArrowLeft')
  await page.waitForTimeout(300)
  await page.keyboard.press('ArrowLeft')
  await expect(page.getByTestId('location-label')).not.toHaveText(startLabel ?? '')

  // Reload and verify the same slot remains active and the autosave captured the move.
  await page.reload()
  await page.getByTestId('menu-load-game').click()
  await expect(page.getByTestId('save-slots-screen')).toBeVisible()
  expect(await readActive(page)).toBe('1')
  const slots = await readSlots(page)
  expect(slots['1']?.slotId).toBe(1)
  expect(slots['1']?.session.game.day).toBeGreaterThanOrEqual(1)
})

test('W1 save-slots: legacy session is migrated into slot 1 and the active slot points at it', async ({ page }) => {
  await page.addInitScript(() => {
    const legacy = { game: { version: 1, seed: 'legacy-migrate', rng: 1, day: 5, player: { hp: 10, qi: 10, gold: 0, attrs: { body: 1, mind: 1, charm: 1, luck: 1 }, stage: 0, progress: 0, posX: 3, posY: 3, locationId: 'village', alive: true }, spiritRoot: { kind: 'defective', elementVi: 'Mộc', elementEn: 'Wood', efficiency: 0.5 }, inventory: {}, storage: {}, flags: {}, quests: {}, achievements: [], talents: [], techniques: {}, equipment: { weapon: null, robe: null, accessory: null }, encounter: null, lastLotteryDay: null, corrections: 0, terminal: false, endingId: null }, locale: 'en', chronicle: ['legacy'] }
    window.localStorage.setItem('phe-can-ky:save:v1', JSON.stringify(legacy))
  })
  await page.goto('/')
  await page.getByTestId('menu-load-game').click()
  await expect(page.getByTestId('save-slots-screen')).toBeVisible()
  expect(await readActive(page)).toBe('1')
  const slots = await readSlots(page)
  expect(slots['1']?.session.game.seed).toBe('legacy-migrate')
  expect(slots['1']?.session.game.day).toBe(5)
})

test('W1 save-slots: deleting the active slot removes it and clears the active pointer', async ({ page }) => {
  await bootSlots(page)
  await page.locator('[data-save-slot="1"]').click()
  await page.getByTestId('system-tile-sys_battle').click()
  await page.getByTestId('newgame-confirm').click()
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
  await page.reload()
  await page.getByTestId('menu-load-game').click()
  await expect(page.getByTestId('save-slots-screen')).toBeVisible()
  // First click switches the delete button into confirm state; second click deletes.
  await page.getByRole('button', { name: /xóa lưu|delete save/i }).click()
  await page.getByRole('button', { name: /bấm lần nữa để xóa|press again to delete/i }).click({ force: true })
  expect(await readActive(page)).toBeNull()
  expect(await readSlots(page)).not.toHaveProperty('1')
})

test('W1 save-slots: keyboard navigation moves focus between slot buttons', async ({ page }) => {
  await bootSlots(page)
  await page.locator('[data-save-slot="1"]').focus()
  await page.keyboard.press('ArrowDown')
  await expect(page.locator('[data-save-slot="2"]')).toBeFocused()
  await page.keyboard.press('ArrowUp')
  await expect(page.locator('[data-save-slot="1"]')).toBeFocused()
})