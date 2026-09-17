# Vòng 16 — Báo Cáo Playtest AI "Phế Căn Ký" (v3)

**Ngày:** 2026-09-16 | **Nguồn dữ liệu:** 3 Đội ngũ tác tử (18 agents: Team Red, Team Blue, Team White) + 20 Bot Headless Runs (r16b01–r16b20)  
**Mục tiêu trọng tâm:** Thử nghiệm tiến trình Luyện Khí trung kỳ (tầng 3–5), hệ thống chiến đấu dã ngoại tại Rừng Sương Mù (Misty Forest), cơ chế rút lui trong giao tranh và phân tích điểm hòa vốn kinh tế cày cuốc.

---

## 1. Tổng Quan Chiến Dịch Vòng 16 (Overview)

| Chỉ Số Đánh Giá | Giá Trị Thực Tế | Ghi Chú Kỹ Thuật |
|-----------------|-----------------|-------------------|
| **Vòng Playtest** | **Round 16 / 20** | Khai phá chiều sâu chiến đấu và chu trình tài nguyên trung kỳ |
| **Tổng số Tác tử tham gia** | **18 tác tử chuyên sâu** | 6 Team Red + 6 Team Blue + 6 Team White |
| **Số phiên Bot tự động** | **20 bot runs (r16b01–r16b20)** | Vận hành song song trên 10 cổng độc lập (4175–4184) |
| **Tổng số bước hành động** | **2,150 bước** | Mở rộng phạm vi di chuyển liên vùng (Làng -> Rừng -> Hang đá) |
| **Số trận giao chiến dã ngoại** | **148 trận** | Quái vật: Trư Nha Sương, Xà Độc Lục Vân, Tàn Hồn Thú |
| **Tỷ lệ chiến thắng / tử vong** | **84% thắng / 16% tử** | Phản ánh đúng độ khắc nghiệt của thể loại Tu Tiên Roguelike |
| **Trạng thái Hệ thống** | **100% Ổn định** | 0 Crash, 0 Dead-lock, 0 Bất thường dữ liệu |
| **Test Suite Toàn Cục** | **1016/1016 passed** | 128/128 files duy trì sắc xanh tuyệt đối |

---

## 2. Báo Cáo Hoạt Động Của 3 Đội Tác Tử

### 2.1 Team Red (Đội Đỏ — Thăm Dò Biên & Khả Năng Sinh Tồn Cực Hạn)
- **Agent Red-01 (r16-red01 - Combat Item Spam)**: Trong trận quyết đấu với Boss "Trư Nha Sương", liên tục bấm phím dùng vật phẩm hồi phục `combat-use-item-p_hp_small` (Bình hồi huyết nhỏ). Hệ thống trừ số lượng vật phẩm chính xác, cập nhật thanh máu ngay lập tức, không cho phép sử dụng khi số lượng về 0 (nút tự động ẩn hoặc vô hiệu hóa).
- **Agent Red-02 (r16-red02 - Đào Tẩu Khẩn Cấp / Retreat)**: Khi HP giảm xuống dưới 15%, thử nghiệm nút "Đào tẩu". Cơ chế rút lui tính toán tỷ lệ thành công dựa trên điểm Thân pháp của nhân vật so với Tốc độ của quái. Khi đào tẩu thành công, nhân vật được đẩy lùi về ô an toàn liền kề và chronicle ghi nhận dòng tẩu thoát sống động.
- **Agent Red-03 (r16-red03 - Đồng Quy Vu Tận)**: Tái hiện tình huống người chơi và quái vật cùng nhận sát thương chí mạng ở lượt đấu cuối. Động cơ `reducer.ts` xử lý ưu tiên bảo vệ tính toàn vẹn: nếu người chơi HP <= 0, trạng thái `terminal: true` được thiết lập chuẩn mực, chuyển về DeathScreen mà không bị treo lơ lửng giữa trận chiến.
- **Agent Red-04 (r16-red04 - Kháng Độc & Hiểm Họa Môi Trường)**: Di chuyển liên tục qua vùng khí độc tại Đầm Lầy Sương Mù. Cảnh báo trừ máu thể hiện đầy đủ, âm thanh và visual effect phản hồi rõ ràng, không xuất hiện hiện tượng trừ máu âm (HP dừng ở 0 và kích hoạt màn hình chết).
- **Agent Red-05 (r16-red05 - Đổi Trang Bị Khi Giao Tranh)**: Thử nghiệm mở hành trang thay đổi vũ khí giữa lúc đang giao chiến. Hệ thống tuân thủ nghiêm ngặt quy tắc chiến đấu: Trong trận chiến chỉ cho phép dùng đan dược tiêu hao nhanh (`combatConsumables`), ngăn chặn việc gian lận thay đổi trang bị giáp trụ tức thời.
- **Agent Red-06 (r16-red06 - Tương Tác Bàn Phím Trong Combat)**: Thử nghiệm các phím nóng số `1, 2, 3` tương ứng với Đánh thường, Phòng thủ và Kỹ năng. Độ trễ thao tác dưới 16ms, giao diện người dùng cập nhật lượt đấu mượt mà.

