import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { CodexPanel } from '../src/ui/CodexPanel'
import { ASSET_PACK_MANIFEST, assetPackProgress } from '../src/ui/assetPacks'

const villagePack = ASSET_PACK_MANIFEST.find((pack) => pack.id === 'greenwood-village')
const talentPack = ASSET_PACK_MANIFEST.find((pack) => pack.id === 'talents-and-effects')

if (villagePack === undefined || talentPack === undefined) {
  throw new Error('The codex test requires the village and talent asset packs.')
}

describe('CodexPanel', () => {
  it('renders bilingual entries and an honest progressive asset loading summary', () => {
    const markup = renderToStaticMarkup(
      <CodexPanel
        entries={[
          {
            id: 'n_elder_meihua',
            kind: 'npc',
            nameVi: 'Cụ Mai Hoa',
            nameEn: 'Elder Meihua',
            descriptionVi: 'Trưởng lão làng Thanh Mộc.',
            descriptionEn: 'The elder of Greenwood Village.',
            assetPackId: 'greenwood-village',
            assetStatus: 'ready',
          },
          {
            id: 'talent_iron_will',
            kind: 'talent',
            nameVi: 'Thiết Tâm',
            nameEn: 'Iron Will',
            descriptionVi: 'Giữ tâm trí vững vàng khi hiểm nguy.',
            descriptionEn: 'Keeps the mind steady in danger.',
            assetPackId: 'talents-and-effects',
            assetStatus: 'queued',
          },
          {
            id: 'crooked_circulation',
            kind: 'technique',
            nameVi: 'Chu Thiên Cong Queo',
            nameEn: 'Crooked Circulation',
            descriptionVi: 'Đường khí sai sách vở nhưng vừa khít linh căn phế.',
            descriptionEn: 'A textbook-wrong qi path that fits a defective root.',
            assetPackId: 'talents-and-effects',
            assetStatus: 'ready',
          },
        ]}
        locale="vi"
        packs={[
          { ...villagePack, status: 'ready', loadedAssets: 7 },
          { ...talentPack, status: 'loading', loadedAssets: 2 },
        ]}
      />,
    )

    expect(markup).toContain('Tu điển giang hồ')
    expect(markup).toContain('Cụ Mai Hoa')
    expect(markup).toContain('Thiết Tâm')
    expect(markup).toContain('Chu Thiên Cong Queo')
    expect(markup).toContain('Công pháp')
    expect(markup).toContain('Đang tải')
    expect(markup).toContain('7/7')
    expect(markup).not.toContain('🎭')
  })

  it('reports manifest progress from declared asset counts instead of inventing loaded art', () => {
    const progress = assetPackProgress([
      { ...villagePack, status: 'ready', loadedAssets: 7 },
      { ...talentPack, status: 'loading', loadedAssets: 2 },
    ])
    expect(progress.loaded).toBe(9)
    expect(progress.total).toBe(villagePack.requiredAssetCount + talentPack.requiredAssetCount)
    expect(progress.readyPacks).toBe(1)
    expect(progress.totalPacks).toBe(2)
  })

  it('reports every content pack as ready once all shipped art is present', () => {
    const allReady = ASSET_PACK_MANIFEST.map((pack) => ({
      ...pack,
      status: 'ready' as const,
      loadedAssets: pack.requiredAssetCount,
    }))
    const progress = assetPackProgress(allReady)
    expect(progress.loaded).toBe(progress.total)
    expect(progress.readyPacks).toBe(ASSET_PACK_MANIFEST.length)
    expect(progress.totalPacks).toBe(ASSET_PACK_MANIFEST.length)
  })
})
