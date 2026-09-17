import type { StorySceneDef } from './content-types'
import type { Locale } from './types'

/**
 * C3-18: Concise Mode (Chế Độ Tóm Tắt) cho người chơi mệt mỏi sau giờ làm (Persona p20).
 * Rút gọn các đoạn văn xuôi dài 200 chữ xuống 1–2 câu cốt lõi (hành động + kết quả).
 */

export const SCENE_CONCISE_TEXTS: Record<string, { vi: string; en: string }> = {
  letter_at_dawn: {
    vi: 'Trước cổng làng, phong thư kiếp trước trao ngươi nửa bản đồ hang Phong Ấn và trâm ngọc cụ Mai Hoa.',
    en: 'At the village gate, a letter from your past life yields half the Sealed Cave map and Elder Meihua’s jade pin.',
  },
  market_rumor: {
    vi: 'Bà Ma báo đêm thứ mười hai làng sẽ quên một người; Bảo muốn mua bản đồ còn Ngô nói tên bị quên là ngươi.',
    en: 'Granny Ma warns someone will be forgotten tonight; Bao wants the map while Ngo says the forgotten name is yours.',
  },
  village_vow: {
    vi: 'Mai Hoa giao dây đỏ buộc tên từng nhà lên cổng để giữ lại ký ức trước khi sương mù bao phủ.',
    en: 'Meihua gives you red thread to tie each household’s name to their gate before mist consumes them.',
  },
  market_bargain: {
    vi: 'Bảo đổi bùa hộ thân nứt góc lấy quyền dẫn ngươi vào hang Phong Ấn qua lối sau chợ.',
    en: 'Bao trades a chipped ward for the right to guide you to the Sealed Cave through back alleys.',
  },
  memory_trail: {
    vi: 'Ngô dùng bảy chén trà ký ức giúp linh căn phế lần theo cái tên bị gạch xóa của ngươi.',
    en: 'Ngo arranges seven cups of memory, helping your broken root trace your erased name.',
  },
  cave_witness: {
    vi: 'Vong hồn Hà tại hang Phong Ấn tiết lộ Tông chủ Võ dùng gương giam giữ ký ức cả làng.',
    en: 'Ha’s spirit in the Sealed Cave reveals Master Vo sealed the village memories inside a mirror.',
  },
  sect_trial: {
    vi: 'Tông chủ Võ thừa nhận xóa ký ức thảm sát; ngươi phải chọn phơi bày sự thật hay giữ kín vì trật tự.',
    en: 'Master Vo admits erasing the massacre; choose to expose the truth or seal it for order.',
  },
  mirror_choice: {
    vi: 'Chiếc gương hé lộ chính ngươi kiếp trước đã xin xóa ký ức sau cái chết của Hà.',
    en: 'The mirror reveals you yourself asked to erase the memories after Ha died.',
  },
  last_page: {
    vi: 'Ngươi đứng trước quyết định cuối cùng về chiếc gương ký ức và con đường bước lên Đỉnh Mây.',
    en: 'You face the final choice regarding the memory mirror and the ascent to Cloud Peak.',
  },
}

/**
 * Rút gọn đoạn văn tùy ý xuống tối đa 2 câu hành động súc tích.
 * ponytail: sentence regex splitter split on terminal punctuation; upgrade path: NLP sentence segmenter if text includes abbreviations.
 */
export function toConciseText(text: string, _locale: Locale): string {
  if (!text || text.length <= 100) return text
  const sentences = text
    .split(/(?<=[.!?])\s+/)
    .map((s) => s.trim())
    .filter(Boolean)
  if (sentences.length <= 2) return text
  return sentences.slice(0, 2).join(' ')
}

/**
 * Trả về nội dung mô tả cảnh cốt truyện phù hợp với thiết lập Concise Mode.
 */
export function getSceneText(scene: StorySceneDef, locale: Locale, conciseMode: boolean): string {
  if (!conciseMode) {
    return locale === 'vi' ? scene.textVi : scene.textEn
  }
  if (locale === 'vi' && scene.conciseVi) return scene.conciseVi
  if (locale === 'en' && scene.conciseEn) return scene.conciseEn

  const override = SCENE_CONCISE_TEXTS[scene.id]
  if (override !== undefined) {
    return locale === 'vi' ? override.vi : override.en
  }

  return toConciseText(locale === 'vi' ? scene.textVi : scene.textEn, locale)
}
