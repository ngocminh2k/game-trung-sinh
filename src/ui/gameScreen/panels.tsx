import { KeyboardEvent, useState, type RefObject } from 'react'
import {
  ACHIEVEMENTS,
  NPCS,
  QUESTS,
  RECIPES,
  TALENTS,
  getItem,
  getEquipmentByItem,
  getLocation,
} from '../../content'
import {
  activeSystem,
  canCompleteQuest,
  currentStepIndex,
  getQuestCategory,
  isQuestUnlocked,
  questCategoryLabel,
  questStatus,
  storageRemaining,
} from '../../engine'
import { canAcceptQuest } from '../../engine/quests'
import type { Action, GameState, Locale } from '../../engine'
import type { EquipmentDef } from '../../engine/content-types'
import itemsStillLife from '../../assets/art/items-still-life.webp'
import { npcPortraitFor } from '../npcArt'
import { itemArtFor, talentArtFor, techniqueArtFor } from '../rpgArt'
import { t as i18n } from '../../i18n'
import { DOCK_PANELS, type DockPanel } from './constants'
import {
  itemName,
  itemTier,
  localized,
  marketRows,
  moveDockFocus,
  obscuredName,
  currencyExchangeRows,
  equipmentRows,
  getAchievementProgress,
  stageRequirement,
  techniqueRows,
  word,
} from './helpers'

// Issue #33: the skill tree lives with the other panels but is opened from the
// proto-shell topbar (GameScreen's dock has a fixed 6-tab list in constants.ts,
// which is not this issue's file to grow). Re-exported here so every panel the
// shells render has one registration point.
export { SkillTreePanel } from './skillTree/SkillTreePanel'
export type { SkillTreePanelProps } from './skillTree/SkillTreePanel'

interface DockTabBarProps {
  activeDock: DockPanel
  entriesCount: number
  game: GameState
  locale: Locale
  onSelect: (panel: DockPanel) => void
  localNpcsCount: number
  chronicleLength: number
}

/** Quest badge: what the player can act on right now. Completed/total sat at
 * "0/210" for every run of the AI playtest, so accepting a quest changed nothing
 * the player could see. Active first, then available-and-unlocked. */
function questCountLabel(game: GameState, locale: Locale): string {
  const active = QUESTS.filter((quest) => questStatus(game, quest.id) === 'active').length
  if (active > 0) return `${String(active)} ${word(locale, 'đang nhận', 'active')}`
  const available = QUESTS.filter((quest) => questStatus(game, quest.id) === 'available' && isQuestUnlocked(game, quest.id)).length
  return `${String(available)} ${word(locale, 'khả dụng', 'available')}`
}

export function DockTabBar({ activeDock, game, locale, onSelect, localNpcsCount, chronicleLength }: DockTabBarProps): JSX.Element {
  const questCount = questCountLabel(game, locale)
  const chronicleCount = chronicleLength
  const tabs: ReadonlyArray<readonly [DockPanel, string, string | number]> = [
    ['people', word(locale, 'Người ở đây', 'People here'), localNpcsCount],
    ['quests', word(locale, 'Nhiệm vụ', 'Quests'), questCount],
    ['inventory', word(locale, 'Túi đồ & kho', 'Bag & storage'), 0 /* filled by parent */],
    ['market', word(locale, 'Chợ & thành tựu', 'Market & deeds'), `${game.achievements.length}/${ACHIEVEMENTS.length}`],
    ['path', word(locale, 'Đạo đồ & trang bị', 'Path & equipment'), word(locale, 'tu vi', 'cultivation')],
    ['chronicle', word(locale, 'Biên niên', 'Chronicle'), chronicleCount],
  ]
  return (
    <div className="dock-tabs" aria-label={word(locale, 'Hệ thống phụ', 'Secondary systems')} role="tablist">
      {tabs.map(([id, label, count]) => (
        <button
          aria-controls={`dock-panel-${id}`}
          aria-label={`${label}: ${count}`}
          aria-selected={activeDock === id}
          className={`dock-tab ${activeDock === id ? 'is-active' : ''} ${id === 'market' && game.player.locationId === 'market' ? 'is-contextual' : ''}`}
          id={`dock-tab-${id}`}
          key={id}
          onClick={() => onSelect(id)}
          onKeyDown={(event: KeyboardEvent<HTMLButtonElement>) => moveDockFocus(event, id, onSelect)}
          role="tab"
          tabIndex={activeDock === id ? 0 : -1}
          type="button"
        >
          <span>{label}</span><em aria-hidden="true" className="dock-tab-count">{count}</em>
        </button>
      ))}
    </div>
  )
}

