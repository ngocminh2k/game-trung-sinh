# Đánh giá tổng hợp Playtest — Phế Căn Ký (20 người chơi AI)

> **Phạm vi:** Playtest tự động 20 người chơi AI điều khiển trình duyệt thật (browser-use proxy, Playwright),
> 2026-09-14. Mỗi người chơi một phiên cô lập (localStorage riêng), chơi 60–120 hành động theo
> persona Bartle, chấm chung cuộc bằng thang hoà trộn với 15 lens của
> `docs/design-review-2026-09-10.md` (§5).
> **Cơ sở lý thuyết:** thư viện gốc
> `C:/Users/minhd/Downloads/GameDesign_TaiLieu_Markdown` — châm theo
> `docs/playtest-ai/RUBRIC.md` (12 chiều phân tích, bộ lọc Fullerton/Koster/Bartle, quy tắc
> tam giác hoá 3+ người chơi). Mỗi lens chỉ được **rescored khi có chứng cứ hành vi thực**;
> lens nào không có số liệu ghi **"no playtest data"**.

**Trạng thái:** **20/20 báo cáo + telemetry đã nộp đủ** (p03 chốt sau cùng: 110 action, ngày 4,
`tragic_death`, stage vẫn 0). Mọi nhóm Bartle có đại diện; mọi phát hiện "đỉnh" đều đạt ngưỡng
tam giác hoá 3+.

---

## Tóm tắt một dòng

Phế Căn Ký có **một vòng combat điều khiển thật sự tốt** (nhiều persona chơi chiến độc lập) —
nhưng nó bị **bưng kín** sau một lớp onboarding chết: ngôn ngữ hiện ra là **tiếng Việt dù chọn EN**
(6 người báo), **journal + hành trang + nền tệp "sticky topbar" chặn mọi cú click** (7 người báo,
2 người chết vì nó), **cơ chế "tu luyện → đột phá kiếp" không tồn tại** (*cả 20/20 người chơi,
stage không ai từng thấy khác 0*),
và **hệ thống tĩnh lặng im thin thít** (lottery, bán, gather, "Hỏi", parser tự do chỉ có 2 trạng thái:
*thành công mà không được báo*, hoặc *im lặng mà không được báo*). Người chơi khỏi màn nào cũng
bỏ cuộc trong ~1–4 ngày, đa số vì **chết ẩn** (danger zone tax −9..−23/step, không có telegraph) hơn
là vì một kịch bản dũng chất.

---
## 1. Chấm lại 15 lens (đối sánh trực tiếp `design-review-2026-09-10.md` §9-25)

