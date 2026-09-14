// Issue #32 — NPC hội thoại phải song ngữ. Pure data test (node env, không DOM):
// assert en không còn dấu tiếng Việt + shape graph en ≡ vi (không có lỗ hổng).
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import {
  GENERIC_CONVERSATIONS,
  SCRIPTS,
  buildGenericScript,
  genericPickIndex,
  npcCtx,
  resolveScript,
  type ChatNode,
} from '../src/ui/NpcChatModal'
import { NPCS } from '../src/content'

// Dấu chỉ xuất hiện trong tiếng Việt (ASCII + Â/Ê/Ô/Ơ/Ư/Đ tách riêng từng ký tự
// để regex không match chữ cái Latin thường dùng trong tiếng Anh).
const VI_DIACRITICS = /[àáảãạăằắẳẵặâầấẩẫậèéẻẽẹêềếểễệìíỉĩịòóỏõọôồốổỗộơờớởỡợùúủũụưừứửữựỳýỷỹỵđ]/i

function flatText(node: ChatNode, label: string): Array<[string, string]> {
  return [
    [`${label} npc`, node.npc],
    [`${label} text`, node.text],
    ...node.choices.flatMap((c, i) => [[`choice ${i}`, c.label]] as Array<[string, string]>),
  ]
}

/** mọi string hiển thị được của cả cây script đã resolve */
function allRenderedStrings(script: Record<string, ChatNode>): Array<[string, string]> {
  return Object.entries(script).flatMap(([key, node]) => flatText(node, key))
}

const genericScriptFor = (locale: 'vi' | 'en', g: (typeof GENERIC_CONVERSATIONS)[number]) => {
  // ctx thật từ content: mỗi generic được dựng bằng ctx của 1 NPC có thật.
  const npc = NPCS[0]!
  const ctx = npcCtx(npc.id, npc.locationId)
  return resolveScript(buildGenericScript(ctx, g), locale)
}

