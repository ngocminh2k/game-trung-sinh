# Đặc Tả Kỹ Thuật: StoryModal (Kỳ Ngộ Cốt Truyện & Lựa Chọn Rẽ Nhánh)
**File ID**: `MODAL-01-STORY`  
**Đường dẫn**: `docs/plans/ui-architecture/modals/01_STORY_MODAL.md`  
**Thành phần mã nguồn tương ứng**: `src/ui/GameScreen.tsx` (`.story-modal`, `.story-backdrop`)  

---

## 1. MỤC ĐÍCH & NGỮ CẢNH XUẤT HIỆN
* **Mục đích**: Chuyển tải những khoảnh khắc bước ngoặt của tiểu thuyết tu tiên: khi nhân vật đối thoại với NPC trọng yếu, bước vào ô Sự Kiện Kỳ Ngộ (`node.kind === 'event'`), kích hoạt cơ duyên hoặc đứng trước ngã ba đường định mệnh.
* **Nguyên tắc thẩm mỹ**: Nền xuyến chỉ truyền thống, chữ đen mực tàu, trích đoạn văn phong kiếm hiệp sâu lắng, không có viền kim loại hay bóng đổ khoa học viễn tưởng.

---

## 2. VỊ TRÍ, KÍCH THƯỚC & BỐ CỤC (LAYOUT & SIZING)

* **Lớp Nền Mờ (Backdrop)**:
  * Phủ kín màn hình (`position: fixed; inset: 0; z-index: 100`).
  * Nền thủy mặc tối mờ: `background: radial-gradient(circle, rgba(7, 14, 11, .45), rgba(7, 14, 11, .85))`.
  * Làm mờ phông nền phía sau: `backdrop-filter: blur(4px)`.
* **Khung Modal Chính**:
  * Căn chính giữa màn hình: `position: fixed; z-index: 101; inset: 8vh 12vw;`.
  * Kích thước co giãn: `min-width: 640px; max-width: 1000px; max-height: 84vh; margin: auto;`.
  * Cấu trúc CSS Grid 3 tầng: `grid-template-rows: auto 1fr auto; gap: 20px;`.
  * Viền & Nền: Nền giấy cổ `var(--bg-parchment)`, viền giấy mờ `var(--border-paper)`, bo góc `12px`, bóng đổ sâu trang nhã.

---

## 3. NỘI DUNG CHI TIẾT CÁC THÀNH PHẦN (COMPONENT TREE)

### 3.1. Tầng Đầu (Modal Header)
* **Kicker Tiêu Đề**: Dòng chữ nhỏ màu ngọc lục bảo in hoa: `[ CƠ DUYÊN THIÊN MỆNH ]` hoặc `[ KỲ NGỘ NHÂN SĨ ]`.
* **Tên Sự Kiện / Người Đối Thoại**: Chữ hiển thị đậm phong cách thư pháp (vd: *"Cụ Mai Hoa Chờ Dưới Hiên Trà"*).
* **Nút Đóng Vật Lý**: Nút góc trên bên phải `[✕ Đóng Esc]` có viền ngọc mảnh, hiển thị rõ phím tắt gợi ý `<kbd>Esc</kbd>`.

### 3.2. Tầng Giữa (Story Narrative Body)
* **Khung Cuộn Văn Bản (Narrative Content)**:
  * Kiểu chữ Serif sang trọng (`var(--font-display)`), kích thước `18px`, khoảng cách dòng thoáng đãng (`line-height: 1.7`).
  * Văn phong tả cảnh, tả tình, thuật lại lời đối thoại của NPC và biến cố xung quanh.
  * Tự động xuất hiện thanh cuộn mực tàu tinh tế nếu đoạn văn dài.

### 3.3. Tầng Dưới (Choice Actions - 3 Nhánh Số Mệnh)
* **Danh sách lựa chọn (Tối đa 3 lựa chọn rẽ nhánh)**:
  * Trải dạng lưới 3 cột ngang trên màn hình rộng (`grid-template-columns: repeat(3, 1fr)`), hoặc xếp dọc trên màn hình hẹp.
  * Mỗi nút lựa chọn là một thẻ bài thanh nhã (`.story-choice`):
    * **Phím tắt tròn bên trái**: Vòng tròn ngọc bích ghi số `1`, `2`, hoặc `3`.
    * **Tiêu đề nhánh hành động**: Dòng in đậm nổi bật (vd: *"Nhận dải lụa đỏ"*, *"Hỏi rõ nguồn cơn"*, *"Lặng lẽ chắp tay từ chối"*).
    * **Mô tả hệ quả ngắn**: Gợi ý nhẹ nhàng về hướng đi (vd: *"+3 Hảo cảm, bước vào Mercy Route"*).
  * Hiệu ứng hover: Nhấc bổng nhẹ `translateY(-2px)`, viền sáng vàng hoàng kim `var(--gold-400)`, nền ửng ngọc bích nhạt.

---

## 4. CƠ CHẾ ĐÓNG / MỞ & TƯƠNG TÁC BÀN PHÍM

* **Điều kiện Mở ra (Trigger)**:
  1. Người chơi di chuyển bước vào ô ma trận có `node.kind === 'event'`.
  2. Người chơi bấm trò chuyện với NPC trong tab `Nhân sĩ` hoặc trên bản đồ.
  3. Khi bắt đầu chương truyện mới có đoạn phân cảnh khai mở.
* **Điều kiện Đóng lại (Dismiss)**:
  1. **Chọn một nhánh**: Bấm chuột vào nút lựa chọn hoặc ấn phím số `1`, `2`, `3` trên bàn phím -> Lập tức ghi nhận hành động, đóng StoryModal và phát sinh sự kiện tương ứng.
  2. **Bấm nút Đóng / Click Backdrop**: Bấm nút `[✕]` hoặc click vào vùng tối mờ bên ngoài modal.
  3. **Phím tắt Esc**: Nhấn phím `Esc` lập tức đóng modal, đưa nhân vật về trạng thái rảnh rỗi trên bản đồ.
* **Hiệu ứng chuyển cảnh**:
  * Xuất hiện: Fade-in 200ms kết hợp phóng to nhẹ từ `scale(0.96)` lên `scale(1)`.
  * Tắt đi: Fade-out 150ms êm dịu, không giật lag.
