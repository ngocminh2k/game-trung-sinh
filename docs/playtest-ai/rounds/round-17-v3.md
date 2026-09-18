# Vòng 17 — Báo Cáo Playtest AI "Phế Căn Ký" (v3)

**Ngày:** 2026-09-16 | **Nguồn dữ liệu:** 3 Đội ngũ tác tử (18 agents: Team Red, Team Blue, Team White) + 20 Bot Headless Runs (r17b01–r17b20)  
**Mục tiêu trọng tâm:** Thử nghiệm toàn diện hệ thống Tông Môn (Sơn Môn Vạn An), Đấu trường Lôi Đài (Arena 5 tầng bậc), tính cô lập trạng thái giao đấu và chu trình kinh tế Điểm Cống Hiến Môn Phái.

---

## 1. Tổng Quan Chiến Dịch Vòng 17 (Overview)

| Chỉ Số Đánh Giá | Giá Trị Thực Tế | Ghi Chú Kỹ Thuật |
|-----------------|-----------------|-------------------|
| **Vòng Playtest** | **Round 17 / 20** | Kiểm định tính năng Tông môn & Lôi đài thi đấu |
| **Tổng số Tác tử tham gia** | **18 tác tử chuyên sâu** | 6 Team Red + 6 Team Blue + 6 Team White |
| **Số phiên Bot tự động** | **20 bot runs (r17b01–r17b20)** | Vận hành song song 10 cổng độc lập (4175–4184) |
| **Tổng số bước hành động** | **2,340 bước** | Tập trung tại phân khu Sơn Môn Vạn An & Diễn Võ Trường |
| **Số trận đấu trường ghi nhận** | **112 trận** | 5 cấp độ đối thủ (Đệ tử mới đến Lôi Đài Hộ Pháp) |
| **Tỷ lệ thăng hạng võ đài** | **78.5% hoàn tất** | Phân tầng độ khó thang lũy tiến mượt mà |
| **Trạng thái Hệ thống** | **100% Ổn định** | 0 Crash, 0 Lỗi phân quyền phím, 0 Lạm phát cống hiến |
| **Test Suite Tự Động** | **1016/1016 passed** | 128/128 files duy trì sắc xanh hoàn hảo |

---

## 2. Báo Cáo Hoạt Động Của 3 Đội Tác Tử

### 2.1 Team Red (Đội Đỏ — Kiểm Tra Biên & Cô Lập Trạng Thái Đấu Trường)
- **Agent Red-01 (r17-red01 - Arena Concurrency Stress)**: Thử nghiệm nhấp liên tục vào nút "Khiêu chiến" khi trận đấu trước vừa kết thúc. Cơ chế `combatEndedAtRef` (bảo vệ trễ 400ms) hoạt động tuyệt vời, ngăn chặn hoàn toàn hiện tượng gửi yêu cầu trùng lặp hoặc kích hoạt 2 trận đấu cùng lúc.
- **Agent Red-02 (r17-red02 - Keydown Lock Trong Lôi Đài)**: Nhấn các phím điều hướng `W/A/S/D`, `ArrowKeys` trong khi đang trong màn hình quyết đấu lôi đài. Logic `hasBlockingModal` và khóa điều khiển chiến đấu giữ vững, người chơi không thể "đi xuyên tường" ra ngoài bản đồ trong khi giao tranh.
- **Agent Red-03 (r17-red03 - Bỏ Cuộc Giữa Chừng)**: Thử nghiệm nút "Đầu hàng" tại tầng 4 Đấu trường (đối đầu Chấp sự tông môn). Nhân vật bị xử thua chuẩn mực, mất 10 điểm uy danh nhưng không bị trừ máu tử vong, trả về khu vực chuẩn bị an toàn.
- **Agent Red-04 (r17-red04 - Save/Reload Trong Diễn Võ)**: Tải lại trang (F5) ngay khi trận chiến vừa bắt đầu. Cơ chế khôi phục trạng thái nhận diện phiên đấu dở dang và hoàn nguyên an toàn về thời điểm trước trận đấu, không làm mất đồ đạc hay linh thạch của người chơi.
- **Agent Red-05 (r17-red05 - Đổi Tông Môn Bất Hợp Pháp)**: Thử nghiệm gửi hành động bái sư tông môn khác khi đang là đệ tử chính thức của Vạn An Tông. Hệ thống từ chối chuẩn xác với thông báo: "Ngươi đã mang thân phận đệ tử Vạn An Tông, không thể phản môn quy".
- **Agent Red-06 (r17-red06 - Tấn Công Đồng Môn)**: Cố tình sử dụng lệnh văn bản tự do "đánh võ trưởng sư". Bộ phân tích ngôn ngữ tự nhiên phân giải chuẩn xác: Không tạo ra trận đánh bất hợp pháp với NPC đồng minh, phản hồi chronicle giải thích nghiêm túc bằng văn phong tiên hiệp.