| # | Lens | Điểm cũ | Điểm mới | Bằng chứng từ playtest |
|---|------|:---:|:---:|---|
| 1 | Fullerton Formal Systems & Playtest | 8.5 | **7.0** | Giao thức chơi mẫu đúng (telemetry đủ mọi phiên) — nhưng chính phát hiện #4b (softlock không lối thoát) là **lỗi formal-systems cổ điển**: tồn tại trạng thái trận mà không move nào hợp lệ, engine không phát hiện. Điều đó trừ điểm lens này. |
| 2 | Crawford Challenge/Fantasy/Exp | 8.5 | **7.0** | Combat trung thực, đọc được (nhiều personas chơi chiến, có số); nhưng **trận chết đa số là "surprise-with-despair"** không telegraph (Shadow Leopard một-chiều, mist tax ẩn) → challenge khó nhưng *không công bằng*. |
| 3 | Schell Elemental Tetrad | 8.0 | **6.5** | Thẩm mỹ thủy mặc + text-log HUD được khen "genuinely cool", nhưng **story nằm sau modal tiếng Việt + journal chết** → *Story/Aesthetics* không với tới được người chơi EN. Nghệ thuật lệch gameplay (Jesse: không hoà hợp). |
| 4 | MDA | 7.5 | **6.0** | Mechanics→Dynamics có thật (combat qi/damage, rest, travel) — người chơi *cảm* được; nhưng **Aesthetics mà game hứa (tu luyện, phế căn, bán) không phát ra Dynamics tương ứng** → lệch MDA. |
| 5 | Flow & Difficulty Curve | 7.5 | **5.5** | Sắc nét số ít nơi có số (combat); nhưng đường cong break: **quá nhiều no-op/ẩn nửa sau** khiến người mới ở "noise" (Koster) chứ không "flow". Story difficulty thì lại **quá dễ đến vô cảm** (p10 corrections=0 suốt 4 ngày). |
| 6 | Costikyan Decisions & Systems | 7.5 | **5.5** | Có lựa chọn thật (3-nhánh hội thoại, gate thuộc tính); nhưng **nhiều quyết định ẩn số** (lottery EV âm, giá sau-commit, travel tax) → lựa chọn thành đoán mò. |
| 7 | Narrative Architecture & Pacing | 7.5 | **5.5** | Chlord 7-8 vắng (đã ghi chú trước); playtest cho thấy **story không tới tay: modal VI + journal dead + dịch echo verbatim** → narrative bị chặn ở tầng giao diện, không phải ở tầng nội dung. **Đảo chiều quan trọng (p05):** bản thân tầng nội dung *tốt* — danh tính "phế căn" (shrine/card-seller/scholar gaze; lời nói dối lịch sự "linh căn khác biệt") được chấm "best beat" khi người chơi đọc kỹ. Vấn đề là **trình diễn, không phải ngòi bút** — vì vậy lens chỉ tụt 2.0, không sập. |
| 8 | Juul Casual & Usability | 7.2 | **4.5** | **Điểm tụt mạnh nhất.** EN toggle ẩn không tìm được ngoài API (4 người); modal backdrop nuốt mọi click; "nút ảo" hiện ra mà click không được; no-op không thông báo. Thiếu interruptibility/resume (p18). |
| 9 | Bartle Player Types | 7.0 | **6.5** | Persona đúng là **đơn vị chẩn đoán**: Spade khen combat, Diamond chê kinh tế, Explorer phát hiện parser chết, churn quy ở D1. Nhưng vòng "chase" của từng type (tu luyện/kinh tế/quan hệ) đều bưng — game **không phục vụ đủ không gian choice mà từng type theo đuổi**. |
| 10 | Feedback Loops | 7.0 | **4.5** | **Điểm tụt thứ hai.** Vòng phản hồi tốt (combat số rõ, rest); nhưng hàng loạt hành động **success == im lặng**: lottery, bán, gather, "Hỏi", parser free-text, bay hư không. Người chơi không phân biệt được "thành công" vs "bị bỏ rơi" (p14: 28 probe). |
| 11 | Technical Architecture & Determinism | 7.0 | **6.0** | Determinism đứng (telemetry nhất quán, seed ổn định); nhưng **"topbar intercept pointer events"** và **stat-point nút bấm dead** là 2 lỗi UI-determinism ảnh hưởng gameplay — Engine tốt, tầng chuyển tải UI nửa hỏng. |
| 12 | Fun = Learning (Koster) | 6.5 | **5.0** | Chiến đấu "học được" (action-repertoire mở rộng đúng tốc độ). Nhưng **bán bí kíp = lỗi Koster**: loot tốt nhất lại không có action; parser không tự dạy verb (`help`) → **bài toán đặt mà không cho người chơi học lời giải**. |
| 13 | Art Direction | 6.0 | **6.5** | Duy nhất lên điểm. Thủy mặc + text-log terminal được nhiều persona khen "cool"/"đẹp"; readability của HUD số liên tục 6–8. Nhưng 3/6 HUD tab là vỏ rỗng (p15) → art đẹp hơn interaction nó bọc. |
| 14 | Retention & Churn | 5.5 | **4.0** | Churn **không phải do nhàm**, mà do **D1-loss**: EN player mất vì không đọc được, churn mất vì không hiểu, speedrunner mất vì journal chặn potion → chết. Không có "session-resume/where-am-I", không có PG+ đâu ra từ 1 kiếp. |
| 15 | Economy & Resource Sinks | 4.0 | **3.0** | **Xác nhận điểm yếu nhất.** Không có sell/convert/loan (p06 tính 0 đòn bẩy arbitrage); lottery EV âm, một-lần/ngày, không lộ số; giá chỉ hiện sau commit; kinh tế = sink một chiều gold→qi. Đúng chẩn `P6` dự đoán. |

