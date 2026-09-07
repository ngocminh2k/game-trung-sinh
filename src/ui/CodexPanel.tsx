import { getTechnique } from '../content/rpg'
import type { Locale } from '../engine/types'
import type { AssetPackDefinition, AssetPackId, AssetPackStatus } from './assetPacks'
import { assetPackProgress, isAssetPackReady } from './assetPacks'
import { t } from '../i18n'
import { ENDINGS } from '../content'
import type { EndingDef } from '../engine/content-types'
import type { KeyboardEvent } from 'react'

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
  /** Ending ids the player has already seen. The gallery uses this to flip
   *  each silhouette from locked to revealed. Default = none unlocked. */
  unlockedEndingIds?: readonly string[]
  onEntrySelect?: (entry: CodexEntry) => void
  onEndingSelect?: (ending: EndingDef) => void
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

// The ending gallery shows the first 12 endings from the catalog (the
// main-story tier). 3 silhouettes are revealed by default — the ones
// every fresh save is on the verge of earning — so the gallery shows
// real letters next to locked silhouettes.
const GALLERY_SIZE = 12
const REVEALED_PER_TIER = 3
const UNLOCKED_FALLBACK_IDS = new Set<string>([
  'tragic_death',
  'keeper_of_names',
  'rootless_star',
])

/**
 * A content-only panel: the game screen owns layout and state, while this
 * module truthfully exposes what its asset loader has verified so far.
 */
export function CodexPanel({
  entries,
  locale,
  packs,
  unlockedEndingIds,
  onEntrySelect,
  onEndingSelect,
  titleVi,
  titleEn,
}: CodexPanelProps) {
  const progress = assetPackProgress(packs)
  const unlocked = new Set<string>([...UNLOCKED_FALLBACK_IDS, ...(unlockedEndingIds ?? [])])

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

      <section aria-label={t(locale, 'ui.codex.endings')} className="codex-panel__endings" data-testid="codex-endings">
        <h3>{t(locale, 'ui.codex.endings')}</h3>
        <p className="section-kicker">{t(locale, 'ui.codex.endingTier.main')} · {ENDINGS.slice(0, GALLERY_SIZE).filter((ending) => unlocked.has(ending.id)).length}/{GALLERY_SIZE}</p>
        <ul className="codex-endings-grid" aria-label={t(locale, 'ui.codex.endingTier.main')}>
          {ENDINGS.slice(0, GALLERY_SIZE).map((ending, index) => {
            const isUnlocked = unlocked.has(ending.id)
            const silhouetteLabel = locale === 'vi' ? ending.nameVi : ending.nameEn
            const handleKeyDown = (event: KeyboardEvent<HTMLLIElement>) => {
              if (onEndingSelect === undefined) return
              if (event.key === 'Enter' || event.key === ' ') {
                event.preventDefault()
                onEndingSelect(ending)
              }
            }
            return (
              <li
                aria-label={isUnlocked ? silhouetteLabel : t(locale, 'ui.codex.endingLocked')}
                className={`codex-ending ${isUnlocked ? 'is-unlocked' : 'is-locked'}`}
                data-ending-id={ending.id}
                data-tier-position={index < REVEALED_PER_TIER ? 'seed' : 'rest'}
                key={ending.id}
                onKeyDown={onEndingSelect === undefined ? undefined : handleKeyDown}
                role={onEndingSelect === undefined ? undefined : 'button'}
                tabIndex={onEndingSelect === undefined ? -1 : 0}
                title={isUnlocked
                  ? (locale === 'vi' ? ending.epitaphVi : ending.epitaphEn)
                  : t(locale, 'ui.codex.endingLocked')
                }
              >
                <span aria-hidden="true" className="codex-ending__silhouette">{isUnlocked ? silhouetteLabel.charAt(0) : '?'}</span>
                <strong>{isUnlocked ? silhouetteLabel : t(locale, 'ui.codex.endingLocked')}</strong>
              </li>
            )
          })}
        </ul>
      </section>

      <ul className="codex-panel__entries" aria-label={t(locale, 'ui.codex.entries')}>
        {entries.map((entry) => (
          <li data-entry-id={entry.id} key={entry.id}>
            {entry.artworkSrc !== undefined && <img alt={localized(locale, entry)} src={entry.artworkSrc} />}
            <div>
              <span>{kindLabel(locale, entry.kind)}</span>
              <strong>{localized(locale, entry)}</strong>
              <p>{locale === 'vi' ? entry.descriptionVi : entry.descriptionEn}</p>
              {entry.kind === 'technique' && (() => {
                const technique = getTechnique(entry.id)
                const benefit = locale === 'vi' ? technique?.benefitVi : technique?.benefitEn
                const cost = locale === 'vi' ? technique?.costVi : technique?.costEn
                const lines = [benefit, cost].filter((line) => line !== undefined)
                return lines.length > 0 && (
                  <span className="codex-entry-tradeoff">
                    {lines.map((line, index) => <small key={index}>{line}</small>)}
                  </span>
                )
              })()}
              <small>{statusLabel(locale, entry.assetStatus)}</small>
            </div>
            {onEntrySelect !== undefined && (
              <button aria-label={`${t(locale, 'ui.codex.view')} ${localized(locale, entry)}`} onClick={() => onEntrySelect(entry)} type="button">
                {t(locale, 'ui.codex.view')}
              </button>
            )}
          </li>
        ))}
      </ul>
    </section>
  )
}
