import type { BeatDef } from '../engine/content-types'

export const BEATS: BeatDef[] = [
  {
    id: 'b_arrival',
    chapter: 1,
    predicate: 'freshArrival',
    titleVi: 'Trọng sinh ở làng Thanh Mộc',
    titleEn: 'Reborn in Greenwood Village',
    textVi:
      'Ngươi mở mắt trên chiếc giường rơm quen thuộc. Qua một kiếp, linh căn vẫn phế như xưa; chỉ có lòng ngươi không còn chịu cúi đầu. Bên cửa, chiếc giỏ hái thuốc đã được đan xong.',
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
      'Con đường đất còn đẫm sương. Ngươi siết chặt túi tiền lép kẹp, nghe tiếng chuông chợ vọng về từ phía tây.',
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
      'Linh khí vận hành lệch một nhịp, rồi lại lệch thêm. Linh căn hỗn tạp chỉ giữ nổi nửa phần công lực, nhưng nửa phần ấy là của chính ngươi.',
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
      'Giữa tiếng rao hàng chen chúc, có người hạ giọng nhắc đến hang phong ấn và một quyển bí kíp chỉ nhận kẻ có linh căn khác thường.',
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
      'Cụ Mai Hoa mỉm cười; nụ cười ít răng mà đầy ấm áp. Ba nhánh linh thảo, một lọ thuốc, và lời cảm ơn nặng hơn cả vàng.',
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
      'Phù văn cũ trên vách đá rung lên khe khẽ. Ẩn sĩ Cốc nói không sai: vào đây thì mang bùa, nếu không hãy mang theo vận may.',
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
      'Quyển bí kíp kỳ quặc dạy ngươi lách qua những chỗ kinh mạch đứt đoạn. Từ đó, linh khí mới chịu nghe lời mà uốn theo ý ngươi.',
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
      'Tiếng chuông chợ, tiếng bàn tính, tiếng cười của kẻ vừa bán được hàng — hóa ra thương đạo cũng có thể dưỡng tâm.',
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
      'Trên đỉnh mây, linh hạc đã chờ từ lâu. Chỉ còn một bước, nhưng bước ấy phải gom đủ cả tĩnh tâm lẫn quyết ý.',
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
      'Mưa sao nghiêng qua trời đêm. Ngươi ngồi xuống, không còn cần chứng minh điều gì ngoài việc bước tiếp.',
    textEn:
      'Star-rain falls slantwise. You sit down with nothing left to prove except the next step.',
    suggested: [
      { kind: 'train' },
      { kind: 'rest' },
      { kind: 'draw_lottery' },
    ],
  },
]
