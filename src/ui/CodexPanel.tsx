import type { Locale } from '../engine/types'
import type { AssetPackDefinition, AssetPackId, AssetPackStatus } from './assetPacks'
import { assetPackProgress, isAssetPackReady } from './assetPacks'
import { t } from '../i18n'

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

function kindLabel(locale: Locale, kind: CodexEntryKind): string {
  return t(locale, `ui.codex.kind.${kind}`)
}

function statusLabel(locale: Locale, status: AssetPackStatus): string {
  return t(locale, `ui.codex.status.${status}`)
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
  titleVi,
  titleEn,
}: CodexPanelProps) {
  const progress = assetPackProgress(packs)

  return (
    <section aria-labelledby="codex-title" className="codex-panel" data-testid="codex-panel">
      <header className="codex-panel__heading">
        <div>
          <p className="section-kicker">{t(locale, 'ui.codex.kicker')}</p>
          <h2 id="codex-title">{locale === 'vi' ? (titleVi ?? t(locale, 'ui.codex.title')) : (titleEn ?? t(locale, 'ui.codex.title'))}</h2>
        </div>
        <span>{progress.loaded}/{progress.total}</span>
      </header>

      <section aria-label={t(locale, 'ui.codex.progress')} className="codex-panel__progress" aria-live="polite">
          <p>{t(locale, 'ui.codex.registered')}: {progress.loaded}/{progress.total}</p>
        <progress max={Math.max(progress.total, 1)} value={progress.loaded} />
        <small>{progress.readyPacks}/{progress.totalPacks} {t(locale, 'ui.codex.packsReady')}</small>
      </section>

      <ul className="codex-panel__packs" aria-label={t(locale, 'ui.codex.packs')}>
        {packs.map((pack) => (
          <li data-pack-id={pack.id} key={pack.id}>
            <strong>{locale === 'vi' ? pack.nameVi : pack.nameEn}</strong>
            <span>{pack.loadedAssets}/{pack.requiredAssetCount}</span>
            <em data-ready={isAssetPackReady(pack)}>{statusLabel(locale, pack.status)}</em>
          </li>
        ))}
      </ul>

      <ul className="codex-panel__entries" aria-label={t(locale, 'ui.codex.entries')}>
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
              <button aria-label={`${t(locale, 'ui.codex.open')} ${localized(locale, entry)}`} onClick={() => onEntrySelect(entry)} type="button">
                {t(locale, 'ui.codex.view')}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
