import { useState, useEffect } from 'react'
import type { GameState, Locale, Action } from '../engine'
import {
  OUTFITS,
  TITLES,
  OUTFIT_TITLE_SYNERGIES,
  getOutfit,
  getTitle,
  getActiveSynergy,
  canBuyOutfit,
  isTitleUnlocked,
} from '../engine/outfits'

interface Props {
  show: boolean
  game: GameState
  locale: Locale
  onAction: (action: Action) => void
  onClose: () => void
}

export function OutfitTitleModal({ show, game, locale, onAction, onClose }: Props): JSX.Element | null {
  const [activeTab, setActiveTab] = useState<'outfits' | 'titles' | 'resonance'>('outfits')

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
  const activeOutfit = game.activeOutfitId ? getOutfit(game.activeOutfitId) : null
  const activeTitle = game.activeTitleId ? getTitle(game.activeTitleId) : null
  const activeSynergy = getActiveSynergy(game)
  const ownedOutfits = game.unlockedOutfits ?? []

  const formatPrice = (currency: string, amount: number) => {
    if (currency === 'silver') return `${amount} ${vi ? 'Bạc' : 'Silver'}`
    if (currency === 'gold') return `${amount} ${vi ? 'Vàng' : 'Gold'}`
    return `${amount} ${vi ? 'Linh Thạch' : 'Spirit Stones'}`
  }

  return (
    <div
      className="proto-modal-backdrop show"
      onClick={onClose}
      style={{ zIndex: 125 }}
      role="presentation"
    >
      <div
        className="proto-modal outfit-title-modal"
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-label={vi ? 'Ngoại Trang & Danh Hiệu' : 'Outfits & Titles'}
        style={{
          width: 'min(920px, 95vw)',
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
              <span>👘</span>
              <span>{vi ? 'Ngoại Trang & Danh Hiệu' : 'Outfits & Titles'}</span>
            </h2>
            <div style={{ fontSize: 12, color: 'var(--muted, #666)', marginTop: 3 }}>
              {vi
                ? 'Tương tác Ngoại Trang × Danh Hiệu · Khí phách tu tiên · 0 chỉ số chiến đấu (Chuẩn E4)'
                : 'Outfit × Title Synergy · Xianxia Cosmetic Flair · Zero Combat Stats (E4 Standard)'}
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label={vi ? 'Đóng' : 'Close'}
            data-testid="outfit-modal-close-btn"
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

        {/* E4 Invariant Banner */}
        <div
          data-testid="e4-badge"
          style={{
            background: 'oklch(96% 0.03 95)',
            borderBottom: '1px solid oklch(85% 0.05 95)',
            padding: '7px 20px',
            fontSize: 12,
            color: 'oklch(40% 0.09 95)',
            display: 'flex',
            alignItems: 'center',
            gap: 8,
          }}
        >
          <span>⚖</span>
          <span>
            {vi
              ? 'Quy chuẩn E4: Tất cả ngoại trang & danh hiệu có 0 chỉ số công thủ, thuần túy thẩm mỹ và phong thái tiên phong.'
              : 'E4 Invariant: All cosmetics have 0 combat stats. Strictly aesthetic flair, identity prestige, and social charm.'}
          </span>
        </div>

        {/* Active Loadout & Synergy Bar */}
        <div
          style={{
            padding: '12px 20px',
            borderBottom: '1px solid var(--border, #e0d8cc)',
            background: 'var(--surface-subtle, #f7f4ee)',
            display: 'flex',
            flexWrap: 'wrap',
            gap: 16,
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            {/* Active Outfit */}
            <div data-testid="active-outfit-badge" style={{ fontSize: 13 }}>
              <span style={{ color: 'var(--muted, #777)', marginRight: 6 }}>{vi ? 'Ngoại trang:' : 'Outfit:'}</span>
              <strong>{activeOutfit ? (vi ? activeOutfit.nameVi : activeOutfit.nameEn) : (vi ? 'Chưa mặc' : 'None')}</strong>
            </div>

            {/* Active Title */}
            <div data-testid="active-title-badge" style={{ fontSize: 13 }}>
              <span style={{ color: 'var(--muted, #777)', marginRight: 6 }}>{vi ? 'Danh hiệu:' : 'Title:'}</span>
              <strong>
                {activeTitle ? (
                  <span style={{ color: 'var(--wine, #8b1e2f)' }}>
                    [{vi ? activeTitle.prefixVi : activeTitle.prefixEn}] {vi ? activeTitle.nameVi : activeTitle.nameEn}
                  </span>
                ) : (
                  (vi ? 'Chưa đeo' : 'None')
                )}
              </strong>
            </div>
          </div>

          {/* Resonance Status */}
          {activeSynergy ? (
            <div
              data-testid="synergy-banner"
              style={{
                background: 'oklch(94% 0.08 140)',
                border: '1px solid oklch(75% 0.14 140)',
                color: 'oklch(30% 0.1 140)',
                padding: '4px 10px',
                borderRadius: 6,
                fontSize: 12,
                fontWeight: 'bold',
                display: 'flex',
                alignItems: 'center',
                gap: 6,
              }}
            >
              <span>✨</span>
              <span>
                {vi ? 'Cộng hưởng:' : 'Resonance:'} {vi ? activeSynergy.nameVi : activeSynergy.nameEn}
              </span>
            </div>
          ) : (
            <div style={{ fontSize: 12, color: 'var(--muted, #888)' }}>
              {vi ? 'Chưa kích hoạt cộng hưởng' : 'No resonance active'}
            </div>
          )}
        </div>

        {/* Navigation Tabs */}
        <div
          style={{
            display: 'flex',
            borderBottom: '1px solid var(--border, #d8d0c5)',
            background: 'var(--surface-header, rgba(0,0,0,0.02))',
          }}
        >
          <button
            type="button"
            onClick={() => setActiveTab('outfits')}
            data-testid="tab-outfits"
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeTab === 'outfits' ? '2px solid var(--wine, #8b1e2f)' : '2px solid transparent',
              background: 'transparent',
              fontWeight: activeTab === 'outfits' ? 'bold' : 'normal',
              color: activeTab === 'outfits' ? 'var(--wine, #8b1e2f)' : 'inherit',
              cursor: 'pointer',
            }}
          >
            👘 {vi ? 'Ngoại Trang' : 'Outfits'} ({ownedOutfits.length}/{OUTFITS.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('titles')}
            data-testid="tab-titles"
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeTab === 'titles' ? '2px solid var(--wine, #8b1e2f)' : '2px solid transparent',
              background: 'transparent',
              fontWeight: activeTab === 'titles' ? 'bold' : 'normal',
              color: activeTab === 'titles' ? 'var(--wine, #8b1e2f)' : 'inherit',
              cursor: 'pointer',
            }}
          >
            🏅 {vi ? 'Danh Hiệu' : 'Titles'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('resonance')}
            data-testid="tab-resonance"
            style={{
              padding: '10px 18px',
              border: 'none',
              borderBottom: activeTab === 'resonance' ? '2px solid var(--wine, #8b1e2f)' : '2px solid transparent',
              background: 'transparent',
              fontWeight: activeTab === 'resonance' ? 'bold' : 'normal',
              color: activeTab === 'resonance' ? 'var(--wine, #8b1e2f)' : 'inherit',
              cursor: 'pointer',
            }}
          >
            ✨ {vi ? 'Cộng Hưởng' : 'Resonances'}
          </button>
        </div>

        {/* Tab Body */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '16px 20px' }}>
          {activeTab === 'outfits' && (
            <div data-testid="outfits-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {OUTFITS.map((outfit) => {
                const isOwned = ownedOutfits.includes(outfit.id)
                const isEquipped = game.activeOutfitId === outfit.id
                const afford = canBuyOutfit(game, outfit.id)
                const synergyTitle = getTitle(outfit.synergyTitleId)

                return (
                  <div
                    key={outfit.id}
                    data-testid={`outfit-card-${outfit.id}`}
                    style={{
                      border: isEquipped
                        ? '2px solid var(--wine, #8b1e2f)'
                        : isOwned
                        ? '1px solid var(--border, #d8d0c5)'
                        : '1px dashed var(--border, #bbb)',
                      background: isEquipped ? 'oklch(97% 0.02 25)' : 'var(--surface, #fff)',
                      borderRadius: 8,
                      padding: '12px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ fontSize: 16, fontWeight: 'bold' }}>
                          {vi ? outfit.nameVi : outfit.nameEn}
                        </span>
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 11,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'var(--surface-header, #f0eae1)',
                            color: 'var(--muted, #555)',
                          }}
                        >
                          {outfit.rarity}
                        </span>
                      </div>
                      <div style={{ fontSize: 13, fontWeight: 'bold' }}>
                        {isOwned ? (
                          <span style={{ color: 'var(--moss, #2e6b30)' }}>{vi ? 'Đã sở hữu' : 'Owned'}</span>
                        ) : (
                          <span style={{ color: 'var(--wine, #8b1e2f)' }}>
                            {formatPrice(outfit.price.currency, outfit.price.amount)}
                          </span>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: 12.5, color: 'var(--muted, #555)' }}>
                      {vi ? outfit.descVi : outfit.descEn}
                    </div>

                    {synergyTitle && (
                      <div style={{ fontSize: 11.5, color: 'var(--blue, #245882)' }}>
                        🔗 {vi ? 'Cộng hưởng với danh hiệu:' : 'Resonates with title:'}{' '}
                        <strong>{vi ? synergyTitle.nameVi : synergyTitle.nameEn}</strong>
                      </div>
                    )}

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      {isOwned ? (
                        <button
                          type="button"
                          data-testid={`equip-outfit-${outfit.id}`}
                          onClick={() => onAction({ kind: 'equip_outfit', outfitId: isEquipped ? null : outfit.id })}
                          style={{
                            padding: '5px 14px',
                            borderRadius: 5,
                            border: '1px solid var(--border, #ccc)',
                            background: isEquipped ? 'var(--wine, #8b1e2f)' : 'var(--surface, #fff)',
                            color: isEquipped ? '#fff' : 'var(--fg, #222)',
                            cursor: 'pointer',
                            fontSize: 12.5,
                            fontWeight: 'bold',
                          }}
                        >
                          {isEquipped ? (vi ? 'Đang Mặc (Tháo Ra)' : 'Equipped (Unequip)') : (vi ? 'Mặc Lên' : 'Equip')}
                        </button>
                      ) : (
                        <button
                          type="button"
                          data-testid={`buy-outfit-${outfit.id}`}
                          disabled={!afford.ok}
                          onClick={() => onAction({ kind: 'buy_outfit', outfitId: outfit.id })}
                          style={{
                            padding: '5px 14px',
                            borderRadius: 5,
                            border: '1px solid var(--wine, #8b1e2f)',
                            background: afford.ok ? 'var(--wine, #8b1e2f)' : '#ccc',
                            color: '#fff',
                            cursor: afford.ok ? 'pointer' : 'not-allowed',
                            fontSize: 12.5,
                            fontWeight: 'bold',
                          }}
                        >
                          {afford.ok
                            ? vi
                              ? `Mua (${formatPrice(outfit.price.currency, outfit.price.amount)})`
                              : `Buy (${formatPrice(outfit.price.currency, outfit.price.amount)})`
                            : vi
                            ? 'Không đủ tiền'
                            : 'Insufficient funds'}
                        </button>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'titles' && (
            <div data-testid="titles-list" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {TITLES.map((title) => {
                const isUnlocked = isTitleUnlocked(game, title.id)
                const isEquipped = game.activeTitleId === title.id

                return (
                  <div
                    key={title.id}
                    data-testid={`title-card-${title.id}`}
                    style={{
                      border: isEquipped
                        ? '2px solid var(--wine, #8b1e2f)'
                        : isUnlocked
                        ? '1px solid var(--border, #d8d0c5)'
                        : '1px dashed var(--border, #bbb)',
                      background: isEquipped ? 'oklch(97% 0.02 25)' : 'var(--surface, #fff)',
                      borderRadius: 8,
                      padding: '12px 16px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div>
                        <span style={{ color: 'var(--wine, #8b1e2f)', fontWeight: 'bold', marginRight: 6 }}>
                          [{vi ? title.prefixVi : title.prefixEn}]
                        </span>
                        <span style={{ fontSize: 16, fontWeight: 'bold' }}>
                          {vi ? title.nameVi : title.nameEn}
                        </span>
                        <span
                          style={{
                            marginLeft: 8,
                            fontSize: 11,
                            padding: '2px 6px',
                            borderRadius: 4,
                            background: 'var(--surface-header, #f0eae1)',
                            color: 'var(--muted, #555)',
                          }}
                        >
                          {title.rarity}
                        </span>
                      </div>
                      <div style={{ fontSize: 12.5 }}>
                        {isUnlocked ? (
                          <span style={{ color: 'var(--moss, #2e6b30)', fontWeight: 'bold' }}>
                            {vi ? 'Đã mở khóa' : 'Unlocked'}
                          </span>
                        ) : (
                          <span style={{ color: 'var(--muted, #888)' }}>{vi ? 'Chưa mở khóa' : 'Locked'}</span>
                        )}
                      </div>
                    </div>

                    <div style={{ fontSize: 12.5, color: 'var(--muted, #555)' }}>
                      {vi ? title.descVi : title.descEn}
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 4 }}>
                      <button
                        type="button"
                        data-testid={`equip-title-${title.id}`}
                        disabled={!isUnlocked}
                        onClick={() => onAction({ kind: 'equip_title', titleId: isEquipped ? null : title.id })}
                        style={{
                          padding: '5px 14px',
                          borderRadius: 5,
                          border: '1px solid var(--border, #ccc)',
                          background: isEquipped
                            ? 'var(--wine, #8b1e2f)'
                            : isUnlocked
                            ? 'var(--surface, #fff)'
                            : '#eee',
                          color: isEquipped ? '#fff' : isUnlocked ? 'var(--fg, #222)' : '#999',
                          cursor: isUnlocked ? 'pointer' : 'not-allowed',
                          fontSize: 12.5,
                          fontWeight: 'bold',
                        }}
                      >
                        {isEquipped ? (vi ? 'Đang Đeo (Gỡ Ra)' : 'Equipped (Unequip)') : (vi ? 'Đeo Lên' : 'Equip')}
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {activeTab === 'resonance' && (
            <div data-testid="resonance-list" style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <div style={{ fontSize: 13, color: 'var(--muted, #555)' }}>
                {vi
                  ? 'Khi trang bị đồng thời Ngoại Trang và Danh Hiệu tương hợp, sẽ kích hoạt hiệu ứng cộng hưởng huyền cơ.'
                  : 'Equipping a matching Outfit and Title simultaneously triggers mystical resonance and non-combat perks.'}
              </div>

              {OUTFIT_TITLE_SYNERGIES.map((syn) => {
                const outfit = getOutfit(syn.outfitId)
                const title = getTitle(syn.titleId)
                const isActive = game.activeOutfitId === syn.outfitId && game.activeTitleId === syn.titleId

                return (
                  <div
                    key={syn.id}
                    data-testid={`resonance-card-${syn.id}`}
                    style={{
                      border: isActive ? '2px solid oklch(65% 0.18 140)' : '1px solid var(--border, #d8d0c5)',
                      background: isActive ? 'oklch(98% 0.04 140)' : 'var(--surface, #fff)',
                      borderRadius: 8,
                      padding: '14px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: 8,
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ fontSize: 18 }}>✨</span>
                        <span style={{ fontSize: 16, fontWeight: 'bold' }}>
                          {vi ? syn.nameVi : syn.nameEn}
                        </span>
                      </div>
                      {isActive && (
                        <span
                          style={{
                            background: 'oklch(70% 0.18 140)',
                            color: '#fff',
                            fontSize: 11,
                            padding: '3px 8px',
                            borderRadius: 4,
                            fontWeight: 'bold',
                          }}
                        >
                          {vi ? 'ĐANG KÍCH HOẠT' : 'ACTIVE NOW'}
                        </span>
                      )}
                    </div>

                    <div style={{ fontSize: 12.5, color: 'var(--muted, #555)', fontStyle: 'italic' }}>
                      "{vi ? syn.flavorVi : syn.flavorEn}"
                    </div>

                    <div
                      style={{
                        display: 'grid',
                        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
                        gap: 8,
                        background: 'var(--surface-header, rgba(0,0,0,0.02))',
                        padding: 10,
                        borderRadius: 6,
                        fontSize: 12,
                      }}
                    >
                      <div>
                        👘 {vi ? 'Ngoại trang:' : 'Outfit:'}{' '}
                        <strong>{outfit ? (vi ? outfit.nameVi : outfit.nameEn) : syn.outfitId}</strong>
                      </div>
                      <div>
                        🏅 {vi ? 'Danh hiệu:' : 'Title:'}{' '}
                        <strong>{title ? (vi ? title.nameVi : title.nameEn) : syn.titleId}</strong>
                      </div>
                      <div>
                        💖 {vi ? 'Quyến rũ (Charm):' : 'Charm:'} <strong>+{syn.buffs.charmBonus}</strong>
                      </div>
                      <div>
                        🛒 {vi ? 'Giảm giá thương quán:' : 'Shop discount:'}{' '}
                        <strong>{syn.buffs.shopDiscountPct}%</strong>
                      </div>
                      <div>
                        🏃 {vi ? 'Giảm thể lực du ngoạn:' : 'Travel fatigue:'}{' '}
                        <strong>-{syn.buffs.travelStaminaReductionPct}%</strong>
                      </div>
                      <div>
                        🌟 {vi ? 'Hào quang động:' : 'Aura flair:'}{' '}
                        <strong>{syn.buffs.visualAura}</strong>
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
