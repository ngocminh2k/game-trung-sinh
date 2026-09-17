# Campaign 2 — Vòng 17: Di Sản Luân Hồi, Gia Tộc & New Game Plus (B9, C4)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [B9] Di sản luân hồi & Kế thừa kiếp sau | [C4] Sức hút chơi lại nhiều kiếp  
**Nhóm Persona tham gia khảo sát:**
- `p08` (Diamond - Cultivation Collector): Khảo sát cửa hàng thiên phú kiếp sau.
- `p02` (Spade - Min-maxer): Thử nghiệm build luân hồi cộng dồn.
- `p06` (Diamond - Economy Optimizer): Kiểm tra tỷ lệ lạm phát điểm luân hồi.
- `p12` (Club - Village Mayor): Đề xuất yếu tố gia tộc và gia phả.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & Reincarnation Verification)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **B9: Cơ chế kế thừa** | Điểm Luân Hồi (Reincarnation Karma) tích lũy trong `globalProfile`, dùng để mở khóa 12 Thiên Phú Vĩnh Viễn | `src/engine/globalProfile.ts`, `src/content/rpg.ts` | ✅ Đạt |
| **B9: Cửa hàng Thiên Phú** | Bảng giá từ 50 đến 250 điểm; có cơ chế khóa/mở khóa phụ thuộc vào thành tựu đã đạt | `src/engine/globalProfile.ts` | ✅ Đạt |
| **C4: Tỷ lệ lạm phát điểm** | Một kiếp sống trọn vẹn (30 ngày, 3 nhiệm vụ lớn) thưởng ~120 điểm; người chơi cần 5–7 kiếp để mở toàn bộ thiên phú | Mô hình toán học kiểm chứng | ✅ Đạt (cân bằng) |

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Của Người Chơi Theo Persona

### 🗣️ p12 (Village Mayor):
> *"Sau khi chết ở kiếp 1, tôi thấy mình bắt đầu lại kiếp 2 như một người hoàn toàn xa lạ. Nhưng nếu nhân vật kiếp 2 của tôi là hậu duệ hoặc đệ tử của kiếp 1 thì sao? Nhìn vào một 'Gia Phả Tu Tiên' nối dài qua nhiều đời sẽ đem lại cảm giác tự hào vô cùng."*
* **Đề xuất tính năng:** Xây dựng `Gia Phả Tu Tiên (Family Tree / Lineage Book)`: Mỗi lần kết thúc ván, nhân vật cũ được khắc vào Gia Phả với chân dung, cảnh giới đạt được và câu nói tâm đắc. Nhân vật mới có thể chọn kế thừa họ của kiếp trước.

### 🗣️ p08 (Cultivation Collector):
> *"Tôi có một thanh 'Thanh Vân Kiếm' rèn mất 15 ngày ở kiếp 1. Khi chết đi, kiếm bị mất trắng khiến tôi hơi tiếc. Nếu cho phép người chơi chôn một món đồ vào 'Mộ Kiếp Trước' để kiếp sau đào lên thì quá đỉnh!"*
* **Đề xuất tính năng:** Cơ chế `Chôn Giấu Di Vật (Buried Relic)`: Trước khi chết hoặc đạt kết cục, người chơi được chọn 1 món trang bị chôn ở một tọa độ bí mật. Kiếp sau có thể đến đúng tọa độ đó để đào lại.

### 🗣️ p02 (Min-maxer):
> *"Tôi mua 3 thiên phú: 'Căn Cốt Dị Thường' (+10 Lực), 'Ngộ Tính Thông Tuệ' (+15% EXP), và 'Đan Tâm Hướng Đạo' (+20% tỷ lệ luyện đan thành công). Kết hợp lại tạo ra tốc độ cày cấp nhanh gấp đôi kiếp 1. Đây là cảm giác thỏa mãn đích thực của dòng game Roguelite."*
* **Đánh giá:** Vòng lặp Core Loop của New Game Plus hoạt động rất tốt, tạo cảm giác mạnh mẽ rõ rệt ở những lần chơi sau.

### 🗣️ p06 (Economy Optimizer):
> *"Tốc độ nhận điểm luân hồi hiện tại rất mượt: 10 điểm cho việc sống sót cơ bản, 30 điểm khi đột phá Luyện Khí tầng 3, 50 điểm khi hoàn thành đại sự kiện. Không có cảm giác bị 'lạm phát' hoặc 'cháy điểm'."*
* **Đề xuất tính năng:** Thêm tùy chọn `Reset Điểm Thiên Phú (Respec Karma)` miễn phí 1 lần mỗi 3 kiếp để người chơi đổi build thử nghiệm.

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Gia Phả Tu Tiên (Lineage Book):** **CHẤP NHẬN (Ưu tiên Cao)** — Biến các kiếp chơi rời rạc thành một pho sử thi gia tộc trường tồn.
2. **Chôn Giấu Di Vật (Buried Relic):** **CHẤP NHẬN (Cơ chế tuyệt vời)** — Tạo động lực thám hiểm cực mạnh cho kiếp sau, gắn kết chặt chẽ với bản đồ thế giới.
3. **Reset Điểm Thiên Phú (Respec):** **CHẤP NHẬN (QoL)** — Thân thiện với người chơi muốn thử nghiệm lối build mới.
