import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'

describe('GameScreen', () => {
  it('renders the playable map, three story choices, and a free-form command field', () => {
    const markup = renderToStaticMarkup(
      <GameScreen
        game={newGame('screen-test')}
        locale="vi"
        chronicle={['Ngươi tỉnh dậy với linh căn cong queo.']}
        onAction={() => undefined}
        onLocaleChange={() => undefined}
      />,
    )

    expect(markup).toContain('Bản đồ hành trình')
    expect(markup).toContain('Lựa chọn của ngươi')
    expect(markup).toContain('Viết hành động khác')
    expect(markup).toContain('Phế Căn Ký')
    expect(markup).toContain('Bản đồ thế giới tu tiên')
    expect(markup).toContain('Tư thế nhân vật: idle')
    expect(markup).toContain('Những gương mặt của giang hồ')
    expect(markup).toContain('Bộ sưu tập vật phẩm tu tiên')
    expect(markup).toContain('Đạo đồ &amp; trang bị')
    expect(markup).toContain('Mộc Trượng Thức')
    expect(markup).toContain('Mộc Trượng Cũ')
    expect(markup).toContain('Minh họa Mộc Trượng Cũ')
    expect(markup).toContain('Minh họa Linh Căn Lì Lợm')
    expect(markup).toContain('Minh họa Mộc Trượng Thức')
    expect(markup).toContain('data-npc-id="n_elder_meihua"')
    expect((markup.match(/npc-portrait-card/g) ?? [])).toHaveLength(6)
  })

})
