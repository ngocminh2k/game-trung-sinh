import npcEnsemble from '../assets/art/npc-ensemble.webp'
import alchemistSam from '../assets/art/npcs/alchemist-sam.webp'
import archivistThu from '../assets/art/npcs/archivist-thu.webp'
import ashPriestCuu from '../assets/art/npcs/ash-priest-cuu.webp'
import auctioneerHoan from '../assets/art/npcs/auctioneer-hoan.webp'
import bankerTin from '../assets/art/npcs/banker-tin.webp'
import beastSingerMy from '../assets/art/npcs/beast-singer-my.webp'
import beastTamerLe from '../assets/art/npcs/beast-tamer-le.webp'
import beekeeperOanh from '../assets/art/npcs/beekeeper-oanh.webp'
import brokerTieu from '../assets/art/npcs/broker-tieu.webp'
import caravanDuong from '../assets/art/npcs/caravan-duong.webp'
import cookPhung from '../assets/art/npcs/cook-phung.webp'
import craneSpirit from '../assets/art/npcs/crane-spirit.webp'
import diceMasterLuc from '../assets/art/npcs/dice-master-luc.webp'
import duneGuideSa from '../assets/art/npcs/dune-guide-sa.webp'
import elderMeihua from '../assets/art/npcs/elder-meihua.webp'
import exileBa from '../assets/art/npcs/exile-ba.webp'
import exorcistDiem from '../assets/art/npcs/exorcist-diem.webp'
import farmerTu from '../assets/art/npcs/farmer-tu.webp'
import ferrymanCau from '../assets/art/npcs/ferryman-cau.webp'
import fisherYen from '../assets/art/npcs/fisher-yen.webp'
import fortuneLien from '../assets/art/npcs/fortune-lien.webp'
import gardenerThin from '../assets/art/npcs/gardener-thin.webp'
import gardenerVien from '../assets/art/npcs/gardener-vien.webp'
import gathererHue from '../assets/art/npcs/gatherer-hue.webp'
import guardTruong from '../assets/art/npcs/guard-truong.webp'
import herbalistDan from '../assets/art/npcs/herbalist-dan.webp'
import herbalistLan from '../assets/art/npcs/herbalist-lan.webp'
import hermitCoc from '../assets/art/npcs/hermit-coc.webp'
import hunterSon from '../assets/art/npcs/hunter-son.webp'
import iceHermitBang from '../assets/art/npcs/ice-hermit-bang.webp'
import innkeeperHanh from '../assets/art/npcs/innkeeper-hanh.webp'
import judgeQuang from '../assets/art/npcs/judge-quang.webp'
import keeperAnh from '../assets/art/npcs/keeper-anh.webp'
import lakeKeeperTrang from '../assets/art/npcs/lake-keeper-trang.webp'
import lostSoulHa from '../assets/art/npcs/lost-soul-ha.webp'
import mapSellerMan from '../assets/art/npcs/map-seller-man.webp'
import masterVo from '../assets/art/npcs/master-vo.webp'
import merchantBao from '../assets/art/npcs/merchant-bao.webp'
import monkNhu from '../assets/art/npcs/monk-nhu.webp'
import monkThien from '../assets/art/npcs/monk-thien.webp'
import nameCollectorTra from '../assets/art/npcs/name-collector-tra.webp'
import oxCartHien from '../assets/art/npcs/ox-cart-hien.webp'
import pavilionDiscipleAnh from '../assets/art/npcs/pavilion-disciple-anh.webp'
import pedlarQuyen from '../assets/art/npcs/pedlar-quyen.webp'
import relicHunterBach from '../assets/art/npcs/relic-hunter-bach.webp'
import rivalKhoa from '../assets/art/npcs/rival-khoa.webp'
import rogueCultivatorNhat from '../assets/art/npcs/rogue-cultivator-nhat.webp'
import scholarMinh from '../assets/art/npcs/scholar-minh.webp'
import seniorLan from '../assets/art/npcs/senior-lan.webp'
import smithDuc from '../assets/art/npcs/smith-duc.webp'
import snowGuardHan from '../assets/art/npcs/snow-guard-han.webp'
import storytellerNgo from '../assets/art/npcs/storyteller-ngo.webp'
import swordsmanDiep from '../assets/art/npcs/swordsman-diep.webp'
import tailorYen from '../assets/art/npcs/tailor-yen.webp'
import tamerHac from '../assets/art/npcs/tamer-hac.webp'
import teaGrannyMa from '../assets/art/npcs/tea-granny-ma.webp'
import wanderingBladePhong from '../assets/art/npcs/wandering-blade-phong.webp'
import wardCarverKhue from '../assets/art/npcs/ward-carver-khue.webp'
import woodcutterBong from '../assets/art/npcs/woodcutter-bong.webp'
import xiaobao from '../assets/art/npcs/xiaobao.webp'

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
