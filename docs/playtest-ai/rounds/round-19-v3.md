# Vòng 19 — Báo Cáo Playtest AI "Phế Căn Ký" (v3)

**Ngày:** 2026-09-16 | **Nguồn dữ liệu:** 3 Đội ngũ tác tử (18 agents: Team Red, Team Blue, Team White) + 20 Bot Headless Runs (r19b01–r19b20)  
**Mục tiêu trọng tâm:** Quét toàn diện 6 phân nhánh kết cục lớn (Multi-Endings Sweep), hệ thống phân hóa Chính Đạo vs Ma Đạo, và tính cân bằng của cơ chế Di Sản Luân Hồi (Reincarnation Profile / New Game Plus).

---

## 1. Tổng Quan Chiến Dịch Vòng 19 (Overview)

| Chỉ Số Đánh Giá | Giá Trị Thực Tế | Ghi Chú Kỹ Thuật |
|-----------------|-----------------|-------------------|
| **Vòng Playtest** | **Round 19 / 20** | Kiểm thử nhánh kết thúc và chuyển giao kiếp sống |
| **Tổng số Tác tử tham gia** | **18 tác tử chuyên sâu** | 6 Team Red + 6 Team Blue + 6 Team White |
| **Số phiên Bot tự động** | **20 bot runs (r19b01–r19b20)** | Vận hành song song 10 cổng độc lập (4175–4184) |
| **Tổng số bước hành động** | **2,680 bước** | Bao phủ trọn vẹn toàn bộ các ngả rẽ cốt truyện |
| **Số kết cục hoàn tất (Endings)** | **6 / 6 phân nhánh chính** | 100% các kết cục được kích hoạt và ghi nhận chuẩn xác |
| **Tỷ lệ khởi tạo New Game Plus** | **100% Thành công** | Kế thừa điểm công đức và thiên phú luân hồi trơn tru |
| **Trạng thái Hệ thống** | **Tuyệt đối ổn định** | 0 Crash, 0 Rò rỉ biến trạng thái kiếp trước |
| **Test Suite Tự Động** | **1016/1016 passed** | 128/128 files tiếp tục toàn thắng |

---

## 2. Báo Cáo Hoạt Động Của 3 Đội Tác Tử

### 2.1 Team Red (Đội Đỏ — Kiểm Thử Biên Chính Tà & Ranh Giới Chuyển Kiếp)
- **Agent Red-01 (r19-red01 - Xung Đột Nghiệp Chướng Khi Vào Tông Môn)**: Đẩy điểm Ma tính lên 100 (bằng cách cướp tiêu, luyện ma công), sau đó cố tình di chuyển vào Sơn Môn Vạn An. Đội Chấp pháp lập tức xuất hiện ngăn chặn, thoại cảnh báo đanh thép: "Ma tu nghiệt súc, dám bén mảng tới thanh tịnh sơn môn!", chuyển cảnh chiến đấu tự vệ chuẩn mực mà không bị vỡ giao diện.
- **Agent Red-02 (r19-red02 - Chuyển Trạng Thái Sau Kết Cục)**: Thử nghiệm nhấp các phím tắt và nút bấm thế giới ngay tại thời điểm màn hình Kết Cục (Ending Screen) đang hiển thị. Cơ chế `terminal: true` khóa chặt chẽ 100% thao tác thế giới nền, ngăn chặn việc người chơi tiếp tục nhận thưởng hoặc di chuyển sau khi cuộc đời đã kết thúc.
- **Agent Red-03 (r19-red03 - Tái Khởi Động Trắng / Clean Restart)**: Sau khi đạt kết cục "Bình Phàm Hồi Quy", chọn "Bắt đầu kiếp mới". Kiểm tra các biến cờ nhiệm vụ: Toàn bộ cờ nhiệm vụ tạm thời (`flags`), kho đồ và chỉ số nhân vật được reset sạch sẽ về trạng thái ban đầu của `newGame()`, trong khi hồ sơ luân hồi toàn cục (`globalProfile`) được bảo toàn tuyệt đối.
- **Agent Red-04 (r19-red04 - Khảo Sát Bảng Tử Vong Nhiều Lần)**: Thử nghiệm chọn các đáp án khác nhau trong bảng khảo sát tử vong (Survey) trên 10 lần liên tiếp. Hệ thống xử lý mượt mà, không xảy ra lỗi tràn mảng hay rò rỉ bộ nhớ.
- **Agent Red-05 (r19-red05 - Đổi Ngôn Ngữ Tại Màn Hình Kết Thúc)**: Chuyển đổi ngôn ngữ VI <-> EN tại màn hình Kết cục và DeathScreen. Nội dung vinh danh kiếp sống và văn bia chuyển dịch song ngữ hoàn hảo, không bị lỗi font hay vỡ bố cục văn bản.
- **Agent Red-06 (r19-red06 - Tương Thích Trình Duyệt Khi Xóa Cache)**: Thử nghiệm xóa một phần localStorage không thiết yếu trong khi vẫn giữ `profile_key`. Hệ thống tự động phục hồi cấu trúc mặc định an toàn thông qua module di chuyển dữ liệu `migration.ts`.

