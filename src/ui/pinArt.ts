// Map game ids → 128×128 pin icon PNG (generated AI, ink-wash on transparent bg).
// All imports are explicit so Vite bundles only what is referenced.

import { NPCS } from '../content'
import type { MapNodeDef } from '../engine/content-types'

import pinNpcAlchemistSam from '../assets/art/pins/npc/alchemist-sam.png'
import pinNpcArchivistThu from '../assets/art/pins/npc/archivist-thu.png'
import pinNpcAshPriestCuu from '../assets/art/pins/npc/ash-priest-cuu.png'
import pinNpcAuctioneerHoan from '../assets/art/pins/npc/auctioneer-hoan.png'
import pinNpcBankerTin from '../assets/art/pins/npc/banker-tin.png'
import pinNpcBeastSingerMy from '../assets/art/pins/npc/beast-singer-my.png'
import pinNpcBeastTamerLe from '../assets/art/pins/npc/beast-tamer-le.png'
import pinNpcBeekeeperOanh from '../assets/art/pins/npc/beekeeper-oanh.png'
import pinNpcBrokerTieu from '../assets/art/pins/npc/broker-tieu.png'
import pinNpcCaravanDuong from '../assets/art/pins/npc/caravan-duong.png'
import pinNpcCookPhung from '../assets/art/pins/npc/cook-phung.png'
import pinNpcCraneSpirit from '../assets/art/pins/npc/crane-spirit.png'
import pinNpcDiceMasterLuc from '../assets/art/pins/npc/dice-master-luc.png'
import pinNpcDuneGuideSa from '../assets/art/pins/npc/dune-guide-sa.png'
import pinNpcElderMeihua from '../assets/art/pins/npc/elder-meihua.png'
import pinNpcExileBa from '../assets/art/pins/npc/exile-ba.png'
import pinNpcExorcistDiem from '../assets/art/pins/npc/exorcist-diem.png'
import pinNpcFarmerTu from '../assets/art/pins/npc/farmer-tu.png'
import pinNpcFerrymanCau from '../assets/art/pins/npc/ferryman-cau.png'
import pinNpcFisherYen from '../assets/art/pins/npc/fisher-yen.png'
import pinNpcFortuneLien from '../assets/art/pins/npc/fortune-lien.png'
import pinNpcGardenerThin from '../assets/art/pins/npc/gardener-thin.png'
import pinNpcGardenerVien from '../assets/art/pins/npc/gardener-vien.png'
import pinNpcGathererHue from '../assets/art/pins/npc/gatherer-hue.png'
import pinNpcGuardTruong from '../assets/art/pins/npc/guard-truong.png'
import pinNpcHerbalistDan from '../assets/art/pins/npc/herbalist-dan.png'
import pinNpcHerbalistLan from '../assets/art/pins/npc/herbalist-lan.png'
import pinNpcHermitCoc from '../assets/art/pins/npc/hermit-coc.png'
import pinNpcHunterSon from '../assets/art/pins/npc/hunter-son.png'
import pinNpcIceHermitBang from '../assets/art/pins/npc/ice-hermit-bang.png'
import pinNpcInnkeeperHanh from '../assets/art/pins/npc/innkeeper-hanh.png'
import pinNpcJudgeQuang from '../assets/art/pins/npc/judge-quang.png'
import pinNpcKeeperAnh from '../assets/art/pins/npc/keeper-anh.png'
import pinNpcKidXiaobao from '../assets/art/pins/npc/kid-xiaobao.png'
import pinNpcLakeKeeperTrang from '../assets/art/pins/npc/lake-keeper-trang.png'
import pinNpcLostSoulHa from '../assets/art/pins/npc/lost-soul-ha.png'
import pinNpcMapSellerMan from '../assets/art/pins/npc/map-seller-man.png'
import pinNpcMasterVo from '../assets/art/pins/npc/master-vo.png'
import pinNpcMerchantBao from '../assets/art/pins/npc/merchant-bao.png'
import pinNpcMonkNhu from '../assets/art/pins/npc/monk-nhu.png'
import pinNpcMonkThien from '../assets/art/pins/npc/monk-thien.png'
import pinNpcNameCollectorTra from '../assets/art/pins/npc/name-collector-tra.png'
import pinNpcOxCartHien from '../assets/art/pins/npc/ox-cart-hien.png'
import pinNpcPavilionDiscipleAnh from '../assets/art/pins/npc/pavilion-disciple-anh.png'
import pinNpcPedlarQuyen from '../assets/art/pins/npc/pedlar-quyen.png'
import pinNpcRelicHunterBach from '../assets/art/pins/npc/relic-hunter-bach.png'
import pinNpcRivalKhoa from '../assets/art/pins/npc/rival-khoa.png'
import pinNpcRogueCultivatorNhat from '../assets/art/pins/npc/rogue-cultivator-nhat.png'
import pinNpcScholarMinh from '../assets/art/pins/npc/scholar-minh.png'
import pinNpcSeniorLan from '../assets/art/pins/npc/senior-lan.png'
import pinNpcSmithDuc from '../assets/art/pins/npc/smith-duc.png'
import pinNpcSnowGuardHan from '../assets/art/pins/npc/snow-guard-han.png'
import pinNpcStorytellerNgo from '../assets/art/pins/npc/storyteller-ngo.png'
import pinNpcSwordsmanDiep from '../assets/art/pins/npc/swordsman-diep.png'
import pinNpcTailorYen from '../assets/art/pins/npc/tailor-yen.png'
import pinNpcTamerHac from '../assets/art/pins/npc/tamer-hac.png'
import pinNpcTeaMa from '../assets/art/pins/npc/tea-ma.png'
import pinNpcWanderingBladePhong from '../assets/art/pins/npc/wandering-blade-phong.png'
import pinNpcWardCarverKhue from '../assets/art/pins/npc/ward-carver-khue.png'
import pinNpcWoodcutterBong from '../assets/art/pins/npc/woodcutter-bong.png'