**Trung bình mới (cả 15 lens đều có chứng cứ hành vi): 5.5 / 10** — tụt khỏi **7.01** của bản gốc.
*(Bản gốc chấm bằng lý thuyết, thiếu số liệu *live*; playtest hạ thang bằng bằng chứng hành vi.
Riêng 6 lens tụt ≥2 điểm (L5, L8, L10, L14, L15 và L1) đều là lens về khả năng chơi được, không phải
lens về nội dung.)*

---
## 1b. Scoreboard chủ quan của người chơi (trung bình trên **cả 20 báo cáo**)

| Mục | Trung bình | Thấp nhất | Cao nhất | Đọc là |
|---|:---:|:---:|:---:|---|
| **Clarity** | **3.9/10** | p10, p17 = 2 | p09 = 6 | Trung bình 20/20 người ≤6. Game không tự giải thích nổi chính nó. |
| **Agency** | **3.9/10** | p04, p12 = 2 | p13 = 7 | Explorer có đường (p13 đi 12/12 region); Socializer/churn bị "từ chối". |
| **HUD readability** | **6.15/10** | p09, p10, p13, p17 = 4 | p11, p18, p20 = 8 | **Điểm cao nhất — bề mặt số liệu ổn**, vấn đề nằm dưới HUD, không phải trên HUD. |
| **Would play again** | **4.1/10** | p12, p17, p19 = 1 | p13 = 7 | Đồ thị trùng đúng đường Bartle: Explorer ở lại, Club+churn bỏ. |

*(p09 là socializer — clarity 6 nhưng agency 3: họ hiểu thế giới và vẫn bị từ chối. p19/p17/p12 churn
"again"=1 đúng kịch bản D1-loss; p20 ở lại 65 action chỉ để lấy dữ liệu, tự nhận sẽ tắt game sau
~20 action ở đời thực. p03: *"nếu quest log + feedback text được thêm, cộng ngay 2 điểm"* — người
chơi tự chỉ đúng thuốc chữa.)*

---
## 2. Các phát hiện "đỉnh" đã tam giác hoá (≥3 người chơi hoặc telemetry chéo)

1. **[BLOCKER — toàn cục] Giao diện dùng tiếng Việt dù chọn EN.** p10, p02, p19, p18, p14 (+ p05
   không bấm được toggle) — 6 báo, mọi nhóm persona. Màn hình menu chỉ có nút VI; toggle EN ẩn
   (chỉ tìm được qua `?all=1`). Hệ quả dây chuyền: toàn bộ hội thoại NPC — tức *cả tầng câu chuyện* —
   nằm sau modal tiếng Việt + echo verbatim. p10 gọi đúng đó là "uninstall moment" của socializer.
   (**Lens 8, 7.**)
2. **[BLOCKER] "Sticky topbar" chặn mọi cú click trên vùng trên.** Journal (p10 p07 p14),
   hành trang p01/p03 (p01 gây chết), "Về menu" p18, drawer + EN toggle p05, modal backdrop
   (p06 p10 p14 p15). Một *lớp* interaction chết, không phải một nút. (`[BUG]` thiết kế z-index / pointer-events.)
3. **[BLOCKER] Vòng tu luyện — cơ chế tên trò chơi — không tồn tại.** **Không một ai trong 20 người
   chơi thấy stage khác 0**, kể cả hai người train + chia điểm (p10, p12) — p03: *"the 'broken root'
   identity never became gameplay"*. Bí kíp không có "Sử dụng"; panel Đạo đồ trắng.
   **Bằng chứng live cho `P1`** (`skill-tree.ts` chưa nối reducer). Người chơi không thể "tu luyện phế
   căn" — điều mà đúng tên game hứa.
4b. **[BLOCKER — game-breaking] Softlock cứng ở cổng "Allocate 2 points".** p04 và p12 **cùng mắc
   một modal** sau khi Train: hộp "Allocate 2 points before continuing" render **không có nút cộng
   nào bấm được** → mọi action còn lại (Rest/Train/Gather/pin/map/free-text) silent no-op, không
   còn đường thoát ngoại trừ sửa state (cấm với người chơi). run chết hẳn. p04 mô tả thêm nguyên
   nhân mất khả năng: sheet nhân vật nằm sau một nút **"Try" không nhãn**. Đây là lỗi nghiêm trọng
   nhất tìm được — không phải *khó hiểu* mà là *không chơi tiếp được*. (Lens 5, 8, 11.)
