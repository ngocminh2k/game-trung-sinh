import type { AssetPackId } from '../assetPacks'

export type DockPanel = 'people' | 'quests' | 'inventory' | 'market' | 'path'

export const DOCK_PANELS: DockPanel[] = ['people', 'quests', 'inventory', 'market', 'path']

export const REALM_STAGES: ReadonlyArray<{ vi: string; en: string; seal: string }> = [
  { vi: 'Luyện Khí', en: 'Qi Refining', seal: '氣' },
  { vi: 'Trúc Cơ', en: 'Foundation', seal: '基' },
  { vi: 'Kim Đan', en: 'Golden Core', seal: '丹' },
  { vi: 'Nguyên Anh', en: 'Nascent Soul', seal: '嬰' },
  { vi: 'Hóa Thần', en: 'Spirit Transform', seal: '神' },
  { vi: 'Phi Thăng', en: 'Ascension', seal: '仙' },
]

export const HAN_SEALS = { mystery: '玄', objective: '目', choice: '選', achievement: '成' } as const

// Centralized so background art, NPC portraits, and dock context stay in sync.
export const NPC_PACK_BY_LOCATION: Record<string, AssetPackId> = {
  village: 'greenwood-village',
  market: 'cloud-market',
  sect: 'mist-sect',
  herb_field: 'herb-terraces',
  misty_forest: 'misty-forest',
  sealed_cave: 'sealed-cave',
  cursed_rift: 'cursed-rift',
  cloud_peak: 'cloud-peak',
}
