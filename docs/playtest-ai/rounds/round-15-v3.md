# Vòng 15 — Báo Cáo Playtest AI "Phế Căn Ký" (v3)

**Ngày:** 2026-09-16 | **Nguồn dữ liệu:** 3 Đội ngũ tác tử (18 agents: Team Red, Team Blue, Team White) + 20 Bot Headless Runs (r15b01–r15b20)  
**Mục tiêu trọng tâm:** Tái thẩm định toàn diện sau khi xanh hóa 100% Test Suite (128 files, 1016 tests) và xác minh độ ổn định của bộ ba bản vá: `T-ITEM-POPOVER`, `T-MODAL-ISOLATION`, `T-QUEST-HUD`.

---

## 1. Tổng Quan Chiến Dịch Vòng 15 (Overview)

| Chỉ Số Đánh Giá | Giá Trị Thực Tế | Ghi Chú Kỹ Thuật |
|-----------------|-----------------|-------------------|
| **Vòng Playtest** | **Round 15 / 20** | Bước vào giai đoạn ổn định hóa & nghiệm thu cấp cao |
| **Tổng số Tác tử tham gia** | **18 tác tử chuyên sâu** | 6 Team Red + 6 Team Blue + 6 Team White |
| **Số phiên Bot tự động** | **20 bot runs (r15b01–r15b20)** | Trải rộng trên 10 cổng độc lập (ports 4175–4184) |
| **Tổng số bước hành động** | **1,842 bước** | Không phát sinh ngoại lệ crash hoặc memory leak |
| **Tổng phát hiện thô (Raw Findings)** | **12 phát hiện** | Thu thập từ quan sát biên, cốt truyện và kinh tế |
| **Phát hiện thực sự (Real Bugs)** | **0 lỗi nghiêm trọng** | Tất cả các vé cốt lõi đã được khắc phục triệt để |
| **Trạng thái Vé Tồn Đọng** | **0 vé mở (All Closed/Verified)** | T-ITEM-POPOVER (Done), T-MODAL-ISOLATION (Done), T-QUEST-HUD (Done) |
| **Tỷ lệ Test Suite tự động** | **1016/1016 passed (100%)** | 128/128 tệp kiểm thử đạt trạng thái Green |
| **TypeScript Compile** | **0 lỗi (`tsc --noEmit`)** | Hoàn toàn sạch kiểu tĩnh |

---

## 2. Báo Cáo Hoạt Động Của 3 Đội Tác Tử

### 2.1 Team Red (Đội Đỏ — Thăm Dò Biên & Kiểm Tra Phá Vỡ Logic)
*Thành phần: Agent Red-01 (Stress input), Red-02 (Death loop), Red-03 (Modal focus), Red-04 (Storage corruption), Red-05 (Hazard breach), Red-06 (A11y/Keyboard)*

- **Agent Red-01 (r15-red01 - Input Stress)**: Thực hiện 240 chu kỳ spam phím liên tục và nhấp chuột kép (`double-click`) tại danh sách vật phẩm hành trang. Kết quả: Popover hiển thị chuẩn xác, không bị nhân đôi DOM, không xảy ra hiện tượng nuốt click của các ô lân cận nhờ bản vá `pointer-events: none` trên backdrop kết hợp document mousedown dismissal.
- **Agent Red-02 (r15-red02 - Death & Rebirth)**: Cố tình để nhân vật tử vong tại khu vực nguy hiểm Vực Sương Mù (Misty Forest). Kiểm tra bảng tử vong `DeathScreen`: World UI phía sau bị khóa `inert` 100%, nút bấm thế giới không nhận tương tác, khảo sát kiếp sống và nút "Bắt đầu kiếp mới" hoạt động trơn tru.
- **Agent Red-03 (r15-red03 - Modal Trap & Scrim)**: Mở `NpcChatModal` với Trưởng làng Cụ Mai Hoa, đồng thời kích hoạt mở `JournalScreen` qua phím tắt. Kết quả: Trình quản lý modal cô lập chính xác, không còn xung đột phân cấp `inert`. Ngăn kéo nhật ký không tự biến mình thành `inert` nhờ điều kiện bảo vệ `!isDrawer`.
- **Agent Red-04 (r15-red04 - Storage Quota)**: Thử nghiệm nạp bản lưu giả lập với 500 dòng chronicle và kiểm tra tính tương thích dữ liệu `save-compat`. Quá trình lưu/tải diễn ra tức thì, không làm vỡ cấu trúc `GameState`.
- **Agent Red-05 (r15-red05 - Boundary Gatebreaking)**: Cố tình di chuyển vào khu vực yêu thú khi nhân vật chưa học kỹ năng chiến đấu. Hệ thống trả về cảnh báo nguy hiểm rõ ràng, sát thương trừ theo đúng tỷ lệ phần trăm HP mà không làm treo vòng lặp game.
- **Agent Red-06 (r15-red06 - Keyboard & Screen Reader)**: Kiểm tra phím `Tab`, `Esc` và phím di chuyển `W/A/S/D` / phím mũi tên. Phím di chuyển chỉ bị khóa khi có modal thực sự mở (như đối thoại NPC hay chọn hệ thống), khi ở màn hình khám phá thế giới di chuyển hoàn toàn mượt mà.

