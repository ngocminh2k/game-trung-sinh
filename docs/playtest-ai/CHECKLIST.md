# CHECKLIST KIỂM THỬ TOÀN DIỆN — "Phế Căn Ký"

> Người chơi **không chỉ trải nghiệm giao diện**. Checklist này là phạm vi kiểm thử đầy đủ cho
> Chiến dịch Vòng 2, gồm 4 tầng: **Cốt truyện → Tính năng → Trải nghiệm → Kích nạp**.
> Mỗi mục có ID ổn định để workflow tham chiếu.
>
> **Quy tắc bằng chứng (bắt buộc):** mỗi phán định phải kèm `file:line` đọc được thật.
> Không bịa số liệu, không ước lượng hiệu năng, không mô tả hành vi chưa tự kiểm chứng.
> Không đọc được → ghi `unverified`.

---

## A. CỐT TRUYỆN (Narrative)

| ID | Hạng mục | Kỳ vọng | Trạng thái gốc |
|---|---|---|---|
| A1 | 6 chương chính tuyến | `src/content/chapters.ts` đủ 6 chương, có tên VI/EN + tagline | Có |
| A2 | Cốt truyện phân nhánh theo **hành vi ghi nhớ**, không theo toạ độ | Scene mở khoá bằng `requires` trên cờ hành vi | Có (`story.ts:3`) |
| A3 | Scene chain có `effects` + `playerDelta` + `nextSceneId` | Mọi scene có ≥2 lựa chọn, delta hợp lệ | Có |
| A4 | 3 tuyến đạo đức xuyên suốt (mercy / wealth / truth) | `story_route` được set và được đọc lại ở Hồi sau | Có |
| A5 | NPC có arc riêng: Mai Hoa, Bảo, Ngô, Hà, Võ, Khoa | Mỗi NPC có callback chéo qua ≥2 scene | Có |
| A6 | 6 đại kết cục | `endings-data.ts` đủ 6, có điều kiện kích hoạt | Có |
| A7 | Độ phủ Hồi III–V so với thiết kế | Mạch truyện đi hết đến `mirror_choice` và sau đó | **Chưa rõ** — cần đếm scene thật |
| A8 | **Đồ thị truyện không có nhánh cụt** | Mọi `nextSceneId` trỏ tới scene tồn tại; mọi scene tới được từ entry | **Chưa audit** |
| A9 | Hậu kết cục riêng cho từng nhánh | `endingEpilogue.ts` phủ đủ 6 ending | **Chưa audit** |

## B. TÍNH NĂNG (Systems)

| ID | Hạng mục | Kỳ vọng | Trạng thái gốc |
|---|---|---|---|
| B1 | Tu luyện / đột phá cảnh giới | 9 tầng Luyện Khí → Trúc Cơ, có điều kiện + hệ quả | Có |
| B2 | Chiến đấu lượt + kỹ năng + pháp bảo | Có công thức sát thương, tiêu hao khí, trạng thái | Có |
| B3 | Luyện đan | `alchemy.ts` có công thức + tỉ lệ + nguyên liệu | Có |
| B4 | Yêu thú / boss theo vùng | `beasts.ts` phân tầng theo địa danh | Có |
| B5 | Hảo cảm NPC + lãng mạn | `romance.ts` + `npc-gifts.ts` có ngưỡng rõ | Có |
| B6 | Kinh tế 4 tầng tiền tệ + cửa hàng | Đồng/Bạc/Vàng/Linh Thạch, tỷ giá, `shops.ts` | Có |
| B7 | Nhiệm vụ chính + phụ | `quests.ts` có step, cờ done, phần thưởng | Có |
| B8 | Thành tựu | `achievements-data.ts` + runtime cấp phát | Có |
| B9 | New Game Plus / Di sản luân hồi | `globalProfile.ts` giữ qua `newGame()` | Có |
| B10 | 10 Hệ Thống Tu Tiên khởi đầu | `system-defs.ts` đủ 10, khác biệt thật | Có |
| B11 | Thời tiết / mùa ảnh hưởng gameplay | `weather.ts` **có được reducer gọi không** | **Chưa verify** |
| B12 | Xổ số | `lottery.ts` EV, tần suất, có báo kết quả | Có |
| B13 | **Tính năng chết** — file/module không được import ở đâu | Liệt kê chính xác, không đoán | **Chưa audit** |

