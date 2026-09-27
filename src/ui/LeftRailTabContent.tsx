import { useCallback, useEffect, useMemo, useRef, useState, type FormEvent } from 'react'
import type { Action, GameState, Locale } from '../engine'
import {
  activeSystem,
  canAcceptQuest,
  canCompleteQuest,
  currentStepIndex,
  getAffection,
  isQuestUnlocked,
  queueDrain,
  questStatus,
  TECHNIQUES,
} from '../engine'
import { getItem, getLocation, getNpc, NPCS, QUESTS } from '../content'
import { itemArtFor } from './rpgArt'
import { deriveObjective } from './objective'
import { requestSystemReply, fastClassifySystem, buildDeterministicSystemReply } from '../ai/system'
import { localized, systemNotificationText, currencyExchangeRows, equipmentRows, itemName, marketLockReason, marketRows, pathLockReason, techniqueRows } from './gameScreen/helpers'
import './left-rail.css'

/* =========================================================================
 *  LeftRail tab content — 6 tabs render thật từ engine data
 *  Wire với prototype: people, vital, items, market, path, system
 * ========================================================================= */

export type LeftTab = 'people' | 'vital' | 'items' | 'market' | 'path' | 'quest' | 'system'

export interface LeftRailTabContentProps {
  tab: LeftTab
  game: GameState
  locale: Locale
  onAction?: (action: Action) => void
  onNpcClick?: (npcId: string) => void
}

interface SystemChatMessage {
  sender: 'player' | 'system'
  text: string
  questId?: string
}

/** T1: the one line that says which gate is shut. Without it the Chợ / Đạo đồ
 * tabs answered a click with a disabled button and no stated reason. */
function RailLockNotice({ testId, text }: { testId: string; text: string }): JSX.Element {
  return (
    <div className="proto-rail-lock" data-testid={testId} role="status">
      <span className="proto-rail-lock__glyph" aria-hidden="true">鎖</span>
      <p className="proto-rail-lock__text">{text}</p>
    </div>
  )
}

function getQuestCategory(questId: string): 'main' | 'side' | 'system' | 'secret' {
  if (questId.startsWith('q_main_')) return 'main'
  if (questId.startsWith('q_sys_')) return 'system'
  const q = QUESTS.find(qq => qq.id === questId)
  if (q?.secret) return 'secret'
  return 'side'
}

