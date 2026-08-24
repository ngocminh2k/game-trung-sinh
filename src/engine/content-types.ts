import type { ConcreteAction } from './types'

export interface ItemDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  aliases: string[]
  usable: boolean
  effects?: { hp?: number; qi?: number }
  buyPrice: number | null
  sellPrice: number | null
}

export interface LocationDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  danger: number
}

export type Terrain = 'plain' | 'road' | 'water' | 'mountain' | 'forest' | 'cave' | 'rift'

export interface CellDef {
  x: number
  y: number
  terrain: Terrain
  locationId?: string
}

export interface NpcDef {
  id: string
  nameVi: string
  nameEn: string
  roleVi: string
  roleEn: string
  locationId: string
  greetVi: string
  greetEn: string
  aliases: string[]
}

export interface ChapterDef {
  index: number
  nameVi: string
  nameEn: string
  taglineVi: string
  taglineEn: string
}

export interface EndingDef {
  id: string
  nameVi: string
  nameEn: string
  epitaphVi: string
  epitaphEn: string
}

export interface QuestDef {
  id: string
  giverNpcId: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
  requiredItems: Record<string, number>
  requiredFlags: string[]
  rewardGold: number
  rewardItems: Record<string, number>
  aliases: string[]
}

export interface AchievementDef {
  id: string
  nameVi: string
  nameEn: string
  descVi: string
  descEn: string
}

export interface BeatDef {
  id: string
  chapter: number
  predicate: string
  titleVi: string
  titleEn: string
  textVi: string
  textEn: string
  suggested: ConcreteAction[]
}
