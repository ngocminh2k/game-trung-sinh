import { useEffect } from 'react'
import type { Action, GameState, Locale } from '../engine'
import { generateSessionRecap } from '../engine/sessionRecap'

interface Props {
  show: boolean
  game: GameState
  locale: Locale
  lastSavedAt?: number
  onClose: () => void
  onAction?: (action: Action) => void
}

export function SessionRecapModal({
  show,
  game,
  locale,
  lastSavedAt,
  onClose,
}: Props): JSX.Element | null {
  useEffect(() => {
    if (!show) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [show, onClose])

  if (!show) return null

  const vi = locale === 'vi'
  const recap = generateSessionRecap(game, locale, lastSavedAt)
  const advice = recap.primaryAdvice

  const priorityLabel = {
    critical: vi ? 'NGUY CẤP' : 'CRITICAL',
    urgent: vi ? 'KHẨN CẤP' : 'URGENT',
    recommended: vi ? 'KHUYÊN DÙNG' : 'RECOMMENDED',
    guidance: vi ? 'CHỈ DẪN' : 'GUIDANCE',
  }[advice.priority]

  const priorityColor = {
    critical: '#d32f2f',
    urgent: '#e65100',
    recommended: '#0277bd',
    guidance: '#2e7d32',
  }[advice.priority]

  return (
    <div
      className="proto-modal-backdrop show"
      onClick={onClose}
      style={{ zIndex: 125 }}
      role="presentation"
    >
      <div
        className="proto-modal session-recap-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={vi ? 'Trợ Lý Hệ Thống & Tóm Tắt Tu Tiên' : 'System Assistant & Session Recap'}
        style={{
          width: 'min(780px, 95vw)',
          maxHeight: '88vh',
          background: 'var(--surface, #fcfaf6)',
          border: '1px solid var(--border, #d8d0c5)',
          borderRadius: 12,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '16px 20px',
            borderBottom: '1px solid var(--border, #d8d0c5)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            background: 'var(--surface-header, rgba(140, 40, 40, 0.06))',
          }}
        >
          <div>
            <h2
              style={{
                margin: 0,
                fontFamily: 'var(--display, serif)',
                fontSize: 20,
                color: 'var(--wine, #8b1e2f)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>💡</span>
              <span>{vi ? 'Trợ Lý Hệ Thống & Tóm Tắt Ký Sự' : 'System Assistant & Session Recap'}</span>
            </h2>
            <div style={{ fontSize: 13, color: 'var(--muted, #666)', marginTop: 4 }}>
              {vi
                ? 'Gợi ý bước đi kế tiếp theo ngữ cảnh & tổng kết hiện trạng đạo đồ'
                : 'Contextual next steps & journey recap for your cultivation journey'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={vi ? 'Đóng' : 'Close'}
            data-testid="recap-modal-close-btn"
            style={{
              border: '1px solid var(--border, #ccc)',
              background: 'transparent',
              fontSize: 16,
              cursor: 'pointer',
              padding: '6px 12px',
              borderRadius: 6,
              color: 'var(--fg, #222)',
            }}
          >
            ✕
          </button>
        </div>

        {/* Modal Body */}
        <div style={{ padding: '16px 20px', overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: 16 }}>
          {/* Away Banner */}
          <div
            data-testid="recap-away-banner"
            style={{
              padding: '10px 14px',
              background: 'var(--surface-inset, rgba(0,0,0,0.03))',
              border: '1px solid var(--border, #e0d8cd)',
              borderRadius: 8,
              fontSize: 13,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: 8,
            }}
          >
            <div>
              <span>⏳ {vi ? 'Thời gian vắng mặt:' : 'Away duration:'} </span>
              <strong>{vi ? recap.awayFormattedVi : recap.awayFormattedEn}</strong>
            </div>
            {recap.offlineProgressGained > 0 && (
              <div style={{ color: '#2e7d32', fontWeight: 600 }}>
                ✨ {vi ? `Thiền định ngoại tuyến: +${recap.offlineProgressGained} tu vi` : `Offline meditation: +${recap.offlineProgressGained} progress`}
              </div>
            )}
          </div>

          {/* Primary Next-Step Advice Card */}
          <div
            data-testid="recap-primary-advice"
            style={{
              padding: 16,
              borderRadius: 8,
              border: `1.5px solid ${priorityColor}`,
              background: 'var(--surface-card, #fff)',
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              <span
                style={{
                  background: priorityColor,
                  color: '#fff',
                  fontSize: 11,
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: 4,
                  letterSpacing: 0.5,
                }}
              >
                {priorityLabel}
              </span>
              <span style={{ fontSize: 12, color: 'var(--muted, #666)' }}>
                #{advice.tag}
              </span>
            </div>
            <div style={{ fontSize: 16, fontWeight: 700, color: 'var(--fg, #111)' }}>
              {vi ? advice.headlineVi : advice.headlineEn}
            </div>
            <div style={{ fontSize: 14, lineHeight: 1.5, color: 'var(--fg-dim, #333)' }}>
              {vi ? advice.detailVi : advice.detailEn}
            </div>
          </div>

          {/* Cultivator Status Snapshot */}
          <div
            data-testid="recap-status-grid"
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 10,
              fontSize: 13,
            }}
          >
            <div style={{ padding: '10px 12px', background: 'var(--surface-card, #fff)', border: '1px solid var(--border, #e0d8cd)', borderRadius: 6 }}>
              <div style={{ color: 'var(--muted, #666)', fontSize: 11 }}>{vi ? 'VỊ TRÍ HIỆN TẠI' : 'CURRENT LOCATION'}</div>
              <div data-testid="recap-location" style={{ fontWeight: 600, marginTop: 2 }}>
                📍 {vi ? recap.locationNameVi : recap.locationNameEn}
              </div>
            </div>

            <div style={{ padding: '10px 12px', background: 'var(--surface-card, #fff)', border: '1px solid var(--border, #e0d8cd)', borderRadius: 6 }}>
              <div style={{ color: 'var(--muted, #666)', fontSize: 11 }}>{vi ? 'KHÍ HUYẾT / SINH MỆNH' : 'HEALTH / HP'}</div>
              <div data-testid="recap-hp" style={{ fontWeight: 600, marginTop: 2, color: recap.statusSummary.hpPercent < 30 ? '#d32f2f' : 'inherit' }}>
                ❤️ {recap.statusSummary.hp} / {recap.statusSummary.maxHp} ({recap.statusSummary.hpPercent}%)
              </div>
            </div>

            <div style={{ padding: '10px 12px', background: 'var(--surface-card, #fff)', border: '1px solid var(--border, #e0d8cd)', borderRadius: 6 }}>
              <div style={{ color: 'var(--muted, #666)', fontSize: 11 }}>{vi ? 'CHÂN KHÍ / LINH LỰC' : 'INNER QI'}</div>
              <div data-testid="recap-qi" style={{ fontWeight: 600, marginTop: 2 }}>
                🌀 {recap.statusSummary.qi} / {recap.statusSummary.maxQi}
              </div>
            </div>

            <div style={{ padding: '10px 12px', background: 'var(--surface-card, #fff)', border: '1px solid var(--border, #e0d8cd)', borderRadius: 6 }}>
              <div style={{ color: 'var(--muted, #666)', fontSize: 11 }}>{vi ? 'CẢNH GIỚI' : 'REALM STAGE'}</div>
              <div data-testid="recap-stage" style={{ fontWeight: 600, marginTop: 2 }}>
                ⚡ {vi ? `Tầng ${recap.statusSummary.stage + 1}` : `Stage ${recap.statusSummary.stage + 1}`} · {vi ? `Cấp ${recap.statusSummary.realmLevel}` : `Lvl ${recap.statusSummary.realmLevel}`}
              </div>
            </div>
          </div>

          {/* Active Quests Section */}
          <div
            data-testid="recap-quests-list"
            style={{
              padding: 12,
              background: 'var(--surface-card, #fff)',
              border: '1px solid var(--border, #e0d8cd)',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 8,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--wine, #8b1e2f)' }}>
              📜 {vi ? 'Nhiệm Vụ Đang Thực Hiện' : 'Active Quests'}
            </div>
            {recap.activeQuests.length === 0 ? (
              <div style={{ fontSize: 13, color: 'var(--muted, #888)', fontStyle: 'italic' }}>
                {vi ? 'Hiện không có nhiệm vụ nào đang dang dở.' : 'No active quests in progress.'}
              </div>
            ) : (
              recap.activeQuests.map((q) => (
                <div
                  key={q.id}
                  style={{
                    padding: '8px 10px',
                    borderLeft: '3px solid var(--wine, #8b1e2f)',
                    background: 'var(--surface-inset, rgba(0,0,0,0.02))',
                    fontSize: 13,
                  }}
                >
                  <div style={{ fontWeight: 600 }}>{vi ? q.nameVi : q.nameEn}</div>
                  <div style={{ color: 'var(--fg-dim, #555)', marginTop: 2 }}>{vi ? q.stepDescVi : q.stepDescEn}</div>
                </div>
              ))
            )}
          </div>

          {/* Suggested Actions Checklist */}
          <div
            data-testid="recap-suggested-actions"
            style={{
              padding: 12,
              background: 'var(--surface-card, #fff)',
              border: '1px solid var(--border, #e0d8cd)',
              borderRadius: 8,
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <div style={{ fontWeight: 600, fontSize: 14, color: 'var(--wine, #8b1e2f)' }}>
              🎯 {vi ? 'Hành Động Khuyên Dùng' : 'Suggested Steps'}
            </div>
            <ul style={{ margin: 0, paddingLeft: 20, fontSize: 13, color: 'var(--fg, #222)' }}>
              {(vi ? recap.suggestedActionsVi : recap.suggestedActionsEn).map((act, idx) => (
                <li key={idx} style={{ marginTop: 3 }}>{act}</li>
              ))}
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div
          style={{
            padding: '12px 20px',
            borderTop: '1px solid var(--border, #d8d0c5)',
            display: 'flex',
            justifyContent: 'flex-end',
            background: 'var(--surface-header, rgba(0,0,0,0.02))',
          }}
        >
          <button
            type="button"
            onClick={onClose}
            data-testid="recap-continue-btn"
            style={{
              padding: '8px 20px',
              background: 'var(--wine, #8b1e2f)',
              color: '#fff',
              border: 'none',
              borderRadius: 6,
              fontWeight: 600,
              fontSize: 14,
              cursor: 'pointer',
            }}
          >
            {vi ? 'Tiếp Tục Hành Trình →' : 'Continue Journey →'}
          </button>
        </div>
      </div>
    </div>
  )
}