export function LeftRailTabContent({ tab, game, locale, onAction, onNpcClick }: LeftRailTabContentProps): JSX.Element {
  const vi = locale === 'vi'
  const location = getLocation(game.player.locationId)
  const localNpcs = useMemo(() => NPCS.filter((n) => n.locationId === game.player.locationId), [game.player.locationId])
  const inventoryEntries = Object.entries(game.inventory).filter(([, qty]) => qty > 0)

  // Item hover state
  const [hovered, setHovered] = useState<{
    item: ReturnType<typeof getItem>
    id: string
    qty: number
    rect: { top: number; left: number; right: number; bottom: number }
  } | null>(null)
  const hoverTimeoutRef = useRef<number | null>(null)
  const popoverRef = useRef<HTMLDivElement>(null)

  // System chat state
  const system = activeSystem(game)
  const [userMessages, setUserMessages] = useState<SystemChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  // Quest tab state
  const [questFilter, setQuestFilter] = useState<'all' | 'main' | 'side' | 'system' | 'secret'>('all')
  const [showCompleted, setShowCompleted] = useState(false)
  const [showOnboarding, setShowOnboarding] = useState(true)

  // System derived quests & objective
  const objective = useMemo(() => deriveObjective(game, locale), [game, locale])
  const activeQuests = useMemo(() => QUESTS.filter((q) => questStatus(game, q.id) === 'active'), [game])
  const availableQuests = useMemo(
    () =>
      QUESTS.filter((q) => questStatus(game, q.id) === 'available' && isQuestUnlocked(game, q.id)).map(
        (q) => ({
          ...q,
          acceptCheck: canAcceptQuest(game, q.id),
        }),
      ),
    [game],
  )
  const completedQuests = useMemo(() => QUESTS.filter((q) => questStatus(game, q.id) === 'completed'), [game])

  const systemIntro: SystemChatMessage = useMemo(() => {
    if (system !== null) {
      return {
        sender: 'system',
        text: vi
          ? `【${system.nameVi}】: ${system.personalityVi}`
          : `[${system.nameEn}]: ${system.personalityEn}`,
      }
    }
    return {
      sender: 'system',
      text: vi
        ? '【Hệ Thống】: Khế ước chưa kích hoạt. Tìm kiếm cơ duyên để mở khóa.'
        : '[System]: Contract not yet activated.',
    }
  }, [system, vi])

  const queuedMessages: SystemChatMessage[] = useMemo(() => {
    if (!game.systemQueue || game.systemQueue.length === 0) return []
    return queueDrain(game.systemQueue, 5).visible.map((entry) => ({
      sender: 'system',
      text: systemNotificationText(entry, locale),
    }))
  }, [game.systemQueue, locale])

  const chatLog: SystemChatMessage[] = useMemo(() => [systemIntro, ...queuedMessages, ...userMessages], [systemIntro, queuedMessages, userMessages])

  const handleSlotEnter = (id: string, qty: number, target: HTMLElement) => {
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
    const r = target.getBoundingClientRect()
    const item = getItem(id)
    setHovered({ item, id, qty, rect: { top: r.top, left: r.left, right: r.right, bottom: r.bottom } })
  }

  const handleSlotLeave = () => {
    hoverTimeoutRef.current = window.setTimeout(() => {
      setHovered(null)
      hoverTimeoutRef.current = null
    }, 180)
  }

  const handlePopoverEnter = () => {
    if (hoverTimeoutRef.current !== null) {
      window.clearTimeout(hoverTimeoutRef.current)
      hoverTimeoutRef.current = null
    }
  }

  const handlePopoverLeave = () => {
    setHovered(null)
  }

  // Click-outside handler to dismiss popover when clicking outside
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (hovered && popoverRef.current && !popoverRef.current.contains(e.target as Node)) {
        setHovered(null)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [hovered])

  const sendSystemMessage = useCallback((msg: string) => {
    const trimmed = msg.trim()
    if (!trimmed || isReplying || game.terminal) return
    setInputMessage('')
    setUserMessages((prev) => [...prev, { sender: 'player', text: trimmed }])
    setIsReplying(true)
    void (async () => {
      let reply = await requestSystemReply(game, trimmed, locale)
      if (reply === null) {
        const fastDecision = await fastClassifySystem(game, trimmed)
        reply = buildDeterministicSystemReply(game, trimmed, locale, fastDecision)
      }
      setIsReplying(false)
      setUserMessages((prev) => [
        ...prev,
        {
          sender: 'system',
          text: vi ? reply.textVi : reply.textEn,
          questId: reply.questId,
        },
      ])
    })()
  }, [game, isReplying, locale, vi])

  const handleSendSystemMessage = (e: FormEvent) => {
    e.preventDefault()
    sendSystemMessage(inputMessage)
  }

  useEffect(() => {
    if (typeof window === 'undefined') return
    const w = window as unknown as {
      __sendSystemChat?: (msg: string) => void
      __pendingSystemChat?: string
    }
    w.__sendSystemChat = (msg: string) => {
      sendSystemMessage(msg)
    }
    if (w.__pendingSystemChat) {
      const queued = w.__pendingSystemChat
      w.__pendingSystemChat = undefined
      sendSystemMessage(queued)
    }
    return () => {
      delete w.__sendSystemChat
    }
  }, [sendSystemMessage])

  // expose for child click handlers when wired
  if (onNpcClick === undefined) { /* noop */ }

  if (tab === 'people') {
    return (
      <div className="proto-npc-list">
        {localNpcs.length === 0
          ? <div className="proto-npc"><div /><div><div className="proto-npc__name">—</div><div className="proto-npc__meta">{vi ? 'Không có ai ở đây' : 'No one around'}</div></div><div /></div>
          : localNpcs.map((n) => {
            const initial = vi ? n.nameVi.charAt(0) : n.nameEn.charAt(0)
            // Issue #39: the heart shows the real counter (talk and gifts both
            // move it) — it used to be a hardcoded "—", which made every
            // relationship look dead no matter what the player did.
            const aff = getAffection(game, n.id)
            // Issue #38: the avatar letter must be aria-hidden — screen readers
            // read the whole button, so "T" + "Thương nhân" came out as
            // "TThương nhân". Same reason the items/path glyphs hide.
            return (
              <button key={n.id} type="button" data-npc-btn={n.id} className="proto-npc" onClick={() => { if (typeof window !== 'undefined') (window as unknown as { __openChat?: (id: string) => void }).__openChat?.(n.id) }} style={{ background: 'var(--surface)', cursor: 'pointer', textAlign: 'left' }}>
                <div className="proto-npc__avatar" aria-hidden="true">{initial}</div>
                <div>
                  <div className="proto-npc__name">{vi ? n.nameVi : n.nameEn}</div>
                  <div className="proto-npc__meta">{vi ? n.roleVi : n.roleEn}</div>
                </div>
                <div className="proto-npc__heart" aria-label={vi ? `Hảo cảm ${String(aff)}` : `Rapport ${String(aff)}`}>♥ {String(aff)}</div>
              </button>
            )
          })}
      </div>
    )
  }

  if (tab === 'vital') {
    return (
      <div className="proto-vital-grid">
        <div className="proto-vital"><div className="proto-vital__k">{vi ? 'Cảnh giới' : 'Realm'}</div><div className="proto-vital__v">LK · {game.player.stage}</div></div>
        <div className="proto-vital"><div className="proto-vital__k">{vi ? 'Khí huyết' : 'HP'}</div><div className="proto-vital__v">{game.player.hp}</div></div>
        <div className="proto-vital"><div className="proto-vital__k">{vi ? 'Linh khí' : 'Qi'}</div><div className="proto-vital__v">{game.player.qi}</div></div>
        <div className="proto-vital"><div className="proto-vital__k">{vi ? 'Vị trí' : 'Location'}</div><div className="proto-vital__v" style={{ fontSize: 12 }}>{vi ? location?.nameVi : location?.nameEn}</div></div>
      </div>
    )
  }

  if (tab === 'items') {
    const filled: Record<number, [string, number]> = {}
    inventoryEntries.forEach(([id, qty], i) => { if (i < 50) filled[i] = [id, qty] })

    return (
      <div className="proto-item-tab">
        <div className="proto-item-grid" role="grid" aria-label={vi ? 'Ô hành trang' : 'Inventory slots'}>
          {Array.from({ length: 50 }, (_, i) => {
            const f = filled[i]
            if (f === undefined) {
              return (
                <div
                  key={i}
                  className="proto-slot"
                  role="gridcell"
                  aria-label={vi ? 'Ô trống' : 'Empty slot'}
                  onClick={() => setHovered(null)}
                />
              )
            }
            const [itemId, qty] = f
            const item = getItem(itemId)
            const name = item !== undefined ? (vi ? item.nameVi : item.nameEn) : itemId
            const art = itemArtFor(itemId)

            return (
              <div
                key={i}
                role="gridcell"
                tabIndex={0}
                className="proto-slot proto-slot--filled"
                title={name}
                data-item-id={itemId}
                aria-label={`${name}, ${qty}`}
                onMouseEnter={(e) => handleSlotEnter(itemId, qty, e.currentTarget)}
                onMouseLeave={handleSlotLeave}
                onFocus={(e) => handleSlotEnter(itemId, qty, e.currentTarget)}
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget as Node)) {
                    handleSlotLeave()
                  }
                }}
                onClick={() => {
                  if (item?.equipmentSlot) {
                    onAction?.({ kind: 'equip_item', itemId })
                  } else if (item?.usable) {
                    onAction?.({ kind: 'use_item', itemId })
                  }
                  setHovered(null)
                }}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    if (item?.equipmentSlot) {
                      onAction?.({ kind: 'equip_item', itemId })
                      setHovered(null)
                    } else if (item?.usable) {
                      onAction?.({ kind: 'use_item', itemId })
                    }
                  }
                }}
              >
                {art !== undefined ? (
                  <img src={art} alt="" className="proto-slot__icon" aria-hidden="true" />
                ) : (
                  <span className="proto-slot__glyph" aria-hidden="true">{name.charAt(0)}</span>
                )}
                <span className="proto-slot__qty">×{qty}</span>
              </div>
            )
          })}
        </div>

        {hovered !== null && (
          <div className="proto-item-popover-wrap">
            <div
              className="proto-item-popover-backdrop"
              data-testid="item-popover-backdrop"
              aria-hidden="true"
              onClick={() => setHovered(null)}
            />
            <div
              ref={popoverRef}
              className="proto-item-popover"
              role="dialog"
              aria-label={hovered.item ? (vi ? hovered.item.nameVi : hovered.item.nameEn) : hovered.id}
              data-testid="item-info-popover"
              style={{
                top: Math.max(12, Math.min(hovered.rect.top - 8, window.innerHeight - 240)),
                left: hovered.rect.right + 10 + 220 > window.innerWidth
                  ? Math.max(10, hovered.rect.left - 230)
                  : hovered.rect.right + 10,
              }}
              onMouseEnter={handlePopoverEnter}
              onMouseLeave={handlePopoverLeave}
            >
              <div className="proto-item-popover__overlay">
                <div className="proto-item-popover__header">
                  {itemArtFor(hovered.id) ? (
                    <img src={itemArtFor(hovered.id)} alt="" className="proto-item-popover__thumb" aria-hidden="true" />
                  ) : (
                    <div className="proto-item-popover__thumb proto-item-popover__thumb--glyph" aria-hidden="true">
                      {(hovered.item ? (vi ? hovered.item.nameVi : hovered.item.nameEn) : hovered.id).charAt(0)}
                    </div>
                  )}
                  <div className="proto-item-popover__title">
                    <span className="proto-item-popover__name">
                      {hovered.item ? (vi ? hovered.item.nameVi : hovered.item.nameEn) : hovered.id}
                    </span>
                    <span className="proto-item-popover__qty">
                      {vi ? `Số lượng: ×${hovered.qty}` : `Quantity: ×${hovered.qty}`}
                    </span>
                  </div>
                </div>
                <div className="proto-item-popover__desc">
                  {hovered.item ? (vi ? hovered.item.descVi : hovered.item.descEn) : (vi ? 'Vật phẩm tu chân' : 'Cultivation item')}
                </div>
                {hovered.item?.effects && (
                  <div className="proto-item-popover__effects">
                    {hovered.item.effects.hp && <span>+{hovered.item.effects.hp} HP </span>}
                    {hovered.item.effects.qi && <span>+{hovered.item.effects.qi} Qi </span>}
                  </div>
                )}
                {hovered.item?.usable && (
                  <button
                    type="button"
                    className="proto-item-popover__use-btn proto-item-popover__interactive"
                    data-testid="use-item-btn"
                    onClick={() => {
                      onAction?.({ kind: 'use_item', itemId: hovered.id })
                      if (hovered.qty <= 1) {
                        setHovered(null)
                      } else {
                        setHovered((prev) => prev ? { ...prev, qty: prev.qty - 1 } : null)
                      }
                    }}
                  >
                    {vi ? 'Sử dụng' : 'Use'}
                  </button>
                )}
              </div>
            </div>
          </div>
        )}
      </div>
    )
  }

  if (tab === 'market') {
    // Rail Chợ: the currency read-outs stay, but the stall lives in here too.
    // Rows and gates come from gameScreen/helpers.ts — the same numbers the
    // journal's market panel renders — so a rail button never offers an action
    // the reducer would refuse. Sealed wares are one quiet row, not 24 dead
    // buttons; the journal names each lock.
    const wares = marketRows(game)
    const open = wares.filter((ware) => !ware.stageLocked)
    const exchanges = currencyExchangeRows(game)
    const lock = marketLockReason(game, locale)
    return (
      <div className="proto-npc-list">
        {lock !== null && <RailLockNotice testId="rail-market-lock" text={lock} />}
        <div className="proto-npc"><div className="proto-npc__avatar" aria-hidden="true">市</div><div><div className="proto-npc__name">{vi ? 'Giá vàng' : 'Gold price'}</div><div className="proto-npc__meta">◎ {game.player.gold}</div></div><div className="proto-npc__heart">vàng</div></div>
        <div className="proto-npc"><div className="proto-npc__avatar" aria-hidden="true">◉</div><div><div className="proto-npc__name">{vi ? 'Giá bạc' : 'Silver price'}</div><div className="proto-npc__meta">◉ {game.player.silver}</div></div><div className="proto-npc__heart">bạc</div></div>
        <div className="proto-npc"><div className="proto-npc__avatar" aria-hidden="true">✦</div><div><div className="proto-npc__name">{vi ? 'Linh thạch' : 'Spirit stones'}</div><div className="proto-npc__meta">✦ {game.player.spiritStones}</div></div><div className="proto-npc__heart">LT</div></div>
        <div className="proto-market-exchange">
          {exchanges.map((row, index) => (
            <button className="proto-npc__action" disabled={!row.enabled} key={row.from} onClick={() => { onAction?.({ kind: 'convert_currency', from: row.from, qty: 1 }) }} type="button">
              {index === 0 ? (vi ? 'Đổi 1 linh thạch → 10 vàng' : 'Exchange 1 spirit stone → 10 gold') : (vi ? 'Đổi 10 bạc → 1 vàng' : 'Exchange 10 silver → 1 gold')}
            </button>
          ))}
        </div>
        {open.map((ware) => (
          <div className="proto-npc proto-market-row" key={ware.itemId}>
            <div className="proto-npc__avatar" aria-hidden="true">{itemName(ware.itemId, locale).charAt(0)}</div>
            <div>
              <div className="proto-npc__name">{itemName(ware.itemId, locale)}</div>
              <div className="proto-npc__meta">◎ {ware.price}</div>
            </div>
            <button
              aria-label={vi ? `Mua ${itemName(ware.itemId, locale)}` : `Buy ${itemName(ware.itemId, locale)}`}
              className="proto-npc__action"
              disabled={!ware.enabled}
              onClick={() => { onAction?.({ kind: 'buy', itemId: ware.itemId }) }}
              type="button"
            >
              {vi ? 'Mua' : 'Buy'}
            </button>
          </div>
        ))}
        {wares.length > open.length && (
          <div className="proto-npc">
            <div />
            <div>
              <div className="proto-npc__name">{vi ? `Hàng chưa mở ×${String(wares.length - open.length)}` : `Sealed wares ×${String(wares.length - open.length)}`}</div>
              <div className="proto-npc__meta">{vi ? 'Xem Nhật ký để biết cảnh giới cần' : 'Open the journal to read the realm each needs'}</div>
            </div>
            <div />
          </div>
        )}
      </div>
    )
  }

  if (tab === 'path') {
    const techniques = Object.entries(game.techniques).filter(([, lvl]) => lvl > 0)
    // Issue #38: rows showed the raw technique id ("basic_staff_form") as the
    // display name and an uppercased first letter in the avatar — through a
    // screen reader the two ran together ("TTh..."). Use the authored
    // TECHNIQUES name; keep the decorative glyph aria-hidden.
    const techName = (techId: string) => {
      const def = TECHNIQUES.find((t) => t.id === techId)
      return def === undefined ? techId : (vi ? def.nameVi : def.nameEn)
    }
    // Same two predicates as the journal's path panel (gameScreen/helpers.ts):
    // the rail offers Lĩnh ngộ for a manual actually in the bag, and Trang bị
    // for gear owned and within reach. Sealed rows stay in the journal.
    const learnable = techniqueRows(game).filter((row) => row.level === 0 && !row.locked)
    const gear = equipmentRows(game).filter((row) => !row.locked)
    const lock = pathLockReason(game, locale)
    const slotLabel = (slot: string): string =>
      (vi ? (slot === 'weapon' ? 'Vũ khí' : slot === 'robe' ? 'Y bào' : 'Phụ bối') : slot)
    return (
      <div className="proto-npc-list">
        {lock !== null && <RailLockNotice testId="rail-path-lock" text={lock} />}
        {techniques.length === 0 && learnable.length === 0 && gear.length === 0
          ? <div className="proto-npc"><div /><div><div className="proto-npc__name">—</div><div className="proto-npc__meta">{vi ? 'Chưa học công pháp' : 'No techniques learned'}</div></div><div /></div>
          : techniques.map(([id, lvl]) => (
            <div key={id} className="proto-npc">
              <div className="proto-npc__avatar" aria-hidden="true">{techName(id).charAt(0)}</div>
              <div>
                <div className="proto-npc__name">{techName(id)}</div>
                <div className="proto-npc__meta">{vi ? 'Cấp' : 'Level'} {lvl}</div>
              </div>
              <div className="proto-npc__heart">{vi ? 'Đã học' : 'Learned'}</div>
            </div>
          ))}
        {learnable.map(({ technique, learnable: canLearn }) => (
          <div key={technique.id} className="proto-npc">
            <div className="proto-npc__avatar" aria-hidden="true">{(vi ? technique.nameVi : technique.nameEn).charAt(0)}</div>
            <div>
              <div className="proto-npc__name">{vi ? technique.nameVi : technique.nameEn}</div>
              <div className="proto-npc__meta">{vi ? 'Đang giữ cơ duyên' : 'Source in hand'}</div>
            </div>
            <button className="proto-npc__action" disabled={!canLearn} onClick={() => { onAction?.({ kind: 'learn_technique', techniqueId: technique.id }) }} type="button">
              {vi ? 'Lĩnh ngộ' : 'Learn'}
            </button>
          </div>
        ))}
        {gear.map(({ equipment, equipped, enabled }) => (
          <div key={equipment.id} className="proto-npc">
            <div className="proto-npc__avatar" aria-hidden="true">{(vi ? equipment.nameVi : equipment.nameEn).charAt(0)}</div>
            <div>
              <div className="proto-npc__name">{vi ? equipment.nameVi : equipment.nameEn}</div>
              <div className="proto-npc__meta">{slotLabel(equipment.slot)}</div>
            </div>
            {equipped
              ? <div className="proto-npc__heart">{vi ? 'Đang dùng' : 'Equipped'}</div>
              : <button className="proto-npc__action" disabled={!enabled} onClick={() => { onAction?.({ kind: 'equip_item', itemId: equipment.itemId }) }} type="button">{vi ? 'Trang bị' : 'Equip'}</button>}
          </div>
        ))}
      </div>
    )
  }

  if (tab === 'quest') {
    const filteredActive = activeQuests.filter((q) => questFilter === 'all' || getQuestCategory(q.id) === questFilter)
    const filteredAvailable = availableQuests.filter((q) => questFilter === 'all' || getQuestCategory(q.id) === questFilter)
    const filteredCompleted = completedQuests.filter((q) => questFilter === 'all' || getQuestCategory(q.id) === questFilter)

    const activeMain = filteredActive.filter(q => getQuestCategory(q.id) === 'main')
    const activeSide = filteredActive.filter(q => getQuestCategory(q.id) === 'side')
    const activeSystem = filteredActive.filter(q => getQuestCategory(q.id) === 'system')
    const activeSecret = filteredActive.filter(q => getQuestCategory(q.id) === 'secret')

    const availableMain = filteredAvailable.filter(q => getQuestCategory(q.id) === 'main')
    const availableSide = filteredAvailable.filter(q => getQuestCategory(q.id) === 'side')
    const availableSystem = filteredAvailable.filter(q => getQuestCategory(q.id) === 'system')
    const availableSecret = filteredAvailable.filter(q => getQuestCategory(q.id) === 'secret')

    const activeGroups = [
      { cat: 'main' as const, titleVi: '🏯 Chính Tuyến', titleEn: '🏯 Main Quests', list: activeMain },
      { cat: 'side' as const, titleVi: '📜 Chi Tuyến', titleEn: '📜 Side Quests', list: activeSide },
      { cat: 'system' as const, titleVi: '⚙️ Nhiệm Vụ Hệ Thống', titleEn: '⚙️ System Quests', list: activeSystem },
      { cat: 'secret' as const, titleVi: '🔒 Kỳ Ngộ / Cơ Duyên Ẩn', titleEn: '🔒 Secret Quests', list: activeSecret },
    ].filter(g => g.list.length > 0)

    const availableGroups = [
      { cat: 'main' as const, titleVi: '🏯 Chính Tuyến Khả Dụng', titleEn: '🏯 Available Main Quests', list: availableMain },
      { cat: 'side' as const, titleVi: '📜 Chi Tuyến Khả Dụng', titleEn: '📜 Available Side Quests', list: availableSide },
      { cat: 'system' as const, titleVi: '⚙️ Nhiệm Vụ Hệ Thống', titleEn: '⚙️ Available System Quests', list: availableSystem },
      { cat: 'secret' as const, titleVi: '🔒 Kỳ Ngộ / Cơ Duyên Ẩn', titleEn: '🔒 Secret Quests', list: availableSecret },
    ].filter(g => g.list.length > 0)

    const renderActiveQuestCard = (q: typeof filteredActive[number]) => {
      const cat = getQuestCategory(q.id)
      const icon = cat === 'main' ? '🏯' : cat === 'side' ? '📜' : cat === 'system' ? '⚙️' : '🔒'
      const badgeText = cat === 'main' ? (vi ? 'Chính Tuyến' : 'Main') : cat === 'side' ? (vi ? 'Chi Tuyến' : 'Side') : cat === 'system' ? (vi ? 'Hệ Thống' : 'System') : (vi ? 'Kỳ Ngộ' : 'Secret')
      const stepIdx = currentStepIndex(game, q.id)
      const step = q.steps[stepIdx]
      const turnInReady = canCompleteQuest(game, q.id).ok
      const progressPct = q.steps.length > 0 ? ((stepIdx + 1) / q.steps.length) * 100 : 0
      return (
        <div key={q.id} className="proto-quest-tab-item proto-quest-tab__card proto-quest-tab__card--active">
          <div className="proto-quest-tab-item-header proto-quest-tab__name-row">
            <span className="proto-quest-tab-icon proto-quest-tab__category-icon">{icon}</span>
            <span className="proto-quest-tab-name proto-quest-tab__name">{localized(locale, q)}</span>
            <span className={`proto-quest-tab__badge proto-quest-tab__badge--${cat}`}>{badgeText}</span>
          </div>
          {step && <div className="proto-quest-tab-step proto-quest-tab__step"><strong>{vi ? step.descVi : step.descEn}</strong></div>}
          <div className="proto-quest-tab-progress-text proto-quest-tab__progress">
            <span>{vi ? 'Bước' : 'Step'} {stepIdx + 1}/{q.steps.length}</span>
            <div className="proto-quest-tab__progress-bar">
              <div className="proto-quest-tab__progress-fill" style={{ width: `${progressPct}%` }} />
            </div>
          </div>
          {turnInReady && (
            <button
              type="button"
              aria-label={vi ? `Nộp nhiệm vụ: ${localized(locale, q)}` : `Turn in quest: ${localized(locale, q)}`}
              className="proto-quest-tab-action-btn proto-quest-tab__action proto-quest-tab__action--turnin"
              onClick={() => onAction?.({ kind: q.requiredSystemId === undefined ? 'complete_quest' : 'system_turn_in_quest', questId: q.id })}
            >
              {vi ? 'Nộp nhiệm vụ' : 'Turn in'}
            </button>
          )}
        </div>
      )
    }

    const renderAvailableQuestCard = (q: typeof filteredAvailable[number]) => {
      const cat = getQuestCategory(q.id)
      const badgeText = cat === 'main' ? (vi ? 'Chính Tuyến' : 'Main') : cat === 'side' ? (vi ? 'Chi Tuyến' : 'Side') : cat === 'system' ? (vi ? 'Hệ Thống' : 'System') : (vi ? 'Kỳ Ngộ' : 'Secret')
      const check = q.acceptCheck
      const notAtLocation = !check.ok && check.code === 'NOT_AT_LOCATION'
      const reqLocId = !check.ok ? check.at : undefined
      const reqLocation = reqLocId ? getLocation(reqLocId) : undefined
      const reqLocationName = reqLocation ? localized(locale, reqLocation) : (reqLocId ?? '')
      const locBadge = notAtLocation ? (vi ? `Cần tới: ${reqLocationName}` : `Required location: ${reqLocationName}`) : null
      const giverNpc = q.giverNpcId ? getNpc(q.giverNpcId) : undefined
      const npcHint = check.ok && giverNpc ? (vi ? `Có thể nhận trực tiếp khi trò chuyện với ${giverNpc.nameVi}` : `Can accept directly by talking with ${giverNpc.nameEn}`) : null
      return (
        <div key={q.id} className="proto-quest-tab-item proto-quest-tab__card proto-quest-tab__card--available">
          <div className="proto-quest-tab__name-row">
            <span className="proto-quest-tab-name proto-quest-tab__name">{localized(locale, q)}</span>
            <span className={`proto-quest-tab__badge proto-quest-tab__badge--${cat}`}>{badgeText}</span>
          </div>
          <div className="proto-quest-tab-desc proto-quest-tab__desc">{vi ? q.descVi : q.descEn}</div>
          {npcHint && <div className="proto-quest-tab-npc-hint" style={{ fontSize: '11px', color: 'var(--accent, #6366f1)', opacity: 0.9, marginTop: '2px', marginBottom: '4px' }}>💬 {npcHint}</div>}
          {locBadge && <span className="proto-quest-tab-loc-badge proto-quest-tab__loc-badge">{locBadge}</span>}
          <button
            type="button"
            aria-label={vi ? `Nhận nhiệm vụ: ${localized(locale, q)}` : `Accept quest: ${localized(locale, q)}`}
            className="proto-quest-tab-action-btn proto-quest-tab__action"
            disabled={!check.ok}
            onClick={() => onAction?.({ kind: q.requiredSystemId === undefined ? 'accept_quest' : 'system_accept_quest', questId: q.id })}
          >
            {vi ? 'Nhận nhiệm vụ' : 'Accept quest'}
          </button>
        </div>
      )
    }

    return (
      <div className="proto-quest-tab-wrap proto-quest-tab" data-testid="leftrail-quest-panel">
        {/* A) Header: Current Objective */}
        <div className="proto-quest-tab-objective proto-quest-tab__objective">
          <div className="proto-quest-tab-objective-title proto-quest-tab__objective-title">{vi ? '🎯 Mục tiêu hiện tại' : '🎯 Current Objective'}</div>
          <div className="proto-quest-tab-objective-text proto-quest-tab__objective-text">{objective ?? (vi ? 'Tự do khám phá, tìm kiếm cơ duyên tu luyện.' : 'Freely explore and cultivate.')}</div>
        </div>

        {/* FTUE Onboarding / Primer Guide (Second Brain - SavaMeta & Jesse Schell) */}
        {showOnboarding ? (
          <div className="proto-quest-tab__onboarding" data-testid="quest-onboarding-guide">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <span className="proto-quest-tab__onboarding-title">
                {vi ? '📜 Chỉ Dẫn Nhập Môn Tu Tiên' : '📜 Cultivation Beginner Guide'}
              </span>
              <button
                type="button"
                onClick={() => setShowOnboarding(false)}
                aria-label={vi ? 'Thu gọn chỉ dẫn' : 'Dismiss guide'}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  fontSize: '11px',
                  color: 'var(--muted)',
                  padding: '2px 4px',
                }}
              >
                {vi ? '✕ Thu gọn' : '✕ Dismiss'}
              </button>
            </div>
            <div className="proto-quest-tab__onboarding-text" style={{ whiteSpace: 'pre-line' }}>
              {vi
                ? '1. 🗺️ Khám Phá: Di chuyển giữa các địa danh (Làng, Chợ, Rừng Sương Mù) để mở rộng tầm mắt.\n2. 💬 Trò Chuyện: Đối thoại trực tiếp với NPC tại địa phương để nhận và nộp Chi Tuyến.\n3. 🏯 Chính Tuyến: Luôn ưu tiên theo sát nhiệm vụ Chính để đột phá cảnh giới và mở khóa bản đồ mới.\n4. ⚙️ Hệ Thống: Ký thác khế ước và hoàn thành nhiệm vụ đặc thù để nhận ân sủng thiên đạo.'
                : '1. 🗺️ Explore: Travel between locations (Village, Market, Misty Forest) to expand horizons.\n2. 💬 Talk: Speak directly with local NPCs to accept and turn in Side Quests.\n3. 🏯 Main Quest: Follow Main Quests to break through realms and unlock new areas.\n4. ⚙️ System: Fulfill covenant quests to receive celestial blessings.'}
            </div>
            <div className="proto-quest-tab__onboarding-tip">
              💡 {activeQuests.length === 0
                ? (vi
                    ? 'Gợi ý: Hãy gặp Cụ Mai Hoa tại Làng Thanh Mộc để bắt đầu bước chân đầu tiên trên đạo đồ.'
                    : 'Hint: Speak with Elder Meihua at the Village to begin your cultivation journey.')
                : (vi
                    ? 'Gợi ý: Theo dõi tiến độ nhiệm vụ bên dưới và quay lại gặp người giao việc khi hoàn thành.'
                    : 'Hint: Track your progress below and return to the quest giver once conditions are met.')}
            </div>
          </div>
        ) : (
          <button
            type="button"
            className="proto-quest-tab__onboarding-toggle"
            onClick={() => setShowOnboarding(true)}
          >
            {vi ? '📜 Xem lại Chỉ Dẫn Nhập Môn' : '📜 View Beginner Guide'}
          </button>
        )}

        {/* B) Filter chips */}
        <div className="proto-quest-tab-filters proto-quest-tab__filters">
          {(['all', 'main', 'side', 'system', 'secret'] as const).map(f => (
            <button
              key={f}
              className={`proto-quest-tab-filter-btn proto-quest-tab__filter ${questFilter === f ? 'active proto-quest-tab__filter--active' : ''}`}
              onClick={() => setQuestFilter(f)}
              type="button"
            >
              {f === 'all' ? (vi ? 'Tất cả' : 'All') :
               f === 'main' ? (vi ? 'Chính tuyến' : 'Main') :
               f === 'side' ? (vi ? 'Chi tuyến' : 'Side') :
               f === 'system' ? (vi ? 'Hệ thống' : 'System') :
               (vi ? 'Kỳ ngộ' : 'Secret')}
            </button>
          ))}
        </div>

        {/* C) Active quests section */}
        {filteredActive.length > 0 && (
          <div className="proto-quest-tab-section proto-quest-tab__section">
            <div className="proto-quest-tab-section-title proto-quest-tab__section-header">
              <span>{vi ? 'Đang thực hiện' : 'Active'} ({filteredActive.length})</span>
            </div>
            {questFilter === 'all' ? (
              activeGroups.map(g => (
                <div key={g.cat} className="proto-quest-tab-category-group">
                  <div className="proto-quest-tab__category-title">
                    {vi ? g.titleVi : g.titleEn} ({g.list.length})
                  </div>
                  {g.list.map(renderActiveQuestCard)}
                </div>
              ))
            ) : (
              filteredActive.map(renderActiveQuestCard)
            )}
          </div>
        )}

        {/* D) Available quests section */}
        {filteredAvailable.length > 0 && (
          <div className="proto-quest-tab-section proto-quest-tab__section">
            <div className="proto-quest-tab-section-title proto-quest-tab__section-header">
              <span>{vi ? 'Khả dụng' : 'Available'} ({filteredAvailable.length})</span>
            </div>
            {questFilter === 'all' ? (
              availableGroups.map(g => (
                <div key={g.cat} className="proto-quest-tab-category-group">
                  <div className="proto-quest-tab__category-title">
                    {vi ? g.titleVi : g.titleEn} ({g.list.length})
                  </div>
                  {g.list.map(renderAvailableQuestCard)}
                </div>
              ))
            ) : (
              filteredAvailable.map(renderAvailableQuestCard)
            )}
          </div>
        )}

        {/* Empty state when current category filter has no quests */}
        {filteredActive.length === 0 && filteredAvailable.length === 0 && (
          <div className="proto-quest-tab__empty">
            {vi ? 'Không có nhiệm vụ nào trong danh mục này.' : 'No quests in this category.'}
          </div>
        )}

        {/* E) Completed quests section */}
        <div className="proto-quest-tab-section proto-quest-tab__section">
          <button
            type="button"
            aria-expanded={showCompleted}
            className="proto-quest-tab-collapse-btn proto-quest-tab__completed-toggle"
            onClick={() => setShowCompleted(!showCompleted)}
            style={{ width: '100%', textAlign: 'left' }}
          >
            <span>{showCompleted ? '▼' : '▶'} {vi ? 'Đã hoàn thành' : 'Completed'} ({filteredCompleted.length})</span>
          </button>
          {showCompleted && (
            <div className="proto-quest-tab-completed-list">
              {filteredCompleted.map(q => (
                <div key={q.id} className="proto-quest-tab-completed-item proto-quest-tab__card proto-quest-tab__card--completed">
                  <div className="proto-quest-tab__name-row">
                    <span className="proto-quest-tab-name proto-quest-tab__name">{localized(locale, q)}</span>
                    <span className="proto-quest-tab__badge proto-quest-tab__badge--side">{vi ? 'Đã xong' : 'Done'}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    )
  }

  // system tab — Hội thoại Hệ Thống + Mục tiêu + Nhiệm vụ
  const systemName = system !== null ? (vi ? system.nameVi : system.nameEn) : (vi ? 'Hệ Thống' : 'System')
  const systemHeader = system !== null ? (vi ? system.headerVi : system.headerEn) : (vi ? 'Khế Ước Chưa Ký' : 'Unsigned Covenant')

  return (
    <div className="proto-system-tab" data-testid="leftrail-system-panel">
      {/* 1. Header */}
      <div className="proto-system-header">
        <div className="proto-system-badge">契</div>
        <div className="proto-system-info">
          <div className="proto-system-name">{systemName}</div>
          <div className="proto-system-status">{systemHeader}</div>
        </div>
      </div>

      {/* 2. Conversation log */}
      <div className="proto-system-chat-log" role="log" aria-label={vi ? 'Nhật ký hội thoại Hệ Thống' : 'System dialogue log'}>
        {chatLog.map((msg, i) => (
          <div key={i} className={`proto-system-msg proto-system-msg--${msg.sender}`}>
            <span className="proto-system-msg__sender">{msg.sender === 'system' ? systemName : (vi ? 'Ngươi' : 'You')}</span>
            <p className="proto-system-msg__text">{msg.text}</p>
            {msg.questId && (
              <button
                type="button"
                className="proto-system-msg__quest-btn"
                onClick={() => onAction?.({ kind: 'system_accept_quest', questId: msg.questId! })}
              >
                {vi ? 'Nhận nhiệm vụ' : 'Accept quest'}
              </button>
            )}
          </div>
        ))}
        {isReplying && (
          <div className="proto-system-msg proto-system-msg--system">
            <span className="proto-system-msg__sender">{systemName}</span>
            <p className="proto-system-msg__text"><em>{vi ? 'Hệ Thống đang suy tính…' : 'System calculating…'}</em></p>
          </div>
        )}
      </div>

      {/* 3. Input bar */}
      <form className="proto-system-input-form" onSubmit={handleSendSystemMessage}>
        <input
          type="text"
          value={inputMessage}
          onChange={(e) => setInputMessage(e.target.value)}
          placeholder={vi ? 'Hỏi Hệ Thống...' : 'Ask the System...'}
          disabled={isReplying || game.terminal}
          aria-label={vi ? 'Nhập tin nhắn cho Hệ Thống' : 'Message to System'}
        />
        <button type="submit" disabled={isReplying || game.terminal || !inputMessage.trim()}>
          {vi ? 'Hỏi' : 'Ask'}
        </button>
      </form>
    </div>
  )
}

export const LEFT_TAB_LABELS: Record<LeftTab, { glyph: string; label: string; badge?: number }> = {
  people: { glyph: '人', label: 'Nhân sĩ' },
  vital: { glyph: '氣', label: 'Khí huyết' },
  items: { glyph: '囊', label: 'Hành trang', badge: 0 },
  market: { glyph: '市', label: 'Chợ' },
  path: { glyph: '道', label: 'Đạo đồ' },
  quest: { glyph: '📜', label: 'Nhiệm vụ' },
  system: { glyph: '契', label: 'Hệ thống' },
}