import pinEventArena from '../assets/art/pins/event/arena.png'
import pinEventAuctionStall from '../assets/art/pins/event/auction-stall.png'
import pinEventBambooRampart from '../assets/art/pins/event/bamboo-rampart.png'
import pinEventBrokenStele from '../assets/art/pins/event/broken-stele.png'
import pinEventCaravanTeahouse from '../assets/art/pins/event/caravan-teahouse.png'
import pinEventCloudLibrary from '../assets/art/pins/event/cloud-library.png'
import pinEventCloudNest from '../assets/art/pins/event/cloud-nest.png'
import pinEventDryOasis from '../assets/art/pins/event/dry-oasis.png'
import pinEventFogCrossroads from '../assets/art/pins/event/fog-crossroads.png'
import pinEventFortuneWheel from '../assets/art/pins/event/fortune-wheel.png'
import pinEventHerbGarden from '../assets/art/pins/event/herb-garden.png'
import pinEventHerbTerrace from '../assets/art/pins/event/herb-terrace.png'
import pinEventIceMirror from '../assets/art/pins/event/ice-mirror.png'
import pinEventLotusPond from '../assets/art/pins/event/lotus-pond.png'
import pinEventMeditationWall from '../assets/art/pins/event/meditation-wall.png'
import pinEventMoonWater from '../assets/art/pins/event/moon-water.png'
import pinEventNamelessStele from '../assets/art/pins/event/nameless-stele.png'
import pinEventOldHouse from '../assets/art/pins/event/old-house.png'
import pinEventTeaHouse from '../assets/art/pins/event/tea-house.png'
import pinEventTreasurePavilion from '../assets/art/pins/event/treasure-pavilion.png'
import pinEventVillageWell from '../assets/art/pins/event/village-well.png'
import pinEventWindBell from '../assets/art/pins/event/wind-bell.png'
import pinEventWindCliff from '../assets/art/pins/event/wind-cliff.png'

import pinDangerBeeNest from '../assets/art/pins/danger/bee-nest.png'
import pinDangerClawRock from '../assets/art/pins/danger/claw-rock.png'
import pinDangerCrackedSeal from '../assets/art/pins/danger/cracked-seal.png'
import pinDangerHiveHollow from '../assets/art/pins/danger/hive-hollow.png'
import pinDangerIceFissure from '../assets/art/pins/danger/ice-fissure.png'
import pinDangerRiftCore from '../assets/art/pins/danger/rift-core.png'
import pinDangerBoneAltar from '../assets/art/pins/danger/bone-altar.png'
import pinDangerStormEye from '../assets/art/pins/danger/storm-eye.png'
import pinDangerWolfTracks from '../assets/art/pins/danger/wolf-tracks.png'

