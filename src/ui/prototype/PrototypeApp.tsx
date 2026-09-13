import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import './prototype.css'

/* =========================================================================
 *  Phế Căn Ký — UI Prototype
 *  Single-file React/TS port of the hand-authored HTML prototype.
 *  Preserves DOM structure, class names (prefixed proto-), and the
 *  state-driven layout engine (LeftRail / RightHUD / Ticker / Zen).
 * ========================================================================= */

type Scene = 'boot' | 'main'
type LeftMode = 'expanded' | 'icon' | 'hidden'
type RightMode = 'expanded' | 'mini' | 'hidden'
type TickerMode = 'full' | '1' | 'hidden'
type Modal = 'save' | 'wiz' | 'set' | 'story' | 'break' | null
type Tab = 'people' | 'vital' | 'items' | 'market' | 'path' | 'system'
type Diff = 'cozy' | 'balanced' | 'hardcore'
type Cov = 'combat' | 'gather' | 'alchemy' | 'fortune' | 'vengeance' | 'none'

interface State {
  scene: Scene
  leftMode: LeftMode
  rightMode: RightMode
  tickerMode: TickerMode
  topbarPinned: boolean
  zen: boolean
  zenPrev: { left: LeftMode; right: RightMode; tick: TickerMode; pin: boolean } | null
  wizStep: 1 | 2 | 3
  diff: Diff
  cov: Cov
  hp: number
  qi: number
  cultivation: number
  enemyHp: number
  leftTab: Tab
  modal: Modal
  combatShow: boolean
  loading: boolean
  loadingFade: boolean
  endingShow: boolean
  tickerMsg: string
  pts: { than: number; tam: number; mach: number; van: number }
  locale: 'vi' | 'en'
}

const LR_TABS: Record<Tab, { title: string; render: () => ReactNode }> = {
  people: {
    title: 'Nhân sĩ',
    render: () => (
      <div className="proto-npc-list">
        {[
          { av: '老', name: 'Lão Bạch', meta: 'Thương nhân · Làng Thanh Mộc', heart: '♥ 62' },
          { av: '陳', name: 'Trần Bất Danh', meta: 'Tu sĩ lang thang', heart: '♥ 35' },
          { av: '沈', name: 'Thẩm Y Niên', meta: 'Chủ quán trà', heart: '♥ 48' },
          { av: '白', name: 'Bạch Lạc Vi', meta: 'Luyện đan sư', heart: '♥ 71' },
        ].map((n) => (
          <div key={n.name} className="proto-npc">
            <div className="proto-npc__avatar">{n.av}</div>
            <div>
              <div className="proto-npc__name">{n.name}</div>
              <div className="proto-npc__meta">{n.meta}</div>
            </div>
            <div className="proto-npc__heart">{n.heart}</div>
          </div>
        ))}
      </div>
    ),
  },
  vital: {
    title: 'Khí huyết',
    render: () => (
      <div className="proto-vital-grid">
        <div className="proto-vital"><div className="proto-vital__k">Cảnh giới</div><div className="proto-vital__v">LK · 2</div></div>
        <div className="proto-vital"><div className="proto-vital__k">Ngũ hành</div><div className="proto-vital__v">Mộc · Thổ</div></div>
        <div className="proto-vital"><div className="proto-vital__k">Linh căn</div><div className="proto-vital__v">Phế · Hỗn Độn</div></div>
        <div className="proto-vital"><div className="proto-vital__k">Đột phá</div><div className="proto-vital__v">78/120</div></div>
      </div>
    ),
  },
  items: {
    title: 'Hành trang',
    render: () => {
      const filled: Record<number, [string, number]> = { 0: ['Tụ Khí Đan', 3], 1: ['Thanh Liên', 2], 2: ['Bí Cảnh Lệnh', 1] }
      return (
        <div className="proto-item-grid">
          {Array.from({ length: 50 }, (_, i) => {
            const f = filled[i]
            return (
              <div key={i} className={`proto-slot${f ? ' proto-slot--filled' : ''}${i === 2 ? ' proto-pulse' : ''}`} title={f?.[0]}>
                {f?.[0]}
                {f && <span className="proto-slot__qty">×{f[1]}</span>}
              </div>
            )
          })}
        </div>
      )
    },
  },
  market: {
    title: 'Chợ',
    render: () => (
      <div className="proto-npc-list">
        {[
          { av: '老', name: 'Lão Bạch', meta: 'Bán linh thảo · Tụ Khí Đan', heart: '8 Bạc' },
          { av: '白', name: 'Bạch Lạc Vi', meta: 'Đan phương · Pháp khí', heart: '3 Vàng' },
          { av: '遊', name: 'Du Hiệp Tử', meta: 'Tin tức · Bản đồ', heart: '2 Bạc' },
        ].map((n) => (
          <div key={n.name} className="proto-npc">
            <div className="proto-npc__avatar">{n.av}</div>
            <div>
              <div className="proto-npc__name">{n.name}</div>
              <div className="proto-npc__meta">{n.meta}</div>
            </div>
            <div className="proto-npc__heart">{n.heart}</div>
          </div>
        ))}
      </div>
    ),
  },
  path: {
    title: 'Đạo đồ',
    render: () => (
      <div className="proto-npc-list">
        {[
          { av: '劍', name: 'Kiếm Khí Tiểu Thành', meta: 'Công pháp · Tầng 3', heart: 'Đã học' },
          { av: '吐', name: 'Thổ Nạp Pháp', meta: 'Tu luyện · Tầng 2', heart: 'Đã học' },
          { av: '丹', name: 'Luyện Đan Sơ Cấp', meta: 'Đan đạo · Tầng 1', heart: 'Chưa mở' },
        ].map((n) => (
          <div key={n.name} className="proto-npc">
            <div className="proto-npc__avatar">{n.av}</div>
            <div>
              <div className="proto-npc__name">{n.name}</div>
              <div className="proto-npc__meta">{n.meta}</div>
            </div>
            <div className="proto-npc__heart">{n.heart}</div>
          </div>
        ))}
      </div>
    ),
  },
  system: {
    title: 'Hệ thống',
    render: () => (
      <div className="proto-npc-list">
        {[
          { av: '契', name: 'Khế ước', meta: 'Hệ Thống Chiến Đấu · Ban kiếm khí', heart: 'Đã ký' },
          { av: '任', name: 'Nhiệm vụ', meta: 'Tìm đường tới Bí Cảnh · 0/3', heart: 'Đang làm' },
          { av: '貢', name: 'Cống hiến', meta: 'Điểm đổi thưởng', heart: '42' },
        ].map((n) => (
          <div key={n.name} className="proto-npc">
            <div className="proto-npc__avatar">{n.av}</div>
            <div>
              <div className="proto-npc__name">{n.name}</div>
              <div className="proto-npc__meta">{n.meta}</div>
            </div>
            <div className="proto-npc__heart">{n.heart}</div>
          </div>
        ))}
      </div>
    ),
  },
}