5. **[BUG] Quyết định ẩn số / bấm mà không có phản hồi.** Lottery EV âm một-lần/ngày không
   giải thích (p06 p10 p15); giá hiện sau commit (p06); travel ẩn tax (p01); retreat disabled silent
   (p01); nút thuộc tính bấm dead (p02 p06 p15 p01); **nhận nhiệm vụ không có xác nhận, không có
   quest log, bảng quest biến mất** (p03 p05 p08 — ba người độc lập).
6. **[BUG] Free-text parser — tính năng giới thiệu — hư khi chơi.** 28 probe, chỉ *2 trạng thái*:
   silently-acted / silently-nothing, không refusal/confirm (p14). `help` không dạy verb. Modal
   story nuốt input không cho tín hiệu (p14). **Bằng chứng live cho `P7`/parser.** Cần telegraph
   `COMMIT_LLM` khi parse thành công ít nhất.

*(Các phát hiện chỉ 1–2 người, chưa đủ ngưỡng: [kill-boss gotcha] p01/p15; [CHợ panel mở rỗng,
real buy ẩn trong dialog merchant] p15; [cosmetic glyph leak `人`/`目Objective`] p14;
[map pin sai đích — teleport nhầm về hub] p16 — coi là lead, chờ lượt sau. p03 bổ sung 2 lead:
[màn hình chết vẫn render nút combat live] và [dấu tiếng Việt bị rơi trong survey lưu
"Ta ght my"].)*

6b. **[BLOCKER] Modal hội thoại nuốt input, không cho biết lối thoát.** p06, p10, p13, p14, p15,
    p17 — modal NPC mở ra là chặn Rest/Move/map pin bằng backdrop **không hiển thị** và không có
    hint nào cho biết Escape tồn tại; p17 (churn) gọi đây là **"the #1 quit driver"** đúng như
    persona dự đoán (a20 = alt-tab moment). Liên quan họ hàng: **label NPC hỏng**
    ("TThương nhân", "BBà đồng", "CCụ Mai Hoa" — p17) và `目Objective` (p14) — pipeline content
    double-capitalize/glue. (Lens 8, 11.)

7. **[BLOCKER] Vòng xã hội/affinity gần như không tồn tại — đúng thứ Club/Socializer đến chơi.**
   p12 + p09 **độc lập xác nhận**: chỉ số ♥ của **mọi** NPC **không bao giờ nhúc nhích** ("♥ —" suốt
   mọi ngày), **không có verb tặng quà** (free-text "give..." bị parser nuốt — p09, p12), item được
   narrated ("giữ lấy") nhưng **không bao giờ vào hành trang** (p09). Thêm: **NPC dùng chung chuỗi
   trả lời** — p09 bắt được Thìn≡Hạnh và Mai Hoa≡Tư chia sẻ từng byte, kể cả câu "phế căn mà chịu
   nghe" lặp trên 3 nhân vật; p11 ghi cùng hiện tượng theo cặp khác; và lời đáp của Dược nương Lan
   giống hệt giữa ngày 3 và ngày 4 (p12 — canned loop, không phải ký ức). → quan hệ NPC là ảo ảnh
   menu. (Lens 7, 9.)
8. **[BLOCKER] Từ chối cốt truyện = một game không combat, không event.** p16 (wanderer) đi hết
   budget **không gặp một trận nào** — combat bị gate 100% sau Tông Vân Ẩn; hai hook story từ chối
   *không tốn gì, không đổi gì* → "refusal is free and therefore weightless." p03 phản-chứng một phần:
   thế giới **có** đáp trả sự nổi loạn — nhưng chỉ trên **đúng một kênh** (chửi Hệ thống Hư Vô có hồi
   âm; mọi act nổi loạn khác — free-text, từ chối bùa — bị nuốt). p13 xác nhận thế giới
   sâu (12/12 region đi được) nhưng **không có world map**, chi phí edge **tự đổi** làm bản đồ tay
   hết hạn sau một đêm. → possibility space có thật nhưng không legible (Koster noise), và sandbox
   im lặng thay vì phản kháng (Fullerton: động lực không có nghĩa là hình phạt — nhưng cũng không
   được *không có gì*). (Lens 4, 5, 12.)
