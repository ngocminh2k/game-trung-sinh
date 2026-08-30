import { validateGameState } from '../engine'
import type { GameState, Locale } from '../engine'

export const SESSION_KEY = 'phe-can-ky:save:v1'
export const LEGACY_SESSION_KEY = SESSION_KEY
export const SLOTS_KEY = 'phe-can-ky:slots'
export const ACTIVE_SLOT_KEY = 'phe-can-ky:active-slot'
export const SLOT_IDS = [1, 2, 3, 4, 5] as const
export type SlotId = (typeof SLOT_IDS)[number]

export interface GameSession {
  game: GameState
  locale: Locale
  chronicle: string[]
}

export interface SaveSlot {
  slotId: SlotId
  savedAt: number
  session: GameSession
}

export interface SessionStorage {
  get(key: string): string | null | undefined
  set(key: string, value: string): unknown
  delete?(key: string): unknown
  remove?(key: string): unknown
}

function isSlotId(value: unknown): value is SlotId {
  return typeof value === 'number' && SLOT_IDS.includes(value as SlotId)
}

function parseSession(raw: string): GameSession | null {
  try {
    const candidate = JSON.parse(raw) as Partial<GameSession>
    if (candidate.locale !== 'vi' && candidate.locale !== 'en') return null
    if (!Array.isArray(candidate.chronicle) || !candidate.chronicle.every((line) => typeof line === 'string')) return null
    return { game: validateGameState(candidate.game), locale: candidate.locale, chronicle: candidate.chronicle.slice(-80) }
  } catch {
    return null
  }
}

export function saveSession(storage: SessionStorage, session: GameSession): void {
  storage.set(SESSION_KEY, JSON.stringify(session))
}

export function loadSession(storage: SessionStorage): GameSession | null {
  const raw = storage.get(SESSION_KEY)
  return typeof raw === 'string' ? parseSession(raw) : null
}

function writeSlots(storage: SessionStorage, slots: Partial<Record<SlotId, SaveSlot>>): void {
  storage.set(SLOTS_KEY, JSON.stringify(slots))
}

function parseSlots(raw: string): Partial<Record<SlotId, SaveSlot>> {
  try {
    const candidate = JSON.parse(raw) as Record<string, Partial<SaveSlot>>
    const slots: Partial<Record<SlotId, SaveSlot>> = {}
    for (const slotId of SLOT_IDS) {
      const entry = candidate[String(slotId)]
      if (entry?.slotId !== slotId || typeof entry.savedAt !== 'number') continue
      const session = parseSession(JSON.stringify(entry.session))
      if (session !== null) slots[slotId] = { slotId, savedAt: entry.savedAt, session }
    }
    return slots
  } catch {
    return {}
  }
}

export function loadSaveSlots(storage: SessionStorage): Partial<Record<SlotId, SaveSlot>> {
  const raw = storage.get(SLOTS_KEY)
  if (typeof raw === 'string') return parseSlots(raw)

  const legacy = loadSession(storage)
  const slots = legacy === null ? {} : { 1: { slotId: 1 as SlotId, savedAt: Date.now(), session: legacy } }
  writeSlots(storage, slots)
  if (legacy !== null) setActiveSlot(storage, 1)
  return slots
}

export function saveSlot(storage: SessionStorage, slotId: SlotId, session: GameSession, savedAt = Date.now()): void {
  const slots = loadSaveSlots(storage)
  slots[slotId] = { slotId, savedAt, session }
  writeSlots(storage, slots)
}

export function getActiveSlot(storage: SessionStorage): SlotId | null {
  const value = Number(storage.get(ACTIVE_SLOT_KEY))
  return isSlotId(value) ? value : null
}

function remove(storage: SessionStorage, key: string): void {
  if (typeof storage.delete === 'function') storage.delete(key)
  else if (typeof storage.remove === 'function') storage.remove(key)
  else storage.set(key, '')
}

export function setActiveSlot(storage: SessionStorage, slotId: SlotId | null): void {
  if (slotId === null) remove(storage, ACTIVE_SLOT_KEY)
  else storage.set(ACTIVE_SLOT_KEY, String(slotId))
}

export function deleteSaveSlot(storage: SessionStorage, slotId: SlotId): void {
  const slots = loadSaveSlots(storage)
  delete slots[slotId]
  writeSlots(storage, slots)
  if (getActiveSlot(storage) === slotId) setActiveSlot(storage, null)
}

export function shouldAutoSave(previous: GameState, next: GameState): boolean {
  return next.day > previous.day
}