## C. TRẢI NGHIỆM (Experience & Balance)

| ID | Hạng mục | Kỳ vọng | Trạng thái gốc |
|---|---|---|---|
| C1 | Đường cong độ khó 9 tầng Luyện Khí | Chi phí tăng đơn điệu, không có bậc thang dựng đứng | Có test, 4 case |
| C2 | Cân bằng chiến đấu — không build lấn át | So sánh DPS/HP các nhánh kỹ năng | **Chưa có test** |
| C3 | Cân bằng kinh tế — ROI từng nghề | Thu nhập/chi phí mỗi vòng lặp nghề | Chỉ đo hái thảo |
| C4 | Độ chơi lại (10 hệ thống × 6 kết cục) | Ít nhất 10 lối chơi khác biệt thật | **Chưa đo** |
| C5 | Onboarding không cần đọc hướng dẫn | Người mới hiểu trong 3 phút đầu | Đã cải thiện |
| C6 | Mọi hành động đều có phản hồi (không "im lặng") | Không có no-op không thông báo | Sửa một phần |
| C7 | Công bằng đầu game (không chết oan không báo trước) | Telegraph trước mọi nguồn sát thương lớn | Đã sửa, chưa test lại |

## D. KÍCH NẠP (Monetization — hạ tầng)

| ID | Hạng mục | Trạng thái gốc |
|---|---|---|
| D1 | Cổng thanh toán / IAP | **Không có** |
| D2 | Gói khởi đầu / vật phẩm trả tiền | **Không có** |
| D3 | Tiền tệ premium tách khỏi Linh Thạch | **Không có** |
| D4 | Vật phẩm giới hạn theo mùa | **Không có** |
| D6 | Bảng tỷ lệ rơi minh bạch (nếu có lootbox) | **Không có** (vì chưa có lootbox) |

## E. THỦ THUẬT KÍCH NẠP

### E-PLUS — Được phép thiết kế (hợp lệ)

| ID | Hạng mục | Ràng buộc |
|---|---|---|
| E1 | Gói khởi đầu giá trị rõ ràng | Hiển thị đúng số, không "tiết kiệm 90%" ảo |
| E2 | Battle pass có nhánh miễn phí song song | Không khoá nội dung cốt truyện sau tường phí |
| E3 | Vật phẩm tăng tốc **có trần** | Trần bắt buộc; không bán sức mạnh vô hạn |
| E4 | Ưu đãi chào mừng một lần | Hết hạn thật = hết hạn thật |
| E5 | Công khai tỷ lệ nếu có cơ chế ngẫu nhiên trả tiền | Yêu cầu pháp lý nhiều thị trường |

### E-MINUS — Bị từ chối (dark pattern)

| ID | Thủ thuật | Lý do từ chối |
|---|---|---|
| X1 | Đồng hồ đếm ngược giả (reset mỗi lần tải lại) | Lừa người chơi |
| X2 | Near-miss giả ("sắp trúng rồi!") trong vòng quay | Thao túng tâm lý |
| X3 | Giấu tỷ lệ lootbox | Vi phạm pháp luật nhiều thị trường |
| X4 | Cạn kiệt năng lượng rồi bán thuốc hồi | Chặn tiến trình để moi tiền |
| X5 | Bán "gỡ quảng cáo" do mình cố tình nhồi | Tạo vấn đề để bán giải pháp |
| X6 | Gacha ghép mảnh trùng lặp vô hạn | Cờ bạc trá hình |
| X7 | Khoá kết cục tốt sau tường phí | Bán chính cốt truyện đã hứa |

> Mọi đề xuất tính năng của persona rơi vào X1–X7 **phải bị triage từ chối**, ghi rõ lý do.

---

## Thứ tự ưu tiên thi hành

1. **B13** — quét tính năng chết (rẻ, tìm ngay thứ đã viết mà không ai chạm)
2. **A8** — test mọi `nextSceneId` trỏ tới scene tồn tại
3. **C2** — test cân bằng combat
4. **D/E** — chỉ làm khi có xác nhận hướng; dừng ở ranh giới E-MINUS
