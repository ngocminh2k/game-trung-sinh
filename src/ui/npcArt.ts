import npcEnsemble from '../assets/art/npc-ensemble.png'
import alchemistSam from '../assets/art/npcs/alchemist-sam.png'
import archivistThu from '../assets/art/npcs/archivist-thu.png'
import ashPriestCuu from '../assets/art/npcs/ash-priest-cuu.png'
import auctioneerHoan from '../assets/art/npcs/auctioneer-hoan.png'
import bankerTin from '../assets/art/npcs/banker-tin.png'
import beastSingerMy from '../assets/art/npcs/beast-singer-my.png'
import beastTamerLe from '../assets/art/npcs/beast-tamer-le.png'
import beekeeperOanh from '../assets/art/npcs/beekeeper-oanh.png'
import brokerTieu from '../assets/art/npcs/broker-tieu.png'
import caravanDuong from '../assets/art/npcs/caravan-duong.png'
import cookPhung from '../assets/art/npcs/cook-phung.png'
import craneSpirit from '../assets/art/npcs/crane-spirit.png'
import diceMasterLuc from '../assets/art/npcs/dice-master-luc.png'
import duneGuideSa from '../assets/art/npcs/dune-guide-sa.png'
import elderMeihua from '../assets/art/npcs/elder-meihua.png'
import exileBa from '../assets/art/npcs/exile-ba.png'
import exorcistDiem from '../assets/art/npcs/exorcist-diem.png'
import farmerTu from '../assets/art/npcs/farmer-tu.png'
import ferrymanCau from '../assets/art/npcs/ferryman-cau.png'
import fisherYen from '../assets/art/npcs/fisher-yen.png'
import fortuneLien from '../assets/art/npcs/fortune-lien.png'
import gardenerThin from '../assets/art/npcs/gardener-thin.png'
import gardenerVien from '../assets/art/npcs/gardener-vien.png'
import gathererHue from '../assets/art/npcs/gatherer-hue.png'
import guardTruong from '../assets/art/npcs/guard-truong.png'
import herbalistDan from '../assets/art/npcs/herbalist-dan.png'
import herbalistLan from '../assets/art/npcs/herbalist-lan.png'
import hermitCoc from '../assets/art/npcs/hermit-coc.png'
import hunterSon from '../assets/art/npcs/hunter-son.png'
import iceHermitBang from '../assets/art/npcs/ice-hermit-bang.png'
import innkeeperHanh from '../assets/art/npcs/innkeeper-hanh.png'
import judgeQuang from '../assets/art/npcs/judge-quang.png'
import keeperAnh from '../assets/art/npcs/keeper-anh.png'
import lakeKeeperTrang from '../assets/art/npcs/lake-keeper-trang.png'
import lostSoulHa from '../assets/art/npcs/lost-soul-ha.png'
import mapSellerMan from '../assets/art/npcs/map-seller-man.png'
import masterVo from '../assets/art/npcs/master-vo.png'
import merchantBao from '../assets/art/npcs/merchant-bao.png'
import monkNhu from '../assets/art/npcs/monk-nhu.png'
import monkThien from '../assets/art/npcs/monk-thien.png'
import nameCollectorTra from '../assets/art/npcs/name-collector-tra.png'
import oxCartHien from '../assets/art/npcs/ox-cart-hien.png'
import pavilionDiscipleAnh from '../assets/art/npcs/pavilion-disciple-anh.png'
import pedlarQuyen from '../assets/art/npcs/pedlar-quyen.png'
import relicHunterBach from '../assets/art/npcs/relic-hunter-bach.png'
import rivalKhoa from '../assets/art/npcs/rival-khoa.png'
import rogueCultivatorNhat from '../assets/art/npcs/rogue-cultivator-nhat.png'
import scholarMinh from '../assets/art/npcs/scholar-minh.png'
import seniorLan from '../assets/art/npcs/senior-lan.png'
import smithDuc from '../assets/art/npcs/smith-duc.png'
import snowGuardHan from '../assets/art/npcs/snow-guard-han.png'
import storytellerNgo from '../assets/art/npcs/storyteller-ngo.png'
import swordsmanDiep from '../assets/art/npcs/swordsman-diep.png'
import tailorYen from '../assets/art/npcs/tailor-yen.png'
import tamerHac from '../assets/art/npcs/tamer-hac.png'
import teaGrannyMa from '../assets/art/npcs/tea-granny-ma.png'
import wanderingBladePhong from '../assets/art/npcs/wandering-blade-phong.png'
import wardCarverKhue from '../assets/art/npcs/ward-carver-khue.png'
import woodcutterBong from '../assets/art/npcs/woodcutter-bong.png'
import xiaobao from '../assets/art/npcs/xiaobao.png'

/**
 * The manifest is deliberately keyed by game id, never by display name. New
 * NPC art can be generated independently and registered here without touching
 * game rules, saves, or dialogue content.
 */
export const INDIVIDUAL_NPC_PORTRAITS: Record<string, string> = {
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
  n_herbalist_lan: herbalistLan,
  n_swordsman_diep: swordsmanDiep,
  n_monk_nhu: monkNhu,
  n_broker_tieu: brokerTieu,
  n_fisher_yen: fisherYen,
  n_relic_hunter_bach: relicHunterBach,
  n_beast_tamer_le: beastTamerLe,
  n_pavilion_disciple_anh: pavilionDiscipleAnh,
  n_wandering_blade_phong: wanderingBladePhong,
  n_rogue_cultivator_nhat: rogueCultivatorNhat,
  n_gardener_thin: gardenerThin,
  n_auctioneer_hoan: auctioneerHoan,
  n_banker_tin: bankerTin,
  n_gardener_vien: gardenerVien,
  n_beekeeper_oanh: beekeeperOanh,
  n_archivist_thu: archivistThu,
  n_judge_quang: judgeQuang,
  n_tamer_hac: tamerHac,
  n_beast_singer_my: beastSingerMy,
  n_ash_priest_cuu: ashPriestCuu,
  n_name_collector_tra: nameCollectorTra,
  n_ice_hermit_bang: iceHermitBang,
  n_snow_guard_han: snowGuardHan,
  n_caravan_duong: caravanDuong,
  n_dune_guide_sa: duneGuideSa,
  n_lake_keeper_trang: lakeKeeperTrang,
  n_ferryman_cau: ferrymanCau,
  n_dice_master_luc: diceMasterLuc,
  n_map_seller_man: mapSellerMan,
  n_ward_carver_khue: wardCarverKhue,
}

export function npcPortraitFor(npcId: string): string {
  return INDIVIDUAL_NPC_PORTRAITS[npcId] ?? npcEnsemble
}

export function hasIndividualNpcPortrait(npcId: string): boolean {
  return npcId in INDIVIDUAL_NPC_PORTRAITS
}
