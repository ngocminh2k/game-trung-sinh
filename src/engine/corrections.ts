import { ITEMS, NPCS, QUESTS, RECIPES, TALENTS, TECHNIQUES } from '../content'
import type { ConcreteAction, Direction } from './types'

export interface ParsedIntent {
  ok: true
  action: ConcreteAction
}
export interface FailedIntent {
  ok: false
}

// Free-text may specify an explicit quantity ("mua 3 viên"); anything outside
// this safe band makes the whole utterance fail parsing instead of being
// silently clamped.
const MIN_QTY = 1
const MAX_QTY = 999

const DIACRITICS = /[\u0300-\u036f]/g

export function normalizeText(raw: string): string {
  return raw
    .normalize('NFD')
    .replace(DIACRITICS, '')
    .replace(/đ/g, 'd')
    .replace(/Đ/g, 'd')
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim()
}

const DIRECTION_WORDS: Array<[Direction, string[]]> = [
  ['north', ['north', 'up', 'phia bac', 'di len', 'len bac']],
  ['south', ['south', 'down', 'phia nam', 'di xuong', 'xuong nam']],
  ['east', ['east', 'right', 'phia dong', 'sang dong', 'ben dong']],
  ['west', ['west', 'left', 'phia tay', 'sang tay', 'ben tay']],
]

const TRAIN_WORDS = ['train', 'cultivate', 'luyen cong', 'tu luyen', 'luyen khi']
const REST_WORDS = ['rest', 'sleep', 'nghi ngoi', 'di ngu', 'ngu mot dem']
const GATHER_WORDS = ['gather', 'pick herbs', 'hai linh thao', 'thu hoach', 'hai thao']
const DRAW_WORDS = ['lottery', 'draw lottery', 'quay so', 'rut ve so', 'quat ve so', 've so']
const REFINE_WORDS = ['refine', 'exchange materials', 'exchange', 'doi linh tai', 'doi nguyen lieu', 'doi bua', 'luyen che']
const BUY_WORDS = ['buy', 'mua']
const SELL_WORDS = ['sell', 'ban di', 'ban mon', 'ban']
const USE_WORDS = ['use item', 'use', 'su dung', 'dung ', 'an ', 'uong ']
const STORE_WORDS = ['store', 'cat kho', 'gui kho', 'vao kho']
const WITHDRAW_WORDS = ['withdraw', 'lay kho', 'rut kho', 'lay ra kho']
const ACCEPT_WORDS = ['accept quest', 'nhan nhiem vu', 'nhan nhiem', 'nhan viec']
const COMPLETE_WORDS = ['complete quest', 'hoan thanh nhiem vu', 'tra nhiem vu', 'hoan nhiem']
const TALK_WORDS = ['talk to', 'talk', 'noi chuyen voi', 'noi chuyen', 'gap ']
const ENCOUNTER_WORDS = ['start encounter', 'engage enemy', 'fight enemy', 'giao chien', 'khai chien', 'vao tran']
const ATTACK_WORDS = ['attack', 'strike', 'tan cong', 'ra don', 'danh ']
const DEFEND_WORDS = ['defend', 'guard', 'phong thu', 'thu the', 'do don']
const RETREAT_WORDS = ['retreat', 'run away', 'flee', 'rut lui', 'bo chay', 'chay khoi', 'roi tran']
const EQUIP_WORDS = ['equip', 'trang bi', 'mac vao', 'cam vu khi']
const LEARN_WORDS = ['learn technique', 'learn skill', 'hoc cong phap', 'luyen bi kip', 'lĩnh ngộ']
const TALENT_WORDS = ['choose talent', 'select talent', 'chon thien phu', 'thuc tinh thien phu']

function includesAny(text: string, words: readonly string[]): boolean {
  return words.some((w) => text.includes(w))
}