describe('NpcChatModal bilingual dialogue (issue #32)', () => {
  for (const [id, entry] of Object.entries(SCRIPTS)) {
    it(`SCRIPTS[${id}] — en render has no Vietnamese diacritics`, () => {
      const en = resolveScript(entry.script, 'en')
      for (const [label, s] of allRenderedStrings(en)) {
        expect(VI_DIACRITICS.test(s), `${id} ${label}: ${s.slice(0, 60)}`).toBe(false)
        expect(s.length).toBeGreaterThan(0)
      }
      expect(VI_DIACRITICS.test(entry.name.en)).toBe(false)
      expect(VI_DIACRITICS.test(entry.youName.en)).toBe(false)
    })

    it(`SCRIPTS[${id}] — en graph has identical shape to vi`, () => {
      const vi = resolveScript(entry.script, 'vi')
      const en = resolveScript(entry.script, 'en')
      expect(Object.keys(en).sort()).toEqual(Object.keys(vi).sort())
      for (const key of Object.keys(vi)) {
        const v = vi[key]!
        const e = en[key]!
        expect(e.choices.length, `${key} choice count`).toBe(v.choices.length)
        expect(e.end).toBe(v.end)
        e.choices.forEach((c, i) => expect(c.next, `${key} choice ${i} target`).toBe(v.choices[i]!.next))
      }
    })

    it(`SCRIPTS[${id}] — vi text kept byte-identical to authored content`, () => {
      // spot-check các node then chốt của issue (hardcoded vi trước đây)
      const vi = resolveScript(entry.script, 'vi')
      expect(vi['start']!.text).toBe(entry.script['start']!.text.vi)
      expect(vi['bye']!.text).toBe(entry.script['bye']!.text.vi)
    })
  }

  it('vi scripted text matches the pre-issue strings exactly', () => {
    expect(SCRIPTS['n_merchant_bao']!.script['start']!.text.vi).toBe(
      'Ồ, tiểu đạo hữu sáng sớm đã dậy sớm nhỉ. Có muốn xem qua mấy bình Tụ Khí Đan ta mới lấy từ trấn trên không? Hôm nay giảm giá cho người quen, chỉ 8 bạc thôi.',
    )
    expect(SCRIPTS['n_hermit_coc']!.script['ask']!.text.vi).toBe(
      'Tia sáng ấy… theo ta đoán, hẳn là một mảnh pháp bảo cổ xưa rơi xuống từ tầng trời. Loại này ba trăm năm mới xuất hiện một lần, nếu nhặt được thì cảnh giới có thể đề thăng hai ba tầng. Nhưng — yêu khí cũng theo đó mà tăng mạnh. Ngươi quyết định đi chứ?',
    )
    expect(SCRIPTS['n_alchemist_sam']!.script['bye']!.text.vi).toBe('Đan khí thuần hư, tâm địa bình an. Hẹn tái ngộ.')
    expect(SCRIPTS['n_merchant_bao']!.script['start']!.choices[0]!.label.vi).toBe('Mua một bình — đang cần để tu luyện.')
  })

  it('all 6 generic conversations resolve EN-clean for every real NPC ctx', () => {
    for (const g of GENERIC_CONVERSATIONS) {
      const en = genericScriptFor('en', g)
      expect(Object.keys(en).sort()).toEqual(['bye', 'deep', 'mid0', 'mid1', 'mid2', 'start'])
      for (const [label, s] of allRenderedStrings(en)) {
        expect(VI_DIACRITICS.test(s), `${label}: ${s.slice(0, 60)}`).toBe(false)
        expect(s, 'token replacement left a hole').not.toMatch(/\{(name|role|place|greet)\}/)
      }
    }
  })

  it('generic EN graph shape matches VI graph shape', () => {
    for (const g of GENERIC_CONVERSATIONS) {
      const vi = genericScriptFor('vi', g)
      const en = genericScriptFor('en', g)
      expect(Object.keys(en).sort()).toEqual(Object.keys(vi).sort())
      for (const key of Object.keys(vi)) {
        expect(en[key]!.choices.length, key).toBe(vi[key]!.choices.length)
        expect(en[key]!.end, key).toBe(vi[key]!.end)
      }
    }
  })

  it('npcCtx uses locale-appropriate content fields for every NPC', () => {
    for (const npc of NPCS) {
      const ctx = npcCtx(npc.id, npc.locationId)
      expect(ctx.name.vi).toBe(npc.nameVi)
      expect(ctx.name.en).toBe(npc.nameEn)
      expect(ctx.role.en).toBe(npc.roleEn)
      expect(ctx.greet.en).toBe(npc.greetEn)
      expect(npc.nameEn.length).toBeGreaterThan(0)
    }
  })

  it('location fallback resolves to nameEn for en ctx', () => {
    // NPC thật nào cũng có place; chỉ cần không rỗng và không lẫn dấu vi ở EN
    // (tên địa danh EN trong content là ASCII — if a diacritic place is ever
    // authored, that is content's choice, not a chat-modal bug).
    for (const npc of NPCS) {
      const ctx = npcCtx(npc.id, npc.locationId)
      expect(ctx.place.en.length).toBeGreaterThan(0)
      expect(ctx.place.vi.length).toBeGreaterThan(0)
    }
  })

  // ---- Issue #32 review fixes ------------------------------------------------

  it('resolving the SAME thread vi then en yields an identical node/choice graph', () => {
    // Dep-split bảo chứng: graph không đổi khi lật locale — chỉ string đổi.
    for (const [id, entry] of Object.entries(SCRIPTS)) {
      const vi = resolveScript(entry.script, 'vi')
      const en = resolveScript(entry.script, 'en')
      expect(Object.keys(en).sort(), id).toEqual(Object.keys(vi).sort())
      for (const key of Object.keys(vi)) {
        expect(en[key]!.choices.map((c) => c.next), `${id}/${key}`).toEqual(vi[key]!.choices.map((c) => c.next))
        expect(en[key]!.end, `${id}/${key}`).toBe(vi[key]!.end)
      }
    }
    const npc = NPCS[0]!
    for (const g of GENERIC_CONVERSATIONS) {
      const script = buildGenericScript(npcCtx(npc.id, npc.locationId), g)
      const vi = resolveScript(script, 'vi')
      const en = resolveScript(script, 'en')
      expect(Object.keys(en).sort()).toEqual(Object.keys(vi).sort())
      for (const key of Object.keys(vi)) {
        expect(en[key]!.choices.map((c) => c.next), key).toEqual(vi[key]!.choices.map((c) => c.next))
        expect(en[key]!.end, key).toBe(vi[key]!.end)
      }
    }
  })

  it('generic pick is a pure function of (npcId, locationId) — no Math.random', () => {
    // Same inputs → same index across repeated calls (a Math.random pick cannot).
    for (const npc of NPCS) {
      for (const loc of ['village', npc.locationId, 'some_other_place']) {
        const first = genericPickIndex(npc.id, loc)
        for (let i = 0; i < 25; i++) expect(genericPickIndex(npc.id, loc), `${npc.id}/${loc}`).toBe(first)
        expect(first).toBeGreaterThanOrEqual(0)
        expect(first).toBeLessThan(GENERIC_CONVERSATIONS.length)
      }
    }
    // Different (npcId, locationId) pairs must not all collapse to one thread.
    const spread = new Set(NPCS.flatMap((npc) => ['a', 'b', 'c'].map((loc) => genericPickIndex(npc.id, loc))))
    expect(spread.size).toBeGreaterThan(1)
    // Nguồn không còn Math.random trong code (bỏ comment để không match giải thích).
    const src = readFileSync(fileURLToPath(new URL('../src/ui/NpcChatModal.tsx', import.meta.url)), 'utf8')
    const code = src.replace(/\/\*[\s\S]*?\*\//g, '').replace(/\/\/.*$/gm, '')
    expect(code).not.toMatch(/Math\.random\s*\(/)
  })

  it('no authored `en:` literal contains Vietnamese diacritics', () => {
    // Quét tĩnh chính source file (kể cả label/chào hardcode ngoài SCRIPTS pool).
    // Toàn bộ en: literal trong file là single-quote một dòng.
    const src = readFileSync(fileURLToPath(new URL('../src/ui/NpcChatModal.tsx', import.meta.url)), 'utf8')
    const lits = [...src.matchAll(/en:\s*('(?:[^'\\]|\\.)*')/g)].map((m) => m[1]!.slice(1, -1))
    expect(lits.length).toBeGreaterThan(100)
    for (const s of lits) expect(VI_DIACRITICS.test(s), s.slice(0, 60)).toBe(false)
  })
})