const DIFF_LABEL: Record<Diff, string> = { cozy: 'Phàm Nhân · Cozy', balanced: 'Cân Bằng · Balanced', hardcore: 'Nghịch Thiên · Hardcore' }
const COV_LABEL: Record<Cov, string> = {
  combat: 'Hệ Thống Chiến Đấu', gather: 'Hệ Thống Thu Thập', alchemy: 'Hệ Thống Đan Đạo',
  fortune: 'Hệ Thống Cơ Duyên', vengeance: 'Hệ Thống Báo Thù', none: 'Từ Chối Hệ Thống',
}

const LOAD_QUOTES = [
  'Vạn vật giai hữu linh, phế căn tự hữu kỳ ngộ…',
  'Kiếp trước gieo nhân, kiếp này gặt quả…',
  'Sương sớm tản, hành tẩu khởi đầu…',
]
const CHIP_MSG: Record<string, string> = {
  rest: 'Đang nghỉ ngơi tại trọ — hồi 8 điểm khí huyết.',
  cultivate: 'Bắt đầu tu luyện — linh khí tăng 12 điểm.',
  gather: 'Hái thảo trên sườn đồi — nhận 1 cây Thanh Liên.',
  move: 'Di chuyển tới làng Thanh Mộc — khoảng cách 3 dặm.',
  gacha: 'Quay số cơ duyên — nhận 1 bình Tụ Khí Đan.',
}

function clamp(v: number, min: number, max: number) { return Math.max(min, Math.min(max, v)) }

