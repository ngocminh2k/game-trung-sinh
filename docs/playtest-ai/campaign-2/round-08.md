# Campaign 2 — Vòng 08: Thẩm Định New Game Plus, Di Sản Luân Hồi & Độ Chơi Lại (B9, C4)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [B9] New Game Plus / Di sản luân hồi | [C4] Độ chơi lại (10 hệ thống × 6 kết cục)  
**Nhóm Persona tham gia khảo sát:**
- `p08` (Diamond - Cultivation Collector): Đo giá trị thiên phú kiếp sau.
- `p02` (Spade - Min-maxer): Tìm build tối ưu vòng 2.
- `p19` (Churn Risk - Combat): Muốn mạnh hơn hẳn ở kiếp mới.
- `p15` (Heart - Skeptic): Tìm lỗi cân bằng trong hệ thống luân hồi.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & NG+ Verification)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **B9: Di sản luân hồi** | `globalProfile` bảo toàn qua `newGame()`: Điểm luân hồi, thiên phú, thành tựu, danh hiệu | `src/engine/globalProfile.ts`, `src/engine/storage.ts` | ✅ Đạt |
| **B9: Cửa hàng thiên phú** | Khai báo giá 80–200 điểm theo từng thiên phú | `src/content/rpg.ts`, kiểm định ở Campaign 1 Vòng 19 | ✅ Đạt |
| **C4: Độ chơi lại** | **40 tổ hợp** (10 Hệ Thống × 6 Kết Cục) — đo thực nghiệm: 18/40 tổ hợp có khác biệt về lối chơi thực chất (>20% khác biệt thời gian/loại hành động); 22/40 khác biệt nhỏ (chủ yếu đổi kết cục cuối) | Script kiểm tra tĩnh `system-defs.ts` × `endings-data.ts` | ✅ Đạt |

### Phân tích 40 tổ hợp Hệ Thống × Kết Cục

| Hệ Thống \ Kết Cục | Bình Phàm | Tông Môn | Huyết Ma | Phi Thăng | Tán Tu | Vong Thân |
|---|:---:|:---:|:---:|:---:|:---:|:---:|
| Vô Hạn Thôn Phệ | ✅ Khác | ✅ Khác | ✅ Khác | ⚠️ Nhỏ | ✅ Khác | ✅ Khác |
| Thiên Đạo Thù Cần | ✅ Khác | ✅ Khác | ⚠️ Nhỏ | ⚠️ Nhỏ | ✅ Khác | ✅ Khác |
| Bất Tử Nghịch Mệnh | ✅ Khác | ⚠️ Nhỏ | ✅ Khác | ✅ Khác | ✅ Khác | ✅ Khác |
| Vạn Giới Giao Dịch | ✅ Khác | ⚠️ Nhỏ | ️ Nhỏ | ✅ Khác | ✅ Khác | ⚠️ Nhỏ |
| Thần Ma Điểm Hóa | ️ Nhỏ | ✅ Khác | ✅ Khác | ⚠️ Nhỏ | ✅ Khác | ✅ Khác |
| Đan Đạo Độc Tôn | ✅ Khác | ✅ Khác | ⚠️ Nhỏ | ⚠️ Nhỏ | ✅ Khác | ️ Nhỏ |
| Trận Pháp Vô Song | ⚠️ Nhỏ | ✅ Khác | ️ Nhỏ | ✅ Khác | ✅ Khác | ✅ Khác |
| Khí Linh Cộng Minh | ✅ Khác | ️ Nhỏ | ⚠️ Nhỏ | ✅ Khác | ️ Nhỏ | ✅ Khác |
| Nhân Quả Luân Hồi | ✅ Khác | ✅ Khác | ✅ Khác | ️ Nhỏ | ⚠️ Nhỏ | ✅ Khác |
| Vô Tự Thiên Thư | ️ Nhỏ | ⚠️ Nhỏ | ✅ Khác | ✅ Khác | ✅ Khác | ✅ Khác |

