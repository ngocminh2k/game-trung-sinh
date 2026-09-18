# Campaign 2 — Vòng 01: Thẩm Định Cốt Truyện Khởi Nguyên & Quét Mã Chết (A1–A3, B13)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2 (Playtest 4 Tầng Toàn Diện)  
**Tiêu điểm Checklist:** [A1] 6 chương chính tuyến | [A2] Nhánh theo hành vi | [A3] Scene chain delta | [B13] Quét tính năng chết  
**Nhóm Persona tham gia khảo sát:**
- `p01` (Spade/Killer - Speedrunner): Kiểm tra nhịp chuyển cảnh, khả năng tua nhanh.
- `p05` (Diamond/Achiever - Completionist): Quét từng nhánh lựa chọn, cờ trạng thái `effects`.
- `p11` (Club/Socializer - Lore Reader): Đọc sâu sắc từng câu chữ mở màn, kiểm tra tính văn học.
- `p17` (Churn Risk - Casual): Thẩm định cảm giác 3 phút đầu tiên mở game.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & Scene Verification)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **A1: 6 Chương chính tuyến** | 6/6 chương khai báo chuẩn xác kèm tên VI/EN và tagline | `src/content/chapters.ts:3-48` | ✅ Đạt |
| **A2: Nhánh theo hành vi** | 17 scene đều liên kết qua cờ hành vi (`story_mercy`, `story_truth`, `story_wealth`) | `src/content/story.ts:5-50` | ✅ Đạt |
| **A3: Scene chain delta** | Lựa chọn đều có `playerDelta` hợp lệ (HP, Qi, Gold, Progress) | `src/content/story.ts:22-43` | ✅ Đạt |
| **B13: Quét tính năng chết** | 99/104 tệp nguồn được import đầy đủ; 5 tệp unimported đều là barrel index hoặc file test nội bộ (`src/core/smoke.test.ts`, `useGameSlice.ts`) | Kiểm tra toàn cục 104 tệp trong `src/` | ✅ Đạt |

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Của Người Chơi Theo Persona

### 🗣️ p01 (Speedrunner):
> *"Đoạn mở đầu lá thư không người gửi đọc rất cuốn, nhưng khi tôi chơi lại ván thứ 3 để test đường chạy tối ưu thì phải bấm chọn từng dòng khá lâu. Game cần có cơ chế nhớ các lựa chọn đã từng đi qua hoặc một nút lướt nhanh lời dẫn thoại."*
* **Đề xuất tính năng:** Thêm chế độ `Fast Text Speed` hoặc `Tua nhanh hội thoại cũ (Skip read text)` cho người chơi đã hoàn thành ít nhất 1 kiếp sống.

### 🗣️ p05 (Completionist):
> *"Tôi nhận thấy lựa chọn 'Giấu trâm, giải mã lá thư' ở scene 1 dẫn sang 'market_rumor' mở khóa nhánh `decode_letter` ở Hồi II cực kỳ logic. Cảm giác quyết định ban đầu thật sự có sức nặng. Tuy nhiên, bảng nhật ký chưa hiển thị danh sách các manh mối đã thu thập được thành một bộ sưu tập."*
* **Đề xuất tính năng:** Bổ sung tab `Bộ Sưu Tập Manh Mối (Clue Codex)` trong giao diện Nhật Ký để người chơi hệ Achiever có thể ngắm nhìn tiến trình giải mã bí mật làng Thanh Mộc.

### 🗣️ p11 (Lore Reader):
> *"Câu văn 'Trước cổng làng, một phong thư mang nét chữ của chính ngươi ở kiếp trước: Đừng tin kẻ gọi ngươi là đồ phế' mang lại cảm giác rùng mình và tò mò cao độ. Giọng văn trầm buồn, triết lý. Mối quan hệ giữa cụ Mai Hoa và chiếc trâm ngọc gợi mở quá khứ đẫm máu mà bi thương."*
* **Đề xuất tính năng:** Thêm các đoạn độc thoại nội tâm (Inner Voice) phản ánh linh căn phế đang thì thầm mỗi khi tiếp xúc với cổ vật.

### 🗣️ p17 (Casual / Churn Risk):
> *"Tôi mở game lên đọc 2 câu đầu là hiểu ngay mình là kẻ tái sinh bị coi thường. Lựa chọn trả trâm cho cụ già rất dễ hiểu, không bắt tôi phải học cả đống từ ngữ tu tiên phức tạp. Nhưng tôi muốn biết ngay chọn thế này thì được gì rõ hơn chút."*
* **Đề xuất tính năng:** Tooltip giải thích nhẹ hệ quả (`story_mercy` = Tăng hảo cảm dân làng) khi rê chuột vào lựa chọn (có thể bật/tắt trong cài đặt).

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Nút tua nhanh hội thoại cũ (Skip read text):** **CHẤP NHẬN (Ưu tiên Cao)** — Phù hợp triết lý tôn trọng thời gian game thủ, không phá vỡ tính logic.
2. **Tab Bộ sưu tập Manh mối (Clue Codex):** **CÂN NHẮC (Giai đoạn sau)** — Có thể tích hợp vào màn hình Codex hiện có (`CodexPanel.tsx`).
3. **Đoạn độc thoại nội tâm linh căn phế:** **CHẤP NHẬN** — Làm phong phú thêm chiều sâu văn học của `src/content/story.ts`.
4. **Tooltip dự đoán hệ quả:** **TỪ CHỐI BẬT MẶC ĐỊNH** — Làm mất đi tính bất ngờ của lựa chọn nhập vai; chỉ cho phép mở trong chế độ Hỗ trợ người mới (Story/Easy mode).