import pinExitAzurePavilion from '../assets/art/pins/exit/azure-pavilion.png'
import pinExitBlackwindDunes from '../assets/art/pins/exit/blackwind-dunes.png'
import pinExitBoneAshRuins from '../assets/art/pins/exit/bone-ash-ruins.png'
import pinExitCloudPeak from '../assets/art/pins/exit/cloud-peak.png'
import pinExitCursedRift from '../assets/art/pins/exit/cursed-rift.png'
import pinExitFrozenPeak from '../assets/art/pins/exit/frozen-peak.png'
import pinExitHerbField from '../assets/art/pins/exit/herb-field.png'
import pinExitMarket from '../assets/art/pins/exit/market.png'
import pinExitMistyForest from '../assets/art/pins/exit/misty-forest.png'
import pinExitMoonLake from '../assets/art/pins/exit/moon-lake.png'
import pinExitSealedCave from '../assets/art/pins/exit/sealed-cave.png'
import pinExitSect from '../assets/art/pins/exit/sect.png'
import pinExitSpiritBeastRidge from '../assets/art/pins/exit/spirit-beast-ridge.png'
import pinExitThousandHerbsValley from '../assets/art/pins/exit/thousand-herbs-valley.png'
import pinExitVillage from '../assets/art/pins/exit/village.png'
import pinExitWanderingMarket from '../assets/art/pins/exit/wandering-market.png'

const NPC_PINS: Readonly<Record<string, string>> = {
  n_elder_meihua: pinNpcElderMeihua,
  n_storyteller_ngo: pinNpcStorytellerNgo,
  n_merchant_bao: pinNpcMerchantBao,
  n_hermit_coc: pinNpcHermitCoc,
  n_rival_khoa: pinNpcRivalKhoa,
  n_master_vo: pinNpcMasterVo,
  n_lost_soul_ha: pinNpcLostSoulHa,
  n_innkeeper_hanh: pinNpcInnkeeperHanh,
  n_alchemist_sam: pinNpcAlchemistSam,
  n_hunter_son: pinNpcHunterSon,
  n_guard_truong: pinNpcGuardTruong,
  n_kid_xiaobao: pinNpcKidXiaobao,
  n_farmer_tu: pinNpcFarmerTu,
  n_fortune_lien: pinNpcFortuneLien,
  n_cook_phung: pinNpcCookPhung,
  n_smith_duc: pinNpcSmithDuc,
  n_scholar_minh: pinNpcScholarMinh,
  n_pedlar_quyen: pinNpcPedlarQuyen,
  n_tea_ma: pinNpcTeaMa,
  n_tailor_yen: pinNpcTailorYen,
  n_senior_lan: pinNpcSeniorLan,
  n_keeper_anh: pinNpcKeeperAnh,
  n_monk_thien: pinNpcMonkThien,
  n_herbalist_dan: pinNpcHerbalistDan,
  n_gatherer_hue: pinNpcGathererHue,
  n_ox_cart_hien: pinNpcOxCartHien,
  n_woodcutter_bong: pinNpcWoodcutterBong,
  n_exile_ba: pinNpcExileBa,
  n_exorcist_diem: pinNpcExorcistDiem,
  n_crane_spirit: pinNpcCraneSpirit,
  n_herbalist_lan: pinNpcHerbalistLan,
  n_swordsman_diep: pinNpcSwordsmanDiep,
  n_monk_nhu: pinNpcMonkNhu,
  n_broker_tieu: pinNpcBrokerTieu,
  n_fisher_yen: pinNpcFisherYen,
  n_relic_hunter_bach: pinNpcRelicHunterBach,
  n_beast_tamer_le: pinNpcBeastTamerLe,
  n_pavilion_disciple_anh: pinNpcPavilionDiscipleAnh,
  n_wandering_blade_phong: pinNpcWanderingBladePhong,
  n_rogue_cultivator_nhat: pinNpcRogueCultivatorNhat,
  n_gardener_thin: pinNpcGardenerThin,
  n_auctioneer_hoan: pinNpcAuctioneerHoan,
  n_banker_tin: pinNpcBankerTin,
  n_gardener_vien: pinNpcGardenerVien,
  n_beekeeper_oanh: pinNpcBeekeeperOanh,
  n_archivist_thu: pinNpcArchivistThu,
  n_judge_quang: pinNpcJudgeQuang,
  n_tamer_hac: pinNpcTamerHac,
  n_beast_singer_my: pinNpcBeastSingerMy,
  n_ash_priest_cuu: pinNpcAshPriestCuu,
  n_name_collector_tra: pinNpcNameCollectorTra,
  n_ice_hermit_bang: pinNpcIceHermitBang,
  n_snow_guard_han: pinNpcSnowGuardHan,
  n_caravan_duong: pinNpcCaravanDuong,
  n_dune_guide_sa: pinNpcDuneGuideSa,
  n_lake_keeper_trang: pinNpcLakeKeeperTrang,
  n_ferryman_cau: pinNpcFerrymanCau,
  n_dice_master_luc: pinNpcDiceMasterLuc,
  n_map_seller_man: pinNpcMapSellerMan,
  n_ward_carver_khue: pinNpcWardCarverKhue,
}

