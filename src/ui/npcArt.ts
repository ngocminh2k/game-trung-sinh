import npcEnsemble from '../assets/art/npc-ensemble.png'
import cookPhung from '../assets/art/npcs/cook-phung.png'
import craneSpirit from '../assets/art/npcs/crane-spirit.png'
import elderMeihua from '../assets/art/npcs/elder-meihua.png'
import exileBa from '../assets/art/npcs/exile-ba.png'
import exorcistDiem from '../assets/art/npcs/exorcist-diem.png'
import farmerTu from '../assets/art/npcs/farmer-tu.png'
import fortuneLien from '../assets/art/npcs/fortune-lien.png'
import gathererHue from '../assets/art/npcs/gatherer-hue.png'
import guardTruong from '../assets/art/npcs/guard-truong.png'
import herbalistDan from '../assets/art/npcs/herbalist-dan.png'
import hermitCoc from '../assets/art/npcs/hermit-coc.png'
import hunterSon from '../assets/art/npcs/hunter-son.png'
import innkeeperHanh from '../assets/art/npcs/innkeeper-hanh.png'
import keeperAnh from '../assets/art/npcs/keeper-anh.png'
import lostSoulHa from '../assets/art/npcs/lost-soul-ha.png'
import masterVo from '../assets/art/npcs/master-vo.png'
import merchantBao from '../assets/art/npcs/merchant-bao.png'
import monkThien from '../assets/art/npcs/monk-thien.png'
import oxCartHien from '../assets/art/npcs/ox-cart-hien.png'
import pedlarQuyen from '../assets/art/npcs/pedlar-quyen.png'
import rivalKhoa from '../assets/art/npcs/rival-khoa.png'
import scholarMinh from '../assets/art/npcs/scholar-minh.png'
import seniorLan from '../assets/art/npcs/senior-lan.png'
import smithDuc from '../assets/art/npcs/smith-duc.png'
import storytellerNgo from '../assets/art/npcs/storyteller-ngo.png'
import tailorYen from '../assets/art/npcs/tailor-yen.png'
import teaGrannyMa from '../assets/art/npcs/tea-granny-ma.png'
import alchemistSam from '../assets/art/npcs/alchemist-sam.png'
import woodcutterBong from '../assets/art/npcs/woodcutter-bong.png'
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
  n_smith_duc: smithDuc,
  n_scholar_minh: scholarMinh,
  n_pedlar_quyen: pedlarQuyen,
  n_tea_ma: teaGrannyMa,
  n_tailor_yen: tailorYen,
  n_master_vo: masterVo,
  n_senior_lan: seniorLan,
  n_keeper_anh: keeperAnh,
  n_monk_thien: monkThien,
  n_rival_khoa: rivalKhoa,
  n_alchemist_sam: alchemistSam,
  n_herbalist_dan: herbalistDan,
  n_gatherer_hue: gathererHue,
  n_ox_cart_hien: oxCartHien,
  n_hunter_son: hunterSon,
  n_woodcutter_bong: woodcutterBong,
  n_hermit_coc: hermitCoc,
  n_lost_soul_ha: lostSoulHa,
  n_exile_ba: exileBa,
  n_exorcist_diem: exorcistDiem,
  n_crane_spirit: craneSpirit,
}

export function npcPortraitFor(npcId: string): string {
  return INDIVIDUAL_NPC_PORTRAITS[npcId] ?? npcEnsemble
}

export function hasIndividualNpcPortrait(npcId: string): boolean {
  return npcId in INDIVIDUAL_NPC_PORTRAITS
}
