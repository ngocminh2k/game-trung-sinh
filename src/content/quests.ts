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

  // === expansion-x20 T04 — 125 quest mới. MAIN: 4 quest nối sau q_main_final_vow.
  // Canon: thưởng main là Linh Thạch do Hệ Thống trả (ghi trong desc; cấp Linh Thạch do T12/T14 lo).
  { id: 'q_main_branch_oath', giverNpcId: 'n_elder_meihua', nameVi: 'Lời thề trước ngã ba', nameEn: 'The Oath at the Fork', descVi: '【Hệ Thống】 trả Linh Thạch: chốt lựa chọn nhánh đường trước phiên xét xử.', descEn: '【System】 pays spirit stones: lock your branch choice before the trial.', requiredItems: {}, requiredFlags: ['quest_q_main_final_vow_done'], rewardGold: 60, rewardItems: {}, aliases: ['branch oath', 'loi the nga ba'], nextQuestId: 'q_main_sect_trial', steps: [
    { id: 'meet_meihua', descVi: 'Nói lựa chọn nhánh đường với cụ Mai Hoa.', descEn: 'Tell Meihua your chosen branch.', completeNpcTalk: 'n_elder_meihua', isTurnInStep: false },
    turnIn('oath', 'Niêm phong lời thề với Mai Hoa.', 'Seal the oath with Meihua.'),
  ] },
  { id: 'q_main_sect_trial', giverNpcId: 'n_master_vo', nameVi: 'Phiên xét xử tông môn', nameEn: 'The Sect Trial', descVi: '【Hệ Thống】 trả Linh Thạch: đối diện Khoa trước toàn tông.', descEn: '【System】 pays spirit stones: face Khoa before the whole sect.', requiredItems: {}, requiredFlags: ['quest_q_main_branch_oath_done'], rewardGold: 60, rewardItems: {}, aliases: ['sect trial', 'phien xet xu'], nextQuestId: 'q_main_peak_four', steps: [
    { id: 'meet_khoa', descVi: 'Đối chất với Khoa trước giờ thi đấu.', descEn: 'Confront Khoa before the duel.', completeNpcTalk: 'n_rival_khoa', isTurnInStep: false },
    turnIn('report_vo', 'Báo kết quả với Võ Trưởng Sư.', 'Report the outcome to Master Vo.'),
  ] },
  { id: 'q_main_peak_four', giverNpcId: 'n_crane_spirit', nameVi: 'Bốn tiên nhân trên đỉnh', nameEn: 'The Four Immortals at the Peak', descVi: '【Hệ Thống】 trả Linh Thạch: chứng kiến bốn tiên nhân nhận ra “vật của bọn họ còn sống”.', descEn: '【System】 pays spirit stones: witness the four immortals recognize “their thing still lives”.', requiredItems: {}, requiredFlags: ['quest_q_main_sect_trial_done'], rewardGold: 60, rewardItems: {}, aliases: ['peak four', 'bon tien nhan'], nextQuestId: 'q_main_sublayer_vow', steps: [
    { id: 'meet_nhu', descVi: 'Hỏi tăng Như về bốn bóng trắng trên đỉnh.', descEn: 'Ask Monk Nhu about the four white shadows on the peak.', completeNpcTalk: 'n_monk_nhu', isTurnInStep: false },
    turnIn('report_crane', 'Trình bày lại cho Tiên Hạc.', 'Report back to the Crane Spirit.'),
  ] },
  { id: 'q_main_sublayer_vow', giverNpcId: 'n_ash_priest_cuu', nameVi: 'Lời thề dưới lớp tro', nameEn: 'The Vow Beneath the Ash', descVi: '【Hệ Thống】 trả Linh Thạch: dưới tro xương, giữ lại một cái tên để gọi về.', descEn: '【System】 pays spirit stones: beneath the bone ash, keep one name to call home.', requiredItems: {}, requiredFlags: ['quest_q_main_peak_four_done'], rewardGold: 60, rewardItems: {}, aliases: ['sublayer vow', 'loi the lop tro'], steps: [
    { id: 'meet_cuu', descVi: 'Nói chuyện với tư tế tro Cửu về 60 cái tên.', descEn: 'Speak to Ash Priest Cuu about the sixty names.', completeNpcTalk: 'n_ash_priest_cuu', isTurnInStep: false },
    turnIn('vow_ash', 'Ghi tên vào lớp tro cùng Cửu.', 'Inscribe the name into the ash with Cuu.'),
  ] },

  // SIDE — village (8). Mỗi quest gắn 1 NPC làng.
  { id: 'q_vil_01', giverNpcId: 'n_innkeeper_hanh', nameVi: 'Đêm trọ thiếu khẩu phần', nameEn: 'Short Rations at the Inn', descVi: 'Hạnh hết lương khô giữa mùa khách vắng.', descEn: 'Hanh has run out of trail rations in a slow season.', requiredItems: {}, requiredFlags: [], rewardGold: 15, rewardItems: { pill_hp: 1 }, aliases: ['inn rations', 'dem tro'], steps: [
    { id: 'get_rations', descVi: 'Xuống chợ mua 2 gói lương khô.', descEn: 'Buy 2 packs of trail rations at the market.', completeItems: { trail_rations: 2 }, isTurnInStep: false },
    turnIn('deliver', 'Giao lương khô cho Hạnh.', 'Deliver the rations to Hanh.', { trail_rations: 2 }),
  ] },
  { id: 'q_vil_02', giverNpcId: 'n_kid_xiaobao', nameVi: 'Con diều tre', nameEn: 'The Bamboo Kite', descVi: 'Tiểu Bảo muốn một con diều bằng tre thật cứng.', descEn: 'Xiaobao wants a kite of truly hard bamboo.', requiredItems: {}, requiredFlags: [], rewardGold: 10, rewardItems: {}, aliases: ['bamboo kite', 'dieu tre'], steps: [
    { id: 'get_bamboo', descVi: 'Lấy một thanh đao tre.', descEn: 'Acquire a bamboo saber.', completeItems: { bamboo_saber: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Đưa đao tre cho Tiểu Bảo làm diều.', 'Give the bamboo to Xiaobao for the kite.', { bamboo_saber: 1 }),
  ] },
  { id: 'q_vil_03', giverNpcId: 'n_gardener_thin', nameVi: 'Người chồng trong ký ức', nameEn: 'The Husband in Memory', descVi: 'Cụ Thìn chỉ hiện qua ký ức — một mảnh vườn 12 năm trước.', descEn: 'Thin appears only in memory — a garden twelve years gone.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: { pill_qi: 1 }, aliases: ['memory husband', 'ky uc cu thin'], steps: [
    { id: 'remember', descVi: 'Gọi lại tên của cụ Thìn trong ký ức.', descEn: 'Call Thin\'s name back within the memory.', completeFlags: ['name_thin_remembered'], isTurnInStep: false },
    turnIn('report', 'Kể lại vườn xưa cho cụ Thìn nghe.', 'Tell Thin of the old garden.'),
  ] },
  { id: 'q_vil_04', giverNpcId: 'n_storyteller_ngo', nameVi: 'Rượu cho trang truyện', nameEn: 'Wine for the Story Page', descVi: 'Ngô chỉ mở trang bị cạo mực khi có rượu mai hoa.', descEn: 'Ngo opens the scraped page only with plum qi wine.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['story wine', 'ruou trang truyen'], steps: [
    { id: 'get_wine', descVi: 'Mua một bình rượu mai hoa.', descEn: 'Buy a flask of plum qi wine.', completeItems: { plum_qi_wine: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Đặt rượu bên trang truyện của Ngô.', 'Set the wine beside Ngo\'s story page.', { plum_qi_wine: 1 }),
  ] },
  { id: 'q_vil_05', giverNpcId: 'n_guard_truong', nameVi: 'Ca trực cổng làng', nameEn: 'The Village Gate Watch', descVi: 'Trường cần người xác nhận rừng đã sạch trư nha.', descEn: 'Truong needs someone to confirm the forest is clear of boars.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['gate watch', 'ca truc cong'], steps: [
    { id: 'clear_boar', descVi: 'Hạ Trư Nha Sương ở Rừng Vân Mộ.', descEn: 'Defeat the Mist-Tusk Boar in the Cloudgrave Forest.', completeFlags: ['defeated_mist_boar'], isTurnInStep: false },
    turnIn('report', 'Báo với Trường để mở cổng về đêm.', 'Report to Truong to keep the gate open at night.'),
  ] },
  { id: 'q_vil_06', giverNpcId: 'n_farmer_tu', nameVi: 'Rêu nguyệt úp bờ ruộng', nameEn: 'Moonmoss on the Field Edge', descVi: 'Tứ cần rêu nguyệt phủ bờ ruộng khô.', descEn: 'Tu needs moonmoss to mulch the dry field edge.', requiredItems: {}, requiredFlags: [], rewardGold: 15, rewardItems: {}, aliases: ['field moss', 'reu ruong'], steps: [
    { id: 'get_moss', descVi: 'Hái 2 nhánh rêu nguyệt.', descEn: 'Gather 2 moon moss.', completeItems: { moon_moss: 2 }, isTurnInStep: false },
    turnIn('deliver', 'Giao rêu cho Tứ.', 'Deliver the moss to Tu.', { moon_moss: 2 }),
  ] },
  { id: 'q_vil_07', giverNpcId: 'n_woodcutter_bong', nameVi: 'Lưỡi rìu quên mài', nameEn: 'The Unsharpened Blade', descVi: 'Bồng muốn một mảnh quặng sắt lạnh để tôi lưỡi rìu.', descEn: 'Bong wants cold iron ore to temper his axe.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['axe ore', 'luoi riu'], steps: [
    { id: 'get_ore', descVi: 'Lấy 1 mảnh quặng sắt lạnh.', descEn: 'Acquire 1 cold iron ore.', completeItems: { cold_iron_ore: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao quặng cho Bồng.', 'Deliver the ore to Bong.', { cold_iron_ore: 1 }),
  ] },
  { id: 'q_vil_08', giverNpcId: 'n_elder_meihua', nameVi: 'Viên đan cuối mùa', nameEn: 'The Last Pill of the Season', descVi: 'Mai Hoa giữ một viên đan sương cho người về sớm.', descEn: 'Meihua keeps one dew pill for whoever returns early.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['season pill', 'dan cuoi mua'], steps: [
    { id: 'get_pill', descVi: 'Lấy 1 viên đan sương.', descEn: 'Acquire 1 dew pill.', completeItems: { dew_pill: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Đưa viên đan cho Mai Hoa.', 'Give the pill to Meihua.', { dew_pill: 1 }),
  ] },

  // SIDE — market (8). Mỗi quest gắn 1 NPC chợ.
  { id: 'q_mkt_01', giverNpcId: 'n_cook_phung', nameVi: 'Nồi canh rêu nguyệt', nameEn: 'The Moonmoss Soup', descVi: 'Phụng cần rêu nguyệt tươi cho nồi canh linh.', descEn: 'Phung needs fresh moonmoss for a spirit soup.', requiredItems: {}, requiredFlags: [], rewardGold: 15, rewardItems: { pill_hp: 1 }, aliases: ['moonmoss soup', 'noi canh'], steps: [
    { id: 'get_moss', descVi: 'Hái 1 nhánh rêu nguyệt.', descEn: 'Gather 1 moon moss.', completeItems: { moon_moss: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao rêu cho Phụng.', 'Deliver the moss to Phung.', { moon_moss: 1 }),
  ] },
  { id: 'q_mkt_02', giverNpcId: 'n_pedlar_quyen', nameVi: 'Hàng thùng rách', nameEn: 'The Torn Pack', descVi: ' Quyền cần một chiếc áo choàng cũ vá lại làm màn che hàng.', descEn: 'Quyen needs an old robe to mend as a stall curtain.', requiredItems: {}, requiredFlags: [], rewardGold: 10, rewardItems: {}, aliases: ['torn pack', 'hang thung'], steps: [
    { id: 'get_robe', descVi: 'Lấy một chiếc áo choàng sờn.', descEn: 'Acquire a tattered robe.', completeItems: { tattered_robe: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao áo choàng cho Quyền.', 'Deliver the robe to Quyen.', { tattered_robe: 1 }),
  ] },
  { id: 'q_mkt_03', giverNpcId: 'n_tea_ma', nameVi: 'Trà giả rượu thật', nameEn: 'Fake Tea, True Wine', descVi: 'Mã lén nấu trà từ rượu mai hoa — thiếu nguyên liệu gấp.', descEn: 'Ma brews tea from plum qi wine — running short.', requiredItems: {}, requiredFlags: [], rewardGold: 15, rewardItems: {}, aliases: ['fake tea', 'tra gia ruou that'], steps: [
    { id: 'get_wine', descVi: 'Mua 1 bình rượu mai hoa.', descEn: 'Buy 1 flask of plum qi wine.', completeItems: { plum_qi_wine: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao rượu cho Mã.', 'Deliver the wine to Ma.', { plum_qi_wine: 1 }),
  ] },
  { id: 'q_mkt_04', giverNpcId: 'n_fortune_lien', nameVi: 'Lá số thiếu tên', nameEn: 'The Fortune Missing a Name', descVi: 'Liên không xem bói cho kẻ không có tên thật.', descEn: 'Lien will not read a fortune for the nameless.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['fortune name', 'la so thieu ten'], steps: [
    { id: 'learn_name', descVi: 'Biết được một cái tên bị xóa.', descEn: 'Learn one erased name.', completeFlags: ['story_name_known'], isTurnInStep: false },
    turnIn('report', 'Trả lại lá số cho Liên.', 'Return to Lien with the name.'),
  ] },
  { id: 'q_mkt_05', giverNpcId: 'n_auctioneer_hoan', nameVi: 'Lô hàng đấu giá kín', nameEn: 'The Sealed Auction Lot', descVi: 'Hoàn cần vật bảo đảm cho lô đấu giá của phe tà.', descEn: 'Hoan needs collateral for the dark faction\'s auction lot.', requiredItems: {}, requiredFlags: [], rewardGold: 30, rewardItems: {}, aliases: ['sealed lot', 'dau gia kin'], steps: [
    { id: 'get_charm', descVi: 'Lấy 1 vòng ngọc làm vật bảo.', descEn: 'Acquire 1 jade charm as collateral.', completeItems: { jade_charm: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Đưa vòng ngọc cho Hoàn.', 'Deliver the jade charm to Hoan.', { jade_charm: 1 }),
  ] },
  { id: 'q_mkt_06', giverNpcId: 'n_banker_tin', nameVi: 'Đổi bạc lấy tín', nameEn: 'Silver for Trust', descVi: 'Tín cần quặng thật để mở quầy cầm đồ.', descEn: 'Tin needs real ore to open the pawn counter.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['pawn trust', 'doi bac lay tin'], steps: [
    { id: 'get_ore', descVi: 'Lấy 1 mảnh quặng sắt lạnh.', descEn: 'Acquire 1 cold iron ore.', completeItems: { cold_iron_ore: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao quặng cho Tín.', 'Deliver the ore to Tin.', { cold_iron_ore: 1 }),
  ] },
  { id: 'q_mkt_07', giverNpcId: 'n_merchant_bao', nameVi: 'Bổ sung quầy binh khí', nameEn: 'Restocking the Weapon Stall', descVi: 'Bảo cần một đao gỗ sắt để trưng bày.', descEn: 'Bao needs an ironwood saber for display.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['weapon stall', 'quay binh khi'], steps: [
    { id: 'get_saber', descVi: 'Lấy 1 đao gỗ sắt.', descEn: 'Acquire 1 ironwood saber.', completeItems: { ironwood_saber: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao đao cho Bảo.', 'Deliver the saber to Bao.', { ironwood_saber: 1 }),
  ] },
  { id: 'q_mkt_08', giverNpcId: 'n_scholar_minh', nameVi: 'Chu kỳ cong queo', nameEn: 'The Crooked Cycle', descVi: 'Minh cần một bản bí kíp cong queo để đối chiếu.', descEn: 'Minh needs a crooked circulation manual to compare.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['crooked cycle', 'chu ky cong queo'], steps: [
    { id: 'get_manual', descVi: 'Lấy 1 bản bí kíp cong queo.', descEn: 'Acquire 1 crooked manual.', completeItems: { old_manual: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao cho Minh.', 'Deliver it to Minh.', { old_manual: 1 }),
  ] },

  // SIDE — Vạn Thảo Cốc + đồng linh thảo (6). Vùng thảo mộc liền mạng.
  { id: 'q_vth_01', giverNpcId: 'n_herbalist_lan', nameVi: 'Bó thuốc mùa sương', nameEn: 'The Mist-Season Remedy', descVi: 'Lan (cốc) cần rêu nguyệt để ngâm thuốc mùa sương.', descEn: 'Lan of the valley needs moonmoss for mist-season tinctures.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: { pill_qi: 1 }, aliases: ['mist remedy', 'bo thuoc mua suong'], steps: [
    { id: 'get_moss', descVi: 'Hái 2 nhánh rêu nguyệt.', descEn: 'Gather 2 moon moss.', completeItems: { moon_moss: 2 }, isTurnInStep: false },
    turnIn('deliver', 'Giao rêu cho Lan.', 'Deliver the moss to Lan.', { moon_moss: 2 }),
  ] },
  { id: 'q_vth_02', giverNpcId: 'n_gardener_vien', nameVi: 'Hạt giống mùa lạnh', nameEn: 'The Cold-Season Seed', descVi: 'Viên cần ai gieo hạt giống đầu vụ lạnh trong vườn ươm.', descEn: 'Vien needs someone to plant the first cold-season seed.', requiredItems: {}, requiredFlags: [], rewardGold: 15, rewardItems: {}, aliases: ['cold seed', 'hat giong mua lanh'], steps: [
    { id: 'plant', descVi: 'Gieo hạt trong vườn ươm của Viên.', descEn: 'Plant the seed in Vien\'s nursery.', completeFlags: ['planted_valley_seed'], isTurnInStep: false },
    turnIn('report', 'Báo đã gieo cho Viên.', 'Report the planting to Vien.'),
  ] },
  { id: 'q_vth_03', giverNpcId: 'n_beekeeper_oanh', nameVi: 'Mật ong linh đắng', nameEn: 'The Bitter Spirit Honey', descVi: 'Oanh cần đan sương để chữa tổ ong bị ngưng kết.', descEn: 'Oanh needs dew pills to cure a congealed hive.', requiredItems: {}, requiredFlags: [], rewardGold: 15, rewardItems: {}, aliases: ['spirit honey', 'mat ong linh'], steps: [
    { id: 'get_pill', descVi: 'Lấy 1 viên đan sương.', descEn: 'Acquire 1 dew pill.', completeItems: { dew_pill: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao đan cho Oanh.', 'Deliver the pill to Oanh.', { dew_pill: 1 }),
  ] },
  { id: 'q_vth_04', giverNpcId: 'n_herbalist_dan', nameVi: 'Bàn chẩn của Đàm', nameEn: 'Dan\'s Consultation Table', descVi: 'Đàm cần rêu nguyệt làm thuốc bôi ngoài.', descEn: 'Dan needs moonmoss for an external salve.', requiredItems: {}, requiredFlags: [], rewardGold: 15, rewardItems: {}, aliases: ['consultation', 'ban chan dam'], steps: [
    { id: 'get_moss', descVi: 'Lấy 1 nhánh rêu nguyệt.', descEn: 'Acquire 1 moon moss.', completeItems: { moon_moss: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao rêu cho Đàm.', 'Deliver the moss to Dan.', { moon_moss: 1 }),
  ] },
  { id: 'q_vth_05', giverNpcId: 'n_gatherer_hue', nameVi: 'Lông hạc trên màn sương', nameEn: 'A Crane Feather in Mist', descVi: 'Huệ săn lùng một chiếc lông hạc rơi giữa đồng.', descEn: 'Hue hunts a crane feather fallen across the fields.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['crane hunt', 'long hac'], steps: [
    { id: 'get_feather', descVi: 'Lấy 1 lông hạc.', descEn: 'Acquire 1 crane feather.', completeItems: { crane_feather: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao lông hạc cho Huệ.', 'Deliver the feather to Hue.', { crane_feather: 1 }),
  ] },
  { id: 'q_vth_06', giverNpcId: 'n_ox_cart_hien', nameVi: 'Cào bò về cốc', nameEn: 'The Ox Cart Return', descVi: 'Hiến cần lương khô cho chuyến cào cuối ngày.', descEn: 'Hien needs rations for the last cart run of the day.', requiredItems: {}, requiredFlags: [], rewardGold: 15, rewardItems: {}, aliases: ['ox cart', 'cao bo ve coc'], steps: [
    { id: 'get_rations', descVi: 'Lấy 2 gói lương khô.', descEn: 'Acquire 2 trail rations.', completeItems: { trail_rations: 2 }, isTurnInStep: false },
    turnIn('deliver', 'Giao lương cho Hiến.', 'Deliver the rations to Hien.', { trail_rations: 2 }),
  ] },

  // SIDE — sect (7). Mỗi quest gắn 1 NPC tông môn.
  { id: 'q_sec_01', giverNpcId: 'n_senior_lan', nameVi: 'Đấu pháp không thắng', nameEn: 'The Unwon Spar', descVi: 'Sư tỷ Lan muốn một trận đấu pháp không cần thắng.', descEn: 'Senior Lan wants a spar that need not be won.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['unwon spar', 'dau phap khong thang'], steps: [
    { id: 'spar', descVi: 'Đấu pháp với Lan đến khi cả hai tạ.', descEn: 'Spar with Lan until both yield.', completeFlags: ['won_spar_lan'], isTurnInStep: false },
    turnIn('report', 'Trở lại với Lan sau trận đấu.', 'Return to Lan after the bout.'),
  ] },
  { id: 'q_sec_02', giverNpcId: 'n_keeper_anh', nameVi: 'Cuộn cuộn sương khe', nameEn: 'The Rift-Step Scroll', descVi: 'Thủ khố Anh cần cuộn bước khe nứt để ghi sổ.', descEn: 'Keeper Anh needs a rift-step scroll to register.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['rift scroll', 'cuon buoc khe'], steps: [
    { id: 'get_scroll', descVi: 'Lấy 1 cuộn bước khe.', descEn: 'Acquire 1 rift step scroll.', completeItems: { rift_step_scroll: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao cuộn cho Anh.', 'Deliver the scroll to Anh.', { rift_step_scroll: 1 }),
  ] },
  { id: 'q_sec_03', giverNpcId: 'n_monk_thien', nameVi: 'Nghe tim phong ấn', nameEn: 'Listening to the Seal', descVi: 'Thiền sư Thiên bảo tim phong ấn còn đập.', descEn: 'Monk Thien says the seal still has a heartbeat.', requiredItems: {}, requiredFlags: [], rewardGold: 15, rewardItems: {}, aliases: ['seal heartbeat', 'nghe tim phong an'], steps: [
    { id: 'listen', descVi: 'Ngồi thiền nghe tim phong ấn cùng Thiên.', descEn: 'Sit and listen to the seal with Thien.', completeFlags: ['seal_heart_listened'], isTurnInStep: false },
    turnIn('report', 'Kể lại điều nghe được cho Thiên.', 'Tell Thien what you heard.'),
  ] },
  { id: 'q_sec_04', giverNpcId: 'n_pavilion_disciple_anh', nameVi: 'Chép lại trang bị xé', nameEn: 'Copying the Torn Page', descVi: 'Đệ tử Các Anh cần ai giúp chép lại trang bị xé.', descEn: 'Pavilion disciple Anh needs a torn page copied.', requiredItems: {}, requiredFlags: [], rewardGold: 15, rewardItems: {}, aliases: ['torn page', 'trang bi xe'], steps: [
    { id: 'copy', descVi: 'Chép lại trang bị xé trong Các.', descEn: 'Copy the torn page in the pavilion.', completeFlags: ['copied_sect_records'], isTurnInStep: false },
    turnIn('report', 'Đưa bản chép cho Anh.', 'Give the copy to Anh.'),
  ] },
  { id: 'q_sec_05', giverNpcId: 'n_master_vo', nameVi: 'Sổ điểm danh khe nứt', nameEn: 'The Rift Roll Call', descVi: 'Võ Trưởng Sư cần xác nhận Liệt Khuyển đã bị đẩy lui.', descEn: 'Master Vo needs the Rift Hound confirmed driven back.', requiredItems: {}, requiredFlags: [], rewardGold: 30, rewardItems: {}, aliases: ['roll call', 'so diem danh'], steps: [
    { id: 'defeat_hound', descVi: 'Hạ Liệt Khuyển Khe Nứt.', descEn: 'Defeat the Rift Hound.', completeFlags: ['defeated_rift_hound'], isTurnInStep: false },
    turnIn('report', 'Báo với Võ Trưởng Sư.', 'Report to Master Vo.'),
  ] },
  { id: 'q_sec_06', giverNpcId: 'n_rival_khoa', nameVi: 'Gương thứ hai', nameEn: 'The Second Mirror', descVi: 'Khoa muốn thử lại lời nhận xét trong gương.', descEn: 'Khoa wants to test the mirror\'s remark again.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['second mirror', 'guong thu hai'], steps: [
    { id: 'trust', descVi: 'Chứng tỏ tin được trước Khoa.', descEn: 'Prove trustworthy to Khoa.', completeFlags: ['story_khoa_trusted'], isTurnInStep: false },
    turnIn('report', 'Đối lại với Khoa trước gương.', 'Face Khoa before the mirror again.'),
  ] },
  { id: 'q_sec_07', giverNpcId: 'n_alchemist_sam', nameVi: 'Mẻ đan chín tầng', nameEn: 'The Ninefold Batch', descVi: 'Sâm thiếu một viên đan cửu trọng làm mẫu đối chiếu.', descEn: 'Sam lacks a ninefold pill as a comparison sample.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['ninefold batch', 'me dan chin tang'], steps: [
    { id: 'get_pill', descVi: 'Lấy 1 viên đan cửu trọng.', descEn: 'Acquire 1 ninefold pill.', completeItems: { ninefold_pill: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao mẫu cho Sâm.', 'Deliver the sample to Sam.', { ninefold_pill: 1 }),
  ] },

  // SIDE — Rừng Vân Mộ + Hang Phong Ấn (6). Vùng rừng — hang liền mạng.
  { id: 'q_for_01', giverNpcId: 'n_rogue_cultivator_nhat', nameVi: 'Đao tre không tên', nameEn: 'The Nameless Bamboo Saber', descVi: 'Nhất đổi đao tre lấy một câu nói thật.', descEn: 'Nhat trades a bamboo saber for one honest sentence.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['nameless saber', 'dao tre khong ten'], steps: [
    { id: 'get_saber', descVi: 'Lấy 1 đao tre.', descEn: 'Acquire 1 bamboo saber.', completeItems: { bamboo_saber: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao đao cho Nhất.', 'Deliver the saber to Nhat.', { bamboo_saber: 1 }),
  ] },
  { id: 'q_for_02', giverNpcId: 'n_hunter_son', nameVi: 'Hai nanh làm bẫy', nameEn: 'Two Fangs for the Snare', descVi: 'Sơn cần thêm nanh thú cho bẫy mùa sương.', descEn: 'Son needs more fangs for mist-season snares.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['snare fangs', 'hai nanh lam bay'], steps: [
    { id: 'get_fangs', descVi: 'Lấy 2 nanh thú.', descEn: 'Acquire 2 beast fangs.', completeItems: { beast_fang: 2 }, isTurnInStep: false },
    turnIn('deliver', 'Giao nanh cho Sơn.', 'Deliver the fangs to Son.', { beast_fang: 2 }),
  ] },
  { id: 'q_for_03', giverNpcId: 'n_hermit_coc', nameVi: 'Tiếng vang trong hang', nameEn: 'The Echo in the Cave', descVi: 'Cốc chủ muốn người đi hang bằng bùa hộ thân.', descEn: 'Coc wants someone to walk the cave under a ward.', requiredItems: {}, requiredFlags: [], rewardGold: 30, rewardItems: {}, aliases: ['cave echo', 'tieng vang trong hang'], steps: [
    { id: 'enter_warded', descVi: 'Vào Hang Phong Ấn cùng bùa hộ thân.', descEn: 'Enter the Sealed Cave under a ward.', completeFlags: ['visitedCaveWarded'], isTurnInStep: false },
    turnIn('report', 'Trở ra và báo với Cốc chủ.', 'Return and report to Coc.'),
  ] },
  { id: 'q_for_04', giverNpcId: 'n_lost_soul_ha', nameVi: 'Vong hồn khát rượu', nameEn: 'The Thirsty Lost Soul', descVi: 'Hà chỉ nhớ mùi rượu mai hoa của ngày cưới.', descEn: 'Ha remembers only the plum wine of a wedding day.', requiredItems: {}, requiredFlags: [], rewardGold: 10, rewardItems: {}, aliases: ['thirsty soul', 'vong hon khat ruou'], steps: [
    { id: 'get_wine', descVi: 'Lấy 1 bình rượu mai hoa.', descEn: 'Acquire 1 plum qi wine.', completeItems: { plum_qi_wine: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Đặt rượu trước vong hồn Hà.', 'Set the wine before Ha.', { plum_qi_wine: 1 }),
  ] },
  { id: 'q_for_05', giverNpcId: 'n_ward_carver_khue', nameVi: 'Vật khắc thử bùa', nameEn: 'Testing the Carved Ward', descVi: 'Khê cần bùa xương để thử tay khắc mới.', descEn: 'Khue needs bone charms to test a new carving hand.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['carved ward', 'vay khac thua bua'], steps: [
    { id: 'get_charm', descVi: 'Lấy 1 bùa hộ thân xương.', descEn: 'Acquire 1 bone ward charm.', completeItems: { bone_ward_charm: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao bùa cho Khê.', 'Deliver the charm to Khue.', { bone_ward_charm: 1 }),
  ] },
  { id: 'q_for_06', giverNpcId: 'n_woodcutter_bong', nameVi: 'Đường rút vào rừng', nameEn: 'The Retreating Path', descVi: 'Bồng muốn đánh dấu đường rút trong rừng bằng quặng sắt lạnh.', descEn: 'Bong wants a retreat path in the forest marked with cold iron.', requiredItems: {}, requiredFlags: [], rewardGold: 15, rewardItems: {}, aliases: ['retreat path', 'duong rut vao rung'], steps: [
    { id: 'get_ore', descVi: 'Lấy 1 mảnh quặng sắt lạnh.', descEn: 'Acquire 1 cold iron ore.', completeItems: { cold_iron_ore: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao quặng cho Bồng.', 'Deliver the ore to Bong.', { cold_iron_ore: 1 }),
  ] },

  // SIDE — Khe Nứt Nguyền + Đỉnh Băng (9 phần 1: rif 5).
  { id: 'q_rif_01', giverNpcId: 'n_wandering_blade_phong', nameVi: 'Lưỡi đao không chủ', nameEn: 'The Masterless Blade', descVi: 'Phong rao bán lại đao gỗ sắt của kẻ đã chết.', descEn: 'Phong resells an ironwood saber of a dead man.', requiredItems: {}, requiredFlags: [], rewardGold: 30, rewardItems: {}, aliases: ['masterless blade', 'luoi dao khong chu'], steps: [
    { id: 'get_saber', descVi: 'Lấy 1 đao gỗ sắt.', descEn: 'Acquire 1 ironwood saber.', completeItems: { ironwood_saber: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao đao cho Phong.', 'Deliver the saber to Phong.', { ironwood_saber: 1 }),
  ] },
  { id: 'q_rif_02', giverNpcId: 'n_exile_ba', nameVi: 'Giấc ngủ yên của kẻ lưu đày', nameEn: 'The Exile\'s Quiet Night', descVi: 'Bá ngủ được khi Liệt Khuyển không còn gầm.', descEn: 'Ba sleeps only when the Rift Hound howls no more.', requiredItems: {}, requiredFlags: [], rewardGold: 35, rewardItems: {}, aliases: ['quiet night', 'giac ngu yen'], steps: [
    { id: 'defeat_hound', descVi: 'Hạ Liệt Khuyển Khe Nứt.', descEn: 'Defeat the Rift Hound.', completeFlags: ['defeated_rift_hound'], isTurnInStep: false },
    turnIn('report', 'Báo với Bá.', 'Report to Ba.'),
  ] },
  { id: 'q_rif_03', giverNpcId: 'n_exorcist_diem', nameVi: 'Hàng bùa dự trữ', nameEn: 'The Ward Stockpile', descVi: 'Diễm cần 2 bùa xương cho ca canh đêm.', descEn: 'Diem needs 2 bone charms for the night watch.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['ward stock', 'hang bua du tru'], steps: [
    { id: 'get_charms', descVi: 'Lấy 2 bùa hộ thân xương.', descEn: 'Acquire 2 bone ward charms.', completeItems: { bone_ward_charm: 2 }, isTurnInStep: false },
    turnIn('deliver', 'Giao bùa cho Diễm.', 'Deliver the charms to Diem.', { bone_ward_charm: 2 }),
  ] },
  { id: 'q_rif_04', giverNpcId: 'n_relic_hunter_bach', nameVi: 'Mặt dây được nhặt', nameEn: 'The Salvaged Pendant', descVi: 'Bạch cần mặt dây nguyệt thạch để so với hiện vật tro xương.', descEn: 'Bach needs a moonstone pendant to compare with a bone-ash relic.', requiredItems: {}, requiredFlags: [], rewardGold: 30, rewardItems: {}, aliases: ['salvaged pendant', 'mat day duoc nhat'], steps: [
    { id: 'get_pendant', descVi: 'Lấy 1 mặt dây nguyệt thạch.', descEn: 'Acquire 1 moonstone pendant.', completeItems: { moonstone_pendant: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao mặt dây cho Bạch.', 'Deliver the pendant to Bach.', { moonstone_pendant: 1 }),
  ] },
  { id: 'q_rif_05', giverNpcId: 'n_name_collector_tra', nameVi: 'Tên viết trên khe', nameEn: 'A Name Written on the Rift', descVi: 'Trà viết tên bị xóa sát mép khe nứt để chúng không bay mất.', descEn: 'Tra writes erased names near the rift edge so they do not drift away.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['rift name', 'ten viet tren khe'], steps: [
    { id: 'learn_name', descVi: 'Biết một cái tên bị xóa.', descEn: 'Learn one erased name.', completeFlags: ['story_name_known'], isTurnInStep: false },
    turnIn('report', 'Đọc tên cho Trà ghi lại.', 'Read the name aloud for Tra to record.'),
  ] },

  // SIDE — Đỉnh Băng (4).
  { id: 'q_frz_01', giverNpcId: 'n_ice_hermit_bang', nameVi: 'Rêu dưới tuyết', nameEn: 'Moss Beneath Snow', descVi: 'Băng Tâm cần rêu nguyệt mọc dưới lớp tuyết mỏng.', descEn: 'Bang Tam needs moonmoss growing under thin snow.', requiredItems: {}, requiredFlags: [], rewardGold: 30, rewardItems: {}, aliases: ['moss snow', 'reu duoi tuyet'], steps: [
    { id: 'get_moss', descVi: 'Lấy 2 nhánh rêu nguyệt.', descEn: 'Acquire 2 moon moss.', completeItems: { moon_moss: 2 }, isTurnInStep: false },
    turnIn('deliver', 'Giao rêu cho Băng Tâm.', 'Deliver the moss to Bang Tam.', { moon_moss: 2 }),
  ] },
  { id: 'q_frz_02', giverNpcId: 'n_snow_guard_han', nameVi: 'Ca tuyết dài hơn dự kiến', nameEn: 'The Longer Snow Watch', descVi: 'Hàn hết lương giữa ca tuyết.', descEn: 'Han ran out of rations mid-watch.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['snow watch', 'ca tuyet'], steps: [
    { id: 'get_rations', descVi: 'Lấy 2 gói lương khô.', descEn: 'Acquire 2 trail rations.', completeItems: { trail_rations: 2 }, isTurnInStep: false },
    turnIn('deliver', 'Giao lương cho Hàn.', 'Deliver the rations to Han.', { trail_rations: 2 }),
  ] },
  { id: 'q_frz_03', giverNpcId: 'n_crane_spirit', nameVi: 'Nest tuyết của tiên hạc', nameEn: 'The Crane\'s Snow Nest', descVi: 'Tiên Hạc nhặt lông rơi để lót nest tuyết.', descEn: 'The Crane Spirit gathers fallen feathers for its snow nest.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['snow nest', 'nest tuyet'], steps: [
    { id: 'get_feathers', descVi: 'Lấy 2 lông hạc.', descEn: 'Acquire 2 crane feathers.', completeItems: { crane_feather: 2 }, isTurnInStep: false },
    turnIn('deliver', 'Giao lông cho Tiên Hạc.', 'Deliver the feathers to the Crane Spirit.', { crane_feather: 2 }),
  ] },
  { id: 'q_frz_04', giverNpcId: 'n_monk_nhu', nameVi: 'Thiền giữa lạnh giá', nameEn: 'Meditation in the Freeze', descVi: 'Như muốn một người ngồi thiền cùng trên đỉnh băng.', descEn: 'Nhu wants someone to sit with him on the frozen peak.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['freeze meditation', 'thien giua lanh gia'], steps: [
    { id: 'meditate', descVi: 'Ngồi thiền với Như trên Đỉnh Mây.', descEn: 'Meditate with Nhu on Cloud Peak.', completeFlags: ['meditated_cloud_peak'], isTurnInStep: false },
    turnIn('report', 'Cùng Như thả hơi thở cuối cùng của buổi thiền.', 'Close the sitting with Nhu.'),
  ] },

  // SIDE — Sa Mạc Hắc Phong + Hồ Nguyệt (6).
  { id: 'q_dun_01', giverNpcId: 'n_caravan_duong', nameVi: 'Đoàn xe cần lương', nameEn: 'The Caravan Needs Food', descVi: 'Dương cần 3 gói lương cho chặng sa mạc dài.', descEn: 'Duong needs 3 rations for the long dune leg.', requiredItems: {}, requiredFlags: [], rewardGold: 35, rewardItems: {}, aliases: ['caravan food', 'doan xe can luong'], steps: [
    { id: 'get_rations', descVi: 'Lấy 3 gói lương khô.', descEn: 'Acquire 3 trail rations.', completeItems: { trail_rations: 3 }, isTurnInStep: false },
    turnIn('deliver', 'Giao lương cho Dương.', 'Deliver the rations to Duong.', { trail_rations: 3 }),
  ] },
  { id: 'q_dun_02', giverNpcId: 'n_dune_guide_sa', nameVi: 'Áo choàng che gió cát', nameEn: 'A Coat Against the Sand', descVi: 'Sa cần áo du hành dày để dẫn đường ban đêm.', descEn: 'Sa needs a traveler\'s coat to guide at night.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['sand coat', 'ao che gio cat'], steps: [
    { id: 'get_coat', descVi: 'Lấy 1 áo du hành.', descEn: 'Acquire 1 traveler\'s coat.', completeItems: { travelers_coat: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao áo cho Sa.', 'Deliver the coat to Sa.', { travelers_coat: 1 }),
  ] },
  { id: 'q_dun_03', giverNpcId: 'n_swordsman_diep', nameVi: 'Nghiệp khách giữa cát', nameEn: 'The Blade in the Sand', descVi: 'Điệp thách người sống sót qua ca tuần sa mạc.', descEn: 'Diep challenges anyone to survive a dune patrol.', requiredItems: {}, requiredFlags: [], rewardGold: 30, rewardItems: {}, aliases: ['blade sand', 'nghiep khach giua cat'], steps: [
    { id: 'patrol', descVi: 'Sống sót ca tuần sa mạc với Điệp.', descEn: 'Survive a dune patrol with Diep.', completeFlags: ['defeated_dune_blaze_hound'], isTurnInStep: false },
    turnIn('report', 'Đối lại với Điệp khi mặt trời lặn.', 'Face Diep again at sundown.'),
  ] },
  { id: 'q_lak_01', giverNpcId: 'n_lake_keeper_trang', nameVi: 'Sóng hồ đừng kể tên', nameEn: 'The Lake Keeps No Names', descVi: 'Trang cần ai làm dịu sóng hồ trước đêm gọi tên.', descEn: 'Trang needs the lake calmed before the naming night.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['calm lake', 'song ho dung ke ten'], steps: [
    { id: 'calm', descVi: 'Làm dịu sóng hồ Nguyệt.', descEn: 'Calm the Moon Lake tide.', completeFlags: ['calmed_lake_tide'], isTurnInStep: false },
    turnIn('report', 'Báo với Trang.', 'Report to Trang.'),
  ] },
  { id: 'q_lak_02', giverNpcId: 'n_ferryman_cau', nameVi: 'Hơi thở thủy triều', nameEn: 'Breath of the Tide', descVi: 'Cậu cần bản bí kíp hô hấp thủy triều cho chuyến đò đêm.', descEn: 'Cau needs the tide breath manual for the night ferry.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['tide breath ferry', 'hoi tho thuy trieu'], steps: [
    { id: 'get_tide', descVi: 'Lấy 1 bản bí kíp hô hấp thủy triều.', descEn: 'Acquire 1 tide breath manual.', completeItems: { tide_breath_manual: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao cho Cậu.', 'Deliver it to Cau.', { tide_breath_manual: 1 }),
  ] },
  { id: 'q_lak_03', giverNpcId: 'n_fisher_yen', nameVi: 'Câu cá dưới trăng', nameEn: 'Fishing Under the Moon', descVi: 'Ngư phu Yến cần lương cho đêm câu dài.', descEn: 'Fisher Yen needs rations for a long night of fishing.', requiredItems: {}, requiredFlags: [], rewardGold: 15, rewardItems: {}, aliases: ['moon fishing', 'cau ca duoi trang'], steps: [
    { id: 'get_rations', descVi: 'Lấy 1 gói lương khô.', descEn: 'Acquire 1 trail ration.', completeItems: { trail_rations: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao lương cho Yến.', 'Deliver the rations to Yen.', { trail_rations: 1 }),
  ] },

  // SECRET (16) — secret: true, mở bằng 1–2 flag gợi ý.
  { id: 'q_secret_vil_01', giverNpcId: 'n_elder_meihua', nameVi: 'Mảnh vườn dính máu', nameEn: 'The Blood-Stained Garden', descVi: 'Mai Hoa không nói về mảnh vườn đã thấy máu 12 năm trước.', descEn: 'Meihua will not speak of the garden that saw blood twelve years ago.', requiredItems: {}, requiredFlags: ['found_blood_field'], rewardGold: 55, rewardItems: {}, aliases: ['blood garden', 'manh vuon mau'], secret: true, steps: [
    { id: 'ask_meihua', descVi: 'Hỏi Mai Hoa về mảnh vườn dính máu.', descEn: 'Ask Meihua about the blood-stained garden.', completeNpcTalk: 'n_elder_meihua', isTurnInStep: false },
    turnIn('return', 'Trở lại đóng cánh cổng vườn cùng Mai Hoa.', 'Return to close the garden gate with Meihua.'),
  ] },
  { id: 'q_secret_vil_02', giverNpcId: 'n_storyteller_ngo', nameVi: 'Cái tên thứ ba', nameEn: 'The Third Name', descVi: 'Một trang khác trong sổ của Ngô chưa từng đọc thành tiếng.', descEn: 'Another page in Ngo\'s book has never been read aloud.', requiredItems: {}, requiredFlags: ['name_third_remembered'], rewardGold: 55, rewardItems: {}, aliases: ['third name', 'cai ten thu ba'], secret: true, steps: [
    { id: 'ask_ngo', descVi: 'Nhờ Ngô đọc cái tên thứ ba.', descEn: 'Ask Ngo to read the third name.', completeNpcTalk: 'n_storyteller_ngo', isTurnInStep: false },
    turnIn('return', 'Gọi tên cùng Ngô một lần.', 'Call the name once with Ngo.'),
  ] },
  { id: 'q_secret_mkt_01', giverNpcId: 'n_auctioneer_hoan', nameVi: 'Lô máu dưới sàn', nameEn: 'The Blood Lot Below', descVi: 'Dưới sàn đấu giá có một lô không nằm trong danh sách.', descEn: 'Beneath the auction floor sits a lot not on any list.', requiredItems: {}, requiredFlags: ['auction_blood_lot_seen'], rewardGold: 50, rewardItems: {}, aliases: ['blood lot', 'lo mau duoi san'], secret: true, steps: [
    { id: 'ask_hoan', descVi: 'Hỏi Hoàn về lô máu.', descEn: 'Ask Hoan about the blood lot.', completeNpcTalk: 'n_auctioneer_hoan', isTurnInStep: false },
    turnIn('return', 'Đóng phiên cùng Hoàn.', 'Close the session with Hoan.'),
  ] },
  { id: 'q_secret_mkt_02', giverNpcId: 'n_banker_tin', nameVi: 'Sổ cầm nợ chết', nameEn: 'The Pawn Ledger of the Dead', descVi: 'Một trang sổ của Tín ghi nợ của người đã bị xóa tên.', descEn: 'One page of Tin\'s ledger records debts of the nameless dead.', requiredItems: {}, requiredFlags: ['ledger_pawned_debt'], rewardGold: 50, rewardItems: {}, aliases: ['dead ledger', 'so cam no chet'], secret: true, steps: [
    { id: 'ask_tin', descVi: 'Hỏi Tín về trang sổ kia.', descEn: 'Ask Tin about that ledger page.', completeNpcTalk: 'n_banker_tin', isTurnInStep: false },
    turnIn('return', 'Niêm phong trang sổ cùng Tín.', 'Seal the ledger page with Tin.'),
  ] },
  { id: 'q_secret_vth_01', giverNpcId: 'n_gardener_vien', nameVi: 'Hoa nở giữa đêm', nameEn: 'The Midnight Bloom', descVi: 'Trong vườn ươm có loài hoa chỉ nở khi không ai nhìn.', descEn: 'In the nursery blooms a flower that opens only unwatched.', requiredItems: {}, requiredFlags: ['valley_night_bloom_seen'], rewardGold: 50, rewardItems: {}, aliases: ['midnight bloom', 'hoa no dem'], secret: true, steps: [
    { id: 'ask_vien', descVi: 'Hỏi Viên về loài hoa đêm.', descEn: 'Ask Vien about the night flower.', completeNpcTalk: 'n_gardener_vien', isTurnInStep: false },
    turnIn('return', 'Trồng lại hạt cùng Viên.', 'Replant the seed with Vien.'),
  ] },
  { id: 'q_secret_vth_02', giverNpcId: 'n_beekeeper_oanh', nameVi: 'Bài hát gọi ong chúa', nameEn: 'The Song for the Queen Bee', descVi: 'Oanh hát một bài chỉ ong linh hiểu.', descEn: 'Oanh sings a song only spirit bees understand.', requiredItems: {}, requiredFlags: ['honey_moon_song_heard'], rewardGold: 45, rewardItems: {}, aliases: ['bee song', 'bai hat goi ong'], secret: true, steps: [
    { id: 'ask_oanh', descVi: 'Hỏi Oanh về bài hát gọi ong.', descEn: 'Ask Oanh about the bee song.', completeNpcTalk: 'n_beekeeper_oanh', isTurnInStep: false },
    turnIn('return', 'Nghe hết một đêm hát cùng Oanh.', 'Hear a full night of song with Oanh.'),
  ] },
  { id: 'q_secret_sec_01', giverNpcId: 'n_monk_thien', nameVi: 'Tim của phong ấn', nameEn: 'The Heart of the Seal', descVi: 'Thiên nói phong ấn không ngăn thứ gì đó — nó nuôi thứ đó.', descEn: 'Thien says the seal does not hold something back — it feeds it.', requiredItems: {}, requiredFlags: ['seal_heart_listened'], rewardGold: 55, rewardItems: {}, aliases: ['seal heart', 'tim cua phong an'], secret: true, steps: [
    { id: 'ask_thien', descVi: 'Hỏi Thiên tim phong ấn nuôi gì.', descEn: 'Ask Thien what the seal feeds.', completeNpcTalk: 'n_monk_thien', isTurnInStep: false },
    turnIn('return', 'Ngồi lại với Thiên cho đến canh khuya.', 'Sit again with Thien until deep night.'),
  ] },
  { id: 'q_secret_sec_02', giverNpcId: 'n_keeper_anh', nameVi: 'Niêm phong trong kho', nameEn: 'The Seal in the Vault', descVi: 'Trong kho của Anh có một ấn chưa từng có người ký.', descEn: 'In Anh\'s vault lies a seal no one has ever signed.', requiredItems: {}, requiredFlags: ['archive_seal_broken'], rewardGold: 55, rewardItems: {}, aliases: ['vault seal', 'niem phong trong kho'], secret: true, steps: [
    { id: 'ask_anh', descVi: 'Hỏi Anh về ấn chưa ký.', descEn: 'Ask Anh about the unsigned seal.', completeNpcTalk: 'n_keeper_anh', isTurnInStep: false },
    turnIn('return', 'Ghi tên mình vào biên bản cùng Anh.', 'Write your name into the record with Anh.'),
  ] },
  { id: 'q_secret_for_01', giverNpcId: 'n_rogue_cultivator_nhat', nameVi: 'Lời thì thầm theo mùi', nameEn: 'The Whisper on the Scent', descVi: 'Nhất theo một lời thì thầm vào sâu rừng và không kể lại được.', descEn: 'Nhat followed a whisper deep into the forest and cannot retell it.', requiredItems: {}, requiredFlags: ['forest_whisper_followed'], rewardGold: 50, rewardItems: {}, aliases: ['forest whisper', 'loi thi tham theo mui'], secret: true, steps: [
    { id: 'ask_nhat', descVi: 'Hỏi Nhất về lời thì thầm.', descEn: 'Ask Nhat about the whisper.', completeNpcTalk: 'n_rogue_cultivator_nhat', isTurnInStep: false },
    turnIn('return', 'Đốt một lá bùa cùng Nhất.', 'Burn a ward charm with Nhat.'),
  ] },
  { id: 'q_secret_for_02', giverNpcId: 'n_hunter_son', nameVi: 'Đất đỏ ngoài lưới', nameEn: 'Red Earth Beyond the Nets', descVi: 'Sơn tìm thấy một mảnh đất đỏ không phải của thú rừng.', descEn: 'Son found a patch of red earth that belongs to no forest beast.', requiredItems: {}, requiredFlags: ['blood_field_found'], rewardGold: 45, rewardItems: {}, aliases: ['red earth', 'dat do ngoi luoi'], secret: true, steps: [
    { id: 'ask_son', descVi: 'Hỏi Sơn về mảnh đất đỏ.', descEn: 'Ask Son about the red earth.', completeNpcTalk: 'n_hunter_son', isTurnInStep: false },
    turnIn('return', 'Chôn mũi tên cuối cùng cùng Sơn.', 'Bury the last arrow with Son.'),
  ] },
  { id: 'q_secret_rif_01', giverNpcId: 'n_exile_ba', nameVi: 'Tiếng kêu ghi lại', nameEn: 'The Recorded Wail', descVi: 'Bá ghi lại tiếng kêu của khe nứt vào vỏ trứng.', descEn: 'Ba records the rift\'s wail onto eggshell.', requiredItems: {}, requiredFlags: ['rift_wail_recorded'], rewardGold: 55, rewardItems: {}, aliases: ['recorded wail', 'tieng keu ghi lai'], secret: true, steps: [
    { id: 'ask_ba', descVi: 'Hỏi Bá về tiếng kêu đã ghi.', descEn: 'Ask Ba about the recorded wail.', completeNpcTalk: 'n_exile_ba', isTurnInStep: false },
    turnIn('return', 'Nghe lại bản ghi cùng Bá.', 'Play back the recording with Ba.'),
  ] },
  { id: 'q_secret_rif_02', giverNpcId: 'n_exorcist_diem', nameVi: 'Vết thương của phong ấn', nameEn: 'The Seal\'s Wound', descVi: 'Diễm vẽ bản đồ các vết nứt trên phong ấn.', descEn: 'Diem maps the cracks across the seal.', requiredItems: {}, requiredFlags: ['seal_wound_mapped'], rewardGold: 55, rewardItems: {}, aliases: ['seal wound', 'vet thuong phong an'], secret: true, steps: [
    { id: 'ask_diem', descVi: 'Hỏi Diễm về bản đồ vết nứt.', descEn: 'Ask Diem about the crack map.', completeNpcTalk: 'n_exorcist_diem', isTurnInStep: false },
    turnIn('return', 'Đóng dấu bản đồ cùng Diễm.', 'Stamp the map with Diem.'),
  ] },
  { id: 'q_secret_frz_01', giverNpcId: 'n_ice_hermit_bang', nameVi: 'Đường HÀNH dưới băng', nameEn: 'The HÀNH Path Under Ice', descVi: 'Băng Tâm giữ một đường đi chỉ mở với người gọi được tên.', descEn: 'Bang Tam keeps a path that opens only for those who call a name.', requiredItems: {}, requiredFlags: ['ice_path_hanh_opened'], rewardGold: 55, rewardItems: {}, aliases: ['hanh path', 'duong hanh duoi bang'], secret: true, steps: [
    { id: 'ask_bang', descVi: 'Hỏi Băng Tâm về đường HÀNH.', descEn: 'Ask Bang Tam about the HÀNH path.', completeNpcTalk: 'n_ice_hermit_bang', isTurnInStep: false },
    turnIn('return', 'Niêm lấp đường băng cùng Băng Tâm.', 'Re-seal the ice path with Bang Tam.'),
  ] },
  { id: 'q_secret_frz_02', giverNpcId: 'n_snow_guard_han', nameVi: 'Ca tuần không trở về', nameEn: 'The Watch That Never Returned', descVi: 'Một ca tuần của Hàn biến mất trong sương trắng.', descEn: 'One of Han\'s watches vanished into white fog.', requiredItems: {}, requiredFlags: ['frost_patrol_lost_found'], rewardGold: 45, rewardItems: {}, aliases: ['lost watch', 'ca tuan khong tro ve'], secret: true, steps: [
    { id: 'ask_han', descVi: 'Hỏi Hàn về ca tuần mất tích.', descEn: 'Ask Han about the missing watch.', completeNpcTalk: 'n_snow_guard_han', isTurnInStep: false },
    turnIn('return', 'Đóng băng dấu chân cùng Hàn.', 'Freeze the footprints shut with Han.'),
  ] },
  { id: 'q_secret_lak_01', giverNpcId: 'n_lake_keeper_trang', nameVi: 'Ánh phản chiếu có tên', nameEn: 'The Reflection With a Name', descVi: 'Hồ Nguyệt trả lại gương mặt của người khác cho một ai đó.', descEn: 'Moon Lake returns someone else\'s face to a certain visitor.', requiredItems: {}, requiredFlags: ['moon_reflection_named'], rewardGold: 50, rewardItems: {}, aliases: ['named reflection', 'anh phan chieu co ten'], secret: true, steps: [
    { id: 'ask_trang', descVi: 'Hỏi Trang về ánh phản chiếu.', descEn: 'Ask Trang about the reflection.', completeNpcTalk: 'n_lake_keeper_trang', isTurnInStep: false },
    turnIn('return', 'Thả một chiếc đèn cùng Trang.', 'Release a lantern with Trang.'),
  ] },
  { id: 'q_secret_lak_02', giverNpcId: 'n_ferryman_cau', nameVi: 'Chuông chìm được vớt', nameEn: 'The Hauled Drowned Bell', descVi: 'Cậu vớt được một chiếc chuông không ai đánh giỏi.', descEn: 'Cau hauled up a bell no one dares ring.', requiredItems: {}, requiredFlags: ['drowned_bell_hauled'], rewardGold: 45, rewardItems: {}, aliases: ['drowned bell', 'chuong chim duoc vot'], secret: true, steps: [
    { id: 'ask_cau', descVi: 'Hỏi Cậu về chiếc chuông chìm.', descEn: 'Ask Cau about the drowned bell.', completeNpcTalk: 'n_ferryman_cau', isTurnInStep: false },
    turnIn('return', 'Chìm chuông lại cùng Cậu.', 'Sink the bell again with Cau.'),
  ] },

  // TIMED (15) — deadlineDays 1–3, mỗi quest gắn NPC vùng hợp lý.
  { id: 'q_timed_01', giverNpcId: 'n_archivist_thu', nameVi: 'Mượn sách có hạn', nameEn: 'A Borrowing Deadline', descVi: 'Thư muốn người đọc xong cuốn cấm trước khi ấn thư đóng.', descEn: 'Thu wants the forbidden volume read before the archive closes.', requiredItems: {}, requiredFlags: [], rewardGold: 30, rewardItems: {}, aliases: ['borrow deadline', 'muon sach co han'], deadlineDays: 2, steps: [
    { id: 'read_volume', descVi: 'Đọc cuốn cấm trong Thanh Vân Các.', descEn: 'Read the forbidden volume in the Azure Pavilion.', completeNpcTalk: 'n_archivist_thu', isTurnInStep: false },
    turnIn('return', 'Trả sách đúng hạn cho Thư.', 'Return the book to Thu on time.'),
  ] },
  { id: 'q_timed_02', giverNpcId: 'n_judge_quang', nameVi: 'Vật chứng trước giờ tòa', nameEn: 'Evidence Before the Court', descVi: 'Quang cần vật chứng route sự thật trước phiên xét xử ngày 18.', descEn: 'Quang needs the truth-route evidence before the trial on the 18th.', requiredItems: {}, requiredFlags: [], rewardGold: 35, rewardItems: {}, aliases: ['court evidence', 'vat chung truoc gio toa'], deadlineDays: 1, steps: [
    { id: 'get_evidence', descVi: 'Lấy 1 vật chứng route sự thật.', descEn: 'Acquire 1 truth-route evidence.', completeItems: { evidence_route_truth: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Nộp vật chứng cho Quang.', 'Hand the evidence to Quang.', { evidence_route_truth: 1 }),
  ] },
  { id: 'q_timed_03', giverNpcId: 'n_tamer_hac', nameVi: 'Ba ngày thuần thú đầu', nameEn: 'Three Days to First Tame', descVi: 'Hạc muốn một con thú được thuần trong ba ngày.', descEn: 'Hac wants a beast tamed within three days.', requiredItems: {}, requiredFlags: [], rewardGold: 40, rewardItems: {}, aliases: ['first tame', 'ba ngay thuan thu dau'], deadlineDays: 3, steps: [
    { id: 'tame', descVi: 'Thuần hóa con thú đầu tiên.', descEn: 'Tame your first beast.', completeFlags: ['first_beast_tamed'], isTurnInStep: false },
    turnIn('report', 'Trở lại với Hạc cùng con thú.', 'Return to Hac with the beast.'),
  ] },
  { id: 'q_timed_04', giverNpcId: 'n_beast_singer_my', nameVi: 'Lời ca phải được đáp', nameEn: 'The Song Must Be Answered', descVi: 'Mỹ hát gọi thú trong hai đêm — cần một tiếng đáp.', descEn: 'My sings for beasts over two nights — one answer is needed.', requiredItems: {}, requiredFlags: [], rewardGold: 30, rewardItems: {}, aliases: ['song answered', 'loi ca phai duoc dap'], deadlineDays: 2, steps: [
    { id: 'answer', descVi: 'Được một con thú đáp lời ca của Mỹ.', descEn: 'Have a beast answer My\'s song.', completeFlags: ['beast_song_answered'], isTurnInStep: false },
    turnIn('report', 'Kể lại tiếng đáp cho Mỹ.', 'Tell My of the answer.'),
  ] },
  { id: 'q_timed_05', giverNpcId: 'n_dice_master_luc', nameVi: 'Nợ xúc xắc một đêm', nameEn: 'One Night of Dice Debt', descVi: 'Lục đòi món nợ cược trong đúng một đêm.', descEn: 'Luc collects a gambling debt within a single night.', requiredItems: {}, requiredFlags: [], rewardGold: 45, rewardItems: {}, aliases: ['dice debt', 'no xuc xac mot dem'], deadlineDays: 1, steps: [
    { id: 'get_charm', descVi: 'Chuộc lại 1 vòng ngọc đã cầm.', descEn: 'Buy back 1 pawned jade charm.', completeItems: { jade_charm: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Trả vòng ngọc cho Lục.', 'Give the jade charm to Luc.', { jade_charm: 1 }),
  ] },
  { id: 'q_timed_06', giverNpcId: 'n_map_seller_man', nameVi: 'Mực bản đồ đang khô', nameEn: 'The Map Ink Drying', descVi: 'Mãn cần lông hạc làm bút trước khi mực khô.', descEn: 'Man needs a crane feather as a pen before the ink dries.', requiredItems: {}, requiredFlags: [], rewardGold: 30, rewardItems: {}, aliases: ['map ink', 'muc ban do dang kho'], deadlineDays: 3, steps: [
    { id: 'get_feather', descVi: 'Lấy 1 lông hạc.', descEn: 'Acquire 1 crane feather.', completeItems: { crane_feather: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao lông cho Mãn.', 'Deliver the feather to Man.', { crane_feather: 1 }),
  ] },
  { id: 'q_timed_07', giverNpcId: 'n_broker_tieu', nameVi: 'Hợp chợ hai ngày', nameEn: 'A Two-Day Market Deal', descVi: 'Tiêu cần tơ vân để chốt hợp đồng chợ lửng.', descEn: 'Tieu needs cloudsilk to close the wandering market deal.', requiredItems: {}, requiredFlags: [], rewardGold: 40, rewardItems: {}, aliases: ['market deal', 'hop cho hai ngay'], deadlineDays: 2, steps: [
    { id: 'get_silk', descVi: 'Lấy 2 cuộn tơ vân.', descEn: 'Acquire 2 cloudsilk threads.', completeItems: { cloudsilk_thread: 2 }, isTurnInStep: false },
    turnIn('deliver', 'Giao tơ cho Tiêu.', 'Deliver the silk to Tieu.', { cloudsilk_thread: 2 }),
  ] },
  { id: 'q_timed_08', giverNpcId: 'n_beast_tamer_le', nameVi: 'Tuần canh sườn thú', nameEn: 'The Ridge Patrol Shift', descVi: 'Lệ giao ca tuần Sườn Thú trong ba ngày.', descEn: 'Le assigns a three-day patrol of Spirit Beast Ridge.', requiredItems: {}, requiredFlags: [], rewardGold: 35, rewardItems: {}, aliases: ['ridge patrol', 'tuan canh suon thu'], deadlineDays: 3, steps: [
    { id: 'patrol', descVi: 'Hoàn thành ca tuần Sườn Thú.', descEn: 'Complete the ridge patrol.', completeFlags: ['beast_ridge_patrolled'], isTurnInStep: false },
    turnIn('report', 'Báo với Lệ.', 'Report to Le.'),
  ] },
  { id: 'q_timed_09', giverNpcId: 'n_storyteller_ngo', nameVi: 'Truyện đêm phải kể đủ', nameEn: 'The Night Story Must Finish', descVi: 'Ngô chỉ kể một đêm — người nghe phải về đúng giờ.', descEn: 'Ngo tells the story one night only — listeners must return in time.', requiredItems: {}, requiredFlags: [], rewardGold: 30, rewardItems: {}, aliases: ['night story', 'truyen dem phai ke du'], deadlineDays: 1, steps: [
    { id: 'listen', descVi: 'Nghe truyện đêm của Ngô.', descEn: 'Hear Ngo\'s night story.', completeNpcTalk: 'n_storyteller_ngo', isTurnInStep: false },
    turnIn('return', 'Kể lại đoạn nhớ được cho Ngô.', 'Retell what you remember to Ngo.'),
  ] },
  { id: 'q_timed_10', giverNpcId: 'n_innkeeper_hanh', nameVi: 'Phòng cho vị khách bí ẩn', nameEn: 'A Room for the Hidden Guest', descVi: 'Hạnh cần dọn phòng trong hai ngày.', descEn: 'Hanh needs a room prepared within two days.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['hidden guest', 'phong cho khach bi an'], deadlineDays: 2, steps: [
    { id: 'get_rations', descVi: 'Lấy 1 gói lương khô chào khách.', descEn: 'Acquire 1 trail ration for the guest.', completeItems: { trail_rations: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao lương cho Hạnh.', 'Deliver the ration to Hanh.', { trail_rations: 1 }),
  ] },
  { id: 'q_timed_11', giverNpcId: 'n_guard_truong', nameVi: 'Diễn tập phá cổng', nameEn: 'The Gate Breach Drill', descVi: 'Trường diễn tập phòng thủ cổng trong ba ngày.', descEn: 'Truong drills the gate defense within three days.', requiredItems: {}, requiredFlags: [], rewardGold: 35, rewardItems: {}, aliases: ['gate drill', 'dien tap pha cong'], deadlineDays: 3, steps: [
    { id: 'drill', descVi: 'Hoàn thành diễn tập dọn trư nha.', descEn: 'Complete the boar-clearing drill.', completeFlags: ['defeated_mist_boar'], isTurnInStep: false },
    turnIn('report', 'Báo kết quả diễn tập cho Trường.', 'Report the drill to Truong.'),
  ] },
  { id: 'q_timed_12', giverNpcId: 'n_herbalist_dan', nameVi: 'Sốt mùa sương', nameEn: 'Mist-Season Fever', descVi: 'Đàn cần rêu nguyệt ngay trong một ngày.', descEn: 'Dan needs moonmoss within a single day.', requiredItems: {}, requiredFlags: [], rewardGold: 30, rewardItems: {}, aliases: ['mist fever', 'sot mua suong'], deadlineDays: 1, steps: [
    { id: 'get_moss', descVi: 'Lấy 1 nhánh rêu nguyệt.', descEn: 'Acquire 1 moon moss.', completeItems: { moon_moss: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao rêu cho Đàn.', 'Deliver the moss to Dan.', { moon_moss: 1 }),
  ] },
  { id: 'q_timed_13', giverNpcId: 'n_caravan_duong', nameVi: 'Chạy nước trước bão cát', nameEn: 'Water Before the Sandstorm', descVi: 'Dương cần 2 viên đan sương đổi nước trước bão cát.', descEn: 'Duong needs 2 dew pills traded for water before the storm.', requiredItems: {}, requiredFlags: [], rewardGold: 40, rewardItems: {}, aliases: ['storm water', 'chay nuoc truoc bao cat'], deadlineDays: 3, steps: [
    { id: 'get_pills', descVi: 'Lấy 2 viên đan sương.', descEn: 'Acquire 2 dew pills.', completeItems: { dew_pill: 2 }, isTurnInStep: false },
    turnIn('deliver', 'Giao đan cho Dương.', 'Deliver the pills to Duong.', { dew_pill: 2 }),
  ] },
  { id: 'q_timed_14', giverNpcId: 'n_monk_nhu', nameVi: 'Đèn đỉnh sắp tắt', nameEn: 'The Peak Lantern Fading', descVi: 'Như cần lông hạc thay tim đèn trong hai ngày.', descEn: 'Nhu needs a crane feather for the lantern wick within two days.', requiredItems: {}, requiredFlags: [], rewardGold: 30, rewardItems: {}, aliases: ['peak lantern', 'den dinh sap tat'], deadlineDays: 2, steps: [
    { id: 'get_feather', descVi: 'Lấy 1 lông hạc.', descEn: 'Acquire 1 crane feather.', completeItems: { crane_feather: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao lông cho Như.', 'Deliver the feather to Nhu.', { crane_feather: 1 }),
  ] },
  { id: 'q_timed_15', giverNpcId: 'n_lost_soul_ha', nameVi: 'Một đêm nhớ lại', nameEn: 'One Night to Remember', descVi: 'Hà chỉ nhớ được trong đúng một đêm rượu.', descEn: 'Ha remembers for exactly one wine-lit night.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['night remember', 'mot dem nho lai'], deadlineDays: 1, steps: [
    { id: 'get_wine', descVi: 'Lấy 1 bình rượu mai hoa.', descEn: 'Acquire 1 plum qi wine.', completeItems: { plum_qi_wine: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Đưa rượu cho Hà trước bình minh.', 'Give the wine to Ha before dawn.', { plum_qi_wine: 1 }),
  ] },

  // EXPLORATION (25) — secret: true; giver là NPC chỉ điểm, hoàn thành khi gặp đúng NPC ẩn.
  { id: 'q_find_01', giverNpcId: 'n_storyteller_ngo', nameVi: 'Tìm người chồng đã mất', nameEn: 'Find the Lost Husband', descVi: 'Ngô nghe nói cụ Thìn vẫn đứng giữa vườn cũ.', descEn: 'Ngo heard Thin still stands in the old garden.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['find husband', 'tim nguoi chong da mat'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp cụ Thìn trong ký ức làng.', descEn: 'Find Thin within the village memory.', completeNpcTalk: 'n_gardener_thin', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Ngô.', 'Report back to Ngo.'),
  ] },
  { id: 'q_find_02', giverNpcId: 'n_elder_meihua', nameVi: 'Ẩn sĩ trong hang', nameEn: 'The Hermit in the Cave', descVi: 'Mai Hoa nhắc đến một ẩn sĩ chưa từng về làng.', descEn: 'Meihua mentions a hermit who never returned to the village.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['find hermit', 'an si trong hang'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp Cốc chủ.', descEn: 'Find Hermit Coc.', completeNpcTalk: 'n_hermit_coc', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Mai Hoa.', 'Report back to Meihua.'),
  ] },
  { id: 'q_find_03', giverNpcId: 'n_innkeeper_hanh', nameVi: 'Khách trọ không trả phòng', nameEn: 'The Guest Who Never Paid', descVi: 'Hạnh kể về một khách trọ bỏ trốn vào rừng.', descEn: 'Hanh speaks of a guest who fled into the forest.', requiredItems: {}, requiredFlags: [], rewardGold: 15, rewardItems: {}, aliases: ['unpaid guest', 'khach tro khong tra phong'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp đạo sĩ du mục Nhất.', descEn: 'Find the rogue cultivator Nhat.', completeNpcTalk: 'n_rogue_cultivator_nhat', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Hạnh.', 'Report back to Hanh.'),
  ] },
  { id: 'q_find_04', giverNpcId: 'n_guard_truong', nameVi: 'Kẻ lưu đày cạnh khe', nameEn: 'The Exile by the Rift', descVi: 'Trường muốn xác minh tin về một kẻ lưu đày.', descEn: 'Truong wants a rumor about an exile verified.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['find exile', 'ke luu day canh khe'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp kẻ lưu đày Bá.', descEn: 'Find Exile Ba.', completeNpcTalk: 'n_exile_ba', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Trường.', 'Report back to Truong.'),
  ] },
  { id: 'q_find_05', giverNpcId: 'n_kid_xiaobao', nameVi: 'Bạn chơi không bóng', nameEn: 'The Friend With No Shadow', descVi: 'Tiểu Bảo có một người bạn không ai thấy.', descEn: 'Xiaobao has a friend nobody else sees.', requiredItems: {}, requiredFlags: [], rewardGold: 10, rewardItems: {}, aliases: ['shadowless friend', 'ban choi khong bong'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp vong hồn Hà.', descEn: 'Find the lost soul Ha.', completeNpcTalk: 'n_lost_soul_ha', isTurnInStep: false },
    turnIn('report', 'Kể lại cho Tiểu Bảo.', 'Tell Xiaobao what you found.'),
  ] },
  { id: 'q_find_06', giverNpcId: 'n_merchant_bao', nameVi: 'Người điều phối ẩn danh', nameEn: 'The Anonymous Coordinator', descVi: 'Bảo muốn biết ai đứng sau các phiên đấu giá kín.', descEn: 'Bao wants to know who runs the sealed auctions.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['find auctioneer', 'nguoi dieu pho an danh'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp người điều phối Hoàn.', descEn: 'Find coordinator Hoan.', completeNpcTalk: 'n_auctioneer_hoan', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Bảo.', 'Report back to Bao.'),
  ] },
  { id: 'q_find_07', giverNpcId: 'n_smith_duc', nameVi: 'Đối thủ vô hình', nameEn: 'The Invisible Rival', descVi: 'Đức nghe tay khắc bùa nào đó bán bùa rẻ hơn.', descEn: 'Duc heard some carver sells ward charms cheaper.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['invisible rival', 'doi thu vo hinh'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp thợ khắc bùa Khuê.', descEn: 'Find the ward carver Khue.', completeNpcTalk: 'n_ward_carver_khue', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Đức.', 'Report back to Duc.'),
  ] },
  { id: 'q_find_08', giverNpcId: 'n_scholar_minh', nameVi: 'Thủ thư chưa từng ra ngoài', nameEn: 'The Librarian Who Never Left', descVi: 'Minh muốn gặp thủ thư của Thanh Vân Các.', descEn: 'Minh wants to meet the Azure Pavilion archivist.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['find librarian', 'thu thu chua tung ra ngoai'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp thủ thư Thư.', descEn: 'Find archivist Thu.', completeNpcTalk: 'n_archivist_thu', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Minh.', 'Report back to Minh.'),
  ] },
  { id: 'q_find_09', giverNpcId: 'n_pedlar_quyen', nameVi: 'Đối thủ bán hàng rong', nameEn: 'The Rival Pedlar', descVi: 'Quyền muốn biết ai bán được hàng ở chợ lửng.', descEn: 'Quyen wants to know who sells well at the wandering market.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['rival pedlar', 'doi thu ban hang rong'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp môi giới Tiêu.', descEn: 'Find broker Tieu.', completeNpcTalk: 'n_broker_tieu', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Quyền.', 'Report back to Quyen.'),
  ] },
  { id: 'q_find_10', giverNpcId: 'n_tea_ma', nameVi: 'Bàn cược trong chợ lửng', nameEn: 'The Dice Table in the Wandering Market', descVi: 'Mã nghe nói có một bàn xúc xắc thắng mãi.', descEn: 'Ma heard of a dice table that never loses.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['find dice master', 'ban cuoc trong cho lung'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp bậc thầy xúc xắc Lục.', descEn: 'Find dice master Luc.', completeNpcTalk: 'n_dice_master_luc', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Mã.', 'Report back to Ma.'),
  ] },
  { id: 'q_find_11', giverNpcId: 'n_fortune_lien', nameVi: 'Tấm bản đồ không vẽ xong', nameEn: 'The Unfinished Map', descVi: 'Liên thấy hiện lên hình ảnh một người bán bản đồ cổ.', descEn: 'Lien glimpsed an image of an old map seller.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['unfinished map', 'tam ban do khong ve xong'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp người bán bản đồ Mãn.', descEn: 'Find map seller Man.', completeNpcTalk: 'n_map_seller_man', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Liên.', 'Report back to Lien.'),
  ] },
  { id: 'q_find_12', giverNpcId: 'n_alchemist_sam', nameVi: 'Ẩn sĩ băng cần đối chất', nameEn: 'The Ice Hermit to Consult', descVi: 'Sâm cần ý kiến của một ẩn sĩ trên đỉnh băng.', descEn: 'Sam needs the opinion of a hermit on the frozen peak.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['find ice hermit', 'an si bang can doi chat'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp ẩn sĩ Băng Tâm.', descEn: 'Find Ice Hermit Bang Tam.', completeNpcTalk: 'n_ice_hermit_bang', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Sâm.', 'Report back to Sam.'),
  ] },
  { id: 'q_find_13', giverNpcId: 'n_hunter_son', nameVi: 'Người huấn luyện thú', nameEn: 'The Beast Trainer', descVi: 'Sơn nghe tiếng kèn huấn thú từ Sườn Thú.', descEn: 'Son heard a taming horn from Spirit Beast Ridge.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['find trainer', 'nguoi huan luyen thu'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp huấn luyện thú Hạc.', descEn: 'Find beast tamer Hac.', completeNpcTalk: 'n_tamer_hac', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Sơn.', 'Report back to Son.'),
  ] },
  { id: 'q_find_14', giverNpcId: 'n_rogue_cultivator_nhat', nameVi: 'Kiếm khách sa mạc', nameEn: 'The Swordsman of the Dunes', descVi: 'Nhất kể về một kiếm khách chưa từng thua ở sa mạc.', descEn: 'Nhat speaks of a swordsman undefeated in the dunes.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['find swordsman', 'kiem khach sa mac'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp kiếm khách Điệp.', descEn: 'Find swordsman Diep.', completeNpcTalk: 'n_swordsman_diep', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Nhất.', 'Report back to Nhat.'),
  ] },
  { id: 'q_find_15', giverNpcId: 'n_senior_lan', nameVi: 'Chánh án chưa biết mặt', nameEn: 'The Unseen Judge', descVi: 'Lan nhắc đến phiên xét xử ngày 18 và người cầm búa.', descEn: 'Lan mentions the trial on the eighteenth and the one holding the gavel.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['find judge', 'chanh an chua biet mat'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp chánh án Quang tại Thanh Vân Các.', descEn: 'Find Judge Quang at Azure Pavilion.', completeNpcTalk: 'n_judge_quang', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Lan.', 'Report back to Lan.'),
  ] },
  { id: 'q_find_16', giverNpcId: 'n_woodcutter_bong', nameVi: 'Người đứng giữa tro xương', nameEn: 'The One Amid the Bone Ash', descVi: 'Bồng nghe nói có kẻ quét tro thành đống ngay ngắn.', descEn: 'Bong heard someone sweeps the bone ash into neat piles.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['find ash priest', 'nguoi dung giua tro xuong'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp tư tế tro xương Cửu.', descEn: 'Find ash priest Cuu.', completeNpcTalk: 'n_ash_priest_cuu', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Bồng.', 'Report back to Bong.'),
  ] },
  { id: 'q_find_17', giverNpcId: 'n_fortune_lien', nameVi: 'Kẻ sưu tập tên', nameEn: 'The Name Collector', descVi: 'Trong lá số của Liên có một cái tên bị xóa hai lần.', descEn: 'In Lien\'s fortune card, one name has been erased twice.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['find collector', 'ke suu tap ten'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp kẻ sưu tập tên Trà.', descEn: 'Find name collector Tra.', completeNpcTalk: 'n_name_collector_tra', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Liên.', 'Report back to Lien.'),
  ] },
  { id: 'q_find_18', giverNpcId: 'n_monk_nhu', nameVi: 'Vệ binh tuyết không ngủ', nameEn: 'The Sleepless Snow Guard', descVi: 'Như nghe tiếng bước chân đều đều trên đỉnh băng.', descEn: 'Nhu hears even footfalls on the frozen peak.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['find snow guard', 've binh tuyet khong ngu'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp vệ binh tuyết Hàn.', descEn: 'Find snow guard Han.', completeNpcTalk: 'n_snow_guard_han', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Như.', 'Report back to Nhu.'),
  ] },
  { id: 'q_find_19', giverNpcId: 'n_broker_tieu', nameVi: 'Thương đoàn không tra tờ', nameEn: 'The Caravan With No Papers', descVi: 'Tiêu muốn biết ai đưa hàng qua sa mạc không cần giấy.', descEn: 'Tieu wants to know who crosses the dunes without papers.', requiredItems: {}, requiredFlags: [], rewardGold: 25, rewardItems: {}, aliases: ['find caravan', 'thuong doan khong tra to'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp thủ lĩnh thương đoàn Dương.', descEn: 'Find caravan leader Duong.', completeNpcTalk: 'n_caravan_duong', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Tiêu.', 'Report back to Tieu.'),
  ] },
  { id: 'q_find_20', giverNpcId: 'n_swordsman_diep', nameVi: 'Người dẫn đường không bóng', nameEn: 'The Shadowless Guide', descVi: 'Điệp kể về người dẫn đường đi trước mặt trời.', descEn: 'Diep speaks of a guide who walks ahead of the sun.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['find dune guide', 'nguoi dan duong khong bong'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp hướng dẫn sa mạc Sa.', descEn: 'Find dune guide Sa.', completeNpcTalk: 'n_dune_guide_sa', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Điệp.', 'Report back to Diep.'),
  ] },
  { id: 'q_find_21', giverNpcId: 'n_fisher_yen', nameVi: 'Người giữ hồ không câu cá', nameEn: 'The Keeper Who Never Fishes', descVi: 'Yến thắc mắc vì sao hồ đầy cá mà không ai đánh bắt.', descEn: 'Yen wonders why no one fishes a lake so full of fish.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['find lake keeper', 'nguoi giu ho khong cau ca'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp người giữ hồ Trang.', descEn: 'Find lake keeper Trang.', completeNpcTalk: 'n_lake_keeper_trang', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Yến.', 'Report back to Yen.'),
  ] },
  { id: 'q_find_22', giverNpcId: 'n_kid_xiaobao', nameVi: 'Chiếc đò không cần chèo', nameEn: 'The Ferry That Rows Itself', descVi: 'Tiểu Bảo thấy một chiếc đò trôi ngược dòng lúc nửa đêm.', descEn: 'Xiaobao saw a ferry drifting upstream at midnight.', requiredItems: {}, requiredFlags: [], rewardGold: 15, rewardItems: {}, aliases: ['find ferryman', 'chiec do khong can cheo'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp người chở đò Cậu.', descEn: 'Find ferryman Cau.', completeNpcTalk: 'n_ferryman_cau', isTurnInStep: false },
    turnIn('report', 'Kể lại cho Tiểu Bảo.', 'Tell Xiaobao what you found.'),
  ] },
  { id: 'q_find_23', giverNpcId: 'n_tailor_yen', nameVi: 'Cái tủ không bao giờ hết', nameEn: 'The Cabinet That Never Empties', descVi: 'Yến cầm đồ của một chủ tiệm chưa từng mặc váy rách.', descEn: 'Yen pawns goods for a shopkeeper whose gowns never tear.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['find banker', 'cai tu khong bao gio het'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp chủ tiệm cầm đồ Tín.', descEn: 'Find pawn banker Tin.', completeNpcTalk: 'n_banker_tin', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Yến.', 'Report back to Yen.'),
  ] },
  { id: 'q_find_24', giverNpcId: 'n_herbalist_dan', nameVi: 'Người gieo hạt lúc nửa đêm', nameEn: 'The Midnight Sower', descVi: 'Đàm đoán ai đã gieo hạt trong vườn ươm vào giờ Tý.', descEn: 'Dan suspects someone sows seeds in the nursery at midnight.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['find gardener vien', 'nguoi gieo hat luc nua dem'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp người giữ vườn Viên.', descEn: 'Find gardener Vien.', completeNpcTalk: 'n_gardener_vien', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Đàm.', 'Report back to Dan.'),
  ] },
  { id: 'q_find_25', giverNpcId: 'n_ox_cart_hien', nameVi: 'Tiếng ong giữa sương', nameEn: 'The Hum in the Mist', descVi: 'Hiện nghe tiếng ong linh từ một khu vườn không tên.', descEn: 'Hien hears spirit bees humming from an unnamed garden.', requiredItems: {}, requiredFlags: [], rewardGold: 20, rewardItems: {}, aliases: ['find beekeeper', 'tieng ong giua suong'], secret: true, steps: [
    { id: 'find', descVi: 'Tìm gặp người nuôi ong Oanh.', descEn: 'Find beekeeper Oanh.', completeNpcTalk: 'n_beekeeper_oanh', isTurnInStep: false },
    turnIn('report', 'Báo lại cho Hiện.', 'Report back to Hien.'),
  ] },

  // AFFINITY (15) — 3 chuỗi × 5 NPC core. Cổng mở: flag aff_n_<npc> (doTalk set)
  // + quest_<id>_done cho bậc thang trong chuỗi. T12 có thể thay bằng aff_gate_<npc>.
  { id: 'q_aff_01', giverNpcId: 'n_elder_meihua', nameVi: 'Khu vườn năm cũ', nameEn: 'The Old Garden', descVi: 'Mai Hoa nhờ người đọc lại cái tên viết trên cổng vườn.', descEn: 'Meihua asks you to read the name carved on the garden gate.', requiredItems: {}, requiredFlags: ['aff_gate_n_elder_meihua'], rewardGold: 15, rewardItems: {}, aliases: ['old garden', 'khu vuon nam cu'], steps: [
    { id: 'listen', descVi: 'Nói chuyện với Mai Hoa về khu vườn.', descEn: 'Speak to Meihua about the garden.', completeNpcTalk: 'n_elder_meihua', isTurnInStep: false },
    turnIn('report', 'Trở lại bên cổng vườn cùng Mai Hoa.', 'Return to the garden gate with Meihua.'),
  ] },
  { id: 'q_aff_02', giverNpcId: 'n_elder_meihua', nameVi: 'Hạt giống còn sót', nameEn: 'The Remaining Seeds', descVi: 'Mai Hoa tin vườn còn sống nếu ai đó chịu trồng lại.', descEn: 'Meihua believes the garden lives if someone replants it.', requiredItems: {}, requiredFlags: ['aff_n_elder_meihua', 'quest_q_aff_01_done'], rewardGold: 25, rewardItems: {}, aliases: ['remaining seeds', 'hat giong con sot'], steps: [
    { id: 'get_herbs', descVi: 'Lấy 2 linh thảo làm mầm giống.', descEn: 'Acquire 2 spirit herbs for seed stock.', completeItems: { spirit_herb: 2 }, isTurnInStep: false },
    turnIn('deliver', 'Giao linh thảo cho Mai Hoa.', 'Deliver the herbs to Meihua.', { spirit_herb: 2 }),
  ] },
  { id: 'q_aff_03', giverNpcId: 'n_elder_meihua', nameVi: 'Cái tên của chồng', nameEn: 'Her Husband\'s Name', descVi: 'Mai Hoa chưa từng gọi tên chồng trong 12 năm.', descEn: 'Meihua has not spoken her husband\'s name in twelve years.', requiredItems: {}, requiredFlags: ['aff_n_elder_meihua', 'quest_q_aff_02_done'], rewardGold: 40, rewardItems: { plum_qi_wine: 1 }, aliases: ['husband name', 'cai ten cua chong'], steps: [
    { id: 'visit_thin', descVi: 'Gặp cụ Thìn trong ký ức làng.', descEn: 'Visit Thin within the village memory.', completeNpcTalk: 'n_gardener_thin', isTurnInStep: false },
    turnIn('report', 'Kể lại với Mai Hoa điều cụ Thìn nói.', 'Tell Meihua what Thin said.'),
  ] },
  { id: 'q_aff_04', giverNpcId: 'n_storyteller_ngo', nameVi: 'Đêm kể chuyện đầu tiên', nameEn: 'The First Story Night', descVi: 'Ngô chỉ kể cho người chịu ngồi đến hết truyện.', descEn: 'Ngo only tells stories to those who stay to the end.', requiredItems: {}, requiredFlags: ['aff_n_storyteller_ngo'], rewardGold: 15, rewardItems: {}, aliases: ['first story night', 'dem ke chuyen dau tien'], steps: [
    { id: 'listen', descVi: 'Nghe Ngô kể hết một truyện.', descEn: 'Hear one story from Ngo to the end.', completeNpcTalk: 'n_storyteller_ngo', isTurnInStep: false },
    turnIn('report', 'Trở lại và nói điều mình nhớ.', 'Return and share what you remember.'),
  ] },
  { id: 'q_aff_05', giverNpcId: 'n_storyteller_ngo', nameVi: 'Sổ thiếu một trang', nameEn: 'The Book Missing a Page', descVi: 'Sổ của Ngô có một trang đã xé đi từ trước.', descEn: 'One page of Ngo\'s book was torn out long ago.', requiredItems: {}, requiredFlags: ['aff_n_storyteller_ngo', 'quest_q_aff_04_done'], rewardGold: 25, rewardItems: {}, aliases: ['missing page', 'so thieu mot trang'], steps: [
    { id: 'ask_meihua', descVi: 'Hỏi Mai Hoa về trang bị xé.', descEn: 'Ask Meihua about the torn page.', completeNpcTalk: 'n_elder_meihua', isTurnInStep: false },
    turnIn('report', 'Đem điều biết được về cho Ngô.', 'Bring what you learned back to Ngo.'),
  ] },
  { id: 'q_aff_06', giverNpcId: 'n_storyteller_ngo', nameVi: 'Câu chuyện từ nguồn', nameEn: 'The Story From Its Source', descVi: 'Ngô muốn nghe truyện từ người trong truyện.', descEn: 'Ngo wants a story heard from someone inside it.', requiredItems: {}, requiredFlags: ['aff_n_storyteller_ngo', 'quest_q_aff_05_done'], rewardGold: 40, rewardItems: { pill_qi: 1 }, aliases: ['story source', 'cau chuyen tu nguon'], steps: [
    { id: 'visit_ha', descVi: 'Nói chuyện với vong hồn Hà.', descEn: 'Speak to Ha\'s lost soul.', completeNpcTalk: 'n_lost_soul_ha', isTurnInStep: false },
    turnIn('report', 'Kể lại cho Ngô câu của Hà.', 'Retell Ha\'s words to Ngo.'),
  ] },
  { id: 'q_aff_07', giverNpcId: 'n_merchant_bao', nameVi: 'Bạn hàng thân thiết', nameEn: 'A Trusted Customer', descVi: 'Bảo giảm giá cho người biết trả lời chuyện buôn.', descEn: 'Bao gives a discount to those who talk trade properly.', requiredItems: {}, requiredFlags: ['aff_n_merchant_bao'], rewardGold: 15, rewardItems: {}, aliases: ['trusted customer', 'ban hang than thiet'], steps: [
    { id: 'listen', descVi: 'Nói chuyện với Bảo về chuyện buôn.', descEn: 'Speak to Bao about trade.', completeNpcTalk: 'n_merchant_bao', isTurnInStep: false },
    turnIn('report', 'Trở lại quầy của Bảo.', 'Return to Bao\'s stall.'),
  ] },
  { id: 'q_aff_08', giverNpcId: 'n_merchant_bao', nameVi: 'Đơn hàng lớn', nameEn: 'The Big Order', descVi: 'Bảo cần tơ vân để giữ lời hứa với khách vùng khác.', descEn: 'Bao needs cloudsilk to keep a promise to an out-of-region buyer.', requiredItems: {}, requiredFlags: ['aff_n_merchant_bao', 'quest_q_aff_07_done'], rewardGold: 25, rewardItems: {}, aliases: ['big order', 'don hang lon'], steps: [
    { id: 'get_silk', descVi: 'Lấy 1 cuộn tơ vân.', descEn: 'Acquire 1 cloudsilk thread.', completeItems: { cloudsilk_thread: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao tơ cho Bảo.', 'Deliver the silk to Bao.', { cloudsilk_thread: 1 }),
  ] },
  { id: 'q_aff_09', giverNpcId: 'n_merchant_bao', nameVi: 'Đối tác chợ lửng', nameEn: 'A Partner in the Wandering Market', descVi: 'Bảo muốn mở quầy ở chợ lửng nhưng không biết bắt đầu từ ai.', descEn: 'Bao wants a stall in the wandering market but not where to start.', requiredItems: {}, requiredFlags: ['aff_n_merchant_bao', 'quest_q_aff_08_done'], rewardGold: 40, rewardItems: { jade_charm: 1 }, aliases: ['wandering partner', 'doi tac cho lung'], steps: [
    { id: 'visit_tieu', descVi: 'Nói chuyện với môi giới Tiêu.', descEn: 'Speak to broker Tieu.', completeNpcTalk: 'n_broker_tieu', isTurnInStep: false },
    turnIn('report', 'Đem câu trả lời về cho Bảo.', 'Bring the answer back to Bao.'),
  ] },
  { id: 'q_aff_10', giverNpcId: 'n_master_vo', nameVi: 'Học trò mới', nameEn: 'The New Student', descVi: 'Võ Trưởng Sư chỉ nhận trò khi biết vì sao tu luyện.', descEn: 'Master Vo only takes students who know why they cultivate.', requiredItems: {}, requiredFlags: ['aff_n_master_vo'], rewardGold: 15, rewardItems: {}, aliases: ['new student', 'hoc tro moi'], steps: [
    { id: 'listen', descVi: 'Nói chuyện với Võ Trưởng Sư.', descEn: 'Speak to Master Vo.', completeNpcTalk: 'n_master_vo', isTurnInStep: false },
    turnIn('report', 'Trở lại trước mặt Võ Trưởng Sư.', 'Return before Master Vo.'),
  ] },
  { id: 'q_aff_11', giverNpcId: 'n_master_vo', nameVi: 'Đối luyện với Khoa', nameEn: 'Sparring With Khoa', descVi: 'Võ Trưởng Sư muốn xem người đỡ được ba đòn của Khoa.', descEn: 'Master Vo wants to see you weather three of Khoa\'s strikes.', requiredItems: {}, requiredFlags: ['aff_n_master_vo', 'quest_q_aff_10_done'], rewardGold: 25, rewardItems: {}, aliases: ['sparring khoa', 'doi luyen voi khoa'], steps: [
    { id: 'meet_khoa', descVi: 'Nói chuyện với Khoa về buổi đối luyện.', descEn: 'Speak to Khoa about the spar.', completeNpcTalk: 'n_rival_khoa', isTurnInStep: false },
    turnIn('report', 'Báo kết quả đối luyện cho Võ Trưởng Sư.', 'Report the spar to Master Vo.'),
  ] },
  { id: 'q_aff_12', giverNpcId: 'n_master_vo', nameVi: 'Kiếm ý và ký ức', nameEn: 'Blade Intent and Memory', descVi: 'Võ Trưởng Sư tin kiếm mạnh nhất nhớ vì ai vung nó.', descEn: 'Master Vo believes the strongest sword remembers who it was drawn for.', requiredItems: {}, requiredFlags: ['aff_n_master_vo', 'quest_q_aff_11_done'], rewardGold: 45, rewardItems: { ninefold_pill: 1 }, aliases: ['blade intent', 'kiem y va ky uc'], steps: [
    { id: 'visit_crane', descVi: 'Xin một lông hạc làm quà luyện tâm.', descEn: 'Ask the Crane Spirit for a feather for training.', completeNpcTalk: 'n_crane_spirit', isTurnInStep: false },
    turnIn('report', 'Trở về trình Võ Trưởng Sư.', 'Return and report to Master Vo.'),
  ] },
  { id: 'q_aff_13', giverNpcId: 'n_relic_hunter_bach', nameVi: 'Người nhặt tro', nameEn: 'The Ash Gatherer', descVi: 'Bạch chỉ tin người chịu ngồi xuống nhặt tro cùng.', descEn: 'Bach only trusts those willing to sit and gather ash.', requiredItems: {}, requiredFlags: ['aff_n_relic_hunter_bach'], rewardGold: 15, rewardItems: {}, aliases: ['ash gatherer', 'nguoi nhat tro'], steps: [
    { id: 'listen', descVi: 'Nói chuyện với Bạch về tro xương.', descEn: 'Speak to Bach about the bone ash.', completeNpcTalk: 'n_relic_hunter_bach', isTurnInStep: false },
    turnIn('report', 'Ngồi lại bên đống tro cùng Bạch.', 'Sit a while longer among the ash with Bach.'),
  ] },
  { id: 'q_aff_14', giverNpcId: 'n_relic_hunter_bach', nameVi: 'Hiện vật thứ bảy', nameEn: 'The Seventh Relic', descVi: 'Bạch cần một bùa xương để so nghiệm một hiện vật vô danh.', descEn: 'Bach needs a bone charm to compare against an unnamed relic.', requiredItems: {}, requiredFlags: ['aff_n_relic_hunter_bach', 'quest_q_aff_13_done'], rewardGold: 25, rewardItems: {}, aliases: ['seventh relic', 'hien vat thu bay'], steps: [
    { id: 'get_charm', descVi: 'Lấy 1 bùa hộ thân xương.', descEn: 'Acquire 1 bone ward charm.', completeItems: { bone_ward_charm: 1 }, isTurnInStep: false },
    turnIn('deliver', 'Giao bùa cho Bạch.', 'Deliver the charm to Bach.', { bone_ward_charm: 1 }),
  ] },
  { id: 'q_aff_15', giverNpcId: 'n_relic_hunter_bach', nameVi: 'Cái tên trong tro', nameEn: 'The Name in the Ash', descVi: 'Bạch đã đọc cả đống tro mà chưa tìm được một cái tên.', descEn: 'Bach has read every pile of ash and found not one name.', requiredItems: {}, requiredFlags: ['aff_n_relic_hunter_bach', 'quest_q_aff_14_done'], rewardGold: 40, rewardItems: { moonstone_pendant: 1 }, aliases: ['name in ash', 'cai ten trong tro'], steps: [
    { id: 'visit_cuu', descVi: 'Hỏi tư tế tro xương Cửu về tên bị xóa.', descEn: 'Ask ash priest Cuu about erased names.', completeNpcTalk: 'n_ash_priest_cuu', isTurnInStep: false },
    turnIn('report', 'Đem điều Cửu nói về cho Bạch.', 'Bring Cuu\'s words back to Bach.'),
  ] },
]

export function getQuest(questId: string): QuestDef | undefined {
  return QUESTS.find((q) => q.id === questId)
}
