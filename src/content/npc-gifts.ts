// Issue #39 (p1-high): per-NPC gift reactions. Playtest p09/p12 found the
// social loop empty — every NPC answered with one shared canned chain and the
// ♥ counter visibly never moved. This table is the anti-canned contract:
// ONE authored reaction per NPC, in BOTH locales, each in the giver's own
// voice (echoing their greetVi/greetEn register). test/issue39-gift.test.ts
// enforces: total coverage of NPCS, `{item}` in every line, and pairwise
// uniqueness — adding a shared fallback here for a new NPC fails the test.
//
// `{item}` is substituted with the gift's localized item name at emit time,
// never at authoring time, so new items need no content edits here.
import type { NpcDef } from '../engine/content-types'

export interface GiftReaction {
  vi: string
  en: string
}

export const NPC_GIFT_RESPONSES: Record<string, GiftReaction> = {
  n_elder_meihua: { vi: '“{item} ư? Ta đặt lên bàn cùng những thứ làng nhớ.”', en: '“{item}? It goes on the table beside what the village remembers.”' },
  n_storyteller_ngo: { vi: '“Từ mai chuyện này có thật — {item}, chứng vật trong tay ta.”', en: '“From tomorrow this is a true tale — {item}, proof I can hold.”' },
  n_merchant_bao: { vi: '“Hàng ngon! Không mặc cả lại chứ? Thôi, ta ghi món nợ {item} này.”', en: '“Fine goods! You are not haggling me back, right? The {item} debt is recorded.”' },
  n_hermit_coc: { vi: '“{item} thế được một phần ấn cũ. Ngươi hiểu ta.”', en: '“{item} covers the worn seal well enough. You understand me.”' },
  n_rival_khoa: { vi: '“Đồ biếu? Ta nhận {item} — và ba tháng nữa nó chẳng cứu được gì.”', en: '“A bribe? I take {item} — and in three months it will save you nothing.”' },
  n_master_vo: { vi: '“Của cho quý ở lòng chẳng ở giá. Đặt {item} đúng tay rồi.”', en: '“A gift weighs in the giving hand, not the price tag. {item} landed right.”' },
  n_lost_soul_ha: { vi: '“Người sống cho vong hồn {item}… nó sẽ lạnh trong tay ta.”', en: '“The living hand {item} to the dead… it will grow cold in my hands.”' },
  n_innkeeper_hanh: { vi: '“Bán được đấy, nhưng ở đây nó là quà. {item} đổi lấy giường tối nay.”', en: '“Sellable — but here it stays a gift. {item} buys the bed tonight.”' },
  n_alchemist_sam: { vi: '“{item}! Để cạnh lò — lần thứ tám sắp tới có lẽ cần nó.”', en: '“{item}! It goes beside the furnace — attempt eight may need it.”' },
  n_hunter_son: { vi: '“Kẻ cho đồ trong rừng là kẻ biết im lặng. {item} mua một đoạn đường cùng ta.”', en: '“One who gives in the forest knows silence. {item} buys a stretch beside me.”' },
  n_guard_truong: { vi: '“Không hối lộ đâu. Nhưng {item} thì kho dân binh cất được.”', en: '“Not a bribe. But the militia store can hold {item}.”' },
  n_kid_xiaobao: { vi: '“Ố Ồ, {item}! Em giữ đây, đừng ai giành!”', en: '“WOW, {item}! Mine now — no grabbing!”' },
  n_farmer_tu: { vi: '“Cảm ơn chú. {item} này quý với người biết của đất.”', en: '“Thank you, child. Only one who values the soil treasuring {item} would think to bring it.”' },
  n_fortune_lien: { vi: '“Vận tăng rồi đấy — vì {item}, vé hôm nay cho ngươi xem trước.”', en: '“Your luck just rose — for {item}, today’s tickets I will peek at with you.”' },
  n_cook_phung: { vi: '“{item} vào nồi là ra vị. Biết ăn thì ngồi bàn trong.”', en: '“{item} in the pot becomes flavor. Know food, take the inner table.”' },
  n_smith_duc: { vi: '“Đồ tốt ở tay biết dùng. Đưa {item} đây, ta thử lửa.”', en: '“Good things belong to working hands. Bring {item} — let us test its fire.”' },
  n_scholar_minh: { vi: '“Nhà bác học không nhận quà — trả lời câu hỏi. Câu hỏi về {item}: đã trả lời.”', en: '“A scholar takes no gifts — he answers questions. Yours, about {item}: answered.”' },
  n_pedlar_quyen: { vi: '“Hàng rong đổi lấy {item}… thôi, coi như ngươi mua may.”', en: '“A pedlar trades for {item}… fine, count it as buying luck.”' },
  n_tea_ma: { vi: '“Trà nóng, {item} đầy — tin mới ta rót riêng ngươi.”', en: '“Hot tea, {item} full — the new gossip poured for you alone.”' },
  n_tailor_yen: { vi: '“{item} ổn đấy! Để ta đo xem ngươi hợp kiểu nào.”', en: '“{item} is decent work! Let me measure what cut suits you.”' },
  n_senior_lan: { vi: '“Sư đệ tặng {item}? Tỷ nhận — và nhắc: đừng luyện khi giận.”', en: '“A junior gifts me {item}? Sister accepts — and repeats: never cultivate angry.”' },
  n_keeper_anh: { vi: '“Sổ ghi rồi: {item}, ngày, người tặng. Kho không quên ai.”', en: '“Ledgered: {item}, dated, donor named. The store forgets no one.”' },
  n_monk_thien: { vi: '“Cảm ơn thí chủ về {item}. Hôm nay ngươi uống nước chưa?”', en: '“Thanks for {item}, friend. Have you drunk water today?”' },
  n_herbalist_dan: { vi: '“{item} hái tay nào? Hái đẹp thì cây mừng; hái xấu… ta coi như không thấy.”', en: '“Which hand picked {item}? A clean cut honors the plant; a rough one… unseen.”' },
  n_gatherer_hue: { vi: '“Dân hái thảo với nhau cả. {item} rồi, sáng mai sương ngọt đi chung?”', en: '“Us gatherers stick together. {item} accepted — the mist is sweet tomorrow, walk with me?”' },
  n_ox_cart_hien: { vi: '“Con bò thích {item} hơn ta đấy. Ngồi xe, chở một đoạn.”', en: '“The ox likes {item} more than I do. Ride — I will carry you a stretch.”' },
  n_woodcutter_bong: { vi: '“Cây trong mơ nói về {item}. Giờ ta biết chúng nói thật.”', en: '“The trees in my dreams spoke of {item}. Now I know they told truth.”' },
  n_exile_ba: { vi: '“Đừng cho kẻ lưu đày {item}. Nhận gì là mang nợ với thứ đó.”', en: '“Do not give an exile {item}. Whatever he takes, he owes.”' },
  n_exorcist_diem: { vi: '“{item} đủ đốt một vòng tà. Việc chưa xong, trà đã nóng.”', en: '“{item} is enough to burn a ward-circle. Work unfinished — the tea is warm.”' },
  n_crane_spirit: { vi: '“Gió nhận {item}. Tên ngươi sẽ được nhắc khi có kẻ bước tiếp.”', en: '“The wind takes {item}. Your name is spoken when others walk on.”' },
  n_herbalist_lan: { vi: '“Dược khí {item} còn tươi. Hái đúng mùa — Vạn Thảo Cốc nhớ ơn.”', en: '“{item}’s medicine-qi is fresh still. Picked in season — the valley remembers.”' },
  n_swordsman_diep: { vi: '“Kiếm khách không giữ đồ lâu. Hôm nay {item} nằm yên trong bao.”', en: '“A swordsman keeps nothing long. Today {item} rests in the scabbard.”' },
  n_monk_nhu: { vi: '“Băng tan vì được chạm đúng chỗ. Chạm bằng {item}. Ngồi.”', en: '“Ice thaws where touched rightly. Touched with {item}. Sit.”' },
  n_broker_tieu: { vi: '“Hoa hồng? Không. Món nợ vì {item} mới là loại tiền đắt nhất chợ này.”', en: '“Commission? No. A debt taken for {item} is the dearest currency in this market.”' },
  n_fisher_yen: { vi: '“Trăng dưới hồ chưa ai câu được. {item} câu ta rồi.”', en: '“No one hooks the moon in this lake. Your {item} hooked me.”' },
  n_relic_hunter_bach: { vi: '“Tro xương có chủ. {item} cũng thế — ta giữ ký ức, chẳng giữ giá.”', en: '“Ash has owners, so does {item}. I keep memories, not prices.”' },
  n_beast_tamer_le: { vi: '“Linh thú ngửi {item} trước cả ngươi. Không nhe răng — ngươi qua.”', en: '“The beast smelled {item} before you handed it. No snarl — you pass.”' },
  n_pavilion_disciple_anh: { vi: '“Sách đổi lời giảng. {item} trên tay — thư trai có chỗ của ngươi.”', en: '“Books buy teaching. {item} in hand — there is a desk for you.”' },
  n_wandering_blade_phong: { vi: '“Tin về ngươi bắt đầu từ đây: kẻ tặng Phiêu kiếm Phong {item}.”', en: '“The rumor of you starts here: one gifted the Wandering Blade {item}.”' },
  n_rogue_cultivator_nhat: { vi: '“Tán tu không nhận quà. …Nhận {item}. Đừng kể.”', en: '“Rogues take no gifts. …{item} is taken. Say nothing.”' },
  n_gardener_thin: { vi: '“Mười hai năm chỉ gió đợi ta. {item} là khách thứ hai.”', en: '“Twelve years and only the wind waits. {item} is the second visitor.”' },
  n_auctioneer_hoan: { vi: '“Món này ta đáng trả 200 lượng. Phiên đêm nay thêm một bí mật đẹp: {item}.”', en: '“I should have bid 200 gold. Tonight’s sale gains a beautiful secret: {item}.”' },
  n_banker_tin: { vi: '“Cầm đồ chẳng cho không. Nhưng {item} ta giữ như giữ tên khách quý.”', en: '“The pawnshop gives nothing free. Yet {item} stays like a valued guest’s name.”' },
  n_gardener_vien: { vi: '“{item} biết mùa của nó. Ngươi cũng biết. Đất mừng cả hai.”', en: '“{item} knows its season. So do you. The soil is glad of both.”' },
  n_beekeeper_oanh: { vi: '“Ong sẽ nhớ mùi {item}. Cả vườn này thôi chích ngươi.”', en: '“The bees will remember {item}’s scent. This garden stops stinging you.”' },
  n_archivist_thu: { vi: '“Sách sợ mượn rồi quên. {item} ngươi cho có ngày trả — chúng không sợ.”', en: '“Books fear being borrowed and forgotten. {item} is dated for return — they are unafraid.”' },
  n_judge_quang: { vi: '“Tòa nhận tang vật… quà biếu {item}: vô can. Một điểm ghi phần ngươi.”', en: '“The court accepts exhibit… gift {item}: no charge. One mark in your favor.”' },
  n_tamer_hac: { vi: '“Nó chấp nhận để ngươi sống. Nay chấp nhận {item} ngươi cho.”', en: '“It accepted that you live. Now it accepts the {item} you bring.”' },
  n_beast_singer_my: { vi: '“{item} có nốt riêng. Để ta tìm giọng nào hợp.”', en: '“{item} has its own note. Let us find the voice that fits.”' },
  n_ash_priest_cuu: { vi: '“Sáu mươi cái tên chưa từng có quà. {item} — tên ngươi khác chúng.”', en: '“Sixty names received no gifts. {item} — yours stands apart.”' },
  n_name_collector_tra: { vi: '“Ta mua tên. Ngươi cho {item} không — tên ngươi tự ghi vào sổ.”', en: '“I buy names. You gave {item} freely — yours writes itself into the ledger.”' },
  n_ice_hermit_bang: { vi: '“Cái giá nào cho {item}? Trả rồi. Đường HÀNH mở một gang.”', en: '“What price for {item}? Paid. The PATH opens a hand’s width.”' },
  n_snow_guard_han: { vi: '“Tuyết giữ một phần mọi người. Với ngươi, nó trả phần {item}.”', en: '“The snow keeps a piece of everyone. For you, it gives back the piece named {item}.”' },
  n_caravan_duong: { vi: '“Thương đoàn không nhận quà, nhận đồng hành. {item} là vé.”', en: '“The caravan takes no gifts, only company. {item} is your ticket.”' },
  n_dune_guide_sa: { vi: '“Đưa {item}, không hỏi đường. Đúng — kẻ không hỏi sa mạc mới sống.”', en: '“You gave {item}, asked no route. Good — those who ask no desert question live.”' },
  n_lake_keeper_trang: { vi: '“Hồ thấy ngươi già và trẻ cùng lúc. {item} — hồ ghi cả hai.”', en: '“The lake sees you old and young at once. {item} — it records both.”' },
  n_ferryman_cau: { vi: '“Đò quyết ai xuống bên nào. Ngươi — bên có {item}.”', en: '“The ferry decides which side you land. Yours is the side of {item}.”' },
  n_dice_master_luc: { vi: '“Xúc xắc nói thật của người ném. {item} — mặt ngửa kể về ngươi.”', en: '“Dice speak the thrower’s truth. {item} — the rising face tells of you.”' },
  n_map_seller_man: { vi: '“Nơi có {item} chưa nằm trên bản đồ nào. Sớm thôi.”', en: '“The place of {item} is on no map yet. Soon.”' },
  n_ward_carver_khue: { vi: '“Để ta khắc tên ngươi bên cạnh {item}. Bùa này sẽ nhớ.”', en: '“Let me carve your name beside {item}. This ward will remember.”' },
}

export function giftReactionFor(npcId: string): GiftReaction | undefined {
  return NPC_GIFT_RESPONSES[npcId]
}

/** Content guard used by test/issue39-gift.test.ts: pairs an NPC with its
 *  reaction so the test can walk every authored entry. */
export function giftReactionEntries(npcs: readonly NpcDef[]): Array<{ npc: NpcDef; reaction: GiftReaction | undefined }> {
  return npcs.map((npc) => ({ npc, reaction: giftReactionFor(npc.id) }))
}
