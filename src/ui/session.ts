import { validateGameState } from '../engine'
import type { GameState, Locale } from '../engine'

export const SESSION_KEY = 'phe-can-ky:save:v1'
export const LEGACY_SESSION_KEY = SESSION_KEY
// C2 (design review 2026-08): back up any rejected blob before it can be
// clobbered by a fresh run, so the player can still recover an old save.
export const SESSION_ORPHAN_KEY = 'phe-can-ky:save:v1:orphaned'
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

/** Discriminated load result so a rejected save is never silently mistaken
 * for a missing one (which would let a fresh run overwrite the old save). */
export type LoadResult =
  | { status: 'loaded'; session: GameSession }
  | { status: 'missing' }
  | { status: 'rejected' }

export function loadSession(storage: SessionStorage): LoadResult {
  const raw = storage.get(SESSION_KEY)
  if (typeof raw !== 'string') return { status: 'missing' }
  const parsed = parseSession(raw)
  return parsed === null ? { status: 'rejected' } : { status: 'loaded', session: parsed }
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
  const slots = legacy.status === 'loaded' ? { 1: { slotId: 1 as SlotId, savedAt: Date.now(), session: legacy.session } } : {}
  // C2: back up a rejected legacy blob before the slots write can clobber it,
  // so the player can still recover the old run from the orphaned key.
  if (legacy.status === 'rejected') {
    const rawSave = storage.get(SESSION_KEY)
    if (typeof rawSave === 'string') storage.set(SESSION_ORPHAN_KEY, rawSave)
  }
  writeSlots(storage, slots)
  if (legacy.status === 'loaded') setActiveSlot(storage, 1)
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
