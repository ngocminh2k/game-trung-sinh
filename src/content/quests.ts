import type { QuestDef } from '../engine/content-types'

const turnIn = (id: string, vi: string, en: string, completeItems?: Record<string, number>, completeFlags?: string[]): QuestDef['steps'][number] => ({
  id, descVi: vi, descEn: en, completeItems, completeFlags, isTurnInStep: true,
})

/** Declarative quest content. Main quests form the story spine; secret quests
 * remain invisible until their required flag becomes true. */
export const QUESTS: QuestDef[] = [
  // Eight main quests — each turn-in moves one authored story beat.
  { id: 'q_main_letter', giverNpcId: 'n_elder_meihua', nameVi: 'Lá thư lúc rạng đông', nameEn: 'Letter at Dawn', descVi: 'Lời hứa đầu tiên với Mai Hoa.', descEn: 'Your first promise to Meihua.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: { pill_hp: 1 }, aliases: ['main letter'], storySceneNextId: 'market_rumor', nextQuestId: 'q_main_route_proof', steps: [
    { id: 'hear_meihua', descVi: 'Nói chuyện với cụ Mai Hoa về lá thư.', descEn: 'Speak to Meihua about the letter.', completeNpcTalk: 'n_elder_meihua', isTurnInStep: false },
    turnIn('return', 'Trở lại gặp cụ Mai Hoa.', 'Return to Elder Meihua.'),
  ] },
  { id: 'q_main_route_proof', giverNpcId: 'n_storyteller_ngo', nameVi: 'Dấu vết của người bị quên', nameEn: 'Proof of the Forgotten', descVi: 'Theo đầu mối đã chọn và lấy vật chứng.', descEn: 'Follow your chosen lead and secure proof.', requiredItems: {}, requiredFlags: ['story_route_ready'], rewardGold: 35, rewardItems: { pill_qi: 1 }, aliases: ['route proof'], storySceneNextId: 'cave_witness', nextQuestId: 'q_main_sealed_cave', steps: [
    { id: 'resolve_lead', descVi: 'Hoàn tất sự kiện đầu mối trên bản đồ.', descEn: 'Resolve the lead event on the map.', completeFlags: ['story_route_ready'], isTurnInStep: false },
    turnIn('report', 'Báo với Ngô về vật chứng.', 'Report the proof to Ngo.'),
  ] },
  { id: 'q_main_sealed_cave', giverNpcId: 'n_master_vo', nameVi: 'Hang phong ấn và tấm bia cũ', nameEn: 'The Seal and the Old Tablet', descVi: 'Vào hang an toàn và mang lời chứng trở về.', descEn: 'Enter the cave safely and return with testimony.', requiredItems: {}, requiredFlags: ['quest_q_main_route_proof_done'], rewardGold: 150, rewardItems: { old_manual: 1 }, aliases: ['sealed cave', 'hang phong an'], storySceneNextId: 'sect_trial', nextQuestId: 'q_main_trial_record', steps: [
    { id: 'warded_entry', descVi: 'Vào Hang Phong Ấn cùng bùa hộ thân.', descEn: 'Enter the Sealed Cave under a ward.', completeFlags: ['visitedCaveWarded'], isTurnInStep: false },
    { id: 'hear_ha', descVi: 'Nói chuyện với vong hồn Hà.', descEn: 'Speak to Ha’s lost soul.', completeNpcTalk: 'n_lost_soul_ha', isTurnInStep: false },
    turnIn('report', 'Trở lại gặp Võ Trưởng Sư.', 'Return to Master Vo.'),
  ] },
  { id: 'q_main_trial_record', giverNpcId: 'n_scholar_minh', nameVi: 'Sổ ghi phiên xét xử', nameEn: 'Record of the Trial', descVi: 'Giữ lời chứng khỏi bị bóp méo.', descEn: 'Keep testimony from being distorted.', requiredItems: {}, requiredFlags: ['quest_q_main_sealed_cave_done'], rewardGold: 60, rewardItems: { trail_rations: 2 }, aliases: ['trial record'], storySceneNextId: 'mirror_choice', nextQuestId: 'q_main_mirror', steps: [
    { id: 'consult_minh', descVi: 'Nhờ học giả Minh đọc lời chứng.', descEn: 'Ask Scholar Minh to read the testimony.', completeNpcTalk: 'n_scholar_minh', isTurnInStep: false },
    { id: 'trial_choice', descVi: 'Đối diện Võ Trưởng Sư tại phiên xét xử.', descEn: 'Face Master Vo at the sect trial.', completeNpcTalk: 'n_master_vo', isTurnInStep: false },
    turnIn('seal_record', 'Niêm phong bản ghi với học giả Minh.', 'Seal the record with Scholar Minh.'),
  ] },
  { id: 'q_main_mirror', giverNpcId: 'n_rival_khoa', nameVi: 'Gương của kiếp trước', nameEn: 'Mirror of the Previous Life', descVi: 'Đối diện điều ngươi từng quên.', descEn: 'Face what you chose to forget.', requiredItems: {}, requiredFlags: ['quest_q_main_trial_record_done'], rewardGold: 80, rewardItems: { moon_moss: 1 }, aliases: ['mirror'], storySceneNextId: 'last_page', nextQuestId: 'q_main_last_page', steps: [
    { id: 'speak_khoa', descVi: 'Nói chuyện với Khoa trước gương.', descEn: 'Speak to Khoa before the mirror.', completeNpcTalk: 'n_rival_khoa', isTurnInStep: false },
    { id: 'mirror_choice', descVi: 'Chọn cách đối diện tiền kiếp.', descEn: 'Choose how to face the past.', completeFlags: ['story_khoa_trusted'], isTurnInStep: false },
    turnIn('witness', 'Trở lại nói chuyện với Khoa.', 'Return to Khoa.'),
  ] },
  { id: 'q_main_last_page', giverNpcId: 'n_crane_spirit', nameVi: 'Trang cuối không viết sẵn', nameEn: 'The Last Page Unwritten', descVi: 'Mang câu chuyện lên đỉnh mây.', descEn: 'Carry the story to Cloud Peak.', requiredItems: {}, requiredFlags: ['quest_q_main_mirror_done'], rewardGold: 120, rewardItems: { crane_feather: 1 }, aliases: ['last page'], nextQuestId: 'q_main_ascension', steps: [
    { id: 'reach_peak', descVi: 'Đến dấu Tiên Hạc trên Đỉnh Mây.', descEn: 'Reach the Crane Spirit on Cloud Peak.', completeNpcTalk: 'n_crane_spirit', isTurnInStep: false },
    turnIn('offer', 'Dâng lời hứa cho Tiên Hạc.', 'Offer your promise to the Crane Spirit.'),
  ] },
  { id: 'q_main_ascension', giverNpcId: 'n_master_vo', nameVi: 'Đường cong queo lên đỉnh', nameEn: 'The Crooked Path Upward', descVi: 'Trở về tông môn, chọn người sẽ giữ ký ức.', descEn: 'Return to the sect and choose who keeps memory.', requiredItems: {}, requiredFlags: ['quest_q_main_last_page_done'], rewardGold: 180, rewardItems: { cloudveil_robe: 1 }, aliases: ['ascension'], nextQuestId: 'q_main_final_vow', steps: [
    { id: 'return_sect', descVi: 'Nói chuyện với Võ Trưởng Sư.', descEn: 'Speak to Master Vo.', completeNpcTalk: 'n_master_vo', isTurnInStep: false },
    turnIn('report', 'Xác nhận lựa chọn với Võ Trưởng Sư.', 'Confirm your choice with Master Vo.'),
  ] },
  { id: 'q_main_final_vow', giverNpcId: 'n_elder_meihua', nameVi: 'Lời thề gọi tên', nameEn: 'The Naming Vow', descVi: 'Khép lại con đường bằng một cái tên được gọi.', descEn: 'Close the road with one name called home.', requiredItems: {}, requiredFlags: ['quest_q_main_ascension_done'], rewardGold: 250, rewardItems: { moonstone_pendant: 1 }, aliases: ['final vow'], steps: [
    { id: 'return_village', descVi: 'Nói chuyện với Mai Hoa lần cuối.', descEn: 'Speak to Meihua one final time.', completeNpcTalk: 'n_elder_meihua', isTurnInStep: false },
    turnIn('vow', 'Trao lời thề cho Mai Hoa.', 'Give the vow to Meihua.'),
  ] },

  // Ten side quests, supplied by ten different NPCs.
  { id: 'q_herb_delivery', giverNpcId: 'n_elder_meihua', nameVi: 'Lọ thuốc cho cụ Mai Hoa', nameEn: 'A Tonic for Elder Meihua', descVi: 'Cụ cần ba nhánh linh thảo tươi.', descEn: 'The elder needs three fresh spirit herbs.', requiredItems: {}, requiredFlags: [], rewardGold: 90, rewardItems: { pill_hp: 1 }, aliases: ['herb delivery'], steps: [
    { id: 'gather', descVi: 'Hái 3 linh thảo.', descEn: 'Gather 3 spirit herbs.', completeItems: { spirit_herb: 3 }, isTurnInStep: false },
    turnIn('deliver', 'Đem linh thảo về cho Mai Hoa.', 'Bring the herbs to Meihua.', { spirit_herb: 3 }),
  ] },
  { id: 'q_talisman_order', giverNpcId: 'n_merchant_bao', nameVi: 'Đơn bùa của họ Vân', nameEn: 'The Talisman Order', descVi: 'Bảo cần gấp một lá bùa trừ tà.', descEn: 'Bao urgently needs a warding talisman.', requiredItems: {}, requiredFlags: [], rewardGold: 140, rewardItems: {}, aliases: ['talisman order'], steps: [
    { id: 'buy_ward', descVi: 'Kiếm một bùa trừ tà.', descEn: 'Obtain a warding talisman.', completeItems: { warding_talisman: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao bùa cho Bảo.', 'Deliver the ward to Bao.', { warding_talisman: 1 }),
  ] },
  { id: 'q_guard_patrol', giverNpcId: 'n_guard_truong', nameVi: 'Tuần tra ngoài sương', nameEn: 'Mist Patrol', descVi: 'Trường cần người kiểm tra lối rừng.', descEn: 'Truong needs the forest trail checked.', requiredItems: {}, requiredFlags: [], rewardGold: 45, rewardItems: { trail_rations: 2 }, aliases: ['patrol'], steps: [
    { id: 'forest', descVi: 'Đến Rừng Sương Mù.', descEn: 'Reach the Misty Forest.', completeNode: 'forest-hunter', isTurnInStep: false },
    turnIn('report', 'Báo cáo với Trường.', 'Report to Truong.'),
  ] },
  { id: 'q_field_harvest', giverNpcId: 'n_farmer_tu', nameVi: 'Mầm non dưới sương', nameEn: 'Seedlings Under Dew', descVi: 'Tư nhờ hái linh thảo trước cơn mưa.', descEn: 'Tu asks for herbs before the rain.', requiredItems: {}, requiredFlags: [], rewardGold: 35, rewardItems: { plum_qi_wine: 1 }, aliases: ['harvest'], steps: [
    { id: 'harvest', descVi: 'Hái 2 linh thảo.', descEn: 'Gather 2 spirit herbs.', completeItems: { spirit_herb: 2 }, isTurnInStep: false },
    turnIn('return', 'Đem thảo dược về cho Tư.', 'Return herbs to Tu.', { spirit_herb: 2 }),
  ] },
  { id: 'q_smith_ore', giverNpcId: 'n_smith_duc', nameVi: 'Hàn thiết cho lò rèn', nameEn: 'Cold Iron for the Forge', descVi: 'Đức cần quặng hàn thiết.', descEn: 'Duc needs cold iron ore.', requiredItems: {}, requiredFlags: [], rewardGold: 80, rewardItems: { bamboo_saber: 1 }, aliases: ['cold iron'], steps: [
    { id: 'ore', descVi: 'Lấy hàn thiết quặng.', descEn: 'Acquire cold iron ore.', completeItems: { cold_iron_ore: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao quặng cho Đức.', 'Deliver ore to Duc.', { cold_iron_ore: 1 }),
  ] },
  { id: 'q_tailor_thread', giverNpcId: 'n_tailor_yen', nameVi: 'Đường chỉ trên mây', nameEn: 'A Thread Through Clouds', descVi: 'Yến tìm tơ vân để vá áo.', descEn: 'Yen seeks cloudsilk for repairs.', requiredItems: {}, requiredFlags: [], rewardGold: 75, rewardItems: { travelers_coat: 1 }, aliases: ['thread'], steps: [
    { id: 'thread', descVi: 'Lấy tơ vân.', descEn: 'Acquire cloudsilk thread.', completeItems: { cloudsilk_thread: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao tơ vân cho Yến.', 'Deliver cloudsilk to Yen.', { cloudsilk_thread: 1 }),
  ] },
  { id: 'q_alchemist_moss', giverNpcId: 'n_alchemist_sam', nameVi: 'Lò đan thứ tám', nameEn: 'The Eighth Furnace', descVi: 'Sâm cần rêu nguyệt cho một mẻ đan không nổ.', descEn: 'Sam needs moonmoss for a non-explosive batch.', requiredItems: {}, requiredFlags: [], rewardGold: 100, rewardItems: { dew_pill: 2 }, aliases: ['moonmoss'], steps: [
    { id: 'moss', descVi: 'Lấy rêu nguyệt.', descEn: 'Acquire moonmoss.', completeItems: { moon_moss: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao rêu nguyệt cho Sâm.', 'Deliver moonmoss to Sam.', { moon_moss: 1 }),
  ] },
  { id: 'q_hunter_fang', giverNpcId: 'n_hunter_son', nameVi: 'Dấu răng trong sương', nameEn: 'Teeth in the Mist', descVi: 'Sơn cần nanh thú để đánh dấu đường.', descEn: 'Son needs a beast fang to mark the trail.', requiredItems: {}, requiredFlags: [], rewardGold: 65, rewardItems: { bone_ward_charm: 1 }, aliases: ['hunter fang'], steps: [
    { id: 'fang', descVi: 'Lấy một nanh thú.', descEn: 'Acquire a beast fang.', completeItems: { beast_fang: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao nanh thú cho Sơn.', 'Deliver the fang to Son.', { beast_fang: 1 }),
  ] },
  { id: 'q_woodcutter_dream', giverNpcId: 'n_woodcutter_bong', nameVi: 'Cây biết nói', nameEn: 'The Talking Tree', descVi: 'Bồng muốn xác minh giấc mơ bằng lời của Hà.', descEn: 'Bong wants Ha to confirm his dream.', requiredItems: {}, requiredFlags: [], rewardGold: 55, rewardItems: { pill_qi: 1 }, aliases: ['talking tree'], steps: [
    { id: 'ha', descVi: 'Nói chuyện với vong hồn Hà.', descEn: 'Speak to Ha’s lost soul.', completeNpcTalk: 'n_lost_soul_ha', isTurnInStep: false },
    turnIn('return', 'Kể lại cho Bồng.', 'Tell Bong what Ha said.'),
  ] },
  { id: 'q_exorcist_tea', giverNpcId: 'n_exorcist_diem', nameVi: 'Trà cho người trừ tà', nameEn: 'Tea for an Exorcist', descVi: 'Diễm hết trà giữa ca trực khe nứt.', descEn: 'Diem has run out of tea on rift watch.', requiredItems: {}, requiredFlags: [], rewardGold: 70, rewardItems: { rift_step_scroll: 1 }, aliases: ['exorcist tea'], steps: [
    { id: 'wine', descVi: 'Mua mai hoa tửu thay trà.', descEn: 'Bring plum qi wine as tea.', completeItems: { plum_qi_wine: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Đưa rượu cho Diễm.', 'Give the wine to Diem.', { plum_qi_wine: 1 }),
  ] },

  // Four secret quests: requiredFlags are their discovery clues and hide them until true.
  { id: 'q_secret_eighth_name', giverNpcId: 'n_storyteller_ngo', nameVi: 'Cái tên thứ tám', nameEn: 'The Eighth Name', descVi: 'Một trang bị cạo mực chỉ Ngô dám mở.', descEn: 'A scraped page only Ngo dares open.', requiredItems: {}, requiredFlags: ['story_name_known'], rewardGold: 110, rewardItems: { moonstone_pendant: 1 }, aliases: ['eighth name'], secret: true, steps: [
    { id: 'talk_ngo', descVi: 'Nói chuyện với Ngô sau khi biết tên.', descEn: 'Speak to Ngo after learning the name.', completeNpcTalk: 'n_storyteller_ngo', isTurnInStep: false },
    turnIn('return', 'Đưa bản chép lại cho Ngô.', 'Return the copied name to Ngo.'),
  ] },
  { id: 'q_secret_cracked_ward', giverNpcId: 'n_merchant_bao', nameVi: 'Nửa phù khế', nameEn: 'The Half-Ward', descVi: 'Bảo chỉ thú nhận khi ngươi đã bán cho hắn.', descEn: 'Bao confesses only after you have sold to him.', requiredItems: {}, requiredFlags: ['story_bao_paid'], rewardGold: 120, rewardItems: { jade_charm: 1 }, aliases: ['half ward'], secret: true, steps: [
    { id: 'talk_bao', descVi: 'Nói chuyện với Bảo về khế nợ.', descEn: 'Speak to Bao about the contract.', completeNpcTalk: 'n_merchant_bao', isTurnInStep: false },
    turnIn('return', 'Đối chất với Bảo.', 'Confront Bao.'),
  ] },
  { id: 'q_secret_red_thread', giverNpcId: 'n_elder_meihua', nameVi: 'Nút dây đỏ cuối', nameEn: 'The Last Red Knot', descVi: 'Mai Hoa chỉ trao nút dây cho người đã được tin.', descEn: 'Meihua gives the knot only to one she trusts.', requiredItems: {}, requiredFlags: ['story_meihua_trusted'], rewardGold: 95, rewardItems: { pill_hp: 2 }, aliases: ['red knot'], secret: true, steps: [
    { id: 'talk_meihua', descVi: 'Nói chuyện với Mai Hoa về bó dây.', descEn: 'Speak to Meihua about the thread.', completeNpcTalk: 'n_elder_meihua', isTurnInStep: false },
    turnIn('return', 'Buộc nút dây cuối cùng.', 'Tie the final knot.'),
  ] },
  { id: 'q_secret_crooked_manual', giverNpcId: 'n_hermit_coc', nameVi: 'Bí kíp cong queo', nameEn: 'The Crooked Manual', descVi: 'Cốc chủ nhận ra kẻ biết nghe tiếng phong ấn.', descEn: 'Coc recognizes one who hears the seal.', requiredItems: {}, requiredFlags: ['visitedCaveWarded'], rewardGold: 130, rewardItems: { herbal_breath_manual: 1 }, aliases: ['crooked manual'], secret: true, steps: [
    { id: 'talk_coc', descVi: 'Nói chuyện với Cốc chủ.', descEn: 'Speak to Hermit Coc.', completeNpcTalk: 'n_hermit_coc', isTurnInStep: false },
    turnIn('return', 'Nhận bản bí kíp từ Cốc chủ.', 'Receive the manual from Coc.'),
  ] },

  // Three timed world quests. Completion writes quest_<id>_done; their regional outcome is inspectable in flags.
  { id: 'q_world_forest_clear', giverNpcId: 'n_guard_truong', nameVi: 'Dọn quái Rừng Vân Mộ', nameEn: 'Clear the Cloudgrave Forest', descVi: 'Dọn trư nha sương trong năm ngày.', descEn: 'Clear the mist-tusk boar within five days.', requiredItems: {}, requiredFlags: [], rewardGold: 140, rewardItems: { mistweave_vest: 1 }, aliases: ['forest clear'], deadlineDays: 5, steps: [
    { id: 'defeat_boar', descVi: 'Hạ Trư Nha Sương.', descEn: 'Defeat the Mist-Tusk Boar.', completeFlags: ['defeated_mist_boar'], isTurnInStep: false },
    turnIn('report', 'Báo tin an toàn cho Trường.', 'Report the forest safe to Truong.'),
  ] },
  { id: 'q_world_cave_ward', giverNpcId: 'n_exorcist_diem', nameVi: 'Vá phong ấn', nameEn: 'Mend the Seal', descVi: 'Khảo sát Hang Phong Ấn trong bảy ngày.', descEn: 'Survey the Sealed Cave within seven days.', requiredItems: {}, requiredFlags: [], rewardGold: 160, rewardItems: { iron_skin_manual: 1 }, aliases: ['mend seal'], deadlineDays: 7, steps: [
    { id: 'warded', descVi: 'Vào hang với bùa hộ thân.', descEn: 'Enter the cave under a ward.', completeFlags: ['visitedCaveWarded'], isTurnInStep: false },
    turnIn('report', 'Báo lại cho Diễm.', 'Report back to Diem.'),
  ] },
  { id: 'q_world_rift_watch', giverNpcId: 'n_exile_ba', nameVi: 'Canh Khe Nứt', nameEn: 'Watch the Rift', descVi: 'Đẩy lui Liệt Khuyển trước khi nó thoát trong tám ngày.', descEn: 'Drive back the Rift Hound before it escapes in eight days.', requiredItems: {}, requiredFlags: [], rewardGold: 200, rewardItems: { cloudwalk_manual: 1 }, aliases: ['rift watch'], deadlineDays: 8, steps: [
    { id: 'hound', descVi: 'Hạ Liệt Khuyển Khe Nứt.', descEn: 'Defeat the Rift Hound.', completeFlags: ['defeated_rift_hound'], isTurnInStep: false },
    turnIn('report', 'Báo với kẻ lưu đày Bá.', 'Report to Exile Ba.'),
  ] },
]

export function getQuest(questId: string): QuestDef | undefined {
  return QUESTS.find((q) => q.id === questId)
}
