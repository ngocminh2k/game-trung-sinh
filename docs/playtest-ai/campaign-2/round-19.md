# Campaign 2 — Vòng 19: Cơ Chế Chống Nản Churn Risk & Giữ Chân Người Chơi (C5–C7)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [C5] Trải nghiệm người mới & Onboarding | [C6] Nhịp độ chơi (Pacing) | [C7] Giảm ma sát bỏ game (Anti-Churn)  
**Nhóm Persona tham gia khảo sát:** TOÀN BỘ 6 personas thuộc nhóm Churn Risk:
- `p17` (Bỏ cuộc sau 3 phút), `p18` (Bận rộn ngắt quãng), `p19` (Tìm kiếm đánh đấm), `p20` (Mệt mỏi sau giờ làm), `p10` (Casual), `p14` (Thử lệnh tự do).

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Anti-Churn Audit)

| Điểm Nản (Churn Trigger) | Đo Lường Thực Tế | Biện Pháp Giảm Ma Sát | Phán Định |
|---|---|---|---|
| **T-1: Kẹt ở phút thứ 6** (không biết bấm nút Đột Phá) | Ragequit point nguy hiểm nhất theo p17 | Nút Đột Phá phát sáng pulsing khi đủ tu vi (đề xuất Vòng 11) | ⚠️ Cần làm gấp |
| **T-2: Quên ngữ cảnh sau khi nghỉ** | p18 nghỉ 3 tiếng và quên nhiệm vụ | Thanh mục tiêu HUD động `deriveObjective` đã giải quyết phần lớn; cần thêm Thẻ Tóm Tắt Session | ⚠️ Cải thiện |
| **T-3: Boredom đầu game** (chưa có đánh đấm) | p19 muốn đấu nhau ngay phút thứ 10 | Cốt truyện cho trận đấu Yêu Lang ở ngày thứ 3 (scene 6) | ✅ Đã hợp lý |
| **T-4: Quá tải thông tin** (mệt mỏi sau giờ làm) | p20 không muốn đọc 20 dòng text mô tả | Có chế độ "Tóm Tắt Ngắn" (Short Mode) cho phần mô tả sự kiện | ️ Cần bổ sung |
| **T-5: Vắng mặt bị phạt** (FOMO) | p18 lo mất quà đăng nhập | Cơ chế cộng dồn nhận bù (đã thiết kế ở Vòng 18) | ✅ Đã xử lý |

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Của Người Chơi Theo Persona

### 🗣️ p17 (Ragequitter):
> *"Tôi để ý: Người chơi mới thường không biết mình phải làm gì tiếp theo nếu không có mũi tên chỉ dẫn. Tôi đề xuất: Cho phép người chơi nhấn giữ nút '?' trong 1 giây để hệ thống nói: 'Việc tiếp theo của ngươi là: Bế Quan đột phá Luyện Khí Tầng 1. Hãy nhấn nút Vận Khí màu vàng.'"*
* **Đề xuất tính năng:** Bổ sung `Trợ Lý Hệ Thống (Contextual Hint Assistant)`: Nút trợ giúp theo ngữ cảnh, luôn biết chính xác bước tiếp theo cần làm.

### 🗣️ p18 (Distracted Parent):
> *"Tôi muốn một nút 'Hibernate' (Ngủ đông). Nếu tôi biết mình sẽ bận rộn một tuần, tôi có thể bấm vào đó và game sẽ tạm dừng mọi đồng hồ đếm ngược in-game (không bắt tôi bị mất mùa thảo dược)."*
* **Đề xuất tính năng:** **Đề xuất độc đáo (Retention Feature)** — Cơ chế `Ngủ Đông (Hibernate)`: Dừng đồng hồ thế giới tối đa 7 ngày thực, giữ nguyên trạng thái mùa vụ.

### 🗣️ p19 (Combat Expectant):
> *"Lần đầu vào, tôi mất 16 phút mới gặp trận đánh đầu tiên. Với một game có yếu tố tu tiên võ hiệp, tôi muốn có một trận 'đấu tập' với đệ tử hàng xóm ngay trong 5 phút đầu để cảm nhận Game Feel."*
* **Đề xuất tính năng:** Thêm `Trận Đấu Tập Mở Màn (Tutorial Sparring)`: Sau khi nhận túi càn khôn, gặp Tiểu Thảo và thực hiện 1 trận đấu tập dạy cơ chế chiến đấu ngay tại Thôn Trang.

### 🗣️ p20 (Tired Worker):
> *"Sau 9 tiếng đi làm về, tôi không muốn đọc một đoạn văn 200 chữ. Tôi chỉ muốn biết 'Cần làm gì' và 'Làm thế nào'. Cần có nút chuyển đổi giữa 'Văn Xuôi Đầy Đủ' và 'Tóm Tắt Ngắn'."*
* **Đề xuất tính năng:** Công tắc `Chế Độ Tóm Tắt (Concise Mode)`: Rút gọn mô tả xuống 1–2 câu cốt lõi (hành động + kết quả), ẩn phần văn học tô điểm.

### 🗣️ p10 (Casual):
> *"Tôi chơi trên điện thoại, thao tác ngón tay cái. Vài nút nhỏ ở góc trên bên phải rất khó bấm với một tay."*
* **Đề xuất tính năng:** Tối ưu hóa `Vùng Ngón Cái (Thumb Zone)`: Đưa các nút hành động chính xuống nửa dưới màn hình trong chế độ Mobile.

### 🗣️ p14 (Free Command Tester):
> *"Tôi cảm thấy rất kết nối với game vì hệ thống lệnh tự do thực sự hiểu tôi. Nếu tôi nhập 'đi ngủ', nhân vật đi ngủ và thời gian trôi qua thật. Đó là trải nghiệm người mới thỏa mãn hơn bất kỳ tutorial nào."*
* **Ghi nhận:** Dòng lệnh tự do chính là đặc điểm nhận diện độc nhất (Unique Selling Point) của "Phế Căn Ký".

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Trợ Lý Hệ Thống (Contextual Hint Assistant):** **CHẤP NHẬN (u tiên Cao nhất)** — Giải quyết triệt để điểm churn T-1, chi phí thấp.
2. **Cơ chế Ngủ Đông (Hibernate):** **CHẤP NHẬN (Độc đáo & Thân thiện)** — Giải pháp đỉnh cao cho người chơi bận rộn, tạo lợi thế cạnh tranh trên thị trường.
3. **Chế Độ Tóm Tắt (Concise Mode):** **CHẤP NHẬN** — Mở rộng tệp người chơi tới nhóm mệt mỏi không muốn đọc nhiều.
4. **Trận Đấu Tập Mở Màn:** **CHẤP NHẬN** — Đáp ứng nhóm Killer/Aggressive cần sớm gặp hành động.
5. **Vùng Ngón Cái (Thumb Zone) Mobile:** **CHẤP NHẬN (Ưu tiên Cao)** — Cần thiết nếu phát hành đa nền tảng.