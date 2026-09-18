import { describe, expect, it } from 'vitest'
import { getSceneText, toConciseText, SCENE_CONCISE_TEXTS } from '../src/engine/concise'
import { DEFAULT_SETTINGS, loadSettings, saveSettings } from '../src/ui/session'
import type { StorySceneDef } from '../src/engine/content-types'

describe('C3-18: Concise Mode Domain Logic & Settings', () => {
  describe('DEFAULT_SETTINGS & Session persistence', () => {
    it('defaults conciseMode to false in DEFAULT_SETTINGS', () => {
      expect(DEFAULT_SETTINGS.conciseMode).toBe(false)
    })

    it('parses and persists conciseMode true in storage', () => {
      const storageMap: Record<string, string> = {}
      const mockStorage = {
        get: (k: string) => storageMap[k] ?? null,
        set: (k: string, v: string) => { storageMap[k] = v },
      }

      // Default load
      const initial = loadSettings(mockStorage)
      expect(initial.conciseMode).toBe(false)

      // Save with conciseMode = true
      saveSettings(mockStorage, { ...initial, conciseMode: true })
      const reloaded = loadSettings(mockStorage)
      expect(reloaded.conciseMode).toBe(true)
    })

    it('safely handles missing or corrupted conciseMode', () => {
      const mockStorage = {
        get: () => JSON.stringify({ difficulty: 'hard', narrationEnabled: true }),
        set: () => {},
      }
      const loaded = loadSettings(mockStorage)
      expect(loaded.conciseMode).toBe(false)
    })
  })

  describe('toConciseText', () => {
    it('returns short text unmodified (<= 100 chars)', () => {
      const short = 'Ngươi nghỉ ngơi tại quán trọ.'
      expect(toConciseText(short, 'vi')).toBe(short)
    })

    it('condenses long multi-sentence narrative down to 2 punchy sentences', () => {
      const longProse =
        'Gió lạnh thổi qua hàng trúc rậm rạp bên bờ suối vắng. Một bóng người áo trắng thoắt ẩn thoắt hiện trong làn sương mù dày đặc. Ngươi nghe thấy tiếng kiếm ngân vang rất khẽ bên tai. Dường như nguy hiểm đang rình rập từng bước chân của ngươi.'
      const concise = toConciseText(longProse, 'vi')
      expect(concise.length).toBeLessThan(longProse.length)
      // Exactly 2 sentences
      expect(concise.split(/(?<=[.!?])\s+/).length).toBe(2)
      expect(concise).toContain('Gió lạnh thổi qua hàng trúc')
      expect(concise).toContain('Một bóng người áo trắng thoắt ẩn thoắt hiện')
    })

    it('works identically on English prose', () => {
      const longEn =
        'The cold wind howls across the bamboo grove. A white shadow flits through the dense mountain mist. You hear the faint hum of a sword unsheathed nearby. Danger lurks around every stone on this path.'
      const concise = toConciseText(longEn, 'en')
      expect(concise.length).toBeLessThan(longEn.length)
      expect(concise.split(/(?<=[.!?])\s+/).length).toBe(2)
    })
  })

  describe('getSceneText', () => {
    const mockScene: StorySceneDef = {
      id: 'letter_at_dawn',
      chapter: 1,
      titleVi: 'Lá thư không có người gửi',
      titleEn: 'The Letter With No Sender',
      textVi:
        'Trước cổng làng, một phong thư mang nét chữ của chính ngươi ở kiếp trước: “Đừng tin kẻ gọi ngươi là đồ phế.” Bên trong là nửa bản đồ dẫn tới hang Phong Ấn và chiếc trâm ngọc đã mất của cụ Mai Hoa.',
      textEn:
        'At the village gate lies a letter in your past-life hand: “Do not trust anyone who calls you broken.” Inside: half a map to the Sealed Cave and Elder Meihua’s missing jade pin.',
      choices: [],
    }

    it('returns full prose when conciseMode is false', () => {
      expect(getSceneText(mockScene, 'vi', false)).toBe(mockScene.textVi)
      expect(getSceneText(mockScene, 'en', false)).toBe(mockScene.textEn)
    })

    it('returns curated concise summary for canonical scenes when conciseMode is true', () => {
      const conciseVi = getSceneText(mockScene, 'vi', true)
      const conciseEn = getSceneText(mockScene, 'en', true)

      expect(conciseVi).toBe(SCENE_CONCISE_TEXTS.letter_at_dawn?.vi)
      expect(conciseEn).toBe(SCENE_CONCISE_TEXTS.letter_at_dawn?.en)
      expect(conciseVi.length).toBeLessThan(mockScene.textVi.length)
      expect(conciseEn.length).toBeLessThan(mockScene.textEn.length)
    })

    it('prefers scene.conciseVi / scene.conciseEn if explicitly defined', () => {
      const customScene: StorySceneDef = {
        ...mockScene,
        id: 'custom_scene_test',
        conciseVi: 'Tóm tắt cảnh tùy biến tiếng Việt.',
        conciseEn: 'Custom scene English summary.',
      }
      expect(getSceneText(customScene, 'vi', true)).toBe('Tóm tắt cảnh tùy biến tiếng Việt.')
      expect(getSceneText(customScene, 'en', true)).toBe('Custom scene English summary.')
    })

    it('falls back to toConciseText for unmapped scenes without explicit concise fields', () => {
      const unknownScene: StorySceneDef = {
        id: 'unknown_scene',
        chapter: 9,
        titleVi: 'Cảnh lạ',
        titleEn: 'Strange Scene',
        textVi:
          'Bầu trời nổi sấm chớp dữ dội không ngừng. Lôi kiếp đầu tiên giáng xuống ngọn đồi hoang vu. Khí tức cuồn cuộn làm vỡ tung các tảng đá xung quanh.',
        textEn:
          'Lightning tore through the blackened skies above. The first tribulation bolt struck the barren hill. The surging shockwave shattered ancient boulders all around.',
        choices: [],
      }
      const conciseVi = getSceneText(unknownScene, 'vi', true)
      expect(conciseVi).toBe(toConciseText(unknownScene.textVi, 'vi'))
    })
  })
})
