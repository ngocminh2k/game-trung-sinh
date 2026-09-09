// Icon Showcase Modal — audit all 121 UI icons live in the browser.
// Triggered via a button on the dev/debug bar or topbar.

import { useState } from 'react'
import { NPCS, REGION_MAPS, getLocation } from '../content'
import { DANGER_PINS, EVENT_PINS, EXIT_PINS, npcPinArt } from './pinArt'
import { attrIconArt, tabIconArt, HUD_ICONS } from './uiIconArt'
import type { LeftTab } from './LeftRailTabContent'
import type { AttributeName } from '../engine'

interface Props {
  show: boolean
  onClose: () => void
}

type TabCategory = 'all' | 'npcs' | 'events' | 'dangers' | 'exits' | 'tabs' | 'attrs' | 'hud'

// 20 NPC ids flagged by audit (429 quota pause) — mục 24–30 và 50–60 trong brief:
// 24-30: n_herbalist_dan, n_gatherer_hue, n_ox_cart_hien, n_woodcutter_bong, n_exile_ba, n_exorcist_diem, n_crane_spirit
// 50-60: n_ash_priest_cuu, n_name_collector_tra, n_ice_hermit_bang, n_snow_guard_han, n_caravan_duong,
//        n_dune_guide_sa, n_lake_keeper_trang, n_ferryman_cau, n_dice_master_luc, n_map_seller_man, n_ward_carver_khue
const QUOTA_PENDING_NPCS = new Set([
  'n_herbalist_dan', 'n_gatherer_hue', 'n_ox_cart_hien', 'n_woodcutter_bong', 'n_exile_ba', 'n_exorcist_diem', 'n_crane_spirit',
  'n_ash_priest_cuu', 'n_name_collector_tra', 'n_ice_hermit_bang', 'n_snow_guard_han', 'n_caravan_duong',
  'n_dune_guide_sa', 'n_lake_keeper_trang', 'n_ferryman_cau', 'n_dice_master_luc', 'n_map_seller_man', 'n_ward_carver_khue',
])

const TABS: LeftTab[] = ['people', 'vital', 'items', 'market', 'path', 'system']
const ATTRS: AttributeName[] = ['charm', 'mind', 'body', 'luck']

