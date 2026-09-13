import combatAttack from '../assets/art/player/combat-attack.webp'
import combatDefend from '../assets/art/player/combat-defend.webp'
import cultivate from '../assets/art/player/cultivate.webp'
import death from '../assets/art/player/death.webp'
import gather from '../assets/art/player/gather.webp'
import hurt from '../assets/art/player/hurt.webp'
import idle from '../assets/art/player/idle.webp'
import move from '../assets/art/player/move.webp'
import rest from '../assets/art/player/rest.webp'
import talk from '../assets/art/player/talk.webp'
import useItem from '../assets/art/player/use-item.webp'

/** Stable pose keys used by the visual layer; game state remains asset-free. */
export const PLAYER_ACTION_KEYS = [
  'idle',
  'move',
  'talk',
  'gather',
  'cultivate',
  'rest',
  'use-item',
  'combat-attack',
  'combat-defend',
  'hurt',
  'death',
] as const

export type PlayerActionKey = (typeof PLAYER_ACTION_KEYS)[number]

const PLAYER_ACTION_ART: Record<PlayerActionKey, string> = {
  idle,
  move,
  talk,
  gather,
  cultivate,
  rest,
  'use-item': useItem,
  'combat-attack': combatAttack,
  'combat-defend': combatDefend,
  hurt,
  death,
}

export function playerArtFor(action: PlayerActionKey): string {
  return PLAYER_ACTION_ART[action]
}
