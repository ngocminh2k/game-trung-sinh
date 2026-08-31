import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { npcsAt } from '../src/content'
import { GameScreen } from '../src/ui/GameScreen'

describe('GameScreen', () => {
  it('keeps the playable surface visible and defers non-contextual systems into the dock', () => {
    const markup = renderToStaticMarkup(
      <GameScreen
        game={newGame('screen-test')}
        locale="vi"
        chronicle={['Ngươi tỉnh dậy với linh căn cong queo.']}
        onAction={() => undefined}
        onLocaleChange={() => undefined}
      />,
    )

    expect(markup).toContain('Bản đồ khu vực')
    expect(markup).toContain('regional-map')
    expect(markup).not.toContain('Lựa chọn của ngươi')
    expect(markup).not.toContain('Viết hành động khác')
    expect(markup).not.toContain('data-testid="narration-panel"')
    expect(markup).toContain('Phế Căn Ký')
    expect(markup).toContain('Bản đồ khu vực có lối ra và điểm sự kiện')
    expect(markup).not.toContain('Mạch truyện')
    expect(markup).toContain('Độ tương hợp')
    expect(markup).not.toContain('deterministic')
    expect(markup).toContain('Tư thế nhân vật: idle')
    expect(markup).toContain('Hành trang &amp; giang hồ')
    expect(markup).toContain('role="tablist"')
    expect(markup).toContain('Những gương mặt của giang hồ')
    expect(markup).toContain('data-npc-id="n_elder_meihua"')
    expect((markup.match(/npc-portrait-card/g) ?? [])).toHaveLength(npcsAt('village').length)
    expect(markup).not.toContain('Bộ sưu tập vật phẩm tu tiên')
    expect(markup).not.toContain('Mộc Trượng Thức')
    expect(markup).not.toContain('Minh họa Mộc Trượng Cũ')
    expect(markup).not.toContain('Minh họa Linh Căn Lì Lợm')
  })

  it('shows the narration panel only while an interaction is active', () => {
    const markup = renderToStaticMarkup(
      <GameScreen
        game={newGame('screen-interaction-test')}
        locale="vi"
        chronicle={['Cụ Mai Hoa khép cuốn sổ cũ.']}
        onAction={() => undefined}
        onLocaleChange={() => undefined}
        storyOpen
      />,
    )

    expect(markup).toContain('data-testid="narration-panel"')
    expect(markup).toContain('Lựa chọn của ngươi')
    expect(markup).toContain('Viết hành động khác')
    expect(markup).toContain('Tiếp tục')
  })

})