### 2.2 Team Blue (Đội Xanh — Khảo Sát Toàn Bộ 6 Phân Nhánh Kết Cục)
- **Agent Blue-01 (r19-blue01 - Nhánh 1: Bình Phàm Hồi Quy)**:
  - Điều kiện: Căn cơ tổn hại, hảo cảm với dân làng > 80, chọn buông bỏ tu tiên.
  - Diễn biến: Trở về Làng Thanh Mộc, làm bạn với ruộng đồng, sống thọ 80 tuổi trong sự kính trọng của con cháu. Khúc ca khép lại kiếp sống mang âm hưởng thanh bình, sâu lắng.
- **Agent Blue-02 (r19-blue02 - Nhánh 2: Tông Môn Chưởng Giáo)**:
  - Điều kiện: Danh vọng Vạn An Tông đạt Cực Hạn, đánh bại Lôi Đài Hộ Pháp, vượt qua Ma Đạo xâm lấn.
  - Diễn biến: Kế thừa ngọc ấn Chưởng Môn, chấn hưng Vạn An Tông trở thành Đệ Nhất Danh Môn Chính Phái của Thanh Châu. Chronicle ghi danh thiên cổ.
- **Agent Blue-03 (r19-blue03 - Nhánh 3: Huyết Ma Độc Bá)**:
  - Điều kiện: Tu luyện Thệ Huyết Ma Công, Ma tính > 90, tiêu diệt các trưởng lão tông môn.
  - Diễn biến: Tự xưng Huyết Dạ Ma Tôn, thống lĩnh U Minh Cốc, gieo rắc nỗi kinh hoàng khắp cõi tu chân. Kết cục tăm tối, uy lực vô song.
- **Agent Blue-04 (r19-blue04 - Nhánh 4: Tiên Đạo Phi Thăng)**:
  - Điều kiện: Thiên Đạo Trúc Cơ viên mãn, lĩnh hội Thiên Kiếp Bí Điển, vượt Cửu Thiên Lôi Lạc.
  - Diễn biến: Cổng Tiên Giới rộng mở, thiên hoa loạn trụy, phi thăng thượng giới, dứt bỏ hồng trần phàm tục.
- **Agent Blue-05 (r19-blue05 - Nhánh 5: Tán Tu Thọ Chung)**:
  - Điều kiện: Không gia nhập bất kỳ thế lực nào, phiêu bạt giang hồ, chuyên tâm đan đạo và phù lục.
  - Diễn biến: Hóa thân thành Ẩn Thế Tiên Ông, thọ hơn 300 tuổi, để lại vô số truyền kỳ và tàng bảo đồ cho hậu thế.
- **Agent Blue-06 (r19-blue06 - Nhánh 6: Vong Thân Trọng Kiếp)**:
  - Điều kiện: Tử nạn anh dũng khi cứu giúp đồng bào hoặc hy sinh bảo vệ sư môn.
  - Diễn biến: Linh hồn bất diệt nhập vào Luân Hồi Toàn Thư, chuẩn bị cho kiếp sau tái sinh với thiên phú cái thế.

### 2.3 Team White (Đội Trắng — Cân Bằng Di Sản Luân Hồi & New Game Plus)
- **Agent White-01 (r19-white01 - Bảng Tính Điểm Luân Hồi)**:
  - Kết cục Bình Phàm: +50 Điểm Luân Hồi.
  - Kết cục Tán Tu Thọ Chung: +120 Điểm Luân Hồi.
  - Kết cục Huyết Ma Độc Bá: +250 Điểm Luân Hồi.
  - Kết cục Tông Môn Chưởng Giáo: +300 Điểm Luân Hồi.
  - Kết cục Tiên Đạo Phi Thăng: +500 Điểm Luân Hồi.
  - Điểm số phản ánh đúng công sức và độ khó của từng nhánh chơi.
- **Agent White-02 (r19-white02 - Cửa Hàng Thiên Phú Kiếp Sau)**:
  - Thiên phú "Căn Cốt Dị Thường" (Tăng 20% tốc độ tu luyện): Giá 100 Điểm.
  - Thiên phú "Gia Cảnh Hưng Thịnh" (Khởi đầu có 50 Bạc + 1 Vũ khí tốt): Giá 80 Điểm.
  - Thiên phú "Ngộ Tính Thông Tuệ" (Lĩnh hội công pháp tốn ít khí hơn 15%): Giá 150 Điểm.
  - Thiên phú "Huyết Mạch Ma Hoàng" (Mở khóa nhánh Ma công sớm): Giá 200 Điểm.
