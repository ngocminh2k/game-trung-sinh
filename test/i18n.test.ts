import { describe, expect, it } from 'vitest'
import { EN, VI, flattenDict, i18nParity, t } from '../src/i18n'
import { BEATS, CHAPTERS, ENDINGS, NPCS } from '../src/content'

describe('i18n parity', () => {
  it('vi and en dictionaries expose identical key sets', () => {
    const parity = i18nParity()
    expect(parity.missingInEn).toEqual([])
    expect(parity.missingInVi).toEqual([])
    expect(parity.ok).toBe(true)
  })

  it('no dictionary value is empty', () => {
    const check = (locale: 'vi' | 'en') => {
      const root: unknown = locale === 'vi' ? VI : EN
      const walk = (node: unknown, path: string): void => {
        if (typeof node === 'string') {
          expect(node.length, `${locale}:${path}`).toBeGreaterThan(0)
          return
        }
        if (typeof node === 'object' && node !== null) {
          for (const [k, v] of Object.entries(node)) walk(v, `${path}.${k}`)
        }
      }
      walk(root, locale)
    }
    check('vi')
    check('en')
  })

  it('t() resolves keys and falls back to the key itself', () => {
    expect(t('vi', 'hud.gold')).toBe('Lượng')
    expect(t('en', 'errors.TERMINAL')).toContain('life has closed')
    expect(t('en', 'does.not.exist')).toBe('does.not.exist')
    expect(t('vi', 'stages.s5')).toBe('Phi Thăng')
  })

  it('flattenDict produces stable key lists', () => {
    expect(flattenDict(VI).length).toBe(flattenDict(EN).length)
    expect(flattenDict(VI).every((k) => k.includes('.'))).toBe(true)
  })
})

describe('bilingual content parity', () => {
  it('npcs carry both languages everywhere', () => {
    for (const npc of NPCS) {
      expect(npc.nameVi.length).toBeGreaterThan(0)
      expect(npc.nameEn.length).toBeGreaterThan(0)
      expect(npc.greetVi.length).toBeGreaterThan(0)
      expect(npc.greetEn.length).toBeGreaterThan(0)
    }
  })

  it('chapters and endings carry both languages', () => {
    expect(CHAPTERS).toHaveLength(5)
    expect(ENDINGS).toHaveLength(5)
    for (const c of CHAPTERS) {
      expect(c.nameVi.length).toBeGreaterThan(0)
      expect(c.nameEn.length).toBeGreaterThan(0)
    }
    for (const e of ENDINGS) {
      expect(e.nameVi.length).toBeGreaterThan(0)
      expect(e.nameEn.length).toBeGreaterThan(0)
    }
  })

  it('beats carry both narrative languages and three suggestions', () => {
    for (const b of BEATS) {
      expect(b.textVi.length).toBeGreaterThan(0)
      expect(b.textEn.length).toBeGreaterThan(0)
      expect(b.titleVi.length).toBeGreaterThan(0)
      expect(b.titleEn.length).toBeGreaterThan(0)
      expect(b.suggested).toHaveLength(3)
    }
  })
})
