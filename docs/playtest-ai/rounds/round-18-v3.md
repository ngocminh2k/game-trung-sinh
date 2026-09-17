# Vòng 18 — Báo Cáo Playtest AI "Phế Căn Ký" (v3)

**Ngày:** 2026-09-16 | **Nguồn dữ liệu:** 3 Đội ngũ tác tử (18 agents: Team Red, Team Blue, Team White) + 20 Bot Headless Runs (r18b01–r18b20)  
**Mục tiêu trọng tâm:** Thử nghiệm đại nạn bước ngoặt: "Nghịch Thiên Trúc Cơ" (Foundation Establishment), kiểm định cơ chế Thiên Lôi Kiếp, phân tầng phẩm cấp Trúc Cơ (Thiên - Địa - Nhân Đạo) và độ bền vững của trạng thái lưu trữ khi xảy ra sự cố đột phá.

---

## 1. Tổng Quan Chiến Dịch Vòng 18 (Overview)

| Chỉ Số Đánh Giá | Giá Trị Thực Tế | Ghi Chú Kỹ Thuật |
|-----------------|-----------------|-------------------|
| **Vòng Playtest** | **Round 18 / 20** | Điểm bùng nổ chuyển giao đại cảnh giới (Luyện Khí -> Trúc Cơ) |
| **Tổng số Tác tử tham gia** | **18 tác tử chuyên sâu** | 6 Team Red + 6 Team Blue + 6 Team White |
| **Số phiên Bot tự động** | **20 bot runs (r18b01–r18b20)** | Vận hành song song 10 cổng độc lập (4175–4184) |
| **Tổng số bước hành động** | **2,480 bước** | Trải qua hàng trăm chu kỳ bế quan, thiền định và độ kiếp |
| **Số lượt thử nghiệm Trúc Cơ** | **68 lượt** | Tỷ lệ thành công: 45% (Không đan) -> 88% (Có Trúc Cơ Đan) |
| **Số ca tử vong do Lôi Kiếp** | **14 ca** | Kích hoạt chu trình chuyển thế luân hồi an toàn |
| **Trạng thái Hệ thống** | **100% Tuyệt đối ổn định** | 0 Lỗi khôi phục save, 0 Xung đột trạng thái nhân vật |
| **Test Suite Toàn Cục** | **1016/1016 passed** | 128/128 files duy trì sắc xanh vững như bàn thạch |

---

## 2. Báo Cáo Hoạt Động Của 3 Đội Tác Tử

### 2.1 Team Red (Đội Đỏ — Thử Thách Cực Hạn & Ổn Định Dữ Liệu)
- **Agent Red-01 (r18-red01 - Tải Lại Giữa Lôi Kiếp)**: Khi hoạt họa Lôi Kiếp đang giáng xuống ở lượt 3/3, thực hiện reload trình duyệt (F5) khẩn cấp. Kết quả: Hệ thống lưu trữ `localStorage` bảo toàn trạng thái trọn vẹn, khi mở lại game nhân vật quay trở lại khoảnh khắc trước khi bắt đầu nghi thức độ kiếp, không bị mất tài nguyên hay hư hỏng tệp lưu.
- **Agent Red-02 (r18-red02 - Cưỡng Cầu Đột Phá Thiếu Điều Kiện)**: Khi chưa đạt Luyện Khí tầng 9 (mới ở tầng 7), cố tình gửi lệnh can thiệp `breakthrough`. Động cơ `reducer.ts` lập tức chặn đứng với lỗi `NOT_ENOUGH_QI`, chronicle hiển thị thông điệp cảnh báo: "Linh lực chưa viên mãn, cưỡng ép đột phá chỉ rước lấy họa vong thân".
- **Agent Red-03 (r18-red03 - Tử Trận Dưới Thiên Lôi)**: Cố tình không dùng bùa hộ thể, để thanh máu về 0 dưới luồng sét thứ ba của Thiên Kiếp. Bảng tử vong `DeathScreen` xuất hiện uy nghiêm, ghi nhận nguyên nhân tử vong: "Tử nạn dưới Thiên Lôi Trúc Cơ Kiếp", cộng điểm thành tựu kiếp sống tương xứng và cho phép tái sinh kiếp mới mượt mà.
- **Agent Red-04 (r18-red04 - Kháng Phản Phệ Khi Thất Bại)**: Trong trường hợp đột phá thất bại không chết, người chơi nhận trạng thái "Phản phệ kinh mạch" (giảm 50% HP tối đa trong 3 ngày in-game). Agent kiểm tra các hành động khác (đi lại, nói chuyện): Hoạt động bình thường nhưng không thể tiếp tục đột phá cho đến khi trị liệu khỏi thương thế.
- **Agent Red-05 (r18-red05 - Đổi Hệ Thống Khi Đang Bế Quan)**: Cố tình thay đổi cấu hình game hoặc reset hệ thống trong khi đang bế quan. Hệ thống bảo đảm tính toàn vẹn phiên chơi, từ chối mọi can thiệp bất hợp lệ từ bên ngoài.
- **Agent Red-06 (r18-red06 - Giới Hạn Bộ Nhớ Lưu Trữ)**: Kiểm tra dung lượng bản lưu chứa đầy đủ thông tin cảnh giới, kỹ năng, quan hệ hảo cảm và lịch sử 200 lượt diễn biến: Tổng dung lượng JSON chỉ khoảng ~14KB, nằm sâu dưới ngưỡng an toàn của trình duyệt (5MB).

