import jadeCharm from '../assets/art/items/jade-charm.png'
import cloudpiercerSpear from '../assets/art/items/cloudpiercer-spear.png'
import cloudwalkManual from '../assets/art/items/cloudwalk-manual.png'
import herbalBreathManual from '../assets/art/items/herbal-breath-manual.png'
import ironSkinManual from '../assets/art/items/iron-skin-manual.png'
import ironwoodSaber from '../assets/art/items/ironwood-saber.png'
import mistweaveVest from '../assets/art/items/mistweave-vest.png'
import oldManual from '../assets/art/items/old-manual.png'
import peakCleaverManual from '../assets/art/items/peak-cleaver-manual.png'
import pillHp from '../assets/art/items/pill-hp.png'
import pillQi from '../assets/art/items/pill-qi.png'
import riftStepScroll from '../assets/art/items/rift-step-scroll.png'
import spiritHerb from '../assets/art/items/spirit-herb.png'
import spiritRing from '../assets/art/items/spirit-ring.png'
import tatteredRobe from '../assets/art/items/tattered-robe.png'
import wardingTalisman from '../assets/art/items/warding-talisman.png'
import woodenStaff from '../assets/art/items/wooden-staff.png'
import basicStaffForm from '../assets/art/talents/basic-staff-form.png'
import cloudHeart from '../assets/art/talents/cloud-heart.png'
import cloudwalk from '../assets/art/talents/cloudwalk.png'
import crookedCirculation from '../assets/art/talents/crooked-circulation.png'
import fortunateFool from '../assets/art/talents/fortunate-fool.png'
import ironBones from '../assets/art/talents/iron-bones.png'
import ironSkin from '../assets/art/talents/iron-skin.png'
import herbalBreath from '../assets/art/talents/herbal-breath.png'
import merchantInstinct from '../assets/art/talents/merchant-instinct.png'
import mistListener from '../assets/art/talents/mist-listener.png'
import peakBreaker from '../assets/art/talents/peak-breaker.png'
import peakCleaver from '../assets/art/talents/peak-cleaver.png'
import riftGambler from '../assets/art/talents/rift-gambler.png'
import riftStep from '../assets/art/talents/rift-step.png'
import runeScar from '../assets/art/talents/rune-scar.png'
import tenaciousRoot from '../assets/art/talents/tenacious-root.png'
import wildHerbalist from '../assets/art/talents/wild-herbalist.png'

export type ItemArtId =
  | 'spirit_herb'
  | 'wooden_staff'
  | 'tattered_robe'
  | 'pill_hp'
  | 'pill_qi'
  | 'warding_talisman'
  | 'jade_charm'
  | 'old_manual'
  | 'rift_step_scroll'
  | 'ironwood_saber'
  | 'mistweave_vest'
  | 'spirit_ring'
  | 'cloudpiercer_spear'
  | 'herbal_breath_manual'
  | 'iron_skin_manual'
  | 'cloudwalk_manual'
  | 'peak_cleaver_manual'

export type TalentArtId =
  | 'tenacious_root'
  | 'iron_bones'
  | 'wild_herbalist'
  | 'fortunate_fool'
  | 'mist_listener'
  | 'merchant_instinct'
  | 'rune_scar'
  | 'rift_gambler'
  | 'cloud_heart'
  | 'peak_breaker'

export type TechniqueArtId =
  | 'basic_staff_form'
  | 'crooked_circulation'
  | 'rift_step'
  | 'herbal_breath'
  | 'iron_skin'
  | 'cloudwalk'
  | 'peak_cleaver'

/**
 * Visual content is keyed by the stable deterministic IDs used in saves. This
 * keeps art additions independent from the game reducer and content rules.
 */
export const ITEM_ART: Readonly<Record<ItemArtId, string>> = {
  spirit_herb: spiritHerb,
  wooden_staff: woodenStaff,
  tattered_robe: tatteredRobe,
  pill_hp: pillHp,
  pill_qi: pillQi,
  warding_talisman: wardingTalisman,
  jade_charm: jadeCharm,
  old_manual: oldManual,
  rift_step_scroll: riftStepScroll,
  ironwood_saber: ironwoodSaber,
  mistweave_vest: mistweaveVest,
  spirit_ring: spiritRing,
  cloudpiercer_spear: cloudpiercerSpear,
  herbal_breath_manual: herbalBreathManual,
  iron_skin_manual: ironSkinManual,
  cloudwalk_manual: cloudwalkManual,
  peak_cleaver_manual: peakCleaverManual,
}

export const TALENT_ART: Readonly<Record<TalentArtId, string>> = {
  tenacious_root: tenaciousRoot,
  iron_bones: ironBones,
  wild_herbalist: wildHerbalist,
  fortunate_fool: fortunateFool,
  mist_listener: mistListener,
  merchant_instinct: merchantInstinct,
  rune_scar: runeScar,
  rift_gambler: riftGambler,
  cloud_heart: cloudHeart,
  peak_breaker: peakBreaker,
}

export const TECHNIQUE_ART: Readonly<Record<TechniqueArtId, string>> = {
  basic_staff_form: basicStaffForm,
  crooked_circulation: crookedCirculation,
  rift_step: riftStep,
  herbal_breath: herbalBreath,
  iron_skin: ironSkin,
  cloudwalk,
  peak_cleaver: peakCleaver,
}

export function itemArtFor(itemId: string): string | undefined {
  return ITEM_ART[itemId as ItemArtId]
}

export function talentArtFor(talentId: string): string | undefined {
  return TALENT_ART[talentId as TalentArtId]
}

export function techniqueArtFor(techniqueId: string): string | undefined {
  return TECHNIQUE_ART[techniqueId as TechniqueArtId]
}
