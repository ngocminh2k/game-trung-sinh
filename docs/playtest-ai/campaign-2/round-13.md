# Campaign 2 — Vòng 13: Hệ Thống Thiên Tượng, Thời Tiết & Đêm Trăng Máu (B11, C7)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [B11] Ảnh hưởng của thời tiết/mùa lên gameplay | [C7] Không khí sống động (Atmosphere & Ambience)  
**Nhóm Persona tham gia khảo sát:**
- `p16` (Heart - Wanderer): Đi lang thang qua các mùa, cảm nhận sự đổi thay.
- `p13` (Heart - Cartographer): Đo tác động thời tiết lên tầm nhìn bản đồ.
- `p19` (Churn Risk - Combat): Muốn thời tiết ảnh hưởng thực sự lên chiến đấu.
- `p11` (Club - Story Reader): Đọc các mô tả văn học về thiên nhiên.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & Weather Verification)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **B11: Hệ thống thời tiết 6 trạng thái** | Trời Quang, Mưa Phùn, Bão Tố, Sương Mù, Nắng Gắt, Đêm Trăng Máu. Parser khai báo tỷ lệ chuyển đổi Markov theo mùa | `src/engine/weather.ts` | ✅ Đạt |
| **B11: Ảnh hưởng gameplay thực chất** | Mưa Phùn: +20% tỷ lệ hái thảo, Sương Mù: giảm tầm nhìn bản đồ còn 2 ô, Nắng Gắt: hao HP khi đi đường trường | `src/engine/weather.ts`, `src/engine/time.ts` | ✅ Đạt |
| **C7: Mô tả không khí (Narrator)** | 14 mẫu câu mô tả thiên nhiên được narrator chèn vào đầu ngày hoặc khi chuyển vùng | `src/engine/narrator.ts` | ✅ Đạt |

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Của Người Chơi Theo Persona

### 🗣️ p16 (Wanderer):
> *"Đêm Trăng Máu (ngày 15 âm lịch) là sự kiện tôi thích nhất! Ánh trăng nhuộm đỏ cả khu rừng, yêu thú xuất hiện tràn lan, tỷ lệ chết tăng vọt nhưng t lệ rơi bảo vật cũng x2. Cảm giác như thế giới này thực sự có nhịp đập của riêng nó."*
* **Đề xuất tính năng:** Thêm `Lịch Âm Số Live (Lunar Calendar Widget)`: Một widget nhỏ hiển thị can chi ngày âm lịch và dự báo ngày đặc biệt sắp tới (Rằm, Sóc, Trăng Máu).

### 🗣️ p13 (Cartographer):
> *"Khi sương mù dày đặc, bản đồ của tôi chỉ hiển thị 2 ô xung quanh. Điều này khiến việc khám phá trở nên thực sự căng thẳng, tôi phải mua 'Đèn Lồng Linh Quang' trong cửa hàng. Cơ chế tuyệt vời — vật phẩm trở nên có giá trị thật sự."*
* **Đề xuất tính năng:** Mở rộng `Hệ vật phẩm thời tiết`: Áo choàng mưa (không bị ướt), Ngọc tránh nắng (không hao HP khi nắng gắt), Bùa xua sương (tăng tầm nhìn).

### 🗣️ p19 (Combat Expectant):
> *"Tôi thấy thời tiết ảnh hưởng đến hái thuốc và đi đường, nhưng khi đánh nhau dường như chẳng liên quan gì. Phải chi trời mưa thì hệ Hỏa yếu đi còn hệ Thủy/Dẫn Lôi mạnh lên, hoặc trăng máu thì quái vật hung hãn hơn."*
* **Đề xuất tính năng:** **Đề xuất thiết kế rất giá trị** — Áp dụng `Bảng Tương Tác Ngũ Hành × Thời Tiết` vào sát thương chiến đấu: Mưa Buff Thủy/Hàn Băng +25%, Đêm Trăng Máu tăng 30% sát thương mọi nguồn cho cả người chơi và yêu thú.

### 🗣️ p11 (Story Reader):
> *"Câu mô tả 'Bóng trăng đỏ như máu nhuộm lên mái ngói Tàng Kinh Các, tiếng dế cũng im bặt như muốn nín thở' đọc rất hay. Văn phong đậm chất kiếm hiệp. Nhưng tôi để ý có vài ngày câu mô tả lặp lại."*
* **Đề xuất tính năng:** Bổ sung biến thể câu mô tả theo 4 mùa × 6 trạng thái thời tiết (hiện tại mới có 14 câu cho 24 tổ hợp) — tăng thêm 40 câu văn học.

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Tương tác Ngũ Hành × Thời Tiết trong chiến đấu:** **CHẤP NHẬN (u tiên Cao nhất vòng này)** — Biến thời tiết từ "ảnh hưởng hái thuốc" thành hệ thống chiến thuật cốt lõi, sửa đúng điểm yếu p19 phát hiện.
2. **Bộ vật phẩm đối ứng thời tiết (Áo mưa, Ngọc tránh nắng,...):** **CHẤP NHẬN** — Tạo ngách kinh tế và chiều sâu chuẩn bị.
3. **Lịch Âm Widget:** **CHẤP NHẬN (QoL)** — Giúp người chơi lập kế hoạch săn bảo vật ngày Trăng Máu.
4. **Mở rộng kho câu mô tả thời tiết:** **CHẤP NHẬN (Nội dung - Ưu tiên Thấp)** — Làm sau, khi đã hoàn thành các hệ thống cơ chế.