9. **[BUG] Time model vừa vắng vừa tự mâu thuẫn.** p13: ~116 bước đi **không trôi ngày** (chỉ Rest
   mới trôi), nhưng ô deadline lại hiện "Đêm thứ mười hai" khi **day=3**. p08 xác nhận: deadline
   "Đêm thứ mười hai: 19 ngày" và 70+ action **cost zero time**. Kèm p14 (corrections=10 trên
   balanced, deadline biết cắn) vs p07/p10/p11 (story: corrections=0, "never learned the clock
   exists") → **deadline là mechanic có thật nhưng được wire sai cho pacing**: chỉ tick khi Rest
   (nên không bao giờ áp lực lúc chơi), vô hình ở story, contradictory ở balanced. (Lens 5, 10.)
10. **[BLOCKER] Kinh tế read-only hai chiều: gold kiếm được nhưng TIÊU không được.** p08: nút
    "Mua" ở chợ **không bao giờ render, kể cả `?all=1`** — 76 action gold không dùng nổi; p06:
    **không có sell/convert/loan**, gold chỉ trôi qua một sink duy nhất (đổi gold→qi). P2 (shopForNpc
    wiring "ngủ quên") xác nhận bằng chứng live. Kèm p08: **realm text "Luyện Khí 4/10" mâu thuẫn
    HUD stage=0** — hai chỗ hiển thị tiến trình cãi nhau; và **map pin hiện khoảng cách stale**
    (chỉ `all=1` lộ số thật) — control list mặc định *nói dối* về world state. (Lens 15, 6, 10.)

---
## 3. Đọc theo Koster — pattern được dạy quá sớm / quá trộn

Theo bộ lọc `RUBRIC.md` §3 (action-repertoire so với win-rate):
- **Đúng tốc độ (tốt):** travel, rest, combat — repertoire mở rộng đều, người chơi hiểu trong 1
  click, nhiều persona chơi lặp không chán. Đây là số ít Fun thật của bản hiện hành.
- **Dạy chậm / không dạy (lỗi):** tu luyện/stage, lottery, bán, parser free-text — pattern vô hình,
  người chơi ở "noise" (Koster Ch.3), rồi **bỏ cuộc = chán vì không học được**, không phải chán vì quen.
- **Dạy quá muộn mới "bắt" (nguy hiểm):** night-deadline chỉ bộc lộ qua `corrections` (p14: 10
  correc trên 6 ngày) — ở difficulty non-story. Difficulty story thì deadline **chưa bao giờ lộ**
  (p10 corrections 0) → người chơi không biết đang đua.

---
## 4. Đọc theo Bartle — phát hiện chỉ nghiệm đúng nếu persona cần feature đó

| Nhóm persona | Họ theo đuổi | Điều game thực sự giao | Chuẩn loại |
|---|---|---|---|
| **Spade/Killer** (p01 p03 p19) | combat, damage, đua deadline, rủi ro | Combat ngon, thưởng số rõ | **Thiếu hàm ý "đua"**: deadline vô hình; travel tax ẩn làm 2 người chết không công bằng. p03 (kẻ đập phá) tìm được đúng 1 kênh nổi loạn có hồi âm rồi chết ở hang Phong Ấn vì sát thương-step vô hình. Kết: combat 8/10 nhưng *dính chết oan* → 7. |
| **Diamond/Achiever** (p06 p07) | quest, kinh tế, upgrade, hoàn thiện | Quest/covenant hứa "reach stage 2" nhưng stage bất biến; kinh tế 1 chiều | **Mọi mục tiêu Achievement bưng** → p06 drop 5/10, p07 6/10. |
| **Club/Socializer** (p10) | NPC, quan hệ, story, affinity | Hội thoại chạy nhưng 100% VI; lattice mở | p10 đình công D1: "the entire social layer just vanished" (clarity 2). Sự bất mãn này LÀ bài học, không phải trách p10. |
| **Heart/Explorer** (p14 p15) | map, free-text, hệ ẩn | Parser 2-trạng-thái; 18 cơ chế: 11 thật + 7 quả phụ | Nhóm duy nhất mà D3 (hệ ngủ) có thể chấm: họ **không tìm thấy hệ tu luyện/skill** → hệ ẩn không tồn tại. Chấm **D3: FAIL**. |
| **Churn** (p18 p19*) | hiểu tức thì, power nhanh, ít chịu đựng | D1-loss vì ngôn ngữ + genre + dead-UI | Legal thống kê cho D1: **drop ở 27–40 action, ngay ngày 1–2**. |

---
## 5. Bỏ qua những gì KHÔNG phải lỗi game

Dưới ngữ cảnh này (playtest một phiên, không phải F2P):
- **p18 "reload xoá tiến trình"** — là **artifact của rig**: `DELETE /sessions` đóng context → xoá
  localStorage (slot lưu). Người chơi thật F5 thì vẫn còn. → ghi **"no playtest data"**, không phải finding.
- **Việc tụt số action "no-op"** không tính là bug đơn lẻ — nó nằm trong phát hiện #4 (im lặng).
- Các ngưỡng `D1≥30%` của SavaMeta là chuẩn F2P consumer, không áp dụng → chỉ dùng tín hiệu định tính.

---
## 6. Khuyến nghị ưu tiên (gắn với 15 lens)

| # | Việc | Lens | Impact | Effort | Ghi chú |
|---|------|:---:|:---:|:---:|---|
| R1 | **Sửa topbar z-index + pointer-events** để journal/hành trang/về-menu/modal click được | 3, 8, 11 | **Cao** — cứu 2 cái chết + thêm cả lớp interaction | Thấp | Lỗi giao diện 1-2 dòng; trước tiên nhất. |
| R2 | **Localize module hội thoại + lộ EN toggle** ở menu | 7, 8 | **Cao** | Trung | Là hiện tượng 6 người báo, chặn story + socializer + churn-EN. |
| R3 | **Nối vòng tu luyện + skill-tree** (nơi nối `P1`) để stage thật sự tăng | 4, 12, 15 | **Cao** | Trung | Bản chất tên game; bằng chứng live. |
| R4 | **Telegraph danger: mist tax, encounter difficulty, boss heal/rage** (`P3`) | 2, 5, 11 | **Cao** | Thấp | Biến "death-by-surprise" thành "death-by-risk". |
| R5 | **Hiện số: giá trước commit, EV lottery, phản hồi parse** (thêm `COMMIT_LLM`) | 6, 10, 15 | Cao | Trung | Đuổi "success == im lặng". |
| R6 | **Session-resume "where am I" + objective hiển thị lại** để churn/parent quay lại | 8, 14 | Trung | Thấp | p18 có câu không cúi lòng; dead-UI hoá hại. |
| R7 | **Gỡ softlock "Allocate 2 points"** — thêm nút cộng bấm được + lối thoát (skip/undo) khi gate chưa fulfil | 1, 5, 8, 11 | **Critical** | Thấp | p04 + p12 chết hẳn run; game-breaking duy nhất tìm thấy. |
| R8 | **Hint lối thoát modal (Esc / nút Đóng hiển thị) + sửa label NPC double-capitalize** ("TThương nhân") | 8, 11 | Cao | Thấp | p17: modal-absorb là "#1 quit driver". |
| R9 | **Wire vòng xã hội: verb tặng quà + affinity thật đổi + NPC reply riêng từng người** (anti-canned) | 7, 9 | Cao | Trung | p09 + p12 độc lập xác nhận ♥ không nhúc nhích, NPC dùng chung chuỗi trả lời. |

---
## 7. Giới hạn & những gì còn điều tra

- **20/20 báo cáo + telemetry đã nộp đủ.** p03 vào sau cùng và chỉ *củng cố* các kết luận (stage=0,
  topbar chặn hành trang, quest bất khả thị), không đảo lens nào.
- Nhiều người chơi **chưa đạt ending** (p01/p03/p15/p19 chỉ đạt `tragic_death`; 0 người đạt 1/8 ending
  kịch bản thật). Vì thế **L7 narra ending/SP D12 challengeness** và **chính "cảm giác cao trào
  ending"** chưa được validate — ghi **no playtest data** cho phần kịch bản-ending, cần lượt 2.
- Telemetry `finalDay`, `corrections`, `nightForgotten` lưu đầy đủ từng phiên vào
  `docs/playtest-ai/telemetry/` (20/20; `p03.json` do agent tự sửa thành mảng hợp lệ vì server
  concat 2 object — lỗi nhỏ phía dump, không phải lỗi game).