// Word-boundary match, tolerant of a simple English plural suffix so that
// "2 herbs" still resolves to `spirit_herb` while unrelated embedded
// substrings ("ngan" inside longer Vietnamese syllables) do not.
function wordContains(text: string, phrase: string): boolean {
  if (phrase.length === 0) return false
  return new RegExp(`\\b${phrase}(?:es|s)?\\b`).test(text)
}

// Item resolution is derived from the ITEMS content table (ids, both
// localized names, and aliases), so new content is understood automatically.
function findItemIdIn(text: string): string | undefined {
  for (const def of ITEMS) {
    const names = [def.id.replace(/_/g, ' '), def.nameVi, def.nameEn, ...def.aliases].map(
      normalizeText,
    )
    if (names.some((n) => wordContains(text, n))) return def.id
  }
  return undefined
}

function findNpcIdIn(text: string): string | undefined {
  for (const npc of NPCS) {
    const names = [npc.nameEn, npc.nameVi, ...npc.aliases].map(normalizeText)
    if (names.some((n) => n.length > 1 && wordContains(text, n))) return npc.id
  }
  return undefined
}

function findQuestIdIn(text: string): string | undefined {
  for (const quest of QUESTS) {
    const names = [quest.id.replace(/_/g, ' '), quest.nameVi, quest.nameEn, ...quest.aliases].map(
      normalizeText,
    )
    if (names.some((n) => n.length > 2 && wordContains(text, n))) return quest.id
  }
  return undefined
}

function findTalentIdIn(text: string): string | undefined {
  for (const talent of TALENTS) {
    const names = [talent.id.replace(/_/g, ' '), talent.nameVi, talent.nameEn].map(normalizeText)
    if (names.some((name) => wordContains(text, name))) return talent.id
  }
  return undefined
}

function findTechniqueIdIn(text: string): string | undefined {
  for (const technique of TECHNIQUES) {
    const names = [technique.id.replace(/_/g, ' '), technique.nameVi, technique.nameEn].map(normalizeText)
    if (names.some((name) => wordContains(text, name))) return technique.id
  }
  return undefined
}

function findRecipeIdIn(text: string): string | undefined {
  for (const recipe of RECIPES) {
    const names = [recipe.id.replace(/_/g, ' '), recipe.nameVi, recipe.nameEn].map(normalizeText)
    if (names.some((name) => wordContains(text, name))) return recipe.id
  }
  return undefined
}

// Extracts an explicitly written positive quantity ("buy 3 pills"). Returns
// undefined when no quantity was specified; a number outside
// [MIN_QTY, MAX_QTY] fails the whole parse.
function extractSpecifiedQty(text: string): number | undefined | 'invalid' {
  const match = /\b(\d+)\b/.exec(text)
  if (match === null) return undefined
  const qty = Number(match[1])
  if (!Number.isInteger(qty) || qty < MIN_QTY || qty > MAX_QTY) return 'invalid'
  return qty
}

