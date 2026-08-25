import { expect, test } from '@playwright/test'

test('a player can see the map and walk west with the keyboard', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Phế Căn Ký/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Bản đồ hành trình' })).toBeVisible()
  await expect(page.getByTestId('location-label')).toHaveText('Làng Thanh Mộc')

  await page.keyboard.press('ArrowLeft')

  await expect(page.getByTestId('location-label')).toHaveText('Chợ Vân Tập')
  await page.reload()
  await expect(page.getByTestId('location-label')).toHaveText('Chợ Vân Tập')
})

test('a player can choose one of the three suggested story actions', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Lựa chọn của ngươi', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /Nói chuyện với Cụ Mai Hoa/ }).click()

  await expect(page.getByLabel('Biên niên ký')).toContainText('Mai Hoa')
})

test('a player can enter an encounter and use a learned technique', async ({ page }) => {
  await page.goto('/')

  await page.keyboard.press('ArrowRight')
  await page.keyboard.press('ArrowUp')
  await page.keyboard.press('ArrowUp')
  await expect(page.getByTestId('location-label')).toHaveText('Rừng Sương Mù')

  await page.getByRole('button', { name: 'Bước vào giao chiến' }).click()
  await expect(page.getByLabel('Giao chiến đang diễn ra')).toBeVisible()
  for (let turn = 0; turn < 4; turn += 1) {
    const attack = page.getByRole('button', { name: /Xuất Mộc Trượng Thức/ })
    if (await attack.count() === 0) break
    await attack.click()
  }
  await expect(page.getByLabel('Giao chiến đang diễn ra')).toHaveCount(0)
})