export function PrototypeApp() {
  const [s, setS] = useState<State>({
    scene: 'boot', leftMode: 'icon', rightMode: 'expanded', tickerMode: '1', topbarPinned: true,
    zen: false, zenPrev: null, wizStep: 1, diff: 'balanced', cov: 'combat',
    hp: 84, qi: 60, cultivation: 42, enemyHp: 72, leftTab: 'people',
    modal: null, combatShow: false, loading: false, loadingFade: false, endingShow: false,
    tickerMsg: 'Người tỉnh dậy tại làng Thanh Mộc — đêm thứ 4, sương sớm chưa tan…',
    pts: { than: 0, tam: 0, mach: 0, van: 0 }, locale: 'vi',
  })
  const stateRef = useRef(s)
  stateRef.current = s

  // === Layout engine ===
  const lw = s.leftMode === 'expanded' ? 280 : s.leftMode === 'icon' ? 56 : 0
  const rw = s.rightMode === 'expanded' ? 280 : s.rightMode === 'mini' ? 160 : 0
  const th = s.tickerMode === 'full' ? 120 : s.tickerMode === '1' ? 32 : 0
  const gridStyle: CSSProperties = {
    ['--left-w' as string]: `${lw}px`, ['--right-w' as string]: `${rw}px`, ['--ticker-h' as string]: `${th}px`,
  }
  const barHidden = !s.topbarPinned || s.zen

  // === Modal open/close ===
  const openModal = (m: Exclude<Modal, null>) => setS((p) => ({ ...p, modal: m }))
  const closeModal = () => setS((p) => ({ ...p, modal: null }))

  // === Scene transitions ===
  const goBoot = () => setS((p) => ({ ...p, scene: 'boot' }))
  const showLoading = () => {
    const quote = LOAD_QUOTES[Math.floor(Math.random() * LOAD_QUOTES.length)] ?? LOAD_QUOTES[0]!
    setS((p) => ({ ...p, loading: true, loadingFade: false, tickerMsg: quote }))
    window.setTimeout(() => {
      setS((p) => ({ ...p, loadingFade: true }))
      window.setTimeout(() => setS((p) => ({ ...p, loading: false, loadingFade: false })), 500)
    }, 1100)
  }
  const goMain = () => {
    setS((p) => ({ ...p, scene: 'main' }))
    showLoading()
  }

  // === HP simulation + smart auto-open ===
  const setHp = (v: number) => setS((prev) => {
    const hp = clamp(v, 0, 100)
    const shouldOpen = hp < 30 && prev.rightMode !== 'expanded' && !prev.zen
    return { ...prev, hp, rightMode: shouldOpen ? 'expanded' : prev.rightMode }
  })

  // === LeftRail tab ===
  const setLeftTab = (tab: Tab) => setS((p) => ({ ...p, leftTab: tab }))

  // === Ticker log ===
  const pushLog = (msg: string) => setS((p) => ({ ...p, tickerMsg: msg }))

  // === Breakthrough pts ===
  const setPt = (k: keyof State['pts'], d: number) => setS((p) => {
    const used = p.pts.than + p.pts.tam + p.pts.mach + p.pts.van
    if (d > 0 && used >= 5) return p
    if (d < 0 && p.pts[k] <= 0) return p
    return { ...p, pts: { ...p.pts, [k]: p.pts[k] + d } }
  })
  const ptsUsed = s.pts.than + s.pts.tam + s.pts.mach + s.pts.van

  // === Zen toggle ===
  const toggleZen = () => setS((p) => {
    if (!p.zen) {
      return { ...p, zen: true, zenPrev: { left: p.leftMode, right: p.rightMode, tick: p.tickerMode, pin: p.topbarPinned },
        leftMode: 'hidden', rightMode: 'hidden', tickerMode: 'hidden', topbarPinned: false }
    }
    const prev = p.zenPrev ?? { left: 'icon' as LeftMode, right: 'expanded' as RightMode, tick: '1' as TickerMode, pin: true }
    return { ...p, zen: false, zenPrev: null, leftMode: prev.left, rightMode: prev.right, tickerMode: prev.tick, topbarPinned: prev.pin }
  })

  // === Auto-hide topbar on mousemove ===
  const hideTimer = useRef<number | null>(null)
  useEffect(() => {
    if (s.topbarPinned || s.zen || s.scene !== 'main') return
    const onMove = (e: MouseEvent) => {
      if (e.clientY < 12) {
        if (hideTimer.current !== null) window.clearTimeout(hideTimer.current)
        setS((p) => p.topbarPinned || p.zen ? p : { ...p, topbarPinned: false })
      } else {
        if (hideTimer.current !== null) window.clearTimeout(hideTimer.current)
        hideTimer.current = window.setTimeout(() => {
          setS((p) => p.topbarPinned || p.zen ? p : p)
        }, 600)
      }
    }
    window.addEventListener('mousemove', onMove)
    return () => { window.removeEventListener('mousemove', onMove); if (hideTimer.current !== null) window.clearTimeout(hideTimer.current) }
  }, [s.topbarPinned, s.zen, s.scene])

  // === Hotkeys ===
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const t = e.target as HTMLElement | null
      const typing = t !== null && (t.tagName === 'INPUT' || t.tagName === 'TEXTAREA')
      if (typing) { if (e.key === 'Escape') t.blur(); return }
      const cur = stateRef.current
      if (cur.scene === 'boot') {
        if (e.key === 'Escape') closeModal()
        return
      }
      if (e.key === 'Escape') {
        if (cur.modal !== null) { closeModal(); return }
        if (cur.combatShow) { setS((p) => ({ ...p, combatShow: false })); return }
        if (cur.leftMode === 'expanded') { setS((p) => ({ ...p, leftMode: 'icon' })); return }
        if (cur.zen) toggleZen()
        return
      }
      const k = e.key.toLowerCase()
      if (k === 'z') { e.preventDefault(); toggleZen(); return }
      if (k === 't') { setS((p) => ({ ...p, topbarPinned: !p.topbarPinned })); return }
      if (e.key === 'Tab') {
        e.preventDefault()
        setS((p) => ({ ...p, leftMode: p.leftMode === 'hidden' ? 'icon' : p.leftMode === 'icon' ? 'expanded' : 'hidden' }))
        return
      }
      if (k === 'b') { setS((p) => ({ ...p, leftTab: 'items', leftMode: 'expanded' })); return }
      if (k === 'p') { setS((p) => ({ ...p, leftTab: 'people', leftMode: 'expanded' })); return }
      if (k === 'm') { setS((p) => ({ ...p, leftTab: 'market', leftMode: 'expanded' })); return }
      if (k === 'c') { setS((p) => ({ ...p, rightMode: p.rightMode === 'expanded' ? 'mini' : 'expanded' })); return }
      if (k === 'l') {
        setS((p) => ({ ...p, tickerMode: p.tickerMode === 'full' ? '1' : 'full' }))
        return
      }
      if (['1', '2', '3'].includes(k) && cur.modal === 'story') {
        const choice = Number(k) - 1
        pushLog(`Lựa chọn ${choice + 1} đã được ghi vào Biên Niên Ký.`)
        closeModal()
      }
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [])

  // ============================ RENDER ============================
  return (
    <div className="proto-root">
      <div className="proto-stage">
        {/* SCENE 1: BOOT */}
        <section className={`proto-scene-boot${s.scene === 'boot' ? '' : ' hidden'}`} aria-label="Sảnh Khởi Đạo">
          <BootMenu
            onAction={(a) => {
              if (a === 'saves') openModal('save')
              else if (a === 'settings') openModal('set')
              else if (a === 'new') { setS((p) => ({ ...p, wizStep: 1, modal: 'wiz' })); }
              else if (a === 'resume') goMain()
            }}
            locale={s.locale}
            onLocale={(l) => setS((p) => ({ ...p, locale: l }))}
          />
        </section>

        {/* SCENE 2: MAIN */}
        <section className={`proto-scene-main${s.scene === 'main' ? ' active' : ''}`} aria-label="Đại Thiên Thế Giới">
          <div className="proto-topbar-sentinel" />
          <header className={`proto-topbar${barHidden ? ' hidden-bar' : ''}`}>
            <span className="proto-topbar__brand">Phế Căn Ký</span>
            <span className="proto-topbar__sep">·</span>
            <span className="proto-topbar__stat">Ngày <span className="v">04</span></span>
            <span className="proto-topbar__sep">·</span>
            <span className="proto-topbar__stat">Chương <span className="v">II — Hành Tẩu</span></span>
            <span className="proto-topbar__sep">·</span>
            <span className="proto-topbar__stat">Làng Thanh Mộc</span>
            <span className="proto-topbar__spacer" />
            <span className="proto-topbar__stat">Vàng <span className="v">128</span></span>
            <span className="proto-topbar__sep">·</span>
            <span className="proto-topbar__stat">Bạc <span className="v">412</span></span>
            <span className="proto-topbar__sep">·</span>
            <span className="proto-topbar__stat">Linh Thạch <span className="v">7</span></span>
            <button className="iconbtn" type="button" onClick={() => setS((p) => ({ ...p, locale: p.locale === 'vi' ? 'en' : 'vi' }))} title="Đổi ngôn ngữ">
              {s.locale === 'vi' ? 'VI' : 'EN'}
            </button>
            <button className="iconbtn" type="button" onClick={() => openModal('set')} title="Thiết lập">⚙</button>
            <button className="iconbtn pin" type="button" onClick={() => setS((p) => ({ ...p, topbarPinned: !p.topbarPinned }))} title="Ghim / Thả TopBar (T)">📌</button>
          </header>

          <main className={`proto-grid-main${barHidden ? ' topbar-hidden' : ''}${s.zen ? ' zen' : ''}`} style={gridStyle}>
            <LeftRail
              tab={s.leftTab} mode={s.leftMode} tabs={Object.keys(LR_TABS) as Tab[]}
              onTab={(t) => { setLeftTab(t); if (s.leftMode === 'icon') setS((p) => ({ ...p, leftMode: 'expanded' })) }}
              onCollapse={() => setS((p) => ({ ...p, leftMode: p.leftMode === 'expanded' ? 'icon' : 'expanded' }))}
              onHide={() => setS((p) => ({ ...p, leftMode: 'hidden' }))}
              onReopen={() => setS((p) => ({ ...p, leftMode: 'icon' }))}
            />
            <Center
              combatShow={s.combatShow} enemyHp={s.enemyHp}
              onCombat={(a) => {
                if (a === 'flee') { setS((p) => ({ ...p, combatShow: false })); pushLog('Rút lui thành công — giữ được tính mạng.'); return }
                const current = stateRef.current.enemyHp
                let nextHp = current
                if (a === 'attack') nextHp = Math.max(0, current - 12)
                else if (a === 'skill') nextHp = Math.max(0, current - 25)
                else if (a === 'defend') pushLog('Thủ thế — giảm 50% sát thương đòn tới.')
                if (nextHp === 0) {
                  setS((p) => ({ ...p, enemyHp: 0 }))
                  window.setTimeout(() => {
                    setS((p) => ({ ...p, combatShow: false, enemyHp: 72 }))
                    pushLog('Hắc Miêu Yêu bị trảm! Nhận 20 tu vi, 1 Linh Thạch.')
                  }, 350)
                } else {
                  setS((p) => ({ ...p, enemyHp: nextHp }))
                  setHp(stateRef.current.hp - 6)
                }
              }}
              onChip={(c) => {
                pushLog(CHIP_MSG[c] ?? '')
                if (c === 'rest') setHp(stateRef.current.hp + 8)
                if (c === 'cultivate') {
                  const next = Math.min(100, stateRef.current.cultivation + 10)
                  setS((p) => ({ ...p, cultivation: next }))
                  if (next >= 100) openModal('break')
                }
              }}
              onTry={(v) => {
                if (!v.trim()) { pushLog('Không có mệnh lệnh nào được nhập.'); return }
                pushLog(`Mệnh lệnh "${v.trim().slice(0, 48)}" đã được Hệ Thống tiếp nhận.`)
                if (/đánh|chiến|yêu|combat/i.test(v)) setS((p) => ({ ...p, combatShow: true }))
                if (/đột phá|breakthrough/i.test(v)) openModal('break')
              }}
              onPinClick={(cls) => {
                if (cls === 'event') openModal('story')
                else if (cls === 'npc') { setLeftTab('people'); setS((p) => ({ ...p, leftMode: 'expanded' })) }
              }}
              zenShow={s.zen}
            />
            <RightHud
              hp={s.hp} qi={s.qi} cultivation={s.cultivation} mode={s.rightMode}
              onCollapse={() => setS((p) => ({ ...p, rightMode: p.rightMode === 'expanded' ? 'mini' : 'expanded' }))}
              onHide={() => setS((p) => ({ ...p, rightMode: 'hidden' }))}
              onMini={() => setS((p) => ({ ...p, rightMode: 'expanded' }))}
            />
            <Ticker
              mode={s.tickerMode} msg={s.tickerMsg}
              onToggle={() => setS((p) => ({ ...p, tickerMode: p.tickerMode === 'full' ? '1' : 'full' }))}
            />
          </main>

          <div className="proto-hotkey-legend" aria-label="Phím tắt toàn cục">
            <span><kbd>Z</kbd>Zen</span>
            <span><kbd>T</kbd>TopBar</span>
            <span><kbd>Tab</kbd>Rail</span>
            <span><kbd>B</kbd>Items</span>
            <span><kbd>P</kbd>People</span>
            <span><kbd>M</kbd>Market</span>
            <span><kbd>C</kbd>Char</span>
            <span><kbd>L</kbd>Log</span>
            <span><kbd>Esc</kbd>Đóng</span>
          </div>
        </section>

        {/* MODALS */}
        <SaveModal show={s.modal === 'save'} onClose={closeModal} onLoad={() => { closeModal(); goMain() }} />
        <WizardModal
          show={s.modal === 'wiz'} step={s.wizStep} diff={s.diff} cov={s.cov}
          onStep={(w) => setS((p) => ({ ...p, wizStep: w }))}
          onDiff={(d) => setS((p) => ({ ...p, diff: d }))}
          onCov={(c) => setS((p) => ({ ...p, cov: c }))}
          onBack={() => setS((p) => p.wizStep > 1 ? { ...p, wizStep: (p.wizStep - 1) as 1 | 2 | 3 } : p)}
          onNext={() => setS((p) => p.wizStep < 3 ? { ...p, wizStep: (p.wizStep + 1) as 1 | 2 | 3 } : (() => { closeModal(); goMain(); return p })())}
          onClose={closeModal}
        />
        <SettingsModal show={s.modal === 'set'} onClose={closeModal} />
        <StoryModal show={s.modal === 'story'} onClose={closeModal} onPick={(c) => { pushLog(`Lựa chọn ${c} đã được ghi vào Biên Niên Ký.`); closeModal() }} />
        <BreakthroughModal
          show={s.modal === 'break'} pts={s.pts} used={ptsUsed}
          onAdj={setPt}
          onConfirm={() => { closeModal(); pushLog('Đột phá thành công — Luyện Khí Tầng 3! Hào quang xung thể.'); setS((p) => ({ ...p, cultivation: 0 })) }}
          onClose={closeModal}
        />

        {/* LOADING */}
        <div className={`proto-loading${s.loading ? ' show' : ''}${s.loadingFade ? ' fade' : ''}`} role="status" aria-live="polite">
          <div className="proto-reincarn" aria-hidden="true" />
          <div className="proto-loading__quote">{s.tickerMsg}</div>
          <div className="proto-loading__status">ĐANG NẠP THIÊN MỆNH…</div>
        </div>

        {/* ENDING */}
        <div className={`proto-ending${s.endingShow ? ' show' : ''}`} role="dialog" aria-label="Thiên Đạo Kết Cục">
          <div className="proto-ending__title">THIÊN ĐẠO KẾT CỤC · LUÂN HỒI</div>
          <div className="proto-ending__verse">
            "Một kiếp phế căn, một đời không phụ.<br />
            Trời đất quay về, sương sớm lại tan."
          </div>
          <div className="proto-ending__stats">
            <div className="s"><div className="v">12</div><div className="k">NGÀY SỐNG</div></div>
            <div className="s"><div className="v">5</div><div className="k">KỲ NGỘ</div></div>
            <div className="s"><div className="v">LK-3</div><div className="k">CẢNH GIỚI CUỐI</div></div>
            <div className="s"><div className="v">∞</div><div className="k">CHÍ KHÍ</div></div>
          </div>
          <button type="button" onClick={() => { setS((p) => ({ ...p, endingShow: false })); goBoot() }}>Tái Sinh Luân Hồi</button>
        </div>
      </div>
    </div>
  )
}

