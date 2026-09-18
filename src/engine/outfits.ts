import {
  OUTFITS,
  TITLES,
  OUTFIT_TITLE_SYNERGIES,
  type OutfitDef,
  type TitleDef,
  type OutfitTitleSynergy,
  type CurrencyTier,
  type OutfitRarity,
  type SynergyAura,
} from '../content/outfits'
import type { GameState, GameEvent } from './types'
import type { GlobalProfile } from './globalProfile'

export {
  OUTFITS,
  TITLES,
  OUTFIT_TITLE_SYNERGIES,
  type OutfitDef,
  type TitleDef,
  type OutfitTitleSynergy,
  type CurrencyTier,
  type OutfitRarity,
  type SynergyAura,
}

export function getOutfit(id: string): OutfitDef | undefined {
  return OUTFITS.find((o) => o.id === id)
}

export function getTitle(id: string): TitleDef | undefined {
  return TITLES.find((t) => t.id === id)
}

export function getOutfitTitleSynergy(
  outfitId: string | null | undefined,
  titleId: string | null | undefined,
): OutfitTitleSynergy | null {
  if (!outfitId || !titleId) return null
  return OUTFIT_TITLE_SYNERGIES.find((s) => s.outfitId === outfitId && s.titleId === titleId) ?? null
}

export function getActiveSynergy(state: GameState): OutfitTitleSynergy | null {
  return getOutfitTitleSynergy(state.activeOutfitId, state.activeTitleId)
}

export function isZeroCombatStatsGuaranteed(outfitId?: string, titleId?: string): boolean {
  if (outfitId) {
    const o = getOutfit(outfitId)
    if (!o) return false
    if (o.combatStats.hp !== 0 || o.combatStats.attack !== 0 || o.combatStats.defense !== 0 || o.combatStats.crit !== 0) {
      return false
    }
  }
  if (titleId) {
    const t = getTitle(titleId)
    if (!t) return false
    if (t.combatStats.hp !== 0 || t.combatStats.attack !== 0 || t.combatStats.defense !== 0 || t.combatStats.crit !== 0) {
      return false
    }
  }
  // Global check across all content
  for (const o of OUTFITS) {
    if (o.combatStats.hp !== 0 || o.combatStats.attack !== 0 || o.combatStats.defense !== 0 || o.combatStats.crit !== 0) {
      return false
    }
  }
  for (const t of TITLES) {
    if (t.combatStats.hp !== 0 || t.combatStats.attack !== 0 || t.combatStats.defense !== 0 || t.combatStats.crit !== 0) {
      return false
    }
  }
  for (const s of OUTFIT_TITLE_SYNERGIES) {
    if (
      s.buffs.combatAttackBonus !== 0 ||
      s.buffs.combatDefenseBonus !== 0 ||
      s.buffs.combatHpBonus !== 0 ||
      s.buffs.combatCritBonus !== 0
    ) {
      return false
    }
  }
  return true
}

export function isTitleUnlocked(
  state: GameState,
  titleId: string,
  globalProfile?: GlobalProfile | null,
): boolean {
  // If explicitly unlocked in state
  if (state.unlockedTitles?.includes(titleId)) return true

  const def = getTitle(titleId)
  if (!def) return false

  switch (def.requirement.type) {
    case 'default':
      return true
    case 'achievement':
      if (!def.requirement.targetId) return false
      return state.achievements?.includes(def.requirement.targetId) ?? false
    case 'stage': {
      const minStage = def.requirement.threshold ?? 1
      return (state.player.stage ?? 1) >= minStage
    }
    case 'realm': {
      const minRealm = def.requirement.threshold ?? 1
      return (state.player.realmLevel ?? 1) >= minRealm
    }
    case 'reincarnation': {
      const minNg = def.requirement.threshold ?? 1
      const ng = state.ngPlusLevel ?? globalProfile?.highestNgPlusLevel ?? 0
      return ng >= minNg
    }
    default:
      return false
  }
}

export function getUnlockedTitles(
  state: GameState,
  globalProfile?: GlobalProfile | null,
): string[] {
  const result: string[] = []
  for (const title of TITLES) {
    if (isTitleUnlocked(state, title.id, globalProfile)) {
      result.push(title.id)
    }
  }
  return result
}