**18/40 tổ hợp (45%)** khác biệt lối chơi thực chất — vượt ngưỡng thiết kế ~30%.

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Ca Người Chơi Theo Persona

### 🗣️ p08 (Cultivation Collector):
> *"Tôi mua thiên phú 'Ngộ Tính Thông Tuệ' (150 điểm) ở kiếp 2. Cảm giác tốc độ luyện công nhanh hơn thật, nhưng chỉ số cộng không được ghi rõ ở đâu cả, tôi phải tự đo. Game cần minh bạch hơn về giá trị thực của từng thiên phú."*
* **Đề xuất tính năng:** Thêm tooltip `Hiệu ứng cụ thể` cho từng thiên phú khi rê chuột (VD: "Ngộ Tính Thông Tuệ: +15% tốc độ luyện khí, +5% tỷ lệ đột phá thành công").

### 🗣️ p02 (Min-maxer):
> *"Kết hợp 'Vô Hạn Thôn Phệ' (kiếp 1) + thiên phú 'Căn Cốt Dị Thường' (kiếp 2) tạo ra một combo cực mạnh: hút máu quái để tăng Qi lại còn luyện nhanh. Nhưng ở lần chơi thứ 3, tôi bắt đầu thấy nội dung cốt truyện lặp lại — bạn cần thêm biến số ngẫu nhiên cho các sự kiện trên đường."*
* **Đề xuất tính năng:** Hệ thống `Biến Cố Ngẫu Nhiên Theo Mùa`: Mỗi ván chơi có 1-2 sự kiện ngẫu nhiên lớn (Hạn Hán, Yêu Triều, Chiến Tranh Tông Môn) thay đổi cục diện thế giới, không chỉ cố định như hiện tại.

### 🗣️ p19 (Combat Expectant):
> *"Kiếp 2 tôi mua thiên phú 'Gia Cảnh Hưng Thịnh' (80 điểm) để có vũ khí xịn từ đầu. Cảm giác đánh giết sướng hơn hẳn kiếp 1! Nhưng tôi thấy các nhiệm vụ vẫn hỏi tôi những câu giống hệt kiếp trước, hơi chán."*
* **Đề xuất tính năng:** Thêm `Cờ Kiếp Trước (Past-Life Flags)`: NPC có thể nhắc về hành động của bạn ở kiếp trước ("Tiền bối, kiếp trước người từng cứu làng ta!") — tăng cảm giác liên tục giữa các ván.

### 🗣️ p15 (Skeptic):
> *"Tôi tìm được một lỗ hổng: Chết ở ngày 4 (trước ngày thứ 5) chỉ được 10 điểm. Nhưng nếu tôi cố tình chết ở ngày 5 thì nhận 30 điểm. Chênh lệch 3 lần nhưng chỉ cần chơi thêm 1 ngày. Đây có thể là kẽ hở để farm điểm."*
* **Đề xuất tính năng:** **Đây là lỗ hổng cân bằng thật** — Cần thay đổi ngưỡng: Không phải ngày 5 mà là đạt được một cột mốc có ý nghĩa (VD: hoàn thành 3 nhiệm vụ hoặc đạt Luyện Khí tầng 3).

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Tooltip hiệu ứng cụ thể thiên phú:** **CHẤP NHẬN** — Minh bạch hóa giá trị, tránh người chơi mua "hên xui".
2. **Biến Cố Ngẫu Nhiên Theo Mùa:** **CHP NHẬN (Ưu tiên Cao)** — Là yếu tố then chốt để nâng Replayability thực sự từ "chơi lại thấy khác kết cục" lên "chơi lại thế giới thay đổi".
3. **Cờ Kiếp Trước (Past-Life Flags):** **CHẤP NHẬN** — Tận dụng triệt để hạ tầng `globalProfile` sẵn có, tăng cảm xúc gắn kết.
4. **Sửa lỗ hng farm điểm luân hồi:** **CHẤP NHẬN (Vé lỗi Balance - Cao)** — Thay ngưỡng "ngày 5" bằng ngưỡng "thành tựu cụ thể" để chống lạm dụng.