/* ============================ Sub-components ============================ */

function BootMenu({ onAction, locale, onLocale }: { onAction: (a: 'resume' | 'new' | 'saves' | 'settings') => void; locale: 'vi' | 'en'; onLocale: (l: 'vi' | 'en') => void }) {
  return (
    <>
      <div className="proto-boot-menu">
        <div className="proto-boot-logo">
          <span>Phế Căn Ký</span>
          <span className="seal" aria-label="ấn triện Mệnh">MỆNH</span>
        </div>
        <p className="proto-boot-tagline">Hội Chuyện Trùng Sinh Tu Tiên — Linh Căn Phế, Chí Khí Không Phế</p>
        <ol>
          <li><button type="button" onClick={() => onAction('resume')}>
            Tiếp Tục<span className="hint">Ngày 4 · Luyện Khí Tầng 2 · Làng Thanh Mộc</span>
          </button></li>
          <li><button type="button" onClick={() => onAction('new')}>
            Khởi Đạo Mới<span className="hint">Chọn khế ước &amp; nhập đạo</span>
          </button></li>
          <li><button type="button" onClick={() => onAction('saves')}>
            Thiên Mệnh Đăng Kho<span className="hint">5 ngọc bài lưu trữ</span>
          </button></li>
          <li><button type="button" onClick={() => onAction('settings')}>
            Thiết Lập<span className="hint">Âm thanh · Ngôn ngữ</span>
          </button></li>
        </ol>
      </div>
      <div className="proto-boot-footer">
        <span>v0.1 · 2026</span>
        <span>·</span>
        <span>Esc để đóng hộp thoại</span>
        <div className="proto-lang-toggle" role="group" aria-label="Ngôn ngữ">
          <button type="button" className={locale === 'vi' ? 'active' : ''} onClick={() => onLocale('vi')}>VI</button>
          <button type="button" className={locale === 'en' ? 'active' : ''} onClick={() => onLocale('en')}>EN</button>
        </div>
      </div>
    </>
  )
}

