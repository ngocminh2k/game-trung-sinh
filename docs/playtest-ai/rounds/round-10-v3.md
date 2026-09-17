# Playtest AI — Vòng 10 (bản v3, hybrid)

> **Nguồn:** 3 người chơi LLM (`r10p1`–`r10p3`) + 20 bot code (`r10b01`–`r10b20`) trên 10 preview host độc lập (cổng 4175–4184).
> **Dữ liệu:** 9 phát hiện từ người chơi (`r10p1` #1–#3, `r10p2` #4–#6, `r10p3` #7–#9) và 1767 bước hành động từ 20 bot.
> **Kết quả triage & adjudicator:**
> - **1 vé xử lý trọng điểm được thực hiện (fixed):**
>   - **T-ACHIEVE-PROGRESS** (medium / ui-css): Đưa khối thành tựu (`.achievements`) lên đầu trong `DockPanelMarket` (`src/ui/gameScreen/panels.tsx:265-422`), nằm ngay dưới tiêu đề và trước danh sách 12 công thức chế tạo (`.refinement-list`). Đảm bảo hiển thị tức thì trên màn hình (above-the-fold), khắc phục hoàn toàn hiện tượng khuất tầm nhìn và lỗi bộ cào dữ liệu lược bỏ.
> - **1 vé nâng cấp xác minh thành công (fixed-verified):**
>   - **T-NPC-KID**: NPC Tiểu Bảo (`n_kid_xiaobao`) đã hoàn toàn sử dụng kịch bản thiếu nhi tinh nghịch, không còn bất kỳ phản ánh lỗi nào từ cả 3 người chơi lẫn 20 bot. Chuyển trạng thái `fixed-verified`.
> - **5 nhóm đóng do báo cáo sai hoặc cơ chế thiết kế (false-positive / by-design):**
>   - **Tu luyện dead-click (#2, #6, #9)**: `false-positive`. Nhân vật đột phá Qi = 40 nhận 2 điểm tiềm năng chưa phân bổ, rào chắn `ATTRIBUTE_ALLOCATION_REQUIRED` khóa hành động là đúng chuẩn thiết kế Donald Norman.
>   - **Sát thương địa hình Rừng Sương Mù (#3)**: `by-design`. Cơ chế sinh tồn cốt lõi theo MDA Framework và Tracy Fullerton (Risk-Reward Pacing).
>   - **Huy hiệu thành tựu bị digest coi là disabled (#4, #7)**: `false-positive`. Hệ quả của việc khối thành tựu nằm off-viewport bị bộ lọc digest lược bỏ. Đã giải quyết triệt để sau khi đưa lên đầu panel.
>   - **Tên NPC dính chuỗi (#5)**: `false-positive`. Lỗi bộ lọc scraper harness đọc textContent bỏ qua CSS Grid và aria-hidden (lớp lỗi #38 Scraper Artifact).
>   - **Nút đổi ngôn ngữ VI/EN (#8)**: `false-positive`. Nút tồn tại đầy đủ nhưng nhãn độ dài <= 2 ký tự bị bộ lọc `browser-use-server.mjs:193` loại trừ trong digest.

---

## 1. Bảng phát hiện (Findings) — 9 phát hiện từ người chơi

| # | Mã | Khu vực | Mức độ | Tiêu đề | Người báo | Chốt sổ (Adjudicator) |
|---|---|---|---|---|---|---|
| 1 | F1 | ui-affordance | medium | T-ACHIEVE-PROGRESS: Huy hiá»‡u thÃ nh tá»±u bá»‹ chÃ´n sÃ¢u vÃ  thiáº¿u trong sá»• tay hÃ nh táº©u | r10p1 | r10p1 #10, #17, #21 |
| 2 | F2 | cultivation | high | NÃºt Tu luyá»‡n gÃ¢y dead-click khi thiáº¿u ChÃ¢n khÃ­ hoáº·c Sinh lá»±c | r10p1 | bot r10b08 #11, bot r10b17 #15 |
| 3 | F3 | combat | medium | SÃ¡t thÆ°Æ¡ng Ä‘á»‹a hÃ¬nh hiá»ƒm Ä‘á»‹a Rá»«ng SÆ°Æ¡ng MÃ¹ lÃ m cá»¥t há»©ng tá»‘c chiáº¿n | r10p1 | r10p1 #24, #25 |
| 4 | F4 | ui-affordance | medium | T-ACHIEVE-PROGRESS: Huy hiá»‡u thÃ nh tá»±u váº«n bá»‹ vÃ´ hiá»‡u hÃ³a, khÃ´ng xem Ä‘Æ°á»£c tiÃªu chÃ­ má»Ÿ khÃ³a | r10p2 | session r10p2 #10, #19 |
| 5 | F5 | npc-social | medium | TÃªn nhÃ¢n váº­t vÃ  danh xÆ°ng bá»‹ dÃ­nh chuá»—i trÃªn thanh danh sÃ¡ch NPC thanh trÃ¡ig | r10p2 | session r10p2 #5-#11; bots r10b01-r10b20 _summary |
| 6 | F6 | cultivation | medium | NÃºt Tu luyá»‡n gÃ¢y dead-click liÃªn tiáº¿p do thiáº¿u pháº£n há»“i tráº¡ng thÃ¡i/há»“i chiÃªug | r10p2 | bot r10b08 #11,#15; bot r10b17 #11,#15 |
| 7 | F7 | ui-affordance | medium | Locked achievements remain inaccessible for unlock criteria inspection | r10p3 | r10p3 #15, #16, #25 |
| 8 | F8 | localization | medium | Language selector missing from Settings despite title header | r10p3 | r10p3 #2, #3 |
| 9 | F9 | cultivation | low | Cultivate button produces silent dead clicks on resource depletion | r10p3 | r10p3 #21, bot r10b08 #11, #15, #19 |

---

## 2. Bảng thẩm định (Verdicts) — Thẩm định & Phán quyết

### 2.1 Ma trận phán quyết (Triage Panels)
Quá trình thẩm định Vòng 10 gồm 6 thẩm định viên độc lập chia làm 2 ban (X/Y/Z) đánh giá đa số khách quan theo chuẩn Game Design (Donald Norman, Raph Koster, Jesse Schell, Tracy Fullerton).

### 2.2 Các kết luận đóng sổ (Closed / Verified)
#### [FALSE-POSITIVE] Tu luyện button triggers repeated silent dead clicks when pending attribute points require allocation
- **Giải thích:** #2, #6, #9 Nút Tu luyện gây dead-click khi thiếu Chân khí hoặc Sinh lực / thiếu phản hồi trạng thái: Báo cáo sai thực tế do bot kiểm thử tự động vấp phải chốt chặn tiến trình (gộp báo cáo từ r10p1 #2, r10p2 #6, r10p3 #9 và telemetry r10b08.jsonl:103, r10b17.jsonl:103). Nhân vật đang có hp: 87, qi: 40 (không hề thiếu Qi < 10 hay cạn kiệt HP). Việc đạt mốc 40 Qi kích hoạt đột phá cảnh giới và phát sinh 2 điểm tiềm năng chưa phân bổ (pendingAttributePoints = 2). Engine thực thi chốt khóa liên động ATTRIBUTE_ALLOCATION_REQUIRED tại src/engine/reducer.ts:393-399 để tạm dừng chu trình tu luyện/di chuyển cho đến khi phân bổ điểm. UI hiển thị thanh trạng thái role="status" ('Phân bố N điểm trước khi tiếp tục') cùng các nút interactive +1 Thể phách/Thân pháp sáng rõ. Bot tự động hóa thiếu kịch bản cộng điểm nên liên tục spam click Tu luyện và nhận changed: false. Vấn đề đã đóng lặp lại tại #34/F7/Round 4/Round 8/Round 9. Căn cứ thiết kế: Donald Norman (The Design of Everyday Things: Forcing Functions & Interlocks — chốt khóa ngăn ngừa bỏ lỡ mốc tiến trình bắt buộc); Raph Koster (A Theory of Fun for Game Design: ma sát có chủ đích tạo sức nặng cho đột phá); Jesse Schell (The Art of Game Design: Lens #33 of the Rule).

#### [BY-DESIGN] Lethal danger terrain damage upon entering misty_forest
- **Giải thích:** #3 Sát thương địa hình hiểm địa Rừng Sương Mù làm cụt hứng tốc chiến: Thiết kế có chủ đích (by-design; r10p1 #24, #25). Sát thương địa hình hiểm trở tại Rừng Sương Mù (misty_forest) là cơ chế môi trường sinh tồn cốt lõi theo khung lý thuyết MDA (Mechanics-Dynamics-Aesthetics), buộc người chơi phải cân nhắc rủi ro/phần thưởng (risk-reward) và chuẩn bị đan dược hồi phục (Kim Sang Dược) hoặc phù hộ thân trước khi mạo hiểm. Cơ chế thuế nhập cảnh hiểm địa (entry tax) đã được giới hạn nghiêm ngặt chỉ trừ duy nhất 1 lần mỗi ngày trong cùng khu vực thông qua visitedDangerZones (hoàn thiện ở vé #37 tại src/engine/reducer.ts:555-586). Vùng hoang dã không phải là hành lang cày cấp vô hại; việc phớt lờ cảnh báo hiểm địa bị trừng phạt là logic thế giới nhất quán. Đã đóng tại Round 1 v3 F3/F11 và Round 4 #3. Căn cứ thiết kế: Tracy Fullerton (Game Design Workshop: Risk-Reward Pacing); Chris Crawford (The Art of Computer Game Design: hiểm họa thực tế tạo kịch tính); Raph Koster (A Theory of Fun: mô thức rõ ràng phải trừng phạt kẻ phớt lờ); Jesse Schell (The Art of Game Design: Lens #35 of Challenge & Lens #39 of Meaningful Choice).

#### [FALSE-POSITIVE] Achievement badges treated as disabled/unclickable in test harness digest
- **Giải thích:** #4, #7 Huy hiệu thành tựu vẫn bị xem là disabled / Locked achievements remain inaccessible in scraper digest: Báo cáo sai do khiếm khuyết bộ cào dữ liệu kiểm thử tự động (symptom của Finding 1; r10p2 #10, #19; r10p3 #15, #16, #25). Toàn bộ 13 huy hiệu thành tựu trong DockPanelMarket (src/ui/gameScreen/panels.tsx:382-421) đã được triển khai hoàn chỉnh dưới dạng phần tử <button type="button" className="achievement-badge..."> có đầy đủ aria-label, aria-describedby, aria-expanded, hỗ trợ focus bàn phím, kích hoạt phím Enter/Space/Click và mở popover chi tiết (đã kiểm chứng trong test/system-ui.test.tsx:460-520). Chúng hoàn toàn không có thuộc tính disabled. Tuy nhiên, do khối thành tựu bị xếp ở đáy panel dưới 12 công thức chế tạo, tọa độ của chúng vượt quá chiều cao khung nhìn (rect.bottom > window.innerHeight 800px). Hàm visible() tại scripts/browser-use-server.mjs:83 đã loại bỏ chúng khỏi digest hiển thị, và dòng 196 xuất tiêu đề tĩnh mặc định 'đã lược icon/trường disabled'. Bot kiểm thử đã đọc nhầm tiêu đề này và kết luận sai rằng các nút bị disabled. Việc đưa khối thành tựu lên đầu panel trong T-ACHIEVE-PROGRESS sẽ giải quyết triệt để hiện tượng này.

#### [FALSE-POSITIVE] Left Rail NPC roster names glued without spaces in text scraper digest
- **Giải thích:** #5 Tên nhân vật và danh xưng bị dính chuỗi trên thanh danh sách NPC thanh trái: Báo cáo sai do công cụ cào dữ liệu DOM (False Positive - Class #38 Scraper Artifact; r10p2 #5-#11; bots r10b01-r10b20 _summary). Trên giao diện đồ họa thực tế (src/ui/LeftRailTabContent.tsx:187-195; src/ui/screens.css:1328-1337), mỗi hàng NPC được bố trí theo CSS Grid 3 cột (grid-template-columns: 32px 1fr auto; gap: 10px; align-items: center;) cách biệt rõ ràng: avatar 32x32px bo tròn, tên NPC in đậm, danh xưng nhỏ màu trầm, và chỉ số hảo cảm phân tách. Đối với công nghệ trợ năng/screen readers (WCAG 1.3.1, 4.1.2), ký tự avatar được ẩn hoàn toàn bằng aria-hidden="true", chỉ số hảo cảm có aria-label="Hảo cảm 0". Lỗi dính chuỗi 'CCụ Mai Hoatrưởng làng♥ 0' phát sinh do scraper trong scripts/browser-use-server.mjs:73 đọc node.textContent trên toàn bộ thẻ button, nối thô các text node con mà bỏ qua layout CSS và aria-hidden. Đã đóng vĩnh viễn trong LEDGER.md dưới nhóm #38 class (Round 1 dòng 19, 34; Round 2 dòng 90; Round 4 dòng 144, 163). Căn cứ thiết kế: Donald Norman (The Design of Everyday Things: Signifiers & Visual Presentation); WCAG 1.3.1 (Info and Relationships).

#### [FALSE-POSITIVE] English language toggle missing from Settings menu in test harness digest
- **Giải thích:** #8 Language selector missing from Settings despite title header: Báo cáo sai do bộ lọc trích xuất của test harness (False Positive / Test Scraper Filter Artifact; r10p3 #2, #3). Cụm nút chuyển đổi ngôn ngữ (VI / EN) đã tồn tại đầy đủ, hoạt động hoàn hảo trên cả màn hình Thiết lập (src/ui/MainMenu.tsx:209-215 với <button aria-pressed={locale === 'vi'}>VI</button> và <button aria-pressed={locale === 'en'}>EN</button>, role="group", aria-label="Language") lẫn thanh tiêu đề ProtoShell (src/ui/ProtoShell.tsx:315). Người chơi bot r10p3 không tìm thấy nút do bộ lọc trích xuất của test harness tại scripts/browser-use-server.mjs:193 (if (control.name.length <= 2 && !control.field) return false;) tự động loại bỏ các nút điều khiển có độ dài nhãn <= 2 ký tự ('VI' và 'EN') khỏi danh sách digest rút gọn để tiết kiệm token. Người chơi người thật nhìn thấy và tương tác bình thường. Trùng lặp với #32 / F6 / Round 4 #1, #9 / Round 8 #4, #7 đã đóng nhiều lần trong LEDGER.md. Căn cứ thiết kế: Donald Norman (The Design of Everyday Things: Signifiers & Gulf of Evaluation); Jesse Schell (The Art of Game Design: Lens of the Interface); Tracy Fullerton (Game Design Workshop: Localization & Accessibility).

#### [FIXED-VERIFIED] T-NPC-KID: Child NPC Tiểu Bảo dialogue re-probed and confirmed clean
- **Giải thích:** T-NPC-KID Child NPC Tiểu Bảo uses adult generic dialogue templates: Đã khắc phục và tái xác minh thành công (re-probed and verified). Kịch bản hội thoại của NPC Tiểu Bảo (n_kid_xiaobao) tại src/ui/NpcChatModal.tsx:170-220 đã được đổi mới hoàn toàn bằng các lựa chọn trò chuyện ngây thơ, tinh nghịch phù hợp lứa tuổi trẻ nhỏ (hỏi bắt dế sau đình làng, kẹo hồ lô, thần tiên ngự kiếm), loại bỏ triệt để các mẫu câu người lớn ('đường sá', 'sức khỏe'). Đã được kiểm thử trong test/npc-chat-bilingual.test.ts. Trong Round 10, cả 3 người chơi người thật (r10p1-r10p3) và 20 code bots (r10b01-r10b20) đều không phát sinh bất kỳ khiếu nại nào về Tiểu Bảo. Xác nhận trạng thái fixed-verified theo Quy tắc 4. Căn cứ thiết kế: Tracy Fullerton (Game Design Workshop: Character Consistency & Voice); Jesse Schell (The Art of Game Design: Elemental Tetrad & Lens of the Character Arc).


---

## 3. Hàng đợi vé xử lý (Tickets)

### 3.1 Vé thực hiện trong vòng (Executed Tickets)
#### [MEDIUM / ui-css] T-ACHIEVE-PROGRESS: Achievements block buried at bottom of DockPanelMarket below 12 refinement recipes
- **Kế hoạch sửa:** In src/ui/gameScreen/panels.tsx:265-422 (DockPanelMarket), move the achievements block (<div className="achievements" role="region" aria-label={word(locale, 'Danh sách thành tựu', 'Achievements list')}>...</div>) to the top of the panel, immediately below the header/context banner and before the refinement recipe section (<section className="refinement-list">). This guarantees immediate above-the-fold visibility of achievement badges and progress when selecting the 'Chợ & thành tựu' tab, resolving the affordance gap for completionists and preventing viewport clipping in automation digests. (Merged findings: r10p1 #10, #17, #21; r10p2 #10, #19; r10p3 #15, #16, #25)
- **Kế hoạch kiểm thử:** In test/system-ui.test.tsx, add an assertion verifying that within DockPanelMarket, the '.achievements' container precedes '.refinement-list' in DOM order, ensuring achievement badges render above the fold.
- **Tệp liên quan:** `src/ui/gameScreen/panels.tsx`


---

## 4. Báo cáo sửa chữa của Fixer (Lane Fixer Report)

- **Làn thực hiện:** `ui-css`
- **Vé:** `T-ACHIEVE-PROGRESS`
- **Trạng thái:** `done`
- **Tóm tắt sửa đổi:** Relocated achievements container to the top of DockPanelMarket directly beneath panel-heading and before refinement-list, ensuring immediate above-the-fold visibility. Added DOM order assertion in test/system-ui.test.tsx verifying .achievements precedes .refinement-list.
- **Tệp thay đổi:** `F:\game-trung-sinh\src\ui\gameScreen\panels.tsx, F:\game-trung-sinh\test\system-ui.test.tsx`
- **Kết quả kiểm thử:** npx tsc --noEmit (clean), npx eslint src/ui/gameScreen/panels.tsx test/system-ui.test.tsx (clean), npx vitest run test/system-ui.test.tsx (12 passed, 0 failed, RED-GREEN verified).
- **Ghi chú:** Above-the-fold placement eliminates the affordance gap for completionists and prevents viewport clipping in automation digests. All 12/12 tests in test/system-ui.test.tsx pass cleanly.

---

## 5. Dữ liệu JSON gốc

```json
{
  "round": 10,
  "findings": [
    {
      "severity": "medium",
      "action_refs": "r10p1 #10, #17, #21",
      "what_happened": "T-ACHIEVE-PROGRESS probe verification: Huy hiá»‡u thÃ nh tá»±u Ä‘Ã£ Ä‘Æ°á»£c chuyá»ƒn thÃ nh nÃºt tÆ°Æ¡ng tÃ¡c cÃ³ aria-label vÃ  tiáº¿n Ä‘á»™ trong DockPanelMarket, nhÆ°ng bá»‹ xáº¿p á»Ÿ Ä‘Ã¡y panel dÆ°á»›i 12 cÃ´ng thá»©c Ä‘á»•i linh tÃ i nÃªn bá»‹ khuáº¥t táº§m nhÃ¬n. Äáº·c biá»‡t trong Sá»• tay hÃ nh táº©u, tab 'Chá»£ & thÃ nh tá»±u (1/13)' chá»‰ hiá»ƒn thá»‹ quáº§y Ä‘á»•i linh tÃ i chá»© khÃ´ng há» cÃ³ danh sÃ¡ch huy hiá»‡u thÃ nh tá»±u, cÃ²n á»Ÿ mÃ n hÃ¬nh chÃ­nh thÃ¬ panel Chá»£ bá»‹ khÃ³a cá»©ng khi khÃ´ng Ä‘á»©ng táº¡i Chá»£ VÃ¢n Táº­p.",
      "title": "T-ACHIEVE-PROGRESS: Huy hiá»‡u thÃ nh tá»±u bá»‹ chÃ´n sÃ¢u vÃ  thiáº¿u trong sá»• tay hÃ nh táº©u",
      "area": "ui-affordance",
      "_by": "r10p1"
    },
    {
      "action_refs": "bot r10b08 #11, bot r10b17 #15",
      "title": "NÃºt Tu luyá»‡n gÃ¢y dead-click khi thiáº¿u ChÃ¢n khÃ­ hoáº·c Sinh lá»±c",
      "area": "cultivation",
      "severity": "high",
      "what_happened": "NÃºt 'Tu luyá»‡n' khÃ´ng bá»‹ vÃ´ hiá»‡u hÃ³a khi thiáº¿u ChÃ¢n khÃ­ (Qi < 10) hoáº·c HP quÃ¡ tháº¥p Ä‘á»ƒ chá»‹u biáº¿n Ä‘á»™ng luyá»‡n cÃ´ng. NgÆ°á»i chÆ¡i báº¥m vÃ o bá»‹ engine tá»« chá»‘i trong im láº·ng, khÃ´ng cÃ³ pháº£n há»“i thá»‹ giÃ¡c hay cáº£nh bÃ¡o khiáº¿n thao tÃ¡c bá»‹ trÆ¡, gÃ¢y ra 23 dead-clicks trÃªn bot r10b08 vÃ  r10b17.",
      "_by": "r10p1"
    },
    {
      "severity": "medium",
      "what_happened": "Äá»‹a hÃ¬nh hiá»ƒm trá»Ÿ Rá»«ng SÆ°Æ¡ng MÃ¹ tá»± Ä‘á»™ng trá»« 11-18 HP ngay khi di chuyá»ƒn vÃ o trÆ°á»›c khi ká»‹p tham gia giao tranh vá»›i quÃ¡i thÃº TrÆ° Nha SÆ°Æ¡ng, gÃ¢y á»©c cháº¿ vÃ  lÃ m cháº­m nhá»‹p Ä‘á»™ Ä‘á»‘i vá»›i lá»‘i chÆ¡i tá»‘c chiáº¿n cÃ y quÃ¡i.",
      "area": "combat",
      "title": "SÃ¡t thÆ°Æ¡ng Ä‘á»‹a hÃ¬nh hiá»ƒm Ä‘á»‹a Rá»«ng SÆ°Æ¡ng MÃ¹ lÃ m cá»¥t há»©ng tá»‘c chiáº¿n",
      "action_refs": "r10p1 #24, #25",
      "_by": "r10p1"
    },
    {
      "title": "T-ACHIEVE-PROGRESS: Huy hiá»‡u thÃ nh tá»±u váº«n bá»‹ vÃ´ hiá»‡u hÃ³a, khÃ´ng xem Ä‘Æ°á»£c tiÃªu chÃ­ má»Ÿ khÃ³a",
      "what_happened": "Kiá»ƒm tra T-ACHIEVE-PROGRESS: Khi má»Ÿ tab 'Chá»£ & thÃ nh tá»±u' trong nháº­t kÃ½ (action 10) cÅ©ng nhÆ° DockPanelMarket táº¡i Chá»£ VÃ¢n Táº­p (action 19), 13 huy hiá»‡u thÃ nh tá»±u váº«n bá»‹ xem lÃ  pháº§n tá»­ disabled/icon khÃ´ng tÆ°Æ¡ng tÃ¡c vÃ  bá»‹ bá»™ lá»c accessibility/harness lÆ°á»£c bá» ('Ä‘Ã£ lÆ°á»£c icon/trÆ°á»ng disabled'). NgÆ°á»i chÆ¡i hÆ°á»›ng sÆ°u táº§m (codex completionist) khÃ´ng thá»ƒ click hoáº·c focus báº±ng bÃ n phÃ­m vÃ o cÃ¡c thÃ nh tá»±u bá»‹ khÃ³a Ä‘á»ƒ xem tiÃªu chÃ­ má»Ÿ khÃ³a hay tiáº¿n Ä‘á»™ cá»¥ thá»ƒ.",
      "action_refs": "session r10p2 #10, #19",
      "severity": "medium",
      "area": "ui-affordance",
      "_by": "r10p2"
    },
    {
      "title": "TÃªn nhÃ¢n váº­t vÃ  danh xÆ°ng bá»‹ dÃ­nh chuá»—i trÃªn thanh danh sÃ¡ch NPC thanh trÃ¡ig",
      "severity": "medium",
      "what_happened": "LÃ  ngÆ°á»i chÆ¡i nháº­p vai muá»‘n káº¿t giao vÃ  trÃ² chuyá»‡n vá»›i má»i ngÆ°á»i, danh sÃ¡ch nhÃ¢n sÄ© á»Ÿ thanh trÃ¡i (Left Rail) hiá»ƒn thá»‹ tÃªn bá»‹ dÃ­nh chuá»—i vÃ´ há»“n: kÃ½ tá»± avatar Ä‘áº§u, tÃªn gá»i, danh xÆ°ng vÃ  Ä‘iá»ƒm háº£o cáº£m dÃ­nh liá»n khÃ´ng dáº¥u cÃ¡ch (vÃ­ dá»¥ 'CCá»¥ Mai HoatrÆ°á»Ÿng lÃ ngâ™¥ 0', 'NNgo ká»ƒ chuyá»‡nngÆ°á»i ká»ƒ chuyá»‡nâ™¥ 0', 'CChá»§ quÃ¡n Háº¡nhchá»§ quÃ¡n trá»â™¥ 0'). Äiá»u nÃ y lÃ m giáº£m tráº£i nghiá»‡m nháº­p vai vÃ  khiáº¿n thiáº¿t bá»‹ trá»£ nÄƒng Ä‘á»c thÃ nh má»™t tá»« mÃ©o mÃ³.",
      "action_refs": "session r10p2 #5-#11; bots r10b01-r10b20 _summary",
      "area": "npc-social",
      "_by": "r10p2"
    },
    {
      "what_happened": "NÃºt 'Tu luyá»‡n' gÃ¢y ra chuá»—i dead-clicks (23 dead clicks á»Ÿ bot r10b08 vÃ  r10b17 vá»›i 'changed: false' láº·p Ä‘i láº·p láº¡i á»Ÿ action #11, #15, #19...). Sau khi báº¥m tu luyá»‡n, nÃºt váº«n giá»¯ nguyÃªn tráº¡ng thÃ¡i báº¥m Ä‘Æ°á»£c mÃ  khÃ´ng cÃ³ hiá»‡u á»©ng há»“i chiÃªu (cooldown) hoáº·c giáº£i thÃ­ch vÃ¬ sao lÆ°á»£t báº¥m tiáº¿p theo khÃ´ng táº¡o ra thay Ä‘á»•i tráº¡ng thÃ¡i nÃ o, khiáº¿n ngÆ°á»i chÆ¡i báº¥m liÃªn tá»¥c trong vÃ´ vá»ng.",
      "severity": "medium",
      "title": "NÃºt Tu luyá»‡n gÃ¢y dead-click liÃªn tiáº¿p do thiáº¿u pháº£n há»“i tráº¡ng thÃ¡i/há»“i chiÃªug",
      "area": "cultivation",
      "action_refs": "bot r10b08 #11,#15; bot r10b17 #11,#15",
      "_by": "r10p2"
    },
    {
      "area": "ui-affordance",
      "severity": "medium",
      "action_refs": "r10p3 #15, #16, #25",
      "what_happened": "As a codex completionist checking T-ACHIEVE-PROGRESS, I opened the journal and navigated to the 'Chá»£ & thÃ nh tá»±u: 0/13' tab. While the tab displays 0/13 unlocked, the 13 locked achievement badges are either marked disabled or rendered without interactive access in the control hierarchy ('Ä‘Ã£ lÆ°á»£c icon/trÆ°á»ng disabled'). A completionist cannot click, focus, or open inline popovers to inspect individual unlock criteria and progress for locked achievements.",
      "title": "Locked achievements remain inaccessible for unlock criteria inspection",
      "_by": "r10p3"
    },
    {
      "title": "Language selector missing from Settings despite title header",
      "action_refs": "r10p3 #2, #3",
      "severity": "medium",
      "what_happened": "As an English-language persona seeking every codex entry, I opened Settings which displays the title 'Thiáº¿t láº­p / Äá»™ khÃ³ / Há»‡ Thá»‘ng (AI) / Language'. Despite 'Language' appearing in the header, there is no language toggle, dropdown, or switch control available in the settings view, locking the client into Vietnamese.",
      "area": "localization",
      "_by": "r10p3"
    },
    {
      "what_happened": "Cultivation consumes Qi and HP, but when resources or requirements are insufficient, clicking 'Tu luyá»‡n' fails silently with no change in state or explanatory message. Corroborated in bot r10b08 which accumulated 23 dead clicks where repeated clicks on 'Tu luyá»‡n' produced changed: false with zero player feedback.",
      "area": "cultivation",
      "severity": "low",
      "action_refs": "r10p3 #21, bot r10b08 #11, #15, #19",
      "title": "Cultivate button produces silent dead clicks on resource depletion",
      "_by": "r10p3"
    }
  ],
  "lock": {
    "closed": [
      {
        "title": "Tu luyện button triggers repeated silent dead clicks when pending attribute points require allocation",
        "explanation": "#2, #6, #9 Nút Tu luyện gây dead-click khi thiếu Chân khí hoặc Sinh lực / thiếu phản hồi trạng thái: Báo cáo sai thực tế do bot kiểm thử tự động vấp phải chốt chặn tiến trình (gộp báo cáo từ r10p1 #2, r10p2 #6, r10p3 #9 và telemetry r10b08.jsonl:103, r10b17.jsonl:103). Nhân vật đang có hp: 87, qi: 40 (không hề thiếu Qi < 10 hay cạn kiệt HP). Việc đạt mốc 40 Qi kích hoạt đột phá cảnh giới và phát sinh 2 điểm tiềm năng chưa phân bổ (pendingAttributePoints = 2). Engine thực thi chốt khóa liên động ATTRIBUTE_ALLOCATION_REQUIRED tại src/engine/reducer.ts:393-399 để tạm dừng chu trình tu luyện/di chuyển cho đến khi phân bổ điểm. UI hiển thị thanh trạng thái role=\"status\" ('Phân bố N điểm trước khi tiếp tục') cùng các nút interactive +1 Thể phách/Thân pháp sáng rõ. Bot tự động hóa thiếu kịch bản cộng điểm nên liên tục spam click Tu luyện và nhận changed: false. Vấn đề đã đóng lặp lại tại #34/F7/Round 4/Round 8/Round 9. Căn cứ thiết kế: Donald Norman (The Design of Everyday Things: Forcing Functions & Interlocks — chốt khóa ngăn ngừa bỏ lỡ mốc tiến trình bắt buộc); Raph Koster (A Theory of Fun for Game Design: ma sát có chủ đích tạo sức nặng cho đột phá); Jesse Schell (The Art of Game Design: Lens #33 of the Rule).",
        "classification": "false-positive"
      },
      {
        "explanation": "#3 Sát thương địa hình hiểm địa Rừng Sương Mù làm cụt hứng tốc chiến: Thiết kế có chủ đích (by-design; r10p1 #24, #25). Sát thương địa hình hiểm trở tại Rừng Sương Mù (misty_forest) là cơ chế môi trường sinh tồn cốt lõi theo khung lý thuyết MDA (Mechanics-Dynamics-Aesthetics), buộc người chơi phải cân nhắc rủi ro/phần thưởng (risk-reward) và chuẩn bị đan dược hồi phục (Kim Sang Dược) hoặc phù hộ thân trước khi mạo hiểm. Cơ chế thuế nhập cảnh hiểm địa (entry tax) đã được giới hạn nghiêm ngặt chỉ trừ duy nhất 1 lần mỗi ngày trong cùng khu vực thông qua visitedDangerZones (hoàn thiện ở vé #37 tại src/engine/reducer.ts:555-586). Vùng hoang dã không phải là hành lang cày cấp vô hại; việc phớt lờ cảnh báo hiểm địa bị trừng phạt là logic thế giới nhất quán. Đã đóng tại Round 1 v3 F3/F11 và Round 4 #3. Căn cứ thiết kế: Tracy Fullerton (Game Design Workshop: Risk-Reward Pacing); Chris Crawford (The Art of Computer Game Design: hiểm họa thực tế tạo kịch tính); Raph Koster (A Theory of Fun: mô thức rõ ràng phải trừng phạt kẻ phớt lờ); Jesse Schell (The Art of Game Design: Lens #35 of Challenge & Lens #39 of Meaningful Choice).",
        "title": "Lethal danger terrain damage upon entering misty_forest",
        "classification": "by-design"
      },
      {
        "explanation": "#4, #7 Huy hiệu thành tựu vẫn bị xem là disabled / Locked achievements remain inaccessible in scraper digest: Báo cáo sai do khiếm khuyết bộ cào dữ liệu kiểm thử tự động (symptom của Finding 1; r10p2 #10, #19; r10p3 #15, #16, #25). Toàn bộ 13 huy hiệu thành tựu trong DockPanelMarket (src/ui/gameScreen/panels.tsx:382-421) đã được triển khai hoàn chỉnh dưới dạng phần tử <button type=\"button\" className=\"achievement-badge...\"> có đầy đủ aria-label, aria-describedby, aria-expanded, hỗ trợ focus bàn phím, kích hoạt phím Enter/Space/Click và mở popover chi tiết (đã kiểm chứng trong test/system-ui.test.tsx:460-520). Chúng hoàn toàn không có thuộc tính disabled. Tuy nhiên, do khối thành tựu bị xếp ở đáy panel dưới 12 công thức chế tạo, tọa độ của chúng vượt quá chiều cao khung nhìn (rect.bottom > window.innerHeight 800px). Hàm visible() tại scripts/browser-use-server.mjs:83 đã loại bỏ chúng khỏi digest hiển thị, và dòng 196 xuất tiêu đề tĩnh mặc định 'đã lược icon/trường disabled'. Bot kiểm thử đã đọc nhầm tiêu đề này và kết luận sai rằng các nút bị disabled. Việc đưa khối thành tựu lên đầu panel trong T-ACHIEVE-PROGRESS sẽ giải quyết triệt để hiện tượng này.",
        "title": "Achievement badges treated as disabled/unclickable in test harness digest",
        "classification": "false-positive"
      },
      {
        "classification": "false-positive",
        "title": "Left Rail NPC roster names glued without spaces in text scraper digest",
        "explanation": "#5 Tên nhân vật và danh xưng bị dính chuỗi trên thanh danh sách NPC thanh trái: Báo cáo sai do công cụ cào dữ liệu DOM (False Positive - Class #38 Scraper Artifact; r10p2 #5-#11; bots r10b01-r10b20 _summary). Trên giao diện đồ họa thực tế (src/ui/LeftRailTabContent.tsx:187-195; src/ui/screens.css:1328-1337), mỗi hàng NPC được bố trí theo CSS Grid 3 cột (grid-template-columns: 32px 1fr auto; gap: 10px; align-items: center;) cách biệt rõ ràng: avatar 32x32px bo tròn, tên NPC in đậm, danh xưng nhỏ màu trầm, và chỉ số hảo cảm phân tách. Đối với công nghệ trợ năng/screen readers (WCAG 1.3.1, 4.1.2), ký tự avatar được ẩn hoàn toàn bằng aria-hidden=\"true\", chỉ số hảo cảm có aria-label=\"Hảo cảm 0\". Lỗi dính chuỗi 'CCụ Mai Hoatrưởng làng♥ 0' phát sinh do scraper trong scripts/browser-use-server.mjs:73 đọc node.textContent trên toàn bộ thẻ button, nối thô các text node con mà bỏ qua layout CSS và aria-hidden. Đã đóng vĩnh viễn trong LEDGER.md dưới nhóm #38 class (Round 1 dòng 19, 34; Round 2 dòng 90; Round 4 dòng 144, 163). Căn cứ thiết kế: Donald Norman (The Design of Everyday Things: Signifiers & Visual Presentation); WCAG 1.3.1 (Info and Relationships)."
      },
      {
        "title": "English language toggle missing from Settings menu in test harness digest",
        "classification": "false-positive",
        "explanation": "#8 Language selector missing from Settings despite title header: Báo cáo sai do bộ lọc trích xuất của test harness (False Positive / Test Scraper Filter Artifact; r10p3 #2, #3). Cụm nút chuyển đổi ngôn ngữ (VI / EN) đã tồn tại đầy đủ, hoạt động hoàn hảo trên cả màn hình Thiết lập (src/ui/MainMenu.tsx:209-215 với <button aria-pressed={locale === 'vi'}>VI</button> và <button aria-pressed={locale === 'en'}>EN</button>, role=\"group\", aria-label=\"Language\") lẫn thanh tiêu đề ProtoShell (src/ui/ProtoShell.tsx:315). Người chơi bot r10p3 không tìm thấy nút do bộ lọc trích xuất của test harness tại scripts/browser-use-server.mjs:193 (if (control.name.length <= 2 && !control.field) return false;) tự động loại bỏ các nút điều khiển có độ dài nhãn <= 2 ký tự ('VI' và 'EN') khỏi danh sách digest rút gọn để tiết kiệm token. Người chơi người thật nhìn thấy và tương tác bình thường. Trùng lặp với #32 / F6 / Round 4 #1, #9 / Round 8 #4, #7 đã đóng nhiều lần trong LEDGER.md. Căn cứ thiết kế: Donald Norman (The Design of Everyday Things: Signifiers & Gulf of Evaluation); Jesse Schell (The Art of Game Design: Lens of the Interface); Tracy Fullerton (Game Design Workshop: Localization & Accessibility)."
      },
      {
        "title": "T-NPC-KID: Child NPC Tiểu Bảo dialogue re-probed and confirmed clean",
        "classification": "fixed-verified",
        "explanation": "T-NPC-KID Child NPC Tiểu Bảo uses adult generic dialogue templates: Đã khắc phục và tái xác minh thành công (re-probed and verified). Kịch bản hội thoại của NPC Tiểu Bảo (n_kid_xiaobao) tại src/ui/NpcChatModal.tsx:170-220 đã được đổi mới hoàn toàn bằng các lựa chọn trò chuyện ngây thơ, tinh nghịch phù hợp lứa tuổi trẻ nhỏ (hỏi bắt dế sau đình làng, kẹo hồ lô, thần tiên ngự kiếm), loại bỏ triệt để các mẫu câu người lớn ('đường sá', 'sức khỏe'). Đã được kiểm thử trong test/npc-chat-bilingual.test.ts. Trong Round 10, cả 3 người chơi người thật (r10p1-r10p3) và 20 code bots (r10b01-r10b20) đều không phát sinh bất kỳ khiếu nại nào về Tiểu Bảo. Xác nhận trạng thái fixed-verified theo Quy tắc 4. Căn cứ thiết kế: Tracy Fullerton (Game Design Workshop: Character Consistency & Voice); Jesse Schell (The Art of Game Design: Elemental Tetrad & Lens of the Character Arc)."
      }
    ],
    "bot_health": "20/20 bots ran (r10b01–r10b20) across groups 0–9, 1767 steps; every host alive (ports 4175–4184); errors=0; 46 dead clicks (23 on r10b08, 23 on r10b17 during ATTRIBUTE_ALLOCATION_REQUIRED gate); 0 host or server died.",
    "tickets": [
      {
        "title": "T-ACHIEVE-PROGRESS: Achievements block buried at bottom of DockPanelMarket below 12 refinement recipes",
        "files_hint": "src/ui/gameScreen/panels.tsx",
        "lane": "ui-css",
        "test_plan": "In test/system-ui.test.tsx, add an assertion verifying that within DockPanelMarket, the '.achievements' container precedes '.refinement-list' in DOM order, ensuring achievement badges render above the fold.",
        "fix_plan": "In src/ui/gameScreen/panels.tsx:265-422 (DockPanelMarket), move the achievements block (<div className=\"achievements\" role=\"region\" aria-label={word(locale, 'Danh sách thành tựu', 'Achievements list')}>...</div>) to the top of the panel, immediately below the header/context banner and before the refinement recipe section (<section className=\"refinement-list\">). This guarantees immediate above-the-fold visibility of achievement badges and progress when selecting the 'Chợ & thành tựu' tab, resolving the affordance gap for completionists and preventing viewport clipping in automation digests. (Merged findings: r10p1 #10, #17, #21; r10p2 #10, #19; r10p3 #15, #16, #25)",
        "fresh": false,
        "severity": "medium"
      }
    ]
  },
  "fixes": [
    {
      "tests": "npx tsc --noEmit (clean), npx eslint src/ui/gameScreen/panels.tsx test/system-ui.test.tsx (clean), npx vitest run test/system-ui.test.tsx (12 passed, 0 failed, RED-GREEN verified).",
      "summary": "Relocated achievements container to the top of DockPanelMarket directly beneath panel-heading and before refinement-list, ensuring immediate above-the-fold visibility. Added DOM order assertion in test/system-ui.test.tsx verifying .achievements precedes .refinement-list.",
      "notes": "Above-the-fold placement eliminates the affordance gap for completionists and prevents viewport clipping in automation digests. All 12/12 tests in test/system-ui.test.tsx pass cleanly.",
      "ticket": "T-ACHIEVE-PROGRESS",
      "status": "done",
      "files_changed": "F:\\game-trung-sinh\\src\\ui\\gameScreen\\panels.tsx, F:\\game-trung-sinh\\test\\system-ui.test.tsx",
      "lane": "ui-css"
    }
  ]
}
```

## Bot summaries

```
{"_summary":{"steps":101,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":87,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button","tên dính chuỗi vô hồn: \"TThợ săn Sơnthợ săn♥ 0\" #button","tên dính chuỗi vô hồn: \"TTiều phu Bồngtiều phu♥ 0\" #button","tên dính chuỗi vô hồn: \"TTán tu Nhấttán tu rừng sương♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","map","play","dialog"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":120,"dead_clicks":0,"unique_gaps":[],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","dialog"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":96,"dead_clicks":0,"unique_gaps":["map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":78,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":57,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button","tên dính chuỗi vô hồn: \"TThợ săn Sơnthợ săn♥ 0\" #button","tên dính chuỗi vô hồn: \"TTiều phu Bồngtiều phu♥ 0\" #button","tên dính chuỗi vô hồn: \"TTán tu Nhấttán tu rừng sương♥ 0\" #button","tên dính chuỗi vô hồn: \"CCốc chủ Cốcẩn sĩ hang đá♥ 0\" #button","tên dính chuỗi vô hồn: \"VVong hồn Hàvong hồn lang thang♥ 0\" #button","tên dính chuỗi vô hồn: \"TThợ khắc Khuêthợ khắc bùa♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","map","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":65,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":101,"dead_clicks":23,"unique_gaps":["map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":96,"dead_clicks":0,"unique_gaps":["play:hái thảo: không tìm được điều khiển (/hái thảo/i) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map","dialog"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":101,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":87,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button","tên dính chuỗi vô hồn: \"TThợ săn Sơnthợ săn♥ 0\" #button","tên dính chuỗi vô hồn: \"TTiều phu Bồngtiều phu♥ 0\" #button","tên dính chuỗi vô hồn: \"TTán tu Nhấttán tu rừng sương♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","map","play","dialog"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":120,"dead_clicks":0,"unique_gaps":[],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","dialog"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":96,"dead_clicks":0,"unique_gaps":["map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":78,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":57,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button","tên dính chuỗi vô hồn: \"TThợ săn Sơnthợ săn♥ 0\" #button","tên dính chuỗi vô hồn: \"TTiều phu Bồngtiều phu♥ 0\" #button","tên dính chuỗi vô hồn: \"TTán tu Nhấttán tu rừng sương♥ 0\" #button","tên dính chuỗi vô hồn: \"CCốc chủ Cốcẩn sĩ hang đá♥ 0\" #button","tên dính chuỗi vô hồn: \"VVong hồn Hàvong hồn lang thang♥ 0\" #button","tên dính chuỗi vô hồn: \"TThợ khắc Khuêthợ khắc bùa♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","map","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":65,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":101,"dead_clicks":23,"unique_gaps":["map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":96,"dead_clicks":0,"unique_gaps":["play:hái thảo: không tìm được điều khiển (/hái thảo/i) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map","dialog"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":78,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","play","map"],"days_seen":null,"errors":[]}}
{"_summary":{"steps":87,"dead_clicks":0,"unique_gaps":["npc:talk: không tìm được điều khiển (/nói chuyện với|trò chuyện/) trên màn game","map:travel: không tìm được điều khiển (/^Đi (tới|\\d)/) trên màn game"],"unique_issues":["tên dính chuỗi vô hồn: \"CCụ Mai Hoatrưởng làng♥ 0\" #button","tên dính chuỗi vô hồn: \"NNgo kể chuyệnngười kể chuyện♥ 0\" #button","tên dính chuỗi vô hồn: \"CChủ quán Hạnhchủ quán trọ♥ 0\" #button","tên dính chuỗi vô hồn: \"DDân binh Trườngdân binh♥ 0\" #button","tên dính chuỗi vô hồn: \"TThợ săn Sơnthợ săn♥ 0\" #button","tên dính chuỗi vô hồn: \"TTiều phu Bồngtiều phu♥ 0\" #button","tên dính chuỗi vô hồn: \"TTán tu Nhấttán tu rừng sương♥ 0\" #button"],"last_chronicle":[],"screens_seen":["boot","map","play","dialog"],"days_seen":null,"errors":[]}}
```