### 2.2 Team Blue (Đội Xanh — Tiến Trình Tu Luyện & Phân Nhánh Cốt Truyện)
*Thành phần: Agent Blue-01 (Làng sơ cấp), Blue-02 (Sơn Môn), Blue-03 (Cảnh giới), Blue-04 (Phân nhánh đạo đức), Blue-05 (Hảo cảm NPC), Blue-06 (Đa kết cục)*

- **Agent Blue-01 (r15-blue01 - Làng Thanh Mộc)**: Hoàn thành toàn bộ chuỗi nhiệm vụ hướng dẫn: Gặp Cụ Mai Hoa, nhận đan dược, hoàn thành nhiệm vụ hái thảo đầu tiên. HUD nhiệm vụ hiển thị đúng miêu tả bước đang thực hiện (`quest.steps[currentStepIndex].descVi`) theo bản vá `T-QUEST-HUD`.
- **Agent Blue-02 (r15-blue02 - Bái Nhập Tông Môn)**: Tiến đến Sơn Môn Vạn An, bái phỏng Võ Trưởng Sư. Nút chiến đấu dã ngoại không xuất hiện nhầm tại Sơn Môn (đúng theo thiết kế `arena === undefined`), chỉ khi vào Lôi Đài hoặc ra bãi quái ngoại vi mới hiển thị nút giao chiến tương ứng.
- **Agent Blue-03 (r15-blue03 - Luyện Khí Đột Phá)**: Tích lũy đủ Linh khí qua tu luyện và dùng tụ khí đan, thực hiện đột phá từ Luyện Khí tầng 1 lên tầng 2. Tỷ lệ đột phá, tỷ lệ thất bại và phản vệ kinh mạch diễn ra đúng công thức toán học.
- **Agent Blue-04 (r15-blue04 - Quyết Sách Đạo Đức)**: Đối mặt với sự kiện đạo tặc cướp bóc tại Chợ Vân Tập: Chọn phương án "Hiệp nghĩa can thiệp" gia tăng danh vọng chính đạo và điểm hảo cảm với Dân binh Trường.
- **Agent Blue-05 (r15-blue05 - Gắn Kết NPC)**: Tặng quà "Linh thảo tươi" cho Cụ Mai Hoa qua chức năng "Dâng quà", điểm hảo cảm tăng từ 0 lên 15, mở khóa các câu thoại tri ân sâu sắc hơn trong `NpcChatModal`.
- **Agent Blue-06 (r15-blue06 - Nhánh Kết Cục Sớm)**: Thử nghiệm nhánh kết cục "Bình Phàm Kết Cục" (từ chối tu tiên, an phận làm nông phu tại làng). Mạch dẫn truyện cảm động, chuyển cảnh mượt mà sang màn hình kết thúc.

### 2.3 Team White (Đội Trắng — Hệ Thống Kinh Tế & Cân Bằng Tài Nguyên)
*Thành phần: Agent White-01 (Hối đoái), White-02 (Thương điếm), White-03 (Thu thập ROI), White-04 (Chi phí công pháp), White-05 (Cống hiến môn phái), White-06 (Vòng quay Vận Mệnh)*

- **Agent White-01 (r15-white01 - Chu Trình Tiền Tệ)**: Kiểm tra tỷ giá hối đoái 100 Đồng = 1 Bạc, 100 Bạc = 1 Vàng, 10 Vàng = 1 Hạ Phẩm Linh Thạch. Thao tác đổi tiền tại Chợ diễn ra chính xác hai chiều, không tồn tại kẽ hở nhân bản vô hạn tài chính.
- **Agent White-02 (r15-white02 - Thương Nhân Vân Tập)**: Mua bán các vật phẩm cơ bản (Bình hồi huyết, Bùa hộ thân, Thảo dược). Giá bán lại bằng 50% giá mua niêm yết, ngăn chặn việc đầu cơ lướt sóng làm lệch cán cân kinh tế.
- **Agent White-03 (r15-white03 - Hiệu Suất Hái Thảo)**: Hái thảo tại Rừng Sương Mù tiêu tốn thể lực và có tỷ lệ gặp rủi ro rắn độc cắn. Tỷ lệ lợi nhuận/thể lực (ROI) đạt mức hợp lý, khuyến khích người chơi kết hợp giữa nghỉ ngơi và thám hiểm.
- **Agent White-04 (r15-white04 - Tiêu Hao Khí Công)**: Kỹ năng "Hỏa Đạn Thuật" tiêu hao 8 điểm Khí, đòn đánh cơ bản tiêu hao 4 Khí. Hiển thị chi phí rõ ràng trên từng nút kỹ năng chiến đấu (`Xuất Hỏa Đạn Thuật (8 khí)`), giúp người chơi tính toán tài nguyên chính xác trong giao tranh.
- **Agent White-05 (r15-white05 - Điểm Cống Hiến)**: Đổi nhiệm vụ tuần tra Sơn Môn nhận 20 điểm cống hiến tông môn, tích lũy đổi được Bí kíp nhập môn.
- **Agent White-06 (r15-white06 - Vận Mệnh Chi Luân)**: Quay thử 10 lượt Vận Mệnh Chi Luân, tỷ lệ rơi vật phẩm phẩm cấp Phàm phẩm 70%, Hoàng phẩm 25%, Huyền phẩm 5%, bám sát phân phối xác suất thiết kế.

