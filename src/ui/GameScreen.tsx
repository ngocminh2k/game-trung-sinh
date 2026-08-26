import { FormEvent, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import {
  ACHIEVEMENTS,
  CHAPTERS,
  ENEMIES,
  ENDINGS,
  EQUIPMENT,
  ITEMS,
  LOCATIONS,
  MAP_HEIGHT,
  MAP_WIDTH,
  NPCS,
  QUESTS,
  SHOP_STOCK,
  TALENTS,
  TECHNIQUES,
  getItem,
  getLocation,
  getRegionMap,
} from '../content'
import { currentBeat, dangerWarning, storageRemaining } from '../engine'
import type { Action, ConcreteAction, GameState, Locale } from '../engine'
import itemsStillLife from '../assets/art/items-still-life.png'
import worldMapArt from '../assets/art/world-map-inkwash.png'
import { locationBackdropFor } from './locationArt'
import { npcPortraitFor } from './npcArt'
import { itemArtFor, talentArtFor, techniqueArtFor } from './rpgArt'
import { CodexPanel, type CodexEntry } from './CodexPanel'
import { ASSET_PACK_MANIFEST, type AssetPackId } from './assetPacks'
import { playerArtFor, type PlayerActionKey } from './playerArt'

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

function stageRequirement(locale: Locale, stage: number): string {
  return word(locale, `Yêu cầu cảnh giới ${String(stage)}`, `Requires realm ${String(stage)}`)
}

function obscuredName(locale: Locale, kind: 'talent' | 'technique' | 'equipment'): string {
  const names = {
    talent: word(locale, 'Thiên phú chưa thức tỉnh', 'Dormant talent'),
    technique: word(locale, 'Công pháp chưa gặp cơ duyên', 'Technique not yet encountered'),
    equipment: word(locale, 'Trang bị chưa sở hữu', 'Equipment not yet acquired'),
  }
  return names[kind]
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

function playerPoseFor(actionKind: Action['kind'] | null, game: GameState, showHurtFeedback: boolean): PlayerActionKey {
  if (game.terminal && !game.player.alive) return 'death'
  if (showHurtFeedback) return 'hurt'

  switch (actionKind) {
    case 'move': return 'move'
    case 'talk': return 'talk'
    case 'gather': return 'gather'
    case 'train': return 'cultivate'
    case 'rest': return 'rest'
    case 'use_item': return 'use-item'
    case 'combat_attack': return 'combat-attack'
    case 'combat_defend': return 'combat-defend'
    default: return 'idle'
  }
}

type DockPanel = 'people' | 'quests' | 'inventory' | 'market' | 'path'
const DOCK_PANELS: DockPanel[] = ['people', 'quests', 'inventory', 'market', 'path']

function contextualDockFor(locationId: string): DockPanel {
  if (locationId === 'market') return 'market'
  if (locationId === 'sect') return 'inventory'
  if (locationId === 'misty_forest' || locationId === 'sealed_cave' || locationId === 'cursed_rift') return 'path'
  return 'people'
}

function moveDockFocus(event: KeyboardEvent<HTMLButtonElement>, current: DockPanel, selectPanel: (panel: DockPanel) => void): void {
  const currentIndex = DOCK_PANELS.indexOf(current)
  const nextIndex = event.key === 'ArrowRight' ? (currentIndex + 1) % DOCK_PANELS.length
    : event.key === 'ArrowLeft' ? (currentIndex - 1 + DOCK_PANELS.length) % DOCK_PANELS.length
      : event.key === 'Home' ? 0
        : event.key === 'End' ? DOCK_PANELS.length - 1
          : currentIndex
  if (nextIndex === currentIndex && !['ArrowRight', 'ArrowLeft', 'Home', 'End'].includes(event.key)) return

  event.preventDefault()
  const next = DOCK_PANELS[nextIndex]!
  selectPanel(next)
  document.getElementById(`dock-tab-${next}`)?.focus()
}

export function GameScreen({ actionKind = null, actionNonce = 0, game, locale, chronicle, onAction, onLocaleChange }: GameScreenProps) {
  const [command, setCommand] = useState('')
  const [codexOpen, setCodexOpen] = useState(false)
  const [activeDock, setActiveDock] = useState<DockPanel>(() => contextualDockFor(game.player.locationId))
  const [hurtFeedbackNonce, setHurtFeedbackNonce] = useState<number | null>(null)
  const previousHp = useRef(game.player.hp)
  const processedActionNonce = useRef<number | null>(null)
  const previousLocationId = useRef(game.player.locationId)
  const retaliationAction = actionKind === 'combat_attack'
    || actionKind === 'combat_defend'
    || (actionKind === 'use_item' && game.encounter !== null)
  const showHurtFeedback = hurtFeedbackNonce === actionNonce
  const playerPose = playerPoseFor(actionKind, game, showHurtFeedback)
  useEffect(() => {
    if (processedActionNonce.current === actionNonce) return

    const tookDamage = game.player.hp < previousHp.current
    previousHp.current = game.player.hp
    processedActionNonce.current = actionNonce
    setHurtFeedbackNonce(null)
    if (!tookDamage || !game.player.alive) return

    const timer = window.setTimeout(() => setHurtFeedbackNonce(actionNonce), retaliationAction ? 420 : 220)
    return () => window.clearTimeout(timer)
  }, [actionNonce, game.player.alive, game.player.hp, retaliationAction])
  useEffect(() => {
    if (previousLocationId.current === game.player.locationId) return
    previousLocationId.current = game.player.locationId
    setActiveDock(contextualDockFor(game.player.locationId))
  }, [game.player.locationId])
  const beat = useMemo(() => currentBeat(game), [game])
  const chapter = CHAPTERS.find((entry) => entry.index === beat.chapter) ?? {
    index: 1,
    nameVi: 'Chương một',
    nameEn: 'Chapter One',
    taglineVi: 'Đường mới mở ra.',
    taglineEn: 'A new road opens.',
  }
  const location = getLocation(game.player.locationId)
  const regionMap = getRegionMap(game.player.locationId)
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
      assetStatus: itemArtFor(item.id) === undefined ? 'queued' as const : 'ready' as const,
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
      assetStatus: talentArtFor(talent.id) === undefined ? 'queued' as const : 'ready' as const,
      artworkSrc: talentArtFor(talent.id),
    })),
    ...TECHNIQUES.map((technique) => ({
      id: technique.id,
      kind: 'technique' as const,
      nameVi: technique.nameVi,
      nameEn: technique.nameEn,
      descriptionVi: technique.descVi,
      descriptionEn: technique.descEn,
      assetPackId: 'talents-and-effects' as const,
      assetStatus: techniqueArtFor(technique.id) === undefined ? 'queued' as const : 'ready' as const,
      artworkSrc: techniqueArtFor(technique.id),
    })),
    ...LOCATIONS.map((location) => ({
      id: location.id,
      kind: 'location' as const,
      nameVi: location.nameVi,
      nameEn: location.nameEn,
      descriptionVi: location.descVi,
      descriptionEn: location.descEn,
      assetPackId: npcPackId(location.id),
      assetStatus: 'ready' as const,
      artworkSrc: locationBackdropFor(location.id),
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

      <div className="stage-notices">
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
              <p className="eyebrow">{word(locale, 'Giao tranh sinh tử', 'Deterministic encounter')}</p>
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
      </div>

      <div className="game-grid">
        <section className="map-panel parchment-panel" aria-labelledby="map-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{word(locale, 'WASD / phím mũi tên', 'WASD / arrow keys')}</p>
              <h2 id="map-title">{word(locale, 'Bản đồ khu vực', 'Local area map')}</h2>
            </div>
            <span className="location-label" data-testid="location-label">{location === undefined ? game.player.locationId : localized(locale, location)}</span>
          </div>
          <div
            className="world-map illustrated-map regional-map"
            aria-label={word(locale, 'Bản đồ khu vực có lối ra và điểm sự kiện', 'Local area map with exits and event nodes')}
            style={{ '--map-columns': MAP_WIDTH, '--map-rows': MAP_HEIGHT } as CSSProperties}
          >
            <img alt="" aria-hidden="true" className="world-map-art" src={sceneBackdrop} />
            <div className="map-grid-overlay" aria-hidden="true">
              {(regionMap?.cells ?? []).map((cell) => {
                const isPlayer = cell.x === game.player.posX && cell.y === game.player.posY
                return (
                  <div className={`map-cell terrain-${cell.terrain}`} key={`${cell.x}-${cell.y}`}>
                    {cell.node !== undefined && <span className={`map-location-pin map-node node-${cell.node.kind}`} data-testid={`event-node-${cell.node.id}`} title={locale === 'vi' ? cell.node.nameVi : cell.node.nameEn} />}
                    {isPlayer && <span className={`player-map-marker action-${actionKind ?? 'idle'}`} data-testid="player-map-marker" key={`player-${actionNonce}`} title={word(locale, 'Nhân vật của bạn', 'Your character')} />}
                  </div>
                )
              })}
            </div>
          </div>
          <div className="map-legend" aria-label={word(locale, 'Chú giải bản đồ', 'Map legend')}>
            <span><i className="legend-player" />{word(locale, 'Ngươi', 'You')}</span>
            <span><i className="legend-town" />{word(locale, 'Điểm sự kiện / NPC', 'Event / NPC node')}</span>
            <span><i className="legend-exit" />{word(locale, 'Lối sang khu vực khác', 'Exit to another area')}</span>
            <span>{word(locale, 'Đi đến chấm sáng để gặp người, phát hiện sự kiện hoặc qua cổng. Nước và núi chặn lối.', 'Walk to a glowing point to meet people, find events, or use an exit. Water and mountains block the way.')}</span>
          </div>
        </section>

        <section className="story-panel parchment-panel" aria-labelledby="story-title">
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{word(locale, 'Mạch truyện', 'Deterministic story')}</p>
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
            <small>{word(locale, 'Cứ nói điều ngươi thật sự muốn làm; thế giới sẽ đáp lại theo lẽ của nó.', 'State what you truly mean to do; the world will answer in its own way.')}</small>
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
            <figure className={`protagonist-portrait player-action-art pose-${playerPose}`} data-pose={playerPose} data-testid="player-action-art">
              <img
                alt={word(locale, `Tư thế nhân vật: ${playerPose}`, `Player action pose: ${playerPose}`)}
                key={`player-pose-${playerPose}-${actionNonce}`}
                src={playerArtFor(playerPose)}
              />
            </figure>
            <Meter label="HP" value={game.player.hp} max={100} tone="red" />
            <Meter label="Qi" value={game.player.qi} max={60} tone="jade" />
            <Meter label={word(locale, 'Tiến độ', 'Progress')} value={game.player.progress} max={120} tone="gold" />
            <div className="stat-strip">
              <span>◎ {game.player.gold} {word(locale, 'vàng', 'gold')}</span>
              <span>{word(locale, 'Độ tương hợp', 'root rate')} {Math.round(game.spiritRoot.efficiency * 100)}%</span>
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

      <section className="system-dock parchment-panel" aria-labelledby="system-dock-title" data-testid="system-dock">
        <div className="dock-heading">
          <div>
            <p className="eyebrow">{word(locale, 'Mở khi cần', 'Open when needed')}</p>
            <h2 id="system-dock-title">{word(locale, 'Hành trang & giang hồ', 'Journey systems')}</h2>
          </div>
          <span>{word(locale, 'Không che đường tu hành', 'Keeps the play surface clear')}</span>
        </div>
        <div className="dock-tabs" aria-label={word(locale, 'Hệ thống phụ', 'Secondary systems')} role="tablist">
          {([
            ['people', word(locale, 'Người ở đây', 'People here'), localNpcs.length],
            ['quests', word(locale, 'Nhiệm vụ', 'Quests'), `${QUESTS.filter((quest) => game.quests[quest.id]?.status === 'completed').length}/${QUESTS.length}`],
            ['inventory', word(locale, 'Túi đồ & kho', 'Bag & storage'), entries.reduce((sum, [, qty]) => sum + qty, 0)],
            ['market', word(locale, 'Chợ & thành tựu', 'Market & deeds'), `${game.achievements.length}/${ACHIEVEMENTS.length}`],
            ['path', word(locale, 'Đạo đồ & trang bị', 'Path & equipment'), word(locale, 'tu vi', 'cultivation')],
          ] as const).map(([id, label, count]) => (
            <button
              aria-controls={`dock-panel-${id}`}
              aria-selected={activeDock === id}
              className={`dock-tab ${activeDock === id ? 'is-active' : ''} ${id === 'market' && game.player.locationId === 'market' ? 'is-contextual' : ''}`}
              id={`dock-tab-${id}`}
              key={id}
              onClick={() => setActiveDock(id)}
              onKeyDown={(event) => moveDockFocus(event, id, setActiveDock)}
              role="tab"
              tabIndex={activeDock === id ? 0 : -1}
              type="button"
            >
              <span>{label}</span><em>{count}</em>
            </button>
          ))}
        </div>

        {DOCK_PANELS.map((panel) => <div aria-labelledby={`dock-tab-${panel}`} className="dock-panel" hidden={activeDock !== panel} id={`dock-panel-${panel}`} key={panel} role="tabpanel">
          {activeDock === panel && <>
          {activeDock === 'people' && <section aria-labelledby="people-title">
            <div className="panel-heading compact"><h2 id="people-title">{word(locale, 'Người ở đây', 'People here')}</h2><span>{location === undefined ? game.player.locationId : localized(locale, location)}</span></div>
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
          </section>}

          {activeDock === 'quests' && <section aria-labelledby="quest-title">
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
          </section>}

          {activeDock === 'inventory' && <section aria-labelledby="inventory-title">
            <div className="panel-heading compact"><h2 id="inventory-title">{word(locale, 'Túi đồ & kho', 'Inventory & storage')}</h2><span>{storageRemaining(game)} {word(locale, 'ô kho', 'storage left')}</span></div>
            <p className="dock-context">{word(locale, 'Túi đồ luôn theo ngươi; kho ghi nhận vật phẩm đã gửi.', 'Your bag travels with you; storage records deposited items.')}</p>
            <img alt={word(locale, 'Bộ sưu tập vật phẩm tu tiên', 'Cultivation item collection')} className={`item-collection-art ${actionKind === 'use_item' ? 'is-used' : ''}`} src={itemsStillLife} />
            <ul className="item-list">
              {entries.length === 0 ? <li className="muted">{word(locale, 'Túi trống.', 'Your bag is empty.')}</li> : entries.map(([id, qty]) => {
                const item = getItem(id)
                const artwork = itemArtFor(id)
                return <li key={id}>{artwork !== undefined && <img alt={word(locale, `Minh họa ${itemName(id, locale)}`, `Artwork of ${itemName(id, locale)}`)} className="item-art-thumb" src={artwork} />}<div className="item-copy"><strong>{itemName(id, locale)} ×{qty}</strong><span>{item === undefined ? '' : locale === 'vi' ? item.descVi : item.descEn}</span></div><div className="item-actions">{item?.usable && <button disabled={game.terminal} onClick={() => onAction({ kind: 'use_item', itemId: id })} type="button">{word(locale, 'Dùng', 'Use')}</button>}<button disabled={game.terminal || encounterLocked} onClick={() => onAction({ kind: 'store', itemId: id, qty: 1 })} type="button">{word(locale, 'Gửi', 'Store')}</button></div></li>
              })}
            </ul>
            {stored.length > 0 && <div className="storage-list"><p className="section-kicker">{word(locale, 'Trong kho', 'In storage')}</p>{stored.map(([id, qty]) => <button disabled={game.terminal || encounterLocked} key={id} onClick={() => onAction({ kind: 'withdraw', itemId: id, qty: 1 })} type="button">{itemName(id, locale)} ×{qty} · {word(locale, 'lấy', 'take')}</button>)}</div>}
          </section>}

          {activeDock === 'market' && <section aria-labelledby="market-title">
            <div className="panel-heading compact"><h2 id="market-title">{word(locale, 'Chợ & thành tựu', 'Market & achievements')}</h2><span>{game.achievements.length}/{ACHIEVEMENTS.length}</span></div>
            <p className="dock-context">{game.player.locationId === 'market'
              ? word(locale, 'Ngươi đang ở Chợ Tụ Vân: có thể giao dịch ngay.', 'You are at Cloudgather Market: trade is available.')
              : word(locale, 'Chỉ giao dịch được tại Chợ Tụ Vân. Các món vẫn được ghi nhớ ở đây.', 'Trading is available only at Cloudgather Market. The wares remain listed here.')}</p>
            <div className="shop-list">
              {SHOP_STOCK.map((id) => {
                const item = getItem(id)
                if (item === undefined || item.buyPrice === null) return null
                const stageLocked = game.player.stage < (item.requiredStage ?? 0)
                return <div className={stageLocked ? 'is-locked' : ''} key={id}><span>{stageLocked ? `${word(locale, 'Hàng chưa mở', 'Sealed wares')} · ${stageRequirement(locale, item.requiredStage ?? 0)}` : `${itemName(id, locale)} · ${String(item.buyPrice)}◎`}</span><button disabled={game.terminal || encounterLocked || stageLocked || game.player.locationId !== 'market'} onClick={() => onAction({ kind: 'buy', itemId: id })} type="button">{stageLocked ? word(locale, 'Chưa mở', 'Locked') : word(locale, 'Mua', 'Buy')}</button></div>
              })}
            </div>
            <section aria-label={word(locale, 'Túi đồ tại chợ', 'Bag at market')} className="market-bag-summary">
              <p className="section-kicker">{word(locale, 'Hành lý sau giao dịch', 'Bag after trading')}</p>
              <ul className="item-list market-bag-list">
                {entries.length === 0 ? <li className="muted">{word(locale, 'Túi trống.', 'Your bag is empty.')}</li> : entries.map(([id, qty]) => <li key={id}><div className="item-copy"><strong>{itemName(id, locale)} ×{qty}</strong></div></li>)}
              </ul>
            </section>
            <div className="achievements">
              {ACHIEVEMENTS.map((achievement) => <span className={game.achievements.includes(achievement.id) ? 'unlocked' : ''} key={achievement.id} title={locale === 'vi' ? achievement.descVi : achievement.descEn}>{localized(locale, achievement)}</span>)}
            </div>
          </section>}

          {activeDock === 'path' && <section aria-labelledby="rpg-systems-title">
            <div className="panel-heading compact"><h2 id="rpg-systems-title">{word(locale, 'Đạo đồ & trang bị', 'Path & equipment')}</h2><span>{word(locale, 'có thể mở rộng bằng data', 'data-driven')}</span></div>
            <div className="rpg-system-grid">
              <section>
                <h3>{word(locale, 'Thiên phú', 'Talents')}</h3>
                {TALENTS.map((talent) => {
                  const chosen = game.talents.includes(talent.id)
                  const stageLocked = game.player.stage < talent.requiredStage
                  const tierTaken = game.talents.some((id) => TALENTS.find((entry) => entry.id === id)?.selectable === true && TALENTS.find((entry) => entry.id === id)?.tier === talent.tier)
                  const locked = !chosen && (stageLocked || tierTaken || !talent.selectable)
                  const artwork = talentArtFor(talent.id)
                  const status = chosen
                    ? word(locale, 'Đã chọn', 'Chosen')
                    : stageLocked
                      ? stageRequirement(locale, talent.requiredStage)
                      : tierTaken
                        ? word(locale, 'Đã chọn một thiên phú cùng tầng', 'A talent from this tier is chosen')
                        : word(locale, 'Bẩm sinh', 'Innate')
                  return <div className={`rpg-entry art-entry ${locked ? 'is-locked' : ''}`} key={talent.id}>{artwork !== undefined && <img alt={word(locale, `Minh họa ${localized(locale, talent)}`, `Artwork of ${localized(locale, talent)}`)} src={artwork} />}<div><strong>{locked ? obscuredName(locale, 'talent') : localized(locale, talent)}</strong><span>{locked ? status : locale === 'vi' ? talent.descVi : talent.descEn}</span></div>{chosen || locked ? <em>{status}</em> : <button disabled={game.terminal || encounterLocked} onClick={() => onAction({ kind: 'choose_talent', talentId: talent.id })} type="button">{word(locale, 'Chọn', 'Choose')}</button>}</div>
                })}
              </section>
              <section>
                <h3>{word(locale, 'Công pháp', 'Techniques')}</h3>
                {TECHNIQUES.map((technique) => {
                  const level = game.techniques[technique.id] ?? 0
                  const canLearn = technique.sourceItemId !== undefined && (game.inventory[technique.sourceItemId] ?? 0) > 0 && level < technique.maxLevel && game.player.stage >= technique.requiredStage
                  const stageLocked = game.player.stage < technique.requiredStage
                  const sourceHeld = technique.sourceItemId !== undefined && (game.inventory[technique.sourceItemId] ?? 0) > 0
                  const locked = level === 0 && (stageLocked || !sourceHeld)
                  const artwork = techniqueArtFor(technique.id)
                  const status = level > 0
                    ? word(locale, 'Đã học', 'Learned')
                    : stageLocked
                      ? stageRequirement(locale, technique.requiredStage)
                      : word(locale, 'Cần một cơ duyên', 'Requires a chance encounter')
                  return <div className={`rpg-entry art-entry ${locked ? 'is-locked' : ''}`} key={technique.id}>{artwork !== undefined && <img alt={word(locale, `Minh họa ${localized(locale, technique)}`, `Artwork of ${localized(locale, technique)}`)} src={artwork} />}<div><strong>{locked ? obscuredName(locale, 'technique') : `${localized(locale, technique)}${level > 0 ? ` · Lv.${level}` : ''}`}</strong><span>{locked ? status : locale === 'vi' ? technique.descVi : technique.descEn}</span></div>{level > 0 || locked ? <em>{status}</em> : <button disabled={game.terminal || encounterLocked || !canLearn} onClick={() => onAction({ kind: 'learn_technique', techniqueId: technique.id })} type="button">{word(locale, 'Lĩnh ngộ', 'Learn')}</button>}</div>
                })}
              </section>
              <section>
                <h3>{word(locale, 'Trang bị', 'Equipment')}</h3>
                {EQUIPMENT.map((equipment) => {
                  const equipped = game.equipment[equipment.slot] === equipment.itemId
                  const owned = (game.inventory[equipment.itemId] ?? 0) > 0
                  const item = getItem(equipment.itemId)
                  const stageLocked = game.player.stage < (item?.requiredStage ?? 0)
                  const locked = !equipped && (!owned || stageLocked)
                  const artwork = itemArtFor(equipment.itemId)
                  const status = equipped
                    ? word(locale, 'Đang dùng', 'Equipped')
                    : stageLocked
                      ? stageRequirement(locale, item?.requiredStage ?? 0)
                      : word(locale, 'Chưa sở hữu', 'Not owned')
                  return <div className={`rpg-entry art-entry ${locked ? 'is-locked' : ''}`} key={equipment.id}>{artwork !== undefined && <img alt={word(locale, `Minh họa ${localized(locale, equipment)}`, `Artwork of ${localized(locale, equipment)}`)} src={artwork} />}<div><strong>{locked ? obscuredName(locale, 'equipment') : localized(locale, equipment)}</strong><span>{locked ? status : locale === 'vi' ? equipment.descVi : equipment.descEn}</span></div>{equipped || locked ? <em>{status}</em> : <button disabled={game.terminal || game.encounter !== null} onClick={() => onAction({ kind: 'equip_item', itemId: equipment.itemId })} type="button">{word(locale, 'Trang bị', 'Equip')}</button>}</div>
                })}
              </section>
            </div>
          </section>}
          </>}
        </div>)}
            <details className="codex-drawer" data-testid="codex-drawer" onToggle={(event) => setCodexOpen(event.currentTarget.open)} open={codexOpen}>
              <summary>{word(locale, 'Mở tu điển: nhân vật, vật phẩm, thiên phú & gói minh họa', 'Open codex: NPCs, items, talents & asset packs')}</summary>
              {codexOpen && <CodexPanel entries={codexEntries} locale={locale} packs={ASSET_PACK_MANIFEST} />}
            </details>
      </section>

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
