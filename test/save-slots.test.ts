import { describe, expect, it } from 'vitest'
import { applyAction, newGame } from '../src/engine'
import {
  ACTIVE_SLOT_KEY,
  SLOT_IDS,
  LEGACY_SESSION_KEY,
  SLOTS_KEY,
  deleteSaveSlot,
  getActiveSlot,
  loadSaveSlots,
  saveSlot,
  setActiveSlot,
  shouldAutoSave,
  type GameSession,
} from '../src/ui/session'

function session(seed: string): GameSession {
  return { game: newGame(seed), locale: 'en', chronicle: [seed] }
}

describe('save slots', () => {
  it('stores five independent slots', () => {
    const storage = new Map<string, string>()
    for (const slotId of SLOT_IDS) saveSlot(storage, slotId, session(`slot-${slotId}`), slotId)

    const slots = loadSaveSlots(storage)
    expect(Object.keys(slots)).toHaveLength(5)
    expect(slots[1]?.session.game.seed).toBe('slot-1')
    expect(slots[5]?.savedAt).toBe(5)
    expect(storage.get(SLOTS_KEY)).toBeDefined()
  })

  it('migrates a valid legacy session into slot 1 once', () => {
    const storage = new Map<string, string>()
    const legacy = session('legacy-save')
    storage.set(LEGACY_SESSION_KEY, JSON.stringify(legacy))

    expect(loadSaveSlots(storage)[1]?.session.game.seed).toBe(legacy.game.seed)
    expect(getActiveSlot(storage)).toBe(1)
    expect(loadSaveSlots(storage)[1]?.session.game.seed).toBe(legacy.game.seed)
  })

  it('deletes a slot and clears it as active', () => {
    const storage = new Map<string, string>()
    saveSlot(storage, 3, session('delete-me'), 3)
    setActiveSlot(storage, 3)

    deleteSaveSlot(storage, 3)

    expect(loadSaveSlots(storage)[3]).toBeUndefined()
    expect(getActiveSlot(storage)).toBeNull()
    expect(storage.get(ACTIVE_SLOT_KEY)).toBeUndefined()
  })

  it('tracks the selected active slot', () => {
    const storage = new Map<string, string>()
    setActiveSlot(storage, 4)

    expect(getActiveSlot(storage)).toBe(4)
  })

  it('requests an autosave when travel changes the player position', () => {
    const game = newGame('autosave-travel')
    const moved = applyAction(game, { kind: 'move', direction: 'south' }).state

    expect(moved.day).toBe(game.day)
    expect(shouldAutoSave(game, moved)).toBe(true)
    expect(shouldAutoSave(moved, moved)).toBe(false)
  })
})
