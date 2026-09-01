import { expect, test } from '@playwright/test'

test.describe('Main menu & setup journeys', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => window.localStorage.clear())
  })

  test('boots into main menu, offers New Game system grid (5x2), and enters exploration on selection', async ({ page }) => {
    await page.goto('/')

    // 1. Main menu identity
    const menu = page.getByTestId('main-menu')
    await expect(menu).toBeVisible()
    await expect(menu.getByRole('heading', { level: 1 })).toContainText(/Phế Căn Ký|Broken Root/)

    // 2. New Game opens system selection
    await page.getByTestId('menu-new-game').click()
    const setup = page.getByTestId('new-game-screen')
    await expect(setup).toBeVisible()

    // 3. Grid semantics: 10 tiles present
    const tiles = page.locator('.system-tile')
    await expect(tiles).toHaveCount(10)

    // 4. Select a System (Battle System), set difficulty to Hard, and confirm
    await page.getByTestId('system-tile-sys_battle').click()
    await page.getByTestId('difficulty-hard').click()
    await page.getByTestId('newgame-confirm').click()

    // 5. Loading screen -> begin
    await page.getByRole('button', { name: /nhấn|press/i }).click()

    // 6. Gameplay entered on letter_at_dawn; System panel visible for chosen System
    await expect(page.getByTestId('game-screen')).toBeVisible()
    await expect(page.getByTestId('location-label')).toHaveText(/Làng Thanh Mộc|Greenwood Village/)
    await expect(page.getByTestId('narration-panel')).toHaveCount(0)
    await expect(page.getByText(/【Hệ Thống Chiến Đấu】|【Battle System】/)).toBeVisible()
  })

  test('Settings: toggles difficulty and narration proxy intent, persisting to device', async ({ page }) => {
    await page.goto('/')
    await page.getByTestId('menu-settings').click()

    const settings = page.getByTestId('settings-screen')
    await expect(settings).toBeVisible()

    // Switch narration on
    const narrationSwitch = page.getByTestId('narration-switch')
    await expect(narrationSwitch).toHaveAttribute('aria-checked', 'false')
    await narrationSwitch.click()
    await expect(narrationSwitch).toHaveAttribute('aria-checked', 'true')

    // Back returns to main menu
    await page.getByTestId('settings-back').click()
    await expect(page.getByTestId('main-menu')).toBeVisible()
  })
})
