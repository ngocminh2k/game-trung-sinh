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
export const ASSET_PACK_MANIFEST: readonly AssetPackDefinition[] = [
  { id: 'greenwood-village', nameVi: 'Portrait Làng Thanh Mộc', nameEn: 'Greenwood Village Portraits', requiredAssetCount: 6, status: 'ready', loadedAssets: 6 },
  { id: 'cloud-market', nameVi: 'Portrait Chợ Vân Tập', nameEn: 'Cloud Market Portraits', requiredAssetCount: 8, status: 'ready', loadedAssets: 8 },
  { id: 'mist-sect', nameVi: 'Portrait Tông Vân Ẩn', nameEn: 'Mistbound Sect Portraits', requiredAssetCount: 6, status: 'ready', loadedAssets: 6 },
  { id: 'herb-terraces', nameVi: 'Portrait Điền Linh Thảo', nameEn: 'Herb Terrace Portraits', requiredAssetCount: 3, status: 'ready', loadedAssets: 3 },
  { id: 'misty-forest', nameVi: 'Portrait Rừng Sương Mù', nameEn: 'Misty Forest Portraits', requiredAssetCount: 2, status: 'ready', loadedAssets: 2 },
  { id: 'sealed-cave', nameVi: 'Portrait Hang Phong Ấn', nameEn: 'Sealed Cave Portraits', requiredAssetCount: 2, status: 'ready', loadedAssets: 2 },
  { id: 'cursed-rift', nameVi: 'Portrait Khe Hở', nameEn: 'Cursed Rift Portraits', requiredAssetCount: 2, status: 'ready', loadedAssets: 2 },
  { id: 'cloud-peak', nameVi: 'Portrait Đỉnh Mây', nameEn: 'Cloud Peak Portraits', requiredAssetCount: 1, status: 'ready', loadedAssets: 1 },
  { id: 'talents-and-effects', nameVi: 'Thiên Phú Và Hiệu Ứng', nameEn: 'Talents And Effects', requiredAssetCount: 24, status: 'queued', loadedAssets: 0 },
  { id: 'items-and-equipment', nameVi: 'Vật Phẩm Và Trang Bị', nameEn: 'Items And Equipment', requiredAssetCount: 80, status: 'queued', loadedAssets: 0 },
  { id: 'player-poses', nameVi: 'Tư Thế Nhân Vật Chính', nameEn: 'Player Action Poses', requiredAssetCount: 12, status: 'queued', loadedAssets: 0 },
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