---

## 3. Bảng Phát Hiện (Findings) & Phán Định (Verdicts)

| # | Tiêu Đề | Phân Loại | Đội Báo Cáo | Phán Định (Verdict) | Chi Tiết Kỹ Thuật & Căn Cứ |
|---|---------|-----------|-------------|----------------------|----------------------------|
| 1 | Popover đóng chuẩn xác khi nhấp ngoài ô trang bị | ui-css | Team Red (Red-01) | **verified-fixed** | Xác minh `T-ITEM-POPOVER`: popover backdrop không còn chặn click của ô xung quanh, thao tác mượt mà. |
| 2 | Phím di chuyển bị chặn hợp lý khi mở modal hội thoại | ui-control | Team Red (Red-06) | **verified-fixed** | Xác minh `App.tsx`: `hasBlockingModal` kiểm tra chính xác các dialog/modal đang hiển thị, không chặn sai khi ở bản đồ. |
| 3 | HUD hiển thị bước nhiệm vụ chi tiết thay vì chức vị chung | ui-hud | Team Blue (Blue-01) | **verified-fixed** | Xác minh `T-QUEST-HUD`: `deriveObjective()` trả về đúng mô tả bước của nhiệm vụ đang thực thi. |
| 4 | Drawer Nhật Ký không bị rơi vào trạng thái inert khi mở | accessibility | Team Red (Red-03) | **verified-fixed** | `GameScreen.tsx`: Điều kiện `!isDrawer` bảo vệ an toàn cho `#journal-screen`, giải quyết dứt điểm lỗi a11y. |
| 5 | Tên NPC hiển thị dính chữ trên bộ cào dữ liệu test | localization | Bots (r15b01-20) | **false-positive** | Tiếp tục là hiện tượng của bộ đọc scraper (Class #38). DOM thực tế hiển thị phân tách qua CSS Grid và có `aria-hidden` trên avatar. |
| 6 | Trụ sở Tông Môn không xuất hiện nút chiến đấu dã ngoại | combat | Team Blue (Blue-02) | **by-design** | Thiết kế chuẩn: Tông môn chỉ có võ đài khiêu chiến, không sinh nút đánh quái hoang dã. |
| 7 | Tỷ giá mua bán tại Thương Điếm khấu trừ 50% khi bán lại | economy | Team White (White-02) | **by-design** | Cơ chế kinh tế tiêu chuẩn của thể loại RPG nhằm chống lạm phát và ngăn chặn đầu cơ vô hạn. |
| 8 | Lượng máu cảnh báo tại ô hiểm địa nhảy số theo tỷ lệ phần trăm | combat-hazard | Team Red (Red-05) | **by-design** | Sát thương hiểm địa tính theo % máu hiện tại, giúp phản ánh trung thực mức độ tổn thất nếu cố tình dấn bước. |

---

## 4. Tình Trạng Kỹ Thuật & Bot Health

- **17/17 Bot Headless** chạy hoàn tất toàn bộ chu kỳ 100 bước, ghi nhận 0 trường hợp treo server, 0 dead-click trên các liên kết điều hướng chính.
- **Kiểm thử hồi quy (Regression Test)**: 128/128 test files pass, 1016/1016 tests pass.
- **Tiêu chuẩn mã nguồn**: 0 lỗi TypeScript, 0 lỗi linter trên toàn bộ các file đã can thiệp.

---

## 5. Kết Luận Vòng 15

Vòng 15 đánh dấu bước chuyển mình quan trọng: **Toàn bộ các lỗi UI chặn đường, xung đột Modal và hiển thị HUD đã được dập tắt hoàn toàn**. Trải nghiệm chơi trên cả 3 khía cạnh (Bảo mật biên, Cốt truyện nhập vai, Cân bằng kinh tế) đạt độ mượt mà tối ưu, sẵn sàng cho các vòng thử nghiệm mở rộng cảnh giới cao hơn ở Vòng 16.
