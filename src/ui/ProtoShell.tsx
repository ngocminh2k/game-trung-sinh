import { useEffect, useRef, useState, type CSSProperties, type FormEvent } from 'react'
import type { Action, AttributeName, Direction, GameState, Locale } from '../engine'
import { ATTRIBUTE_MAX, BASIC_STRIKE_QI_COST, MAX_HP, MAX_QI, RETREAT_HP_COST, checkMoveFrom, currentBeat, nextStageThreshold } from '../engine'
import { CHAPTERS, ENEMIES, MAP_HEIGHT, MAP_WIDTH, NPCS, TECHNIQUES, getLocation, getRegionMap } from '../content'
import { REALM_STAGES } from './gameScreen/constants'
import { deriveObjective } from './objective'
import { LeftRailTabContent, LEFT_TAB_LABELS, type LeftTab } from './LeftRailTabContent'
import { NpcChatModal } from './NpcChatModal'
import { IconShowcaseModal } from './IconShowcaseModal'
import { exitPinArt, nodePinArt, npcPinArt } from './pinArt'
import { attrIconArt, tabIconArt, HUD_ICONS } from './uiIconArt'
import { playerArtFor, type PlayerActionKey } from './playerArt'
import { locationBackdropFor } from './locationArt'
import './proto-shell.css'

/* =========================================================================
 *  ProtoShell — Render UI giống prototype (5176 /?prototype=1) nhưng
 *  wire đầy đủ vào game state. Bọc bên trong <main class="game-shell">.
 * ========================================================================= */

type LeftMode = 'expanded' | 'icon' | 'hidden'
type RightMode = 'expanded' | 'mini' | 'hidden'
type TickerMode = '1' | 'full' | 'hidden'

/** action-<kind> trên .game-shell → pose khớp với ảnh trong art/player. */
const POSE_BY_ACTION: Record<string, PlayerActionKey> = {
  move: 'move',
  talk: 'talk',
  gather: 'gather',
  train: 'cultivate',
  rest: 'rest',
  use_item: 'use-item',
  combat_attack: 'combat-attack',
  combat_defend: 'combat-defend',
}

/** Tứ Tượng: thần/tâm/mạch/vận — đúng 4 attr trong engine.player.attrs. */
const TG_STATS: ReadonlyArray<{ attr: AttributeName; seal: string; vi: string; en: string }> = [
  { attr: 'charm', seal: '神', vi: 'THẦN', en: 'SPIRIT' },
  { attr: 'mind', seal: '心', vi: 'TÂM', en: 'MIND' },
  { attr: 'body', seal: '脈', vi: 'MẠCH', en: 'BODY' },
  { attr: 'luck', seal: '運', vi: 'VẬN', en: 'FORTUNE' },
]

export interface ProtoShellProps {
  game: GameState
  locale: Locale
  chronicle: readonly string[]
  onAction: (action: Action) => void
  onLocaleChange: (locale: Locale) => void
  /** Existing engagement hooks — caller passes the existing handlers */
  onJournalToggle?: () => void
  journalOpen?: boolean
}