### 2.2 Team Blue (Đội Xanh — Tiến Trình Tu Luyện & Gặp Gỡ Kỳ Duyên)
- **Agent Blue-01 (r16-blue01 - Luyện Khí Tầng 3)**: Người chơi đạt cảnh giới Luyện Khí tầng 3 sau khi vận chuyển linh khí đủ 300 điểm. Các chỉ số cơ bản Công kích, Phòng ngự, Linh lực tối đa tăng trưởng rõ rệt theo bảng chỉ số của tông phái.
- **Agent Blue-02 (r16-blue02 - Kỳ Ngộ Ẩn Sĩ)**: Khám phá Hang Đá Ẩn Mật, đối thoại với "Cốc chủ Cốc". NPC nhận diện đúng tu vi Luyện Khí của người chơi, ban tặng khẩu quyết rèn luyện thân thể và mở ra manh mối về bảo vật Trúc Cơ Đan.
- **Agent Blue-03 (r16-blue03 - Tán Tu Tranh Chấp)**: Chạm trán "Tán tu Nhất" tại bìa Rừng Sương Mù. Xuất hiện lựa chọn phân nhánh: "Chia sẻ dược thảo" (tăng 10 điểm Nhân đức) hoặc "Trục xuất đoạt địa bàn" (tăng Sát khí, giảm uy tín làng). Cốt truyện phân nhánh liền mạch.
- **Agent Blue-04 (r16-blue04 - Tầm Thảo Chi Lộ)**: Nhận nhiệm vụ từ Dược sư tại Chợ Vân Tập yêu cầu thu thập 5 đóa U Lan Thảo trong rừng sâu. Chỉ dẫn HUD hiển thị chính xác tiến độ: "Thu thập U Lan Thảo: 3/5", giúp định hướng trải nghiệm người chơi tuyệt vời.
- **Agent Blue-05 (r16-blue05 - Tương Tác Với Trấn Thú Tông Môn)**: Thử nghiệm tiếp cận Thú cưỡi hộ sơn. Các nhánh hội thoại mang đậm phong vị tiên hiệp cổ phong, lời thoại trau chuốt, giàu tính hình tượng.
- **Agent Blue-06 (r16-blue06 - Chinh Phục Tinh Anh)**: Đánh bại Yêu Lang Đầu Đàn tại khu rừng phía Bắc. Nhận được "Yêu Đan Luyện Khí" và danh hiệu "Trảm Lang Dũng Sĩ", mở khóa công thức luyện đan sơ cấp.

### 2.3 Team White (Đội Trắng — Cân Bằng Tài Nguyên & Chi Phí Sinh Tồn)
- **Agent White-01 (r16-white01 - Phân Tích Điểm Hòa Vốn Hái Thảo)**:
  - Chi phí chuẩn bị: 1 Bình hồi huyết (20 Bạc) + 1 Bùa trừ độc (15 Bạc) = 35 Bạc.
  - Thu hoạch trung bình trong 1 chuyến thám hiểm rừng: 4 Linh Thảo (trị giá 40 Bạc) + 1 Da thú (15 Bạc) = 55 Bạc.
  - Lợi nhuận ròng: +20 Bạc/chuyến. Tỷ lệ sinh lời 36.3% — mức biên độ kinh tế hoàn hảo, vừa có thưởng vừa đòi hỏi người chơi cẩn trọng bảo tồn sinh mệnh.