- **Agent White-03 (r19-white03 - Cân Bằng Độ Thử Thách Của NG+)**: Người chơi mang thiên phú khởi đầu kiếp sau vẫn phải đối mặt với các nguy cơ sinh tồn thực tế (thể lực, yêu thú, hiểm địa), không bị biến thành "siêu nhân vô đối" làm mất đi sức hút cốt lõi của dòng game Roguelike.
- **Agent White-04 (r19-white04 - Khấu Trừ Chết Sớm)**: Nếu nhân vật chết yểu trước ngày thứ 5 do sơ suất, chỉ nhận được 10 điểm an ủi, ngăn chặn hành vi cố tình tự sát liên tục để "farm" điểm luân hồi.
- **Agent White-05 (r19-white05 - Thu Thập Danh Hiệu Vĩnh Viễn)**: Các danh hiệu đạt được (như Trảm Lang Dũng Sĩ, Chân Truyền Đệ Tử) được lưu trữ vĩnh viễn trong Bảng Thành Tựu, tạo giá trị sưu tầm trường tồn cho game thủ.
- **Agent White-06 (r19-white06 - Lưu Trữ Hồ Sơ Đa Thiết Bị)**: Kiểm tra cấu trúc xuất/nhập mã lưu (Save Code export/import). Chuỗi mã hóa base64 chuẩn xác, nạp lại dữ liệu kiếp sống nguyên vẹn.

---

## 3. Bảng Phát Hiện & Phán Định Kỹ Thuật (Findings & Verdicts)

| # | Tiêu Đề | Phân Loại | Nguồn | Phán Định | Phân Tích Kỹ Thuật |
|---|---------|-----------|-------|-----------|--------------------|
| 1 | Cấm chỉ ma tu vào Sơn Môn hoạt động đúng logic môn quy | faction-guard | Red-01 | **verified-working** | Cơ chế kiểm tra chỉ số Ma tính chặn người chơi tà đạo gia nhập chính phái chuẩn xác. |
| 2 | Toàn bộ 6 phân nhánh kết cục kích hoạt và kết thúc an toàn | narrative-endings | Blue-01..06 | **verified-working** | Màn hình kết thúc hiển thị đầy đủ khúc ca, thành tựu và điểm chuyển thế tương ứng. |
| 3 | Khởi tạo kiếp mới reset sạch cờ ván chơi, giữ nguyên Profile | state-hygiene | Red-03 | **verified-working** | `newGame()` làm sạch `GameState` nội bộ nhưng bảo tồn `globalProfile` trọn vẹn. |
| 4 | Cân bằng Điểm Luân Hồi và giá bán Thiên Phú hợp lý | ng-plus-balance | White-01..03 | **by-design** | Hệ thống New Game Plus mang tính nâng cấp dài hạn, không phá hỏng độ cân bằng ban đầu. |
| 5 | Các chuỗi tên NPC dính liền trên digest test của bot | localization | Bots | **false-positive** | Tiếp tục là đặc tính scraper của test harness (Class #38), không ảnh hưởng người chơi. |
| 6 | Chuyển đổi ngôn ngữ tại Ending Screen mượt mà | i18n-bilingual | Red-05 | **verified-working** | Song ngữ Việt - Anh hiển thị chuẩn chỉ, trọn vẹn cảm xúc hào hùng. |

---

## 4. Tình Trạng Kỹ Thuật & Bot Health

- **20/20 Bot Headless** chạy hoàn tất toàn bộ các chuỗi hành động kiểm thử kết cục, tích lũy 2,680 bước với 0 lỗi hệ thống.
- **10 Cổng Test (4175–4184)** vận hành mượt mà, xử lý đa luồng dữ liệu ổn định và chuẩn xác.
- **Test Suite Toàn Diện**: 128/128 test files pass, 1016/1016 tests pass, thời gian thực thi dưới 13 giây.

---

## 5. Kết Luận & Hướng Tới Vòng 20 Chung Cuộc

Vòng 19 đã hoàn tất việc thẩm định phân nhánh cốt truyện, đạo đức và cơ chế luân hồi chuyển thế — linh hồn sâu sắc nhất của tác phẩm "Phế Căn Ký". Toàn bộ kiến trúc game đã đạt độ chín muồi hoàn hảo để bước vào **Vòng 20: Tổng Duyệt Chung Cuộc & Đóng Băng Chất Lượng Vàng**.
