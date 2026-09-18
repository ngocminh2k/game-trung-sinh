# Campaign 2 — Vòng 18: Thực Nghiệm Khung Kích Nạp Minh Bạch (E1–E4)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [E1] Gói Khởi Đầu Tân Thủ | [E2] Thẻ Tháng Tu Tiên | [E3] Quỹ Trưởng Thành | [E4] Không Pay-to-Win  
**Nhóm Persona tham gia khảo sát:**
- `p06` (Diamond - Economy Optimizer): Thẩm định tỷ giá và giá trị thực.
- `p10` (Club - Casual Mobile): Đánh giá giao diện mua hàng và trải nghiệm bấm.
- `p18` (Churn Risk - Distracted Parent): Kiểm tra xem có áp lực FOMO không.
- `p20` (Churn Risk - Tired Worker): Đánh giá cảm xúc khi nhìn thấy Cửa Hàng.

---

## 1. Bản Mẫu Thử Nghiệm Thiết Kế (Monetization Wireframe Audit)

Nhóm phát triển đưa ra bản mẫu thiết kế 3 gói hỗ trợ theo chuẩn đạo đức E-PLUS đã thông qua ở Vòng 10:

```
+-------------------------------------------------------------------------+
|                       TÀNG BẢO CÁC TRI ÂN (TIỆM TRỢ DUYÊN)               |
|  * Toàn bộ nội dung cốt truyện đều có thể hoàn thành MIỄN PHÍ 100% *     |
+-------------------------------------------------------------------------+
| [ GÓI TÂN THỦ NHẬP ĐẠO ]    | [ THẺ THÁNG TU TIÊN ]     | [ QUỸ TRƯỞNG THÀNH ]  |
| Giá: 20.000 VND (mua 1 lần) | Giá: 49.000 VND / 30 ngày | Giá: 99.000 VND       |
|                             |                           | (mua 1 lần duy nhất)  |
| Nhận ngay:                  | Nhận mỗi ngày đăng nhập:  | Nhận khi đạt mốc:     |
| - 1 Áo Trúc Danh Sĩ (Visual)| - 5 Hạ Phẩm Linh Thạch    | - Luyện Khí T1: 10 LT |
| - 1 Thanh Trúc Kiếm (Visual)| - 1 Lần Đột Phá An Toàn   | - Luyện Khí T3: 30 LT |
| - 10 Bánh Bao Lương Khô     |                           | - Luyện Khí T6: 60 LT |
| - 1 Bức Thư Tri Ân Tác Giả  | (Bỏ lỡ không bị mất,      | - Trúc Cơ: 150 LT     |
|                             |  được cộng dồn nhận bù)   |                       |
+-----------------------------+---------------------------+-----------------------+
```

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Của Người Chơi Theo Persona

### 🗣️ p06 (Economy Optimizer):
> *"Gói Thẻ Tháng giá 49.000 VND cho 150 Linh Thạch chia đều trong 30 ngày có tỷ giá quy đổi rất hợp lý (tương đương 10 Bạc/ngày). Điểm tuyệt vời nhất là cơ chế 'Cộng dồn nhận bù nếu quên đăng nhập' — điều này loại bỏ hoàn toàn sự ức chế và cảm giác bị game 'bắt làm con tin' mỗi ngày."*
* **Đánh giá cao:** Cơ chế không phạt người chơi vắng mặt là bước đột phá về mặt đạo đức game.

### 🗣️ p18 (Distracted Parent):
> *"Tôi là người hay quên đăng nhập vì bận chăm con. Việc Thẻ Tháng cho phép tôi dồn quà 3 ngày nhận 1 lần khiến tôi cảm thấy được tôn trọng. Tôi sẵn sàng chi 49k ủng hộ đội ngũ phát triển ngay khi tính năng này ra mắt."*
* **Ghi nhận:** Tôn trọng quỹ thời gian của người chơi giúp chuyển hóa Churn Risk thành người chơi trung thành (Retained User).

### 🗣️ p20 (Tired Worker):
> *"Tôi mở Cửa Hàng lên và thấy dòng chữ đầu tiên: 'Toàn bộ nội dung cốt truyện đều có thể hoàn thành MIỄN PHÍ 100%'. Cảm giác nhẹ nhõm vô cùng! Không có đồng hồ đếm ngược 5 phút, không có nút nhấp nháy đỏ ép nạp, không có mác 'GIẢM GIÁ 99%'. Giao diện như một quán trà thanh tịnh."*
* **Ghi nhận:** Bầu không khí thư thái giữ chân người chơi mệt mỏi hiệu quả hơn bất kỳ chiêu trò FOMO nào.

### 🗣️ p10 (Casual Mobile):
> *"Gói Tân Thủ 20k rất dễ thương. Thanh Trúc Kiếm và Áo Trúc Danh Sĩ nhìn rất hợp với phong cảnh Làng Thanh Mộc. Mức giá 20k bằng đúng 1 cốc trà đá, rất dễ để ủng hộ."*
* **Đề xuất tính năng:** Cung cấp phương thức thanh toán linh hoạt (Momo, QR Code Ngân Hàng, Apple/Google Pay) và hiển thị ngay hóa đơn điện tử minh bạch.

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Cơ chế Thẻ Tháng cộng dồn nhận bù (No-FOMO Monthly Pass):** **CHẤP NHẬN (Chuẩn mực đạo đức mẫu)** — Giữ vững làm tiêu chuẩn cốt lõi cho mọi gói thời gian.
2. **Cam kết 100% Free hiển thị tại đầu Cửa Hàng:** **CHẤP NHẬN (Xây dựng uy tín thương hiệu)** — Giúp xóa tan định kiến game "hút máu".
3. **Gói Tân Thủ thuần visual + lương khô nhỏ:** **CHẤP NHẬN** — Tạo trải nghiệm giao dịch đầu tiên thoải mái, vui vẻ.