export function canBuyOutfit(
  state: GameState,
  outfitId: string,
): { ok: boolean; reason?: string; price?: { currency: CurrencyTier; amount: number } } {
  const outfit = getOutfit(outfitId)
  if (!outfit) {
    return { ok: false, reason: 'OUTFIT_UNKNOWN' }
  }

  const owned = state.unlockedOutfits ?? []
  if (owned.includes(outfitId)) {
    return { ok: false, reason: 'ALREADY_OWNED', price: outfit.price }
  }

  const { currency, amount } = outfit.price
  let currentBalance = 0
  if (currency === 'silver') {
    currentBalance = state.player.silver ?? 0
  } else if (currency === 'gold') {
    currentBalance = state.player.gold ?? 0
  } else if (currency === 'spiritStones') {
    currentBalance = state.player.spiritStones ?? 0
  }

  if (currentBalance < amount) {
    return {
      ok: false,
      reason: `INSUFFICIENT_${currency.toUpperCase()}`,
      price: outfit.price,
    }
  }

  return { ok: true, price: outfit.price }
}

export function buyOutfit(
  state: GameState,
  outfitId: string,
): { state: GameState; event: GameEvent } | { error: string } {
  const check = canBuyOutfit(state, outfitId)
  if (!check.ok || !check.price) {
    return { error: check.reason ?? 'CANNOT_BUY_OUTFIT' }
  }

  const { currency, amount } = check.price
  const nextPlayer = { ...state.player }
  if (currency === 'silver') {
    nextPlayer.silver = (nextPlayer.silver ?? 0) - amount
  } else if (currency === 'gold') {
    nextPlayer.gold = (nextPlayer.gold ?? 0) - amount
  } else if (currency === 'spiritStones') {
    nextPlayer.spiritStones = (nextPlayer.spiritStones ?? 0) - amount
  }

  const nextUnlocked = [...(state.unlockedOutfits ?? []), outfitId]

  const nextState: GameState = {
    ...state,
    player: nextPlayer,
    unlockedOutfits: nextUnlocked,
  }

  const event: GameEvent = {
    type: 'OUTFIT_BOUGHT',
    outfitId,
    currency,
    amount,
  }

  return { state: nextState, event }
}

export function equipOutfit(
  state: GameState,
  outfitId: string | null,
): { state: GameState; events: GameEvent[] } {
  if (outfitId !== null) {
    const owned = state.unlockedOutfits ?? []
    if (!owned.includes(outfitId)) {
      return {
        state,
        events: [{ type: 'ERROR', code: 'ITEM_UNAVAILABLE' }],
      }
    }
  }

  const nextState: GameState = {
    ...state,
    activeOutfitId: outfitId,
  }

  const events: GameEvent[] = [{ type: 'OUTFIT_EQUIPPED', outfitId }]

  const synergy = getOutfitTitleSynergy(outfitId, nextState.activeTitleId)
  if (synergy) {
    events.push({
      type: 'OUTFIT_TITLE_SYNERGY',
      synergyId: synergy.id,
      visualAura: synergy.buffs.visualAura,
    })
  }

  return { state: nextState, events }
}

export function equipTitle(
  state: GameState,
  titleId: string | null,
): { state: GameState; events: GameEvent[] } {
  if (titleId !== null) {
    if (!isTitleUnlocked(state, titleId)) {
      return {
        state,
        events: [{ type: 'ERROR', code: 'ITEM_UNAVAILABLE' }],
      }
    }
  }

  const nextState: GameState = {
    ...state,
    activeTitleId: titleId,
  }

  const events: GameEvent[] = [{ type: 'TITLE_EQUIPPED', titleId }]

  const synergy = getOutfitTitleSynergy(nextState.activeOutfitId, titleId)
  if (synergy) {
    events.push({
      type: 'OUTFIT_TITLE_SYNERGY',
      synergyId: synergy.id,
      visualAura: synergy.buffs.visualAura,
    })
  }

  return { state: nextState, events }
}

export function calculateSynergyCharmBonus(state: GameState): number {
  const syn = getActiveSynergy(state)
  return syn ? syn.buffs.charmBonus : 0
}

export function calculateSynergyShopDiscount(state: GameState): number {
  const syn = getActiveSynergy(state)
  return syn ? syn.buffs.shopDiscountPct : 0
}

export function calculateSynergyTravelReduction(state: GameState): number {
  const syn = getActiveSynergy(state)
  return syn ? syn.buffs.travelStaminaReductionPct : 0
}