export function DockPanelContainer({ activeDock, panels }: { activeDock: DockPanel; panels: Partial<Record<DockPanel, React.ReactNode>> }): JSX.Element {
  return (
    <>
      {DOCK_PANELS.map((panel) => (
        <div
          aria-labelledby={`dock-tab-${panel}`}
          className="dock-panel"
          hidden={activeDock !== panel}
          id={`dock-panel-${panel}`}
          key={panel}
          role="tabpanel"
          tabIndex={-1}
        >
          {activeDock === panel && panels[panel]}
        </div>
      ))}
    </>
  )
}

export function DockPanelInventory({
  actionKind,
  encounterLocked,
  game,
  entries,
  stored,
  selectedInventoryId,
  selectedInventoryItem,
  selectedInventoryArt,
  selectedInventoryEquipment,
  onSelectId,
  onAction,
  locale,
}: {
  actionKind: Action['kind'] | null
  encounterLocked: boolean
  game: GameState
  entries: [string, number][]
  stored: [string, number][]
  selectedInventoryId: string | undefined
  selectedInventoryItem: ReturnType<typeof getItem> | undefined
  selectedInventoryArt: string | undefined
  selectedInventoryEquipment: EquipmentDef | undefined
  onSelectId: (id: string) => void
  onAction: (action: Action) => void
  locale: Locale
}): JSX.Element {
  const selected = selectedInventoryId !== undefined
  return (
    <section aria-labelledby="inventory-title">
      <div className="panel-heading compact">
        <h2 id="inventory-title">{word(locale, 'Túi đồ & kho', 'Inventory & storage')}</h2>
        <span>{storageRemaining(game)} {word(locale, 'ô kho', 'storage left')}</span>
      </div>
      <p className="dock-context">{word(locale, 'Túi đồ luôn theo ngươi; kho ghi nhận vật phẩm đã gửi.', 'Your bag travels with you; storage records deposited items.')}</p>
      <div className="inventory-layout">
        <div className="inventory-list-column">
          <img
            alt={word(locale, 'Bộ sưu tập vật phẩm tu tiên', 'Cultivation item collection')}
            className={`item-collection-art ${actionKind === 'use_item' ? 'is-used' : ''}`}
            src={itemsStillLife}
          />
          <ul className="item-list">
            {entries.length === 0
              ? <li className="muted">{word(locale, 'Túi trống.', 'Your bag is empty.')}</li>
              : entries.map(([id, qty]) => {
                  const item = getItem(id)
                  const artwork = itemArtFor(id)
                  const tier = itemTier(item)
                  const isSelected = id === selectedInventoryId
                  return (
                    <li className={`item-row tier-${tier} ${isSelected ? 'is-selected' : ''}`} key={id}>
                      <button
                        aria-pressed={isSelected}
                        className="item-inspect-trigger"
                        onClick={() => onSelectId(id)}
                        type="button"
                      >
                        {artwork !== undefined && <img alt={word(locale, `Minh họa ${itemName(id, locale)}`, `Artwork of ${itemName(id, locale)}`)} className="item-art-thumb" src={artwork} />}
                        <span className="item-copy">
                          <strong>{itemName(id, locale)} ×{qty}</strong>
                          <span>{item === undefined ? '' : locale === 'vi' ? item.descVi : item.descEn}</span>
                          {item?.sellPrice !== null && item?.sellPrice !== undefined && <em className="item-value-chip" title={word(locale, 'Giá bán tại chợ', 'Market sell price')}>◎ {item.sellPrice}</em>}
                        </span>
                      </button>
                      <div className="item-actions">
                        {item?.usable && <button disabled={game.terminal} onClick={() => onAction({ kind: 'use_item', itemId: id })} type="button">{word(locale, 'Dùng', 'Use')}</button>}
                        <button disabled={game.terminal || encounterLocked} onClick={() => onAction({ kind: 'store', itemId: id, qty: 1 })} type="button">{word(locale, 'Gửi', 'Store')}</button>
                      </div>
                    </li>
                  )
                })}
          </ul>
          {stored.length > 0 && (
            <div className="storage-list">
              <p className="section-kicker">{word(locale, 'Trong kho', 'In storage')}</p>
              {stored.map(([id, qty]) => (
                <button disabled={game.terminal || encounterLocked} key={id} onClick={() => onAction({ kind: 'withdraw', itemId: id, qty: 1 })} type="button">
                  {itemName(id, locale)} ×{qty} · {word(locale, 'lấy', 'take')}
                </button>
              ))}
            </div>
          )}
        </div>
        <aside className="inventory-inspector" data-testid="inventory-inspector">
          <h3 className="inventory-inspector-title">{word(locale, 'Chi tiết vật phẩm', 'Item details')}</h3>
          {!selected
            ? <p className="muted">{word(locale, 'Chọn một vật phẩm để xem chi tiết.', 'Choose an item to inspect it.')}</p>
            : (() => {
                const item = selectedInventoryItem!
                const art = selectedInventoryArt
                const itemId = selectedInventoryId!
                const equipDef = selectedInventoryEquipment !== undefined ? getEquipmentByItem(itemId) : undefined
                const tier = itemTier(item)
                return (
                  <>
                    <p className="section-kicker">{word(locale, `Phẩm cấp ${tier}`, `${tier} tier`)}</p>
                    <img alt={word(locale, `Minh họa lớn ${itemName(itemId, locale)}`, `Large artwork of ${itemName(itemId, locale)}`)} className="inventory-inspector-art" src={art ?? itemsStillLife} />
                    <h3>{itemName(itemId, locale)}</h3>
                    <p>{locale === 'vi' ? item.descVi : item.descEn}</p>
                    <dl>
                      <div><dt>{word(locale, 'Giá trị', 'Value')}</dt><dd>{item.sellPrice === null || item.sellPrice === undefined ? word(locale, 'Không bán', 'Not for sale') : `◎ ${item.sellPrice}`}</dd></div>
                      {equipDef !== undefined && (
                        <div>
                          <dt>{word(locale, 'Trang bị', 'Equipment')}</dt>
                          <dd>{word(locale, `${equipDef.slot} · Công ${equipDef.attackBonus} / Thủ ${equipDef.defenseBonus}`, `${equipDef.slot} · ATK ${equipDef.attackBonus} / DEF ${equipDef.defenseBonus}`)}</dd>
                        </div>
                      )}
                    </dl>
                    <div className="inventory-inspector-actions">
                      {item.usable && <button disabled={game.terminal} onClick={() => onAction({ kind: 'use_item', itemId: itemId })} type="button">{word(locale, 'Dùng vật phẩm', 'Use item')}</button>}
                      {equipDef !== undefined && <button disabled={game.terminal || game.encounter !== null} onClick={() => onAction({ kind: 'equip_item', itemId: itemId })} type="button">{word(locale, 'Trang bị ngay', 'Equip now')}</button>}
                    </div>
                  </>
                )
              })()}
        </aside>
      </div>
    </section>
  )
}

