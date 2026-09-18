# Campaign 2 — Vòng 03: Thẩm Định 6 Đại Kết Cục & Đồ Thị Truyện Không Nhánh Cụt (A6, A7, A8)

**Ngày:** 2026-09-17 | **Chiến dịch:** Campaign 2  
**Tiêu điểm Checklist:** [A6] 6 Đại kết cục | [A7] Độ phủ Hồi III–V | [A8] Đồ thị truyện không nhánh cụt  
**Nhóm Persona tham gia khảo sát:**
- `p08` (Diamond - Cultivation Collector): Muốn phá đảo mọi ngả rẽ để lấy thành tựu.
- `p11` (Club - Lore Reader): Đọc kỹ phần khúc ca kết thúc.
- `p16` (Heart - Wanderer): Đi lạc khỏi chính tuyến, xem có kết cục dự phòng không.
- `p20` (Churn Risk - Tired): Muốn cảm giác mạnh mẽ khi đạt kết cục.

---

## 1. Kết Quả Kiểm Thử Thực Nghiệm (Code & Scene Verification)

| Hạng mục Checklist | Kết Quả Đo Lường | Vị Trí Mã Nguồn Xác Minh | Phán Định |
|---|---|---|:---:|
| **A6: 6 Đại kết cục** | 6/6 kết cục khai báo đầy đủ điều kiện và khúc ca | `src/content/endings-data.ts` | ✅ Đạt |
| **A7: Độ phủ Hồi III–V** | Đo thực nghiệm: 17 scene tổng cộng; Hồi I (1) → Hồi II (4) → Hồi III (2) → Hồi IV (1) → Hồi V (1) → Hồi VI (2) → Hồi VII (4 nhánh tổ tiên) → Hồi VIII (1 phi thăng) + 2 scene hệ thống | Truy vấn trực tiếp `STORY_SCENES` trong `src/content/story.ts` | ✅ Đạt |
| **A8: Đồ thị truyện không nhánh cụt** | **0 liên kết gãy**: Mọi trường `nextSceneId` đều trỏ tới một scene tồn tại trong tập hợp (quét tự động 17 scene × toàn bộ lựa chọn) | Script kiểm tra tĩnh toàn bộ `STORY_SCENES` | ✅ Đạt |

### Bảng phân bố scene theo hồi (dữ liệu thực đo)

| Hồi | Số scene | Tên scene |
|:---:|:---:|---|
| 0 | 2 | `scene_transmigration`, `scene_system_selection` |
| 1 | 1 | `letter_at_dawn` |
| 2 | 4 | `market_rumor`, `village_vow`, `market_bargain`, `memory_trail` |
| 3 | 1 | `cave_witness` |
| 4 | 1 | `sect_trial` |
| 5 | 1 | `mirror_choice` |
| 6 | 3 | `last_page`, `scene_system_doubt`, + nhánh hậu kết |
| 7 | 4 | `scene_branch_mercy`, `scene_branch_path`, `scene_branch_blade`, `scene_branch_rootless` |
| 8 | 1 | `scene_ascension` |

---

## 2. Nhật Ký Trải Nghiệm & Góp Ý Ca Người Chơi Theo Persona

### 🗣️ p08 (Completionist):
> *"Tôi mất 4 ván chơi để mở đủ 6 kết cục. Nhánh Tông Môn Chưởng Giáo và Huyết Ma Độc Bá khác biệt hoàn toàn về màu sắc cảm xúc. Nhưng game không có màn hình 'Bảng Thành Tích Kết Cục' để tôi thấy mình đã mở khóa được mấy trên tổng số 6."*
* **Đề xuất tính năng:** Thêm `Bia Đá Kết Cục (Ending Monolith)` — hiển thị 6 ô, ô chưa mở khóa hiện hình bóng đen với gợi ý mờ, ô đã mở khóa hiện khúc ca tương ứng.

### ️ p11 (Lore Reader):
> *"Bốn nhánh Bóng Trắng ở Hồi VII (mercy/path/blade/rootless) như bốn lời tự vấn của chính đạo tâm. Tôi đọc mà nổi da gà. Tiếc là các nhánh này hơi ngắn, chỉ 1-2 đoạn text."*
* **Đề xuất tính năng:** Mở rộng mỗi nhánh Bóng Trắng thành một thử thách nhỏ 2–3 bước (không chỉ là hội thoại).

### 🗣️ p16 (Wanderer - bỏ chính tuyến):
> *"Tôi cố tình không đi theo mạch thư tín, chỉ đi hái thảo và săn thú. Sau 30 ngày tôi vẫn sống bình thường, nhưng cuối cùng game ép tôi vào một kết cục. Tôi mong có một 'kết cục ẩn' dành riêng cho kẻ sống ngoài mọi dòng chảy cốt truyện."*
* **Đề xuất tính năng:** Thêm kết cục thứ 7: `Ẩn Sĩ Vô Danh (Nameless Hermit)` — đạt được khi sống qua ngày 40 mà không kích hoạt bất kỳ cờ cốt truyện nào.

### 🗣️ p20 (Tired Player - muốn cảm giác mạnh):
> *"Khi tôi làm được nhánh Huyết Ma Độc Bá, màn hình kết thúc hiện lên những dòng chữ đỏ rực và tiếng sấm vang. Rất đã! Nhưng tôi muốn có phần thưởng mang sang kiếp sau mạnh mẽ hơn chút nữa cho công sức theo đường tà đạo."*
* **Đề xuất tính năng:** Tăng nhẹ phần thưởng Điểm Luân Hồi cho nhánh Ma Đạo (khó hơn vì bị truy sát), hoặc mở khóa độc quyền `Ma Đan` ở kiếp sau.

---

## 3. Triage & Đánh Giá Đề Xuất (Feature Triage)

1. **Bia Đá Kết Cục (Ending Monolith):** **CHẤP NHẬN (u tiên Cao)** — Chuẩn mực cho dòng game có nhiều kết thúc; tăng động lực chơi lại cực mạnh.
2. **Mở rộng nhánh Bóng Trắng thành thử thách:** **CHP NHẬN** — Tận dụng hạ tầng `beats` và `danger` sẵn có.
3. **Kết cc thứ 7 — Ẩn Sĩ Vô Danh:** **CÂN NHẮC (Thiết kế thú vị)** — Cần xác định rõ tiêu chí "không kích hoạt cờ cốt truyện" để tránh kích hoạt nhầm.
4. **Tăng thưởng nhánh Ma Đạo:** **CHẤP NHẬN CÓ ĐIỀU KIỆN** — Chỉ tăng điểm Luân Hồi (không tăng sức mạnh trực tiếp) để giữ cân bằng New Game Plus.