export function parseFreeText(raw: string): ParsedIntent | FailedIntent {
  const text = normalizeText(raw)
  if (text.length < 2) return { ok: false }

  const specifiedQty = extractSpecifiedQty(text)
  if (specifiedQty === 'invalid') return { ok: false }
  const qty = specifiedQty ?? 1

  if (includesAny(text, ENCOUNTER_WORDS)) return { ok: true, action: { kind: 'start_encounter' } }
  if (includesAny(text, RETREAT_WORDS)) return { ok: true, action: { kind: 'combat_retreat' } }
  if (includesAny(text, ATTACK_WORDS)) {
    // Naming no technique is a deliberate choice: the cheap basic strike.
    return { ok: true, action: { kind: 'combat_attack', techniqueId: findTechniqueIdIn(text) } }
  }
  if (includesAny(text, DEFEND_WORDS)) return { ok: true, action: { kind: 'combat_defend' } }
  if (includesAny(text, EQUIP_WORDS)) {
    const itemId = findItemIdIn(text)
    if (itemId !== undefined) return { ok: true, action: { kind: 'equip_item', itemId } }
    return { ok: false }
  }
  if (includesAny(text, LEARN_WORDS)) {
    const techniqueId = findTechniqueIdIn(text)
    if (techniqueId !== undefined) return { ok: true, action: { kind: 'learn_technique', techniqueId } }
    const itemId = findItemIdIn(text)
    const item = itemId === undefined ? undefined : ITEMS.find((candidate) => candidate.id === itemId)
    if (item?.teachesTechniqueId !== undefined) {
      return { ok: true, action: { kind: 'learn_technique', techniqueId: item.teachesTechniqueId } }
    }
    return { ok: false }
  }
  if (includesAny(text, TALENT_WORDS)) {
    const talentId = findTalentIdIn(text)
    return talentId === undefined ? { ok: false } : { ok: true, action: { kind: 'choose_talent', talentId } }
  }
  if (includesAny(text, REFINE_WORDS)) {
    const recipeId = findRecipeIdIn(text)
    return recipeId === undefined ? { ok: false } : { ok: true, action: { kind: 'refine', recipeId } }
  }

  if (includesAny(text, STORE_WORDS)) {
    const itemId = findItemIdIn(text)
    if (itemId !== undefined) return { ok: true, action: { kind: 'store', itemId, qty } }
    return { ok: false }
  }
  if (includesAny(text, WITHDRAW_WORDS)) {
    const itemId = findItemIdIn(text)
    if (itemId !== undefined) return { ok: true, action: { kind: 'withdraw', itemId, qty } }
    return { ok: false }
  }
  if (includesAny(text, ACCEPT_WORDS)) {
    const questId = findQuestIdIn(text)
    if (questId !== undefined) return { ok: true, action: { kind: 'accept_quest', questId } }
    return { ok: false }
  }
  if (includesAny(text, COMPLETE_WORDS)) {
    const questId = findQuestIdIn(text)
    if (questId !== undefined) return { ok: true, action: { kind: 'complete_quest', questId } }
    return { ok: false }
  }
  if (includesAny(text, TALK_WORDS)) {
    const npcId = findNpcIdIn(text)
    if (npcId !== undefined) return { ok: true, action: { kind: 'talk', npcId } }
    return { ok: false }
  }
  if (includesAny(text, BUY_WORDS)) {
    const itemId = findItemIdIn(text)
    if (itemId !== undefined) return { ok: true, action: { kind: 'buy', itemId, qty } }
    return { ok: false }
  }
  if (includesAny(text, SELL_WORDS)) {
    const itemId = findItemIdIn(text)
    if (itemId !== undefined) return { ok: true, action: { kind: 'sell', itemId, qty } }
    return { ok: false }
  }
  if (includesAny(text, USE_WORDS)) {
    const itemId = findItemIdIn(text)
    if (itemId !== undefined) return { ok: true, action: { kind: 'use_item', itemId, qty } }
    return { ok: false }
  }
  if (includesAny(text, GATHER_WORDS)) {
    return { ok: true, action: { kind: 'gather' } }
  }
  if (includesAny(text, DRAW_WORDS)) {
    return { ok: true, action: { kind: 'draw_lottery' } }
  }
  if (includesAny(text, TRAIN_WORDS)) {
    return { ok: true, action: { kind: 'train' } }
  }
  if (includesAny(text, REST_WORDS)) {
    return { ok: true, action: { kind: 'rest' } }
  }
  const dirMatch = matchDirection(text)
  if (dirMatch !== null) {
    return { ok: true, action: { kind: 'move', direction: dirMatch } }
  }
  return { ok: false }
}

function matchDirection(text: string): Direction | null {
  for (const [dir, words] of DIRECTION_WORDS) {
    for (const w of words) {
      const pattern = new RegExp(`\\b${w}\\b`)
      if (pattern.test(text)) return dir
    }
  }
  return null
}
