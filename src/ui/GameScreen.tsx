import { FormEvent, useMemo, useState, type CSSProperties } from 'react'
import {
  ACHIEVEMENTS,
  CELLS,
  CHAPTERS,
  ENEMIES,
  ENDINGS,
  EQUIPMENT,
  ITEMS,
  MAP_HEIGHT,
  MAP_WIDTH,
  NPCS,
  QUESTS,
  SHOP_STOCK,
  TALENTS,
  TECHNIQUES,
  getItem,
  getLocation,
} from '../content'
import { currentBeat, dangerWarning, storageRemaining } from '../engine'
import type { Action, ConcreteAction, GameState, Locale } from '../engine'
import itemsStillLife from '../assets/art/items-still-life.png'
import protagonistPortrait from '../assets/art/protagonist-portrait.png'
import worldMapArt from '../assets/art/world-map-inkwash.png'
import { locationBackdropFor } from './locationArt'
import { npcPortraitFor } from './npcArt'
import { itemArtFor, talentArtFor, techniqueArtFor } from './rpgArt'
import { CodexPanel, type CodexEntry } from './CodexPanel'
import { ASSET_PACK_MANIFEST, type AssetPackId } from './assetPacks'

export interface GameScreenProps {
  actionKind?: Action['kind'] | null
  actionNonce?: number
  game: GameState
  locale: Locale
  chronicle: string[]
  onAction: (action: Action) => void
  onLocaleChange: (locale: Locale) => void
}

function word(locale: Locale, vi: string, en: string): string {
  return locale === 'vi' ? vi : en
}

function localized(locale: Locale, item: { nameVi: string; nameEn: string }): string {
  return locale === 'vi' ? item.nameVi : item.nameEn
}

function actionLabel(action: ConcreteAction, locale: Locale): string {
  switch (action.kind) {
    case 'move':
      return word(locale, `Đi ${directionLabel(action.direction, locale)}`, `Walk ${directionLabel(action.direction, locale)}`)
    case 'rest':
      return word(locale, 'Nghỉ dưỡng thương', 'Rest and recover')
    case 'train':
      return word(locale, 'Tu luyện', 'Cultivate')
    case 'gather':
      return word(locale, 'Hái linh thảo', 'Gather spirit herbs')
    case 'buy':
      return word(locale, `Mua ${itemName(action.itemId, locale)}`, `Buy ${itemName(action.itemId, locale)}`)
    case 'sell':
      return word(locale, `Bán ${itemName(action.itemId, locale)}`, `Sell ${itemName(action.itemId, locale)}`)
    case 'use_item':
      return word(locale, `Dùng ${itemName(action.itemId, locale)}`, `Use ${itemName(action.itemId, locale)}`)
    case 'store':
      return word(locale, `Gửi ${itemName(action.itemId, locale)}`, `Store ${itemName(action.itemId, locale)}`)
    case 'withdraw':
      return word(locale, `Lấy ${itemName(action.itemId, locale)}`, `Withdraw ${itemName(action.itemId, locale)}`)
    case 'draw_lottery':
      return word(locale, 'Quay vận mệnh', 'Draw fortune')
    case 'talk': {
      const npc = NPCS.find((entry) => entry.id === action.npcId)
      return word(locale, `Nói chuyện với ${npc === undefined ? action.npcId : localized(locale, npc)}`, `Speak to ${npc === undefined ? action.npcId : localized(locale, npc)}`)
    }
    case 'accept_quest':
      return word(locale, 'Nhận nhiệm vụ', 'Accept quest')
    case 'complete_quest':
      return word(locale, 'Hoàn thành nhiệm vụ', 'Complete quest')
    case 'choose_talent':
      return word(locale, 'Chọn thiên phú', 'Choose talent')
    case 'learn_technique':
      return word(locale, 'Học công pháp', 'Learn technique')
    case 'equip_item':
      return word(locale, `Trang bị ${itemName(action.itemId, locale)}`, `Equip ${itemName(action.itemId, locale)}`)
    case 'start_encounter':
      return word(locale, 'Đối mặt hiểm họa', 'Face the danger')
    case 'combat_attack':
      return word(locale, 'Xuất chiêu', 'Attack')
    case 'combat_defend':
      return word(locale, 'Thủ thế', 'Defend')
  }
}