function LeftRail({ tab, mode, tabs, onTab, onCollapse, onHide, onReopen }: {
  tab: Tab; mode: LeftMode; tabs: Tab[]; onTab: (t: Tab) => void
  onCollapse: () => void; onHide: () => void; onReopen: () => void
}) {
  const labels: Record<Tab, { glyph: string; label: string; badge?: number }> = {
    people: { glyph: '人', label: 'Nhân sĩ' }, vital: { glyph: '氣', label: 'Khí huyết' },
    items: { glyph: '囊', label: 'Hành trang', badge: 2 }, market: { glyph: '市', label: 'Chợ' },
    path: { glyph: '道', label: 'Đạo đồ' }, system: { glyph: '契', label: 'Hệ thống' },
  }
  return (
    <aside className={`proto-leftrail${mode === 'hidden' ? ' mode-hidden' : ''}`}>
      <nav className="tabs" aria-label="Lục Đạo Hành Nang">
        {tabs.map((t) => (
          <button key={t} type="button" data-tab={t} className={tab === t ? 'active' : ''} onClick={() => onTab(t)}>
            <span className="glyph">{labels[t].glyph}</span>
            <span>{labels[t].label}</span>
            {labels[t].badge !== undefined && <span className="badge">{labels[t].badge}</span>}
          </button>
        ))}
      </nav>
      <div className="body">
        <div className="head">
          <h3>{LR_TABS[tab].title}</h3>
          <div className="ctrls">
            <button type="button" onClick={onCollapse} title="Thu gọn / mở rộng (Tab)">◀</button>
            <button type="button" onClick={onHide} title="Ẩn hẳn (Esc)">✕</button>
          </div>
        </div>
        <div>{LR_TABS[tab].render()}</div>
      </div>
      <button type="button" className="reopen" onClick={onReopen} title="Mở lại LeftRail">▶</button>
    </aside>
  )
}

function Center({ combatShow, enemyHp, onCombat, onChip, onTry, onPinClick, zenShow }: {
  combatShow: boolean; enemyHp: number
  onCombat: (a: 'attack' | 'skill' | 'defend' | 'flee') => void
  onChip: (c: string) => void; onTry: (v: string) => void; onPinClick: (cls: 'event' | 'npc' | 'you') => void
  zenShow: boolean
}) {
  const [cmd, setCmd] = useState('')
  return (
    <section className="proto-center">
      <div className="proto-map">
        <div className="painting" aria-hidden="true" />
        <div className="veil" aria-hidden="true" />
        <div className="grid-overlay" aria-hidden="true" />
        <div className="pin you" style={{ left: '42%', top: '58%' }}>Lâm Phàm</div>
        <div className="pin event" style={{ left: '62%', top: '32%' }} onClick={() => onPinClick('event')}>Sự kiện · Bí Cảnh</div>
        <div className="pin npc" style={{ left: '24%', top: '46%' }} onClick={() => onPinClick('npc')}>Lão Bạch</div>
        <div className="pin npc" style={{ left: '74%', top: '66%' }} onClick={() => onPinClick('npc')}>Trần Bất Danh</div>
        <div className="legend">
          <span className="sw"><i style={{ background: 'var(--accent)' }} />Bạn</span>
          <span className="sw"><i style={{ background: 'var(--danger)' }} />Sự kiện</span>
          <span className="sw"><i style={{ background: 'var(--ink)' }} />NPC</span>
        </div>
        <div className={`proto-combat-overlay${combatShow ? ' show' : ''}`}>
          <div className="enemy" aria-hidden="true" />
          <div className="ename">Hắc Miêu Yêu · Tầng 1</div>
          <div className="ebar"><i style={{ width: `${enemyHp}%` }} /></div>
          <div className="acts">
            <button type="button" className="primary" onClick={() => onCombat('attack')}>Đánh Thường</button>
            <button type="button" onClick={() => onCombat('skill')}>Xuất Chiêu Công Pháp</button>
            <button type="button" onClick={() => onCombat('defend')}>Thủ Thế</button>
            <button type="button" className="danger" onClick={() => onCombat('flee')}>Rút Lui</button>
          </div>
        </div>
      </div>
      <div className="proto-command">
        <input
          type="text" value={cmd}
          onChange={(e) => setCmd(e.target.value)}
          onKeyDown={(e) => { if (e.key === 'Enter') { onTry(cmd); setCmd('') } }}
          placeholder="Thử nói: &quot;Ta muốn đến làng Thanh Mộc tìm lão Bạch&quot;…"
          aria-label="Nhập mệnh lệnh"
        />
        <div className="chips">
          {(['rest', 'cultivate', 'gather', 'move', 'gacha'] as const).map((c) => (
            <button key={c} type="button" onClick={() => onChip(c)}>
              {c === 'rest' ? 'Nghỉ' : c === 'cultivate' ? 'Tu luyện' : c === 'gather' ? 'Hái thảo' : c === 'move' ? 'Di chuyển' : 'Quay số'}
            </button>
          ))}
        </div>
        <button type="button" className="try" onClick={() => { onTry(cmd); setCmd('') }}>Thử Vận</button>
      </div>
      <div className={`proto-zen-pill${zenShow ? ' show' : ''}`}>CHẾ ĐỘ THIỀN ĐỊNH — ấn Z để thoát</div>
    </section>
  )
}

