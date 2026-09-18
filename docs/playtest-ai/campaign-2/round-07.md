# Campaign 2 — Vòng 07: Thẩm Định Nhiệm Vụ, Cờ Trạng Thái & Hệ Thống Thành Tựu (B7, B8)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [B7] Nhiệm vụ chính + phụ | [B8] Hệ thống thành tựu  
**Nhóm Persona tham gia khảo sát:**
- `p05` (Diamond - Completionist): Quét toàn bộ nhiệm vụ phụ, kiểm tra cờ done.
- `p07` (Diamond - Quest Junkie): Đi theo mọi marker, bỏ qua lore.
- `p18` (Churn Risk - Distracted): Kiểm tra khả năng quay lại nhiệm vụ đang làm dở.
- `p20` (Churn Risk - Tired): Muốn thấy phần thưởng rõ ràng ngay.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & Quest Verification)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **B7: Nhiệm vụ chính + phụ** | 654 dòng định nghĩa nhiệm vụ, phân tầng Chính tuyến (Main) / Phụ (Side) / Tông môn (Sect) / Ẩn (Hidden) | `src/content/quests.ts` | ✅ Đạt |
| **B7: Cờ done** | Mọi nhiệm vụ dùng quy ước `quest_<fullId>_done` với **gạch dưới đơn** (đã sửa lỗi drift trước đây) | `src/content/flag-keys.ts`, `test/system-quests.test.ts` | ✅ Đạt |
| **B8: Thành tựu** | Danh mục thành tựu khai báo đầy đủ, có runtime cấp phát | `src/content/achievements-data.ts`, `src/engine/achievements.ts` | ✅ Đạt |
| **B7: HUD nhiệm vụ động** | `deriveObjective` ưu tiên hiển thị `quest.steps[currentStepIndex].descVi`, đã nghiệm thu ở Campaign 1 | `src/ui/objective.ts` | ✅ Đạt |

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Của Người Chơi Theo Persona

### 🗣️ p05 (Completionist):
> *"Tôi hoàn thành được 14/22 nhiệm vụ trong 1 kiếp. Nhưng khi nhìn vào Nhật Ký, tôi chỉ thấy danh sách nhiệm vụ đã xong, không phân biệt được nhiệm vụ nào là Chính tuyến, nhiệm vụ nào là phụ. Muốn phân loại rõ ràng."*
* **Đề xuất tính năng:** Thêm tab lọc trong Nhật Ký: `[Chính Tuyến] [Phụ] [Tông Môn] [n]` kèm biểu tượng màu sắc tương ứng (Đỏ/Vàng/Xanh/Tím).

### ️ p07 (Quest Junkie):
> *"Tôi chỉ đi theo dấu chấm than vàng trên bản đồ và bấm mọi nút. Nhưng có lúc một dấu chấm than dẫn tôi đến chỗ NPC không có gì để nói (nhiệm vụ đã hoàn thành nhưng chưa gỡ marker). Hơi mất thời gian."*
* **Đề xuất tính năng:** **Đây là bug thật** — cần đồng bộ hóa gỡ marker khi cờ `quest_*_done` được ghi. Thêm test tự động kiểm tra không còn marker treo trên NPC/địa điểm khi nhiệm vụ đã xong.

### ️ p18 (Distracted Parent):
> *"Tôi làm dở nhiệm vụ 'Thu Thập 5 Bó Ngưng Khí Thảo' rồi phải đi. Ba tiếng sau quay lại, tôi quên mất mình đang làm gì. Rất may HUD có thanh mục tiêu hiển thị 'Còn cần 2 Bó Ngưng Khí Thảo'. Tính năng nhắc nhở này tuyệt vời."*
* **Đề xuất tính năng:** Thêm `Nhật Ký Tóm Tắt Khi Quay Lại (Session Recap)`: Khi mở game sau hơn 1 giờ, hiện một thẻ tóm tắt 3 dòng: "Bạn đang ở đâu / đang làm gì / cần làm gì tiếp theo".

### 🗣️ p20 (Tired Player):
> *"Khi tôi hoàn thành xong nhiệm vụ giúp cụ Mai Hoa, tiếng leng keng vang lên, hiện chữ '+50 Kinh Nghiệm, +10 Bạc'. Nhưng thông báo biến mất quá nhanh, tôi không kịp đọc. Muốn phần thưởng được tổng kết gọn gàng."*
* **Đề xuất tính năng:** Thêm bảng `Tổng Kết Phần Thưởng Nhiệm Vụ` dạng popup nhỏ hiển thị 3 giây với danh sách phần thưởng rõ ràng + hiệu ứng icon tương ứng.

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Tab lọc nhiệm vụ theo loại:** **CHẤP NHẬN (Ưu tiên Cao)** — Cải thiện rõ rệt cho nhóm Achiever.
2. **Bug marker treo trên NPC/địa điểm:** **CHẤP NHẬN (BẮT BUỘC - Vé lỗi Critical)** — Ảnh hưởng trực tiếp đến trải nghiệm đi theo marker; cần root-cause trong `quests.ts`.
3. **Nhật Ký Tóm Tắt Khi Quay Lại:** **CHẤP NHẬN** — Giải quyết triệt để vấn đề Churn Risk do mất ngữ cảnh.
4. **Bảng Tổng Kết Phần Thưởng Nhiệm Vụ:** **CHẤP NHẬN** — Cải thiện Game Feel, đặc biệt cho chế độ Casual.