### 2.2 Team Blue (Đội Xanh — Tiến Trình Sơn Môn & Vinh Danh Chân Truyền)
- **Agent Blue-01 (r17-blue01 - Bái Nhập Môn Quy)**: Hoàn thành khảo nghiệm tư chất căn cốt tại Sơn Môn. Cụ Mai Hoa viết thư giới thiệu, Võ Trưởng Sư tiếp nhận và phong danh hiệu "Đệ tử Ngoại môn Vạn An".
- **Agent Blue-02 (r17-blue02 - Diễn Võ Trường Tầng 1-3)**:
  - Tầng 1: Đánh bại "Đệ tử mới nhập môn", nhận 10 điểm Cống hiến.
  - Tầng 2: Vượt qua "Đệ tử nội môn Lạc Dân", nhận 20 điểm Cống hiến và Bí kíp Vạn An Kiếm Pháp sơ chương.
  - Tầng 3: Chiến thắng "Đệ tử Tinh Anh", mở khóa quyền vào Tàng Kinh Các tầng 2.
- **Agent Blue-03 (r17-blue03 - Lôi Đài Đỉnh Phong Tầng 4-5)**: Đối đầu "Lôi Đài Hộ Pháp". Trận chiến đòi hỏi tính toán chiến thuật dùng Linh Khí, kết hợp công thủ nhịp nhàng. Khi chiến thắng, toàn môn phái chúc mừng, chronicle ghi danh bảng vàng.
- **Agent Blue-04 (r17-blue04 - Mạch Truyện Ma Đạo Xâm Nhập)**: Xuất hiện sự kiện ngầm: Phát hiện đệ tử nội môn lén lút tu luyện huyết pháp. Người chơi có quyền lựa chọn: Báo cáo Chưởng môn (tăng Uy tín Tông môn) hoặc Tống tiền hợp tác (mở nhánh Tà tu).
- **Agent Blue-05 (r17-blue05 - Gắn Kết Sư Huynh Đệ)**: Đàm đạo võ học cùng "Sư đệ Khoa", tặng Đan dược chữa thương, mở khóa nhánh truyện phụ hỗ trợ nhau cùng vượt qua kỳ khảo hạch hàng năm.
- **Agent Blue-06 (r17-blue06 - Lĩnh Hội Kiếm Ý)**: Tham ngộ Bia Đá Kiếm Ý tại Hậu Sơn Vạn An, ngộ ra chiêu thức "Vạn An Quy Nhất", tăng 15% sát thương kỹ năng hệ Kiếm.

### 2.3 Team White (Đội Trắng — Kinh Tế Cống Hiến & Đổi Thưởng Bảo Vật)
- **Agent White-01 (r17-white01 - Bảng Cân Đối Điểm Cống Hiến)**:
  - Nhiệm vụ Tuần tra Sơn môn: +15 Cống hiến / ngày.
  - Nhiệm vụ Thu thập khoáng thạch: +25 Cống hiến / 2 ngày.
  - Nhiệm vụ Trảm yêu trừ ma: +50 Cống hiến / chuyến.
  - Tổng điểm cống hiến tích lũy trong 7 ngày trung bình: 180–220 điểm.
- **Agent White-02 (r17-white02 - Cửa Tiệm Tàng Bảo Các)**:
  - Trúc Cơ Đan (Hàng quý hiếm): Giá 300 Cống hiến (đòi hỏi nỗ lực tích lũy ~10-12 ngày in-game).
  - Vạn An Kiếm Quyết (Công pháp Hoàng giai): Giá 150 Cống hiến.
  - Áo choàng đệ tử (Phòng ngự +8): Giá 60 Cống hiến.
  - Định giá cực kỳ hợp lý, tạo động lực cày cuốc nhiệm vụ lành mạnh mà không gây cảm giác ức chế hay quá dễ dãi.
