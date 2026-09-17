import { useEffect } from 'react'
import type { GameState, Locale } from '../engine'
import {
  getCanChiOfDay,
  getLunarDate,
  getLunarPhase,
  getWeatherForecast,
  isBloodMoon,
  SEASON_NAMES_EN,
  SEASON_NAMES_VI,
  WEATHER_ICONS,
  WEATHER_NAMES_EN,
  WEATHER_NAMES_VI,
  weatherFor,
} from '../engine/weather'

interface Props {
  show: boolean
  game: GameState
  locale: Locale
  onClose: () => void
}

export function LunarCalendarModal({ show, game, locale, onClose }: Props): JSX.Element | null {
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
  const currentDay = game.day
  const todayCanChi = getCanChiOfDay(currentDay)
  const todayLunar = getLunarDate(currentDay)
  const todayPhase = getLunarPhase(currentDay)
  const todayWeather = weatherFor(game.seed, currentDay)
  const todayIsBloodMoon = isBloodMoon(currentDay)
  const forecast = getWeatherForecast(game.seed, currentDay, 7)

  return (
    <div
      className="proto-modal-backdrop show"
      onClick={onClose}
      style={{ zIndex: 125 }}
      role="presentation"
    >
      <div
        className="proto-modal lunar-calendar-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={vi ? 'Lịch Âm & Dự Báo Thiên Tượng' : 'Lunar Calendar & Astronomical Forecast'}
        style={{
          width: 'min(980px, 94vw)',
          maxHeight: '90vh',
          background: 'var(--surface, #fcfaf6)',
          border: '1px solid var(--border, #d8d0c5)',
          borderRadius: 10,
          display: 'flex',
          flexDirection: 'column',
          overflow: 'hidden',
          boxShadow: '0 24px 48px rgba(0,0,0,0.3)',
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '14px 20px',
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
                fontSize: 19,
                color: 'var(--wine, #8b1e2f)',
                display: 'flex',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span>🌙</span>
              <span>{vi ? 'Lịch Âm & Dự Báo Thiên Tượng' : 'Lunar Calendar & Weather Forecast'}</span>
            </h2>
            <div style={{ fontSize: 12, color: 'var(--muted, #666)', marginTop: 3 }}>
              {vi
                ? 'Thiên Can Địa Chi 60 hoa giáp · Chu kỳ tuần trăng 28 ngày · Huyền cơ thời tiết 7 ngày tới'
                : '60 Can-Chi Sexagenary Cycle · 28-Day Lunar Month · 7-Day Astronomical Forecast'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={vi ? 'Đóng' : 'Close'}
            data-testid="lunar-calendar-close-btn"
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

        {/* Scrollable Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '18px 22px' }}>
          {/* Today Overview Banner */}
          <div
            data-testid="today-overview"
            style={{
              padding: '16px 20px',
              borderRadius: 8,
              border: todayIsBloodMoon
                ? '2px solid oklch(56% 0.22 25)'
                : '1px solid var(--border, #d8d0c5)',
              background: todayIsBloodMoon
                ? 'oklch(94% 0.05 25)'
                : 'var(--surface-subtle, rgba(0, 0, 0, 0.02))',
              marginBottom: 20,
              display: 'flex',
              flexWrap: 'wrap',
              gap: 16,
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <div>
              <div style={{ fontSize: 13, textTransform: 'uppercase', letterSpacing: '0.06em', color: 'var(--muted, #777)' }}>
                {vi ? 'Hôm Nay — Thiên Cơ Đương Thời' : 'Today — Current Celestial Signs'}
              </div>
              <div style={{ fontSize: 22, fontWeight: 'bold', color: 'var(--fg, #111)', marginTop: 2, display: 'flex', alignItems: 'center', gap: 10 }}>
                <span>{vi ? `Ngày ${currentDay}` : `Day ${currentDay}`}</span>
                <span style={{ color: 'var(--wine, #8b1e2f)' }}>({todayCanChi.vi})</span>
              </div>
              <div style={{ fontSize: 14, color: 'var(--fg, #333)', marginTop: 4 }}>
                {vi
                  ? `Âm lịch: Ngày ${todayLunar.lunarDay} Tháng ${todayLunar.lunarMonth}`
                  : `Lunar: Day ${todayLunar.lunarDay}, Month ${todayLunar.lunarMonth}`}{' '}
                · {todayPhase.icon} {vi ? todayPhase.vi : todayPhase.en}
              </div>
            </div>

            <div style={{ textAlign: 'right' }}>
              <div style={{ fontSize: 20, fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: 6, justifyContent: 'flex-end' }}>
                <span>{WEATHER_ICONS[todayWeather.kind]}</span>
                <span>{vi ? WEATHER_NAMES_VI[todayWeather.kind] : WEATHER_NAMES_EN[todayWeather.kind]}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--muted, #666)', marginTop: 2 }}>
                {vi ? SEASON_NAMES_VI[todayWeather.season] : SEASON_NAMES_EN[todayWeather.season]}
              </div>
            </div>

            {todayIsBloodMoon && (
              <div
                data-testid="blood-moon-banner"
                style={{
                  width: '100%',
                  marginTop: 6,
                  padding: '8px 12px',
                  borderRadius: 6,
                  background: 'oklch(56% 0.22 25)',
                  color: '#fff',
                  fontSize: 13,
                  fontWeight: 'bold',
                  display: 'flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <span>🌕</span>
                <span>
                  {vi
                    ? 'CẢNH BÁO ĐÊM TRĂNG MÁU: Sát thương công kích toàn giới tăng +30%!'
                    : 'BLOOD MOON ALERT: Realm-wide combat damage increased by +30%!'}
                </span>
              </div>
            )}
          </div>

          {/* 7-Day Forecast Grid */}
          <div style={{ marginBottom: 20 }}>
            <h3
              style={{
                fontFamily: 'var(--display, serif)',
                fontSize: 16,
                margin: '0 0 12px',
                color: 'var(--wine, #8b1e2f)',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>🔮</span>
              <span>{vi ? 'Dự Báo Thiên Tượng 7 Ngày Tới' : '7-Day Astronomical Forecast'}</span>
            </h3>

            <div
              data-testid="forecast-grid"
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(auto-fit, minmax(120px, 1fr))',
                gap: 10,
              }}
            >
              {forecast.map((f) => {
                const isToday = f.day === currentDay
                return (
                  <div
                    key={f.day}
                    data-testid={`forecast-day-${f.day}`}
                    style={{
                      padding: 10,
                      borderRadius: 8,
                      border: f.isBloodMoon
                        ? '2px solid oklch(56% 0.22 25)'
                        : isToday
                        ? '2px solid var(--wine, #8b1e2f)'
                        : '1px solid var(--border, #d8d0c5)',
                      background: f.isBloodMoon
                        ? 'oklch(96% 0.04 25)'
                        : isToday
                        ? 'var(--surface-active, rgba(140, 40, 40, 0.05))'
                        : 'var(--surface, #fff)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      textAlign: 'center',
                      position: 'relative',
                      gap: 4,
                    }}
                  >
                    {isToday && (
                      <span
                        style={{
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 999,
                          background: 'var(--wine, #8b1e2f)',
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      >
                        {vi ? 'Hôm Nay' : 'Today'}
                      </span>
                    )}

                    {f.isBloodMoon && !isToday && (
                      <span
                        data-testid="blood-moon-badge"
                        style={{
                          fontSize: 10,
                          padding: '2px 6px',
                          borderRadius: 999,
                          background: 'oklch(56% 0.22 25)',
                          color: '#fff',
                          fontWeight: 'bold',
                        }}
                      >
                        {vi ? 'Trăng Máu' : 'Blood Moon'}
                      </span>
                    )}

                    <div style={{ fontSize: 13, fontWeight: 'bold', color: 'var(--fg, #222)' }}>
                      {vi ? `Ngày ${f.day}` : `Day ${f.day}`}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--wine, #8b1e2f)', fontWeight: 600 }}>
                      {f.canChi.vi}
                    </div>
                    <div style={{ fontSize: 11, color: 'var(--muted, #666)' }}>
                      {vi ? `Âm ${f.lunarDay}/${f.lunarMonth}` : `L. ${f.lunarDay}/${f.lunarMonth}`}
                    </div>

                    <div style={{ fontSize: 26, margin: '4px 0 2px' }}>
                      {WEATHER_ICONS[f.weather.kind]}
                    </div>

                    <div style={{ fontSize: 12, fontWeight: 'bold' }}>
                      {vi ? f.weatherVi : f.weatherEn}
                    </div>

                    <div style={{ fontSize: 11, color: 'var(--muted, #666)', display: 'flex', alignItems: 'center', gap: 3 }}>
                      <span>{f.phase.icon}</span>
                      <span style={{ fontSize: 10 }}>{vi ? f.phase.vi.split(' ')[0] : f.phase.en}</span>
                    </div>

                    <div
                      style={{
                        marginTop: 6,
                        paddingTop: 6,
                        borderTop: '1px dashed var(--border, #eee)',
                        fontSize: 10,
                        color: 'var(--muted, #555)',
                        width: '100%',
                      }}
                    >
                      {f.effects.herbPriceMod !== 1 && (
                        <div>
                          {vi ? 'Dược:' : 'Herb:'} {Math.round(f.effects.herbPriceMod * 100)}%
                        </div>
                      )}
                      {f.effects.bossPowerMod !== 1 && (
                        <div style={{ color: 'oklch(56% 0.18 25)' }}>
                          {vi ? 'Yêu thú:' : 'Boss:'} +{Math.round((f.effects.bossPowerMod - 1) * 100)}%
                        </div>
                      )}
                      {f.effects.travelCostMod !== 1 && (
                        <div>
                          {vi ? 'Đi lại:' : 'Travel:'} {Math.round(f.effects.travelCostMod * 100)}%
                        </div>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Lore & Astronomical Legend */}
          <div
            style={{
              padding: '12px 16px',
              borderRadius: 8,
              background: 'var(--surface-subtle, rgba(0, 0, 0, 0.02))',
              border: '1px solid var(--border, #e0d8ce)',
              fontSize: 12,
              lineHeight: 1.5,
              color: 'var(--muted, #555)',
            }}
          >
            <div style={{ fontWeight: 'bold', color: 'var(--fg, #333)', marginBottom: 4 }}>
              {vi ? '📜 Điển Cố Thiên Văn Tiên Giới:' : '📜 Xianxia Astronomical Lore:'}
            </div>
            <ul style={{ margin: 0, paddingLeft: 18 }}>
              <li>
                <strong>{vi ? 'Thiên Can Địa Chi:' : 'Heavenly Stems & Earthly Branches:'}</strong>{' '}
                {vi
                  ? 'Gồm 10 Thiên Can (Giáp, Ất...) phối 12 Địa Chi (Tý, Sửu...) tạo 60 hoa giáp tuần hoàn.'
                  : 'Combines 10 Heavenly Stems and 12 Earthly Branches to form the 60-day Sexagenary cycle.'}
              </li>
              <li>
                <strong>{vi ? 'Chu Kỳ Tháng Âm:' : 'Lunar Month Cycle:'}</strong>{' '}
                {vi
                  ? 'Mỗi tháng có 28 ngày (4 tuần ứng với 4 mùa Xuân - Hạ - Thu - Đông).'
                  : 'Each lunar month spans 28 days (4 weeks corresponding to the 4 seasons).'}
              </li>
              <li>
                <strong>{vi ? 'Đêm Trăng Máu (Ngày 15):' : 'Blood Moon (Day 15):'}</strong>{' '}
                {vi
                  ? 'Mỗi chu kỳ 28 ngày, đúng ngày 15 xuất hiện Huyết Nguyệt — sát thương toàn cõi tăng +30%.'
                  : 'Every 28-day cycle, Day 15 triggers Blood Moon — realm-wide damage amplified by +30%.'}
              </li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}