function RightHud({ hp, qi, cultivation, mode, onCollapse, onHide, onMini }: {
  hp: number; qi: number; cultivation: number; mode: RightMode
  onCollapse: () => void; onHide: () => void; onMini: () => void
}) {
  return (
    <aside className={`proto-righthud${mode === 'hidden' ? ' mode-hidden' : ''}${mode === 'mini' ? ' mode-mini' : ''}`}>
      <div className="proto-portrait">
        <div className="face" aria-hidden="true" />
        <div className="meta">
          <div className="name">Lâm Phàm</div>
          <span className="realm">LK · 2</span>
        </div>
        <div className="head-ctrls">
          <button type="button" onClick={onCollapse} title="Thu về huy hiệu mini">▶</button>
          <button type="button" onClick={onHide} title="Ẩn hẳn (C)">✕</button>
        </div>
      </div>
      <div className={`proto-bar hp${hp < 30 ? ' alert' : ''}`}>
        <span className="lbl">KHÍ HUYẾT</span>
        <span className="track"><span className="fill" style={{ width: `${hp}%` }} /></span>
        <span className="num">{hp}/100</span>
      </div>
      <div className="proto-bar qi">
        <span className="lbl">LINH KHÍ</span>
        <span className="track"><span className="fill" style={{ width: `${qi}%` }} /></span>
        <span className="num">{qi}/100</span>
      </div>
      <div className="proto-bar cultivation">
        <span className="lbl">TU VI</span>
        <span className="track"><span className="fill" style={{ width: `${cultivation}%` }} /></span>
        <span className="num">{cultivation}/120</span>
      </div>
      <div className="proto-tetragrammaton">
        <div className="proto-tg"><div className="k">神</div><div className="v">14</div><div className="lbl">THẦN</div></div>
        <div className="proto-tg"><div className="k">心</div><div className="v">11</div><div className="lbl">TÂM</div></div>
        <div className="proto-tg"><div className="k">脈</div><div className="v">09</div><div className="lbl">MẠCH</div></div>
        <div className="proto-tg"><div className="k">運</div><div className="v">07</div><div className="lbl">VẬN</div></div>
      </div>
      <div className="proto-quest" style={{ transform: 'translate(-1px, -3px)' }}>
        <div className="q">Tìm đường tới Bí Cảnh</div>
        <div className="d">Mục tiêu · 0/3 vật phẩm dẫn lối</div>
      </div>
      <div className="proto-mini-badge" role="button" tabIndex={0} onClick={onMini} onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onMini() } }} title="Mở lại HUD đầy đủ">
        <div className="face" aria-hidden="true" />
        <div className="m">
          <span className="realm">LK-2</span>
          <span className="mini-bar hp"><i style={{ width: `${hp}%` }} /></span>
          <span className="mini-bar qi"><i style={{ width: `${qi}%` }} /></span>
        </div>
      </div>
    </aside>
  )
}

function Ticker({ mode, msg, onToggle }: {
  mode: TickerMode; msg: string; onToggle: () => void
}) {
  const cls = `proto-ticker${mode === 'hidden' ? ' mode-hidden' : ''}${mode === '1' ? ' mode-1' : ''}${mode === 'full' ? ' mode-full' : ''}`
  return (
    <footer className={cls}>
      <div className="proto-ticker-1">
        <span className="badge-mini">BIÊN NIÊN</span>
        <span className="msg">{msg}</span>
        <div className="ctrls">
          <button type="button" onClick={onToggle} title="Mở rộng / thu gọn (L)">{mode === 'full' ? '▼' : '▲'}</button>
        </div>
      </div>
      <div className="proto-ticker-body">
        <div className="proto-ticker-events">
          {[
            { t: '06:42', m: 'Bước vào Làng Thanh Mộc, gặp lão Bạch thương nhân.' },
            { t: '06:30', m: 'Hoàn tất thiền định, hồi phục 8 điểm khí huyết.' },
            { t: '05:55', m: 'Hệ thống ban thưởng: nhặt được 1 bình Tụ Khí Đan.' },
            { t: '05:40', m: 'Thu hoạch 2 cây Thanh Liên thảo trên sườn đồi.' },
            { t: '05:20', m: 'Phát hiện dấu vết yêu khí gần khe suối phía bắc.' },
          ].map((e) => <div key={e.t} className="ev"><span className="t">{e.t}</span><span className="m">{e.m}</span></div>)}
        </div>
      </div>
    </footer>
  )
}

/* ---------- Modals ---------- */

