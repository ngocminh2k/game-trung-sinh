import { describe, expect, it } from 'vitest'
import {
  ACHIEVEMENTS,
  BEATS,
  CHAPTERS,
  ENDINGS,
  ITEMS,
  LOCATIONS,
  NPCS,
  QUESTS,
} from '../src/content'
import { normalizeText } from '../src/engine/corrections'
import { EN, VI } from '../src/i18n'

/**
 * The world is an invented jianghu. No real nations, politics, or religions
 * may appear anywhere in player-facing content — in either language. Terms are
 * matched against diacritics-stripped, lowercased text with word boundaries,
 * so "Việt Nam" is caught just like "vietnam", while ordinary fictional
 * xianxia vocabulary ("linh căn", "đan điền", "phi thăng", ...) never trips
 * the scan. Extend the lists below as needed; the scan runs over every
 * authored string in both languages.
 */
const BANNED_TERMS = [
  // Real countries / regions (English)
  'china',
  'chinese',
  'vietnam',
  'viet nam',
  'japan',
  'japanese',
  'korea',
  'russia',
  'america',
  'usa',
  'england',
  'britain',
  'france',
  'germany',
  'india',
  'thailand',
  'taiwan',
  'tibet',
  // Real countries / regions (Vietnamese)
  'trung quoc',
  'nhat ban',
  'han quoc',
  'an do',
  'thai lan',
  'hoa ky',
  // Politics / government (English)
  'president',
  'government',
  'parliament',
  'congress',
  'senate',
  'election',
  'communist',
  'socialist',
  'capitalist',
  'democracy',
  'dictator',
  'republic',
  'empire of',
  // Politics / government (Vietnamese)
  'chinh phu',
  'tong thong',
  'quoc hoi',
  'bau cu',
  'cong san',
  // Organized real-world religions / deities (English)
  'buddha',
  'buddhism',
  'taoism',
  'daoism',
  'confucius',
  'christ',
  'jesus',
  'islam',
  'quran',
  'koran',
  'allah',
  'hindu',
  'vishnu',
  'vatican',
  'pope',
  // Organized real-world religions / deities (Vietnamese)
  'duc phat',
  'phat giao',
  'nho giao',
  'thien chua giao',
  'hoi giao',
  'kinh thanh',
].map(normalizeText)

function collectStrings(node: unknown, out: string[]): void {
  if (typeof node === 'string') {
    out.push(node)
    return
  }
  if (Array.isArray(node)) {
    for (const v of node) collectStrings(v, out)
    return
  }
  if (typeof node === 'object' && node !== null) {
    for (const v of Object.values(node)) collectStrings(v, out)
  }
}

function allContentStrings(): string[] {
  const tables = [NPCS, ITEMS, LOCATIONS, CHAPTERS, BEATS, ENDINGS, QUESTS, ACHIEVEMENTS]
  const out: string[] = []
  for (const table of tables) collectStrings(table, out)
  collectStrings(VI, out)
  collectStrings(EN, out)
  return out
}

function findOffenders(strings: readonly string[]): string[] {
  const offenders: string[] = []
  for (const s of strings) {
    const hay = normalizeText(s)
    for (const term of BANNED_TERMS) {
      if (new RegExp(`\\b${term}\\b`).test(hay)) {
        offenders.push(`"${term}" in: ${s.slice(0, 60)}`)
      }
    }
  }
  return offenders
}

describe('content world boundaries', () => {
  it('contains no real-world country, political, or religious terms (any casing/diacritics)', () => {
    expect(findOffenders(allContentStrings())).toEqual([])
  })

  it('normalization catches diacritics and mixed-case spellings', () => {
    expect(findOffenders(['Việt Nam vô địch', 'Trung Quốc', 'NHẬT BẢN', 'Đức Phật'])).not.toEqual(
      [],
    )
  })

  it('does not ban fictional xianxia vocabulary', () => {
    const fictional = [
      'Tông Vân Ẩn chưởng môn',
      'Linh căn khuyết tạp, tu luyện chậm nửa nhịp.',
      'Kim Đan đại viên mãn, chỉ còn một bước phi thăng.',
      'Đan điền ấm ran, trúc cơ vững vàng.',
      'Thiên đạo vô thường, võ đạo vô cùng.',
      'Phi thăng là chuyện của kẻ khác — hay chưa đâu vào đó.',
      'Bí kíp cong queo dạy cách đi vòng quanh điểm gãy.',
    ]
    expect(findOffenders(fictional)).toEqual([])
  })

  it('every authored string is non-empty', () => {
    for (const s of allContentStrings()) {
      expect(s.trim().length, JSON.stringify(s.slice(0, 40))).toBeGreaterThan(0)
    }
  })
})