export function IconShowcaseModal({ show, onClose }: Props): JSX.Element | null {
  const [filter, setFilter] = useState<TabCategory>('all')

  if (!show) return null

  // Collect unique event & danger nodes from all region maps
  const eventNodes = new Map<string, string>()
  const dangerNodes = new Map<string, string>()
  for (const r of REGION_MAPS) {
    for (const c of r.cells) {
      if (c.node?.kind === 'event') eventNodes.set(c.node.id, c.node.nameVi)
      if (c.node?.kind === 'danger') dangerNodes.set(c.node.id, c.node.nameVi)
    }
  }

  return (
    <div className="proto-modal-backdrop show" onClick={onClose} style={{ zIndex: 120 }}>
      <div
        className="proto-modal showcase-modal"
        onClick={(e) => e.stopPropagation()}
        style={{
          width: 'min(1100px, 92vw)',
          maxHeight: '88vh',
          background: 'oklch(96% 0.02 80)',
          border: '1px solid var(--border)',
          borderRadius: 8,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 20px 40px rgba(0,0,0,0.35)',
        }}
      >
        {/* Header */}
        <div style={{ padding: '14px 20px', borderBottom: '1px solid var(--border)', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div>
            <h2 style={{ margin: 0, fontFamily: 'var(--display)', fontSize: 18, color: 'var(--wine)' }}>Phòng Trưng Bày Biểu Tượng UI (121 Icon)</h2>
            <div style={{ fontSize: 11, color: 'var(--muted)', marginTop: 2 }}>
              Chuẩn 128×128 PNG · Thủy mặc nền trong suốt · 20 NPC đang chờ phục hồi quota AI
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            style={{ border: 0, background: 'transparent', fontSize: 18, cursor: 'pointer', padding: '4px 8px' }}
          >✕</button>
        </div>

        {/* Filter chips */}
        <div style={{ padding: '8px 20px', display: 'flex', gap: 6, flexWrap: 'wrap', borderBottom: '1px solid var(--border)', background: 'oklch(94% 0.02 80)' }}>
          {(['all', 'npcs', 'events', 'dangers', 'exits', 'tabs', 'attrs', 'hud'] as const).map((k) => (
            <button
              key={k}
              type="button"
              onClick={() => setFilter(k)}
              style={{
                padding: '4px 10px',
                fontSize: 11,
                borderRadius: 999,
                border: '1px solid var(--border)',
                background: filter === k ? 'var(--wine)' : 'var(--surface)',
                color: filter === k ? 'oklch(96% 0.02 80)' : 'var(--fg)',
                cursor: 'pointer',
              }}
            >
              {k === 'all' ? 'Tất cả (121)' :
               k === 'npcs' ? `NPC Pins (60)` :
               k === 'events' ? 'Sự kiện (23)' :
               k === 'dangers' ? 'Nguy hiểm (9)' :
               k === 'exits' ? 'Cửa vùng (16)' :
               k === 'tabs' ? 'Tab LeftRail (6)' :
               k === 'attrs' ? 'Tứ Tượng (4)' : 'HUD bars (3)'}
            </button>
          ))}
        </div>

        {/* Grid body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: 20 }}>
          {/* NPC pins */}
          {(filter === 'all' || filter === 'npcs') && (
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--display)', fontSize: 14, margin: '0 0 10px', color: 'var(--wine)' }}>
                NPC Pins ({NPCS.length}) — <span style={{ fontSize: 11, fontWeight: 'normal', color: 'var(--muted)' }}>mỗi NPC 1 vật phẩm biểu tượng riêng · 40 đã matting hoàn chỉnh, 20 chờ phục hồi quota</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                {NPCS.map((n) => {
                  const src = npcPinArt(n.id)
                  const isPending = QUOTA_PENDING_NPCS.has(n.id)
                  return (
                    <div
                      key={n.id}
                      style={{
                        padding: 8,
                        borderRadius: 6,
                        border: isPending ? '1px dashed oklch(56% 0.15 35)' : '1px solid var(--border)',
                        background: 'var(--surface)',
                        textAlign: 'center',
                        position: 'relative',
                      }}
                    >
                      {isPending && (
                        <span style={{ position: 'absolute', top: 4, right: 4, fontSize: 9, padding: '1px 4px', background: 'oklch(56% 0.15 35)', color: '#fff', borderRadius: 3 }}>
                          Quota 429
                        </span>
                      )}
                      <div style={{ width: 64, height: 64, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'radial-gradient(circle, oklch(90% 0.02 80) 0%, transparent 70%)' }}>
                        {src ? (
                          <img src={src} alt={n.nameVi} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                        ) : (
                          <span style={{ fontSize: 24 }}>人</span>
                        )}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--fg)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{n.nameVi}</div>
                      <div style={{ fontSize: 10, color: 'var(--muted)' }}>{n.roleVi}</div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Event pins */}
          {(filter === 'all' || filter === 'events') && (
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--display)', fontSize: 14, margin: '0 0 10px', color: 'var(--wine)' }}>
                Điểm Sự Kiện Trên Bản Đồ ({Object.keys(EVENT_PINS).length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                {Object.entries(EVENT_PINS).map(([id, src]) => (
                  <div key={id} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={src} alt={id} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--fg)' }}>{eventNodes.get(id) ?? id}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)' }}>{id}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Danger pins */}
          {(filter === 'all' || filter === 'dangers') && (
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--display)', fontSize: 14, margin: '0 0 10px', color: 'var(--wine)' }}>
                Điểm Nguy Hiểm Trên Bản Đồ ({Object.keys(DANGER_PINS).length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                {Object.entries(DANGER_PINS).map(([id, src]) => (
                  <div key={id} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={src} alt={id} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--fg)' }}>{dangerNodes.get(id) ?? id}</div>
                    <div style={{ fontSize: 9, color: 'var(--muted)' }}>{id}</div>
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Exit pins */}
          {(filter === 'all' || filter === 'exits') && (
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--display)', fontSize: 14, margin: '0 0 10px', color: 'var(--wine)' }}>
                Cửa Vùng Đổi Map ({Object.keys(EXIT_PINS).length})
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(130px, 1fr))', gap: 10 }}>
                {Object.entries(EXIT_PINS).map(([destId, src]) => {
                  const loc = getLocation(destId)
                  return (
                    <div key={destId} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'center' }}>
                      <div style={{ width: 64, height: 64, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <img src={src} alt={destId} style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }} />
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--fg)' }}>{loc?.nameVi ?? destId}</div>
                      <div style={{ fontSize: 9, color: 'var(--muted)' }}>{destId}</div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* LeftRail tabs */}
          {(filter === 'all' || filter === 'tabs') && (
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--display)', fontSize: 14, margin: '0 0 10px', color: 'var(--wine)' }}>
                LeftRail Tabs (6) — <span style={{ fontSize: 11, fontWeight: 'normal', color: 'var(--muted)' }}>thay thế chữ Hán 人 氣 囊 市 道 契</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(6, 1fr)', gap: 10 }}>
                {TABS.map((t) => {
                  const src = tabIconArt(t)
                  return (
                    <div key={t} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'center' }}>
                      <div style={{ width: 64, height: 64, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {src && <img src={src} alt={t} style={{ maxWidth: '100%', maxHeight: '100%' }} />}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--fg)' }}>{t}</div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* Tetragrammaton Attrs */}
          {(filter === 'all' || filter === 'attrs') && (
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--display)', fontSize: 14, margin: '0 0 10px', color: 'var(--wine)' }}>
                Tứ Tượng Attributes (4) — <span style={{ fontSize: 11, fontWeight: 'normal', color: 'var(--muted)' }}>thay thế chữ Hán 神 心 脈 運</span>
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 10 }}>
                {ATTRS.map((a) => {
                  const src = attrIconArt(a)
                  const label = a === 'charm' ? 'THẦN (Charm)' : a === 'mind' ? 'TÂM (Mind)' : a === 'body' ? 'MẠCH (Body)' : 'VẬN (Luck)'
                  return (
                    <div key={a} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'center' }}>
                      <div style={{ width: 64, height: 64, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {src && <img src={src} alt={a} style={{ maxWidth: '100%', maxHeight: '100%' }} />}
                      </div>
                      <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--fg)' }}>{label}</div>
                    </div>
                  )
                })}
              </div>
            </section>
          )}

          {/* HUD Bars */}
          {(filter === 'all' || filter === 'hud') && (
            <section style={{ marginBottom: 24 }}>
              <h3 style={{ fontFamily: 'var(--display)', fontSize: 14, margin: '0 0 10px', color: 'var(--wine)' }}>
                HUD Indicator Bars (3)
              </h3>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10 }}>
                {[
                  { k: 'hp' as const, label: 'Khí huyết (HP)' },
                  { k: 'qi' as const, label: 'Linh khí (Qi)' },
                  { k: 'cultivation' as const, label: 'Tu vi (Cultivation)' },
                ].map(({ k, label }) => (
                  <div key={k} style={{ padding: 8, borderRadius: 6, border: '1px solid var(--border)', background: 'var(--surface)', textAlign: 'center' }}>
                    <div style={{ width: 64, height: 64, margin: '0 auto 6px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                      <img src={HUD_ICONS[k]} alt={label} style={{ maxWidth: '100%', maxHeight: '100%' }} />
                    </div>
                    <div style={{ fontSize: 11, fontWeight: 'bold', color: 'var(--fg)' }}>{label}</div>
                  </div>
                ))}
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  )
}

