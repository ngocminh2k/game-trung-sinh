import type { AchievementDef } from '../engine/content-types'

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_step',
    nameVi: 'Bước đầu tiên',
    nameEn: 'First Step',
    descVi: 'Đi ba chặng đường, rời khỏi làng.',
    descEn: 'Take three journeys away from the village.',
  },
  {
    id: 'green_thumb',
    nameVi: 'Bàn tay xanh',
    nameEn: 'Green Thumb',
    descVi: 'Hái được mười linh thảo.',
    descEn: 'Gather ten spirit herbs.',
  },
  {
    id: 'socialite',
    nameVi: 'Duyên rộng tình sâu',
    nameEn: 'Well-Met Everywhere',
    descVi: 'Nói chuyện với năm người khác nhau.',
    descEn: 'Talk to five different people.',
  },
  {
    id: 'first_purchase',
    nameVi: 'Vé đầu tiên',
    nameEn: 'First Purchase',
    descVi: 'Mua năm món đồ ở chợ.',
    descEn: 'Buy five items at the market.',
  },
  {
    id: 'first_sale',
    nameVi: 'Hợp đồng đầu tay',
    nameEn: 'First Sale',
    descVi: 'Bán được năm món hàng.',
    descEn: 'Sell five items.',
  },
  {
    id: 'lucky_star',
    nameVi: 'Ngôi sao may mắn',
    nameEn: 'Lucky Star',
    descVi: 'Trúng giải đặc biệt vé số.',
    descEn: 'Win the lottery grand prize.',
  },
  {
    id: 'cave_brave',
    nameVi: 'Can đảm vào hang',
    nameEn: 'Cave-Brave',
    descVi: 'Vào hang phong ấn dưới sự che chở của bùa.',
    descEn: 'Enter the sealed cave under a ward.',
  },
  {
    id: 'quest_done',
    nameVi: 'Người giữ lời',
    nameEn: 'Word-Keeper',
    descVi: 'Hoàn thành một nhiệm vụ.',
    descEn: 'Complete a quest.',
  },
  {
    id: 'halfway_there',
    nameVi: 'Nửa đường thiên đạo',
    nameEn: 'Halfway to Heaven',
    descVi: 'Đạt cảnh giới Kim Đan.',
    descEn: 'Reach the Golden Core stage.',
  },
  {
    id: 'wealthy',
    nameVi: 'Túi đầy tiếng chuông',
    nameEn: 'Purse Full of Bells',
    descVi: 'Giữ ít nhất 400 lượng.',
    descEn: 'Hold at least 400 gold at once.',
  },
  {
    id: 'immortal_road_end',
    nameVi: 'Chân trời cuối cùng',
    nameEn: 'The Final Horizon',
    descVi: 'Đạt đại viên mãn cảnh giới phi thăng.',
    descEn: 'Reach the final ascension-ready stage.',
  },
  {
    id: 'arena_champion',
    nameVi: 'Vô địch Lôi Đài',
    nameEn: 'Arena Champion',
    descVi: 'Lần đầu chinh phục toàn bộ tháp Lôi Đài.',
    descEn: 'Top the entire Lôi Đài tower for the first time.',
  },
  {
    id: 'notorious',
    nameVi: 'Oai danh lẫy lừng',
    nameEn: 'Notorious',
    descVi: 'Cưỡng đoạt hai mục tiêu, tiếng tăm xấu xa lan xa.',
    descEn: 'Plunder both coercion targets; your ill name spreads.',
  },
]

export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}
