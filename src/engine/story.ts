import { getNpc, getStoryScene } from '../content'
import { MAX_HP, MAX_QI } from './constants'
import type { StoryChoiceDef, StorySceneDef } from './content-types'
import type { GameState } from './types'

const FIRST_SCENE_ID = 'letter_at_dawn'

export type StoryRouteTarget = { locationId: string; nodeId: string }

const ROUTE_TARGETS: Record<string, StoryRouteTarget> = {
  mercy: { locationId: 'village', nodeId: 'village-elder' },
  wealth: { locationId: 'market', nodeId: 'market-stalls' },
  truth: { locationId: 'market', nodeId: 'market-teahouse' },
}

function flagNumber(state: GameState, key: string): number {
  const value = state.flags[key]
  return typeof value === 'number' ? value : 0
}

function flagTrue(state: GameState, key: string): boolean {
  return state.flags[key] === true
}

export function currentStoryScene(state: GameState): StorySceneDef {
  const id = typeof state.flags.story_scene === 'string' ? state.flags.story_scene : FIRST_SCENE_ID
  return getStoryScene(id) ?? getStoryScene(FIRST_SCENE_ID)!
}

export function storyRouteTarget(state: GameState): StoryRouteTarget | undefined {
  if (state.flags.story_route_ready === true) return undefined
  const route = state.flags.story_route
  return typeof route === 'string' ? ROUTE_TARGETS[route] : undefined
}

export function applyStoryRouteArrival(state: GameState, nodeId: string): GameState {
  const target = storyRouteTarget(state)
  if (target === undefined || target.locationId !== state.player.locationId || target.nodeId !== nodeId) return state
  return { ...state, flags: { ...state.flags, story_route_ready: true } }
}

export function findStoryChoice(state: GameState, choiceId: string): StoryChoiceDef | undefined {
  const choice = currentStoryScene(state).choices.find((entry) => entry.id === choiceId)
  if (choice === undefined) return undefined
  if (choice.requires === undefined) return choice
  return Object.entries(choice.requires).every(([key, required]) => {
    const actual = state.flags[key]
    return typeof required === 'number' ? typeof actual === 'number' && actual >= required : actual === required
  }) ? choice : undefined
}

export function applyStoryEffects(state: GameState, choice: StoryChoiceDef): GameState {
  const flags = { ...state.flags }
  for (const [key, value] of Object.entries(choice.effects ?? {})) {
    flags[key] = typeof value === 'number' ? flagNumber(state, key) + value : value
  }
  if (choice.nextSceneId !== null) flags.story_scene = choice.nextSceneId
  const delta = choice.playerDelta
  if (delta === undefined) return { ...state, flags }
  return {
    ...state,
    flags,
    player: {
      ...state.player,
      hp: Math.max(0, Math.min(MAX_HP, state.player.hp + (delta.hp ?? 0))),
      qi: Math.max(0, Math.min(MAX_QI, state.player.qi + (delta.qi ?? 0))),
      gold: Math.max(0, state.player.gold + (delta.gold ?? 0)),
      progress: Math.max(0, state.player.progress + (delta.progress ?? 0)),
    },
  }
}

// The last visible decision is intentionally ambiguous. The ending is chosen
// from the player’s accumulated values, so the same button can reveal a very
// different consequence in a second life.
export function resolveStoryEnding(state: GameState, choiceId: string): string {
  const mercy = flagNumber(state, 'story_mercy')
  const truth = flagNumber(state, 'story_truth')
  const wealth = flagNumber(state, 'story_wealth')
  const power = flagNumber(state, 'story_power')
  const order = flagNumber(state, 'story_order')
  const renounce = flagNumber(state, 'story_renounce')

  if (choiceId === 'open_last_page') {
    if (truth >= 3) return 'rootless_star'
    if (power >= 3 && flagTrue(state, 'story_ha_bound')) return 'rift_kingdom'
    if (power >= 3) return 'borrowed_face'
    if (wealth >= 2) return 'city_of_ghosts'
    return 'iron_lantern'
  }
  if (choiceId === 'share_last_page') {
    if (mercy >= 3 && flagTrue(state, 'story_khoa_trusted')) return 'forgiven_enemy'
    if (mercy >= 2) return 'keeper_of_names'
    if (order >= 2) return 'iron_lantern'
    return 'jade_heir'
  }
  if (renounce >= 2) return 'blank_page'
  if (wealth >= 2) return 'city_of_ghosts'
  return 'quiet_harmony'
}

