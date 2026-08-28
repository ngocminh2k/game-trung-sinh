import type { GameState, Locale } from '../engine'

function word(locale: Locale, vi: string, en: string): string {
  return locale === 'vi' ? vi : en
}

const OUTCOME: Record<string, { vi: string; en: string }> = {
  rootless_star: { vi: 'Gương được mở. Những ký ức trở về không hiền lành, nhưng lần đầu tiên chúng thuộc về chính những người đã sống qua chúng.', en: 'The mirror opens. The returning memories are not gentle, but for the first time they belong to the people who lived them.' },
  rift_kingdom: { vi: 'Ngươi giữ gương như giữ một vương triều nhỏ: mọi lời thề đều có người nhớ, và mọi im lặng đều có giá.', en: 'You keep the mirror like a small kingdom: every oath is remembered and every silence has a price.' },
  borrowed_face: { vi: 'Ký ức cũ đứng vào hàng ngũ của ngươi. Nó cho sức mạnh, và mỗi lần soi gương, nó đòi được gọi bằng tên riêng.', en: 'The old memory falls into step with you. It gives strength, and every time you look in a mirror it demands its own name.' },
  city_of_ghosts: { vi: 'Chợ vẫn mở, vàng vẫn chảy, nhưng có những câu chuyện không chịu yên ngay cả khi đã được mua đúng giá.', en: 'The market stays open and gold still moves, but some stories refuse to rest even when bought at the right price.' },
  iron_lantern: { vi: 'Gương được canh giữ dưới ngọn đèn sắt. Nó không cứu được quá khứ, nhưng không ai còn được phép một mình khóa nó lại.', en: 'The mirror is guarded beneath an iron lantern. It cannot save the past, but no one may lock it away alone again.' },
  forgiven_enemy: { vi: 'Không phải ai cũng tha thứ, nhưng Khoa ở lại khi những người khác bỏ đi. Có lẽ đó là khởi đầu đủ thật cho một đạo lữ chưa được gọi tên.', en: 'Not everyone forgives, but Khoa stays when the others leave. Perhaps that is a real enough beginning for a bond not yet named.' },
  keeper_of_names: { vi: 'Tên của người chết được chép lại, tên của người sống được gọi đúng. Lần này không ai phải biến mất để làng được yên.', en: 'The dead are written down and the living are called by their true names. This time no one has to vanish for the village to be calm.' },
  jade_heir: { vi: 'Ngươi không nhận một ngai vàng. Ngươi nhận việc khó hơn: để những người còn lại tự quyết định ký ức của mình.', en: 'You inherit no throne. You inherit something harder: letting those left behind decide their own memories.' },
  blank_page: { vi: 'Ngọn lửa ăn hết mặt gương, nhưng không ăn hết lời hứa. Một con đường mới mở ra, không có tiên tri đi trước để dọn sẵn.', en: 'The fire consumes the mirror but not the promise. A new road opens, with no prophecy walking ahead to clear it.' },
  quiet_harmony: { vi: 'Ngươi rời đi khi trời sáng. Sự bình yên này mỏng, nhưng lần đầu tiên nó được chọn chứ không bị áp xuống.', en: 'You leave at dawn. This peace is thin, but for the first time it is chosen instead of imposed.' },
  tragic_death: { vi: 'Kiếp này khép lại ở một ngã rẽ dang dở. Những người còn sống vẫn mang theo dấu lựa chọn ngươi đã làm.', en: 'This life closes at an unfinished turning. Those still living carry the mark of the choices you made.' },
}

export function endingEpilogue(game: GameState, locale: Locale): string[] {
  const outcome = OUTCOME[game.endingId ?? 'tragic_death'] ?? OUTCOME.quiet_harmony!
  const meihuaAndHa = game.flags.story_meihua_trusted === true
    ? game.flags.story_ha_free === true
      ? word(locale, 'Mai Hoa đặt trâm ngọc vào tay Hà, rồi bắt cả hai hứa sẽ trở về ăn cơm. Có những nghi lễ nhỏ đủ sức buộc một linh hồn ở lại.', 'Meihua puts the jade pin in Ha’s hand and makes you both promise to come home for supper. Some small rituals are strong enough to keep a soul close.')
      : word(locale, 'Mai Hoa vẫn giữ một chỗ trống trong bữa cơm. Hà không còn ở bên cạnh, nhưng tên cô không còn bị nói bằng giọng thì thầm.', 'Meihua still keeps an empty place at supper. Ha is not beside her, but her name is no longer spoken in a whisper.')
    : word(locale, 'Mai Hoa không tha thứ ngay. Bà chỉ đặt chiếc trâm lên bậc cửa, để ngươi nhớ có những lòng tin phải được trả dần bằng việc làm.', 'Meihua does not forgive at once. She only sets the pin on the doorstep, so you remember that some trust must be repaid in deeds.')
  const khoaAndVo = game.flags.story_khoa_trusted === true
    ? word(locale, 'Khoa giữ bản chép lời Hà, còn Võ lần đầu phải nghe người khác đọc lại điều mình từng xóa. Kẻ đối đầu của ngươi không thành bạn ngay, nhưng không còn đứng về phía sự im lặng.', 'Khoa keeps Ha’s transcript while Vo must hear others read what he erased. Your rival does not become a friend at once, but he no longer stands with silence.')
    : game.flags.story_vo_exposed === true
      ? word(locale, 'Võ cúi đầu trước tông môn; Khoa không nhìn ngươi. Giữa họ và ngươi vẫn còn một cây cầu chưa ai dám bước lên.', 'Vo bows before the sect; Khoa cannot look at you. Between all of you stands a bridge that no one yet dares to cross.')
      : word(locale, 'Võ mang phần ký ức còn lại đi khỏi chính điện, còn Khoa đứng lại ở bậc thềm. Cả hai đều biết cuộc xét xử chưa thật sự kết thúc.', 'Vo carries what remains of the memory out of the hall, and Khoa stays on the steps. Both know the trial has not truly ended.')
  const companionEcho = game.flags.story_meihua_companion === true
    ? word(locale, 'Mai Hoa giữ những sợi dây đỏ đã sờn trong hòm gỗ. Mỗi khi có người quên đường về, bà lại sai trẻ con buộc thêm một nút mới.', 'Meihua keeps the frayed red threads in a wooden box. Whenever someone forgets the way home, she sends the children to tie another knot.')
    : game.flags.story_bao_companion === true
      ? word(locale, 'Bảo treo chiếc bùa nứt trước quầy hàng. Ai hỏi nó bán bao nhiêu, hắn chỉ cười: “Có những thứ phải đi cùng chủ mới biết giá.”', 'Bao hangs the chipped ward above his stall. When asked its price, he only smiles: “Some things must travel with their owner before they know their worth.”')
      : game.flags.story_ngo_companion === true
        ? word(locale, 'Ngô viết lại câu chuyện lần này, chừa hẳn một trang cho những chỗ chưa ai dám gọi là kết thúc.', 'Ngo writes the story again, leaving a whole page for the parts no one yet dares call an ending.')
        : word(locale, 'Không ai đi cùng ngươi tới cuối đường, nhưng những dấu chân ngươi để lại vẫn buộc người khác phải chọn xem họ sẽ bước tiếp ra sao.', 'No one walks with you to the end, but the footprints you leave still force others to choose how they will go on.')
  return [word(locale, outcome.vi, outcome.en), meihuaAndHa, khoaAndVo, companionEcho]
}