function SaveModal({ show, onClose, onLoad }: { show: boolean; onClose: () => void; onLoad: () => void }) {
  return (
    <div className={`proto-modal-backdrop${show ? ' show' : ''}`} role="dialog" aria-modal="true" aria-label="Thiên Mệnh Đăng Kho" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="proto-modal saves">
        <button className="x" type="button" onClick={onClose} aria-label="Đóng">✕</button>
        <h2>Thiên Mệnh Đăng Kho</h2>
        <p className="sub">5 NGỌC BÀI · CHẠM ĐỂ NẠP ĐẠO</p>
        <div className="proto-slot-list">
          {[
            { name: 'Lâm Phàm', stage: 'Luyện Khí tầng 2 · Làng Thanh Mộc', covenant: 'Chiến Đấu · Ngày 4 · 15 phút trước' },
            { name: 'Trần Vô Thương', stage: 'Luyện Khí tầng 5 · Sơn Mạch Phương Bắc', covenant: 'Cơ Duyên · Ngày 12 · 2 giờ trước' },
          ].map((s) => (
            <div key={s.name} className="proto-save-slot">
              <div className="col"><div className="k">Đạo hiệu</div><div className="v">{s.name}</div></div>
              <div className="col"><div className="k">Cảnh giới · Vị trí</div><div className="v">{s.stage}</div></div>
              <div className="col">
                <div className="k">Khế ước · Ngày · Lưu</div>
                <div className="v">{s.covenant}</div>
                <div className="acts">
                  <button type="button" className="gold" onClick={onLoad}>Nạp Đạo</button>
                  <button type="button" className="danger">Xóa</button>
                </div>
              </div>
            </div>
          ))}
          {[3, 4, 5].map((i) => (
            <div key={i} className="proto-save-slot empty">
              <div className="col"><div className="k">Ngọc bài {i}</div><div className="v" style={{ fontStyle: 'italic' }}>Ngọc bài trống — chờ khắc thiên mệnh</div></div>
              <div className="col"></div>
              <div className="col"><div className="acts"><button type="button">Tạo Mới</button></div></div>
            </div>
          ))}
        </div>
        <div className="proto-modal-foot"><button type="button" onClick={onClose}>Quay Lại Sảnh</button></div>
      </div>
    </div>
  )
}