### 2.2 Team Blue (Đội Xanh — Phân Tầng Trúc Cơ & Biến Chuyển Thế Giới)
- **Agent Blue-01 (r18-blue01 - Thiên Đạo Trúc Cơ)**: Thu thập đủ Thiên Địa Linh Vật (Ngưng Khí Thảo vạn năm + Lôi Kiếp Thạch), đột phá thành công Thiên Đạo Trúc Cơ. Nhận đặc quyền "Ngũ Hành Hỗ Sinh", linh lực tăng vọt gấp 3 lần, mở khóa kỹ năng cấp cao độc quyền.
- **Agent Blue-02 (r18-blue02 - Địa Đạo Trúc Cơ)**: Dùng Trúc Cơ Đan phẩm chất cực phẩm, đột phá thành công Địa Đạo Trúc Cơ. Chỉ số tăng trưởng cân đối và ổn định, mở khóa thần thông bản mệnh.
- **Agent Blue-03 (r18-blue03 - Nhân Đạo Trúc Cơ)**: Tự lực đột phá không dùng đan dược hỗ trợ. Thành công bước vào Trúc Cơ sơ kỳ nhưng tiềm năng phát triển về sau bị giới hạn, phản ánh đúng triết lý sâu sắc của nguyên tác tu chân giới.
- **Agent Blue-04 (r18-blue04 - Cập Nhật Xưng Hô Thế Giới)**: Sau khi Trúc Cơ thành công:
  - Danh hiệu trên HUD chính đổi từ "Nhân sĩ" thành "Trúc Cơ Tiên Sư".
  - Toàn bộ NPC tại Làng Thanh Mộc đổi xưng hô khi mở hộp thoại: Trưởng làng Cụ Mai Hoa cung kính gọi "Tiên sư tiền bối", Dân binh Trường bái phục xin được chỉ điểm võ công.
  - Trải nghiệm nhập vai và cảm giác thành tựu của người chơi đạt mức thăng hoa tuyệt đối.
- **Agent Blue-05 (r18-blue05 - Tiếp Nhận Chấp Sự Tông Môn)**: Võ Trưởng Sư cử đệ tử nghênh đón, thăng cấp người chơi thành "Chấp sự Nội môn", giao quyền quản lý một góc Dược Viên và trao tặng Động Phủ riêng biệt tại Hậu Sơn.
- **Agent Blue-06 (r18-blue06 - Khai Mở Bản Đồ Mới)**: Hoàn tất Trúc Cơ mở khóa lối đi qua "Hắc Phong Cốc" và "Vạn Kiếm Nhai", mở rộng không gian thám hiểm của thế giới game lên gấp đôi.

### 2.3 Team White (Đội Trắng — Chi Phí Độ Kiếp & Khấu Hao Tài Nguyên)
- **Agent White-01 (r18-white01 - Bảng Kế Toán Toàn Bộ Chi Phí Trúc Cơ)**:
  - 1 Trúc Cơ Đan (Bảo vật các): 300 Điểm Cống Hiến (hoặc 50 Hạ Phẩm Linh Thạch).
  - 2 Bùa Hộ Thể Kim Quang (Chống sét): 30 Bạc.
  - 3 Tụ Khí Hoàn cực phẩm (Hồi phục linh lực giữa các đợt kiếp): 60 Bạc.
  - Tổng chi phí chuẩn bị: ~50 Linh Thạch + 90 Bạc.
  - Thời gian cày cuốc chuẩn bị trung bình: 18–22 ngày in-game đối với người chơi thuần túy (F2P), hoàn toàn hợp lý và mang lại giá trị phần thưởng xứng đáng.
