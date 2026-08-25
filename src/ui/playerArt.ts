import combatAttack from '../assets/art/player/combat-attack.png'
import combatDefend from '../assets/art/player/combat-defend.png'
import cultivate from '../assets/art/player/cultivate.png'
import death from '../assets/art/player/death.png'
import gather from '../assets/art/player/gather.png'
import hurt from '../assets/art/player/hurt.png'
import idle from '../assets/art/player/idle.png'
import move from '../assets/art/player/move.png'
import rest from '../assets/art/player/rest.png'
import talk from '../assets/art/player/talk.png'
import useItem from '../assets/art/player/use-item.png'

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
