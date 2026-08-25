import jadeCharm from '../assets/art/items/jade-charm.png'
import oldManual from '../assets/art/items/old-manual.png'
import pillHp from '../assets/art/items/pill-hp.png'
import pillQi from '../assets/art/items/pill-qi.png'
import riftStepScroll from '../assets/art/items/rift-step-scroll.png'
import spiritHerb from '../assets/art/items/spirit-herb.png'
import tatteredRobe from '../assets/art/items/tattered-robe.png'
import wardingTalisman from '../assets/art/items/warding-talisman.png'
import woodenStaff from '../assets/art/items/wooden-staff.png'
import basicStaffForm from '../assets/art/talents/basic-staff-form.png'
import crookedCirculation from '../assets/art/talents/crooked-circulation.png'
import fortunateFool from '../assets/art/talents/fortunate-fool.png'
import ironBones from '../assets/art/talents/iron-bones.png'
import riftStep from '../assets/art/talents/rift-step.png'
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

export type TalentArtId = 'tenacious_root' | 'iron_bones' | 'wild_herbalist' | 'fortunate_fool'

export type TechniqueArtId = 'basic_staff_form' | 'crooked_circulation' | 'rift_step'

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
}

export const TALENT_ART: Readonly<Record<TalentArtId, string>> = {
  tenacious_root: tenaciousRoot,
  iron_bones: ironBones,
  wild_herbalist: wildHerbalist,
  fortunate_fool: fortunateFool,
}

export const TECHNIQUE_ART: Readonly<Record<TechniqueArtId, string>> = {
  basic_staff_form: basicStaffForm,
  crooked_circulation: crookedCirculation,
  rift_step: riftStep,
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

