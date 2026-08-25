import type { Locale } from '../engine/types'
import type { AssetPackDefinition, AssetPackId, AssetPackStatus } from './assetPacks'
import { assetPackProgress, isAssetPackReady } from './assetPacks'

export type CodexEntryKind = 'npc' | 'item' | 'talent' | 'technique' | 'location'

export interface CodexEntry {
  id: string
  kind: CodexEntryKind
  nameVi: string
  nameEn: string
  descriptionVi: string
  descriptionEn: string
  assetPackId: AssetPackId
  assetStatus: AssetPackStatus
  /** A verified artwork URL. Omit this until an actual visual asset exists. */
  artworkSrc?: string
}

export interface CodexPanelProps {
  entries: readonly CodexEntry[]
  locale: Locale
  packs: readonly AssetPackDefinition[]
  onEntrySelect?: (entry: CodexEntry) => void
  titleVi?: string
  titleEn?: string
}

function localized(locale: Locale, entry: Pick<CodexEntry, 'nameVi' | 'nameEn'>): string {
  return locale === 'vi' ? entry.nameVi : entry.nameEn
}

function copy(locale: Locale, vi: string, en: string): string {
  return locale === 'vi' ? vi : en
}

function kindLabel(locale: Locale, kind: CodexEntryKind): string {
  const labels: Record<CodexEntryKind, [string, string]> = {
    npc: ['Nhân vật', 'Character'],
    item: ['Vật phẩm', 'Item'],
    talent: ['Thiên phú', 'Talent'],
    technique: ['Công pháp', 'Technique'],
    location: ['Địa điểm', 'Location'],
  }
  return labels[kind][locale === 'vi' ? 0 : 1]
}

function statusLabel(locale: Locale, status: AssetPackStatus): string {
  const labels: Record<AssetPackStatus, [string, string]> = {
    queued: ['Đang chờ', 'Queued'],
    loading: ['Đang tải', 'Loading'],
    ready: ['Sẵn sàng', 'Ready'],
    failed: ['Cần tải lại', 'Needs retry'],
  }
  return labels[status][locale === 'vi' ? 0 : 1]
}

/**
 * A content-only panel: the game screen owns layout and state, while this
 * module truthfully exposes what its asset loader has verified so far.
 */
export function CodexPanel({
  entries,
  locale,
  packs,
  onEntrySelect,
  titleVi = 'Tu điển giang hồ',
  titleEn = 'Wandering Codex',
}: CodexPanelProps) {
  const progress = assetPackProgress(packs)

  return (
    <section aria-labelledby="codex-title" className="codex-panel" data-testid="codex-panel">
      <header className="codex-panel__heading">
        <div>
          <p className="section-kicker">{copy(locale, 'Nội dung & minh họa', 'Content & artwork')}</p>
          <h2 id="codex-title">{locale === 'vi' ? titleVi : titleEn}</h2>
        </div>
        <span>{progress.loaded}/{progress.total}</span>
      </header>

      <section aria-label={copy(locale, 'Tiến độ tải asset', 'Asset loading progress')} className="codex-panel__progress" aria-live="polite">
          <p>{copy(locale, 'Asset đã đăng ký trong game', 'Assets registered in the game')}: {progress.loaded}/{progress.total}</p>
        <progress max={Math.max(progress.total, 1)} value={progress.loaded} />
        <small>{progress.readyPacks}/{progress.totalPacks} {copy(locale, 'gói sẵn sàng', 'packs ready')}</small>
      </section>

      <ul className="codex-panel__packs" aria-label={copy(locale, 'Gói asset', 'Asset packs')}>
        {packs.map((pack) => (
          <li data-pack-id={pack.id} key={pack.id}>
            <strong>{locale === 'vi' ? pack.nameVi : pack.nameEn}</strong>
            <span>{pack.loadedAssets}/{pack.requiredAssetCount}</span>
            <em data-ready={isAssetPackReady(pack)}>{statusLabel(locale, pack.status)}</em>
          </li>
        ))}
      </ul>

      <ul className="codex-panel__entries" aria-label={copy(locale, 'Mục tu điển', 'Codex entries')}>
        {entries.map((entry) => (
          <li data-entry-id={entry.id} key={entry.id}>
            {entry.artworkSrc !== undefined && <img alt={localized(locale, entry)} src={entry.artworkSrc} />}
            <div>
              <span>{kindLabel(locale, entry.kind)}</span>
              <strong>{localized(locale, entry)}</strong>
              <p>{locale === 'vi' ? entry.descriptionVi : entry.descriptionEn}</p>
              <small>{statusLabel(locale, entry.assetStatus)}</small>
            </div>
            {onEntrySelect !== undefined && (
              <button aria-label={`${copy(locale, 'Mở', 'Open')} ${localized(locale, entry)}`} onClick={() => onEntrySelect(entry)} type="button">
                {copy(locale, 'Xem', 'View')}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
