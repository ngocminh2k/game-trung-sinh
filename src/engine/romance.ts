import { romanceTrackFor, ROMANCE_TRACKS } from '../content/romance'
import { MAX_HP, MAX_QI } from './constants'
import type { RomanceChoiceDef, RomanceEffect, RomanceNode, RomanceTrack } from './content-types'
import type { GameState } from './types'

export function romanceNodeFlag(npcId: string, nodeId: string): string {
  return `romance_${npcId}_node_${nodeId}`
}

function flagNumber(state: GameState, key: string): number {
  const value = state.flags[key]
  return typeof value === 'number' ? value : 0
}

function matchesTrigger(state: GameState, track: RomanceTrack, node: RomanceNode): boolean {
  const { trigger } = node
  if (trigger.locationId !== undefined && state.player.locationId !== trigger.locationId) return false
  if (trigger.dayMin !== undefined && state.day < trigger.dayMin) return false
  if (trigger.affMin !== undefined && flagNumber(state, `aff_${track.npcId}`) < trigger.affMin) return false
  return Object.entries(trigger.flags ?? {}).every(([key, value]) => {
    const actual = state.flags[key]
    return typeof value === 'number' ? typeof actual === 'number' && actual >= value : actual === value
  })
}

export function romanceTrackUnlocked(state: GameState, npcId: string): boolean {
  return romanceTrackFor(npcId) !== undefined && flagNumber(state, `aff_${npcId}`) >= 1
}

export function currentRomanceNode(state: GameState, npcId: string): RomanceNode | undefined {
  const track = romanceTrackFor(npcId)
  if (track === undefined || !romanceTrackUnlocked(state, npcId)) return undefined
  return track.nodes.find((node) => state.flags[romanceNodeFlag(npcId, node.id)] !== true
    && (node.requires ?? []).every((flag) => state.flags[flag] === true)
    && matchesTrigger(state, track, node))
}

export function romanceProgress(state: GameState, npcId: string): number {
  const track = romanceTrackFor(npcId)
  return track?.nodes.filter((node) => state.flags[romanceNodeFlag(npcId, node.id)] === true).length ?? 0
}

export function findRomanceChoice(state: GameState, npcId: string, choiceId: string): { node: RomanceNode; choice: RomanceChoiceDef } | undefined {
  const node = currentRomanceNode(state, npcId)
  const choice = node?.choices.find((entry) => entry.id === choiceId)
  return node === undefined || choice === undefined ? undefined : { node, choice }
}

export function hasOtherCommitment(state: GameState, npcId: string): boolean {
  return ROMANCE_TRACKS.some((track) => track.npcId !== npcId && state.flags[`romance_${track.npcId}_commitment`] === true)
}

function applyEffect(state: GameState, npcId: string, effect: RomanceEffect): GameState {
  const affKey = `aff_${npcId}`
  const flags = {
    ...state.flags,
    ...(effect.flag === undefined ? {} : { [effect.flag]: true }),
    ...(effect.aff === undefined ? {} : { [affKey]: flagNumber(state, affKey) + effect.aff }),
  }
  return {
    ...state,
    flags,
    player: {
      ...state.player,
      hp: Math.max(0, Math.min(MAX_HP, state.player.hp + (effect.hp ?? 0))),
      qi: Math.max(0, Math.min(MAX_QI, state.player.qi + (effect.qi ?? 0))),
      gold: Math.max(0, state.player.gold + (effect.gold ?? 0)),
    },
  }
}

export function applyRomanceChoice(state: GameState, npcId: string, node: RomanceNode, choice: RomanceChoiceDef): GameState {
  let next = applyEffect(state, npcId, node.effects)
  next = applyEffect(next, npcId, choice.effect)
  const nextNodeId = choice.next
  return {
    ...next,
    flags: {
      ...next.flags,
      [romanceNodeFlag(npcId, node.id)]: true,
      romance_scene: nextNodeId ?? node.id,
    },
  }
}
