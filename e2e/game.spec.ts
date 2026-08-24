import { expect, test } from '@playwright/test'

test('a player can see the map and walk west with the keyboard', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByRole('heading', { name: /Phế Căn Ký/ })).toBeVisible()
  await expect(page.getByRole('heading', { name: 'Bản đồ hành trình' })).toBeVisible()
  await expect(page.getByText('Làng Thanh Mộc', { exact: true })).toBeVisible()

  await page.keyboard.press('ArrowLeft')

  await expect(page.getByText('Chợ Vân Tập', { exact: true })).toBeVisible()
  await page.reload()
  await expect(page.getByText('Chợ Vân Tập', { exact: true })).toBeVisible()
})

test('a player can choose one of the three suggested story actions', async ({ page }) => {
  await page.goto('/')

  await expect(page.getByText('Lựa chọn của ngươi', { exact: true })).toBeVisible()
  await page.getByRole('button', { name: /Nói chuyện với Cụ Mai Hoa/ }).click()

  await expect(page.getByText(/Cụ Mai Hoa/).last()).toBeVisible()
})