export function DockPanelMarket({
  actionKind: _actionKind,
  encounterLocked,
  game,
  entries,
  locale,
  onAction,
  unlockedAchievementIds,
}: {
  actionKind: Action['kind'] | null
  encounterLocked: boolean
  game: GameState
  entries: [string, number][]
  locale: Locale
  onAction: (action: Action) => void
  unlockedAchievementIds?: readonly string[]
}): JSX.Element {
  void _actionKind
  const [expandedAchievementId, setExpandedAchievementId] = useState<string | null>(null)
  return (
    <section aria-labelledby="market-title">
      <div className="panel-heading compact">
        <h2 id="market-title">{word(locale, 'Chợ & thành tựu', 'Market & achievements')}</h2>
        <span>{game.achievements.length}/{ACHIEVEMENTS.length}</span>
      </div>
      <div className="achievements" role="region" aria-label={word(locale, 'Danh sách thành tựu', 'Achievements list')}>
        {ACHIEVEMENTS.map((achievement) => {
          const unlocked = game.achievements.includes(achievement.id)
          // AC1: a deed from another slot's life persists globally — stamp it
          // faded so cross-run progress is visible, not just stored.
          const pastLife = !unlocked && (unlockedAchievementIds?.includes(achievement.id) ?? false)
          const HAN_SEAL = '成'
          const desc = locale === 'vi' ? achievement.descVi : achievement.descEn
          const name = localized(locale, achievement)
          const progress = getAchievementProgress(game, achievement.id, locale, unlocked)
          const isExpanded = expandedAchievementId === achievement.id
          const statusText = unlocked
            ? word(locale, 'Đã đạt', 'Unlocked')
            : pastLife
              ? i18n(locale, 'ui.achievements.pastLife')
              : word(locale, 'Chưa đạt', 'Locked')
          const ariaLabel = `${name} · ${desc} · ${progress.progressText} (${statusText})`

          return (
            <button
              type="button"
              className={`achievement-badge ${unlocked ? 'unlocked' : pastLife ? 'is-past-life' : 'is-locked'}${isExpanded ? ' is-expanded' : ''}`}
              key={achievement.id}
              aria-label={ariaLabel}
              aria-describedby={`achievement-desc-${achievement.id}`}
              aria-expanded={isExpanded}
              onClick={() => setExpandedAchievementId(isExpanded ? null : achievement.id)}
              title={pastLife ? `${desc} · ${i18n(locale, 'ui.achievements.pastLife')}` : desc}
            >
              <div className="achievement-badge-header">
                {(unlocked || pastLife) && (
                  <i aria-hidden="true" className="achievement-seal" data-testid="achievement-seal">
                    {HAN_SEAL}
                  </i>
                )}
                <span className="achievement-name">{name}</span>
                <span className="achievement-progress-text">{progress.progressText}</span>
              </div>
              <div className="achievement-desc" id={`achievement-desc-${achievement.id}`}>
                {desc}
              </div>
              <div className="achievement-progress-bar" aria-hidden="true">
                <div
                  className="achievement-progress-fill"
                  style={{ width: `${progress.percent}%` }}
                />
              </div>
              {isExpanded && (
                <div className="achievement-popover" role="tooltip">
                  <div className="achievement-popover-status">
                    <span>{statusText}</span>
                    <span>{progress.percent}%</span>
                  </div>
                  <p className="achievement-popover-criteria">{desc}</p>
                  {progress.hintVi && progress.hintEn && !unlocked && progress.percent >= 50 && (
                    <div className="achievement-hint">
                      <span className="achievement-hint-label">{word(locale, '💭 Manh mối', '💭 Hint')}</span>
                      <p className="achievement-hint-text">{word(locale, progress.hintVi, progress.hintEn)}</p>
                    </div>
                  )}
                </div>
              )}
            </button>
          )
        })}
      </div>
      <section className="refinement-list" aria-labelledby="refinement-title">
        <div className="refinement-heading">
          <h3 id="refinement-title">{word(locale, 'Quầy đổi linh tài', 'Material exchange counter')}</h3>
          <span>{word(locale, 'Bán lấy vốn, hoặc đổi lấy đường về.', 'Sell for capital, or exchange for a way home.')}</span>
        </div>
        {RECIPES.map((recipe) => {
          const canRefine = Object.entries(recipe.ingredients).every(([itemId, qty]) => (game.inventory[itemId] ?? 0) >= qty)
          const requirements = Object.entries(recipe.ingredients)
            .map(([itemId, qty]) => `${itemName(itemId, locale)} ×${String(qty)}`)
            .join(' + ')
          return (
            <article data-testid={`refinement-${recipe.id}`} key={recipe.id} className={canRefine ? 'is-ready' : 'is-locked'}>
              <div>
                <strong>{localized(locale, recipe)}</strong>
                <span className="refinement-description">{locale === 'vi' ? recipe.descVi : recipe.descEn}</span>
                <small>{requirements} → {itemName(recipe.output.itemId, locale)} ×{recipe.output.qty}</small>
              </div>
              <button
                disabled={game.terminal || encounterLocked || !canRefine || game.player.locationId !== recipe.locationId}
                onClick={() => onAction({ kind: 'refine', recipeId: recipe.id })}
                type="button"
              >
                {word(locale, 'Đổi', 'Exchange')}
              </button>
            </article>
          )
        })}
      </section>
      <p className="dock-context">
        {game.player.locationId === 'market'
          ? word(locale, 'Ngươi đang ở Chợ Tụ Vân: có thể giao dịch ngay.', 'You are at Cloudgather Market: trade is available.')
          : word(locale, 'Chỉ giao dịch được tại Chợ Tụ Vân. Các món vẫn được ghi nhớ ở đây.', 'Trading is available only at Cloudgather Market. The wares remain listed here.')}
      </p>
      <div className="currency-exchange" data-testid="currency-exchange">
        {currencyExchangeRows(game).map((row, index) => (
          <button
            disabled={!row.enabled}
            onClick={() => onAction({ kind: 'convert_currency', from: row.from, qty: 1 })}
            type="button"
            key={row.from}
          >
            {index === 0
              ? word(locale, 'Đổi 1 linh thạch → 10 vàng', 'Exchange 1 spirit stone → 10 gold')
              : word(locale, 'Đổi 10 bạc → 1 vàng', 'Exchange 10 silver → 1 gold')}
          </button>
        ))}
      </div>
      <div className="shop-list">
        {marketRows(game).map((row) => (
          <div className={row.stageLocked ? 'is-locked' : ''} key={row.itemId}>
            <span>
              {row.stageLocked
                ? `${word(locale, 'Hàng chưa mở', 'Sealed wares')} · ${stageRequirement(locale, getItem(row.itemId)?.requiredStage ?? 0)}`
                : `${itemName(row.itemId, locale)} · ${String(row.price)}◎`}
            </span>
            <button
              disabled={!row.enabled}
              onClick={() => onAction({ kind: 'buy', itemId: row.itemId })}
              type="button"
            >
              {row.stageLocked ? word(locale, 'Chưa mở', 'Locked') : word(locale, 'Mua', 'Buy')}
            </button>
          </div>
        ))}
      </div>
      <section aria-label={word(locale, 'Túi đồ tại chợ', 'Bag at market')} className="market-bag-summary">
        <p className="section-kicker">{word(locale, 'Hành lý sau giao dịch', 'Bag after trading')}</p>
        <ul className="item-list market-bag-list">
          {entries.length === 0
            ? <li className="muted">{word(locale, 'Túi trống.', 'Your bag is empty.')}</li>
            : entries.map(([id, qty]) => {
                const item = getItem(id)
                const canSell = item?.sellPrice !== null && item?.sellPrice !== undefined && !Object.values(game.equipment).includes(id)
                return (
                  <li key={id}>
                    <div className="item-copy">
                      <strong>{itemName(id, locale)} ×{qty}</strong>
                      <span>{item?.sellPrice === null || item?.sellPrice === undefined ? '' : `${word(locale, 'Bán', 'Sell')} ${item.sellPrice}◎`}</span>
                    </div>
                    {canSell && (
                      <button
                        disabled={game.terminal || encounterLocked || game.player.locationId !== 'market'}
                        onClick={() => onAction({ kind: 'sell', itemId: id })}
                        type="button"
                      >
                        {word(locale, 'Bán', 'Sell')}
                      </button>
                    )}
                  </li>
                )
              })}
        </ul>
      </section>
    </section>
  )
}

