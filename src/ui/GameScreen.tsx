import { FormEvent, useEffect, useMemo, useRef, useState, type CSSProperties, type KeyboardEvent } from 'react'
import {
  CHAPTERS,
  ENEMIES,
  ENDINGS,
  EQUIPMENT,
  ITEMS,
  LOCATIONS,
  MAP_HEIGHT,
  MAP_WIDTH,
  NPCS,
  TALENTS,
  TECHNIQUES,
  getItem,
  getLocation,
  getRegionMap,
} from '../content'
import { BASIC_STRIKE_QI_COST, activeSystem, canCompleteQuest, currentStoryScene, dangerWarning, findStoryChoice, formatSystemMessage, nextStageThreshold, queueDrain, RETREAT_HP_COST, storyRouteEncounter, storyRouteProof, storyRouteTarget, systemQuestsFor, techniqueQiCost } from '../engine'
import type { Action, Direction, GameState, Locale } from '../engine'
import worldMapArt from '../assets/art/world-map-inkwash.png'
import { locationBackdropFor, locationIconFor } from './locationArt'
import { npcPortraitFor } from './npcArt'
import { deriveObjective, nightDeadlineRemaining } from './objective'
import { DeathScreen } from './DeathScreen'
import { endingEpilogue } from './endingEpilogue'
import { itemArtFor, talentArtFor, techniqueArtFor } from './rpgArt'
import { CodexPanel, type CodexEntry } from './CodexPanel'
import { ASSET_PACK_MANIFEST, type AssetPackId } from './assetPacks'
import { playerArtFor, type PlayerActionKey } from './playerArt'
import { requestSuggestion } from '../ai/narration'
import { requestSystemReply, type SystemReply } from '../ai/system'
import { t } from '../i18n'
import { AttributeAllocation, EquipmentSummary, HoiDots } from './gameScreen/components'
import { type DockPanel } from './gameScreen/constants'
import {
  ChronicleFeed,
  DockPanelContainer,
  DockPanelInventory,
  DockPanelMarket,
  DockPanelPath,
  DockPanelPeople,
  DockPanelQuests,
  DockTabBar,
} from './gameScreen/panels'

export interface GameScreenProps {
  actionKind?: Action['kind'] | null
  actionNonce?: number
  game: GameState
  locale: Locale
  chronicle: string[]
  /** Parallel to chronicle: each entry's source event kind (lowercased) so
   *  the UI can color the line (combat = vermilion ink, defend = jade, etc.). */
  chronicleKinds?: readonly string[]
  onAction: (action: Action) => void
  onLocaleChange: (locale: Locale) => void
  onRestart?: () => void
  storyOpen?: boolean
  onStoryClose?: () => void
}

function word(locale: Locale, vi: string, en: string): string {
  return locale === 'vi' ? vi : en
}

const HAN_SEALS = { mystery: '玄', objective: '目', choice: '選', achievement: '成' } as const

function InkCorner({ corner }: { corner: 'top-left' | 'top-right' | 'bottom-left' }): JSX.Element {
  return <svg aria-hidden="true" className={`ink-corner ink-corner--${corner}`} data-testid="ink-corner" viewBox="0 0 72 52">
    <path d="M3 45C16 40 13 24 29 24c13 0 12-15 37-18" fill="none" stroke="currentColor" strokeLinecap="round" strokeWidth="2.4" />
    <path d="M7 49c14-2 15-12 24-16 8-3 20-2 35-22" fill="none" opacity=".55" stroke="currentColor" strokeLinecap="round" strokeWidth="1.25" />
    <path d="M49 8c8 1 14 0 20-5" fill="none" opacity=".36" stroke="currentColor" strokeLinecap="round" strokeWidth="1" />
  </svg>
}

function localized(locale: Locale, item: { nameVi: string; nameEn: string }): string {
  return locale === 'vi' ? item.nameVi : item.nameEn
}

