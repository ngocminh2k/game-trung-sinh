import { expect, test, type Page } from '@playwright/test'
import { newGame, type GameState, type Locale } from '../src/engine'

const SESSION_KEY = 'phe-can-ky:save:v1'
type GameSession = { game: GameState; locale: Locale; chronicle: string[] }

function freshGame(update?: (g: GameState) => GameState): GameState {
  const game = newGame('debug-seed')
  return update === undefined ? game : update(game)
}

async function beginPlaying(page: Page): Promise<void> {
  await page.getByRole('button', { name: /nhấn|press/i }).click()
  await expect(page.getByTestId('game-screen')).toBeVisible()
}

async function openGame(page: Page, game = freshGame(), locale: Locale = 'en'): Promise<void> {
  const session: GameSession = { game, locale, chronicle: ['Debug run.'] }
  await page.addInitScript(
    ({ key, value }) => {
      if (window.localStorage.getItem(key) === null) window.localStorage.setItem(key, value)
    },
    { key: SESSION_KEY, value: JSON.stringify(session) },
  )
  await page.goto('/')
  await beginPlaying(page)
}

test('debug: check initial map', async ({ page }) => {
  await openGame(page)
  
  // Check what map nodes are visible
  const nodes = page.locator('[data-testid^="event-node-"]')
  const count = await nodes.count()
  console.log(`Found ${count} map nodes`)
  
  for (let i = 0; i < count; i++) {
    const node = nodes.nth(i)
    const testId = await node.getAttribute('data-testid')
    const isVisible = await node.isVisible()
    console.log(`Node ${i}: ${testId}, visible: ${isVisible}`)
  }
  
  // Check player location
  const locLabel = await page.getByTestId('location-label').textContent()
  console.log(`Location label: ${locLabel}`)
  
  // Check game state via evaluate
  const gameState = await page.evaluate(() => {
    const raw = window.localStorage.getItem('phe-can-ky:save:v1')
    return raw ? JSON.parse(raw) : null
  })
  console.log(`Loaded game state:`, gameState?.game?.player?.locationId, gameState?.game?.player?.posX, gameState?.game?.player?.posY)
})