export function DockPanelPath({
  encounterLocked,
  game,
  locale,
  onAction,
}: {
  encounterLocked: boolean
  game: GameState
  locale: Locale
  onAction: (action: Action) => void
}): JSX.Element {
  return (
    <section aria-labelledby="rpg-systems-title">
      <div className="panel-heading compact">
        <h2 id="rpg-systems-title">{word(locale, 'Đạo đồ & trang bị', 'Path & equipment')}</h2>
        <span>{word(locale, 'có thể mở rộng bằng data', 'data-driven')}</span>
      </div>
      <div className="rpg-system-grid">
        <section>
          <h3>{word(locale, 'Thiên phú', 'Talents')}</h3>
          {TALENTS.map((talent) => {
            const chosen = game.talents.includes(talent.id)
            const stageLocked = game.player.stage < talent.requiredStage
            const tierTaken = game.talents.some((id) => {
              const entry = TALENTS.find((t) => t.id === id)
              return entry !== undefined && entry.selectable === true && entry.tier === talent.tier
            })
            const locked = !chosen && (stageLocked || tierTaken || !talent.selectable)
            const artwork = talentArtFor(talent.id)
            const status = chosen
              ? word(locale, 'Đã chọn', 'Chosen')
              : stageLocked
                ? stageRequirement(locale, talent.requiredStage)
                : tierTaken
                  ? word(locale, 'Đã chọn một thiên phú cùng tầng', 'A talent from this tier is chosen')
                  : word(locale, 'Bẩm sinh', 'Innate')
            return (
              <div className={`rpg-entry art-entry ${locked ? 'is-locked' : ''}`} key={talent.id}>
                {artwork !== undefined && <img alt={word(locale, `Minh họa ${localized(locale, talent)}`, `Artwork of ${localized(locale, talent)}`)} src={artwork} />}
                <div>
                  <strong>{locked ? obscuredName(locale, 'talent') : localized(locale, talent)}</strong>
                  <span>{locked ? status : locale === 'vi' ? talent.descVi : talent.descEn}</span>
                </div>
                {chosen || locked
                  ? <em>{status}</em>
                  : <button disabled={game.terminal || encounterLocked} onClick={() => onAction({ kind: 'choose_talent', talentId: talent.id })} type="button">{word(locale, 'Chọn', 'Choose')}</button>}
              </div>
            )
          })}
        </section>

        <section>
          <h3>{word(locale, 'Công pháp', 'Techniques')}</h3>
          {techniqueRows(game).map(({ technique, level, locked, learnable }) => {
            const stageLocked = game.player.stage < technique.requiredStage
            const artwork = techniqueArtFor(technique.id)
            const status = level > 0
              ? word(locale, 'Đã học', 'Learned')
              : stageLocked
                ? stageRequirement(locale, technique.requiredStage)
                : word(locale, 'Cần một cơ duyên', 'Requires a chance encounter')
            return (
              <div className={`rpg-entry art-entry ${locked ? 'is-locked' : ''}`} key={technique.id}>
                {artwork !== undefined && <img alt={word(locale, `Minh họa ${localized(locale, technique)}`, `Artwork of ${localized(locale, technique)}`)} src={artwork} />}
                <div>
                  <strong>{locked ? obscuredName(locale, 'technique') : `${localized(locale, technique)}${level > 0 ? ` · Lv.${level}` : ''}`}</strong>
                  <span>{locked ? status : locale === 'vi' ? technique.descVi : technique.descEn}</span>
                </div>
                {level > 0 || locked
                  ? <em>{status}</em>
                  : <button disabled={!learnable} onClick={() => onAction({ kind: 'learn_technique', techniqueId: technique.id })} type="button">{word(locale, 'Lĩnh ngộ', 'Learn')}</button>}
              </div>
            )
          })}
        </section>

        <section>
          <h3>{word(locale, 'Trang bị', 'Equipment')}</h3>
          {equipmentRows(game).map(({ equipment, equipped, locked, enabled }) => {
            const stageLocked = game.player.stage < (getItem(equipment.itemId)?.requiredStage ?? 0)
            const artwork = itemArtFor(equipment.itemId)
            const status = equipped
              ? word(locale, 'Đang dùng', 'Equipped')
              : stageLocked
                ? stageRequirement(locale, getItem(equipment.itemId)?.requiredStage ?? 0)
                : word(locale, 'Chưa sở hữu', 'Not owned')
            return (
              <div className={`rpg-entry art-entry ${locked ? 'is-locked' : ''}`} key={equipment.id}>
                {artwork !== undefined && <img alt={word(locale, `Minh họa ${localized(locale, equipment)}`, `Artwork of ${localized(locale, equipment)}`)} src={artwork} />}
                <div>
                  <strong>{locked ? obscuredName(locale, 'equipment') : localized(locale, equipment)}</strong>
                  <span>{locked ? status : locale === 'vi' ? equipment.descVi : equipment.descEn}</span>
                </div>
                {equipped || locked
                  ? <em>{status}</em>
                  : <button disabled={!enabled} onClick={() => onAction({ kind: 'equip_item', itemId: equipment.itemId })} type="button">{word(locale, 'Trang bị', 'Equip')}</button>}
              </div>
            )
          })}
        </section>
      </div>
    </section>
  )
}