/** 20 NPC pin files (brief mục #24–30, #50–60) đang chờ đợt sinh AI tiếp theo
 *  sau lỗi quota 429 — bản hiện trên đĩa là SVG thay thế đã bị kiểm định phủ
 *  quyết (DEAD_ENDS.md #2). Map render glyph fallback cho tới khi AI regen xong. */
export const QUOTA_PENDING_NPCS: ReadonlySet<string> = new Set([
  'n_herbalist_dan', 'n_gatherer_hue', 'n_ox_cart_hien', 'n_woodcutter_bong',
  'n_exile_ba', 'n_exorcist_diem', 'n_crane_spirit',
  'n_ash_priest_cuu', 'n_name_collector_tra', 'n_ice_hermit_bang', 'n_snow_guard_han',
  'n_caravan_duong', 'n_dune_guide_sa', 'n_lake_keeper_trang', 'n_ferryman_cau',
  'n_dice_master_luc', 'n_map_seller_man', 'n_ward_carver_khue',
])

export function npcPinArt(npcId: string): string | undefined {
  if (QUOTA_PENDING_NPCS.has(npcId)) return undefined
  return NPC_PINS[npcId]
}

/** Every NPC id in content has a pin art file. Used by the showcase audit. */
export function isEveryNpcPinned(): boolean {
  return NPCS.every((n) => NPC_PINS[n.id] !== undefined)
}

/** Key = MapNodeDef.id (xem src/content/locations.ts), value = icon file. */
export const EVENT_PINS: Readonly<Record<string, string>> = {
  'village-bamboo': pinEventBambooRampart,
  'village-home': pinEventOldHouse,
  'village-well': pinEventVillageWell,
  'market-lottery': pinEventFortuneWheel,
  'market-teahouse': pinEventTeaHouse,
  'sect-training': pinEventArena,
  'sect-storehouse': pinEventTreasurePavilion,
  'sect-meditation': pinEventMeditationWall,
  'herb-garden': pinEventHerbTerrace,
  'forest-crossroads': pinEventFogCrossroads,
  'cave-tablet': pinEventNamelessStele,
  'peak-wind': pinEventWindCliff,
  'herbs-dew-garden': pinEventHerbGarden,
  'dunes-oasis': pinEventDryOasis,
  'frozen-mirror': pinEventIceMirror,
  'wandering-auction': pinEventAuctionStall,
  'wandering-tea': pinEventCaravanTeahouse,
  'moon-reflection': pinEventMoonWater,
  'moon-lotus': pinEventLotusPond,
  'ruins-inscription': pinEventBrokenStele,
  'ridge-feather-nest': pinEventCloudNest,
  'azure-library': pinEventCloudLibrary,
  'azure-bell': pinEventWindBell,
}

/** Match a `MapNodeDef` (event/danger) to its pin icon by node id slug. */
export function nodePinArt(node: MapNodeDef): string | undefined {
  if (node.kind === 'danger') return DANGER_PINS[node.id]
  return EVENT_PINS[node.id]
}

export const DANGER_PINS: Readonly<Record<string, string>> = {
  'herb-hive': pinDangerBeeNest,
  'forest-wolf': pinDangerWolfTracks,
  'cave-seal': pinDangerCrackedSeal,
  'rift-heart': pinDangerRiftCore,
  'herbs-bee-hollow': pinDangerHiveHollow,
  'dunes-blackwind': pinDangerStormEye,
  'frozen-crevasse': pinDangerIceFissure,
  'ruins-altar': pinDangerBoneAltar,
  'ridge-claw-stone': pinDangerClawRock,
}

/** Key = exitTo location id (underscore form), value = icon file. */
export const EXIT_PINS: Readonly<Record<string, string>> = {
  'azure_pavilion': pinExitAzurePavilion,
  'blackwind_dunes': pinExitBlackwindDunes,
  'bone_ash_ruins': pinExitBoneAshRuins,
  'cloud_peak': pinExitCloudPeak,
  'cursed_rift': pinExitCursedRift,
  'frozen_peak': pinExitFrozenPeak,
  'herb_field': pinExitHerbField,
  'market': pinExitMarket,
  'misty_forest': pinExitMistyForest,
  'moon_lake': pinExitMoonLake,
  'sealed_cave': pinExitSealedCave,
  'sect': pinExitSect,
  'spirit_beast_ridge': pinExitSpiritBeastRidge,
  'thousand_herbs_valley': pinExitThousandHerbsValley,
  'village': pinExitVillage,
  'wandering_market': pinExitWanderingMarket,
}

export function exitPinArt(destinationId: string): string | undefined {
  return EXIT_PINS[destinationId]
}