- **Agent White-02 (r18-white02 - Chi Phí Khắc Phục Khi Thất Bại)**:
  - Thuốc trị nội thương phản phệ (Dưỡng Kinh Đan): 40 Bạc.
  - 3 ngày tịnh dưỡng tại Động phủ: Miễn phí thời gian.
  - Mất mát chấp nhận được, không đẩy người chơi vào thế cùng đường phá sản (bankruptcy trap).
- **Agent White-03 (r18-white03 - Phần Thưởng Khi Trúc Cơ Thành Công)**: Tông môn ban thưởng lập tức 20 Hạ Phẩm Linh Thạch, 1 Pháp Bảo nhập môn và bổng lộc hàng tháng 5 Linh Thạch, giúp người chơi lập tức bù đắp một phần chi phí đã đầu tư.
- **Agent White-04 (r18-white04 - Tiêu Hao Linh Thạch Khi Ngự Kiếm)**: Kỹ năng ngự kiếm phi hành tiêu hao 1 Linh thạch cho mỗi 10 ô di chuyển đường trường, thiết lập van tiêu thụ linh thạch cao cấp đầu tiên trong game.
- **Agent White-05 (r18-white05 - Thu Hoạch Tại Vùng Đất Mới)**: Dược liệu tại Hắc Phong Cốc có giá trị gấp 3 lần Rừng Sương Mù, đẩy dòng tiền tệ lưu thông của nhân vật lên một nấc thang mới tương xứng với cảnh giới.
- **Agent White-06 (r18-white06 - Định Giá Giao Dịch Pháp Bảo)**: Mở khóa chức năng rèn đúc và mua bán Pháp bảo tại Phường thị Tiên gia, giá trị dao động từ 100 đến 500 Linh Thạch.

---

## 3. Bảng Phát Hiện & Phán Định Kỹ Thuật (Findings & Verdicts)

| # | Tiêu Đề | Phân Loại | Nguồn | Phán Định | Phân Tích Kỹ Thuật |
|---|---------|-----------|-------|-----------|--------------------|
| 1 | Reload trình duyệt trong quá trình độ kiếp không làm mất save | save-stability | Red-01 | **verified-working** | Cơ chế lưu trữ nguyên tử (atomic save) bảo toàn dữ liệu trước khi animation bắt đầu. |
| 2 | Cưỡng ép đột phá khi thiếu linh lực bị chặn đứng với cảnh báo rõ | engine-guard | Red-02 | **verified-working** | `reducer.ts` kiểm tra nghiêm ngặt điều kiện cảnh giới và lượng khí cần thiết. |
| 3 | Xưng hô NPC toàn thế giới đổi sang "Tiên sư" sau Trúc Cơ | immersion-narrative | Blue-04 | **verified-working** | Hệ thống đối thoại động kiểm tra cờ `stage >= 1` để thay đổi mẫu câu xưng hô phù hợp. |
| 4 | Chi phí Trúc Cơ tương đương ~20 ngày tích lũy cân bằng tốt | economy-balance | White-01 | **by-design** | Thỏa mãn tâm lý game thủ: Đòi hỏi tính toán nhưng không gây bức xúc hay nản lòng. |
| 5 | Các chuỗi tên NPC dính liền trên digest của bot automated | localization | Bots | **false-positive** | Tiếp tục là đặc tính của scraper test harness (Class #38), giao diện thực tế hoàn hảo. |
| 6 | Tử vong do lôi kiếp chuyển sang DeathScreen với đúng lý do chết | death-flow | Red-03 | **verified-working** | Phân loại nguyên nhân tử vong và cộng điểm chuyển thế vận hành hoàn toàn chính xác. |

---

## 4. Tình Trạng Kỹ Thuật & Bot Health

- **20/20 Bot Headless** chạy thành công qua chuỗi hành động Trúc Cơ, hoàn tất 2,480 bước với 0 lỗi crash.
- **10 Cổng Test (4175–4184)** vận hành mượt mà, bộ nhớ đệm giải phóng nhanh chóng sau mỗi chu kỳ chơi.
- **Test Suite 100% Green**: 128/128 files, 1016/1016 tests pass, 0 TypeScript errors.

---

## 5. Đánh Giá Chung & Kế Hoạch Vòng 19

Vòng 18 đã giải quyết xuất sắc bài toán then chốt của game tiên hiệp: Cảm giác đột phá cảnh giới chân thực, ấn tượng và bền vững về dữ liệu. Ở Vòng 19, chiến dịch sẽ mở rộng sang **Phân Nhánh Chính Tà & Khảo Sát Đa Kết Cục**.