export function DockPanelQuests({
  encounterLocked,
  game,
  locale,
  onAction,
}: {
  encounterLocked: boolean
  game: GameState
  locale: Locale
  onAction: (action: Action) => void
}): JSX.Element {
  const nameFor = (quest: (typeof QUESTS)[number]): string => localized(locale, quest)
  const [categoryFilter, setCategoryFilter] = useState<'all' | 'main' | 'side' | 'sect' | 'secret'>('all')

  const unlockedQuests = QUESTS.filter((quest) => isQuestUnlocked(game, quest.id))
  const filteredQuests = categoryFilter === 'all'
    ? unlockedQuests
    : unlockedQuests.filter((quest) => getQuestCategory(quest) === categoryFilter)

  const availableAtLocation = unlockedQuests.filter((quest) => {
    if (questStatus(game, quest.id) !== 'available') return false
    const check = canAcceptQuest(game, quest.id)
    return check.ok
  })

  const activeReadyToTurnIn = unlockedQuests.filter((quest) => {
    if (questStatus(game, quest.id) !== 'active') return false
    return canCompleteQuest(game, quest.id).ok
  })

  const filterOptions: Array<{ value: 'all' | 'main' | 'side' | 'sect' | 'secret'; label: string }> = [
    { value: 'all', label: word(locale, 'Tất cả', 'All') },
    { value: 'main', label: questCategoryLabel('main', locale) },
    { value: 'side', label: questCategoryLabel('side', locale) },
    { value: 'sect', label: questCategoryLabel('sect', locale) },
    { value: 'secret', label: questCategoryLabel('secret', locale) },
  ]

  return (
    <section aria-labelledby="quest-title">
      <div className="panel-heading compact">
        <h2 id="quest-title">{word(locale, 'Nhiệm vụ', 'Quests')}</h2>
        <span role="status">{questCountLabel(game, locale)}</span>
      </div>

      {/* Category filter bar */}
      <div className="quest-filter-bar" role="group" aria-label={word(locale, 'Lọc theo loại', 'Filter by category')}>
        {filterOptions.map((opt) => (
          <button
            key={opt.value}
            className={`quest-filter-tab ${categoryFilter === opt.value ? 'is-active' : ''}`}
            onClick={() => setCategoryFilter(opt.value)}
            type="button"
            aria-pressed={categoryFilter === opt.value}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Batch action buttons */}
      {(availableAtLocation.length > 0 || activeReadyToTurnIn.length > 0) && (
        <div className="quest-batch-actions" role="group" aria-label={word(locale, 'Hành động hàng loạt', 'Batch actions')}>
          {availableAtLocation.length > 0 && (
            <button
              className="quest-batch-btn accept-all"
              disabled={game.terminal || encounterLocked}
              onClick={() => onAction({ kind: 'accept_all_quests' })}
              type="button"
            >
              {word(locale, 'Nhận tất cả', 'Accept All')}
              <em className="batch-count">({availableAtLocation.length})</em>
            </button>
          )}
          {activeReadyToTurnIn.length > 0 && (
            <button
              className="quest-batch-btn claim-all"
              disabled={game.terminal || encounterLocked}
              onClick={() => onAction({ kind: 'claim_all_quests' })}
              type="button"
            >
              {word(locale, 'Nộp tất cả', 'Turn In All')}
              <em className="batch-count">({activeReadyToTurnIn.length})</em>
            </button>
          )}
        </div>
      )}

      <ul className="quest-list">
        {filteredQuests.map((quest) => {
          const status = questStatus(game, quest.id)
          const questSystem = quest.requiredSystemId === undefined ? null : activeSystem({ systemId: quest.requiredSystemId })
          const turnInReady = status === 'active' && canCompleteQuest(game, quest.id).ok
          const acceptCheck = status === 'available' ? canAcceptQuest(game, quest.id) : undefined
          const notAtLocation = acceptCheck !== undefined && !acceptCheck.ok && acceptCheck.code === 'NOT_AT_LOCATION'
          const reqLocId = acceptCheck !== undefined && !acceptCheck.ok ? acceptCheck.at : undefined
          const reqLocation = reqLocId ? getLocation(reqLocId) : undefined
          const reqLocationName = reqLocation ? localized(locale, reqLocation) : (reqLocId ?? '')
          const locBadge = notAtLocation ? (locale === 'vi' ? `Cần tới: ${reqLocationName}` : `Required location: ${reqLocationName}`) : null
          const activeStep = quest.steps[currentStepIndex(game, quest.id)] ?? quest.steps[0]
          const category = getQuestCategory(quest)

          return (
            <li key={quest.id} className={`quest-${status}`}>
              <div>
                <strong>{localized(locale, quest)}</strong>
                <span>{locale === 'vi' ? quest.descVi : quest.descEn}</span>
                <span className={`quest-category-badge quest-category-${category}`}>
                  {questCategoryLabel(category, locale)}
                </span>
                {questSystem !== null && <small className="system-quest-tag">{locale === 'vi' ? questSystem.headerVi : questSystem.headerEn} · {i18n(locale, 'system.difficulty')} {quest.difficulty}</small>}
                {locBadge && <span className="proto-system-quest-loc">{locBadge}</span>}
              </div>
              {status === 'active' && activeStep !== undefined && <p className="quest-step">{locale === 'vi' ? activeStep.descVi : activeStep.descEn}</p>}
              {status === 'available' && (
                <button
                  aria-label={`${word(locale, 'Nhận', 'Accept')}: ${nameFor(quest)}`}
                  disabled={game.terminal || encounterLocked || !canAcceptQuest(game, quest.id).ok}
                  onClick={() => onAction({ kind: quest.requiredSystemId === undefined ? 'accept_quest' : 'system_accept_quest', questId: quest.id })}
                  type="button"
                >
                  {quest.requiredSystemId === undefined ? word(locale, 'Nhận', 'Accept') : i18n(locale, 'system.acceptQuest')}
                </button>
              )}
              {status === 'active' && (
                <button
                  aria-label={`${word(locale, 'Nộp', 'Turn in')}: ${nameFor(quest)}`}
                  disabled={game.terminal || encounterLocked || !turnInReady}
                  onClick={() => onAction({ kind: quest.requiredSystemId === undefined ? 'complete_quest' : 'system_turn_in_quest', questId: quest.id })}
                  type="button"
                >
                  {quest.requiredSystemId === undefined ? word(locale, 'Nộp', 'Turn in') : i18n(locale, 'system.turnIn')}
                </button>
              )}
              {status === 'completed' && <em>{word(locale, 'Xong', 'Done')}</em>}
            </li>
          )
        })}
      </ul>
      {filteredQuests.length === 0 && (
        <p className="muted quest-empty">{word(locale, 'Không có nhiệm vụ nào trong mục này.', 'No quests in this category.')}</p>
      )}
    </section>
  )
}

export function DockPanelPeople({
  actionKind,
  encounterLocked,
  game,
  locale,
  onAction,
  onCloseJournal,
}: {
  actionKind: Action['kind'] | null
  encounterLocked: boolean
  game: GameState
  locale: Locale
  onAction: (action: Action) => void
  onCloseJournal: () => void
}): JSX.Element {
  const localNpcs = NPCS.filter((npc) => npc.locationId === game.player.locationId)
  const location = getLocation(game.player.locationId)
  return (
    <section aria-labelledby="people-title">
      <div className="panel-heading compact">
        <h2 id="people-title">{word(locale, 'Người ở đây', 'People here')}</h2>
        <span>{location === undefined ? game.player.locationId : localized(locale, location)}</span>
      </div>
      <p className="section-kicker npc-gallery-label">{word(locale, 'Những gương mặt của giang hồ', 'Faces of the wandering world')}</p>
      {localNpcs.length === 0
        ? <p className="muted">{word(locale, 'Chỉ có gió trả lời.', 'Only the wind answers.')}</p>
        : (
          <div className="npc-gallery">
            {localNpcs.map((npc) => (
              <article className={`npc-portrait-card ${actionKind === 'talk' ? 'is-speaking' : ''}`} data-npc-id={npc.id} key={npc.id}>
                <img alt={`${word(locale, 'Chân dung', 'Portrait of')} ${localized(locale, npc)}`} src={npcPortraitFor(npc.id)} />
                <div>
                  <strong>{localized(locale, npc)}</strong>
                  <span>{locale === 'vi' ? npc.roleVi : npc.roleEn}</span>
                  <button
                    aria-label={`${word(locale, 'Nói chuyện với', 'Talk to')} ${localized(locale, npc)}`}
                    disabled={game.terminal || encounterLocked}
                    onClick={() => { onCloseJournal(); onAction({ kind: 'talk', npcId: npc.id }) }}
                    type="button"
                  >
                    {word(locale, 'Nói chuyện', 'Talk')}
                  </button>
                </div>
              </article>
            ))}
          </div>
        )}
    </section>
  )
}

export const PeopleDockPanel = DockPanelPeople

export function ChronicleFeed({
  chronicle,
  chronicleKinds,
  chronicleRef,
  chronicleEndRef,
  chronicleNewAt,
  locale,
}: {
  chronicle: string[]
  chronicleKinds?: readonly string[]
  chronicleRef: RefObject<HTMLDivElement>
  chronicleEndRef: RefObject<HTMLLIElement>
  chronicleNewAt: number
  locale: Locale
}): JSX.Element {
  const visible = chronicle.slice(-8)
  const visibleStartIndex = chronicle.length - visible.length
  return (
    <div className="chronicle" aria-live="polite" aria-label={word(locale, 'Biên niên ký', 'Chronicle')} id="story-chronicle" ref={chronicleRef} tabIndex={-1}>
      <p className="section-kicker">{word(locale, 'Biên niên ký', 'Chronicle')}</p>
      <ol>
        {visible.map((line, index) => {
          const absoluteIndex = visibleStartIndex + index
          const kind = chronicleKinds?.[absoluteIndex]
          const isCrit = kind === 'combat_crit'
          const isCombat = kind === 'encounter_started' || kind === 'combat_hit' || kind === 'combat_won' || kind === 'combat_retreated'
          const isDefend = kind === 'combat_guarded'
          const isTrain = kind === 'trained'
          const colorClass = isCrit ? 'is-crit' : isCombat ? 'is-combat' : isDefend ? 'is-defend' : isTrain ? 'is-train' : undefined
          const kindKey = isCrit ? 'chronicle.kind.crit' : isCombat ? 'chronicle.kind.combat' : isDefend ? 'chronicle.kind.defend' : isTrain ? 'chronicle.kind.train' : undefined
          const ariaLabel = kindKey === undefined ? undefined : `${i18n(locale, kindKey)}: ${line}`
          return (
            <li
              aria-label={ariaLabel}
              className={`${index === chronicle.length - 1 && chronicle.length === chronicleNewAt ? 'is-new ' : ''}${colorClass ?? ''}`.trim()}
              data-kind={kind}
              key={absoluteIndex}
              ref={index === chronicle.length - 1 ? chronicleEndRef : undefined}
            >
              {line}
            </li>
          )
        })}
      </ol>
    </div>
  )
}
