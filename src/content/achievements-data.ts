import type { AchievementDef } from '../engine/content-types'

export const ACHIEVEMENTS: AchievementDef[] = [
  {
    id: 'first_step',
    nameVi: 'Bước đầu tiên',
    nameEn: 'First Step',
    descVi: 'Rời làng lần đầu.',
    descEn: 'Leave the village for the first time.',
  },
  {
    id: 'green_thumb',
    nameVi: 'Bàn tay xanh',
    nameEn: 'Green Thumb',
    descVi: 'Hái linh thảo lần đầu.',
    descEn: 'Gather your first spirit herb.',
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
    descVi: 'Mua món đồ đầu tiên ở chợ.',
    descEn: 'Buy your first item at the market.',
  },
  {
    id: 'first_sale',
    nameVi: 'Hợp đồng đầu tay',
    nameEn: 'First Sale',
    descVi: 'Bán được món hàng đầu tiên.',
    descEn: 'Sell your first item.',
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
]

export function getAchievement(id: string): AchievementDef | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id)
}
