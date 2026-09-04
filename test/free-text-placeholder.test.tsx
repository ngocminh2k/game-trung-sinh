import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'
import { newGame } from '../src/engine'
import { GameScreen } from '../src/ui/GameScreen'

describe('free-text placeholder cycling (P1-7)', () => {
  it('renders a Vietnamese placeholder hint when the story panel is open', () => {
    const markup = renderToStaticMarkup(
      <GameScreen
        game={newGame('placeholder-vi')}
        locale="vi"
        chronicle={[]}
        onAction={() => undefined}
        onLocaleChange={() => undefined}
        storyOpen
      />,
    )
    expect(markup).toMatch(/placeholder="(tu luyện|đi bắc|nói chuyện với Mai Hoa)"/)
  })

  it('renders an English placeholder hint when the locale is en', () => {
    const markup = renderToStaticMarkup(
      <GameScreen
        game={newGame('placeholder-en')}
        locale="en"
        chronicle={[]}
        onAction={() => undefined}
        onLocaleChange={() => undefined}
        storyOpen
      />,
    )
    expect(markup).toMatch(/placeholder="(train|go north|talk to Meihua)"/)
  })

  it('the placeholder is one of the three locale-tagged examples', () => {
    const examples: Record<'vi' | 'en', string[]> = {
      vi: ['tu luyện', 'đi bắc', 'nói chuyện với Mai Hoa'],
      en: ['train', 'go north', 'talk to Meihua'],
    }
    for (const locale of ['vi', 'en'] as const) {
      const markup = renderToStaticMarkup(
        <GameScreen
          game={newGame(`placeholder-${locale}`)}
          locale={locale}
          chronicle={[]}
          onAction={() => undefined}
          onLocaleChange={() => undefined}
          storyOpen
        />,
      )
      const match = markup.match(/placeholder="([^"]*)"/)
      expect(match).not.toBeNull()
      expect(examples[locale]).toContain(match![1])
    }
  })
})