// Tab, attribute, and HUD bar icons (128x128 PNG, ink-wash on transparent bg).

import type { AttributeName } from '../engine'
import type { LeftTab } from './LeftRailTabContent'

import tabPeople from '../assets/art/tabs/people.png'
import tabVital from '../assets/art/tabs/vital.png'
import tabItems from '../assets/art/tabs/items.png'
import tabMarket from '../assets/art/tabs/market.png'
import tabPath from '../assets/art/tabs/path.png'
import tabSystem from '../assets/art/tabs/system.png'

import attrCharm from '../assets/art/attrs/charm.png'
import attrMind from '../assets/art/attrs/mind.png'
import attrBody from '../assets/art/attrs/body.png'
import attrLuck from '../assets/art/attrs/luck.png'

import hudHp from '../assets/art/hud/hp.png'
import hudQi from '../assets/art/hud/qi.png'
import hudCultivation from '../assets/art/hud/cultivation.png'

const TAB_ICONS: Readonly<Record<LeftTab, string>> = {
  people: tabPeople,
  vital: tabVital,
  items: tabItems,
  market: tabMarket,
  path: tabPath,
  system: tabSystem,
}

export function tabIconArt(tab: LeftTab): string | undefined {
  return TAB_ICONS[tab]
}

const ATTR_ICONS: Readonly<Record<AttributeName, string>> = {
  charm: attrCharm,
  mind: attrMind,
  body: attrBody,
  luck: attrLuck,
}

export function attrIconArt(attr: AttributeName): string | undefined {
  return ATTR_ICONS[attr]
}

export const HUD_ICONS = {
  hp: hudHp,
  qi: hudQi,
  cultivation: hudCultivation,
} as const