export function ProtoShell({ game, locale, chronicle, onAction, onLocaleChange, onJournalToggle, journalOpen = false }: ProtoShellProps): JSX.Element {
  const [leftMode, setLeftMode] = useState<LeftMode>('icon')
  const [rightMode, setRightMode] = useState<RightMode>('expanded')
  const [tickerMode, setTickerMode] = useState<TickerMode>('1')
  const [topbarPinned, setTopbarPinned] = useState(true)
  const [zen, setZen] = useState(false)
  const [zenPrev, setZenPrev] = useState<{ left: LeftMode; right: RightMode; tick: TickerMode; pin: boolean } | null>(null)
  const [leftTab, setLeftTab] = useState<LeftTab>('people')
  const [chatNpcId, setChatNpcId] = useState<string | null>(null)
  const [command, setCommand] = useState('')
  const [showcaseOpen, setShowcaseOpen] = useState(false)
  // Combat FX: HP của bên nào tụt = bên đó ăn đòn (recoil), bên kia lao vào
  // (lunge). Derive trong effect so both player- and enemy-turn hits animate.
  const [fx, setFx] = useState<{ attacker: 'player' | 'enemy' | null; pulse: number }>({ attacker: null, pulse: 0 })
  const prevHpRef = useRef({ hp: game.player.hp, ehp: game.encounter?.hp ?? 0 })
  useEffect(() => {
    const prev = prevHpRef.current
    const ehp = game.encounter?.hp ?? 0
    if (game.encounter !== null && (game.player.hp < prev.hp || ehp < prev.ehp)) {
      setFx((f) => ({ attacker: ehp < prev.ehp ? 'player' : 'enemy', pulse: f.pulse + 1 }))
    }
    prevHpRef.current = { hp: game.player.hp, ehp }
  }, [game.player.hp, game.encounter?.hp, game.encounter])

  // Register global handler for LeftRailTabContent (avoid React callback closure issues)
  if (typeof window !== 'undefined') {
    (window as unknown as { __openChat: (npcId: string) => void }).__openChat = (npcId: string) => {
      if (leftMode === 'icon') setLeftMode('expanded')
      setChatNpcId(npcId)
    }
  }

  const stateRef = useRef({ leftMode, rightMode, tickerMode, topbarPinned, zen })
  stateRef.current = { leftMode, rightMode, tickerMode, topbarPinned, zen }

  // Chân dung người chơi theo hành động: .game-shell mang class action-<kind>
  // (GameScreen render class đó từ motion state) → portrait đổi ảnh theo pose.
  const portraitRef = useRef<HTMLDivElement>(null)
  const [pose, setPose] = useState<PlayerActionKey>('idle')
  useEffect(() => {
    const shell = portraitRef.current?.closest('.game-shell')
    const kind = /(?:^|\s)action-([\w-]+)/.exec(shell?.className ?? '')?.[1] ?? ''
    const next = POSE_BY_ACTION[kind] ?? 'idle'
    setPose(game.terminal && !game.player.alive ? 'death' : game.player.hp < 30 ? 'hurt' : next)
  })

  // === Layout dimensions ===
  const lw = leftMode === 'expanded' ? 280 : leftMode === 'icon' ? 56 : 0
  const rw = rightMode === 'expanded' ? 280 : rightMode === 'mini' ? 160 : 0
  const th = tickerMode === 'full' ? 120 : tickerMode === '1' ? 32 : 0
  const gridStyle: CSSProperties = {
    ['--left-w' as string]: `${lw}px`, ['--right-w' as string]: `${rw}px`, ['--ticker-h' as string]: `${th}px`,
  }
  const barHidden = !topbarPinned || zen

  // === Zen toggle ===
  const toggleZen = () => {
    const cur = stateRef.current
    if (!cur.zen) {
      setZenPrev({ left: cur.leftMode, right: cur.rightMode, tick: cur.tickerMode, pin: cur.topbarPinned })
      setLeftMode('hidden'); setRightMode('hidden'); setTickerMode('hidden'); setTopbarPinned(false); setZen(true)
    } else {
      const prev = zenPrev ?? { left: 'icon' as LeftMode, right: 'expanded' as RightMode, tick: '1' as TickerMode, pin: true }
      setLeftMode(prev.left); setRightMode(prev.right); setTickerMode(prev.tick); setTopbarPinned(prev.pin); setZen(false)
    }
  }

  // === Auto-hide topbar on mousemove ===
  useEffect(() => {
    if (topbarPinned || zen) return
    const hideTimer = { id: 0 as number | null }
    const onMove = (e: MouseEvent) => {
      if (e.clientY < 12) {
        if (hideTimer.id !== null) window.clearTimeout(hideTimer.id)
        hideTimer.id = null
      } else {
        if (hideTimer.id === null) {
          hideTimer.id = window.setTimeout(() => {
            setTopbarPinned((p) => p || stateRef.current.zen ? p : p)
            hideTimer.id = null
          }, 600)
        }
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => {
      window.removeEventListener('mousemove', onMove)
      if (hideTimer.id !== null) window.clearTimeout(hideTimer.id)
    }
  }, [topbarPinned, zen])

  // === Smart auto-open righthud when HP < 30 ===
  useEffect(() => {
    if (game.player.hp < 30 && rightMode !== 'expanded' && !zen) {
      setRightMode('expanded')
    }
  }, [game.player.hp, rightMode, zen])

  // === Hotkey handler ===
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const typing = t !== null && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')
      if (typing) {
        if (e.key === 'Escape') t.blur()
        return
      }
      const k = e.key.toLowerCase()
      if (e.key === 'Escape') {
        if (showcaseOpen) { setShowcaseOpen(false); return }
        if (chatNpcId !== null) { setChatNpcId(null); return }
        if (journalOpen) { onJournalToggle?.(); return }
        if (leftMode === 'expanded') { setLeftMode('icon'); return }
        if (zen) toggleZen()
        return
      }
      if (k === 'z') { e.preventDefault(); toggleZen(); return }
      if (k === 't') { setTopbarPinned((p) => !p); return }
      if (e.key === 'Tab') {
        e.preventDefault()
        setLeftMode((m) => m === 'hidden' ? 'icon' : m === 'icon' ? 'expanded' : 'hidden')
        return
      }
      if (k === 'b') { setLeftTab('items'); setLeftMode('expanded'); return }
      if (k === 'p') { setLeftTab('people'); setLeftMode('expanded'); return }
      if (k === 'm') { setLeftTab('market'); setLeftMode('expanded'); return }
      if (k === 'c') { setRightMode((m) => m === 'expanded' ? 'mini' : 'expanded'); return }
      if (k === 'l') { setTickerMode((m) => m === 'full' ? '1' : 'full'); return }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [chatNpcId, journalOpen, leftMode, zen, showcaseOpen, onJournalToggle])

  // === Derived data ===
  const vi = locale === 'vi'
  const location = getLocation(game.player.locationId)
  const regionMap = getRegionMap(game.player.locationId)
  const scene = CHAPTERS.find((c) => c.index === currentBeat(game).chapter) ?? CHAPTERS[0]
  const chapterLabel = scene !== undefined ? (vi ? `Chương ${toRoman(scene.index)}` : `Chapter ${toRoman(scene.index)}`) : ''
  const hp = game.player.hp
  const qi = game.player.qi
  // TU VI thật: tiến độ tu vi / ngưỡng đề thăng (engine stats.ts), không phải % khí.
  const cultivationTarget = nextStageThreshold(game.player.stage, game.player.realmLevel) ?? 120
  const cultivationPct = Math.min(100, Math.round((game.player.progress / cultivationTarget) * 100))
  const realmName = REALM_STAGES[game.player.stage] ?? REALM_STAGES[0]
  const objective = deriveObjective(game, locale)
  const lastChronicle = chronicle.length > 0 ? chronicle[chronicle.length - 1] : (vi ? 'Khởi đầu hành trình…' : 'Beginning of journey…')

  // === Combat: same enemy pool as reducer doStartEncounter (undefeated ∩
  // stage-eligible, fallback all-at-location) so the chip mirrors what the
  // engine will actually spawn. ===
  const encounterEnemy = game.encounter === null ? undefined : ENEMIES.find((e) => e.id === game.encounter?.enemyId)
  const fightable = game.encounter === null
    ? (ENEMIES.filter((e) => e.locationId === game.player.locationId
        && game.player.stage >= (e.requiredStage ?? 0)
        && game.flags[`defeated_${e.id}`] !== true)[0]
      ?? ENEMIES.find((e) => e.locationId === game.player.locationId && game.flags[`defeated_${e.id}`] !== true))
    : undefined
  const knownTechniques = TECHNIQUES.filter((t) => (game.techniques[t.id] ?? 0) > 0)

  // === Submit free_text command ===
  const submitCommand = (e: FormEvent) => {
    e.preventDefault()
    const v = command.trim()
    if (v.length === 0) return
    onAction({ kind: 'free_text', raw: v })
    setCommand('')
  }

  // === Chip dispatch ===
  const dispatchChip = (chip: 'rest' | 'cultivate' | 'gather' | 'move' | 'gacha' | 'fight') => {
    if (chip === 'rest') onAction({ kind: 'rest' })
    else if (chip === 'cultivate') onAction({ kind: 'train' })
    else if (chip === 'gather') onAction({ kind: 'gather' })
    else if (chip === 'move') onAction({ kind: 'move', direction: 'north' })
    else if (chip === 'gacha') onAction({ kind: 'draw_lottery' })
    else if (chip === 'fight') onAction({ kind: 'start_encounter' })
  }

  // === Map pins: render existing cells, decorate NPC pins with onClick for chat ===
  const cells = regionMap?.cells ?? []
  const playerLeftPct = ((game.player.posX + 0.5) / MAP_WIDTH) * 100
  const playerTopPct = ((game.player.posY + 0.5) / MAP_HEIGHT) * 100

  // Engine chỉ cho đi từng ô theo hướng. Để pin xa cũng bấm được, BFS tìm
  // chuỗi hướng thật từ vị trí người chơi tới ô đích (đi qua ô kề được phép).
  // execAction/doMove vẫn từ chối khi đang đánh, đã chết, hoặc còn điểm chưa chia.
  const canWalk = game.encounter === null && game.player.alive && game.player.pendingAttributePoints === 0
  const paths = new Map<string, Direction[]>()
  const OPPOSITE: Record<Direction, Direction> = { north: 'south', south: 'north', east: 'west', west: 'east' }
  if (canWalk) {
    for (const cell of cells) {
      if (cell.node === undefined) continue
      // Exit at player position: spawn overlaps the return exit → render a
      // bounce path (step away + step back) so clicking triggers teleport.
      // Prefer an empty neighbour cell — stepping onto an event cell mid-bounce
      // would pop the story panel before the return trip completes.
      if (cell.x === game.player.posX && cell.y === game.player.posY) {
        const isExit = cell.exitTo !== undefined || cell.node.kind === 'exit'
        if (!isExit) continue
        let fallback: Direction[] | undefined
        for (const dir of ['north', 'south', 'east', 'west'] as Direction[]) {
          const step = checkMoveFrom(game.player.locationId, cell.x, cell.y, dir)
          if (!step.ok || step.cell === undefined || step.destinationId !== undefined) continue
          const bounce = [dir, OPPOSITE[dir]]
          if (step.cell.node === undefined) { fallback = bounce; break }
          fallback ??= bounce
        }
        if (fallback !== undefined) paths.set(`${String(cell.x)},${String(cell.y)}`, fallback)
        continue
      }
      const path = pathToCell(game.player.locationId, game.player.posX, game.player.posY, cell.x, cell.y)
      if (path !== null && path.length > 0) paths.set(`${String(cell.x)},${String(cell.y)}`, path)
    }
  }
  // Bấm pin → dispatch từng bước đi thật vào engine (chuyển map khi giẫm ô exit).
  const travelTo = (path: Direction[]): void => {
    for (const dir of path) onAction({ kind: 'move', direction: dir })
  }

  // Per-location map painting — mỗi location có ảnh nền riêng
  const locationBackdrop = locationBackdropFor(game.player.locationId)
  const mapPaintingStyle: CSSProperties | undefined = locationBackdrop
    ? { backgroundImage: `url(${locationBackdrop})` }
    : undefined

  return (
    <>
      {/* Topbar */}
      <div className="proto-topbar-sentinel" />
      <header className={`proto-topbar${barHidden ? ' hidden-bar' : ''}`} data-od-id="topbar">
        <span className="proto-topbar__brand">Phế Căn Ký</span>
        <span className="proto-topbar__sep">·</span>
        <span className="proto-topbar__stat">{vi ? 'Ngày' : 'Day'} <span className="v">{game.day}</span></span>
        <span className="proto-topbar__sep">·</span>
        <span className="proto-topbar__stat">{vi ? 'Chương' : 'Chapter'} <span className="v">{chapterLabel}</span></span>
        <span className="proto-topbar__sep">·</span>
        <span className="proto-topbar__stat">{vi ? location?.nameVi : location?.nameEn}</span>
        <span className="proto-topbar__spacer" />
        <span className="proto-topbar__stat" data-testid="currency-gold">◎ <span className="v">{game.player.gold}</span></span>
        <span className="proto-topbar__sep">·</span>
        <span className="proto-topbar__stat" data-testid="currency-silver">◉ <span className="v">{game.player.silver ?? 0}</span></span>
        <span className="proto-topbar__sep">·</span>
        <span className="proto-topbar__stat" data-testid="currency-spirit-stones">✦ <span className="v">{game.player.spiritStones ?? 0}</span></span>
        <button className="iconbtn" type="button" onClick={() => setShowcaseOpen(true)} title={vi ? 'Phòng trưng bày icon' : 'Icon showcase'} data-testid="icon-showcase-btn">🖼</button>
        <button className="iconbtn" type="button" onClick={() => onLocaleChange(locale === 'vi' ? 'en' : 'vi')} title={vi ? 'Đổi ngôn ngữ' : 'Switch language'}>{locale.toUpperCase()}</button>
        <button className="iconbtn" type="button" title={vi ? 'Thiết lập' : 'Settings'} onClick={() => onJournalToggle?.()}>⚙</button>
        <button className="iconbtn pin" type="button" onClick={() => setTopbarPinned((p) => !p)} title={vi ? `Ghim/Thả (T)` : `Pin (T)`}>📌</button>
        <button data-testid="debug-open-chat" type="button" onClick={() => setChatNpcId('n_merchant_bao')} style={{ display: 'none' }}>DBG</button>
      </header>

      {/* 3-col grid */}
      <main className={`proto-grid-main${barHidden ? ' topbar-hidden' : ''}${zen ? ' zen' : ''}`} style={gridStyle}>

        {/* LeftRail */}
        <aside className={`proto-leftrail${leftMode === 'hidden' ? ' mode-hidden' : ''}`} data-od-id="leftrail">
          <nav className="tabs" aria-label={vi ? 'Lục Đạo Hành Nang' : 'Inventory Tabs'}>
            {(Object.keys(LEFT_TAB_LABELS) as LeftTab[]).map((t) => {
              const meta = LEFT_TAB_LABELS[t]
              return (
                <button key={t} type="button" data-tab={t} className={leftTab === t ? 'active' : ''} onClick={() => { setLeftTab(t); if (leftMode === 'icon') setLeftMode('expanded') }} data-od-id={`tab-${t}`}>
                  {(() => {
                    const src = tabIconArt(t)
                    return src !== undefined
                      ? <img className="glyph" src={src} alt="" aria-hidden="true" />
                      : <span className="glyph">{meta.glyph}</span>
                  })()}
                  <span>{vi ? meta.label : meta.glyph}</span>
                  {t === 'items' && Object.keys(game.inventory).length > 0 && <span className="badge">{Object.keys(game.inventory).length}</span>}
                </button>
              )
            })}
          </nav>
          <div className="body">
            <div className="head">
              <h3>{vi ? LEFT_TAB_LABELS[leftTab].label : LEFT_TAB_LABELS[leftTab].glyph}</h3>
              <div className="ctrls">
                <button type="button" onClick={() => setLeftMode((m) => m === 'expanded' ? 'icon' : 'expanded')} title={vi ? 'Thu gọn (Tab)' : 'Collapse (Tab)'}>◀</button>
                <button type="button" onClick={() => setLeftMode('hidden')} title={vi ? 'Ẩn (Esc)' : 'Hide (Esc)'}>✕</button>
              </div>
            </div>
            <LeftRailTabContent
              tab={leftTab}
              game={game}
              locale={locale}
              onAction={onAction}
            />
          </div>
          <button type="button" className="reopen" onClick={() => setLeftMode('icon')} title={vi ? 'Mở lại' : 'Reopen'}>▶</button>
        </aside>

        {/* Center */}
        <section className="proto-center">
          <div className="proto-map">
            <div
              className="painting"
              aria-hidden="true"
              style={mapPaintingStyle}
            />
            <div className="veil" aria-hidden="true" />
            <div className="grid-overlay" aria-hidden="true" />

            {/* Player pin */}
            <div
              className="pin you"
              style={{ left: `${playerLeftPct}%`, top: `${playerTopPct}%` }}
              data-testid="player-marker"
            >{vi ? 'Lâm Phàm' : 'Lam Pham'}</div>

            {/* Existing map cells (event/exit/danger) as pins */}
            {cells.map((cell) => {
              if (cell.node === undefined) return null
              if (cell.node.kind === 'npc') return null // NPC pins rendered below từ NPCS
              const leftPct = ((cell.x + 0.5) / MAP_WIDTH) * 100
              const topPct = ((cell.y + 0.5) / MAP_HEIGHT) * 100
              const isPlayer = cell.x === game.player.posX && cell.y === game.player.posY
              const isExitCell = cell.node.kind === 'exit' || cell.exitTo !== undefined
              if (isPlayer && !isExitCell) return null
              const cls =
                cell.node.kind === 'event' ? 'pin event' :
                cell.node.kind === 'danger' ? 'pin event' :
                'pin'
              const label = vi ? cell.node.nameVi : cell.node.nameEn
              const path = paths.get(`${String(cell.x)},${String(cell.y)}`)
              const dest = cell.exitTo !== undefined ? getLocation(cell.exitTo) : undefined
              const kindLabel = cell.node.kind === 'danger'
                ? (vi ? 'Nguy hiểm' : 'Danger')
                : isExitCell
                  ? (vi ? 'Lối sang vùng khác' : 'Region exit')
                  : (vi ? 'Sự kiện' : 'Event')
              const glyph = cell.node.kind === 'danger' ? '凶' : isExitCell ? '門' : '事'
              const iconSrc = isExitCell && cell.exitTo !== undefined
                ? exitPinArt(cell.exitTo)
                : nodePinArt(cell.node)
              const handleClick = () => {
                if (path === undefined) return
                travelTo(path)
              }
              return (
                <button
                  type="button"
                  key={`${String(cell.x)}-${String(cell.y)}`}
                  className={`${cls}${path === undefined ? ' pin-unreachable' : ''}${topPct < 30 ? ' pin-flip' : ''}`}
                  aria-disabled={path === undefined ? true : undefined}
                  style={{ left: `${leftPct}%`, top: `${topPct}%`, marginTop: isPlayer && isExitCell ? 26 : undefined }}
                  data-pin-id={`${String(cell.x)},${String(cell.y)}`}
                  data-pin-walkable={path !== undefined ? path[0] : undefined}
                  data-testid={`map-pin-${String(cell.x)}-${String(cell.y)}`}
                  onClick={handleClick}
                  aria-label={path === undefined
                    ? (vi ? `${label} — chưa có đường nối từ vị trí hiện tại` : `${label} — no path from your current position`)
                    : (isExitCell
                      ? (vi ? `Đi tới ${label} (${String(path.length)} bước)` : `Travel to ${label} (${String(path.length)} steps)`)
                      : (vi ? `Đi ${String(path.length)} bước tới ${label}` : `Walk ${String(path.length)} steps to ${label}`))}
                >
                  {iconSrc !== undefined
                    ? <img className="g" src={iconSrc} alt="" aria-hidden="true" />
                    : <span className="g" aria-hidden="true">{glyph}</span>}
                  {label}
                  <span className="pin-tip" role="tooltip">
                    <strong>{label}</strong>
                    <span className="kind">{kindLabel}</span>
                    {dest !== undefined && (
                      <>
                        <span className="d">{vi ? `Đến: ${dest.nameVi}` : `Leads to: ${dest.nameEn}`}</span>
                        <span className="d">{vi ? dest.descVi : dest.descEn}</span>
                        <span className="d">{vi ? `Nguy hiểm ${String(dest.danger)}/5` : `Danger ${String(dest.danger)}/5`}</span>
                      </>
                    )}
                    <span className="steps">{path === undefined
                      ? (vi ? 'Chưa có đường từ đây' : 'No path from here')
                      : isExitCell
                        ? (vi ? `${String(path.length)} bước · đổi vùng` : `${String(path.length)} steps · new region`)
                        : (vi ? `${String(path.length)} bước · lại gần để kích hoạt` : `${String(path.length)} steps · walk close to trigger`)}</span>
                  </span>
                </button>
              )
            })}

            {/* NPC pins từ NPCS ở current location — click mở chat */}
            {NPCS.filter((n) => n.locationId === game.player.locationId).slice(0, 4).map((n, i) => {
              const leftPct = 18 + (i * 18) // distribute trên map
              const topPct = 30 + (i % 2) * 30
              return (
                <button
                  type="button"
                  key={n.id}
                  className={`pin npc${topPct < 30 ? ' pin-flip' : ''}`}
                  data-npc={n.id}
                  style={{ left: `${leftPct}%`, top: `${topPct}%` }}
                  onClick={() => setChatNpcId(n.id)}
                  aria-label={vi ? `Nói chuyện với ${n.nameVi}` : `Talk to ${n.nameEn}`}
                >
                  {(() => {
                    const src = npcPinArt(n.id)
                    return src !== undefined
                      ? <img className="g" src={src} alt="" aria-hidden="true" />
                      : <span className="g" aria-hidden="true">人</span>
                  })()}
                  {vi ? n.nameVi : n.nameEn}
                  <span className="pin-tip" role="tooltip">
                    <strong>{vi ? n.nameVi : n.nameEn}</strong>
                    <span className="kind">{vi ? n.roleVi : n.roleEn}</span>
                    <span className="d">{vi ? n.greetVi : n.greetEn}</span>
                    <span className="steps">{vi ? 'Bấm để bắt chuyện' : 'Click to chat'}</span>
                  </span>
                </button>
              )
            })}

            {/* Legend */}
            <div className="legend">
              <span className="sw"><i style={{ background: 'var(--p-accent)' }} />{vi ? 'Bạn' : 'You'}</span>
              <span className="sw"><i style={{ background: 'var(--p-danger)' }} />{vi ? 'Sự kiện' : 'Event'}</span>
              <span className="sw"><i style={{ background: 'var(--p-ink)' }} />{vi ? 'NPC' : 'NPC'}</span>
            </div>

            {/* Location label overlay (giống world-map-overlay cũ) */}
            <div className="map-overlay-label" data-testid="map-current-cell">
              <span>{vi ? 'Ngươi đang ở đây' : 'You are here'}</span>
              <strong>{vi ? location?.nameVi : location?.nameEn}</strong>
              <small>{vi ? `Ô ${game.player.posX + 1} · ${game.player.posY + 1}` : `Cell ${game.player.posX + 1} · ${game.player.posY + 1}`}</small>
            </div>

            {/* Combat overlay — encounter active (mirrors GameScreen encounter-banner;
                styled by .proto-combat-overlay in screens.css) */}
            {encounterEnemy !== undefined && game.encounter !== null && (
              <div className="proto-combat-overlay show" role="status" aria-live="assertive" data-testid="proto-combat">
                <div className="combat-stage">
                  {/* Player (trái) — lao phải khi đánh, recoil khi ăn đòn */}
                  <div className="combatant">
                    <div
                      key={`p${fx.attacker === 'enemy' ? fx.pulse : 0}`}
                      className={`avatar player${fx.attacker === 'player' ? ' lunging' : ''}${fx.attacker === 'enemy' ? ' attacked' : ''}`}
                      aria-hidden="true"
                    >
                      <img alt="" src={playerArtFor('combat-attack')} />
                    </div>
                    <div className="cname">Lâm Phàm</div>
                    <div
                      className="cbar player"
                      role="progressbar"
                      aria-label={vi ? `Sinh lực của ngươi ${String(game.player.hp)}/${String(MAX_HP)}` : `Your health ${String(game.player.hp)}/${String(MAX_HP)}`}
                      aria-valuemin={0}
                      aria-valuemax={MAX_HP}
                      aria-valuenow={game.player.hp}
                    >
                      <i style={{ width: `${(game.player.hp / MAX_HP) * 100}%` }} />
                    </div>
                  </div>

                  {/* Enemy (phải) — lao trái khi đánh, recoil khi ăn đòn */}
                  <div className="combatant">
                    <div
                      key={`e${fx.attacker === 'player' ? fx.pulse : 0}`}
                      className={`avatar enemy${fx.attacker === 'enemy' ? ' lunging' : ''}${fx.attacker === 'player' ? ' attacked' : ''}`}
                      aria-hidden="true"
                    >
                      妖
                    </div>
                    <div className="ename">{vi ? encounterEnemy.nameVi : encounterEnemy.nameEn}</div>
                    <div
                      className="cbar"
                      role="progressbar"
                      aria-label={vi ? `Sinh lực địch ${String(game.encounter.hp)}/${String(game.encounter.maxHp)}` : `Enemy health ${String(game.encounter.hp)}/${String(game.encounter.maxHp)}`}
                      aria-valuemin={0}
                      aria-valuemax={game.encounter.maxHp}
                      aria-valuenow={game.encounter.hp}
                    >
                      <i style={{ width: `${(game.encounter.hp / game.encounter.maxHp) * 100}%` }} />
                    </div>
                  </div>
                </div>

                <div className="acts">
                  <button type="button" className="primary" onClick={() => onAction({ kind: 'combat_attack' })} data-testid="combat-attack">
                    {vi ? `Đánh thường (${String(BASIC_STRIKE_QI_COST)} khí)` : `Strike (${String(BASIC_STRIKE_QI_COST)} qi)`}
                  </button>
                  {knownTechniques.map((t) => (
                    <button key={t.id} type="button" onClick={() => onAction({ kind: 'combat_attack', techniqueId: t.id })}>
                      {vi ? `Xuất ${t.nameVi}` : `Use ${t.nameEn}`}
                    </button>
                  ))}
                  <button type="button" onClick={() => onAction({ kind: 'combat_defend' })}>{vi ? 'Thủ thế' : 'Defend'}</button>
                  <button type="button" className="danger" onClick={() => onAction({ kind: 'combat_retreat' })}>
                    {vi ? `Rút lui (−${String(RETREAT_HP_COST)} huyết)` : `Retreat (−${String(RETREAT_HP_COST)} HP)`}
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* Command bar */}
          <form className="proto-command" onSubmit={submitCommand} data-od-id="command-bar">
            <input
              type="text"
              value={command}
              onChange={(e) => setCommand(e.target.value)}
              placeholder={vi ? 'Thử nói: "Ta muốn đến làng Thanh Mộc tìm lão Bạch"…' : 'Try: "I want to go to Greenwood village"…'}
              aria-label={vi ? 'Nhập mệnh lệnh' : 'Command input'}
            />
            <div className="chips">
              <button type="button" data-chip="rest" onClick={() => dispatchChip('rest')}>{vi ? 'Nghỉ' : 'Rest'}</button>
              <button type="button" data-chip="cultivate" onClick={() => dispatchChip('cultivate')}>{vi ? 'Tu luyện' : 'Train'}</button>
              <button type="button" data-chip="gather" onClick={() => dispatchChip('gather')}>{vi ? 'Hái thảo' : 'Gather'}</button>
              <button type="button" data-chip="move" onClick={() => dispatchChip('move')}>{vi ? 'Di chuyển' : 'Move'}</button>
              <button type="button" data-chip="gacha" onClick={() => dispatchChip('gacha')}>{vi ? 'Quay số' : 'Gacha'}</button>
              {fightable !== undefined && <button type="button" data-chip="fight" onClick={() => dispatchChip('fight')}>{vi ? `⚔ Giao chiến: ${fightable.nameVi}` : `⚔ Fight: ${fightable.nameEn}`}</button>}
            </div>
            <button type="submit" className="try">{vi ? 'Thử Vận' : 'Try'}</button>
          </form>

          <div className={`proto-zen-pill${zen ? ' show' : ''}`}>{vi ? 'CHẾ ĐỘ THIỀN ĐỊNH — ấn Z để thoát' : 'ZEN MODE — press Z to exit'}</div>
        </section>

        {/* RightHUD */}
        <aside className={`proto-righthud${rightMode === 'hidden' ? ' mode-hidden' : ''}${rightMode === 'mini' ? ' mode-mini' : ''}`} data-od-id="righthud">
          <div className="proto-portrait">
            <div className="face" ref={portraitRef} role="img" aria-label={vi ? `Lâm Phàm · ${pose}` : `Lam Pham · ${pose}`}>
              <img alt="" aria-hidden="true" className="proto-portrait-art" key={pose} src={playerArtFor(pose)} />
            </div>
            <div className="meta">
              <div className="name">Lâm Phàm</div>
              <span className="realm">{realmName?.seal} · {vi ? realmName?.vi : realmName?.en} {game.player.realmLevel}</span>
            </div>
            <div className="head-ctrls">
              <button type="button" onClick={() => setRightMode((m) => m === 'expanded' ? 'mini' : 'expanded')} title={vi ? 'Thu nhỏ (C)' : 'Minimize (C)'}>▶</button>
              <button type="button" onClick={() => setRightMode('hidden')} title={vi ? 'Ẩn (C)' : 'Hide (C)'}>✕</button>
            </div>
          </div>
          <div className={`proto-bar hp${hp < 30 ? ' alert' : ''}`}>
            <span className="lbl"><img className="bar-ico" src={HUD_ICONS.hp} alt="" aria-hidden="true" />{vi ? 'KHÍ HUYẾT' : 'HP'}</span>
            <span className="track"><span className="fill" style={{ width: `${(hp / MAX_HP) * 100}%` }} /></span>
            <span className="num">{hp}/{MAX_HP}</span>
          </div>
          <div className="proto-bar qi">
            <span className="lbl"><img className="bar-ico" src={HUD_ICONS.qi} alt="" aria-hidden="true" />{vi ? 'LINH KHÍ' : 'QI'}</span>
            <span className="track"><span className="fill" style={{ width: `${(qi / MAX_QI) * 100}%` }} /></span>
            <span className="num">{qi}/{MAX_QI}</span>
          </div>
          <div className="proto-bar cultivation">
            <span className="lbl"><img className="bar-ico" src={HUD_ICONS.cultivation} alt="" aria-hidden="true" />{vi ? 'TU VI' : 'CULT'}</span>
            <span className="track"><span className="fill" style={{ width: `${cultivationPct}%` }} /></span>
            <span className="num">{game.player.progress}/{cultivationTarget}</span>
          </div>
          <div className="proto-tetragrammaton">
            {TG_STATS.map((t) => {
              const value = game.player.attrs[t.attr]
              const canAdd = game.player.pendingAttributePoints > 0 && value < ATTRIBUTE_MAX
              return (
                <div className="proto-tg" key={t.attr}>
                  {(() => {
                    const src = attrIconArt(t.attr)
                    return src !== undefined
                      ? <img className="k" src={src} alt="" aria-hidden="true" />
                      : <div className="k">{t.seal}</div>
                  })()}
                  <div className="v">{value}</div>
                  <div className="lbl">{vi ? t.vi : t.en}</div>
                  <button
                    type="button"
                    className="tg-add"
                    disabled={!canAdd}
                    onClick={() => onAction({ kind: 'allocate_attribute', attribute: t.attr })}
                    title={game.player.pendingAttributePoints > 0
                      ? (vi ? `Thêm 1 ${t.vi} (còn ${String(game.player.pendingAttributePoints)} điểm)` : `+1 ${t.en} (${String(game.player.pendingAttributePoints)} points left)`)
                      : (vi ? 'Chưa có điểm thuộc tính' : 'No attribute points yet')}
                    aria-label={vi ? `Thêm điểm ${t.vi}` : `Add ${t.en} point`}
                  >＋</button>
                </div>
              )
            })}
            {game.player.pendingAttributePoints > 0 && (
              <div className="tg-points">{vi ? `Điểm chưa phân bổ: ${String(game.player.pendingAttributePoints)}` : `Unspent points: ${String(game.player.pendingAttributePoints)}`}</div>
            )}
          </div>
          <div className="proto-quest">
            <div className="q">{vi ? 'Mục tiêu' : 'Objective'}</div>
            <div className="d">{objective ?? (vi ? `Ngày ${game.day}` : `Day ${game.day}`)}</div>
          </div>
          <div className="proto-mini-badge" role="button" tabIndex={0} onClick={() => setRightMode('expanded')} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); setRightMode('expanded') } }} title={vi ? 'Mở lại HUD' : 'Open HUD'}>
            <div className="face" aria-hidden="true" />
            <div className="m">
              <span className="realm">{realmName?.seal}-{game.player.realmLevel}</span>
              <span className="mini-bar hp"><i style={{ width: `${(hp / MAX_HP) * 100}%` }} /></span>
              <span className="mini-bar qi"><i style={{ width: `${(qi / MAX_QI) * 100}%` }} /></span>
            </div>
          </div>
        </aside>

        {/* Ticker */}
        <footer className={`proto-ticker${tickerMode === 'hidden' ? ' mode-hidden' : ''}${tickerMode === '1' ? ' mode-1' : ''}${tickerMode === 'full' ? ' mode-full' : ''}`}>
          <div className="proto-ticker-1">
            <span className="badge-mini">BIÊN NIÊN</span>
            <span className="msg">{lastChronicle}</span>
            <div className="ctrls">
              <button type="button" onClick={() => setTickerMode((m) => m === 'full' ? '1' : 'full')} title={vi ? 'Mở rộng (L)' : 'Expand (L)'}>{tickerMode === 'full' ? '▼' : '▲'}</button>
            </div>
          </div>
          <div className="proto-ticker-body">
            <div className="proto-ticker-events">
              {chronicle.slice(-5).reverse().map((line, i) => (
                <div key={i} className="ev"><span className="t">--:--</span><span className="m">{line}</span></div>
              ))}
            </div>
          </div>
        </footer>
      </main>

      {/* NPC Chat Modal */}
      <NpcChatModal
        show={chatNpcId !== null}
        npcId={chatNpcId}
        game={game}
        locale={locale}
        onClose={() => setChatNpcId(null)}
        onAction={onAction}
      />

      {/* Icon Showcase Modal (nút 🖼 trên topbar) */}
      <IconShowcaseModal show={showcaseOpen} onClose={() => setShowcaseOpen(false)} />
    </>
  )
}

