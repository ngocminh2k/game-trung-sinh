import type { BeatDef } from '../engine/content-types'

export const BEATS: BeatDef[] = [
  {
    id: 'b_arrival',
    chapter: 1,
    predicate: 'freshArrival',
    titleVi: 'Trọng sinh ở làng Thanh Mộc',
    titleEn: 'Reborn in Greenwood Village',
    textVi:
      'Ngươi mở mắt trên chiếc giường rơm quen thuộc. Kiếp trước kiếp này, linh căn vẫn cong queo như cũ. Nhưng hôm nay, giỏ herbs đã đan xong.',
    textEn:
      'You wake on the familiar straw bed. This life or the last, the spirit root stays crooked. But today, the herb basket is finally woven.',
    suggested: [
      { kind: 'move', direction: 'west' },
      { kind: 'talk', npcId: 'n_elder_meihua' },
      { kind: 'rest' },
    ],
  },
  {
    id: 'b_first_steps',
    chapter: 1,
    predicate: 'movedOnce',
    titleVi: 'Bước chân đầu tiên ra thế giới',
    titleEn: 'First Steps Into the World',
    textVi:
      'Đường đất còn vương sương. Ngươi nắm chặt túi tiền và lắng nghe tiếng chuông chợ từ phía tây.',
    textEn:
      'The road still holds the morning mist. You clutch your coin purse and listen to the market bell to the west.',
    suggested: [
      { kind: 'move', direction: 'south' },
      { kind: 'move', direction: 'west' },
      { kind: 'gather' },
    ],
  },
  {
    id: 'b_flawed_root',
    chapter: 2,
    predicate: 'gatheredSome',
    titleVi: 'Linh căn khuyết lên tiếng',
    titleEn: 'The Flawed Root Speaks Up',
    textVi:
      'Khí tuần hoàn lệch một nhịp, rồi hai. Linh căn hỗn tạp chỉ hút được một nửa công lực — nhưng nửa nào cũng thật.',
    textEn:
      'Your qi skips a beat, then another. The muddled root draws only half the usual power — but that half is honest.',
    suggested: [
      { kind: 'train' },
      { kind: 'use_item', itemId: 'pill_hp' },
      { kind: 'rest' },
    ],
  },
  {
    id: 'b_market_rumors',
    chapter: 2,
    predicate: 'marketSeenOrSold',
    titleVi: 'Tin đồn ở chợ Vân Tập',
    titleEn: 'Rumors at Cloudgather Market',
    textVi:
      'Giữa tiếng rao, ai đó thì thầm về hang phong ấn và một cuốn bí kíp dành cho linh căn dị biệt.',
    textEn:
      'Between hawkers\u2019 cries, someone whispers of a sealed cave and a manual for unconventional roots.',
    suggested: [
      { kind: 'accept_quest', questId: 'q_herb_delivery' },
      { kind: 'move', direction: 'east' },
      { kind: 'talk', npcId: 'n_merchant_bao' },
    ],
  },
  {
    id: 'b_herb_debt',
    chapter: 3,
    predicate: 'herbQuestDone',
    titleVi: 'Lời hứa với cụ Mai Hoa',
    titleEn: 'A Promise to Elder Meihua',
    textVi:
      'Cụ cười, răng ít nhưng mắt nhiều. Ba nhánh linh thảo, một lọ thuốc, một lời cảm ơn nặng hơn vàng.',
    textEn:
      'She smiles with few teeth and many eyes. Three herbs, one pill, a thanks heavier than gold.',
    suggested: [
      { kind: 'complete_quest', questId: 'q_herb_delivery' },
      { kind: 'gather' },
      { kind: 'sell', itemId: 'spirit_herb' },
    ],
  },
  {
    id: 'b_sealed_gate',
    chapter: 3,
    predicate: 'caveSeen',
    titleVi: 'Miệng hang thổi hơi lạnh',
    titleEn: 'Cold Breath From the Cave Mouth',
    textVi:
      'Phù hiệu cũ trên đá rung nhẹ. Cốc chủ nói đúng: mang bùa, hoặc mang vận may.',
    textEn:
      'Old sigils shiver on the stone. The hermit was right: bring a talisman, or bring luck.',
    suggested: [
      { kind: 'buy', itemId: 'warding_talisman' },
      { kind: 'move', direction: 'north' },
      { kind: 'move', direction: 'west' },
    ],
  },
  {
    id: 'b_inner_fire',
    chapter: 4,
    predicate: 'stageTwoPlus',
    titleVi: 'Lửa nhỏ trong đan điền',
    titleEn: 'A Small Fire in the Dantian',
    textVi:
      'Bí kíp cong queo dạy cách đi vòng quanh điểm gãy. Khí bắt đầu chịu ngoặt theo ngươi.',
    textEn:
      'The crooked manual teaches you to curve around the break. Your qi begins to bend your way.',
    suggested: [
      { kind: 'train' },
      { kind: 'draw_lottery' },
      { kind: 'use_item', itemId: 'pill_qi' },
    ],
  },
  {
    id: 'b_winds_of_trade',
    chapter: 4,
    predicate: 'tradeWinds',
    titleVi: 'Thương đạo cũng là đạo',
    titleEn: 'Trade Is Also a Path',
    textVi:
      'Tiếng chuông chợ, tiếng tính sổ, tiếng cười của người bán được hàng — tất cả đều dưỡng tâm.',
    textEn:
      'Bell, abacus, a seller\u2019s laughter — all of it nourishes the heart.',
    suggested: [
      { kind: 'sell', itemId: 'spirit_herb' },
      { kind: 'buy', itemId: 'jade_charm' },
      { kind: 'complete_quest', questId: 'q_talisman_order' },
    ],
  },
  {
    id: 'b_final_barrier',
    chapter: 5,
    predicate: 'stageFourPlus',
    titleVi: 'Cửa ải cuối cùng',
    titleEn: 'The Final Barrier',
    textVi:
      'Trên đỉnh mây, tiên hạc chờ. Một bước nữa thôi — bước này cần cả tĩnh lẫn động.',
    textEn:
      'On Cloud Peak a crane waits. One more step — a step needing both stillness and motion.',
    suggested: [
      { kind: 'train' },
      { kind: 'rest' },
      { kind: 'complete_quest', questId: 'q_sealed_cave' },
    ],
  },
  {
    id: 'b_ascension_night',
    chapter: 5,
    predicate: 'always',
    titleVi: 'Đêm nay trời mở cửa',
    titleEn: 'Tonight Heaven Opens Its Door',
    textVi:
      'Mưa sao rơi nghiêng. Ngươi ngồi xuống, không còn gì để chứng minh ngoài việc bước tiếp.',
    textEn:
      'Star-rain falls slantwise. You sit down with nothing left to prove except the next step.',
    suggested: [
      { kind: 'train' },
      { kind: 'rest' },
      { kind: 'draw_lottery' },
    ],
  },
]
