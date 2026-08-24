import type { QuestDef } from '../engine/content-types'

export const QUESTS: QuestDef[] = [
  {
    id: 'q_herb_delivery',
    giverNpcId: 'n_elder_meihua',
    nameVi: 'Lọ thuốc cho cụ Mai Hoa',
    nameEn: 'A Tonic for Elder Meihua',
    descVi: 'Cụ cần ba nhánh linh thảo tươi để nấu thuốc mùa mưa.',
    descEn: 'The elder needs three fresh spirit herbs for her rainy-season tonic.',
    requiredItems: { spirit_herb: 3 },
    requiredFlags: [],
    rewardGold: 90,
    rewardItems: { pill_hp: 1 },
    aliases: ['herb delivery', 'lo thuoc', 'giao linh thao'],
  },
  {
    id: 'q_talisman_order',
    giverNpcId: 'n_merchant_bao',
    nameEn: 'The Talisman Order',
    nameVi: 'Đơn bùa của họ Vân',
    descVi: 'Khách hàng hủy đơn muộn; Bảo cần gấp một lá bùa trừ tà.',
    descEn: 'A customer cancelled late; Bao urgently needs one warding talisman.',
    requiredItems: { warding_talisman: 1 },
    requiredFlags: [],
    rewardGold: 140,
    rewardItems: {},
    aliases: ['talisman order', 'don bua', 'giao bua'],
  },
  {
    id: 'q_sealed_cave',
    giverNpcId: 'n_master_vo',
    nameVi: 'Hang phong ấn và tấm bia cũ',
    nameEn: 'The Seal and the Old Tablet',
    descVi: 'Vào hang phong ấn (có bùa hộ thân) rồi về báo cáo với trưởng sư.',
    descEn: 'Enter the sealed cave with a ward active, then report back to the master.',
    requiredItems: {},
    requiredFlags: ['visitedCaveWarded'],
    rewardGold: 150,
    rewardItems: { old_manual: 1 },
    aliases: ['sealed cave', 'hang phong an', 'kham tra hang'],
  },
]

export function getQuest(questId: string): QuestDef | undefined {
  return QUESTS.find((q) => q.id === questId)
}