/** BFS trong map hiện tại: chuỗi {kind:'move'} hợp lệ tới ô (x,y), hoặc null.
 *  Ô exit (destinationId khác undefined) chỉ được chọn làm ĐÍCH cuối — engine
 *  doMove sẽ teleport sang map khác. Không đi xuyên qua ô exit. */
function pathToCell(locationId: string, fromX: number, fromY: number, toX: number, toY: number): Direction[] | null {
  const key = (x: number, y: number): string => `${String(x)},${String(y)}`
  const queue: Array<{ x: number; y: number; path: Direction[] }> = [{ x: fromX, y: fromY, path: [] }]
  const seen = new Set<string>([key(fromX, fromY)])
  while (queue.length > 0) {
    const cur = queue.shift()
    if (cur === undefined) break
    if (cur.x === toX && cur.y === toY) return cur.path
    for (const dir of ['north', 'south', 'east', 'west'] as Direction[]) {
      const step = checkMoveFrom(locationId, cur.x, cur.y, dir)
      if (!step.ok || step.cell === undefined) continue
      const isExit = step.destinationId !== undefined
      const isTarget = step.cell.x === toX && step.cell.y === toY
      if (isExit && !isTarget) continue // không đi xuyên ô chuyển map
      const k = key(step.cell.x, step.cell.y)
      if (seen.has(k)) continue
      seen.add(k)
      queue.push({ x: step.cell.x, y: step.cell.y, path: [...cur.path, dir] })
    }
  }
  return null
}

function toRoman(n: number): string {
  const map: Array<[number, string]> = [[10, 'X'], [9, 'IX'], [5, 'V'], [4, 'IV'], [1, 'I']]
  let r = ''
  let v = n
  for (const [num, sym] of map) {
    while (v >= num) { r += sym; v -= num }
  }
  return r
}
