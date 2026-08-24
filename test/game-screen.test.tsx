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
  })
})
