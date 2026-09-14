import { useMemo, useRef, useState, type FormEvent } from 'react'
import type { Action, GameState, Locale } from '../engine'
import {
  activeSystem,
  canCompleteQuest,
  currentStepIndex,
  getAffection,
  isQuestUnlocked,
  queueDrain,
  TECHNIQUES,
} from '../engine'
import { getItem, getLocation, NPCS, QUESTS } from '../content'
import { itemArtFor } from './rpgArt'
import { deriveObjective } from './objective'
import { requestSystemReply } from '../ai/system'
import { localized, systemNotificationText } from './gameScreen/helpers'
import './left-rail.css'

/* =========================================================================
 *  LeftRail tab content — 6 tabs render thật từ engine data
 *  Wire với prototype: people, vital, items, market, path, system
 * ========================================================================= */

export type LeftTab = 'people' | 'vital' | 'items' | 'market' | 'path' | 'system'

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

  // System chat state
  const system = activeSystem(game)
  const [userMessages, setUserMessages] = useState<SystemChatMessage[]>([])
  const [inputMessage, setInputMessage] = useState('')
  const [isReplying, setIsReplying] = useState(false)

  // System derived quests & objective
  const objective = useMemo(() => deriveObjective(game, locale), [game, locale])
  const activeQuests = useMemo(() => QUESTS.filter((q) => game.quests[q.id]?.status === 'active'), [game.quests])
  const availableQuests = useMemo(
    () => QUESTS.filter((q) => (game.quests[q.id]?.status ?? 'available') === 'available' && isQuestUnlocked(game, q.id)),
    [game],
  )

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

  const handleSendSystemMessage = (e: FormEvent) => {
    e.preventDefault()
    const msg = inputMessage.trim()
    if (!msg || isReplying || game.terminal) return
    setInputMessage('')
    setUserMessages((prev) => [...prev, { sender: 'player', text: msg }])
    setIsReplying(true)
    void requestSystemReply(game, msg, locale).then((reply) => {
      setIsReplying(false)
      if (reply !== null) {
        setUserMessages((prev) => [
          ...prev,
          {
            sender: 'system',
            text: vi ? reply.textVi : reply.textEn,
            questId: reply.questId,
          },
        ])
      } else {
        const fallback = system
          ? (vi ? `【${system.nameVi}】: ${system.personalityVi}` : `[${system.nameEn}]: ${system.personalityEn}`)
          : (vi ? 'Hệ Thống im lặng.' : 'The System is silent.')
        setUserMessages((prev) => [...prev, { sender: 'system', text: fallback }])
      }
    })
  }

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
              return <div key={i} className="proto-slot" role="gridcell" aria-label={vi ? 'Ô trống' : 'Empty slot'} />
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
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && item?.usable) {
                    onAction?.({ kind: 'use_item', itemId })
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
          <div
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
                className="proto-item-popover__use-btn"
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
        )}
      </div>
    )
  }

  if (tab === 'market') {
    return (
      <div className="proto-npc-list">
        <div className="proto-npc"><div className="proto-npc__avatar">市</div><div><div className="proto-npc__name">{vi ? 'Giá vàng' : 'Gold price'}</div><div className="proto-npc__meta">◎ {game.player.gold}</div></div><div className="proto-npc__heart">vàng</div></div>
        <div className="proto-npc"><div className="proto-npc__avatar">◉</div><div><div className="proto-npc__name">{vi ? 'Giá bạc' : 'Silver price'}</div><div className="proto-npc__meta">◉ {game.player.silver}</div></div><div className="proto-npc__heart">bạc</div></div>
        <div className="proto-npc"><div className="proto-npc__avatar">✦</div><div><div className="proto-npc__name">{vi ? 'Linh thạch' : 'Spirit stones'}</div><div className="proto-npc__meta">✦ {game.player.spiritStones}</div></div><div className="proto-npc__heart">LT</div></div>
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
    return (
      <div className="proto-npc-list">
        {techniques.length === 0
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

      {/* 4. Current Objective */}
      <div className="proto-system-section-card">
        <div className="proto-system-section-title">
          <span>{vi ? '🎯 Mục tiêu hiện tại' : '🎯 Current Objective'}</span>
        </div>
        <div className="proto-system-objective-text">
          {objective ?? (vi ? 'Tự do khám phá, tìm kiếm cơ duyên tu luyện.' : 'Freely explore and cultivate.')}
        </div>
      </div>

      {/* 5. Quests */}
      <div className="proto-system-section-card">
        <div className="proto-system-section-title">
          <span>{vi ? '📜 Nhiệm vụ' : '📜 Quests'}</span>
          <span>{activeQuests.length > 0 ? `${activeQuests.length} ${vi ? 'đang nhận' : 'active'}` : (availableQuests.length > 0 ? `${availableQuests.length} ${vi ? 'khả dụng' : 'available'}` : '')}</span>
        </div>
        <div className="proto-system-quest-list">
          {activeQuests.length > 0 ? (
            activeQuests.map((q) => {
              const stepIdx = currentStepIndex(game, q.id)
              const step = q.steps[stepIdx]
              const turnInReady = canCompleteQuest(game, q.id).ok
              return (
                <div key={q.id} className="proto-system-quest-item">
                  <div className="proto-system-quest-name">{localized(locale, q)}</div>
                  {step && <div className="proto-system-quest-step">{vi ? step.descVi : step.descEn}</div>}
                  {turnInReady && (
                    <button
                      type="button"
                      className="proto-system-quest-btn"
                      onClick={() => onAction?.({ kind: q.requiredSystemId === undefined ? 'complete_quest' : 'system_turn_in_quest', questId: q.id })}
                    >
                      {vi ? 'Nộp nhiệm vụ' : 'Turn in'}
                    </button>
                  )}
                </div>
              )
            })
          ) : availableQuests.length > 0 ? (
            availableQuests.slice(0, 3).map((q) => (
              <div key={q.id} className="proto-system-quest-item">
                <div className="proto-system-quest-name">{localized(locale, q)}</div>
                <div className="proto-system-quest-step">{vi ? q.descVi : q.descEn}</div>
                <button
                  type="button"
                  className="proto-system-quest-btn"
                  onClick={() => onAction?.({ kind: q.requiredSystemId === undefined ? 'accept_quest' : 'system_accept_quest', questId: q.id })}
                >
                  {vi ? 'Nhận nhiệm vụ' : 'Accept quest'}
                </button>
              </div>
            ))
          ) : (
            <div className="proto-system-empty">{vi ? 'Chưa có nhiệm vụ khả dụng.' : 'No quests available.'}</div>
          )}
        </div>
      </div>
    </div>
  )
}

export const LEFT_TAB_LABELS: Record<LeftTab, { glyph: string; label: string; badge?: number }> = {
  people: { glyph: '人', label: 'Nhân sĩ' },
  vital: { glyph: '氣', label: 'Khí huyết' },
  items: { glyph: '囊', label: 'Hành trang', badge: 0 },
  market: { glyph: '市', label: 'Chợ' },
  path: { glyph: '道', label: 'Đạo đồ' },
  system: { glyph: '契', label: 'Hệ thống' },
}
