import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { describe, expect, it } from 'vitest'

const CSS_PATH = resolve(process.cwd(), 'src/index.css')
const EXPECTED_VARS = ['--ink', '--jade', '--jade-light', '--vermilion', '--gold', '--paper'] as const

describe('P2-1 palette CSS custom properties', () => {
  const css = readFileSync(CSS_PATH, 'utf8')

  it('declares the six required palette vars on :root', () => {
    const rootBlock = css.match(/:root\s*\{[\s\S]*?\}/)
    expect(rootBlock, ':root selector must exist in src/index.css').not.toBeNull()
    const block = rootBlock?.[0] ?? ''
    for (const name of EXPECTED_VARS) {
      expect(block, `${name} must be defined inside :root`).toMatch(new RegExp(`${name}\\s*:`))
    }
  })

  it('exposes a jade-dark var for ink-wash surfaces', () => {
    const rootBlock = css.match(/:root\s*\{[\s\S]*?\}/)?.[0] ?? ''
    expect(rootBlock).toMatch(/--jade-dark\s*:\s*#1c4e3a/)
  })

  it('imports Noto Serif SC for CJK realm seals', () => {
    expect(css).toMatch(/Noto\+Serif\+SC/)
  })
})