function directionLabel(direction: 'north' | 'south' | 'east' | 'west', locale: Locale): string {
  const labels = {
    north: word(locale, 'bắc', 'north'),
    south: word(locale, 'nam', 'south'),
    east: word(locale, 'đông', 'east'),
    west: word(locale, 'tây', 'west'),
  }
  return labels[direction]
}

function itemName(itemId: string, locale: Locale): string {
  const item = getItem(itemId)
  return item === undefined ? itemId : localized(locale, item)
}

function npcPackId(locationId: string): AssetPackId {
  const packs: Record<string, AssetPackId> = {
    village: 'greenwood-village',
    market: 'cloud-market',
    sect: 'mist-sect',
    herb_field: 'herb-terraces',
    misty_forest: 'misty-forest',
    sealed_cave: 'sealed-cave',
    cursed_rift: 'cursed-rift',
    cloud_peak: 'cloud-peak',
  }
  return packs[locationId] ?? 'cloud-peak'
}

export function GameScreen({ actionKind = null, actionNonce = 0, game, locale, chronicle, onAction, onLocaleChange }: GameScreenProps) {
  const [command, setCommand] = useState('')
  const [codexOpen, setCodexOpen] = useState(false)
  const beat = useMemo(() => currentBeat(game), [game])
  const chapter = CHAPTERS.find((entry) => entry.index === beat.chapter) ?? {
    index: 1,
    nameVi: 'Chương một',
    nameEn: 'Chapter One',
    taglineVi: 'Đường mới mở ra.',
    taglineEn: 'A new road opens.',
  }
  const location = getLocation(game.player.locationId)
  const warning = dangerWarning(game.player.locationId)
  const localNpcs = NPCS.filter((npc) => npc.locationId === game.player.locationId)
  const ending = game.endingId === null ? undefined : ENDINGS.find((entry) => entry.id === game.endingId)
  const entries = Object.entries(game.inventory).filter(([, qty]) => qty > 0)
  const stored = Object.entries(game.storage).filter(([, qty]) => qty > 0)
  const encounterEnemy = game.encounter === null ? undefined : ENEMIES.find((enemy) => enemy.id === game.encounter?.enemyId)
  const localEnemy = ENEMIES.find((enemy) => enemy.locationId === game.player.locationId)
  const knownTechniques = TECHNIQUES.filter((technique) => (game.techniques[technique.id] ?? 0) > 0)
  const encounterLocked = game.encounter !== null
  const sceneBackdrop = locationBackdropFor(game.player.locationId) ?? worldMapArt
  const sceneBackdropAlt = location === undefined
    ? word(locale, 'Bản đồ khu vực chưa được đặt tên', 'World map for an uncharted area')
    : word(locale, `Minh họa ${localized(locale, location)}`, `Artwork of ${localized(locale, location)}`)
  const codexEntries: CodexEntry[] = codexOpen ? [
    ...NPCS.map((npc) => ({
      id: npc.id,
      kind: 'npc' as const,
      nameVi: npc.nameVi,
      nameEn: npc.nameEn,
      descriptionVi: npc.roleVi,
      descriptionEn: npc.roleEn,
      assetPackId: npcPackId(npc.locationId),
      assetStatus: 'ready' as const,
      artworkSrc: npcPortraitFor(npc.id),
    })),
    ...ITEMS.map((item) => ({
      id: item.id,
      kind: 'item' as const,
      nameVi: item.nameVi,
      nameEn: item.nameEn,
      descriptionVi: item.descVi,
      descriptionEn: item.descEn,
      assetPackId: 'items-and-equipment' as const,
      assetStatus: 'ready' as const,
      artworkSrc: itemArtFor(item.id),
    })),
    ...TALENTS.map((talent) => ({
      id: talent.id,
      kind: 'talent' as const,
      nameVi: talent.nameVi,
      nameEn: talent.nameEn,
      descriptionVi: talent.descVi,
      descriptionEn: talent.descEn,
      assetPackId: 'talents-and-effects' as const,
      assetStatus: 'ready' as const,
      artworkSrc: talentArtFor(talent.id),
    })),
  ] : []

  const submitCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const raw = command.trim()
    if (raw.length === 0 || game.terminal) return
    onAction({ kind: 'free_text', raw })
    setCommand('')
  }

  return (
    <main className={`game-shell action-${actionKind ?? 'idle'}`} data-testid="game-screen">
      <header className="topbar">
        <div className="brand">
          <span className="brand-seal" aria-hidden="true">玄</span>
          <div>
            <p className="eyebrow">{word(locale, 'Kịch bản I · một mạng duy nhất', 'Scenario I · one life only')}</p>
            <h1>Phế Căn Ký <span>/ Tale of the Broken Root</span></h1>
          </div>
        </div>
        <div className="topbar-actions">
          <span className="day-chip">{word(locale, 'Ngày', 'Day')} {game.day}</span>
          <div className="language-toggle" role="group" aria-label="Language">
            <button className={locale === 'vi' ? 'active' : ''} onClick={() => onLocaleChange('vi')} type="button">VI</button>
            <button className={locale === 'en' ? 'active' : ''} onClick={() => onLocaleChange('en')} type="button">EN</button>
          </div>
        </div>
      </header>

      <section className="chapter-banner" aria-label={word(locale, 'Chương truyện hiện tại', 'Current story chapter')}>
        <p>{word(locale, 'Chương hiện tại', 'Current chapter')}</p>
        <h2>{localized(locale, chapter)}</h2>
        <span>{locale === 'vi' ? chapter.taglineVi : chapter.taglineEn}</span>
      </section>

      {warning !== null && (
        <section className={`danger-banner danger-${warning.level}`} role="status">
          <strong>⚠ {word(locale, 'Cảnh báo hiểm địa', 'Danger warning')}</strong>
          <span>{locale === 'vi' ? warning.messageVi : warning.messageEn}</span>
        </section>
      )}

      {game.terminal && ending !== undefined && (
        <section className="ending-banner" role="status">
          <p>{word(locale, 'Kết cục đã định', 'Your ending')}</p>
          <h2>{localized(locale, ending)}</h2>
          <span>{locale === 'vi' ? ending.epitaphVi : ending.epitaphEn}</span>
        </section>
      )}

      {encounterEnemy !== undefined && game.encounter !== null && (
        <section aria-live="polite" className="encounter-banner" role="status" aria-label={word(locale, 'Giao chiến đang diễn ra', 'Active encounter')}>
          <div>
            <p className="eyebrow">{word(locale, 'Giao chiến deterministic', 'Deterministic encounter')}</p>
            <h2>{localized(locale, encounterEnemy)}</h2>
            <span>{word(locale, 'Sinh lực địch', 'Enemy health')}: {game.encounter.hp}/{game.encounter.maxHp}</span>
          </div>
          <div className="encounter-actions">
            {knownTechniques.map((technique) => <button key={technique.id} onClick={() => onAction({ kind: 'combat_attack', techniqueId: technique.id })} type="button">{word(locale, 'Xuất', 'Use')} {localized(locale, technique)}</button>)}
            <button onClick={() => onAction({ kind: 'combat_defend' })} type="button">{word(locale, 'Thủ thế', 'Defend')}</button>
          </div>
        </section>
      )}

      {game.encounter === null && localEnemy !== undefined && game.flags[`defeated_${localEnemy.id}`] !== true && (
        <section className="encounter-banner encounter-ready" aria-label={word(locale, 'Gặp gỡ hiểm họa', 'Encounter available')}>
          <div><p className="eyebrow">{word(locale, 'Hiểm họa trong khu vực', 'Local danger')}</p><h2>{localized(locale, localEnemy)}</h2><span>{locale === 'vi' ? localEnemy.descVi : localEnemy.descEn}</span></div>
          <button onClick={() => onAction({ kind: 'start_encounter' })} type="button">{word(locale, 'Bước vào giao chiến', 'Start encounter')}</button>
        </section>
      )}

      <div className="game-grid">
        <section className="map-panel parchment-panel" aria-labelledby="map-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{word(locale, 'WASD / phím mũi tên', 'WASD / arrow keys')}</p>
              <h2 id="map-title">{word(locale, 'Bản đồ hành trình', 'Journey map')}</h2>
            </div>
            <span className="location-label" data-testid="location-label">{location === undefined ? game.player.locationId : localized(locale, location)}</span>
          </div>
          <div
            className="world-map illustrated-map"
            aria-label={word(locale, 'Bản đồ thế giới tu tiên', 'Illustrated cultivation world map')}
            style={{ '--map-columns': MAP_WIDTH, '--map-rows': MAP_HEIGHT } as CSSProperties}
          >
            <img alt={word(locale, 'Bản đồ thế giới tu tiên', 'Illustrated cultivation world map')} className="world-map-art" src={worldMapArt} />
            <div className="map-grid-overlay" aria-hidden="true">
              {CELLS.map((cell) => {
                const isPlayer = cell.x === game.player.posX && cell.y === game.player.posY
                const loc = cell.locationId === undefined ? undefined : getLocation(cell.locationId)
                return (
                  <div className="map-cell" key={`${cell.x}-${cell.y}`}>
                    {loc !== undefined && <span className="map-location-pin" title={localized(locale, loc)} />}
                    {isPlayer && <span className={`player-map-marker action-${actionKind ?? 'idle'}`} data-testid="player-map-marker" key={`player-${actionNonce}`} title={word(locale, 'Nhân vật của bạn', 'Your character')} />}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="map-legend" aria-label={word(locale, 'Chú giải bản đồ', 'Map legend')}>
            <span><i className="legend-player" />{word(locale, 'Ngươi', 'You')}</span>
            <span><i className="legend-town" />{word(locale, 'Địa điểm', 'Location')}</span>
            <span>{word(locale, 'Di chuyển bằng bàn phím; địa hình nước và núi bị chặn.', 'Move by keyboard; water and mountains block travel.')}</span>
          </div>
        </section>

        <section className="story-panel parchment-panel" aria-labelledby="story-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{word(locale, 'Cốt truyện deterministic', 'Deterministic story')}</p>
              <h2 id="story-title">{locale === 'vi' ? beat.titleVi : beat.titleEn}</h2>
            </div>
            <span className="root-badge">{word(locale, 'Linh căn', 'Spirit root')}: {locale === 'vi' ? game.spiritRoot.elementVi : game.spiritRoot.elementEn}</span>
          </div>
          <figure className="scene-backdrop">
            <img alt={sceneBackdropAlt} src={sceneBackdrop} />
          </figure>
          <p className="beat-copy">{locale === 'vi' ? beat.textVi : beat.textEn}</p>

          <div className="choice-area">
            <p className="section-kicker">{word(locale, 'Lựa chọn của ngươi', 'Your choices')}</p>
            <div className="story-choices">
              {beat.suggested.map((action, index) => (
                <button
                  className="choice-button"
                  disabled={game.terminal || encounterLocked}
                  key={`${action.kind}-${index}`}
                  onClick={() => onAction(action)}
                  type="button"
                >
                  <span>{index + 1}</span>
                  {actionLabel(action, locale)}
                </button>
              ))}
            </div>
          </div>

          <form className="command-form" onSubmit={submitCommand}>
            <label htmlFor="free-command">{word(locale, 'Viết hành động khác', 'Write another action')}</label>
            <div>
              <input
                disabled={game.terminal}
                id="free-command"
                maxLength={180}
                onChange={(event) => setCommand(event.target.value)}
                placeholder={word(locale, 'Ví dụ: nói chuyện với cụ Mai Hoa', 'Example: talk to Elder Meihua')}
                value={command}
              />
              <button disabled={game.terminal || command.trim().length === 0} type="submit">{word(locale, 'Thử vận', 'Act')}</button>
            </div>
            <small>{word(locale, 'Điều vô lý sẽ được người kể chuyện đưa về một lựa chọn hợp lệ sau vài lượt.', 'Absurd actions are guided back to a valid path after a few turns.')}</small>
          </form>

          <div className="chronicle" aria-live="polite" aria-label={word(locale, 'Biên niên ký', 'Chronicle')}>
            <p className="section-kicker">{word(locale, 'Biên niên ký', 'Chronicle')}</p>
            <ol>
              {chronicle.slice(-8).map((line, index) => <li key={`${line}-${index}`}>{line}</li>)}
            </ol>
          </div>
        </section>

        <aside className="hud-panel">
          <section className="stats-card ink-card" aria-labelledby="stats-title">
            <div className="panel-heading compact"><h2 id="stats-title">{word(locale, 'Tu vi', 'Cultivation')}</h2><span>{word(locale, 'cảnh', 'stage')} {game.player.stage}</span></div>
            <figure className={`protagonist-portrait ${actionKind === 'train' ? 'is-cultivating' : actionKind === 'rest' ? 'is-resting' : ''}`}>
              <img alt={word(locale, 'Chân dung nhân vật chính', 'Protagonist portrait')} src={protagonistPortrait} />
            </figure>
            <Meter label="HP" value={game.player.hp} max={100} tone="red" />
            <Meter label="Qi" value={game.player.qi} max={60} tone="jade" />
            <Meter label={word(locale, 'Tiến độ', 'Progress')} value={game.player.progress} max={120} tone="gold" />
            <div className="stat-strip">
              <span>◎ {game.player.gold} {word(locale, 'vàng', 'gold')}</span>
              <span>{word(locale, 'Căn hiệu', 'root rate')} {Math.round(game.spiritRoot.efficiency * 100)}%</span>
            </div>
            <dl className="attributes">
              <div><dt>{word(locale, 'Thân', 'Body')}</dt><dd>{game.player.attrs.body}</dd></div>
              <div><dt>{word(locale, 'Tâm', 'Mind')}</dt><dd>{game.player.attrs.mind}</dd></div>
              <div><dt>{word(locale, 'Mị', 'Charm')}</dt><dd>{game.player.attrs.charm}</dd></div>
              <div><dt>{word(locale, 'Vận', 'Luck')}</dt><dd>{game.player.attrs.luck}</dd></div>
            </dl>
          </section>

          <section className="quick-actions ink-card" aria-label={word(locale, 'Thao tác nhanh', 'Quick actions')}>
            <button disabled={game.terminal || encounterLocked} onClick={() => onAction({ kind: 'rest' })} type="button">{word(locale, 'Nghỉ', 'Rest')}</button>
            <button disabled={game.terminal || encounterLocked} onClick={() => onAction({ kind: 'train' })} type="button">{word(locale, 'Tu luyện', 'Cultivate')}</button>
            <button disabled={game.terminal || encounterLocked} onClick={() => onAction({ kind: 'gather' })} type="button">{word(locale, 'Hái thảo', 'Gather')}</button>
            <button disabled={game.terminal || encounterLocked} onClick={() => onAction({ kind: 'draw_lottery' })} type="button">{word(locale, 'Quay', 'Draw')}</button>
          </section>
        </aside>
      </div>

      <div className="lower-grid">
        <section className="parchment-panel utility-panel people-panel" aria-labelledby="people-title">
          <div className="panel-heading compact"><h2 id="people-title">{word(locale, 'Người ở đây', 'People here')}</h2><span>{localNpcs.length}</span></div>
          <p className="section-kicker npc-gallery-label">{word(locale, 'Những gương mặt của giang hồ', 'Faces of the wandering world')}</p>
          {localNpcs.length === 0 ? <p className="muted">{word(locale, 'Chỉ có gió trả lời.', 'Only the wind answers.')}</p> : (
            <div className="npc-gallery">
              {localNpcs.map((npc) => (
                <article className={`npc-portrait-card ${actionKind === 'talk' ? 'is-speaking' : ''}`} data-npc-id={npc.id} key={npc.id}>
                  <img alt={`${word(locale, 'Chân dung', 'Portrait of')} ${localized(locale, npc)}`} src={npcPortraitFor(npc.id)} />
                  <div><strong>{localized(locale, npc)}</strong><span>{locale === 'vi' ? npc.roleVi : npc.roleEn}</span><button disabled={game.terminal || encounterLocked} onClick={() => onAction({ kind: 'talk', npcId: npc.id })} type="button">{word(locale, 'Nói chuyện', 'Talk')}</button></div>
                </article>
              ))}
            </div>
          )}
        </section>

        <section className="parchment-panel utility-panel" aria-labelledby="quest-title">
          <div className="panel-heading compact"><h2 id="quest-title">{word(locale, 'Nhiệm vụ', 'Quests')}</h2><span>{QUESTS.filter((quest) => game.quests[quest.id]?.status === 'completed').length}/{QUESTS.length}</span></div>
          <ul className="quest-list">
            {QUESTS.map((quest) => {
              const status = game.quests[quest.id]?.status ?? 'available'
              return <li key={quest.id} className={`quest-${status}`}>
                <div><strong>{localized(locale, quest)}</strong><span>{locale === 'vi' ? quest.descVi : quest.descEn}</span></div>
                {status === 'available' && <button disabled={game.terminal || encounterLocked} onClick={() => onAction({ kind: 'accept_quest', questId: quest.id })} type="button">{word(locale, 'Nhận', 'Accept')}</button>}
                {status === 'active' && <button disabled={game.terminal || encounterLocked} onClick={() => onAction({ kind: 'complete_quest', questId: quest.id })} type="button">{word(locale, 'Nộp', 'Turn in')}</button>}
                {status === 'completed' && <em>{word(locale, 'Xong', 'Done')}</em>}
              </li>
            })}
          </ul>
        </section>

        <section className="parchment-panel utility-panel" aria-labelledby="inventory-title">
          <div className="panel-heading compact"><h2 id="inventory-title">{word(locale, 'Túi đồ & kho', 'Inventory & storage')}</h2><span>{storageRemaining(game)} {word(locale, 'ô kho', 'storage left')}</span></div>
          <img alt={word(locale, 'Bộ sưu tập vật phẩm tu tiên', 'Cultivation item collection')} className={`item-collection-art ${actionKind === 'use_item' ? 'is-used' : ''}`} src={itemsStillLife} />
          <ul className="item-list">
            {entries.length === 0 ? <li className="muted">{word(locale, 'Túi trống.', 'Your bag is empty.')}</li> : entries.map(([id, qty]) => {
              const item = getItem(id)
              const artwork = itemArtFor(id)
              return <li key={id}>{artwork !== undefined && <img alt={word(locale, `Minh họa ${itemName(id, locale)}`, `Artwork of ${itemName(id, locale)}`)} className="item-art-thumb" src={artwork} />}<div className="item-copy"><strong>{itemName(id, locale)} ×{qty}</strong><span>{item === undefined ? '' : locale === 'vi' ? item.descVi : item.descEn}</span></div><div className="item-actions">{item?.usable && <button disabled={game.terminal} onClick={() => onAction({ kind: 'use_item', itemId: id })} type="button">{word(locale, 'Dùng', 'Use')}</button>}<button disabled={game.terminal || encounterLocked} onClick={() => onAction({ kind: 'store', itemId: id, qty: 1 })} type="button">{word(locale, 'Gửi', 'Store')}</button></div></li>
            })}
          </ul>
          {stored.length > 0 && <div className="storage-list"><p className="section-kicker">{word(locale, 'Trong kho', 'In storage')}</p>{stored.map(([id, qty]) => <button disabled={game.terminal || encounterLocked} key={id} onClick={() => onAction({ kind: 'withdraw', itemId: id, qty: 1 })} type="button">{itemName(id, locale)} ×{qty} · {word(locale, 'lấy', 'take')}</button>)}</div>}
        </section>

        <section className="parchment-panel utility-panel" aria-labelledby="market-title">
          <div className="panel-heading compact"><h2 id="market-title">{word(locale, 'Chợ & thành tựu', 'Market & achievements')}</h2><span>{game.achievements.length}/{ACHIEVEMENTS.length}</span></div>
          <div className="shop-list">
            {SHOP_STOCK.map((id) => {
              const item = getItem(id)
              if (item === undefined || item.buyPrice === null) return null
              return <div key={id}><span>{itemName(id, locale)} · {item.buyPrice}◎</span><button disabled={game.terminal || encounterLocked || game.player.locationId !== 'market'} onClick={() => onAction({ kind: 'buy', itemId: id })} type="button">{word(locale, 'Mua', 'Buy')}</button></div>
            })}
          </div>
          <div className="achievements">
            {ACHIEVEMENTS.map((achievement) => <span className={game.achievements.includes(achievement.id) ? 'unlocked' : ''} key={achievement.id} title={locale === 'vi' ? achievement.descVi : achievement.descEn}>{localized(locale, achievement)}</span>)}
          </div>
        </section>
      </div>

      <section className="rpg-systems parchment-panel" aria-labelledby="rpg-systems-title">
        <div className="panel-heading compact"><h2 id="rpg-systems-title">{word(locale, 'Đạo đồ & trang bị', 'Path & equipment')}</h2><span>{word(locale, 'có thể mở rộng bằng data', 'data-driven')}</span></div>
        <div className="rpg-system-grid">
          <section>
            <h3>{word(locale, 'Thiên phú', 'Talents')}</h3>
            {TALENTS.map((talent) => {
              const chosen = game.talents.includes(talent.id)
              const unavailable = !talent.selectable || game.player.stage < talent.requiredStage || game.talents.some((id) => TALENTS.find((entry) => entry.id === id)?.selectable === true)
              return <div className="rpg-entry art-entry" key={talent.id}><img alt={word(locale, `Minh họa ${localized(locale, talent)}`, `Artwork of ${localized(locale, talent)}`)} src={talentArtFor(talent.id)} /><div><strong>{localized(locale, talent)}</strong><span>{locale === 'vi' ? talent.descVi : talent.descEn}</span></div>{chosen ? <em>{word(locale, 'Đã chọn', 'Chosen')}</em> : <button disabled={game.terminal || encounterLocked || unavailable} onClick={() => onAction({ kind: 'choose_talent', talentId: talent.id })} type="button">{word(locale, 'Chọn', 'Choose')}</button>}</div>
            })}
          </section>
          <section>
            <h3>{word(locale, 'Công pháp', 'Techniques')}</h3>
            {TECHNIQUES.map((technique) => {
              const level = game.techniques[technique.id] ?? 0
              const canLearn = technique.sourceItemId !== undefined && (game.inventory[technique.sourceItemId] ?? 0) > 0 && level < technique.maxLevel && game.player.stage >= technique.requiredStage
              return <div className="rpg-entry art-entry" key={technique.id}><img alt={word(locale, `Minh họa ${localized(locale, technique)}`, `Artwork of ${localized(locale, technique)}`)} src={techniqueArtFor(technique.id)} /><div><strong>{localized(locale, technique)} {level > 0 ? `· Lv.${level}` : ''}</strong><span>{locale === 'vi' ? technique.descVi : technique.descEn}</span></div>{level > 0 ? <em>{word(locale, 'Đã học', 'Learned')}</em> : <button disabled={game.terminal || encounterLocked || !canLearn} onClick={() => onAction({ kind: 'learn_technique', techniqueId: technique.id })} type="button">{word(locale, 'Lĩnh ngộ', 'Learn')}</button>}</div>
            })}
          </section>
          <section>
            <h3>{word(locale, 'Trang bị', 'Equipment')}</h3>
            {EQUIPMENT.map((equipment) => {
              const equipped = game.equipment[equipment.slot] === equipment.itemId
              const owned = (game.inventory[equipment.itemId] ?? 0) > 0
              return <div className="rpg-entry art-entry" key={equipment.id}><img alt={word(locale, `Minh họa ${localized(locale, equipment)}`, `Artwork of ${localized(locale, equipment)}`)} src={itemArtFor(equipment.itemId)} /><div><strong>{localized(locale, equipment)}</strong><span>{locale === 'vi' ? equipment.descVi : equipment.descEn}</span></div>{equipped ? <em>{word(locale, 'Đang dùng', 'Equipped')}</em> : <button disabled={game.terminal || !owned || game.encounter !== null} onClick={() => onAction({ kind: 'equip_item', itemId: equipment.itemId })} type="button">{word(locale, 'Trang bị', 'Equip')}</button>}</div>
            })}
          </section>
        </div>
      </section>

      <details className="codex-drawer" data-testid="codex-drawer" onToggle={(event) => setCodexOpen(event.currentTarget.open)} open={codexOpen}>
        <summary>{word(locale, 'Mở tu điển: NPC, vật phẩm, thiên phú & asset pack', 'Open codex: NPCs, items, talents & asset packs')}</summary>
        {codexOpen && <CodexPanel entries={codexEntries} locale={locale} packs={ASSET_PACK_MANIFEST} />}
      </details>
    </main>
  )
}

interface MeterProps {
  label: string
  value: number
  max: number
  tone: 'red' | 'jade' | 'gold'
}

function Meter({ label, value, max, tone }: MeterProps) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  return <div className="meter"><div><span>{label}</span><strong>{value}/{max}</strong></div><span className={`meter-track ${tone}`}><i style={{ width: `${percent}%` }} /></span></div>
}
