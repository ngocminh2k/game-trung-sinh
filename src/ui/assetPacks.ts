import { itemArtCount, talentTechArtCount } from './rpgArt'
import { ITEMS } from '../content/items'
import { TALENTS, TECHNIQUES } from '../content/rpg'

export type AssetPackId =
  | 'greenwood-village'
  | 'cloud-market'
  | 'mist-sect'
  | 'herb-terraces'
  | 'misty-forest'
  | 'sealed-cave'
  | 'cursed-rift'
  | 'cloud-peak'
  | 'talents-and-effects'
  | 'items-and-equipment'
  | 'player-poses'

export type AssetPackStatus = 'queued' | 'loading' | 'ready' | 'failed'

export interface AssetPackDefinition {
  id: AssetPackId
  nameVi: string
  nameEn: string
  requiredAssetCount: number
  status: AssetPackStatus
  loadedAssets: number
}

export interface AssetPackProgress {
  loaded: number
  total: number
  readyPacks: number
  totalPacks: number
}

/**
 * Static shipped-content manifest. `ready` means every declared asset has
 * been registered in the build; it does not claim a runtime lazy-loader or
 * per-file browser fetch verification.
 */
const ITEM_ART_REQUIRED = ITEMS.length
const TALENT_TECH_ART_REQUIRED = TALENTS.length + TECHNIQUES.length

const itemArtLoaded = itemArtCount()
const talentTechArtLoaded = talentTechArtCount()

function packStatus(loaded: number, required: number): AssetPackStatus {
  return loaded >= required ? 'ready' : 'loading'
}

export const ASSET_PACK_MANIFEST: readonly AssetPackDefinition[] = [
  { id: 'greenwood-village', nameVi: 'Làng Thanh Mộc', nameEn: 'Greenwood Village', requiredAssetCount: 7, status: 'ready', loadedAssets: 7 },
  { id: 'cloud-market', nameVi: 'Chợ Vân Tập', nameEn: 'Cloud Market', requiredAssetCount: 9, status: 'ready', loadedAssets: 9 },
  { id: 'mist-sect', nameVi: 'Tông Vân Ẩn', nameEn: 'Mistbound Sect', requiredAssetCount: 7, status: 'ready', loadedAssets: 7 },
  { id: 'herb-terraces', nameVi: 'Điền Linh Thảo', nameEn: 'Herb Terraces', requiredAssetCount: 4, status: 'ready', loadedAssets: 4 },
  { id: 'misty-forest', nameVi: 'Rừng Sương Mù', nameEn: 'Misty Forest', requiredAssetCount: 3, status: 'ready', loadedAssets: 3 },
  { id: 'sealed-cave', nameVi: 'Hang Phong Ấn', nameEn: 'Sealed Cave', requiredAssetCount: 3, status: 'ready', loadedAssets: 3 },
  { id: 'cursed-rift', nameVi: 'Khe Hở Nguyền Rủa', nameEn: 'Cursed Rift', requiredAssetCount: 3, status: 'ready', loadedAssets: 3 },
  { id: 'cloud-peak', nameVi: 'Đỉnh Mây', nameEn: 'Cloud Peak', requiredAssetCount: 2, status: 'ready', loadedAssets: 2 },
  {
    id: 'talents-and-effects',
    nameVi: 'Thiên Phú Và Công Pháp',
    nameEn: 'Talents And Techniques',
    requiredAssetCount: TALENT_TECH_ART_REQUIRED,
    status: packStatus(talentTechArtLoaded, TALENT_TECH_ART_REQUIRED),
    loadedAssets: talentTechArtLoaded,
  },
  {
    id: 'items-and-equipment',
    nameVi: 'Vật Phẩm Và Trang Bị',
    nameEn: 'Items And Equipment',
    requiredAssetCount: ITEM_ART_REQUIRED,
    status: packStatus(itemArtLoaded, ITEM_ART_REQUIRED),
    loadedAssets: itemArtLoaded,
  },
  { id: 'player-poses', nameVi: 'Tư Thế Nhân Vật Chính', nameEn: 'Player Action Poses', requiredAssetCount: 11, status: 'ready', loadedAssets: 11 },
]

export function assetPackProgress(packs: readonly AssetPackDefinition[]): AssetPackProgress {
  return packs.reduce<AssetPackProgress>(
    (progress, pack) => ({
      loaded: progress.loaded + Math.min(pack.loadedAssets, pack.requiredAssetCount),
      total: progress.total + pack.requiredAssetCount,
      readyPacks: progress.readyPacks + (pack.status === 'ready' && pack.loadedAssets >= pack.requiredAssetCount ? 1 : 0),
      totalPacks: progress.totalPacks + 1,
    }),
    { loaded: 0, total: 0, readyPacks: 0, totalPacks: 0 },
  )
}

export function isAssetPackReady(pack: AssetPackDefinition): boolean {
  return pack.status === 'ready' && pack.loadedAssets >= pack.requiredAssetCount
}