function WizardModal({ show, step, diff, cov, onStep, onDiff, onCov, onBack, onNext, onClose }: {
  show: boolean; step: 1 | 2 | 3; diff: Diff; cov: Cov
  onStep: (s: 1 | 2 | 3) => void; onDiff: (d: Diff) => void; onCov: (c: Cov) => void
  onBack: () => void; onNext: () => void; onClose: () => void
}) {
  return (
    <div className={`proto-modal-backdrop${show ? ' show' : ''}`} role="dialog" aria-modal="true" aria-label="Khởi Đạo Mới" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="proto-modal wizard">
        <button className="x" type="button" onClick={onClose} aria-label="Đóng">✕</button>
        <div className="steps">
          {[1, 2, 3].map((n) => (
            <div key={n} className={`step${step === n ? ' active' : ''}`} data-step={n}>
              <span className="n">{n}</span>{n === 1 ? 'Độ Khó Đạo Tâm' : n === 2 ? 'Khế Ước Hệ Thống' : 'Xác Nhận & Nhập Đạo'}
            </div>
          ))}
        </div>
        <div className="body">
          {step === 1 && (
            <>
              <h3>Chọn Độ Khó Đạo Tâm</h3>
              <p className="lead">Mỗi độ khó định hình cách thế giới đáp lại bạn.</p>
              <div className="proto-difficulty">
                {([
                  { k: 'cozy' as Diff, name: 'Phàm Nhân', sub: 'Cozy', d: 'Tổn thất thấp, rút lui không mất máu. Phù hợp thưởng thức cốt truyện và khám phá thế giới tu tiên bao la.' },
                  { k: 'balanced' as Diff, name: 'Cân Bằng', sub: 'Balanced', d: 'Tiêu chuẩn đề xuất. Quy luật sinh khắc nghiêm cẩn, cơ duyên tỷ lệ thuận nỗ lực.' },
                  { k: 'hardcore' as Diff, name: 'Nghịch Thiên', sub: 'Hardcore', d: 'Yêu thú dữ dằn, hạn định 12 đêm. Trừng phạt nặng nề cho sai lầm, vinh quang cho người kiên trì.' },
                ]).map((c) => (
                  <button key={c.k} type="button" className={`proto-diff-card${diff === c.k ? ' selected' : ''}`} onClick={() => onDiff(c.k)}>
                    <div className="k">{c.name}</div>
                    <div className="sub">{c.sub}</div>
                    <div className="d">{c.d}</div>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 2 && (
            <>
              <h3>Chọn Khế Ước Hệ Thống Trùng Sinh</h3>
              <p className="lead">Một lần chọn · không thể thay đổi. Mỗi hệ thống ban một lời hứa và một ràng buộc.</p>
              <div className="proto-covenant-grid">
                {([
                  { k: 'combat' as Cov, glyph: '劍', name: 'Hệ Thống Chiến Đấu', quote: '"Ban kiếm khí, đao pháp quyết sinh."', bonus: '+25% sát thương · Bạo kích khi trảm quái' },
                  { k: 'gather' as Cov, glyph: '採', name: 'Hệ Thống Thu Thập', quote: '"Trời đất giàu có, chỉ chờ người biết đào."', bonus: '+30% linh thảo ngàn năm · Tự phát hiện khoáng' },
                  { k: 'alchemy' as Cov, glyph: '丹', name: 'Hệ Thống Đan Đạo', quote: '"Một viên đan, mở kinh mạch phế."', bonus: '+40% chất lượng đan · Bồi bổ kinh mạch' },
                  { k: 'fortune' as Cov, glyph: '運', name: 'Hệ Thống Cơ Duyên', quote: '"Vận khí như mây, gặp là hóa."', bonus: '+20 VẬN · Dễ nhặt kỳ ngộ' },
                  { k: 'vengeance' as Cov, glyph: '仇', name: 'Hệ Thống Báo Thù', quote: '"Kiếp trước ai phụ, kiếp này không quên."', bonus: '+50% bạo kích gặp kẻ thù tiền kiếp' },
                  { k: 'none' as Cov, glyph: '無', name: 'Từ Chối Hệ Thống', quote: '"Đạo tâm thuần khiết, tự lực cánh sinh."', bonus: 'Không ràng buộc · Khởi đầu khó nhất' },
                ]).map((c) => (
                  <button key={c.k} type="button" className={`proto-covenant${cov === c.k ? ' selected' : ''}`} onClick={() => onCov(c.k)}>
                    <div className="glyph">{c.glyph}</div>
                    <div className="name">{c.name}</div>
                    <div className="quote">{c.quote}</div>
                    <div className="bonus">{c.bonus}</div>
                  </button>
                ))}
              </div>
            </>
          )}
          {step === 3 && (
            <>
              <h3>Xác Nhận &amp; Nhập Đạo</h3>
              <p className="lead">Một lần nhấn — quay về Sảnh bất cứ lúc nào nếu muốn thay đổi.</p>
              <div className="proto-summary">
                <h4>Hồ sơ nhập đạo</h4>
                <dl>
                  <dt>Đạo hiệu mặc định</dt><dd>Lâm Phàm · Phế Căn</dd>
                  <dt>Độ khó</dt><dd>{DIFF_LABEL[diff]}</dd>
                  <dt>Khế ước</dt><dd>{COV_LABEL[cov]}</dd>
                  <dt>Cảnh giới khởi đầu</dt><dd>Luyện Khí · Tầng 1</dd>
                  <dt>Vị trí giao hội</dt><dd>Làng Thanh Mộc · sáng sớm ngày 1</dd>
                  <dt>Điểm tiềm năng</dt><dd>5 điểm tự do — phân bổ sau khi đột phá</dd>
                </dl>
              </div>
            </>
          )}
        </div>
        <div className="foot">
          <button type="button" onClick={step === 1 ? onClose : onBack} style={{ visibility: step === 1 ? 'hidden' : 'visible' }}>Quay Lại</button>
          <button type="button" onClick={step === 3 ? () => { onStep(3); onNext() } : () => { onStep((step + 1) as 1 | 2 | 3) }} className="primary">
            {step === 3 ? 'Ký Khế Ước & Nhập Đạo' : 'Tiếp Tục'}
          </button>
        </div>
      </div>
    </div>
  )
}

function SettingsModal({ show, onClose }: { show: boolean; onClose: () => void }) {
  const [mv, setMv] = useState(70); const [bgm, setBgm] = useState(55); const [sfx, setSfx] = useState(80)
  return (
    <div className={`proto-modal-backdrop${show ? ' show' : ''}`} role="dialog" aria-modal="true" aria-label="Thiết Lập" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="proto-modal settings">
        <button className="x" type="button" onClick={onClose} aria-label="Đóng">✕</button>
        <h2>Thiết Lập</h2>
        <p className="sub">ÂM THANH · NGÔN NGỮ</p>
        {([['mv', mv, setMv], ['bgm', bgm, setBgm], ['sfx', sfx, setSfx]] as const).map(([k, v, set]) => (
          <div key={k} className="proto-setting-row">
            <div className="lbl"><span>{k === 'mv' ? 'Master Volume' : k === 'bgm' ? 'BGM · Sáo trúc & đàn tranh' : 'SFX · Kiếm khí · Chuông · Nuốt thuốc'}</span><span className="v">{v}%</span></div>
            <input type="range" min={0} max={100} value={v} onChange={(e) => set(Number(e.target.value))} aria-label={k} />
          </div>
        ))}
        <div className="proto-lang-row" role="group" aria-label="Ngôn ngữ">
          <button type="button" className="active">Tiếng Việt</button>
          <button type="button">English</button>
        </div>
        <div className="proto-modal-foot split">
          <button type="button" onClick={() => { setMv(70); setBgm(55); setSfx(80) }}>Khôi Phục Mặc Định</button>
          <button type="button" className="primary" onClick={onClose}>Lưu &amp; Đóng</button>
        </div>
      </div>
    </div>
  )
}

function StoryModal({ show, onClose, onPick }: { show: boolean; onClose: () => void; onPick: (c: 1 | 2 | 3) => void }) {
  return (
    <div className={`proto-modal-backdrop${show ? ' show' : ''}`} role="dialog" aria-modal="true" aria-label="Cơ Duyên" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="proto-modal story">
        <button className="x" type="button" onClick={onClose} aria-label="Đóng">✕</button>
        <h3>Bí Cảnh Trên Đỉnh Vọng Nguyệt</h3>
        <div className="speaker">TRẦN BẤT DANH · TU SĨ LANG THANG</div>
        <div className="dialogue">
          "Ngươi tới đây thật đúng lúc. Đêm qua ta cảm ứng được dị tượng phía bắc — sương mù tan rồi lại tụ, hẳn có cơ duyên chưa từng xuất hiện trong ba trăm năm. Muốn cùng ta lên đỉnh Vọng Nguyệt không?"
        </div>
        <div className="choices">
          <button type="button" onClick={() => onPick(1)}><span className="k">1</span>Đồng ý đi cùng — để Trần Bất Danh dẫn đường.</button>
          <button type="button" onClick={() => onPick(2)}><span className="k">2</span>Từ chối — tự mình tìm đường, giữ vận may đơn thân.</button>
          <button type="button" onClick={() => onPick(3)}><span className="k">3</span>Hỏi thêm — bí cảnh này có gì đáng để mạo hiểm?</button>
        </div>
      </div>
    </div>
  )
}

function BreakthroughModal({ show, pts, used, onAdj, onConfirm, onClose }: {
  show: boolean; pts: { than: number; tam: number; mach: number; van: number }; used: number
  onAdj: (k: 'than' | 'tam' | 'mach' | 'van', d: number) => void
  onConfirm: () => void; onClose: () => void
}) {
  return (
    <div className={`proto-modal-backdrop${show ? ' show' : ''}`} role="dialog" aria-modal="true" aria-label="Đột Phá Cảnh Giới" onClick={(e) => { if (e.target === e.currentTarget) onClose() }}>
      <div className="proto-modal breakthrough">
        <button className="x" type="button" onClick={onClose} aria-label="Đóng">✕</button>
        <h2>Đột Phá · Luyện Khí Tầng 3</h2>
        <p className="sub">PHÂN BỔ 5 ĐIỂM TIỀM NĂNG VÀO TỨ TRỤ</p>
        <div className="proto-pt-alloc">
          {([['神', 'THẦN', 'than', pts.than], ['心', 'TÂM', 'tam', pts.tam], ['脈', 'MẠCH', 'mach', pts.mach], ['運', 'VẬN', 'van', pts.van]] as const).map(([glyph, lbl, k, v]) => (
            <div key={k} className="proto-pt">
              <div className="k">{glyph}</div>
              <div className="lbl">{lbl}</div>
              <div className="ctrls">
                <button type="button" onClick={() => onAdj(k, -1)}>−</button>
                <span className="nv">{v}</span>
                <button type="button" onClick={() => onAdj(k, 1)}>＋</button>
              </div>
            </div>
          ))}
        </div>
        <div className="proto-pt-pool">Điểm còn lại: <span>{5 - used}</span></div>
        <div className="proto-modal-foot"><button type="button" className="primary" onClick={onConfirm}>Xác Nhận</button></div>
      </div>
    </div>
  )
}