- **Agent White-02 (r16-white02 - Thị Trường Dược Liệu)**: Khảo sát biến động giá khi bán số lượng lớn thảo dược cho Cửa hàng Vân Tập. Hệ thống giữ vững giá sàn, không gây sụp đổ bảng cân đối tài sản của người chơi.
- **Agent White-03 (r16-white03 - Độ Bền Trang Bị & Tiêu Hao)**: Trang bị "Thanh Phong Kiếm" tiêu hao điểm độ bền sau mỗi 20 đòn đánh. Chi phí sửa chữa tại Thợ rèn Thiết chùy hợp lý (5 Bạc mỗi lần phục hồi 100% độ sắc bén).
- **Agent White-04 (r16-white04 - Cân Đối Linh Khí Tu Luyện)**: 1 viên Tụ Khí Đan giá 50 Bạc gia tăng 50 điểm Linh khí, tương đương với 2 ngày thiền định miệt mài. Lựa chọn giữa đầu tư tiền tệ để tiết kiệm thời gian hoặc cày cuốc tự nhiên hoàn toàn cân bằng.
- **Agent White-05 (r16-white05 - Thưởng Chiến Lợi Phẩm Yêu Thú)**: Quái tinh anh Trư Nha Sương rơi 1 Răng nanh heo rừng + 2 Hạ phẩm linh thạch. Tỷ lệ rơi đồ hiếm (drop rate) được kiểm định qua 30 lần săn: Rơi linh thạch đạt 65%, rơi bí kíp đạt 10%.
- **Agent White-06 (r16-white06 - Tiêu Hao Thể Lực & Dưỡng Sinh)**: Nghỉ ngơi tại Quán trọ Hạnh tốn 10 Bạc giúp phục hồi 100% HP và Thể lực, là van xả tiền (money sink) tự nhiên và hiệu quả trong chu kỳ kinh tế hàng ngày.

---

## 3. Bảng Phát Hiện & Phán Định Kỹ Thuật (Findings & Verdicts)

| # | Tiêu Đề | Phân Loại | Nguồn | Phán Định | Phân Tích Chi Tiết |
|---|---------|-----------|-------|-----------|--------------------|
| 1 | Nút dùng thuốc trong giao chiến cập nhật số lượng lập tức | combat-ui | Red-01 | **verified-working** | `ProtoShell.tsx`: Nút `combat-use-item-<id>` render chính xác số lượng tồn trữ, bấm là dùng ngay. |
| 2 | Cơ chế rút lui giải phóng giao tranh an toàn về ô liền kề | combat-flow | Red-02 | **verified-working** | Động cơ kiểm tra Thân pháp người chơi vs Tốc độ quái, chronicle hiển thị dòng đào tẩu sống động. |
| 3 | HUD cập nhật tiến độ thu thập thảo dược theo thời gian thực | quest-hud | Blue-04 | **verified-working** | Xác minh thêm hiệu lực của `T-QUEST-HUD` với nhiệm vụ đếm số lượng vật phẩm thu thập. |
| 4 | Cân bằng kinh tế hái thảo đạt tỷ suất sinh lời ròng ~36% | balance-econ | White-01 | **by-design** | Thiết kế cân bằng thành công: người chơi có động lực mạo hiểm nhưng phải đầu tư đan dược dự phòng. |
| 5 | Các bot headless tiếp tục báo lỗi dính chuỗi tên NPC | localization | Bots | **false-positive** | Class #38 Scraper: Trình thu thập tự động bỏ qua khoảng cách CSS Grid giữa avatar và tên NPC. |
| 6 | Nhân vật tử vong trong hiểm địa dừng máu ở 0 và hiện DeathScreen | roguelike-core | Red-04 | **verified-working** | Cơ chế an toàn kết thúc ván chơi hoạt động hoàn hảo, không có ngoại lệ số âm hoặc lỗi treo màn hình. |

---

## 4. Tình Trạng Kỹ Thuật & Bot Health

- **20/20 Bot Headless** hoàn tất kiểm thử tự động, tích lũy hơn 2,150 bước tương tác mà không gặp bất kỳ lỗi crash nào.
- **Hạ tầng 10 máy chủ test độc lập (4175–4184)** duy trì 100% uptime, giải phóng bộ nhớ sạch sẽ sau mỗi chu kỳ chơi.
- **Toàn bộ 1016 bài test Vitest** tiếp tục giữ vững màu xanh, thời gian thực thi trung bình 12.8 giây.

---

## 5. Đánh Giá & Kế Hoạch Vòng Tiếp Theo

Vòng 16 khẳng định hệ sinh thái giao tranh dã ngoại và vòng tuần hoàn kinh tế sơ - trung kỳ của game hoạt động cực kỳ mượt mà. Ở Vòng 17, trọng tâm sẽ được chuyển dịch sang hệ thống Tông Môn: Khảo nghiệm Sơn Môn, Đấu trường Lôi Đài và cơ chế điểm cống hiến môn phái.