function terrainLabel(locale: Locale, terrain: string | undefined): string {
  const labels: Record<string, [string, string]> = {
    plain: ['Đất bằng', 'Open ground'],
    road: ['Đường mòn', 'Trail'],
    water: ['Mặt nước', 'Water'],
    mountain: ['Vách núi', 'Mountain'],
    forest: ['Rừng cây', 'Forest'],
    cave: ['Hang đá', 'Cave'],
    rift: ['Khe nứt', 'Rift'],
  }
  const label = labels[terrain ?? 'plain'] ?? ['Đất bằng', 'Open ground']
  return locale === 'vi' ? label[0] : label[1]
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

const REALM_STAGES: ReadonlyArray<{ vi: string; en: string; seal: string }> = [
  { vi: 'Luyện Khí', en: 'Qi Refining', seal: '氣' },
  { vi: 'Trúc Cơ', en: 'Foundation', seal: '基' },
  { vi: 'Kim Đan', en: 'Golden Core', seal: '丹' },
  { vi: 'Nguyên Anh', en: 'Nascent Soul', seal: '嬰' },
  { vi: 'Hóa Thần', en: 'Spirit Transform', seal: '神' },
  { vi: 'Phi Thăng', en: 'Ascension', seal: '仙' },
]

function contextualDockFor(locationId: string): DockPanel {
  if (locationId === 'market') return 'market'
  if (locationId === 'sect') return 'inventory'
  if (locationId === 'misty_forest' || locationId === 'sealed_cave' || locationId === 'cursed_rift') return 'path'
  return 'people'
}

function systemNotificationText(entry: { id: string; vars: Record<string, string | number> }, locale: Locale): string {
  if (entry.id === 'sys_quest_loaded') {
    return formatSystemMessage('sys_quest_loaded', { quest: locale === 'vi' ? String(entry.vars.quest ?? '') : String(entry.vars.questEn ?? ''), days: Number(entry.vars.days ?? 0), objective: locale === 'vi' ? String(entry.vars.objective ?? '') : String(entry.vars.objectiveEn ?? '') }, locale)
  }
  if (entry.id === 'sys_reward') {
    return formatSystemMessage('sys_reward', { reward: locale === 'vi' ? String(entry.vars.reward ?? '') : String(entry.vars.rewardEn ?? '') }, locale)
  }
  return formatSystemMessage(entry.id, entry.vars, locale)
}

/** Glyph shown inside a node icon-slot when no authored artwork exists (placeholder per kind). */
function mapNodeGlyph(kind: 'npc' | 'event' | 'exit' | 'danger'): string {
  switch (kind) {
    case 'npc': return '人'
    case 'event': return '缘'
    case 'danger': return '凶'
    case 'exit': return '关'
  }
}

/** Compass direction key from the player to a cell, for tooltip/i18n. */
function cellDirection(px: number, py: number, x: number, y: number): 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | 'here' {
  if (x === px && y === py) return 'here'
  const dy = y - py
  const dx = x - px
  const ns = dy < 0 ? 'n' : dy > 0 ? 's' : ''
  const ew = dx > 0 ? 'e' : dx < 0 ? 'w' : ''
  return `${ns}${ew}` as 'n' | 's' | 'e' | 'w' | 'ne' | 'nw' | 'se' | 'sw' | 'here'
}

export function GameScreen({ actionKind = null, actionNonce = 0, game, locale, chronicle, chronicleKinds, onAction, onLocaleChange, onRestart = () => {}, storyOpen = false, onStoryClose = () => {} }: GameScreenProps) {
  const [command, setCommand] = useState('')
  const [codexOpen, setCodexOpen] = useState(false)
  const [journalOpen, setJournalOpen] = useState(false)
  const [activeDock, setActiveDock] = useState<DockPanel>(() => contextualDockFor(game.player.locationId))
  const [selectedInventoryItemId, setSelectedInventoryItemId] = useState<string | null>(null)
  const [hurtFeedbackNonce, setHurtFeedbackNonce] = useState<number | null>(null)
  // Phase 5 (design review 2026-08): the AI may suggest an authored choice for
  // free text; its one in-character line is shown here. The reducer stays the law.
  const [aiSuggestLine, setAiSuggestLine] = useState<string | null>(null)
  const [aiSuggesting, setAiSuggesting] = useState(false)
  const [systemMessage, setSystemMessage] = useState('')
  const [systemReply, setSystemReply] = useState<SystemReply | null>(null)
  const [systemReplying, setSystemReplying] = useState(false)
  const journalLauncher = useRef<HTMLButtonElement>(null)
  const chronicleRef = useRef<HTMLDivElement>(null)
  const allocationHeading = useRef<HTMLHeadingElement>(null!)
  const previousHp = useRef(game.player.hp)
  const processedActionNonce = useRef<number | null>(null)
  const previousLocationId = useRef(game.player.locationId)
  // Phase 6 (design review 2026-08): immediate feedback for stat and day
  // changes — a signed HP/Qi delta chip and a "Day X" stamp, both transient.
  const [statDeltas, setStatDeltas] = useState<{ nonce: number; hp: number; qi: number }>({ nonce: 0, hp: 0, qi: 0 })
  const [dayStamp, setDayStamp] = useState<number | null>(null)
  const [chronicleNewAt, setChronicleNewAt] = useState(-1)
  const previousQi = useRef(game.player.qi)
  const previousDay = useRef(game.day)
  const chronicleEndRef = useRef<HTMLLIElement>(null)
  const chronicleSeenCount = useRef(chronicle.length)
  const backgroundRefs = useRef<HTMLElement[]>([])
  const feedbackTimers = useRef<number[]>([])
  const storyLauncherRef = useRef<HTMLElement | null>(null)
  const basicStrikeRef = useRef<HTMLButtonElement | null>(null)
  const firstStoryChoiceRef = useRef<HTMLButtonElement | null>(null)
  // P1-7: cycle the free-text placeholder through three locale-tagged
  // examples so the input visibly rotates as the story panel stays open.
  const placeholderExamples = locale === 'vi'
    ? ['tu luyện', 'đi bắc', 'nói chuyện với Mai Hoa']
    : ['train', 'go north', 'talk to Meihua']
  const placeholderIndex = (game.day - 1) % placeholderExamples.length
  const freeTextPlaceholder = placeholderExamples[placeholderIndex] ?? placeholderExamples[0]!
  useEffect(() => () => { feedbackTimers.current.forEach((timer) => window.clearTimeout(timer)) }, [])
  // P0-7 / a11y: sync the document language so screen readers announce the
  // active locale. The component is the root visible surface; html lang is
  // not owned elsewhere in this app.
  useEffect(() => {
    if (typeof document !== 'undefined') document.documentElement.lang = locale
  }, [locale])
  const retaliationAction = actionKind === 'combat_attack'
    || actionKind === 'combat_defend'
    || (actionKind === 'use_item' && game.encounter !== null)
  const showHurtFeedback = hurtFeedbackNonce === actionNonce
  const playerPose = playerPoseFor(actionKind, game, showHurtFeedback)
  const routeEncounter = storyRouteEncounter(game)
  const system = activeSystem(game)
  const systemQuests = system === null || game.flags.system_refused === true ? [] : systemQuestsFor(game)
  const systemFeed = game.systemQueue === undefined || game.flags.system_refused === true || system === null ? [] : queueDrain(game.systemQueue, 3).visible
  useEffect(() => {
    if (processedActionNonce.current === actionNonce) return

    const tookDamage = game.player.hp < previousHp.current
    const statDelta = tookDamage || game.player.qi !== previousQi.current
      ? { nonce: actionNonce, hp: game.player.hp - previousHp.current, qi: game.player.qi - previousQi.current }
      : null
    previousHp.current = game.player.hp
    previousQi.current = game.player.qi
    processedActionNonce.current = actionNonce
    setHurtFeedbackNonce(null)
    if (statDelta !== null) {
      setStatDeltas(statDelta)
      feedbackTimers.current.push(window.setTimeout(() => setStatDeltas((current) => (current.nonce === actionNonce ? { nonce: 0, hp: 0, qi: 0 } : current)), 900))
    }
    if (game.day !== previousDay.current) {
      previousDay.current = game.day
      setDayStamp(game.day)
      feedbackTimers.current.push(window.setTimeout(() => setDayStamp(null), 1400))
    }
    if (!tookDamage || !game.player.alive) return

    const timer = window.setTimeout(() => setHurtFeedbackNonce(actionNonce), retaliationAction ? 420 : 220)
    return () => window.clearTimeout(timer)
  }, [actionNonce, game.day, game.player.alive, game.player.hp, game.player.qi, retaliationAction])
  useEffect(() => {
    backgroundRefs.current.forEach((element) => element.toggleAttribute('inert', storyOpen))
  }, [storyOpen])
  // P0-3: remember the element that opened the story, so we can restore focus when it closes.
  useEffect(() => {
    const saveLauncher = (event: FocusEvent) => {
      const target = event.target
      if (target instanceof HTMLElement && target.closest('.story-panel') === null) {
        storyLauncherRef.current = target
      }
    }
    document.addEventListener('focusin', saveLauncher)
    return () => document.removeEventListener('focusin', saveLauncher)
  }, [])
  const prevStoryOpen = useRef(storyOpen)
  useEffect(() => {
    if (!storyOpen && prevStoryOpen.current) storyLauncherRef.current?.focus()
    prevStoryOpen.current = storyOpen
  }, [storyOpen])
  useEffect(() => {
    if (game.player.pendingAttributePoints > 0) allocationHeading.current?.focus()
  }, [game.player.pendingAttributePoints])
  const backgroundRegion = (element: HTMLElement | null) => {
    if (element !== null && !backgroundRefs.current.includes(element)) backgroundRefs.current.push(element)
  }
  useEffect(() => {
    if (previousLocationId.current === game.player.locationId) return
    previousLocationId.current = game.player.locationId
    setActiveDock(contextualDockFor(game.player.locationId))
  }, [game.player.locationId])
  useEffect(() => {
    if (chronicleEndRef.current === null) return
    // Only scroll when the chronicle grew — never on mount or shrinking.
    const seen = chronicleSeenCount.current
    chronicleSeenCount.current = chronicle.length
    if (chronicle.length <= seen) return
    const reduced = window.matchMedia?.('(prefers-reduced-motion: reduce)').matches ?? false
    chronicleEndRef.current.scrollIntoView?.({ block: 'nearest', behavior: reduced ? 'auto' : 'smooth' })
    setChronicleNewAt(chronicle.length)
    feedbackTimers.current.push(window.setTimeout(() => setChronicleNewAt(-1), 1600))
  }, [chronicle.length])
  useEffect(() => {
    const handleJournalShortcut = (event: globalThis.KeyboardEvent) => {
      const target = event.target
      const isTyping = target instanceof HTMLInputElement || target instanceof HTMLTextAreaElement || target instanceof HTMLSelectElement
      // P0-2: arrow keys / WASD dispatch a move at the window level. The
      // typing guard short-circuits the free-text input; a focused map cell
      // handles its own arrow keys to rove focus without dispatching.
      const focusOnMapCell = target instanceof HTMLElement && target.classList?.contains('map-cell')
      if (
        !isTyping &&
        !focusOnMapCell &&
        game.encounter === null &&
        !journalOpen &&
        !storyOpen
      ) {
        const key = event.key.toLowerCase()
        const directionByKey: Record<string, Direction | undefined> = {
          arrowup: 'north', arrowdown: 'south', arrowleft: 'west', arrowright: 'east',
          w: 'north', s: 'south', a: 'west', d: 'east',
        }
        const dir = directionByKey[key]
        if (dir !== undefined) {
          event.preventDefault()
          onAction({ kind: 'move', direction: dir })
          return
        }
      }

      if (event.key === 'Escape' && journalOpen) {
        event.preventDefault()
        setJournalOpen(false)
        window.requestAnimationFrame(() => journalLauncher.current?.focus())
        return
      }
      if (event.key.toLowerCase() === 'i' && !journalOpen && routeEncounter === undefined && !isTyping) {
        event.preventDefault()
        setActiveDock('inventory')
        setJournalOpen(true)
      }
    }

    window.addEventListener('keydown', handleJournalShortcut)
    return () => window.removeEventListener('keydown', handleJournalShortcut)
  }, [journalOpen, routeEncounter, storyOpen, game.encounter, onAction])

  // P0-2: arrow keys on a focused map cell move focus to the neighbour
  // without dispatching a move action. This is the roving-focus half of the
  // contract; the window-level listener above handles the dispatch path.
  function handleCellKeyDown(event: React.KeyboardEvent<HTMLDivElement>, x: number, y: number) {
    const dx = (event.key === 'ArrowRight') ? 1 : (event.key === 'ArrowLeft') ? -1 : 0
    const dy = (event.key === 'ArrowDown') ? 1 : (event.key === 'ArrowUp') ? -1 : 0
    if (dx === 0 && dy === 0) return
    event.preventDefault()
    event.stopPropagation()
    const next = document.querySelector<HTMLDivElement>(
      `.map-cell[data-cell-x="${String(x + dx)}"][data-cell-y="${String(y + dy)}"]`,
    )
    next?.focus()
  }
  const objective = deriveObjective(game, locale)
  const [deathDismissed, setDeathDismissed] = useState(false)
  useEffect(() => {
    if (!game.terminal) setDeathDismissed(false)
  }, [game.terminal])
  const scene = useMemo(() => currentStoryScene(game), [game])
  // P0-3: auto-focus the first story choice when the story panel opens so
  // keyboard players can confirm with Enter without a tab traversal.
  useEffect(() => {
    if (storyOpen && firstStoryChoiceRef.current !== null) {
      firstStoryChoiceRef.current.focus()
    }
  }, [storyOpen, scene.id])
  // P0-3: auto-focus the basic-strike button when an encounter begins so
  // the player lands on the first action.
  useEffect(() => {
    if (game.encounter !== null && basicStrikeRef.current !== null) {
      basicStrikeRef.current.focus()
    }
  }, [game.encounter?.enemyId])
  const chapter = CHAPTERS.find((entry) => entry.index === scene.chapter) ?? {
    index: 1,
    nameVi: 'Chương một',
    nameEn: 'Chapter One',
    taglineVi: 'Đường mới mở ra.',
    taglineEn: 'A new road opens.',
  }
  const location = getLocation(game.player.locationId)
  const regionMap = getRegionMap(game.player.locationId)
  const currentCell = regionMap?.cells.find((cell) => cell.x === game.player.posX && cell.y === game.player.posY)
  const currentCellLabel = currentCell?.node === undefined
    ? terrainLabel(locale, currentCell?.terrain)
    : word(locale, currentCell.node.nameVi, currentCell.node.nameEn)
  const nextMapNode = [...(regionMap?.cells ?? [])]
    .filter((cell) => cell.node !== undefined && (cell.x !== game.player.posX || cell.y !== game.player.posY))
    .sort((left, right) => {
      const leftDistance = Math.abs(left.x - game.player.posX) + Math.abs(left.y - game.player.posY)
      const rightDistance = Math.abs(right.x - game.player.posX) + Math.abs(right.y - game.player.posY)
      return leftDistance - rightDistance
    })[0]
  const nextMapNodeDistance = nextMapNode === undefined
    ? null
    : Math.abs(nextMapNode.x - game.player.posX) + Math.abs(nextMapNode.y - game.player.posY)
  const routeLead = game.flags.story_route === 'mercy'
    ? word(locale, 'Mai Hoa đang giữ bó dây đỏ: hãy tìm những cái tên chưa được gọi về.', 'Meihua holds the red thread: find the names not called home.')
    : game.flags.story_route === 'wealth'
      ? word(locale, 'Bảo đang chờ ở lối sau chợ với chiếc bùa nứt và một lối tắt.', 'Bao waits in the market back lane with a chipped ward and a shortcut.')
      : game.flags.story_route === 'truth'
        ? word(locale, 'Ngô chờ ở trà quán; bảy bát trà giữ những mảnh ký ức thất lạc.', 'Ngo waits in the teahouse; seven cups hold the missing memories.')
        : null
  const routeTarget = storyRouteTarget(game)
  const routeProof = storyRouteProof(game)
  const routeStatus = routeLead === null
    ? null
    : routeTarget === undefined
      ? word(locale, 'Đầu mối đã được gặp. Giờ hãy quyết định cách đi tiếp.', 'You reached the lead. Now decide how to proceed.')
      : routeLead
  const warning = dangerWarning(game.player.locationId)
  const localNpcs = NPCS.filter((npc) => npc.locationId === game.player.locationId)
  const ending = game.endingId === null ? undefined : ENDINGS.find((entry) => entry.id === game.endingId)
  const endingLines = ending === undefined ? [] : endingEpilogue(game, locale)
  const isDeath = game.terminal && game.endingId === 'tragic_death'
  const entries = Object.entries(game.inventory).filter(([, qty]) => qty > 0)
  const stored = Object.entries(game.storage).filter(([, qty]) => qty > 0)
  const selectedInventoryId = selectedInventoryItemId !== null && entries.some(([id]) => id === selectedInventoryItemId)
    ? selectedInventoryItemId
    : entries[0]?.[0]
  const selectedInventoryItem = selectedInventoryId === undefined ? undefined : getItem(selectedInventoryId)
  const selectedInventoryArt = selectedInventoryId === undefined ? undefined : itemArtFor(selectedInventoryId)
  const selectedInventoryEquipment = selectedInventoryId === undefined ? undefined : EQUIPMENT.find((equipment) => equipment.itemId === selectedInventoryId)
  const encounterEnemy = game.encounter === null ? undefined : ENEMIES.find((enemy) => enemy.id === game.encounter?.enemyId)
  const localEnemy = ENEMIES.find((enemy) => enemy.locationId === game.player.locationId)
  const knownTechniques = TECHNIQUES.filter((technique) => (game.techniques[technique.id] ?? 0) > 0)
  const encounterLocked = game.encounter !== null
  const deadlineRemaining = nightDeadlineRemaining(game)
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

  const trapStoryFocus = (event: KeyboardEvent<HTMLElement>) => {
    if (event.key !== 'Tab') return
    const focusable = Array.from(event.currentTarget.querySelectorAll<HTMLElement>('button:not(:disabled), input:not(:disabled), select:not(:disabled), textarea:not(:disabled), [tabindex]:not([tabindex="-1"])'))
    const first = focusable[0]
    const last = focusable[focusable.length - 1]
    if (first === undefined || last === undefined) return
    if (event.shiftKey && document.activeElement === first) {
      event.preventDefault()
      last.focus()
    } else if (!event.shiftKey && document.activeElement === last) {
      event.preventDefault()
      first.focus()
    }
  }

  const submitSystemMessage = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    if (systemMessage.trim().length === 0 || game.terminal || systemReplying) return
    setSystemReplying(true)
    void requestSystemReply(game, systemMessage, locale).then((reply) => {
      setSystemReplying(false)
      setSystemReply(reply)
    })
  }

  const submitCommand = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault()
    const raw = command.trim()
    if (raw.length === 0 || game.terminal) return
    // Phase 5: during a story choice, free text asks the AI to suggest ONE of
    // the authored choices. The engine only ever receives a story_choice with
    // an authored id; without AI (or on any failure) the deterministic parser
    // handles the utterance exactly as before.
    const hasAvailableChoices = currentStoryScene(game).choices.some(
      (choice) => findStoryChoice(game, choice.id) !== undefined,
    )
    setCommand('')
    if (hasAvailableChoices && !encounterLocked) {
      setAiSuggesting(true)
      void requestSuggestion(game, raw, locale).then((result) => {
        setAiSuggesting(false)
        if (result.status === 'empty' || result.status === 'error') {
          onAction({ kind: 'free_text', raw })
          return
        }
        setAiSuggestLine(result.suggestion.reply.length > 0 ? result.suggestion.reply : null)
        onAction({ kind: 'story_choice', choiceId: result.suggestion.choiceId })
      })
      return
    }
    onAction({ kind: 'free_text', raw })
  }

  return (
    <main className={`game-shell action-${actionKind ?? 'idle'} ${journalOpen ? 'journal-open' : ''} ${storyOpen ? 'story-open' : ''}`} data-testid="game-screen" lang={locale}>
      <a className="skip-link" href="#world-map">{word(locale, 'Bỏ qua đến bản đồ', 'Skip to map')}</a>
      <a className="skip-link" href="#dock-panel-inventory">{word(locale, 'Bỏ qua đến hành trang', 'Skip to inventory')}</a>
      {game.player.pendingAttributePoints > 0 && (
        <div
          aria-live="polite"
          className="attribute-banner"
          data-testid="attribute-banner"
          role="status"
        >
          {word(locale, `Phân bố ${String(game.player.pendingAttributePoints)} điểm trước khi tiếp tục`, `Allocate ${String(game.player.pendingAttributePoints)} points before continuing`)}
        </div>
      )}
      <header className="topbar" ref={backgroundRegion}>
        <div className="brand">
          <span className="brand-seal" aria-hidden="true">{HAN_SEALS.mystery}</span>
          <div>
            <p className="eyebrow">{word(locale, 'Kịch bản I · một mạng duy nhất', 'Scenario I · one life only')}</p>
            <h1>Phế Căn Ký <span>/ Tale of the Broken Root</span></h1>
          </div>
        </div>
        <div className="topbar-actions">
          <span className="day-chip">{word(locale, 'Ngày', 'Day')} {game.day}</span>
          {dayStamp !== null && <span className="day-stamp" data-testid="day-stamp" role="status">{word(locale, 'Ngày', 'Day')} {dayStamp}</span>}
          {deadlineRemaining !== null && (
            <span className="day-chip deadline-chip" data-testid="night-deadline-chip">
              {word(locale, 'Đêm thứ mười hai', 'Twelfth night')}: {String(deadlineRemaining)} {word(locale, 'ngày', 'days')}
            </span>
          )}
          {!journalOpen && routeEncounter === undefined && <button
            aria-controls="journal-screen"
            aria-label={word(locale, 'Mở Hành trang và giang hồ', 'Open Journey journal')}
            className="journal-launcher"
            id="journal-launcher"
            onClick={() => {
              setActiveDock('inventory')
              setJournalOpen(true)
            }}
            ref={journalLauncher}
            type="button"
          >
            <span>{word(locale, 'Hành trang', 'Journal')}</span>
            <em>{entries.reduce((sum, [, qty]) => sum + qty, 0)}</em>
            <kbd aria-hidden="true">I</kbd>
          </button>}
          <div className="language-toggle" role="group" aria-label="Language">
            <button aria-current={locale === 'vi' ? 'true' : undefined} className={locale === 'vi' ? 'active' : ''} onClick={() => onLocaleChange('vi')} type="button">VI</button>
            <button aria-current={locale === 'en' ? 'true' : undefined} className={locale === 'en' ? 'active' : ''} onClick={() => onLocaleChange('en')} type="button">EN</button>
          </div>
        </div>
      </header>

      <div className="world-content" data-testid="world-content" hidden={journalOpen || routeEncounter !== undefined}>
      <div className="stage-notices" ref={backgroundRegion}>
        <section className="chapter-banner" aria-label={word(locale, 'Chương truyện hiện tại', 'Current story chapter')}>
          <p>{word(locale, 'Chương hiện tại', 'Current chapter')}</p>
          <h2>{localized(locale, chapter)}</h2>
          <span>{locale === 'vi' ? chapter.taglineVi : chapter.taglineEn}<ChapterProgress current={scene.chapter} locale={locale} total={CHAPTERS.length} /><HoiDots current={scene.chapter} locale={locale} onOpenCodex={() => setCodexOpen(true)} total={CHAPTERS.length} /></span>
        </section>

        {warning !== null && (
          <section className={`danger-banner danger-${warning.level}`} role="status">
            <strong>⚠ {word(locale, 'Cảnh báo hiểm địa', 'Danger warning')}</strong>
            <span>{locale === 'vi' ? warning.messageVi : warning.messageEn}</span>
          </section>
        )}

        {isDeath && !deathDismissed && ending !== undefined && (
          <DeathScreen
            locale={locale}
            ending={ending}
            onRestart={onRestart}
            onDismiss={() => setDeathDismissed(true)}
          />
        )}

        {game.terminal && ending !== undefined && !(isDeath && !deathDismissed) && (
          <section className="ending-banner" role="status">
            <p>{word(locale, 'Kết cục đã định', 'Your ending')}</p>
            <h2>{localized(locale, ending)}</h2>
            <span>{locale === 'vi' ? ending.epitaphVi : ending.epitaphEn}</span>
            <div className="ending-epilogue">
              {endingLines.map((line, index) => <p key={`${line}-${index}`}>{line}</p>)}
            </div>
          </section>
        )}

        {encounterEnemy !== undefined && game.encounter !== null && (
          <section aria-live="assertive" className="encounter-banner" role="status" aria-label={word(locale, 'Giao chiến đang diễn ra', 'Active encounter')}>
            <div>
              <p className="eyebrow">{word(locale, 'Giao tranh sinh tử', 'Deterministic encounter')}</p>
              <h2>{localized(locale, encounterEnemy)}</h2>
              <span>{word(locale, 'Sinh lực địch', 'Enemy health')}: {game.encounter.hp}/{game.encounter.maxHp}</span>
            </div>
            <div className="encounter-actions">
              <button onClick={() => onAction({ kind: 'combat_attack' })} ref={basicStrikeRef} type="button">
                {word(locale, 'Đánh thường', 'Basic strike')} ({String(BASIC_STRIKE_QI_COST)} {word(locale, 'khí', 'qi')})
              </button>
              {knownTechniques.map((technique) => <button key={technique.id} onClick={() => onAction({ kind: 'combat_attack', techniqueId: technique.id })} type="button">{word(locale, 'Xuất', 'Use')} {localized(locale, technique)} ({String(techniqueQiCost(technique.power, game.techniques[technique.id] ?? 0))} {word(locale, 'khí', 'qi')})</button>)}
              <button onClick={() => onAction({ kind: 'combat_defend' })} type="button">{word(locale, 'Thủ thế', 'Defend')}</button>
              <button onClick={() => onAction({ kind: 'combat_retreat' })} type="button">
                {word(locale, 'Rút lui', 'Retreat')} (−{String(RETREAT_HP_COST)} {word(locale, 'khí huyết', 'HP')})
              </button>
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
          <InkCorner corner="top-left" />
          <div className="panel-heading">
            <div>
              <p className="eyebrow">{word(locale, 'WASD / phím mũi tên', 'WASD / arrow keys')}</p>
              <h2 id="map-title">{word(locale, 'Bản đồ khu vực', 'Local area map')}</h2>
            </div>
            <span className="location-label" data-testid="location-label">{location === undefined ? game.player.locationId : localized(locale, location)}</span>
          </div>
          <div
            className="world-map illustrated-map regional-map"
            id="world-map"
            aria-label={word(locale, 'Bản đồ khu vực có lối ra và điểm sự kiện', 'Local area map with exits and event nodes')}
            style={{ '--map-columns': MAP_WIDTH, '--map-rows': MAP_HEIGHT } as CSSProperties}
          >
            <img alt="" aria-hidden="true" className="world-map-art" src={sceneBackdrop} />
            <div className="map-current-overlay" data-testid="map-current-cell">
              <span>{word(locale, 'Ngươi đang ở đây', 'You are here')}</span>
              <strong>{currentCellLabel}</strong>
              <small>{word(locale, `Ô ${game.player.posX + 1} · ${game.player.posY + 1}`, `Cell ${game.player.posX + 1} · ${game.player.posY + 1}`)}</small>
            </div>
            <div className="map-compass" role="img" aria-label={word(locale, 'La bàn: Bắc ở phía trên', 'Compass: north is up')}>
              <span>N</span><i aria-hidden="true" />
            </div>
            <div className="map-grid-overlay" aria-hidden="true">
              {(regionMap?.cells ?? []).map((cell) => {
                const isPlayer = cell.x === game.player.posX && cell.y === game.player.posY
                const exitIcon = cell.node?.kind === 'exit' && cell.exitTo !== undefined ? locationIconFor(cell.exitTo) : undefined
                const nodeLabel = cell.node === undefined ? undefined : word(locale, cell.node.nameVi, cell.node.nameEn)
                const nodeKindLabel = cell.node === undefined ? undefined : t(locale, `map.tooltip.${cell.node.kind}`)
                // P0-2: every cell carries a localized label so screen readers
                // can announce it during roving focus.
                const cellLabel = cell.node === undefined
                  ? `${word(locale, 'Ô bản đồ', 'Map cell')} (${String(cell.x)},${String(cell.y)})`
                  : `${nodeKindLabel ?? ''}: ${nodeLabel ?? ''}`
                const nodeDir = cell.node === undefined
                  ? undefined as string | undefined
                  : (isPlayer ? t(locale, 'map.direction.here') : t(locale, `map.direction.${cellDirection(game.player.posX, game.player.posY, cell.x, cell.y)}`))
                const nodeDist = cell.node === undefined
                  ? null
                  : Math.abs(cell.x - game.player.posX) + Math.abs(cell.y - game.player.posY)
                return (
                  <div aria-label={cellLabel} className={`map-cell terrain-${cell.terrain}`} data-cell-x={cell.x} data-cell-y={cell.y} data-visited={isPlayer ? 'true' : undefined} key={`${cell.x}-${cell.y}`} onKeyDown={(event) => handleCellKeyDown(event, cell.x, cell.y)} role="gridcell" tabIndex={0}>
                    {cell.node !== undefined && <span className={`map-icon-slot map-node node-${cell.node.kind} ${routeTarget?.nodeId === cell.node.id ? 'is-route-target' : ''}`} data-testid={routeTarget?.nodeId === cell.node.id ? 'route-event-node' : `event-node-${cell.node.id}`} title={word(locale, `${cell.node.kind === 'exit' ? 'Lối ra' : cell.node.kind === 'npc' ? 'Người' : cell.node.kind === 'danger' ? 'Hiểm họa' : 'Sự kiện'}: ${cell.node.nameVi}`, `${cell.node.kind === 'exit' ? 'Exit' : cell.node.kind === 'npc' ? 'NPC' : cell.node.kind === 'danger' ? 'Danger' : 'Event'}: ${cell.node.nameEn}`)} tabIndex={0}
                      ><span className="map-icon-placeholder" aria-hidden="true">{mapNodeGlyph(cell.node.kind)}</span>{cell.node.kind === 'exit' && exitIcon !== undefined && <img alt="" aria-hidden="true" className="map-exit-icon" src={exitIcon} loading="lazy" decoding="async" onError={(event) => { const img = event.currentTarget; img.style.display = 'none'; img.src = ''; }} />}</span>}
                    {cell.node !== undefined && (
                      <span className="map-node-tooltip" data-testid="map-node-tooltip" role="tooltip">
                        {t(locale, 'map.tooltip.dist', { name: nodeLabel ?? '', kind: nodeKindLabel ?? '', direction: nodeDir ?? '', n: String(nodeDist) })}
                      </span>
                    )}
                    {routeTarget?.nodeId === cell.node?.id && <span aria-hidden="true" className="route-node-seal">{word(locale, 'Dấu vết', 'Lead')}</span>}
                    {cell.node !== undefined && <span className="map-node-label">{nodeLabel}</span>}
                    {isPlayer && <span className={`player-map-marker action-${actionKind ?? 'idle'}`} data-testid="player-map-marker" key={`player-${actionNonce}`} title={word(locale, 'Nhân vật của bạn', 'Your character')}>
                      {actionKind === 'move' && <i className="player-map-arrow" aria-hidden="true" data-direction="move" />}
                    </span>}
                  </div>
                )
              })}
            </div>
            <ul className="map-node-summary" aria-label={word(locale, 'Các điểm trên bản đồ', 'Points on the map')}>
              {(regionMap?.cells ?? []).flatMap((cell) => cell.node === undefined ? [] : [
                <li key={`map-summary-${cell.node.id}`}>
                  {word(locale, `${cell.node.nameVi} — ${cell.node.kind}, ô ${cell.x + 1} · ${cell.y + 1}`, `${cell.node.nameEn} — ${cell.node.kind}, cell ${cell.x + 1} · ${cell.y + 1}`)}
                </li>,
              ])}
            </ul>
          </div>
          <div className="map-legend" aria-label={word(locale, 'Chú giải bản đồ', 'Map legend')}>
            <span className="map-legend-row map-legend-player" role="img" tabIndex={-1} aria-label={t(locale, 'map.legend.player')}><i className="legend-player" aria-hidden="true" />{t(locale, 'map.legend.player')}</span>
            <span className="map-legend-row" role="img" tabIndex={-1} aria-label={t(locale, 'map.legend.people')}><i className="legend-slot" aria-hidden="true">{mapNodeGlyph('npc')}</i><span className="legend-label">{t(locale, 'map.legend.people')}</span></span>
            <span className="map-legend-row" role="img" tabIndex={-1} aria-label={t(locale, 'map.legend.event')}><i className="legend-slot" aria-hidden="true">{mapNodeGlyph('event')}</i><span className="legend-label">{t(locale, 'map.legend.event')}</span></span>
            <span className="map-legend-row" role="img" tabIndex={-1} aria-label={t(locale, 'map.legend.exit')}><i className="legend-slot" aria-hidden="true">{mapNodeGlyph('exit')}</i><span className="legend-label">{t(locale, 'map.legend.exit')}</span></span>
            <span className="map-legend-row" role="img" tabIndex={-1} aria-label={t(locale, 'map.legend.danger')}><i className="legend-slot" aria-hidden="true">{mapNodeGlyph('danger')}</i><span className="legend-label">{t(locale, 'map.legend.danger')}</span></span>
            <span className="map-legend-row" role="img" tabIndex={-1} aria-label={t(locale, 'map.legend.fog')}><i className="legend-fog" aria-hidden="true" /><span className="legend-label">{t(locale, 'map.legend.fog')}</span></span>
            <span className="map-legend-hint">{word(locale, 'Đi đến chấm sáng để gặp người, gặp sự kiện, hoặc qua cổng. Nước và núi chặn lối. Chấm đỏ là hiểm họa — hãy nghỉ (Rest) hồi máu trước khi vào.', 'Walk to a glowing point to meet people, find events, or use an exit. Water and mountains block the way. Red points are danger — rest to heal before you enter.')}</span>
          </div>
          <aside className="map-context" aria-labelledby="map-context-title">
            <p className="section-kicker" id="map-context-title">{word(locale, 'Dấu chân trên đường', 'Trail notes')}</p>
            <strong>{currentCellLabel}</strong>
            <span>{currentCell?.node === undefined
              ? word(locale, `Ngươi đang đứng trên ${terrainLabel(locale, currentCell?.terrain).toLowerCase()}.`, `You are standing on ${terrainLabel(locale, currentCell?.terrain).toLowerCase()}.`)
              : word(locale, 'Một chốn có chuyện để nghe hoặc tự mình đổi thay.', 'A place with someone to hear or something to change yourself.')}
            </span>
            {nextMapNode?.node !== undefined && nextMapNodeDistance !== null && (
              <div>
                <em>{word(locale, 'Điểm gần nhất', 'Nearest lead')}</em>
                <b>{word(locale, nextMapNode.node.nameVi, nextMapNode.node.nameEn)} · {nextMapNodeDistance} {word(locale, 'ô', 'cells')}</b>
              </div>
            )}
            {routeStatus !== null && (
              <div>
                <em>{word(locale, 'Dấu vết câu chuyện', 'Story lead')}</em>
                <b>{routeStatus}</b>
              </div>
            )}
          </aside>
        </section>

        {storyOpen && <section aria-labelledby="story-title" aria-modal="true" className="story-panel parchment-panel" data-testid="narration-panel" onKeyDown={trapStoryFocus} role="dialog">
          <InkCorner corner="top-right" />
          <div className="panel-heading">
            <button autoFocus className="story-close" onClick={onStoryClose} type="button">{word(locale, 'Tiếp tục', 'Continue')} <kbd aria-hidden="true">Esc</kbd></button>
            <div>
              <p className="eyebrow">{word(locale, 'Mạch truyện', 'Deterministic story')}</p>
              <h2 id="story-title">{locale === 'vi' ? scene.titleVi : scene.titleEn}</h2>
            </div>
            <span className="root-badge">{word(locale, 'Linh căn', 'Spirit root')}: {locale === 'vi' ? game.spiritRoot.elementVi : game.spiritRoot.elementEn}</span>
          </div>
          <figure className="scene-backdrop">
            <img alt={sceneBackdropAlt} src={sceneBackdrop} />
          </figure>
          <p className="beat-copy">{locale === 'vi' ? scene.textVi : scene.textEn}</p>
          <button
            aria-controls="story-chronicle"
            className="chronicle-jump"
            onClick={() => chronicleRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })}
            type="button"
          >
            <span>{word(locale, 'Biên niên ký còn ở phía dưới', 'Chronicle continues below')}</span>
            <em>{chronicle.length} {word(locale, 'bản ghi', 'entries')} ↓</em>
          </button>

          <div className="choice-area">
            <p className="section-kicker">{word(locale, 'Lựa chọn của ngươi', 'Your choices')}</p>
            <div className="story-choices">
              {scene.choices.map((choice, index) => (
                (() => {
                  const available = findStoryChoice(game, choice.id) !== undefined
                  const lockedByRoute = !available && routeTarget !== undefined
                  return (
                <button
                  className="choice-button"
                  disabled={game.terminal || encounterLocked || !available}
                  key={choice.id}
                  onClick={() => onAction({ kind: 'story_choice', choiceId: choice.id })}
                  ref={index === 0 ? firstStoryChoiceRef : undefined}
                  type="button"
                >
                  <span>{index + 1}</span>
                  <span className="story-choice-copy"><strong>{lockedByRoute && <i aria-hidden="true" className="choice-lock">◆</i>}{locale === 'vi' ? choice.labelVi : choice.labelEn}</strong><small>{lockedByRoute ? word(locale, 'Trước hết hãy đến đúng dấu vết được đóng trên bản đồ.', 'First reach the sealed story lead on the map.') : locale === 'vi' ? choice.consequenceVi : choice.consequenceEn}</small></span>
                  <i aria-hidden="true" className="choice-seal">{HAN_SEALS.choice}</i>
                </button>
                  )
                })()
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
                placeholder={freeTextPlaceholder}
                value={command}
              />
              <button disabled={game.terminal || aiSuggesting || command.trim().length === 0} type="submit">{aiSuggesting ? word(locale, 'Đang lắng nghe…', 'Listening…') : word(locale, 'Thử vận', 'Act')}</button>
            </div>
            {aiSuggestLine !== null && <p className="ai-suggest-line" role="status">{aiSuggestLine}</p>}
            <small>{word(locale, 'Các lựa chọn phía trên là bước ngoặt của truyện. Ngoài ra, hãy nói điều ngươi muốn làm; thế giới sẽ giải thích khi điều đó chưa thể thực hiện.', 'The choices above are story turning points. Outside them, state what you want to do; the world will explain when it cannot happen yet.')}</small>
          </form>

          {objective !== null && (
            <section className="objective-widget" aria-live="polite" aria-label={t(locale, 'ui.objective.title')} data-testid="objective-line">
              <p className="objective-heading"><span className="objective-seal" aria-hidden="true">{HAN_SEALS.objective}</span>{t(locale, 'ui.objective.title')}</p>
              <p className="objective-line">{objective}</p>
            </section>
          )}

          {routeProof !== undefined && <aside className="route-proof" data-testid="route-proof" aria-label={word(locale, 'Vật chứng mang theo', 'Carried proof')}>
            <p>{word(locale, 'Vật chứng mang theo', 'Carried proof')}</p>
            <strong>{word(locale, routeProof.proofVi, routeProof.proofEn)}</strong>
            <em>{game.flags.story_proof_present === true ? word(locale, 'Đã công khai · mở lời chứng ở Hang và phiên xét xử', 'Public · opens testimony at the cave and trial') : word(locale, 'Đã giấu kín · mở đường bí mật ở Hang và phiên xét xử', 'Concealed · opens the covert path at the cave and trial')}</em>
            <span>{scene.id === 'cave_witness'
              ? word(locale, 'Hà nhận ra dấu mực này trước khi ngươi kịp nói tên mình.', 'Ha recognizes this mark before you can say your name.')
              : scene.id === 'sect_trial'
                ? word(locale, 'Nó có thể được đặt lên bàn xét xử — hoặc giấu đi cùng một lời nói dối.', 'You can lay it on the trial table — or hide it with a lie.')
                : word(locale, 'Nó ở trong tay áo, sẵn sàng theo ngươi qua cửa hang.', 'It rests in your sleeve, ready to cross the cave threshold with you.')}
            </span>
          </aside>}

          <ChronicleFeed
            chronicle={chronicle}
            chronicleEndRef={chronicleEndRef}
            chronicleKinds={chronicleKinds}
            chronicleNewAt={chronicleNewAt}
            chronicleRef={chronicleRef}
            locale={locale}
          />
      </section>}

        <aside className="hud-panel" ref={backgroundRegion}>
          {system !== null && game.flags.system_refused !== true && <section className="system-panel ink-card" aria-labelledby="system-panel-title" data-testid="system-panel">
            <div className="panel-heading compact"><h2 id="system-panel-title">{locale === 'vi' ? system.headerVi : system.headerEn}</h2><span>{t(locale, 'system.poolHeader')}</span></div>
            {systemFeed.length > 0 && <ul className="system-feed" data-testid="system-feed">
              {systemFeed.map((entry, index) => <li key={`${entry.id}-${index}`}>{systemNotificationText(entry, locale)}</li>)}
            </ul>}
            <p className="system-personality">{locale === 'vi' ? system.personalityVi : system.personalityEn}</p>
            <ul className="system-quest-list">
              {systemQuests.map((quest) => {
                const status = game.quests[quest.id]?.status ?? 'available'
                const turnInReady = status === 'active' && canCompleteQuest(game, quest.id).ok
                return <li key={quest.id}>
                  <div><strong>{localized(locale, quest)}</strong><small>{t(locale, 'system.difficulty')} {quest.difficulty}</small></div>
                  {status === 'available' && <button disabled={game.terminal || encounterLocked} onClick={() => onAction({ kind: 'system_accept_quest', questId: quest.id })} type="button">{t(locale, 'system.acceptQuest')}</button>}
                  {status === 'active' && <button disabled={game.terminal || encounterLocked || !turnInReady} onClick={() => onAction({ kind: 'system_turn_in_quest', questId: quest.id })} type="button">{t(locale, 'system.turnIn')}</button>}
                  {status === 'completed' && <em>{t(locale, 'system.locked')}</em>}
                </li>
              })}
            </ul>
            <form className="system-chat" onSubmit={submitSystemMessage}>
              <label htmlFor="system-chat">{locale === 'vi' ? system.nameVi : system.nameEn}</label>
              <div><input disabled={game.terminal || systemReplying} id="system-chat" maxLength={300} onChange={(event) => setSystemMessage(event.target.value)} placeholder={t(locale, 'system.chatPlaceholder')} value={systemMessage} /><button disabled={game.terminal || systemReplying || systemMessage.trim().length === 0} type="submit">{word(locale, 'Hỏi', 'Talk')}</button></div>
              {systemReply !== null ? <p role="status">{locale === 'vi' ? systemReply.textVi : systemReply.textEn}{systemReply.questId !== undefined && (game.quests[systemReply.questId]?.status ?? 'available') === 'available' && <button disabled={game.terminal || encounterLocked} onClick={() => { onAction({ kind: 'system_accept_quest', questId: systemReply.questId! }); setSystemReply(null) }} type="button">{t(locale, 'system.acceptQuest')}</button>}</p> : <small>{t(locale, 'system.chatFallback')}</small>}
            </form>
          </section>}
          <section className="stats-card ink-card" aria-labelledby="stats-title">
            <div className="panel-heading compact"><h2 id="stats-title">{word(locale, 'Tu vi', 'Cultivation')}</h2>
              <StageProgress locale={locale} realmLevel={game.player.realmLevel} stage={game.player.stage} progress={game.player.progress} />
            </div>
            <RealmLadder locale={locale} stage={game.player.stage} />
            <figure className={`protagonist-portrait player-action-art pose-${playerPose}`} data-pose={playerPose} data-testid="player-action-art">
              <img
                alt={word(locale, `Tư thế nhân vật: ${playerPose}`, `Player action pose: ${playerPose}`)}
                key={`player-pose-${playerPose}-${actionNonce}`}
                src={playerArtFor(playerPose)}
              />
            </figure>
            <Meter label="HP" value={game.player.hp} max={100} tone="red" delta={statDeltas.nonce === 0 ? 0 : statDeltas.hp} deltaTestid="hp-delta" />
            <Meter label="Qi" value={game.player.qi} max={60} tone="jade" delta={statDeltas.nonce === 0 ? 0 : statDeltas.qi} deltaTestid="qi-delta" />
            <Meter className="meter-progress" label={word(locale, 'Tiến độ', 'Progress')} value={game.player.progress} max={nextStageThreshold(game.player.stage, game.player.realmLevel) ?? Math.max(1, game.player.progress)} tone="gold" />
            <div className="stat-strip">
              <span data-testid="currency-gold"><span aria-hidden="true">◎</span> {game.player.gold} {word(locale, 'vàng', 'gold')}</span>
              <span data-testid="currency-silver"><span aria-hidden="true">◉</span> {game.player.silver ?? 0} {word(locale, 'bạc', 'silver')}</span>
              <span data-testid="currency-spirit-stones"><span aria-hidden="true">✦</span> {game.player.spiritStones ?? 0} {word(locale, 'linh thạch', 'spirit stones')}</span>
              <span>{word(locale, 'Độ tương hợp', 'root rate')} {Math.round(game.spiritRoot.efficiency * 100)}%</span>
            </div>
            <dl className="attributes">
              <div><dt>{word(locale, 'Thân', 'Body')}</dt><dd>{game.player.attrs.body}</dd></div>
              <div><dt>{word(locale, 'Tâm', 'Mind')}</dt><dd>{game.player.attrs.mind}</dd></div>
              <div><dt>{word(locale, 'Mị', 'Charm')}</dt><dd>{game.player.attrs.charm}</dd></div>
              <div><dt>{word(locale, 'Vận', 'Luck')}</dt><dd>{game.player.attrs.luck}</dd></div>
            </dl>
            {game.player.pendingAttributePoints > 0 && <AttributeAllocation
              attrs={game.player.attrs}
              headingRef={allocationHeading}
              locale={locale}
              points={game.player.pendingAttributePoints}
              onAllocate={(attribute) => onAction({ kind: 'allocate_attribute', attribute })}
            />}
            <EquipmentSummary equipment={game.equipment} locale={locale} />
          </section>

          <section className="quick-actions ink-card" aria-label={word(locale, 'Thao tác nhanh', 'Quick actions')}>
            <button disabled={game.terminal || encounterLocked || game.player.pendingAttributePoints > 0} onClick={() => onAction({ kind: 'rest' })} type="button">{word(locale, 'Nghỉ', 'Rest')}</button>
            <button disabled={game.terminal || encounterLocked || game.player.pendingAttributePoints > 0} onClick={() => onAction({ kind: 'train' })} type="button">{word(locale, 'Tu luyện', 'Cultivate')}</button>
            <button disabled={game.terminal || encounterLocked || game.player.pendingAttributePoints > 0} onClick={() => onAction({ kind: 'gather' })} type="button">{word(locale, 'Hái thảo', 'Gather')}</button>
            <button disabled={game.terminal || encounterLocked || game.player.pendingAttributePoints > 0} onClick={() => onAction({ kind: 'draw_lottery' })} type="button">{word(locale, 'Quay', 'Draw')}</button>
          </section>
        </aside>
      </div>
      </div>

      {routeEncounter !== undefined && <section className="route-encounter-screen parchment-panel" ref={backgroundRegion} aria-labelledby="route-encounter-title" data-testid="route-encounter-screen">
        <InkCorner corner="top-left" />
        <div className="route-encounter-copy">
          <p className="eyebrow">{word(locale, 'Sự kiện tuyến truyện · tại chỗ', 'Story route encounter · on site')}</p>
          <p className="route-encounter-location">{location === undefined ? game.player.locationId : localized(locale, location)}</p>
          <h2 id="route-encounter-title">{word(locale, routeEncounter.titleVi, routeEncounter.titleEn)}</h2>
          <p className="route-encounter-text">{word(locale, routeEncounter.textVi, routeEncounter.textEn)}</p>
          <div className="route-encounter-action">
            <p>{word(locale, 'Chọn điều phải đánh đổi', 'Choose what to risk')}</p>
            <div className="route-encounter-actions">
              {routeEncounter.choices.map((choice, index) => <button autoFocus={index === 0} key={choice.approach} onClick={() => onAction({ kind: 'resolve_route_event', approach: choice.approach })} type="button">
                <strong>{word(locale, choice.labelVi, choice.labelEn)}</strong>
                <span>{word(locale, choice.consequenceVi, choice.consequenceEn)}</span>
              </button>)}
            </div>
          </div>
          <aside className="route-encounter-aftermath">
            <p>{word(locale, 'Vật chứng sẽ mang theo', 'Proof you will carry')}</p>
            <strong>{word(locale, routeEncounter.proofVi, routeEncounter.proofEn)}</strong>
            <span>{word(locale, routeEncounter.aftermathVi, routeEncounter.aftermathEn)}</span>
          </aside>
        </div>
      </section>}

      <section className="journal-screen system-dock parchment-panel" ref={backgroundRegion} aria-labelledby="system-dock-title" data-testid="journal-screen" hidden={!journalOpen || routeEncounter !== undefined} id="journal-screen">
        <InkCorner corner="bottom-left" />
        <div className="journal-heading dock-heading">
          <div>
            <p className="eyebrow">{word(locale, 'Sổ tay hành tẩu', 'Wandering journal')}</p>
            <h2 id="system-dock-title">{word(locale, 'Hành trang & giang hồ', 'Journey systems')}</h2>
          </div>
          <button className="journal-return" onClick={() => {
            setJournalOpen(false)
            window.requestAnimationFrame(() => journalLauncher.current?.focus())
          }} type="button">
            {word(locale, '← Về thế giới', '← Back to world')} <kbd aria-hidden="true">Esc</kbd>
          </button>
        </div>
        <DockTabBar
          activeDock={activeDock}
          entriesCount={entries.reduce((sum, [, qty]) => sum + qty, 0)}
          game={game}
          locale={locale}
          localNpcsCount={localNpcs.length}
          onSelect={setActiveDock}
        />
        <DockPanelContainer activeDock={activeDock} panels={{
          people: <DockPanelPeople
            actionKind={actionKind}
            encounterLocked={encounterLocked}
            game={game}
            locale={locale}
            onAction={onAction}
            onCloseJournal={() => { setJournalOpen(false); window.requestAnimationFrame(() => journalLauncher.current?.focus()) }}
          />,
          quests: <DockPanelQuests
            encounterLocked={encounterLocked}
            game={game}
            locale={locale}
            onAction={onAction}
          />,
          inventory: <DockPanelInventory
            actionKind={actionKind}
            encounterLocked={encounterLocked}
            entries={entries}
            game={game}
            locale={locale}
            onAction={onAction}
            onSelectId={setSelectedInventoryItemId}
            selectedInventoryArt={selectedInventoryArt}
            selectedInventoryEquipment={selectedInventoryEquipment}
            selectedInventoryId={selectedInventoryId}
            selectedInventoryItem={selectedInventoryItem}
            stored={stored}
          />,
          market: <DockPanelMarket
            actionKind={actionKind}
            encounterLocked={encounterLocked}
            entries={entries}
            game={game}
            locale={locale}
            onAction={onAction}
          />,
          path: <DockPanelPath
            encounterLocked={encounterLocked}
            game={game}
            locale={locale}
            onAction={onAction}
          />,
        }} />
            <details className="codex-drawer" data-testid="codex-drawer" onToggle={(event) => setCodexOpen(event.currentTarget.open)} open={codexOpen}>
              <summary>{word(locale, 'Mở tu điển: nhân vật, vật phẩm, thiên phú & gói minh họa', 'Open codex: NPCs, items, talents & asset packs')}</summary>
              {codexOpen && <CodexPanel entries={codexEntries} locale={locale} onEndingSelect={() => setCodexOpen(true)} packs={ASSET_PACK_MANIFEST} />}
            </details>
      </section>

    </main>
  )
}

interface MeterProps {
  className?: string
  label: string
  value: number
  max: number
  tone: 'red' | 'jade' | 'gold'
  delta?: number
  deltaTestid?: string
}

function Meter({ className = '', label, value, max, tone, delta = 0, deltaTestid }: MeterProps) {
  const percent = Math.max(0, Math.min(100, (value / max) * 100))
  return (
    <div className={`meter ${className} ${delta !== 0 ? (delta > 0 ? 'delta-up' : 'delta-down') : ''}`}>
      <div>
        <span>{label}</span>
        {delta !== 0 && deltaTestid !== undefined && (
          <em className="meter-delta" data-testid={deltaTestid} data-direction={delta > 0 ? 'up' : 'down'}>
            {delta > 0 ? `+${String(delta)}` : String(delta)}
          </em>
        )}
        <strong>{value}/{max}</strong>
      </div>
      <span className={`meter-track ${tone}`}><i style={{ width: `${percent}%` }} /></span>
    </div>
  )
}

interface StageProgressProps {
  stage: number
  realmLevel: number
  progress: number
  locale: Locale
}

function StageProgress({ stage, realmLevel, progress, locale }: StageProgressProps) {
  const threshold = nextStageThreshold(stage, realmLevel)
  const realm = REALM_STAGES[stage]
  const realmName = realm === undefined ? word(locale, 'Cảnh giới viên mãn', 'Peak realm') : word(locale, realm.vi, realm.en)
  const rankName = word(locale, `tầng ${String(realmLevel)}`, `rank ${String(realmLevel)}`)
  if (threshold === null) return <span className="stage-chip stage-chip--cap">{realmName} · {rankName} · {word(locale, 'viên mãn', 'peak')}</span>
  const pct = Math.round((progress / threshold) * 100)
  const progressLabel = word(locale, `Tiến độ tu vi ${String(progress)} trên ${String(threshold)}`, `Cultivation progress ${String(progress)} of ${String(threshold)}`)
  return (
    <span className="stage-progress" title={word(locale, `Còn ${String(threshold - progress)} điểm tiến độ tới tầng kế tiếp`, `${String(threshold - progress)} progress to the next rank`)}>
      <span>{`${realmName} · ${rankName}`}</span>
      <span>{progress}/{threshold}</span>
      <i aria-label={progressLabel} aria-valuemax={threshold} aria-valuemin={0} aria-valuenow={progress} role="progressbar"><b style={{ '--progress': `${pct}%` } as CSSProperties} /></i>
    </span>
  )
}

interface RealmLadderProps {
  stage: number
  locale: Locale
}

// The realm ladder is the genre's signature progress read: six seals from
// mortal breathing to ascension, the current rung lit like a fresh stamp.
function RealmLadder({ stage, locale }: RealmLadderProps) {
  return (
    <div className="realm-ladder" role="img" aria-label={word(locale, 'Thang cảnh giới tu luyện', 'Cultivation realm ladder')} data-testid="realm-ladder">
      {REALM_STAGES.map((entry, index) => {
        const reached = index <= stage
        const current = index === stage
        return (
          <span className={`realm-rung ${reached ? 'is-reached' : ''} ${current ? 'is-current' : ''}`} key={entry.en} title={`${locale === 'vi' ? entry.vi : entry.en}${current ? ` · ${word(locale, 'hiện tại', 'current')}` : ''}`}>
            <i aria-hidden="true">{entry.seal}</i>
            <em>{locale === 'vi' ? entry.vi : entry.en}</em>
          </span>
        )
      })}
    </div>
  )
}

interface ChapterProgressProps {
  current: number
  total: number
  locale: Locale
}

function ChapterProgress({ current, total, locale }: ChapterProgressProps) {
  return (
    <span className="chapter-progress" aria-label={word(locale, `Chương ${String(current)} trên ${String(total)}`, `Chapter ${String(current)} of ${String(total)}`)}>
      {Array.from({ length: total }, (_, index) => (
        <i className={index < current ? 'is-lit' : ''} key={index} />
      ))}
      <em>{word(locale, `${String(current)}/${String(total)}`, `${String(current)}/${String(total)}`)}</em>
    </span>
  )
}
