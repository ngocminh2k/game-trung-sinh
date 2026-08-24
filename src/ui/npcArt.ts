import npcEnsemble from '../assets/art/npc-ensemble.png'
import cookPhung from '../assets/art/npcs/cook-phung.png'
import elderMeihua from '../assets/art/npcs/elder-meihua.png'
import farmerTu from '../assets/art/npcs/farmer-tu.png'
import fortuneLien from '../assets/art/npcs/fortune-lien.png'
import guardTruong from '../assets/art/npcs/guard-truong.png'
import innkeeperHanh from '../assets/art/npcs/innkeeper-hanh.png'
import merchantBao from '../assets/art/npcs/merchant-bao.png'
import storytellerNgo from '../assets/art/npcs/storyteller-ngo.png'
import xiaobao from '../assets/art/npcs/xiaobao.png'

/**
 * The manifest is deliberately keyed by game id, never by display name.  New
 * NPC art can be generated independently and registered here without touching
 * game rules, saves, or dialogue content.
 */
const INDIVIDUAL_NPC_PORTRAITS: Record<string, string> = {
  n_elder_meihua: elderMeihua,
  n_guard_truong: guardTruong,
  n_kid_xiaobao: xiaobao,
  n_innkeeper_hanh: innkeeperHanh,
  n_farmer_tu: farmerTu,
  n_storyteller_ngo: storytellerNgo,
  n_merchant_bao: merchantBao,
  n_fortune_lien: fortuneLien,
  n_cook_phung: cookPhung,
}

export function npcPortraitFor(npcId: string): string {
  return INDIVIDUAL_NPC_PORTRAITS[npcId] ?? npcEnsemble
}

export function hasIndividualNpcPortrait(npcId: string): boolean {
  return npcId in INDIVIDUAL_NPC_PORTRAITS
}
