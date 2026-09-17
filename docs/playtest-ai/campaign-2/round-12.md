# Campaign 2 — Vòng 12: 35 Thành Tựu, Phòng Trưng Bày & Ngoại Trang Thẩm Mỹ (B8, C4, E4)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [B8] 35 Thành tựu & Bảng vinh danh | [C4] Sưu tầm & Phòng trưng bày | [E4] Ngoại trang không Pay-to-Win  
**Nhóm Persona tham gia khảo sát:**
- `p05` (Diamond - Completionist): Săn lùng thành tựu ẩn và tỷ lệ % hoàn thành.
- `p08` (Diamond - Cultivation Collector): Khảo sát Phòng Trưng Bày bảo vật.
- `p02` (Spade - Min-maxer): Kiểm tra thành tựu có cộng chỉ số ẩn hay không.
- `p10` (Club - Casual Mobile): Đánh giá tính thẩm mỹ của ngoại trang.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & Achievement Verification)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **B8: Danh mục 35 Thành Tựu** | 35/35 thành tựu định nghĩa trong `achievements-data.ts`: Phân loại Chiến Đấu (10), Tu Vi (8), Khám Phá (7), Nhân Duyên (5), Kỳ Ngộ/Ẩn (5) | `src/content/achievements-data.ts` | ✅ Đạt |
| **B8: Runtime kích hoạt** | Hàm `checkAchievements()` trong `achievements.ts` bắt sự kiện thời gian thực, lưu vào `globalProfile` | `src/engine/achievements.ts`, `src/engine/globalProfile.ts` | ✅ Đạt |
| **E4: Ngoại trang & Thẩm mỹ** | Mô hình dữ liệu trang phục (`outfits.ts`): Chỉ thay đổi avatar/visual tag, 0 chỉ số sức mạnh | `src/content/outfits.ts` | ✅ Đạt (chuẩn E4) |

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Của Người Chơi Theo Persona

### 🗣️ p05 (Completionist):
> *"Tôi đã mở khóa được 28/35 thành tựu! Rất thích các thành tựu quái đản như 'Chết vì thử độc đan' hay 'Bị lừa 100 Bạc ở chợ đen'. Nhưng 7 thành tựu ẩn còn lại hiện dấu '???' hoàn toàn không có gợi ý nào, khiến tôi phải mò kim đáy biển."*
* **Đề xuất tính năng:** Thêm cơ chế `Gợi Ý Thành Tựu Ẩn (Cryptic Hints)`: Khi người chơi đạt một nửa tiến trình (VD: đã gặp NPC liên quan), đổi dấu '???' thành một câu thơ hoặc manh mối mơ hồ thay vì giấu tiệt.

### 🗣️ p08 (Cultivation Collector):
> *"Tôi muốn có một căn phòng riêng — 'Tàng Bảo Các Động Phủ' — nơi tôi có thể đặt các thanh kiếm cổ, đỉnh lô luyện đan thượng phẩm và các danh hiệu đã đạt được lên kệ để ngắm nghía sau mỗi kiếp luân hồi."*
* **Đề xuất tính năng:** Xây dựng `Tàng Bảo Các Động Phủ (Trophy Room / Showcase)`: Một tab trực quan trong Động Phủ để người chơi trưng bày các cổ vật thu thập được qua nhiều kiếp.

### 🗣️ p02 (Min-maxer):
> *"Tôi đã kiểm tra mã nguồn và xác nhận các bộ Ngoại Trang (Thanh Phong Y, Huyết Sa Bào) hoàn toàn KHÔNG cộng bất kỳ chỉ số công kích hay phòng thủ nào. Rất tốt! Điều này giữ vững tính thi đấu công bằng và không biến game thành sàn diễn Pay-to-Win."*
* **Đề xuất tính năng:** Cho phép Ngoại Trang có `Hiệu Ứng Danh Hiệu Động (Animated Titles)` trên bảng thành tích (VD: danh hiệu lấp lánh chữ Thủy Mặc), thuần túy phục vụ flex danh dự.

### 🗣️ p10 (Casual Mobile):
> *"Tôi thích bộ áo 'Trúc Lâm Ẩn Sĩ' màu xanh ngọc bích. Nhìn nhân vật của mình thanh thoát hẳn khi đi dạo trong rừng. Giá mà có chế độ chụp ảnh kỷ niệm không có giao diện vướng víu."*
* **Đề xuất tính năng:** Thêm nút `Ẩn Giao Diện / Chụp Ảnh (Photo Mode)`: Ẩn thanh máu, nút bấm và HUD để người chơi chụp ảnh màn hình nhân vật lưu làm kỷ niệm.

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Gợi ý thành tựu ẩn bằng câu thơ:** **CHẤP NHẬN (Tăng hứng thú khám phá)** — Vừa giữ tính bí ẩn, vừa giảm ức chế cho Achievers.
2. **Tàng Bảo Các Động Phủ (Showcase):** **CHẤP NHẬN (Ưu tiên Cao cho tính năng Retain)** — Tạo động lực sưu tầm cực lớn qua các kiếp.
3. **Hiệu ứng danh hiệu động:** **CHẤP NHẬN (Chuẩn E4)** — Tạo giá trị thương mại hóa thẩm mỹ cao cấp.
4. **Nút Ẩn Giao Diện (Photo Mode):** **CHẤP NHẬN (QoL cực dễ làm)** — Tăng khả năng viral truyền thông mạng xã hội.
