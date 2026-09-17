# Campaign 2 — Vòng 04: Thẩm Định Tiến Trình Tu Luyện 9 Tầng & Nghịch Thiên Trúc Cơ (B1, C1)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [B1] Tu luyện / đột phá cảnh giới | [C1] Đường cong độ khó 9 tầng Luyện Khí  
**Nhóm Persona tham gia khảo sát:**
- `p02` (Spade - Xianxia Veteran / Min-maxer): Tối ưu hóa từng điểm Linh Khí, kiểm tra công thức tính tiến độ.
- `p08` (Diamond - Cultivation Collector): Thu thập đủ loại đan dược hỗ trợ đột phá.
- `p03` (Spade - System Rebel): Cố tình đột phá khi chưa đủ điều kiện xem game phản ứng ra sao.
- `p18` (Churn Risk - Distracted Parent): Kiểm tra tính năng bế quan ngoại tuyến (Offline Meditation) khi bận rộn.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & Pacing Verification)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **B1: Cảnh giới & Đột phá** | 9 Tầng Luyện Khí (Khí Cảm → Tụ Khí → Thông Kinh → ... → Viên Mãn) → Trúc Cơ Đại Kiếp | `src/engine/rpg-state.ts`, `src/content/refinement.ts` | ✅ Đạt |
| **C1: Đường cong độ khó** | Chi phí Khí tăng đơn điệu theo lũy tiến số học: Tầng 1 (10 Qi) → Tầng 5 (50 Qi) → Tầng 9 (150 Qi). Đột phá Trúc Cơ đòi hỏi 300 Qi + Trúc Cơ Đan hoặc chịu phạt lôi kiếp | `test/cultivation-pacing.test.ts:1-45` | ✅ Đạt |
| **B1: Xử lý ngoại lệ đột phá** | Đột phá thiếu Qi bị chặn với lỗi `NOT_ENOUGH_QI`, đột phá thất bại áp hiệu ứng kinh mạch nghẽn | `src/engine/reducer.ts:TRAIN_GATE` | ✅ Đạt |

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Của Người Chơi Theo Persona

### 🗣️ p02 (Xianxia Veteran / Min-maxer):
> *"Công thức tính tích lũy linh khí theo Thổ Nạp Pháp rất chuẩn: Căn Cốt × Ngộ Tính / 10. Nhưng ở tầng 6 và tầng 7, tôi thấy thời gian bế quan hơi đều đều, thiếu cảm giác 'Bình Cảnh' (Cultivation Bottleneck) — khoảnh khắc mà người tu tiên cảm thấy mình bị mắc kẹt và phải ra ngoài tìm cơ duyên thay vì chỉ ngồi một chỗ hít thở."*
* **Đề xuất tính năng:** Bổ sung cơ chế `Bình Cảnh Cảnh Giới (Bottleneck Event)`: Tại tầng 3, 6, 9, tốc độ tu luyện tại chỗ giảm 70% cho đến khi người chơi hoàn thành 1 việc: Đánh bại 1 yêu thú, uống 1 viên Tụ Khí Đan, hoặc tìm thấy 1 linh địa ngộ đạo.

### 🗣️ p08 (Cultivation Collector):
> *"Hệ thống đan dược hỗ trợ đột phá có Trúc Cơ Đan, Dưỡng Khí Tán, Bổ Huyết Đan. Khi uống đan dược xịn, tỷ lệ đột phá thành công tăng vọt từ 40% lên 90%. Nhưng tôi muốn nhìn thấy hoạt họa hoặc hiệu ứng chữ bay lượn màu vàng kim khi đột phá thành công đại cảnh giới để có cảm giác bõ công cày cuốc."*
* **Đề xuất tính năng:** Hiệu ứng visual `Kim Quang Quán Đỉnh` (Golden Aura Flash) và âm thanh tiếng chuông đại hồng chung khi đột phá từ Luyện Khí lên Trúc Cơ.

### 🗣️ p03 (System Rebel):
> *"Tôi cố tình bấm 'Đột phá' liên tục 5 lần khi thanh Qi mới có 30%. Engine báo lỗi rõ ràng và không cho qua. Sau đó tôi cố tình chịu lôi kiếp mà không dùng bùa: Chết thật! Bảng tử vong hiện lên câu 'Kẻ nóng vội chết dưới thiên uy'. Tôi đánh giá cao sự trung thực này của game, không hề nhân nhượng."*
* **Đề xuất tính năng:** Danh hiệu ẩn `Nghịch Lôi Giả` cho người chơi dám đối đầu lôi kiếp với dưới 50% HP mà vẫn sống sót nhờ kích hoạt thiên phú may mắn.

### 🗣️ p18 (Distracted Parent / Churn Risk):
> *"Tôi phải tắt máy trông con 2 tiếng. Khi mở lại, game có dòng thông báo 'Trong thời gian ngươi vắng mặt, nhân vật đã bế quan thu được 18 Linh Khí'. Tính năng này cứu vãn hoàn toàn trải nghiệm của tôi! Tôi không bị tụt lại phía sau."*
* **Đề xuất tính năng:** Bổ sung `Trà Thảo Dược Hỗ Trợ Bế Quan`: Uống trước khi thoát game để tăng thêm 20% hiệu suất bế quan ngoại tuyến (tối đa 8 tiếng).

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Cơ chế Bình Cảnh Cảnh Giới (Bottleneck Event):** **CHẤP NHẬN (Cực kỳ giá trị)** — Giải quyết triệt để vấn đề "ngồi bấm thiền lặp đi lặp lại", thúc đẩy người chơi khám phá thế giới bên ngoài.
2. **Hiệu ứng visual Kim Quang Quán Đỉnh:** **CHẤP NHẬN** — Tăng cảm giác thỏa mãn của người chơi (Game Feel).
3. **Danh hiệu ẩn Nghịch Lôi Giả:** **CHẤP NHẬN** — Làm giàu thêm hệ thống thành tựu `achievements-data.ts`.
4. **Trà Thảo Dược tăng bế quan ngoại tuyến:** **CHẤP NHẬN (Hợp lệ, chuẩn E3 có trần 8 tiếng)** — Không bán năng lượng vô hạn (tránh bẫy X4), chỉ là vật phẩm game thường mua bằng tiền trong game.
