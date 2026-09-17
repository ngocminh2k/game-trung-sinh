# Campaign 2 — Vòng 09: Thẩm Định 10 Hệ Thống Tu Tiên & Nhịp Bế Quan Ngoại Tuyến (B10, B11)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [B10] 10 Hệ Thống Tu Tiên khởi đầu | [B11] Thời tiết/mùa ảnh hưởng gameplay  
**Nhóm Persona tham gia khảo sát:**
- `p15` (Heart - Skeptic): Test toàn bộ 10 hệ thống, tìm cái nào vô dụng.
- `p16` (Heart - Wanderer): Khảo sát ảnh hưởng thời tiết lên bản đồ.
- `p03` (Spade - System Rebel): Đọc tin nhắn hệ thống, tìm cách chống lại.
- `p09` (Club - Roleplayer): Trải nghiệm hệ thống can thiệp vào nhập vai thế nào.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & System Verification)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **B10: 10 Hệ Thống** | 10/10 khai báo trong `system-defs.ts` (225 dòng), mỗi hệ thống có: tên VI/EN, mô tả, quy tắc nội tại, tin nhắn riêng | `src/content/system-defs.ts`, `src/content/system-messages.ts` | ✅ Đạt |
| **B10: Runtime hệ thống** | `system-runtime.ts` + `system.ts` chạy quy tắc nội tại, không xung đột khi kiểm tra tuần tự | `src/engine/system-runtime.ts`, `test/system.test.ts` | ✅ Đạt |
| **B11: Thời tiết** | **XÁC NHẬN CÓ CẮM VÀO GAMEPLAY**: `weather.ts` được `time.ts` gọi mỗi bước thời gian, ảnh hưởng lên sản lượng hái thảo và tầm nhìn bản đồ | `src/engine/weather.ts`, `src/engine/time.ts` | ✅ Đạt (đóng khoảng trống từ Campaign 1) |

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Của Người Chơi Theo Persona

### 🗣️ p15 (Skeptic):
> *"Tôi chơi thử 4 hệ thống: Vô Hạn Thôn Phệ (hút máu), Vạn Giới Giao Dịch (mở chợ ảo), Đan Đạo Độc Tôn (luyện đan x2), và Vô Tự Thiên Thư (nhận gợi ý từ sách trời). Cả 4 đều có tác động thật lên lối chơi. Nhưng 'Thần Ma Điểm Hóa' tôi thấy hơi khó hiểu — có vẻ chỉ đổi màu hiển thị."*
* **Đề xuất tính năng:** Cần làm rõ cơ chế `Thần Ma Điểm Hóa` — nếu chỉ là hiệu ứng hiển thị thì nên gộp vào hệ thống khác; nếu là cơ chế thật thì cần tutorial ngắn khi chọn.

### 🗣️ p16 (Wanderer):
> *"Tôi phát hiện ra mùa mưa (ngày 15-25) làm sản lượng Ngưng Khí Thảo giảm 30% nhưng lại tăng tỷ lệ xuất hiện Linh Chi. Chi tiết nhỏ này khiến thế giới cảm giác sống động thật sự. Tôi muốn có bản đồ dự báo thời tiết."*
* **Đề xuất tính năng:** Thêm `Bảng Dự Báo Thời Tiết 7 Ngày` trong Nhật Ký: Cho phép người chơi lập kế hoạch hái thảo/săn bắn theo mùa vụ.

### 🗣️ p03 (System Rebel):
> *"Hệ thống 'Thiên Đạo Thù Cần' liên tục gửi thông báo mỉa mai: 'Ngươi lại lười biếng rồi, phế căn ạ'. Ban đầu thấy khó chịu, sau thấy vui vì nó phản ứng với hành vi của tôi. Nhưng tin nhắn lặp lại khá nhiều câu giống nhau."*
* **Đề xuất tính năng:** Mở rộng kho tin nhắn hệ thống theo ngữ cảnh hành vi (VD: nhắn riêng khi bạn thắng trận khó, khi bạn chết, khi bạn giúp người nghèo) thay vì xoay vòng câu cố định.

### 🗣️ p09 (Roleplayer):
> *"Tôi chọn hệ thống 'Nhân Quả Luân Hồi' — mọi hành động tốt xấu đều được ghi lại và trả quả. Cảm giác nhập vai cực mạnh. Nhưng đôi khi tôi quên mất mình đang bị hệ thống theo dõi, cần nhắc nhở nhẹ nhàng."*
* **Đề xuất tính năng:** Thêm `Sổ Nhân Quả`: Một tab nhỏ hiển thị các hành động thiện/ác gần đây và dự báo quả báo sắp tới (ẩn số liệu chính xác, chỉ hiện xu hướng).

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Làm rõ cơ chế Thần Ma Điểm Hóa:** **CHẤP NHẬN (BT BUỘC - Vé lỗi Design)** — Đây là vấn đề thiết kế thật: hệ thống có tên nhưng không có tác động rõ ràng.
2. **Bảng Dự Báo Thời Tiết 7 Ngày:** **CHẤP NHẬN** — Biến thời tiết từ "chi tiết trang trí" thành "cơ chế chiến lược", tận dụng triệt để `weather.ts`.
3. **Mở rộng kho tin nhắn hệ thống theo ngữ cảnh:** **CHẤP NHẬN (Ưu tiên Cao)** — Tăng cá tính của 10 hệ thống, làm cho lựa chọn đầu game có sức nặng lâu dài.
4. **Sổ Nhân Quả:** **CHP NHẬN** — Tăng chiều sâu cho hệ thống Nhân Quả Luân Hồi, phù hợp nhóm nhập vai.