export function dialogueForNpc(state: GameState, npcId: string): { vi: string; en: string } {
  const scene = currentStoryScene(state).id
  if (npcId === 'n_elder_meihua' && flagTrue(state, 'story_meihua_companion')) {
    return { vi: '“Bó dây đỏ không phải phép thuật, nhưng ta thấy ngươi đã dùng nó như một lời hứa. Đi tiếp đi; ta sẽ giữ cho làng còn nhớ đường về.”', en: '“The red thread is no spell, but I saw you use it as a promise. Go on; I will keep the village remembering the way home.”' }
  }
  if (npcId === 'n_merchant_bao' && flagTrue(state, 'story_bao_companion')) {
    return { vi: '“Ta dẫn ngươi tới hang vì đã nhận tiền, không phải vì nghĩa hiệp. Nhưng nếu thứ kia nuốt lời hứa, thì khoản nợ này ta cũng muốn tự tay đòi.”', en: '“I lead you to the cave because I was paid, not from virtue. But if that thing eats promises, I want to collect this debt myself.”' }
  }
  if (npcId === 'n_storyteller_ngo' && flagTrue(state, 'story_ngo_companion')) {
    return { vi: '“Ta không đi đánh nhau. Ta đi để nhắc ngươi: một câu chuyện bị xé không tự lành chỉ vì ai đó thắng.”', en: '“I am not going to fight. I am going to remind you: a torn story does not heal just because someone wins.”' }
  }
  if (npcId === 'n_elder_meihua' && flagTrue(state, 'story_meihua_trusted')) {
    return { vi: '“Ngươi đã trả lại trâm trước khi đòi câu trả lời. Vậy ta sẽ đi cùng ngươi cho tới khi những cái tên này được gọi lại.”', en: '“You returned the pin before demanding answers. Then I will walk with you until these names are called again.”' }
  }
  if (npcId === 'n_elder_meihua' && flagTrue(state, 'story_meihua_betrayed')) {
    return { vi: '“Trâm vẫn chưa về tay ta, nhưng ít nhất ngươi còn quay lại. Hãy đừng bắt một người già phải trả giá thay cho sự thận trọng của ngươi.”', en: '“The pin has not returned to me, but at least you came back. Do not make an old woman pay for your caution.”' }
  }
  if (npcId === 'n_merchant_bao' && flagTrue(state, 'story_bao_has_map')) {
    return { vi: '“Bản đồ của ngươi bán không đắt. Cái giá thật là: bây giờ ta cũng sợ thứ ở cuối đường.”', en: '“Your map did not sell for much. The real price is that I now fear what waits at its end too.”' }
  }
  if (npcId === 'n_storyteller_ngo' && flagTrue(state, 'story_name_known')) {
    return { vi: '“Tên của ngươi không biến mất đâu. Nó bị ai đó gấp lại, giấu vào nếp giấy. Phế căn của ngươi nghe được nếp gấp ấy.”', en: '“Your name did not vanish. Someone folded it away, into the crease of a page. Your defective root can hear that crease.”' }
  }
  if (npcId === 'n_hermit_coc' && flagTrue(state, 'story_ha_bound')) {
    return { vi: '“Đừng gọi Hà là vũ khí chỉ vì cô ấy đồng ý giúp. Món nợ tự nguyện vẫn là món nợ.”', en: '“Do not call Ha a weapon just because she agreed to help. A voluntary debt is still a debt.”' }
  }
  const special: Record<string, { vi: string; en: string }> = {
    n_elder_meihua: scene === 'letter_at_dawn'
      ? { vi: '“Ta đã nhìn thấy nét chữ này một lần, trên bia mộ của ngươi. Đừng hỏi vì sao ta còn nhớ; hãy hỏi ai đã muốn cả làng quên.”', en: '“I saw this hand once, on your grave. Do not ask why I remember; ask who wanted the whole village to forget.”' }
      : { vi: '“Đừng biến nỗi sợ thành lời nói dối, con. Lời nói dối luôn đòi người khác trả giá.”', en: '“Do not turn fear into a lie, child. A lie always makes someone else pay.”' },
    n_storyteller_ngo: { vi: '“Ta không kể chuyện để ngươi tin ta. Ta kể để ngươi biết: người kể có thể sai, nhưng cái giá của im lặng luôn là thật.”', en: '“I do not tell tales to make you believe me. I tell them so you know: narrators can be wrong, but silence always costs someone.”' },
    n_merchant_bao: { vi: '“Ta mua được ngọc, bản đồ, cả lời thề. Nhưng ta chưa từng mua được một người ngủ yên. Ngươi chắc giá của mình chứ?”', en: '“I can buy jade, maps, even vows. I have never bought a night of peace. Are you sure of your price?”' },
    n_hermit_coc: { vi: '“Hà không cần một người hùng. Cô ấy cần một người chịu nghe hết câu chuyện, kể cả đoạn làm ngươi xấu hổ.”', en: '“Ha does not need a hero. She needs someone willing to hear the whole story, including the part that shames you.”' },
    n_rival_khoa: scene === 'mirror_choice'
      ? { vi: '“Ta ghét ngươi vì ngươi bỏ chạy, không phải vì linh căn của ngươi. Nếu ngươi dám nói thật, ta sẽ đứng đây nghe.”', en: '“I hate that you ran, not your crooked root. If you dare tell the truth, I will stand here and hear it.”' }
      : { vi: '“Ta không cần thắng ngươi. Ta cần biết chúng ta đang bảo vệ ai.”', en: '“I do not need to defeat you. I need to know whom we are protecting.”' },
    n_master_vo: { vi: '“Ta xóa ký ức vì sợ họ chết vì nó. Nếu ngươi mở gương, hãy chắc rằng ngươi không chỉ muốn được tha thứ.”', en: '“I erased memory because I feared it would kill them. If you open the mirror, be sure you do not only want forgiveness.”' },
  }
  const npc = getNpc(npcId)
  return special[npcId] ?? { vi: npc?.greetVi ?? npcId, en: npc?.greetEn ?? npcId }
}