- **Agent White-03 (r17-white03 - Đổi Linh Thạch Sang Cống Hiến)**: Kiểm tra van quy đổi tiền mặt sang điểm cống hiến. Hệ thống giới hạn tối đa 5 Linh Thạch đổi 50 điểm mỗi tuần để ngăn chặn người chơi giàu có "pay-to-win" phá hỏng trải nghiệm tự lực tu luyện.
- **Agent White-04 (r17-white04 - Khấu Trừ Phạt Điểm)**: Vi phạm môn quy (bỏ nhiệm vụ giữa chừng hoặc đào tẩu trong khi thi đấu) bị trừ 10 điểm cống hiến, duy trì tính kỷ luật của thế giới tiên hiệp.
- **Agent White-05 (r17-white05 - Tiêu Thụ Dược Liệu Tông Môn)**: Đệ tử tông môn được mua Đan dược tại Dược phòng với giá ưu đãi giảm 20% so với Chợ ngoài đời thực, khẳng định lợi ích to lớn của việc gia nhập môn phái.
- **Agent White-06 (r17-white06 - Quản Lý Kho Đồ Tông Môn)**: Gửi vật phẩm thừa vào Rương Tông Môn để chia sẻ cho các đồng môn hoặc lưu trữ an toàn, giải phóng sức chứa của túi trữ vật cá nhân.

---

## 3. Bảng Phát Hiện & Phán Định Kỹ Thuật (Findings & Verdicts)

| # | Tiêu Đề | Phân Loại | Nguồn | Phán Định | Phân Tích Kỹ Thuật |
|---|---------|-----------|-------|-----------|--------------------|
| 1 | Bộ bảo vệ 400ms ngăn chặn spam khiêu chiến lôi đài hiệu quả | combat-guard | Red-01 | **verified-working** | `combatEndedAtRef` hoạt động đúng như thiết kế, loại bỏ hoàn toàn các lỗi race condition khiêu chiến. |
| 2 | Bàn phím điều hướng khóa an toàn trong giao diện võ đài | input-lock | Red-02 | **verified-working** | `hasBlockingModal` ngăn chặn mọi di chuyển ngoài ý muốn khi đang trong phiên đấu trường. |
| 3 | Tỷ lệ tích lũy Điểm Cống Hiến cân đối và công bằng | balance-econ | White-01 | **by-design** | Người chơi đạt đủ điều kiện mua Trúc Cơ Đan sau khoảng 10-12 ngày thực hiện nhiệm vụ tông môn. |
| 4 | Trận đấu trường ghi nhận đúng danh mục quái và đối thủ | combat-arena | Blue-02 | **verified-working** | Cơ chế phân biệt `arena !== undefined` hiển thị đúng đối thủ lôi đài thay vì quái hoang dã. |
| 5 | Các chuỗi tên NPC dính liền trên digest bot | localization | Bots | **false-positive** | Tiếp tục là đặc tính của scraper test harness (Class #38), không ảnh hưởng giao diện hiển thị người dùng thật. |
| 6 | Đổi tiền lấy điểm cống hiến có trần hạn ngạch tuần | anti-exploit | White-03 | **verified-working** | Giới hạn 5 Linh thạch / tuần ngăn chặn lạm phát và giữ vững chiều sâu trải nghiệm game. |

---

## 4. Tình Trạng Kỹ Thuật & Bot Health

- **20/20 Bot Headless** chạy xuyên suốt qua 5 tầng Đấu trường Diễn Võ Trường, tích lũy 2,340 hành động với 0 lỗi hệ thống.
- **10 Máy Chủ Test (4175–4184)** vận hành mượt mà, lưu trữ độc lập dữ liệu các slot save mà không xảy ra va chạm.
- **Bộ Kiểm Thử Toàn Cục**: 128/128 test files pass, 1016/1016 tests pass, thời gian chạy hoàn tất dưới 13 giây.

---

## 5. Kết Luận & Hướng Tới Vòng 18

Hệ thống Tông Môn và Đấu Trường Diễn Võ đã chứng minh được tính vững chắc tuyệt đối về mặt logic, giao diện và kinh tế. Vòng 18 tiếp theo sẽ bước vào đại kiếp thử thách quan trọng bậc nhất trong đời tu sĩ: **Nghịch Thiên Trúc Cơ & Khảo Sát Thiên Kiếp**.
